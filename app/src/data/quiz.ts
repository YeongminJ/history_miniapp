import ancient from "../../../content/quiz/ancient.json";
import ancient2 from "../../../content/quiz/ancient2.json";
import goryeo from "../../../content/quiz/goryeo.json";
import goryeo2 from "../../../content/quiz/goryeo2.json";
import joseon from "../../../content/quiz/joseon.json";
import joseon2 from "../../../content/quiz/joseon2.json";
import modern from "../../../content/quiz/modern.json";
import modern2 from "../../../content/quiz/modern2.json";
import contemporary from "../../../content/quiz/contemporary.json";
import contemporary2 from "../../../content/quiz/contemporary2.json";
import type { Difficulty, Era, EraFile, Question } from "../types";

const rawFiles = [
  ancient,
  ancient2,
  goryeo,
  goryeo2,
  joseon,
  joseon2,
  modern,
  modern2,
  contemporary,
  contemporary2,
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
