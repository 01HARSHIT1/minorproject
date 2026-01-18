'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, TrendingUp, AlertTriangle, CheckCircle2, Clock, BookOpen, FileText, Bell, DollarSign, Download, CreditCard, FileCheck, Calendar, Sparkles, Upload, X, CheckCircle, AlertCircle, Loader2, FileUp, Eye } from 'lucide-react'

interface Assignment {
  id: string
  title: string
  course: string
  courseCode?: string
  dueDate: string | Date
  description?: string
  status: 'pending' | 'submitted' | 'overdue' | 'graded'
  submissionUrl?: string
  submittedDate?: string | Date
  maxMarks?: number
  obtainedMarks?: number
}

interface AssignmentReview {
  isValid: boolean
  score: number
  issues: Array<{
    type: 'error' | 'warning' | 'suggestion'
    message: string
    severity: 'low' | 'medium' | 'high'
  }>
  suggestions: string[]
  deadlineStatus: 'on_time' | 'warning' | 'overdue'
  formatCheck: {
    valid: boolean
    message: string
  }
}

interface ReviewResponse {
  assignment: Assignment
  review: AssignmentReview
  fileInfo: {
    name: string
    size: number
    type: string
  }
}

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
  assignments?: Assignment[]
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
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [reviewResult, setReviewResult] = useState<AssignmentReview | null>(null)
  const [uploadingFile, setUploadingFile] = useState<File | null>(null)
  const [isReviewing, setIsReviewing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    fetchState()
    fetchInsights()
    fetchAssignments()
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

  const fetchAssignments = async () => {
    try {
      const { data } = await api.get(`/portals/${params.id}/assignments`)
      setAssignments(data || [])
    } catch (error) {
      console.error('Failed to fetch assignments:', error)
    }
  }

  const handleFileSelect = (file: File) => {
    setUploadingFile(file)
    setReviewResult(null)
  }

  const handleReview = async () => {
    if (!selectedAssignment || !uploadingFile) return
    
    setIsReviewing(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadingFile)
      
      const { data } = await api.post<ReviewResponse>(
        `/portals/${params.id}/assignments/${selectedAssignment.id}/review`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      setReviewResult(data.review)
      setShowReviewModal(true)
    } catch (error: any) {
      alert(`Review failed: ${error.response?.data?.message || 'Unknown error'}`)
    } finally {
      setIsReviewing(false)
    }
  }

  const handleSubmit = async (comments?: string) => {
    if (!selectedAssignment || !uploadingFile) return
    
    if (!confirm('Are you sure you want to submit this assignment? This action cannot be undone.')) {
      return
    }
    
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadingFile)
      if (comments) {
        formData.append('comments', comments)
      }
      
      const { data } = await api.post(
        `/portals/${params.id}/assignments/${selectedAssignment.id}/submit`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      
      alert(`Assignment submitted successfully! ${data.message || ''}`)
      setShowReviewModal(false)
      setSelectedAssignment(null)
      setUploadingFile(null)
      setReviewResult(null)
      await fetchAssignments()
      await fetchState()
    } catch (error: any) {
      alert(`Submission failed: ${error.response?.data?.message || 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
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

          {/* Assignments */}
          {assignments.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2 border border-gray-100 hover:shadow-xl transition">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Assignments</h2>
                <span className="ml-auto px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                  {assignments.length} {assignments.length === 1 ? 'Assignment' : 'Assignments'}
                </span>
              </div>
              <div className="space-y-4">
                {assignments.map((assignment) => {
                  const deadline = new Date(assignment.dueDate)
                  const isOverdue = deadline < new Date() && assignment.status !== 'submitted'
                  const daysRemaining = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  
                  return (
                    <div
                      key={assignment.id}
                      className={`border-2 rounded-lg p-5 transition-all ${
                        isOverdue
                          ? 'border-red-300 bg-red-50'
                          : assignment.status === 'submitted'
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-1">
                            {assignment.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-semibold">Course:</span> {assignment.course}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className={`flex items-center gap-1 font-semibold ${
                              isOverdue ? 'text-red-600' : daysRemaining <= 3 ? 'text-yellow-600' : 'text-gray-600'
                            }`}>
                              <Clock className="w-4 h-4" />
                              {isOverdue 
                                ? `Overdue by ${Math.abs(daysRemaining)} days`
                                : daysRemaining === 0
                                ? 'Due today'
                                : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining`
                              }
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              assignment.status === 'submitted'
                                ? 'bg-green-200 text-green-800'
                                : assignment.status === 'overdue'
                                ? 'bg-red-200 text-red-800'
                                : 'bg-yellow-200 text-yellow-800'
                            }`}>
                              {assignment.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedAssignment(assignment)
                            setUploadingFile(null)
                            setReviewResult(null)
                            setShowReviewModal(true)
                          }}
                          className="ml-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          {assignment.status === 'submitted' ? 'View' : 'Submit'}
                        </button>
                      </div>
                      {assignment.description && (
                        <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Description:</span> {assignment.description}
                          </p>
                        </div>
                      )}
                      {assignment.courseCode && (
                        <div className="mt-2 text-xs text-gray-500">
                          <span className="font-semibold">Course Code:</span> {assignment.courseCode}
                        </div>
                      )}
                    </div>
                  )
                })}
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

        {/* Assignment Review/Submit Modal */}
        {showReviewModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedAssignment.title}
                </h2>
                <button
                  onClick={() => {
                    setShowReviewModal(false)
                    setSelectedAssignment(null)
                    setUploadingFile(null)
                    setReviewResult(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Assignment Details */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-600">Course:</span>
                    <span className="text-sm text-gray-900">{selectedAssignment.course}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-600">Due Date:</span>
                    <span className={`text-sm font-semibold ${
                      new Date(selectedAssignment.dueDate) < new Date()
                        ? 'text-red-600'
                        : 'text-gray-900'
                    }`}>
                      {new Date(selectedAssignment.dueDate).toLocaleString()}
                    </span>
                  </div>
                  {selectedAssignment.courseCode && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-600">Course Code:</span>
                      <span className="text-sm text-gray-900">{selectedAssignment.courseCode}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      selectedAssignment.status === 'submitted'
                        ? 'bg-green-200 text-green-800'
                        : selectedAssignment.status === 'overdue'
                        ? 'bg-red-200 text-red-800'
                        : 'bg-yellow-200 text-yellow-800'
                    }`}>
                      {selectedAssignment.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {selectedAssignment.description && (
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <h3 className="font-semibold text-blue-900 mb-2">Description</h3>
                    <p className="text-sm text-blue-800">{selectedAssignment.description}</p>
                  </div>
                )}

                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <label className="block mb-4">
                    <span className="text-sm font-semibold text-gray-700 mb-2 block">
                      Upload Assignment File
                    </span>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileSelect(file)
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      disabled={selectedAssignment.status === 'submitted'}
                    />
                  </label>
                  {uploadingFile && (
                    <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{uploadingFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(uploadingFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setUploadingFile(null)}
                        className="text-gray-400 hover:text-red-600 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* AI Review Section */}
                {uploadingFile && selectedAssignment.status !== 'submitted' && (
                  <div className="space-y-4">
                    <button
                      onClick={handleReview}
                      disabled={isReviewing}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isReviewing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Reviewing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Get AI Review
                        </>
                      )}
                    </button>

                    {reviewResult && (
                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border-2 border-purple-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            AI Review Results
                          </h3>
                          <div className={`px-4 py-2 rounded-full font-bold ${
                            reviewResult.isValid
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            Score: {reviewResult.score}/100
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className={`p-3 rounded-lg flex items-center gap-2 ${
                            reviewResult.formatCheck.valid ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {reviewResult.formatCheck.valid ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-600" />
                            )}
                            <div>
                              <span className={`text-sm font-semibold block ${
                                reviewResult.formatCheck.valid ? 'text-green-800' : 'text-red-800'
                              }`}>
                                Format Check
                              </span>
                              <span className="text-xs text-gray-600">{reviewResult.formatCheck.message}</span>
                            </div>
                          </div>
                          <div className={`p-3 rounded-lg flex items-center gap-2 ${
                            reviewResult.deadlineStatus === 'on_time' ? 'bg-green-100' : 
                            reviewResult.deadlineStatus === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                          }`}>
                            {reviewResult.deadlineStatus === 'on_time' ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <AlertCircle className={`w-5 h-5 ${
                                reviewResult.deadlineStatus === 'warning' ? 'text-yellow-600' : 'text-red-600'
                              }`} />
                            )}
                            <div>
                              <span className={`text-sm font-semibold block ${
                                reviewResult.deadlineStatus === 'on_time' ? 'text-green-800' : 
                                reviewResult.deadlineStatus === 'warning' ? 'text-yellow-800' : 'text-red-800'
                              }`}>
                                Deadline Status
                              </span>
                              <span className="text-xs text-gray-600 capitalize">{reviewResult.deadlineStatus.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </div>

                        {reviewResult.issues.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Issues & Feedback</h4>
                            <ul className="space-y-2">
                              {reviewResult.issues.map((issue, idx) => (
                                <li key={idx} className={`text-sm flex items-start gap-2 p-2 rounded ${
                                  issue.type === 'error' ? 'bg-red-50 text-red-800' :
                                  issue.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                                  'bg-blue-50 text-blue-800'
                                }`}>
                                  {issue.type === 'error' ? (
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  ) : issue.type === 'warning' ? (
                                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  ) : (
                                    <span className="text-blue-600 mt-0.5">•</span>
                                  )}
                                  <span>{issue.message}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {reviewResult.suggestions.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Suggestions</h4>
                            <ul className="space-y-2">
                              {reviewResult.suggestions.map((item, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="text-indigo-600 mt-1">→</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                {uploadingFile && selectedAssignment.status !== 'submitted' && (
                  <button
                    onClick={() => handleSubmit()}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FileUp className="w-5 h-5" />
                        Submit Assignment
                      </>
                    )}
                  </button>
                )}

                {selectedAssignment.status === 'submitted' && (
                  <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200 flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <p className="text-green-800 font-semibold">This assignment has already been submitted.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
