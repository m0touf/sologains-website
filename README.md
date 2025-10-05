# SoloGains - Fitness RPG Game

A comprehensive fitness-themed RPG game built with React, TypeScript, Node.js, and PostgreSQL. Train your character, complete exercises, research upgrades, go on adventures, and build your fitness empire!

## Game Overview

SoloGains is an immersive fitness RPG where you build your character's strength, stamina, and mobility through various exercises and adventures. The game features a deep progression system with research upgrades, daily adventures, and strategic resource management.

## Core Features

### **Exercise System**
The heart of SoloGains is its comprehensive exercise system featuring:

- **18 Unique Exercises** across 3 categories:
  - **Strength (6 exercises)**: Dumbbell Curls, Bench Press, Pull-ups, Squats, Ab Crunches, Shoulder Press
  - **Endurance (6 exercises)**: Running, Cycling, Swimming, Jump Rope, Boxing, Basketball
  - **Mobility (6 exercises)**: Hip Flexor Stretch, Shoulder Roll Stretch, Cat-Cow Stretch, Pigeon Pose, Downward Dog, Spinal Twist

- **Individual Proficiency System**: Each exercise has its own proficiency level (0-1000)
- **Energy-Based Workouts**: Spend energy to perform exercises and gain rewards
- **Dynamic Rewards**: XP, stats, cash, and proficiency points based on performance
- **Intensity & Grade System**: Choose workout intensity (1-5) and performance grade affects rewards

### **Character Progression**
Build your character through multiple progression systems:

- **Level System**: 1-100 levels with exponential XP curve
- **3 Core Stats**: 
  - **Strength**: Affects strength-based exercises and adventure requirements
  - **Stamina**: Affects endurance exercises and adventure success
  - **Mobility**: Affects mobility exercises and overall character flexibility
- **Proficiency Points**: Earned through leveling up, used for research upgrades
- **Energy Management**: Regenerates 5 energy per hour, caps at 150 (can be increased via research)

### **Research System**
Unlock powerful upgrades through the research system:

- **4 Tiers per Exercise**: Each exercise has 4 research tiers to unlock
- **8 Benefit Types**:
  - **Monetary**: Earn cash per workout
  - **Energy**: Reduce energy costs for exercises
  - **Stat**: Gain extra stat points per workout
  - **Bonus**: Increase adventure reward bonuses
  - **XP**: Boost XP gain from all exercises
  - **Adventure**: Gain extra adventure attempts per day
  - **Utility**: Increase maximum energy capacity
  - **Quality**: Speed up energy regeneration
- **Proficiency Requirements**: Must reach 1000 proficiency to research
- **Progressive Costs**: 2, 4, 6, 8 proficiency points per tier
- **Strategic Choices**: Each exercise category focuses on different benefit types

### **Adventure System**
Embark on daily adventures for high rewards:

- **50 Daily Adventures**: Rotating pool of adventures that change daily
- **4 Difficulty Levels**: Easy, Medium, Hard, Legendary
- **Stat Requirements**: Must meet strength/stamina requirements to attempt
- **Daily Limits**: 2 attempts per day (can be increased via research up to 6+ attempts)
- **Time-Based Completion**: Adventures take real time to complete (15-120 minutes)
- **High Rewards**: Adventures offer significantly more XP, cash, and stat gains than exercises
- **Risk vs Reward**: Higher difficulty adventures offer better rewards but require higher stats

### **Shop System**
Purchase boost items and upgrades:

- **Daily Rotating Items**: New items available every day
- **Boost Items**:
  - **XP Boosts**: Temporary XP multipliers for workouts
  - **Proficiency Boosts**: Temporary proficiency gain multipliers
  - **Luck Boosts**: Chance for bonus adventure rewards
- **Energy Items**: Instant energy refills
- **Proficiency Points**: Buy additional research currency
- **Strategic Purchases**: Plan your purchases based on your current goals

### **Animated Character System**
Interactive character with smooth animations:

- **Phaser.js Animations**: High-quality sprite-based character animations
- **Multiple Animation States**:
  - **Idle**: Default standing animation
  - **Walk**: Walking animation for main screen
  - **Emote**: Click-triggered celebration animation
- **Interactive Elements**: Click character to trigger emote animation
- **Responsive Design**: Animations scale and center properly across devices
- **Sprite Sheet System**: Efficient animation system using sprite sheets

## Mathematical Systems

### **Energy System**
Sophisticated energy management with multiple factors:

```
Energy Regeneration: 5 energy per hour
Base Energy Cap: 150 energy
Overcap Buffer: +20 energy (total 170 max)
Daily Energy Target: 120 energy regenerated
Daily XP Target: 200 XP (1.67x scaling factor)
```

**Energy Calculation Formula**:
```typescript
currentEnergy = previousEnergy + (ENERGY_RATE_PER_HOUR × hoursElapsed)
cappedEnergy = min(ENERGY_CAP, currentEnergy)
maxEnergy = min(ENERGY_CAP + OVERCAP_BUFFER, currentEnergy)
```

**Time to Next Energy**:
```typescript
minutesToNext = 12 - (fractionalEnergy × 12)
```

### **XP & Leveling System**
Exponential progression curve designed for long-term engagement:

```
Maximum Level: 100
Base XP Requirement: 20 XP for level 1
Growth Factor: 1.048900
```

**XP Curve Formulas**:
```typescript
// XP required for next level
xpToNext(level) = BASE_REQ × GROWTH^(level-1)

// Total XP to reach a level
totalXpTo(level) = BASE_REQ × (GROWTH^level - 1) / (GROWTH - 1)

// Level from total XP
levelFromXp(totalXp) = calculated level based on cumulative XP
```

**XP Scaling**:
```typescript
XP_ENERGY_SCALE = DAILY_XP_TARGET / ENERGY_PER_DAY = 200/120 = 1.666...
scaledXp = max(1, round(rawXp × XP_ENERGY_SCALE))
```

### **Proficiency System**
Individual exercise mastery with diminishing returns:

```
Base Multiplier: K = 5.0
Maximum Proficiency: 1000
Minimum Gain: 12 points per workout
```

**Proficiency Gain Formula**:
```typescript
// Intensity multiplier
intensityMultiplier = 1 + 0.25 × (intensity - 1)

// Grade multiplier
gradeMultiplier = {
  "perfect": 1.2,
  "good": 1.0,
  "okay": 0.8,
  "miss": 0.4
}

// Diminishing returns
diminishingReturns = 1 - (proficiency / MAX_PROFICIENCY)^0.5

// Daily diminishing returns
dailyDiminishingReturns = dailyEnergy <= 60 ? 1 : sqrt(60 / dailyEnergy)

// Final calculation
proficiencyGained = max(12, K × energySpent × intensityMultiplier × gradeMultiplier × diminishingReturns × dailyDiminishingReturns)
```

**Proficiency Points from Leveling**:
```typescript
proficiencyPointsGained = newLevel <= 1 ? 0 : 1 + floor((newLevel - 1) / 10)
```

### **Stat System**
Character attribute progression with diminishing returns:

```
Base Stat Gain: 1 point
Stat Gain Multiplier: 0.1
Maximum Skill Level: 100
```

**Stat Gain Formula**:
```typescript
// Base gain
baseGain = BASE_STAT_GAIN + (energySpent × STAT_GAIN_MULTIPLIER)

// Intensity multiplier
intensityMultiplier = 1 + 0.2 × (intensity - 1)

// Grade multiplier
gradeMultiplier = {
  "perfect": 1.5,
  "good": 1.0,
  "okay": 0.7,
  "miss": 0.3
}

// Diminishing returns
diminishingReturns = max(0.1, 1 - (currentStat / MAX_SKILL_LEVEL) × 0.5)

// Final stat gain
statGain = max(0, round(baseGain × intensityMultiplier × gradeMultiplier × diminishingReturns))
```

### **Adventure System**
Risk-free adventures with guaranteed success:

**Adventure Mechanics**:
- **Guaranteed Success**: If you meet stat requirements, adventure always succeeds
- **Full Rewards**: Always receive 100% of advertised rewards
- **Luck Boosts**: Chance for 1.5x XP and 1.3x cash bonuses
- **Time Investment**: Real-time completion (15-120 minutes)
- **Daily Limits**: Base 2 attempts, increased by research benefits

**Adventure Attempt Limits**:
```typescript
baseLimit = 2
researchBonuses = sum of all 'adventure' type research benefits
dailyLimit = baseLimit + researchBonuses
```

## Technical Architecture

### **Frontend (React + TypeScript)**
- **State Management**: Zustand for global game state
- **Animation Engine**: Phaser.js for smooth character animations
- **Styling**: Tailwind CSS for responsive design
- **Build Tool**: Vite for fast development and optimized builds
- **Authentication**: JWT tokens with persistent localStorage
- **API Client**: Centralized API client with error handling

### **Backend (Node.js + Express)**
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT middleware with secure token validation
- **Caching**: In-memory request deduplication and response caching
- **Logging**: Winston logger with structured logging
- **Validation**: Zod schemas for request validation
- **Error Handling**: Comprehensive error handling and logging

### **Database Schema**
```sql
-- Core tables
User (id, email, username, password, timestamps)
Save (userId, level, xp, energy, stats, cash, maxEnergy, timestamps)
Exercise (id, name, category, baseReps, baseEnergy, baseXp, statType, statGainAmount)
ExerciseProficiency (userId, exerciseId, proficiency, dailyEnergy)
ResearchUpgrade (userId, exerciseId, tier)
Adventure (id, name, description, difficulty, requirements, rewards, duration)
AdventureAttempt (userId, adventureId, success, rewards, status, timestamps)
DailyPurchase (userId, itemId, quantity, date)
```

## Getting Started

### **Prerequisites**
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### **Installation**

1. **Clone the repository**
```bash
git clone <repository-url>
cd sologains-website
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

3. **Set up environment variables**
```bash
# Server (.env)
DATABASE_URL="postgresql://username:password@localhost:5432/sologains"
JWT_SECRET="your-jwt-secret"
PORT=4000

# Client (.env)
VITE_API_BASE_URL="http://localhost:4000"
```

4. **Set up database**
```bash
cd server
npx prisma migrate dev
npx prisma db seed
```

5. **Start development servers**
```bash
# From root directory
npm run dev

# Or start individually
npm run dev:server  # Backend on port 4000
npm run dev:client  # Frontend on port 5173
```

### **Environment Variables**
```bash
# Production server
DATABASE_URL="postgresql://..."
JWT_SECRET="production-secret"
NODE_ENV="production"
PORT=4000

# Production client
VITE_API_BASE_URL="https://your-api-domain.com"
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Game Design Philosophy

SoloGains is designed around the concept of **meaningful progression** and **strategic choices**:


---

**Happy Training!**

*Build your fitness empire, one workout at a time.*
