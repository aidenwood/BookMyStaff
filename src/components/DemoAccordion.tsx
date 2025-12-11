import React, { useState } from 'react'
import { ChevronDown, Calendar, MapPin, Users, Bell, BarChart } from 'lucide-react'
import { Button } from './ui/button'

interface AccordionItemProps {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  demo: React.ReactNode
  isOpen: boolean
  onToggle: () => void
}

const AccordionItem: React.FC<AccordionItemProps> = ({ 
  title, 
  description, 
  icon, 
  demo, 
  isOpen, 
  onToggle 
}) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gray-100 rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        <ChevronDown 
          className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-100 bg-gray-50">
          <div className="pt-4">
            {demo}
          </div>
        </div>
      )}
    </div>
  )
}

const DemoAccordion: React.FC = () => {
  const [openItem, setOpenItem] = useState<string>('scheduling')

  const features = [
    {
      id: 'scheduling',
      title: 'Smart Regional Scheduling',
      description: 'Coordinate staff across regions for maximum efficiency',
      icon: <Calendar className="h-5 w-5 text-blue-600" />,
      demo: (
        <div className="bg-white rounded-lg p-4 border">
          <h4 className="font-medium mb-3 text-gray-900">Brisbane North - Tomorrow</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm">9:00 AM - John (Inspection)</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Confirmed</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm">11:00 AM - Sarah (Maintenance)</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Available</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-sm">2:00 PM - Mike (Repair)</span>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Available</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'booking',
      title: 'Customer Booking Portal',
      description: 'Simple, mobile-first booking experience for customers',
      icon: <MapPin className="h-5 w-5 text-green-600" />,
      demo: (
        <div className="bg-white rounded-lg p-4 border">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Service</label>
              <div className="p-3 bg-gray-50 rounded border">Property Inspection</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Location</label>
              <div className="p-3 bg-gray-50 rounded border flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                Brisbane North, QLD
              </div>
            </div>
            <Button className="w-full">Find Available Times</Button>
          </div>
        </div>
      )
    },
    {
      id: 'team',
      title: 'Team Management',
      description: 'Manage staff, availability, and assignments',
      icon: <Users className="h-5 w-5 text-purple-600" />,
      demo: (
        <div className="bg-white rounded-lg p-4 border">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-purple-700" />
                </div>
                <div>
                  <div className="font-medium text-sm">John Smith</div>
                  <div className="text-xs text-gray-600">Inspector • Brisbane North</div>
                </div>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Available</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="h-4 w-4 text-gray-700" />
                </div>
                <div>
                  <div className="font-medium text-sm">Sarah Johnson</div>
                  <div className="text-xs text-gray-600">Maintenance • Gold Coast</div>
                </div>
              </div>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Busy</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'notifications',
      title: 'Smart Notifications',
      description: 'Automated alerts and reminders for staff and customers',
      icon: <Bell className="h-5 w-5 text-orange-600" />,
      demo: (
        <div className="bg-white rounded-lg p-4 border">
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Booking Confirmed</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Customer and staff notified for tomorrow's 9 AM inspection</p>
            </div>
            <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Route Optimized</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">3 appointments grouped in Brisbane North - 45% travel reduction</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'analytics',
      title: 'Business Analytics',
      description: 'Track performance, revenue, and efficiency metrics',
      icon: <BarChart className="h-5 w-5 text-indigo-600" />,
      demo: (
        <div className="bg-white rounded-lg p-4 border">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-indigo-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-indigo-700">87%</div>
              <div className="text-xs text-gray-600">Efficiency Score</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-700">$12.5k</div>
              <div className="text-xs text-gray-600">Monthly Revenue</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-700">156</div>
              <div className="text-xs text-gray-600">Bookings</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-700">4.9</div>
              <div className="text-xs text-gray-600">Avg Rating</div>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-4">
      {features.map((feature) => (
        <AccordionItem
          key={feature.id}
          {...feature}
          isOpen={openItem === feature.id}
          onToggle={() => setOpenItem(openItem === feature.id ? '' : feature.id)}
        />
      ))}
    </div>
  )
}

export default DemoAccordion