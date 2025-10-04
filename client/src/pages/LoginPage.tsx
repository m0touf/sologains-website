import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await res.json();
      useAuthStore.getState().login(data.accessToken, data.refreshToken, data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center p-4" style={{ imageRendering: 'pixelated' }}>
      <div className="w-full">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-sm ring-3 ring-black shadow-lg rounded-xl p-8 w-full max-w-2xl mx-auto" style={{ imageRendering: 'pixelated' }}>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-gray-800 mb-2" style={{ fontFamily: 'monospace', textShadow: '2px 2px 0px #fff' }}>
              SOLO GAINS
            </h1>
            <p className="text-gray-700 font-bold" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #fff' }}>Welcome back! Sign in to continue your journey.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'monospace' }}>EMAIL</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-amber-100 border-2 border-black rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 text-lg font-bold"
                style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #fff' }}
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2" style={{ fontFamily: 'monospace' }}>PASSWORD</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-amber-100 border-2 border-black rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-400 text-lg font-bold"
                style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #fff' }}
                placeholder="Enter your password"
              />
            </div>
            
            {error && (
              <div className="bg-red-200 border-2 border-red-500 rounded-lg p-3 ring-2 ring-red-300">
                <p className="text-red-700 text-sm text-center font-bold" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #fff' }}>{error}</p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-800 text-white font-black py-3 px-4 rounded-lg ring-2 ring-black shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #000' }}
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
          
          <div className="text-center mt-6">
            <p className="text-gray-700 text-sm font-bold" style={{ fontFamily: 'monospace', textShadow: '1px 1px 0px #fff' }}>
              Don't have an account?{' '}
              <a href="/signup" className="text-amber-600 hover:text-amber-700 underline font-black">
                SIGN UP
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
