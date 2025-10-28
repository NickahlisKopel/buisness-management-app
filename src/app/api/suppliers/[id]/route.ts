import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isValidStateCode, isValidZipCode, normalizeStateCode } from "@/lib/utils"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await context.params

    const supplier = await prisma.supplier.findFirst({
      where: { id, organizationId: session.user.organizationId },
    })
    if (!supplier) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(supplier)
  } catch (err) {
    console.error('GET /api/suppliers/[id] failed:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await context.params
    const body = await req.json()
    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      contactPerson,
      supplierType,
      specialties,
      notes,
      isActive,
    } = body || {}

    // Ensure supplier belongs to org
    const existing = await prisma.supplier.findFirst({ where: { id, organizationId: session.user.organizationId } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Validate optional fields if present
    if (state !== undefined && state !== null && state !== "") {
      if (!isValidStateCode(state)) return NextResponse.json({ error: 'State must be 2-letter code (e.g., CA)' }, { status: 400 })
    }
    if (zipCode !== undefined && zipCode !== null && zipCode !== "") {
      if (!isValidZipCode(zipCode)) return NextResponse.json({ error: 'ZIP must be 12345 or 12345-6789' }, { status: 400 })
    }

    const updated = await prisma.supplier.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state: state ? normalizeStateCode(state) : null }),
        ...(zipCode !== undefined && { zipCode }),
        ...(contactPerson !== undefined && { contactPerson }),
        ...(supplierType !== undefined && { supplierType }),
        ...(specialties !== undefined && { specialties }),
        ...(notes !== undefined && { notes }),
        ...(isActive !== undefined && { isActive: !!isActive }),
      }
    })

    return NextResponse.json({ supplier: updated })
  } catch (err) {
    console.error('PUT /api/suppliers/[id] failed:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
