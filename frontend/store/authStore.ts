'use client'

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
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
}

// Create a no-op storage for SSR
const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

// Safe storage getter - always returns safe storage
const getStorage = () => {
  if (typeof window === 'undefined') {
    return noopStorage
  }
  try {
    return localStorage
  } catch {
    return noopStorage
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => getStorage() as any),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)

// Hydrate on client side only
if (typeof window !== 'undefined') {
  useAuthStore.persist.rehydrate()
}
