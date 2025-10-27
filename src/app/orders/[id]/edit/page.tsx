"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OrderGrid } from "@/components/orders/order-grid"
import { 
  ArrowLeft, 
  Save, 
  Send, 
  ShoppingCart,
  Store,
  Users,
  AlertCircle
} from "lucide-react"
import Link from "next/link"

interface Store {
  id: string
  name: string
}

interface Supplier {
  id: string
  name: string
  email: string
}

interface OrderItem {
  id: string
  productId: string
  productName: string
  productSku: string
  quantity: number
  unitPrice: number
  total: number
}

interface Order {
  id: string
  orderNumber: string
  funeralHomeId: string
  supplierId: string
  status: string
  total: number
  notes: string
  funeralHome: Store
  supplier: Supplier
  orderItems: OrderItem[]
}

export default function EditOrderPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  
  const [order, setOrder] = useState<Order | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedStore, setSelectedStore] = useState<string>("")
  const [selectedSupplier, setSelectedSupplier] = useState<string>("")
  const [notes, setNotes] = useState("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  // Load order data
  useEffect(() => {
    const loadOrderData = async () => {
      try {
        const [orderRes, storesRes, suppliersRes] = await Promise.all([
          fetch(`/api/orders/${orderId}`),
          fetch('/api/stores'),
          fetch('/api/suppliers')
        ])
        
        if (!orderRes.ok) {
          throw new Error('Order not found')
        }
        
        const orderData = await orderRes.json()
        const storesData = await storesRes.json()
        const suppliersData = await suppliersRes.json()
        
        setOrder(orderData)
        setStores(storesData)
        setSuppliers(suppliersData)
        setSelectedStore(orderData.funeralHomeId)
        setSelectedSupplier(orderData.supplierId)
        setNotes(orderData.notes || "")
        setOrderItems(orderData.orderItems || [])
      } catch (error) {
        console.error('Error loading order data:', error)
        setError('Failed to load order data')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadOrderData()
  }, [orderId])

  const handleSaveOrder = async () => {
    if (!selectedStore || !selectedSupplier) {
      alert('Please select both funeral home and supplier')
      return
    }

    setIsSaving(true)
    setError("")
    
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          funeralHomeId: selectedStore,
          supplierId: selectedSupplier,
          notes: notes,
          orderItems: orderItems
        }),
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        router.push(`/orders/${orderId}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to save order')
      }
    } catch (error) {
      console.error('Error saving order:', error)
      setError('Error saving order')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendOrder = async () => {
    if (!selectedStore || !selectedSupplier) {
      alert('Please select both funeral home and supplier')
      return
    }

    // First save the order
    await handleSaveOrder()
    
    // Then send the email
    try {
      const response = await fetch(`/api/orders/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId
        }),
      })

      if (response.ok) {
        router.push(`/orders/${orderId}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to send order')
      }
    } catch (error) {
      console.error('Error sending order:', error)
      setError('Error sending order')
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading order...</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !order) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
              <p className="mt-1 text-sm text-gray-500">{error || 'Order not found'}</p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/orders">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Orders
                  </Link>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  const selectedStoreData = stores.find(s => s.id === selectedStore)
  const selectedSupplierData = suppliers.find(s => s.id === selectedSupplier)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Button variant="outline" size="sm" asChild className="mr-4">
                <Link href={`/orders/${orderId}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Order
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Order</h1>
            <p className="mt-2 text-gray-600">
              Order #{order.orderNumber}
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Order Setup */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Funeral Home Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Store className="h-4 w-4 inline mr-1" />
                  Funeral Home
                </label>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a funeral home</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Supplier Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="h-4 w-4 inline mr-1" />
                  Supplier
                </label>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any special instructions for this order..."
              />
            </div>
          </div>

          {/* Order Grid */}
          {selectedStore && selectedSupplier && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
                <div className="text-sm text-gray-600">
                  {selectedStoreData?.name} → {selectedSupplierData?.name}
                </div>
              </div>
              
              <OrderGrid 
                supplierId={selectedSupplier}
                onOrderChange={(items) => {
                  console.log('OrderGrid items changed:', items)
                  setOrderItems(items)
                }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {orderItems.length > 0 && (
                <span>
                  {orderItems.length} item{orderItems.length !== 1 ? 's' : ''} • 
                  Total: ${orderItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                </span>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={handleSaveOrder}
                disabled={isSaving || !selectedStore || !selectedSupplier}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              
              {order.status === 'DRAFT' && (
                <Button
                  onClick={handleSendOrder}
                  disabled={isSaving || !selectedStore || !selectedSupplier}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Save & Send
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
