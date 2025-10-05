import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { computeEnergyFloat, getCappedEnergy } from '../config/energy';
import { AuthenticatedRequest } from '../middleware/auth';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// XP Curve System (same as gameController)
const LMAX = 100;
const BASE_REQ = 20;
const GROWTH = 1.048900;

function xpToNext(n: number) {
  return Math.round(BASE_REQ * Math.pow(GROWTH, n - 1));
}

function totalXpTo(L: number) {
  const r = GROWTH, A = BASE_REQ;
  return Math.round(A * (Math.pow(r, L) - 1) / (r - 1));
}

function levelFromXp(totalXp: number) {
  let level = 1;
  let cumulativeXp = 0;
  
  while (level <= LMAX) {
    const xpNeeded = xpToNext(level);
    if (cumulativeXp + xpNeeded > totalXp) {
      break;
    }
    cumulativeXp += xpNeeded;
    level++;
  }
  
  return level;
}

// Schema for purchasing items
const purchaseSchema = z.object({
  itemId: z.string(),
});

// Schema for new day simulation
const newDaySchema = z.object({
  simulate: z.boolean().optional().default(true),
});

// Get daily shop items (rotated based on date)
export const getShopItems = async (req: AuthenticatedRequest, res: Response) => {
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
    
    // Get today's date for filtering purchased special items
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
    
    // Get all shop items grouped by category
    const allItems = await prisma.shopItem.findMany({
      where: { isActive: true },
      include: {
        DailyPurchases: {
          where: {
            userId,
            purchaseDate: today
          }
        }
      },
      orderBy: { id: 'asc' }
    });

    // Define daily limits for each category
    const dailyLimits = {
      energy_boosters: 3,
      supplements: 3,
      special_items: 1
    };

    // Add quantity information to each item
    const itemsWithQuantity = allItems.map(item => {
      const purchasedToday = item.DailyPurchases.length;
      const maxQuantity = dailyLimits[item.category as keyof typeof dailyLimits] || 1;
      const remainingQuantity = Math.max(0, maxQuantity - purchasedToday);
      
      return {
        ...item,
        quantityPurchased: purchasedToday,
        quantityMax: maxQuantity,
        quantityRemaining: remainingQuantity
      };
    });

    // Group items by category (don't filter out - show all with quantity info)
    const itemsByCategory = {
      energy_boosters: itemsWithQuantity.filter(item => item.category === 'energy_boosters'),
      supplements: itemsWithQuantity.filter(item => item.category === 'supplements'),
      special_items: itemsWithQuantity.filter(item => item.category === 'special_items')
    };

    // Rotate items daily using the seed
    const rotatedItems = {
      energy_boosters: rotateItems(itemsByCategory.energy_boosters, seed, 3), // Show 3 of available
      supplements: rotateItems(itemsByCategory.supplements, seed, 3), // Show 3 of available
      special_items: rotateItems(itemsByCategory.special_items, seed, 3) // Show 3 of available
    };

    res.json(rotatedItems);
  } catch (error) {
    logger.error('Error fetching shop items:', error);
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
export const purchaseItem = async (req: AuthenticatedRequest, res: Response) => {
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

    // Update energy based on time elapsed
    const now = new Date();
    const currentEnergy = computeEnergyFloat(save.energy, save.lastEnergyUpdate, now);
    const cappedEnergy = getCappedEnergy(currentEnergy);
    
    // Update energy in database
    await prisma.save.update({
      where: { userId },
      data: {
        energy: currentEnergy,
        lastEnergyUpdate: now
      }
    });

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

    // Check daily purchase limits for all categories
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format
    const dailyLimits = {
      energy_boosters: 3,
      supplements: 3,
      special_items: 1
    };

    // Count how many times this specific item has been purchased today
    const itemPurchasesToday = await prisma.dailyPurchase.count({
      where: {
        userId,
        shopItemId: itemId,
        purchaseDate: today
      }
    });

    const maxQuantity = dailyLimits[shopItem.category as keyof typeof dailyLimits] || 1;
    
    if (itemPurchasesToday >= maxQuantity) {
      return res.status(400).json({ 
        error: `You have already purchased the maximum amount (${maxQuantity}/${maxQuantity}) of this item today` 
      });
    }

    // Apply item effects
    let newCash = save.cash - shopItem.cost;
    let newEnergy = currentEnergy;
    let newStrength = save.strength;
    let newStamina = save.stamina;
    let newMobility = save.mobility;
    let newMaxEnergy = save.maxEnergy || 150;
    let newXp = save.xp;
    let newXpBoostRemaining = save.xpBoostRemaining || 0;
    let newProficiencyBoostRemaining = save.proficiencyBoostRemaining || 0;
    let newLuckBoostPercent = save.luckBoostPercent || 0;
    let newProficiencyPoints = save.proficiencyPoints;
    let newPermanentEnergy = save.permanentEnergy || 0;

    switch (shopItem.type) {
      case 'energy_restore':
        newEnergy = Math.min(newMaxEnergy + 20, newEnergy + shopItem.effectValue); // Allow overcap
        break;
      case 'stat_boost':
        if (shopItem.statType === 'strength') newStrength += shopItem.effectValue;
        if (shopItem.statType === 'stamina') newStamina += shopItem.effectValue;
        if (shopItem.statType === 'mobility') newMobility += shopItem.effectValue;
        break;
      case 'max_energy':
        newMaxEnergy += shopItem.effectValue;
        newEnergy += shopItem.effectValue; // Add the same amount to current energy
        break;
      case 'permanent_energy':
        newPermanentEnergy += shopItem.effectValue;
        newMaxEnergy += shopItem.effectValue; // Increase max energy permanently
        newEnergy += shopItem.effectValue; // Add the same amount to current energy
        break;
      case 'full_restore':
        newEnergy = newMaxEnergy;
        break;
      case 'xp_boost':
        // Add XP boost for next 5 workouts
        newXpBoostRemaining += shopItem.effectValue;
        break;
      case 'proficiency_boost':
        // Add proficiency boost for next X workouts
        newProficiencyBoostRemaining += shopItem.effectValue;
        break;
      case 'daily_reset':
        // Reset daily stat gain limits for all exercises
        await prisma.exerciseProficiency.updateMany({
          where: { userId },
          data: {
            dailyStatGains: 0,
            dailyEnergy: 0,
            lastDailyReset: new Date() // Today's date
          }
        });
        break;
      case 'luck_boost':
        // Add luck boost percentage
        newLuckBoostPercent += shopItem.effectValue;
        break;
      case 'master_package':
        // All stats +3, energy +25, XP +150, proficiency points +50
        newStrength += 3;
        newStamina += 3;
        newMobility += 3;
        newEnergy = Math.min(newMaxEnergy, newEnergy + 25);
        newXp += 150;
        newProficiencyPoints += 50;
        break;
    }

    // Update save data and record purchase in a transaction
    await prisma.$transaction(async (tx) => {
      // Update save data
      await tx.save.update({
        where: { userId },
        data: {
          cash: newCash,
          energy: newEnergy,
          lastEnergyUpdate: now,
          strength: newStrength,
          stamina: newStamina,
          mobility: newMobility,
          maxEnergy: newMaxEnergy,
          xp: newXp,
          proficiencyPoints: newProficiencyPoints,
          permanentEnergy: newPermanentEnergy,
          xpBoostRemaining: newXpBoostRemaining,
          proficiencyBoostRemaining: newProficiencyBoostRemaining,
          luckBoostPercent: newLuckBoostPercent
        }
      });

      // Record daily purchase for all items
      await tx.dailyPurchase.create({
        data: {
          userId,
          shopItemId: itemId,
          purchaseDate: today
        }
      });
    });

    res.json({
      success: true,
      message: `Purchased ${shopItem.name}`,
      cashAfter: newCash,
      energyAfter: Math.floor(newEnergy),
      maxEnergyAfter: newMaxEnergy,
      statsAfter: {
        strength: newStrength,
        stamina: newStamina,
        mobility: newMobility,
        level: save.level,
        xp: newXp
      },
      proficiencyPointsAfter: newProficiencyPoints,
      permanentEnergyAfter: newPermanentEnergy,
      xpBoostRemaining: newXpBoostRemaining,
      proficiencyBoostRemaining: newProficiencyBoostRemaining,
      luckBoostPercent: newLuckBoostPercent
    });

  } catch (error) {
    logger.error('Error purchasing item:', error);
    res.status(500).json({ error: 'Failed to purchase item' });
  }
};

// Simulate a new day (reset energy, daily limits, rotate content)
export const simulateNewDay = async (req: AuthenticatedRequest, res: Response) => {
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
    const maxEnergy = save.maxEnergy || 150;
    
    // Reset daily stat gains for all exercises
    await prisma.exerciseProficiency.updateMany({
      where: { userId },
      data: {
        dailyStatGains: 0,
        dailyEnergy: 0,
        lastDailyReset: new Date()
      }
    });

    // Clear daily purchases (special items become available again)
    await prisma.dailyPurchase.deleteMany({
      where: { userId }
    });

    // Generate new rotation seed for shop and adventures
    const newShopRotationSeed = Math.floor(Math.random() * 1000000);
    const newAdventureRotationSeed = Math.floor(Math.random() * 1000000);
    
    // Update save data
    const updatedSave = await prisma.save.update({
      where: { userId },
      data: {
        energy: maxEnergy,
        lastEnergyUpdate: new Date(),
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
      energy: Math.floor(maxEnergy),
      dailyLimitsReset: true,
      shopRotated: true,
      adventuresRotated: true
    });

  } catch (error) {
    logger.error('Error simulating new day:', error);
    res.status(500).json({ error: 'Failed to simulate new day' });
  }
};

// Test endpoint to simulate different dates (for testing daily resets)
export const simulateDate = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized - no user ID' });
    }

    const { date } = req.body;
    if (!date) {
      return res.status(400).json({ error: 'Date required' });
    }


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


    res.json({
      success: true,
      message: `Set test date to ${testDate.toISOString().slice(0, 10)}`,
      testDate: testDate.toISOString().slice(0, 10)
    });

  } catch (error) {
    logger.error('Error setting test date:', error);
    res.status(500).json({ error: 'Failed to set test date' });
  }
};

// Test endpoint to auto-complete all in-progress adventures
export const autoCompleteAdventures = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get current save
    const save = await prisma.save.findUnique({ where: { userId } });
    if (!save) {
      return res.status(404).json({ error: 'Save not found' });
    }

    // Find all in-progress adventures
    const inProgressAdventures = await prisma.adventureAttempt.findMany({
      where: {
        userId,
        status: "in_progress"
      },
      include: {
        Adventure: true
      }
    });

    let readyCount = 0;

    // Mark all in-progress adventures as ready to claim
    for (const attempt of inProgressAdventures) {
      // Mark adventure as ready to claim
      await prisma.adventureAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "ready_to_claim"
        }
      });

      readyCount++;
    }

    let message = `Marked ${readyCount} adventure(s) as ready to claim`;
    if (readyCount === 0) {
      message = 'No adventures to mark as ready';
    }

    res.json({
      success: true,
      message,
      adventuresReady: readyCount
    });

  } catch (error) {
    logger.error('Error auto-completing adventures:', error);
    res.status(500).json({ error: 'Failed to auto-complete adventures' });
  }
};