import React, { useState } from 'react'
import { Search, Filter, Calendar, Clock, MapPin, Phone, Mail } from 'lucide-react'
import { Button } from '../ui/button'
import { format } from 'date-fns'

interface Booking {
  id: string
  date: string
  time: string
  duration: number
  customerName: string
  customerEmail: string
  customerPhone: string
  service: string
  address: string
  postcode: string
  status: 'upcoming' | 'completed' | 'cancelled'
  notes?: string
  price: number
}

export default function StaffBookings() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all')
  
  // Mock bookings data
  const [bookings] = useState<Booking[]>([
    {
      id: '1',
      date: '2025-01-15',
      time: '09:00',
      duration: 60,
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah.johnson@email.com',
      customerPhone: '+61 400 123 456',
      service: 'Property Inspection',
      address: '123 Main St, Sydney NSW',
      postcode: '2000',
      status: 'upcoming',
      notes: 'First time customer, needs detailed explanation',
      price: 150
    },
    {
      id: '2',
      date: '2025-01-14',
      time: '14:30',
      duration: 90,
      customerName: 'Mike Chen',
      customerEmail: 'mike.chen@email.com',
      customerPhone: '+61 400 987 654',
      service: 'Maintenance Check',
      address: '456 Queen St, Sydney NSW',
      postcode: '2000',
      status: 'completed',
      price: 200
    },
    {
      id: '3',
      date: '2025-01-16',
      time: '11:00',
      duration: 45,
      customerName: 'Emma Wilson',
      customerEmail: 'emma.wilson@email.com',
      customerPhone: '+61 400 555 777',
      service: 'Consultation',
      address: '789 King St, Sydney NSW',
      postcode: '2000',
      status: 'upcoming',
      price: 100
    }
  ])

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || booking.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusActions = (booking: Booking) => {
    switch (booking.status) {
      case 'upcoming':
        return (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              Reschedule
            </Button>
            <Button size="sm">
              Contact Customer
            </Button>
          </div>
        )
      case 'completed':
        return (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              View Invoice
            </Button>
            <Button variant="outline" size="sm">
              Add Notes
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Bookings</h2>
        <p className="text-gray-600">Manage all your customer appointments and booking history</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Bookings</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Booking Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-1">Upcoming</h3>
          <p className="text-2xl font-bold text-blue-900">
            {bookings.filter(b => b.status === 'upcoming').length}
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800 mb-1">Completed</h3>
          <p className="text-2xl font-bold text-green-900">
            {bookings.filter(b => b.status === 'completed').length}
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Earnings</h3>
          <p className="text-2xl font-bold text-gray-900">
            ${bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.price, 0)}
          </p>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search criteria' : 'You don\'t have any bookings yet'}
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {booking.service}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(booking.date), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{booking.time} ({booking.duration} min)</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    ${booking.price}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Customer Details</h4>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="font-medium">{booking.customerName}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{booking.customerPhone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{booking.customerEmail}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Service Location</h4>
                  <div className="flex items-start space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <span>{booking.address}</span>
                  </div>
                  <div className="text-sm text-gray-500 ml-6">
                    Postcode: {booking.postcode}
                  </div>
                </div>
              </div>

              {booking.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                  <p className="text-sm text-gray-600">{booking.notes}</p>
                </div>
              )}

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                {getStatusActions(booking)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}