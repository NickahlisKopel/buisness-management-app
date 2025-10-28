"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Save } from "lucide-react"

interface EmailTemplate {
  id: string
  name: string
  type: 'STANDARD' | 'URGENT' | 'CUSTOM'
  subject: string
  htmlContent: string
  textContent?: string
  isActive: boolean
}

interface TemplateEditorProps {
  template?: EmailTemplate
  onClose: () => void
  onSave: (template: EmailTemplate) => void
}

export function TemplateEditor({ template, onClose, onSave }: TemplateEditorProps) {
  const [formData, setFormData] = useState({
    id: template?.id || '',
    name: template?.name || '',
    type: template?.type || 'CUSTOM' as const,
    subject: template?.subject || '',
    htmlContent: template?.htmlContent || '',
    textContent: template?.textContent || '',
    isActive: template?.isActive !== undefined ? template.isActive : true
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const url = template?.id 
        ? `/api/email-templates/${template.id}` 
        : '/api/email-templates'
      
      const method = template?.id ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save template')
      }

      onSave(data.template)
    } catch (err: any) {
      setError(err.message || 'Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {template?.id ? 'Edit Template' : 'Create New Template'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Holiday Order Template"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!!template?.id && template.type !== 'CUSTOM'}
              >
                <option value="STANDARD">Standard Order</option>
                <option value="URGENT">Urgent Order</option>
                <option value="CUSTOM">Custom</option>
              </select>
              {template?.id && template.type !== 'CUSTOM' && (
                <p className="text-xs text-gray-500 mt-1">
                  Type cannot be changed for {template.type} templates
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Subject *
            </label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Order #{{orderNumber}} from {{funeralHome}}"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Available variables: {'{'}{'{'} orderNumber {'}'}{'}'}, {'{'}{'{'} funeralHome {'}'}{'}'}, {'{'}{'{'} supplier {'}'}{'}'}, {'{'}{'{'} total {'}'}{'}'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              HTML Content *
            </label>
            <textarea
              value={formData.htmlContent}
              onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
              placeholder="<h1>Order Details</h1>..."
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              HTML email content. Use template variables like {'{'}{'{'} orderNumber {'}'}{'}'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plain Text Content (Optional)
            </label>
            <textarea
              value={formData.textContent || ''}
              onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
              placeholder="Plain text version for email clients that don't support HTML"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active (use this template for sending emails)
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>
    </div>
  )
}
