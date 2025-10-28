import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendOrderEmail, sendOrderConfirmationEmail } from "@/lib/email"
import { checkRateLimit, getRateLimitIdentifier, rateLimitConfigs } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    // Apply API rate limiting for email sending
    const identifier = getRateLimitIdentifier(request)
    const rateLimitResult = checkRateLimit(identifier, rateLimitConfigs.api)
    
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
            'X-RateLimit-Limit': rateLimitConfigs.api.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimitResult.resetAt).toISOString()
          }
        }
      )
    }

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Get order with all details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        funeralHome: true,
        supplier: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if email was already sent
    if (order.emailSent) {
      return NextResponse.json({ error: "Email already sent for this order" }, { status: 400 })
    }

    // Send email to supplier
    const emailSent = await sendOrderEmail(order)
    
    if (!emailSent) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'SENT',
        emailSent: true,
        emailSentAt: new Date()
      }
    })

    // Send confirmation email to store
    await sendOrderConfirmationEmail(order)

    return NextResponse.json({ 
      message: "Order email sent successfully",
      orderId: order.id,
      emailSent: true
    })

  } catch (error) {
    console.error("Error sending order email:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
