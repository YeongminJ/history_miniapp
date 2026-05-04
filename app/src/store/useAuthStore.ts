import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchUserHash } from "../lib/auth";

export type AuthStatus =
  | "idle"
  | "loading"
  | "ok"
  | "unsupported"
  | "invalid_category"
  | "error";

interface AuthState {
  hash: string | null;
  status: AuthStatus;
  lastCheckedAt: number | null;
  init: () => Promise<void>;
}

let inFlight: Promise<void> | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      hash: null,
      status: "idle",
      lastCheckedAt: null,
      init: () => {
        if (inFlight) return inFlight;
        inFlight = (async () => {
          const had = get().hash;
          if (!had) set({ status: "loading" });
          const outcome = await fetchUserHash();
          if (outcome.status === "ok") {
            set({
              hash: outcome.hash,
              status: "ok",
              lastCheckedAt: Date.now(),
            });
          } else {
            set({
              status: outcome.status,
              lastCheckedAt: Date.now(),
            });
          }
          inFlight = null;
        })();
        return inFlight;
      },
    }),
    {
      name: "history-king-auth-v1",
      partialize: (s) => ({ hash: s.hash, status: s.status }),
    },
  ),
);
