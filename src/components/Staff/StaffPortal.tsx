import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Users, Settings, BarChart, Navigation } from 'lucide-react'
import { Button } from '../ui/button'
import { useAuthStore } from '../../lib/authStore'
import AvailabilityCalendar from './AvailabilityCalendar'
import StaffSchedule from './StaffSchedule'
import StaffBookings from './StaffBookings'
import StaffProfile from './StaffProfile'
import StaffLocationScheduler from './StaffLocationScheduler'

type TabType = 'availability' | 'locations' | 'schedule' | 'bookings' | 'profile' | 'analytics'

export default function StaffPortal() {
  const [activeTab, setActiveTab] = useState<TabType>('availability')
  const [regions, setRegions] = useState([])
  const { user } = useAuthStore()

  const tabs = [
    { id: 'availability', name: 'Availability', icon: Calendar },
    { id: 'locations', name: 'Location Schedule', icon: Navigation },
    { id: 'schedule', name: 'Schedule', icon: Clock },
    { id: 'bookings', name: 'Bookings', icon: Users },
    { id: 'profile', name: 'Profile', icon: Settings },
    { id: 'analytics', name: 'Analytics', icon: BarChart }
  ] as const

  useEffect(() => {
    // Load staff regions and data
    loadStaffData()
  }, [user])

  const loadStaffData = async () => {
    // This would load staff-specific regions and settings
    // For now, using mock data
    setRegions([
      { id: '1', name: 'North Region', color: '#3B82F6' },
      { id: '2', name: 'South Region', color: '#10B981' },
      { id: '3', name: 'East Region', color: '#F59E0B' }
    ])
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'availability':
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Your Availability</h2>
              <p className="text-gray-600">Set when you're available to work in different regions</p>
            </div>
            <AvailabilityCalendar regions={regions} />
          </div>
        )
      case 'locations':
        return <StaffLocationScheduler />
      case 'schedule':
        return <StaffSchedule />
      case 'bookings':
        return <StaffBookings />
      case 'profile':
        return <StaffProfile />
      case 'analytics':
        return (
          <div className="text-center py-12">
            <BarChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-600">
              View your performance metrics, earnings, and booking statistics
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-sm font-medium text-gray-500 mb-1">This Month</h4>
                <p className="text-3xl font-bold text-gray-900">24</p>
                <p className="text-sm text-gray-600">Bookings</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Total Earnings</h4>
                <p className="text-3xl font-bold text-green-600">$2,480</p>
                <p className="text-sm text-gray-600">This month</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Rating</h4>
                <p className="text-3xl font-bold text-yellow-500">4.8</p>
                <p className="text-sm text-gray-600">Average rating</p>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.user_metadata?.first_name || 'Staff Member'}
          </h1>
          <p className="text-gray-600">
            Manage your schedule, availability, and view your upcoming bookings
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">5</p>
                <p className="text-sm text-gray-600">Available Days</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-sm text-gray-600">Today's Bookings</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">6h</p>
                <p className="text-sm text-gray-600">Work Time Today</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">2</p>
                <p className="text-sm text-gray-600">Active Regions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}