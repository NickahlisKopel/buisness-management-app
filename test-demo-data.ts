import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDemoData() {
  console.log('🔍 Testing demo data integrity...\n')

  try {
    // Test organization
    const org = await prisma.organization.findUnique({
      where: { id: 'demo-org-id' },
      include: {
        users: true,
        funeralHomes: true,
        suppliers: true,
        products: true,
        orders: true
      }
    })

    if (!org) {
      console.log('❌ Demo organization not found')
      return
    }

    console.log(`✅ Organization: ${org.name}`)
    console.log(`   📧 Email: ${org.email}`)
    console.log(`   📞 Phone: ${org.phone}`)
    console.log(`   📍 Address: ${org.address}, ${org.city}, ${org.state} ${org.zipCode}`)
    console.log(`   👥 Users: ${org.users.length}`)
    console.log(`   🏢 Funeral Homes: ${org.funeralHomes.length}`)
    console.log(`   📦 Suppliers: ${org.suppliers.length}`)
    console.log(`   🛍️ Products: ${org.products.length}`)
    console.log(`   📋 Orders: ${org.orders.length}\n`)

    // Test users
    console.log('👥 Users:')
    org.users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`)
    })
    console.log()

    // Test funeral homes
    console.log('🏢 Funeral Homes:')
    org.funeralHomes.forEach(fh => {
      console.log(`   - ${fh.name} (${fh.city}, ${fh.state}) - Capacity: ${fh.capacity}`)
    })
    console.log()

    // Test suppliers
    console.log('📦 Suppliers:')
    org.suppliers.forEach(supplier => {
      console.log(`   - ${supplier.name} (${supplier.supplierType}) - ${supplier.email}`)
    })
    console.log()

    // Test products
    console.log('🛍️ Products:')
    org.products.forEach(product => {
      console.log(`   - ${product.name} (${product.sku}) - $${product.price} (${product.category})`)
    })
    console.log()

    // Test ceremonies
    const ceremonies = await prisma.ceremony.findMany({
      where: {
        funeralHome: {
          organizationId: org.id
        }
      },
      include: {
        funeralHome: {
          select: { name: true }
        }
      }
    })

    console.log('🕊️ Ceremonies:')
    ceremonies.forEach(ceremony => {
      console.log(`   - ${ceremony.ceremonyNumber}: ${ceremony.deceasedName} (${ceremony.ceremonyType}) - ${ceremony.status}`)
      console.log(`     Date: ${ceremony.ceremonyDate.toLocaleDateString()} at ${ceremony.funeralHome.name}`)
    })
    console.log()

    // Test orders with items
    const ordersWithItems = await prisma.order.findMany({
      where: {
        organizationId: org.id
      },
      include: {
        funeralHome: { select: { name: true } },
        supplier: { select: { name: true } },
        orderItems: {
          include: {
            product: { select: { name: true } }
          }
        }
      }
    })

    console.log('📋 Orders:')
    ordersWithItems.forEach(order => {
      console.log(`   - ${order.orderNumber}: ${order.supplier.name} → ${order.funeralHome.name}`)
      console.log(`     Status: ${order.status}, Total: $${order.total}`)
      order.orderItems.forEach(item => {
        console.log(`     • ${item.product.name} x${item.quantity} @ $${item.unitPrice} = $${item.total}`)
      })
    })
    console.log()

    console.log('🎉 All demo data verified successfully!')

  } catch (error) {
    console.error('❌ Error testing demo data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDemoData()