import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Plus, Trash2, Edit3, Save, X, Repeat, CalendarDays } from 'lucide-react'
import { Button } from '../ui/button'
import { Alert, AlertDescription } from '../ui/alert'
import { format, addDays, startOfWeek } from 'date-fns'
import { useAuthStore } from '../../lib/authStore'
import { ServiceAreaService, type ServiceArea, type StaffLocationSchedule } from '../../lib/database/serviceAreas'
import StaffLocationAssignments from './StaffLocationAssignments'

interface LocationScheduleEntry {
  id?: string
  serviceAreaId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  notes?: string
  isNew?: boolean
  isEditing?: boolean
}

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2)
  const minutes = i % 2 === 0 ? '00' : '30'
  return `${hours.toString().padStart(2, '0')}:${minutes}`
})

export default function StaffLocationScheduler() {
  const { user } = useAuthStore()
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([])
  const [schedules, setSchedules] = useState<LocationScheduleEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'recurring' | 'assignments'>('recurring')

  const serviceAreaService = new ServiceAreaService()

  useEffect(() => {
    if (user?.businessId) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [areasData, schedulesData] = await Promise.all([
        serviceAreaService.getServiceAreas(user!.businessId),
        serviceAreaService.getStaffLocationSchedules(user!.id)
      ])

      setServiceAreas(areasData.filter(area => area.isActive))
      
      // Convert to our local format
      setSchedules(schedulesData.map(schedule => ({
        id: schedule.id,
        serviceAreaId: schedule.serviceAreaId,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        notes: schedule.notes
      })))
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load schedule data')
    } finally {
      setLoading(false)
    }
  }

  const addNewSchedule = (dayOfWeek: number) => {
    const newSchedule: LocationScheduleEntry = {
      serviceAreaId: serviceAreas[0]?.id || '',
      dayOfWeek,
      startTime: '09:00',
      endTime: '17:00',
      isNew: true,
      isEditing: true
    }

    setSchedules(prev => [...prev, newSchedule])
  }

  const saveSchedule = async (schedule: LocationScheduleEntry, index: number) => {
    try {
      setSaving(true)
      setError(null)

      if (schedule.startTime >= schedule.endTime) {
        throw new Error('End time must be after start time')
      }

      if (!schedule.serviceAreaId) {
        throw new Error('Please select a service area')
      }

      if (schedule.isNew) {
        // Create new schedule
        const scheduleId = await serviceAreaService.setStaffLocationSchedule({
          staffId: user!.id,
          serviceAreaId: schedule.serviceAreaId,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isActive: true,
          notes: schedule.notes
        })

        // Update local state
        const updated = [...schedules]
        updated[index] = {
          ...schedule,
          id: scheduleId,
          isNew: false,
          isEditing: false
        }
        setSchedules(updated)
      } else {
        // Update existing schedule
        await serviceAreaService.updateStaffLocationSchedule(schedule.id!, {
          serviceAreaId: schedule.serviceAreaId,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          notes: schedule.notes
        })

        // Update local state
        const updated = [...schedules]
        updated[index] = { ...schedule, isEditing: false }
        setSchedules(updated)
      }
    } catch (error) {
      console.error('Error saving schedule:', error)
      setError(error instanceof Error ? error.message : 'Failed to save schedule')
    } finally {
      setSaving(false)
    }
  }

  const deleteSchedule = async (schedule: LocationScheduleEntry, index: number) => {
    try {
      setSaving(true)
      setError(null)

      if (schedule.id) {
        await serviceAreaService.deleteStaffLocationSchedule(schedule.id)
      }

      // Remove from local state
      setSchedules(prev => prev.filter((_, i) => i !== index))
    } catch (error) {
      console.error('Error deleting schedule:', error)
      setError('Failed to delete schedule')
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = (index: number) => {
    const schedule = schedules[index]
    
    if (schedule.isNew) {
      // Remove new schedule
      setSchedules(prev => prev.filter((_, i) => i !== index))
    } else {
      // Reset to original state
      setSchedules(prev => prev.map((s, i) => 
        i === index ? { ...s, isEditing: false } : s
      ))
    }
  }

  const updateScheduleField = (index: number, field: keyof LocationScheduleEntry, value: any) => {
    setSchedules(prev => prev.map((schedule, i) => 
      i === index ? { ...schedule, [field]: value } : schedule
    ))
  }

  const generateFromTemplate = async () => {
    try {
      setSaving(true)
      setError(null)

      const startDate = format(new Date(), 'yyyy-MM-dd')
      const endDate = format(addDays(new Date(), 30), 'yyyy-MM-dd')

      await serviceAreaService.generateScheduleFromRecurring(
        user!.id,
        startDate,
        endDate
      )

      alert('Location assignments generated for the next 30 days!')
    } catch (error) {
      console.error('Error generating schedule:', error)
      setError('Failed to generate schedule assignments')
    } finally {
      setSaving(false)
    }
  }

  const getSchedulesForDay = (dayOfWeek: number) => {
    return schedules
      .map((schedule, index) => ({ ...schedule, index }))
      .filter(schedule => schedule.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const getServiceAreaById = (id: string) => {
    return serviceAreas.find(area => area.id === id)
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (serviceAreas.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Service Areas Available</h3>
        <p className="text-gray-600">
          Contact your business administrator to set up service areas before creating location schedules.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Location Schedule</h2>
          <p className="text-gray-600">Set when you'll be working in different service areas</p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={generateFromTemplate}
            disabled={saving || schedules.length === 0}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Generate 30 Days
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'recurring' ? 'default' : 'outline'}
              onClick={() => setViewMode('recurring')}
            >
              <Repeat className="w-4 h-4 mr-2" />
              Recurring
            </Button>
            <Button
              variant={viewMode === 'assignments' ? 'default' : 'outline'}
              onClick={() => setViewMode('assignments')}
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Specific Dates
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Service Areas Legend */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Service Areas</h3>
        <div className="flex flex-wrap gap-3">
          {serviceAreas.map(area => (
            <div key={area.id} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: area.color }}
              />
              <span className="text-sm text-gray-700">{area.name}</span>
              {area.description && (
                <span className="text-xs text-gray-500">({area.description})</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'recurring' ? (
        /* Recurring Schedule View */
        <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Recurring Schedule</h3>
          
          <div className="space-y-6">
            {DAYS_OF_WEEK.map((dayName, dayOfWeek) => (
              <div key={dayOfWeek} className="border-b border-gray-100 pb-6 last:border-b-0">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">{dayName}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addNewSchedule(dayOfWeek)}
                    disabled={saving}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Schedule
                  </Button>
                </div>

                <div className="space-y-3">
                  {getSchedulesForDay(dayOfWeek).map((schedule) => (
                    <div
                      key={schedule.index}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                    >
                      {schedule.isEditing ? (
                        <>
                          {/* Edit Mode */}
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
                            {/* Service Area */}
                            <select
                              value={schedule.serviceAreaId}
                              onChange={(e) => updateScheduleField(schedule.index!, 'serviceAreaId', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                              <option value="">Select Area</option>
                              {serviceAreas.map(area => (
                                <option key={area.id} value={area.id}>
                                  {area.name}
                                </option>
                              ))}
                            </select>

                            {/* Start Time */}
                            <select
                              value={schedule.startTime}
                              onChange={(e) => updateScheduleField(schedule.index!, 'startTime', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                              {TIME_OPTIONS.map(time => (
                                <option key={time} value={time}>
                                  {formatTime(time)}
                                </option>
                              ))}
                            </select>

                            {/* End Time */}
                            <select
                              value={schedule.endTime}
                              onChange={(e) => updateScheduleField(schedule.index!, 'endTime', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                              {TIME_OPTIONS.map(time => (
                                <option key={time} value={time}>
                                  {formatTime(time)}
                                </option>
                              ))}
                            </select>

                            {/* Notes */}
                            <input
                              type="text"
                              placeholder="Notes (optional)"
                              value={schedule.notes || ''}
                              onChange={(e) => updateScheduleField(schedule.index!, 'notes', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />

                            {/* Actions */}
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => saveSchedule(schedule, schedule.index!)}
                                disabled={saving}
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => cancelEdit(schedule.index!)}
                                disabled={saving}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* View Mode */}
                          <div className="flex-1 flex items-center space-x-4">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: getServiceAreaById(schedule.serviceAreaId)?.color }}
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {getServiceAreaById(schedule.serviceAreaId)?.name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                              </p>
                              {schedule.notes && (
                                <p className="text-xs text-gray-500 mt-1">{schedule.notes}</p>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateScheduleField(schedule.index!, 'isEditing', true)}
                              disabled={saving}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteSchedule(schedule, schedule.index!)}
                              disabled={saving}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {getSchedulesForDay(dayOfWeek).length === 0 && (
                    <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No schedule set for {dayName}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Schedule Summary */}
          {schedules.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Schedule Summary</h4>
              <p className="text-sm text-blue-800">
                You have {schedules.length} recurring location schedule{schedules.length !== 1 ? 's' : ''} set up. 
                Use "Generate 30 Days" to create specific assignments from these templates.
              </p>
            </div>
          )}
        </div>
        </div>
      ) : (
        /* Specific Date Assignments View */
        <StaffLocationAssignments />
      )}
    </div>
  )
}