import React, { useState } from 'react'
import { format } from 'date-fns'
import { 
  Download, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Share, 
  FileText,
  Smartphone
} from 'lucide-react'
import { Button } from '../ui/button'
import { Alert, AlertDescription } from '../ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import type { Business } from '../../types/business'

interface BookingReceiptProps {
  bookingId: string
  confirmationCode: string
  businessData: Business | null
  bookingDetails: {
    serviceName: string
    servicePrice?: number
    duration: number
    selectedDate: string
    selectedTime: string
    staffMember: {
      id: string
      name: string
      avatar?: string
    }
    customerInfo: {
      name: string
      email: string
      phone: string
      address: string
      postcode: string
    }
    notes?: string
  }
}

export default function BookingReceipt({ 
  bookingId,
  confirmationCode, 
  businessData, 
  bookingDetails 
}: BookingReceiptProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

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

  // Generate calendar event data
  const generateCalendarEvent = () => {
    const startDate = new Date(`${bookingDetails.selectedDate}T${bookingDetails.selectedTime}`)
    const endDate = new Date(startDate.getTime() + (bookingDetails.duration * 60 * 1000))
    
    const eventData = {
      title: `${bookingDetails.serviceName} - ${businessData?.name}`,
      start: startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''),
      end: endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''),
      description: `Appointment with ${bookingDetails.staffMember.name}\\n${bookingDetails.customerInfo.address}\\nConfirmation: ${confirmationCode}`,
      location: bookingDetails.customerInfo.address
    }

    // Google Calendar URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventData.title)}&dates=${eventData.start}/${eventData.end}&details=${encodeURIComponent(eventData.description)}&location=${encodeURIComponent(eventData.location)}`
    
    // Outlook Calendar URL
    const outlookCalendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(eventData.title)}&startdt=${eventData.start}&enddt=${eventData.end}&body=${encodeURIComponent(eventData.description)}&location=${encodeURIComponent(eventData.location)}`
    
    return { googleCalendarUrl, outlookCalendarUrl }
  }

  const handleDownloadReceipt = async () => {
    setIsDownloading(true)
    try {
      // Create a printable version
      const receiptContent = generateReceiptHTML()
      const blob = new Blob([receiptContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `booking-receipt-${confirmationCode}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading receipt:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShareBooking = async () => {
    setIsSharing(true)
    try {
      const shareData = {
        title: `Booking Confirmation - ${businessData?.name}`,
        text: `My appointment is confirmed for ${format(new Date(bookingDetails.selectedDate), 'EEEE, MMMM do')} at ${formatTime(bookingDetails.selectedTime)}. Confirmation: ${confirmationCode}`,
        url: window.location.href
      }

      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`)
        alert('Booking details copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing booking:', error)
    } finally {
      setIsSharing(false)
    }
  }

  const generateReceiptHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Booking Receipt - ${confirmationCode}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
    .confirmation { font-size: 24px; font-weight: bold; color: #3b82f6; }
    .detail-section { margin-bottom: 20px; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .print-only { display: block; }
    @media screen { .print-only { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${businessData?.name}</h1>
    <div class="confirmation">${confirmationCode}</div>
    <p>Booking Confirmation</p>
  </div>
  
  <div class="detail-section">
    <h3>Service Details</h3>
    <div class="detail-row"><span>Service:</span><span>${bookingDetails.serviceName}</span></div>
    <div class="detail-row"><span>Duration:</span><span>${formatDuration(bookingDetails.duration)}</span></div>
    ${bookingDetails.servicePrice ? `<div class="detail-row"><span>Price:</span><span>$${bookingDetails.servicePrice}</span></div>` : ''}
  </div>

  <div class="detail-section">
    <h3>Appointment Details</h3>
    <div class="detail-row"><span>Date:</span><span>${format(new Date(bookingDetails.selectedDate), 'EEEE, MMMM do, yyyy')}</span></div>
    <div class="detail-row"><span>Time:</span><span>${formatTime(bookingDetails.selectedTime)}</span></div>
    <div class="detail-row"><span>Staff Member:</span><span>${bookingDetails.staffMember.name}</span></div>
  </div>

  <div class="detail-section">
    <h3>Location</h3>
    <div class="detail-row"><span>Address:</span><span>${bookingDetails.customerInfo.address}</span></div>
    <div class="detail-row"><span>Postcode:</span><span>${bookingDetails.customerInfo.postcode}</span></div>
  </div>

  <div class="detail-section">
    <h3>Contact Information</h3>
    <div class="detail-row"><span>Name:</span><span>${bookingDetails.customerInfo.name}</span></div>
    <div class="detail-row"><span>Email:</span><span>${bookingDetails.customerInfo.email}</span></div>
    <div class="detail-row"><span>Phone:</span><span>${bookingDetails.customerInfo.phone}</span></div>
  </div>

  <div class="print-only">
    <p><strong>Business Contact:</strong><br>
    Phone: ${businessData?.phone}<br>
    Email: ${businessData?.email}</p>
  </div>
</body>
</html>`
  }

  const { googleCalendarUrl, outlookCalendarUrl } = generateCalendarEvent()

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Digital Receipt Header */}
      <div className="border-b-2 border-primary-600 pb-6 mb-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Digital Receipt</h2>
          <p className="text-gray-600">Your booking confirmation and receipt</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Button
          variant="outline"
          onClick={handleDownloadReceipt}
          disabled={isDownloading}
          className="flex items-center justify-center"
        >
          {isDownloading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Download
        </Button>

        <Button
          variant="outline"
          onClick={() => window.print()}
          className="flex items-center justify-center"
        >
          <FileText className="w-4 h-4 mr-2" />
          Print
        </Button>

        <Button
          variant="outline"
          onClick={handleShareBooking}
          disabled={isSharing}
          className="flex items-center justify-center"
        >
          {isSharing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
          ) : (
            <Share className="w-4 h-4 mr-2" />
          )}
          Share
        </Button>

        <Button
          variant="outline"
          onClick={() => window.open(googleCalendarUrl, '_blank')}
          className="flex items-center justify-center"
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          Add to Calendar
        </Button>
      </div>

      {/* Receipt Details */}
      <div className="space-y-6">
        {/* Business & Confirmation */}
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{businessData?.name}</h3>
              <p className="text-gray-600">{businessData?.address}</p>
            </div>
            {businessData?.logo && (
              <img src={businessData.logo} alt={businessData.name} className="h-12 w-auto" />
            )}
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-1">{confirmationCode}</div>
            <p className="text-sm text-gray-600">Confirmation Code</p>
          </div>
        </div>

        {/* Service & Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Service Details</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium">{bookingDetails.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{formatDuration(bookingDetails.duration)}</span>
              </div>
              {bookingDetails.servicePrice && (
                <>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold text-lg">${bookingDetails.servicePrice}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Appointment</h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <div className="font-medium">
                    {format(new Date(bookingDetails.selectedDate), 'EEEE, MMMM do, yyyy')}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatTime(bookingDetails.selectedTime)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <User className="h-4 w-4 text-gray-400 mr-2" />
                <div className="flex items-center">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={bookingDetails.staffMember.avatar} />
                    <AvatarFallback className="text-xs">
                      {bookingDetails.staffMember.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{bookingDetails.staffMember.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Service Location</h4>
            <div className="flex items-start">
              <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
              <div>
                <div className="font-medium">{bookingDetails.customerInfo.address}</div>
                <div className="text-sm text-gray-600">{bookingDetails.customerInfo.postcode}</div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Contact Details</h4>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <User className="h-4 w-4 text-gray-400 mr-2" />
                <span>{bookingDetails.customerInfo.name}</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <span>{bookingDetails.customerInfo.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <span>{bookingDetails.customerInfo.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Special Instructions */}
        {bookingDetails.notes && (
          <div className="border border-gray-200 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-3">Special Instructions</h4>
            <p className="text-gray-700">{bookingDetails.notes}</p>
          </div>
        )}

        {/* Add to Calendar Options */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-semibold text-blue-900 mb-4">=Å Add to Calendar</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => window.open(googleCalendarUrl, '_blank')}
              className="justify-start"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Google Calendar
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(outlookCalendarUrl, '_blank')}
              className="justify-start"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Outlook Calendar
            </Button>
          </div>
        </div>

        {/* Business Contact */}
        <div className="border-t pt-6 text-center text-sm text-gray-600">
          <p className="font-medium text-gray-900 mb-2">Need to contact {businessData?.name}?</p>
          <div className="flex justify-center space-x-6">
            <a
              href={`tel:${businessData?.phone}`}
              className="flex items-center text-primary-600 hover:underline"
            >
              <Phone className="w-4 h-4 mr-1" />
              {businessData?.phone}
            </a>
            <a
              href={`mailto:${businessData?.email}`}
              className="flex items-center text-primary-600 hover:underline"
            >
              <Mail className="w-4 h-4 mr-1" />
              {businessData?.email}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}