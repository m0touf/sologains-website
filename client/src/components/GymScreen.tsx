import { useGameStore } from '../game/store';

interface GymScreenProps {
  onBack: () => void;
  onWorkout: (type: 'strength' | 'endurance' | 'agility', reps: number) => void;
}

const exercises = {
  strength: [
    { name: 'Push-ups', reps: 20, energy: 10, icon: '💪' },
    { name: 'Pull-ups', reps: 15, energy: 15, icon: '🏋️' },
    { name: 'Squats', reps: 25, energy: 12, icon: '🦵' },
    { name: 'Deadlifts', reps: 10, energy: 20, icon: '🏋️‍♂️' },
  ],
  endurance: [
    { name: 'Running', reps: 30, energy: 15, icon: '🏃' },
    { name: 'Cycling', reps: 25, energy: 12, icon: '🚴' },
    { name: 'Swimming', reps: 20, energy: 18, icon: '🏊' },
    { name: 'Jump Rope', reps: 40, energy: 10, icon: '🦘' },
  ],
  agility: [
    { name: 'Box Jumps', reps: 20, energy: 12, icon: '📦' },
    { name: 'Ladder Drills', reps: 15, energy: 15, icon: '🪜' },
    { name: 'Balance Training', reps: 25, energy: 10, icon: '⚖️' },
    { name: 'Plyometrics', reps: 18, energy: 16, icon: '🤸' },
  ],
};

export default function GymScreen({ onBack, onWorkout }: GymScreenProps) {
  const { energy } = useGameStore();

  return (
    <div className="flex-1 relative bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-800 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-red-500/5 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent"></div>
      
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zinc-700/50">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-zinc-300 hover:text-white transition-colors"
            >
              <span className="text-xl">←</span>
              <span>Back to Home</span>
            </button>
            <h1 className="text-2xl font-bold text-white">🏋️ Gym</h1>
            <div className="text-emerald-400 font-bold">Energy: {energy}/100</div>
          </div>
        </div>

        {/* Exercise Categories */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Strength Training */}
            <div className="bg-zinc-800/60 backdrop-blur-xl rounded-2xl p-6 border border-zinc-700/50 shadow-xl">
              <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center">
                <span className="text-2xl mr-2">💪</span>
                Strength Training
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {exercises.strength.map((exercise, index) => (
                  <button
                    key={index}
                    onClick={() => onWorkout('strength', exercise.reps)}
                    disabled={energy < exercise.energy}
                    className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      energy >= exercise.energy
                        ? 'bg-gradient-to-br from-red-600/80 to-red-500/80 hover:from-red-500 hover:to-red-400 text-white shadow-lg border border-red-400/30 hover:border-red-300/50'
                        : 'bg-zinc-700/50 text-zinc-400 cursor-not-allowed border border-zinc-600/30'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{exercise.icon}</div>
                      <div className="font-bold text-sm mb-1">{exercise.name}</div>
                      <div className="text-xs opacity-75">{exercise.reps} reps</div>
                      <div className="text-xs opacity-75">{exercise.energy} energy</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Endurance Training */}
            <div className="bg-zinc-800/60 backdrop-blur-xl rounded-2xl p-6 border border-zinc-700/50 shadow-xl">
              <h2 className="text-xl font-bold text-blue-400 mb-4 flex items-center">
                <span className="text-2xl mr-2">🏃</span>
                Endurance Training
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {exercises.endurance.map((exercise, index) => (
                  <button
                    key={index}
                    onClick={() => onWorkout('endurance', exercise.reps)}
                    disabled={energy < exercise.energy}
                    className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      energy >= exercise.energy
                        ? 'bg-gradient-to-br from-blue-600/80 to-blue-500/80 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg border border-blue-400/30 hover:border-blue-300/50'
                        : 'bg-zinc-700/50 text-zinc-400 cursor-not-allowed border border-zinc-600/30'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{exercise.icon}</div>
                      <div className="font-bold text-sm mb-1">{exercise.name}</div>
                      <div className="text-xs opacity-75">{exercise.reps} reps</div>
                      <div className="text-xs opacity-75">{exercise.energy} energy</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Agility Training */}
            <div className="bg-zinc-800/60 backdrop-blur-xl rounded-2xl p-6 border border-zinc-700/50 shadow-xl">
              <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center">
                <span className="text-2xl mr-2">🤸</span>
                Agility Training
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {exercises.agility.map((exercise, index) => (
                  <button
                    key={index}
                    onClick={() => onWorkout('agility', exercise.reps)}
                    disabled={energy < exercise.energy}
                    className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                      energy >= exercise.energy
                        ? 'bg-gradient-to-br from-green-600/80 to-green-500/80 hover:from-green-500 hover:to-green-400 text-white shadow-lg border border-green-400/30 hover:border-green-300/50'
                        : 'bg-zinc-700/50 text-zinc-400 cursor-not-allowed border border-zinc-600/30'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{exercise.icon}</div>
                      <div className="font-bold text-sm mb-1">{exercise.name}</div>
                      <div className="text-xs opacity-75">{exercise.reps} reps</div>
                      <div className="text-xs opacity-75">{exercise.energy} energy</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
