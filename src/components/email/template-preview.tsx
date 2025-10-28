"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TemplatePreviewProps {
  template: {
    name: string
    subject: string
    htmlContent: string
    textContent?: string
  }
  onClose: () => void
}

export function TemplatePreview({ template, onClose }: TemplatePreviewProps) {
  // Sample data for preview
  const sampleData = {
    orderNumber: 'ORD-2025-001',
    funeralHome: 'Smith Family Funeral Home',
    supplier: 'Floral Designs Inc.',
    total: '450.00',
    date: new Date().toLocaleDateString()
  }

  // Replace template variables with sample data
  const renderContent = (content: string) => {
    return content
      .replace(/\{\{orderNumber\}\}/g, sampleData.orderNumber)
      .replace(/\{\{funeralHome\}\}/g, sampleData.funeralHome)
      .replace(/\{\{supplier\}\}/g, sampleData.supplier)
      .replace(/\{\{total\}\}/g, sampleData.total)
      .replace(/\{\{date\}\}/g, sampleData.date)
  }

  const renderedSubject = renderContent(template.subject)
  const renderedHtml = renderContent(template.htmlContent)
  const renderedText = template.textContent ? renderContent(template.textContent) : null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Template Preview</h2>
            <p className="text-sm text-gray-600 mt-1">{template.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Subject Line */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Subject:</h3>
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <p className="font-medium">{renderedSubject}</p>
            </div>
          </div>

          {/* HTML Preview */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">HTML Version:</h3>
            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-inner">
              <div 
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
                className="email-preview"
              />
            </div>
          </div>

          {/* Plain Text Preview */}
          {renderedText && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Plain Text Version:</h3>
              <div className="bg-gray-50 p-4 rounded border border-gray-200 font-mono text-sm whitespace-pre-wrap">
                {renderedText}
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This preview uses sample data. Actual emails will contain real order information.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}
