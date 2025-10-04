// Proficiency System Configuration
export const K = 2.2;                      // Base proficiency gain multiplier
export const MAX_PROFICIENCY = 1000;       // Maximum proficiency level

/**
 * Intensity multiplier for proficiency gains
 * @param intensity Exercise intensity (1-5)
 * @returns Multiplier for proficiency gain
 */
export function getIntensityMultiplier(intensity: 1|2|3|4|5): number {
  return 1 + 0.25 * (intensity - 1);
}

/**
 * Grade multiplier for proficiency gains
 * @param grade Exercise grade
 * @returns Multiplier for proficiency gain
 */
export function getGradeMultiplier(grade: "perfect"|"good"|"okay"|"miss"): number {
  switch (grade) {
    case "perfect": return 1.2;
    case "good": return 1.0;
    case "okay": return 0.8;
    case "miss": return 0.4;
    default: return 1.0;
  }
}

/**
 * Diminishing returns factor based on current proficiency
 * @param proficiency Current proficiency level (0-1000)
 * @returns Diminishing returns multiplier
 */
export function getDiminishingReturns(proficiency: number): number {
  return 1 - Math.pow(proficiency / MAX_PROFICIENCY, 0.8);
}

/**
 * Daily diminishing returns factor based on daily energy spent
 * @param dailyEnergy Daily energy spent on this exercise
 * @returns Daily diminishing returns multiplier
 */
export function getDailyDiminishingReturns(dailyEnergy: number): number {
  return dailyEnergy <= 30 ? 1 : Math.sqrt(30 / dailyEnergy);
}

/**
 * Calculate proficiency points gained from a workout
 * @param currentProficiency Current proficiency level
 * @param dailyEnergy Daily energy spent on this exercise
 * @param energySpent Energy spent in this workout
 * @param intensity Exercise intensity (1-5)
 * @param grade Exercise grade
 * @returns Object with new proficiency, new daily energy, and proficiency gained
 */
export function calculateProficiencyGain(
  currentProficiency: number,
  dailyEnergy: number,
  energySpent: number,
  intensity: 1|2|3|4|5 = 3,
  grade: "perfect"|"good"|"okay"|"miss" = "good"
): {
  newProficiency: number;
  newDailyEnergy: number;
  proficiencyGained: number;
} {
  const intensityMul = getIntensityMultiplier(intensity);
  const gradeMul = getGradeMultiplier(grade);
  const diminishingReturns = getDiminishingReturns(currentProficiency);
  const dailyDiminishingReturns = getDailyDiminishingReturns(dailyEnergy);
  
  const proficiencyGained = Math.max(
    6, // Minimum gain
    K * energySpent * intensityMul * gradeMul * diminishingReturns * dailyDiminishingReturns
  );
  
  const newProficiency = Math.min(MAX_PROFICIENCY, currentProficiency + Math.round(proficiencyGained));
  const newDailyEnergy = dailyEnergy + energySpent;
  
  return {
    newProficiency,
    newDailyEnergy,
    proficiencyGained: Math.round(proficiencyGained)
  };
}

/**
 * Calculate proficiency points gained from leveling up
 * @param newLevel New level reached
 * @returns Proficiency points gained
 */
export function calculateProficiencyPointsGained(newLevel: number): number {
  if (newLevel <= 1) return 0;
  return 1 + Math.floor((newLevel - 1) / 10);
}
