import React, { useState, useEffect } from 'react'
import { format, addDays, addMinutes, startOfHour } from 'date-fns'
import { 
  MapPin, 
  Clock, 
  User, 
  Zap, 
  ArrowRight,
  Star,
  ChevronUp,
  Calendar,
  X,
  Check,
  CreditCard
} from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { AvailabilityService } from '../../lib/database/availability'
import { BookingService } from '../../lib/database/booking'
import { ServiceAreaService } from '../../lib/database/serviceAreas'
import type { Business } from '../../types/business'

interface MobileBookingAppProps {
  businessId: string
  businessData?: Business
}

interface QuickSlot {
  date: string
  time: string
  staffId: string
  staffName: string
  staffAvatar?: string
  regionId: string
  regionName: string
}

interface ServiceType {
  id: string
  name: string
  duration: number
  price?: number
  description?: string
}

interface StaffMember {
  id: string
  name: string
  avatar?: string
  rating: number
  specialties: string[]
  nextAvailable?: string
}

type BookingStep = 'location' | 'service' | 'quick-book' | 'staff-select' | 'time-select' | 'details' | 'confirmation'

export default function MobileBookingApp({ businessId, businessData }: MobileBookingAppProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>('location')
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [availableRegions, setAvailableRegions] = useState<any[]>([])
  const [selectedRegion, setSelectedRegion] = useState<any | null>(null)
  const [services, setServices] = useState<ServiceType[]>([])
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null)
  const [quickSlots, setQuickSlots] = useState<QuickSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<QuickSlot | null>(null)
  const [availableStaff, setAvailableStaff] = useState<StaffMember[]>([])
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Customer details
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    postcode: ''
  })

  const serviceAreaService = new ServiceAreaService()
  const availabilityService = new AvailabilityService()
  const bookingService = new BookingService()

  useEffect(() => {
    loadInitialData()
    getCurrentLocation()
  }, [businessId])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Geolocation error:', error)
          // Fallback to IP-based location or manual region selection
        }
      )
    }
  }

  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      
      // Load service areas (regions) and services
      const [regions, serviceTypes] = await Promise.all([
        serviceAreaService.getServiceAreas(businessId),
        loadServices()
      ])

      setAvailableRegions(regions.filter(r => r.isActive))
      setServices(serviceTypes)

      // Auto-select region if user location is available
      if (userLocation && regions.length > 0) {
        const nearestRegion = findNearestRegion(userLocation, regions)
        if (nearestRegion) {
          setSelectedRegion(nearestRegion)
          setCurrentStep('service')
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadServices = async (): Promise<ServiceType[]> => {
    // Mock data - replace with actual service loading
    return [
      {
        id: 'inspection',
        name: 'Property Inspection',
        duration: 60,
        price: 150,
        description: 'Comprehensive property inspection'
      },
      {
        id: 'maintenance',
        name: 'Property Maintenance',
        duration: 120,
        price: 200,
        description: 'General property maintenance and repairs'
      }
    ]
  }

  const findNearestRegion = (location: {lat: number, lng: number}, regions: any[]) => {
    // Mock implementation - in reality you'd calculate distance based on postcode/coordinates
    return regions[0]
  }

  const loadQuickSlots = async () => {
    if (!selectedRegion || !selectedService) return

    try {
      setIsLoading(true)
      const slots: QuickSlot[] = []
      
      // Check next 7 days for available slots
      for (let i = 0; i < 7; i++) {
        const date = addDays(new Date(), i)
        const dateStr = format(date, 'yyyy-MM-dd')
        
        const availableSlots = await availabilityService.getAvailableSlots(
          businessId,
          selectedRegion.id,
          dateStr
        )

        // Take first 3 slots per day
        availableSlots.slice(0, 3).forEach(slot => {
          slots.push({
            date: dateStr,
            time: slot.time,
            staffId: slot.staffId,
            staffName: slot.staffName,
            staffAvatar: slot.staffAvatar,
            regionId: selectedRegion.id,
            regionName: selectedRegion.name
          })
        })

        if (slots.length >= 6) break // Limit to 6 quick slots
      }

      setQuickSlots(slots.slice(0, 6))
      setCurrentStep('quick-book')
    } catch (error) {
      console.error('Error loading quick slots:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickBook = (slot: QuickSlot) => {
    setSelectedSlot(slot)
    setCurrentStep('details')
  }

  const handleManualSelection = () => {
    setCurrentStep('staff-select')
    setShowModal(true)
    loadAvailableStaff()
  }

  const loadAvailableStaff = async () => {
    if (!selectedRegion || !selectedService) return

    try {
      // Mock staff data - replace with actual staff loading
      const staff: StaffMember[] = [
        {
          id: 'staff1',
          name: 'John Smith',
          avatar: undefined,
          rating: 4.8,
          specialties: ['Inspections', 'Maintenance'],
          nextAvailable: 'Today at 2:00 PM'
        },
        {
          id: 'staff2',
          name: 'Sarah Johnson',
          avatar: undefined,
          rating: 4.9,
          specialties: ['Inspections'],
          nextAvailable: 'Tomorrow at 10:00 AM'
        }
      ]

      setAvailableStaff(staff)
    } catch (error) {
      console.error('Error loading staff:', error)
    }
  }

  const handleStaffSelect = (staff: StaffMember) => {
    setSelectedStaff(staff)
    loadTimeSlots(staff.id)
    setCurrentStep('time-select')
  }

  const loadTimeSlots = async (staffId: string) => {
    if (!selectedRegion) return

    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      const availableSlots = await availabilityService.getAvailableSlots(
        businessId,
        selectedRegion.id,
        today
      )

      const slots = availableSlots
        .filter(slot => slot.staffId === staffId)
        .map(slot => slot.time)
        .slice(0, 8) // Limit to 8 slots

      setTimeSlots(slots)
    } catch (error) {
      console.error('Error loading time slots:', error)
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setShowModal(false)
    setCurrentStep('details')
  }

  const handleBooking = async () => {
    if (!selectedService || !customerDetails.name || !customerDetails.email || !customerDetails.phone) {
      return
    }

    try {
      setIsLoading(true)

      const bookingData = {
        businessId,
        staffId: selectedSlot?.staffId || selectedStaff?.id || '',
        serviceId: selectedService.id,
        date: selectedSlot?.date || format(new Date(), 'yyyy-MM-dd'),
        time: selectedSlot?.time || selectedTime,
        duration: selectedService.duration,
        location: {
          address: customerDetails.address,
          postcode: customerDetails.postcode,
          region: selectedRegion?.id || ''
        },
        customer: {
          firstName: customerDetails.name.split(' ')[0],
          lastName: customerDetails.name.split(' ').slice(1).join(' ') || '',
          email: customerDetails.email,
          phone: customerDetails.phone
        },
        price: selectedService.price || 0,
        status: 'pending' as const
      }

      const bookingId = await bookingService.createBooking(bookingData)
      setCurrentStep('confirmation')
    } catch (error) {
      console.error('Error creating booking:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return format(date, 'h:mm a')
  }

  const formatDate = (date: string) => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')
    
    if (date === today) return 'Today'
    if (date === tomorrow) return 'Tomorrow'
    return format(new Date(date), 'EEE, MMM do')
  }

  // Location Selection Step
  if (currentStep === 'location') {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-6 py-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Where do you need service?
            </h1>
            <p className="text-gray-600">
              Select your location to see available times
            </p>
          </div>

          <div className="space-y-4">
            {availableRegions.map(region => (
              <Button
                key={region.id}
                variant="outline"
                onClick={() => {
                  setSelectedRegion(region)
                  setCurrentStep('service')
                }}
                className="w-full p-6 h-auto justify-start hover:border-primary-500 transition-colors"
              >
                <div className="flex items-center w-full">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: region.color }}
                  />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-gray-900">{region.name}</div>
                    <div className="text-sm text-gray-600">{region.description}</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Service Selection Step
  if (currentStep === 'service') {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-6 py-8">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => setCurrentStep('location')}
              className="mr-4"
            >
              <ArrowRight className="w-5 h-5 text-gray-600 rotate-180" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Select Service</h1>
              <p className="text-sm text-gray-600 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {selectedRegion?.name}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {services.map(service => (
              <Button
                key={service.id}
                variant="outline"
                onClick={() => {
                  setSelectedService(service)
                  loadQuickSlots()
                }}
                className="w-full p-6 h-auto justify-start hover:border-primary-500 transition-colors"
              >
                <div className="flex justify-between items-start w-full">
                  <div className="text-left">
                    <div className="font-semibold text-gray-900 mb-1">{service.name}</div>
                    <div className="text-sm text-gray-600 mb-2">{service.description}</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {service.duration} minutes
                    </div>
                  </div>
                  {service.price && (
                    <div className="text-right">
                      <div className="font-bold text-gray-900">${service.price}</div>
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Quick Book Step
  if (currentStep === 'quick-book') {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-6 py-8">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => setCurrentStep('service')}
              className="mr-4"
            >
              <ArrowRight className="w-5 h-5 text-gray-600 rotate-180" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Available Times</h1>
              <p className="text-sm text-gray-600">{selectedService?.name}</p>
            </div>
          </div>

          {/* Quick Book Slots */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Zap className="w-5 h-5 text-yellow-500 mr-2" />
              <h2 className="font-semibold text-gray-900">Quick Book</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {quickSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickBook(slot)}
                  className="p-4 border-2 border-gray-200 rounded-xl text-left hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="font-semibold text-gray-900 mb-1">
                    {formatDate(slot.date)}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {formatTime(slot.time)}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {slot.staffName}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* More Options */}
          <button
            onClick={handleManualSelection}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-center hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <Calendar className="w-6 h-6 mx-auto text-gray-400 mb-2" />
            <div className="font-medium text-gray-700">More times & staff</div>
            <div className="text-sm text-gray-500">Choose specific time & team member</div>
          </button>
        </div>
      </div>
    )
  }

  // Bottom Modal for Staff/Time Selection
  if (showModal) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {currentStep === 'staff-select' ? 'Choose Team Member' : 'Select Time'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Staff Selection */}
            {currentStep === 'staff-select' && (
              <div className="space-y-4">
                {availableStaff.map(staff => (
                  <button
                    key={staff.id}
                    onClick={() => handleStaffSelect(staff)}
                    className="w-full p-4 border border-gray-200 rounded-xl text-left hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12 mr-4">
                        <AvatarImage src={staff.avatar} />
                        <AvatarFallback>{staff.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{staff.name}</div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <Star className="w-3 h-3 text-yellow-500 mr-1" />
                          {staff.rating} " {staff.specialties.join(', ')}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          Next available: {staff.nextAvailable}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Time Selection */}
            {currentStep === 'time-select' && (
              <div className="grid grid-cols-2 gap-3">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    className="p-4 border border-gray-200 rounded-xl text-center hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className="font-semibold text-gray-900">
                      {formatTime(time)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Customer Details Step
  if (currentStep === 'details') {
    return (
      <div className="min-h-screen bg-white">
        <div className="px-6 py-8">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => setCurrentStep('quick-book')}
              className="mr-4"
            >
              <ArrowRight className="w-5 h-5 text-gray-600 rotate-180" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Almost done</h1>
          </div>

          {/* Booking Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="font-semibold text-blue-900 mb-2">Your Booking</div>
            <div className="text-sm text-blue-800">
              {selectedService?.name} " {formatDate(selectedSlot?.date || format(new Date(), 'yyyy-MM-dd'))} at {formatTime(selectedSlot?.time || selectedTime)}
            </div>
            <div className="text-sm text-blue-600 mt-1">
              with {selectedSlot?.staffName || selectedStaff?.name}
            </div>
          </div>

          {/* Contact Form */}
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Full name"
              value={customerDetails.name}
              onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
              className="h-12"
            />
            <Input
              type="email"
              placeholder="Email address"
              value={customerDetails.email}
              onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})}
              className="h-12"
            />
            <Input
              type="tel"
              placeholder="Phone number"
              value={customerDetails.phone}
              onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
              className="h-12"
            />
            <Input
              type="text"
              placeholder="Property address"
              value={customerDetails.address}
              onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})}
              className="h-12"
            />
            <Input
              type="text"
              placeholder="Postcode"
              value={customerDetails.postcode}
              onChange={(e) => setCustomerDetails({...customerDetails, postcode: e.target.value})}
              className="h-12"
            />
          </div>

          {/* Book Button */}
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-200">
            <Button
              onClick={handleBooking}
              disabled={isLoading || !customerDetails.name || !customerDetails.email || !customerDetails.phone}
              className="w-full h-12 bg-primary-600 hover:bg-primary-700"
              size="lg"
            >
              {isLoading ? 'Booking...' : `Book Now ${selectedService?.price ? `" $${selectedService.price}` : ''}`}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Confirmation Step
  if (currentStep === 'confirmation') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="px-6 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 mb-8">
            We'll send you a confirmation email shortly.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Book Another
          </Button>
        </div>
      </div>
    )
  }

  return null
}