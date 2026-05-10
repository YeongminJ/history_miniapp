/**
 * 일일 미션 백엔드 호출. 서버: history-king-noti-api.
 * 모든 호출은 best-effort — 실패해도 게임 흐름엔 영향 없음.
 */

const BASE = (
  (import.meta.env.VITE_REMINDER_API_BASE as string | undefined) ?? ""
).replace(/\/$/, "");

export interface MissionStatus {
  pendingPoints: number;
  claimedToday: boolean;
  today: string;
}

export interface ClaimResult {
  ok: boolean;
  /** false 면 오늘 이미 받음. */
  claimed: boolean;
  pendingPoints: number;
  today: string;
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

export async function claimDailyMission(
  hash: string,
): Promise<ClaimResult | null> {
  if (!BASE) return null;
  try {
    const res = await fetch(`${BASE}/missions/claim-daily`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hash }),
    });
    if (!res.ok) return null;
    return (await res.json()) as ClaimResult;
  } catch (err) {
    console.warn("[mission] claim failed", err);
    return null;
  }
}

/**
 * 토스 포인트 발행 성공 후 서버 누적 포인트 차감.
 * `grantKey` 는 토스가 돌려준 reward key — 서버 로깅용.
 */
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
