import { prisma } from "@/lib/prisma"
import { Header } from "@/components/layout/header"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Store, MapPin, Phone, Mail, Plus } from "lucide-react"
import Link from "next/link"

async function getStores() {
  return await prisma.funeralHome.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export default async function StoresPage() {
  const stores = await getStores()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Stores</h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Manage your store locations and settings
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/stores/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Store
            </Link>
          </Button>
        </div>

        {stores.length === 0 ? (
          <div className="text-center py-12">
            <Store className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900">No stores</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Get started by creating your first store.
            </p>
            <div className="mt-6">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/stores/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Store
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {stores.map((store) => (
              <div key={store.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-lg p-1.5 sm:p-2">
                      <Store className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <div className="ml-2 sm:ml-3">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        {store.name}
                      </h3>
                      <p className={`text-xs sm:text-sm ${store.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {store.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                  <div className="flex items-start text-xs sm:text-sm text-gray-600">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="flex-1">{store.address}, {store.city}, {store.state} {store.zipCode}</span>
                  </div>
                  
                  {store.phone && (
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span>{store.phone}</span>
                    </div>
                  )}
                  
                  {store.email && (
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{store.email}</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm" asChild className="w-full sm:w-auto text-xs">
                    <Link href={`/stores/${store.id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="w-full sm:w-auto text-xs">
                    <Link href={`/stores/${store.id}`}>
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">View</span>
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
