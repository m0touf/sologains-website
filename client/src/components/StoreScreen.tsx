import { useGameStore } from '../game/store';
import { useAuthStore } from '../stores/authStore';
import { useEffect, useState } from 'react';

interface StoreScreenProps {
  onBack: () => void;
  onPurchase: (item: string, cost: number) => void;
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

        const response = await fetch("http://localhost:4000/api/store/items", {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const items = await response.json();
          setShopItems(items);
        } else {
          console.error('Failed to load shop items');
        }
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

      const response = await fetch("http://localhost:4000/api/store/purchase", {
        method: 'POST',
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ itemId: item.id })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update game state with the purchase result
        setFromServer({
          cash: result.cashAfter,
          energy: result.energy,
          stats: result.stats
        });

        alert(`Purchased ${item.name}!`);
        onPurchase(item.name, item.cost);
      } else {
        const error = await response.json();
        alert(`Failed to purchase: ${error.error}`);
      }
    } catch (error) {
      console.error("Failed to purchase item:", error);
      alert("Failed to purchase item");
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
            {/* Energy Boosters */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-sm p-6 ring-3 ring-black shadow-lg rounded-lg" style={{ imageRendering: 'pixelated' }}>
              <h2 className="text-2xl font-black text-gray-800 mb-6 text-center" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #fff' }}>
                ENERGY BOOSTERS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shopItems.energy_boosters.map((item, itemIndex) => (
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
                      <div className="text-lg font-black text-gray-700 bg-amber-200 px-2 py-1 rounded border border-gray-400" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #fff' }}>
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
                      className={`w-full py-2 px-4 rounded-lg font-black transition-all duration-200 ring-2 ring-black ${
                        cash >= item.cost && purchasing !== item.id
                          ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white hover:shadow-lg'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
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
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-sm p-6 ring-3 ring-black shadow-lg rounded-lg" style={{ imageRendering: 'pixelated' }}>
              <h2 className="text-2xl font-black text-gray-800 mb-6 text-center" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #fff' }}>
                SUPPLEMENTS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shopItems.supplements.map((item, itemIndex) => (
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
                      <div className="text-lg font-black text-gray-700 bg-amber-200 px-2 py-1 rounded border border-gray-400" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #fff' }}>
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
                      className={`w-full py-2 px-4 rounded-lg font-black transition-all duration-200 ring-2 ring-black ${
                        cash >= item.cost && purchasing !== item.id
                          ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white hover:shadow-lg'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
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
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-sm p-6 ring-3 ring-black shadow-lg rounded-lg" style={{ imageRendering: 'pixelated' }}>
              <h2 className="text-2xl font-black text-gray-800 mb-6 text-center" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #fff' }}>
                SPECIAL ITEMS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shopItems.special_items.map((item, itemIndex) => (
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
                      <div className="text-lg font-black text-gray-700 bg-amber-200 px-2 py-1 rounded border border-gray-400" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #fff' }}>
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
                      className={`w-full py-2 px-4 rounded-lg font-black transition-all duration-200 ring-2 ring-black ${
                        cash >= item.cost && purchasing !== item.id
                          ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white hover:shadow-lg'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
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
