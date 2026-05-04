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
  | "no_endpoint";

interface ReminderState {
  enabled: boolean;
  hour: number; // 0-23
  minute: number; // 0-59
  syncStatus: ReminderSyncStatus;
  syncMessage: string | null;
  setEnabled: (enabled: boolean) => Promise<void>;
  setTime: (hour: number, minute: number) => Promise<void>;
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set, get) => {
      const sync = async (overrides?: Partial<Pick<ReminderState, "enabled" | "hour" | "minute">>) => {
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
        const result = next.enabled
          ? await upsertReminder({
              userHash: hash,
              hour: next.hour,
              minute: next.minute,
              timezone: TIMEZONE,
            })
          : await deleteReminder(hash);
        if (result.ok) {
          set({ syncStatus: "ok", syncMessage: null });
        } else {
          set({
            syncStatus: result.reason === "no_endpoint" ? "no_endpoint" : "error",
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
