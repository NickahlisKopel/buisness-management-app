import { prisma } from "@/lib/prisma"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Mail, Phone, MapPin, User2, Tag } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SupplierDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")
  const { id } = await params

  const supplier = await prisma.supplier.findFirst({
    where: { id, organizationId: session.user.organizationId }
  })
  if (!supplier) redirect('/suppliers')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Supplier Details</h1>
          <div className="space-x-2">
            <Button variant="outline" asChild>
              <Link href={`/suppliers/${supplier.id}/edit`}>Edit</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/suppliers">Back</Link>
            </Button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{supplier.name}</h2>
            <p className={`text-sm ${supplier.isActive ? 'text-green-600' : 'text-red-600'}`}>
              {supplier.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex items-center"><Mail className="h-4 w-4 mr-2" /> {supplier.email}</div>
              {supplier.phone && <div className="flex items-center"><Phone className="h-4 w-4 mr-2" /> {supplier.phone}</div>}
              {supplier.contactPerson && <div className="flex items-center"><User2 className="h-4 w-4 mr-2" /> {supplier.contactPerson}</div>}
              {supplier.supplierType && <div className="flex items-center"><Tag className="h-4 w-4 mr-2" /> {supplier.supplierType}</div>}
            </div>
            <div className="text-sm text-gray-700 space-y-2">
              {(supplier.address || supplier.city || supplier.state) && (
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                  <div>
                    <div>{supplier.address}</div>
                    <div>{[supplier.city, supplier.state, supplier.zipCode].filter(Boolean).join(', ')}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {supplier.specialties && (
            <div>
              <div className="text-sm font-medium text-gray-900 mb-1">Specialties</div>
              <div className="text-sm text-gray-700">{supplier.specialties}</div>
            </div>
          )}

          {supplier.notes && (
            <div>
              <div className="text-sm font-medium text-gray-900 mb-1">Notes</div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{supplier.notes}</div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
