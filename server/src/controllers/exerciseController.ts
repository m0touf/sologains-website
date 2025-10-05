import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';
import logger from '../utils/logger';

const prisma = new PrismaClient();

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
    res.status(500).json({ error: 'Failed to retrieve exercises' });
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
    res.status(500).json({ error: 'Failed to retrieve proficiencies' });
  }
};
