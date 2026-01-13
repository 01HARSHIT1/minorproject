'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, TrendingUp, AlertTriangle, CheckCircle2, Clock, BookOpen, FileText, Bell, DollarSign, Download, CreditCard, FileCheck, Calendar, Sparkles } from 'lucide-react'

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

interface PortalInsights {
  summary: string
  alerts: string[]
  recommendations: string[]
  riskLevel: 'low' | 'medium' | 'high'
}

export default function PortalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [state, setState] = useState<PortalState | null>(null)
  const [insights, setInsights] = useState<PortalInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    fetchState()
    fetchInsights()
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

  const fetchInsights = async () => {
    try {
      const { data } = await api.get(`/portals/${params.id}/insights`)
      setInsights(data)
    } catch (error) {
      console.error('Failed to fetch insights:', error)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2.5 rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>

        {/* AI Insights Section */}
        {insights && (
          <div className="mb-8 bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2.5 rounded-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">AI Insights & Recommendations</h2>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
                  insights.riskLevel === 'high'
                    ? 'bg-red-100 text-red-800 border-2 border-red-200'
                    : insights.riskLevel === 'medium'
                    ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-200'
                    : 'bg-green-100 text-green-800 border-2 border-green-200'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Risk: {insights.riskLevel.toUpperCase()}
              </span>
            </div>
            
            <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed">{insights.summary}</p>
            </div>

            {insights.alerts.length > 0 && (
              <div className="mb-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Alerts
                </h3>
                <ul className="space-y-2">
                  {insights.alerts.map((alert, idx) => (
                    <li key={idx} className="text-red-700 flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{alert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {insights.recommendations.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Recommendations
                </h3>
                <ul className="space-y-2">
                  {insights.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-gray-700 flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Attendance */}
          {state?.attendance && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2.5 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Attendance</h2>
              </div>
              <div className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
                {state.attendance.percentage.toFixed(1)}%
              </div>
              <p className="text-gray-600 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {state.attendance.attended} / {state.attendance.totalClasses} classes
              </p>
              {state.attendance.percentage < 75 && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-yellow-800 text-sm">Low attendance! Consider applying for medical leave.</p>
                </div>
              )}
            </div>
          )}

          {/* Fees */}
          {state?.fees && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-red-500 to-pink-600 p-2.5 rounded-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Fees</h2>
              </div>
              <div className="text-4xl font-bold text-red-600 mb-2">
                ₹{state.fees.totalDue.toLocaleString()}
              </div>
              <p className="text-gray-600 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due: {new Date(state.fees.dueDate).toLocaleDateString()}
              </p>
              {state.fees.totalDue > 0 && (
                <button
                  onClick={() => handleAction('pay_fees', {})}
                  className="mt-4 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Pay Fees
                </button>
              )}
            </div>
          )}

          {/* Exams */}
          {state?.exams && state.exams.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2.5 rounded-lg">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Upcoming Exams</h2>
              </div>
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
                className="mt-4 w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Apply for Exam
              </button>
            </div>
          )}

          {/* Results */}
          {state?.results && state.results.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2.5 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Recent Results</h2>
              </div>
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
            <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2 border border-gray-100 hover:shadow-xl transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-2.5 rounded-lg">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Notices</h2>
              </div>
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

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-600" />
            Quick Actions
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => handleAction('apply_exam', {})}
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Apply for Exam
            </button>
            <button
              onClick={() => handleAction('download_admit_card', {})}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Admit Card
            </button>
            <button
              onClick={() => handleAction('download_result', {})}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Download Results
            </button>
            <button
              onClick={() => handleAction('pay_fees', {})}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Pay Fees
            </button>
            <button
              onClick={() => handleAction('download_fee_receipt', {})}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              Download Fee Receipt
            </button>
            <button
              onClick={() => {
                const reason = prompt('Enter leave reason:');
                const date = prompt('Enter leave date (YYYY-MM-DD):');
                if (reason && date) {
                  handleAction('apply_leave', { reason, date });
                }
              }}
              className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-4 py-3 rounded-lg hover:from-orange-700 hover:to-amber-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg font-semibold flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Apply for Leave
            </button>
          </div>
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
