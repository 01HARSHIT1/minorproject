import { create } from 'zustand'

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
  _hasHydrated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  setHasHydrated: (state: boolean) => void
  hydrate: () => void
}

// Create store - Zustand's create is SSR-safe by default
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  _hasHydrated: false,
  
  setAuth: (user, token) => {
    set({ user, token, isAuthenticated: true })
    // Save to localStorage only on client
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          'auth-storage',
          JSON.stringify({ user, token })
        )
      } catch (error) {
        // Silently fail in SSR or if localStorage is unavailable
      }
    }
  },
  
  logout: () => {
    set({ user: null, token: null, isAuthenticated: false })
    // Clear localStorage only on client
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('auth-storage')
      } catch (error) {
        // Silently fail in SSR or if localStorage is unavailable
      }
    }
  },
  
  setHasHydrated: (state) => set({ _hasHydrated: state }),
  
  hydrate: () => {
    // Only hydrate on client side
    if (typeof window === 'undefined') {
      set({ _hasHydrated: true })
      return
    }
    
    try {
      const stored = localStorage.getItem('auth-storage')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.user && parsed.token) {
          set({
            user: parsed.user,
            token: parsed.token,
            isAuthenticated: true,
            _hasHydrated: true,
          })
          return
        }
      }
    } catch (error) {
      // Silently fail if localStorage is unavailable or parsing fails
    }
    
    set({ _hasHydrated: true })
  },
}))
