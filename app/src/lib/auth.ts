import { getAnonymousKey } from "@apps-in-toss/web-framework";

export type AuthOutcome =
  | { status: "ok"; hash: string }
  | { status: "unsupported" }
  | { status: "invalid_category" }
  | { status: "error"; reason?: string };

// 역사왕은 비게임 카테고리로 등록되어 있어 getAnonymousKey 사용.
// (게임 카테고리 전환 시 getUserKeyForGame 으로 교체 필요)
export async function fetchUserHash(): Promise<AuthOutcome> {
  if (typeof getAnonymousKey !== "function") {
    return { status: "unsupported" };
  }
  try {
    const result = await getAnonymousKey();
    if (!result) return { status: "unsupported" };
    if (result === "INVALID_CATEGORY")
      return { status: "invalid_category" };
    if (result === "ERROR") return { status: "error" };
    if (result.type === "HASH") {
      return { status: "ok", hash: result.hash };
    }
    return { status: "error", reason: "unknown_response" };
  } catch (err) {
    console.warn("[auth] getAnonymousKey threw", err);
    return {
      status: "error",
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}
