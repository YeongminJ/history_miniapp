// 학습 리마인더 (기능성 푸시) 백엔드 연동.
// 백엔드는 mTLS로 토스 sendMessage API를 호출하므로 클라이언트는 일반 https로 우리 서버에만 접근.
//
// 토스 콘솔 승인된 기능성 메시지 템플릿 코드 (백엔드에서 sendMessage 호출 시 사용):
//   - my-history-king-quiz-time
//   - my-history-king-today
// (템플릿 선택/로테이션은 백엔드 책임. 클라이언트는 hash·시간만 전달.)
//
// 라우팅 키 — 토스 sendMessage는 `getAnonymousKey` 익명 hash로는 라우팅 안 됨.
// `appLogin()` OAuth로 발급한 userKey 만 인정. 첫 enable 시 클라가 인가코드를
// 함께 보내면 서버가 토스 OAuth 교환 → tossUserKey 저장 → 이후 cron 발송 가능.

const BASE = (
  (import.meta.env.VITE_REMINDER_API_BASE as string | undefined) ?? ""
).replace(/\/$/, "");

export interface ReminderPayload {
  userHash: string;
  hour: number; // 0-23
  minute: number; // 0-59
  timezone: string; // e.g., "Asia/Seoul"
  /** 첫 enable 시 `appLogin()` 결과를 함께 보냄. */
  authorizationCode?: string;
  referrer?: string;
}

export type ReminderResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "no_endpoint"
        | "network"
        | "server"
        | "auth_required"
        | "auth_failed";
      status?: number;
      message?: string;
    };

function endpointReady(): boolean {
  return BASE.length > 0;
}

export async function upsertReminder(
  payload: ReminderPayload,
): Promise<ReminderResult> {
  if (!endpointReady()) return { ok: false, reason: "no_endpoint" };
  try {
    const res = await fetch(`${BASE}/reminders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) return { ok: true };
    // 서버가 구조화된 에러 반환 시 reason 매핑
    const data = (await res.json().catch(() => null)) as
      | { reason?: string; message?: string }
      | null;
    if (data?.reason === "auth_required") {
      return {
        ok: false,
        reason: "auth_required",
        status: res.status,
        message: data.message ?? undefined,
      };
    }
    if (data?.reason === "auth_failed") {
      return {
        ok: false,
        reason: "auth_failed",
        status: res.status,
        message: data.message ?? undefined,
      };
    }
    return {
      ok: false,
      reason: "server",
      status: res.status,
      message: data?.message ?? undefined,
    };
  } catch (err) {
    return {
      ok: false,
      reason: "network",
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function deleteReminder(userHash: string): Promise<ReminderResult> {
  if (!endpointReady()) return { ok: false, reason: "no_endpoint" };
  try {
    const res = await fetch(
      `${BASE}/reminders/${encodeURIComponent(userHash)}`,
      { method: "DELETE" },
    );
    if (!res.ok) {
      return {
        ok: false,
        reason: "server",
        status: res.status,
        message: await res.text().catch(() => undefined),
      };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      reason: "network",
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

export function isReminderEndpointConfigured(): boolean {
  return endpointReady();
}
