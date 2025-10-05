import { useAuthStore } from "./stores/authStore";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import GamePage from "./pages/GamePage";

function App() {
  const { isAuthenticated } = useAuthStore();

  // Simple routing based on URL path
  const getCurrentPage = () => {
    const path = window.location.pathname;
    
    if (!isAuthenticated) {
      if (path === '/signup') {
        return <SignupPage />;
      }
      return <LoginPage />;
    }
    
    return <GamePage />;
  };

  return getCurrentPage();
}

export default App;