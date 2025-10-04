// Energy regeneration system constants
export const ENERGY_RATE_PER_HOUR = 5;     // 5/h = 120/day
export const ENERGY_CAP = 150;             // ~30h of regen; players can miss a day
export const OVERCAP_BUFFER = 20;          // Allow +20 overcap for level-up refills
export const MAX_ENERGY_WITH_OVERFLOW = ENERGY_CAP + OVERCAP_BUFFER; // 170 total

// XP scaling to preserve 6-month curve
export const DAILY_XP_TARGET = 200;        // Increased to match new energy costs
export const ENERGY_PER_DAY = 24 * ENERGY_RATE_PER_HOUR; // 120
export const XP_ENERGY_SCALE = DAILY_XP_TARGET / ENERGY_PER_DAY; // 200/120 = 1.666...

/**
 * Compute current energy based on time elapsed since last update
 * @param prevEnergy Previous energy value
 * @param lastUpdate Timestamp of last energy update
 * @param now Current timestamp
 * @returns Current energy value (may exceed cap temporarily)
 */
export function computeEnergyFloat(prevEnergy: number, lastUpdate: Date, now: Date): number {
  const dtHours = Math.max(0, (now.getTime() - lastUpdate.getTime()) / 3_600_000);
  const gained = ENERGY_RATE_PER_HOUR * dtHours;
  return prevEnergy + gained;
}

/**
 * Get energy capped at the maximum (excluding overcap buffer)
 * @param energy Current energy value
 * @returns Energy capped at ENERGY_CAP
 */
export function getCappedEnergy(energy: number): number {
  return Math.min(ENERGY_CAP, energy);
}

/**
 * Get energy with overcap buffer for level-up refills
 * @param energy Current energy value
 * @returns Energy capped at ENERGY_CAP + OVERCAP_BUFFER
 */
export function getEnergyWithOvercap(energy: number): number {
  return Math.min(MAX_ENERGY_WITH_OVERFLOW, energy);
}

/**
 * Scale XP rewards to maintain 6-month pacing with new energy system
 * @param rawXp Raw XP value before scaling
 * @returns Scaled XP value
 */
export function scaleXpReward(rawXp: number): number {
  return Math.max(1, Math.round(rawXp * XP_ENERGY_SCALE));
}

/**
 * Get time until next energy point (in minutes)
 * @param currentEnergy Current energy value
 * @returns Minutes until next energy point
 */
export function getMinutesToNextEnergy(currentEnergy: number): number {
  const fractionalPart = currentEnergy % 1;
  if (fractionalPart === 0) {
    return 12; // 60 minutes / 5 energy per hour = 12 minutes per energy
  }
  const energyNeeded = 1 - fractionalPart;
  return Math.ceil(energyNeeded * 12); // 12 minutes per energy point
}
