// Skill System Configuration
export const MAX_SKILL_LEVEL = 100;        // Maximum skill level
export const BASE_STAT_GAIN = 1;           // Base stat gain per workout
export const STAT_GAIN_MULTIPLIER = 0.1;   // Multiplier for stat gains


/**
 * Calculate stat gains for all three stats
 * @param energySpent Energy spent in the workout
 * @param intensity Exercise intensity (1-5)
 * @param grade Exercise grade
 * @param currentStats Current stat levels
 * @returns Object with stat gains for each stat
 */
export function calculateAllStatGains(
  energySpent: number,
  intensity: 1|2|3|4|5 = 3,
  grade: "perfect"|"good"|"okay"|"miss" = "good",
  currentStats: { strength: number; stamina: number; mobility: number } = { strength: 1, stamina: 1, mobility: 1 }
): {
  strength: number;
  stamina: number;
  mobility: number;
} {
  return {
    strength: calculateStatGain(energySpent, intensity, grade, currentStats.strength),
    stamina: calculateStatGain(energySpent, intensity, grade, currentStats.stamina),
    mobility: calculateStatGain(energySpent, intensity, grade, currentStats.mobility)
  };
}

/**
 * Calculate adventure success chance based on stats vs requirements
 * @param userStats User's current stats
 * @param requirements Adventure requirements
 * @returns Success chance (0-1)
 */
export function calculateAdventureSuccessChance(
  userStats: { strength: number; stamina: number; mobility: number },
  requirements: { strengthReq: number; staminaReq: number; mobilityReq?: number }
): number {
  const strengthRatio = requirements.strengthReq > 0 ? userStats.strength / requirements.strengthReq : 1;
  const staminaRatio = requirements.staminaReq > 0 ? userStats.stamina / requirements.staminaReq : 1;
  const mobilityRatio = requirements.mobilityReq && requirements.mobilityReq > 0 ? 
    userStats.mobility / requirements.mobilityReq : 1;
  
  const averageRatio = (strengthRatio + staminaRatio + mobilityRatio) / 3;
  
  // Success chance between 30% and 95%
  return Math.min(0.95, Math.max(0.3, averageRatio));
}

/**
 * Calculate adventure rewards based on success
 * @param baseRewards Base rewards from adventure
 * @param success Whether the adventure succeeded
 * @param luckBoostPercent Luck boost percentage (0-100)
 * @returns Object with final rewards
 */
export function calculateAdventureRewards(
  baseRewards: { xpReward: number; cashReward: number; statReward: { strength: number; stamina: number; mobility: number } },
  success: boolean,
  luckBoostPercent: number = 0
): {
  xpGained: number;
  cashGained: number;
  statGains: { strength: number; stamina: number; mobility: number };
  bonusReward: boolean;
} {
  // Base rewards (reduced if failed)
  let xpGained = success ? baseRewards.xpReward : Math.floor(baseRewards.xpReward * 0.3);
  let cashGained = success ? baseRewards.cashReward : 0;
  let statGains = success ? baseRewards.statReward : { strength: 0, stamina: 0, mobility: 0 };
  
  // Apply luck boost
  let bonusReward = false;
  if (luckBoostPercent > 0 && Math.random() < (luckBoostPercent / 100)) {
    bonusReward = true;
    xpGained = Math.round(xpGained * 1.5);
    cashGained = Math.round(cashGained * 1.3);
  }
  
  return {
    xpGained,
    cashGained,
    statGains,
    bonusReward
  };
}
