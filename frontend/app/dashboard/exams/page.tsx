'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Link from 'next/link'
import { BookOpen, Calendar, Download, AlertCircle, CheckCircle2 } from 'lucide-react'

interface Exam {
  subject: string
  date: Date
  type: string
  status: string
  portalType: string
  connectionId: string
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const { data: connections } = await api.get('/portals')
      const allExams: Exam[] = []

      for (const connection of connections) {
        try {
          const { data: state } = await api.get(`/portals/${connection.id}`)
          if (state?.exams && Array.isArray(state.exams)) {
            const portalExams = state.exams.map((exam: any) => ({
              ...exam,
              date: new Date(exam.date),
              portalType: connection.portalType,
              connectionId: connection.id,
            }))
            allExams.push(...portalExams)
          }
        } catch (error) {
          console.error(`Failed to fetch exams for ${connection.id}:`, error)
        }
      }

      // Sort by date
      allExams.sort((a, b) => a.date.getTime() - b.date.getTime())
      setExams(allExams)
    } catch (error) {
      console.error('Failed to fetch exams:', error)
    } finally {
      setLoading(false)
    }
  }

  const upcomingExams = exams.filter(e => new Date(e.date) > new Date())
  const pastExams = exams.filter(e => new Date(e.date) <= new Date())

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Schedule</h1>
        <p className="text-gray-600">View and manage your examination schedule</p>
      </div>

      {/* Upcoming Exams */}
      {upcomingExams.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-blue-50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Upcoming Exams
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {upcomingExams.map((exam, idx) => {
              const daysUntil = Math.ceil((exam.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              return (
                <div key={idx} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{exam.subject}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                          {exam.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 ml-8">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{exam.date.toLocaleDateString()}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span>{exam.portalType.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {daysUntil <= 7 && (
                        <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-sm font-semibold">
                          <AlertCircle className="w-4 h-4" />
                          {daysUntil} day{daysUntil !== 1 ? 's' : ''} left
                        </div>
                      )}
                      <Link
                        href={`/dashboard/portal/${exam.connectionId}?exam=${exam.subject}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition"
                      >
                        <Download className="w-4 h-4" />
                        Hall Ticket
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Past Exams */}
      {pastExams.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-gray-600" />
              Past Exams
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {pastExams.map((exam, idx) => (
              <div key={idx} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <BookOpen className="w-5 h-5 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-700">{exam.subject}</h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                        {exam.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 ml-8">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{exam.date.toLocaleDateString()}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span>{exam.portalType.toUpperCase()}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-green-600 font-semibold">{exam.status || 'Completed'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {exams.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-dashed border-gray-200">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600 font-medium">No exams scheduled</p>
        </div>
      )}
    </div>
  )
}
