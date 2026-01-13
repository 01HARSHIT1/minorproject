'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

const PORTAL_TYPES = [
  { value: 'amity', label: 'Amity University' },
  { value: 'du', label: 'Delhi University' },
  { value: 'vit', label: 'VIT University' },
  { value: 'iit', label: 'IIT' },
  { value: 'custom', label: 'Custom Portal' },
]

export default function ConnectPortalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    portalType: 'amity',
    portalUrl: '',
    collegeId: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await api.post('/portals/connect', formData)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to connect portal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold mb-6">Connect Portal</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Portal Type
              </label>
              <select
                required
                value={formData.portalType}
                onChange={(e) =>
                  setFormData({ ...formData, portalType: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {PORTAL_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Portal URL
              </label>
              <input
                type="url"
                required
                value={formData.portalUrl}
                onChange={(e) =>
                  setFormData({ ...formData, portalUrl: e.target.value })
                }
                placeholder="https://student.example.edu"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                College ID / Username
              </label>
              <input
                type="text"
                required
                value={formData.collegeId}
                onChange={(e) =>
                  setFormData({ ...formData, collegeId: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="mt-2 text-sm text-gray-500">
                Your password is encrypted and stored securely. We never store
                plaintext passwords.
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Connect Portal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
