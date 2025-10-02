import { useGameStore } from '../game/store';
import { useAuthStore } from '../stores/authStore';
import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api';

interface StoreScreenProps {
  onBack: () => void;
  onPurchase?: (item: string, cost: number) => void;
}

interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  type: string;
  effectValue: number;
  statType?: string;
}

interface ShopItems {
  energy_boosters: ShopItem[];
  supplements: ShopItem[];
  special_items: ShopItem[];
}

export default function StoreScreen({ onBack, onPurchase }: StoreScreenProps) {
  const { energy, cash, setFromServer } = useGameStore();
  const [shopItems, setShopItems] = useState<ShopItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  // Load shop items on component mount
  useEffect(() => {
    const loadShopItems = async () => {
      try {
        const token = useAuthStore.getState().token;
        if (!token) return;

        const items = await apiClient.getStoreItems();
        setShopItems(items);
      } catch (error) {
        console.error("Failed to load shop items:", error);
      } finally {
        setLoading(false);
      }
    };

    loadShopItems();
  }, []);

  const handlePurchase = async (item: ShopItem) => {
    setPurchasing(item.id);
    try {
      const token = useAuthStore.getState().token;
      if (!token) return;

      const result = await apiClient.purchaseItem({ itemId: item.id });
      
      // Update game state with the purchase result
      setFromServer({
        cash: result.cashAfter,
        energy: result.energyAfter,
        maxEnergy: result.maxEnergyAfter,
        stats: result.statsAfter,
        proficiencyPoints: result.proficiencyPointsAfter,
      });

      console.log(`Purchased ${item.name}!`);
      onPurchase?.(item.name, item.cost);
    } catch (error) {
      console.error("Failed to purchase item:", error);
    } finally {
      setPurchasing(null);
    }
  };


  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
        <div className="text-center">
          <div className="text-2xl mb-4 font-black text-gray-700" style={{ fontFamily: 'monospace' }}>LOADING</div>
          <div className="text-gray-700 font-bold">Loading shop items...</div>
        </div>
      </div>
    );
  }

  if (!shopItems) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
        <div className="text-center">
          <div className="text-2xl mb-4 font-black text-gray-700" style={{ fontFamily: 'monospace' }}>ERROR</div>
          <div className="text-gray-700 font-bold">Failed to load shop items</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-amber-50 to-amber-100" style={{ imageRendering: 'pixelated' }}>
      {/* Back Button */}
      <div className="p-4">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-lg border-4 border-black transition-all duration-200 hover:shadow-md uppercase"
          style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000', backgroundColor: '#dc2626' }}
        >
          Back to Home
        </button>
      </div>

      {/* Store */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-black text-gray-800 mb-3" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #fff' }}>
                STORE
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto" style={{ fontFamily: 'monospace' }}>
                Buy energy boosters, supplements, and special items to enhance your training!
              </p>
            </div>
            
            {/* Cash and Energy Display */}
            <div className="bg-gradient-to-r from-red-900 to-red-800 backdrop-blur-sm p-4 ring-2 ring-red-600 shadow-xl rounded-xl max-w-sm mx-auto">
              <div className="text-center">
                <div className="text-white font-black text-sm mb-1" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                  YOUR RESOURCES
                </div>
                <div className="text-red-200 font-black text-xl" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}>
                  ${cash} CASH | {energy}/100 ENERGY
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            {/* Energy Boosters */}
            <div className="bg-stone-100 p-6 ring-3 ring-black shadow-xl rounded-xl" style={{ imageRendering: 'pixelated' }}>
              <h2 className="text-2xl font-black text-gray-800 mb-6 text-center" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #fff' }}>
                ENERGY BOOSTERS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shopItems.energy_boosters.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={`p-4 rounded-xl border-2 border-black shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                      cash >= item.cost
                        ? 'bg-stone-100 cursor-pointer hover:brightness-110'
                        : 'bg-gray-300 border-gray-500 opacity-60 cursor-not-allowed'
                    }`}
                    style={{ imageRendering: 'pixelated' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-2xl font-black text-gray-700 bg-amber-200 px-2 py-1 rounded border border-gray-400" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #fff' }}>
                        {item.icon}
                      </div>
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
                      onClick={() => handlePurchase(item)}
                      disabled={cash < item.cost || purchasing === item.id}
                      className={`w-full py-3 px-4 rounded-xl font-black transition-all duration-300 ring-2 ring-black transform hover:scale-105 ${
                        cash >= item.cost && purchasing !== item.id
                          ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white hover:shadow-xl hover:ring-green-300'
                          : 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-60'
                      }`}
                      style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}
                    >
                      {purchasing === item.id ? 'BUYING...' : cash >= item.cost ? 'BUY' : 'NOT ENOUGH CASH'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Supplements */}
            <div className="bg-stone-100 p-6 ring-3 ring-black shadow-xl rounded-xl" style={{ imageRendering: 'pixelated' }}>
              <h2 className="text-2xl font-black text-gray-800 mb-6 text-center" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #fff' }}>
                SUPPLEMENTS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shopItems.supplements.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={`p-4 rounded-xl border-2 border-black shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                      cash >= item.cost
                        ? 'bg-stone-100 cursor-pointer hover:brightness-110'
                        : 'bg-gray-300 border-gray-500 opacity-60 cursor-not-allowed'
                    }`}
                    style={{ imageRendering: 'pixelated' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-2xl font-black text-gray-700 bg-amber-200 px-2 py-1 rounded border border-gray-400" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #fff' }}>
                        {item.icon}
                      </div>
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
                      onClick={() => handlePurchase(item)}
                      disabled={cash < item.cost || purchasing === item.id}
                      className={`w-full py-3 px-4 rounded-xl font-black transition-all duration-300 ring-2 ring-black transform hover:scale-105 ${
                        cash >= item.cost && purchasing !== item.id
                          ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white hover:shadow-xl hover:ring-green-300'
                          : 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-60'
                      }`}
                      style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}
                    >
                      {purchasing === item.id ? 'BUYING...' : cash >= item.cost ? 'BUY' : 'NOT ENOUGH CASH'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Items */}
            <div className="bg-stone-100 p-6 ring-3 ring-black shadow-xl rounded-xl" style={{ imageRendering: 'pixelated' }}>
              <h2 className="text-2xl font-black text-gray-800 mb-6 text-center" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #fff' }}>
                SPECIAL ITEMS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shopItems.special_items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className={`p-4 rounded-xl border-2 border-black shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                      cash >= item.cost
                        ? 'bg-stone-100 cursor-pointer hover:brightness-110'
                        : 'bg-gray-300 border-gray-500 opacity-60 cursor-not-allowed'
                    }`}
                    style={{ imageRendering: 'pixelated' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-2xl font-black text-gray-700 bg-amber-200 px-2 py-1 rounded border border-gray-400" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #fff' }}>
                        {item.icon}
                      </div>
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
                      onClick={() => handlePurchase(item)}
                      disabled={cash < item.cost || purchasing === item.id}
                      className={`w-full py-3 px-4 rounded-xl font-black transition-all duration-300 ring-2 ring-black transform hover:scale-105 ${
                        cash >= item.cost && purchasing !== item.id
                          ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white hover:shadow-xl hover:ring-green-300'
                          : 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-60'
                      }`}
                      style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}
                    >
                      {purchasing === item.id ? 'BUYING...' : cash >= item.cost ? 'BUY' : 'NOT ENOUGH CASH'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
