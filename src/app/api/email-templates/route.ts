import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, getRateLimitIdentifier, rateLimitConfigs } from "@/lib/rate-limit"
import DOMPurify from 'isomorphic-dompurify'

// Configure DOMPurify to allow safe HTML only
const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'style', 'class'],
    ALLOW_DATA_ATTR: false
  })
}

// GET all templates for the user's organization
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orgId = session.user.organizationId
    if (!orgId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 })
    }

    const templates = await (prisma as any).emailTemplate.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ templates })
  } catch (err) {
    console.error('GET /api/email-templates failed:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create a new template
export async function POST(req: NextRequest) {
  try {
    // Apply strict rate limiting for admin operations
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
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 })
    }

    const orgId = session.user.organizationId
    if (!orgId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 })
    }

    const body = await req.json()
    const { name, type, subject, htmlContent, textContent, isActive } = body

    if (!name || !subject || !htmlContent) {
      return NextResponse.json({ 
        error: "name, subject, and htmlContent are required" 
      }, { status: 400 })
    }

    // Sanitize HTML content to prevent XSS attacks
    const sanitizedHTML = sanitizeHTML(htmlContent)

    // Check if template with this type already exists (for STANDARD/URGENT)
    if (type !== 'CUSTOM') {
      const existing = await (prisma as any).emailTemplate.findUnique({
        where: {
          organizationId_type: {
            organizationId: orgId,
            type: type || 'CUSTOM'
          }
        }
      })

      if (existing) {
        return NextResponse.json({ 
          error: `A ${type} template already exists. Edit that one or create a CUSTOM template.` 
        }, { status: 400 })
      }
    }

    const template = await (prisma as any).emailTemplate.create({
      data: {
        organizationId: orgId,
        name,
        type: type || 'CUSTOM',
        subject,
        htmlContent: sanitizedHTML,
        textContent: textContent || null,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json({ template }, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/email-templates failed:', err)
    if (err?.code === 'P2002') {
      return NextResponse.json({ 
        error: 'A template with this type already exists' 
      }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
