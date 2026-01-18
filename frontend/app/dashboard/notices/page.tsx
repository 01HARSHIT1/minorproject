'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Link from 'next/link'
import { Bell, Calendar, Sparkles, FileText } from 'lucide-react'

interface Notice {
  title: string
  content: string
  date: Date
  category: string
  connectionId: string
  portalType: string
  summary?: string
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchNotices()
  }, [])

  const fetchNotices = async () => {
    try {
      const { data: connections } = await api.get('/portals')
      const allNotices: Notice[] = []

      for (const connection of connections) {
        try {
          const { data: state } = await api.get(`/portals/${connection.id}`)
          if (state?.notices && Array.isArray(state.notices)) {
            const portalNotices = state.notices.map((notice: any) => ({
              ...notice,
              date: new Date(notice.date),
              connectionId: connection.id,
              portalType: connection.portalType,
            }))
            allNotices.push(...portalNotices)
          }
        } catch (error) {
          console.error(`Failed to fetch notices for ${connection.id}:`, error)
        }
      }

      // Sort by date (newest first)
      allNotices.sort((a, b) => b.date.getTime() - a.date.getTime())
      setNotices(allNotices)
    } catch (error) {
      console.error('Failed to fetch notices:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['all', ...Array.from(new Set(notices.map(n => n.category)))]

  const filteredNotices = selectedCategory === 'all'
    ? notices
    : notices.filter(n => n.category === selectedCategory)

  const getDaysAgo = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    return `${diffDays} days ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notices</h1>
        <p className="text-gray-600">Important announcements and updates</p>
      </div>

      {/* Category Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notices List */}
      {filteredNotices.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-dashed border-gray-200">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 font-medium">No notices found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotices.map((notice, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">{notice.title}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 ml-8">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                      {notice.category}
                    </span>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{getDaysAgo(notice.date)}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span>{notice.portalType.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4 ml-8 leading-relaxed">{notice.content}</p>

              {/* AI Summary (if available) */}
              {notice.summary && (
                <div className="ml-8 mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-900">AI Summary</span>
                  </div>
                  <p className="text-sm text-purple-800">{notice.summary}</p>
                </div>
              )}

              <div className="flex items-center justify-between ml-8">
                <Link
                  href={`/dashboard/portal/${notice.connectionId}?notice=${idx}`}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                >
                  View Details →
                </Link>
                <span className="text-xs text-gray-500">
                  {notice.date.toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Summarized Notices Section */}
      {notices.length > 0 && (
        <div className="mt-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-600 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">AI-Summarized Notices</h3>
          </div>
          <p className="text-gray-700 text-sm mb-4">
            Key points from recent notices:
          </p>
          <ul className="space-y-2">
            {filteredNotices.slice(0, 5).map((notice, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <FileText className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>{notice.title} - {notice.category}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
