import { useGameStore } from '../game/store';

interface HomeScreenProps {
  onNavigate: (section: 'gym' | 'store' | 'adventures' | 'research') => void;
  onResetEnergy: () => void;
}

export default function HomeScreen({ onNavigate, onResetEnergy }: HomeScreenProps) {
  const { energy, xp, stats } = useGameStore();
  const level = Math.floor(xp / 100) + 1;

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
              {/* <div className="absolute inset-0 bg-black/20"></div> */}
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
                <div className="text-green-500 font-black text-lg bg-gradient-to-b from-green-400 to-green-600 bg-clip-text text-transparent" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>{stats.agility}</div>
                <div className="text-gray-600 text-sm font-bold" style={{ fontFamily: 'monospace' }}>AGILITY</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t-2 border-black">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold" style={{ fontFamily: 'monospace' }}>LEVEL {level}</span>
                <span className="text-blue-500 font-black" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>{xp} XP</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600 font-bold" style={{ fontFamily: 'monospace' }}>ENERGY</span>
                <span className="text-green-500 font-black" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>{energy}/100</span>
              </div>
              <div className="mt-3">
                <button
                  onClick={onResetEnergy}
                  className="w-full py-2 px-4 bg-red-600 hover:bg-red-500 text-white border-4 border-black transition-all duration-200 text-sm font-black hover:shadow-md"
                  style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000', backgroundColor: '#dc2626' }}
                >
                  Admin: Reset Energy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}