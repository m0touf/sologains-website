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
import LoadingScreen from "../components/LoadingScreen";

export default function GamePage() {
  const { 
    spendEnergy, 
    setFromServer, 
    setExercises, 
    setAdventures,
    addProficiencyPoints, 
    updateExerciseProficiency,
    isLoading, 
    isInitialized, 
    setLoading, 
    setInitialized 
  } = useGameStore();
  const { token } = useAuthStore();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');

  // Load initial game state from server
  useEffect(() => {
    if (!token) return;
    
    const loadGameState = async () => {
      try {
        setLoading(true);
        
        // Load save data, exercises, and adventures in parallel
        const [save, exercises, adventures] = await Promise.all([
          apiClient.getSave(),
          apiClient.getExercises(),
          apiClient.getDailyAdventures()
        ]) as [any, any, any];

        // Set all data at once to prevent flashing
        setFromServer({
          userId: save.userId,
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
          permanentXpGain: save.permanentXpGain || 0,
          dailyAdventureLimit: save.dailyAdventureLimit || 2,
          lastEnergyUpdate: save.lastEnergyUpdate,
          lastDailyReset: save.lastDailyReset,
          shopRotationSeed: save.shopRotationSeed,
          lastShopRotation: save.lastShopRotation,
          adventureRotationSeed: save.adventureRotationSeed,
          lastAdventureRotation: save.lastAdventureRotation,
          lastAdventureReset: save.lastAdventureReset,
          dailyResetCount: save.dailyResetCount || 0,
          xpBoostRemaining: save.xpBoostRemaining || 0,
          proficiencyBoostRemaining: save.proficiencyBoostRemaining || 0,
          fractionalEnergy: save.fractionalEnergy,
          dailyAdventureAttempts: save.dailyAdventureAttempts || 0,
          ExerciseProficiencies: save.ExerciseProficiencies || [],
          ResearchUpgrades: save.ResearchUpgrades || [],
          AdventureAttempts: save.AdventureAttempts || []
        });

        setExercises(exercises);
        setAdventures(adventures);
        
        // Mark as initialized and stop loading
        setInitialized(true);
        setLoading(false);
      } catch (error) {
        
        setLoading(false);
      }
    };
    loadGameState();
  }, [setFromServer, setExercises, setLoading, setInitialized, token]);

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
      }) as any;
      
      if (data.ppGained > 0) {
        addProficiencyPoints(data.ppGained);
      }
      
      // Update the specific exercise proficiency
      updateExerciseProficiency(exerciseId, data.proficiencyGained, data.dailyStatGainsUsed);
      
      // Update all the data from the workout response
      setFromServer({ 
        stats: data.statsAfter,
        level: data.levelAfter,
        xp: data.xpAfter,
        proficiencyPoints: data.proficiencyPointsAfter,
        energy: data.energyAfter, // Use the energyAfter value directly
        fractionalEnergy: data.fractionalEnergyAfter,
        cash: data.cashReward ? useGameStore.getState().cash + data.cashReward : useGameStore.getState().cash
      });

        // Show stat gain information
        const statGainMessage = Object.entries(data.statGains)
          .filter(([_, amount]) => (amount as number) > 0)
          .map(([stat, amount]) => `+${amount} ${stat}`)
          .join(', ');
        
        if (statGainMessage) {
          
        }
        
        if (data.cashReward > 0) {
          
        }
        
        if (data.dailyStatGainsUsed >= data.maxDailyStatGains) {
          
        }
      
      // Only reload proficiencies, not the entire save state to avoid energy conflicts
      // The workout response already contains all the necessary data
    } catch (error) {
      
    }
  };




  const resetEnergy = async () => {
    if (!token) return;
    
    try {
      const data = await apiClient.resetEnergy() as any;
      setFromServer({ 
        energy: data.energy, 
        fractionalEnergy: data.fractionalEnergy, 
        lastEnergyUpdate: new Date().toISOString() 
      });
      
      // No need to reload full game state - the reset response contains the correct data
    } catch (error) {
      
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

  // Show loading screen while initializing
  if (isLoading || !isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 relative overflow-hidden">
      <Header />
      
      <div className="flex h-[calc(100vh-80px)] relative z-10">
        {renderCurrentScreen()}
      </div>
    </div>
  );
}
