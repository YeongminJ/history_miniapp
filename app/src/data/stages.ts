import type { Difficulty, Era } from "../types";

export interface StageDef {
  index: number;
  label: string;
  profile: Record<Difficulty, number>;
  minCorrectToClear: number;
  boss: boolean;
}

export const STAGES_PER_ERA = 5;
export const QUESTIONS_PER_STAGE = 5;

/**
 * 5개 스테이지 공통 난이도 프로필.
 * Stage 1 → 쉬움만, Stage 5 → 어려움 위주(보스).
 */
export const STAGE_DEFS: StageDef[] = [
  {
    index: 0,
    label: "입문",
    profile: { easy: 5, medium: 0, hard: 0 },
    minCorrectToClear: 3,
    boss: false,
  },
  {
    index: 1,
    label: "수련",
    profile: { easy: 4, medium: 1, hard: 0 },
    minCorrectToClear: 3,
    boss: false,
  },
  {
    index: 2,
    label: "격전",
    profile: { easy: 2, medium: 3, hard: 0 },
    minCorrectToClear: 3,
    boss: false,
  },
  {
    index: 3,
    label: "정예전",
    profile: { easy: 0, medium: 3, hard: 2 },
    minCorrectToClear: 3,
    boss: false,
  },
  {
    index: 4,
    label: "보스전",
    profile: { easy: 0, medium: 1, hard: 4 },
    minCorrectToClear: 4,
    boss: true,
  },
];

export function stageTitle(stage: StageDef): string {
  return `Stage ${stage.index + 1} · ${stage.label}`;
}

export function getStage(stageIndex: number): StageDef {
  const s = STAGE_DEFS[stageIndex];
  if (!s) throw new Error(`Invalid stage index: ${stageIndex}`);
  return s;
}

export function isEraUnlocked(
  _era: Era,
  _clearedStages: Record<Era, number[]>,
): boolean {
  // 현재는 모든 시대 열려 있음. 스테이지 내부에서만 잠금.
  return true;
}

export function isStageUnlocked(
  era: Era,
  stageIndex: number,
  clearedStages: Record<Era, number[]>,
): boolean {
  if (stageIndex === 0) return true;
  const cleared = clearedStages[era] ?? [];
  return cleared.includes(stageIndex - 1);
}

export function eraClearProgress(
  era: Era,
  clearedStages: Record<Era, number[]>,
): { cleared: number; total: number } {
  const cleared = clearedStages[era] ?? [];
  return { cleared: cleared.length, total: STAGES_PER_ERA };
}
