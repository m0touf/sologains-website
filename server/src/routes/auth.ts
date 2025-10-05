import { Router } from 'express';
import { signup, login, changePassword } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/change-password', authenticateToken, changePassword);

export default router;
