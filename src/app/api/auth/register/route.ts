import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, accountType, organizationName, inviteCode } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Validate account type specific fields
    if (accountType === "create" && !organizationName?.trim()) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      )
    }

    if (accountType === "join" && !inviteCode?.trim()) {
      return NextResponse.json(
        { error: "Invite code is required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    let user

    if (accountType === "join") {
      // Find organization by invite code
      const organization = await prisma.organization.findUnique({
        where: { inviteCode: inviteCode.toUpperCase() } as any
      })

      if (!organization) {
        return NextResponse.json(
          { error: "Invalid invite code" },
          { status: 400 }
        )
      }

      // Create user and add to existing organization
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "USER", // Joining users start as regular users
          organizationId: organization.id
        }
      })
    } else {
      // Create organization and user in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Generate unique invite code
        let newInviteCode: string
        let isUnique = false
        
        while (!isUnique) {
          newInviteCode = generateInviteCode()
          const existing = await tx.organization.findUnique({
            where: { inviteCode: newInviteCode } as any
          })
          if (!existing) {
            isUnique = true
            
            // Create organization for the new user
            const organization = await tx.organization.create({
              data: {
                name: organizationName,
                inviteCode: newInviteCode,
                isActive: true
              } as any
            })

            // Create user with organization relationship
            const newUser = await tx.user.create({
              data: {
                name,
                email,
                password: hashedPassword,
                role: "ADMIN", // Organization creator becomes admin
                organizationId: organization.id
              }
            })

            return { user: newUser, organization }
          }
        }
        
        throw new Error("Failed to generate unique invite code")
      })

      user = result.user
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { message: "User created successfully", user: userWithoutPassword },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
