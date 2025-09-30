import { useGameStore } from '../game/store';

interface ResearchScreenProps {
  onBack: () => void;
  onStartResearch: (researchId: string) => void;
}

const researchItems = [
  {
    id: 'bench_press',
    name: 'Bench Press',
    description: 'Advanced chest and arm exercise for serious strength gains',
    category: 'strength',
    requirements: { strength: 20 },
    researchTime: 24, // hours
    benefits: {
      statGain: 2, // 2x normal stat gain
      energyCost: 15,
      xpMultiplier: 1.5
    },
    icon: '🏋️‍♂️',
    color: 'red'
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    description: 'The king of all exercises - full body strength development',
    category: 'strength',
    requirements: { strength: 25 },
    researchTime: 36,
    benefits: {
      statGain: 3,
      energyCost: 20,
      xpMultiplier: 2
    },
    icon: '🏋️',
    color: 'red'
  },
  {
    id: 'marathon_training',
    name: 'Marathon Training',
    description: 'Endurance program for extreme stamina development',
    category: 'endurance',
    requirements: { stamina: 30 },
    researchTime: 48,
    benefits: {
      statGain: 2,
      energyCost: 25,
      xpMultiplier: 1.8
    },
    icon: '🏃‍♂️',
    color: 'blue'
  },
  {
    id: 'parkour',
    name: 'Parkour Training',
    description: 'Urban agility and movement mastery',
    category: 'agility',
    requirements: { agility: 25 },
    researchTime: 30,
    benefits: {
      statGain: 2,
      energyCost: 18,
      xpMultiplier: 1.6
    },
    icon: '🏃‍♀️',
    color: 'green'
  },
  {
    id: 'crossfit',
    name: 'CrossFit Program',
    description: 'High-intensity functional fitness combining all stats',
    category: 'mixed',
    requirements: { strength: 15, stamina: 15, agility: 15 },
    researchTime: 60,
    benefits: {
      statGain: 1.5, // gains in all stats
      energyCost: 30,
      xpMultiplier: 2.5
    },
    icon: '💪',
    color: 'purple'
  },
  {
    id: 'olympic_lifting',
    name: 'Olympic Weightlifting',
    description: 'Elite power and technique development',
    category: 'strength',
    requirements: { strength: 40 },
    researchTime: 72,
    benefits: {
      statGain: 4,
      energyCost: 35,
      xpMultiplier: 3
    },
    icon: '🥇',
    color: 'yellow'
  }
];

export default function ResearchScreen({ onBack, onStartResearch }: ResearchScreenProps) {
  const { stats } = useGameStore();
  
  // TODO: Add research progress to game store
  const researchProgress: { [key: string]: { completed: boolean; inProgress: boolean; timeRemaining?: number } } = {};

  const canResearch = (requirements: { strength?: number; stamina?: number; agility?: number }) => {
    return Object.entries(requirements).every(([stat, required]) => 
      stats[stat as keyof typeof stats] >= required
    );
  };

  const isUnlocked = (researchId: string) => {
    return researchProgress[researchId]?.completed || false;
  };

  const isInProgress = (researchId: string) => {
    return researchProgress[researchId]?.inProgress || false;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strength': return 'text-red-400';
      case 'endurance': return 'text-blue-400';
      case 'agility': return 'text-green-400';
      case 'mixed': return 'text-purple-400';
      default: return 'text-zinc-400';
    }
  };

  const getCategoryBg = (category: string) => {
    switch (category) {
      case 'strength': return 'bg-red-500/20 border-red-500/30';
      case 'endurance': return 'bg-blue-500/20 border-blue-500/30';
      case 'agility': return 'bg-green-500/20 border-green-500/30';
      case 'mixed': return 'bg-purple-500/20 border-purple-500/30';
      default: return 'bg-zinc-500/20 border-zinc-500/30';
    }
  };

  return (
    <div className="flex-1 relative bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-800 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-violet-500/5 via-transparent to-transparent"></div>
      
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
            <h1 className="text-2xl font-bold text-white">🔬 Research</h1>
            <div className="text-indigo-400 font-bold">Training Plans</div>
          </div>
        </div>

        {/* Research Items */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-indigo-400 mb-2">Available Research</h2>
              <p className="text-zinc-400">Unlock advanced training methods by meeting stat requirements and investing research time.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {researchItems.map((research) => {
                const canStart = canResearch(research.requirements);
                const unlocked = isUnlocked(research.id);
                const inProgress = isInProgress(research.id);

                return (
                  <div
                    key={research.id}
                    className={`p-6 rounded-2xl border transition-all duration-300 ${
                      unlocked
                        ? 'bg-emerald-500/20 border-emerald-500/30'
                        : inProgress
                        ? 'bg-yellow-500/20 border-yellow-500/30'
                        : canStart
                        ? `${getCategoryBg(research.category)} hover:scale-105 cursor-pointer`
                        : 'bg-zinc-800/30 border-zinc-700/30 opacity-50'
                    }`}
                    onClick={() => canStart && !unlocked && !inProgress && onStartResearch(research.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{research.icon}</div>
                      <div className="text-right">
                        {unlocked && <div className="text-emerald-400 font-bold text-sm">✅ Unlocked</div>}
                        {inProgress && <div className="text-yellow-400 font-bold text-sm">⏳ Researching...</div>}
                        {!unlocked && !inProgress && (
                          <div className={`text-sm font-bold ${canStart ? 'text-indigo-400' : 'text-zinc-400'}`}>
                            {canStart ? '🔓 Available' : '🔒 Locked'}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-2">{research.name}</h3>
                    <p className="text-sm text-zinc-300 mb-4">{research.description}</p>
                    
                    {/* Requirements */}
                    <div className="mb-4">
                      <div className="text-xs text-zinc-400 mb-2">Requirements:</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(research.requirements).map(([stat, required]) => (
                          <div
                            key={stat}
                            className={`text-xs px-2 py-1 rounded ${
                              stats[stat as keyof typeof stats] >= required
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {stat}: {required} (you: {stats[stat as keyof typeof stats]})
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="mb-4">
                      <div className="text-xs text-zinc-400 mb-2">Benefits:</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-zinc-300">
                          <span className="text-emerald-400">+{research.benefits.statGain}x</span> stat gain
                        </div>
                        <div className="text-zinc-300">
                          <span className="text-cyan-400">+{research.benefits.xpMultiplier}x</span> XP
                        </div>
                        <div className="text-zinc-300">
                          <span className="text-orange-400">{research.benefits.energyCost}</span> energy cost
                        </div>
                        <div className="text-zinc-300">
                          <span className="text-purple-400">{research.researchTime}h</span> research time
                        </div>
                      </div>
                    </div>
                    
                    {!unlocked && !inProgress && (
                      <button
                        onClick={() => onStartResearch(research.id)}
                        disabled={!canStart}
                        className={`w-full py-2 px-4 rounded-lg font-bold transition-all duration-200 ${
                          canStart
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white hover:shadow-lg hover:shadow-indigo-500/25'
                            : 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
                        }`}
                      >
                        {canStart ? 'Start Research' : 'Requirements not met'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
