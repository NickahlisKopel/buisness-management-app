import { prisma } from "@/lib/prisma"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Calendar, Plus, Clock, MapPin, User, Phone } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

async function getCeremonies(organizationId: string) {
  return await prisma.ceremony.findMany({
    where: {
      funeralHome: {
        organizationId
      }
    },
    include: {
      funeralHome: {
        select: {
          name: true
        }
      }
    },
    orderBy: { ceremonyDate: 'desc' }
  })
}

export default async function CeremoniesPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/auth/signin")
  }

  const ceremonies = await getCeremonies(session.user.organizationId)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING': return 'text-yellow-600 bg-yellow-100'
      case 'CONFIRMED': return 'text-blue-600 bg-blue-100'
      case 'IN_PROGRESS': return 'text-green-600 bg-green-100'
      case 'COMPLETED': return 'text-gray-600 bg-gray-100'
      case 'CANCELLED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ceremonies</h1>
            <p className="mt-2 text-gray-600">
              Manage funeral ceremonies and memorial services
            </p>
          </div>
          <Button asChild>
            <Link href="/ceremonies/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Ceremony
            </Link>
          </Button>
        </div>

        {ceremonies.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No ceremonies</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first ceremony.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/ceremonies/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ceremony
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ceremonies.map((ceremony) => (
              <div key={ceremony.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="bg-purple-100 rounded-lg p-2">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {ceremony.ceremonyNumber}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ceremony.status)}`}>
                        {ceremony.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Deceased:</span> {ceremony.deceasedName}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{formatDate(ceremony.ceremonyDate)}</span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Type:</span> {ceremony.ceremonyType}
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Funeral Home:</span> {ceremony.funeralHome.name}
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Family Contact:</span> {ceremony.familyContact}
                  </div>

                  {ceremony.notes && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {ceremony.notes}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/ceremonies/${ceremony.id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/ceremonies/${ceremony.id}`}>
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
