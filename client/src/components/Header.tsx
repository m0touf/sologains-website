import { useAuthStore } from "../stores/authStore";

export default function Header() {
  const { user, logout } = useAuthStore();

  return (
    <header className="border-b-6 border-black shadow-lg" style={{ backgroundColor: '#a84848' }}>
      <div className="flex justify-between items-center max-w-7xl mx-auto py-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">SG</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Solo Gains
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-slate-200 text-sm">
            Welcome, <span className="text-emerald-400 font-semibold">{user?.username}</span>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-lg transition-all duration-200 text-sm font-medium hover:shadow-md border border-red-500/20"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
