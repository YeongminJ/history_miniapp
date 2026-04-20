export type Difficulty = 'easy' | 'medium' | 'hard';

export type Era = '고대' | '고려' | '조선' | '근대' | '현대';

export type EraPrefix = 'A' | 'G' | 'J' | 'M' | 'C';

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

export interface EraMeta {
  era: Era;
  prefix: EraPrefix;
  file: string;
  range: string;
  totalQuestions: number;
  difficultyCount: Record<Difficulty, number>;
}

export interface QuizIndex {
  version: string;
  language: 'ko';
  topic: '한국사';
  totalQuestions: number;
  difficultyDistribution: Record<Difficulty, number>;
  eras: EraMeta[];
}
