import { useAuthStore } from "../stores/authStore";

export default function Header() {
  const { user, logout } = useAuthStore();

  return (
    <header className="relative border-b-4 border-black shadow-lg overflow-hidden">
      {/* Banner Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/src/assets/banners/Banner_Background_Home.png)',
          imageRendering: 'pixelated'
        }}
      ></div>
      
      {/* Content Overlay */}
      <div className="relative z-10 flex justify-between items-center max-w-7xl mx-auto py-3 pr-8">
        <div className="flex items-center">
          <img 
            src="/src/assets/banners/Banner_Image_Home.png" 
            alt="Solo Gains" 
            className="h-11 object-contain w-auto"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-white text-sm font-bold" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #000' }}>
            Welcome, <span className="text-yellow-300 font-black" style={{ textShadow: '2px 2px 0px #000' }}>{user?.username}</span>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white border-4 border-black transition-all duration-200 text-sm font-black hover:shadow-md"
            style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000', backgroundColor: '#dc2626' }}
          >
            LOGOUT
          </button>
        </div>
      </div>
    </header>
  );
}
