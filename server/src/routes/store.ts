import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getShopItems, purchaseItem, simulateNewDay, simulateDate } from '../controllers/storeController';

const router = Router();

// Get daily shop items
router.get('/items', authenticateToken, getShopItems);

// Purchase an item
router.post('/purchase', authenticateToken, purchaseItem);

// Simulate new day
router.post('/new-day', authenticateToken, simulateNewDay);

// Test endpoint to simulate different dates (for testing daily resets)
router.post('/test-date', authenticateToken, simulateDate);

export default router;
