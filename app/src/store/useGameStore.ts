import { create } from "zustand";
import {
  getSupplementQuestions,
  pickBossAndQuestions,
} from "../data/bosses";
import { getStage } from "../data/stages";
import type { AnswerRecord, Era, Question } from "../types";

const SUPPLEMENT_THRESHOLD = 3;
const SUPPLEMENT_SIZE = 10;

const MAX_PLAYER_HP = 3;
const BASE_DAMAGE = 20;
const COMBO_BONUS = 5;

interface LastResolution {
  correct: boolean;
  damage: number;
  combo: number;
  critical: boolean;
  stamp: number;
}

interface GameState {
  era: Era | null;
  stageIndex: number;
  bossName: string | null;
  questions: Question[];
  currentIndex: number;
  playerHP: number;
  enemyHP: number;
  enemyMaxHP: number;
  combo: number;
  maxCombo: number;
  score: number;
  answers: AnswerRecord[];
  revealed: boolean;
  selectedIndex: number | null;
  lastResolution: LastResolution | null;
  reviveCount: number;

  startBattle: (era: Era, stageIndex: number) => void;
  answer: (selectedIndex: number | null, timeMs: number) => void;
  next: () => void;
  revive: (hpRestore?: number) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  era: null,
  stageIndex: 0,
  bossName: null,
  questions: [],
  currentIndex: 0,
  playerHP: MAX_PLAYER_HP,
  enemyHP: 0,
  enemyMaxHP: 0,
  combo: 0,
  maxCombo: 0,
  score: 0,
  answers: [],
  revealed: false,
  selectedIndex: null,
  lastResolution: null,
  reviveCount: 0,

  startBattle: (era, stageIndex) => {
    const stage = getStage(stageIndex);
    const { name, questions } = pickBossAndQuestions(era, stage);
    const enemyHP = stage.minCorrectToClear;
    set({
      era,
      stageIndex,
      bossName: name,
      questions,
      currentIndex: 0,
      playerHP: MAX_PLAYER_HP,
      enemyHP,
      enemyMaxHP: enemyHP,
      combo: 0,
      maxCombo: 0,
      score: 0,
      answers: [],
      revealed: false,
      selectedIndex: null,
      lastResolution: null,
      reviveCount: 0,
    });
  },

  answer: (selectedIndex, timeMs) => {
    const state = get();
    if (state.revealed) return;
    const question = state.questions[state.currentIndex];
    if (!question) return;
    const correct =
      selectedIndex !== null && selectedIndex === question.answerIndex;
    const newCombo = correct ? state.combo + 1 : 0;
    const critical = correct && newCombo >= 3;
    const damage = correct ? BASE_DAMAGE + newCombo * COMBO_BONUS : 0;
    set({
      revealed: true,
      selectedIndex,
      combo: newCombo,
      maxCombo: Math.max(state.maxCombo, newCombo),
      score: state.score + damage,
      playerHP: correct ? state.playerHP : Math.max(0, state.playerHP - 1),
      enemyHP: correct ? Math.max(0, state.enemyHP - 1) : state.enemyHP,
      answers: [
        ...state.answers,
        { question, selectedIndex, correct, timeMs },
      ],
      lastResolution: {
        correct,
        damage,
        combo: newCombo,
        critical,
        stamp: Date.now(),
      },
    });
  },

  next: () => {
    const state = get();
    const nextIndex = state.currentIndex + 1;
    let questions = state.questions;
    // 남은 문제가 적으면 보스·시대 풀에서 이어붙여 공급
    if (
      state.era &&
      state.bossName &&
      questions.length - nextIndex < SUPPLEMENT_THRESHOLD
    ) {
      const usedIds = new Set(questions.map((q) => q.id));
      const extra = getSupplementQuestions(
        state.era,
        state.bossName,
        usedIds,
        SUPPLEMENT_SIZE,
      );
      if (extra.length > 0) {
        questions = [...questions, ...extra];
      }
    }
    set({
      currentIndex: nextIndex,
      revealed: false,
      selectedIndex: null,
      questions,
    });
  },

  revive: (hpRestore = 1) => {
    const state = get();
    set({
      playerHP: Math.max(hpRestore, state.playerHP),
      reviveCount: state.reviveCount + 1,
      revealed: false,
      selectedIndex: null,
      lastResolution: null,
    });
  },

  reset: () =>
    set({
      era: null,
      stageIndex: 0,
      bossName: null,
      questions: [],
      currentIndex: 0,
      playerHP: MAX_PLAYER_HP,
      enemyHP: 0,
      enemyMaxHP: 0,
      combo: 0,
      maxCombo: 0,
      score: 0,
      answers: [],
      revealed: false,
      selectedIndex: null,
      lastResolution: null,
      reviveCount: 0,
    }),
}));

export const GAME_CONSTANTS = {
  MAX_PLAYER_HP,
  BASE_DAMAGE,
  COMBO_BONUS,
  QUESTION_TIME_MS: 10_000,
  CRITICAL_COMBO: 3,
};
