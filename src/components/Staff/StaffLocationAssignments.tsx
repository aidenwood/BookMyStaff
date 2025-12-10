import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Plus, Trash2, Edit3, Save, X } from 'lucide-react'
import { Button } from '../ui/button'
import { Calendar as CalendarComponent } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Alert, AlertDescription } from '../ui/alert'
import { format, addDays, isBefore, startOfDay } from 'date-fns'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../lib/authStore'
import { ServiceAreaService, type ServiceArea, type StaffLocationAssignment } from '../../lib/database/serviceAreas'

interface LocationAssignmentEntry {
  id?: string
  serviceAreaId: string
  date: string
  startTime: string
  endTime: string
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  notes?: string
  isNew?: boolean
  isEditing?: boolean
}

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2)
  const minutes = i % 2 === 0 ? '00' : '30'
  return `${hours.toString().padStart(2, '0')}:${minutes}`
})

export default function StaffLocationAssignments() {
  const { user } = useAuthStore()
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([])
  const [assignments, setAssignments] = useState<LocationAssignmentEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [viewDate, setViewDate] = useState(new Date())

  const serviceAreaService = new ServiceAreaService()

  useEffect(() => {
    if (user?.businessId) {
      loadData()
    }
  }, [user, viewDate])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const startDate = format(viewDate, 'yyyy-MM-01') // Start of month
      const endDate = format(addDays(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0), 0), 'yyyy-MM-dd') // End of month

      const [areasData, assignmentsData] = await Promise.all([
        serviceAreaService.getServiceAreas(user!.businessId),
        serviceAreaService.getStaffLocationAssignments(user!.id, startDate, endDate)
      ])

      setServiceAreas(areasData.filter(area => area.isActive))
      
      // Convert to our local format
      setAssignments(assignmentsData.map(assignment => ({
        id: assignment.id,
        serviceAreaId: assignment.serviceAreaId,
        date: assignment.date,
        startTime: assignment.startTime,
        endTime: assignment.endTime,
        status: assignment.status,
        notes: assignment.notes
      })))
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load assignment data')
    } finally {
      setLoading(false)
    }
  }

  const addNewAssignment = () => {
    if (!selectedDate) {
      setError('Please select a date first')
      return
    }

    const newAssignment: LocationAssignmentEntry = {
      serviceAreaId: serviceAreas[0]?.id || '',
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '17:00',
      status: 'scheduled',
      isNew: true,
      isEditing: true
    }

    setAssignments(prev => [...prev, newAssignment])
  }

  const saveAssignment = async (assignment: LocationAssignmentEntry, index: number) => {
    try {
      setSaving(true)
      setError(null)

      if (assignment.startTime >= assignment.endTime) {
        throw new Error('End time must be after start time')
      }

      if (!assignment.serviceAreaId) {
        throw new Error('Please select a service area')
      }

      if (assignment.isNew) {
        // Create new assignment
        const assignmentId = await serviceAreaService.createStaffLocationAssignment({
          staffId: user!.id,
          serviceAreaId: assignment.serviceAreaId,
          date: assignment.date,
          startTime: assignment.startTime,
          endTime: assignment.endTime,
          status: assignment.status,
          notes: assignment.notes
        })

        // Update local state
        const updated = [...assignments]
        updated[index] = {
          ...assignment,
          id: assignmentId,
          isNew: false,
          isEditing: false
        }
        setAssignments(updated)
      } else {
        // Update existing assignment
        await serviceAreaService.updateStaffLocationAssignment?.(assignment.id!, {
          serviceAreaId: assignment.serviceAreaId,
          date: assignment.date,
          startTime: assignment.startTime,
          endTime: assignment.endTime,
          status: assignment.status,
          notes: assignment.notes
        })

        // Update local state
        const updated = [...assignments]
        updated[index] = { ...assignment, isEditing: false }
        setAssignments(updated)
      }
    } catch (error) {
      console.error('Error saving assignment:', error)
      setError(error instanceof Error ? error.message : 'Failed to save assignment')
    } finally {
      setSaving(false)
    }
  }

  const deleteAssignment = async (assignment: LocationAssignmentEntry, index: number) => {
    try {
      setSaving(true)
      setError(null)

      if (assignment.id) {
        await serviceAreaService.deleteStaffLocationAssignment?.(assignment.id)
      }

      // Remove from local state
      setAssignments(prev => prev.filter((_, i) => i !== index))
    } catch (error) {
      console.error('Error deleting assignment:', error)
      setError('Failed to delete assignment')
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = (index: number) => {
    const assignment = assignments[index]
    
    if (assignment.isNew) {
      // Remove new assignment
      setAssignments(prev => prev.filter((_, i) => i !== index))
    } else {
      // Reset to original state
      setAssignments(prev => prev.map((s, i) => 
        i === index ? { ...s, isEditing: false } : s
      ))
    }
  }

  const updateAssignmentField = (index: number, field: keyof LocationAssignmentEntry, value: any) => {
    setAssignments(prev => prev.map((assignment, i) => 
      i === index ? { ...assignment, [field]: value } : assignment
    ))
  }

  const getAssignmentsForDate = (date: string) => {
    return assignments
      .map((assignment, index) => ({ ...assignment, index }))
      .filter(assignment => assignment.date === date)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDatesWithAssignments = () => {
    const datesSet = new Set(assignments.map(a => a.date))
    return Array.from(datesSet).map(date => new Date(date))
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
          Contact your business administrator to set up service areas before creating location assignments.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Location Assignments</h2>
          <p className="text-gray-600">Manage specific date-based location assignments</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h3>
          
          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal mb-4",
                  !selectedDate && "text-gray-500"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => isBefore(date, startOfDay(new Date()))}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button
            onClick={addNewAssignment}
            disabled={!selectedDate || saving}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Assignment
          </Button>

          {/* Legend */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Service Areas</h4>
            <div className="space-y-2">
              {serviceAreas.map(area => (
                <div key={area.id} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: area.color }}
                  />
                  <span className="text-xs text-gray-700">{area.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedDate ? `Assignments for ${format(selectedDate, 'EEEE, MMMM do, yyyy')}` : 'Select a date to view assignments'}
          </h3>

          {selectedDate && (
            <div className="space-y-4">
              {getAssignmentsForDate(format(selectedDate, 'yyyy-MM-dd')).map((assignment) => (
                <div
                  key={assignment.index}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  {assignment.isEditing ? (
                    <>
                      {/* Edit Mode */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {/* Service Area */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Service Area</label>
                          <select
                            value={assignment.serviceAreaId}
                            onChange={(e) => updateAssignmentField(assignment.index!, 'serviceAreaId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="">Select Area</option>
                            {serviceAreas.map(area => (
                              <option key={area.id} value={area.id}>
                                {area.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Status */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select
                            value={assignment.status}
                            onChange={(e) => updateAssignmentField(assignment.index!, 'status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="scheduled">Scheduled</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>

                        {/* Start Time */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                          <select
                            value={assignment.startTime}
                            onChange={(e) => updateAssignmentField(assignment.index!, 'startTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            {TIME_OPTIONS.map(time => (
                              <option key={time} value={time}>
                                {formatTime(time)}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* End Time */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                          <select
                            value={assignment.endTime}
                            onChange={(e) => updateAssignmentField(assignment.index!, 'endTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          >
                            {TIME_OPTIONS.map(time => (
                              <option key={time} value={time}>
                                {formatTime(time)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <input
                          type="text"
                          placeholder="Notes (optional)"
                          value={assignment.notes || ''}
                          onChange={(e) => updateAssignmentField(assignment.index!, 'notes', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => saveAssignment(assignment, assignment.index!)}
                          disabled={saving}
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelEdit(assignment.index!)}
                          disabled={saving}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* View Mode */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div 
                            className="w-4 h-4 rounded-full mt-1"
                            style={{ backgroundColor: getServiceAreaById(assignment.serviceAreaId)?.color }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <h4 className="font-medium text-gray-900">
                                {getServiceAreaById(assignment.serviceAreaId)?.name}
                              </h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(assignment.status)}`}>
                                {assignment.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              <Clock className="w-4 h-4 inline mr-1" />
                              {formatTime(assignment.startTime)} - {formatTime(assignment.endTime)}
                            </p>
                            {assignment.notes && (
                              <p className="text-sm text-gray-500">{assignment.notes}</p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateAssignmentField(assignment.index!, 'isEditing', true)}
                            disabled={saving}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteAssignment(assignment, assignment.index!)}
                            disabled={saving}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {selectedDate && getAssignmentsForDate(format(selectedDate, 'yyyy-MM-dd')).length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No assignments for this date</p>
                  <p className="text-xs text-gray-400">Click "Add Assignment" to create one</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}