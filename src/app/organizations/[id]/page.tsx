import { prisma } from "@/lib/prisma"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { CopyInviteCodeButton } from "@/components/organizations/copy-invite-code-button"
import { Building2, Mail, Phone, MapPin, Users, Edit, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"

async function getOrganization(id: string) {
  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!organization) {
    return null
  }

  // Get accurate counts with filters applied
  const [funeralHomesCount, suppliersCount, productsCount, ordersCount] = await Promise.all([
    prisma.funeralHome.count({ 
      where: { 
        organizationId: id,
        isActive: true 
      } 
    }),
    prisma.supplier.count({ 
      where: { 
        organizationId: id,
        isActive: true 
      } 
    }),
    prisma.funeralProduct.count({ 
      where: { 
        organizationId: id,
        isActive: true 
      } 
    }),
    prisma.order.count({ 
      where: { 
        organizationId: id
      } 
    }),
  ])

  return {
    ...organization,
    _count: {
      funeralHomes: funeralHomesCount,
      suppliers: suppliersCount,
      products: productsCount,
      orders: ordersCount,
    }
  } as typeof organization & { 
    inviteCode: string | null,
    _count: {
      funeralHomes: number,
      suppliers: number,
      products: number,
      orders: number,
    }
  }
}

export default async function OrganizationDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/auth/signin")
  }

  // Only admins can view organization details
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const { id } = await params
  const organization = await getOrganization(id)

  if (!organization || organization.id !== session.user.organizationId) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/organizations"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Organizations
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white rounded-lg p-3 mr-4">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{organization.name}</h1>
                  <p className={`text-lg ${organization.isActive ? 'text-blue-100' : 'text-red-200'}`}>
                    {organization.isActive ? 'Active Organization' : 'Inactive Organization'}
                  </p>
                </div>
              </div>
              <Button asChild variant="secondary">
                <Link href={`/organizations/${organization.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8">
            {/* Invite Code Section */}
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Organization Invite Code
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Share this code with others to allow them to join your organization
              </p>
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-white px-4 py-3 rounded-lg border-2 border-green-300">
                  <p className="text-2xl font-mono font-bold text-green-700 tracking-wider">
                    {organization.inviteCode || 'Not generated'}
                  </p>
                </div>
                <CopyInviteCodeButton inviteCode={organization.inviteCode} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Location Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                  Location Information
                </h2>
                <div className="space-y-3">
                  {organization.address ? (
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-gray-900">{organization.address}</p>
                      {organization.city && organization.state && (
                        <p className="text-gray-900">
                          {organization.city}, {organization.state} {organization.zipCode}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">No address provided</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-blue-600" />
                  Contact Information
                </h2>
                <div className="space-y-3">
                  {organization.phone ? (
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <a href={`tel:${organization.phone}`} className="text-blue-600 hover:underline">
                        {organization.phone}
                      </a>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-400 italic">Not provided</p>
                    </div>
                  )}

                  {organization.email ? (
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a href={`mailto:${organization.email}`} className="text-blue-600 hover:underline">
                        {organization.email}
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
            </div>

            {/* Statistics */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Users</p>
                  <p className="text-2xl font-bold text-blue-600">{organization.users.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Funeral Homes</p>
                  <p className="text-2xl font-bold text-green-600">{organization._count.funeralHomes}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Suppliers</p>
                  <p className="text-2xl font-bold text-purple-600">{organization._count.suppliers}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Products</p>
                  <p className="text-2xl font-bold text-orange-600">{organization._count.products}</p>
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Users</h2>
              {organization.users.length > 0 ? (
                <div className="space-y-3">
                  {organization.users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{user.name || 'Unnamed User'}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                          {user.role}
                        </span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic">No users found</p>
              )}
            </div>

            {/* Metadata */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <span className="font-medium">Created:</span>{" "}
                  {new Date(organization.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>{" "}
                  {new Date(organization.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
