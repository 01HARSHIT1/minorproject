import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
})

// Add auth token to requests (only on client side)
if (typeof window !== 'undefined') {
  api.interceptors.request.use((config) => {
    try {
      const token = useAuthStore.getState().token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      // Ignore errors in SSR
    }
    return config
  })

  // Handle auth errors (only on client side)
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        try {
          useAuthStore.getState().logout()
          if (window.location) {
            window.location.href = '/login'
          }
        } catch (e) {
          // Ignore errors
        }
      }
      return Promise.reject(error)
    },
  )
}

export default api
