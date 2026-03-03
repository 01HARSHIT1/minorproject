'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Link from 'next/link'
import { GraduationCap, BookOpen, FileText, Calendar, Search } from 'lucide-react'
import AIAssistantChat from '@/components/dashboard/AIAssistantChat'

interface Course {
  id: string
  name: string
  code: string
  connectionId: string
  portalType: string
  assignments?: number
  color?: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const { data: connections } = await api.get('/portals')
      
      // Extract unique courses from all connections
      const courseMap = new Map<string, Course>()
      const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-red-500', 'bg-yellow-500']

      for (const connection of connections) {
        try {
          const { data: assignments } = await api.get(`/portals/${connection.id}/assignments`)
          const { data: state } = await api.get(`/portals/${connection.id}`)
          
          // Group assignments by course
          const courseAssignments = new Map<string, any[]>()
          ;(assignments || []).forEach((a: any) => {
            const key = `${a.courseCode || a.course}`
            if (!courseAssignments.has(key)) {
              courseAssignments.set(key, [])
            }
            courseAssignments.get(key)!.push(a)
          })

          // Create course entries
          courseAssignments.forEach((assigns, courseKey) => {
            const assignment = assigns[0]
            const courseCode = assignment.courseCode || courseKey
            const courseName = assignment.course || courseCode

            if (!courseMap.has(courseCode)) {
              courseMap.set(courseCode, {
                id: `${connection.id}-${courseCode}`,
                name: courseName,
                code: courseCode,
                connectionId: connection.id,
                portalType: connection.portalType,
                assignments: assigns.length,
                color: colors[courseMap.size % colors.length],
              })
            } else {
              const existing = courseMap.get(courseCode)!
              existing.assignments = (existing.assignments || 0) + assigns.length
            }
          })
        } catch (error) {
          console.error(`Failed to fetch data for ${connection.id}:`, error)
        }
      }

      setCourses(Array.from(courseMap.values()))
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter(course => {
    if (filter === 'completed') return false // TODO: Implement completion logic
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return course.name.toLowerCase().includes(query) || course.code.toLowerCase().includes(query)
    }
    return true
  })

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
        <p className="text-gray-600">View and manage your enrolled courses</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            {(['all', 'active', 'completed'] as const).map((f) => (
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

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-dashed border-gray-200">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 font-medium">No courses found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Link
              key={course.id}
              href={`/dashboard/portal/${course.connectionId}?course=${course.code}`}
              className="bg-white rounded-xl shadow-md hover:shadow-xl p-6 border border-gray-100 hover:border-blue-200 transition-all duration-200 transform hover:scale-[1.02] group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${course.color || 'bg-blue-500'} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase bg-gray-100 px-2 py-1 rounded">
                  {course.portalType}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">{course.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{course.code}</p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>{course.assignments || 0} Assignments</span>
                </div>
                <div className="text-xs text-gray-500">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Active
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
