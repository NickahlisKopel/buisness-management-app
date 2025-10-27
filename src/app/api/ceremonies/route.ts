import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateCeremonyData } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ceremonies = await prisma.ceremony.findMany({
      where: {
        funeralHome: {
          organizationId: session.user.organizationId
        }
      },
      include: {
        funeralHome: {
          select: {
            name: true
          }
        }
      },
      orderBy: { ceremonyDate: 'desc' }
    })

    return NextResponse.json(ceremonies)
  } catch (error) {
    console.error('Error fetching ceremonies:', error)
    return NextResponse.json({ error: 'Failed to fetch ceremonies' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data: CreateCeremonyData = await request.json()

    // Validate that the funeral home belongs to the user's organization
    const funeralHome = await prisma.funeralHome.findFirst({
      where: {
        id: data.funeralHomeId,
        organizationId: session.user.organizationId
      }
    })

    if (!funeralHome) {
      return NextResponse.json({ error: 'Funeral home not found' }, { status: 404 })
    }

    // Generate a unique ceremony number
    const ceremonyCount = await prisma.ceremony.count()
    const ceremonyNumber = `CER-${String(ceremonyCount + 1).padStart(4, '0')}`

    const ceremony = await prisma.ceremony.create({
      data: {
        ceremonyNumber,
        funeralHomeId: data.funeralHomeId,
        deceasedName: data.deceasedName,
        familyContact: data.familyContact,
        ceremonyDate: new Date(data.ceremonyDate),
        ceremonyType: data.ceremonyType,
        status: data.status || 'PLANNING',
        notes: data.notes
      },
      include: {
        funeralHome: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(ceremony, { status: 201 })
  } catch (error) {
    console.error('Error creating ceremony:', error)
    return NextResponse.json({ error: 'Failed to create ceremony' }, { status: 500 })
  }
}