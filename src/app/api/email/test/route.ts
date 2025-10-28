import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sendTestEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

  const { to } = await request.json()
    if (!to || typeof to !== 'string') {
      return NextResponse.json({ error: "A valid 'to' email is required" }, { status: 400 })
    }

  const result = await sendTestEmail(to, session.user.organizationId)
    if (!result.ok) {
      return NextResponse.json({ error: result.error || 'Failed to send test email' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Test email sent', id: result.id })
  } catch (error) {
    console.error('Error in test email route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
