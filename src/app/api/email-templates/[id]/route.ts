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

// GET a specific template
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const template = await (prisma as any).emailTemplate.findUnique({
      where: { id }
    })

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Ensure user can only access their org's templates
    if (template.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ template })
  } catch (err) {
    console.error('GET /api/email-templates/[id] failed:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT update a template
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params
    const template = await (prisma as any).emailTemplate.findUnique({
      where: { id }
    })

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    if (template.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { name, subject, htmlContent, textContent, isActive } = body

    // Sanitize HTML content if provided
    const sanitizedHTML = htmlContent ? sanitizeHTML(htmlContent) : undefined

    const updated = await (prisma as any).emailTemplate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(subject && { subject }),
        ...(sanitizedHTML && { htmlContent: sanitizedHTML }),
        ...(textContent !== undefined && { textContent }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json({ template: updated })
  } catch (err) {
    console.error('PUT /api/email-templates/[id] failed:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE a template
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params
    const template = await (prisma as any).emailTemplate.findUnique({
      where: { id }
    })

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    if (template.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await (prisma as any).emailTemplate.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/email-templates/[id] failed:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
