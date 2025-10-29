import { prisma } from "@/lib/prisma"
import { Header } from "@/components/layout/header"
import { QuickOrder } from "@/components/orders/quick-order"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { 
  Store, 
  Package, 
  Users, 
  ShoppingCart,
  TrendingUp,
  DollarSign
} from "lucide-react"

async function getDashboardData(organizationId: string) {
  const [
    storeCount,
    productCount,
    supplierCount,
    orderCount,
    totalOrders,
    lowStockProducts,
    stores,
    suppliers
  ] = await Promise.all([
    prisma.funeralHome.count({ where: { isActive: true, organizationId } }),
    prisma.funeralProduct.count({ where: { isActive: true, organizationId } }),
    prisma.supplier.count({ where: { isActive: true, organizationId } }),
    prisma.order.count({ where: { organizationId } }),
    prisma.order.aggregate({
      where: { organizationId },
      _sum: { total: true },
      _avg: { total: true }
    }),
    prisma.funeralProduct.findMany({
      where: {
        isActive: true,
        organizationId,
        inventory: { lte: prisma.funeralProduct.fields.minStock }
      },
      select: {
        name: true,
        inventory: true,
        minStock: true
      }
    }),
    prisma.funeralHome.findMany({
      where: { isActive: true, organizationId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    }),
    prisma.supplier.findMany({
      where: { isActive: true, organizationId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
  ])

  return {
    storeCount,
    productCount,
    supplierCount,
    orderCount,
    totalRevenue: totalOrders._sum.total || 0,
    averageOrderValue: totalOrders._avg.total || 0,
    lowStockProducts,
    stores,
    suppliers
  }
}

export default async function Dashboard() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/auth/signin")
  }

  const data = await getDashboardData(session.user.organizationId)

  // Check if this is a new organization with no data
  const isNewOrganization = data.storeCount === 0 && data.productCount === 0 && data.supplierCount === 0 && data.orderCount === 0

  const stats = [
    {
      name: 'Funeral Homes',
      value: data.storeCount,
      icon: Store,
      color: 'bg-blue-500'
    },
    {
      name: 'Products',
      value: data.productCount,
      icon: Package,
      color: 'bg-green-500'
    },
    {
      name: 'Suppliers',
      value: data.supplierCount,
      icon: Users,
      color: 'bg-purple-500'
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            {isNewOrganization ? `Welcome, ${session.user.name || session.user.email}!` : 'Overview of your business operations'}
          </p>
        </div>

        {/* Welcome Message for New Organizations */}
        {isNewOrganization && (
          <div className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 sm:p-8 text-white">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">🎉 Welcome to Your Business Management System!</h2>
            <p className="text-base sm:text-lg mb-4 sm:mb-6">
              Get started by setting up your organization. Follow these steps to begin:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                <div className="flex items-center mb-2">
                  <span className="bg-white text-blue-600 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-bold mr-2 sm:mr-3 text-sm sm:text-base">1</span>
                  <h3 className="font-semibold text-sm sm:text-base">Add Funeral Homes</h3>
                </div>
                <p className="text-xs sm:text-sm text-blue-100">Set up your funeral home locations</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                <div className="flex items-center mb-2">
                  <span className="bg-white text-blue-600 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-bold mr-2 sm:mr-3 text-sm sm:text-base">2</span>
                  <h3 className="font-semibold text-sm sm:text-base">Add Suppliers</h3>
                </div>
                <p className="text-xs sm:text-sm text-blue-100">Connect with your suppliers</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                <div className="flex items-center mb-2">
                  <span className="bg-white text-blue-600 rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-bold mr-2 sm:mr-3 text-sm sm:text-base">3</span>
                  <h3 className="font-semibold text-sm sm:text-base">Add Products</h3>
                </div>
                <p className="text-xs sm:text-sm text-blue-100">Build your product catalog</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-2 sm:p-3`}>
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Stats - Only show if there are orders */}
        {!isNewOrganization && data.orderCount > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center">
                <div className="bg-orange-500 rounded-lg p-2 sm:p-3">
                  <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{data.orderCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center">
                <div className="bg-green-500 rounded-lg p-2 sm:p-3">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    ${data.totalRevenue.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center">
                <div className="bg-blue-500 rounded-lg p-2 sm:p-3">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Average Order Value</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    ${data.averageOrderValue.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Low Stock Alert */}
        {data.lowStockProducts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              ⚠️ Low Stock Alert
            </h3>
            <div className="space-y-3">
              {data.lowStockProducts.map((product, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200 gap-2">
                  <div>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">{product.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Current: {product.inventory} | Minimum: {product.minStock}
                    </p>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-yellow-800">
                    Reorder needed
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Order - Only show if there are stores and suppliers */}
        {!isNewOrganization && data.stores.length > 0 && data.suppliers.length > 0 && (
          <div className="mt-8">
            <QuickOrder stores={data.stores} suppliers={data.suppliers} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            {isNewOrganization ? 'Get Started' : 'Quick Actions'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <a
              href="/funeral-homes"
              className="flex items-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Store className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">
                {data.storeCount === 0 ? 'Add Funeral Home' : 'Manage Funeral Homes'}
              </span>
            </a>
            <a
              href="/suppliers"
              className="flex items-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">
                {data.supplierCount === 0 ? 'Add Suppliers' : 'Manage Suppliers'}
              </span>
            </a>
            <a
              href="/products"
              className="flex items-center p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
              <span className="font-medium text-sm sm:text-base">
                {data.productCount === 0 ? 'Add Products' : 'Manage Products'}
              </span>
            </a>
          </div>
        </div>
        </main>
      </div>
  )
}
