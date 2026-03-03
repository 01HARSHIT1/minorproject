'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface AttendanceData {
  percentage: number
  totalClasses: number
  attended: number
  portalType: string
  connectionId: string
}

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([])
  const [averageAttendance, setAverageAttendance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAttendance()
  }, [])

  const fetchAttendance = async () => {
    try {
      const { data: connections } = await api.get('/portals')
      const attendanceList: AttendanceData[] = []

      for (const connection of connections) {
        try {
          const { data: state } = await api.get(`/portals/${connection.id}`)
          if (state?.attendance) {
            attendanceList.push({
              ...state.attendance,
              portalType: connection.portalType,
              connectionId: connection.id,
            })
          }
        } catch (error) {
          console.error(`Failed to fetch attendance for ${connection.id}:`, error)
        }
      }

      setAttendanceData(attendanceList)
      
      // Calculate average
      if (attendanceList.length > 0) {
        const avg = attendanceList.reduce((sum, a) => sum + a.percentage, 0) / attendanceList.length
        setAverageAttendance(avg)
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAttendanceBgColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500'
    if (percentage >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const remainingClasses = averageAttendance >= 75 
    ? 0 
    : Math.ceil((75 * attendanceData.reduce((sum, a) => sum + a.totalClasses, 0) / 100 - attendanceData.reduce((sum, a) => sum + a.attended, 0)) / (attendanceData.length || 1))

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Overview</h1>
        <p className="text-gray-600">Track your attendance across all portals</p>
      </div>

      {/* Main Attendance Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Overall Attendance</h2>
            <p className="text-gray-600">Average across all courses</p>
          </div>
          {averageAttendance < 75 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">Low Attendance</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-8">
          {/* Circular Progress */}
          <div className="relative w-48 h-48">
            <svg className="transform -rotate-90 w-48 h-48">
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 80}`}
                strokeDashoffset={`${2 * Math.PI * 80 * (1 - averageAttendance / 100)}`}
                className={getAttendanceBgColor(averageAttendance)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getAttendanceColor(averageAttendance)}`}>
                  {averageAttendance.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Attendance</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Total Classes</span>
              <span className="text-xl font-bold text-gray-900">
                {attendanceData.reduce((sum, a) => sum + a.totalClasses, 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Attended</span>
              <span className="text-xl font-bold text-green-600">
                {attendanceData.reduce((sum, a) => sum + a.attended, 0)}
              </span>
            </div>
            {averageAttendance < 75 && (
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="text-yellow-800 font-medium">Can miss safely</span>
                <span className="text-xl font-bold text-yellow-800">
                  {remainingClasses > 0 ? remainingClasses : 0} classes
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Portal-wise Attendance */}
      {attendanceData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Portal-wise Attendance</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {attendanceData.map((data, idx) => (
              <div key={idx} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{data.portalType.toUpperCase()}</h4>
                    <p className="text-sm text-gray-600">Portal Attendance</p>
                  </div>
                  <div className={`text-2xl font-bold ${getAttendanceColor(data.percentage)}`}>
                    {data.percentage.toFixed(1)}%
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className={`h-3 rounded-full transition-all ${getAttendanceBgColor(data.percentage)}`}
                    style={{ width: `${data.percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Attended: {data.attended} / {data.totalClasses}</span>
                  {data.percentage >= 75 ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      Above threshold
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      Below 75%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Assistant Section */}
      <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-600 p-2 rounded-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">AI Attendance Insights</h3>
        </div>
        <div className="space-y-3">
          {averageAttendance >= 75 ? (
            <div className="bg-white rounded-lg p-4">
              <p className="text-gray-700">
                ✅ Great job! Your attendance is above the 75% threshold. Keep up the good work!
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-4">
              <p className="text-gray-700 mb-2">
                ⚠️ Your attendance is below 75%. To maintain eligibility:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                <li>You can safely miss {remainingClasses} more classes</li>
                <li>Focus on attending remaining classes regularly</li>
                <li>Contact your advisor if you have concerns</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
