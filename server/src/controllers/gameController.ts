import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// XP Curve System
const LMAX = 50;
const BASE_REQ = 20;
const GROWTH = 1.092795;

function xpToNext(n: number) {
  return Math.round(BASE_REQ * Math.pow(GROWTH, n - 1));
}

function totalXpTo(L: number) {
  const r = GROWTH, A = BASE_REQ;
  return Math.round(A * (Math.pow(r, L) - 1) / (r - 1));
}

function levelFromXp(totalXp: number) {
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

// Advanced Proficiency System
const K = 2.2;
const intensityMul = (i: 1|2|3|4|5) => 1 + 0.25 * (i - 1);
const gradeMul = (g: "perfect"|"good"|"okay"|"miss") =>
  g === "perfect" ? 1.2 : g === "good" ? 1.0 : g === "okay" ? 0.8 : 0.4;
const DR = (p: number) => 1 - Math.pow(p / 1000, 0.8);
const dayDR = (x: number) => (x <= 30 ? 1 : Math.sqrt(30 / x));

// Proficiency points system
const ppForLevel = (n: number) => 1 + Math.floor((n - 1) / 10);
const calculatePPGained = (newLevel: number) => {
  if (newLevel <= 1) return 0;
  return ppForLevel(newLevel);
};

function gainProficiency(
  proficiency: number,
  dailyEnergy: number,
  energySpent: number,
  intensity: 1|2|3|4|5 = 3,
  grade: "perfect"|"good"|"okay"|"miss" = "good"
) {
  const delta = Math.max(
    6,
    K * energySpent * intensityMul(intensity) * gradeMul(grade) * DR(proficiency) * dayDR(dailyEnergy)
  );
  const newProficiency = Math.min(1000, proficiency + Math.round(delta));
  const newDailyEnergy = dailyEnergy + energySpent;
  return { newProficiency, newDailyEnergy, deltaGained: Math.round(delta) };
}

const workoutSchema = z.object({
  type: z.enum(['strength', 'endurance', 'mobility']),
  exerciseId: z.string(),
  reps: z.number().int().min(1).max(300).optional(),
  intensity: z.number().int().min(1).max(5).optional(),
  grade: z.enum(['perfect', 'good', 'okay', 'miss']).optional(),
});

export const getSave = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const save = await prisma.save.findUnique({ 
      where: { userId },
      include: {
        ExerciseProficiencies: {
          include: {
            Exercise: true
          }
        },
        ResearchUpgrades: {
          include: {
            Exercise: true
          }
        }
      }
    });
    
    if (!save) {
      return res.status(404).json({ error: 'Save not found. Please contact support.' });
    }

    // Check if we need to reset daily limits (automatic daily reset)
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    const lastDailyResetDate = save.lastDailyReset ? new Date(save.lastDailyReset).toISOString().slice(0, 10) : null;
    
    console.log(`Daily reset check for user ${userId}:`);
    console.log(`  Today: ${todayKey}`);
    console.log(`  Last reset: ${lastDailyResetDate}`);
    console.log(`  Should reset: ${todayKey !== lastDailyResetDate}`);
    
    // If it's a new day, automatically reset daily limits and rotate content
    if (todayKey !== lastDailyResetDate) {
      console.log(`🔄 NEW DAY DETECTED! Resetting daily limits for user ${userId}`);
      console.log(`  Today: ${todayKey}, Last reset: ${lastDailyResetDate}`);
      
      // Reset daily stat gains for all exercises
      await prisma.exerciseProficiency.updateMany({
        where: { userId },
        data: {
          dailyStatGains: 0,
          dailyEnergy: 0,
          lastDailyReset: today
        }
      });

      // Generate new rotation seeds for shop and adventures
      const newShopRotationSeed = Math.floor(Math.random() * 1000000);
      const newAdventureRotationSeed = Math.floor(Math.random() * 1000000);

        // Update save data with new rotation seeds and reset energy
        await prisma.save.update({
          where: { userId },
          data: {
            energy: save.maxEnergy || 100,
            lastDailyReset: today,
            shopRotationSeed: newShopRotationSeed,
            lastShopRotation: today,
            adventureRotationSeed: newAdventureRotationSeed,
            lastAdventureRotation: today,
            dailyAdventureAttempts: 0,
            lastAdventureReset: today
          }
        });

      console.log(`✅ Daily reset completed for user ${userId}`);
      console.log(`  - Energy reset to ${save.maxEnergy || 100}`);
      console.log(`  - Daily adventure attempts reset to 0`);
      console.log(`  - Shop rotation seed: ${newShopRotationSeed}`);
      console.log(`  - Adventure rotation seed: ${newAdventureRotationSeed}`);
    }
    
    console.log('getSave response:', {
      userId,
      researchUpgrades: save.ResearchUpgrades,
      researchUpgradesCount: save.ResearchUpgrades?.length || 0
    });
    
    // Fetch updated save data after potential reset
    const updatedSave = await prisma.save.findUnique({ 
      where: { userId },
      include: {
        ExerciseProficiencies: {
          include: {
            Exercise: true
          }
        },
        ResearchUpgrades: {
          include: {
            Exercise: true
          }
        }
      }
    });
    
    res.json(updatedSave);
  } catch (error) {
    console.error('Get save error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const doWorkout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('=== WORKOUT START ===');
    const userId = req.user!.userId;
    console.log('User ID:', userId);
    console.log('Workout request body:', req.body);
    const parse = workoutSchema.safeParse(req.body);
    
    if (!parse.success) {
      console.log('Validation error:', parse.error.flatten());
      return res.status(400).json({ error: parse.error.flatten() });
    }

    // Get exercise data
    const exercise = await prisma.exercise.findUnique({
      where: { id: parse.data.exerciseId }
    });

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    // Load save with research upgrades & do daily reset check
    const save = await prisma.save.findUnique({ 
      where: { userId },
      include: {
        ResearchUpgrades: {
          where: {
            exerciseId: parse.data.exerciseId,
            isActive: true
          }
        }
      }
    });
    if (!save) {
      return res.status(404).json({ error: 'Save not found' });
    }

    const now = new Date();
    const last = save.lastEnergyResetDate ? new Date(save.lastEnergyResetDate) : null;
    const todayKey = now.toISOString().slice(0, 10);
    const lastKey = last ? last.toISOString().slice(0, 10) : null;
    let energy = save.energy;

    if (todayKey !== lastKey) {
      // Reset daily energy
      energy = 100;
    }

    // Use exercise data or provided reps
    const reps = parse.data.reps || exercise.baseReps;
    let energySpent = exercise.baseEnergy;
    let xpGained = exercise.baseXp;

    // Apply research tier effects
    const researchUpgrade = save.ResearchUpgrades[0]; // Should be only one active upgrade per exercise
    if (researchUpgrade) {
      console.log(`Applying research tier ${researchUpgrade.tier} effects for ${exercise.name}`);
      
      // Tier 1: Energy Efficiency - 5% less energy cost
      if (researchUpgrade.tier >= 1) {
        energySpent = Math.round(energySpent * 0.95);
      }
      
      // Tier 3: XP Yield - 10% more character XP
      if (researchUpgrade.tier >= 3) {
        xpGained = Math.round(xpGained * 1.1);
      }
    }

    // Check if user has enough energy
    if (energy < energySpent) {
      return res.status(400).json({ error: 'Not enough energy' });
    }

    // Calculate stat gains based on exercise stat type and daily limits
    const statGains = { strength: 0, stamina: 0, agility: 0 };

    // Get intensity and grade from request (with defaults)
    const intensity = (parse.data.intensity || 3) as 1|2|3|4|5;
    const grade = (parse.data.grade || "good") as "perfect"|"good"|"okay"|"miss";

    // Calculate proficiency gain before transaction
    const existingProficiency = await prisma.exerciseProficiency.findUnique({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId: exercise.id
        }
      }
    });

    const currentProficiency = existingProficiency?.proficiency || 0;
    const currentDailyEnergy = existingProficiency?.dailyEnergy || 0;
    const currentDailyStatGains = existingProficiency?.dailyStatGains || 0;
    
    // Check if we need to reset daily tracking
    const lastReset = existingProficiency?.lastDailyReset ? new Date(existingProficiency.lastDailyReset) : null;
    const lastResetKey = lastReset ? lastReset.toISOString().slice(0, 10) : null;
    const shouldResetDaily = todayKey !== lastResetKey;
    
    // Check if user has exceeded daily stat gain limit (5 per exercise)
    const maxDailyStatGains = 5;
    
    if (currentDailyStatGains >= maxDailyStatGains) {
      console.log(`Daily stat gain limit reached for ${exercise.name} (${currentDailyStatGains}/${maxDailyStatGains})`);
      // No stat gains, but still allow proficiency and XP gains
    } else {
      // Use exercise's stat gain amount instead of calculating from reps
      let statGainAmount = exercise.statGainAmount;
      
      // Apply Tier 2: Output Boost - 5% more stat gain
      if (researchUpgrade && researchUpgrade.tier >= 2) {
        statGainAmount = Math.round(statGainAmount * 1.05);
      }
      
      switch (exercise.statType) {
        case 'strength':
          statGains.strength = statGainAmount;
          break;
        case 'stamina':
          statGains.stamina = statGainAmount;
          break;
        case 'agility':
          statGains.agility = statGainAmount;
          break;
      }
    }
    
    // Calculate final stats after stat gains are determined
    const newEnergy = energy - energySpent;
    const newXp = save.xp + xpGained;
    const newLevel = levelFromXp(newXp);
    const newStrength = save.strength + statGains.strength;
    const newStamina = save.stamina + statGains.stamina;
    const newAgility = save.agility + statGains.agility;
    
    // Calculate proficiency points gained from level up
    const oldLevel = save.level;
    const ppGained = newLevel > oldLevel ? calculatePPGained(newLevel) : 0;
    const newProficiencyPoints = save.proficiencyPoints + ppGained;
    
    // Calculate base proficiency gain (use reset daily values if needed)
    const dailyEnergyForCalc = shouldResetDaily ? 0 : currentDailyEnergy;
    let proficiencyResult = gainProficiency(
      currentProficiency,
      dailyEnergyForCalc,
      energySpent,
      intensity,
      grade
    );

    // Apply Tier 4: Signature Move - 5% more proficiency gain
    if (researchUpgrade && researchUpgrade.tier >= 4) {
      proficiencyResult.deltaGained = Math.round(proficiencyResult.deltaGained * 1.05);
      proficiencyResult.newProficiency = Math.min(1000, currentProficiency + proficiencyResult.deltaGained);
    }

    // Calculate new daily stat gains for response
    const newDailyStatGains = shouldResetDaily ? 
      (statGains.strength + statGains.stamina + statGains.agility > 0 ? 1 : 0) :
      (currentDailyStatGains + (statGains.strength + statGains.stamina + statGains.agility > 0 ? 1 : 0));

    await prisma.$transaction(async (tx) => {
          // Update save
          await tx.save.update({
            where: { userId },
            data: {
              energy: newEnergy,
              xp: newXp,
              level: newLevel,
              strength: newStrength,
              stamina: newStamina,
              agility: newAgility,
              proficiencyPoints: newProficiencyPoints,
              lastEnergyResetDate: new Date(),
            },
          });

      // Create workout record
      await tx.workout.create({
        data: {
          userId,
          exerciseId: exercise.id,
          type: exercise.category,
          reps,
          energySpent,
          xpGained,
          statGains: statGains,
        },
      });

      // Update or create exercise proficiency using new system
      console.log(`Proficiency update for ${exercise.name}:`, {
        userId,
        exerciseId: exercise.id,
        currentProficiency,
        currentDailyEnergy,
        currentDailyStatGains,
        shouldResetDaily,
        intensity,
        grade,
        deltaGained: proficiencyResult.deltaGained,
        newProficiency: proficiencyResult.newProficiency,
        statGains,
        newDailyStatGains
      });

      if (existingProficiency) {
        await tx.exerciseProficiency.update({
          where: { id: existingProficiency.id },
          data: {
            proficiency: proficiencyResult.newProficiency,
            dailyEnergy: shouldResetDaily ? energySpent : proficiencyResult.newDailyEnergy,
            dailyStatGains: newDailyStatGains,
            lastDailyReset: shouldResetDaily ? now : existingProficiency.lastDailyReset,
            totalReps: existingProficiency.totalReps + reps,
          }
        });
        console.log(`Updated proficiency from ${currentProficiency} to ${proficiencyResult.newProficiency}, daily stat gains: ${newDailyStatGains}`);
      } else {
        await tx.exerciseProficiency.create({
          data: {
            userId,
            exerciseId: exercise.id,
            proficiency: proficiencyResult.newProficiency,
            dailyEnergy: energySpent,
            dailyStatGains: statGains.strength + statGains.stamina + statGains.agility > 0 ? 1 : 0,
            lastDailyReset: now,
            totalReps: reps,
          }
        });
        console.log(`Created new proficiency: ${proficiencyResult.newProficiency}, daily stat gains: ${statGains.strength + statGains.stamina + statGains.agility > 0 ? 1 : 0}`);
      }
    });

        console.log('=== WORKOUT SUCCESS ===');
        res.json({ 
          energySpent, 
          xpGained, 
          energyAfter: newEnergy, 
          xpAfter: newXp,
          levelAfter: newLevel,
          proficiencyGained: proficiencyResult.deltaGained,
          ppGained,
          proficiencyPointsAfter: newProficiencyPoints,
          statGains,
          dailyStatGainsUsed: newDailyStatGains,
          maxDailyStatGains: 5,
          statsAfter: {
            strength: newStrength,
            stamina: newStamina,
            agility: newAgility,
            level: newLevel,
            xp: newXp
          }
        });
  } catch (error) {
    console.error('Workout error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const resetEnergy = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Update energy to 100
    const updatedSave = await prisma.save.update({
      where: { userId },
      data: {
        energy: 100,
        lastEnergyResetDate: new Date(),
      },
    });

    res.json({ 
      message: 'Energy reset to 100%',
      energy: updatedSave.energy 
    });
  } catch (error) {
    console.error('Energy reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getExercises = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const exercises = await prisma.exercise.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    res.json(exercises);
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProficiencies = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    const proficiencies = await prisma.exerciseProficiency.findMany({
      where: { userId },
      include: {
        Exercise: true
      }
    });
    
    res.json(proficiencies);
  } catch (error) {
    console.error('Get proficiencies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const upgradeExercise = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { exerciseId, tier } = req.body;
    
    console.log('Upgrade request:', { userId, exerciseId, tier });
    
    // Validate tier
    if (!tier || tier < 1 || tier > 4) {
      console.log('Invalid tier:', tier);
      return res.status(400).json({ error: 'Invalid tier. Must be 1-4.' });
    }
    
    // Check if exercise exists
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId }
    });
    
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    
    // Check proficiency requirement (1000)
    const proficiency = await prisma.exerciseProficiency.findUnique({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId
        }
      }
    });
    
    console.log('Proficiency check:', { proficiency: proficiency?.proficiency, required: 1000 });
    
    if (!proficiency || proficiency.proficiency < 1000) {
      console.log('Proficiency requirement not met');
      return res.status(400).json({ error: 'Exercise must reach 1000 proficiency first' });
    }
    
    // Check proficiency points
    const save = await prisma.save.findUnique({
      where: { userId }
    });
    
    if (!save) {
      return res.status(404).json({ error: 'Save not found' });
    }
    
    const tierCosts = { 1: 2, 2: 4, 3: 6, 4: 8 };
    const cost = tierCosts[tier as keyof typeof tierCosts];
    
    if (save.proficiencyPoints < cost) {
      return res.status(400).json({ error: `Not enough proficiency points. Need ${cost}, have ${save.proficiencyPoints}` });
    }
    
    // Check if already upgraded to this tier or higher
    const existingUpgrade = await prisma.researchUpgrade.findUnique({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId
        }
      }
    });
    
    if (existingUpgrade && existingUpgrade.tier >= tier) {
      return res.status(400).json({ error: 'Already upgraded to this tier or higher' });
    }
    
    await prisma.$transaction(async (tx) => {
      // Deduct proficiency points
      await tx.save.update({
        where: { userId },
        data: {
          proficiencyPoints: save.proficiencyPoints - cost
        }
      });
      
      // Create or update research upgrade
      if (existingUpgrade) {
        await tx.researchUpgrade.update({
          where: { id: existingUpgrade.id },
          data: { tier }
        });
      } else {
        await tx.researchUpgrade.create({
          data: {
            userId,
            exerciseId,
            tier
          }
        });
      }
      
      // Soft reset proficiency to 700 (70%)
      await tx.exerciseProficiency.update({
        where: { id: proficiency.id },
        data: {
          proficiency: 700
        }
      });
    });
    
    res.json({ 
      message: `Successfully upgraded ${exercise.name} to tier ${tier}`,
      proficiencyPoints: save.proficiencyPoints - cost,
      newProficiency: 700
    });
  } catch (error) {
    console.error('Upgrade exercise error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getResearchUpgrades = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    const upgrades = await prisma.researchUpgrade.findMany({
      where: { userId },
      include: {
        Exercise: true
      }
    });
    
    res.json(upgrades);
  } catch (error) {
    console.error('Get research upgrades error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
