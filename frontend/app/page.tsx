'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function Home() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const hasHydrated = useAuthStore((state) => state._hasHydrated)

  useEffect(() => {
    setMounted(true)
    // Hydrate store on client side
    useAuthStore.getState().hydrate()
  }, [])

  useEffect(() => {
    if (!mounted || !hasHydrated) return
    
    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [isAuthenticated, router, mounted, hasHydrated])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  )
}
