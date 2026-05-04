import { getUserKeyForGame } from "@apps-in-toss/web-framework";

export type AuthOutcome =
  | { status: "ok"; hash: string }
  | { status: "unsupported" }
  | { status: "invalid_category" }
  | { status: "error"; reason?: string };

export async function fetchUserHash(): Promise<AuthOutcome> {
  if (typeof getUserKeyForGame !== "function") {
    return { status: "unsupported" };
  }
  try {
    const result = await getUserKeyForGame();
    if (!result) return { status: "unsupported" };
    if (result === "INVALID_CATEGORY")
      return { status: "invalid_category" };
    if (result === "ERROR") return { status: "error" };
    if (result.type === "HASH") {
      return { status: "ok", hash: result.hash };
    }
    return { status: "error", reason: "unknown_response" };
  } catch (err) {
    console.warn("[auth] getUserKeyForGame threw", err);
    return {
      status: "error",
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}
