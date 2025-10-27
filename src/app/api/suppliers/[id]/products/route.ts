import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: supplierId } = await params

    // Get products available from this supplier
    const supplierProducts = await prisma.supplierProduct.findMany({
      where: {
        supplierId: supplierId,
        isActive: true
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            category: true,
            price: true,
            inventory: true,
            isActive: true
          }
        }
      }
    })

    // Filter out inactive products and format the response
    const products = supplierProducts
      .filter(sp => sp.product.isActive)
      .map(sp => ({
        id: sp.product.id,
        name: sp.product.name,
        sku: sp.product.sku,
        category: sp.product.category,
        price: sp.price, // Use supplier's price
        inventory: sp.product.inventory,
        supplierSku: sp.supplierSku
      }))

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching supplier products:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
