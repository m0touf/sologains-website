import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Define store items with their effects
const STORE_ITEMS = {
  'Energy Drink': { cost: 50, effect: { type: 'energy_restore', value: 20 } },
  'Protein Shake': { cost: 75, effect: { type: 'energy_restore', value: 30 } },
  'Pre-Workout': { cost: 120, effect: { type: 'energy_restore', value: 50 } },
  'Creatine': { cost: 200, effect: { type: 'stat_boost', stat: 'strength', value: 1 } },
  'BCAA': { cost: 200, effect: { type: 'stat_boost', stat: 'stamina', value: 1 } },
  'Omega-3': { cost: 200, effect: { type: 'stat_boost', stat: 'agility', value: 1 } },
  'Energy Capsule': { cost: 500, effect: { type: 'max_energy', value: 10 } },
  'Training Manual': { cost: 300, effect: { type: 'xp_boost', value: 2, duration: 5 } },
  'Recovery Kit': { cost: 1000, effect: { type: 'full_restore' } },
} as const;

const purchaseSchema = z.object({
  itemName: z.string(),
});

export const purchaseItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const parse = purchaseSchema.safeParse(req.body);
    
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.flatten() });
    }

    const { itemName } = parse.data;

    // Check if item exists
    if (!STORE_ITEMS[itemName as keyof typeof STORE_ITEMS]) {
      return res.status(400).json({ error: 'Item not found' });
    }

    const item = STORE_ITEMS[itemName as keyof typeof STORE_ITEMS];

    // Get user's current save
    const save = await prisma.save.findUnique({ where: { userId } });
    if (!save) {
      return res.status(404).json({ error: 'Save not found' });
    }

    // Check if user has enough cash
    if (save.cash < item.cost) {
      return res.status(400).json({ error: 'Not enough cash' });
    }

    // Apply item effects and deduct cash
    let updateData: any = {
      cash: save.cash - item.cost,
    };

    switch (item.effect.type) {
      case 'energy_restore':
        updateData.energy = Math.min(100, save.energy + item.effect.value);
        break;
      case 'stat_boost':
        if (item.effect.stat === 'strength') {
          updateData.strength = save.strength + item.effect.value;
        } else if (item.effect.stat === 'stamina') {
          updateData.stamina = save.stamina + item.effect.value;
        } else if (item.effect.stat === 'agility') {
          updateData.agility = save.agility + item.effect.value;
        }
        break;
      case 'max_energy':
        // For now, we'll just restore energy to max (since we don't have a max energy field yet)
        updateData.energy = 100;
        break;
      case 'full_restore':
        updateData.energy = 100;
        break;
      case 'xp_boost':
        // For now, we'll just give some XP (since we don't have boost tracking yet)
        updateData.xp = save.xp + 50;
        break;
    }

    // Update save
    const updatedSave = await prisma.save.update({
      where: { userId },
      data: updateData,
    });

    // Log the purchase (we could add a purchases table later)
    console.log(`User ${userId} purchased ${itemName} for ${item.cost} cash`);

    res.json({
      success: true,
      item: itemName,
      cost: item.cost,
      effect: item.effect,
      cashAfter: updatedSave.cash,
      statsAfter: {
        energy: updatedSave.energy,
        strength: updatedSave.strength,
        stamina: updatedSave.stamina,
        agility: updatedSave.agility,
        xp: updatedSave.xp,
      },
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStoreItems = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Return the store items for the client to display
    const storeItems = [
      {
        category: 'Energy Boosters',
        items: [
          { name: 'Energy Drink', description: 'Restore 20 energy instantly', cost: 50, icon: '🥤', type: 'energy_restore' },
          { name: 'Protein Shake', description: 'Restore 30 energy instantly', cost: 75, icon: '🥛', type: 'energy_restore' },
          { name: 'Pre-Workout', description: 'Restore 50 energy instantly', cost: 120, icon: '💊', type: 'energy_restore' },
        ]
      },
      {
        category: 'Supplements',
        items: [
          { name: 'Creatine', description: '+1 permanent strength', cost: 200, icon: '💪', type: 'stat_boost' },
          { name: 'BCAA', description: '+1 permanent stamina', cost: 200, icon: '🏃', type: 'stat_boost' },
          { name: 'Omega-3', description: '+1 permanent agility', cost: 200, icon: '🤸', type: 'stat_boost' },
        ]
      },
      {
        category: 'Special Items',
        items: [
          { name: 'Energy Capsule', description: 'Increase max energy by 10', cost: 500, icon: '⚡', type: 'max_energy' },
          { name: 'Training Manual', description: 'Double XP for next 5 workouts', cost: 300, icon: '📚', type: 'xp_boost' },
          { name: 'Recovery Kit', description: 'Instant energy reset', cost: 1000, icon: '🏥', type: 'full_restore' },
        ]
      }
    ];

    res.json(storeItems);
  } catch (error) {
    console.error('Get store items error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
