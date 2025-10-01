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
  const { energy, xp, stats, spendEnergy, addXp, addStats, setFromServer, setExercises, addProficiencyPoints } = useGameStore();
  const { token } = useAuthStore();
  const [currentScreen, setCurrentScreen] = useState<'home' | 'gym' | 'store' | 'adventures' | 'research'>('home');

  // Load initial game state from server
  useEffect(() => {
    if (!token) return;
    
    const loadGameState = async () => {
      try {
        // Load save data
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
              agility: save.agility,
              level: save.level,
              xp: save.xp
            },
            spriteStage: save.spriteStage,
            proficiencyPoints: save.proficiencyPoints,
            ExerciseProficiencies: save.ExerciseProficiencies || [],
            ResearchUpgrades: save.ResearchUpgrades || []
          });
        }

        // Load exercises
        const exercisesRes = await fetch("http://localhost:4000/api/exercises", {
          headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        if (exercisesRes.ok) {
          const exercises = await exercisesRes.json();
          setExercises(exercises);
        }
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
      const res = await fetch("http://localhost:4000/api/workout", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          type: workoutType, 
          exerciseId, 
          reps, 
          intensity, 
          grade 
        })
      });
      
      if (!res.ok) {
        const error = await res.json();
        console.error("Workout failed:", error);
        return;
      }
      
        const data = await res.json();
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
            agility: save.agility,
            level: save.level,
            xp: save.xp
          },
          spriteStage: save.spriteStage,
          proficiencyPoints: save.proficiencyPoints,
          ExerciseProficiencies: save.ExerciseProficiencies || [],
          ResearchUpgrades: save.ResearchUpgrades || []
        });
      }
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
      
      // Reload full game state to ensure everything is in sync
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
            agility: save.agility,
            level: save.level,
            xp: save.xp
          },
          spriteStage: save.spriteStage,
          proficiencyPoints: save.proficiencyPoints,
          ExerciseProficiencies: save.ExerciseProficiencies || [],
          ResearchUpgrades: save.ResearchUpgrades || []
        });
      }
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
