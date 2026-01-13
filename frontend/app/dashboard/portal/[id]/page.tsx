'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import Link from 'next/link'

interface PortalState {
  attendance?: {
    percentage: number
    totalClasses: number
    attended: number
  }
  exams?: Array<{
    subject: string
    date: string
    type: string
    status: string
  }>
  results?: Array<{
    subject: string
    marks: number
    grade: string
    semester: string
  }>
  fees?: {
    totalDue: number
    lastPaid: number
    dueDate: string
  }
  notices?: Array<{
    title: string
    content: string
    date: string
    category: string
  }>
}

export default function PortalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [state, setState] = useState<PortalState | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    fetchState()
  }, [params.id])

  const fetchState = async () => {
    try {
      const { data } = await api.get(`/portals/${params.id}/state`)
      setState(data)
    } catch (error) {
      console.error('Failed to fetch state:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      await api.post(`/portals/${params.id}/sync`)
      await fetchState()
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setSyncing(false)
    }
  }

  const handleAction = async (action: string, actionParams: Record<string, any> = {}) => {
    try {
      const result = await api.post(`/portals/${params.id}/action`, {
        action,
        params: actionParams,
      })
      alert(`Action completed: ${JSON.stringify(result.data)}`)
      // Refresh state after action
      await fetchState()
    } catch (error: any) {
      alert(`Action failed: ${error.response?.data?.message || 'Unknown error'}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-primary-600 hover:text-primary-700"
          >
            ← Back to Dashboard
          </Link>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Attendance */}
          {state?.attendance && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Attendance</h2>
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {state.attendance.percentage.toFixed(1)}%
              </div>
              <p className="text-gray-600">
                {state.attendance.attended} / {state.attendance.totalClasses}{' '}
                classes
              </p>
              {state.attendance.percentage < 75 && (
                <div className="mt-4 p-3 bg-yellow-100 rounded text-yellow-800">
                  ⚠️ Low attendance! Consider applying for medical leave.
                </div>
              )}
            </div>
          )}

          {/* Fees */}
          {state?.fees && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Fees</h2>
              <div className="text-3xl font-bold text-red-600 mb-2">
                ₹{state.fees.totalDue.toLocaleString()}
              </div>
              <p className="text-gray-600">
                Due: {new Date(state.fees.dueDate).toLocaleDateString()}
              </p>
              {state.fees.totalDue > 0 && (
                <button
                  onClick={() => handleAction('pay_fees', {})}
                  className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Pay Fees
                </button>
              )}
            </div>
          )}

          {/* Exams */}
          {state?.exams && state.exams.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Upcoming Exams</h2>
              <div className="space-y-3">
                {state.exams.map((exam, idx) => (
                  <div key={idx} className="border-b pb-3">
                    <div className="font-semibold">{exam.subject}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(exam.date).toLocaleDateString()} - {exam.type}
                    </div>
                    <div className="text-sm text-gray-500">{exam.status}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleAction('apply_exam', {})}
                className="mt-4 w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
              >
                Apply for Exam
              </button>
            </div>
          )}

          {/* Results */}
          {state?.results && state.results.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Recent Results</h2>
              <div className="space-y-3">
                {state.results.map((result, idx) => (
                  <div key={idx} className="border-b pb-3">
                    <div className="font-semibold">{result.subject}</div>
                    <div className="text-sm text-gray-600">
                      Marks: {result.marks} | Grade: {result.grade}
                    </div>
                    <div className="text-sm text-gray-500">
                      Semester: {result.semester}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notices */}
          {state?.notices && state.notices.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
              <h2 className="text-xl font-bold mb-4">Notices</h2>
              <div className="space-y-4">
                {state.notices.map((notice, idx) => (
                  <div key={idx} className="border-l-4 border-primary-500 pl-4">
                    <div className="font-semibold">{notice.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {notice.content}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(notice.date).toLocaleDateString()} •{' '}
                      {notice.category}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {!state && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No data available. Sync to fetch data.</p>
          </div>
        )}
      </div>
    </div>
  )
}
