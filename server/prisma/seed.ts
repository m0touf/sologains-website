import { PrismaClient } from '@prisma/client';
import { adventures } from './adventureSeed';
import seedShopItems from './shopSeed';

const prisma = new PrismaClient();


async function main() {
  console.log('🌱 Seeding database...');

  // Create exercises
  const exercises = [
    // Strength exercises
    {
      name: 'Dumbbell Curls',
      category: 'strength',
      baseReps: 20,
      baseEnergy: 20,
      baseXp: 20,
      statType: 'strength',
      statGainAmount: 1,
      imagePath: '/src/assets/exercises/strength/Dumbellcurls_Gym_Button.png',
    },
    {
      name: 'Bench Press',
      category: 'strength',
      baseReps: 15,
      baseEnergy: 30,
      baseXp: 30,
      statType: 'strength',
      statGainAmount: 2,
      imagePath: '/src/assets/exercises/strength/Benchpress_Gym_Button.png',
    },
    {
      name: 'Pull-Ups',
      category: 'strength',
      baseReps: 12,
      baseEnergy: 35,
      baseXp: 25,
      statType: 'strength',
      statGainAmount: 3,
      imagePath: '/src/assets/exercises/strength/Pullups_Gym_Button.png',
    },
    {
      name: 'Squats',
      category: 'strength',
      baseReps: 25,
      baseEnergy: 25,
      baseXp: 25,
      statType: 'strength',
      statGainAmount: 2,
      imagePath: '/src/assets/exercises/strength/Squats_Gym_Button.png',
    },
    {
      name: 'Ab Crunches',
      category: 'strength',
      baseReps: 30,
      baseEnergy: 15,
      baseXp: 15,
      statType: 'strength',
      statGainAmount: 1,
      imagePath: '/src/assets/exercises/strength/Abcrunches_Gym_Button.png',
    },
    {
      name: 'Shoulder Press',
      category: 'strength',
      baseReps: 18,
      baseEnergy: 28,
      baseXp: 28,
      statType: 'strength',
      statGainAmount: 2,
      imagePath: '/src/assets/exercises/strength/Shoulderp_Gym_Button.png',
    },
    // Endurance exercises
    {
      name: 'Running',
      category: 'endurance',
      baseReps: 30,
      baseEnergy: 30,
      baseXp: 30,
      statType: 'stamina',
      statGainAmount: 2,
      imagePath: '/src/assets/exercises/endurance/Running_Gym_Button.png',
    },
    {
      name: 'Cycling',
      category: 'endurance',
      baseReps: 25,
      baseEnergy: 25,
      baseXp: 25,
      statType: 'stamina',
      statGainAmount: 1,
      imagePath: '/src/assets/exercises/endurance/Cycling_Gym_Button.png',
    },
    {
      name: 'Swimming',
      category: 'endurance',
      baseReps: 20,
      baseEnergy: 35,
      baseXp: 35,
      statType: 'stamina',
      statGainAmount: 3,
      imagePath: '/src/assets/exercises/endurance/Swimming_Gym_Button.png',
    },
    {
      name: 'Jump Rope',
      category: 'endurance',
      baseReps: 40,
      baseEnergy: 20,
      baseXp: 20,
      statType: 'stamina',
      statGainAmount: 1,
      imagePath: '/src/assets/exercises/endurance/Jumprope_Gym_Button.png',
    },
    {
      name: 'Boxing',
      category: 'endurance',
      baseReps: 35,
      baseEnergy: 32,
      baseXp: 32,
      statType: 'stamina',
      statGainAmount: 2,
      imagePath: '/src/assets/exercises/endurance/Boxing_Gym_Button.png',
    },
    {
      name: 'Basketball',
      category: 'endurance',
      baseReps: 28,
      baseEnergy: 28,
      baseXp: 28,
      statType: 'stamina',
      statGainAmount: 2,
      imagePath: '/src/assets/exercises/endurance/Basketball_Gym_Button.png',
    },
    // Mobility exercises
    {
      name: 'Hip Flexor Stretch',
      category: 'mobility',
      baseReps: 30,
      baseEnergy: 15,
      baseXp: 15,
      statType: 'mobility',
      statGainAmount: 1,
      imagePath: '/src/assets/exercises/mobility/Hipflexorstretch_Gym_Button.png',
    },
    {
      name: 'Shoulder Roll Stretch',
      category: 'mobility',
      baseReps: 20,
      baseEnergy: 12,
      baseXp: 12,
      statType: 'mobility',
      statGainAmount: 1,
      imagePath: '/src/assets/exercises/mobility/Shoulderrollstretch_Gym_Button.png',
    },
    {
      name: 'Cat-Cow Stretch',
      category: 'mobility',
      baseReps: 15,
      baseEnergy: 15,
      baseXp: 15,
      statType: 'mobility',
      statGainAmount: 1,
      imagePath: '/src/assets/exercises/mobility/Catcowstretch_Gym_Button.png',
    },
    {
      name: 'Pigeon Pose',
      category: 'mobility',
      baseReps: 25,
      baseEnergy: 20,
      baseXp: 20,
      statType: 'mobility',
      statGainAmount: 2,
      imagePath: '/src/assets/exercises/mobility/Pigeonpose_Gym_Button.png',
    },
    {
      name: 'Downward Dog',
      category: 'mobility',
      baseReps: 20,
      baseEnergy: 18,
      baseXp: 18,
      statType: 'mobility',
      statGainAmount: 1,
      imagePath: '/src/assets/exercises/mobility/Downwardsdog_Gym_Button.png',
    },
    {
      name: 'Spinal Twist',
      category: 'mobility',
      baseReps: 18,
      baseEnergy: 12,
      baseXp: 12,
      statType: 'mobility',
      statGainAmount: 1,
      imagePath: '/src/assets/exercises/mobility/Spinaltwist_Gym_Button.png',
    },
  ];

  // Create exercises in database
  for (const exercise of exercises) {
    await prisma.exercise.create({
      data: exercise,
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

  // Seed shop items
  await seedShopItems();

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
