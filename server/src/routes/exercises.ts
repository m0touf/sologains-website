import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getExercises, getProficiencies } from '../controllers/exerciseController';

const router = Router();

// All exercise routes require authentication
router.use(authenticateToken);

// GET /api/exercises - Get all active exercises
router.get('/', getExercises);

// GET /api/exercises/proficiencies - Get user's exercise proficiencies
router.get('/proficiencies', getProficiencies);

export default router;
