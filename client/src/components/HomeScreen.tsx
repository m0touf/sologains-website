import { useGameStore } from '../game/store';
import { useAuthStore } from '../stores/authStore';

interface HomeScreenProps {
  onNavigate: (section: 'gym' | 'store' | 'adventures' | 'research') => void;
  onResetEnergy: () => void;
}

export default function HomeScreen({ onNavigate, onResetEnergy }: HomeScreenProps) {
  const { energy, xp, stats, getXpProgress, getCurrentLevel, proficiencyPoints, cash, permanentEnergy, maxEnergy, luckBoostPercent } = useGameStore();
  const level = getCurrentLevel();
  const xpProgress = getXpProgress();

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
    <div className="flex-1 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-[2px]"
        style={{
          backgroundImage: 'url(/src/assets/backgrounds/Background_Image_Home_05.png)',
          imageRendering: 'pixelated'
        }}
      ></div>
      
      <div className="relative z-10 h-full flex">
        {/* Left Side - Activity Buttons */}
        <div className="w-2/5 p-4 flex flex-col justify-center">
          <div className="space-y-4 max-w-xs mx-auto">
            {/* Gym */}
            <button
              onClick={() => onNavigate('gym')}
              className="group w-full max-w-[520px] h-40 mx-auto aspect-[16/9] relative overflow-hidden rounded-2xl ring-3 ring-black shadow-lg hover:shadow-2xl hover:scale-105 hover:ring-4 hover:ring-white/20 transition-all duration-300 bg-center bg-cover"
              style={{
                backgroundImage: "url('/src/assets/buttons/Gym_Home_Button.png')",
                imageRendering: 'pixelated'
              }}
            >
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-2">
                <h3 className="text-2xl font-black text-white drop-shadow-lg" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #000' }}>GYM</h3>
                <p className="text-sm font-bold text-white drop-shadow-md" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>Train your stats</p>
              </div>
            </button>

            {/* Store */}
            <button
              onClick={() => onNavigate('store')}
              className="group w-full max-w-[520px] h-40 mx-auto aspect-[16/9] relative overflow-hidden rounded-2xl ring-3 ring-black shadow-lg hover:shadow-2xl hover:scale-105 hover:ring-4 hover:ring-white/20 transition-all duration-300 bg-center bg-cover"
              style={{
                backgroundImage: "url('/src/assets/buttons/Store_Home_Button.png')",
                imageRendering: 'pixelated'
              }}
            >
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-2">
                <h3 className="text-2xl font-black text-white drop-shadow-lg" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #000' }}>STORE</h3>
                <p className="text-sm font-bold text-white drop-shadow-md" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>Buy supplements</p>
              </div>
            </button>

            {/* Adventures */}
            <button
              onClick={() => onNavigate('adventures')}
              className="group w-full max-w-[520px] h-40 mx-auto aspect-[16/9] relative overflow-hidden rounded-2xl ring-3 ring-black shadow-lg hover:shadow-2xl hover:scale-105 hover:ring-4 hover:ring-white/20 transition-all duration-300 bg-center bg-cover"
              style={{
                backgroundImage: "url('/src/assets/buttons/Adventure_Home_Button.png')",
                imageRendering: 'pixelated'
              }}
            >
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-2">
                <h3 className="text-2xl font-black text-white drop-shadow-lg" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #000' }}>ADVENTURES</h3>
                <p className="text-sm font-bold text-white drop-shadow-md" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>Go on quests</p>
              </div>
            </button>

            {/* Research */}
            <button
              onClick={() => onNavigate('research')}
              className="group w-full max-w-[520px] h-40 mx-auto aspect-[16/9] relative overflow-hidden rounded-2xl ring-3 ring-black shadow-lg hover:shadow-2xl hover:scale-105 hover:ring-4 hover:ring-white/20 transition-all duration-300 bg-center bg-cover"
              style={{
                backgroundImage: "url('/src/assets/buttons/Research_Home_Button.png')",
                imageRendering: 'pixelated'
              }}
            >
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-2">
                <h3 className="text-2xl font-black text-white drop-shadow-lg" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #000' }}>RESEARCH</h3>
                <p className="text-sm font-bold text-white drop-shadow-md" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>Unlock training</p>
              </div>
            </button>
          </div>
        </div>

        {/* Center - Character and Stats */}
        <div className="w-3/5 flex flex-col items-center justify-center p-6">
          <div className="text-center mb-6">
            {/* Character Placeholder - Made Larger */}
            <div className="mx-auto mb-4 flex items-center justify-center">
              <div className="w-48 h-48 bg-gradient-to-br from-amber-200 to-amber-300 flex items-center justify-center shadow-lg ring-3 ring-black rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300" style={{ imageRendering: 'pixelated' }}>
                <div className="text-4xl text-amber-600 font-black" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #000' }}>?</div>
              </div>
            </div>
            <div className="text-sm text-gray-800 font-bold" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #fff' }}>
              Character coming soon
            </div>
          </div>

          {/* Current Date Display */}
          <div className="bg-gray-800/90 backdrop-blur-sm p-3 ring-2 ring-black shadow-lg max-w-md w-full rounded-lg mb-4" style={{ imageRendering: 'pixelated' }}>
            <div className="text-center">
              <div className="text-white font-black text-sm" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>CURRENT DATE</div>
              <div className="text-yellow-400 font-black text-lg" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>

          {/* Character Stats - Moved under character */}
          <div className="bg-amber-50/95 backdrop-blur-sm p-6 ring-3 ring-black shadow-lg max-w-md w-full rounded-lg" style={{ imageRendering: 'pixelated' }}>
            <h2 className="text-xl font-black text-gray-800 mb-4 text-center" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #fff' }}>YOUR CHARACTER</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-red-500 font-black text-lg bg-gradient-to-b from-red-400 to-red-600 bg-clip-text text-transparent" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>{stats.strength}</div>
                <div className="text-gray-600 text-sm font-bold" style={{ fontFamily: 'monospace' }}>STRENGTH</div>
              </div>
              <div>
                <div className="text-blue-500 font-black text-lg bg-gradient-to-b from-blue-400 to-blue-600 bg-clip-text text-transparent" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>{stats.stamina}</div>
                <div className="text-gray-600 text-sm font-bold" style={{ fontFamily: 'monospace' }}>STAMINA</div>
              </div>
              <div>
                <div className="text-green-500 font-black text-lg bg-gradient-to-b from-green-400 to-green-600 bg-clip-text text-transparent" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>{stats.mobility}</div>
                <div className="text-gray-600 text-sm font-bold" style={{ fontFamily: 'monospace' }}>MOBILITY</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t-2 border-black">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold" style={{ fontFamily: 'monospace' }}>LEVEL {level}</span>
                <span className="text-blue-500 font-black" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>{xp} XP</span>
              </div>
              
              {/* XP Progress Bar */}
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-gray-600" style={{ fontFamily: 'monospace' }}>
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
                  <span className="text-xs font-bold text-gray-600" style={{ fontFamily: 'monospace' }}>
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
                  <span className="text-xs font-bold text-gray-600" style={{ fontFamily: 'monospace' }}>
                    CASH
                  </span>
                  <span className="text-sm font-black text-green-600" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                    ${cash}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600 font-bold" style={{ fontFamily: 'monospace' }}>ENERGY</span>
                <span className="text-green-500 font-black" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>{energy}/{maxEnergy || (100 + permanentEnergy)}</span>
              </div>
              {permanentEnergy > 0 && (
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-600 font-bold text-sm" style={{ fontFamily: 'monospace' }}>PERMANENT ENERGY</span>
                  <span className="text-purple-500 font-black text-sm" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>+{permanentEnergy}</span>
                </div>
              )}
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-600 font-bold text-sm" style={{ fontFamily: 'monospace' }}>LUCK BOOST</span>
                <span className="text-orange-500 font-black text-sm" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>{luckBoostPercent}%</span>
              </div>
              <div className="mt-1 space-y-2">
                <button
                  onClick={onResetEnergy}
                  className="w-full py-2 px-4 bg-red-600 hover:bg-red-500 text-white ring-2 ring-black transition-all duration-200 text-sm font-black hover:shadow-md rounded-lg"
                  style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}
                >
                  Admin: Reset Energy
                </button>
          <button
            onClick={async () => {
              console.log("Button clicked!");
              const { token } = useAuthStore.getState();
              console.log("Token:", token ? "Found" : "Not found");
              console.log("Auth state:", useAuthStore.getState());
              
              if (!token) {
                console.log("No authentication token found. Please log in again.");
                return;
              }

              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              const dateStr = tomorrow.toISOString().slice(0, 10);
              console.log("Setting date to:", dateStr);
              
              try {
                const response = await fetch("http://localhost:4000/api/store/test-date", {
                  method: 'POST',
                  headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ date: dateStr })
                });

                console.log("Response status:", response.status);
                
                if (response.ok) {
                  console.log("✅ Success: Set test date to tomorrow (" + dateStr + "). Refresh the page to trigger daily reset!");
                } else {
                  const error = await response.json();
                  console.log("❌ Error:", error);
                }
              } catch (error) {
                console.error("❌ Network error:", error);
              }
            }}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white ring-2 ring-black transition-all duration-200 text-sm font-black hover:shadow-md rounded-lg"
            style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}
          >
            TEST: Set Tomorrow
          </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}