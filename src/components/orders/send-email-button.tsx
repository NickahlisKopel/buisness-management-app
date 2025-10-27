"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Loader2, CheckCircle, XCircle } from "lucide-react"

interface SendEmailButtonProps {
  orderId: string
  orderNumber: string
  supplierName: string
  onEmailSent?: () => void
}

export function SendEmailButton({ orderId, orderNumber, supplierName, onEmailSent }: SendEmailButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSendEmail = async () => {
    setIsLoading(true)
    setStatus('idle')
    setMessage('')

    try {
      const response = await fetch('/api/orders/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(`Order sent to ${supplierName} successfully!`)
        onEmailSent?.()
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to send email')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Sending...
        </>
      )
    }

    if (status === 'success') {
      return (
        <>
          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
          Sent
        </>
      )
    }

    if (status === 'error') {
      return (
        <>
          <XCircle className="h-4 w-4 mr-2 text-red-600" />
          Retry
        </>
      )
    }

    return (
      <>
        <Mail className="h-4 w-4 mr-2" />
        Send Email
      </>
    )
  }

  const getButtonVariant = () => {
    if (status === 'success') return 'outline'
    if (status === 'error') return 'destructive'
    return 'default'
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSendEmail}
        disabled={isLoading || status === 'success'}
        variant={getButtonVariant()}
        size="sm"
        className="w-full"
      >
        {getButtonContent()}
      </Button>
      
      {message && (
        <p className={`text-sm ${
          status === 'success' ? 'text-green-600' : 
          status === 'error' ? 'text-red-600' : 
          'text-gray-600'
        }`}>
          {message}
        </p>
      )}
    </div>
  )
}
