import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const workoutSchema = z.object({
  type: z.enum(['strength', 'endurance', 'agility']),
  reps: z.number().int().min(1).max(300),
});

export const getSave = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const save = await prisma.save.findUnique({ where: { userId } });
    
    if (!save) {
      return res.status(404).json({ error: 'Save not found' });
    }
    
    res.json(save);
  } catch (error) {
    console.error('Get save error:', error);
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

    // Load save & do daily reset check
    const save = await prisma.save.findUnique({ where: { userId } });
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

    // Authoritative calculation
    const baseCost = 10;
    const energySpent = Math.min(energy, baseCost);
    const xpGained = Math.ceil(parse.data.reps / 5);

    // Simple anti-cheat: ensure enough energy
    if (energySpent < baseCost) {
      return res.status(400).json({ error: 'Not enough energy' });
    }

    // Calculate stat gains based on workout type
    const statGains = { strength: 0, stamina: 0, agility: 0 };
    const statGainAmount = Math.ceil(parse.data.reps / 20); // 1 stat point per 20 reps
    
    switch (parse.data.type) {
      case 'strength':
        statGains.strength = statGainAmount;
        break;
      case 'endurance':
        statGains.stamina = statGainAmount;
        break;
      case 'agility':
        statGains.agility = statGainAmount;
        break;
    }

    const newEnergy = energy - energySpent;
    const newXp = save.xp + xpGained;
    const newStrength = save.strength + statGains.strength;
    const newStamina = save.stamina + statGains.stamina;
    const newAgility = save.agility + statGains.agility;

    await prisma.$transaction([
      prisma.save.update({
        where: { userId },
        data: {
          energy: newEnergy,
          xp: newXp,
          strength: newStrength,
          stamina: newStamina,
          agility: newAgility,
          lastEnergyResetDate: new Date(), // Mark as touched today
        },
      }),
      prisma.workout.create({
        data: {
          userId,
          type: parse.data.type,
          reps: parse.data.reps,
          energySpent,
          xpGained,
          statGains: statGains,
        },
      }),
    ]);

    res.json({ 
      energySpent, 
      xpGained, 
      energyAfter: newEnergy, 
      xpAfter: newXp,
      statGains,
      statsAfter: {
        strength: newStrength,
        stamina: newStamina,
        agility: newAgility
      }
    });
  } catch (error) {
    console.error('Workout error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
