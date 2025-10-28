"use client"

import { Header } from "@/components/layout/header"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Settings, Save, TestTube, Trash2 } from "lucide-react"
import React, { useState, useEffect } from "react"
import { TemplateEditor } from "@/components/email/template-editor"
import { TemplatePreview } from "@/components/email/template-preview"

interface EmailTemplate {
  id: string
  name: string
  type: 'STANDARD' | 'URGENT' | 'CUSTOM'
  subject: string
  htmlContent: string
  textContent?: string
  isActive: boolean
}

export default function EmailSettingsPage() {
  const [testEmail, setTestEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [config, setConfig] = useState({ host: "", port: "587", user: "", password: "", fromAddress: "", secure: false as boolean })
  const [saving, setSaving] = useState(false)
  
  // Template state
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [previewingTemplate, setPreviewingTemplate] = useState<EmailTemplate | null>(null)
  const [showNewTemplate, setShowNewTemplate] = useState(false)
  const [loadingTemplates, setLoadingTemplates] = useState(true)

  // Load existing settings
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/settings/email', { cache: 'no-store' })
        const data = await res.json()
        if (res.ok && data.settings) {
          const s = data.settings
          setConfig({ host: s.host || '', port: String(s.port ?? '587'), user: s.user || '', password: s.password ? '********' : '', fromAddress: s.fromAddress || '', secure: !!s.secure })
        }
      } catch {}
    }
    load()
  }, [])

  // Load templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const res = await fetch('/api/email-templates', { cache: 'no-store' })
        const data = await res.json()
        if (res.ok) {
          setTemplates(data.templates || [])
        }
      } catch (err) {
        console.error('Failed to load templates:', err)
      } finally {
        setLoadingTemplates(false)
      }
    }
    loadTemplates()
  }, [])

  const saveConfig = async () => {
    setStatus(null)
    try {
      setSaving(true)
      const payload = {
        host: config.host,
        port: Number(config.port || 587),
        user: config.user,
        password: config.password === '********' ? undefined : config.password,
        fromAddress: config.fromAddress,
        secure: config.secure,
      }
      const res = await fetch('/api/settings/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const text = await res.text()
      const data = text ? JSON.parse(text) : {}
      if (!res.ok) throw new Error(data.error || 'Failed to save settings')
      setStatus('Settings saved')
      if (data.settings?.password) setConfig((c) => ({ ...c, password: '********' }))
    } catch (e: any) {
      setStatus(e.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const sendTest = async () => {
    setStatus(null)
    if (!testEmail.trim()) {
      setStatus("Please enter a valid email address")
      return
    }
    try {
      setSending(true)
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send test email')
      setStatus('Test email sent')
    } catch (err: any) {
      setStatus(err.message || 'Failed to send test email')
    } finally {
      setSending(false)
    }
  }

  const handleSaveTemplate = (template: EmailTemplate) => {
    // Refresh templates list
    setTemplates(prev => {
      const existing = prev.find(t => t.id === template.id)
      if (existing) {
        return prev.map(t => t.id === template.id ? template : t)
      }
      return [...prev, template]
    })
    setEditingTemplate(null)
    setShowNewTemplate(false)
  }

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return
    
    try {
      const res = await fetch(`/api/email-templates/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setTemplates(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      alert('Failed to delete template')
    }
  }

  const getTemplateByType = (type: 'STANDARD' | 'URGENT') => {
    return templates.find(t => t.type === type)
  }
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Email Settings</h1>
            <p className="mt-2 text-gray-600">
              Configure email templates and settings for supplier orders
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Email Configuration */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Settings className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Email Configuration</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Host
                  </label>
                  <Input 
                    placeholder="smtp.gmail.com" 
                    value={config.host}
                    onChange={(e) => setConfig({ ...config, host: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Port
                  </label>
                  <Input 
                    placeholder="587" 
                    type="number"
                    value={config.port}
                    onChange={(e) => setConfig({ ...config, port: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="secure"
                    type="checkbox"
                    className="h-4 w-4"
                    checked={config.secure}
                    onChange={(e) => setConfig({ ...config, secure: e.target.checked })}
                  />
                  <label htmlFor="secure" className="text-sm text-gray-700">Use secure connection (TLS/465)</label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input 
                    placeholder="your-email@gmail.com" 
                    type="email"
                    value={config.user}
                    onChange={(e) => setConfig({ ...config, user: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    App Password
                  </label>
                  <Input 
                    placeholder="Your app password" 
                    type="password"
                    value={config.password}
                    onChange={(e) => setConfig({ ...config, password: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Address
                  </label>
                  <Input 
                    placeholder="Orders <orders@yourdomain.com>" 
                    value={config.fromAddress}
                    onChange={(e) => setConfig({ ...config, fromAddress: e.target.value })}
                  />
                </div>
                
                <Button className="w-full" onClick={saveConfig} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving…' : 'Save Configuration'}
                </Button>
                {status && (
                  <p className={`text-sm mt-3 ${status.includes('saved') ? 'text-green-600' : 'text-red-600'}`}>
                    {status}
                  </p>
                )}
              </div>
            </div>

            {/* Email Templates */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Mail className="h-5 w-5 text-green-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Email Templates</h2>
              </div>
              
              {loadingTemplates ? (
                <p className="text-sm text-gray-600">Loading templates...</p>
              ) : (
                <div className="space-y-4">
                  {/* Standard Order Template */}
                  {(() => {
                    const standardTemplate = getTemplateByType('STANDARD')
                    return (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">
                          {standardTemplate?.name || 'Standard Order Template'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {standardTemplate ? 'Professional template for regular orders' : 'Not configured yet'}
                        </p>
                        <div className="flex space-x-2">
                          {standardTemplate ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setEditingTemplate(standardTemplate)}
                              >
                                Edit Template
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setPreviewingTemplate(standardTemplate)}
                              >
                                <TestTube className="h-4 w-4 mr-1" />
                                Preview
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteTemplate(standardTemplate.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditingTemplate({
                                  id: '',
                                  name: 'Standard Order Template',
                                  type: 'STANDARD',
                                  subject: 'New Order Request - {{orderNumber}}',
                                  htmlContent: '<h1>New Order</h1><p>Order {{orderNumber}} from {{funeralHome}} to {{supplier}}. Total: ${{total}}</p>',
                                  textContent: 'Order {{orderNumber}} from {{funeralHome}} to {{supplier}}. Total: ${{total}}',
                                  isActive: true,
                                })
                              }}
                            >
                              Create Standard Template
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                  
                  {/* Urgent Order Template */}
                  {(() => {
                    const urgentTemplate = getTemplateByType('URGENT')
                    return (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">
                          {urgentTemplate?.name || 'Urgent Order Template'}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {urgentTemplate ? 'Highlighted template for urgent orders' : 'Not configured yet'}
                        </p>
                        <div className="flex space-x-2">
                          {urgentTemplate ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setEditingTemplate(urgentTemplate)}
                              >
                                Edit Template
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setPreviewingTemplate(urgentTemplate)}
                              >
                                <TestTube className="h-4 w-4 mr-1" />
                                Preview
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteTemplate(urgentTemplate.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditingTemplate({
                                  id: '',
                                  name: 'Urgent Order Template',
                                  type: 'URGENT',
                                  subject: 'URGENT: Order {{orderNumber}}',
                                  htmlContent: '<h1>URGENT ORDER</h1><p>Order {{orderNumber}} from {{funeralHome}} to {{supplier}}. Total: ${{total}}</p>',
                                  textContent: 'URGENT order {{orderNumber}} from {{funeralHome}} to {{supplier}}. Total: ${{total}}',
                                  isActive: true,
                                })
                              }}
                            >
                              Create Urgent Template
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })()}

                  {/* Custom Templates */}
                  {templates.filter(t => t.type === 'CUSTOM').map(template => (
                    <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">Custom template</p>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingTemplate(template)}
                        >
                          Edit Template
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setPreviewingTemplate(template)}
                        >
                          <TestTube className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowNewTemplate(true)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Create New Template
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Email Testing */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <TestTube className="h-5 w-5 text-purple-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">Test Email Configuration</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Email Address
                </label>
                  <Input 
                    placeholder="test@example.com" 
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
              </div>
              
              <div className="flex items-end">
                <Button onClick={sendTest} disabled={sending}>
                  <TestTube className="h-4 w-4 mr-2" />
                  {sending ? 'Sending…' : 'Send Test Email'}
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mt-2">
              Send a test email to verify your configuration is working correctly.
            </p>
            {status && (
              <p className={`text-sm mt-3 ${status.includes('sent') ? 'text-green-600' : 'text-red-600'}`}>
                {status}
              </p>
            )}
          </div>

          {/* Email Statistics */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">24</div>
                <div className="text-sm text-gray-600">Emails Sent Today</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">98%</div>
                <div className="text-sm text-gray-600">Delivery Rate</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">156</div>
                <div className="text-sm text-gray-600">Total This Month</div>
              </div>
            </div>
          </div>
        </main>

        {/* Modals */}
        {(editingTemplate || showNewTemplate) && (
          <TemplateEditor
            template={editingTemplate || undefined}
            onClose={() => {
              setEditingTemplate(null)
              setShowNewTemplate(false)
            }}
            onSave={handleSaveTemplate}
          />
        )}

        {previewingTemplate && (
          <TemplatePreview
            template={previewingTemplate}
            onClose={() => setPreviewingTemplate(null)}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
