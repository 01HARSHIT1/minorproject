'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import Link from 'next/link'
import { GraduationCap, Plus, LogOut, User, Link2, Calendar, Activity } from 'lucide-react'

interface PortalConnection {
  id: string
  portalType: string
  collegeId: string
  isActive: boolean
  createdAt: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [connections, setConnections] = useState<PortalConnection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchConnections()
  }, [isAuthenticated, router])

  const fetchConnections = async () => {
    try {
      const { data } = await api.get('/portals')
      setConnections(data)
    } catch (error) {
      console.error('Failed to fetch connections:', error)
    } finally {
      setLoading(false)
    }
  }

  // Don't render on server if not authenticated
  if (typeof window === 'undefined' || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-2 rounded-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                Student Portal Gateway
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Portals</h2>
            <p className="text-gray-600">Manage and monitor all your college portal connections</p>
          </div>
          <Link
            href="/dashboard/connect"
            className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Connect Portal
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : connections.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-dashed border-gray-200">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Link2 className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-2 font-medium">No portal connections yet</p>
            <p className="text-gray-500 text-sm mb-6">Get started by connecting your first college portal</p>
            <Link
              href="/dashboard/connect"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold hover:underline"
            >
              Connect your first portal
              <span>→</span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {connections.map((connection) => (
              <Link
                key={connection.id}
                href={`/dashboard/portal/${connection.id}`}
                className="bg-white rounded-xl shadow-md hover:shadow-xl p-6 border border-gray-100 hover:border-primary-200 transition-all duration-200 transform hover:scale-[1.02] group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                      <Link2 className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {connection.portalType.toUpperCase()}
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${
                      connection.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Activity className={`w-3 h-3 ${connection.isActive ? 'text-green-600' : 'text-gray-500'}`} />
                    {connection.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    ID: {connection.collegeId}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Connected {new Date(connection.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
