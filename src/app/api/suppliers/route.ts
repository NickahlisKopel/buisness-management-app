import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isValidStateCode, isValidZipCode, normalizeStateCode } from "@/lib/utils"

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const suppliers = await prisma.supplier.findMany({
      where: { 
        isActive: true,
        organizationId: session.user.organizationId
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        contactPerson: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(suppliers)
  } catch (error) {
    console.error("Error fetching suppliers:", error)
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
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      contactPerson,
      supplierType,
      specialties,
      notes
    } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      )
    }

    // Check if supplier with this email already exists in this organization
    const existingSupplier = await prisma.supplier.findFirst({
      where: { 
        email: email,
        organizationId: session.user.organizationId
      }
    })

    if (existingSupplier) {
      return NextResponse.json(
        { error: "A supplier with this email already exists" },
        { status: 400 }
      )
    }

    // Optional address validation if provided
    if (state && !isValidStateCode(state)) {
      return NextResponse.json({ error: "State must be 2-letter code (e.g., CA)" }, { status: 400 })
    }
    if (zipCode && !isValidZipCode(zipCode)) {
      return NextResponse.json({ error: "ZIP must be 12345 or 12345-6789" }, { status: 400 })
    }
    const supplier = await prisma.supplier.create({
      data: {
        name,
        email,
        phone,
        address,
        city,
        state: state ? normalizeStateCode(state)! : null,
        zipCode,
        contactPerson,
        supplierType,
        specialties,
        notes,
        organizationId: session.user.organizationId,
        isActive: true
      }
    })

    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    console.error("Error creating supplier:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}