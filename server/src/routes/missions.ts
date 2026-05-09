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

  if (claimed) {
    await db
      .update(users)
      .set({
        pendingPoints: sql`${users.pendingPoints} + 1`,
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
    pendingPoints: after?.pendingPoints ?? 0,
    today,
  });
});

export default route;
