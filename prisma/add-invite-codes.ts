import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

async function addInviteCodesToOrganizations() {
  console.log('Adding invite codes to organizations without them...')

  const organizations = await prisma.organization.findMany({
    where: {
      inviteCode: null
    } as any
  })

  console.log(`Found ${organizations.length} organizations without invite codes`)

  for (const org of organizations) {
    let inviteCode: string
    let isUnique = false

    // Generate unique invite code
    while (!isUnique) {
      inviteCode = generateInviteCode()
      const existing = await prisma.organization.findUnique({
        where: { inviteCode } as any
      })
      if (!existing) {
        isUnique = true
        await prisma.organization.update({
          where: { id: org.id },
          data: { inviteCode } as any
        })
        console.log(`✓ Added invite code ${inviteCode} to organization: ${org.name}`)
      }
    }
  }

  console.log('Done!')
}

addInviteCodesToOrganizations()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
