import React, { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, BarChart, Settings } from 'lucide-react'
import { Button } from './ui/button'

interface TabItemProps {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  demo: React.ReactNode
  isActive: boolean
  onClick: () => void
}

const TabItem: React.FC<TabItemProps> = ({ 
  title, 
  description, 
  icon, 
  isActive, 
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-4 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-primary text-primary-foreground shadow-lg scale-105' 
          : 'bg-white hover:bg-gray-50 hover:shadow-md text-gray-700 hover:text-gray-900'
      }`}
    >
      <div className={`p-2 rounded-lg mb-2 ${
        isActive ? 'bg-white/20' : 'bg-gray-100'
      }`}>
        {icon}
      </div>
      <span className="text-sm font-medium text-center">{title}</span>
      <span className={`text-xs mt-1 text-center ${
        isActive ? 'text-primary-foreground/80' : 'text-gray-500'
      }`}>{description}</span>
    </button>
  )
}

// Mobile accordion item for small screens
const AccordionItem: React.FC<{
  id: string
  title: string
  description: string
  icon: React.ReactNode
  demo: React.ReactNode
  isOpen: boolean
  onToggle: () => void
}> = ({ 
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
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
            <p className="text-xs text-gray-600">{description}</p>
          </div>
        </div>
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
          <div className="pt-4">
            {demo}
          </div>
        </div>
      )}
    </div>
  )
}

// Smart Regional Availability Gantt View Component
const RegionalGanttView: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState('brisbane-north')
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [scheduleData] = useState({
    'brisbane-north': [
      { id: '1', staff: 'John', time: '09:00', duration: 2, type: 'inspection', color: 'bg-blue-500' },
      { id: '2', staff: 'Sarah', time: '11:00', duration: 1.5, type: 'maintenance', color: 'bg-green-500' },
      { id: '3', staff: 'Mike', time: '14:00', duration: 2.5, type: 'repair', color: 'bg-orange-500' }
    ],
    'gold-coast': [
      { id: '4', staff: 'Emma', time: '10:00', duration: 3, type: 'inspection', color: 'bg-blue-500' },
      { id: '5', staff: 'Tom', time: '13:30', duration: 2, type: 'maintenance', color: 'bg-green-500' }
    ]
  })

  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = 8 + i
    return `${hour.toString().padStart(2, '0')}:00`
  })

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = (e: React.DragEvent, newTime: string) => {
    e.preventDefault()
    if (draggedItem) {
      // Update schedule data logic here
      console.log(`Moving ${draggedItem} to ${newTime}`)
    }
    setDraggedItem(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setSelectedRegion('brisbane-north')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedRegion === 'brisbane-north' 
              ? 'bg-blue-100 text-blue-800 border border-blue-300' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Brisbane North
        </button>
        <button 
          onClick={() => setSelectedRegion('gold-coast')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedRegion === 'gold-coast' 
              ? 'bg-blue-100 text-blue-800 border border-blue-300' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Gold Coast
        </button>
      </div>
      
      <div className="grid grid-cols-11 gap-2 text-sm">
        <div className="font-medium text-gray-600">Staff</div>
        {timeSlots.map(time => (
          <div key={time} className="text-center font-medium text-gray-600 text-xs">
            {time}
          </div>
        ))}
        
        {['John', 'Sarah', 'Mike', 'Emma', 'Tom'].slice(0, 3).map((staff) => (
          <React.Fragment key={staff}>
            <div className="py-3 font-medium text-gray-800">{staff}</div>
            {timeSlots.map((time, timeIndex) => {
              const currentAppointments = scheduleData[selectedRegion as keyof typeof scheduleData]?.filter(item => 
                item.staff === staff && timeIndex >= parseInt(item.time.split(':')[0]) - 8 && 
                timeIndex < parseInt(item.time.split(':')[0]) - 8 + item.duration
              ) || []
              
              return (
                <div 
                  key={`${staff}-${time}`}
                  className="h-12 border border-gray-200 rounded relative cursor-pointer hover:bg-gray-50"
                  onDrop={(e) => handleDrop(e, time)}
                  onDragOver={handleDragOver}
                >
                  {currentAppointments.map(appointment => (
                    <div 
                      key={appointment.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, appointment.id)}
                      className={`absolute inset-1 ${appointment.color} text-white text-xs rounded flex items-center justify-center cursor-move opacity-90 hover:opacity-100 transition-opacity`}
                      style={{ width: `${appointment.duration * 100}%` }}
                    >
                      {appointment.type}
                    </div>
                  ))}
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-600">
        💡 Drag appointments to reschedule • No overlapping allowed
      </div>
    </div>
  )
}

const DemoAccordion: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('availability')
  const [isMobile, setIsMobile] = useState(false)
  const [openMobileItem, setOpenMobileItem] = useState<string>('availability')

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const features = [
    {
      id: 'admin',
      title: 'Admin Panel',
      description: 'Complete business dashboard',
      icon: <Settings className="h-5 w-5" />,
      demo: (
        <div className="bg-white rounded-lg border p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="h-6 w-6 text-blue-600" />
                <h4 className="font-semibold text-blue-900">Today's Schedule</h4>
              </div>
              <div className="space-y-2">
                <div className="text-sm bg-white/50 p-2 rounded">8 appointments scheduled</div>
                <div className="text-sm bg-white/50 p-2 rounded">3 staff members active</div>
                <div className="text-sm bg-white/50 p-2 rounded">Brisbane North: 5 bookings</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <BarChart className="h-6 w-6 text-green-600" />
                <h4 className="font-semibold text-green-900">Performance</h4>
              </div>
              <div className="space-y-2">
                <div className="text-sm bg-white/50 p-2 rounded">Revenue: $3,420</div>
                <div className="text-sm bg-white/50 p-2 rounded">Efficiency: 92%</div>
                <div className="text-sm bg-white/50 p-2 rounded">Rating: 4.8/5</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-6 w-6 text-purple-600" />
                <h4 className="font-semibold text-purple-900">Team Status</h4>
              </div>
              <div className="space-y-2">
                <div className="text-sm bg-white/50 p-2 rounded">Available: 3 staff</div>
                <div className="text-sm bg-white/50 p-2 rounded">On route: 2 staff</div>
                <div className="text-sm bg-white/50 p-2 rounded">Break: 1 staff</div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h5 className="font-medium mb-3">Quick Actions</h5>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline">Add New Booking</Button>
              <Button size="sm" variant="outline">Manage Staff</Button>
              <Button size="sm" variant="outline">View Reports</Button>
              <Button size="sm" variant="outline">Settings</Button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'booking',
      title: 'Customer Booking',
      description: 'Clean booking experience',
      icon: <MapPin className="h-5 w-5" />,
      demo: (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg border p-6 max-w-md mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Book Inspection</h3>
            <p className="text-gray-600">Quick and easy scheduling</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Property Inspection</option>
                <option>Maintenance Check</option>
                <option>Repair Service</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Location</label>
              <div className="p-3 bg-blue-50 rounded-lg border flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-blue-800">Brisbane North, QLD</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
              <input 
                type="date" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue="2024-12-15"
              />
            </div>
            
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3">
              Find Available Times →
            </Button>
          </div>
          
          <div className="mt-4 text-center text-xs text-gray-500">
            ✓ Instant confirmation • ✓ SMS reminders • ✓ Easy rescheduling
          </div>
        </div>
      )
    },
    {
      id: 'availability',
      title: 'Regional Availability',
      description: 'Smart scheduling system',
      icon: <Calendar className="h-5 w-5" />,
      demo: (
        <div>
          {/* Badge View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg border p-4">
              <h4 className="font-semibold mb-4 text-gray-900">Current Status</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-800">Brisbane North</span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">3 Available</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="font-medium text-orange-800">Gold Coast</span>
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">1 Available</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="font-medium text-red-800">Sunshine Coast</span>
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">Fully Booked</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border p-4">
              <h4 className="font-semibold mb-4 text-gray-900">Next Available</h4>
              <div className="space-y-3">
                <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="font-medium text-blue-900">Tomorrow 9:00 AM</div>
                  <div className="text-sm text-blue-700">John Smith • Brisbane North</div>
                </div>
                <div className="p-3 border border-green-200 rounded-lg bg-green-50">
                  <div className="font-medium text-green-900">Tomorrow 11:30 AM</div>
                  <div className="text-sm text-green-700">Sarah Johnson • Gold Coast</div>
                </div>
                <div className="p-3 border border-purple-200 rounded-lg bg-purple-50">
                  <div className="font-medium text-purple-900">Thursday 2:00 PM</div>
                  <div className="text-sm text-purple-700">Mike Wilson • Sunshine Coast</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Interactive Gantt View */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Interactive Schedule (Drag to reschedule)</h4>
            <RegionalGanttView />
          </div>
        </div>
      )
    }
  ]

  const activeFeature = features.find(f => f.id === activeTab) || features[0]

  if (isMobile) {
    return (
      <div className="space-y-4">
        {features.map((feature) => (
          <AccordionItem
            key={feature.id}
            {...feature}
            isOpen={openMobileItem === feature.id}
            onToggle={() => setOpenMobileItem(openMobileItem === feature.id ? '' : feature.id)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Desktop Horizontal Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
        {features.map((feature) => (
          <TabItem
            key={feature.id}
            {...feature}
            isActive={activeTab === feature.id}
            onClick={() => setActiveTab(feature.id)}
          />
        ))}
      </div>
      
      {/* Demo Content */}
      <div className="min-h-[600px] bg-gray-50 rounded-lg p-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{activeFeature.title}</h3>
          <p className="text-gray-600 text-lg">{activeFeature.description}</p>
        </div>
        
        <div className="overflow-x-auto">
          {activeFeature.demo}
        </div>
      </div>
    </div>
  )
}

export default DemoAccordion