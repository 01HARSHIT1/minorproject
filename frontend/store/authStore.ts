import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

// Safe localStorage access for SSR
const getStorage = () => {
  if (typeof window !== 'undefined') {
    return localStorage
  }
  // Return a no-op storage for SSR
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => getStorage() as any),
      skipHydration: true, // Skip hydration on server
    },
  ),
)
