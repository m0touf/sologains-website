import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getSave, doWorkout, resetEnergy, getExercises, getProficiencies, upgradeExercise, getResearchUpgrades, getAvailableResearch } from '../controllers/gameController';
import { getDailyAdventures, attemptAdventure, getAdventureHistory, checkAdventureCompletions, claimAdventureRewards } from '../controllers/adventureController';

const router = Router();

// All game routes require authentication
router.use(authenticateToken);

router.get('/save', getSave);
router.get('/exercises', getExercises);
router.get('/proficiencies', getProficiencies);
router.get('/research-upgrades', getResearchUpgrades);
router.get('/available-research', getAvailableResearch);
router.post('/workout', doWorkout);
router.post('/reset-energy', resetEnergy);
router.post('/upgrade-exercise', upgradeExercise);

// Adventure routes
router.get('/adventures', getDailyAdventures);
router.post('/attempt-adventure', attemptAdventure);
router.post('/check-adventure-completions', checkAdventureCompletions);
router.post('/claim-adventure-rewards', claimAdventureRewards);
router.get('/adventure-history', getAdventureHistory);


export default router;
