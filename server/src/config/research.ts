// Research System Configuration
export interface ResearchBenefit {
  id: string;
  name: string;
  description: string;
  type: 'monetary' | 'energy' | 'stat' | 'bonus' | 'xp' | 'adventure' | 'utility' | 'quality';
  value: number;
  isPercentage: boolean;
  category: 'strength' | 'endurance' | 'mobility';
}

export interface ResearchTier {
  tier: number;
  cost: number;
  requiredProficiency: number;
  benefits: ResearchBenefit[];
}

// Research benefits for each exercise
export const RESEARCH_BENEFITS: Record<string, ResearchTier[]> = {
  // STRENGTH EXERCISES - Focus on monetary gains and efficiency
  'dumbbell_curls': [
    {
      tier: 1,
      cost: 2,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'dumbbell_curls_t1_money',
          name: 'Personal Training',
          description: 'Gain $5-15 cash per workout',
          type: 'monetary',
          value: 10,
          isPercentage: false,
          category: 'strength'
        }
      ]
    },
    {
      tier: 2,
      cost: 4,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'dumbbell_curls_t2_energy',
          name: 'Efficient Form',
          description: 'Reduce energy cost by 15%',
          type: 'energy',
          value: 15,
          isPercentage: true,
          category: 'strength'
        }
      ]
    },
    {
      tier: 3,
      cost: 6,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'dumbbell_curls_t3_stat',
          name: 'Muscle Memory',
          description: 'Gain +1 extra strength per workout',
          type: 'stat',
          value: 1,
          isPercentage: false,
          category: 'strength'
        }
      ]
    },
    {
      tier: 4,
      cost: 8,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'dumbbell_curls_t4_money',
          name: 'Gym Owner',
          description: 'Gain $20-50 cash per workout',
          type: 'monetary',
          value: 35,
          isPercentage: false,
          category: 'strength'
        }
      ]
    }
  ],

  'bench_press': [
    {
      tier: 1,
      cost: 2,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'bench_press_t1_energy',
          name: 'Power Lifting',
          description: 'Reduce energy cost by 20%',
          type: 'energy',
          value: 20,
          isPercentage: true,
          category: 'strength'
        }
      ]
    },
    {
      tier: 2,
      cost: 4,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'bench_press_t2_stat',
          name: 'Chest Development',
          description: 'Gain +2 extra strength per workout',
          type: 'stat',
          value: 2,
          isPercentage: false,
          category: 'strength'
        }
      ]
    },
    {
      tier: 3,
      cost: 6,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'bench_press_t3_money',
          name: 'Competition Prize',
          description: 'Gain $15-30 cash per workout',
          type: 'monetary',
          value: 22,
          isPercentage: false,
          category: 'strength'
        }
      ]
    },
    {
      tier: 4,
      cost: 8,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'bench_press_t4_energy',
          name: 'Master Technique',
          description: 'Reduce energy cost by 30%',
          type: 'energy',
          value: 30,
          isPercentage: true,
          category: 'strength'
        }
      ]
    }
  ],

  'pull_ups': [
    {
      tier: 1,
      cost: 2,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'pull_ups_t1_stat',
          name: 'Back Strength',
          description: 'Gain +1 extra strength per workout',
          type: 'stat',
          value: 1,
          isPercentage: false,
          category: 'strength'
        }
      ]
    },
    {
      tier: 2,
      cost: 4,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'pull_ups_t2_money',
          name: 'Rock Climbing',
          description: 'Gain $8-20 cash per workout',
          type: 'monetary',
          value: 14,
          isPercentage: false,
          category: 'strength'
        }
      ]
    },
    {
      tier: 3,
      cost: 6,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'pull_ups_t3_energy',
          name: 'Bodyweight Mastery',
          description: 'Reduce energy cost by 25%',
          type: 'energy',
          value: 25,
          isPercentage: true,
          category: 'strength'
        }
      ]
    },
    {
      tier: 4,
      cost: 8,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'pull_ups_t4_stat',
          name: 'Grip Strength',
          description: 'Gain +3 extra strength per workout',
          type: 'stat',
          value: 3,
          isPercentage: false,
          category: 'strength'
        }
      ]
    }
  ],

  'squats': [
    {
      tier: 1,
      cost: 2,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'squats_t1_energy',
          name: 'Leg Power',
          description: 'Reduce energy cost by 18%',
          type: 'energy',
          value: 18,
          isPercentage: true,
          category: 'strength'
        }
      ]
    },
    {
      tier: 2,
      cost: 4,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'squats_t2_money',
          name: 'Personal Trainer',
          description: 'Gain $10-25 cash per workout',
          type: 'monetary',
          value: 17,
          isPercentage: false,
          category: 'strength'
        }
      ]
    },
    {
      tier: 3,
      cost: 6,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'squats_t3_stat',
          name: 'Core Stability',
          description: 'Gain +2 extra strength per workout',
          type: 'stat',
          value: 2,
          isPercentage: false,
          category: 'strength'
        }
      ]
    },
    {
      tier: 4,
      cost: 8,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'squats_t4_energy',
          name: 'Olympic Lifting',
          description: 'Reduce energy cost by 35%',
          type: 'energy',
          value: 35,
          isPercentage: true,
          category: 'strength'
        }
      ]
    }
  ],

  'ab_crunches': [
    {
      tier: 1,
      cost: 2,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'ab_crunches_t1_money',
          name: 'Fitness Model',
          description: 'Gain $3-12 cash per workout',
          type: 'monetary',
          value: 7,
          isPercentage: false,
          category: 'strength'
        }
      ]
    },
    {
      tier: 2,
      cost: 4,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'ab_crunches_t2_stat',
          name: 'Core Definition',
          description: 'Gain +1 extra strength per workout',
          type: 'stat',
          value: 1,
          isPercentage: false,
          category: 'strength'
        }
      ]
    },
    {
      tier: 3,
      cost: 6,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'ab_crunches_t3_energy',
          name: 'Efficient Crunches',
          description: 'Reduce energy cost by 22%',
          type: 'energy',
          value: 22,
          isPercentage: true,
          category: 'strength'
        }
      ]
    },
    {
      tier: 4,
      cost: 8,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'ab_crunches_t4_money',
          name: 'Influencer',
          description: 'Gain $25-60 cash per workout',
          type: 'monetary',
          value: 42,
          isPercentage: false,
          category: 'strength'
        }
      ]
    }
  ],

  'shoulder_press': [
    {
      tier: 1,
      cost: 2,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'shoulder_press_t1_stat',
          name: 'Shoulder Power',
          description: 'Gain +1 extra strength per workout',
          type: 'stat',
          value: 1,
          isPercentage: false,
          category: 'strength'
        }
      ]
    },
    {
      tier: 2,
      cost: 4,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'shoulder_press_t2_energy',
          name: 'Overhead Strength',
          description: 'Reduce energy cost by 16%',
          type: 'energy',
          value: 16,
          isPercentage: true,
          category: 'strength'
        }
      ]
    },
    {
      tier: 3,
      cost: 6,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'shoulder_press_t3_money',
          name: 'Athletic Sponsor',
          description: 'Gain $12-28 cash per workout',
          type: 'monetary',
          value: 20,
          isPercentage: false,
          category: 'strength'
        }
      ]
    },
    {
      tier: 4,
      cost: 8,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'shoulder_press_t4_stat',
          name: 'Olympic Shoulders',
          description: 'Gain +4 extra strength per workout',
          type: 'stat',
          value: 4,
          isPercentage: false,
          category: 'strength'
        }
      ]
    }
  ],

  // ENDURANCE EXERCISES - Focus on bonus rewards and multipliers
  'running': [
    {
      tier: 1,
      cost: 2,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'running_t1_bonus',
          name: 'Marathon Runner',
          description: '+25% bonus rewards from adventures',
          type: 'bonus',
          value: 25,
          isPercentage: true,
          category: 'endurance'
        }
      ]
    },
    {
      tier: 2,
      cost: 4,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'running_t2_xp',
          name: 'Endurance Training',
          description: '+15% XP gain from all exercises',
          type: 'xp',
          value: 15,
          isPercentage: true,
          category: 'endurance'
        }
      ]
    },
    {
      tier: 3,
      cost: 6,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'running_t3_adventure',
          name: 'Explorer',
          description: '+1 extra adventure attempt per day',
          type: 'adventure',
          value: 1,
          isPercentage: false,
          category: 'endurance'
        }
      ]
    },
    {
      tier: 4,
      cost: 8,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'running_t4_bonus',
          name: 'Ultra Marathon',
          description: '+50% bonus rewards from adventures',
          type: 'bonus',
          value: 50,
          isPercentage: true,
          category: 'endurance'
        }
      ]
    }
  ],

  'cycling': [
    {
      tier: 1,
      cost: 2,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'cycling_t1_xp',
          name: 'Cardio Boost',
          description: '+12% XP gain from all exercises',
          type: 'xp',
          value: 12,
          isPercentage: true,
          category: 'endurance'
        }
      ]
    },
    {
      tier: 2,
      cost: 4,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'cycling_t2_bonus',
          name: 'Tour de France',
          description: '+20% bonus rewards from adventures',
          type: 'bonus',
          value: 20,
          isPercentage: true,
          category: 'endurance'
        }
      ]
    },
    {
      tier: 3,
      cost: 6,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'cycling_t3_adventure',
          name: 'Distance Rider',
          description: '+1 extra adventure attempt per day',
          type: 'adventure',
          value: 1,
          isPercentage: false,
          category: 'endurance'
        }
      ]
    },
    {
      tier: 4,
      cost: 8,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'cycling_t4_xp',
          name: 'Speed Demon',
          description: '+30% XP gain from all exercises',
          type: 'xp',
          value: 30,
          isPercentage: true,
          category: 'endurance'
        }
      ]
    }
  ],

  'swimming': [
    {
      tier: 1,
      cost: 2,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'swimming_t1_adventure',
          name: 'Aquatic Explorer',
          description: '+1 extra adventure attempt per day',
          type: 'adventure',
          value: 1,
          isPercentage: false,
          category: 'endurance'
        }
      ]
    },
    {
      tier: 2,
      cost: 4,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'swimming_t2_bonus',
          name: 'Olympic Swimmer',
          description: '+30% bonus rewards from adventures',
          type: 'bonus',
          value: 30,
          isPercentage: true,
          category: 'endurance'
        }
      ]
    },
    {
      tier: 3,
      cost: 6,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'swimming_t3_xp',
          name: 'Full Body Cardio',
          description: '+20% XP gain from all exercises',
          type: 'xp',
          value: 20,
          isPercentage: true,
          category: 'endurance'
        }
      ]
    },
    {
      tier: 4,
      cost: 8,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'swimming_t4_adventure',
          name: 'Deep Sea Diver',
          description: '+2 extra adventure attempts per day',
          type: 'adventure',
          value: 2,
          isPercentage: false,
          category: 'endurance'
        }
      ]
    }
  ],

  'jump_rope': [
    {
      tier: 1,
      cost: 2,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'jump_rope_t1_xp',
          name: 'Rhythm Training',
          description: '+10% XP gain from all exercises',
          type: 'xp',
          value: 10,
          isPercentage: true,
          category: 'endurance'
        }
      ]
    },
    {
      tier: 2,
      cost: 4,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'jump_rope_t2_bonus',
          name: 'Boxing Champion',
          description: '+18% bonus rewards from adventures',
          type: 'bonus',
          value: 18,
          isPercentage: true,
          category: 'endurance'
        }
      ]
    },
    {
      tier: 3,
      cost: 6,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'jump_rope_t3_adventure',
          name: 'Agility Master',
          description: '+1 extra adventure attempt per day',
          type: 'adventure',
          value: 1,
          isPercentage: false,
          category: 'endurance'
        }
      ]
    },
    {
      tier: 4,
      cost: 8,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'jump_rope_t4_xp',
          name: 'Speed Rope',
          description: '+25% XP gain from all exercises',
          type: 'xp',
          value: 25,
          isPercentage: true,
          category: 'endurance'
        }
      ]
    }
  ],

  'boxing': [
    {
      tier: 1,
      cost: 2,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'boxing_t1_bonus',
          name: 'Fighter Spirit',
          description: '+22% bonus rewards from adventures',
          type: 'bonus',
          value: 22,
          isPercentage: true,
          category: 'endurance'
        }
      ]
    },
    {
      tier: 2,
      cost: 4,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'boxing_t2_xp',
          name: 'Combat Training',
          description: '+18% XP gain from all exercises',
          type: 'xp',
          value: 18,
          isPercentage: true,
          category: 'endurance'
        }
      ]
    },
    {
      tier: 3,
      cost: 6,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'boxing_t3_adventure',
          name: 'Warrior',
          description: '+1 extra adventure attempt per day',
          type: 'adventure',
          value: 1,
          isPercentage: false,
          category: 'endurance'
        }
      ]
    },
    {
      tier: 4,
      cost: 8,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'boxing_t4_bonus',
          name: 'Champion',
          description: '+45% bonus rewards from adventures',
          type: 'bonus',
          value: 45,
          isPercentage: true,
          category: 'endurance'
        }
      ]
    }
  ],

  'basketball': [
    {
      tier: 1,
      cost: 2,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'basketball_t1_xp',
          name: 'Team Player',
          description: '+14% XP gain from all exercises',
          type: 'xp',
          value: 14,
          isPercentage: true,
          category: 'endurance'
        }
      ]
    },
    {
      tier: 2,
      cost: 4,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'basketball_t2_adventure',
          name: 'Court Master',
          description: '+1 extra adventure attempt per day',
          type: 'adventure',
          value: 1,
          isPercentage: false,
          category: 'endurance'
        }
      ]
    },
    {
      tier: 3,
      cost: 6,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'basketball_t3_bonus',
          name: 'MVP',
          description: '+35% bonus rewards from adventures',
          type: 'bonus',
          value: 35,
          isPercentage: true,
          category: 'endurance'
        }
      ]
    },
    {
      tier: 4,
      cost: 8,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'basketball_t4_xp',
          name: 'Hall of Fame',
          description: '+40% XP gain from all exercises',
          type: 'xp',
          value: 40,
          isPercentage: true,
          category: 'endurance'
        }
      ]
    }
  ],

  // MOBILITY EXERCISES - Jack of all trades, utility benefits
  'hip_flexor': [
    {
      tier: 1,
      cost: 2,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'hip_flexor_t1_utility',
          name: 'Flexibility',
          description: '+5 max energy',
          type: 'utility',
          value: 5,
          isPercentage: false,
          category: 'mobility'
        }
      ]
    },
    {
      tier: 2,
      cost: 4,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'hip_flexor_t2_quality',
          name: 'Recovery',
          description: 'Energy regenerates 10% faster',
          type: 'quality',
          value: 10,
          isPercentage: true,
          category: 'mobility'
        }
      ]
    },
    {
      tier: 3,
      cost: 6,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'hip_flexor_t3_utility',
          name: 'Range of Motion',
          description: '+10 max energy',
          type: 'utility',
          value: 10,
          isPercentage: false,
          category: 'mobility'
        }
      ]
    },
    {
      tier: 4,
      cost: 8,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'hip_flexor_t4_quality',
          name: 'Perfect Form',
          description: 'Energy regenerates 20% faster',
          type: 'quality',
          value: 20,
          isPercentage: true,
          category: 'mobility'
        }
      ]
    }
  ],

  'shoulder_roll': [
    {
      tier: 1,
      cost: 2,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'shoulder_roll_t1_quality',
          name: 'Posture',
          description: 'Energy regenerates 8% faster',
          type: 'quality',
          value: 8,
          isPercentage: true,
          category: 'mobility'
        }
      ]
    },
    {
      tier: 2,
      cost: 4,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'shoulder_roll_t2_utility',
          name: 'Shoulder Health',
          description: '+8 max energy',
          type: 'utility',
          value: 8,
          isPercentage: false,
          category: 'mobility'
        }
      ]
    },
    {
      tier: 3,
      cost: 6,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'shoulder_roll_t3_quality',
          name: 'Alignment',
          description: 'Energy regenerates 15% faster',
          type: 'quality',
          value: 15,
          isPercentage: true,
          category: 'mobility'
        }
      ]
    },
    {
      tier: 4,
      cost: 8,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'shoulder_roll_t4_utility',
          name: 'Perfect Posture',
          description: '+15 max energy',
          type: 'utility',
          value: 15,
          isPercentage: false,
          category: 'mobility'
        }
      ]
    }
  ],

  'cat_cow': [
    {
      tier: 1,
      cost: 2,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'cat_cow_t1_utility',
          name: 'Spinal Health',
          description: '+6 max energy',
          type: 'utility',
          value: 6,
          isPercentage: false,
          category: 'mobility'
        }
      ]
    },
    {
      tier: 2,
      cost: 4,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'cat_cow_t2_quality',
          name: 'Breathing',
          description: 'Energy regenerates 12% faster',
          type: 'quality',
          value: 12,
          isPercentage: true,
          category: 'mobility'
        }
      ]
    },
    {
      tier: 3,
      cost: 6,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'cat_cow_t3_utility',
          name: 'Core Stability',
          description: '+12 max energy',
          type: 'utility',
          value: 12,
          isPercentage: false,
          category: 'mobility'
        }
      ]
    },
    {
      tier: 4,
      cost: 8,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'cat_cow_t4_quality',
          name: 'Zen Master',
          description: 'Energy regenerates 25% faster',
          type: 'quality',
          value: 25,
          isPercentage: true,
          category: 'mobility'
        }
      ]
    }
  ],

  'pigeon_pose': [
    {
      tier: 1,
      cost: 2,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'pigeon_pose_t1_quality',
          name: 'Hip Opening',
          description: 'Energy regenerates 9% faster',
          type: 'quality',
          value: 9,
          isPercentage: true,
          category: 'mobility'
        }
      ]
    },
    {
      tier: 2,
      cost: 4,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'pigeon_pose_t2_utility',
          name: 'Flexibility',
          description: '+7 max energy',
          type: 'utility',
          value: 7,
          isPercentage: false,
          category: 'mobility'
        }
      ]
    },
    {
      tier: 3,
      cost: 6,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'pigeon_pose_t3_quality',
          name: 'Deep Stretch',
          description: 'Energy regenerates 18% faster',
          type: 'quality',
          value: 18,
          isPercentage: true,
          category: 'mobility'
        }
      ]
    },
    {
      tier: 4,
      cost: 8,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'pigeon_pose_t4_utility',
          name: 'Yoga Master',
          description: '+18 max energy',
          type: 'utility',
          value: 18,
          isPercentage: false,
          category: 'mobility'
        }
      ]
    }
  ],

  'downward_dog': [
    {
      tier: 1,
      cost: 2,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'downward_dog_t1_utility',
          name: 'Full Body Stretch',
          description: '+9 max energy',
          type: 'utility',
          value: 9,
          isPercentage: false,
          category: 'mobility'
        }
      ]
    },
    {
      tier: 2,
      cost: 4,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'downward_dog_t2_quality',
          name: 'Inversion',
          description: 'Energy regenerates 11% faster',
          type: 'quality',
          value: 11,
          isPercentage: true,
          category: 'mobility'
        }
      ]
    },
    {
      tier: 3,
      cost: 6,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'downward_dog_t3_utility',
          name: 'Strength & Flexibility',
          description: '+16 max energy',
          type: 'utility',
          value: 16,
          isPercentage: false,
          category: 'mobility'
        }
      ]
    },
    {
      tier: 4,
      cost: 8,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'downward_dog_t4_quality',
          name: 'Asana Master',
          description: 'Energy regenerates 22% faster',
          type: 'quality',
          value: 22,
          isPercentage: true,
          category: 'mobility'
        }
      ]
    }
  ],

  'spinal_twist': [
    {
      tier: 1,
      cost: 2,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'spinal_twist_t1_quality',
          name: 'Spinal Mobility',
          description: 'Energy regenerates 7% faster',
          type: 'quality',
          value: 7,
          isPercentage: true,
          category: 'mobility'
        }
      ]
    },
    {
      tier: 2,
      cost: 4,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'spinal_twist_t2_utility',
          name: 'Twist & Turn',
          description: '+5 max energy',
          type: 'utility',
          value: 5,
          isPercentage: false,
          category: 'mobility'
        }
      ]
    },
    {
      tier: 3,
      cost: 6,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'spinal_twist_t3_quality',
          name: 'Rotation Master',
          description: 'Energy regenerates 16% faster',
          type: 'quality',
          value: 16,
          isPercentage: true,
          category: 'mobility'
        }
      ]
    },
    {
      tier: 4,
      cost: 8,
      requiredProficiency: 1000,
      benefits: [
        {
          id: 'spinal_twist_t4_utility',
          name: 'Perfect Spine',
          description: '+20 max energy',
          type: 'utility',
          value: 20,
          isPercentage: false,
          category: 'mobility'
        }
      ]
    }
  ]
};

/**
 * Get research benefits for a specific exercise and tier
 */
export function getResearchBenefits(exerciseId: string, tier: number): ResearchBenefit[] {
  const exerciseBenefits = RESEARCH_BENEFITS[exerciseId];
  if (!exerciseBenefits) return [];
  
  const tierBenefits = exerciseBenefits.find(t => t.tier === tier);
  return tierBenefits ? tierBenefits.benefits : [];
}

/**
 * Get all research benefits for a specific exercise
 */
export function getAllResearchBenefits(exerciseId: string): ResearchTier[] {
  return RESEARCH_BENEFITS[exerciseId] || [];
}

/**
 * Check if a tier can be unlocked (requires previous tier)
 */
export function canUnlockTier(exerciseId: string, tier: number, currentTier: number): boolean {
  if (tier === 1) return true;
  return currentTier >= tier - 1;
}

/**
 * Get the cost for a specific tier
 */
export function getTierCost(exerciseId: string, tier: number): number {
  const exerciseBenefits = RESEARCH_BENEFITS[exerciseId];
  if (!exerciseBenefits) return 0;
  
  const tierBenefits = exerciseBenefits.find(t => t.tier === tier);
  return tierBenefits ? tierBenefits.cost : 0;
}
