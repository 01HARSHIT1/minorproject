'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Link from 'next/link'
import { FileText, Sparkles, CheckCircle2, Clock, AlertCircle, Search, Filter } from 'lucide-react'

interface Assignment {
  id: string
  title: string
  course: string
  courseCode: string
  dueDate: Date
  status: 'pending' | 'submitted' | 'overdue' | 'graded'
  connectionId: string
  portalType: string
  type?: string
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'upcoming' | 'completed'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchAllAssignments()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [assignments, filter, searchQuery])

  const fetchAllAssignments = async () => {
    try {
      // Get all connections
      const { data: connections } = await api.get('/portals')
      
      // Fetch assignments from all connections
      const allAssignments: Assignment[] = []
      for (const connection of connections) {
        try {
          const { data } = await api.get(`/portals/${connection.id}/assignments`)
          const parsedAssignments = (data || []).map((a: any) => ({
            ...a,
            dueDate: new Date(a.dueDate),
            connectionId: connection.id,
            portalType: connection.portalType,
            type: a.type || 'Assignment',
          }))
          allAssignments.push(...parsedAssignments)
        } catch (error) {
          console.error(`Failed to fetch assignments for ${connection.id}:`, error)
        }
      }

      // Sort by due date
      allAssignments.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      setAssignments(allAssignments)
    } catch (error) {
      console.error('Failed to fetch assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...assignments]

    // Apply status filter
    if (filter === 'pending') {
      filtered = filtered.filter(a => a.status === 'pending' || a.status === 'overdue')
    } else if (filter === 'upcoming') {
      const now = new Date()
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(a => {
        const dueDate = new Date(a.dueDate)
        return (a.status === 'pending' || a.status === 'overdue') && dueDate <= weekFromNow
      })
    } else if (filter === 'completed') {
      filtered = filtered.filter(a => a.status === 'submitted' || a.status === 'graded')
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(query) ||
        a.course.toLowerCase().includes(query) ||
        a.courseCode.toLowerCase().includes(query)
      )
    }

    setFilteredAssignments(filtered)
  }

  const getStatusBadge = (assignment: Assignment) => {
    const now = new Date()
    const dueDate = new Date(assignment.dueDate)
    const isOverdue = dueDate < now && assignment.status === 'pending'

    if (assignment.status === 'graded' || assignment.status === 'submitted') {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
          {assignment.status === 'graded' ? 'Graded' : 'Submitted'}
        </span>
      )
    }
    if (isOverdue || assignment.status === 'overdue') {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
          Overdue
        </span>
      )
    }
    if (assignment.status === 'pending') {
      return (
        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-semibold">
          Pending
        </span>
      )
    }
    return null
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Assignments List</h1>
        <p className="text-gray-600">Manage and track all your assignments</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            {(['all', 'pending', 'upcoming', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  AI Assistant
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No assignments found</p>
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/portal/${assignment.connectionId}?assignment=${assignment.id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {assignment.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">{assignment.courseCode}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {assignment.course}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {assignment.type || 'Assignment'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {assignment.dueDate.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(assignment)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/portal/${assignment.connectionId}?assignment=${assignment.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium transition"
                      >
                        <Sparkles className="w-4 h-4" />
                        AI Review
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Insights Section */}
      {filteredAssignments.filter(a => a.status === 'pending' || a.status === 'overdue').length > 0 && (
        <div className="mt-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">AI Insights</h3>
            </div>
            <button className="text-sm text-purple-700 font-semibold hover:underline">
              See More
            </button>
          </div>
          <div className="space-y-3">
            {filteredAssignments
              .filter(a => a.status === 'pending' || a.status === 'overdue')
              .slice(0, 2)
              .map((assignment) => {
                const daysUntil = Math.ceil(
                  (new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                )
                return (
                  <div key={assignment.id} className="bg-white rounded-lg p-4 flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-semibold">{assignment.title}</span> - {assignment.course}
                      </p>
                      <p className="text-xs text-gray-500">
                        {daysUntil < 0 
                          ? `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''}`
                          : `Due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`
                        }
                      </p>
                    </div>
                    <button className="ml-4 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-200">
                      Get Help
                    </button>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
