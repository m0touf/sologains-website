// User Types
export interface User {
  id: string;
  email: string;
  username: string;
}

// Game State Types
export interface GameStats {
  strength: number;
  stamina: number;
  agility: number;
  level: number;
  xp: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  energyCost: number;
  statGains: {
    strength: number;
    stamina: number;
    agility: number;
  };
  imagePath?: string;
}

export interface ExerciseProficiency {
  id: string;
  userId: string;
  exerciseId: string;
  proficiency: number;
  dailyStatGains: number;
  dailyEnergy: number;
  lastDailyReset: string;
  Exercise: Exercise;
}

export interface ResearchUpgrade {
  id: string;
  userId: string;
  exerciseId: string;
  tier: number;
  Exercise: Exercise;
}

export interface Adventure {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  energyCost: number;
  xpReward: number;
  statReward: {
    strength: number;
    stamina: number;
    agility: number;
  };
  cashReward: number;
  strengthReq: number;
  staminaReq: number;
  durationMinutes: number;
  isActive: boolean;
  canAttempt?: boolean;
}

export interface AdventureAttempt {
  id: string;
  userId: string;
  adventureId: string;
  success: boolean;
  energySpent: number;
  xpGained: number;
  statGains: {
    strength: number;
    stamina: number;
    agility: number;
  };
  cashGained: number;
  attemptedAt: string;
  completedAt?: string;
  status: 'in_progress' | 'completed' | 'failed';
  Adventure: Adventure;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: string;
  cost: number;
  icon: string;
  type: string;
  effectValue: number;
  statType?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
}

export interface WorkoutResponse {
  energySpent: number;
  xpGained: number;
  statGains: {
    strength: number;
    stamina: number;
    agility: number;
  };
  proficiencyGained: number;
  energyAfter: number;
  xpAfter: number;
  statsAfter: GameStats;
  proficiencyPointsAfter: number;
}

export interface AdventureResponse {
  success: boolean;
  energyAfter: number;
  adventureStarted: boolean;
  completionTime: string;
  durationMinutes: number;
  message: string;
  adventure: {
    name: string;
    description: string;
    difficulty: string;
  };
}

export interface AdventureCompletionResponse {
  message: string;
  completedAdventures: Array<{
    adventureName: string;
    success: boolean;
    xpGained: number;
    statGains: {
      strength: number;
      stamina: number;
      agility: number;
    };
    cashGained: number;
    statsAfter: GameStats;
    cashAfter: number;
  }>;
}

// Component Props Types
export interface HomeScreenProps {
  onNavigate: (section: 'gym' | 'store' | 'adventures' | 'research') => void;
  onResetEnergy: () => void;
}

export interface AdventuresScreenProps {
  onBack: () => void;
}

export interface GymScreenProps {
  onBack: () => void;
}

export interface StoreScreenProps {
  onBack: () => void;
}

export interface ResearchScreenProps {
  onBack: () => void;
}

// Store Types
export interface GameState {
  energy: number;
  xp: number;
  level: number;
  stats: GameStats;
  proficiencyPoints: number;
  cash: number;
  exercises: Exercise[];
  ExerciseProficiencies: ExerciseProficiency[];
  ResearchUpgrades: ResearchUpgrade[];
  adventures: Adventure[];
  
  // Actions
  setFromServer: (data: Partial<GameState>) => void;
  spendEnergy: (amount: number) => void;
  addXp: (amount: number) => void;
  addStats: (stats: Partial<GameStats>) => void;
  addProficiencyPoints: (amount: number) => void;
  addCash: (amount: number) => void;
  setExercises: (exercises: Exercise[]) => void;
  setAdventures: (adventures: Adventure[]) => void;
  doWorkout: (workoutType: 'strength' | 'endurance' | 'mobility', exerciseId: string, reps?: number, intensity?: 1|2|3|4|5, grade?: 'perfect'|'good'|'okay'|'miss') => Promise<any>;
  attemptAdventure: (adventureId: string) => Promise<any>;
  getCurrentLevel: () => number;
  getXpProgress: () => { current: number; needed: number; percentage: number };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}
