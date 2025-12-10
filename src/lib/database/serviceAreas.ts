import { supabase } from '../supabase'
import type { Database } from '../database.types'

type Tables = Database['public']['Tables']
type ServiceAreaRow = Tables['service_areas']['Row']
type ServiceAreaInsert = Tables['service_areas']['Insert']

export interface ServiceArea {
  id: string
  businessId: string
  name: string
  description?: string
  color: string
  postcodes: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface StaffLocationSchedule {
  id: string
  staffId: string
  serviceAreaId: string
  dayOfWeek: number // 0 = Sunday, 1 = Monday, etc.
  startTime: string
  endTime: string
  isActive: boolean
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface StaffLocationAssignment {
  id: string
  staffId: string
  serviceAreaId: string
  date: string
  startTime: string
  endTime: string
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
  updatedAt: string
}

export class ServiceAreaService {
  // Service Area Management (Business Owner/Admin only)
  async getServiceAreas(businessId: string): Promise<ServiceArea[]> {
    try {
      const { data, error } = await supabase
        .from('service_areas')
        .select('*')
        .eq('business_id', businessId)
        .order('name')

      if (error) throw error

      return data.map(area => ({
        id: area.id,
        businessId: area.business_id,
        name: area.name,
        description: area.description,
        color: area.color,
        postcodes: area.postcodes || [],
        isActive: area.is_active,
        createdAt: area.created_at,
        updatedAt: area.updated_at
      }))
    } catch (error) {
      console.error('Error fetching service areas:', error)
      throw error
    }
  }

  async createServiceArea(serviceArea: Omit<ServiceArea, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('service_areas')
        .insert({
          business_id: serviceArea.businessId,
          name: serviceArea.name,
          description: serviceArea.description,
          color: serviceArea.color,
          postcodes: serviceArea.postcodes,
          is_active: serviceArea.isActive,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      console.error('Error creating service area:', error)
      throw error
    }
  }

  async updateServiceArea(id: string, updates: Partial<ServiceArea>): Promise<void> {
    try {
      const { error } = await supabase
        .from('service_areas')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating service area:', error)
      throw error
    }
  }

  async deleteServiceArea(id: string): Promise<void> {
    try {
      // First check if any staff are assigned to this area
      const { data: assignments } = await supabase
        .from('staff_location_schedules')
        .select('id')
        .eq('service_area_id', id)
        .limit(1)

      if (assignments && assignments.length > 0) {
        throw new Error('Cannot delete service area with active staff assignments')
      }

      const { error } = await supabase
        .from('service_areas')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting service area:', error)
      throw error
    }
  }

  // Staff Location Schedule Management
  async getStaffLocationSchedules(staffId: string): Promise<StaffLocationSchedule[]> {
    try {
      const { data, error } = await supabase
        .from('staff_location_schedules')
        .select(`
          *,
          service_areas (
            id,
            name,
            color
          )
        `)
        .eq('staff_id', staffId)
        .eq('is_active', true)
        .order('day_of_week')
        .order('start_time')

      if (error) throw error

      return data.map(schedule => ({
        id: schedule.id,
        staffId: schedule.staff_id,
        serviceAreaId: schedule.service_area_id,
        dayOfWeek: schedule.day_of_week,
        startTime: schedule.start_time,
        endTime: schedule.end_time,
        isActive: schedule.is_active,
        notes: schedule.notes,
        createdAt: schedule.created_at,
        updatedAt: schedule.updated_at
      }))
    } catch (error) {
      console.error('Error fetching staff location schedules:', error)
      throw error
    }
  }

  async setStaffLocationSchedule(schedule: Omit<StaffLocationSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Check for conflicts
      const { data: existing } = await supabase
        .from('staff_location_schedules')
        .select('id, start_time, end_time')
        .eq('staff_id', schedule.staffId)
        .eq('day_of_week', schedule.dayOfWeek)
        .eq('is_active', true)

      if (existing) {
        for (const existingSchedule of existing) {
          if (this.timeRangesOverlap(
            schedule.startTime, 
            schedule.endTime, 
            existingSchedule.start_time, 
            existingSchedule.end_time
          )) {
            throw new Error('Staff member already has a schedule for this time period')
          }
        }
      }

      const { data, error } = await supabase
        .from('staff_location_schedules')
        .insert({
          staff_id: schedule.staffId,
          service_area_id: schedule.serviceAreaId,
          day_of_week: schedule.dayOfWeek,
          start_time: schedule.startTime,
          end_time: schedule.endTime,
          is_active: schedule.isActive,
          notes: schedule.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      console.error('Error setting staff location schedule:', error)
      throw error
    }
  }

  async updateStaffLocationSchedule(id: string, updates: Partial<StaffLocationSchedule>): Promise<void> {
    try {
      const { error } = await supabase
        .from('staff_location_schedules')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating staff location schedule:', error)
      throw error
    }
  }

  async deleteStaffLocationSchedule(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('staff_location_schedules')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting staff location schedule:', error)
      throw error
    }
  }

  // Staff Location Assignments (specific dates)
  async getStaffLocationAssignments(
    staffId: string, 
    startDate: string, 
    endDate: string
  ): Promise<StaffLocationAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('staff_location_assignments')
        .select(`
          *,
          service_areas (
            id,
            name,
            color
          )
        `)
        .eq('staff_id', staffId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date')
        .order('start_time')

      if (error) throw error

      return data.map(assignment => ({
        id: assignment.id,
        staffId: assignment.staff_id,
        serviceAreaId: assignment.service_area_id,
        date: assignment.date,
        startTime: assignment.start_time,
        endTime: assignment.end_time,
        status: assignment.status as 'scheduled' | 'active' | 'completed' | 'cancelled',
        notes: assignment.notes,
        createdAt: assignment.created_at,
        updatedAt: assignment.updated_at
      }))
    } catch (error) {
      console.error('Error fetching staff location assignments:', error)
      throw error
    }
  }

  async createStaffLocationAssignment(assignment: Omit<StaffLocationAssignment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Check for conflicts
      const { data: existing } = await supabase
        .from('staff_location_assignments')
        .select('id, start_time, end_time')
        .eq('staff_id', assignment.staffId)
        .eq('date', assignment.date)
        .in('status', ['scheduled', 'active'])

      if (existing) {
        for (const existingAssignment of existing) {
          if (this.timeRangesOverlap(
            assignment.startTime, 
            assignment.endTime, 
            existingAssignment.start_time, 
            existingAssignment.end_time
          )) {
            throw new Error('Staff member already has an assignment for this time period')
          }
        }
      }

      const { data, error } = await supabase
        .from('staff_location_assignments')
        .insert({
          staff_id: assignment.staffId,
          service_area_id: assignment.serviceAreaId,
          date: assignment.date,
          start_time: assignment.startTime,
          end_time: assignment.endTime,
          status: assignment.status,
          notes: assignment.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      console.error('Error creating staff location assignment:', error)
      throw error
    }
  }

  async generateScheduleFromRecurring(
    staffId: string,
    startDate: string,
    endDate: string
  ): Promise<void> {
    try {
      // Get recurring schedules
      const schedules = await this.getStaffLocationSchedules(staffId)
      
      const assignments = []
      const start = new Date(startDate)
      const end = new Date(endDate)

      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dayOfWeek = date.getDay()
        const dateStr = date.toISOString().split('T')[0]

        // Find schedules for this day of week
        const daySchedules = schedules.filter(s => s.dayOfWeek === dayOfWeek)

        for (const schedule of daySchedules) {
          // Check if assignment already exists
          const { data: existing } = await supabase
            .from('staff_location_assignments')
            .select('id')
            .eq('staff_id', staffId)
            .eq('service_area_id', schedule.serviceAreaId)
            .eq('date', dateStr)
            .eq('start_time', schedule.startTime)
            .maybeSingle()

          if (!existing) {
            assignments.push({
              staff_id: staffId,
              service_area_id: schedule.serviceAreaId,
              date: dateStr,
              start_time: schedule.startTime,
              end_time: schedule.endTime,
              status: 'scheduled',
              notes: `Generated from recurring schedule`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          }
        }
      }

      if (assignments.length > 0) {
        const { error } = await supabase
          .from('staff_location_assignments')
          .insert(assignments)

        if (error) throw error
      }
    } catch (error) {
      console.error('Error generating schedule from recurring:', error)
      throw error
    }
  }

  // Helper methods
  private timeRangesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    const start1Minutes = this.timeToMinutes(start1)
    const end1Minutes = this.timeToMinutes(end1)
    const start2Minutes = this.timeToMinutes(start2)
    const end2Minutes = this.timeToMinutes(end2)

    return start1Minutes < end2Minutes && start2Minutes < end1Minutes
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  // Get staff availability for specific service area
  async getStaffInArea(serviceAreaId: string, date: string, time: string): Promise<string[]> {
    try {
      const dayOfWeek = new Date(date).getDay()

      // Get staff from both recurring schedules and specific assignments
      const [scheduleResults, assignmentResults] = await Promise.all([
        supabase
          .from('staff_location_schedules')
          .select('staff_id')
          .eq('service_area_id', serviceAreaId)
          .eq('day_of_week', dayOfWeek)
          .eq('is_active', true)
          .lte('start_time', time)
          .gte('end_time', time),

        supabase
          .from('staff_location_assignments')
          .select('staff_id')
          .eq('service_area_id', serviceAreaId)
          .eq('date', date)
          .in('status', ['scheduled', 'active'])
          .lte('start_time', time)
          .gte('end_time', time)
      ])

      const staffIds = new Set<string>()
      
      if (scheduleResults.data) {
        scheduleResults.data.forEach(s => staffIds.add(s.staff_id))
      }
      
      if (assignmentResults.data) {
        assignmentResults.data.forEach(a => staffIds.add(a.staff_id))
      }

      return Array.from(staffIds)
    } catch (error) {
      console.error('Error getting staff in area:', error)
      return []
    }
  }
}