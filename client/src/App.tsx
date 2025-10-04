import { useAuthStore } from "./stores/authStore";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import GamePage from "./pages/GamePage";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  try {
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

    return (
      <ErrorBoundary>
        {getCurrentPage()}
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('App error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-black text-red-600 mb-4" style={{ fontFamily: 'monospace' }}>
            LOADING ERROR
          </h1>
          <p className="text-gray-700 font-bold mb-4" style={{ fontFamily: 'monospace' }}>
            Check browser console for details
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-black py-2 px-4 rounded-lg"
            style={{ fontFamily: 'monospace' }}
          >
            CLEAR CACHE & RELOAD
          </button>
        </div>
      </div>
    );
  }
}

export default App;