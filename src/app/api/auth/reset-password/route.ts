import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()
    if (typeof token !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ ok: false, error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const now = new Date()

    const prt = await (prisma as any).passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    })

    if (!prt || prt.usedAt || new Date(prt.expiresAt) < now) {
      return NextResponse.json({ ok: false, error: 'Invalid or expired token' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)
    await prisma.user.update({ where: { id: prt.userId }, data: { password: hashed } })
    await (prisma as any).passwordResetToken.update({ where: { id: prt.id }, data: { usedAt: now } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}
