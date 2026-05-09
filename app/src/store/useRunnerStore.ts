import { create } from "zustand";
import type { CharacterStyle } from "../components/RunnerCharacters";
import { byEra } from "../data/quiz";
import type { Difficulty, Era, Question } from "../types";

/* === 게임 파라미터 === */
export const PLAYER_X = 70;
const CHASER_INITIAL_X = 4;
const CHASER_REWARD_CORRECT = 3;
const COMBO_PUSHBACK_BONUS = 0.6;
const COMBO_FORWARD_BONUS = 0.5;
const REVEAL_HOLD_CORRECT_MS = 600;
const REVEAL_HOLD_WRONG_MS = 1100;

/**
 * 레벨 테이블 — 호랑이 속도와 오답 페널티가 단계적으로 증가.
 * 시간 제한은 없음 (호랑이 자체가 시간 압박).
 *
 * threshold = 이 레벨 진입을 위한 누적 정답 수.
 */
interface LevelParams {
  level: number;
  threshold: number;
  speed: number;          // 추격자 진행 속도 (%/sec)
  wrongPenalty: number;   // 오답 시 추격자 점프 (%)
}

const LEVELS: LevelParams[] = [
  { level: 1,  threshold: 0,   speed: 1.5,  wrongPenalty: 4 },
  { level: 2,  threshold: 5,   speed: 3.0,  wrongPenalty: 5 },
  { level: 3,  threshold: 12,  speed: 5.0,  wrongPenalty: 6 },
  { level: 4,  threshold: 22,  speed: 7.5,  wrongPenalty: 8 },
  { level: 5,  threshold: 35,  speed: 10.0, wrongPenalty: 10 },
  { level: 6,  threshold: 50,  speed: 13.0, wrongPenalty: 12 },
  { level: 7,  threshold: 70,  speed: 17.0, wrongPenalty: 14 },
  { level: 8,  threshold: 95,  speed: 22.0, wrongPenalty: 16 },
  { level: 9,  threshold: 125, speed: 28.0, wrongPenalty: 18 },
  { level: 10, threshold: 160, speed: 34.0, wrongPenalty: 20 },
];

function getLevelParams(correctCount: number): LevelParams {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (correctCount >= LEVELS[i]!.threshold) return LEVELS[i]!;
  }
  return LEVELS[0]!;
}

const ERAS: Era[] = ["고대", "고려", "조선", "근대", "현대"];

function weightedDifficulty(): Difficulty {
  const r = Math.random();
  if (r < 0.6) return "easy";
  if (r < 0.9) return "medium";
  return "hard";
}

function pickRandomQuestion(): Question {
  const era = ERAS[Math.floor(Math.random() * ERAS.length)]!;
  const desired = weightedDifficulty();
  const pool = byEra[era].filter((q) => q.difficulty === desired);
  const list = pool.length > 0 ? pool : byEra[era];
  return list[Math.floor(Math.random() * list.length)]!;
}

export type RunnerStatus = "idle" | "playing" | "over";

interface RunnerState {
  status: RunnerStatus;
  question: Question | null;
  questionsAsked: number;
  distance: number;
  correctCount: number;
  wrongCount: number;
  combo: number;
  maxCombo: number;
  chaserX: number;
  selectedIndex: number | null;
  revealed: boolean;
  pendingNextAt: number | null;
  lastCorrect: boolean | null;
  lastGain: number;
  lastEventStamp: number;
  /** 현재 레벨 (1~10). HUD 표시용. */
  level: number;
  /** 직전 레벨업 stamp — 레벨업 토스트 트리거 */
  lastLevelUpStamp: number;
  /** 캐릭터 스타일 (게임 전반에서 유지) */
  characterStyle: CharacterStyle;

  start: () => void;
  answer: (selectedIndex: number | null) => void;
  tick: (deltaMs: number, now?: number) => void;
  reset: () => void;
  setCharacterStyle: (style: CharacterStyle) => void;
}

export const useRunnerStore = create<RunnerState>((set, get) => ({
  status: "idle",
  question: null,
  questionsAsked: 0,
  distance: 0,
  correctCount: 0,
  wrongCount: 0,
  combo: 0,
  maxCombo: 0,
  chaserX: CHASER_INITIAL_X,
  selectedIndex: null,
  revealed: false,
  pendingNextAt: null,
  lastCorrect: null,
  lastGain: 0,
  lastEventStamp: 0,
  level: 1,
  lastLevelUpStamp: 0,
  characterStyle: "emoji",

  setCharacterStyle: (style) => set({ characterStyle: style }),

  start: () => {
    const q = pickRandomQuestion();
    set({
      status: "playing",
      question: q,
      questionsAsked: 1,
      distance: 0,
      correctCount: 0,
      wrongCount: 0,
      combo: 0,
      maxCombo: 0,
      chaserX: CHASER_INITIAL_X,
      selectedIndex: null,
      revealed: false,
      pendingNextAt: null,
      lastCorrect: null,
      lastGain: 0,
      lastEventStamp: Date.now(),
      level: 1,
      lastLevelUpStamp: 0,
    });
  },

  answer: (selectedIndex) => {
    const s = get();
    if (s.status !== "playing" || s.revealed || !s.question) return;
    const correct =
      selectedIndex !== null && selectedIndex === s.question.answerIndex;
    const now = Date.now();
    const params = getLevelParams(s.correctCount);
    if (correct) {
      const newCombo = s.combo + 1;
      const gain = 1 + s.combo * COMBO_FORWARD_BONUS;
      const newCorrect = s.correctCount + 1;
      const newLevel = getLevelParams(newCorrect).level;
      const leveledUp = newLevel > s.level;
      set({
        revealed: true,
        selectedIndex,
        combo: newCombo,
        maxCombo: Math.max(s.maxCombo, newCombo),
        distance: s.distance + gain,
        correctCount: newCorrect,
        chaserX: Math.max(
          0,
          s.chaserX - (CHASER_REWARD_CORRECT + s.combo * COMBO_PUSHBACK_BONUS),
        ),
        pendingNextAt: now + REVEAL_HOLD_CORRECT_MS,
        lastCorrect: true,
        lastGain: gain,
        lastEventStamp: now,
        level: newLevel,
        lastLevelUpStamp: leveledUp ? now : s.lastLevelUpStamp,
      });
    } else {
      set({
        revealed: true,
        selectedIndex,
        combo: 0,
        wrongCount: s.wrongCount + 1,
        chaserX: s.chaserX + params.wrongPenalty,
        pendingNextAt: now + REVEAL_HOLD_WRONG_MS,
        lastCorrect: false,
        lastGain: 0,
        lastEventStamp: now,
      });
    }
  },

  tick: (deltaMs, now = Date.now()) => {
    const s = get();
    if (s.status !== "playing") return;
    const params = getLevelParams(s.correctCount);
    const nextChaserX = s.chaserX + (params.speed * deltaMs) / 1000;

    if (nextChaserX >= PLAYER_X) {
      set({ status: "over", chaserX: PLAYER_X });
      return;
    }

    if (s.pendingNextAt !== null && now >= s.pendingNextAt) {
      const q = pickRandomQuestion();
      set({
        question: q,
        questionsAsked: s.questionsAsked + 1,
        selectedIndex: null,
        revealed: false,
        pendingNextAt: null,
        chaserX: nextChaserX,
      });
      return;
    }

    set({ chaserX: nextChaserX });
  },

  reset: () =>
    set({
      status: "idle",
      question: null,
      questionsAsked: 0,
      distance: 0,
      correctCount: 0,
      wrongCount: 0,
      combo: 0,
      maxCombo: 0,
      chaserX: CHASER_INITIAL_X,
      selectedIndex: null,
      revealed: false,
      pendingNextAt: null,
      lastCorrect: null,
      lastGain: 0,
      lastEventStamp: 0,
      level: 1,
      lastLevelUpStamp: 0,
    }),
}));
