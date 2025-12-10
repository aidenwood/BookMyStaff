import React, { useState, useEffect } from 'react'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
import { Clock, MapPin, User, Phone } from 'lucide-react'
import { Button } from '../ui/button'

interface BookingSlot {
  id: string
  time: string
  duration: number
  customerName: string
  customerPhone: string
  service: string
  address: string
  status: 'confirmed' | 'pending' | 'completed'
}

export default function StaffSchedule() {
  const [selectedWeek, setSelectedWeek] = useState(new Date())
  const [bookings, setBookings] = useState<BookingSlot[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const weekDays = Array.from({ length: 7 }, (_, i) => 
    addDays(startOfWeek(selectedWeek), i)
  )

  // Mock bookings data
  useEffect(() => {
    const mockBookings: BookingSlot[] = [
      {
        id: '1',
        time: '09:00',
        duration: 60,
        customerName: 'Sarah Johnson',
        customerPhone: '+61 400 123 456',
        service: 'Property Inspection',
        address: '123 Main St, Sydney NSW 2000',
        status: 'confirmed'
      },
      {
        id: '2',
        time: '11:30',
        duration: 90,
        customerName: 'Mike Chen',
        customerPhone: '+61 400 987 654',
        service: 'Maintenance Check',
        address: '456 Queen St, Sydney NSW 2000',
        status: 'confirmed'
      },
      {
        id: '3',
        time: '14:00',
        duration: 45,
        customerName: 'Emma Wilson',
        customerPhone: '+61 400 555 777',
        service: 'Consultation',
        address: '789 King St, Sydney NSW 2000',
        status: 'pending'
      }
    ]
    setBookings(mockBookings)
  }, [])

  const getTodaysBookings = () => {
    return bookings.filter(booking => 
      // For demo, showing all bookings for today
      true
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Schedule</h2>
        <p className="text-gray-600">View and manage your upcoming appointments</p>
      </div>

      {/* Week Navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Week of {format(startOfWeek(selectedWeek), 'MMMM d, yyyy')}
          </h3>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setSelectedWeek(addDays(selectedWeek, -7))}
            >
              Previous Week
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedWeek(addDays(selectedWeek, 7))}
            >
              Next Week
            </Button>
          </div>
        </div>
      </div>

      {/* Week Calendar */}
      <div className="grid grid-cols-7 gap-4 mb-8">
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            onClick={() => setSelectedDate(day)}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              isSameDay(day, selectedDate)
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">
                {format(day, 'EEE')}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {format(day, 'd')}
              </p>
              <div className="mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mx-auto"></div>
                <p className="text-xs text-gray-500 mt-1">3 bookings</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Day Schedule */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          <p className="text-sm text-gray-600">
            {getTodaysBookings().length} appointments scheduled
          </p>
        </div>

        <div className="p-6">
          {getTodaysBookings().length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No appointments</h4>
              <p className="text-gray-600">You don't have any bookings for this day.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getTodaysBookings().map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {booking.time}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({booking.duration} min)
                          </span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">{booking.service}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span>{booking.customerName}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                            <Phone className="w-4 h-4" />
                            <span>{booking.customerPhone}</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-start space-x-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mt-0.5" />
                            <span>{booking.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      {booking.status === 'pending' && (
                        <Button size="sm">
                          Confirm
                        </Button>
                      )}
                      {booking.status === 'confirmed' && (
                        <Button size="sm" variant="success">
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <Button variant="outline" className="flex-1">
          Request Time Off
        </Button>
        <Button variant="outline" className="flex-1">
          Update Availability
        </Button>
        <Button className="flex-1">
          View All Bookings
        </Button>
      </div>
    </div>
  )
}