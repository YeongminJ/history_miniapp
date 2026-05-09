import { getTossShareLink, share } from "@apps-in-toss/web-framework";
import { useAuthStore } from "../store/useAuthStore";
import type { Question } from "../types";

const APP_DEEPLINK = "intoss://my-history-king";
const APP_OG_IMAGE =
  "https://static.toss.im/appsintoss/36039/7172327e-9dc5-4efe-98a9-94bfa8072722.png";

export interface ShareResultArgs {
  era: string;
  stageLabel: string;
  cleared: boolean;
  score: number;
  accuracy: number;
  pickFrom: Question[];
}

function pickRandom<T>(list: T[]): T | null {
  if (list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}

/** "홍길동" → "홍길동", "김철수님" → "김철수" 같이 정리. 공백 제거. */
function sanitizeName(name: string | null | undefined): string | null {
  if (!name) return null;
  const trimmed = name.trim().replace(/님$/, "");
  return trimmed.length > 0 ? trimmed : null;
}

export function buildShareMessage(
  args: ShareResultArgs,
  link?: string,
  name?: string | null,
): string | null {
  const q = pickRandom(args.pickFrom);
  if (!q) return null;
  const choices = q.choices
    .map((c, i) => `${["①", "②", "③", "④"][i]} ${c}`)
    .join("  ");
  const cleanName = sanitizeName(name);
  const subject = cleanName ? `${cleanName}님` : "내";
  const header = args.cleared
    ? `🏯 ${subject} 역사왕 · ${args.era} ${args.stageLabel} 클리어!`
    : `🏯 ${subject} 역사왕 · ${args.era} ${args.stageLabel} 도전`;
  const cta = cleanName
    ? `이 문제 ${cleanName}님보다 잘 맞출 수 있어?`
    : "이 문제 맞춰볼래?";
  const lines = [
    header,
    `👑 ${args.score}점 · 정답률 ${args.accuracy}%`,
    "",
    cta,
    `"${q.question}"`,
    choices,
    "",
    "👇 한 번에 도전하기",
  ];
  if (link) lines.push(link);
  return lines.join("\n");
}

async function safeGetTossShareLink(): Promise<string | null> {
  if (typeof getTossShareLink !== "function") return null;
  try {
    return await getTossShareLink(APP_DEEPLINK, APP_OG_IMAGE);
  } catch (err) {
    console.warn("[share] getTossShareLink failed", err);
    return null;
  }
}

export async function shareResult(args: ShareResultArgs): Promise<boolean> {
  const link = await safeGetTossShareLink();
  const name = useAuthStore.getState().name;
  const message = buildShareMessage(args, link ?? undefined, name);
  if (!message) return false;
  if (import.meta.env.DEV) {
    console.debug("[share]", message);
  }
  if (typeof share !== "function") {
    return false;
  }
  try {
    await share({ message });
    return true;
  } catch (err) {
    console.warn("[share] failed", err);
    return false;
  }
}
