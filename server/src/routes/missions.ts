import { zValidator } from "@hono/zod-validator";
import { and, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { getDb } from "../db/client";
import { missionClaims, users } from "../db/schema";
import type { Env } from "../env";
import { nowKstDate } from "../lib/time";

/**
 * 일일 미션 (현재: 던전 스테이지 1회 클리어).
 *
 * 1) 클라가 클리어 → `POST /missions/claim-daily` 로 보상 청구 → +1 누적
 * 2) 같은 사용자 같은 KST 날짜 두 번째 호출은 멱등 (claimed: false 반환)
 * 3) 누적 10원 도달 시 클라가 토스 포인트 redeem 트리거 가능
 *    (실제 토스 API 호출은 콘솔 reward 등록 후 별도 단계)
 */

/**
 * 일일 미션 보상 가중 랜덤 추첨.
 *  1원 40% / 2원 30% / 3원 15% / 4원 10% / 5원 5%
 * 클라가 조작하지 못하도록 서버에서만 결정.
 */
function drawDailyReward(): number {
  const r = Math.random();
  if (r < 0.4) return 1;
  if (r < 0.7) return 2;
  if (r < 0.85) return 3;
  if (r < 0.95) return 4;
  return 5;
}

const route = new Hono<{ Bindings: Env }>();

const hashSchema = z.object({
  hash: z.string().min(1).max(200),
});

route.post("/status", zValidator("json", hashSchema), async (c) => {
  const { hash } = c.req.valid("json");
  const db = getDb(c.env.DB);
  const today = nowKstDate(new Date());
  const [user, claim] = await Promise.all([
    db
      .select({ pendingPoints: users.pendingPoints })
      .from(users)
      .where(eq(users.userKey, hash))
      .get(),
    db
      .select()
      .from(missionClaims)
      .where(
        and(eq(missionClaims.userKey, hash), eq(missionClaims.date, today)),
      )
      .get(),
  ]);
  return c.json({
    pendingPoints: user?.pendingPoints ?? 0,
    claimedToday: !!claim,
    today,
  });
});

route.post("/claim-daily", zValidator("json", hashSchema), async (c) => {
  const { hash } = c.req.valid("json");
  const db = getDb(c.env.DB);
  const today = nowKstDate(new Date());
  const now = Date.now();

  // user row 보장 (알림 미등록 사용자도 미션은 받을 수 있음).
  await db
    .insert(users)
    .values({ userKey: hash, createdAt: now, updatedAt: now })
    .onConflictDoNothing();

  // mission_claims 에 insert. 이미 있으면 conflict → returning 빈 배열.
  const inserted = await db
    .insert(missionClaims)
    .values({ userKey: hash, date: today, claimedAt: now })
    .onConflictDoNothing()
    .returning();
  const claimed = inserted.length > 0;

  let awardedAmount = 0;
  if (claimed) {
    awardedAmount = drawDailyReward();
    await db
      .update(users)
      .set({
        pendingPoints: sql`${users.pendingPoints} + ${awardedAmount}`,
        updatedAt: now,
      })
      .where(eq(users.userKey, hash));
    console.log(
      "[mission/claim-daily]",
      JSON.stringify({ hash, awardedAmount, today }),
    );
  }

  const after = await db
    .select({ pendingPoints: users.pendingPoints })
    .from(users)
    .where(eq(users.userKey, hash))
    .get();

  return c.json({
    ok: true,
    claimed,
    awardedAmount,
    pendingPoints: after?.pendingPoints ?? 0,
    today,
  });
});

const redeemSchema = z.object({
  hash: z.string().min(1).max(200),
  amount: z.number().int().positive(),
  /** 토스가 grantPromotionReward 응답으로 돌려준 reward key. 로깅용. */
  grantKey: z.string().min(1).max(200),
});

/**
 * 토스 포인트 발행 성공 후 누적 포인트 차감.
 * 클라가 SDK 호출 → success → 이 엔드포인트 호출.
 * pendingPoints 가 amount 보다 적으면 차감 없이 거부.
 */
route.post("/redeem", zValidator("json", redeemSchema), async (c) => {
  const { hash, amount, grantKey } = c.req.valid("json");
  const db = getDb(c.env.DB);
  const today = nowKstDate(new Date());
  const now = Date.now();

  const user = await db
    .select()
    .from(users)
    .where(eq(users.userKey, hash))
    .get();
  if (!user) return c.json({ ok: false, reason: "user_not_found" }, 404);
  if (user.pendingPoints < amount) {
    return c.json(
      {
        ok: false,
        reason: "insufficient_points",
        pendingPoints: user.pendingPoints,
        today,
      },
      400,
    );
  }

  await db
    .update(users)
    .set({
      pendingPoints: sql`${users.pendingPoints} - ${amount}`,
      updatedAt: now,
    })
    .where(eq(users.userKey, hash));

  console.log(
    "[mission/redeem]",
    JSON.stringify({ hash, amount, grantKey }),
  );

  const claim = await db
    .select()
    .from(missionClaims)
    .where(
      and(eq(missionClaims.userKey, hash), eq(missionClaims.date, today)),
    )
    .get();
  const after = await db
    .select({ pendingPoints: users.pendingPoints })
    .from(users)
    .where(eq(users.userKey, hash))
    .get();

  return c.json({
    pendingPoints: after?.pendingPoints ?? 0,
    claimedToday: !!claim,
    today,
  });
});

export default route;
