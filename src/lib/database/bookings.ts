import { supabase } from '../supabase'
import type { Booking, AppointmentData } from '../../types/appointment'
import type { Database } from '../../types/database'

type BookingRow = Database['public']['Tables']['bookings']['Row']
type BookingInsert = Database['public']['Tables']['bookings']['Insert']
type BookingUpdate = Database['public']['Tables']['bookings']['Update']

export class BookingService {
  async createBooking(appointmentData: AppointmentData, businessId: string): Promise<Booking | null> {
    try {
      const confirmationCode = await this.generateConfirmationCode()
      
      const bookingInsert: BookingInsert = {
        business_id: businessId,
        customer_name: appointmentData.customerInfo.name,
        customer_email: appointmentData.customerInfo.email,
        customer_phone: appointmentData.customerInfo.phone,
        customer_address: appointmentData.customerInfo.address,
        customer_postcode: appointmentData.customerInfo.postcode,
        staff_id: appointmentData.staffMember!.id,
        appointment_type_id: appointmentData.appointmentType.id,
        date: appointmentData.selectedDate!,
        time: appointmentData.selectedTime!,
        duration: appointmentData.duration,
        notes: appointmentData.notes,
        region_id: '', // This would be determined from the staff member's regions
        confirmation_code: confirmationCode
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingInsert)
        .select(`
          *,
          staff_members:staff_id (id, name, email, phone),
          appointment_types:appointment_type_id (id, name, duration, color),
          regions:region_id (id, name, color)
        `)
        .single()

      if (error) throw error
      return this.mapRowToBooking(data)
    } catch (error) {
      console.error('Error creating booking:', error)
      return null
    }
  }

  async getBookingById(id: string): Promise<Booking | null> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          staff_members:staff_id (id, name, email, phone),
          appointment_types:appointment_type_id (id, name, duration, color),
          regions:region_id (id, name, color)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return this.mapRowToBooking(data)
    } catch (error) {
      console.error('Error fetching booking:', error)
      return null
    }
  }

  async getBookingByConfirmationCode(code: string): Promise<Booking | null> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          staff_members:staff_id (id, name, email, phone),
          appointment_types:appointment_type_id (id, name, duration, color),
          regions:region_id (id, name, color)
        `)
        .eq('confirmation_code', code)
        .single()

      if (error) throw error
      return this.mapRowToBooking(data)
    } catch (error) {
      console.error('Error fetching booking by confirmation code:', error)
      return null
    }
  }

  async getBusinessBookings(
    businessId: string, 
    filters?: {
      startDate?: string
      endDate?: string
      staffId?: string
      status?: string
    }
  ): Promise<Booking[]> {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          staff_members:staff_id (id, name, email, phone),
          appointment_types:appointment_type_id (id, name, duration, color),
          regions:region_id (id, name, color)
        `)
        .eq('business_id', businessId)

      if (filters?.startDate) {
        query = query.gte('date', filters.startDate)
      }
      if (filters?.endDate) {
        query = query.lte('date', filters.endDate)
      }
      if (filters?.staffId) {
        query = query.eq('staff_id', filters.staffId)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query.order('date', { ascending: true })

      if (error) throw error
      return data.map(this.mapRowToBooking)
    } catch (error) {
      console.error('Error fetching business bookings:', error)
      return []
    }
  }

  async getStaffBookings(
    staffId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Booking[]> {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          staff_members:staff_id (id, name, email, phone),
          appointment_types:appointment_type_id (id, name, duration, color),
          regions:region_id (id, name, color)
        `)
        .eq('staff_id', staffId)

      if (startDate) {
        query = query.gte('date', startDate)
      }
      if (endDate) {
        query = query.lte('date', endDate)
      }

      const { data, error } = await query.order('date', { ascending: true })

      if (error) throw error
      return data.map(this.mapRowToBooking)
    } catch (error) {
      console.error('Error fetching staff bookings:', error)
      return []
    }
  }

  async updateBookingStatus(id: string, status: BookingRow['status']): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)

      return !error
    } catch (error) {
      console.error('Error updating booking status:', error)
      return false
    }
  }

  async cancelBooking(id: string, reason?: string): Promise<boolean> {
    try {
      const updates: BookingUpdate = { 
        status: 'cancelled'
      }
      
      if (reason) {
        updates.notes = reason
      }

      const { error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)

      return !error
    } catch (error) {
      console.error('Error cancelling booking:', error)
      return false
    }
  }

  async rescheduleBooking(
    id: string, 
    newDate: string, 
    newTime: string, 
    newStaffId?: string
  ): Promise<boolean> {
    try {
      const updates: BookingUpdate = { 
        date: newDate,
        time: newTime,
        status: 'pending' // Reset to pending for confirmation
      }
      
      if (newStaffId) {
        updates.staff_id = newStaffId
      }

      const { error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)

      return !error
    } catch (error) {
      console.error('Error rescheduling booking:', error)
      return false
    }
  }

  async getAvailableSlots(
    businessId: string,
    regionId: string,
    date: string,
    duration: number = 60
  ): Promise<{time: string, staffId: string, staffName: string}[]> {
    try {
      const { data, error } = await supabase.rpc('get_available_slots', {
        p_business_id: businessId,
        p_region_id: regionId,
        p_date: date,
        p_duration: duration
      })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching available slots:', error)
      return []
    }
  }

  private async generateConfirmationCode(): Promise<string> {
    // Generate a random 8-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    // Check if code already exists
    const { data } = await supabase
      .from('bookings')
      .select('id')
      .eq('confirmation_code', result)
      .single()

    if (data) {
      // Code exists, generate a new one
      return this.generateConfirmationCode()
    }

    return result
  }

  private mapRowToBooking(row: any): Booking {
    return {
      id: row.id,
      businessId: row.business_id,
      customerId: row.id, // Using booking id as customer identifier for now
      staffId: row.staff_id,
      appointmentTypeId: row.appointment_type_id,
      date: row.date,
      time: row.time,
      duration: row.duration,
      status: row.status,
      customerInfo: {
        name: row.customer_name,
        email: row.customer_email,
        phone: row.customer_phone,
        address: row.customer_address,
        postcode: row.customer_postcode
      },
      notes: row.notes,
      region: row.regions?.name || '',
      confirmationCode: row.confirmation_code,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      // Include related data if available
      staffMember: row.staff_members ? {
        id: row.staff_members.id,
        name: row.staff_members.name,
        email: row.staff_members.email,
        phone: row.staff_members.phone
      } : undefined,
      appointmentType: row.appointment_types ? {
        id: row.appointment_types.id,
        name: row.appointment_types.name,
        duration: row.appointment_types.duration,
        color: row.appointment_types.color
      } : undefined
    } as Booking
  }

  // Real-time subscriptions
  subscribeToBookingChanges(bookingId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`booking_${bookingId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${bookingId}`
      }, callback)
      .subscribe()
  }

  subscribeToStaffBookings(staffId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`staff_bookings_${staffId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `staff_id=eq.${staffId}`
      }, callback)
      .subscribe()
  }

  subscribeToBusinessBookings(businessId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`business_bookings_${businessId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `business_id=eq.${businessId}`
      }, callback)
      .subscribe()
  }
}