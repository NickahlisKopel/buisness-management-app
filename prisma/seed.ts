import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create demo organizations
  const org1 = await prisma.organization.upsert({
    where: { id: 'org-1' },
    update: {},
    create: {
      id: 'org-1',
      name: 'Sunset Funeral Services',
      email: 'admin@sunsetfuneral.com',
      phone: '(555) 123-4567',
      address: '123 Main Street',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701'
    }
  })

  const org2 = await prisma.organization.upsert({
    where: { id: 'org-2' },
    update: {},
    create: {
      id: 'org-2',
      name: 'Memorial Gardens Funeral Home',
      email: 'info@memorialgardens.com',
      phone: '(555) 987-6543',
      address: '456 Oak Avenue',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601'
    }
  })

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@business.com' },
    update: {},
    create: {
      email: 'admin@business.com',
      name: 'System Admin',
      password: hashedPassword,
      role: 'ADMIN',
      organizationId: org1.id
    }
  })

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@business.com' },
    update: {},
    create: {
      email: 'manager@business.com',
      name: 'Manager User',
      password: hashedPassword,
      role: 'MANAGER',
      organizationId: org1.id
    }
  })

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@business.com' },
    update: {},
    create: {
      email: 'user@business.com',
      name: 'Regular User',
      password: hashedPassword,
      role: 'USER',
      organizationId: org1.id
    }
  })

  // Create users for second organization
  const org2Manager = await prisma.user.upsert({
    where: { email: 'manager@memorialgardens.com' },
    update: {},
    create: {
      email: 'manager@memorialgardens.com',
      name: 'Memorial Gardens Manager',
      password: hashedPassword,
      role: 'MANAGER',
      organizationId: org2.id
    }
  })

  const org2User = await prisma.user.upsert({
    where: { email: 'user@memorialgardens.com' },
    update: {},
    create: {
      email: 'user@memorialgardens.com',
      name: 'Memorial Gardens User',
      password: hashedPassword,
      role: 'USER',
      organizationId: org2.id
    }
  })

  console.log('✅ Multi-tenant system setup complete!')
  console.log(`🏢 Created ${2} organizations:`)
  console.log(`   - Sunset Funeral Services (org-1)`)
  console.log(`   - Memorial Gardens Funeral Home (org-2)`)
  console.log(`👤 Created ${5} demo users:`)
  console.log(`   - System Admin: admin@business.com / password123 (Sunset Funeral)`)
  console.log(`   - Manager: manager@business.com / password123 (Sunset Funeral)`)
  console.log(`   - User: user@business.com / password123 (Sunset Funeral)`)
  console.log(`   - Manager: manager@memorialgardens.com / password123 (Memorial Gardens)`)
  console.log(`   - User: user@memorialgardens.com / password123 (Memorial Gardens)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })