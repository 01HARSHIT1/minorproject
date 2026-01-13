'use client'

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
        console.error('Failed to save auth to localStorage', error)
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
        console.error('Failed to clear auth from localStorage', error)
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
      console.error('Failed to hydrate auth from localStorage', error)
    }
    
    set({ _hasHydrated: true })
  },
}))
