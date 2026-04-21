import { create } from "zustand";
import { pickQuestions } from "../data/quiz";
import type { AnswerRecord, Era, Question } from "../types";

const CHAPTER_SIZE = 5;
const MAX_PLAYER_HP = 3;
const BASE_DAMAGE = 20;
const COMBO_BONUS = 5;

interface GameState {
  era: Era | null;
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

  startBattle: (era: Era) => void;
  answer: (selectedIndex: number | null, timeMs: number) => void;
  next: () => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  era: null,
  questions: [],
  currentIndex: 0,
  playerHP: MAX_PLAYER_HP,
  enemyHP: CHAPTER_SIZE,
  enemyMaxHP: CHAPTER_SIZE,
  combo: 0,
  score: 0,
  answers: [],
  revealed: false,
  selectedIndex: null,

  startBattle: (era) => {
    const questions = pickQuestions(era, "all", CHAPTER_SIZE);
    set({
      era,
      questions,
      currentIndex: 0,
      playerHP: MAX_PLAYER_HP,
      enemyHP: CHAPTER_SIZE,
      enemyMaxHP: CHAPTER_SIZE,
      combo: 0,
      score: 0,
      answers: [],
      revealed: false,
      selectedIndex: null,
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
      questions: [],
      currentIndex: 0,
      playerHP: MAX_PLAYER_HP,
      enemyHP: CHAPTER_SIZE,
      enemyMaxHP: CHAPTER_SIZE,
      combo: 0,
      score: 0,
      answers: [],
      revealed: false,
      selectedIndex: null,
    }),
}));

export const GAME_CONSTANTS = {
  CHAPTER_SIZE,
  MAX_PLAYER_HP,
  BASE_DAMAGE,
  COMBO_BONUS,
  QUESTION_TIME_MS: 10_000,
};
