import { useEffect, useState } from 'react';
import { useGameStore } from '../game/store';
import { useAuthStore } from '../stores/authStore';
import { apiClient } from '../lib/api';
import { getTimeRemaining, getDifficultyColor, getDifficultyBg, getDifficultyIcon } from '../lib/utils';
import { showUserError } from '../lib/errorHandler';
import LoadingScreen from './LoadingScreen';

interface AdventuresScreenProps {
  onBack: () => void;
}

export default function AdventuresScreen({ onBack }: AdventuresScreenProps) {
  const { energy, adventures, setAdventures, setFromServer, maxEnergy, permanentEnergy } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [attempting, setAttempting] = useState<string | null>(null);
  const [dailyAttempts, setDailyAttempts] = useState(0);
  const [inProgressAdventures, setInProgressAdventures] = useState<any[]>([]);
  const [readyToClaimAdventures, setReadyToClaimAdventures] = useState<any[]>([]);
  const [completedAdventures, setCompletedAdventures] = useState<string[]>([]);

  // Load daily adventures on component mount
  useEffect(() => {
    const loadAdventures = async () => {
      try {
        const token = useAuthStore.getState().token;
        console.log('Token found:', !!token);
        if (!token) {
          console.log('No token found, skipping adventure load');
          setLoading(false);
          return;
        }

        console.log('Loading adventures...');
        const dailyAdventures = await apiClient.getDailyAdventures() as any;
        console.log('Loaded adventures:', dailyAdventures.length);
        console.log('Sample adventure:', dailyAdventures[0]);
        setAdventures(dailyAdventures);
      } catch (error) {
        console.error("Failed to load adventures:", showUserError(error, "Loading adventures"));
      } finally {
        setLoading(false);
      }
    };

    loadAdventures();
  }, [setAdventures]);


  // Check if adventure is in progress
  const isAdventureInProgress = (adventureId: string) => {
    return inProgressAdventures.some(adv => adv.adventureId === adventureId);
  };

  // Get in-progress adventure data
  const getInProgressAdventure = (adventureId: string) => {
    return inProgressAdventures.find(adv => adv.adventureId === adventureId);
  };

  // Check if adventure is ready to claim
  const isAdventureReadyToClaim = (adventureId: string) => {
    return readyToClaimAdventures.some(adv => adv.adventureId === adventureId);
  };

  // Get ready to claim adventure data
  const getReadyToClaimAdventure = (adventureId: string) => {
    return readyToClaimAdventures.find(adv => adv.adventureId === adventureId);
  };

  // Check if adventure is completed
  const isAdventureCompleted = (adventureId: string) => {
    return completedAdventures.includes(adventureId);
  };

  const handleAttemptAdventure = async (adventureId: string) => {
    setAttempting(adventureId);
    try {
      const result = await apiClient.attemptAdventure({ adventureId }) as any;
      if (result) {
        if (result.adventureStarted) {
          // Refresh daily attempts and in-progress adventures
          loadCurrentSave();
          loadInProgressAdventures();
        }
      }
    } finally {
      setAttempting(null);
    }
  };

  // Load current save data to get daily attempts
  const loadCurrentSave = async () => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) return;

      const save = await apiClient.getSave() as any;
      setDailyAttempts(save.dailyAdventureAttempts || 0);
    } catch (error) {
      console.error('Error loading save data:', error);
    }
  };

  // Load in-progress adventures
  const loadInProgressAdventures = async () => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) return;

        const attempts = await apiClient.getAdventureHistory() as any;
      const inProgress = attempts.filter((attempt: any) => 
        attempt.status === "in_progress" && 
        new Date(attempt.completedAt) > new Date()
      );
      setInProgressAdventures(inProgress);
    } catch (error) {
      console.error('Error loading in-progress adventures:', error);
    }
  };

  // Load ready to claim adventures
  const loadReadyToClaimAdventures = async () => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) return;

        const attempts = await apiClient.getAdventureHistory() as any;
      const readyToClaim = attempts.filter((attempt: any) => 
        attempt.status === "ready_to_claim"
      );
      setReadyToClaimAdventures(readyToClaim);
    } catch (error) {
      console.error('Error loading ready to claim adventures:', error);
    }
  };

  // Check for ready to claim adventures
  const checkReadyToClaimAdventures = async () => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) return;

      const result = await apiClient.checkAdventureCompletions() as any;
      if (result.readyAdventures && result.readyAdventures.length > 0) {
        // Refresh ready to claim adventures
        loadReadyToClaimAdventures();
      }
    } catch (error) {
      console.error('Error checking ready to claim adventures:', error);
    }
  };

  // Claim adventure rewards
  const handleClaimAdventureRewards = async (adventureAttemptId: string) => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) return;

        const result = await apiClient.claimAdventureRewards({ adventureAttemptId }) as any;
      if (result.success) {
        // Remove from ready to claim and add to completed
        setReadyToClaimAdventures(prev => prev.filter(adv => adv.id !== adventureAttemptId));
        setCompletedAdventures(prev => [...prev, result.adventureName]);
        
        // Refresh game state with updated data
        const save = await apiClient.getSave() as any;
        setFromServer({
          energy: save.energy,
          xp: save.xp,
          level: save.level,
          stats: {
            strength: save.strength,
            stamina: save.stamina,
            mobility: save.mobility,
            level: save.level,
            xp: save.xp
          },
          proficiencyPoints: save.proficiencyPoints,
          cash: save.cash,
          permanentEnergy: save.permanentEnergy || 0,
          maxEnergy: save.maxEnergy,
          ExerciseProficiencies: save.ExerciseProficiencies || [],
          ResearchUpgrades: save.ResearchUpgrades || []
        });
        
        // Refresh in-progress adventures and daily attempts
        loadInProgressAdventures();
        loadCurrentSave();
      }
    } catch (error) {
      console.error('Error claiming adventure rewards:', error);
    }
  };

    // Check for ready to claim adventures every 30 seconds and load in-progress adventures
    useEffect(() => {
      const interval = setInterval(() => {
        checkReadyToClaimAdventures();
        loadInProgressAdventures();
        loadReadyToClaimAdventures();
        loadCurrentSave(); // Also refresh daily attempts
      }, 30000);
      
      // Check immediately on load
      checkReadyToClaimAdventures();
      loadInProgressAdventures();
      loadReadyToClaimAdventures();
      loadCurrentSave();
      
      return () => clearInterval(interval);
    }, []);

    // Load completed adventures from adventure history on page load
    useEffect(() => {
      const loadCompletedAdventures = async () => {
        try {
          const token = useAuthStore.getState().token;
          if (!token) return;

          const history = await apiClient.getAdventureHistory() as any;
          const completed = history
            .filter((attempt: any) => attempt.status === "completed")
            .map((attempt: any) => attempt.adventureId);
          
          setCompletedAdventures(completed);
        } catch (error) {
          console.error('Error loading completed adventures:', error);
        }
      };

      loadCompletedAdventures();
    }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (adventures.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
        <div className="text-center">
          <div className="text-2xl mb-4 font-black text-gray-700" style={{ fontFamily: 'monospace' }}>NO DATA</div>
          <div className="text-gray-700 font-bold">No adventures available</div>
          <div className="text-gray-600 text-sm mt-2">Check console for debug info</div>
        </div>
      </div>
    );
  }

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
              ADVENTURES
            </h1>
            <div className="text-emerald-600 font-black ring-2 ring-black bg-amber-50/95 px-4 py-2 rounded-lg" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
              ENERGY: {energy}/{maxEnergy || (100 + permanentEnergy)}
            </div>
          </div>
        </div>

        {/* Adventures */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-black text-gray-800 mb-3" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #fff' }}>
                  DAILY ADVENTURES
                </h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto" style={{ fontFamily: 'monospace' }}>
                  Complete adventures to earn XP and stats. Higher difficulty adventures require more skill but give better rewards!
                </p>
              </div>
              
              {/* Daily Attempts Counter */}
              <div className="bg-gradient-to-r from-red-900 to-red-800 backdrop-blur-sm p-4 ring-2 ring-red-600 shadow-xl rounded-xl max-w-sm mx-auto">
                <div className="text-center">
                  <div className="text-white font-black text-sm mb-1" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                    DAILY ADVENTURES
                  </div>
                  <div className="text-red-200 font-black text-xl" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                    {dailyAttempts}/2 attempts used today
                  </div>
                  <div className="w-full bg-red-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-red-300 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(dailyAttempts / 2) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {adventures.map((adventure) => (
                <div
                  key={adventure.id}
                  className={`p-6 rounded-xl border-2 border-black shadow-xl transition-all duration-300 flex flex-col transform hover:scale-105 hover:shadow-2xl ${
                    isAdventureCompleted(adventure.id)
                      ? 'bg-green-300 border-green-500 opacity-80 cursor-not-allowed'
                      : isAdventureReadyToClaim(adventure.id)
                        ? 'bg-yellow-300 border-yellow-500 cursor-pointer hover:brightness-110'
                        : isAdventureInProgress(adventure.id)
                          ? `${getDifficultyBg(adventure.difficulty)} cursor-default`
                          : adventure.canAttempt && energy >= adventure.energyCost && dailyAttempts < 2 && inProgressAdventures.length === 0
                            ? `${getDifficultyBg(adventure.difficulty)} cursor-pointer hover:brightness-110`
                            : 'bg-gray-300 border-gray-500 opacity-60 cursor-not-allowed'
                  }`}
                  style={{ imageRendering: 'pixelated' }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl opacity-80">{getDifficultyIcon(adventure.difficulty)}</div>
                    <div className={`text-xs font-black px-3 py-1 rounded-full ring-2 ring-black ${getDifficultyBg(adventure.difficulty)} ${getDifficultyColor(adventure.difficulty)}`} style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                      {adventure.difficulty.toUpperCase()}
                    </div>
                  </div>
                  
                  {/* Title and Description */}
                  <div className="mb-4">
                    <h3 className="text-lg font-black text-gray-800 mb-2 leading-tight" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #fff' }}>
                      {adventure.name}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: 'monospace' }}>
                      {adventure.description}
                    </p>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 ring-1 ring-black/20">
                      <div className="text-xs text-gray-600 font-bold mb-1" style={{ fontFamily: 'monospace' }}>ENERGY</div>
                      <div className="text-red-600 font-black text-sm" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                        {adventure.energyCost}
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 ring-1 ring-black/20">
                      <div className="text-xs text-gray-600 font-bold mb-1" style={{ fontFamily: 'monospace' }}>DURATION</div>
                      <div className="text-purple-600 font-black text-sm" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                        {adventure.durationMinutes}m
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 ring-1 ring-black/20">
                      <div className="text-xs text-gray-600 font-bold mb-1" style={{ fontFamily: 'monospace' }}>XP REWARD</div>
                      <div className="text-blue-600 font-black text-sm" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                        {adventure.xpReward}
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 ring-1 ring-black/20">
                      <div className="text-xs text-gray-600 font-bold mb-1" style={{ fontFamily: 'monospace' }}>CASH</div>
                      <div className="text-yellow-600 font-black text-sm" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                        ${adventure.cashReward}
                      </div>
                    </div>
                  </div>
                  
                  {/* Requirements */}
                  {(adventure.strengthReq > 0 || adventure.staminaReq > 0) && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-600 font-bold mb-2" style={{ fontFamily: 'monospace' }}>REQUIREMENTS</div>
                      <div className="flex space-x-2">
                        {adventure.strengthReq > 0 && (
                          <div className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-black ring-1 ring-red-300" style={{ fontFamily: 'monospace' }}>
                            STR {adventure.strengthReq}
                          </div>
                        )}
                        {adventure.staminaReq > 0 && (
                          <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-black ring-1 ring-green-300" style={{ fontFamily: 'monospace' }}>
                            STA {adventure.staminaReq}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Progress bar for in-progress adventures */}
                  {isAdventureInProgress(adventure.id) && (() => {
                    const inProgressAdv = getInProgressAdventure(adventure.id);
                    const timeRemaining = getTimeRemaining(inProgressAdv.completedAt);
                    const totalDuration = adventure.durationMinutes * 60 * 1000; // Convert to milliseconds
                    const elapsed = totalDuration - (timeRemaining.timeLeft || 0);
                    const progressPercentage = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
                    
                    return (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-gray-600 font-bold" style={{ fontFamily: 'monospace' }}>IN PROGRESS</span>
                          <span className="text-blue-600 font-black" style={{ fontFamily: 'monospace' }}>
                            {timeRemaining.hours}h {timeRemaining.minutes}m left
                          </span>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-3 ring-1 ring-gray-400 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 shadow-sm"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  {/* Show appropriate button based on adventure state */}
                  {isAdventureReadyToClaim(adventure.id) ? (
                    <button
                      onClick={() => {
                        const readyAdv = getReadyToClaimAdventure(adventure.id);
                        if (readyAdv) {
                          handleClaimAdventureRewards(readyAdv.id);
                        }
                      }}
                      className="w-full py-3 px-4 rounded-xl font-black transition-all duration-300 ring-2 ring-black mt-auto transform hover:scale-105 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white hover:shadow-xl hover:ring-yellow-300"
                      style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}
                    >
                      CLAIM REWARDS
                    </button>
                  ) : !isAdventureInProgress(adventure.id) && (
                    <button
                      onClick={() => handleAttemptAdventure(adventure.id)}
                      disabled={!adventure.canAttempt || energy < adventure.energyCost || attempting === adventure.id || dailyAttempts >= 2 || inProgressAdventures.length > 0 || isAdventureCompleted(adventure.id)}
                      className={`w-full py-3 px-4 rounded-xl font-black transition-all duration-300 ring-2 ring-black mt-auto transform hover:scale-105 ${
                        adventure.canAttempt && energy >= adventure.energyCost && attempting !== adventure.id && dailyAttempts < 2 && inProgressAdventures.length === 0 && !isAdventureCompleted(adventure.id)
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white hover:shadow-xl hover:ring-blue-300'
                          : 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-60'
                      }`}
                      style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}
                    >
                      {attempting === adventure.id 
                        ? 'ATTEMPTING...' 
                        : isAdventureCompleted(adventure.id)
                          ? 'COMPLETED'
                          : inProgressAdventures.length > 0
                            ? 'ADVENTURE IN PROGRESS'
                            : dailyAttempts >= 2
                              ? 'DAILY LIMIT REACHED'
                              : !adventure.canAttempt 
                                ? 'REQUIREMENTS NOT MET'
                                : energy < adventure.energyCost 
                                  ? 'NOT ENOUGH ENERGY'
                                  : 'ATTEMPT ADVENTURE'
                      }
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

