"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, ArrowLeft } from 'lucide-react'

export default function ResetPasswordPage() {
  const search = useSearchParams()
  const router = useRouter()
  const [token, setToken] = useState<string>('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const t = search.get('token') || ''
    setToken(t)
  }, [search])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!token) {
      setError('Reset token is missing or invalid.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || 'Failed to reset password')
      }
      setSuccess(true)
      // Optionally redirect to sign in after a short delay
      // setTimeout(() => router.push('/auth/signin'), 2500)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="inline-flex items-center justify-center bg-green-100 rounded-full p-3">
            <Lock className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900">Password updated</h2>
          <p className="mt-2 text-sm text-gray-600">You can now sign in with your new password.</p>
          <div className="mt-6">
            <Button asChild className="w-full">
              <Link href="/auth/signin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-blue-100 rounded-full p-3">
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl sm:text-3xl font-bold text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter a new password for your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">New password</label>
              <div className="mt-1">
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" />
              </div>
              <p className="mt-1 text-xs text-gray-500">Minimum 8 characters.</p>
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">Confirm password</label>
              <div className="mt-1">
                <Input id="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter new password" />
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={isLoading || !token}>
                {isLoading ? 'Updating...' : 'Update password'}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <Button variant="outline" asChild className="w-full">
              <Link href="/auth/forgot-password">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Forgot Password
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
