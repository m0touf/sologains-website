// Curve params (balanced progression plan)
export const LMAX = 100;
export const BASE_REQ = 80;           // A
export const GROWTH = 1.032;          // r (≈ 9 months at 200 XP/day)

// XP to go from level n -> n+1
export function xpToNext(n: number) {
  return Math.round(BASE_REQ * Math.pow(GROWTH, n - 1));
}

// Cumulative XP needed to reach level L (from level 1)
export function totalXpTo(L: number) {
  const r = GROWTH, A = BASE_REQ;
  return Math.round(A * (Math.pow(r, L) - 1) / (r - 1));
}

// Estimated days to next level for median player
export function daysToNextLevel(n: number, xpPerDay = 100) {
  return xpToNext(n) / xpPerDay;
}

// Calculate current level from total XP
export function levelFromXp(totalXp: number) {
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

// Calculate XP progress within current level
export function xpProgressInLevel(totalXp: number, currentLevel: number) {
  const xpAtCurrentLevel = totalXpTo(currentLevel - 1);
  const xpInCurrentLevel = totalXp - xpAtCurrentLevel;
  const xpNeededForNextLevel = xpToNext(currentLevel);
  
  return {
    current: xpInCurrentLevel,
    needed: xpNeededForNextLevel,
    progress: Math.min(100, (xpInCurrentLevel / xpNeededForNextLevel) * 100)
  };
}
