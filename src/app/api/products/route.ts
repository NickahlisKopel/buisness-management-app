import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const products = await prisma.funeralProduct.findMany({
      where: { 
        isActive: true,
        organizationId: session.user.organizationId
      },
      select: {
        id: true,
        name: true,
        sku: true,
        description: true,
        category: true,
        price: true,
        cost: true,
        inventory: true,
        minStock: true,
        isActive: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name, 
      sku, 
      description, 
      category, 
      price, 
      cost, 
      inventory, 
      minStock 
    } = body

    // Validate required fields
    if (!name || !sku || !category || price === undefined || cost === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if SKU already exists in this organization
    const existingProduct = await prisma.funeralProduct.findUnique({
      where: { 
        sku_organizationId: {
          sku: sku,
          organizationId: session.user.organizationId
        }
      }
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: "Product with this SKU already exists" },
        { status: 400 }
      )
    }

    const product = await prisma.funeralProduct.create({
      data: {
        name,
        sku,
        description: description || null,
        category,
        price: parseFloat(price),
        cost: parseFloat(cost),
        inventory: inventory ? parseInt(inventory) : 0,
        minStock: minStock ? parseInt(minStock) : 0,
        isActive: true,
        organizationId: session.user.organizationId
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
