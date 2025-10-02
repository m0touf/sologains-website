import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
