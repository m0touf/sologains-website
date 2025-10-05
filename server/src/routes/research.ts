import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { upgradeExercise, getResearchUpgrades, getAvailableResearch } from '../controllers/researchController';

const router = Router();

// All research routes require authentication
router.use(authenticateToken);

// POST /api/research/upgrade - Upgrade an exercise research tier
router.post('/upgrade', upgradeExercise);

// GET /api/research/upgrades - Get user's research upgrades
router.get('/upgrades', getResearchUpgrades);

// GET /api/research/available - Get all available research options
router.get('/available', getAvailableResearch);

export default router;
