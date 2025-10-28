"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AddressAutocomplete } from "@/components/ui/address-autocomplete"

interface Supplier {
  id: string
  name: string
  email: string
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  contactPerson?: string | null
  supplierType?: string | null
  specialties?: string | null
  notes?: string | null
  isActive: boolean
}

export function EditSupplierForm({ initial }: { initial: Supplier }) {
  const [form, setForm] = useState({
    name: initial.name || "",
    email: initial.email || "",
    phone: initial.phone || "",
    address: initial.address || "",
    city: initial.city || "",
    state: initial.state || "",
    zipCode: initial.zipCode || "",
    contactPerson: initial.contactPerson || "",
    supplierType: initial.supplierType || "",
    specialties: initial.specialties || "",
    notes: initial.notes || "",
    isActive: initial.isActive,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ state?: string; zipCode?: string }>({})

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: name === 'state' ? value.toUpperCase() : value }))
  }

  const validate = () => {
    const errs: { state?: string; zipCode?: string } = {}
    const state = (form.state || '').trim()
    const zip = (form.zipCode || '').trim()
    if (state && !/^[A-Z]{2}$/.test(state)) errs.state = 'Use 2-letter state code (e.g., CA)'
    if (zip && !/^\d{5}(?:-\d{4})?$/.test(zip)) errs.zipCode = 'Enter ZIP as 12345 or 12345-6789'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(`/api/suppliers/${initial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update supplier')
      setSuccess('Updated successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to update supplier')
    } finally {
      setSaving(false)
    }
  }

  const handleAddressChange = (value: string, details?: {
    address: string
    city: string
    state: string
    zipCode: string
  }) => {
    if (details) {
      setForm((f) => ({
        ...f,
        address: details.address,
        city: details.city,
        state: details.state,
        zipCode: details.zipCode,
      }))
    } else {
      setForm((f) => ({ ...f, address: value }))
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
      {success && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
          <Input name="name" value={form.name} onChange={onChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <Input type="email" name="email" value={form.email} onChange={onChange} required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <Input name="phone" value={form.phone} onChange={onChange} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
          <Input name="contactPerson" value={form.contactPerson} onChange={onChange} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <AddressAutocomplete
          id="address"
          name="address"
          value={form.address}
          onChange={handleAddressChange}
          placeholder="Start typing an address..."
          showMapPreview
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <Input name="city" value={form.city} onChange={onChange} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
          <Input name="state" value={form.state} onChange={onChange} />
          {fieldErrors.state && <p className="mt-1 text-sm text-red-600">{fieldErrors.state}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
          <Input name="zipCode" value={form.zipCode} onChange={onChange} />
          {fieldErrors.zipCode && <p className="mt-1 text-sm text-red-600">{fieldErrors.zipCode}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Type</label>
          <Input name="supplierType" value={form.supplierType} onChange={onChange} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
          <Input name="specialties" value={form.specialties} onChange={onChange} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <textarea name="notes" rows={3} value={form.notes} onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
      </div>

      <div className="flex items-center space-x-2">
        <input id="isActive" type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
        <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
      </div>
    </form>
  )
}
