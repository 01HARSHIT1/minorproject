'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Link from 'next/link'
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Bot,
  ChevronRight,
  Upload,
  Loader2,
} from 'lucide-react'

interface SupervisorAction {
  id: string
  portalConnectionId: string
  actionType: string
  status: string
  aiSummary: string
  aiSuggestedDraft: string | null
  payload: {
    assignmentId: string
    assignmentTitle: string
    course: string
    courseCode?: string
    dueDate: string
    daysUntilDue?: number
  }
  portalConnection?: { portalType: string }
  createdAt: string
}

export default function ApprovalsPage() {
  const [actions, setActions] = useState<SupervisorAction[]>([])
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState<string | null>(null)
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')

  useEffect(() => {
    fetchActions()
  }, [filter])

  const fetchActions = async () => {
    try {
      const url = filter === 'pending'
        ? '/supervisor/actions/pending'
        : '/supervisor/actions'
      const { data } = await api.get(url)
      setActions(data)
    } catch (err) {
      console.error('Failed to fetch approvals:', err)
      setActions([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (actionId: string) => {
    setActioning(actionId)
    try {
      await api.post(`/supervisor/actions/${actionId}/approve`, {})
      await fetchActions()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve')
    } finally {
      setActioning(null)
    }
  }

  const handleReject = async (actionId: string) => {
    if (!confirm('Reject this AI suggestion? You can always request help again later.')) return
    setActioning(actionId)
    try {
      await api.post(`/supervisor/actions/${actionId}/reject`)
      await fetchActions()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject')
    } finally {
      setActioning(null)
    }
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Supervisor Queue</h1>
          <p className="text-gray-600">
            Review AI suggestions and approve actions before they run on your portal
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : actions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-dashed border-gray-200">
          <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No actions in queue</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            When your AI Supervisor detects new assignments, they&apos;ll appear here for your approval before any upload.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            Go to Dashboard
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {actions.map((action) => (
            <div
              key={action.id}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      {action.portalConnection?.portalType || 'Portal'}
                    </span>
                    {action.payload.daysUntilDue != null && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs">
                        Due in {action.payload.daysUntilDue} days
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {action.payload.assignmentTitle}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{action.payload.course}</p>
                  {action.aiSummary && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-semibold text-gray-600">AI Summary</span>
                      </div>
                      <p className="text-sm text-gray-700">{action.aiSummary}</p>
                      {action.aiSuggestedDraft && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className="text-xs font-semibold text-gray-600">Suggested Approach:</span>
                          <p className="text-sm text-gray-600 mt-1">{action.aiSuggestedDraft}</p>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        action.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : action.status === 'approved' || action.status === 'executed'
                          ? 'bg-green-100 text-green-800'
                          : action.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {action.status}
                    </span>
                  </div>
                </div>
                {action.status === 'pending' && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <Link
                      href={`/dashboard/portal/${action.portalConnectionId}`}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                    >
                      <Upload className="w-4 h-4" />
                      Upload File
                    </Link>
                    <button
                      onClick={() => handleApprove(action.id)}
                      disabled={actioning === action.id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      {actioning === action.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(action.id)}
                      disabled={actioning === action.id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Created {new Date(action.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
