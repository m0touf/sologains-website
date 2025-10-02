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
  const { energy, cash } = useGameStore();

  return (
    <div className="flex-1 relative bg-gradient-to-br from-amber-50 to-amber-100 overflow-hidden" style={{ imageRendering: 'pixelated' }}>
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b-2 border-black bg-gradient-to-r from-amber-200 to-orange-200">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 px-4 py-2 text-white font-black rounded-lg shadow-md hover:bg-red-700 transition-colors ring-2 ring-black"
              style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000', backgroundColor: '#dc2626' }}
            >
              <span className="text-xl">←</span>
              <span>BACK TO HOME</span>
            </button>
            <h1 className="text-3xl font-black text-gray-800" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #fff' }}>
              STORE
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-green-600 font-black ring-2 ring-black bg-amber-50/95 px-4 py-2 rounded-lg" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                CASH: ${cash}
              </div>
              <div className="text-emerald-600 font-black ring-2 ring-black bg-amber-50/95 px-4 py-2 rounded-lg" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                ENERGY: {energy}/100
              </div>
            </div>
          </div>
        </div>

        {/* Store Items */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">
            {storeItems.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-sm p-6 ring-3 ring-black shadow-lg rounded-lg" style={{ imageRendering: 'pixelated' }}>
                <h2 className="text-2xl font-black text-gray-800 mb-6 text-center" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #fff' }}>
                  {category.category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className={`p-4 rounded-lg ring-2 ring-black transition-all duration-300 ${
                        cash >= item.cost
                          ? 'bg-gradient-to-br from-amber-50 to-amber-100 hover:ring-4 hover:ring-yellow-400/50 hover:scale-105'
                          : 'bg-gray-300 ring-gray-500 opacity-50'
                      }`}
                      style={{ imageRendering: 'pixelated' }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-3xl">{item.icon}</div>
                        <div className="text-right">
                          <div className="text-green-600 font-black" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                            ${item.cost}
                          </div>
                        </div>
                      </div>
                      <h3 className="font-black text-gray-800 mb-2" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #fff' }}>
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-700 mb-4" style={{ fontFamily: 'monospace' }}>
                        {item.description}
                      </p>
                      <button
                        onClick={() => onPurchase(item.name, item.cost)}
                        disabled={cash < item.cost}
                        className={`w-full py-2 px-4 rounded-lg font-black transition-all duration-200 ring-2 ring-black ${
                          cash >= item.cost
                            ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white hover:shadow-lg'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                        style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}
                      >
                        {cash >= item.cost ? 'BUY' : 'NOT ENOUGH CASH'}
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
