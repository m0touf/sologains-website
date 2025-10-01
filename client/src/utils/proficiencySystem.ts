export type Category = "strength" | "endurance" | "mobility";

export interface Exercise {
  id: string;
  name: string;
  category: Category;
  proficiency: number; // 0..1000
  dailyEnergy: number; // reset each day
  researchTier: number; // 0..4
}

const K = 2.2;
const intensityMul = (i: 1|2|3|4|5) => 1 + 0.25 * (i - 1);
const gradeMul = (g: "perfect"|"good"|"okay"|"miss") =>
  g === "perfect" ? 1.2 : g === "good" ? 1.0 : g === "okay" ? 0.8 : 0.4;
const DR = (p: number) => 1 - Math.pow(p / 1000, 0.8);
const dayDR = (x: number) => (x <= 30 ? 1 : Math.sqrt(30 / x));

export function gainProficiency(
  ex: Exercise,
  energySpent: number,
  intensity: 1|2|3|4|5,
  grade: "perfect"|"good"|"okay"|"miss",
) {
  const delta = Math.max(
    6,
    K * energySpent * intensityMul(intensity) * gradeMul(grade) * DR(ex.proficiency) * dayDR(ex.dailyEnergy)
  );
  ex.proficiency = Math.min(1000, ex.proficiency + Math.round(delta));
  ex.dailyEnergy += energySpent;
  return Math.round(delta);
}

// same-category cross-training:
export function applySynergy(deltaPrimary: number, othersInCategory: Exercise[]) {
  const spill = Math.min(10, Math.round(0.15 * deltaPrimary));
  for (const e of othersInCategory) {
    e.proficiency = Math.min(1000, e.proficiency + spill);
  }
}

// Research tier costs
export const RESEARCH_TIER_COSTS = {
  1: 2,  // Energy Efficiency +5%
  2: 4,  // Output +5%
  3: 6,  // XP Yield +10%
  4: 8,  // Signature Move +5% proficiency gain
};

// Research tier effects
export const RESEARCH_TIER_EFFECTS = {
  1: { name: "Energy Efficiency", description: "This exercise costs 5% less energy", effect: "energy_reduction" },
  2: { name: "Output Boost", description: "Gives 5% more stat gain", effect: "stat_boost" },
  3: { name: "XP Yield", description: "Gives 10% more character XP", effect: "xp_boost" },
  4: { name: "Signature Move", description: "New technique + 5% proficiency gain", effect: "proficiency_boost" },
};

// Category mastery thresholds and effects
export const CATEGORY_MASTERY_THRESHOLDS = [
  { threshold: 3000, name: "Novice", effects: ["+2% stamina regen"] },
  { threshold: 6000, name: "Expert", effects: ["+2% stamina regen", "+2% injury resist"] },
  { threshold: 9000, name: "Master", effects: ["+2% stamina regen", "+2% injury resist", "+2% shop discount"] },
];

export function getCategoryMasteryLevel(totalProficiency: number) {
  for (let i = CATEGORY_MASTERY_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalProficiency >= CATEGORY_MASTERY_THRESHOLDS[i].threshold) {
      return CATEGORY_MASTERY_THRESHOLDS[i];
    }
  }
  return null;
}

export function calculateCategoryTotal(exercises: Exercise[], category: Category) {
  return exercises
    .filter(ex => ex.category === category)
    .reduce((total, ex) => total + ex.proficiency, 0);
}
