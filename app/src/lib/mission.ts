/**
 * 미션 백엔드 호출. best-effort — 실패해도 게임 흐름엔 영향 없음.
 * 사용자 등록·시간 변경은 `useReminderStore` 가 담당.
 */

const BASE = (
  (import.meta.env.VITE_REMINDER_API_BASE as string | undefined) ?? ""
).replace(/\/$/, "");

export type MissionType =
  | "daily_1"
  | "daily_3"
  | "daily_5"
  | "combo_10"
  | "streak_3"
  | "streak_7"
  | "streak_30";

export interface MissionStatus {
  pendingPoints: number;
  currentStreak: number;
  claimedTypes: MissionType[];
  today: string;
}

export interface ClaimResult extends MissionStatus {
  ok: boolean;
  claimed: boolean;
  type: MissionType;
  awardedAmount: number;
}

export async function fetchMissionStatus(
  hash: string,
): Promise<MissionStatus | null> {
  if (!BASE) return null;
  try {
    const res = await fetch(`${BASE}/missions/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hash }),
    });
    if (!res.ok) return null;
    return (await res.json()) as MissionStatus;
  } catch (err) {
    console.warn("[mission] status fetch failed", err);
    return null;
  }
}

export async function claimMission(
  hash: string,
  type: MissionType,
): Promise<ClaimResult | null> {
  if (!BASE) return null;
  try {
    const res = await fetch(`${BASE}/missions/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hash, type }),
    });
    if (!res.ok) return null;
    return (await res.json()) as ClaimResult;
  } catch (err) {
    console.warn("[mission] claim failed", err, type);
    return null;
  }
}

/** KST 현재 날짜 'YYYY-MM-DD' */
export function getCurrentKstDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** 토스 포인트 발행 후 누적 차감. */
export async function redeemMissionPoints(
  hash: string,
  amount: number,
  grantKey: string,
): Promise<MissionStatus | null> {
  if (!BASE) return null;
  try {
    const res = await fetch(`${BASE}/missions/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hash, amount, grantKey }),
    });
    if (!res.ok) return null;
    return (await res.json()) as MissionStatus;
  } catch (err) {
    console.warn("[mission] redeem failed", err);
    return null;
  }
}
