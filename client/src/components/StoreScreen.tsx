import { useGameStore } from '../game/store';

interface StoreScreenProps {
  onBack: () => void;
  onPurchase: (item: string, cost: number) => void;
}

const storeItems = [
  {
    category: 'Energy Boosters',
    items: [
      { name: 'Energy Drink', description: 'Restore 20 energy instantly', cost: 50, icon: '🥤', type: 'energy_restore' },
      { name: 'Protein Shake', description: 'Restore 30 energy instantly', cost: 75, icon: '🥛', type: 'energy_restore' },
      { name: 'Pre-Workout', description: 'Restore 50 energy instantly', cost: 120, icon: '💊', type: 'energy_restore' },
    ]
  },
  {
    category: 'Supplements',
    items: [
      { name: 'Creatine', description: '+1 permanent strength', cost: 200, icon: '💪', type: 'stat_boost' },
      { name: 'BCAA', description: '+1 permanent stamina', cost: 200, icon: '🏃', type: 'stat_boost' },
      { name: 'Omega-3', description: '+1 permanent agility', cost: 200, icon: '🤸', type: 'stat_boost' },
    ]
  },
  {
    category: 'Special Items',
    items: [
      { name: 'Energy Capsule', description: 'Increase max energy by 10', cost: 500, icon: '⚡', type: 'max_energy' },
      { name: 'Training Manual', description: 'Double XP for next 5 workouts', cost: 300, icon: '📚', type: 'xp_boost' },
      { name: 'Recovery Kit', description: 'Instant energy reset', cost: 1000, icon: '🏥', type: 'full_restore' },
    ]
  }
];

export default function StoreScreen({ onBack, onPurchase }: StoreScreenProps) {
  const { energy } = useGameStore();
  // TODO: Add coins to game store
  const coins = 1000; // Placeholder

  return (
    <div className="flex-1 relative bg-gradient-to-br from-slate-900 via-zinc-900 to-slate-800 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent"></div>
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
            <h1 className="text-2xl font-bold text-white">🛒 Store</h1>
            <div className="flex items-center space-x-4">
              <div className="text-yellow-400 font-bold flex items-center">
                <span className="text-lg mr-1">🪙</span>
                {coins} coins
              </div>
              <div className="text-emerald-400 font-bold">Energy: {energy}/100</div>
            </div>
          </div>
        </div>

        {/* Store Items */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            {storeItems.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-zinc-800/60 backdrop-blur-xl rounded-2xl p-6 border border-zinc-700/50 shadow-xl">
                <h2 className="text-xl font-bold text-yellow-400 mb-6 flex items-center">
                  <span className="text-2xl mr-2">🛍️</span>
                  {category.category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        coins >= item.cost
                          ? 'bg-zinc-700/50 border-zinc-600/50 hover:border-yellow-400/50 hover:bg-zinc-700/70'
                          : 'bg-zinc-800/30 border-zinc-700/30 opacity-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-3xl">{item.icon}</div>
                        <div className="text-right">
                          <div className="text-yellow-400 font-bold">{item.cost}</div>
                          <div className="text-xs text-zinc-400">🪙 coins</div>
                        </div>
                      </div>
                      <h3 className="font-bold text-white mb-2">{item.name}</h3>
                      <p className="text-sm text-zinc-300 mb-4">{item.description}</p>
                      <button
                        onClick={() => onPurchase(item.name, item.cost)}
                        disabled={coins < item.cost}
                        className={`w-full py-2 px-4 rounded-lg font-bold transition-all duration-200 ${
                          coins >= item.cost
                            ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white hover:shadow-lg hover:shadow-yellow-500/25'
                            : 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
                        }`}
                      >
                        {coins >= item.cost ? 'Buy' : 'Not enough coins'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
