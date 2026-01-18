'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import Link from 'next/link'
import { GraduationCap, Plus, LogOut, User, Link2, Calendar, Activity, FileText, AlertTriangle, Clock, Bell, TrendingUp, DollarSign, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react'

interface PortalConnection {
  id: string
  portalType: string
  collegeId: string
  isActive: boolean
  createdAt: string
}

interface DashboardSummary {
  totalPortals: number
  activePortals: number
  totalAssignments: number
  pendingAssignments: number
  overdueAssignments: number
  assignmentsDueSoon: number
  upcomingExams: number
  totalNotices: number
  recentNotices: Array<{
    title: string
    content: string
    date: string | Date
    category: string
    connectionId: string
    portalType: string
    daysAgo: number
  }>
  upcomingDeadlines: Array<{
    id: string
    title: string
    course: string
    dueDate: string | Date
    connectionId: string
    portalType: string
    type: 'assignment' | 'exam'
  }>
  totalFeesDue: number
  averageAttendance: number
}

export default function DashboardPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)
  const hasHydrated = useAuthStore((state) => state._hasHydrated)
  const [connections, setConnections] = useState<PortalConnection[]>([])
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Hydrate store on client side
    useAuthStore.getState().hydrate()
  }, [])

  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window === 'undefined' || !hasHydrated) return
    
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchConnections()
    fetchSummary()
  }, [isAuthenticated, router, hasHydrated])

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

  const fetchSummary = async () => {
    try {
      const { data } = await api.get('/portals/summary')
      setSummary(data)
    } catch (error) {
      console.error('Failed to fetch summary:', error)
    }
  }

  // Don't render until hydrated
  if (!hasHydrated || !isAuthenticated) {
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
            <p className="text-gray-600">Overview of all your college portal connections</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/calendar"
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-semibold"
            >
              <Calendar className="w-5 h-5" />
              Calendar View
            </Link>
            <Link
              href="/dashboard/connect"
              className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Connect Portal
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && connections.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Pending Assignments */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                {summary.overdueAssignments > 0 && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                    {summary.overdueAssignments} Overdue
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {summary.pendingAssignments}
              </div>
              <div className="text-sm text-gray-600">Pending Assignments</div>
              {summary.assignmentsDueSoon > 0 && (
                <div className="mt-3 text-xs text-amber-600 font-semibold">
                  {summary.assignmentsDueSoon} due within 7 days
                </div>
              )}
            </div>

            {/* Upcoming Exams */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {summary.upcomingExams}
              </div>
              <div className="text-sm text-gray-600">Upcoming Exams</div>
              <div className="mt-3 text-xs text-blue-600 font-semibold">
                Next 7 days
              </div>
            </div>

            {/* Attendance */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                {summary.averageAttendance < 75 && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                    Low
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {summary.averageAttendance.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Average Attendance</div>
              {summary.averageAttendance < 75 && (
                <div className="mt-3 text-xs text-yellow-600 font-semibold">
                  Below 75% threshold
                </div>
              )}
            </div>

            {/* Fees Due */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-red-500 to-pink-600 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ₹{summary.totalFeesDue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Fees Due</div>
              {summary.totalFeesDue > 0 && (
                <div className="mt-3 text-xs text-red-600 font-semibold">
                  Payment pending
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upcoming Deadlines & Recent Notices */}
        {summary && connections.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  Upcoming Deadlines
                </h3>
                {summary.upcomingDeadlines.length > 0 && (
                  <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-bold">
                    {summary.upcomingDeadlines.length}
                  </span>
                )}
              </div>
              {summary.upcomingDeadlines.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No upcoming deadlines</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {summary.upcomingDeadlines.slice(0, 5).map((deadline) => {
                    const dueDate = new Date(deadline.dueDate)
                    const daysUntil = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    const isOverdue = dueDate < new Date()
                    
                    return (
                      <Link
                        key={deadline.id}
                        href={`/dashboard/portal/${deadline.connectionId}`}
                        className="block p-4 border-2 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {deadline.type === 'assignment' ? (
                                <FileText className="w-4 h-4 text-orange-600" />
                              ) : (
                                <BookOpen className="w-4 h-4 text-blue-600" />
                              )}
                              <span className="text-xs font-semibold text-gray-500 uppercase">
                                {deadline.portalType}
                              </span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">{deadline.title}</h4>
                            <p className="text-sm text-gray-600">{deadline.course}</p>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-bold ${
                              isOverdue ? 'text-red-600' : daysUntil <= 1 ? 'text-orange-600' : 'text-gray-600'
                            }`}>
                              {isOverdue 
                                ? 'Overdue'
                                : daysUntil === 0
                                ? 'Today'
                                : daysUntil === 1
                                ? 'Tomorrow'
                                : `${daysUntil} days`
                              }
                            </div>
                            <div className="text-xs text-gray-500">
                              {dueDate.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                  {summary.upcomingDeadlines.length > 5 && (
                    <Link
                      href="/dashboard"
                      className="block text-center text-primary-600 hover:text-primary-700 font-semibold text-sm py-2"
                    >
                      View all {summary.upcomingDeadlines.length} deadlines →
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Recent Notices */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary-600" />
                  Recent Notices
                </h3>
                {summary.recentNotices.length > 0 && (
                  <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-bold">
                    {summary.totalNotices} total
                  </span>
                )}
              </div>
              {summary.recentNotices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No recent notices</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {summary.recentNotices.map((notice, idx) => (
                    <Link
                      key={idx}
                      href={`/dashboard/portal/${notice.connectionId}`}
                      className="block p-4 border-l-4 border-primary-500 bg-gray-50 rounded-lg hover:bg-primary-50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{notice.title}</h4>
                        <span className="text-xs font-semibold text-gray-500 uppercase ml-2">
                          {notice.portalType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{notice.content}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{notice.category}</span>
                        <span>•</span>
                        <span>{notice.daysAgo === 0 ? 'Today' : `${notice.daysAgo} day${notice.daysAgo > 1 ? 's' : ''} ago`}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Portal Connections Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Portals</h2>
            {summary && (
              <div className="text-sm text-gray-600">
                {summary.activePortals} active of {summary.totalPortals} total
              </div>
            )}
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
        </div>
      </main>
    </div>
  )
}
