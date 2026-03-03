'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { ArrowLeft, Link2, Lock, User, Globe, AlertCircle } from 'lucide-react'
import Link from 'next/link'

// Official UPES portal - permanent for now. TODO: Dynamic portal URLs later.
const UPES_OFFICIAL_URL = 'https://myupes-beta.upes.ac.in/oneportal/app/auth/login'

const PORTAL_TYPES = [
  { value: 'upes', label: 'UPES (University of Petroleum and Energy Studies)', url: UPES_OFFICIAL_URL, fixedUrl: true },
  { value: 'amity', label: 'Amity University', url: '', fixedUrl: false },
  { value: 'du', label: 'Delhi University', url: '', fixedUrl: false },
  { value: 'vit', label: 'VIT University', url: '', fixedUrl: false },
  { value: 'iit', label: 'IIT', url: '', fixedUrl: false },
  { value: 'custom', label: 'Custom Portal', url: '', fixedUrl: false },
]

export default function ConnectPortalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    portalType: 'upes',
    portalUrl: 'https://myupes-beta.upes.ac.in/oneportal/app/auth/login',
    collegeId: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // UPES: always use official URL (permanent for now)
    const payload = {
      ...formData,
      ...(formData.portalType === 'upes' && { portalUrl: UPES_OFFICIAL_URL }),
    }

    try {
      await api.post('/portals/connect', payload)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to connect portal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Connect Portal</h1>
              <p className="text-gray-500 text-sm">Link your college portal to get started</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Portal Type
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  required
                  value={formData.portalType}
                  onChange={(e) => {
                    const selectedType = PORTAL_TYPES.find(t => t.value === e.target.value);
                    setFormData({ 
                      ...formData, 
                      portalType: e.target.value,
                      portalUrl: selectedType?.url ?? formData.portalUrl,
                    });
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition appearance-none bg-white"
                >
                  {PORTAL_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Portal URL - hidden for UPES (fixed). Shown for others (dynamic later) */}
            {formData.portalType !== 'upes' ? (
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Portal URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    required={formData.portalType !== 'upes'}
                    value={formData.portalUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, portalUrl: e.target.value })
                    }
                    placeholder="https://student.example.edu"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>UPES Portal:</strong> Using official MyUPES link. Access your student portal through this AI gateway.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                College ID / Email (e.g. Harshit.122504@stu.upes.ac.in)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.collegeId}
                  onChange={(e) =>
                    setFormData({ ...formData, collegeId: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  placeholder="Enter your college ID"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  placeholder="Enter your portal password"
                />
              </div>
              <div className="mt-2 flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Your password is encrypted with AES-256 and stored securely. We never store plaintext passwords.
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Connecting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Link2 className="w-5 h-5" />
                    Connect Portal
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
