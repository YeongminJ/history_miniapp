import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { getDb } from "../db/client";
import { notifications, users } from "../db/schema";
import type { Env } from "../env";
import {
  dayDiff,
  kstDateFromEpoch,
  nowKstDate,
  nowKstMinute,
} from "../lib/time";
import { getTossClient } from "../toss/factory";

import type { NotiType } from "../toss/client";

/**
 * 매 분 실행되는 cron 본체.
 *
 * 1. 현재 KST 분(0~1439) = `reminder_minute`인 사용자 후보 조회
 * 2. 후보 사용자 상태로 발송 type 결정:
 *    - 오늘 이미 플레이 → skip (보낼 필요 없음)
 *    - 활성 스트릭(어제·오늘 플레이 기록) AND streak_warn_enabled → 'streak_warn'
 *    - daily_enabled → 'daily'
 *    - 그 외 → skip
 * 3. 같은 (userKey, date, type) 이미 sent면 제외
 * 4. 토스 sendMessage 호출 + notifications 기록
 */
export async function runTick(
  env: Env,
  event: { scheduledTime: number },
): Promise<void> {
  const fired = new Date(event.scheduledTime);
  const kstMinute = nowKstMinute(fired);
  const kstDate = nowKstDate(fired);
  const db = getDb(env.DB);

  // 1) 분 일치 + 알림 활성 + tossUserKey 보유한 사용자만
  //    (tossUserKey 없으면 토스 라우팅 불가 → 발송해도 도달 안 함)
  const candidates = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.reminderMinute, kstMinute),
        isNotNull(users.reminderMinute),
        isNotNull(users.tossUserKey),
      ),
    )
    .all();

  if (candidates.length === 0) {
    return;
  }

  // 2) 각 사용자별 발송 타입 결정
  type Plan = {
    userHash: string;       // PK, 발송이력 기록용
    tossUserKey: string;    // 라우팅 키 (sendMessage `x-toss-user-key`)
    type: NotiType;
    streak: number;
  };
  const plans: Plan[] = [];

  for (const u of candidates) {
    if (!u.tossUserKey) continue; // 방어 (where 절에서 이미 필터되지만)
    const lastPlayedDate = u.lastPlayedAt
      ? kstDateFromEpoch(u.lastPlayedAt)
      : null;

    // 오늘 이미 플레이 → 보낼 이유 없음
    if (lastPlayedDate === kstDate) continue;

    // 활성 스트릭: 어제 플레이했고 streak > 0
    const hasActiveStreak =
      u.currentStreak > 0 &&
      lastPlayedDate != null &&
      dayDiff(lastPlayedDate, kstDate) === 1;

    if (hasActiveStreak && u.streakWarnEnabled) {
      plans.push({
        userHash: u.userKey,
        tossUserKey: u.tossUserKey,
        type: "streak_warn",
        streak: u.currentStreak,
      });
    } else if (u.dailyEnabled) {
      plans.push({
        userHash: u.userKey,
        tossUserKey: u.tossUserKey,
        type: "daily",
        streak: u.currentStreak,
      });
    }
  }

  if (plans.length === 0) return;

  // 3) 오늘 같은 (userHash, type)으로 이미 sent된 건 제외
  const hashes = plans.map((p) => p.userHash);
  const alreadySent = await db
    .select({
      userKey: notifications.userKey,
      type: notifications.type,
    })
    .from(notifications)
    .where(
      and(
        inArray(notifications.userKey, hashes),
        eq(notifications.date, kstDate),
        eq(notifications.status, "sent"),
      ),
    )
    .all();
  const sentSet = new Set(
    alreadySent.map((r) => `${r.userKey}::${r.type}`),
  );
  const toSend = plans.filter(
    (p) => !sentSet.has(`${p.userHash}::${p.type}`),
  );

  if (toSend.length === 0) return;

  console.log(
    "[tick]",
    JSON.stringify({
      kstDate,
      kstMinute,
      candidateCount: candidates.length,
      planCount: plans.length,
      sendCount: toSend.length,
    }),
  );

  // 4) 발송
  const toss = getTossClient(env);
  const sentTime = Date.now();

  for (const plan of toSend) {
    let result: { ok: boolean; error?: string };
    try {
      result = await toss.sendMessage({
        userKey: plan.tossUserKey, // 토스 라우팅 키
        type: plan.type,
        context: { streak: plan.streak },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(
        "[tick] sendMessage threw",
        plan.userHash,
        plan.type,
        msg,
      );
      result = { ok: false, error: msg };
    }

    // 4010 "인증 정보를 찾을 수 없어요" — userKey 가 토스에서 stale 됨
    // (사용자가 미니앱 연결 끊었거나 grant 만료). NULL 처리해 다음 진입 시
    // 클라가 silent re-OAuth 해서 재매핑하도록 유도.
    if (!result.ok && result.error?.includes('"errorCode":"4010"')) {
      try {
        await db
          .update(users)
          .set({ tossUserKey: null, updatedAt: sentTime })
          .where(eq(users.userKey, plan.userHash));
        console.warn(
          "[tick] 4010 → cleared toss_user_key for re-OAuth",
          plan.userHash,
        );
      } catch (err) {
        console.error(
          "[tick] failed to clear stale toss_user_key",
          plan.userHash,
          err instanceof Error ? err.message : err,
        );
      }
    }

    try {
      await db
        .insert(notifications)
        .values({
          userKey: plan.userHash, // 이력은 hash로 기록 (DB 일관성)
          date: kstDate,
          type: plan.type,
          status: result.ok ? "sent" : "failed",
          sentAt: sentTime,
          error: result.ok ? null : (result.error ?? "unknown"),
        })
        .onConflictDoNothing();
    } catch (err) {
      console.error(
        "[tick] notifications insert failed",
        plan.userHash,
        plan.type,
        err instanceof Error ? err.message : err,
      );
    }
  }
}
