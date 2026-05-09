/**
 * 푸시 알림 백엔드(history-king-noti-api) 클라이언트.
 * 실패해도 게임 흐름에 영향 없도록 모두 best-effort.
 *
 * 사용자 등록·시간 변경은 `useReminderStore` 가 담당 (`POST /reminders` + 토스 OAuth).
 * 이 파일은 보조 호출 (스트릭 갱신 등) 만 다뤄요.
 */

const DEFAULT_BASE = "https://history-king-noti-api.hohostd.workers.dev";
const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? DEFAULT_BASE;

/**
 * 스트릭 카운터 갱신. `userHash` 는 `getAnonymousKey()` 결과 (DB users.user_key PK).
 * 클리어 시점에 호출하면 cron 의 streak_warn 발송 판단에 쓰여요.
 */
export async function recordPlay(userHash: string): Promise<boolean> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/users/${encodeURIComponent(userHash)}/play`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      },
    );
    return res.ok;
  } catch (err) {
    console.warn("[api] recordPlay failed", err);
    return false;
  }
}

/** 현재 KST 분(0~1439). 모달의 기본 시간으로 사용. */
export function getCurrentKstMinute(): number {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
  const [h, m] = fmt.split(":").map(Number);
  return h * 60 + m;
}

/** 분(0~1439) → "HH:MM" */
export function minuteToHHMM(minute: number): string {
  const h = Math.floor(minute / 60).toString().padStart(2, "0");
  const m = (minute % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/** "HH:MM" → 분(0~1439) */
export function hhmmToMinute(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}
