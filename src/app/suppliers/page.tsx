import { prisma } from "@/lib/prisma"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Users, Plus, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

async function getSuppliers(organizationId: string) {
  return await prisma.supplier.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' }
  })
}

export default async function SuppliersPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/auth/signin")
  }

  const suppliers = await getSuppliers(session.user.organizationId)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Suppliers</h1>
            <p className="mt-2 text-gray-600">
              Manage your supplier network and vendor relationships
            </p>
          </div>
          <Button asChild>
            <Link href="/suppliers/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Link>
          </Button>
        </div>

        {suppliers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No suppliers</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first supplier.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/suppliers/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="bg-purple-100 rounded-lg p-2">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {supplier.name}
                      </h3>
                      <p className={`text-sm ${supplier.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {supplier.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{supplier.email}</span>
                  </div>
                  
                  {supplier.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                  
                  {supplier.address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{supplier.address}</span>
                      {supplier.city && supplier.state && (
                        <span>, {supplier.city}, {supplier.state}</span>
                      )}
                    </div>
                  )}

                  {supplier.contactPerson && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Contact:</span> {supplier.contactPerson}
                    </div>
                  )}

                  {supplier.notes && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {supplier.notes}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/suppliers/${supplier.id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/suppliers/${supplier.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
