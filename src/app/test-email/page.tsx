"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/layout/header'
import { Mail, CheckCircle, XCircle } from 'lucide-react'

export default function TestEmailPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message?: string; error?: string } | null>(null)

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      setResult(data)
    } catch (error: any) {
      setResult({ ok: false, error: error?.message || 'Network error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Test Email Configuration</h1>
              <p className="text-sm text-gray-600 mt-1">
                Send a test email to verify your email setup is working correctly.
              </p>
            </div>
          </div>

          <form onSubmit={handleTest} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Send test email to:
              </label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Sending...' : 'Send Test Email'}
            </Button>
          </form>

          {result && (
            <div className={`mt-6 p-4 rounded-lg ${result.ok ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start">
                {result.ok ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className={`font-semibold ${result.ok ? 'text-green-900' : 'text-red-900'}`}>
                    {result.ok ? 'Success!' : 'Error'}
                  </h3>
                  <p className={`text-sm mt-1 ${result.ok ? 'text-green-700' : 'text-red-700'}`}>
                    {result.message || result.error}
                  </p>
                  {result.ok && (
                    <p className="text-xs text-green-600 mt-2">
                      Check your inbox (and spam folder) for the test email.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Troubleshooting</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Ensure <code className="bg-gray-200 px-1 rounded">EMAIL_FROM</code> is set to a valid sender</li>
              <li>• For Resend: use <code className="bg-gray-200 px-1 rounded">onboarding@resend.dev</code> or your verified domain</li>
              <li>• Check Vercel logs for detailed error messages</li>
              <li>• Verify <code className="bg-gray-200 px-1 rounded">RESEND_API_KEY</code> is correct</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
