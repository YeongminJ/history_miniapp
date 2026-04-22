import { create } from "zustand";
import { pickBoss } from "../data/bosses";
import { pickStageQuestions } from "../data/quiz";
import { getStage } from "../data/stages";
import type { AnswerRecord, Era, Question } from "../types";

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
  score: number;
  answers: AnswerRecord[];
  revealed: boolean;
  selectedIndex: number | null;
  lastResolution: LastResolution | null;

  startBattle: (era: Era, stageIndex: number) => void;
  answer: (selectedIndex: number | null, timeMs: number) => void;
  next: () => void;
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
  score: 0,
  answers: [],
  revealed: false,
  selectedIndex: null,
  lastResolution: null,

  startBattle: (era, stageIndex) => {
    const stage = getStage(stageIndex);
    const questions = pickStageQuestions(era, stage);
    set({
      era,
      stageIndex,
      bossName: pickBoss(era),
      questions,
      currentIndex: 0,
      playerHP: MAX_PLAYER_HP,
      enemyHP: questions.length,
      enemyMaxHP: questions.length,
      combo: 0,
      score: 0,
      answers: [],
      revealed: false,
      selectedIndex: null,
      lastResolution: null,
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
    set({
      currentIndex: nextIndex,
      revealed: false,
      selectedIndex: null,
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
      score: 0,
      answers: [],
      revealed: false,
      selectedIndex: null,
      lastResolution: null,
    }),
}));

export const GAME_CONSTANTS = {
  MAX_PLAYER_HP,
  BASE_DAMAGE,
  COMBO_BONUS,
  QUESTION_TIME_MS: 10_000,
  CRITICAL_COMBO: 3,
};
