'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export default function StoreHydration() {
  useEffect(() => {
    // Hydrate the store on client side only
    useAuthStore.getState().hydrate()
  }, [])

  return null
}
