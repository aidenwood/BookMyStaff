import React, { useState, useEffect } from 'react'
import { format, addDays, isBefore, startOfDay } from 'date-fns'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Edit3, 
  X, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Search
} from 'lucide-react'
import { Button } from '../ui/button'
import { Alert, AlertDescription } from '../ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Calendar } from '../ui/calendar'
import { BookingService } from '../../lib/database/booking'
import { AvailabilityService } from '../../lib/database/availability'
import type { Business } from '../../types/business'

interface BookingData {
  id: string
  confirmationCode: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  serviceName: string
  servicePrice?: number
  duration: number
  date: string
  time: string
  staffMember: {
    id: string
    name: string
    avatar?: string
  }
  customer: {
    name: string
    email: string
    phone: string
    address: string
    postcode: string
  }
  business: {
    name: string
    phone: string
    email: string
  }
  notes?: string
  createdAt: string
}

interface AvailableSlot {
  time: string
  staffId: string
  staffName: string
}

export default function BookingManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState<'none' | 'reschedule' | 'cancel'>('none')
  
  // Reschedule state
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])
  const [availableDates, setAvailableDates] = useState<Date[]>([])
  const [isRescheduling, setIsRescheduling] = useState(false)
  
  // Cancel state
  const [cancelReason, setCancelReason] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)

  const bookingService = new BookingService()
  const availabilityService = new AvailabilityService()

  const handleSearchBooking = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError(null)
    setBookingData(null)

    try {
      // Search can be by confirmation code or email
      const booking = await bookingService.findBooking(searchQuery.trim())
      
      if (booking) {
        setBookingData(booking)
      } else {
        setError('No booking found. Please check your confirmation code or email address.')
      }
    } catch (error) {
      console.error('Error searching booking:', error)
      setError('Unable to search for booking. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const loadAvailableDates = async (businessId: string, regionId: string) => {
    try {
      const endDate = addDays(new Date(), 30) // Next 30 days
      const dates: Date[] = []

      for (let date = new Date(); date <= endDate; date = addDays(date, 1)) {
        if (!isBefore(date, startOfDay(new Date()))) {
          const dateStr = format(date, 'yyyy-MM-dd')
          const slots = await availabilityService.getAvailableSlots(businessId, regionId, dateStr)
          if (slots.length > 0) {
            dates.push(new Date(date))
          }
        }
      }

      setAvailableDates(dates)
    } catch (error) {
      console.error('Error loading available dates:', error)
    }
  }

  const loadAvailableSlots = async (date: Date) => {
    if (!bookingData) return

    try {
      const dateStr = format(date, 'yyyy-MM-dd')
      const slots = await availabilityService.getAvailableSlots(
        bookingData.business.id || '', // You'll need to add businessId to BookingData
        bookingData.customer.regionId || '', // You'll need to add regionId to customer data
        dateStr
      )
      setAvailableSlots(slots)
    } catch (error) {
      console.error('Error loading available slots:', error)
      setAvailableSlots([])
    }
  }

  const handleStartReschedule = () => {
    setEditMode('reschedule')
    if (bookingData) {
      // loadAvailableDates(bookingData.business.id, bookingData.customer.regionId)
    }
  }

  const handleRescheduleBooking = async () => {
    if (!bookingData || !selectedDate || !selectedTime) return

    setIsRescheduling(true)
    setError(null)

    try {
      await bookingService.rescheduleBooking(
        bookingData.id,
        format(selectedDate, 'yyyy-MM-dd'),
        selectedTime
      )

      // Update booking data
      setBookingData({
        ...bookingData,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime
      })

      setEditMode('none')
      setSelectedDate(undefined)
      setSelectedTime('')
      
      // Show success message
      alert('Booking successfully rescheduled!')
    } catch (error) {
      console.error('Error rescheduling booking:', error)
      setError('Failed to reschedule booking. Please try again or contact support.')
    } finally {
      setIsRescheduling(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!bookingData) return

    setIsCancelling(true)
    setError(null)

    try {
      await bookingService.cancelBooking(bookingData.id, cancelReason)
      
      // Update booking status
      setBookingData({
        ...bookingData,
        status: 'cancelled'
      })

      setEditMode('none')
      setCancelReason('')
      
      // Show success message
      alert('Booking successfully cancelled.')
    } catch (error) {
      console.error('Error cancelling booking:', error)
      setError('Failed to cancel booking. Please try again or contact support.')
    } finally {
      setIsCancelling(false)
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return format(date, 'h:mm a')
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours} hour${hours > 1 ? 's' : ''}`
  }

  const canModify = bookingData && 
    bookingData.status !== 'cancelled' && 
    bookingData.status !== 'completed' &&
    new Date(`${bookingData.date}T${bookingData.time}`) > addDays(new Date(), 1) // At least 24 hours in advance

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Your Booking</h1>
        <p className="text-gray-600">Reschedule or cancel your appointment</p>
      </div>

      {/* Search Form */}
      {!bookingData && (
        <div className="bg-white border border-gray-200 rounded-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Find Your Booking</h2>
            <p className="text-gray-600">Enter your confirmation code or email address</p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Confirmation code or email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearchBooking()}
              />
              <Button 
                onClick={handleSearchBooking}
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Booking Details */}
      {bookingData && editMode === 'none' && (
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="text-center">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(bookingData.status)}`}>
              {bookingData.status.charAt(0).toUpperCase() + bookingData.status.slice(1)}
            </span>
          </div>

          {/* Booking Info Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Service Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600">Service:</span>
                    <span className="ml-2 font-medium">{bookingData.serviceName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <span className="ml-2 font-medium">{formatDuration(bookingData.duration)}</span>
                  </div>
                  {bookingData.servicePrice && (
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <span className="ml-2 font-medium">${bookingData.servicePrice}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Confirmation:</span>
                    <span className="ml-2 font-mono font-medium">{bookingData.confirmationCode}</span>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <div className="font-medium">
                        {format(new Date(bookingData.date), 'EEEE, MMMM do, yyyy')}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatTime(bookingData.time)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={bookingData.staffMember.avatar} />
                        <AvatarFallback>
                          {bookingData.staffMember.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{bookingData.staffMember.name}</span>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <div className="font-medium">{bookingData.customer.address}</div>
                      <div className="text-sm text-gray-600">{bookingData.customer.postcode}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {bookingData.notes && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="font-medium text-gray-900 mb-2">Special Instructions</h4>
                <p className="text-gray-700">{bookingData.notes}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {canModify && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={handleStartReschedule}
                className="flex items-center"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Reschedule Appointment
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setEditMode('cancel')}
                className="flex items-center text-red-600 border-red-300 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel Appointment
              </Button>
            </div>
          )}

          {!canModify && bookingData.status !== 'cancelled' && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Appointments can only be modified or cancelled at least 24 hours in advance.
                Please contact {bookingData.business.name} at {bookingData.business.phone} for assistance.
              </AlertDescription>
            </Alert>
          )}

          {/* Back to Search */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => {
                setBookingData(null)
                setSearchQuery('')
                setError(null)
              }}
            >
              Search Another Booking
            </Button>
          </div>
        </div>
      )}

      {/* Reschedule Mode */}
      {editMode === 'reschedule' && bookingData && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reschedule Your Appointment</h2>
            <p className="text-gray-600">Select a new date and time</p>
          </div>

          {/* Current vs New */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="text-center">
                <h4 className="font-medium text-gray-900 mb-2">Current</h4>
                <div className="text-sm text-gray-600">
                  {format(new Date(bookingData.date), 'MMM do')} at {formatTime(bookingData.time)}
                </div>
              </div>
              
              <div className="text-center">
                <ArrowRight className="w-5 h-5 text-blue-600 mx-auto" />
              </div>
              
              <div className="text-center">
                <h4 className="font-medium text-gray-900 mb-2">New</h4>
                <div className="text-sm text-gray-600">
                  {selectedDate && selectedTime 
                    ? `${format(selectedDate, 'MMM do')} at ${formatTime(selectedTime)}`
                    : 'Select new date & time'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select New Date</h3>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date)
                    setSelectedTime('')
                    if (date) loadAvailableSlots(date)
                  }}
                  disabled={(date) => isBefore(date, addDays(new Date(), 1))}
                  availableDates={availableDates}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Times</h3>
              {selectedDate ? (
                <div className="grid grid-cols-2 gap-3">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      variant={selectedTime === slot.time ? "default" : "outline"}
                      onClick={() => setSelectedTime(slot.time)}
                      className="justify-center"
                    >
                      {formatTime(slot.time)}
                    </Button>
                  ))}
                  {availableSlots.length === 0 && (
                    <p className="text-gray-500 col-span-2 text-center py-4">
                      No available times on this date
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Select a date to see available times
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setEditMode('none')}
              disabled={isRescheduling}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRescheduleBooking}
              disabled={!selectedDate || !selectedTime || isRescheduling}
            >
              {isRescheduling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Rescheduling...
                </>
              ) : (
                'Confirm Reschedule'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Cancel Mode */}
      {editMode === 'cancel' && bookingData && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Cancel Your Appointment</h2>
            <p className="text-gray-600">We're sorry to see you go. Please let us know why you're cancelling.</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-2xl mx-auto">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation (optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Please let us know why you're cancelling..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows={4}
                />
              </div>

              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Once cancelled, this appointment cannot be recovered. You'll need to make a new booking if you change your mind.
                </AlertDescription>
              </Alert>
            </div>

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setEditMode('none')}
                disabled={isCancelling}
              >
                Keep Appointment
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelBooking}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cancelling...
                  </>
                ) : (
                  'Cancel Appointment'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}