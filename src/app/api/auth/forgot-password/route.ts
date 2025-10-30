import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

function getBaseUrl(req: NextRequest) {
  const envUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL
  if (envUrl) {
    return envUrl.startsWith('http') ? envUrl : `https://${envUrl}`
  }
  const proto = req.headers.get('x-forwarded-proto') || 'http'
  const host = req.headers.get('host')
  return `${proto}://${host}`
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (typeof email !== 'string' || !email.includes('@')) {
      // Always return success to avoid email enumeration
      return NextResponse.json({ ok: true })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // Return generic success even if user not found
      return NextResponse.json({ ok: true })
    }

    // Create reset token (store hash only)
    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    // Invalidate existing tokens for this user
  await (prisma as any).passwordResetToken.deleteMany({ where: { userId: user.id } })

  await (prisma as any).passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    })

    const baseUrl = getBaseUrl(req)
    const link = `${baseUrl}/auth/reset-password?token=${rawToken}`

    // Send email (use org email settings if present)
    await sendPasswordResetEmail(user.email, link, user.organizationId)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Forgot password error:', error)
    // Still return ok to avoid info disclosure
    return NextResponse.json({ ok: true })
  }
}
