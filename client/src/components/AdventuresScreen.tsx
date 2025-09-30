import { useGameStore } from '../game/store';

interface AdventuresScreenProps {
  onBack: () => void;
  onStartQuest: (quest: string) => void;
}

const quests = [
  {
    name: 'Morning Jog',
    description: 'Go for a peaceful morning run around the neighborhood',
    difficulty: 'Easy',
    rewards: { coins: 50, xp: 25 },
    energy: 15,
    icon: '🌅',
    color: 'green'
  },
  {
    name: 'Mountain Hike',
    description: 'Climb the local mountain for a challenging workout',
    difficulty: 'Medium',
    rewards: { coins: 100, xp: 50 },
    energy: 25,
    icon: '⛰️',
    color: 'blue'
  },
  {
    name: 'Beach Workout',
    description: 'Train on the sandy beach for extra resistance',
    difficulty: 'Medium',
    rewards: { coins: 120, xp: 60 },
    energy: 30,
    icon: '🏖️',
    color: 'cyan'
  },
  {
    name: 'Forest Adventure',
    description: 'Navigate through the forest trails and obstacles',
    difficulty: 'Hard',
    rewards: { coins: 200, xp: 100 },
    energy: 40,
    icon: '🌲',
    color: 'emerald'
  },
  {
    name: 'City Marathon',
    description: 'Run through the entire city in this epic challenge',
    difficulty: 'Hard',
    rewards: { coins: 300, xp: 150 },
    energy: 50,
    icon: '🏙️',
    color: 'purple'
  },
  {
    name: 'Mystery Quest',
    description: 'A mysterious adventure with unknown rewards',
    difficulty: 'Legendary',
    rewards: { coins: 500, xp: 250 },
    energy: 60,
    icon: '🔮',
    color: 'violet'
  }
];

export default function AdventuresScreen({ onBack, onStartQuest }: AdventuresScreenProps) {
  const { energy } = useGameStore();
  // TODO: Add coins to game store
  const coins = 1000; // Placeholder

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400';
      case 'Medium': return 'text-blue-400';
      case 'Hard': return 'text-orange-400';
      case 'Legendary': return 'text-purple-400';
      default: return 'text-zinc-400';
    }
  };

  const getDifficultyBg = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/20 border-green-500/30';
      case 'Medium': return 'bg-blue-500/20 border-blue-500/30';
      case 'Hard': return 'bg-orange-500/20 border-orange-500/30';
      case 'Legendary': return 'bg-purple-500/20 border-purple-500/30';
      default: return 'bg-zinc-500/20 border-zinc-500/30';
    }
  };

  return (
    <div className="flex-1 relative bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-800 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent"></div>
      
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
            <h1 className="text-2xl font-bold text-white">🗺️ Adventures</h1>
            <div className="flex items-center space-x-4">
              <div className="text-yellow-400 font-bold flex items-center">
                <span className="text-lg mr-1">🪙</span>
                {coins} coins
              </div>
              <div className="text-emerald-400 font-bold">Energy: {energy}/100</div>
            </div>
          </div>
        </div>

        {/* Quests */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-purple-400 mb-2">Available Quests</h2>
              <p className="text-zinc-400">Complete quests to earn coins and XP. Higher difficulty quests give better rewards!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quests.map((quest, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-2xl border transition-all duration-300 ${
                    energy >= quest.energy
                      ? `${getDifficultyBg(quest.difficulty)} hover:scale-105 cursor-pointer`
                      : 'bg-zinc-800/30 border-zinc-700/30 opacity-50'
                  }`}
                  onClick={() => energy >= quest.energy && onStartQuest(quest.name)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{quest.icon}</div>
                    <div className={`text-sm font-bold px-2 py-1 rounded-full ${getDifficultyBg(quest.difficulty)} ${getDifficultyColor(quest.difficulty)}`}>
                      {quest.difficulty}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2">{quest.name}</h3>
                  <p className="text-sm text-zinc-300 mb-4">{quest.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Energy Cost:</span>
                      <span className="text-emerald-400 font-bold">{quest.energy}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Rewards:</span>
                      <div className="flex space-x-2">
                        <span className="text-yellow-400 font-bold">🪙 {quest.rewards.coins}</span>
                        <span className="text-cyan-400 font-bold">⭐ {quest.rewards.xp} XP</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onStartQuest(quest.name)}
                    disabled={energy < quest.energy}
                    className={`w-full py-2 px-4 rounded-lg font-bold transition-all duration-200 ${
                      energy >= quest.energy
                        ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white hover:shadow-lg hover:shadow-purple-500/25'
                        : 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
                    }`}
                  >
                    {energy >= quest.energy ? 'Start Quest' : 'Not enough energy'}
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
