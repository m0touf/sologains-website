import { useAuthStore } from "../stores/authStore";

export default function Header() {
  const { user, logout } = useAuthStore();

  return (
    <header className="relative border-b-3 border-black shadow-lg overflow-hidden">
      {/* Banner Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/src/assets/banners/Banner_Background_Home.png)',
          imageRendering: 'pixelated'
        }}
      ></div>
      
      {/* Content Overlay */}
      <div className="relative z-10 flex justify-between items-center max-w-7xl mx-auto py-3">
        <div className="flex items-center">
          <img 
            src="/src/assets/banners/Banner_Image_Home.png" 
            alt="Solo Gains" 
            className="h-14 object-cover w-auto"
            style={{ imageRendering: 'pixelated' }}
          />
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
