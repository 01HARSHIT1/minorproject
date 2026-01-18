'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import Link from 'next/link'
import { ArrowLeft, Calendar as CalendarIcon, FileText, BookOpen, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface Deadline {
  id: string
  title: string
  course: string
  dueDate: string | Date
  connectionId: string
  portalType: string
  type: 'assignment' | 'exam'
  status?: 'pending' | 'submitted' | 'overdue' | 'graded'
}

export default function CalendarPage() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const hasHydrated = useAuthStore((state) => state._hasHydrated)
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    useAuthStore.getState().hydrate()
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !hasHydrated) return
    
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchDeadlines()
  }, [isAuthenticated, router, hasHydrated, selectedMonth])

  const fetchDeadlines = async () => {
    try {
      const { data } = await api.get('/portals/summary')
      // Get all deadlines from summary
      const allDeadlines: Deadline[] = []
      
      // Fetch assignments from each portal
      const connections = await api.get('/portals')
      for (const connection of connections.data) {
        if (connection.isActive) {
          try {
            const assignments = await api.get(`/portals/${connection.id}/assignments`)
            for (const assignment of assignments.data || []) {
              allDeadlines.push({
                id: assignment.id,
                title: assignment.title,
                course: assignment.course,
                dueDate: assignment.dueDate,
                connectionId: connection.id,
                portalType: connection.portalType,
                type: 'assignment',
                status: assignment.status,
              })
            }
          } catch (error) {
            console.error(`Failed to fetch assignments for ${connection.id}:`, error)
          }
        }
      }

      // Add exams from summary
      if (data.upcomingDeadlines) {
        for (const deadline of data.upcomingDeadlines) {
          if (deadline.type === 'exam') {
            allDeadlines.push(deadline)
          }
        }
      }

      setDeadlines(allDeadlines)
    } catch (error) {
      console.error('Failed to fetch deadlines:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  // Get deadlines for a specific date
  const getDeadlinesForDate = (date: Date | null): Deadline[] => {
    if (!date) return []
    
    return deadlines.filter((deadline) => {
      const deadlineDate = new Date(deadline.dueDate)
      return (
        deadlineDate.getDate() === date.getDate() &&
        deadlineDate.getMonth() === date.getMonth() &&
        deadlineDate.getFullYear() === date.getFullYear()
      )
    })
  }

  // Get deadlines for a date (including overdue)
  const getDeadlineCountForDate = (date: Date | null): number => {
    if (!date) return 0
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    
    return deadlines.filter((deadline) => {
      const deadlineDate = new Date(deadline.dueDate)
      deadlineDate.setHours(0, 0, 0, 0)
      
      return (
        deadlineDate.getTime() === checkDate.getTime() ||
        (deadlineDate < today && deadline.status !== 'submitted' && deadline.status !== 'graded')
      )
    }).length
  }

  const previousMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const days = getDaysInMonth(selectedMonth)
  const selectedDateDeadlines = getDeadlinesForDate(selectedDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <CalendarIcon className="w-8 h-8 text-primary-600" />
                Assignment Calendar
              </h1>
              <p className="text-gray-600">View all your deadlines and exams in one place</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <span className="text-xl">‹</span>
              </button>
              <h2 className="text-xl font-bold text-gray-900">
                {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <span className="text-xl">›</span>
              </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((date, idx) => {
                if (!date) {
                  return <div key={idx} className="aspect-square"></div>
                }

                const isToday = date.getTime() === today.getTime()
                const isSelected = selectedDate && date.getTime() === selectedDate.getTime()
                const deadlineCount = getDeadlineCountForDate(date)
                const isPast = date < today
                const dateDeadlines = getDeadlinesForDate(date)

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square p-2 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50'
                        : isToday
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    } ${isPast && deadlineCount > 0 ? 'bg-red-50 border-red-300' : ''}`}
                  >
                    <div className="flex flex-col h-full">
                      <div className={`text-sm font-semibold mb-1 ${
                        isSelected ? 'text-primary-700' : isToday ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {date.getDate()}
                      </div>
                      {deadlineCount > 0 && (
                        <div className="flex-1 flex items-center justify-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            dateDeadlines.some(d => d.status === 'overdue' || (new Date(d.dueDate) < today && d.status !== 'submitted'))
                              ? 'bg-red-500 text-white'
                              : dateDeadlines.some(d => {
                                  const daysUntil = Math.ceil((new Date(d.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                                  return daysUntil <= 3 && daysUntil > 0
                                })
                              ? 'bg-orange-500 text-white'
                              : 'bg-primary-500 text-white'
                          }`}>
                            {deadlineCount}
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected Date Details */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {selectedDate ? (
                <>
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                  <br />
                  <span className="text-lg text-gray-600">
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </>
              ) : (
                'Select a Date'
              )}
            </h3>

            {selectedDate && (
              <div className="space-y-3">
                {selectedDateDeadlines.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No deadlines on this date</p>
                  </div>
                ) : (
                  selectedDateDeadlines.map((deadline) => {
                    const dueDate = new Date(deadline.dueDate)
                    const isOverdue = dueDate < today && deadline.status !== 'submitted' && deadline.status !== 'graded'
                    const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

                    return (
                      <Link
                        key={deadline.id}
                        href={`/dashboard/portal/${deadline.connectionId}`}
                        className={`block p-4 rounded-lg border-2 transition-all ${
                          isOverdue
                            ? 'border-red-300 bg-red-50 hover:bg-red-100'
                            : daysUntil <= 3
                            ? 'border-orange-300 bg-orange-50 hover:bg-orange-100'
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {deadline.type === 'assignment' ? (
                            <FileText className={`w-5 h-5 mt-0.5 ${
                              isOverdue ? 'text-red-600' : 'text-orange-600'
                            }`} />
                          ) : (
                            <BookOpen className={`w-5 h-5 mt-0.5 ${
                              isOverdue ? 'text-red-600' : 'text-blue-600'
                            }`} />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{deadline.title}</h4>
                              {isOverdue && (
                                <span className="px-2 py-0.5 bg-red-200 text-red-800 rounded text-xs font-bold">
                                  OVERDUE
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{deadline.course}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="uppercase font-semibold">{deadline.portalType}</span>
                              <span>•</span>
                              <span>{dueDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                              {!isOverdue && daysUntil > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="font-semibold">
                                    {daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days left`}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })
                )}
              </div>
            )}

            {!selectedDate && (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Click on a date to view deadlines</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
