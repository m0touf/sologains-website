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
  getResearchBenefits
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
          permanentXpGain: 0,
          dailyAdventureLimit: 2,
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
    
    // Add debugging for energy calculation
    logger.info(`Energy calculation for user ${userId}:`);
    logger.info(`  Previous energy: ${save.energy}`);
    logger.info(`  Current energy: ${currentEnergy}`);
    logger.info(`  Capped energy: ${cappedEnergy}`);
    logger.info(`  Last update: ${save.lastEnergyUpdate}`);
    logger.info(`  Current time: ${now}`);
    
    // Update energy in database if it changed
    if (Math.abs(currentEnergy - save.energy) > 0.01) {
      await prisma.save.update({
        where: { userId },
        data: {
          energy: currentEnergy,
          lastEnergyUpdate: now
        }
      });
      logger.info(`  Energy updated in database to: ${currentEnergy}`);
    }

    // Check if we need to reset daily limits (automatic daily reset)
    // Create a date for 11:00 AM UTC today
    const today11AMUTC = new Date();
    today11AMUTC.setUTCHours(11, 0, 0, 0);
    
    // Determine which day's reset we should be on
    const currentDayKey = now >= today11AMUTC ? 
      now.toISOString().slice(0, 10) : // After 11 AM UTC, use today
      new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10); // Before 11 AM UTC, use yesterday
    
    const lastDailyResetDate = save.lastDailyReset ? 
      new Date(save.lastDailyReset).toISOString().slice(0, 10) : null;
    
    // Only reset if it's actually a new day (not just a new request)
    // Add extra logging to debug timezone issues
    if (currentDayKey !== lastDailyResetDate) {
      logger.info(`Daily reset triggered for user ${userId}:`);
      logger.info(`  Current date: ${currentDayKey} (UTC)`);
      logger.info(`  Last reset: ${lastDailyResetDate} (UTC)`);
      logger.info(`  Server time: ${now.toISOString()}`);
      logger.info(`  Last reset time: ${save.lastDailyReset?.toISOString()}`);
      
      // Double-check: only proceed if we haven't already reset today
      // This check should happen BEFORE any reset logic to prevent multiple resets
      if (save.lastDailyReset && new Date(save.lastDailyReset).toISOString().slice(0, 10) === currentDayKey) {
        logger.warn(`Daily reset already performed today for user ${userId}, skipping`);
      } else {
        // Reset daily stat gains for all exercises
        const newResetCount = (save.dailyResetCount || 0) + 1;
        await prisma.exerciseProficiency.updateMany({
          where: { userId },
          data: {
            dailyStatGains: 0,
            dailyEnergy: 0,
            lastDailyReset: now,
            dailyResetCount: newResetCount
          }
        });

        // Daily purchases are now handled by reset counter system
        // No need to delete records - they become invalid when reset count increments

        // Auto-claim any unclaimed adventures from the previous day
        const unclaimedAdventures = await prisma.adventureAttempt.findMany({
          where: {
            userId,
            status: "ready_to_claim"
          },
          include: {
            Adventure: true
          }
        });

        // Auto-claim rewards for unclaimed adventures
        for (const attempt of unclaimedAdventures) {
          const adventure = attempt.Adventure;
          
          // Calculate rewards
          const xpReward = adventure.xpReward;
          const cashReward = adventure.cashReward;
          const statRewards = adventure.statReward as { strength: number; stamina: number; mobility: number };
          
          // Update save with rewards
          await prisma.save.update({
            where: { userId },
            data: {
              xp: save.xp + xpReward,
              cash: save.cash + cashReward,
              strength: save.strength + (statRewards?.strength || 0),
              stamina: save.stamina + (statRewards?.stamina || 0),
              mobility: save.mobility + (statRewards?.mobility || 0)
            }
          });
          
          // Mark adventure as completed
          await prisma.adventureAttempt.update({
            where: { id: attempt.id },
            data: {
              status: "completed",
              completedAt: now,
              completedResetCount: (save.dailyResetCount || 0) + 1
            }
          });
        }

        // Invalidate any in-progress adventures from the previous day
        await prisma.adventureAttempt.updateMany({
          where: {
            userId,
            status: "in_progress"
          },
          data: {
            status: "failed",
            completedAt: now
          }
        });

        // Generate new rotation seeds for shop and adventures
        const newShopRotationSeed = Math.floor(Math.random() * 1000000);
        const newAdventureRotationSeed = Math.floor(Math.random() * 1000000);

        // Update save data with new rotation seeds (no energy reset)
        await prisma.save.update({
          where: { userId },
          data: {
            lastDailyReset: now,
            shopRotationSeed: newShopRotationSeed,
            lastShopRotation: now,
            adventureRotationSeed: newAdventureRotationSeed,
            lastAdventureRotation: now,
            dailyAdventureAttempts: 0,
            lastAdventureReset: now,
            dailyResetCount: (save.dailyResetCount || 0) + 1
          }
        });
      }
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
    
    // Add debugging for exercise energy calculation
    logger.info(`Workout energy calculation for ${exercise.name}:`);
    logger.info(`  Base energy cost: ${exercise.baseEnergy}`);
    logger.info(`  Current energy: ${energy}`);
    logger.info(`  Max energy: ${save.maxEnergy || (150 + (save.permanentEnergy || 0))}`);
    logger.info(`  Energy before workout: ${currentEnergy} (capped: ${cappedEnergy})`);

    // Apply research tier effects
    const researchUpgrade = save.ResearchUpgrades.find(ru => ru.exerciseId === exercise.id);
    let cashReward = 0;
    
    if (researchUpgrade) {
      // Get research benefits for this exercise and tier
      let nameKey = exercise.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      
      // Handle special cases where research benefits use different keys
        const specialMappings: Record<string, string> = {
          'jump_rope': 'jumprope',
          'pullups': 'pull_ups',
          'hip_flexor_stretch': 'hip_flexor',
          'shoulder_roll_stretch': 'shoulder_roll',
          'catcow_stretch': 'cat_cow',
        };
      
      nameKey = specialMappings[nameKey] || nameKey;
      const benefits = getResearchBenefits(nameKey, researchUpgrade.tier);
      
      logger.info(`  Research benefits for ${exercise.name} (tier ${researchUpgrade.tier}):`, benefits);
      
      // Apply each benefit
      for (const benefit of benefits) {
        switch (benefit.type) {
          case 'monetary':
            // Add cash reward (value is average, add some randomness)
            const minCash = Math.round(benefit.value * 0.5);
            const maxCash = Math.round(benefit.value * 1.5);
            cashReward += Math.floor(Math.random() * (maxCash - minCash + 1)) + minCash;
            break;
          case 'energy':
            // Reduce energy cost
            if (benefit.isPercentage) {
              const oldEnergySpent = energySpent;
              energySpent = Math.round(energySpent * (1 - benefit.value / 100));
              logger.info(`  Energy reduction: ${oldEnergySpent} -> ${energySpent} (${benefit.value}% reduction)`);
            }
            break;
          case 'xp':
            // XP benefits are now handled by permanent XP gain system
            // Individual exercise XP benefits are applied through the permanent XP gain stat
            break;
          case 'stat':
            // Stat bonuses are handled separately in stat gain logic
            break;
          case 'bonus':
            // Adventure bonus rewards - handled in adventure system
            break;
          case 'adventure':
            // Extra adventure attempts - handled in adventure system
            break;
          case 'utility':
            // Max energy increases - handled when research is purchased
            break;
          case 'quality':
            // Energy regeneration speed - handled when research is purchased
            break;
        }
      }
    }

    // Apply XP boost if available
    if (save.xpBoostRemaining && save.xpBoostRemaining > 0) {
      xpGained = Math.round(xpGained * 2); // Double XP
    }

    // Apply permanent XP gain bonus
    if (save.permanentXpGain && save.permanentXpGain > 0) {
      const oldXp = xpGained;
      xpGained = Math.round(xpGained * (1 + save.permanentXpGain / 100));
      logger.info(`  Permanent XP gain: ${oldXp} -> ${xpGained} (+${save.permanentXpGain}% bonus)`);
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
    const exerciseResetCount = existingProficiency?.dailyResetCount || 0;
    const currentResetCount = save.dailyResetCount || 0;
    
    // If exercise proficiency is from a previous reset cycle, treat as fresh start
    const isFromCurrentCycle = exerciseResetCount === currentResetCount;
    const effectiveDailyStatGains = isFromCurrentCycle ? currentDailyStatGains : 0;
    const effectiveDailyEnergy = isFromCurrentCycle ? currentDailyEnergy : 0;
    
    // Check if user has exceeded daily stat gain limit (5 per exercise)
    const maxDailyStatGains = 5;
    
    // Calculate stat gains using centralized function
    let statGains = { strength: 0, stamina: 0, mobility: 0 };
    
    if (effectiveDailyStatGains < maxDailyStatGains) {
      // Use exercise's stat gain amount instead of calculating from reps
      let statGainAmount = exercise.statGainAmount;
      
      // Apply research benefits for stat gains
      if (researchUpgrade) {
        let nameKey = exercise.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        
        // Handle special cases where research benefits use different keys
        const specialMappings: Record<string, string> = {
          'jump_rope': 'jumprope',
          'pullups': 'pull_ups',
          'hip_flexor_stretch': 'hip_flexor',
          'shoulder_roll_stretch': 'shoulder_roll',
          'catcow_stretch': 'cat_cow',
        };
        
        nameKey = specialMappings[nameKey] || nameKey;
        const benefits = getResearchBenefits(nameKey, researchUpgrade.tier);
        for (const benefit of benefits) {
          if (benefit.type === 'stat') {
            // Add extra stat gain from research
            const originalAmount = statGainAmount;
            statGainAmount += benefit.value;
            logger.info(`Research stat bonus: ${exercise.name} tier ${researchUpgrade.tier} - ${originalAmount} + ${benefit.value} = ${statGainAmount}`);
          }
        }
      }
      
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
    
    // Calculate base proficiency gain (daily reset is handled centrally)
    let proficiencyResult = calculateProficiencyGain(
      currentProficiency,
      currentDailyEnergy,
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

    // Calculate new daily stat gains for response (daily reset handled centrally)
    const newDailyStatGains = currentDailyStatGains + (statGains.strength + statGains.stamina + statGains.mobility > 0 ? 1 : 0);

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
      
      logger.info(`  Energy after workout: ${finalNewEnergy} (spent: ${energySpent})`);
      
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
              cash: currentSave.cash + cashReward, // Add cash reward from research
              xpBoostRemaining: save.xpBoostRemaining && save.xpBoostRemaining > 0 ? save.xpBoostRemaining - 1 : 0,
              proficiencyBoostRemaining: save.proficiencyBoostRemaining && save.proficiencyBoostRemaining > 0 ? save.proficiencyBoostRemaining - 1 : 0,
              lastEnergyUpdate: now,
            },
          });

      // Workout record creation removed for performance optimization
      // All necessary data is tracked in Save and ExerciseProficiency tables

      // Update or create exercise proficiency using new system

      if (existingProficiency) {
        await tx.exerciseProficiency.update({
          where: { id: existingProficiency.id },
          data: {
            proficiency: proficiencyResult.newProficiency,
            dailyEnergy: proficiencyResult.newDailyEnergy,
            dailyStatGains: newDailyStatGains,
            lastDailyReset: existingProficiency.lastDailyReset, // Keep existing reset date
            dailyResetCount: currentResetCount, // Update to current reset count
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
            dailyResetCount: currentResetCount,
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
          cashReward: cashReward, // Add cash reward to response
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


