import { appLogin } from "@apps-in-toss/web-framework";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  deleteReminder,
  isReminderEndpointConfigured,
  upsertReminder,
} from "../lib/reminder";
import { useAuthStore } from "./useAuthStore";

const TIMEZONE =
  typeof Intl !== "undefined"
    ? (Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Asia/Seoul")
    : "Asia/Seoul";

export type ReminderSyncStatus =
  | "idle"
  | "syncing"
  | "ok"
  | "error"
  | "no_endpoint"
  | "auth_required";

interface ReminderState {
  enabled: boolean;
  hour: number; // 0-23
  minute: number; // 0-59
  syncStatus: ReminderSyncStatus;
  syncMessage: string | null;
  setEnabled: (enabled: boolean) => Promise<void>;
  setTime: (hour: number, minute: number) => Promise<void>;
}

/**
 * 토스 푸시 라우팅 키(tossUserKey) 발급 — 첫 enable 시 한 번만 필요.
 * `appLogin()`이 토스 로그인 화면을 띄우고, 인가코드를 반환.
 * 사용자가 거부/실패하면 null.
 *
 * **Mutex** — 같은 시점에 두 번 호출돼도 토스 로그인 화면이 두 번 뜨지 않도록.
 */
let _appLoginInflight: Promise<
  { authorizationCode: string; referrer: string } | null
> | null = null;

async function fetchAuthorizationCode(): Promise<
  { authorizationCode: string; referrer: string } | null
> {
  if (typeof appLogin !== "function") return null;
  if (_appLoginInflight) return _appLoginInflight;
  _appLoginInflight = (async () => {
    try {
      const result = await appLogin();
      if (!result?.authorizationCode || !result?.referrer) return null;
      return {
        authorizationCode: result.authorizationCode,
        referrer: result.referrer,
      };
    } catch (err) {
      console.warn("[reminder] appLogin failed", err);
      return null;
    } finally {
      // 인가코드는 10분 만료 — 캐시 안 함. inflight 만 방어.
      _appLoginInflight = null;
    }
  })();
  return _appLoginInflight;
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set, get) => {
      const sync = async (
        overrides?: Partial<Pick<ReminderState, "enabled" | "hour" | "minute">>,
      ) => {
        const next = { ...get(), ...overrides };
        const hash = useAuthStore.getState().hash;
        if (!isReminderEndpointConfigured()) {
          set({ syncStatus: "no_endpoint", syncMessage: null });
          return;
        }
        if (!hash) {
          set({ syncStatus: "error", syncMessage: "사용자 식별 실패" });
          return;
        }
        set({ syncStatus: "syncing", syncMessage: null });

        if (!next.enabled) {
          const result = await deleteReminder(hash);
          if (result.ok) {
            set({ syncStatus: "ok", syncMessage: null });
          } else {
            set({
              syncStatus:
                result.reason === "no_endpoint" ? "no_endpoint" : "error",
              syncMessage: result.message ?? null,
            });
          }
          return;
        }

        // enable 흐름: 1차로 hash만 보냄 → 서버가 toss_user_key 있으면 OK
        let result = await upsertReminder({
          userHash: hash,
          hour: next.hour,
          minute: next.minute,
          timezone: TIMEZONE,
        });

        // 401/auth_required → appLogin 트리거 후 재시도
        if (!result.ok && result.reason === "auth_required") {
          const auth = await fetchAuthorizationCode();
          if (!auth) {
            set({
              syncStatus: "auth_required",
              syncMessage: "토스 로그인이 필요해요",
            });
            return;
          }
          result = await upsertReminder({
            userHash: hash,
            hour: next.hour,
            minute: next.minute,
            timezone: TIMEZONE,
            authorizationCode: auth.authorizationCode,
            referrer: auth.referrer,
          });
        }

        if (result.ok) {
          set({ syncStatus: "ok", syncMessage: null });
        } else {
          set({
            syncStatus:
              result.reason === "no_endpoint"
                ? "no_endpoint"
                : result.reason === "auth_required"
                  ? "auth_required"
                  : "error",
            syncMessage: result.message ?? null,
          });
        }
      };

      return {
        enabled: false,
        hour: 21,
        minute: 0,
        syncStatus: "idle",
        syncMessage: null,
        setEnabled: async (enabled) => {
          set({ enabled });
          await sync({ enabled });
        },
        setTime: async (hour, minute) => {
          set({ hour, minute });
          if (get().enabled) await sync({ hour, minute });
        },
      };
    },
    {
      name: "history-king-reminder-v1",
      partialize: (s) => ({
        enabled: s.enabled,
        hour: s.hour,
        minute: s.minute,
      }),
    },
  ),
);
