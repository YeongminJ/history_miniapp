import type { Era } from "../types";

export type FigureRole =
  | "king"
  | "general"
  | "scholar"
  | "monk"
  | "female"
  | "modern"
  | "contemporary";

/**
 * 보스 이름 → 역할(실루엣 아키타입).
 * 여기에 없는 이름은 시대 기본 역할(DEFAULT_ROLE_BY_ERA)을 따른다.
 * 우린 특정 인물의 얼굴을 그리는 게 아니라 "왕/학자/장군…"이라는 역사적 역할을
 * 표현하므로 저작권 이슈가 없다.
 */
export const FIGURE_ROLE: Record<string, FigureRole> = {
  // 고대 ——————————
  단군왕검: "king",
  광개토대왕: "king",
  장수왕: "king",
  소수림왕: "king",
  진흥왕: "king",
  선덕여왕: "female",
  김유신: "general",
  문무왕: "king",
  신문왕: "king",
  경덕왕: "king",
  대조영: "king",
  문왕: "king",
  최치원: "scholar",
  장보고: "general",
  원효: "monk",
  의상: "monk",

  // 고려 ——————————
  왕건: "king",
  광종: "king",
  성종: "king",
  서희: "scholar",
  강감찬: "general",
  윤관: "general",
  묘청: "monk",
  김부식: "scholar",
  의천: "monk",
  지눌: "monk",
  일연: "monk",
  최충헌: "general",
  최우: "general",
  공민왕: "king",
  신돈: "monk",
  최영: "general",
  이성계: "king",
  정도전: "scholar",
  정몽주: "scholar",
  최무선: "scholar",

  // 조선 ——————————
  세종: "king",
  세조: "king",
  조광조: "scholar",
  이황: "scholar",
  이이: "scholar",
  이순신: "general",
  광해군: "king",
  인조: "king",
  효종: "king",
  숙종: "king",
  영조: "king",
  정조: "king",
  정약용: "scholar",
  박지원: "scholar",
  박제가: "scholar",
  홍대용: "scholar",
  이익: "scholar",
  김정희: "scholar",
  김정호: "scholar",
  허준: "scholar",
  장영실: "scholar",
  김홍도: "scholar",
  신윤복: "scholar",
  최제우: "monk",
  흥선대원군: "king",

  // 근대 ——————————
  고종: "king",
  명성황후: "female",
  전봉준: "modern",
  김옥균: "modern",
  박영효: "modern",
  유길준: "modern",
  서재필: "modern",
  최익현: "scholar",
  이상설: "modern",
  안중근: "modern",
  안창호: "modern",
  이승훈: "modern",
  양기탁: "modern",
  손병희: "modern",
  김구: "modern",
  유관순: "female",
  윤봉길: "modern",
  이봉창: "modern",
  김원봉: "modern",
  박은식: "modern",
  신채호: "modern",
  김좌진: "general",
  홍범도: "general",
  지청천: "general",
  조소앙: "modern",
  이육사: "modern",
  윤동주: "modern",
  한용운: "monk",
  주시경: "modern",

  // 현대 ——————————
  여운형: "contemporary",
  김규식: "contemporary",
  이승만: "contemporary",
  박정희: "contemporary",
  전두환: "contemporary",
  노태우: "contemporary",
  김영삼: "contemporary",
  김대중: "contemporary",
  노무현: "contemporary",
  박종철: "contemporary",
  이한열: "contemporary",
  전태일: "contemporary",
};

const DEFAULT_ROLE_BY_ERA: Record<Era, FigureRole> = {
  고대: "king",
  고려: "scholar",
  조선: "king",
  근대: "modern",
  현대: "contemporary",
};

export function roleOf(era: Era, bossName: string): FigureRole {
  return FIGURE_ROLE[bossName] ?? DEFAULT_ROLE_BY_ERA[era];
}
