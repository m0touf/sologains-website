import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Schema for purchasing items
const purchaseSchema = z.object({
  itemId: z.string(),
});

// Schema for new day simulation
const newDaySchema = z.object({
  simulate: z.boolean().optional().default(true),
});

// Get daily shop items (rotated based on date)
export const getShopItems = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user's save data to check shop rotation
    const save = await prisma.save.findUnique({
      where: { userId }
    });
    
    if (!save) {
      return res.status(404).json({ error: 'Save data not found' });
    }
    
    // Use user's shop rotation seed for consistent rotation
    const seed = save.shopRotationSeed || 12345;
    
    // Get all shop items grouped by category
    const allItems = await prisma.shopItem.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' }
    });

    // Group items by category
    const itemsByCategory = {
      energy_boosters: allItems.filter(item => item.category === 'energy_boosters'),
      supplements: allItems.filter(item => item.category === 'supplements'),
      special_items: allItems.filter(item => item.category === 'special_items')
    };

    // Rotate items daily using the seed
    const rotatedItems = {
      energy_boosters: rotateItems(itemsByCategory.energy_boosters, seed, 3), // Show 3 of 8
      supplements: rotateItems(itemsByCategory.supplements, seed, 3), // Show 3 of 15
      special_items: rotateItems(itemsByCategory.special_items, seed, 3) // Show 3 of 8
    };

    res.json(rotatedItems);
  } catch (error) {
    console.error('Error fetching shop items:', error);
    res.status(500).json({ error: 'Failed to fetch shop items' });
  }
};

// Rotate items based on seed
function rotateItems(items: any[], seed: number, count: number): any[] {
  if (items.length <= count) return items;
  
  const shuffled = [...items];
  // Simple shuffle based on seed
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed + i) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, count);
}

// Purchase an item
export const purchaseItem = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { itemId } = purchaseSchema.parse(req.body);

    // Get user's current save data
    const save = await prisma.save.findUnique({
      where: { userId },
      include: { ResearchUpgrades: true }
    });

    if (!save) {
      return res.status(404).json({ error: 'Save data not found' });
    }

    // Get the shop item
    const shopItem = await prisma.shopItem.findUnique({
      where: { id: itemId }
    });

    if (!shopItem || !shopItem.isActive) {
      return res.status(404).json({ error: 'Item not found or not available' });
    }

    // Check if user has enough cash
    if (save.cash < shopItem.cost) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    // Apply item effects
    let newCash = save.cash - shopItem.cost;
    let newEnergy = save.energy;
    let newStrength = save.strength;
    let newStamina = save.stamina;
    let newAgility = save.agility;
    let newMaxEnergy = save.maxEnergy || 100;

    switch (shopItem.type) {
      case 'energy_restore':
        newEnergy = Math.min(newMaxEnergy, newEnergy + shopItem.effectValue);
        break;
      case 'stat_boost':
        if (shopItem.statType === 'strength') newStrength += shopItem.effectValue;
        if (shopItem.statType === 'stamina') newStamina += shopItem.effectValue;
        if (shopItem.statType === 'agility') newAgility += shopItem.effectValue;
        break;
      case 'max_energy':
        newMaxEnergy += shopItem.effectValue;
        newEnergy = newMaxEnergy; // Fill energy when increasing max
        break;
      case 'full_restore':
        newEnergy = newMaxEnergy;
        break;
      // Note: Other effects like xp_boost, proficiency_boost, etc. would need more complex implementation
    }

    // Update save data
    await prisma.save.update({
      where: { userId },
      data: {
        cash: newCash,
        energy: newEnergy,
        strength: newStrength,
        stamina: newStamina,
        agility: newAgility,
        maxEnergy: newMaxEnergy
      }
    });

    res.json({
      success: true,
      message: `Purchased ${shopItem.name}`,
      cashAfter: newCash,
      energy: newEnergy,
      stats: {
        strength: newStrength,
        stamina: newStamina,
        agility: newAgility
      },
      maxEnergy: newMaxEnergy
    });

  } catch (error) {
    console.error('Error purchasing item:', error);
    res.status(500).json({ error: 'Failed to purchase item' });
  }
};

// Simulate a new day (reset energy, daily limits, rotate content)
export const simulateNewDay = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { simulate } = newDaySchema.parse(req.body);

    if (!simulate) {
      return res.status(400).json({ error: 'Simulation not requested' });
    }

    // Get current save data
    const save = await prisma.save.findUnique({
      where: { userId },
      include: { ExerciseProficiencies: true }
    });

    if (!save) {
      return res.status(404).json({ error: 'Save data not found' });
    }

    // Reset energy to max
    const maxEnergy = save.maxEnergy || 100;
    
    // Reset daily stat gains for all exercises
    await prisma.exerciseProficiency.updateMany({
      where: { userId },
      data: {
        dailyStatGains: 0,
        dailyEnergy: 0,
        lastDailyReset: new Date()
      }
    });

    // Generate new rotation seed for shop and adventures
    const newShopRotationSeed = Math.floor(Math.random() * 1000000);
    const newAdventureRotationSeed = Math.floor(Math.random() * 1000000);
    
    // Update save data
    const updatedSave = await prisma.save.update({
      where: { userId },
      data: {
        energy: maxEnergy,
        shopRotationSeed: newShopRotationSeed,
        lastShopRotation: new Date(),
        adventureRotationSeed: newAdventureRotationSeed,
        lastAdventureRotation: new Date()
      },
      include: {
        ExerciseProficiencies: true,
        ResearchUpgrades: true
      }
    });

    res.json({
      success: true,
      message: 'New day simulated successfully',
      energy: maxEnergy,
      dailyLimitsReset: true,
      shopRotated: true,
      adventuresRotated: true
    });

  } catch (error) {
    console.error('Error simulating new day:', error);
    res.status(500).json({ error: 'Failed to simulate new day' });
  }
};

// Test endpoint to simulate different dates (for testing daily resets)
export const simulateDate = async (req: Request, res: Response) => {
  try {
    console.log('simulateDate called with user:', req.user);
    const userId = req.user?.userId;
    if (!userId) {
      console.log('No userId found in request');
      return res.status(401).json({ error: 'Unauthorized - no user ID' });
    }

    const { date } = req.body;
    if (!date) {
      return res.status(400).json({ error: 'Date required' });
    }

    console.log(`Setting test date to ${date} for user ${userId}`);

    // Parse the date and set it as the last reset date
    const testDate = new Date(date);
    if (isNaN(testDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Update the save with the test date as last daily reset
    await prisma.save.update({
      where: { userId },
      data: {
        lastDailyReset: testDate
      }
    });

    console.log(`Successfully set test date to ${testDate.toISOString().slice(0, 10)} for user ${userId}`);

    res.json({
      success: true,
      message: `Set test date to ${testDate.toISOString().slice(0, 10)}`,
      testDate: testDate.toISOString().slice(0, 10)
    });

  } catch (error) {
    console.error('Error setting test date:', error);
    res.status(500).json({ error: 'Failed to set test date' });
  }
};