import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, getRateLimitIdentifier, rateLimitConfigs } from "@/lib/rate-limit"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (session.user.role !== 'ADMIN') return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const orgId = session.user.organizationId
    const settings = await (prisma as any).emailSettings.findUnique({ where: { organizationId: orgId } })
    if (!settings) return NextResponse.json({ settings: null })
    const { password: _omitted, ...safe } = settings as any
    return NextResponse.json({ settings: safe })
  } catch (err) {
    console.error('GET /api/settings/email failed:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Apply strict rate limiting for admin settings changes
    const identifier = getRateLimitIdentifier(req)
    const rateLimitResult = checkRateLimit(identifier, rateLimitConfigs.strict)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': rateLimitConfigs.strict.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetAt).toISOString()
          }
        }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (session.user.role !== 'ADMIN') return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const orgId = session.user.organizationId
    if (!orgId) {
      return NextResponse.json({ error: "No organization found for current user" }, { status: 400 })
    }
    // Ensure the organization exists to avoid FK violations
    const org = await prisma.organization.findUnique({ where: { id: orgId } })
    if (!org) {
      return NextResponse.json({ error: "Organization not found. Please create or join an organization first." }, { status: 400 })
    }
    const body = await req.json()
    const { host, port, user, password, fromAddress, secure } = body || {}

    if (!host || !port || !user || !fromAddress) {
      return NextResponse.json({ error: "host, port, user, fromAddress are required" }, { status: 400 })
    }

    const portNum = Number(port)
    if (!Number.isInteger(portNum) || portNum <= 0) {
      return NextResponse.json({ error: "port must be a positive integer" }, { status: 400 })
    }

  const existing = await (prisma as any).emailSettings.findUnique({ where: { organizationId: orgId } })

    if (existing) {
      const updated = await (prisma as any).emailSettings.update({
        where: { organizationId: orgId },
        data: {
          host,
          port: portNum,
          user,
          fromAddress,
          secure: !!secure,
          ...(password ? { password } : {}),
        },
      })
      const { password: _omitted, ...safe } = updated as any
      return NextResponse.json({ settings: safe })
    }

    if (!password) {
      return NextResponse.json({ error: "password is required for initial setup" }, { status: 400 })
    }

    const created = await (prisma as any).emailSettings.create({
      data: { organizationId: orgId, host, port: portNum, user, password, fromAddress, secure: !!secure },
    })
    const { password: _omitted2, ...safe } = created as any
    return NextResponse.json({ settings: safe })
  } catch (err: any) {
    if (err?.code === 'P2003') {
      // Foreign key constraint failed — likely invalid/missing organization
      return NextResponse.json({ error: 'Organization not found for this user. Please create or join an organization first, then try again.' }, { status: 400 })
    }
    console.error('POST /api/settings/email failed:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
