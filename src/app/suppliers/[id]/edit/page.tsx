import { prisma } from "@/lib/prisma"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { EditSupplierForm } from "@/components/suppliers/edit-supplier-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditSupplierPage({ params }: PageProps) {
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Supplier</h1>
          <Button variant="outline" asChild>
            <Link href={`/suppliers/${supplier.id}`}>Cancel</Link>
          </Button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <EditSupplierForm initial={supplier as any} />
        </div>
      </main>
    </div>
  )
}
