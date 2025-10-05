import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearUserData() {
  console.log('🗑️  Starting to clear all user data...');
  
  try {
    // Clear user-related data in the correct order (respecting foreign key constraints)
    console.log('📊 Clearing AdventureAttempts...');
    await prisma.adventureAttempt.deleteMany({});
    
    console.log('🔬 Clearing ResearchUpgrades...');
    await prisma.researchUpgrade.deleteMany({});
    
    console.log('💪 Clearing ExerciseProficiencies...');
    await prisma.exerciseProficiency.deleteMany({});
    
    console.log('🛒 Clearing DailyPurchases...');
    await prisma.dailyPurchase.deleteMany({});
    
    console.log('💾 Clearing Save data...');
    await prisma.save.deleteMany({});
    
    console.log('👤 Clearing Users...');
    await prisma.user.deleteMany({});
    
    console.log('✅ All user data cleared successfully!');
    console.log('');
    console.log('📋 What was cleared:');
    console.log('  - All users and their accounts');
    console.log('  - All save data (levels, XP, stats, etc.)');
    console.log('  - All exercise proficiencies');
    console.log('  - All research upgrades');
    console.log('  - All adventure attempts');
    console.log('  - All daily purchases');
    console.log('');
    console.log('🔒 What was preserved:');
    console.log('  - Exercise definitions');
    console.log('  - Adventure definitions');
    console.log('  - Shop item definitions');
    console.log('  - Database schema');
    
  } catch (error) {
    console.error('❌ Error clearing user data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
clearUserData()
  .then(() => {
    console.log('🎉 User data clearing completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to clear user data:', error);
    process.exit(1);
  });
