import { prisma } from "@/lib/prisma"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Package, Plus, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LinkSupplier } from "@/components/products/link-supplier"

async function getProducts(organizationId: string) {
  return await prisma.funeralProduct.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' }
  })
}

export default async function ProductsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/auth/signin")
  }

  const products = await getProducts(session.user.organizationId)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Manage your product catalog and inventory
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900">No products</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Get started by adding your first product.
            </p>
            <div className="mt-6">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/products/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
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
                      Product
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      SKU
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Category
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Inventory
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product: any) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-blue-100 rounded-lg p-1.5 sm:p-2 mr-2 sm:mr-3">
                            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            {product.description && (
                              <div className="text-xs sm:text-sm text-gray-500 hidden md:block">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                        {product.sku}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden lg:table-cell">
                        {product.category}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="flex items-center">
                          <span className="text-xs sm:text-sm text-gray-900">
                            {product.inventory}
                          </span>
                          {product.inventory <= product.minStock && (
                            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 ml-2" />
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <div className="flex flex-col sm:flex-row space-y-1.5 sm:space-y-0 sm:space-x-2">
                          <Button variant="outline" size="sm" asChild className="text-xs px-2 py-1 w-full sm:w-auto">
                            <Link href={`/products/${product.id}/edit`}>
                              Edit
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild className="text-xs px-2 py-1 w-full sm:w-auto">
                            <Link href={`/products/${product.id}`}>
                              View
                            </Link>
                          </Button>
                          {/* Client-side button to link supplier */}
                          <LinkSupplier product={{ id: product.id, name: product.name, sku: product.sku, price: product.price }} />
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
  )
}
