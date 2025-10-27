import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const funeralHomes = await prisma.funeralHome.findMany({
      where: {
        organizationId: session.user.organizationId,
        isActive: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(funeralHomes)
  } catch (error) {
    console.error('Error fetching funeral homes:', error)
    return NextResponse.json({ error: 'Failed to fetch funeral homes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      address,
      city,
      state,
      zipCode,
      phone,
      email,
      director,
      capacity,
      isActive,
    } = body

    // Validate required fields
    if (!name || !address || !city || !state || !zipCode) {
      return NextResponse.json(
        { error: 'Missing required fields: name, address, city, state, and zipCode are required' },
        { status: 400 }
      )
    }

    // Create the funeral home
    const funeralHome = await prisma.funeralHome.create({
      data: {
        name,
        address,
        city,
        state,
        zipCode,
        phone: phone || null,
        email: email || null,
        director: director || null,
        capacity: capacity || null,
        isActive: isActive !== undefined ? isActive : true,
        organizationId: session.user.organizationId,
      },
    })

    return NextResponse.json(funeralHome, { status: 201 })
  } catch (error) {
    console.error('Error creating funeral home:', error)
    return NextResponse.json(
      { error: 'Failed to create funeral home' },
      { status: 500 }
    )
  }
}