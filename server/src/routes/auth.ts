import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { getDb } from "../db/client";
import { users } from "../db/schema";
import type { Env } from "../env";
import { exchangeAuthorizationCode } from "../lib/toss-oauth";

const route = new Hono<{ Bindings: Env }>();

/**
 * `/api/auth/migration/status`
 * hash로 토스 매핑 여부 조회. 클라가 onboarding 단계에서 OAuth 트리거 여부 결정.
 */
const statusSchema = z.object({
  hash: z.string().min(1).max(200),
});

route.post("/migration/status", zValidator("json", statusSchema), async (c) => {
  const { hash } = c.req.valid("json");
  const db = getDb(c.env.DB);
  const user = await db
    .select({ tossUserKey: users.tossUserKey, name: users.name })
    .from(users)
    .where(eq(users.userKey, hash))
    .get();
  const isMapped = !!user?.tossUserKey;
  return c.json({ isMapped, name: user?.name ?? null });
});

/**
 * `/api/auth/migration/link`
 * 인가코드 → 토스 OAuth 2단계 → `toss_user_key` 저장.
 * 알림 시간 같은 다른 설정과 분리되어 있어 onboarding에서 단독 호출 가능.
 */
const linkSchema = z.object({
  hash: z.string().min(1).max(200),
  authorizationCode: z.string().min(1),
  referrer: z.string().min(1),
});

route.post("/migration/link", zValidator("json", linkSchema), async (c) => {
  const { hash, authorizationCode, referrer } = c.req.valid("json");
  const db = getDb(c.env.DB);
  const now = Date.now();

  // 이미 매핑되어 있으면 OAuth 재호출 생략 (멱등)
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.userKey, hash))
    .get();
  if (existing?.tossUserKey) {
    return c.json({
      success: true,
      alreadyMapped: true,
      name: existing.name ?? null,
    });
  }

  const exchange = await exchangeAuthorizationCode(
    c.env,
    authorizationCode,
    referrer,
  );
  if (!exchange.ok) {
    console.warn("[auth/migration/link] oauth failed", exchange.error);
    return c.json(
      { success: false, error: exchange.error },
      502,
    );
  }

  await db
    .insert(users)
    .values({
      userKey: hash,
      tossUserKey: exchange.tossUserKey,
      name: exchange.name,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: users.userKey,
      set: {
        tossUserKey: exchange.tossUserKey,
        ...(exchange.name ? { name: exchange.name } : {}),
        updatedAt: now,
      },
    });

  return c.json({ success: true, name: exchange.name });
});

/**
 * `/api/auth/exchange` (deprecated, 호환성 유지)
 * 신규 흐름은 `/migration/link` 사용.
 */
const exchangeSchema = z.object({
  authorizationCode: z.string().min(1),
  referrer: z.string().min(1),
});

route.post("/exchange", zValidator("json", exchangeSchema), async (c) => {
  const { authorizationCode, referrer } = c.req.valid("json");
  const result = await exchangeAuthorizationCode(
    c.env,
    authorizationCode,
    referrer,
  );
  if (!result.ok) {
    return c.json({ error: result.error }, 502);
  }
  return c.json({ userKey: result.tossUserKey });
});

export default route;
