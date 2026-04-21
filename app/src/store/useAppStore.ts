import { create } from "zustand";
import type { Era, Screen } from "../types";

interface AppState {
  screen: Screen;
  selectedEra: Era | null;
  navigate: (screen: Screen) => void;
  startChapter: (era: Era) => void;
  goHome: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  screen: "home",
  selectedEra: null,
  navigate: (screen) => set({ screen }),
  startChapter: (era) => set({ selectedEra: era, screen: "battle" }),
  goHome: () => set({ screen: "home", selectedEra: null }),
}));
