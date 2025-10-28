"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, ArrowLeft } from "lucide-react"
import Link from "next/link"

const PRODUCT_CATEGORIES = [
  "Flowers",
  "Caskets",
  "Urns",
  "Services",
  "Memorial Items",
  "Funeral Accessories",
  "Transportation",
  "Catering",
  "Music",
  "Other"
]

export default function NewProductPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [suppliers, setSuppliers] = useState<Array<{id: string; name: string}>>([])
  const [supplierId, setSupplierId] = useState<string>("")
  const [supplierPrice, setSupplierPrice] = useState<string>("")
  
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    description: "",
    category: "",
    price: "",
    cost: "",
    inventory: "",
    minStock: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const payload = {
        ...formData,
        ...(supplierId ? { supplierId } : {}),
        ...(supplierId ? { supplierPrice: supplierPrice || formData.price } : {})
      }
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create product")
      }

      // Redirect to products page on success
      router.push("/products")
    } catch (error) {
      console.error("Error creating product:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Load suppliers for linking products so they show under supplier selection in orders
  useState(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/suppliers')
        if (res.ok) {
          const data = await res.json()
          setSuppliers(Array.isArray(data) ? data : [])
        }
      } catch (e) {
        // ignore
      }
    })()
  })

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Button variant="outline" size="sm" asChild className="mr-4">
                <Link href="/products">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Products
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
            <p className="mt-2 text-gray-600">
              Create a new funeral service product for your catalog
            </p>
          </div>

          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
                      SKU (Stock Keeping Unit) *
                    </label>
                    <Input
                      id="sku"
                      name="sku"
                      type="text"
                      required
                      value={formData.sku}
                      onChange={handleInputChange}
                      placeholder="Enter unique SKU"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mt-6">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a category</option>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                      Selling Price *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-2">
                      Cost Price *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <Input
                        id="cost"
                        name="cost"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={formData.cost}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Supplier Link (optional) */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Supplier Link (optional)</h3>
                <p className="text-sm text-gray-500 mb-4">Link this product to a supplier so it appears when creating orders for that supplier.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier
                    </label>
                    <select
                      id="supplierId"
                      name="supplierId"
                      value={supplierId}
                      onChange={(e) => setSupplierId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">No supplier (link later)</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="supplierPrice" className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier Price {supplierId ? '*' : ''}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <Input
                        id="supplierPrice"
                        name="supplierPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={supplierPrice}
                        onChange={(e) => setSupplierPrice(e.target.value)}
                        placeholder={formData.price || '0.00'}
                        className="pl-7"
                        disabled={!supplierId}
                      />
                    </div>
                    {supplierId && (
                      <p className="text-xs text-gray-500 mt-1">Defaults to product price if left blank.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Inventory Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="inventory" className="block text-sm font-medium text-gray-700 mb-2">
                      Current Inventory
                    </label>
                    <Input
                      id="inventory"
                      name="inventory"
                      type="number"
                      min="0"
                      value={formData.inventory}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label htmlFor="minStock" className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Stock Level
                    </label>
                    <Input
                      id="minStock"
                      name="minStock"
                      type="number"
                      min="0"
                      value={formData.minStock}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Set minimum stock level to receive low inventory alerts
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/products")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Package className="h-4 w-4 mr-2" />
                      Create Product
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
