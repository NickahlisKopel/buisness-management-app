import { prisma } from "@/lib/prisma"
import { Header } from "@/components/layout/header"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { SendEmailButton } from "@/components/orders/send-email-button"
import { 
  ArrowLeft, 
  ShoppingCart, 
  Store, 
  Users, 
  Calendar,
  Mail,
  Edit,
  Trash2,
  Package,
  DollarSign
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface OrderDetailPageProps {
  params: {
    id: string
  }
}

async function getOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      funeralHome: true,
      supplier: true,
      ceremony: true,
      orderItems: {
        include: {
          product: true
        }
      }
    }
  })

  if (!order) {
    notFound()
  }

  return order
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-yellow-100 text-yellow-800',
  RECEIVED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const order = await getOrder(id)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Button variant="outline" size="sm" asChild className="mr-4">
                <Link href="/orders">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Orders
                </Link>
              </Button>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
                <p className="mt-2 text-gray-600">
                  Order #{order.orderNumber}
                </p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" asChild>
                  <Link href={`/orders/${order.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Order
                  </Link>
                </Button>
                {order.status === 'DRAFT' && (
                  <SendEmailButton
                    orderId={order.id}
                    orderNumber={order.orderNumber}
                    supplierName={order.supplier.name}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
                </div>
                <div className="overflow-x-auto">
                  {order.orderItems.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <Package className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No items</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        This order doesn't have any items yet.
                      </p>
                      <div className="mt-6">
                        <Button asChild>
                          <Link href={`/orders/${order.id}/edit`}>
                            <Package className="h-4 w-4 mr-2" />
                            Add Items
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {order.orderItems.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="bg-blue-100 rounded-lg p-2 mr-3">
                                  <Package className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.product.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    SKU: {item.product.sku}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${item.unitPrice.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${item.total.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Status */}
              <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  {order.emailSent && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Email Sent</span>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">Yes</span>
                      </div>
                    </div>
                  )}
                  {order.emailSentAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Sent At</span>
                      <span className="text-sm text-gray-900">
                        {new Date(order.emailSentAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Information */}
              <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Order Number</span>
                    <p className="text-sm text-gray-900">{order.orderNumber}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Created</span>
                    <p className="text-sm text-gray-900">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Last Updated</span>
                    <p className="text-sm text-gray-900">
                      {new Date(order.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Funeral Home */}
              <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Funeral Home</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Store className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{order.funeralHome.name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{order.funeralHome.address}</p>
                    <p>{order.funeralHome.city}, {order.funeralHome.state} {order.funeralHome.zipCode}</p>
                    {order.funeralHome.phone && (
                      <p>Phone: {order.funeralHome.phone}</p>
                    )}
                    {order.funeralHome.email && (
                      <p>Email: {order.funeralHome.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Supplier */}
              <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{order.supplier.name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>Email: {order.supplier.email}</p>
                    {order.supplier.phone && (
                      <p>Phone: {order.supplier.phone}</p>
                    )}
                    {order.supplier.address && (
                      <p>Address: {order.supplier.address}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Ceremony */}
              {order.ceremony && (
                <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ceremony</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{order.ceremony.ceremonyNumber}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Deceased: {order.ceremony.deceasedName}</p>
                      <p>Date: {new Date(order.ceremony.ceremonyDate).toLocaleDateString()}</p>
                      <p>Type: {order.ceremony.ceremonyType}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Total */}
              <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Total</h3>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    ${order.total.toFixed(2)}
                  </span>
                  <DollarSign className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
