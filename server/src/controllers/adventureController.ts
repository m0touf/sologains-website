import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Calculate level from XP (same as in gameController)
function calculateLevel(totalXp: number) {
  let level = 1;
  let cumulativeXp = 0;
  const LMAX = 100; // Max level
  
  while (level <= LMAX) {
    const xpNeeded = Math.floor(100 * Math.pow(1.15, level - 1));
    if (cumulativeXp + xpNeeded > totalXp) {
      break;
    }
    cumulativeXp += xpNeeded;
    level++;
  }
  
  return level;
}

// Get daily adventures (cycles through 50 adventures based on date)
export const getDailyAdventures = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('getDailyAdventures called for user:', req.user?.userId);
    const userId = req.user!.userId;
    
    // Get user's current stats and rotation seed
    const save = await prisma.save.findUnique({ where: { userId } });
    if (!save) {
      return res.status(404).json({ error: 'Save not found' });
    }
    
    // Use user's adventure rotation seed for consistent rotation
    const rotationSeed = save.adventureRotationSeed || 54321;
    
    // Get all adventures grouped by difficulty
    const allAdventures = await prisma.adventure.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' }
    });

    // Group adventures by difficulty
    const adventuresByDifficulty = {
      easy: allAdventures.filter(a => a.difficulty === 'easy'),
      medium: allAdventures.filter(a => a.difficulty === 'medium'),
      hard: allAdventures.filter(a => a.difficulty === 'hard'),
      legendary: allAdventures.filter(a => a.difficulty === 'legendary')
    };

    // Select adventures with desired distribution: 2 easy, 2 medium, 1 hard, 1 legendary
    const dailyAdventures = [];
    const distribution = [
      { difficulty: 'easy', count: 2 },
      { difficulty: 'medium', count: 2 },
      { difficulty: 'hard', count: 1 },
      { difficulty: 'legendary', count: 1 }
    ];

    for (const { difficulty, count } of distribution) {
      const availableAdventures = adventuresByDifficulty[difficulty];
      if (availableAdventures.length === 0) continue;

      // Use rotation seed to cycle through adventures of this difficulty
      const offset = (rotationSeed * count) % availableAdventures.length;
      
      for (let i = 0; i < count; i++) {
        const index = (offset + i) % availableAdventures.length;
        const adventure = availableAdventures[index];
        
        // Check if user meets requirements
        const meetsRequirements = adventure.strengthReq <= save.strength && 
                                 adventure.staminaReq <= save.stamina;
        
        dailyAdventures.push({
          ...adventure,
          canAttempt: meetsRequirements,
          userStats: {
            strength: save.strength,
            stamina: save.stamina,
            agility: save.agility
          }
        });
      }
    }

    console.log('Returning', dailyAdventures.length, 'daily adventures');
    res.json(dailyAdventures);
  } catch (error) {
    console.error('Get daily adventures error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Attempt an adventure
const attemptAdventureSchema = z.object({
  adventureId: z.string(),
});

export const attemptAdventure = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const parse = attemptAdventureSchema.safeParse(req.body);
    
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.flatten() });
    }

    // Get adventure details
    const adventure = await prisma.adventure.findUnique({
      where: { id: parse.data.adventureId }
    });

    if (!adventure) {
      return res.status(404).json({ error: 'Adventure not found' });
    }

    if (!adventure.isActive) {
      return res.status(400).json({ error: 'Adventure is not available' });
    }

    // Get user's current stats and energy
    const save = await prisma.save.findUnique({ where: { userId } });
    if (!save) {
      return res.status(404).json({ error: 'Save not found' });
    }

    // Check daily adventure limit (2 per day)
    if (save.dailyAdventureAttempts >= 2) {
      return res.status(400).json({ error: 'You have reached your daily adventure limit (2 per day)' });
    }

      // Check if user has any in-progress adventures
      const inProgressAdventure = await prisma.adventureAttempt.findFirst({
        where: {
          userId,
          status: "in_progress"
        }
      });

      if (inProgressAdventure) {
        return res.status(400).json({ error: 'You already have an adventure in progress. Complete it before starting another.' });
      }

      // Check if user has already attempted this adventure today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const existingAttempt = await prisma.adventureAttempt.findFirst({
        where: {
          userId,
          adventureId: adventure.id,
          attemptedAt: {
            gte: today
          }
        }
      });

      if (existingAttempt) {
        return res.status(400).json({ error: 'You have already attempted this adventure today' });
      }

    // Check if adventure can be completed before midnight
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(23, 59, 59, 999);
    const timeUntilMidnight = midnight.getTime() - now.getTime();
    const adventureDurationMs = adventure.durationMinutes * 60 * 1000;

    if (timeUntilMidnight < adventureDurationMs) {
      return res.status(400).json({ 
        error: `This adventure takes ${adventure.durationMinutes} minutes but there are only ${Math.floor(timeUntilMidnight / (60 * 1000))} minutes left until midnight` 
      });
    }

    // Check if user has enough energy
    if (save.energy < adventure.energyCost) {
      return res.status(400).json({ error: 'Not enough energy' });
    }

    // Check if user meets requirements
    if (save.strength < adventure.strengthReq || save.stamina < adventure.staminaReq) {
      return res.status(400).json({ error: 'You do not meet the skill requirements for this adventure' });
    }

    // Calculate when adventure will complete
    const completionTime = new Date(now.getTime() + adventureDurationMs);
    
    // Calculate success chance based on stats vs requirements
    const strengthRatio = adventure.strengthReq > 0 ? save.strength / adventure.strengthReq : 1;
    const staminaRatio = adventure.staminaReq > 0 ? save.stamina / adventure.staminaReq : 1;
    const successChance = Math.min(0.95, Math.max(0.3, (strengthRatio + staminaRatio) / 2));
    
    // Determine if adventure succeeds
    const success = Math.random() < successChance;

    // Calculate rewards (only given when adventure completes)
    const xpGained = success ? adventure.xpReward : Math.floor(adventure.xpReward * 0.3);
    const statGains = success ? adventure.statReward as { strength: number, stamina: number, agility: number } : { strength: 0, stamina: 0, agility: 0 };
    const cashGained = success ? adventure.cashReward : 0;

    // Update user stats immediately (energy is spent now)
    const newEnergy = save.energy - adventure.energyCost;

    // Update save and create attempt record
    await prisma.$transaction(async (tx) => {
      // Update save (increment daily attempts, spend energy)
      await tx.save.update({
        where: { userId },
        data: {
          energy: newEnergy,
          dailyAdventureAttempts: save.dailyAdventureAttempts + 1,
        },
      });

      // Create adventure attempt record (in progress)
      await tx.adventureAttempt.create({
        data: {
          userId,
          adventureId: adventure.id,
          success,
          energySpent: adventure.energyCost,
          xpGained,
          statGains,
          cashGained,
          status: "in_progress",
          completedAt: completionTime
        },
      });
    });

    res.json({
      success: true,
      energyAfter: newEnergy,
      adventureStarted: true,
      completionTime: completionTime.toISOString(),
      durationMinutes: adventure.durationMinutes,
      message: `Adventure started! It will complete at ${completionTime.toLocaleTimeString()}`,
      adventure: {
        name: adventure.name,
        description: adventure.description,
        difficulty: adventure.difficulty,
      }
    });
  } catch (error) {
    console.error('Attempt adventure error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Check and complete finished adventures
export const checkAdventureCompletions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const now = new Date();

    // Find all in-progress adventures that should be completed
    const completedAdventures = await prisma.adventureAttempt.findMany({
      where: {
        userId,
        status: "in_progress",
        completedAt: {
          lte: now
        }
      },
      include: {
        Adventure: true
      }
    });

    if (completedAdventures.length === 0) {
      return res.json({ 
        message: "No adventures completed",
        completedAdventures: []
      });
    }

    // Process each completed adventure
    const results = [];
    for (const attempt of completedAdventures) {
      const statGains = attempt.statGains as { strength: number, stamina: number, agility: number };
      
      // Update user stats with rewards
      const updatedSave = await prisma.$transaction(async (tx) => {
        // Get current save
        const save = await tx.save.findUnique({ where: { userId } });
        if (!save) return null;

        // Calculate new stats
        const newXp = save.xp + attempt.xpGained;
        const newStrength = save.strength + statGains.strength;
        const newStamina = save.stamina + statGains.stamina;
        const newAgility = save.agility + statGains.agility;
        const newCash = save.cash + attempt.cashGained;

        // Calculate new level
        const newLevel = calculateLevel(newXp);

        // Update save
        const updatedSave = await tx.save.update({
          where: { userId },
          data: {
            xp: newXp,
            level: newLevel,
            strength: newStrength,
            stamina: newStamina,
            agility: newAgility,
            cash: newCash,
          }
        });

        // Mark adventure as completed
        await tx.adventureAttempt.update({
          where: { id: attempt.id },
          data: {
            status: "completed"
          }
        });

        return updatedSave;
      });

      if (updatedSave) {
        results.push({
          adventureId: attempt.adventureId,
          adventureName: attempt.Adventure.name,
          success: attempt.success,
          xpGained: attempt.xpGained,
          statGains,
          cashGained: attempt.cashGained,
          statsAfter: {
            strength: updatedSave.strength,
            stamina: updatedSave.stamina,
            agility: updatedSave.agility,
            level: updatedSave.level,
            xp: updatedSave.xp
          },
          cashAfter: updatedSave.cash
        });
      }
    }

    res.json({
      message: `${results.length} adventure(s) completed`,
      completedAdventures: results
    });
  } catch (error) {
    console.error('Check adventure completions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's adventure history
export const getAdventureHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    
    const attempts = await prisma.adventureAttempt.findMany({
      where: { userId },
      include: {
        Adventure: true,
      },
      orderBy: { attemptedAt: 'desc' },
      take: 20, // Last 20 attempts
    });

    res.json(attempts);
  } catch (error) {
    console.error('Get adventure history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
