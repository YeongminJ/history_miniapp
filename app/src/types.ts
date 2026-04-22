export type Difficulty = "easy" | "medium" | "hard";
export type Era = "고대" | "고려" | "조선" | "근대" | "현대";
export type EraPrefix = "A" | "G" | "J" | "M" | "C";

export interface Question {
  id: string;
  period: string;
  tags: string[];
  difficulty: Difficulty;
  question: string;
  choices: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface EraFile {
  era: Era;
  prefix: EraPrefix;
  totalQuestions: number;
  difficultyCount: Record<Difficulty, number>;
  questions: Question[];
}

export interface AnswerRecord {
  question: Question;
  selectedIndex: number | null;
  correct: boolean;
  timeMs: number;
}

export type Screen = "home" | "chapter" | "stage" | "battle" | "result";
