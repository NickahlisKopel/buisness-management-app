"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus, 
  Trash2, 
  Package, 
  Calculator,
  AlertCircle,
  ShoppingCart
} from "lucide-react"

interface Product {
  id: string
  name: string
  sku: string
  price: number
  category: string
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

interface OrderGridProps {
  supplierId: string
  onOrderChange: (items: OrderItem[]) => void
}

export function OrderGrid({ supplierId, onOrderChange }: OrderGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Load products for the selected supplier
  useEffect(() => {
    const loadProducts = async () => {
      if (!supplierId) return
      
      setIsLoading(true)
      try {
        const response = await fetch(`/api/suppliers/${supplierId}/products`)
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [supplierId])

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addProductToOrder = (product: Product) => {
    const existingItem = orderItems.find(item => item.productId === product.id)
    
    if (existingItem) {
      // Update quantity if product already exists
      updateItemQuantity(existingItem.id, existingItem.quantity + 1)
    } else {
      // Add new item
      const newItem: OrderItem = {
        id: `item-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: 1,
        unitPrice: product.price,
        total: product.price
      }
      
      const updatedItems = [...orderItems, newItem]
      setOrderItems(updatedItems)
      onOrderChange(updatedItems)
    }
  }

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
      return
    }

    const updatedItems = orderItems.map(item => {
      if (item.id === itemId) {
        const updatedItem = {
          ...item,
          quantity: newQuantity,
          total: newQuantity * item.unitPrice
        }
        return updatedItem
      }
      return item
    })
    
    setOrderItems(updatedItems)
    onOrderChange(updatedItems)
  }

  const updateItemPrice = (itemId: string, newPrice: number) => {
    const updatedItems = orderItems.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          unitPrice: newPrice,
          total: item.quantity * newPrice
        }
      }
      return item
    })
    
    setOrderItems(updatedItems)
    onOrderChange(updatedItems)
  }

  const removeItem = (itemId: string) => {
    const updatedItems = orderItems.filter(item => item.id !== itemId)
    setOrderItems(updatedItems)
    onOrderChange(updatedItems)
  }

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateItemCount = () => {
    return orderItems.reduce((sum, item) => sum + item.quantity, 0)
  }

  return (
    <div className="space-y-6">
      {/* Search and Add Products */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Add Products</h3>
          <div className="text-sm text-gray-600">
            {calculateItemCount()} items • Total: ${calculateTotal().toFixed(2)}
          </div>
        </div>
        
        <div className="flex space-x-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search products by name, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <Package className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.sku} • {product.category}
                      </p>
                      <p className="text-sm font-semibold text-blue-600">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => addProductToOrder(product)}
                  className="ml-2 flex-shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No products found</p>
            <p className="text-sm text-gray-500">
              Try adjusting your search terms
            </p>
          </div>
        )}
      </div>

      {/* Order Items Table */}
      {orderItems.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          {item.productName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.productSku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice.toFixed(2)}
                        onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                        className="w-24"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${item.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <Calculator className="h-4 w-4 mr-2" />
                      Total:
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    ${calculateTotal().toFixed(2)}
                  </td>
                  <td className="px-6 py-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {orderItems.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items in order</h3>
          <p className="text-gray-600 mb-4">
            Search and add products from the supplier's catalog above
          </p>
        </div>
      )}
    </div>
  )
}
