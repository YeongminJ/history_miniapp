import { create } from "zustand";
import { persist } from "zustand/middleware";

export const REDEEM_THRESHOLD = 10;

interface MissionState {
  /** 토스 포인트로 redeem 대기 중인 누적 (1원 단위). */
  pendingPoints: number;
  /** 오늘 일일 미션 보상을 이미 받았는지. */
  claimedToday: boolean;
  /** 마지막 server status 동기화 시점의 KST 'YYYY-MM-DD'. 날짜 바뀌면 stale. */
  lastSyncDate: string | null;

  /** server `/missions/status` 응답 적용. */
  setStatus: (s: {
    pendingPoints: number;
    claimedToday: boolean;
    today: string;
  }) => void;

  /** server `/missions/claim-daily` 응답 적용. */
  applyClaimResult: (s: {
    claimed: boolean;
    awardedAmount: number;
    pendingPoints: number;
    today: string;
  }) => void;
}

export const useMissionStore = create<MissionState>()(
  persist(
    (set) => ({
      pendingPoints: 0,
      claimedToday: false,
      lastSyncDate: null,
      setStatus: ({ pendingPoints, claimedToday, today }) =>
        set({ pendingPoints, claimedToday, lastSyncDate: today }),
      applyClaimResult: ({ claimed, pendingPoints, today }) =>
        set((prev) => ({
          pendingPoints,
          claimedToday: claimed || prev.claimedToday,
          lastSyncDate: today,
        })),
    }),
    {
      name: "history-king-mission-v1",
    },
  ),
);
