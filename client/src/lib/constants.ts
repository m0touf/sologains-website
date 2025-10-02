// API Configuration
export const API_BASE_URL = 'http://localhost:4000/api';

// Game Constants
export const GAME_CONSTANTS = {
  MAX_ENERGY: 100,
  STARTING_CASH: 500,
  DAILY_ADVENTURE_LIMIT: 2,
  MAX_LEVEL: 100,
  DEFAULT_REPS: 20,
  DEFAULT_INTENSITY: 3,
  DEFAULT_GRADE: 'good' as const,
} as const;

// UI Constants
export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  HOVER_SCALE: 1.05,
  PROGRESS_UPDATE_INTERVAL: 30000, // 30 seconds
} as const;

// Asset Paths
export const ASSET_PATHS = {
  BACKGROUNDS: {
    HOME: '/src/assets/backgrounds/Background_Image_Home_05.png',
  },
  BANNERS: {
    BACKGROUND: '/src/assets/banners/Banner_Background_Home.png',
    IMAGE: '/src/assets/banners/Banner_Image_Home.png',
  },
  BUTTONS: {
    GYM: '/src/assets/buttons/Gym_Home_Button.png',
    STORE: '/src/assets/buttons/Store_Home_Button.png',
    ADVENTURES: '/src/assets/buttons/Adventure_Home_Button.png',
    RESEARCH: '/src/assets/buttons/Research_Home_Button.png',
  },
  EXERCISES: {
    STRENGTH: '/src/assets/exercises/strength/',
    ENDURANCE: '/src/assets/exercises/endurance/',
    MOBILITY: '/src/assets/exercises/mobility/',
  },
} as const;

// Screen Types
export type ScreenType = 'home' | 'gym' | 'store' | 'adventures' | 'research';

// Workout Types
export type WorkoutType = 'strength' | 'endurance' | 'mobility';
export type IntensityLevel = 1 | 2 | 3 | 4 | 5;
export type GradeType = 'perfect' | 'good' | 'okay' | 'miss';

// Adventure Types
export type AdventureDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';
