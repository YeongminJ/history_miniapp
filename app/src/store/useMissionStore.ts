import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MissionType } from "../lib/mission";

export const REDEEM_THRESHOLD = 10;

export const DAILY_GOALS = [1, 3, 5] as const;
export const STREAK_MILESTONES = [3, 7, 30] as const;

interface MissionState {
  pendingPoints: number;
  currentStreak: number;
  /** 오늘 claim 된 미션 타입들. KST 자정 기준 lastSyncDate 가 바뀌면 reset. */
  claimedTypes: MissionType[];
  /** 오늘 던전 클리어 횟수 (클라 카운터). */
  todayClearCount: number;
  /** 마지막 sync 의 KST 'YYYY-MM-DD'. */
  lastSyncDate: string | null;

  setStatus: (s: {
    pendingPoints: number;
    currentStreak: number;
    claimedTypes: MissionType[];
    today: string;
  }) => void;
  /** ResultScreen 에서 cleared 시 호출. KST 날짜 바뀌면 자동 reset 후 +1. */
  incrementTodayClear: (today: string) => void;
  setCurrentStreak: (n: number) => void;
}

export const useMissionStore = create<MissionState>()(
  persist(
    (set, get) => ({
      pendingPoints: 0,
      currentStreak: 0,
      claimedTypes: [],
      todayClearCount: 0,
      lastSyncDate: null,

      setStatus: ({ pendingPoints, currentStreak, claimedTypes, today }) => {
        const prev = get();
        // 날짜 바뀌면 todayClearCount 도 리셋
        const carryClear =
          prev.lastSyncDate === today ? prev.todayClearCount : 0;
        set({
          pendingPoints,
          currentStreak,
          claimedTypes,
          lastSyncDate: today,
          todayClearCount: carryClear,
        });
      },

      incrementTodayClear: (today) => {
        const prev = get();
        const sameDay = prev.lastSyncDate === today;
        set({
          todayClearCount: (sameDay ? prev.todayClearCount : 0) + 1,
          lastSyncDate: today,
          claimedTypes: sameDay ? prev.claimedTypes : [],
        });
      },

      setCurrentStreak: (n) => set({ currentStreak: n }),
    }),
    {
      name: "history-king-mission-v2",
    },
  ),
);
