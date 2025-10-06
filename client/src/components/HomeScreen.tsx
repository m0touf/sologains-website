import { useGameStore } from '../game/store';
import { useAuthStore } from '../stores/authStore';
import { useEffect, useState } from 'react';
import LoadingScreen from './LoadingScreen';
import CharacterAnimation from './CharacterAnimation';

// Utility function to calculate next daily reset time
const getNextResetTime = () => {
  // Create a date for next 11:00 AM UTC
  const nextResetUTC = new Date();
  nextResetUTC.setUTCHours(11, 0, 0, 0);
  
  // If it's already past 11 AM UTC today, set for tomorrow
  if (nextResetUTC.getTime() <= Date.now()) {
    nextResetUTC.setUTCDate(nextResetUTC.getUTCDate() + 1);
  }
  
  return nextResetUTC;
};

// Utility function to format time remaining
const formatTimeRemaining = (targetTime: Date) => {
  const now = new Date();
  const diff = targetTime.getTime() - now.getTime();
  
  if (diff <= 0) return "00:00:00";
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

interface HomeScreenProps {
  onNavigate: (section: 'gym' | 'store' | 'adventures' | 'research') => void;
  onResetEnergy: () => void;
}

export default function HomeScreen({ onNavigate, onResetEnergy }: HomeScreenProps) {
  const { energy, xp, stats, getXpProgress, getCurrentLevel, getEnergyRegenProgress, proficiencyPoints, cash, permanentEnergy, maxEnergy, luckBoostPercent, fractionalEnergy, isInitialized } = useGameStore();
  const level = getCurrentLevel();
  const xpProgress = getXpProgress();
  const energyRegenProgress = getEnergyRegenProgress();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [timeUntilReset, setTimeUntilReset] = useState<string>('00:00:00');
  const [nextResetTime, setNextResetTime] = useState<Date>(getNextResetTime());
  
  // Show loading if not initialized
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Timer to update energy progress every 10 seconds for smooth animation
  useEffect(() => {
    const interval = setInterval(async () => {
      // Fetch fresh energy data from server
      try {
        const { token } = useAuthStore.getState();
        if (token) {
          const response = await fetch('http://localhost:4000/api/save', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const save = await response.json();
            // Update the store with fresh energy data
            useGameStore.getState().setFromServer({
              energy: save.energy,
              fractionalEnergy: save.fractionalEnergy,
              lastEnergyUpdate: save.lastEnergyUpdate
            });
          }
        }
      } catch {
        
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Timer to update daily reset countdown every second
  useEffect(() => {
    const updateTimer = () => {
      const timeRemaining = formatTimeRemaining(nextResetTime);
      setTimeUntilReset(timeRemaining);
      
      // If reset time has passed, calculate next reset
      if (timeRemaining === "00:00:00") {
        setNextResetTime(getNextResetTime());
      }
    };

    // Update immediately
    updateTimer();
    
    // Then update every second
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [nextResetTime]);

  // Key bindings
  useEffect(() => {
    const handleKeyPress = async (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'o') {
        event.preventDefault();
        try {
          await onResetEnergy();
          showNotification('Energy reset successfully!', 'success');
        } catch {
          showNotification('Failed to reset energy', 'error');
        }
      } else if (event.key.toLowerCase() === 'p') {
        event.preventDefault();
        const { token } = useAuthStore.getState();
        
        if (!token) {
          showNotification('No authentication token found', 'error');
          return;
        }

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().slice(0, 10);
        
        try {
          const response = await fetch("http://localhost:4000/api/store/test-date", {
            method: 'POST',
            headers: { 
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ date: dateStr })
          });
          
          if (response.ok) {
            showNotification(`Test date set to tomorrow (${dateStr})`, 'success');
          } else {
            showNotification('Failed to set test date', 'error');
          }
        } catch {
          showNotification('Network error', 'error');
        }
      } else if (event.key === '[') {
        event.preventDefault();
        // Add 1000 cash
        const currentCash = useGameStore.getState().cash;
        useGameStore.getState().setFromServer({ cash: currentCash + 1000 });
        showNotification('Added 1000 cash!', 'success');
      } else if (event.key === ']') {
        event.preventDefault();
        // Auto-complete all in-progress adventures
        const { token } = useAuthStore.getState();
        
        if (!token) {
          showNotification('No authentication token found', 'error');
          return;
        }
        
        try {
          const response = await fetch("http://localhost:4000/api/store/auto-complete-adventures", {
            method: 'POST',
            headers: { 
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            showNotification(data.message, 'success');
          } else {
            showNotification('Failed to mark adventures as ready', 'error');
          }
        } catch {
          showNotification('Network error', 'error');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onResetEnergy]);

  // Safety check for stats
  if (!stats) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
        <div className="text-center">
          <div className="text-2xl mb-4 font-black text-gray-700" style={{ fontFamily: 'monospace' }}>LOADING</div>
          <div className="text-gray-700 font-bold">Loading character data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative bg-gradient-to-br from-amber-50 to-amber-100 overflow-hidden" style={{ imageRendering: 'pixelated' }}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: 'url(/src/assets/backgrounds/Background_Image_Home_05.png)',
          imageRendering: 'pixelated'
        }}
      ></div>
      
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b-2 border-black bg-gradient-to-r from-amber-200 to-orange-200">
            <div className="flex items-center justify-center">
              <h1 className="text-4xl font-black text-gray-800" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #fff' }}>
                HOME
              </h1>
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Activity Buttons - Horizontal Layout */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-sm p-6 ring-3 ring-black shadow-lg rounded-xl" style={{ imageRendering: 'pixelated' }}>
              <h2 className="text-2xl font-black text-gray-800 mb-6 text-center" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #fff' }}>
                ACTIVITIES
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Gym */}
                <button
                  onClick={() => onNavigate('gym')}
                  className="group w-full h-32 relative overflow-hidden rounded-xl ring-2 ring-black shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-center bg-cover"
                  style={{
                    backgroundImage: "url('/src/assets/buttons/Gym_Home_Button.png')",
                    imageRendering: 'pixelated'
                  }}
                >
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-2">
                    <h3 className="text-xl font-black text-white drop-shadow-lg" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #000' }}>GYM</h3>
                    <p className="text-xs font-bold text-white drop-shadow-md" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>Train your stats</p>
                  </div>
                </button>

                {/* Store */}
                <button
                  onClick={() => onNavigate('store')}
                  className="group w-full h-32 relative overflow-hidden rounded-xl ring-2 ring-black shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-center bg-cover"
                  style={{
                    backgroundImage: "url('/src/assets/buttons/Store_Home_Button.png')",
                    imageRendering: 'pixelated'
                  }}
                >
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-2">
                    <h3 className="text-xl font-black text-white drop-shadow-lg" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #000' }}>STORE</h3>
                    <p className="text-xs font-bold text-white drop-shadow-md" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>Buy supplements</p>
                  </div>
                </button>

                {/* Adventures */}
                <button
                  onClick={() => onNavigate('adventures')}
                  className="group w-full h-32 relative overflow-hidden rounded-xl ring-2 ring-black shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-center bg-cover"
                  style={{
                    backgroundImage: "url('/src/assets/buttons/Adventure_Home_Button.png')",
                    imageRendering: 'pixelated'
                  }}
                >
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-2">
                    <h3 className="text-xl font-black text-white drop-shadow-lg" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #000' }}>ADVENTURES</h3>
                    <p className="text-xs font-bold text-white drop-shadow-md" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>Go on quests</p>
                  </div>
                </button>

                {/* Research */}
                <button
                  onClick={() => onNavigate('research')}
                  className="group w-full h-32 relative overflow-hidden rounded-xl ring-2 ring-black shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-center bg-cover"
                  style={{
                    backgroundImage: "url('/src/assets/buttons/Research_Home_Button.png')",
                    imageRendering: 'pixelated'
                  }}
                >
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-2">
                    <h3 className="text-xl font-black text-white drop-shadow-lg" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #000' }}>RESEARCH</h3>
                    <p className="text-xs font-bold text-white drop-shadow-md" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>Unlock training</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Character and Stats - Below Buttons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Character Section */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-sm p-8 ring-3 ring-black shadow-lg rounded-xl text-center" style={{ imageRendering: 'pixelated' }}>
                <h2 className="text-2xl font-black text-gray-800 mb-8 mt-2" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #fff' }}>
                  CHARACTER
                </h2>
                <div className="mx-auto mb-4 flex items-center justify-center">
                  <div className="w-64 h-64 bg-gradient-to-br from-amber-100 to-amber-300 flex items-center justify-center shadow-lg ring-3 ring-black rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden" style={{ imageRendering: 'pixelated' }}>
                    <CharacterAnimation 
                      width={256} 
                      height={256} 
                      debug={false}
                      frameWidth={64}
                      frameHeight={64}
                      frameCount={9}
                      frameRate={6}
                      startFrame={18}
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-800 font-bold mt-6" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #fff' }}>
                  Your Character
                </div>
                
                {/* Daily Reset Timer */}
                <div className="mt-4 pt-4 border-t-2 border-black">
                  <div className="text-center">
                    <div className="text-xs font-bold text-gray-700 mb-2" style={{ fontFamily: 'monospace' }}>
                      DAILY RESET IN
                    </div>
                    <div className="text-lg font-black text-orange-600" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                      {timeUntilReset}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-sm p-6 ring-3 ring-black shadow-lg rounded-xl" style={{ imageRendering: 'pixelated' }}>
                <h2 className="text-2xl font-black text-gray-800 mb-6 text-center" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #fff' }}>
                  YOUR STATS
                </h2>
                
                {/* Core Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="text-center">
                    <div className="text-red-500 font-black text-lg bg-gradient-to-b from-red-400 to-red-600 bg-clip-text text-transparent" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>{stats.strength}</div>
                    <div className="text-gray-700 text-xs font-bold" style={{ fontFamily: 'monospace' }}>STRENGTH</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-500 font-black text-lg bg-gradient-to-b from-blue-400 to-blue-600 bg-clip-text text-transparent" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>{stats.stamina}</div>
                    <div className="text-gray-700 text-xs font-bold" style={{ fontFamily: 'monospace' }}>STAMINA</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-500 font-black text-lg bg-gradient-to-b from-green-400 to-green-600 bg-clip-text text-transparent" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>{stats.mobility}</div>
                    <div className="text-gray-700 text-xs font-bold" style={{ fontFamily: 'monospace' }}>MOBILITY</div>
                  </div>
                </div>

                {/* Level and XP */}
                <div className="mb-6 pt-4 border-t-2 border-black">
                  <div className="flex justify-between items-center mb-2">
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
                </div>

                {/* Resources */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-bold text-sm" style={{ fontFamily: 'monospace' }}>ENERGY</span>
                    <div className="flex items-center gap-1">
                      <span className="text-green-500 font-black text-sm" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>{energy}/{maxEnergy || (150 + permanentEnergy)}</span>
                      {(fractionalEnergy || energy) > 150 && (
                        <span className="text-yellow-500 font-black text-xs" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>⚡</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Energy Regeneration Timer */}
                  <div className="text-center">
                    <div className="text-xs font-bold text-gray-700 mb-1" style={{ fontFamily: 'monospace' }}>
                      NEXT ENERGY IN
                    </div>
                    <div className="text-lg font-black text-green-600" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                      {energyRegenProgress.timeToNext}m
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-bold text-sm" style={{ fontFamily: 'monospace' }}>CASH</span>
                    <span className="text-green-600 font-black text-sm" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>${cash}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-bold text-sm" style={{ fontFamily: 'monospace' }}>PROFICIENCY POINTS</span>
                    <span className="text-yellow-600 font-black text-sm" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>{proficiencyPoints}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-bold text-sm" style={{ fontFamily: 'monospace' }}>LUCK BOOST</span>
                    <span className="text-orange-500 font-black text-sm" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>{luckBoostPercent}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-bold text-sm" style={{ fontFamily: 'monospace' }}>PERMANENT ENERGY</span>
                    <span className="text-purple-500 font-black text-sm" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>+{permanentEnergy}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Popup */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className={`px-4 py-2 rounded-lg ring-2 ring-black shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`} style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
            {notification.message}
          </div>
        </div>
      )}
    </div>
  );
}