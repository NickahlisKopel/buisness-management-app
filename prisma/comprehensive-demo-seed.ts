import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting comprehensive demo seeding...')

  // Create demo organization first
  const organization = await prisma.organization.upsert({
    where: { id: 'demo-org-id' },
    update: {},
    create: {
      id: 'demo-org-id',
      name: 'Peaceful Memorial Services',
      email: 'info@peacefulmemorial.com',
      phone: '(555) 123-4567',
      address: '100 Memorial Avenue',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      isActive: true
    }
  })

  console.log('✅ Organization created:', organization.name)

  // Create demo users with organization relationship
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@peacefulmemorial.com' },
    update: {},
    create: {
      email: 'admin@peacefulmemorial.com',
      name: 'Sarah Thompson',
      password: hashedPassword,
      role: 'ADMIN',
      organizationId: organization.id
    }
  })

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@peacefulmemorial.com' },
    update: {},
    create: {
      email: 'manager@peacefulmemorial.com',
      name: 'Michael Davis',
      password: hashedPassword,
      role: 'MANAGER',
      organizationId: organization.id
    }
  })

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@peacefulmemorial.com' },
    update: {},
    create: {
      email: 'staff@peacefulmemorial.com',
      name: 'Jennifer Wilson',
      password: hashedPassword,
      role: 'USER',
      organizationId: organization.id
    }
  })

  console.log('✅ Demo users created')

  // Create funeral homes
  const funeralHome1 = await prisma.funeralHome.upsert({
    where: { id: 'fh-1' },
    update: {},
    create: {
      id: 'fh-1',
      name: 'Peaceful Gardens Funeral Home',
      address: '123 Memorial Drive',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      phone: '(217) 555-0123',
      email: 'info@peacefulgardens.com',
      director: 'John Smith',
      capacity: 150,
      organizationId: organization.id
    }
  })

  const funeralHome2 = await prisma.funeralHome.upsert({
    where: { id: 'fh-2' },
    update: {},
    create: {
      id: 'fh-2',
      name: 'Eternal Rest Chapel',
      address: '456 Serenity Lane',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62702',
      phone: '(217) 555-0456',
      email: 'contact@eternalrest.com',
      director: 'Mary Johnson',
      capacity: 200,
      organizationId: organization.id
    }
  })

  console.log('✅ Funeral homes created')

  // Create suppliers
  const supplier1 = await prisma.supplier.upsert({
    where: { id: 'supplier-1' },
    update: {},
    create: {
      id: 'supplier-1',
      name: 'Springfield Floral Designs',
      email: 'orders@springfieldfloral.com',
      phone: '(217) 555-7890',
      address: '789 Garden Street',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62703',
      contactPerson: 'Lisa Williams',
      supplierType: 'Florist',
      specialties: 'Funeral arrangements, casket sprays, sympathy flowers',
      notes: 'Excellent quality, reliable delivery',
      organizationId: organization.id
    }
  })

  const supplier2 = await prisma.supplier.upsert({
    where: { id: 'supplier-2' },
    update: {},
    create: {
      id: 'supplier-2',
      name: 'Memorial Monuments Inc',
      email: 'info@memorialmonuments.com',
      phone: '(217) 555-2468',
      address: '321 Stone Avenue',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62704',
      contactPerson: 'Robert Brown',
      supplierType: 'Monument Supplier',
      specialties: 'Headstones, monuments, memorial plaques',
      notes: 'Custom engraving services available',
      organizationId: organization.id
    }
  })

  const supplier3 = await prisma.supplier.upsert({
    where: { id: 'supplier-3' },
    update: {},
    create: {
      id: 'supplier-3',
      name: 'Comfort Catering Services',
      email: 'bookings@comfortcatering.com',
      phone: '(217) 555-1357',
      address: '654 Culinary Way',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62705',
      contactPerson: 'Chef Amanda Garcia',
      supplierType: 'Caterer',
      specialties: 'Memorial luncheons, reception catering',
      notes: 'Specializes in comfort food for grieving families',
      organizationId: organization.id
    }
  })

  console.log('✅ Suppliers created')

  // Create products
  const products = [
    {
      id: 'prod-1',
      name: 'Elegant Oak Casket',
      sku: 'OAK-001',
      description: 'Premium solid oak casket with satin interior',
      category: 'Caskets',
      price: 3500.00,
      cost: 1800.00,
      inventory: 5,
      minStock: 2
    },
    {
      id: 'prod-2',
      name: 'Mahogany Premium Casket',
      sku: 'MAH-001',
      description: 'Handcrafted mahogany casket with gold hardware',
      category: 'Caskets',
      price: 5200.00,
      cost: 2600.00,
      inventory: 3,
      minStock: 1
    },
    {
      id: 'prod-3',
      name: 'Maple Cremation Urn',
      sku: 'URN-MAP-001',
      description: 'Beautiful maple wood cremation urn',
      category: 'Urns',
      price: 285.00,
      cost: 150.00,
      inventory: 15,
      minStock: 5
    },
    {
      id: 'prod-4',
      name: 'Memorial Guest Book',
      sku: 'BOOK-001',
      description: 'Leather-bound memorial guest book',
      category: 'Memorial Items',
      price: 75.00,
      cost: 35.00,
      inventory: 25,
      minStock: 10
    },
    {
      id: 'prod-5',
      name: 'Sympathy Flower Arrangement',
      sku: 'FLOWER-SYM-001',
      description: 'Beautiful sympathy flower arrangement',
      category: 'Flowers',
      price: 125.00,
      cost: 60.00,
      inventory: 0,
      minStock: 0
    }
  ]

  for (const product of products) {
    await prisma.funeralProduct.upsert({
      where: { id: product.id },
      update: {},
      create: {
        ...product,
        organizationId: organization.id
      }
    })
  }

  console.log('✅ Products created')

  // Create sample ceremonies
  const ceremonies = [
    {
      id: 'ceremony-1',
      ceremonyNumber: 'CER-0001',
      deceasedName: 'Robert Anderson',
      familyContact: 'Margaret Anderson - (217) 555-3333',
      ceremonyDate: new Date('2024-12-15T14:00:00'),
      ceremonyType: 'Funeral Service',
      status: 'CONFIRMED' as const,
      notes: 'Traditional service with burial following',
      funeralHomeId: funeralHome1.id
    },
    {
      id: 'ceremony-2',
      ceremonyNumber: 'CER-0002',
      deceasedName: 'Helen Mitchell',
      familyContact: 'David Mitchell - (217) 555-4444',
      ceremonyDate: new Date('2024-12-18T11:00:00'),
      ceremonyType: 'Memorial Service',
      status: 'PLANNING' as const,
      notes: 'Celebration of life, cremation service',
      funeralHomeId: funeralHome2.id
    },
    {
      id: 'ceremony-3',
      ceremonyNumber: 'CER-0003',
      deceasedName: 'James Wilson',
      familyContact: 'Patricia Wilson - (217) 555-5555',
      ceremonyDate: new Date('2024-12-20T15:30:00'),
      ceremonyType: 'Graveside Service',
      status: 'CONFIRMED' as const,
      notes: 'Small family gathering at Oak Hill Cemetery',
      funeralHomeId: funeralHome1.id
    }
  ]

  for (const ceremony of ceremonies) {
    await prisma.ceremony.upsert({
      where: { id: ceremony.id },
      update: {},
      create: ceremony
    })
  }

  console.log('✅ Sample ceremonies created')

  // Create sample orders
  const order1 = await prisma.order.upsert({
    where: { id: 'order-1' },
    update: {},
    create: {
      id: 'order-1',
      orderNumber: 'ORD-0001',
      funeralHomeId: funeralHome1.id,
      supplierId: supplier1.id,
      status: 'SENT' as const,
      total: 200.00,
      notes: 'Flowers for Anderson funeral service',
      organizationId: organization.id,
      orderItems: {
        create: [
          {
            productId: products[4].id, // Sympathy Flower Arrangement
            quantity: 1,
            unitPrice: 125.00,
            total: 125.00
          },
          {
            productId: products[3].id, // Memorial Guest Book
            quantity: 1,
            unitPrice: 75.00,
            total: 75.00
          }
        ]
      }
    }
  })

  console.log('✅ Sample orders created')

  // Create supplier-product relationships
  await prisma.supplierProduct.upsert({
    where: { id: 'sp-1' },
    update: {},
    create: {
      id: 'sp-1',
      supplierId: supplier1.id,
      productId: products[4].id, // Sympathy Flower Arrangement
      supplierSku: 'SFA-125',
      price: 125.00
    }
  })

  await prisma.supplierProduct.upsert({
    where: { id: 'sp-2' },
    update: {},
    create: {
      id: 'sp-2',
      supplierId: supplier2.id,
      productId: products[0].id, // Oak Casket
      supplierSku: 'OAK-PREMIUM',
      price: 3500.00
    }
  })

  console.log('✅ Supplier-product relationships created')

  console.log('🎉 Demo seeding completed successfully!')
  console.log('\nDemo Account Credentials:')
  console.log('👤 Admin: admin@peacefulmemorial.com / password123')
  console.log('👤 Manager: manager@peacefulmemorial.com / password123')
  console.log('👤 Staff: staff@peacefulmemorial.com / password123')
  console.log('\n🏢 Organization: Peaceful Memorial Services')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })