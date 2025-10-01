// Proficiency Points (PP) system for research upgrades

// PP gained per level using bracket system
export const ppForLevel = (n: number) => 1 + Math.floor((n - 1) / 10);

// Total PP accumulated up to level L
export const totalPPToLevel = (L: number) =>
  Array.from({ length: L }, (_, i) => ppForLevel(i + 1))
       .reduce((a, b) => a + b, 0);

// PP gained when leveling up from level n-1 to level n
export const ppGainedOnLevelUp = (newLevel: number) => {
  if (newLevel <= 1) return 0;
  return ppForLevel(newLevel);
};

// Research tier costs
export const RESEARCH_TIER_COSTS = {
  1: 2,  // Energy Efficiency +5%
  2: 4,  // Output +5%
  3: 6,  // XP Yield +10%
  4: 8   // Signature Move +5% proficiency
} as const;

// Research tier effects
export const RESEARCH_TIER_EFFECTS = {
  1: { name: "Energy Efficiency", description: "Exercise costs 5% less energy" },
  2: { name: "Output Boost", description: "Gives 5% more stat gain" },
  3: { name: "XP Yield", description: "Gives 10% more character XP" },
  4: { name: "Signature Move", description: "New technique + 5% proficiency gain" }
} as const;

// Calculate total PP needed to fully upgrade an exercise (all 4 tiers)
export const totalPPForFullUpgrade = () => {
  return Object.values(RESEARCH_TIER_COSTS).reduce((sum, cost) => sum + cost, 0);
};

// Calculate how many exercises can be fully upgraded with given PP
export const exercisesFullyUpgradeable = (totalPP: number) => {
  const fullUpgradeCost = totalPPForFullUpgrade();
  return Math.floor(totalPP / fullUpgradeCost);
};
