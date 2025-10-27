import { prisma } from "@/lib/prisma"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Home, Plus, Phone, Mail, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

async function getFuneralHomes(organizationId: string) {
  return await prisma.funeralHome.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' }
  })
}

export default async function FuneralHomesPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/auth/signin")
  }

  const funeralHomes = await getFuneralHomes(session.user.organizationId)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Funeral Homes</h1>
            <p className="mt-2 text-gray-600">
              Manage your funeral home locations and facilities
            </p>
          </div>
          <Button asChild>
            <Link href="/funeral-homes/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Funeral Home
            </Link>
          </Button>
        </div>

        {funeralHomes.length === 0 ? (
          <div className="text-center py-12">
            <Home className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No funeral homes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first funeral home location.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/funeral-homes/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Funeral Home
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {funeralHomes.map((funeralHome) => (
              <div key={funeralHome.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-lg p-2">
                      <Home className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {funeralHome.name}
                      </h3>
                      <p className={`text-sm ${funeralHome.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {funeralHome.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{funeralHome.address}, {funeralHome.city}, {funeralHome.state} {funeralHome.zipCode}</span>
                  </div>
                  
                  {funeralHome.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{funeralHome.phone}</span>
                    </div>
                  )}
                  
                  {funeralHome.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{funeralHome.email}</span>
                    </div>
                  )}

                  {funeralHome.director && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Director:</span> {funeralHome.director}
                    </div>
                  )}

                  {funeralHome.capacity && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Capacity:</span> {funeralHome.capacity} people
                    </div>
                  )}
                </div>

                <div className="mt-4 flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/funeral-homes/${funeralHome.id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/funeral-homes/${funeralHome.id}`}>
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
