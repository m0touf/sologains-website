// XP Curve System Configuration
export const LMAX = 100;                   // Maximum level
export const BASE_REQ = 20;                // Base XP requirement for level 1
export const GROWTH = 1.048900;            // Growth factor for XP curve

/**
 * Calculate XP required to reach the next level
 * @param currentLevel Current level (1-based)
 * @returns XP required for next level
 */
export function xpToNext(currentLevel: number): number {
  return Math.round(BASE_REQ * Math.pow(GROWTH, currentLevel - 1));
}

/**
 * Calculate total XP required to reach a specific level
 * @param targetLevel Target level (1-based)
 * @returns Total XP required to reach target level
 */
export function totalXpTo(targetLevel: number): number {
  const r = GROWTH, A = BASE_REQ;
  return Math.round(A * (Math.pow(r, targetLevel) - 1) / (r - 1));
}

/**
 * Calculate current level from total XP
 * @param totalXp Total XP accumulated
 * @returns Current level (1-based)
 */
export function levelFromXp(totalXp: number): number {
  let level = 1;
  let cumulativeXp = 0;
  
  while (level <= LMAX) {
    const xpNeeded = xpToNext(level);
    if (cumulativeXp + xpNeeded > totalXp) {
      break;
    }
    cumulativeXp += xpNeeded;
    level++;
  }
  
  return level;
}

/**
 * Calculate XP progress for current level
 * @param totalXp Total XP accumulated
 * @returns Object with current level, XP progress, and next level requirement
 */
export function getXpProgress(totalXp: number): {
  currentLevel: number;
  xpProgress: number;
  xpToNext: number;
  totalXpToNext: number;
} {
  const currentLevel = levelFromXp(totalXp);
  const totalXpToCurrent = totalXpTo(currentLevel);
  const totalXpToNext = totalXpTo(currentLevel + 1);
  const xpProgress = totalXp - totalXpToCurrent;
  const xpToNext = totalXpToNext - totalXpToCurrent;
  
  return {
    currentLevel,
    xpProgress,
    xpToNext,
    totalXpToNext
  };
}
