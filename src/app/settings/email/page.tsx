import { Header } from "@/components/layout/header"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Settings, Save, TestTube } from "lucide-react"

export default function EmailSettingsPage() {
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
                    defaultValue="smtp.gmail.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Port
                  </label>
                  <Input 
                    placeholder="587" 
                    defaultValue="587"
                    type="number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input 
                    placeholder="your-email@gmail.com" 
                    type="email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    App Password
                  </label>
                  <Input 
                    placeholder="Your app password" 
                    type="password"
                  />
                </div>
                
                <Button className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </div>

            {/* Email Templates */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Mail className="h-5 w-5 text-green-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Email Templates</h2>
              </div>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Standard Order Template</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Professional template for regular orders
                  </p>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Edit Template
                    </Button>
                    <Button variant="outline" size="sm">
                      <TestTube className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Urgent Order Template</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Highlighted template for urgent orders
                  </p>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Edit Template
                    </Button>
                    <Button variant="outline" size="sm">
                      <TestTube className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Create New Template
                </Button>
              </div>
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
                />
              </div>
              
              <div className="flex items-end">
                <Button>
                  <TestTube className="h-4 w-4 mr-2" />
                  Send Test Email
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mt-2">
              Send a test email to verify your configuration is working correctly.
            </p>
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
      </div>
    </ProtectedRoute>
  )
}
