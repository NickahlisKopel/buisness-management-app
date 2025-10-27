"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OrderGrid } from "@/components/orders/order-grid"
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Plus,
  ShoppingCart,
  Store,
  Users
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

export default function NewOrderPage() {
  const router = useRouter()
  const [stores, setStores] = useState<Store[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedStore, setSelectedStore] = useState<string>("")
  const [selectedSupplier, setSelectedSupplier] = useState<string>("")
  const [notes, setNotes] = useState("")
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load stores and suppliers
  useEffect(() => {
    const loadData = async () => {
      try {
        const [storesRes, suppliersRes] = await Promise.all([
          fetch('/api/stores'),
          fetch('/api/suppliers')
        ])
        
        const storesData = await storesRes.json()
        const suppliersData = await suppliersRes.json()
        
        setStores(storesData)
        setSuppliers(suppliersData)
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    
    loadData()
  }, [])

  const handleSaveDraft = async () => {
    if (!selectedStore || !selectedSupplier) {
      alert('Please select both store and supplier')
      return
    }

    console.log('Saving order with items:', orderItems)

    setIsSaving(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          funeralHomeId: selectedStore,
          supplierId: selectedSupplier,
          notes: notes,
          status: 'DRAFT',
          orderItems: orderItems
        }),
      })

      if (response.ok) {
        const order = await response.json()
        router.push(`/orders/${order.id}`)
      } else {
        alert('Failed to save order')
      }
    } catch (error) {
      console.error('Error saving order:', error)
      alert('Error saving order')
    } finally {
      setIsSaving(false)
    }
  }

  const selectedStoreData = stores.find(s => s.id === selectedStore)
  const selectedSupplierData = suppliers.find(s => s.id === selectedSupplier)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Button variant="outline" asChild>
                <Link href="/orders">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Orders
                </Link>
              </Button>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
            <p className="mt-2 text-gray-600">
              Use the grid below to add products and quantities to your order
            </p>
          </div>

          {/* Order Setup */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Store Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Store className="h-4 w-4 inline mr-1" />
                  Store
                </label>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a store</option>
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
              {selectedStore && selectedSupplier ? (
                <>Ready to create order</>
              ) : (
                <>Please select store and supplier to continue</>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={!selectedStore || !selectedSupplier || isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
              
              <Button
                onClick={() => {
                  // Handle save and send
                  handleSaveDraft()
                }}
                disabled={!selectedStore || !selectedSupplier || isSaving}
              >
                <Send className="h-4 w-4 mr-2" />
                Save & Send Email
              </Button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
