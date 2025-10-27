import { prisma } from "@/lib/prisma"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Building2, Users, Plus } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

async function getOrganization(organizationId: string) {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      _count: {
        select: {
          users: true,
          funeralHomes: true,
          suppliers: true,
          products: true,
          orders: true,
        },
      },
    },
  })

  return organization as typeof organization & { inviteCode: string | null }
}

export default async function OrganizationsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.organizationId) {
    redirect('/auth/signin')
  }

  const organization = await getOrganization(session.user.organizationId)

  if (!organization) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Organization
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                View and manage your organization details
              </p>
            </div>
            {session.user.role === "ADMIN" && (
              <Button asChild>
                <Link href={`/organizations/${organization.id}/edit`}>
                  Edit Organization
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Organization Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {organization.name}
                  </h2>
                  {organization.inviteCode && (
                    <p className="text-sm text-gray-500 mt-1">
                      Invite Code: <span className="font-mono font-semibold">{organization.inviteCode}</span>
                    </p>
                  )}
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href={`/organizations/${organization.id}`}>
                  View Details
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Users</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {organization._count.users}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Funeral Homes</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {organization._count.funeralHomes}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Suppliers</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {organization._count.suppliers}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Products</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {organization._count.products}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Orders</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {organization._count.orders}
                </p>
              </div>
            </div>

            {organization.email || organization.phone || organization.address ? (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {organization.email && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-sm text-gray-900">{organization.email}</p>
                    </div>
                  )}
                  {organization.phone && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="text-sm text-gray-900">{organization.phone}</p>
                    </div>
                  )}
                  {organization.address && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="text-sm text-gray-900">
                        {organization.address}
                        {organization.city && `, ${organization.city}`}
                        {organization.state && `, ${organization.state}`}
                        {organization.zipCode && ` ${organization.zipCode}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}
