import ancient from "../../../content/quiz/ancient.json";
import ancient2 from "../../../content/quiz/ancient2.json";
import ancient3 from "../../../content/quiz/ancient3.json";
import ancient4 from "../../../content/quiz/ancient4.json";
import goryeo from "../../../content/quiz/goryeo.json";
import goryeo2 from "../../../content/quiz/goryeo2.json";
import goryeo3 from "../../../content/quiz/goryeo3.json";
import goryeo4 from "../../../content/quiz/goryeo4.json";
import joseon from "../../../content/quiz/joseon.json";
import joseon2 from "../../../content/quiz/joseon2.json";
import joseon3 from "../../../content/quiz/joseon3.json";
import joseon4 from "../../../content/quiz/joseon4.json";
import joseon5 from "../../../content/quiz/joseon5.json";
import modern from "../../../content/quiz/modern.json";
import modern2 from "../../../content/quiz/modern2.json";
import modern3 from "../../../content/quiz/modern3.json";
import modern4 from "../../../content/quiz/modern4.json";
import contemporary from "../../../content/quiz/contemporary.json";
import contemporary2 from "../../../content/quiz/contemporary2.json";
import contemporary3 from "../../../content/quiz/contemporary3.json";
import contemporary4 from "../../../content/quiz/contemporary4.json";
import contemporary5 from "../../../content/quiz/contemporary5.json";
import type { Difficulty, Era, EraFile, Question } from "../types";
import type { StageDef } from "./stages";

const DIFFICULTY_ORDER: Difficulty[] = ["easy", "medium", "hard"];

const rawFiles = [
  ancient,
  ancient2,
  ancient3,
  ancient4,
  goryeo,
  goryeo2,
  goryeo3,
  goryeo4,
  joseon,
  joseon2,
  joseon3,
  joseon4,
  joseon5,
  modern,
  modern2,
  modern3,
  modern4,
  contemporary,
  contemporary2,
  contemporary3,
  contemporary4,
  contemporary5,
] as unknown as EraFile[];

export const allQuestions: Question[] = rawFiles.flatMap((f) => f.questions);

export const byEra: Record<Era, Question[]> = {
  고대: rawFiles
    .filter((f) => f.era === "고대")
    .flatMap((f) => f.questions),
  고려: rawFiles
    .filter((f) => f.era === "고려")
    .flatMap((f) => f.questions),
  조선: rawFiles
    .filter((f) => f.era === "조선")
    .flatMap((f) => f.questions),
  근대: rawFiles
    .filter((f) => f.era === "근대")
    .flatMap((f) => f.questions),
  현대: rawFiles
    .filter((f) => f.era === "현대")
    .flatMap((f) => f.questions),
};

export const ERAS: Array<{
  era: Era;
  range: string;
  emoji: string;
  color: string;
}> = [
  { era: "고대", range: "선사 ~ 남북국", emoji: "🗿", color: "#8D6E63" },
  { era: "고려", range: "918 ~ 1392", emoji: "🏯", color: "#6A1B9A" },
  { era: "조선", range: "1392 ~ 1863", emoji: "👑", color: "#5D4037" },
  { era: "근대", range: "1876 ~ 1945", emoji: "⚔️", color: "#B71C1C" },
  { era: "현대", range: "1945 ~", emoji: "🎌", color: "#1565C0" },
];

/**
 * 특정 시대·난이도에서 N개 문제를 무작위 선정.
 */
export function pickQuestions(
  era: Era,
  difficulty: Difficulty | "all",
  count: number,
  excludeIds: Set<string> = new Set(),
): Question[] {
  const pool = byEra[era].filter(
    (q) =>
      !excludeIds.has(q.id) &&
      (difficulty === "all" || q.difficulty === difficulty),
  );
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * 스테이지의 난이도 프로필에 맞춰 문제를 선정하고,
 * 쉬움 → 보통 → 어려움 순서로 정렬해 반환.
 */
export function pickStageQuestions(
  era: Era,
  stage: StageDef,
): Question[] {
  const picked: Question[] = [];
  const used = new Set<string>();
  for (const difficulty of DIFFICULTY_ORDER) {
    const count = stage.profile[difficulty];
    if (count <= 0) continue;
    const chunk = pickQuestions(era, difficulty, count, used);
    chunk.forEach((q) => used.add(q.id));
    picked.push(...chunk);
  }
  // difficulty 기준 안정 정렬 (easy→medium→hard)
  return picked.sort(
    (a, b) =>
      DIFFICULTY_ORDER.indexOf(a.difficulty) -
      DIFFICULTY_ORDER.indexOf(b.difficulty),
  );
}
