import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Link a product to a supplier (or update mapping)
// Body: { productId: string, supplierId: string, price?: number, supplierSku?: string }
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orgId = session.user.organizationId
    const { productId, supplierId, price, supplierSku } = await request.json()

    if (!productId || !supplierId) {
      return NextResponse.json({ error: "productId and supplierId are required" }, { status: 400 })
    }

    // Validate product belongs to the org
    const product = await prisma.funeralProduct.findFirst({ where: { id: productId, organizationId: orgId } })
    if (!product) {
      return NextResponse.json({ error: "Product not found in your organization" }, { status: 404 })
    }

    // Validate supplier belongs to the org
    const supplier = await prisma.supplier.findFirst({ where: { id: supplierId, organizationId: orgId, isActive: true } })
    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found in your organization" }, { status: 404 })
    }

    const finalPrice = typeof price === 'number' && !Number.isNaN(price) ? price : product.price
    if (finalPrice < 0) {
      return NextResponse.json({ error: "price must be >= 0" }, { status: 400 })
    }

    // Upsert mapping so it works for both create and update
    const mapping = await prisma.supplierProduct.upsert({
      where: { supplierId_productId: { supplierId, productId } },
      create: {
        supplierId,
        productId,
        supplierSku: supplierSku ?? product.sku,
        price: finalPrice,
      },
      update: {
        supplierSku: supplierSku ?? product.sku,
        price: finalPrice,
        isActive: true,
      }
    })

    return NextResponse.json({ mapping })
  } catch (error) {
    console.error("Error linking product to supplier:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
