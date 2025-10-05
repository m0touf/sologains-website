import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';
import logger from '../utils/logger';
import { 
  computeEnergyFloat, 
  getCappedEnergy, 
  getEnergyWithOvercap, 
  scaleXpReward,
  levelFromXp,
  calculateProficiencyGain,
  calculateProficiencyPointsGained,
  calculateAllStatGains,
  getResearchBenefits,
  getAllResearchBenefits,
  canUnlockTier,
  getTierCost
} from '../config';

const prisma = new PrismaClient();

// All math functions are now imported from config files

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
      logger.info(`Creating new save for user ${userId}`);
      // Create a new save record for the user
      const newSave = await prisma.save.create({
        data: {
          userId: userId,
          level: 1,
          xp: 0,
          energy: 150.0,
          lastEnergyUpdate: new Date(),
          strength: 1,
          stamina: 1,
          mobility: 1,
          proficiencyPoints: 0,
          cash: 500,
          maxEnergy: 150.0,
        },
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
      
      // Return the newly created save
      return res.json({
        ...newSave,
        fractionalEnergy: newSave.energy
      });
    }

    // Update energy based on time elapsed
    const now = new Date();
    const currentEnergy = computeEnergyFloat(save.energy, save.lastEnergyUpdate, now);
    // For regeneration, cap at 150. Overcap only applies to manual actions
    const cappedEnergy = getCappedEnergy(currentEnergy);
    
    // Update energy in database if it changed
    if (Math.abs(currentEnergy - save.energy) > 0.01) {
      await prisma.save.update({
        where: { userId },
        data: {
          energy: currentEnergy,
          lastEnergyUpdate: now
        }
      });
    }

    // Check if we need to reset daily limits (automatic daily reset)
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    const lastDailyResetDate = save.lastDailyReset ? new Date(save.lastDailyReset).toISOString().slice(0, 10) : null;
    
    
    // If it's a new day, automatically reset daily limits and rotate content
    if (todayKey !== lastDailyResetDate) {
      logger.info(`Daily reset for user ${userId}: ${todayKey} (was ${lastDailyResetDate})`);
      
      // Reset daily stat gains for all exercises
      await prisma.exerciseProficiency.updateMany({
        where: { userId },
        data: {
          dailyStatGains: 0,
          dailyEnergy: 0,
          lastDailyReset: today
        }
      });

      // Clear daily purchases (shop items become available again)
      await prisma.dailyPurchase.deleteMany({
        where: { userId }
      });

      // Generate new rotation seeds for shop and adventures
      const newShopRotationSeed = Math.floor(Math.random() * 1000000);
      const newAdventureRotationSeed = Math.floor(Math.random() * 1000000);

        // Update save data with new rotation seeds (no energy reset)
        await prisma.save.update({
          where: { userId },
          data: {
            lastDailyReset: today,
            shopRotationSeed: newShopRotationSeed,
            lastShopRotation: today,
            adventureRotationSeed: newAdventureRotationSeed,
            lastAdventureRotation: today,
            dailyAdventureAttempts: 0,
            lastAdventureReset: today
          }
        });

    }
    
    
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
    
    res.json({
      ...updatedSave,
      energy: Math.floor(cappedEnergy),
      fractionalEnergy: cappedEnergy, // Use capped energy for regeneration
      maxEnergy: updatedSave?.maxEnergy || 150
    });
  } catch (error) {
    logger.error('Get save error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const doWorkout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const parse = workoutSchema.safeParse(req.body);
    
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.flatten() });
    }

    // Get exercise data
    const exercise = await prisma.exercise.findUnique({
      where: { id: parse.data.exerciseId }
    });

    if (!exercise) {
      logger.error(`Exercise not found: ${parse.data.exerciseId}`);
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
      logger.error(`Save not found for user ${userId} during workout`);
      return res.status(404).json({ error: 'Save not found' });
    }

    const now = new Date();
    
    // Update energy based on time elapsed
    const currentEnergy = computeEnergyFloat(save.energy, save.lastEnergyUpdate, now);
    const cappedEnergy = getCappedEnergy(currentEnergy);
    
    // Update energy in database
    await prisma.save.update({
      where: { userId },
      data: {
        energy: currentEnergy,
        lastEnergyUpdate: now
      }
    });

    const energy = Math.floor(cappedEnergy);

    // Use exercise data or provided reps
    const reps = parse.data.reps || exercise.baseReps;
    let energySpent = exercise.baseEnergy;
    let xpGained = exercise.baseXp;

    // Apply research tier effects
    const researchUpgrade = save.ResearchUpgrades[0]; // Should be only one active upgrade per exercise
    if (researchUpgrade) {
      
      // Tier 1: Energy Efficiency - 5% less energy cost
      if (researchUpgrade.tier >= 1) {
        energySpent = Math.round(energySpent * 0.95);
      }
      
      // Tier 3: XP Yield - 10% more character XP
      if (researchUpgrade.tier >= 3) {
        xpGained = Math.round(xpGained * 1.1);
      }
    }

    // Apply XP boost if available
    if (save.xpBoostRemaining && save.xpBoostRemaining > 0) {
      xpGained = Math.round(xpGained * 2); // Double XP
    }

    // Scale XP to maintain 6-month pacing with new energy system
    xpGained = scaleXpReward(xpGained);

    // Apply luck boost for bonus rewards
    let bonusReward = false;
    if (save.luckBoostPercent && save.luckBoostPercent > 0) {
      const luckChance = save.luckBoostPercent / 100; // Convert percentage to decimal
      if (Math.random() < luckChance) {
        bonusReward = true;
        xpGained = Math.round(xpGained * 1.5); // 50% bonus XP
      }
    }

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
    const todayKey = now.toISOString().slice(0, 10);
    const lastReset = existingProficiency?.lastDailyReset ? new Date(existingProficiency.lastDailyReset) : null;
    const lastResetKey = lastReset ? lastReset.toISOString().slice(0, 10) : null;
    const shouldResetDaily = todayKey !== lastResetKey;
    
    // Check if user has exceeded daily stat gain limit (5 per exercise)
    const maxDailyStatGains = 5;
    
    // Calculate stat gains using centralized function
    let statGains = { strength: 0, stamina: 0, mobility: 0 };
    
    if (currentDailyStatGains < maxDailyStatGains) {
      // Use exercise's stat gain amount instead of calculating from reps
      let statGainAmount = exercise.statGainAmount;
      
      // Apply Tier 2: Output Boost - 5% more stat gain
      if (researchUpgrade && researchUpgrade.tier >= 2) {
        statGainAmount = Math.round(statGainAmount * 1.05);
      }
      
      // Use centralized stat gain calculation
      const calculatedGains = calculateAllStatGains(
        energySpent,
        intensity,
        grade,
        { strength: save.strength, stamina: save.stamina, mobility: save.mobility }
      );
      
      // Apply the stat gain amount to the appropriate stat
      switch (exercise.statType) {
        case 'strength':
          statGains.strength = statGainAmount;
          break;
        case 'stamina':
          statGains.stamina = statGainAmount;
          break;
        case 'mobility':
          statGains.mobility = statGainAmount;
          break;
      }
    } else {
    }
    
    // Calculate final stats after stat gains are determined (will be recalculated in transaction)
    const newXp = save.xp + xpGained;
    const newLevel = levelFromXp(newXp);
    const newStrength = save.strength + statGains.strength;
    const newStamina = save.stamina + statGains.stamina;
    const newMobility = save.mobility + statGains.mobility;
    
    // Calculate proficiency points gained from level up
    const oldLevel = save.level;
    const ppGained = newLevel > oldLevel ? calculateProficiencyPointsGained(newLevel) : 0;
    const newProficiencyPoints = save.proficiencyPoints + ppGained;
    
    // Calculate base proficiency gain (use reset daily values if needed)
    const dailyEnergyForCalc = shouldResetDaily ? 0 : currentDailyEnergy;
    let proficiencyResult = calculateProficiencyGain(
      currentProficiency,
      dailyEnergyForCalc,
      energySpent,
      intensity,
      grade
    );

    // Apply Tier 4: Signature Move - 5% more proficiency gain
    if (researchUpgrade && researchUpgrade.tier >= 4) {
      proficiencyResult.proficiencyGained = Math.round(proficiencyResult.proficiencyGained * 1.05);
      proficiencyResult.newProficiency = Math.min(1000, currentProficiency + proficiencyResult.proficiencyGained);
    }

    // Apply proficiency boost if available
    if (save.proficiencyBoostRemaining && save.proficiencyBoostRemaining > 0) {
      proficiencyResult.proficiencyGained = Math.round(proficiencyResult.proficiencyGained * 2); // Double proficiency gain
      proficiencyResult.newProficiency = Math.min(1000, currentProficiency + proficiencyResult.proficiencyGained);
    }

    // Calculate new daily stat gains for response
    const newDailyStatGains = shouldResetDaily ? 
      (statGains.strength + statGains.stamina + statGains.mobility > 0 ? 1 : 0) :
      (currentDailyStatGains + (statGains.strength + statGains.stamina + statGains.mobility > 0 ? 1 : 0));

    const result = await prisma.$transaction(async (tx) => {
      // CRITICAL: Re-check energy inside transaction to prevent race conditions
      const currentSave = await tx.save.findUnique({ where: { userId } });
      if (!currentSave) {
        logger.error(`Save not found during transaction for user ${userId}`);
        throw new Error('Save not found during transaction');
      }
      
      // Recalculate energy with current time
      const transactionTime = new Date();
      const transactionEnergy = computeEnergyFloat(currentSave.energy, currentSave.lastEnergyUpdate, transactionTime);
      const transactionCappedEnergy = getCappedEnergy(transactionEnergy);
      const transactionEnergyInt = Math.floor(transactionCappedEnergy);
      
      // Check if user has enough energy (inside transaction to prevent race conditions)
      if (transactionEnergyInt < energySpent) {
        throw new Error('Not enough energy');
      }
      
      // Recalculate final energy using transaction values
      const finalNewEnergy = transactionEnergy - energySpent;
      
      // Update save
      await tx.save.update({
        where: { userId },
        data: {
          energy: finalNewEnergy,
              xp: newXp,
              level: newLevel,
              strength: newStrength,
              stamina: newStamina,
              mobility: newMobility,
              proficiencyPoints: newProficiencyPoints,
              xpBoostRemaining: save.xpBoostRemaining && save.xpBoostRemaining > 0 ? save.xpBoostRemaining - 1 : 0,
              proficiencyBoostRemaining: save.proficiencyBoostRemaining && save.proficiencyBoostRemaining > 0 ? save.proficiencyBoostRemaining - 1 : 0,
              lastEnergyUpdate: now,
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
      } else {
        await tx.exerciseProficiency.create({
          data: {
            userId,
            exerciseId: exercise.id,
            proficiency: proficiencyResult.newProficiency,
            dailyEnergy: energySpent,
            dailyStatGains: statGains.strength + statGains.stamina + statGains.mobility > 0 ? 1 : 0,
            lastDailyReset: now,
            totalReps: reps,
          }
        });
      }
      
      return { finalNewEnergy };
    });

        res.json({ 
          energySpent, 
          xpGained, 
          energyAfter: Math.floor(result.finalNewEnergy), 
          fractionalEnergyAfter: result.finalNewEnergy, // Include fractional energy
          xpAfter: newXp,
          levelAfter: newLevel,
          proficiencyGained: proficiencyResult.proficiencyGained,
          ppGained,
          proficiencyPointsAfter: newProficiencyPoints,
          statGains,
          dailyStatGainsUsed: newDailyStatGains,
          maxDailyStatGains: 5,
          statsAfter: {
            strength: newStrength,
            stamina: newStamina,
            mobility: newMobility,
            level: newLevel,
            xp: newXp
          },
          xpBoostRemaining: save.xpBoostRemaining && save.xpBoostRemaining > 0 ? save.xpBoostRemaining - 1 : 0,
          proficiencyBoostRemaining: save.proficiencyBoostRemaining && save.proficiencyBoostRemaining > 0 ? save.proficiencyBoostRemaining - 1 : 0,
          bonusReward: bonusReward,
          luckBoostPercent: save.luckBoostPercent || 0
        });
  } catch (error) {
    logger.error('Workout error:', error);
    logger.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const resetEnergy = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Get current save to check max energy
    const save = await prisma.save.findUnique({
      where: { userId }
    });

    if (!save) {
      logger.error(`Save not found for user ${userId} during energy reset`);
      return res.status(404).json({ error: 'Save not found' });
    }

    // Reset energy to max (with overcap buffer for level-ups)
    const maxEnergy = (save.maxEnergy || 150) + (save.permanentEnergy || 0);
    const resetEnergy = getEnergyWithOvercap(maxEnergy); // Use config function for consistency

    const updatedSave = await prisma.save.update({
      where: { userId },
      data: {
        energy: resetEnergy,
        lastEnergyUpdate: new Date(),
      },
    });

    res.json({ 
      message: 'Energy reset to maximum',
      energy: Math.floor(resetEnergy),
      fractionalEnergy: resetEnergy // Include fractional energy
    });
  } catch (error) {
    logger.error('Energy reset error:', error);
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
    logger.error('Get exercises error:', error);
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
    logger.error('Get proficiencies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const upgradeExercise = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { exerciseId, tier } = req.body;
    
    
    // Validate tier
    if (!tier || tier < 1 || tier > 4) {
      return res.status(400).json({ error: 'Invalid tier. Must be 1-4.' });
    }
    
    // Check if exercise exists
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId }
    });
    
    if (!exercise) {
      logger.error(`Exercise not found for research upgrade: ${exerciseId}`);
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
    
    
    if (!proficiency || proficiency.proficiency < 1000) {
      return res.status(400).json({ error: 'Exercise must reach 1000 proficiency first' });
    }
    
    // Check proficiency points
    const save = await prisma.save.findUnique({
      where: { userId }
    });
    
    if (!save) {
      logger.error(`Save not found for user ${userId} during research upgrade`);
      return res.status(404).json({ error: 'Save not found' });
    }
    
    // Get tier cost from research config
    const cost = getTierCost(exerciseId, tier);
    
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
    
    // Check tier ladder requirement
    const currentTier = existingUpgrade ? existingUpgrade.tier : 0;
    if (!canUnlockTier(exerciseId, tier, currentTier)) {
      return res.status(400).json({ error: `Must unlock tier ${tier - 1} first` });
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
    
    // Get the benefits for this tier
    const benefits = getResearchBenefits(exerciseId, tier);
    
    res.json({ 
      message: `Successfully upgraded ${exercise.name} to tier ${tier}`,
      proficiencyPoints: save.proficiencyPoints - cost,
      newProficiency: 700,
      benefits: benefits
    });
  } catch (error) {
    logger.error('Upgrade exercise error:', error);
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
    
    // Add benefits information to each upgrade
    const upgradesWithBenefits = upgrades.map(upgrade => ({
      ...upgrade,
      benefits: getResearchBenefits(upgrade.exerciseId, upgrade.tier)
    }));
    
    res.json(upgradesWithBenefits);
  } catch (error) {
    logger.error('Get research upgrades error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// New endpoint to get all available research options
export const getAvailableResearch = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    // Get all exercises with their proficiencies
    const exercises = await prisma.exercise.findMany({
      include: {
        ExerciseProficiencies: {
          where: { userId }
        }
      }
    });
    
    // Get current research upgrades
    const currentUpgrades = await prisma.researchUpgrade.findMany({
      where: { userId }
    });
    
    const upgradeMap = new Map(currentUpgrades.map(u => [u.exerciseId, u.tier]));
    
    // Build available research options
    const availableResearch = exercises.map(exercise => {
      const proficiency = exercise.ExerciseProficiencies[0];
      const currentTier = upgradeMap.get(exercise.id) || 0;
      const allBenefits = getAllResearchBenefits(exercise.id);
      
      return {
        exercise: {
          id: exercise.id,
          name: exercise.name,
          category: exercise.category
        },
        proficiency: proficiency?.proficiency || 0,
        currentTier,
        availableTiers: allBenefits.map(tier => ({
          tier: tier.tier,
          cost: tier.cost,
          benefits: tier.benefits,
          canUnlock: canUnlockTier(exercise.id, tier.tier, currentTier) && 
                     (proficiency?.proficiency || 0) >= 1000
        }))
      };
    });
    
    res.json(availableResearch);
  } catch (error) {
    logger.error('Get available research error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
