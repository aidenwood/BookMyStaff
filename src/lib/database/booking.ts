import { supabase } from '../supabase'
import type { Database } from '../database.types'
import type { CustomerBooking, StaffMember } from '../../types/appointment'
import { AvailabilityService } from './availability'
import { NotificationService } from '../notifications/NotificationService'

type Tables = Database['public']['Tables']
type BookingRow = Tables['bookings']['Row']
type BookingInsert = Tables['bookings']['Insert']

export interface CreateBookingRequest {
  businessId: string
  customerId?: string
  staffId: string
  serviceId: string
  date: string
  time: string
  duration: number
  location: {
    address: string
    postcode: string
    region: string
  }
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  notes?: string
  price: number
  status?: 'pending' | 'confirmed' | 'cancelled'
}

export interface BookingFilters {
  businessId?: string
  staffId?: string
  customerId?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  region?: string
}

export class BookingService {
  private availabilityService = new AvailabilityService()
  private notificationService = new NotificationService()

  async createBooking(booking: CreateBookingRequest): Promise<string> {
    try {
      // First, verify the time slot is still available
      const isAvailable = await this.isSlotAvailable(
        booking.businessId,
        booking.staffId,
        booking.date,
        booking.time
      )

      if (!isAvailable) {
        throw new Error('This time slot is no longer available')
      }

      // Create or find customer
      const customerId = await this.ensureCustomer(booking.customer, booking.businessId)

      // Create the booking
      const bookingData: BookingInsert = {
        business_id: booking.businessId,
        customer_id: customerId,
        staff_id: booking.staffId,
        appointment_type_id: booking.serviceId,
        date: booking.date,
        time: booking.time,
        duration: booking.duration,
        location: booking.location,
        status: booking.status || 'pending',
        notes: booking.notes,
        price: booking.price,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single()

      if (error) throw error

      // Mark the availability slot as booked
      await this.markSlotAsBooked(
        booking.staffId,
        booking.date,
        booking.time,
        booking.location.region
      )

      // Schedule automated notifications
      await this.notificationService.scheduleBookingNotifications(data.id)

      return data.id
    } catch (error) {
      console.error('Error creating booking:', error)
      throw error
    }
  }

  async getBookings(filters: BookingFilters = {}) {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            email,
            phone
          ),
          staff (
            first_name,
            last_name,
            email,
            phone
          ),
          appointment_types (
            name,
            description,
            duration,
            price
          )
        `)

      if (filters.businessId) {
        query = query.eq('business_id', filters.businessId)
      }

      if (filters.staffId) {
        query = query.eq('staff_id', filters.staffId)
      }

      if (filters.customerId) {
        query = query.eq('customer_id', filters.customerId)
      }

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.dateFrom) {
        query = query.gte('date', filters.dateFrom)
      }

      if (filters.dateTo) {
        query = query.lte('date', filters.dateTo)
      }

      query = query.order('date', { ascending: true })
        .order('time', { ascending: true })

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching bookings:', error)
      throw error
    }
  }

  async updateBookingStatus(bookingId: string, status: 'pending' | 'confirmed' | 'cancelled' | 'completed') {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .select()
        .single()

      if (error) throw error

      // If cancelling, free up the availability slot and cancel notifications
      if (status === 'cancelled') {
        await this.freeAvailabilitySlot(bookingId)
        await this.notificationService.cancelNotificationsForBooking(bookingId)
      }

      return data
    } catch (error) {
      console.error('Error updating booking status:', error)
      throw error
    }
  }

  async rescheduleBooking(
    bookingId: string, 
    newDate: string, 
    newTime: string, 
    newStaffId?: string
  ) {
    try {
      // Get current booking details
      const { data: currentBooking, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single()

      if (fetchError) throw fetchError

      const staffId = newStaffId || currentBooking.staff_id
      
      // Check if new slot is available
      const isAvailable = await this.isSlotAvailable(
        currentBooking.business_id,
        staffId,
        newDate,
        newTime
      )

      if (!isAvailable) {
        throw new Error('The new time slot is not available')
      }

      // Free the old slot
      await this.freeAvailabilitySlot(bookingId)

      // Update the booking
      const { data, error } = await supabase
        .from('bookings')
        .update({
          date: newDate,
          time: newTime,
          staff_id: staffId,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select()
        .single()

      if (error) throw error

      // Mark new slot as booked
      await this.markSlotAsBooked(
        staffId,
        newDate,
        newTime,
        currentBooking.location.region
      )

      // Reschedule notifications for new date/time
      await this.notificationService.rescheduleNotificationsForBooking(bookingId, newDate, newTime)

      return data
    } catch (error) {
      console.error('Error rescheduling booking:', error)
      throw error
    }
  }

  private async isSlotAvailable(
    businessId: string,
    staffId: string,
    date: string,
    time: string
  ): Promise<boolean> {
    try {
      // Check if staff has availability for this slot
      const availability = await this.availabilityService.getStaffAvailability(
        staffId,
        date,
        date
      )

      const hasAvailability = availability.some(slot => 
        slot.date === date && slot.time === time
      )

      if (!hasAvailability) return false

      // Check if slot is already booked
      const { data: existingBooking } = await supabase
        .from('bookings')
        .select('id')
        .eq('staff_id', staffId)
        .eq('date', date)
        .eq('time', time)
        .eq('status', 'confirmed')
        .maybeSingle()

      return !existingBooking
    } catch (error) {
      console.error('Error checking slot availability:', error)
      return false
    }
  }

  private async ensureCustomer(
    customerData: { firstName: string; lastName: string; email: string; phone: string },
    businessId: string
  ): Promise<string> {
    try {
      // Try to find existing customer by email
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', customerData.email)
        .eq('business_id', businessId)
        .maybeSingle()

      if (existingCustomer) {
        return existingCustomer.id
      }

      // Create new customer
      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert({
          business_id: businessId,
          first_name: customerData.firstName,
          last_name: customerData.lastName,
          email: customerData.email,
          phone: customerData.phone,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (error) throw error
      return newCustomer.id
    } catch (error) {
      console.error('Error ensuring customer:', error)
      throw error
    }
  }

  private async markSlotAsBooked(
    staffId: string,
    date: string,
    time: string,
    region: string
  ) {
    try {
      // Update the availability slot to mark it as booked
      await supabase
        .from('staff_availability')
        .update({ 
          is_booked: true,
          updated_at: new Date().toISOString()
        })
        .eq('staff_id', staffId)
        .eq('date', date)
        .eq('time', time)
        .eq('region', region)
    } catch (error) {
      console.error('Error marking slot as booked:', error)
    }
  }

  private async freeAvailabilitySlot(bookingId: string) {
    try {
      // Get booking details
      const { data: booking } = await supabase
        .from('bookings')
        .select('staff_id, date, time, location')
        .eq('id', bookingId)
        .single()

      if (booking) {
        // Free the availability slot
        await supabase
          .from('staff_availability')
          .update({ 
            is_booked: false,
            updated_at: new Date().toISOString()
          })
          .eq('staff_id', booking.staff_id)
          .eq('date', booking.date)
          .eq('time', booking.time)
          .eq('region', booking.location.region)
      }
    } catch (error) {
      console.error('Error freeing availability slot:', error)
    }
  }

  private async sendBookingNotifications(bookingId: string, type: 'created' | 'status_changed' | 'rescheduled') {
    try {
      // Get booking details with customer and staff info
      const { data: booking } = await supabase
        .from('bookings')
        .select(`
          *,
          customers (first_name, last_name, email),
          staff (first_name, last_name, email),
          appointment_types (name)
        `)
        .eq('id', bookingId)
        .single()

      if (!booking) return

      // Here you would integrate with your notification system
      // For now, we'll just log the notification
      console.log(`Sending ${type} notification for booking:`, {
        bookingId,
        customer: booking.customers,
        staff: booking.staff,
        date: booking.date,
        time: booking.time,
        service: booking.appointment_types?.name
      })

      // TODO: Implement email notifications, SMS, etc.
      // This could integrate with services like SendGrid, Twilio, etc.
    } catch (error) {
      console.error('Error sending notifications:', error)
    }
  }

  async findBooking(searchQuery: string) {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            email,
            phone
          ),
          staff (
            first_name,
            last_name,
            email,
            phone,
            avatar_url
          ),
          appointment_types (
            name,
            description,
            duration,
            price
          ),
          businesses (
            name,
            phone,
            email
          )
        `)

      // Search by confirmation code (last 8 chars of ID) or customer email
      if (searchQuery.length <= 8) {
        // Assume it's a confirmation code
        query = query.ilike('id', `%${searchQuery}`)
      } else {
        // Assume it's an email, search through customers
        const { data: customers } = await supabase
          .from('customers')
          .select('id')
          .eq('email', searchQuery.toLowerCase())

        if (!customers || customers.length === 0) {
          return null
        }

        const customerIds = customers.map(c => c.id)
        query = query.in('customer_id', customerIds)
      }

      const { data, error } = await query.single()

      if (error || !data) return null

      // Transform to expected format
      return {
        id: data.id,
        confirmationCode: data.id.slice(-8).toUpperCase(),
        status: data.status,
        serviceName: data.appointment_types?.name || '',
        servicePrice: data.appointment_types?.price,
        duration: data.appointment_types?.duration || data.duration,
        date: data.date,
        time: data.time,
        staffMember: {
          id: data.staff_id,
          name: `${data.staff?.first_name} ${data.staff?.last_name}`,
          avatar: data.staff?.avatar_url
        },
        customer: {
          name: `${data.customers?.first_name} ${data.customers?.last_name}`,
          email: data.customers?.email || '',
          phone: data.customers?.phone || '',
          address: data.location?.address || '',
          postcode: data.location?.postcode || ''
        },
        business: {
          name: data.businesses?.name || '',
          phone: data.businesses?.phone || '',
          email: data.businesses?.email || ''
        },
        notes: data.notes,
        createdAt: data.created_at
      }
    } catch (error) {
      console.error('Error finding booking:', error)
      return null
    }
  }

  async cancelBooking(bookingId: string, reason?: string) {
    try {
      // Update booking status to cancelled
      const { data, error } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          cancellation_reason: reason,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select()
        .single()

      if (error) throw error

      // Free up the availability slot
      await this.freeAvailabilitySlot(bookingId)

      // Send cancellation notifications
      await this.sendBookingNotifications(bookingId, 'status_changed')

      return data
    } catch (error) {
      console.error('Error cancelling booking:', error)
      throw error
    }
  }

  async getBookingStats(businessId: string, staffId?: string) {
    try {
      const filters: any = { business_id: businessId }
      if (staffId) filters.staff_id = staffId

      // Get booking counts by status
      const { data: statusCounts } = await supabase
        .from('bookings')
        .select('status')
        .match(filters)

      // Get revenue data
      const { data: revenueData } = await supabase
        .from('bookings')
        .select('price, date')
        .match(filters)
        .eq('status', 'completed')

      // Calculate stats
      const stats = {
        total: statusCounts?.length || 0,
        pending: statusCounts?.filter(b => b.status === 'pending').length || 0,
        confirmed: statusCounts?.filter(b => b.status === 'confirmed').length || 0,
        completed: statusCounts?.filter(b => b.status === 'completed').length || 0,
        cancelled: statusCounts?.filter(b => b.status === 'cancelled').length || 0,
        totalRevenue: revenueData?.reduce((sum, b) => sum + (b.price || 0), 0) || 0,
        monthlyRevenue: revenueData?.filter(b => {
          const bookingDate = new Date(b.date)
          const now = new Date()
          return bookingDate.getMonth() === now.getMonth() && 
                 bookingDate.getFullYear() === now.getFullYear()
        }).reduce((sum, b) => sum + (b.price || 0), 0) || 0
      }

      return stats
    } catch (error) {
      console.error('Error getting booking stats:', error)
      throw error
    }
  }
}