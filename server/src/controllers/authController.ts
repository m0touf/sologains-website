import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  DEFAULT_MAX_ENERGY, 
  STARTING_CASH, 
  STARTING_ENERGY, 
  STARTING_PROFICIENCY_POINTS,
  STARTING_LEVEL,
  STARTING_XP,
  STARTING_STRENGTH,
  STARTING_STAMINA,
  STARTING_MOBILITY
} from '../config/constants';
import { z } from 'zod';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { AuthenticatedRequest } from '../middleware/auth';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// Helper function to format Zod validation errors
const formatValidationError = (error: any): string => {
  if (error.issues && error.issues.length > 0) {
    return error.issues.map((issue: any) => issue.message).join(', ');
  }
  return 'Validation error';
};

const signupSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const signup = async (req: Request, res: Response) => {
  try {
    const parse = signupSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: formatValidationError(parse.error) });
    }

    const { email, username, password } = parse.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email ? 'Email already exists' : 'Username already exists' 
      });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
        },
      });

      // Create save
      await tx.save.create({
        data: {
          userId: newUser.id,
          level: STARTING_LEVEL,
          xp: STARTING_XP,
          energy: STARTING_ENERGY,
          lastEnergyUpdate: new Date(),
          strength: STARTING_STRENGTH,
          stamina: STARTING_STAMINA,
          mobility: STARTING_MOBILITY,
          proficiencyPoints: STARTING_PROFICIENCY_POINTS,
          cash: STARTING_CASH,
          maxEnergy: DEFAULT_MAX_ENERGY,
        },
      });

      return newUser;
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    logger.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: formatValidationError(parse.error) });
    }

    const { email, password } = parse.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = changePasswordSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: formatValidationError(parse.error) });
    }

    const userId = req.user!.userId;
    const { currentPassword, newPassword } = parse.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
