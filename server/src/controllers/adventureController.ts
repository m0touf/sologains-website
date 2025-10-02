import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Get daily adventures (cycles through 50 adventures based on date)
export const getDailyAdventures = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('getDailyAdventures called for user:', req.user?.userId);
    const userId = req.user!.userId;
    
    // Get user's current stats
    const save = await prisma.save.findUnique({ where: { userId } });
    if (!save) {
      return res.status(404).json({ error: 'Save not found' });
    }

    // Get today's date for daily cycling
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
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

      // Use day offset to cycle through adventures of this difficulty
      const offset = (dayOfYear * count) % availableAdventures.length;
      
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

    // Check if user has enough energy
    if (save.energy < adventure.energyCost) {
      return res.status(400).json({ error: 'Not enough energy' });
    }

    // Check if user meets requirements
    if (save.strength < adventure.strengthReq || save.stamina < adventure.staminaReq) {
      return res.status(400).json({ error: 'You do not meet the skill requirements for this adventure' });
    }

    // Calculate success chance based on stats vs requirements
    const strengthRatio = adventure.strengthReq > 0 ? save.strength / adventure.strengthReq : 1;
    const staminaRatio = adventure.staminaReq > 0 ? save.stamina / adventure.staminaReq : 1;
    const successChance = Math.min(0.95, Math.max(0.3, (strengthRatio + staminaRatio) / 2));
    
    // Determine if adventure succeeds
    const success = Math.random() < successChance;

    // Calculate rewards
    let xpGained = 0;
    let statGains = { strength: 0, stamina: 0, agility: 0 };
    let cashGained = 0;

    if (success) {
      xpGained = adventure.xpReward;
      statGains = adventure.statReward as { strength: number, stamina: number, agility: number };
      cashGained = adventure.cashReward;
    } else {
      // Failed attempts still give some XP but no stats or cash
      xpGained = Math.floor(adventure.xpReward * 0.3);
    }

    // Calculate new stats and XP
    const newEnergy = save.energy - adventure.energyCost;
    const newXp = save.xp + xpGained;
    const newStrength = save.strength + statGains.strength;
    const newStamina = save.stamina + statGains.stamina;
    const newAgility = save.agility + statGains.agility;
    const newCash = save.cash + cashGained;

    // Update save and create attempt record
    await prisma.$transaction(async (tx) => {
      // Update save
      await tx.save.update({
        where: { userId },
        data: {
          energy: newEnergy,
          xp: newXp,
          strength: newStrength,
          stamina: newStamina,
          agility: newAgility,
          cash: newCash,
        },
      });

      // Create adventure attempt record
      await tx.adventureAttempt.create({
        data: {
          userId,
          adventureId: adventure.id,
          success,
          energySpent: adventure.energyCost,
          xpGained,
          statGains,
          cashGained,
        },
      });
    });

    res.json({
      success,
      adventure: {
        name: adventure.name,
        description: adventure.description,
        difficulty: adventure.difficulty,
      },
      energySpent: adventure.energyCost,
      xpGained,
      statGains,
      cashGained,
      energyAfter: newEnergy,
      xpAfter: newXp,
      statsAfter: {
        strength: newStrength,
        stamina: newStamina,
        agility: newAgility,
      },
      cashAfter: newCash,
    });
  } catch (error) {
    console.error('Attempt adventure error:', error);
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
