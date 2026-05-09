import type { Env } from "../env";
import { decryptTossUserField } from "./toss-decrypt";

const TOSS_GENERATE_TOKEN_URL =
  "https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/user/oauth2/generate-token";
const TOSS_LOGIN_ME_URL =
  "https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/user/oauth2/login-me";

interface TossGenerateTokenResponse {
  resultType?: "SUCCESS" | string;
  /**
   * 응답 필드는 `success` (옛 문서의 `result` 가 아님 — bible-mini 검증 후 확정).
   */
  success?: {
    accessToken?: string;
    refreshToken?: string;
    scope?: string;
    expiresIn?: number;
  };
  error?: { errorCode?: string; reason?: string };
}

interface TossLoginMeResponse {
  resultType?: "SUCCESS" | string;
  success?: {
    userKey?: string | number;
    scope?: string;
    agreedTerms?: unknown[];
    /** AES-256-GCM 암호화. base64( IV(12) || ciphertext || tag(16) ). user_name scope 동의 시 포함. */
    name?: string | null;
  };
  error?: { errorCode?: string; reason?: string };
}

export type TossOAuthResult =
  | { ok: true; tossUserKey: string; name: string | null }
  | { ok: false; error: string };

/**
 * 토스 OAuth 2단계 교환:
 *  ① POST generate-token (인가코드 → accessToken)
 *  ② GET login-me (accessToken → userKey)
 *
 * **응답 본문 통째 로깅 금지** — accessToken·PII (name/phone/birthday/ci) 포함 가능.
 * 항상 error 필드 + status code 만 로깅.
 */
export async function exchangeAuthorizationCode(
  env: Env,
  authorizationCode: string,
  referrer: string,
): Promise<TossOAuthResult> {
  if (!env.TOSS_CERT) {
    return { ok: false, error: "TOSS_CERT binding missing" };
  }

  // Step 1: accessToken 발급
  let tokenRes: Response;
  try {
    tokenRes = await env.TOSS_CERT.fetch(TOSS_GENERATE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorizationCode, referrer }),
    });
  } catch (err) {
    return {
      ok: false,
      error: `generate-token threw: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
  const tokenData = (await tokenRes.json().catch(() => null)) as
    | TossGenerateTokenResponse
    | null;
  if (!tokenRes.ok) {
    console.warn(
      "[toss-oauth] generate-token http",
      tokenRes.status,
      tokenData?.error,
    );
    return {
      ok: false,
      error: `generate-token http ${tokenRes.status}`,
    };
  }
  if (tokenData?.resultType !== "SUCCESS" || !tokenData.success?.accessToken) {
    console.warn(
      "[toss-oauth] generate-token failed",
      tokenData?.resultType,
      tokenData?.error,
    );
    return {
      ok: false,
      error: `generate-token failed (${tokenData?.error?.errorCode ?? tokenData?.resultType ?? "unknown"})`,
    };
  }
  const accessToken = tokenData.success.accessToken;

  // Step 2: login-me 로 userKey 획득
  let meRes: Response;
  try {
    meRes = await env.TOSS_CERT.fetch(TOSS_LOGIN_ME_URL, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (err) {
    return {
      ok: false,
      error: `login-me threw: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
  const meData = (await meRes.json().catch(() => null)) as
    | TossLoginMeResponse
    | null;
  if (!meRes.ok) {
    console.warn("[toss-oauth] login-me http", meRes.status);
    return { ok: false, error: `login-me http ${meRes.status}` };
  }
  if (meData?.resultType !== "SUCCESS" || meData.success?.userKey == null) {
    console.warn(
      "[toss-oauth] login-me failed",
      meData?.resultType,
      meData?.error,
    );
    return {
      ok: false,
      error: `login-me failed (${meData?.error?.errorCode ?? meData?.resultType ?? "unknown"})`,
    };
  }

  // user_name scope 동의 시 암호화된 name 동봉. 복호화 실패해도 핵심 흐름은 진행.
  const name = await decryptTossUserField(env, meData.success.name ?? null);
  return {
    ok: true,
    tossUserKey: String(meData.success.userKey),
    name,
  };
}
