import { create } from "zustand";
import { levelFromXp, xpProgressInLevel } from "../utils/xpCurve";
import { useAuthStore } from "../stores/authStore";

type Stats = { strength: number; stamina: number; agility: number; level: number; xp: number };
type Exercise = {
  id: string;
  name: string;
  category: string;
  baseReps: number;
  baseEnergy: number;
  baseXp: number;
  statType: string;
  statGainAmount: number;
  imagePath?: string;
};
type ExerciseProficiency = {
  id: string;
  exerciseId: string;
  proficiency: number; // 0-1000 (new system)
  dailyEnergy: number;
  dailyStatGains: number; // number of stat gains today (max 5)
  lastDailyReset: string;
  totalReps: number;
  Exercise: Exercise;
};

type ResearchUpgrade = {
  id: string;
  userId: string;
  exerciseId: string;
  tier: number;
  isActive: boolean;
  Exercise: Exercise;
};

type Adventure = {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  energyCost: number;
  xpReward: number;
  statReward: { strength: number; stamina: number; agility: number };
  cashReward: number;
  strengthReq: number;
  staminaReq: number;
  canAttempt: boolean;
  userStats: { strength: number; stamina: number; agility: number };
};

type Save = {
  energy: number; 
  xp: number;
  level: number;
  stats: Stats; 
  proficiencyPoints: number;
  cash: number;
  ExerciseProficiencies: ExerciseProficiency[];
  ResearchUpgrades: ResearchUpgrade[];
};

type GameState = Save & {
  exercises: Exercise[];
  adventures: Adventure[];
  spendEnergy: (amt: number) => void;
  addXp: (xp: number) => void;
  addStats: (stats: Partial<Stats>) => void;
  addProficiencyPoints: (pp: number) => void;
  setFromServer: (s: Partial<Save>) => void;
  setExercises: (exercises: Exercise[]) => void;
  getProficiency: (exerciseId: string) => number;
  getDailyStatGains: (exerciseId: string) => number;
  getXpProgress: () => { current: number; needed: number; progress: number };
  getCurrentLevel: () => number;
  getResearchTier: (exerciseId: string) => number;
  upgradeExercise: (exerciseId: string, tier: number) => Promise<void>;
  setAdventures: (adventures: Adventure[]) => void;
  attemptAdventure: (adventureId: string) => Promise<any>;
};

export const useGameStore = create<GameState>((set, get) => ({
  energy: 0, 
  xp: 0, 
  level: 1,
  stats: { strength: 1, stamina: 1, agility: 1, level: 1, xp: 0 }, 
  proficiencyPoints: 0,
  cash: 0,
  ExerciseProficiencies: [],
  ResearchUpgrades: [],
  exercises: [],
  adventures: [],
  
  spendEnergy: (amt) => set((s) => ({ energy: Math.max(0, s.energy - amt) })),
  addXp: (xp) => set((s) => ({ xp: s.xp + xp })),
  addStats: (newStats) => set((s) => ({ 
    stats: { 
      ...s.stats, 
      ...newStats 
    } 
  })),
  addProficiencyPoints: (pp) => set((s) => ({ proficiencyPoints: s.proficiencyPoints + pp })),
  setFromServer: (partial) => set((s) => ({ ...s, ...partial })),
  setExercises: (exercises) => set({ exercises }),
  getProficiency: (exerciseId) => {
    const state = get();
    const proficiency = state.ExerciseProficiencies.find(p => p.exerciseId === exerciseId);
    return proficiency?.proficiency || 0;
  },
  getDailyStatGains: (exerciseId) => {
    const state = get();
    const proficiency = state.ExerciseProficiencies.find(p => p.exerciseId === exerciseId);
    return proficiency?.dailyStatGains || 0;
  },
  getXpProgress: () => {
    const state = get();
    const currentLevel = levelFromXp(state.xp);
    return xpProgressInLevel(state.xp, currentLevel);
  },
  getCurrentLevel: () => {
    const state = get();
    return levelFromXp(state.xp);
  },
  getResearchTier: (exerciseId) => {
    const state = get();
    const upgrade = state.ResearchUpgrades.find(u => u.exerciseId === exerciseId);
    return upgrade?.tier || 0;
  },
  upgradeExercise: async (exerciseId, tier) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      console.error("No token found");
      return;
    }
    
    console.log(`Attempting upgrade: ${exerciseId} to tier ${tier}`);
    
    try {
      const res = await fetch("http://localhost:4000/api/upgrade-exercise", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ exerciseId, tier })
      });
      
      if (!res.ok) {
        const error = await res.json();
        console.error("Upgrade failed:", error);
        alert(`Upgrade failed: ${error.error}`);
        return;
      }
      
      const data = await res.json();
      console.log("Upgrade successful:", data);
      const state = get();
      
      // Update proficiency points
      set({ proficiencyPoints: data.proficiencyPoints });
      
      // Update proficiency for the exercise
      const updatedProficiencies = state.ExerciseProficiencies.map(p => 
        p.exerciseId === exerciseId 
          ? { ...p, proficiency: data.newProficiency }
          : p
      );
      set({ ExerciseProficiencies: updatedProficiencies });
      
      // Reload full game state to get updated research upgrades
      const saveRes = await fetch("http://localhost:4000/api/save", {
        headers: { 
          "Authorization": `Bearer ${useAuthStore.getState().token}`,
          "Content-Type": "application/json"
        }
      });
      if (saveRes.ok) {
        const save = await saveRes.json();
        console.log("Reloaded save data:", save);
        console.log("ResearchUpgrades:", save.ResearchUpgrades);
        console.log("ResearchUpgrades length:", save.ResearchUpgrades?.length);
        set({
          proficiencyPoints: save.proficiencyPoints,
          ResearchUpgrades: save.ResearchUpgrades || []
        });
        console.log("Game state reloaded successfully");
        // Test getResearchTier immediately after setting
        const testTier = get().getResearchTier(exerciseId);
        console.log(`Test getResearchTier for ${exerciseId}:`, testTier);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert(`Network error: ${error.message}`);
    }
  },
  setAdventures: (adventures) => set({ adventures }),
  attemptAdventure: async (adventureId) => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        alert("You must be logged in to attempt adventures");
        return;
      }

      const response = await fetch("http://localhost:4000/api/attempt-adventure", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adventureId }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Adventure failed: ${error.error}`);
        return;
      }

      const data = await response.json();
      
      // Update game state with results
      set((state) => ({
        energy: data.energyAfter,
        xp: data.xpAfter,
        stats: data.statsAfter,
        cash: data.cashAfter,
      }));

      return data;
    } catch (error) {
      console.error("Adventure attempt error:", error);
      alert(`Network error: ${error.message}`);
    }
  },
}));
