import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { getDb } from "../db/client";
import { notifications, users } from "../db/schema";
import type { Env } from "../env";
import { exchangeAuthorizationCode } from "../lib/toss-oauth";

/**
 * 클라이언트와 매칭되는 알림 설정 컨트랙트.
 *
 * 토스 푸시는 OAuth로 발급한 `tossUserKey`로만 라우팅 가능 — `getAnonymousKey()`
 * hash로는 안 됨. enable 흐름은 **2단계**:
 *
 * 1) 클라가 `userHash + hour + minute + timezone` 만 보냄
 *    - 서버에 이미 `toss_user_key`가 있으면 그대로 시간만 갱신
 *    - 없으면 401 + `{ ok:false, reason:"auth_required" }` 반환
 * 2) 클라가 401 받으면 `appLogin()` → 인가코드 받아 다시 보냄
 *    - 서버가 토스 OAuth 2단계(generate-token + login-me) → `tossUserKey` 저장
 *
 * DELETE는 데이터 소거 대신 알림 비활성화 (toss_user_key는 보존 → 재활성화 시
 * 추가 OAuth 불필요).
 */

const upsertSchema = z.object({
  userHash: z.string().min(1).max(200),
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59),
  timezone: z.string().default("Asia/Seoul"),
  /** 첫 enable 시 클라가 `appLogin()` 결과를 함께 보냄. */
  authorizationCode: z.string().optional(),
  referrer: z.string().optional(),
});

const route = new Hono<{ Bindings: Env }>();

route.post("/", zValidator("json", upsertSchema), async (c) => {
  const body = c.req.valid("json");
  const db = getDb(c.env.DB);
  const reminderMinute = body.hour * 60 + body.minute;
  const now = Date.now();

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.userKey, body.userHash))
    .get();

  let tossUserKey: string | null = existing?.tossUserKey ?? null;

  // 라우팅 키 없으면 OAuth 교환 시도
  if (!tossUserKey) {
    if (!body.authorizationCode || !body.referrer) {
      return c.json(
        {
          ok: false,
          reason: "auth_required",
          message:
            "토스 로그인이 필요해요. authorizationCode + referrer 함께 다시 요청해주세요.",
        },
        401,
      );
    }
    const exchange = await exchangeAuthorizationCode(
      c.env,
      body.authorizationCode,
      body.referrer,
    );
    if (!exchange.ok) {
      console.warn("[reminders] toss oauth failed", exchange.error);
      return c.json(
        { ok: false, reason: "auth_failed", message: exchange.error },
        502,
      );
    }
    tossUserKey = exchange.tossUserKey;
  }

  await db
    .insert(users)
    .values({
      userKey: body.userHash,
      tossUserKey,
      reminderMinute,
      dailyEnabled: true,
      streakWarnEnabled: true,
      timezone: body.timezone,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: users.userKey,
      set: {
        tossUserKey,
        reminderMinute,
        dailyEnabled: true,
        streakWarnEnabled: true,
        timezone: body.timezone,
        updatedAt: now,
      },
    });

  return c.json({ ok: true });
});

/**
 * DELETE — 알림 비활성화.
 * - 기본: 행 보존, toss_user_key 유지 (재활성화 시 OAuth 생략)
 * - `?full=true`: 행 자체 삭제 (dev 리셋용, OAuth 흐름 재테스트 가능)
 */
route.delete("/:userHash", async (c) => {
  const userHash = c.req.param("userHash");
  if (!userHash) return c.json({ error: "missing_user_hash" }, 400);
  const full = c.req.query("full") === "true";
  const db = getDb(c.env.DB);

  await db.delete(notifications).where(eq(notifications.userKey, userHash));
  if (full) {
    await db.delete(users).where(eq(users.userKey, userHash));
  } else {
    await db
      .update(users)
      .set({
        dailyEnabled: false,
        streakWarnEnabled: false,
        reminderMinute: null,
        updatedAt: Date.now(),
      })
      .where(eq(users.userKey, userHash));
  }
  return c.json({ ok: true, full });
});

export default route;
