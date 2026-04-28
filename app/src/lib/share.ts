import { getTossShareLink, share } from "@apps-in-toss/web-framework";
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

export function buildShareMessage(
  args: ShareResultArgs,
  link?: string,
): string | null {
  const q = pickRandom(args.pickFrom);
  if (!q) return null;
  const choices = q.choices
    .map((c, i) => `${["①", "②", "③", "④"][i]} ${c}`)
    .join("  ");
  const header = args.cleared
    ? `🏯 역사왕 · ${args.era} ${args.stageLabel} 클리어!`
    : `🏯 역사왕 · ${args.era} ${args.stageLabel} 도전`;
  const lines = [
    header,
    `👑 ${args.score}점 · 정답률 ${args.accuracy}%`,
    "",
    "이 문제 맞춰볼래?",
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
  const message = buildShareMessage(args, link ?? undefined);
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
