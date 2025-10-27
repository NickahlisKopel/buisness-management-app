import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateOrderNumber } from "@/lib/utils"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { funeralHomeId, supplierId, notes, status = 'DRAFT', orderItems = [] } = await request.json()

    if (!funeralHomeId || !supplierId) {
      return NextResponse.json(
        { error: "Funeral Home ID and Supplier ID are required" },
        { status: 400 }
      )
    }

    // Generate unique order number
    const orderNumber = generateOrderNumber()

    // Calculate total from order items
    const total = orderItems.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        funeralHomeId,
        supplierId,
        status,
        total,
        notes,
        organizationId: session.user.organizationId,
        orderItems: {
          create: orderItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice
          }))
        }
      },
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

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: {
        organizationId: session.user.organizationId
      },
      include: {
        funeralHome: true,
        supplier: true,
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
