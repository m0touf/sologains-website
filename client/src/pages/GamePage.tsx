import { useEffect, useState } from "react";
import { useGameStore } from "../game/store";
import { useAuthStore } from "../stores/authStore";
import { apiClient } from "../lib/api";
import type { ScreenType } from "../lib/constants";
import Header from "../components/Header";
import HomeScreen from "../components/HomeScreen";
import GymScreen from "../components/GymScreen";
import StoreScreen from "../components/StoreScreen";
import AdventuresScreen from "../components/AdventuresScreen";
import ResearchScreen from "../components/ResearchScreen";

export default function GamePage() {
  const { spendEnergy, addXp, setFromServer, setExercises, addProficiencyPoints } = useGameStore();
  const { token } = useAuthStore();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');

  // Load initial game state from server
  useEffect(() => {
    if (!token) return;
    
    const loadGameState = async () => {
      try {
        // Load save data and exercises in parallel
        const [save, exercises] = await Promise.all([
          apiClient.getSave(),
          apiClient.getExercises()
        ]);

        setFromServer({
          energy: save.energy,
          xp: save.xp,
          level: save.level,
          stats: {
            strength: save.strength,
            stamina: save.stamina,
            mobility: save.mobility,
            level: save.level,
            xp: save.xp
          },
          proficiencyPoints: save.proficiencyPoints,
          cash: save.cash,
          permanentEnergy: save.permanentEnergy || 0,
          maxEnergy: save.maxEnergy,
          luckBoostPercent: save.luckBoostPercent || 0,
          ExerciseProficiencies: save.ExerciseProficiencies || [],
          ResearchUpgrades: save.ResearchUpgrades || []
        });

        setExercises(exercises);
      } catch (error) {
        console.error("Failed to load game state:", error);
      }
    };
    loadGameState();
  }, [setFromServer, setExercises, token]);

  const doWorkout = async (
    workoutType: 'strength' | 'endurance' | 'mobility', 
    exerciseId: string, 
    reps: number = 20,
    intensity: 1|2|3|4|5 = 3,
    grade: "perfect"|"good"|"okay"|"miss" = "good"
  ) => {
    if (!token) return;
    
    try {
      const data = await apiClient.doWorkout({
        type: workoutType,
        exerciseId,
        reps,
        intensity,
        grade
      });
      
      spendEnergy(data.energySpent);
      addXp(data.xpGained);
      if (data.ppGained > 0) {
        addProficiencyPoints(data.ppGained);
      }
      setFromServer({ 
        stats: data.statsAfter,
        level: data.levelAfter,
        xp: data.xpAfter,
        proficiencyPoints: data.proficiencyPointsAfter
      });

        // Show stat gain information
        const statGainMessage = Object.entries(data.statGains)
          .filter(([_, amount]) => (amount as number) > 0)
          .map(([stat, amount]) => `+${amount} ${stat}`)
          .join(', ');
        
        if (statGainMessage) {
          console.log(`Stat gains: ${statGainMessage}`);
        }
        
        if (data.dailyStatGainsUsed >= data.maxDailyStatGains) {
          console.log(`Daily stat gain limit reached for this exercise (${data.dailyStatGainsUsed}/${data.maxDailyStatGains})`);
        }
      
      // Reload full game state to get updated proficiencies
      const saveRes = await fetch("http://localhost:4000/api/save", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (saveRes.ok) {
        const save = await saveRes.json();
        setFromServer({
          energy: save.energy,
          xp: save.xp,
          level: save.level,
          stats: {
            strength: save.strength,
            stamina: save.stamina,
            mobility: save.mobility,
            level: save.level,
            xp: save.xp
          },
          proficiencyPoints: save.proficiencyPoints,
          cash: save.cash,
          permanentEnergy: save.permanentEnergy || 0,
          maxEnergy: save.maxEnergy,
          luckBoostPercent: save.luckBoostPercent || 0,
          ExerciseProficiencies: save.ExerciseProficiencies || [],
          ResearchUpgrades: save.ResearchUpgrades || []
        });
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };




  const resetEnergy = async () => {
    if (!token) return;
    
    try {
      const data = await apiClient.resetEnergy();
      setFromServer({ energy: data.energy });
      console.log("Energy reset to 100%");
      
      // Reload full game state to ensure everything is in sync
      const save = await apiClient.getSave();
      setFromServer({
        energy: save.energy,
        xp: save.xp,
        level: save.level,
        stats: {
          strength: save.strength,
          stamina: save.stamina,
          mobility: save.mobility,
          level: save.level,
          xp: save.xp
        },
        proficiencyPoints: save.proficiencyPoints,
        cash: save.cash,
        permanentEnergy: save.permanentEnergy || 0,
        luckBoostPercent: save.luckBoostPercent || 0,
        ExerciseProficiencies: save.ExerciseProficiencies || [],
        ResearchUpgrades: save.ResearchUpgrades || []
      });
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
        return <StoreScreen onBack={() => setCurrentScreen('home')} />;
      case 'adventures':
        return <AdventuresScreen onBack={() => setCurrentScreen('home')} />;
      case 'research':
        return <ResearchScreen onBack={() => setCurrentScreen('home')} />;
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
