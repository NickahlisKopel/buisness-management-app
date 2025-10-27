import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const funeralHome = await prisma.funeralHome.findUnique({
      where: {
        id,
      },
    })

    if (!funeralHome) {
      return NextResponse.json({ error: 'Funeral home not found' }, { status: 404 })
    }

    // Verify the funeral home belongs to the user's organization
    if (funeralHome.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(funeralHome)
  } catch (error) {
    console.error('Error fetching funeral home:', error)
    return NextResponse.json({ error: 'Failed to fetch funeral home' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    // Check if funeral home exists and belongs to user's organization
    const existingFuneralHome = await prisma.funeralHome.findUnique({
      where: { id },
    })

    if (!existingFuneralHome) {
      return NextResponse.json({ error: 'Funeral home not found' }, { status: 404 })
    }

    if (existingFuneralHome.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
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

    // Update the funeral home
    const funeralHome = await prisma.funeralHome.update({
      where: { id },
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
      },
    })

    return NextResponse.json(funeralHome)
  } catch (error) {
    console.error('Error updating funeral home:', error)
    return NextResponse.json(
      { error: 'Failed to update funeral home' },
      { status: 500 }
    )
  }
}
