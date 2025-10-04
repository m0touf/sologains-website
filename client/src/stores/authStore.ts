import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (accessToken: string, refreshToken: string, user: User) => 
        set({ accessToken, refreshToken, user, isAuthenticated: true }),
      logout: () => 
        set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false }),
      setUser: (user: User) => 
        set({ user }),
      setTokens: (accessToken: string, refreshToken?: string) => 
        set({ accessToken, refreshToken: refreshToken || null }),
    }),
    {
      name: "auth-storage",
      migrate: (persistedState: any, version: number) => {
        // Clear old token-based storage and reset to clean state
        if (persistedState && (persistedState.token || persistedState.version !== 1)) {
          return {
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          };
        }
        return persistedState;
      },
      version: 1,
    }
  )
);
