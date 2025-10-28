"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AddressAutocomplete } from "@/components/ui/address-autocomplete"
import { ArrowLeft, Home, Save } from "lucide-react"
import Link from "next/link"

interface FuneralHomeData {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string | null
  email: string | null
  director: string | null
  capacity: number | null
  isActive: boolean
}

export default function EditFuneralHomePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{ state?: string; zipCode?: string }>({})

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    director: "",
    capacity: "",
    isActive: true,
  })

  useEffect(() => {
    // Fetch the funeral home data
    async function fetchFuneralHome() {
      try {
        const response = await fetch(`/api/funeral-homes/${resolvedParams.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch funeral home")
        }
        const data: FuneralHomeData = await response.json()
        
        setFormData({
          name: data.name,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          phone: data.phone || "",
          email: data.email || "",
          director: data.director || "",
          capacity: data.capacity ? data.capacity.toString() : "",
          isActive: data.isActive,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load funeral home")
      } finally {
        setFetching(false)
      }
    }

    fetchFuneralHome()
  }, [resolvedParams.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : (name === 'state' ? value.toUpperCase() : value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const errs: { state?: string; zipCode?: string } = {}
    if (!/^[A-Z]{2}$/.test(formData.state.trim())) errs.state = 'Use 2-letter state code (e.g., CA)'
    if (!/^\d{5}(?:-\d{4})?$/.test(formData.zipCode.trim())) errs.zipCode = 'Enter ZIP as 12345 or 12345-6789'
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) { setLoading(false); return }

    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
      }

      const response = await fetch(`/api/funeral-homes/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update funeral home")
      }

      // Success - redirect to details page
      router.push(`/funeral-homes/${resolvedParams.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setLoading(false)
    }
  }

  const handleAddressChange = (value: string, details?: {
    address: string
    city: string
    state: string
    zipCode: string
  }) => {
    if (details) {
      setFormData((prev) => ({
        ...prev,
        address: details.address,
        city: details.city,
        state: details.state,
        zipCode: details.zipCode,
      }))
    } else {
      setFormData((prev) => ({ ...prev, address: value }))
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading funeral home details...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href={`/funeral-homes/${resolvedParams.id}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Details
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <Home className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Funeral Home</h1>
              <p className="text-gray-600">Update the details for this funeral home location</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Funeral Home Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter funeral home name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <AddressAutocomplete
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleAddressChange}
                    placeholder="Start typing an address..."
                    required
                    showMapPreview
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="state"
                    name="state"
                    type="text"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    maxLength={2}
                  />
                  {fieldErrors.state && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.state}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    type="text"
                    required
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder="12345"
                    maxLength={10}
                  />
                  {fieldErrors.zipCode && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.zipCode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@funeralhome.com"
                  />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="director" className="block text-sm font-medium text-gray-700 mb-1">
                    Funeral Director
                  </label>
                  <Input
                    id="director"
                    name="director"
                    type="text"
                    value={formData.director}
                    onChange={handleChange}
                    placeholder="Director's name"
                  />
                </div>

                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                    Chapel Capacity
                  </label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="0"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="Number of seats"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active Location</span>
                  </label>
                  <p className="mt-1 text-sm text-gray-500">
                    Uncheck this if the location is not currently operational
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
