import axios from 'axios'

const getAuthToken = () => {
  if (typeof window === 'undefined') return null
  try {
    const authStorage = localStorage.getItem('auth-storage')
    if (!authStorage) return null
    const parsed = JSON.parse(authStorage)
    return parsed?.token || null
  } catch {
    return null
  }
}

// Get API URL from environment or default to localhost
const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  
  // Warn if using localhost in production (client-side only)
  if (typeof window !== 'undefined' && apiUrl.includes('localhost') && window.location.hostname !== 'localhost') {
    console.warn(
      '⚠️ API URL is set to localhost but app is running in production. ' +
      'Please set NEXT_PUBLIC_API_URL environment variable in Vercel.'
    )
  }
  
  return apiUrl
}

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
})

// Add auth token to requests (works on both client and server)
api.interceptors.request.use(
  (config) => {
    // Only add token on client side
    if (typeof window !== 'undefined') {
      try {
        const token = getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch (error) {
        // Ignore errors silently
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle auth errors (only on client side)
if (typeof window !== 'undefined') {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        try {
          // Clear auth storage
          localStorage.removeItem('auth-storage')
          if (window.location && window.location.pathname !== '/login') {
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
