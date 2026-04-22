import type { Era } from "../types";

const BOSSES: Record<Era, string[]> = {
  고대: ["단군왕검", "광개토대왕", "을지문덕", "김유신", "대조영"],
  고려: ["왕건", "강감찬", "서희", "일연", "공민왕"],
  조선: ["세종대왕", "이순신", "정약용", "정조", "영조"],
  근대: ["안중근", "유관순", "김구", "윤봉길", "헐버트"],
  현대: ["한국사 마스터", "역사의 증인", "시대의 기록자"],
};

export function pickBoss(era: Era): string {
  const pool = BOSSES[era];
  return pool[Math.floor(Math.random() * pool.length)];
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
