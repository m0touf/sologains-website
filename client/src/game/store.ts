import { create } from "zustand";

type Stats = { strength: number; stamina: number; agility: number };
type Save = {
  energy: number; xp: number;
  stats: Stats; spriteStage: number;
};

type GameState = Save & {
  spendEnergy: (amt: number) => void;
  addXp: (xp: number) => void;
  addStats: (stats: Partial<Stats>) => void;
  setFromServer: (s: Partial<Save>) => void;
};

export const useGameStore = create<GameState>((set) => ({
  energy: 0, xp: 0, stats: { strength: 1, stamina: 1, agility: 1 }, spriteStage: 0,
  spendEnergy: (amt) => set((s) => ({ energy: Math.max(0, s.energy - amt) })),
  addXp: (xp) => set((s) => ({ xp: s.xp + xp })),
  addStats: (newStats) => set((s) => ({ 
    stats: { 
      ...s.stats, 
      ...newStats 
    } 
  })),
  setFromServer: (partial) => set((s) => ({ ...s, ...partial })),
}));
