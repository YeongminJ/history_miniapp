import { zValidator } from "@hono/zod-validator";
import { and, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { getDb } from "../db/client";
import { missionClaims, users } from "../db/schema";
import type { Env } from "../env";
import { nowKstDate } from "../lib/time";

/**
 * 미션 시스템.
 *
 * 종류 (모두 누적 포인트로 적립; 10원 도달 시 광고 보고 토스 포인트 전환):
 *  - daily_1: 오늘 첫 클리어 (가중랜덤 1~5원)
 *  - daily_3: 오늘 3판 클리어 (+2원)
 *  - daily_5: 오늘 5판 클리어 (+3원)
 *  - combo_10: 한 게임 내 10문제 연속 정답 (+1원, 하루 1회)
 *  - streak_3: 3일 연속 출석 (+2원)
 *  - streak_7: 7일 연속 출석 (+5원)
 *  - streak_30: 30일 연속 출석 (+10원)
 *
 * 멱등성: (user_key, date, type) UNIQUE. 같은 KST 날짜에 같은 type 으로 두 번
 * 호출되면 두 번째는 conflict 로 차단되어 추가 적립 없음.
 */

type ClaimType =
  | "daily_1"
  | "daily_3"
  | "daily_5"
  | "combo_10"
  | "streak_3"
  | "streak_7"
  | "streak_30";

const STREAK_REQUIRED: Record<string, number> = {
  streak_3: 3,
  streak_7: 7,
  streak_30: 30,
};

const FIXED_AMOUNT: Record<string, number> = {
  daily_3: 2,
  daily_5: 3,
  combo_10: 1,
  streak_3: 2,
  streak_7: 5,
  streak_30: 10,
};

/**
 * daily_1 가중 랜덤 추첨.
 *  1원 40% / 2원 30% / 3원 15% / 4원 10% / 5원 5%
 */
function drawDaily1Amount(): number {
  const r = Math.random();
  if (r < 0.4) return 1;
  if (r < 0.7) return 2;
  if (r < 0.85) return 3;
  if (r < 0.95) return 4;
  return 5;
}

function amountForType(type: ClaimType): number {
  if (type === "daily_1") return drawDaily1Amount();
  return FIXED_AMOUNT[type] ?? 0;
}

const route = new Hono<{ Bindings: Env }>();

const hashSchema = z.object({
  hash: z.string().min(1).max(200),
});

route.post("/status", zValidator("json", hashSchema), async (c) => {
  const { hash } = c.req.valid("json");
  const db = getDb(c.env.DB);
  const today = nowKstDate(new Date());
  const [user, todayClaims] = await Promise.all([
    db
      .select({
        pendingPoints: users.pendingPoints,
        currentStreak: users.currentStreak,
      })
      .from(users)
      .where(eq(users.userKey, hash))
      .get(),
    db
      .select({ type: missionClaims.type })
      .from(missionClaims)
      .where(
        and(eq(missionClaims.userKey, hash), eq(missionClaims.date, today)),
      )
      .all(),
  ]);
  const claimedTypes = todayClaims.map((c) => c.type);
  return c.json({
    pendingPoints: user?.pendingPoints ?? 0,
    currentStreak: user?.currentStreak ?? 0,
    claimedTypes,
    today,
  });
});

const claimSchema = z.object({
  hash: z.string().min(1).max(200),
  type: z.enum([
    "daily_1",
    "daily_3",
    "daily_5",
    "combo_10",
    "streak_3",
    "streak_7",
    "streak_30",
  ]),
});

route.post("/claim", zValidator("json", claimSchema), async (c) => {
  const { hash, type } = c.req.valid("json");
  const db = getDb(c.env.DB);
  const today = nowKstDate(new Date());
  const now = Date.now();

  // user row 보장
  await db
    .insert(users)
    .values({ userKey: hash, createdAt: now, updatedAt: now })
    .onConflictDoNothing();

  // streak 타입은 서버에서 current_streak 확인
  if (type === "streak_3" || type === "streak_7" || type === "streak_30") {
    const u = await db
      .select({ currentStreak: users.currentStreak })
      .from(users)
      .where(eq(users.userKey, hash))
      .get();
    const need = STREAK_REQUIRED[type] ?? Infinity;
    if (!u || u.currentStreak < need) {
      return c.json(
        {
          ok: false,
          reason: "streak_not_reached",
          required: need,
          currentStreak: u?.currentStreak ?? 0,
        },
        400,
      );
    }
  }

  const awardedAmount = amountForType(type);
  if (awardedAmount <= 0) {
    return c.json({ ok: false, reason: "invalid_type" }, 400);
  }

  // 멱등 insert
  const inserted = await db
    .insert(missionClaims)
    .values({
      userKey: hash,
      date: today,
      type,
      amount: awardedAmount,
      claimedAt: now,
    })
    .onConflictDoNothing()
    .returning();
  const claimed = inserted.length > 0;

  if (claimed) {
    await db
      .update(users)
      .set({
        pendingPoints: sql`${users.pendingPoints} + ${awardedAmount}`,
        updatedAt: now,
      })
      .where(eq(users.userKey, hash));
    console.log(
      "[mission/claim]",
      JSON.stringify({ hash, type, awardedAmount, today }),
    );
  }

  const after = await db
    .select({
      pendingPoints: users.pendingPoints,
      currentStreak: users.currentStreak,
    })
    .from(users)
    .where(eq(users.userKey, hash))
    .get();

  // 응답에 오늘 claimed types 도 함께 → 클라가 store sync 가능
  const todayClaims = await db
    .select({ type: missionClaims.type })
    .from(missionClaims)
    .where(
      and(eq(missionClaims.userKey, hash), eq(missionClaims.date, today)),
    )
    .all();

  return c.json({
    ok: true,
    claimed,
    type,
    awardedAmount: claimed ? awardedAmount : 0,
    pendingPoints: after?.pendingPoints ?? 0,
    currentStreak: after?.currentStreak ?? 0,
    claimedTypes: todayClaims.map((c) => c.type),
    today,
  });
});

// 호환: 기존 /claim-daily 는 type=daily_1 로 라우팅.
route.post("/claim-daily", zValidator("json", hashSchema), async (c) => {
  const { hash } = c.req.valid("json");
  const db = getDb(c.env.DB);
  const today = nowKstDate(new Date());
  const now = Date.now();

  await db
    .insert(users)
    .values({ userKey: hash, createdAt: now, updatedAt: now })
    .onConflictDoNothing();

  const awardedAmount = drawDaily1Amount();
  const inserted = await db
    .insert(missionClaims)
    .values({
      userKey: hash,
      date: today,
      type: "daily_1",
      amount: awardedAmount,
      claimedAt: now,
    })
    .onConflictDoNothing()
    .returning();
  const claimed = inserted.length > 0;

  if (claimed) {
    await db
      .update(users)
      .set({
        pendingPoints: sql`${users.pendingPoints} + ${awardedAmount}`,
        updatedAt: now,
      })
      .where(eq(users.userKey, hash));
  }

  const after = await db
    .select({ pendingPoints: users.pendingPoints })
    .from(users)
    .where(eq(users.userKey, hash))
    .get();

  return c.json({
    ok: true,
    claimed,
    awardedAmount: claimed ? awardedAmount : 0,
    pendingPoints: after?.pendingPoints ?? 0,
    today,
  });
});

const redeemSchema = z.object({
  hash: z.string().min(1).max(200),
  amount: z.number().int().positive(),
  grantKey: z.string().min(1).max(200),
});

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

  const todayClaims = await db
    .select({ type: missionClaims.type })
    .from(missionClaims)
    .where(
      and(eq(missionClaims.userKey, hash), eq(missionClaims.date, today)),
    )
    .all();
  const after = await db
    .select({
      pendingPoints: users.pendingPoints,
      currentStreak: users.currentStreak,
    })
    .from(users)
    .where(eq(users.userKey, hash))
    .get();

  return c.json({
    pendingPoints: after?.pendingPoints ?? 0,
    currentStreak: after?.currentStreak ?? 0,
    claimedTypes: todayClaims.map((c) => c.type),
    today,
  });
});

export default route;
