import { prisma } from "@/lib/prisma"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Home, Phone, Mail, MapPin, Users, User, ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"

async function getFuneralHome(id: string, organizationId: string) {
  const funeralHome = await prisma.funeralHome.findUnique({
    where: { id },
    include: {
      ceremonies: {
        orderBy: { ceremonyDate: 'desc' },
        take: 5,
      },
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  if (!funeralHome || funeralHome.organizationId !== organizationId) {
    return null
  }

  return funeralHome
}

export default async function FuneralHomeDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/auth/signin")
  }

  const funeralHome = await getFuneralHome(params.id, session.user.organizationId)

  if (!funeralHome) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/funeral-homes"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Funeral Homes
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white rounded-lg p-3 mr-4">
                  <Home className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{funeralHome.name}</h1>
                  <p className={`text-lg ${funeralHome.isActive ? 'text-blue-100' : 'text-red-200'}`}>
                    {funeralHome.isActive ? 'Active Location' : 'Inactive Location'}
                  </p>
                </div>
              </div>
              <Button asChild variant="secondary">
                <Link href={`/funeral-homes/${funeralHome.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Location Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Location Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-gray-900">{funeralHome.address}</p>
                    <p className="text-gray-900">
                      {funeralHome.city}, {funeralHome.state} {funeralHome.zipCode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-blue-600" />
                  Contact Information
                </h2>
                <div className="space-y-3">
                  {funeralHome.phone ? (
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <a href={`tel:${funeralHome.phone}`} className="text-blue-600 hover:underline">
                        {funeralHome.phone}
                      </a>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-400 italic">Not provided</p>
                    </div>
                  )}

                  {funeralHome.email ? (
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a href={`mailto:${funeralHome.email}`} className="text-blue-600 hover:underline">
                        {funeralHome.email}
                      </a>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-400 italic">Not provided</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Staff Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Staff Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Funeral Director</p>
                    <p className="text-gray-900">
                      {funeralHome.director || <span className="text-gray-400 italic">Not assigned</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Facility Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Facility Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Chapel Capacity</p>
                    <p className="text-gray-900">
                      {funeralHome.capacity ? (
                        `${funeralHome.capacity} people`
                      ) : (
                        <span className="text-gray-400 italic">Not specified</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Ceremonies */}
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">Recent Ceremonies</h3>
                  {funeralHome.ceremonies.length > 0 ? (
                    <div className="space-y-2">
                      {funeralHome.ceremonies.map((ceremony) => (
                        <div key={ceremony.id} className="text-sm border-l-2 border-blue-500 pl-3 py-1">
                          <p className="font-medium text-gray-900">{ceremony.deceasedName}</p>
                          <p className="text-gray-500">
                            {new Date(ceremony.ceremonyDate).toLocaleDateString()} - {ceremony.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic text-sm">No recent ceremonies</p>
                  )}
                </div>

                {/* Recent Orders */}
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-3">Recent Orders</h3>
                  {funeralHome.orders.length > 0 ? (
                    <div className="space-y-2">
                      {funeralHome.orders.map((order) => (
                        <div key={order.id} className="text-sm border-l-2 border-green-500 pl-3 py-1">
                          <p className="font-medium text-gray-900">Order #{order.orderNumber}</p>
                          <p className="text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()} - {order.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic text-sm">No recent orders</p>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <span className="font-medium">Created:</span>{" "}
                  {new Date(funeralHome.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>{" "}
                  {new Date(funeralHome.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
