'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { Calendar, Clock, MapPin } from 'lucide-react'

interface TimetableEntry {
  day: string
  time: string
  subject: string
  location?: string
  type?: string
  portalType: string
}

export default function TimetablePage() {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTimetable()
  }, [])

  const fetchTimetable = async () => {
    try {
      // For now, we'll create a mock timetable structure
      // In a real implementation, this would come from portal data
      const mockTimetable: TimetableEntry[] = [
        { day: 'Monday', time: '09:00 - 10:30', subject: 'Pattern Recognition', portalType: 'UPES', type: 'Lecture' },
        { day: 'Monday', time: '11:00 - 12:30', subject: 'Compiler Design', portalType: 'UPES', type: 'Lab' },
        { day: 'Tuesday', time: '09:00 - 10:30', subject: 'Control Systems', portalType: 'UPES', type: 'Lecture' },
        { day: 'Wednesday', time: '14:00 - 15:30', subject: 'Edge Computing', portalType: 'UPES', type: 'Lecture' },
        { day: 'Thursday', time: '10:00 - 11:30', subject: 'Statistics Lab', portalType: 'UPES', type: 'Lab' },
        { day: 'Friday', time: '09:00 - 10:30', subject: 'Deep Learning', portalType: 'UPES', type: 'Lecture' },
      ]
      setTimetable(mockTimetable)
    } catch (error) {
      console.error('Failed to fetch timetable:', error)
    } finally {
      setLoading(false)
    }
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const getTimetableForDay = (day: string) => timetable.filter(t => t.day === day)

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Timetable</h1>
        <p className="text-gray-600">Your class schedule for the semester</p>
      </div>

      {/* Timetable Calendar View */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Weekly Schedule</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Semester 6 - 2026</span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {daysOfWeek.map((day) => {
            const dayClasses = getTimetableForDay(day)
            return (
              <div key={day} className="p-6 hover:bg-gray-50 transition">
                <div className="flex gap-6">
                  <div className="w-32 flex-shrink-0">
                    <h3 className="font-bold text-gray-900 text-lg">{day}</h3>
                  </div>
                  <div className="flex-1 space-y-3">
                    {dayClasses.length === 0 ? (
                      <p className="text-gray-400 text-sm">No classes scheduled</p>
                    ) : (
                      dayClasses.map((entry, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100"
                        >
                          <div className="flex items-center gap-2 text-blue-700">
                            <Clock className="w-4 h-4" />
                            <span className="font-semibold text-sm">{entry.time}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{entry.subject}</h4>
                            {entry.location && (
                              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                <MapPin className="w-3 h-3" />
                                <span>{entry.location}</span>
                              </div>
                            )}
                          </div>
                          {entry.type && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              {entry.type}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Next Class Info */}
      <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-green-600" />
          Next Class
        </h3>
        {timetable.length > 0 ? (
          <div className="bg-white rounded-lg p-4">
            <p className="text-gray-700 font-medium">
              {timetable[0].subject} - {timetable[0].time}
            </p>
            <p className="text-sm text-gray-600 mt-1">Tomorrow • {timetable[0].day}</p>
          </div>
        ) : (
          <p className="text-gray-600">No upcoming classes scheduled</p>
        )}
      </div>
    </div>
  )
}
