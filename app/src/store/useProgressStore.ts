import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Era } from "../types";

interface EraStats {
  played: number;
  correct: number;
  bestScore: number;
}

interface ProgressState {
  streak: number;
  lastPlayDate: string | null;
  totalPlayed: number;
  totalCorrect: number;
  totalScore: number;
  byEra: Record<Era, EraStats>;
  clearedIds: string[];

  recordChapter: (args: {
    era: Era;
    answeredIds: string[];
    correctCount: number;
    score: number;
  }) => void;
}

const emptyEraStats = (): EraStats => ({ played: 0, correct: 0, bestScore: 0 });

const todayKey = () => new Date().toISOString().slice(0, 10);

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      streak: 0,
      lastPlayDate: null,
      totalPlayed: 0,
      totalCorrect: 0,
      totalScore: 0,
      byEra: {
        고대: emptyEraStats(),
        고려: emptyEraStats(),
        조선: emptyEraStats(),
        근대: emptyEraStats(),
        현대: emptyEraStats(),
      },
      clearedIds: [],

      recordChapter: ({ era, answeredIds, correctCount, score }) => {
        const state = get();
        const today = todayKey();
        const yesterday = new Date(Date.now() - 86_400_000)
          .toISOString()
          .slice(0, 10);

        let nextStreak = state.streak;
        if (state.lastPlayDate !== today) {
          if (state.lastPlayDate === yesterday) nextStreak = state.streak + 1;
          else nextStreak = 1;
        }

        const eraStats = state.byEra[era];
        const mergedIds = new Set([...state.clearedIds, ...answeredIds]);

        set({
          streak: nextStreak,
          lastPlayDate: today,
          totalPlayed: state.totalPlayed + answeredIds.length,
          totalCorrect: state.totalCorrect + correctCount,
          totalScore: state.totalScore + score,
          byEra: {
            ...state.byEra,
            [era]: {
              played: eraStats.played + answeredIds.length,
              correct: eraStats.correct + correctCount,
              bestScore: Math.max(eraStats.bestScore, score),
            },
          },
          clearedIds: [...mergedIds],
        });
      },
    }),
    {
      name: "history-king-progress-v1",
    },
  ),
);
