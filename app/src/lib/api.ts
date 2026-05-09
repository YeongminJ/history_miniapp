/**
 * 푸시 알림 백엔드(history-king-noti-api) 클라이언트.
 * 실패해도 게임 흐름에 영향 없도록 모두 best-effort.
 */
import { appLogin } from "@apps-in-toss/web-framework";
import { useNotificationStore } from "../store/useNotificationStore";

const DEFAULT_BASE = "https://history-king-noti-api.hohostd.workers.dev";
const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? DEFAULT_BASE;

/**
 * 토스 로그인 → 우리 서버에 인가코드 교환 → 푸시 라우팅용 userKey 반환.
 *
 * 푸시(스마트 발송)는 토스 로그인 사용자에게만 발송 가능. `getAnonymousKey()`로는
 * 라우팅 안 됨.
 *
 * - 이미 로그인해 캐시된 userKey가 있으면 즉시 반환 (login 화면 안 띄움)
 * - 캐시 없으면 `appLogin()` 호출 → 토스 로그인 화면으로 이동 → 돌아오면 인가코드로
 *   서버 교환 → 받은 userKey 캐시 후 반환
 * - 실패(거절/네트워크 등) 시 null 반환
 */
export async function ensureUserKey(): Promise<string | null> {
  const cached = useNotificationStore.getState().userKey;
  if (cached) return cached;
  try {
    const { authorizationCode, referrer } = await appLogin();
    const res = await fetch(`${BASE_URL}/api/auth/exchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorizationCode, referrer }),
    });
    if (!res.ok) {
      console.warn("[api] auth/exchange failed", res.status);
      return null;
    }
    const data = (await res.json()) as { userKey?: string };
    if (!data.userKey) {
      console.warn("[api] auth/exchange returned no userKey", data);
      return null;
    }
    useNotificationStore.getState().setUserKey(data.userKey);
    return data.userKey;
  } catch (err) {
    console.warn("[api] toss login flow failed", err);
    return null;
  }
}

interface RegisterUserInput {
  userKey: string;
  reminderMinute: number | null;
  dailyEnabled?: boolean;
  streakWarnEnabled?: boolean;
}

export async function registerUser(input: RegisterUserInput): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dailyEnabled: true,
        streakWarnEnabled: true,
        ...input,
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn("[api] registerUser failed", err);
    return false;
  }
}

export async function recordPlay(userKey: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/users/${encodeURIComponent(userKey)}/play`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    return res.ok;
  } catch (err) {
    console.warn("[api] recordPlay failed", err);
    return false;
  }
}

export async function unregisterUser(userKey: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/users`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userKey }),
    });
    return res.ok;
  } catch (err) {
    console.warn("[api] unregisterUser failed", err);
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
