import type { FigureRole } from "../data/roles";

export type BeardStyle = "none" | "short" | "long" | "forked";
export type AccessoryType = "none" | "sword" | "fan" | "scroll" | "staff" | "pipe";

export interface BossVariant {
  /** 의상(저고리/도포/갑옷/슈트) 본체 색 */
  bodyColor: string;
  /** 보조 색 — 깃·트림·소매선 등에 사용 */
  trimColor: string;
  /** 수염 스타일 (왕·장군·학자만 의미 있음) */
  beard: BeardStyle;
  /** 우측에 든 액세서리 */
  accessory: AccessoryType;
}

/** 결정론적 문자열 해시 (간단·빠름). 같은 이름 → 항상 같은 해시. */
function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const BODY_PALETTES: Record<FigureRole, string[]> = {
  king: ["#3E2723", "#4A148C", "#1A237E", "#0D5C2E", "#7B1818"],
  general: ["#1C313A", "#263238", "#1A2A33", "#2E1A1A", "#142D27"],
  scholar: ["#ECEFF1", "#E3F2FD", "#FFF8E1", "#E8F5E9", "#F3E5F5"],
  monk: ["#8B5E3C", "#6D4C41", "#9E5C2B", "#7A4A2A", "#5D4037"],
  female: ["#C62828", "#AD1457", "#1565C0", "#2E7D32", "#E65100"],
  modern: ["#ECEFF1", "#E0E0E0", "#D7CCC8", "#CFD8DC", "#EEEEEE"],
  contemporary: ["#1A237E", "#212121", "#263238", "#1B5E20", "#3E2723"],
};

const TRIM_PALETTES: Record<FigureRole, string[]> = {
  king: ["#FFB300", "#E91E63", "#FFD54F", "#FFA000", "#F57F17"],
  general: ["#90A4AE", "#B0BEC5", "#FF8A65", "#FFD54F", "#90CAF9"],
  scholar: ["#263238", "#1B0000", "#37474F", "#3E2723", "#1A237E"],
  monk: ["#FFB300", "#FFA000", "#FF8F00", "#F57F17", "#FFD54F"],
  female: ["#4A148C", "#1A237E", "#263238", "#3E2723", "#1B5E20"],
  modern: ["#1B0000", "#37474F", "#263238", "#3E2723", "#212121"],
  contemporary: ["#FFFFFF", "#E0E0E0", "#FFE082", "#90CAF9", "#A5D6A7"],
};

const BEARDED_ROLES: FigureRole[] = ["king", "general", "scholar"];
const BEARDS: BeardStyle[] = ["short", "long", "forked", "none"];

const ACCESSORY_BY_ROLE: Record<FigureRole, AccessoryType[]> = {
  king: ["scroll", "none"],
  general: ["sword", "sword", "none"],
  scholar: ["fan", "scroll", "scroll", "none"],
  monk: ["staff", "none"],
  female: ["fan", "none"],
  modern: ["pipe", "scroll", "none"],
  contemporary: ["scroll", "none"],
};

export function getBossVariant(name: string, role: FigureRole): BossVariant {
  const h = hashName(name);
  const bodyPalette = BODY_PALETTES[role];
  const trimPalette = TRIM_PALETTES[role];
  const accessoryPool = ACCESSORY_BY_ROLE[role];

  const bodyColor = bodyPalette[h % bodyPalette.length]!;
  const trimColor =
    trimPalette[Math.floor(h / 7) % trimPalette.length]!;
  const beard = BEARDED_ROLES.includes(role)
    ? BEARDS[Math.floor(h / 13) % BEARDS.length]!
    : "none";
  const accessory =
    accessoryPool[Math.floor(h / 17) % accessoryPool.length]!;

  return { bodyColor, trimColor, beard, accessory };
}
