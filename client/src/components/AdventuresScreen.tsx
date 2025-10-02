import { useEffect, useState } from 'react';
import { useGameStore } from '../game/store';
import { useAuthStore } from '../stores/authStore';

interface AdventuresScreenProps {
  onBack: () => void;
}

export default function AdventuresScreen({ onBack }: AdventuresScreenProps) {
  const { energy, adventures, setAdventures, attemptAdventure } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [attempting, setAttempting] = useState<string | null>(null);

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
        console.log('Using token:', token.substring(0, 20) + '...');
        const response = await fetch("http://localhost:4000/api/adventures", {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        console.log('Adventures response status:', response.status);
        console.log('Adventures response headers:', response.headers);
        if (response.ok) {
          const dailyAdventures = await response.json();
          console.log('Loaded adventures:', dailyAdventures.length);
          console.log('Sample adventure:', dailyAdventures[0]);
          setAdventures(dailyAdventures);
        } else {
          const error = await response.text();
          console.error('Adventures API error:', error);
        }
      } catch (error) {
        console.error("Failed to load adventures:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAdventures();
  }, [setAdventures]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-blue-400';
      case 'hard': return 'text-orange-400';
      case 'legendary': return 'text-purple-400';
      default: return 'text-zinc-400';
    }
  };

  const getDifficultyBg = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 border-green-500/30';
      case 'medium': return 'bg-blue-500/20 border-blue-500/30';
      case 'hard': return 'bg-orange-500/20 border-orange-500/30';
      case 'legendary': return 'bg-purple-500/20 border-purple-500/30';
      default: return 'bg-zinc-500/20 border-zinc-500/30';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'EASY';
      case 'medium': return 'MED';
      case 'hard': return 'HARD';
      case 'legendary': return 'LEG';
      default: return '???';
    }
  };

  const handleAttemptAdventure = async (adventureId: string) => {
    setAttempting(adventureId);
    try {
      const result = await attemptAdventure(adventureId);
      if (result) {
        if (result.success) {
          alert(`Adventure successful! Gained ${result.xpGained} XP, $${result.cashGained} cash, and stats!`);
        } else {
          alert(`Adventure failed, but you gained ${result.xpGained} XP for trying!`);
        }
      }
    } finally {
      setAttempting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
        <div className="text-center">
          <div className="text-2xl mb-4 font-black text-gray-700" style={{ fontFamily: 'monospace' }}>LOADING</div>
          <div className="text-gray-700 font-bold">Loading adventures...</div>
          <div className="text-gray-600 text-sm mt-2">Check console for debug info</div>
        </div>
      </div>
    );
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
              ENERGY: {energy}/100
            </div>
          </div>
        </div>

        {/* Adventures */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-gray-800 mb-2" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #fff' }}>
                DAILY ADVENTURES
              </h2>
              <p className="text-gray-700" style={{ fontFamily: 'monospace' }}>
                Complete adventures to earn XP and stats. Higher difficulty adventures require more skill but give better rewards!
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adventures.map((adventure) => (
                <div
                  key={adventure.id}
                  className={`p-6 rounded-lg border-2 border-black shadow-lg transition-all duration-300 ${
                    adventure.canAttempt && energy >= adventure.energyCost
                      ? `${getDifficultyBg(adventure.difficulty)} hover:scale-105 cursor-pointer`
                      : 'bg-gray-300 border-gray-500 opacity-50'
                  }`}
                  style={{ imageRendering: 'pixelated' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{getDifficultyIcon(adventure.difficulty)}</div>
                    <div className={`text-sm font-black px-2 py-1 rounded ring-2 ring-black ${getDifficultyBg(adventure.difficulty)} ${getDifficultyColor(adventure.difficulty)}`} style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                      {adventure.difficulty.toUpperCase()}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-black text-gray-800 mb-2" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #fff' }}>
                    {adventure.name}
                  </h3>
                  <p className="text-sm text-gray-700 mb-4" style={{ fontFamily: 'monospace' }}>
                    {adventure.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-bold" style={{ fontFamily: 'monospace' }}>ENERGY COST:</span>
                      <span className="text-red-600 font-black" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                        {adventure.energyCost}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-bold" style={{ fontFamily: 'monospace' }}>XP REWARD:</span>
                      <span className="text-blue-600 font-black" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                        {adventure.xpReward}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-bold" style={{ fontFamily: 'monospace' }}>CASH REWARD:</span>
                      <span className="text-yellow-600 font-black" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                        ${adventure.cashReward}
                      </span>
                    </div>
                    {(adventure.strengthReq > 0 || adventure.staminaReq > 0) && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 font-bold" style={{ fontFamily: 'monospace' }}>REQUIREMENTS:</span>
                        <div className="flex space-x-2">
                          {adventure.strengthReq > 0 && (
                            <span className="text-red-600 font-black" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                              STR {adventure.strengthReq}
                            </span>
                          )}
                          {adventure.staminaReq > 0 && (
                            <span className="text-green-600 font-black" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                              STA {adventure.staminaReq}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleAttemptAdventure(adventure.id)}
                    disabled={!adventure.canAttempt || energy < adventure.energyCost || attempting === adventure.id}
                    className={`w-full py-2 px-4 rounded-lg font-black transition-all duration-200 ring-2 ring-black ${
                      adventure.canAttempt && energy >= adventure.energyCost && attempting !== adventure.id
                        ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white hover:shadow-lg'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                    style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}
                  >
                    {attempting === adventure.id 
                      ? 'ATTEMPTING...' 
                      : !adventure.canAttempt 
                        ? 'REQUIREMENTS NOT MET'
                        : energy < adventure.energyCost 
                          ? 'NOT ENOUGH ENERGY'
                          : 'ATTEMPT ADVENTURE'
                    }
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

