import React, { useState } from 'react'
import { User, Mail, Phone, MessageSquare } from 'lucide-react'
import { Button } from '../ui/button'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { useAppStore } from '../../lib/store'
import { format } from 'date-fns'

interface CustomerDetailsProps {
  onNext: () => void
  onBack: () => void
  businessName: string
}

export default function CustomerDetails({ 
  onNext, 
  onBack, 
  businessName 
}: CustomerDetailsProps) {
  const { customerBooking, updateCustomerBooking } = useAppStore()
  const [formData, setFormData] = useState({
    name: customerBooking.customerInfo.name || '',
    email: customerBooking.customerInfo.email || '',
    phone: customerBooking.customerInfo.phone || '',
    notes: customerBooking.notes || ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[\d\s\-\+\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateForm()) return

    updateCustomerBooking({
      customerInfo: {
        ...customerBooking.customerInfo,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim()
      },
      notes: formData.notes.trim()
    })

    onNext()
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return format(date, 'h:mm a')
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Your Details
        </h2>
        <p className="text-gray-600 text-lg">
          Tell us how to reach you about your appointment
        </p>
      </div>

      {/* Booking Summary */}
      <div className="mb-8 p-6 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-xl">
        <h3 className="font-semibold text-gray-900 mb-4">Appointment Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Service:</span>
            <span className="font-medium">{customerBooking.appointmentType.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">
              {customerBooking.selectedDate && format(new Date(customerBooking.selectedDate), 'EEEE, MMMM do, yyyy')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Time:</span>
            <span className="font-medium">
              {customerBooking.selectedTime && formatTime(customerBooking.selectedTime)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Staff:</span>
            <span className="font-medium">{customerBooking.staffMember?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Location:</span>
            <span className="font-medium">{customerBooking.customerInfo.address}</span>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="card">
        <div className="card-body p-8">
          <div className="space-y-6">
            {/* Name */}
            <div className="form-group">
              <label className="form-label text-lg flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                Full Name *
              </label>
              <input
                type="text"
                className={`form-input text-lg py-4 ${errors.name ? 'border-red-500' : ''}`}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="John Smith"
                required
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label text-lg flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                Email Address *
              </label>
              <input
                type="email"
                className={`form-input text-lg py-4 ${errors.email ? 'border-red-500' : ''}`}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="john@example.com"
                required
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                We'll send your confirmation and reminders here
              </p>
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label text-lg flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-500" />
                Phone Number *
              </label>
              <input
                type="tel"
                className={`form-input text-lg py-4 ${errors.phone ? 'border-red-500' : ''}`}
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+61 XXX XXX XXX"
                required
              />
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                In case we need to contact you about your appointment
              </p>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label text-lg flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                Special Requests (Optional)
              </label>
              <textarea
                className="form-input text-lg py-4"
                rows={4}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any special requirements or notes for our team..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <Alert className="mt-6">
        <AlertTitle>Privacy Notice</AlertTitle>
        <AlertDescription>
          Your information will only be used to manage your appointment and will be shared with {businessName}. 
          We won't send you marketing emails unless you opt in.
        </AlertDescription>
      </Alert>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        <Button variant="outline" size="lg" onClick={onBack}>
          ← Back to Date & Time
        </Button>
        
        <Button 
          size="lg" 
          onClick={handleNext}
        >
          Review Booking →
        </Button>
      </div>
    </div>
  )
}