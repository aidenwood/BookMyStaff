import { supabase } from '../supabase'
import type { AvailabilitySlot, RecurringAvailability, StaffMember } from '../../types/appointment'
import type { Database } from '../../types/database'
import { generateTimeSlots, addBusinessDays } from '../../utils/dateHelpers'

type AvailabilityRow = Database['public']['Tables']['availability_slots']['Row']
type AvailabilityInsert = Database['public']['Tables']['availability_slots']['Insert']
type RecurringRow = Database['public']['Tables']['recurring_availability']['Row']
type RecurringInsert = Database['public']['Tables']['recurring_availability']['Insert']

export class AvailabilityService {
  // Get available slots for booking (filters out already booked slots)
  async getAvailableSlots(
    businessId: string,
    regionId: string,
    date: string
  ): Promise<Array<{
    time: string
    staffId: string
    staffName: string
    staffAvatar?: string
  }>> {
    try {
      const { data, error } = await supabase
        .from('staff_availability')
        .select(`
          staff_id,
          time,
          staff (
            first_name,
            last_name,
            avatar
          )
        `)
        .eq('business_id', businessId)
        .eq('region', regionId)
        .eq('date', date)
        .eq('is_booked', false)
        .order('time', { ascending: true })

      if (error) throw error

      return data.map(slot => ({
        time: slot.time,
        staffId: slot.staff_id,
        staffName: `${slot.staff?.first_name || ''} ${slot.staff?.last_name || ''}`.trim(),
        staffAvatar: slot.staff?.avatar || undefined
      }))
    } catch (error) {
      console.error('Error fetching available slots:', error)
      return []
    }
  }

  // Get staff availability for a specific date range
  async getStaffAvailability(
    staffId: string,
    startDate: string,
    endDate: string
  ): Promise<AvailabilitySlot[]> {
    try {
      const { data, error } = await supabase
        .from('availability_slots')
        .select(`
          *,
          regions (id, name, color)
        `)
        .eq('staff_id', staffId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error
      return data.map(this.mapRowToAvailabilitySlot)
    } catch (error) {
      console.error('Error fetching staff availability:', error)
      return []
    }
  }

  // Set availability for a specific date and time range
  async setAvailability(
    staffId: string,
    businessId: string,
    date: string,
    startTime: string,
    endTime: string,
    regionId: string
  ): Promise<boolean> {
    try {
      // Generate hourly slots between start and end time
      const timeSlots = generateTimeSlots(date, startTime, endTime)
      
      // Create availability entries for each hour
      const availabilityInserts: AvailabilityInsert[] = timeSlots.map((time, index) => ({
        staff_id: staffId,
        business_id: businessId,
        date,
        start_time: time,
        end_time: timeSlots[index + 1] || endTime,
        region_id: regionId,
        is_available: true
      }))

      // Remove the last slot if it would go beyond end time
      if (availabilityInserts.length > 0) {
        availabilityInserts.pop()
      }

      const { error } = await supabase
        .from('availability_slots')
        .upsert(availabilityInserts, {
          onConflict: 'staff_id,date,start_time,region_id'
        })

      return !error
    } catch (error) {
      console.error('Error setting availability:', error)
      return false
    }
  }

  // Remove availability for specific slots
  async removeAvailability(
    staffId: string,
    date: string,
    startTime: string,
    regionId?: string
  ): Promise<boolean> {
    try {
      let query = supabase
        .from('availability_slots')
        .delete()
        .eq('staff_id', staffId)
        .eq('date', date)
        .eq('start_time', startTime)

      if (regionId) {
        query = query.eq('region_id', regionId)
      }

      const { error } = await query

      return !error
    } catch (error) {
      console.error('Error removing availability:', error)
      return false
    }
  }

  // Get recurring availability patterns for staff
  async getRecurringAvailability(staffId: string): Promise<RecurringAvailability[]> {
    try {
      const { data, error } = await supabase
        .from('recurring_availability')
        .select('*')
        .eq('staff_id', staffId)
        .eq('is_active', true)
        .order('day_of_week', { ascending: true })

      if (error) throw error
      return data.map(this.mapRowToRecurringAvailability)
    } catch (error) {
      console.error('Error fetching recurring availability:', error)
      return []
    }
  }

  // Set recurring availability pattern
  async setRecurringAvailability(
    staffId: string,
    businessId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    regions: string[]
  ): Promise<boolean> {
    try {
      const recurringInsert: RecurringInsert = {
        staff_id: staffId,
        business_id: businessId,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        regions,
        is_active: true
      }

      const { error } = await supabase
        .from('recurring_availability')
        .upsert(recurringInsert, {
          onConflict: 'staff_id,day_of_week'
        })

      return !error
    } catch (error) {
      console.error('Error setting recurring availability:', error)
      return false
    }
  }

  // Generate availability slots from recurring patterns
  async generateFromRecurringPattern(
    staffId: string,
    startDate: string,
    endDate: string
  ): Promise<boolean> {
    try {
      // Get recurring patterns
      const patterns = await this.getRecurringAvailability(staffId)
      if (patterns.length === 0) return true

      // Get staff business ID
      const { data: staff } = await supabase
        .from('staff_members')
        .select('business_id')
        .eq('id', staffId)
        .single()

      if (!staff) return false

      const availabilitySlots: AvailabilityInsert[] = []
      
      // Generate slots for each day in the date range
      let currentDate = new Date(startDate)
      const endDateObj = new Date(endDate)

      while (currentDate <= endDateObj) {
        const dayOfWeek = currentDate.getDay()
        const dateStr = currentDate.toISOString().split('T')[0]

        // Find matching recurring pattern
        const pattern = patterns.find(p => p.dayOfWeek === dayOfWeek)
        if (pattern) {
          // Generate time slots for each region
          for (const regionId of pattern.regions) {
            const timeSlots = generateTimeSlots(
              dateStr,
              pattern.startTime,
              pattern.endTime
            )

            // Create availability entries
            timeSlots.forEach((time, index) => {
              if (index < timeSlots.length - 1) {
                availabilitySlots.push({
                  staff_id: staffId,
                  business_id: staff.business_id,
                  date: dateStr,
                  start_time: time,
                  end_time: timeSlots[index + 1],
                  region_id: regionId,
                  is_available: true
                })
              }
            })
          }
        }

        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Bulk insert availability slots
      if (availabilitySlots.length > 0) {
        const { error } = await supabase
          .from('availability_slots')
          .upsert(availabilitySlots, {
            onConflict: 'staff_id,date,start_time,region_id'
          })

        return !error
      }

      return true
    } catch (error) {
      console.error('Error generating availability from patterns:', error)
      return false
    }
  }

  // Get available slots for booking in a region
  async getAvailableSlots(
    businessId: string,
    regionId: string,
    date: string,
    duration: number = 60
  ): Promise<{time: string, staffId: string, staffName: string, staffAvatar?: string}[]> {
    try {
      // Get available staff in the region for the date
      const { data, error } = await supabase
        .from('availability_slots')
        .select(`
          start_time,
          staff_id,
          staff_members!inner (
            id,
            name,
            avatar,
            regions
          )
        `)
        .eq('business_id', businessId)
        .eq('region_id', regionId)
        .eq('date', date)
        .eq('is_available', true)
        .order('start_time', { ascending: true })

      if (error) throw error

      // Filter out already booked slots
      const { data: bookings } = await supabase
        .from('bookings')
        .select('time, staff_id')
        .eq('business_id', businessId)
        .eq('date', date)
        .in('status', ['pending', 'confirmed'])

      const bookedSlots = new Set(
        bookings?.map(b => `${b.staff_id}-${b.time}`) || []
      )

      return data
        .filter(slot => !bookedSlots.has(`${slot.staff_id}-${slot.start_time}`))
        .map(slot => ({
          time: slot.start_time,
          staffId: slot.staff_id,
          staffName: slot.staff_members.name,
          staffAvatar: slot.staff_members.avatar
        }))
    } catch (error) {
      console.error('Error fetching available slots:', error)
      return []
    }
  }

  // Get availability overview for a business
  async getBusinessAvailabilityOverview(
    businessId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    date: string
    totalSlots: number
    availableSlots: number
    regions: { id: string; name: string; slots: number }[]
  }[]> {
    try {
      const { data, error } = await supabase
        .from('availability_slots')
        .select(`
          date,
          region_id,
          is_available,
          regions (id, name)
        `)
        .eq('business_id', businessId)
        .gte('date', startDate)
        .lte('date', endDate)

      if (error) throw error

      // Group by date
      const groupedData = data.reduce((acc, slot) => {
        if (!acc[slot.date]) {
          acc[slot.date] = {
            date: slot.date,
            totalSlots: 0,
            availableSlots: 0,
            regions: new Map()
          }
        }

        acc[slot.date].totalSlots++
        if (slot.is_available) {
          acc[slot.date].availableSlots++
        }

        const regionKey = slot.region_id
        if (!acc[slot.date].regions.has(regionKey)) {
          acc[slot.date].regions.set(regionKey, {
            id: slot.regions.id,
            name: slot.regions.name,
            slots: 0
          })
        }

        if (slot.is_available) {
          acc[slot.date].regions.get(regionKey).slots++
        }

        return acc
      }, {} as any)

      return Object.values(groupedData).map((day: any) => ({
        ...day,
        regions: Array.from(day.regions.values())
      }))
    } catch (error) {
      console.error('Error fetching availability overview:', error)
      return []
    }
  }

  private mapRowToAvailabilitySlot(row: any): AvailabilitySlot {
    return {
      id: row.id,
      date: row.date,
      time: row.start_time,
      staffId: row.staff_id,
      region: row.regions?.name || '',
      isBooked: !row.is_available,
      isAvailable: row.is_available,
      duration: 60 // Assuming 60-minute slots
    }
  }

  private mapRowToRecurringAvailability(row: RecurringRow): RecurringAvailability {
    return {
      id: row.id,
      staffId: row.staff_id,
      dayOfWeek: row.day_of_week,
      startTime: row.start_time,
      endTime: row.end_time,
      regions: row.regions,
      isActive: row.is_active
    }
  }

  // Real-time subscriptions
  subscribeToAvailabilityChanges(
    staffId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`availability_${staffId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'availability_slots',
        filter: `staff_id=eq.${staffId}`
      }, callback)
      .subscribe()
  }

  subscribeToBusinessAvailability(
    businessId: string,
    callback: (payload: any) => void
  ) {
    return supabase
      .channel(`business_availability_${businessId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'availability_slots',
        filter: `business_id=eq.${businessId}`
      }, callback)
      .subscribe()
  }
}