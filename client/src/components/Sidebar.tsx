interface SidebarProps {
  energy: number;
  xp: number;
  stats: { strength: number; stamina: number; agility: number };
  onWorkout: (type: 'strength' | 'endurance' | 'agility', reps?: number) => void;
  onResetEnergy: () => void;
}

export default function Sidebar({ energy, xp, stats, onWorkout, onResetEnergy }: SidebarProps) {
  const level = Math.floor(xp / 100) + 1;
  const nextLevelXp = level * 100;
  const currentLevelXp = xp % 100;

  return (
    <aside className="w-80 bg-zinc-800/60 backdrop-blur-xl border-r border-zinc-700/50 p-6 space-y-6 overflow-y-auto shadow-xl">
      {/* Energy Bar */}
      <div className="bg-zinc-700/60 rounded-xl p-5 border border-zinc-600/50 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-zinc-200 flex items-center">
            ⚡ Energy
          </span>
          <span className="text-emerald-400 font-bold text-lg">{energy}/100</span>
        </div>
        <div className="w-full bg-zinc-600/50 rounded-full h-4 shadow-inner">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-4 rounded-full transition-all duration-500 shadow-lg shadow-emerald-500/30"
            style={{ width: `${Math.min(100, (energy / 100) * 100)}%` }}
          ></div>
        </div>
        <div className="text-xs text-zinc-400 mt-2 flex items-center">
          <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
          Energy resets daily at midnight
        </div>
      </div>

      {/* XP and Level */}
      <div className="bg-zinc-700/60 rounded-xl p-5 border border-zinc-600/50 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-zinc-200 flex items-center">
            🎯 Level {level}
          </span>
          <span className="text-cyan-400 font-bold text-lg">{xp} XP</span>
        </div>
        <div className="w-full bg-zinc-600/50 rounded-full h-4 shadow-inner">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-4 rounded-full transition-all duration-500 shadow-lg shadow-cyan-500/30"
            style={{ width: `${(currentLevelXp / 100) * 100}%` }}
          ></div>
        </div>
        <div className="text-xs text-zinc-400 mt-2 flex items-center">
          <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></span>
          {nextLevelXp - xp} XP to next level
        </div>
      </div>

      {/* Workout Buttons */}
      <div className="pt-2 space-y-3">
        {/* Strength Training */}
        <button 
          onClick={() => onWorkout('strength', 20)}
          disabled={energy < 10}
          className={`w-full font-bold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border ${
            energy >= 10 
              ? "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white hover:shadow-red-500/30 border-red-400/30 hover:border-red-300/50" 
              : "bg-zinc-600/50 text-zinc-400 cursor-not-allowed border-zinc-500/30"
          }`}
        >
          <span className="flex items-center justify-center space-x-2">
            <span className="text-xl">💪</span>
            <span className="text-sm">Strength Training (10 energy)</span>
          </span>
        </button>

        {/* Endurance Training */}
        <button 
          onClick={() => onWorkout('endurance', 20)}
          disabled={energy < 10}
          className={`w-full font-bold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border ${
            energy >= 10 
              ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white hover:shadow-blue-500/30 border-blue-400/30 hover:border-blue-300/50" 
              : "bg-zinc-600/50 text-zinc-400 cursor-not-allowed border-zinc-500/30"
          }`}
        >
          <span className="flex items-center justify-center space-x-2">
            <span className="text-xl">🏃</span>
            <span className="text-sm">Endurance Training (10 energy)</span>
          </span>
        </button>

        {/* Agility Training */}
        <button 
          onClick={() => onWorkout('agility', 20)}
          disabled={energy < 10}
          className={`w-full font-bold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg border ${
            energy >= 10 
              ? "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white hover:shadow-green-500/30 border-green-400/30 hover:border-green-300/50" 
              : "bg-zinc-600/50 text-zinc-400 cursor-not-allowed border-zinc-500/30"
          }`}
        >
          <span className="flex items-center justify-center space-x-2">
            <span className="text-xl">🤸</span>
            <span className="text-sm">Agility Training (10 energy)</span>
          </span>
        </button>
      </div>

      {/* Admin Reset Energy Button */}
      <div className="pt-2">
        <button 
          onClick={onResetEnergy}
          className="w-full font-bold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg border border-yellow-500/30 bg-gradient-to-r from-yellow-600/80 to-yellow-500/80 hover:from-yellow-500 hover:to-yellow-400 text-white hover:shadow-yellow-500/25"
        >
          <span className="flex items-center justify-center space-x-2">
            <span className="text-lg">⚡</span>
            <span className="text-sm">Admin: Reset Energy</span>
          </span>
        </button>
      </div>

      {/* Stats */}
      <div className="bg-zinc-700/60 rounded-xl p-5 border border-zinc-600/50 shadow-lg">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center">
          📊 Stats
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-2 rounded-lg bg-zinc-600/30">
            <span className="text-zinc-300 text-sm flex items-center">
              <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
              Strength
            </span>
            <span className="text-red-400 font-bold text-lg">{stats.strength}</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-zinc-600/30">
            <span className="text-zinc-300 text-sm flex items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              Stamina
            </span>
            <span className="text-blue-400 font-bold text-lg">{stats.stamina}</span>
          </div>
          <div className="flex justify-between items-center p-2 rounded-lg bg-zinc-600/30">
            <span className="text-zinc-300 text-sm flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Agility
            </span>
            <span className="text-green-400 font-bold text-lg">{stats.agility}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-zinc-700/60 rounded-xl p-5 border border-zinc-600/50 shadow-lg">
        <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center">
          ⚡ Quick Actions
        </h3>
        <div className="space-y-2">
          <button className="w-full text-left p-3 rounded-lg hover:bg-zinc-600/50 transition-all duration-200 hover:shadow-md border border-transparent hover:border-zinc-500/30">
            <span className="text-zinc-300 text-sm flex items-center">
              <span className="text-lg mr-3">📊</span>
              View Progress
            </span>
          </button>
          <button className="w-full text-left p-3 rounded-lg hover:bg-zinc-600/50 transition-all duration-200 hover:shadow-md border border-transparent hover:border-zinc-500/30">
            <span className="text-zinc-300 text-sm flex items-center">
              <span className="text-lg mr-3">🏆</span>
              Achievements
            </span>
          </button>
          <button className="w-full text-left p-3 rounded-lg hover:bg-zinc-600/50 transition-all duration-200 hover:shadow-md border border-transparent hover:border-zinc-500/30">
            <span className="text-zinc-300 text-sm flex items-center">
              <span className="text-lg mr-3">⚙️</span>
              Settings
            </span>
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 rounded-xl p-5 border border-emerald-500/30 shadow-lg">
        <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center">
          💡 Pro Tip
        </h3>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Complete workouts to gain XP and level up your character. Higher levels unlock new features and abilities!
        </p>
      </div>
    </aside>
  );
}
