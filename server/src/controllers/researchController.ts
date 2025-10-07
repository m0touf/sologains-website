import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';
import logger from '../utils/logger';
import { 
  getResearchBenefits,
  getAllResearchBenefits,
  canUnlockTier,
  getTierCost
} from '../config';

const prisma = new PrismaClient();

const upgradeSchema = z.object({
  exerciseId: z.string(),
  tier: z.number().int().min(1).max(4),
});

export const upgradeExercise = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const parse = upgradeSchema.safeParse(req.body);
    
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.flatten() });
    }

    const { exerciseId, tier } = parse.data;

    // Get user's save data
    const save = await prisma.save.findUnique({
      where: { userId },
      include: {
        ResearchUpgrades: true
      }
    });

    if (!save) {
      return res.status(404).json({ error: 'Save not found' });
    }

    // Get exercise and proficiency information first
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId }
    });

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    // Convert exercise name to research benefits key
    let nameKey = exercise.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    
    // Handle special cases where research benefits use different keys
    const specialMappings: Record<string, string> = {
      'jump_rope': 'jumprope',
      'pullups': 'pull_ups',
      'hip_flexor_stretch': 'hip_flexor',
      'shoulder_roll_stretch': 'shoulder_roll',
      'cat_cow_stretch': 'cat_cow',
    };
    
    nameKey = specialMappings[nameKey] || nameKey;

    // Check if user has enough proficiency points
    const tierCost = getTierCost(nameKey, tier);
    if (save.proficiencyPoints < tierCost) {
      return res.status(400).json({ error: 'Not enough proficiency points' });
    }

    // Check if tier can be unlocked
    const currentTier = save.ResearchUpgrades.find(ru => ru.exerciseId === exerciseId)?.tier || 0;
    if (!canUnlockTier(nameKey, tier, currentTier)) {
      return res.status(400).json({ error: 'Cannot unlock this tier' });
    }

    const proficiency = await prisma.exerciseProficiency.findUnique({
      where: {
        userId_exerciseId: {
          userId,
          exerciseId
        }
      }
    });

    if (!proficiency || proficiency.proficiency < 1000) {
      return res.status(400).json({ error: 'Exercise proficiency must be at least 1000' });
    }

    // Perform the upgrade in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update or create research upgrade
      const upgrade = await tx.researchUpgrade.upsert({
        where: {
          userId_exerciseId: {
            userId,
            exerciseId
          }
        },
        update: {
          tier
        },
        create: {
          userId,
          exerciseId,
          tier
        }
      });

      // Calculate total permanent XP gain from all research upgrades
      const allResearchUpgrades = await tx.researchUpgrade.findMany({
        where: { userId },
        include: {
          Exercise: true
        }
      });

      // Calculate current permanent XP gain from ALL research upgrades
      let totalPermanentXpGain = 0;
      for (const upgrade of allResearchUpgrades) {
        if (upgrade.Exercise) {
          let nameKey = upgrade.Exercise.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
          const specialMappings: Record<string, string> = {
            'jump_rope': 'jumprope',
            'pullups': 'pull_ups',
            'hip_flexor_stretch': 'hip_flexor',
            'shoulder_roll_stretch': 'shoulder_roll',
            'catcow_stretch': 'cat_cow',
          };
          nameKey = specialMappings[nameKey] || nameKey;
          
          const benefits = getAllResearchBenefits(nameKey);
          const tierBenefits = benefits.find(t => t.tier === upgrade.tier);
          if (tierBenefits) {
            for (const benefit of tierBenefits.benefits) {
              if (benefit.type === 'xp' && benefit.isPercentage) {
                totalPermanentXpGain += benefit.value;
                logger.info(`  Adding ${benefit.value}% XP gain from ${upgrade.Exercise.name} T${upgrade.tier} (${benefit.name})`);
              }
            }
          }
        }
      }
      
      logger.info(`  Total permanent XP gain: ${totalPermanentXpGain}%`);

      // Calculate total daily adventure limit from ALL research upgrades
      let totalDailyAdventureLimit = 2; // Base limit
      for (const upgrade of allResearchUpgrades) {
        if (upgrade.Exercise) {
          let nameKey = upgrade.Exercise.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
          const specialMappings: Record<string, string> = {
            'jump_rope': 'jumprope',
            'pullups': 'pull_ups',
            'hip_flexor_stretch': 'hip_flexor',
            'shoulder_roll_stretch': 'shoulder_roll',
            'catcow_stretch': 'cat_cow',
          };
          nameKey = specialMappings[nameKey] || nameKey;
          
          const benefits = getAllResearchBenefits(nameKey);
          const tierBenefits = benefits.find(t => t.tier === upgrade.tier);
          if (tierBenefits) {
            for (const benefit of tierBenefits.benefits) {
              if (benefit.type === 'adventure') {
                totalDailyAdventureLimit += benefit.value;
                logger.info(`  Adding ${benefit.value} adventure attempts from ${upgrade.Exercise.name} T${upgrade.tier} (${benefit.name})`);
              }
            }
          }
        }
      }
      
      logger.info(`  Total daily adventure limit: ${totalDailyAdventureLimit}`);

      // Deduct proficiency points and update permanent XP gain and daily adventure limit
      const updatedSave = await tx.save.update({
        where: { userId },
        data: {
          proficiencyPoints: save.proficiencyPoints - tierCost,
          permanentXpGain: totalPermanentXpGain,
          dailyAdventureLimit: totalDailyAdventureLimit
        }
      });

      return { upgrade, proficiencyPoints: updatedSave.proficiencyPoints };
    });

    // Get research benefits for response
    const benefits = getResearchBenefits(nameKey, tier);
    const allBenefits = getAllResearchBenefits(nameKey);

    res.json({
      success: true,
      upgrade: result.upgrade,
      proficiencyPoints: result.proficiencyPoints,
      benefits,
      allBenefits
    });

  } catch (error) {
    logger.error('Upgrade exercise error:', error);
    res.status(500).json({ error: 'Failed to upgrade exercise' });
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
    logger.error('Get research upgrades error:', error);
    res.status(500).json({ error: 'Failed to retrieve research upgrades' });
  }
};

export const getAvailableResearch = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Get all exercises with their proficiencies
    const exercises = await prisma.exercise.findMany({
      include: {
        ExerciseProficiencies: {
          where: { userId },
          select: { proficiency: true }
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
      // Use exercise name for research benefits lookup
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
      const allBenefits = getAllResearchBenefits(nameKey);

      // Debug logging
      logger.info(`Research for ${exercise.name}:`, {
        exerciseId: exercise.id,
        nameKey,
        proficiency: proficiency?.proficiency || 0,
        currentTier,
        benefitsCount: allBenefits.length,
        benefits: allBenefits.map(t => ({ tier: t.tier, benefitsCount: t.benefits.length }))
      });
      

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
          canUnlock: canUnlockTier(nameKey, tier.tier, currentTier) && 
                     (proficiency?.proficiency || 0) >= 1000
        }))
      };
    });

    res.json(availableResearch);
  } catch (error) {
    logger.error(`Error getting available research for user ${req.user?.userId}:`, error);
    res.status(500).json({ error: 'Failed to retrieve available research' });
  }
};
