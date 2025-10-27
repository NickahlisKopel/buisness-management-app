'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Calendar, User, Phone, MapPin, FileText } from 'lucide-react'
import Link from 'next/link'
import { FuneralHome, CeremonyStatus } from '@/types'
import { CreateCeremonyData } from '@/types'

const ceremonyTypes = [
  'Funeral Service',
  'Memorial Service',
  'Graveside Service',
  'Celebration of Life',
  'Viewing/Visitation',
  'Cremation Service',
  'Burial Service'
]

const ceremonyStatuses: { value: CeremonyStatus; label: string }[] = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' }
]

export default function NewCeremonyPage() {
  const router = useRouter()
  const [funeralHomes, setFuneralHomes] = useState<FuneralHome[]>([])
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CreateCeremonyData>({
    funeralHomeId: '',
    deceasedName: '',
    familyContact: '',
    ceremonyDate: '',
    ceremonyType: '',
    status: 'PLANNING',
    notes: ''
  })

  useEffect(() => {
    fetchFuneralHomes()
  }, [])

  const fetchFuneralHomes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/funeral-homes')
      if (!response.ok) throw new Error('Failed to fetch funeral homes')
      const data = await response.json()
      setFuneralHomes(data)
    } catch (error) {
      console.error('Error fetching funeral homes:', error)
      alert('Failed to load funeral homes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/ceremonies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create ceremony')
      }

      router.push('/ceremonies')
      router.refresh()
    } catch (error) {
      console.error('Error creating ceremony:', error)
      alert(error instanceof Error ? error.message : 'Failed to create ceremony')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Format date for datetime-local input
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().slice(0, 16)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link 
            href="/ceremonies" 
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Ceremonies
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">Add New Ceremony</h1>
          <p className="mt-2 text-gray-600">
            Create a new funeral ceremony or memorial service
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Funeral Home Selection */}
            <div>
              <label htmlFor="funeralHomeId" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-2" />
                Funeral Home *
              </label>
              <select
                id="funeralHomeId"
                name="funeralHomeId"
                value={formData.funeralHomeId}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a funeral home</option>
                {funeralHomes.map((home) => (
                  <option key={home.id} value={home.id}>
                    {home.name} - {home.city}, {home.state}
                  </option>
                ))}
              </select>
            </div>

            {/* Deceased Name */}
            <div>
              <label htmlFor="deceasedName" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Deceased Name *
              </label>
              <Input
                id="deceasedName"
                name="deceasedName"
                type="text"
                value={formData.deceasedName}
                onChange={handleChange}
                required
                placeholder="Enter the name of the deceased"
              />
            </div>

            {/* Family Contact */}
            <div>
              <label htmlFor="familyContact" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4 inline mr-2" />
                Family Contact *
              </label>
              <Input
                id="familyContact"
                name="familyContact"
                type="text"
                value={formData.familyContact}
                onChange={handleChange}
                required
                placeholder="Primary family contact name and phone"
              />
            </div>

            {/* Ceremony Date */}
            <div>
              <label htmlFor="ceremonyDate" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                Ceremony Date & Time *
              </label>
              <input
                id="ceremonyDate"
                name="ceremonyDate"
                type="datetime-local"
                value={formatDateForInput(formData.ceremonyDate)}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Ceremony Type */}
            <div>
              <label htmlFor="ceremonyType" className="block text-sm font-medium text-gray-700 mb-2">
                Ceremony Type *
              </label>
              <select
                id="ceremonyType"
                name="ceremonyType"
                value={formData.ceremonyType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select ceremony type</option>
                {ceremonyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {ceremonyStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-2" />
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Additional notes or special instructions..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? 'Creating...' : 'Create Ceremony'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}