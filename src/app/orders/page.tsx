import { prisma } from "@/lib/prisma"
import { Header } from "@/components/layout/header"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { SendEmailButton } from "@/components/orders/send-email-button"
import { ShoppingCart, Plus, Mail, Store, Users } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

async function getOrders(organizationId: string) {
  return await prisma.order.findMany({
    where: { organizationId },
    include: {
      funeralHome: true,
      supplier: true,
      orderItems: {
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

type OrderWithIncludes = Awaited<ReturnType<typeof getOrders>>[0];

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-yellow-100 text-yellow-800',
  RECEIVED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/auth/signin")
  }

  const orders = await getOrders(session.user.organizationId)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Manage your orders and track their status
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/orders/new">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Create Order</span>
              <span className="sm:hidden">New Order</span>
            </Link>
          </Button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900">No orders</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Get started by creating your first order.
            </p>
            <div className="mt-6">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/orders/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Order
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Funeral Home
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Supplier
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Items
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order: OrderWithIncludes) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-orange-100 rounded-lg p-1.5 sm:p-2 mr-2 sm:mr-3">
                            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-medium text-gray-900">
                              {order.orderNumber}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="flex items-center text-xs sm:text-sm text-gray-900">
                          <Store className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          {order.funeralHome.name}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="flex items-center text-xs sm:text-sm text-gray-900">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          {order.supplier.name}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                        {order.orderItems.length} items
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                        {order.emailSent && (
                          <div className="flex items-center mt-1">
                            <Mail className="h-3 w-3 text-green-500 mr-1" />
                            <span className="text-xs text-green-600 hidden sm:inline">Email sent</span>
                            <span className="text-xs text-green-600 sm:hidden">Sent</span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <div className="flex flex-col space-y-1.5 sm:space-y-2">
                          <div className="flex space-x-1.5 sm:space-x-2">
                            <Button variant="outline" size="sm" asChild className="text-xs px-2 py-1">
                              <Link href={`/orders/${order.id}`}>
                                View
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild className="text-xs px-2 py-1">
                              <Link href={`/orders/${order.id}/edit`}>
                                Edit
                              </Link>
                            </Button>
                          </div>
                          {order.status === 'DRAFT' && (
                            <SendEmailButton
                              orderId={order.id}
                              orderNumber={order.orderNumber}
                              supplierName={order.supplier.name}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
