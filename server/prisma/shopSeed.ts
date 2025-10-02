import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const shopItems = [
  // Energy Boosters (8 items) - Prices based on adventure rewards (8-18 cash for easy adventures)
  { name: 'Energy Drink', description: 'Restore 15 energy instantly', category: 'energy_boosters', cost: 12, icon: 'DRINK', type: 'energy_restore', effectValue: 15, statType: null },
  { name: 'Protein Shake', description: 'Restore 25 energy instantly', category: 'energy_boosters', cost: 20, icon: 'SHAKE', type: 'energy_restore', effectValue: 25, statType: null },
  { name: 'Pre-Workout', description: 'Restore 35 energy instantly', category: 'energy_boosters', cost: 28, icon: 'PILL', type: 'energy_restore', effectValue: 35, statType: null },
  { name: 'Energy Bar', description: 'Restore 20 energy instantly', category: 'energy_boosters', cost: 16, icon: 'BAR', type: 'energy_restore', effectValue: 20, statType: null },
  { name: 'Caffeine Shot', description: 'Restore 30 energy instantly', category: 'energy_boosters', cost: 24, icon: 'SHOT', type: 'energy_restore', effectValue: 30, statType: null },
  { name: 'Sports Drink', description: 'Restore 18 energy instantly', category: 'energy_boosters', cost: 14, icon: 'SPORT', type: 'energy_restore', effectValue: 18, statType: null },
  { name: 'Energy Gel', description: 'Restore 22 energy instantly', category: 'energy_boosters', cost: 18, icon: 'GEL', type: 'energy_restore', effectValue: 22, statType: null },
  { name: 'Recovery Drink', description: 'Restore 40 energy instantly', category: 'energy_boosters', cost: 32, icon: 'RECOVER', type: 'energy_restore', effectValue: 40, statType: null },

  // Supplements (15 items) - Stat boosts with varying costs based on adventure rewards
  // +1 stat items (affordable for easy adventures)
  { name: 'Basic Protein', description: '+1 permanent strength', category: 'supplements', cost: 25, icon: 'PROT+1', type: 'stat_boost', effectValue: 1, statType: 'strength' },
  { name: 'BCAA Powder', description: '+1 permanent stamina', category: 'supplements', cost: 25, icon: 'BCAA+1', type: 'stat_boost', effectValue: 1, statType: 'stamina' },
  { name: 'Fish Oil', description: '+1 permanent agility', category: 'supplements', cost: 25, icon: 'FISH+1', type: 'stat_boost', effectValue: 1, statType: 'agility' },
  
  // +2 stat items (medium adventure rewards)
  { name: 'Whey Protein', description: '+2 permanent strength', category: 'supplements', cost: 45, icon: 'WHEY+2', type: 'stat_boost', effectValue: 2, statType: 'strength' },
  { name: 'Creatine Monohydrate', description: '+2 permanent stamina', category: 'supplements', cost: 45, icon: 'CREA+2', type: 'stat_boost', effectValue: 2, statType: 'stamina' },
  { name: 'Omega-3 Complex', description: '+2 permanent agility', category: 'supplements', cost: 45, icon: 'OMEGA+2', type: 'stat_boost', effectValue: 2, statType: 'agility' },
  
  // +3 stat items (hard adventure rewards)
  { name: 'Advanced Protein', description: '+3 permanent strength', category: 'supplements', cost: 75, icon: 'ADV+3', type: 'stat_boost', effectValue: 3, statType: 'strength' },
  { name: 'Endurance Formula', description: '+3 permanent stamina', category: 'supplements', cost: 75, icon: 'END+3', type: 'stat_boost', effectValue: 3, statType: 'stamina' },
  { name: 'Agility Complex', description: '+3 permanent agility', category: 'supplements', cost: 75, icon: 'AGI+3', type: 'stat_boost', effectValue: 3, statType: 'agility' },
  
  // +4 stat items (legendary adventure rewards)
  { name: 'Elite Protein', description: '+4 permanent strength', category: 'supplements', cost: 120, icon: 'ELITE+4', type: 'stat_boost', effectValue: 4, statType: 'strength' },
  { name: 'Ultra Endurance', description: '+4 permanent stamina', category: 'supplements', cost: 120, icon: 'ULTRA+4', type: 'stat_boost', effectValue: 4, statType: 'stamina' },
  { name: 'Supreme Agility', description: '+4 permanent agility', category: 'supplements', cost: 120, icon: 'SUP+4', type: 'stat_boost', effectValue: 4, statType: 'agility' },
  
  // +5 stat items (multiple legendary adventures)
  { name: 'Master Strength', description: '+5 permanent strength', category: 'supplements', cost: 200, icon: 'MAST+5', type: 'stat_boost', effectValue: 5, statType: 'strength' },
  { name: 'Legendary Stamina', description: '+5 permanent stamina', category: 'supplements', cost: 200, icon: 'LEG+5', type: 'stat_boost', effectValue: 5, statType: 'stamina' },
  { name: 'Mythical Agility', description: '+5 permanent agility', category: 'supplements', cost: 200, icon: 'MYTH+5', type: 'stat_boost', effectValue: 5, statType: 'agility' },

  // Special Items (8 items) - Gym-based performance enhancers
  { name: 'Anabolic Steroids', description: 'Double XP gain for next 5 workouts', category: 'special_items', cost: 120, icon: 'STEROID', type: 'xp_boost', effectValue: 5, statType: null },
  { name: 'Growth Hormone', description: 'Double proficiency gain for next 5 workouts', category: 'special_items', cost: 150, icon: 'HGH', type: 'proficiency_boost', effectValue: 5, statType: null },
  { name: 'Creatine Loading', description: 'Increase max energy by 15', category: 'special_items', cost: 100, icon: 'CREATINE', type: 'max_energy', effectValue: 15, statType: null },
  { name: 'Beta-Alanine', description: 'Instant energy reset', category: 'special_items', cost: 80, icon: 'BETA', type: 'full_restore', effectValue: 100, statType: null },
  { name: 'Peptide Stack', description: 'Reset daily stat gain limits', category: 'special_items', cost: 90, icon: 'PEPTIDE', type: 'daily_reset', effectValue: 1, statType: null },
  { name: 'Testosterone Booster', description: '+15% chance for bonus rewards', category: 'special_items', cost: 110, icon: 'TESTO', type: 'luck_boost', effectValue: 15, statType: null },
  { name: 'Pre-Workout Stack', description: 'All stats +3, energy +25, XP +150', category: 'special_items', cost: 250, icon: 'STACK', type: 'master_package', effectValue: 1, statType: null },
  { name: 'Recovery Protocol', description: 'Triple XP gain for next 3 workouts', category: 'special_items', cost: 180, icon: 'RECOVERY', type: 'xp_boost', effectValue: 3, statType: null },
];

async function seedShopItems() {
  console.log('Seeding shop items...');
  
  // Clear existing shop items
  await prisma.shopItem.deleteMany({});
  
  // Create all shop items
  for (const item of shopItems) {
    await prisma.shopItem.create({
      data: item
    });
  }
  
  console.log(`Created ${shopItems.length} shop items`);
}

if (require.main === module) {
  seedShopItems()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default seedShopItems;
