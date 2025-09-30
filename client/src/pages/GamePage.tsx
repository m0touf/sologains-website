import { useEffect, useState } from "react";
import { useGameStore } from "../game/store";
import { useAuthStore } from "../stores/authStore";
import Header from "../components/Header";
import HomeScreen from "../components/HomeScreen";
import GymScreen from "../components/GymScreen";
import StoreScreen from "../components/StoreScreen";
import AdventuresScreen from "../components/AdventuresScreen";
import ResearchScreen from "../components/ResearchScreen";

export default function GamePage() {
  const { energy, xp, stats, spendEnergy, addXp, addStats, setFromServer } = useGameStore();
  const { token } = useAuthStore();
  const [currentScreen, setCurrentScreen] = useState<'home' | 'gym' | 'store' | 'adventures' | 'research'>('home');

  // Load initial game state from server
  useEffect(() => {
    if (!token) return;
    
    const loadGameState = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/save", {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        if (res.ok) {
          const save = await res.json();
          setFromServer({
            energy: save.energy,
            xp: save.xp,
            stats: {
              strength: save.strength,
              stamina: save.stamina,
              agility: save.agility
            },
            spriteStage: save.spriteStage
          });
        }
      } catch (error) {
        console.error("Failed to load game state:", error);
      }
    };
    loadGameState();
  }, [setFromServer, token]);

  const doWorkout = async (workoutType: 'strength' | 'endurance' | 'agility', reps: number = 20) => {
    if (!token) return;
    
    try {
      const res = await fetch("http://localhost:4000/api/workout", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ type: workoutType, reps })
      });
      
      if (!res.ok) {
        const error = await res.json();
        console.error("Workout failed:", error);
        return;
      }
      
      const data = await res.json();
      spendEnergy(data.energySpent);
      addXp(data.xpGained);
      setFromServer({ stats: data.statsAfter });
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const handlePurchase = (item: string, cost: number) => {
    // TODO: Implement purchase logic
    console.log(`Purchased ${item} for ${cost} coins`);
  };

  const handleStartQuest = (quest: string) => {
    // TODO: Implement quest logic
    console.log(`Started quest: ${quest}`);
  };

  const handleStartResearch = (researchId: string) => {
    // TODO: Implement research logic
    console.log(`Started research: ${researchId}`);
  };

  const resetEnergy = async () => {
    if (!token) return;
    
    try {
      const res = await fetch("http://localhost:4000/api/reset-energy", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!res.ok) {
        const error = await res.json();
        console.error("Energy reset failed:", error);
        return;
      }
      
      const data = await res.json();
      setFromServer({ energy: data.energy });
      console.log("Energy reset to 100%");
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={setCurrentScreen} onResetEnergy={resetEnergy} />;
      case 'gym':
        return <GymScreen onBack={() => setCurrentScreen('home')} onWorkout={doWorkout} />;
      case 'store':
        return <StoreScreen onBack={() => setCurrentScreen('home')} onPurchase={handlePurchase} />;
      case 'adventures':
        return <AdventuresScreen onBack={() => setCurrentScreen('home')} onStartQuest={handleStartQuest} />;
      case 'research':
        return <ResearchScreen onBack={() => setCurrentScreen('home')} onStartResearch={handleStartResearch} />;
      default:
        return <HomeScreen onNavigate={setCurrentScreen} onResetEnergy={resetEnergy} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 relative overflow-hidden">
      <Header />
      
      <div className="flex h-[calc(100vh-80px)] relative z-10">
        {renderCurrentScreen()}
      </div>
    </div>
  );
}
