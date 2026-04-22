import { create } from "zustand";
import type { Era, Screen } from "../types";

interface AppState {
  screen: Screen;
  selectedEra: Era | null;
  selectedStageIndex: number;
  navigate: (screen: Screen) => void;
  selectEra: (era: Era) => void;
  selectStage: (stageIndex: number) => void;
  goHome: () => void;
  backToStages: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  screen: "home",
  selectedEra: null,
  selectedStageIndex: 0,
  navigate: (screen) => set({ screen }),
  selectEra: (era) => set({ selectedEra: era, screen: "stage" }),
  selectStage: (stageIndex) =>
    set({ selectedStageIndex: stageIndex, screen: "battle" }),
  goHome: () =>
    set({ screen: "home", selectedEra: null, selectedStageIndex: 0 }),
  backToStages: () => set({ screen: "stage" }),
}));
