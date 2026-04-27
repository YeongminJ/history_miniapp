import { share } from "@apps-in-toss/web-framework";
import type { Question } from "../types";

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

export function buildShareMessage(args: ShareResultArgs): string | null {
  const q = pickRandom(args.pickFrom);
  if (!q) return null;
  const choices = q.choices
    .map((c, i) => `${["①", "②", "③", "④"][i]} ${c}`)
    .join("  ");
  const header = args.cleared
    ? `🏯 역사왕 · ${args.era} ${args.stageLabel} 클리어!`
    : `🏯 역사왕 · ${args.era} ${args.stageLabel} 도전`;
  return [
    header,
    `👑 ${args.score}점 · 정답률 ${args.accuracy}%`,
    "",
    "이 문제 맞춰볼래?",
    `"${q.question}"`,
    choices,
    "",
    `토스에서 "역사왕" 검색하고 도전!`,
  ].join("\n");
}

export async function shareResult(args: ShareResultArgs): Promise<boolean> {
  const message = buildShareMessage(args);
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
