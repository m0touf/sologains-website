import { useGameStore } from '../game/store';
import { useState } from 'react';

interface GymScreenProps {
  onBack: () => void;
  onWorkout: (type: 'strength' | 'endurance' | 'mobility', exerciseId: string, reps: number) => void;
}


export default function GymScreen({ onBack, onWorkout }: GymScreenProps) {
  const { energy, stats, xp, exercises, getProficiency, getDailyStatGains, getXpProgress, getCurrentLevel, proficiencyPoints, cash, permanentEnergy, maxEnergy } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState<'strength' | 'endurance' | 'mobility'>('strength');
  
  const level = getCurrentLevel();
  const xpProgress = getXpProgress();

  // Filter exercises by category
  const getExercisesByCategory = (category: string) => {
    return exercises.filter(exercise => exercise.category === category);
  };

  const getProficiencyColor = (percentage: number) => {
    if (percentage >= 80) return 'from-green-500 to-green-400';
    if (percentage >= 60) return 'from-yellow-500 to-yellow-400';
    if (percentage >= 40) return 'from-orange-500 to-orange-400';
    return 'from-red-500 to-red-400';
  };

  const renderExerciseCard = (exercise: any) => {
    const proficiency = getProficiency(exercise.id);
    const dailyStatGains = getDailyStatGains(exercise.id);
    const proficiencyColor = getProficiencyColor(proficiency);
    const isMaxProficiency = proficiency >= 1000;
    const isDailyLimitReached = dailyStatGains >= 5;
    
    // Get the stat gain amount and type
    const statGainAmount = exercise.statGainAmount || 1;
    const statType = exercise.statType;
    const statGainText = `+${statGainAmount} ${statType.toUpperCase()}`;
    
    return (
      <button
        key={exercise.id}
        onClick={() => onWorkout(exercise.category as 'strength' | 'endurance' | 'mobility', exercise.id, exercise.baseReps)}
        disabled={energy < exercise.baseEnergy}
        className={`group relative w-full aspect-square rounded-lg ring-2 ring-black shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden ${
          energy < exercise.baseEnergy ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        style={{
          backgroundImage: exercise.imagePath ? `url(${exercise.imagePath})` : 'none',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated'
        }}
      >
        {/* Proficiency Badge */}
        {isMaxProficiency && (
          <div className="absolute top-1 right-1 bg-yellow-500 text-black text-xs font-black px-2 py-1 rounded-full border-2 border-black z-10">
            MAX
          </div>
        )}
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
        
        {/* Content overlay */}
        <div className="relative z-10 h-full flex flex-col justify-start p-1 text-white">
          {/* Exercise Name - positioned much higher */}
          <div className="font-black text-sm text-center mb-1" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #000' }}>
            {exercise.name}
          </div>
          
          {/* Bottom section with stats - positioned at bottom */}
          <div className="mt-auto space-y-1">
            {/* Proficiency Bar */}
            <div className="mb-1">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                  PROF
                </span>
                  <span className="text-xs font-black" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                    {proficiency}/1000
                  </span>
              </div>
              <div className="w-full bg-gray-600 border border-black rounded-full h-1.5">
                <div
                  className={`h-full bg-gradient-to-r ${proficiencyColor} rounded-full transition-all duration-500`}
                  style={{ width: `${(proficiency / 1000) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Exercise Stats */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                <span className={isDailyLimitReached ? 'text-red-400' : 'text-green-400'}>{statGainText}</span>
                <span>{exercise.baseEnergy} ENERGY</span>
              </div>
              
              {/* Daily Limit Display */}
              <div className="flex justify-between text-xs font-bold" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                <span className={isDailyLimitReached ? 'text-red-400' : 'text-yellow-400'}>
                  DAILY: {dailyStatGains}/5
                </span>
                <span className="text-gray-300">LIMIT</span>
              </div>
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="flex-1 relative bg-gradient-to-br from-amber-50 to-amber-100 overflow-hidden" style={{ imageRendering: 'pixelated' }}>
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b-2 border-black bg-gradient-to-r from-amber-200 to-orange-200">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors ring-2 ring-black bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg"
              style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}
            >
              <span className="text-xl">←</span>
              <span className="font-black">BACK TO HOME</span>
            </button>
            <h1 className="text-3xl font-black text-gray-800" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #fff' }}>
              GYM
            </h1>
            <div className="text-emerald-600 font-black ring-2 ring-black bg-amber-50/95 px-4 py-2 rounded-lg" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
              ENERGY: {energy}/{maxEnergy || (100 + permanentEnergy)}
            </div>
          </div>
        </div>

        {/* Category Selector */}
        <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 ring-2 ring-black">
          <div className="flex justify-center space-x-4">
            {(['strength', 'endurance', 'mobility'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 ring-2 ring-black rounded-lg font-black transition-all duration-200 text-white shadow-lg hover:shadow-xl hover:scale-105 ${
                  selectedCategory === category 
                    ? 'bg-red-600 ring-4 ring-red-300' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
                style={{ 
                  fontFamily: 'monospace', 
                  textShadow: '1px 1px 0px #000'
                }}
              >
                {category.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Exercise Grid */}
          <div className="w-2/3 p-4 overflow-y-auto">
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-sm p-4 ring-3 ring-black shadow-lg rounded-lg" style={{ imageRendering: 'pixelated' }}>
              <h2 className="text-2xl font-black text-gray-800 mb-6 text-center" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #fff' }}>
                {selectedCategory.toUpperCase()} TRAINING
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {getExercisesByCategory(selectedCategory).map((exercise) => 
                  renderExerciseCard(exercise)
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Character Display */}
          <div className="w-1/3 p-4 flex flex-col items-center justify-start">
            <div className="text-center mb-4">
              {/* Character Placeholder */}
              <div className="mx-auto mb-3 flex items-center justify-center">
                <div className="w-48 h-48 bg-gradient-to-br from-amber-200 to-amber-300 flex items-center justify-center shadow-lg ring-3 ring-black rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300" style={{ imageRendering: 'pixelated' }}>
                  <div className="text-4xl text-amber-600 font-black" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #000' }}>?</div>
                </div>
              </div>
              <div className="text-sm text-gray-800 font-bold" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #fff' }}>
                Character coming soon
              </div>
            </div>

            {/* Character Stats */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-sm p-4 ring-3 ring-black shadow-lg rounded-lg w-full" style={{ imageRendering: 'pixelated' }}>
              <h2 className="text-2xl font-black text-gray-800 mb-4 text-center" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #fff' }}>
                YOUR STATS
              </h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-red-500 font-black text-lg bg-gradient-to-b from-red-400 to-red-600 bg-clip-text text-transparent" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>{stats.strength}</div>
                  <div className="text-gray-700 text-sm font-bold" style={{ fontFamily: 'monospace' }}>STRENGTH</div>
                </div>
                <div>
                  <div className="text-blue-500 font-black text-lg bg-gradient-to-b from-blue-400 to-blue-600 bg-clip-text text-transparent" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>{stats.stamina}</div>
                  <div className="text-gray-700 text-sm font-bold" style={{ fontFamily: 'monospace' }}>STAMINA</div>
                </div>
                <div>
                  <div className="text-green-500 font-black text-lg bg-gradient-to-b from-green-400 to-green-600 bg-clip-text text-transparent" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>{stats.mobility}</div>
                  <div className="text-gray-700 text-sm font-bold" style={{ fontFamily: 'monospace' }}>MOBILITY</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t-2 border-black">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-bold" style={{ fontFamily: 'monospace' }}>LEVEL {level}</span>
                  <span className="text-blue-500 font-black" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>{xp} XP</span>
                </div>
                
                {/* XP Progress Bar */}
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-gray-700" style={{ fontFamily: 'monospace' }}>
                      XP TO NEXT LEVEL
                    </span>
                    <span className="text-xs font-black text-gray-800" style={{ fontFamily: 'monospace' }}>
                      {xpProgress.current}/{xpProgress.needed}
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 border-2 border-black rounded-full h-3">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${xpProgress.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Proficiency Points */}
                <div className="mt-3 pt-3 border-t border-gray-400">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-700" style={{ fontFamily: 'monospace' }}>
                      PROFICIENCY POINTS
                    </span>
                    <span className="text-sm font-black text-yellow-600" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                      {proficiencyPoints}
                    </span>
                  </div>
                </div>
                
                {/* Cash */}
                <div className="mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-700" style={{ fontFamily: 'monospace' }}>
                      CASH
                    </span>
                    <span className="text-sm font-black text-green-600" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                      ${cash}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-700 font-bold" style={{ fontFamily: 'monospace' }}>ENERGY</span>
                  <span className="text-green-500 font-black" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>{energy}/{maxEnergy || (100 + permanentEnergy)}</span>
                </div>
                {permanentEnergy > 0 && (
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-700 font-bold text-sm" style={{ fontFamily: 'monospace' }}>PERMANENT ENERGY</span>
                    <span className="text-purple-500 font-black text-sm" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>+{permanentEnergy}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}