import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Adventure data
const adventures = [
  // Easy Adventures (0 skill requirement)
  { name: "Morning Jog", description: "A peaceful run through the neighborhood park", difficulty: "easy", energyCost: 15, xpReward: 25, statReward: { strength: 0, stamina: 1, agility: 1 }, cashReward: 10, strengthReq: 0, staminaReq: 0 },
  { name: "Light Stretching", description: "Gentle stretching to start your day", difficulty: "easy", energyCost: 10, xpReward: 15, statReward: { strength: 0, stamina: 0, agility: 2 }, cashReward: 8, strengthReq: 0, staminaReq: 0 },
  { name: "Nature Walk", description: "A leisurely walk through the forest trails", difficulty: "easy", energyCost: 12, xpReward: 20, statReward: { strength: 0, stamina: 1, agility: 1 }, cashReward: 12, strengthReq: 0, staminaReq: 0 },
  { name: "Beach Stroll", description: "Walking along the sandy beach at sunset", difficulty: "easy", energyCost: 8, xpReward: 18, statReward: { strength: 0, stamina: 1, agility: 1 }, cashReward: 10, strengthReq: 0, staminaReq: 0 },
  { name: "Yoga Session", description: "Basic yoga poses for relaxation", difficulty: "easy", energyCost: 10, xpReward: 20, statReward: { strength: 0, stamina: 0, agility: 2 }, cashReward: 15, strengthReq: 0, staminaReq: 0 },
  { name: "City Exploration", description: "Discovering new neighborhoods on foot", difficulty: "easy", energyCost: 14, xpReward: 22, statReward: { strength: 0, stamina: 1, agility: 1 }, cashReward: 12, strengthReq: 0, staminaReq: 0 },
  { name: "Garden Tending", description: "Caring for plants and flowers", difficulty: "easy", energyCost: 6, xpReward: 12, statReward: { strength: 1, stamina: 0, agility: 1 }, cashReward: 8, strengthReq: 0, staminaReq: 0 },
  { name: "Cycling Tour", description: "A gentle bike ride through scenic routes", difficulty: "easy", energyCost: 16, xpReward: 28, statReward: { strength: 0, stamina: 2, agility: 0 }, cashReward: 15, strengthReq: 0, staminaReq: 0 },
  { name: "Swimming Laps", description: "Light swimming in the community pool", difficulty: "easy", energyCost: 18, xpReward: 30, statReward: { strength: 0, stamina: 2, agility: 1 }, cashReward: 18, strengthReq: 0, staminaReq: 0 },
  { name: "Meditation Hike", description: "A mindful walk up a small hill", difficulty: "easy", energyCost: 13, xpReward: 25, statReward: { strength: 0, stamina: 1, agility: 1 }, cashReward: 12, strengthReq: 0, staminaReq: 0 },

  // Medium Adventures (1 skill requirement - specific levels)
  { name: "Mountain Trail Run", description: "Running up challenging mountain trails", difficulty: "medium", energyCost: 25, xpReward: 45, statReward: { strength: 1, stamina: 2, agility: 1 }, cashReward: 25, strengthReq: 0, staminaReq: 50 },
  { name: "Rock Climbing Basics", description: "Learning to climb on beginner routes", difficulty: "medium", energyCost: 30, xpReward: 50, statReward: { strength: 2, stamina: 1, agility: 1 }, cashReward: 30, strengthReq: 50, staminaReq: 0 },
  { name: "Swimming Competition", description: "Participating in a local swimming meet", difficulty: "medium", energyCost: 28, xpReward: 48, statReward: { strength: 0, stamina: 3, agility: 1 }, cashReward: 28, strengthReq: 0, staminaReq: 50 },
  { name: "Crossfit Challenge", description: "High-intensity functional training session", difficulty: "medium", energyCost: 32, xpReward: 55, statReward: { strength: 2, stamina: 2, agility: 0 }, cashReward: 32, strengthReq: 50, staminaReq: 0 },
  { name: "Marathon Training", description: "Long-distance running preparation", difficulty: "medium", energyCost: 35, xpReward: 60, statReward: { strength: 0, stamina: 3, agility: 1 }, cashReward: 35, strengthReq: 0, staminaReq: 50 },
  { name: "Weightlifting Meet", description: "Competing in a local powerlifting competition", difficulty: "medium", energyCost: 30, xpReward: 52, statReward: { strength: 3, stamina: 1, agility: 0 }, cashReward: 30, strengthReq: 50, staminaReq: 0 },
  { name: "Boxing Training", description: "Intensive boxing workout with sparring", difficulty: "medium", energyCost: 28, xpReward: 50, statReward: { strength: 2, stamina: 2, agility: 1 }, cashReward: 28, strengthReq: 50, staminaReq: 0 },
  { name: "Basketball Tournament", description: "Playing in a competitive basketball league", difficulty: "medium", energyCost: 26, xpReward: 48, statReward: { strength: 1, stamina: 2, agility: 2 }, cashReward: 26, strengthReq: 0, staminaReq: 50 },
  { name: "Cycling Race", description: "Competing in a local cycling race", difficulty: "medium", energyCost: 32, xpReward: 55, statReward: { strength: 0, stamina: 3, agility: 1 }, cashReward: 32, strengthReq: 0, staminaReq: 50 },
  { name: "Martial Arts Class", description: "Learning advanced martial arts techniques", difficulty: "medium", energyCost: 27, xpReward: 50, statReward: { strength: 1, stamina: 1, agility: 3 }, cashReward: 27, strengthReq: 50, staminaReq: 0 },

  // Hard Adventures (2 skill requirements - specific levels)
  { name: "Mountain Peak Ascent", description: "Climbing to the summit of a challenging peak", difficulty: "hard", energyCost: 45, xpReward: 80, statReward: { strength: 2, stamina: 3, agility: 2 }, cashReward: 50, strengthReq: 35, staminaReq: 50 },
  { name: "Ironman Training", description: "Completing a triathlon training session", difficulty: "hard", energyCost: 50, xpReward: 90, statReward: { strength: 1, stamina: 4, agility: 2 }, cashReward: 55, strengthReq: 35, staminaReq: 50 },
  { name: "Powerlifting Competition", description: "Competing in a national powerlifting event", difficulty: "hard", energyCost: 48, xpReward: 85, statReward: { strength: 4, stamina: 1, agility: 0 }, cashReward: 52, strengthReq: 50, staminaReq: 35 },
  { name: "Ultra Marathon", description: "Running an ultra-distance marathon", difficulty: "hard", energyCost: 55, xpReward: 95, statReward: { strength: 0, stamina: 4, agility: 1 }, cashReward: 60, strengthReq: 35, staminaReq: 50 },
  { name: "Advanced Rock Climbing", description: "Tackling expert-level climbing routes", difficulty: "hard", energyCost: 52, xpReward: 88, statReward: { strength: 3, stamina: 2, agility: 2 }, cashReward: 55, strengthReq: 50, staminaReq: 35 },
  { name: "MMA Championship", description: "Fighting in a mixed martial arts championship", difficulty: "hard", energyCost: 50, xpReward: 90, statReward: { strength: 2, stamina: 3, agility: 3 }, cashReward: 55, strengthReq: 50, staminaReq: 35 },
  { name: "Cycling Tour de Force", description: "Multi-day cycling tour through mountains", difficulty: "hard", energyCost: 48, xpReward: 85, statReward: { strength: 1, stamina: 4, agility: 1 }, cashReward: 52, strengthReq: 35, staminaReq: 50 },
  { name: "Crossfit Games", description: "Competing in the Crossfit Games", difficulty: "hard", energyCost: 55, xpReward: 95, statReward: { strength: 3, stamina: 3, agility: 1 }, cashReward: 60, strengthReq: 50, staminaReq: 35 },
  { name: "Swimming Marathon", description: "Swimming across a large lake", difficulty: "hard", energyCost: 50, xpReward: 90, statReward: { strength: 0, stamina: 4, agility: 2 }, cashReward: 55, strengthReq: 35, staminaReq: 50 },
  { name: "Parkour Mastery", description: "Advanced parkour and freerunning", difficulty: "hard", energyCost: 45, xpReward: 80, statReward: { strength: 1, stamina: 2, agility: 4 }, cashReward: 50, strengthReq: 50, staminaReq: 35 },

  // Legendary Adventures (3 skill requirements - all at level 50)
  { name: "Everest Base Camp", description: "Trekking to Mount Everest base camp", difficulty: "legendary", energyCost: 70, xpReward: 120, statReward: { strength: 3, stamina: 4, agility: 2 }, cashReward: 100, strengthReq: 50, staminaReq: 50 },
  { name: "Ironman World Championship", description: "Competing in the Ironman World Championship", difficulty: "legendary", energyCost: 80, xpReward: 140, statReward: { strength: 2, stamina: 5, agility: 2 }, cashReward: 120, strengthReq: 50, staminaReq: 50 },
  { name: "World's Strongest Man", description: "Competing in the World's Strongest Man competition", difficulty: "legendary", energyCost: 75, xpReward: 130, statReward: { strength: 5, stamina: 2, agility: 0 }, cashReward: 110, strengthReq: 50, staminaReq: 50 },
  { name: "Spartan Ultra Beast", description: "Completing the most challenging Spartan race", difficulty: "legendary", energyCost: 78, xpReward: 135, statReward: { strength: 3, stamina: 4, agility: 3 }, cashReward: 115, strengthReq: 50, staminaReq: 50 },
  { name: "Tour de France Stage", description: "Riding a stage of the Tour de France", difficulty: "legendary", energyCost: 85, xpReward: 150, statReward: { strength: 2, stamina: 5, agility: 1 }, cashReward: 130, strengthReq: 50, staminaReq: 50 },
  { name: "Olympic Decathlon", description: "Competing in the Olympic decathlon", difficulty: "legendary", energyCost: 80, xpReward: 140, statReward: { strength: 3, stamina: 3, agility: 3 }, cashReward: 120, strengthReq: 50, staminaReq: 50 },
  { name: "Ultra Trail du Mont-Blanc", description: "Running the legendary ultra-trail race", difficulty: "legendary", energyCost: 82, xpReward: 145, statReward: { strength: 2, stamina: 5, agility: 2 }, cashReward: 125, strengthReq: 50, staminaReq: 50 },
  { name: "Ninja Warrior Finals", description: "Competing in the Ninja Warrior finals", difficulty: "legendary", energyCost: 70, xpReward: 125, statReward: { strength: 2, stamina: 3, agility: 5 }, cashReward: 100, strengthReq: 50, staminaReq: 50 },
  { name: "Swimming English Channel", description: "Swimming across the English Channel", difficulty: "legendary", energyCost: 85, xpReward: 150, statReward: { strength: 1, stamina: 5, agility: 2 }, cashReward: 130, strengthReq: 50, staminaReq: 50 },
  { name: "Death Valley Ultra", description: "Running an ultra-marathon through Death Valley", difficulty: "legendary", energyCost: 90, xpReward: 160, statReward: { strength: 2, stamina: 5, agility: 1 }, cashReward: 140, strengthReq: 50, staminaReq: 50 }
];

async function main() {
  console.log('🌱 Seeding database...');

  // Create exercises
  const exercises = [
    // Strength exercises
    {
      id: 'dumbbell_curls',
      name: 'Dumbbell Curls',
      category: 'strength',
      baseReps: 20,
      baseEnergy: 10,
      baseXp: 10,
      statType: 'strength',
      statGainAmount: 1,
      imagePath: '/src/assets/exercises/strength/Dumbellcurls_Gym_Button.png',
    },
    {
      id: 'bench_press',
      name: 'Bench Press',
      category: 'strength',
      baseReps: 15,
      baseEnergy: 15,
      baseXp: 15,
      statType: 'strength',
      statGainAmount: 2,
      imagePath: '/src/assets/exercises/strength/Benchpress_Gym_Button.png',
    },
    {
      id: 'pull_ups',
      name: 'Pull-Ups',
      category: 'strength',
      baseReps: 12,
      baseEnergy: 18,
      baseXp: 12,
      statType: 'strength',
      statGainAmount: 3,
      imagePath: '/src/assets/exercises/strength/Pullups_Gym_Button.png',
    },
    {
      id: 'squats',
      name: 'Squats',
      category: 'strength',
      baseReps: 25,
      baseEnergy: 12,
      baseXp: 12,
      statType: 'strength',
      statGainAmount: 2,
      imagePath: '/src/assets/exercises/strength/Squats_Gym_Button.png',
    },
    {
      id: 'ab_crunches',
      name: 'Ab Crunches',
      category: 'strength',
      baseReps: 30,
      baseEnergy: 8,
      baseXp: 8,
      statType: 'strength',
      statGainAmount: 1,
      imagePath: '/src/assets/exercises/strength/Abcrunches_Gym_Button.png',
    },
    {
      id: 'shoulder_press',
      name: 'Shoulder Press',
      category: 'strength',
      baseReps: 18,
      baseEnergy: 14,
      baseXp: 14,
      statType: 'strength',
      statGainAmount: 2,
      imagePath: '/src/assets/exercises/strength/Shoulderp_Gym_Button.png',
    },
    // Endurance exercises
    {
      id: 'running',
      name: 'Running',
      category: 'endurance',
      baseReps: 30,
      baseEnergy: 15,
      baseXp: 15,
      statType: 'stamina',
      statGainAmount: 2,
    },
    {
      id: 'cycling',
      name: 'Cycling',
      category: 'endurance',
      baseReps: 25,
      baseEnergy: 12,
      baseXp: 12,
      statType: 'stamina',
      statGainAmount: 1,
    },
    {
      id: 'swimming',
      name: 'Swimming',
      category: 'endurance',
      baseReps: 20,
      baseEnergy: 18,
      baseXp: 18,
      statType: 'stamina',
      statGainAmount: 3,
    },
    {
      id: 'jump_rope',
      name: 'Jump Rope',
      category: 'endurance',
      baseReps: 40,
      baseEnergy: 10,
      baseXp: 10,
      statType: 'stamina',
      statGainAmount: 1,
    },
    {
      id: 'boxing',
      name: 'Boxing',
      category: 'endurance',
      baseReps: 35,
      baseEnergy: 16,
      baseXp: 16,
      statType: 'stamina',
      statGainAmount: 2,
    },
    {
      id: 'basketball',
      name: 'Basketball',
      category: 'endurance',
      baseReps: 28,
      baseEnergy: 13,
      baseXp: 13,
      statType: 'stamina',
      statGainAmount: 2,
    },
    // Mobility exercises
    {
      id: 'hip_flexor',
      name: 'Hip Flexor Stretch',
      category: 'mobility',
      baseReps: 30,
      baseEnergy: 8,
      baseXp: 8,
      statType: 'agility',
      statGainAmount: 1,
    },
    {
      id: 'shoulder_roll',
      name: 'Shoulder Roll Stretch',
      category: 'mobility',
      baseReps: 20,
      baseEnergy: 6,
      baseXp: 6,
      statType: 'agility',
      statGainAmount: 1,
    },
    {
      id: 'cat_cow',
      name: 'Cat-Cow Stretch',
      category: 'mobility',
      baseReps: 15,
      baseEnergy: 8,
      baseXp: 8,
      statType: 'agility',
      statGainAmount: 1,
    },
    {
      id: 'pigeon_pose',
      name: 'Pigeon Pose',
      category: 'mobility',
      baseReps: 25,
      baseEnergy: 10,
      baseXp: 10,
      statType: 'agility',
      statGainAmount: 2,
    },
    {
      id: 'downward_dog',
      name: 'Downward Dog',
      category: 'mobility',
      baseReps: 20,
      baseEnergy: 7,
      baseXp: 7,
      statType: 'agility',
      statGainAmount: 1,
    },
    {
      id: 'spinal_twist',
      name: 'Spinal Twist',
      category: 'mobility',
      baseReps: 18,
      baseEnergy: 6,
      baseXp: 6,
      statType: 'agility',
      statGainAmount: 1,
    },
  ];

  // Create exercises in database
  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { id: exercise.id },
      update: exercise,
      create: exercise,
    });
  }

  console.log(`✅ Created ${exercises.length} exercises`);

  // Create adventures in database
  for (const adventure of adventures) {
    await prisma.adventure.upsert({
      where: { 
        name_difficulty: {
          name: adventure.name,
          difficulty: adventure.difficulty
        }
      },
      update: adventure,
      create: adventure,
    });
  }

  console.log(`✅ Created ${adventures.length} adventures`);
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
