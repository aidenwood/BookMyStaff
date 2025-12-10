import React, { useState } from 'react'
import { format } from 'date-fns'
import { CheckCircle, Calendar, Clock, User, MapPin, Phone, Mail, MessageSquare, FileText } from 'lucide-react'
import { Button } from '../ui/button'
import { Alert, AlertDescription } from '../ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { useAppStore } from '../../lib/store'
import { BookingService } from '../../lib/database/booking'
import BookingReceipt from './BookingReceipt'
import type { Business } from '../../types/business'

interface BookingConfirmationProps {
  businessId: string
  businessData: Business | null
  onBack: () => void
  onComplete?: (bookingId: string) => void
}

export default function BookingConfirmation({ 
  businessId, 
  businessData, 
  onBack, 
  onComplete 
}: BookingConfirmationProps) {
  const { customerBooking, resetCustomerBooking } = useAppStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [confirmationCode, setConfirmationCode] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [bookingId, setBookingId] = useState<string>('')

  const bookingService = new BookingService()

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

  const handleConfirmBooking = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      if (!customerBooking.customerInfo || !customerBooking.selectedDate || !customerBooking.selectedTime || !customerBooking.staffMember || !customerBooking.appointmentType) {
        throw new Error('Missing required booking information')
      }

      // Prepare booking data
      const bookingRequest = {
        businessId,
        staffId: customerBooking.staffMember.id,
        serviceId: customerBooking.appointmentType.id,
        date: customerBooking.selectedDate,
        time: customerBooking.selectedTime,
        duration: customerBooking.appointmentType.duration || 60,
        location: {
          address: customerBooking.customerInfo.address,
          postcode: customerBooking.customerInfo.postcode,
          region: customerBooking.selectedRegion || ''
        },
        customer: {
          firstName: customerBooking.customerInfo.name.split(' ')[0] || customerBooking.customerInfo.name,
          lastName: customerBooking.customerInfo.name.split(' ').slice(1).join(' ') || '',
          email: customerBooking.customerInfo.email,
          phone: customerBooking.customerInfo.phone
        },
        notes: customerBooking.notes,
        price: customerBooking.appointmentType.price || 0,
        status: 'pending' as const
      }

      // Create booking in database
      const newBookingId = await bookingService.createBooking(bookingRequest)
      
      setBookingId(newBookingId)
      setConfirmationCode(newBookingId.slice(-8).toUpperCase())
      setIsConfirmed(true)
      
      // Clear booking data
      resetCustomerBooking()
      
      // Notify parent component
      onComplete?.(newBookingId)

    } catch (error) {
      console.error('Error confirming booking:', error)
      setError(error instanceof Error ? error.message : 'Failed to confirm booking. Please try again or contact us directly.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isConfirmed) {
    // Show receipt if requested
    if (showReceipt) {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setShowReceipt(false)}
            >
              ← Back to Confirmation
            </Button>
            <h2 className="text-2xl font-bold text-gray-900">Booking Receipt</h2>
            <div></div>
          </div>
          
          <BookingReceipt
            bookingId={bookingId}
            confirmationCode={confirmationCode}
            businessData={businessData}
            bookingDetails={{
              serviceName: customerBooking.appointmentType?.name || '',
              servicePrice: customerBooking.appointmentType?.price,
              duration: customerBooking.duration || 60,
              selectedDate: customerBooking.selectedDate || '',
              selectedTime: customerBooking.selectedTime || '',
              staffMember: {
                id: customerBooking.staffMember?.id || '',
                name: customerBooking.staffMember?.name || '',
                avatar: customerBooking.staffMember?.avatar
              },
              customerInfo: {
                name: customerBooking.customerInfo?.name || '',
                email: customerBooking.customerInfo?.email || '',
                phone: customerBooking.customerInfo?.phone || '',
                address: customerBooking.customerInfo?.address || '',
                postcode: customerBooking.customerInfo?.postcode || ''
              },
              notes: customerBooking.notes
            }}
          />
        </div>
      )
    }

    return (
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Booking Confirmed!
        </h2>
        
        <p className="text-lg text-gray-600 mb-8">
          Your appointment has been successfully booked with {businessData?.name}.
        </p>

        {/* Confirmation Details */}
        <div className="card">
          <div className="card-body p-8">
            <div className="mb-6">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {confirmationCode}
              </div>
              <p className="text-sm text-gray-600">Confirmation Code</p>
            </div>

            <div className="space-y-4 text-left">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium">
                    {customerBooking.selectedDate && format(new Date(customerBooking.selectedDate), 'EEEE, MMMM do, yyyy')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {customerBooking.selectedTime && formatTime(customerBooking.selectedTime)} • {formatDuration(customerBooking.duration)}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={customerBooking.staffMember?.avatar} />
                    <AvatarFallback>
                      {customerBooking.staffMember?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{customerBooking.staffMember?.name}</span>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium">{customerBooking.customerInfo.address}</p>
                  <p className="text-sm text-gray-600">{customerBooking.customerInfo.postcode}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl text-left">
          <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              You'll receive a confirmation email shortly
            </li>
            <li className="flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              Our team may call to confirm details
            </li>
            <li className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              You'll get a reminder 24 hours before
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Questions about your booking?</p>
          <p>
            Contact {businessData?.name} at{' '}
            <a href={`tel:${businessData?.phone}`} className="text-primary-600 hover:underline">
              {businessData?.phone}
            </a>
            {' '}or{' '}
            <a href={`mailto:${businessData?.email}`} className="text-primary-600 hover:underline">
              {businessData?.email}
            </a>
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => setShowReceipt(true)}
            className="flex items-center justify-center"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Receipt
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.print()}
            className="flex items-center justify-center"
          >
            Print Confirmation
          </Button>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/'}
          >
            Book Another
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Review & Confirm
        </h2>
        <p className="text-gray-600 text-lg">
          Please review your booking details before confirming
        </p>
      </div>

      {/* Booking Details */}
      <div className="space-y-6">
        {/* Service Details */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Appointment Details</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium">{customerBooking.appointmentType.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{formatDuration(customerBooking.duration)}</span>
            </div>
            {customerBooking.appointmentType.price && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Price:</span>
                <span className="font-medium text-lg">${customerBooking.appointmentType.price}</span>
              </div>
            )}
          </div>
        </div>

        {/* Date & Time */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">When & Who</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium">
                  {customerBooking.selectedDate && format(new Date(customerBooking.selectedDate), 'EEEE, MMMM do, yyyy')}
                </p>
                <p className="text-sm text-gray-600">
                  {customerBooking.selectedTime && formatTime(customerBooking.selectedTime)}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={customerBooking.staffMember?.avatar} />
                  <AvatarFallback>
                    {customerBooking.staffMember?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{customerBooking.staffMember?.name}</p>
                  <div className="flex items-center text-sm text-gray-600">
                    ⭐ {customerBooking.staffMember?.rating}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Location</h3>
          </div>
          <div className="card-body">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="font-medium">{customerBooking.customerInfo.address}</p>
                <p className="text-sm text-gray-600">{customerBooking.customerInfo.postcode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">Contact Information</h3>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <span className="font-medium">{customerBooking.customerInfo.name}</span>
            </div>
            
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <span>{customerBooking.customerInfo.email}</span>
            </div>
            
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-gray-400 mr-3" />
              <span>{customerBooking.customerInfo.phone}</span>
            </div>

            {customerBooking.notes && (
              <div className="flex items-start">
                <MessageSquare className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <p className="text-gray-700">{customerBooking.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          By confirming this booking, you agree to our terms of service and cancellation policy. 
          You can cancel or reschedule up to 24 hours before your appointment.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        <Button variant="outline" size="lg" onClick={onBack} disabled={isSubmitting}>
          ← Back to Details
        </Button>
        
        <Button 
          size="lg" 
          onClick={handleConfirmBooking}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Confirming...
            </>
          ) : (
            'Confirm Booking'
          )}
        </Button>
      </div>
    </div>
  )
}