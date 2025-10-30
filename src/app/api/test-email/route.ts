import { NextRequest, NextResponse } from 'next/server'
import { sendTestEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Valid email required' 
      }, { status: 400 })
    }

    console.log('[Test Email] Attempting to send to:', email)
    console.log('[Test Email] RESEND_API_KEY set:', !!process.env.RESEND_API_KEY)
    console.log('[Test Email] EMAIL_FROM:', process.env.EMAIL_FROM)
    console.log('[Test Email] EMAIL_SERVER_HOST:', process.env.EMAIL_SERVER_HOST)
    
    const result = await sendTestEmail(email)
    
    console.log('[Test Email] Result:', result)
    
    if (result.ok) {
      return NextResponse.json({ 
        ok: true, 
        message: 'Test email sent successfully!',
        id: result.id 
      })
    } else {
      return NextResponse.json({ 
        ok: false, 
        error: result.error || 'Unknown error' 
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('[Test Email] Exception:', error)
    return NextResponse.json({ 
      ok: false, 
      error: error?.message || 'Server error' 
    }, { status: 500 })
  }
}
