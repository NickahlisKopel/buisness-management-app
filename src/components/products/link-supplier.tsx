"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Supplier { id: string; name: string }

interface Props {
  product: { id: string; name: string; sku: string; price: number }
}

export function LinkSupplier({ product }: Props) {
  const [open, setOpen] = useState(false)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [supplierId, setSupplierId] = useState("")
  const [price, setPrice] = useState<string>(product.price.toString())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    ;(async () => {
      try {
        const res = await fetch('/api/suppliers')
        const data = await res.json()
        setSuppliers(Array.isArray(data) ? data : [])
      } catch (e) {
        // ignore
      }
    })()
  }, [open])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const body: any = {
        productId: product.id,
        supplierId,
      }
      if (price) body.price = parseFloat(price)
      const res = await fetch('/api/supplier-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to link supplier')
      setSuccess('Linked successfully')
      // Simple refresh to reflect mapping in SSR page
      setTimeout(() => {
        setOpen(false)
        if (typeof window !== 'undefined') window.location.reload()
      }, 700)
    } catch (err: any) {
      setError(err.message || 'Failed to link supplier')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Link Supplier
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-1">Link Supplier</h3>
            <p className="text-sm text-gray-600 mb-4">Link <strong>{product.name}</strong> ({product.sku}) to a supplier.</p>
            <form onSubmit={onSubmit} className="space-y-4">
              {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
              {success && <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">{success}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Price</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="pl-7"
                    placeholder={product.price.toFixed(2)}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Defaults to product price if left blank.</p>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
                <Button type="submit" disabled={saving || !supplierId}>{saving ? 'Saving...' : 'Link'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
