import { create } from "zustand";
import { persist } from "zustand/middleware";

const RE_PROMPT_AFTER = 5;

type Status = "unprompted" | "registered" | "dismissed";

interface NotificationState {
  status: Status;
  /** 서버에 등록한 KST 분(0~1439). null이면 미등록. */
  reminderMinute: number | null;
  /** dismissed 후 결과 화면 도달 횟수. RE_PROMPT_AFTER 도달 시 다시 prompt. */
  resultsSinceDismiss: number;

  markRegistered: (reminderMinute: number) => void;
  markDismissed: () => void;
  /** 결과 화면 진입 시 호출. true 반환 시 prompt 표시. */
  shouldPromptOnResult: () => boolean;
  reset: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      status: "unprompted",
      reminderMinute: null,
      resultsSinceDismiss: 0,

      markRegistered: (reminderMinute) =>
        set({ status: "registered", reminderMinute, resultsSinceDismiss: 0 }),

      markDismissed: () =>
        set({ status: "dismissed", resultsSinceDismiss: 0 }),

      shouldPromptOnResult: () => {
        const s = get();
        if (s.status === "registered") return false;
        if (s.status === "unprompted") return true;
        // dismissed
        const next = s.resultsSinceDismiss + 1;
        if (next >= RE_PROMPT_AFTER) {
          return true;
        }
        set({ resultsSinceDismiss: next });
        return false;
      },

      reset: () =>
        set({
          status: "unprompted",
          reminderMinute: null,
          resultsSinceDismiss: 0,
        }),
    }),
    {
      name: "history-king-notification-v1",
    },
  ),
);
