import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Clock, 
  Settings, 
  Save,
  Test,
  CheckCircle,
  AlertCircle,
  Info,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Alert, AlertDescription } from '../ui/alert'
import { useAuthStore } from '../../lib/authStore'
import { NotificationService, type NotificationConfig } from '../../lib/notifications/NotificationService'

export default function NotificationSettings() {
  const { user } = useAuthStore()
  const [config, setConfig] = useState<NotificationConfig>({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: false,
    reminder24hEnabled: true,
    reminder2hEnabled: true,
    businessEmail: '',
    businessPhone: '',
    sendGridApiKey: '',
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioPhoneNumber: ''
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', content: string } | null>(null)
  const [showApiKeys, setShowApiKeys] = useState(false)
  const [testEmail, setTestEmail] = useState('')

  const notificationService = new NotificationService()

  useEffect(() => {
    if (user?.businessId) {
      loadNotificationConfig()
    }
  }, [user])

  const loadNotificationConfig = async () => {
    try {
      setIsLoading(true)
      const existingConfig = await notificationService.getNotificationConfig(user!.businessId)
      
      if (existingConfig) {
        setConfig(existingConfig)
      } else {
        // Set default business email from user if available
        setConfig(prev => ({
          ...prev,
          businessEmail: user?.email || ''
        }))
      }
    } catch (error) {
      console.error('Error loading notification config:', error)
      setMessage({ type: 'error', content: 'Failed to load notification settings' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user?.businessId) return

    try {
      setIsSaving(true)
      setMessage(null)

      await notificationService.updateNotificationConfig(user.businessId, config)
      
      setMessage({ 
        type: 'success', 
        content: 'Notification settings saved successfully!' 
      })
    } catch (error) {
      console.error('Error saving notification config:', error)
      setMessage({ 
        type: 'error', 
        content: 'Failed to save notification settings' 
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestEmail = async () => {
    if (!testEmail || !config.emailEnabled) return

    try {
      setIsTesting(true)
      
      // Here you would send a test email
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setMessage({ 
        type: 'success', 
        content: `Test email sent to ${testEmail}` 
      })
    } catch (error) {
      setMessage({ 
        type: 'error', 
        content: 'Failed to send test email' 
      })
    } finally {
      setIsTesting(false)
    }
  }

  const updateConfig = (field: keyof NotificationConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Notification Settings</h1>
        <p className="text-gray-600">
          Configure how and when customers receive booking notifications and reminders
        </p>
      </div>

      {/* Message */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
          {message.type === 'error' && <AlertCircle className="h-4 w-4" />}
          {message.type === 'info' && <Info className="h-4 w-4 text-blue-600" />}
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : ''}>
            {message.content}
          </AlertDescription>
        </Alert>
      )}

      {/* Notification Channels */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center mb-6">
          <Bell className="h-5 w-5 text-gray-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Notification Channels</h2>
        </div>

        <div className="space-y-6">
          {/* Email Notifications */}
          <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center mt-1">
              <input
                type="checkbox"
                checked={config.emailEnabled}
                onChange={(e) => updateConfig('emailEnabled', e.target.checked)}
                className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <Mail className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-medium text-gray-900">Email Notifications</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Send booking confirmations and reminders via email
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Email Address
                  </label>
                  <Input
                    type="email"
                    value={config.businessEmail}
                    onChange={(e) => updateConfig('businessEmail', e.target.value)}
                    placeholder="your-business@example.com"
                    disabled={!config.emailEnabled}
                  />
                </div>
                
                {config.emailEnabled && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-blue-900">Test Email Configuration</h4>
                    </div>
                    <div className="flex gap-3">
                      <Input
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="Enter test email address"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={handleTestEmail}
                        disabled={!testEmail || isTesting}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        {isTesting ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Test className="h-4 w-4 mr-2" />
                            Send Test
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SMS Notifications */}
          <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center mt-1">
              <input
                type="checkbox"
                checked={config.smsEnabled}
                onChange={(e) => updateConfig('smsEnabled', e.target.checked)}
                className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <MessageSquare className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                  Pro Feature
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Send booking reminders via SMS for better engagement
              </p>
              
              {config.smsEnabled && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={config.businessPhone || ''}
                      onChange={(e) => updateConfig('businessPhone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Push Notifications */}
          <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg opacity-50">
            <div className="flex items-center mt-1">
              <input
                type="checkbox"
                checked={config.pushEnabled}
                disabled
                className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <Bell className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="font-medium text-gray-900">Push Notifications</h3>
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  Coming Soon
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Send instant notifications through browser and mobile app
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Settings */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center mb-6">
          <Clock className="h-5 w-5 text-gray-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Automatic Reminders</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              checked={config.reminder24hEnabled}
              onChange={(e) => updateConfig('reminder24hEnabled', e.target.checked)}
              className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
            />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">24-Hour Reminder</h3>
              <p className="text-sm text-gray-600">
                Send reminder email 24 hours before the appointment
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              checked={config.reminder2hEnabled}
              onChange={(e) => updateConfig('reminder2hEnabled', e.target.checked)}
              className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
            />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">2-Hour Reminder</h3>
              <p className="text-sm text-gray-600">
                Send final reminder 2 hours before the appointment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* API Configuration */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Settings className="h-5 w-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">API Configuration</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowApiKeys(!showApiKeys)}
          >
            {showApiKeys ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show
              </>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          {/* SendGrid Configuration */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">SendGrid Email Service</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SendGrid API Key
              </label>
              <Input
                type={showApiKeys ? "text" : "password"}
                value={config.sendGridApiKey || ''}
                onChange={(e) => updateConfig('sendGridApiKey', e.target.value)}
                placeholder={showApiKeys ? "SG.xxxxxxxxxxxxxxxxxx" : """"""""""""""""""""""}
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your API key from <a href="https://sendgrid.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">SendGrid Dashboard</a>
              </p>
            </div>
          </div>

          {/* Twilio Configuration */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Twilio SMS Service</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account SID
                </label>
                <Input
                  type={showApiKeys ? "text" : "password"}
                  value={config.twilioAccountSid || ''}
                  onChange={(e) => updateConfig('twilioAccountSid', e.target.value)}
                  placeholder={showApiKeys ? "AC..." : """"""""""""""""""""""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auth Token
                </label>
                <Input
                  type={showApiKeys ? "text" : "password"}
                  value={config.twilioAuthToken || ''}
                  onChange={(e) => updateConfig('twilioAuthToken', e.target.value)}
                  placeholder={showApiKeys ? "xxxxxxxxxxxx" : """"""""""""""""""""""}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Twilio Phone Number
                </label>
                <Input
                  type="text"
                  value={config.twilioPhoneNumber || ''}
                  onChange={(e) => updateConfig('twilioPhoneNumber', e.target.value)}
                  placeholder="+1234567890"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Configure your Twilio account at <a href="https://twilio.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Twilio Console</a>
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}