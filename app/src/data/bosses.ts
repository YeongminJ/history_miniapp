import { byEra } from "./quiz";
import type { StageDef } from "./stages";
import type { Difficulty, Era, Question } from "../types";

const DIFFICULTY_ORDER: Difficulty[] = ["easy", "medium", "hard"];

/**
 * 시대별 보스 후보. 태그·질문·해설에 이름이 등장하는 인물 위주.
 * 여기 명시된 이름은 질문 태그에서 바로 인식될 수 있어야 해요.
 */
const FIGURE_POOL: Record<Era, string[]> = {
  고대: [
    "단군왕검",
    "광개토대왕",
    "장수왕",
    "소수림왕",
    "진흥왕",
    "선덕여왕",
    "김유신",
    "문무왕",
    "신문왕",
    "경덕왕",
    "대조영",
    "문왕",
    "최치원",
    "장보고",
    "원효",
    "의상",
  ],
  고려: [
    "왕건",
    "광종",
    "성종",
    "서희",
    "강감찬",
    "윤관",
    "묘청",
    "김부식",
    "의천",
    "지눌",
    "일연",
    "최충헌",
    "최우",
    "공민왕",
    "신돈",
    "최영",
    "이성계",
    "정도전",
    "정몽주",
    "최무선",
  ],
  조선: [
    "세종",
    "세조",
    "성종",
    "조광조",
    "이황",
    "이이",
    "이순신",
    "광해군",
    "인조",
    "효종",
    "숙종",
    "영조",
    "정조",
    "정약용",
    "박지원",
    "박제가",
    "홍대용",
    "이익",
    "김정희",
    "김정호",
    "허준",
    "장영실",
    "김홍도",
    "신윤복",
    "최제우",
    "흥선대원군",
  ],
  근대: [
    "고종",
    "명성황후",
    "전봉준",
    "김옥균",
    "박영효",
    "유길준",
    "서재필",
    "최익현",
    "이상설",
    "안중근",
    "안창호",
    "이승훈",
    "양기탁",
    "손병희",
    "김구",
    "유관순",
    "윤봉길",
    "이봉창",
    "김원봉",
    "박은식",
    "신채호",
    "김좌진",
    "홍범도",
    "지청천",
    "조소앙",
    "이육사",
    "윤동주",
    "한용운",
    "주시경",
  ],
  현대: [
    "여운형",
    "김구",
    "김규식",
    "이승만",
    "박정희",
    "전두환",
    "노태우",
    "김영삼",
    "김대중",
    "노무현",
    "박종철",
    "이한열",
    "전태일",
  ],
};

const figureQuestionsCache = new Map<string, Question[]>();

function matchesFigure(q: Question, figure: string): boolean {
  if (q.tags.includes(figure)) return true;
  if (q.question.includes(figure)) return true;
  if (q.explanation.includes(figure)) return true;
  return false;
}

function getFigureQuestions(era: Era, figure: string): Question[] {
  const key = `${era}|${figure}`;
  const cached = figureQuestionsCache.get(key);
  if (cached) return cached;
  const list = byEra[era].filter((q) => matchesFigure(q, figure));
  figureQuestionsCache.set(key, list);
  return list;
}

function tryBuildStage(
  era: Era,
  figure: string,
  stage: StageDef,
): Question[] | null {
  const pool = getFigureQuestions(era, figure);
  if (pool.length === 0) return null;
  const picked: Question[] = [];
  const used = new Set<string>();
  for (const difficulty of DIFFICULTY_ORDER) {
    const count = stage.profile[difficulty];
    if (count <= 0) continue;
    const matching = pool.filter(
      (q) => q.difficulty === difficulty && !used.has(q.id),
    );
    if (matching.length < count) return null;
    const shuffled = [...matching].sort(() => Math.random() - 0.5);
    const taken = shuffled.slice(0, count);
    taken.forEach((q) => used.add(q.id));
    picked.push(...taken);
  }
  return picked.sort(
    (a, b) =>
      DIFFICULTY_ORDER.indexOf(a.difficulty) -
      DIFFICULTY_ORDER.indexOf(b.difficulty),
  );
}

/**
 * 스테이지에 맞는 보스와 문제를 함께 선정.
 * 1) 해당 시대 인물 풀을 셔플
 * 2) 인물별로 스테이지 난이도 프로필을 만족할 수 있는지 시도
 * 3) 첫 번째로 만족하는 인물을 보스로 지정
 * 4) 아무도 못 만족하면 시대 아키타입 이름으로 fallback
 */
export function pickBossAndQuestions(
  era: Era,
  stage: StageDef,
): { name: string; questions: Question[]; fallback: boolean } {
  const shuffled = [...FIGURE_POOL[era]].sort(() => Math.random() - 0.5);
  for (const figure of shuffled) {
    const questions = tryBuildStage(era, figure, stage);
    if (questions) {
      return { name: figure, questions, fallback: false };
    }
  }
  // fallback: generic archetype + free pool
  const fallbackName = `${era}의 수호자`;
  const genericPicked: Question[] = [];
  const used = new Set<string>();
  for (const difficulty of DIFFICULTY_ORDER) {
    const count = stage.profile[difficulty];
    if (count <= 0) continue;
    const pool = byEra[era].filter(
      (q) => q.difficulty === difficulty && !used.has(q.id),
    );
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
    const taken = shuffledPool.slice(0, count);
    taken.forEach((q) => used.add(q.id));
    genericPicked.push(...taken);
  }
  return {
    name: fallbackName,
    questions: genericPicked.sort(
      (a, b) =>
        DIFFICULTY_ORDER.indexOf(a.difficulty) -
        DIFFICULTY_ORDER.indexOf(b.difficulty),
    ),
    fallback: true,
  };
}

export const ERA_BOSS_EMOJI: Record<Era, string> = {
  고대: "🗿",
  고려: "🏯",
  조선: "👑",
  근대: "⚔️",
  현대: "🎌",
};

export interface EraTheme {
  bgGradient: string;
  accent: string;
  frameBorder: string;
  frameGlow: string;
  nameBg: string;
}

export const ERA_THEME: Record<Era, EraTheme> = {
  고대: {
    bgGradient:
      "radial-gradient(ellipse at 50% 0%, #5D4037 0%, #1B0000 75%, #000 100%)",
    accent: "#FFB300",
    frameBorder: "#8D6E63",
    frameGlow: "rgba(255, 179, 0, 0.5)",
    nameBg: "#3E2723",
  },
  고려: {
    bgGradient:
      "radial-gradient(ellipse at 50% 0%, #4A148C 0%, #1A0033 80%, #000 100%)",
    accent: "#E1BEE7",
    frameBorder: "#9575CD",
    frameGlow: "rgba(225, 190, 231, 0.5)",
    nameBg: "#311B92",
  },
  조선: {
    bgGradient:
      "radial-gradient(ellipse at 50% 0%, #37474F 0%, #102027 80%, #000 100%)",
    accent: "#FFC107",
    frameBorder: "#BDBDBD",
    frameGlow: "rgba(255, 193, 7, 0.55)",
    nameBg: "#263238",
  },
  근대: {
    bgGradient:
      "radial-gradient(ellipse at 50% 0%, #0D47A1 0%, #000051 80%, #000 100%)",
    accent: "#FF5252",
    frameBorder: "#5472D3",
    frameGlow: "rgba(255, 82, 82, 0.5)",
    nameBg: "#002171",
  },
  현대: {
    bgGradient:
      "radial-gradient(ellipse at 50% 0%, #006064 0%, #00131A 80%, #000 100%)",
    accent: "#00E5FF",
    frameBorder: "#4DD0E1",
    frameGlow: "rgba(0, 229, 255, 0.55)",
    nameBg: "#004D40",
  },
};
