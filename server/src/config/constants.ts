/**
 * Shared constants used across the application
 * 
 * This module centralizes all game configuration constants to ensure
 * consistency across controllers and avoid magic numbers scattered
 * throughout the codebase.
 * 
 * @fileoverview Game configuration constants
 */

// Energy System Constants
export const DEFAULT_MAX_ENERGY = 150;
export const ENERGY_REGEN_RATE_PER_HOUR = 5; // 5 energy per hour
export const ENERGY_REGEN_RATE_PER_MINUTE = ENERGY_REGEN_RATE_PER_HOUR / 60; // ~0.083 per minute

// Adventure System Constants
export const DEFAULT_DAILY_ADVENTURE_LIMIT = 2;

// Starting Resources
export const STARTING_CASH = 500;
export const STARTING_ENERGY = 150.0;
export const STARTING_PROFICIENCY_POINTS = 0;

// Level System Constants
export const STARTING_LEVEL = 1;
export const STARTING_XP = 0;

// Stat System Constants
export const STARTING_STRENGTH = 1;
export const STARTING_STAMINA = 1;
export const STARTING_MOBILITY = 1;

// Boost System Constants
export const DEFAULT_XP_BOOST_REMAINING = 0;
export const DEFAULT_PROFICIENCY_BOOST_REMAINING = 0;
export const DEFAULT_LUCK_BOOST_PERCENT = 0;
export const DEFAULT_PERMANENT_XP_GAIN = 0;
export const DEFAULT_PERMANENT_ENERGY = 0;

// Daily Reset Constants
export const DEFAULT_DAILY_ADVENTURE_ATTEMPTS = 0;
export const DEFAULT_DAILY_RESET_COUNT = 0;

// Rotation System Constants
export const DEFAULT_SHOP_ROTATION_SEED = null;
export const DEFAULT_ADVENTURE_ROTATION_SEED = null;
