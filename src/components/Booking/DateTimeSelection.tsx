import React, { useState, useEffect } from 'react'
import { format, addDays, isBefore, startOfDay, parseISO } from 'date-fns'
import { Calendar as CalendarIcon, Clock, User, MapPin, Zap } from 'lucide-react'
import { Button } from '../ui/button'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Alert, AlertDescription } from '../ui/alert'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../lib/store'
import { AvailabilityService } from '../../lib/database/availability'
import type { RegionConfig } from '../../types/regions'
import type { StaffMember } from '../../types/appointment'
import '../../styles/calendar.css'

interface DateTimeSelectionProps {
  businessId: string
  regions: RegionConfig[]
  onNext: () => void
  onBack: () => void
}

interface AvailableSlot {
  time: string
  staffId: string
  staffName: string
  staffAvatar?: string
}

interface StaffWithSlots {
  staff: {
    id: string
    name: string
    avatar?: string
    rating?: number
  }
  slots: string[]
}

export default function DateTimeSelection({ 
  businessId, 
  regions, 
  onNext, 
  onBack 
}: DateTimeSelectionProps) {
  const { customerBooking, updateCustomerBooking, selectedRegion } = useAppStore()
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])
  const [staffWithSlots, setStaffWithSlots] = useState<StaffWithSlots[]>([])
  const [availableDates, setAvailableDates] = useState<Date[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isQuickBooking, setIsQuickBooking] = useState(false)

  const availabilityService = new AvailabilityService()

  useEffect(() => {
    if (selectedRegion) {
      loadAvailableDates()
    }
  }, [selectedRegion])

  useEffect(() => {
    if (selectedDate && selectedRegion) {
      loadAvailableSlots()
    }
  }, [selectedDate, selectedRegion])

  const loadAvailableDates = async () => {
    if (!selectedRegion) return

    try {
      // Load available dates for the next 60 days
      const endDate = addDays(new Date(), 60)
      const dates: Date[] = []

      for (let date = new Date(); date <= endDate; date = addDays(date, 1)) {
        if (!isBefore(date, startOfDay(new Date()))) {
          const dateStr = format(date, 'yyyy-MM-dd')
          const slots = await availabilityService.getAvailableSlots(
            businessId,
            selectedRegion,
            dateStr
          )
          if (slots.length > 0) {
            dates.push(new Date(date))
          }
        }
      }

      setAvailableDates(dates)
    } catch (error) {
      console.error('Error loading available dates:', error)
      setAvailableDates([])
    }
  }

  const loadAvailableSlots = async () => {
    if (!selectedDate || !selectedRegion) return

    setIsLoading(true)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const slots = await availabilityService.getAvailableSlots(
        businessId,
        selectedRegion,
        dateStr
      )

      setAvailableSlots(slots)
      groupSlotsByStaff(slots)
    } catch (error) {
      console.error('Error loading available slots:', error)
      setAvailableSlots([])
      setStaffWithSlots([])
    } finally {
      setIsLoading(false)
    }
  }

  const groupSlotsByStaff = (slots: AvailableSlot[]) => {
    const staffMap = new Map<string, StaffWithSlots>()

    slots.forEach(slot => {
      if (!staffMap.has(slot.staffId)) {
        staffMap.set(slot.staffId, {
          staff: {
            id: slot.staffId,
            name: slot.staffName,
            avatar: slot.staffAvatar,
            rating: 4.8 // Mock rating for now
          },
          slots: []
        })
      }
      staffMap.get(slot.staffId)!.slots.push(slot.time)
    })

    // Sort slots by time for each staff member
    Array.from(staffMap.values()).forEach(staffWithSlot => {
      staffWithSlot.slots.sort()
    })

    setStaffWithSlots(Array.from(staffMap.values()))
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setSelectedTime('')
    setSelectedStaff('')
  }

  const handleTimeSelect = (time: string, staffId: string) => {
    setSelectedTime(time)
    setSelectedStaff(staffId)

    // Find staff member details
    const staffMember = staffWithSlots.find(s => s.staff.id === staffId)?.staff
    
    updateCustomerBooking({
      selectedDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null,
      selectedTime: time,
      staffMember: staffMember ? {
        id: staffMember.id,
        name: staffMember.name,
        email: '', // Will be populated later
        phone: '',
        businessId: businessId,
        role: 'staff',
        regions: [selectedRegion || ''],
        avatar: staffMember.avatar,
        rating: staffMember.rating,
        isActive: true,
        createdAt: new Date().toISOString()
      } : null
    })
  }

  const handleQuickBook = async () => {
    if (!selectedRegion || availableDates.length === 0) return

    setIsQuickBooking(true)
    try {
      // Find the earliest available date
      const earliestDate = availableDates[0]
      
      if (earliestDate) {
        const dateStr = format(earliestDate, 'yyyy-MM-dd')
        const slots = await availabilityService.getAvailableSlots(
          businessId,
          selectedRegion,
          dateStr
        )

        if (slots.length > 0) {
          // Sort slots by time and pick the earliest
          const sortedSlots = slots.sort((a, b) => a.time.localeCompare(b.time))
          const earliestSlot = sortedSlots[0]
          
          setSelectedDate(earliestDate)
          handleTimeSelect(earliestSlot.time, earliestSlot.staffId)
          
          // Show success message
          setTimeout(() => {
            setIsQuickBooking(false)
          }, 1000)
        }
      }
    } catch (error) {
      console.error('Error during quick booking:', error)
      setIsQuickBooking(false)
    }
  }

  const canProceed = selectedDate && selectedTime && selectedStaff

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return format(date, 'h:mm a')
  }

  const selectedRegionData = regions.find(r => r.id === selectedRegion)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Pick Your Date & Time
        </h2>
        <p className="text-gray-600 text-lg">
          Select when you'd like your appointment in {selectedRegionData?.name}
        </p>
      </div>

      {/* Quick Book Option */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                📅 Book Next Available Appointment
              </h3>
              <p className="text-blue-700">
                Need an appointment ASAP? We'll find and book the earliest available slot for you.
              </p>
            </div>
            <Button
              onClick={handleQuickBook}
              disabled={isQuickBooking || availableDates.length === 0}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              {isQuickBooking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Booking...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Quick Book
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Date Selection */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Select Date</h3>
            
            {/* Double-month calendar */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => isBefore(date, startOfDay(new Date()))}
                doubleMonth={true}
                availableDates={availableDates}
                className="w-full"
                initialFocus
              />
            </div>

            {/* Available dates legend */}
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 mr-2"></div>
                <span>Available dates</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded bg-primary-600 mr-2"></div>
                <span>Selected date</span>
              </div>
            </div>
          </div>

          {/* Selected Date Info */}
          {selectedDate && (
            <div className="p-6 bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-xl">
              <div className="flex items-center">
                <CalendarIcon className="h-6 w-6 text-primary-600 mr-3" />
                <div>
                  <p className="font-semibold text-primary-800 text-lg">
                    {format(selectedDate, "EEEE, MMMM do, yyyy")}
                  </p>
                  <p className="text-sm text-primary-600">
                    {isLoading ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-primary-600 mr-2"></div>
                        Loading availability...
                      </span>
                    ) : (
                      `${availableSlots.length} time slot${availableSlots.length !== 1 ? 's' : ''} available`
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Staff and Time Selection */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Choose Staff & Time</h3>
          
          {selectedDate ? (
            isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : staffWithSlots.length > 0 ? (
              <div className="space-y-4">
                {staffWithSlots.map((staffWithSlot) => (
                  <div key={staffWithSlot.staff.id} className="border border-gray-200 rounded-lg p-4">
                    {/* Staff Info */}
                    <div className="flex items-center mb-4">
                      <Avatar className="h-12 w-12 mr-3">
                        <AvatarImage src={staffWithSlot.staff.avatar} />
                        <AvatarFallback>
                          {staffWithSlot.staff.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{staffWithSlot.staff.name}</h4>
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="flex items-center">
                            ⭐ {staffWithSlot.staff.rating}
                          </span>
                          <span className="mx-2">•</span>
                          <span>{staffWithSlot.slots.length} slots available</span>
                        </div>
                      </div>
                    </div>

                    {/* Time Slots */}
                    <div className="grid grid-cols-3 gap-2">
                      {staffWithSlot.slots.map((time) => (
                        <Button
                          key={time}
                          variant={
                            selectedTime === time && selectedStaff === staffWithSlot.staff.id 
                              ? "primary" 
                              : "outline"
                          }
                          size="sm"
                          className="justify-center"
                          onClick={() => handleTimeSelect(time, staffWithSlot.staff.id)}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(time)}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No availability
                </h3>
                <p className="text-gray-600">
                  No staff available on this date. Please try another date.
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select a date to see available times</p>
            </div>
          )}
        </div>
      </div>

      {/* Selection Summary */}
      {canProceed && (
        <div className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-4">Your Selection</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 text-primary-600 mr-2" />
              <span>{format(selectedDate!, 'EEEE, MMM do')}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-primary-600 mr-2" />
              <span>{formatTime(selectedTime)}</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 text-primary-600 mr-2" />
              <span>{staffWithSlots.find(s => s.staff.id === selectedStaff)?.staff.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        <Button variant="outline" size="lg" onClick={onBack}>
          ← Back to Location
        </Button>
        
        <Button 
          size="lg" 
          disabled={!canProceed}
          onClick={onNext}
        >
          Continue to Details →
        </Button>
      </div>
    </div>
  )
}