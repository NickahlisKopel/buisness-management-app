"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  ShoppingCart, 
  Store, 
  Users,
  Package,
  Calculator
} from "lucide-react"
import Link from "next/link"

interface QuickOrderProps {
  stores: Array<{ id: string; name: string }>
  suppliers: Array<{ id: string; name: string }>
}

export function QuickOrder({ stores, suppliers }: QuickOrderProps) {
  const [selectedStore, setSelectedStore] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState("")
  const [items, setItems] = useState<Array<{ product: string; quantity: number }>>([
    { product: "", quantity: 1 }
  ])

  const addItem = () => {
    setItems([...items, { product: "", quantity: 1 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: 'product' | 'quantity', value: string | number) => {
    const updatedItems = items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    )
    setItems(updatedItems)
  }

  const canCreateOrder = selectedStore && selectedSupplier && items.some(item => item.product.trim())

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <ShoppingCart className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Quick Order</h3>
      </div>

      <div className="space-y-4">
        {/* Store and Supplier Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Store className="h-4 w-4 inline mr-1" />
              Store
            </label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select store</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Users className="h-4 w-4 inline mr-1" />
              Supplier
            </label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              <Package className="h-4 w-4 inline mr-1" />
              Items
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={addItem}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>

          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder="Product name or SKU"
                    value={item.product}
                    onChange={(e) => updateItem(index, 'product', e.target.value)}
                  />
                </div>
                <div className="w-20">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                {items.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {canCreateOrder ? (
              <span className="text-green-600">Ready to create order</span>
            ) : (
              <span>Complete the form to create order</span>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              asChild
              disabled={!canCreateOrder}
            >
              <Link href="/orders/new">
                <Calculator className="h-4 w-4 mr-2" />
                Full Grid
              </Link>
            </Button>
            
            <Button
              asChild
              disabled={!canCreateOrder}
            >
              <Link href="/orders/new">
                Create Order
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
