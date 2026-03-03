'use client'

import { useState, useMemo } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarEvent {
  date: Date
  type: 'assignment' | 'exam' | 'deadline'
  title: string
}

interface CalendarWidgetProps {
  events?: CalendarEvent[]
  onDateClick?: (date: Date) => void
}

export default function CalendarWidget({ events = [], onDateClick }: CalendarWidgetProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const calendarDays = useMemo(() => {
    const days: Array<{ date: Date; isCurrentMonth: boolean; events: CalendarEvent[] }> = []

    // Previous month's days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i)
      days.push({
        date,
        isCurrentMonth: false,
        events: events.filter(e => 
          e.date.getDate() === date.getDate() &&
          e.date.getMonth() === date.getMonth() &&
          e.date.getFullYear() === date.getFullYear()
        ),
      })
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({
        date,
        isCurrentMonth: true,
        events: events.filter(e => 
          e.date.getDate() === date.getDate() &&
          e.date.getMonth() === date.getMonth() &&
          e.date.getFullYear() === date.getFullYear()
        ),
      })
    }

    // Next month's days (to fill the grid)
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({
        date,
        isCurrentMonth: false,
        events: events.filter(e => 
          e.date.getDate() === date.getDate() &&
          e.date.getMonth() === date.getMonth() &&
          e.date.getFullYear() === date.getFullYear()
        ),
      })
    }

    return days
  }, [year, month, firstDayOfMonth, daysInMonth, daysInPrevMonth, events])

  const today = new Date()
  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">
            {monthNames[month]} {year}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, idx) => (
          <button
            key={idx}
            onClick={() => onDateClick?.(day.date)}
            className={`
              relative p-2 rounded-lg text-sm transition
              ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
              ${isToday(day.date) ? 'bg-blue-100 font-bold' : 'hover:bg-gray-100'}
              ${day.events.length > 0 ? 'font-semibold' : ''}
            `}
          >
            {day.date.getDate()}
            {day.events.length > 0 && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                {day.events.slice(0, 2).map((event, eventIdx) => (
                  <div
                    key={eventIdx}
                    className={`w-1.5 h-1.5 rounded-full ${
                      event.type === 'exam' ? 'bg-red-500' :
                      event.type === 'assignment' ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`}
                  />
                ))}
                {day.events.length > 2 && (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Legend */}
      {events.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-gray-600">Assignments</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-600">Exams</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-gray-600">Deadlines</span>
          </div>
        </div>
      )}
    </div>
  )
}
