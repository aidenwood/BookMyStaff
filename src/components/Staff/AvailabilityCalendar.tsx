import React, { useState, useEffect } from 'react'
import { Calendar } from '../ui/calendar'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { useAuthStore } from '../../lib/authStore'
import { AvailabilityService } from '../../lib/database/availability'
import { format, addDays, startOfWeek } from 'date-fns'
import type { AvailabilitySlot, RecurringAvailability } from '../../types/appointment'
import type { RegionConfig } from '../../types/regions'

interface AvailabilityCalendarProps {
  regions: RegionConfig[]
  onAvailabilityChange?: (availability: AvailabilitySlot[]) => void
}

export default function AvailabilityCalendar({ 
  regions, 
  onAvailabilityChange 
}: AvailabilityCalendarProps) {
  const { user } = useAuthStore()
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([])
  const [recurringPatterns, setRecurringPatterns] = useState<RecurringAvailability[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string>('')
  const [timeRange, setTimeRange] = useState({ start: '09:00', end: '17:00' })
  const [showTimePopup, setShowTimePopup] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'recurring'>('calendar')
  const [loading, setLoading] = useState(false)

  const availabilityService = new AvailabilityService()

  useEffect(() => {
    if (user?.businessId) {
      loadAvailability()
      loadRecurringPatterns()
    }
  }, [user])

  const loadAvailability = async () => {
    if (!user?.id) return

    const startDate = format(new Date(), 'yyyy-MM-dd')
    const endDate = format(addDays(new Date(), 30), 'yyyy-MM-dd')

    const slots = await availabilityService.getStaffAvailability(
      user.id,
      startDate,
      endDate
    )

    setAvailability(slots)
    onAvailabilityChange?.(slots)
  }

  const loadRecurringPatterns = async () => {
    if (!user?.id) return

    const patterns = await availabilityService.getRecurringAvailability(user.id)
    setRecurringPatterns(patterns)
  }

  const handleDateSelect = (event: any) => {
    setSelectedDates(event.value || [])
  }

  const handleSetAvailability = async () => {
    if (!user?.id || !user?.businessId || !selectedRegion || selectedDates.length === 0) {
      alert('Please select dates, region, and time range')
      return
    }

    setLoading(true)

    try {
      for (const date of selectedDates) {
        const dateStr = format(date, 'yyyy-MM-dd')
        await availabilityService.setAvailability(
          user.id,
          user.businessId,
          dateStr,
          timeRange.start,
          timeRange.end,
          selectedRegion
        )
      }

      await loadAvailability()
      setSelectedDates([])
      alert('Availability set successfully!')
    } catch (error) {
      console.error('Error setting availability:', error)
      alert('Failed to set availability')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveAvailability = async (slot: AvailabilitySlot) => {
    if (!user?.id) return

    setLoading(true)

    try {
      await availabilityService.removeAvailability(
        user.id,
        slot.date,
        slot.time,
        slot.region
      )

      await loadAvailability()
    } catch (error) {
      console.error('Error removing availability:', error)
      alert('Failed to remove availability')
    } finally {
      setLoading(false)
    }
  }

  const handleSetRecurringPattern = async (dayOfWeek: number) => {
    if (!user?.id || !user?.businessId || !selectedRegion) {
      alert('Please select a region and time range')
      return
    }

    setLoading(true)

    try {
      await availabilityService.setRecurringAvailability(
        user.id,
        user.businessId,
        dayOfWeek,
        timeRange.start,
        timeRange.end,
        [selectedRegion]
      )

      await loadRecurringPatterns()
      alert('Recurring pattern set successfully!')
    } catch (error) {
      console.error('Error setting recurring pattern:', error)
      alert('Failed to set recurring pattern')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateFromPatterns = async () => {
    if (!user?.id) return

    setLoading(true)

    try {
      const startDate = format(new Date(), 'yyyy-MM-dd')
      const endDate = format(addDays(new Date(), 30), 'yyyy-MM-dd')

      await availabilityService.generateFromRecurringPattern(
        user.id,
        startDate,
        endDate
      )

      await loadAvailability()
      alert('Availability generated from patterns!')
    } catch (error) {
      console.error('Error generating availability:', error)
      alert('Failed to generate availability')
    } finally {
      setLoading(false)
    }
  }

  const getMarkedDates = () => {
    return availability.map(slot => ({
      date: new Date(slot.date),
      color: regions.find(r => r.name === slot.region)?.color || '#4ECDC4',
      title: `${slot.time} - ${slot.region}`
    }))
  }

  const groupedAvailability = availability.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = []
    acc[slot.date].push(slot)
    return acc
  }, {} as Record<string, AvailabilitySlot[]>)

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('calendar')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'calendar'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Calendar View
        </button>
        <button
          onClick={() => setViewMode('recurring')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'recurring'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Recurring Patterns
        </button>
      </div>

      {/* Controls */}
      <div className="card">
        <div className="card-body p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Region Selection */}
            <div className="form-group">
              <label className="form-label">Region</label>
              <select
                className="form-input"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
              >
                <option value="">Select region</option>
                {regions.map(region => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Range */}
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                className="form-input"
                value={timeRange.start}
                onChange={(e) => setTimeRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="time"
                className="form-input"
                value={timeRange.end}
                onChange={(e) => setTimeRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            {viewMode === 'calendar' ? (
              <button
                onClick={handleSetAvailability}
                disabled={loading || selectedDates.length === 0 || !selectedRegion}
                className="btn btn-primary"
              >
                {loading ? 'Setting...' : `Set Availability (${selectedDates.length} days)`}
              </button>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {dayNames.map((day, index) => (
                  <button
                    key={day}
                    onClick={() => handleSetRecurringPattern(index)}
                    disabled={loading || !selectedRegion}
                    className="btn btn-secondary btn-sm"
                  >
                    Set {day}
                  </button>
                ))}
                <button
                  onClick={handleGenerateFromPatterns}
                  disabled={loading || recurringPatterns.length === 0}
                  className="btn btn-primary"
                >
                  Generate 30 Days
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="card">
            <div className="card-body p-6">
              <h3 className="text-lg font-semibold mb-4">Select Dates</h3>
              <Datepicker
                {...calendarConfig}
                selectMultiple={true}
                value={selectedDates}
                onSelectionChange={handleDateSelect}
                marked={getMarkedDates()}
              />
            </div>
          </div>

          {/* Availability List */}
          <div className="card">
            <div className="card-body p-6">
              <h3 className="text-lg font-semibold mb-4">Current Availability</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(groupedAvailability)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([date, slots]) => (
                    <div key={date} className="border-l-4 border-primary-600 pl-4">
                      <h4 className="font-medium text-gray-900">
                        {format(new Date(date), 'EEEE, MMMM do')}
                      </h4>
                      <div className="space-y-2 mt-2">
                        {slots.map(slot => (
                          <div
                            key={`${slot.date}-${slot.time}-${slot.region}`}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: regions.find(r => r.name === slot.region)?.color
                                }}
                              />
                              <span className="text-sm">
                                {slot.time} - {slot.region}
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemoveAvailability(slot)}
                              className="text-red-600 hover:text-red-800 text-sm"
                              disabled={loading}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                {Object.keys(groupedAvailability).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No availability set. Select dates above to get started.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Recurring Patterns View */
        <div className="card">
          <div className="card-body p-6">
            <h3 className="text-lg font-semibold mb-4">Recurring Availability Patterns</h3>
            
            {recurringPatterns.length > 0 ? (
              <div className="space-y-4">
                {recurringPatterns.map(pattern => (
                  <div
                    key={pattern.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">
                        {dayNames[pattern.dayOfWeek]}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {pattern.startTime} - {pattern.endTime}
                      </p>
                      <div className="flex gap-1 mt-2">
                        {pattern.regions.map(regionId => {
                          const region = regions.find(r => r.id === regionId)
                          return region ? (
                            <span
                              key={regionId}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs"
                            >
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: region.color }}
                              />
                              {region.name}
                            </span>
                          ) : null
                        })}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // TODO: Implement pattern deletion
                      }}
                      className="text-red-600 hover:text-red-800"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recurring patterns set. Use the controls above to create weekly patterns.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}