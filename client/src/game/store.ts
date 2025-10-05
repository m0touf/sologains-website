import { create } from "zustand";
import { levelFromXp, xpProgressInLevel } from "../utils/xpCurve";
import { useAuthStore } from "../stores/authStore";

type Stats = { strength: number; stamina: number; mobility: number; level: number; xp: number };
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

type ResearchBenefit = {
  id: string;
  name: string;
  description: string;
  type: 'monetary' | 'energy' | 'stat' | 'bonus' | 'xp' | 'adventure' | 'utility' | 'quality';
  value: number;
  isPercentage: boolean;
  category: 'strength' | 'endurance' | 'mobility';
};


type AvailableResearch = {
  exercise: {
    id: string;
    name: string;
    category: string;
  };
  proficiency: number;
  currentTier: number;
  availableTiers: {
    tier: number;
    cost: number;
    benefits: ResearchBenefit[];
    canUnlock: boolean;
  }[];
};

type ResearchUpgrade = {
  id: string;
  userId: string;
  exerciseId: string;
  tier: number;
  isActive: boolean;
  Exercise: Exercise;
  benefits?: ResearchBenefit[];
};

type Adventure = {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  energyCost: number;
  xpReward: number;
  statReward: { strength: number; stamina: number; mobility: number };
  cashReward: number;
  strengthReq: number;
  staminaReq: number;
  canAttempt: boolean;
  userStats: { strength: number; stamina: number; mobility: number };
  durationMinutes: number;
};

type Save = {
  energy: number; 
  xp: number;
  level: number;
  stats: Stats; 
  proficiencyPoints: number;
  cash: number;
  permanentEnergy: number;
  maxEnergy?: number;
  luckBoostPercent: number;
  lastEnergyUpdate?: string;
  fractionalEnergy?: number; // Store the actual fractional energy from server
  ExerciseProficiencies: ExerciseProficiency[];
  ResearchUpgrades: ResearchUpgrade[];
};

type GameState = Save & {
  exercises: Exercise[];
  adventures: Adventure[];
  availableResearch: AvailableResearch[];
  isLoading: boolean;
  isInitialized: boolean;
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
  getEnergyRegenProgress: () => { current: number; needed: number; progress: number; timeToNext: number };
  upgradeExercise: (exerciseId: string, tier: number) => Promise<void>;
  setAdventures: (adventures: Adventure[]) => void;
  attemptAdventure: (adventureId: string) => Promise<any>;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  loadAvailableResearch: () => Promise<void>;
};

export const useGameStore = create<GameState>((set, get) => ({
  energy: 0, 
  xp: 0, 
  level: 1,
  stats: { strength: 1, stamina: 1, mobility: 1, level: 1, xp: 0 }, 
  proficiencyPoints: 0,
  cash: 0,
  permanentEnergy: 0,
  luckBoostPercent: 0,
  ExerciseProficiencies: [],
  ResearchUpgrades: [],
  exercises: [],
  adventures: [],
  availableResearch: [],
  isLoading: true,
  isInitialized: false,
  
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
  getEnergyRegenProgress: () => {
    const state = get();
    const now = new Date();
    const lastUpdate = state.lastEnergyUpdate ? new Date(state.lastEnergyUpdate) : now;
    
    // Use fractional energy if available, otherwise calculate it
    let currentFractionalEnergy;
    if (state.fractionalEnergy !== undefined) {
      // Calculate current fractional energy based on time elapsed
      const hoursElapsed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
      currentFractionalEnergy = Math.min(state.maxEnergy || 180, state.fractionalEnergy + (hoursElapsed * 5));
    } else {
      // Fallback: calculate from integer energy
      const hoursElapsed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
      currentFractionalEnergy = Math.min(state.maxEnergy || 150, state.energy + (hoursElapsed * 5));
    }
    
    // Get the fractional part (0-1) to show progress toward next energy point
    const fractionalPart = currentFractionalEnergy % 1;
    
    // Calculate time until next energy point (in minutes)
    const timeToNext = Math.max(0, (1 - fractionalPart) * 12); // 12 minutes per energy point
    
    return {
      current: Math.floor(fractionalPart * 12), // minutes into current cycle
      needed: 12, // total minutes per energy point
      progress: fractionalPart * 100, // percentage
      timeToNext: Math.ceil(timeToNext) // minutes until next energy
    };
  },
  getResearchTier: (exerciseId) => {
    const state = get();
    const upgrade = state.ResearchUpgrades.find(u => u.exerciseId === exerciseId);
    return upgrade?.tier || 0;
  },
  upgradeExercise: async (exerciseId, tier) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      return;
    }
    
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
        alert(`Upgrade failed: ${error.error}`);
        return;
      }
      
      const data = await res.json();
      const state = get();
      
      // Update proficiency points
      set({ proficiencyPoints: data.proficiencyPoints });
      
      // Update max energy if provided
      if (data.maxEnergy) {
        set({ maxEnergy: data.maxEnergy });
      }
      
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
        set({
          proficiencyPoints: save.proficiencyPoints,
          ResearchUpgrades: save.ResearchUpgrades || []
        });
        
        // Reload available research to get updated benefits
        await get().loadAvailableResearch();
      }
    } catch (error) {
      alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  setAdventures: (adventures) => set({ adventures }),
  setLoading: (loading) => set({ isLoading: loading }),
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  loadAvailableResearch: async () => {
    try {
      const token = useAuthStore.getState().token;
    if (!token) {
      return;
    }
      
      const res = await fetch("http://localhost:4000/api/available-research", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!res.ok) {
        return;
      }
      
      const data = await res.json();
      set({ availableResearch: data });
    } catch (error) {
      // Handle error silently
    }
  },
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
      
      // Update game state with results (only energy is spent immediately)
      set(() => ({
        energy: data.energyAfter,
      }));

      return data;
    } catch (error) {
      alert(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
}));
