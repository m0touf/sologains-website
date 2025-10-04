import { useState } from 'react';
import { useGameStore } from '../game/store';
import { RESEARCH_TIER_COSTS, RESEARCH_TIER_EFFECTS } from '../utils/proficiencyPoints';
import LoadingScreen from './LoadingScreen';

interface ResearchScreenProps {
  onBack: () => void;
}

export default function ResearchScreen({ onBack }: ResearchScreenProps) {
  const { exercises, getProficiency, proficiencyPoints, getResearchTier, upgradeExercise, isInitialized } = useGameStore();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null); // Only one category can be open at a time
  
  // Show loading if not initialized
  if (!isInitialized) {
    return <LoadingScreen />;
  }
  
  // Group exercises by category
  const exercisesByCategory = exercises.reduce((acc, exercise) => {
    if (!acc[exercise.category]) {
      acc[exercise.category] = [];
    }
    acc[exercise.category].push(exercise);
    return acc;
  }, {} as Record<string, typeof exercises>);



  const getTierName = (tier: number) => {
    switch (tier) {
      case 0: return 'Beginner';
      case 1: return 'Novice';
      case 2: return 'Intermediate';
      case 3: return 'Advanced';
      case 4: return 'Expert';
      default: return 'Unknown';
    }
  };

  const canUpgrade = (exerciseId: string, tier: number) => {
    const proficiency = getProficiency(exerciseId);
    const cost = RESEARCH_TIER_COSTS[tier as keyof typeof RESEARCH_TIER_COSTS];
    const currentTier = getResearchTier(exerciseId);
    return proficiency >= 1000 && proficiencyPoints >= cost && currentTier < tier;
  };

  const handleUpgrade = async (exerciseId: string, tier: number) => {
    console.log(`Attempting to upgrade ${exerciseId} to tier ${tier}`);
    try {
      await upgradeExercise(exerciseId, tier);
      console.log('Upgrade successful');
      // Upgrade successful - no popup needed
    } catch (error: any) {
      console.error('Upgrade failed:', error);
      alert(`❌ Upgrade failed. ${error.message || 'Please try again.'}`);
    }
  };

  const toggleCategory = (category: string) => {
    if (expandedCategory === category) {
      setExpandedCategory(null); // Close if already open
    } else {
      setExpandedCategory(category); // Open this category (closes any other)
    }
  };

  return (
    <div className="flex-1 relative bg-gradient-to-br from-amber-50 to-amber-100 overflow-hidden" style={{ imageRendering: 'pixelated' }}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-200/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-orange-200/20 via-transparent to-transparent"></div>
      
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
              RESEARCH
            </h1>
            <div className="text-yellow-600 font-black ring-2 ring-black bg-amber-50/95 px-4 py-2 rounded-lg" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
              PROFICIENCY POINTS: {proficiencyPoints}
            </div>
          </div>
        </div>

        {/* Research Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-black text-gray-800 mb-3" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #fff' }}>
                  RESEARCH CENTER
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto" style={{ fontFamily: 'monospace' }}>
                  Click on any exercise to view its research tiers. Spend Proficiency Points to unlock upgrades and enhance your training!
                </p>
              </div>
            </div>
            
            {/* Exercise Categories */}
            {Object.entries(exercisesByCategory).map(([category, categoryExercises]) => {
              const isExpanded = expandedCategory === category;
              
              return (
                <div key={category} className="mb-6">
                  {/* Category Dropdown Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className={`w-full p-4 rounded-xl border-4 transition-all duration-300 shadow-lg hover:shadow-xl ${
                      isExpanded 
                        ? 'bg-gradient-to-br from-amber-100 to-amber-200 border-amber-500 ring-2 ring-amber-300' 
                        : 'bg-gradient-to-br from-amber-100 to-amber-200 border-amber-400 hover:bg-gradient-to-br hover:from-amber-200 hover:to-amber-300 hover:border-amber-500'
                    }`}
                    style={{ imageRendering: 'pixelated' }}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black text-gray-800" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #fff' }}>
                        {category.toUpperCase()} EXERCISES
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-700" style={{ fontFamily: 'monospace' }}>
                          {categoryExercises.length} exercises
                        </span>
                        <div className={`text-2xl transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  {/* Category Content - Collapsible */}
                  {isExpanded && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                      {categoryExercises.map((exercise) => {
                        const proficiency = getProficiency(exercise.id);
                        const isMaxProficiency = proficiency >= 1000;
                        const currentTier = getResearchTier(exercise.id);
                        const isSelected = selectedExercise === exercise.id;
                        
                        return (
                          <div
                            key={exercise.id}
                            className={`p-4 rounded-lg border-4 transition-all duration-300 shadow-lg cursor-pointer hover:shadow-xl h-fit ${
                              isSelected
                                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200'
                                : isMaxProficiency 
                                ? 'bg-emerald-100 border-emerald-400 hover:bg-emerald-200' 
                                : 'bg-gray-100 border-gray-400 opacity-60 hover:opacity-80'
                            }`}
                            style={{ imageRendering: 'pixelated' }}
                            onClick={() => setSelectedExercise(isSelected ? null : exercise.id)}
                          >
                            {/* Exercise Header */}
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-black text-gray-700 text-sm text-center flex-1" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #fff' }}>
                                  {exercise.name}
                                </h4>
                              <div className="flex items-center gap-2">
                                <div className="text-xs text-gray-700 font-bold" style={{ fontFamily: 'monospace' }}>
                                  {proficiency}/1000
                                </div>
                                    <div className={`text-white text-xs font-black px-2 py-1 rounded border-2 border-black shadow-lg ${currentTier > 0 ? 'bg-emerald-500' : isMaxProficiency ? 'bg-blue-500' : 'bg-gray-500'}`} style={{ fontFamily: 'monospace' }}>
                                      {getTierName(currentTier)}
                                    </div>
                              </div>
                            </div>
                            
                            {/* Proficiency Bar */}
                            <div className="w-full bg-gray-400 border-2 border-black rounded-full h-3 mb-3">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isMaxProficiency 
                                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' 
                                    : 'bg-gradient-to-r from-gray-500 to-gray-700'
                                }`}
                                style={{ width: `${(proficiency / 1000) * 100}%` }}
                              ></div>
                            </div>
                            
                            {/* Current Tier Display */}
                            <div className="mb-3 p-2 bg-yellow-100 border-2 border-yellow-400 rounded">
                              <div className="text-xs font-black text-yellow-800 text-center" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #fff' }}>
                                Current Tier: {getTierName(currentTier)}
                              </div>
                            </div>
                            
                            {/* Research Tiers - Always show when selected */}
                            {isSelected && (
                              <div className="space-y-2 mt-3 pt-3 border-t-2 border-gray-400">
                                {[1, 2, 3, 4].map((tier) => {
                                  const cost = RESEARCH_TIER_COSTS[tier as keyof typeof RESEARCH_TIER_COSTS];
                                  const effect = RESEARCH_TIER_EFFECTS[tier as keyof typeof RESEARCH_TIER_EFFECTS];
                                  const canUpgradeTier = canUpgrade(exercise.id, tier);
                                  const isUnlocked = currentTier >= tier;
                                  const isLocked = !isMaxProficiency;
                                  
                                  return (
                                    <div
                                      key={tier}
                                      className={`p-2 rounded border-2 text-xs transition-all duration-200 relative ${
                                        isLocked
                                          ? 'bg-gray-200 border-gray-400 opacity-50'
                                          : isUnlocked
                                          ? 'bg-emerald-200 border-emerald-500 shadow-md'
                                          : canUpgradeTier
                                          ? 'bg-indigo-100 border-indigo-400 hover:bg-indigo-200 cursor-pointer hover:shadow-md'
                                          : 'bg-gray-200 border-gray-400 opacity-50'
                                      }`}
                                      onClick={() => !isLocked && canUpgradeTier && handleUpgrade(exercise.id, tier)}
                                      style={{ imageRendering: 'pixelated' }}
                                    >
                                      <div className="flex justify-between items-center mb-1">
                                        <span className={`font-black ${isUnlocked ? 'text-emerald-700' : 'text-gray-800'}`} style={{ fontFamily: 'monospace' }}>
                                          {getTierName(tier)}: {isUnlocked ? 'MASTERED' : isLocked ? 'LOCKED' : 'AVAILABLE'}
                                        </span>
                                        <span className={`font-black ${isUnlocked ? 'text-emerald-600' : 'text-yellow-600'}`} style={{ fontFamily: 'monospace' }}>
                                          {isUnlocked ? 'ACTIVE' : `${cost} PP`}
                                        </span>
                                      </div>
                                      <div className="text-gray-700 font-bold text-center" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #fff' }}>
                                        {isUnlocked ? `${effect.name}: ${effect.description}` : `${effect.name}: ${effect.description}`}
                                      </div>
                                      {isLocked && !isUnlocked && (
                                        <div className="text-red-600 text-xs font-bold mt-1" style={{ fontFamily: 'monospace' }}>
                                          Requires 1000 proficiency
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            
                            {/* Click to view tiers message */}
                            {!isSelected && (
                              <div className="text-center text-gray-600 text-xs py-2 font-bold" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #fff' }}>
                                Click to view research tiers
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}