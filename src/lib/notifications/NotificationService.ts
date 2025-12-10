import { supabase } from '../supabase'
import { format, addHours, addDays, subHours, isBefore } from 'date-fns'

export interface NotificationTemplate {
  id: string
  name: string
  type: 'email' | 'sms' | 'push'
  trigger: 'booking_created' | 'booking_confirmed' | 'reminder_24h' | 'reminder_2h' | 'booking_cancelled' | 'booking_rescheduled'
  subject?: string
  content: string
  isActive: boolean
  businessId: string
}

export interface ScheduledNotification {
  id?: string
  bookingId: string
  notificationType: string
  scheduledFor: string
  status: 'pending' | 'sent' | 'failed'
  recipientEmail?: string
  recipientPhone?: string
  content: string
  subject?: string
  createdAt: string
}

export interface NotificationConfig {
  emailEnabled: boolean
  smsEnabled: boolean
  pushEnabled: boolean
  reminder24hEnabled: boolean
  reminder2hEnabled: boolean
  businessEmail: string
  businessPhone?: string
  sendGridApiKey?: string
  twilioAccountSid?: string
  twilioAuthToken?: string
  twilioPhoneNumber?: string
}

export class NotificationService {
  
  async getNotificationConfig(businessId: string): Promise<NotificationConfig | null> {
    try {
      const { data, error } = await supabase
        .from('notification_configs')
        .select('*')
        .eq('business_id', businessId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return data ? {
        emailEnabled: data.email_enabled,
        smsEnabled: data.sms_enabled,
        pushEnabled: data.push_enabled,
        reminder24hEnabled: data.reminder_24h_enabled,
        reminder2hEnabled: data.reminder_2h_enabled,
        businessEmail: data.business_email,
        businessPhone: data.business_phone,
        sendGridApiKey: data.sendgrid_api_key,
        twilioAccountSid: data.twilio_account_sid,
        twilioAuthToken: data.twilio_auth_token,
        twilioPhoneNumber: data.twilio_phone_number
      } : null
    } catch (error) {
      console.error('Error fetching notification config:', error)
      return null
    }
  }

  async updateNotificationConfig(businessId: string, config: Partial<NotificationConfig>) {
    try {
      const { error } = await supabase
        .from('notification_configs')
        .upsert({
          business_id: businessId,
          email_enabled: config.emailEnabled,
          sms_enabled: config.smsEnabled,
          push_enabled: config.pushEnabled,
          reminder_24h_enabled: config.reminder24hEnabled,
          reminder_2h_enabled: config.reminder2hEnabled,
          business_email: config.businessEmail,
          business_phone: config.businessPhone,
          sendgrid_api_key: config.sendGridApiKey,
          twilio_account_sid: config.twilioAccountSid,
          twilio_auth_token: config.twilioAuthToken,
          twilio_phone_number: config.twilioPhoneNumber,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
    } catch (error) {
      console.error('Error updating notification config:', error)
      throw error
    }
  }

  async getNotificationTemplates(businessId: string): Promise<NotificationTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)

      if (error) throw error

      return (data || []).map(template => ({
        id: template.id,
        name: template.name,
        type: template.type,
        trigger: template.trigger,
        subject: template.subject,
        content: template.content,
        isActive: template.is_active,
        businessId: template.business_id
      }))
    } catch (error) {
      console.error('Error fetching notification templates:', error)
      return []
    }
  }

  async createNotificationTemplate(template: Omit<NotificationTemplate, 'id'>) {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .insert({
          name: template.name,
          type: template.type,
          trigger: template.trigger,
          subject: template.subject,
          content: template.content,
          is_active: template.isActive,
          business_id: template.businessId,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      console.error('Error creating notification template:', error)
      throw error
    }
  }

  async scheduleBookingNotifications(bookingId: string) {
    try {
      // Get booking details
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          customers (first_name, last_name, email, phone),
          staff (first_name, last_name),
          appointment_types (name),
          businesses (name, email, phone)
        `)
        .eq('id', bookingId)
        .single()

      if (bookingError) throw bookingError

      const appointmentDateTime = new Date(`${booking.date}T${booking.time}`)
      const now = new Date()
      
      // Get notification config
      const config = await this.getNotificationConfig(booking.business_id)
      if (!config) return

      // Schedule immediate confirmation
      await this.scheduleNotification({
        bookingId,
        notificationType: 'booking_created',
        scheduledFor: now.toISOString(),
        recipientEmail: booking.customers.email,
        recipientPhone: booking.customers.phone,
        content: this.generateBookingConfirmationContent(booking),
        subject: `Booking Confirmation - ${booking.businesses.name}`
      })

      // Schedule 24-hour reminder if enabled and appointment is more than 24 hours away
      if (config.reminder24hEnabled) {
        const reminder24h = subHours(appointmentDateTime, 24)
        if (isBefore(now, reminder24h)) {
          await this.scheduleNotification({
            bookingId,
            notificationType: 'reminder_24h',
            scheduledFor: reminder24h.toISOString(),
            recipientEmail: booking.customers.email,
            recipientPhone: booking.customers.phone,
            content: this.generate24HourReminderContent(booking),
            subject: `Reminder: Appointment Tomorrow - ${booking.businesses.name}`
          })
        }
      }

      // Schedule 2-hour reminder if enabled
      if (config.reminder2hEnabled) {
        const reminder2h = subHours(appointmentDateTime, 2)
        if (isBefore(now, reminder2h)) {
          await this.scheduleNotification({
            bookingId,
            notificationType: 'reminder_2h',
            scheduledFor: reminder2h.toISOString(),
            recipientEmail: booking.customers.email,
            recipientPhone: booking.customers.phone,
            content: this.generate2HourReminderContent(booking),
            subject: `Reminder: Appointment Today - ${booking.businesses.name}`
          })
        }
      }

    } catch (error) {
      console.error('Error scheduling booking notifications:', error)
      throw error
    }
  }

  async scheduleNotification(notification: Omit<ScheduledNotification, 'id' | 'createdAt'>) {
    try {
      const { error } = await supabase
        .from('scheduled_notifications')
        .insert({
          booking_id: notification.bookingId,
          notification_type: notification.notificationType,
          scheduled_for: notification.scheduledFor,
          status: 'pending',
          recipient_email: notification.recipientEmail,
          recipient_phone: notification.recipientPhone,
          content: notification.content,
          subject: notification.subject,
          created_at: new Date().toISOString()
        })

      if (error) throw error
    } catch (error) {
      console.error('Error scheduling notification:', error)
      throw error
    }
  }

  async processPendingNotifications() {
    try {
      const now = new Date().toISOString()
      
      // Get all pending notifications that are due
      const { data: notifications, error } = await supabase
        .from('scheduled_notifications')
        .select(`
          *,
          bookings (
            business_id,
            customers (first_name, last_name),
            businesses (name)
          )
        `)
        .eq('status', 'pending')
        .lte('scheduled_for', now)

      if (error) throw error

      for (const notification of notifications || []) {
        try {
          await this.sendNotification(notification)
          
          // Mark as sent
          await supabase
            .from('scheduled_notifications')
            .update({ 
              status: 'sent',
              sent_at: new Date().toISOString()
            })
            .eq('id', notification.id)

        } catch (sendError) {
          console.error(`Failed to send notification ${notification.id}:`, sendError)
          
          // Mark as failed
          await supabase
            .from('scheduled_notifications')
            .update({ 
              status: 'failed',
              error_message: sendError instanceof Error ? sendError.message : 'Unknown error'
            })
            .eq('id', notification.id)
        }
      }

    } catch (error) {
      console.error('Error processing pending notifications:', error)
    }
  }

  private async sendNotification(notification: any) {
    const businessId = notification.bookings.business_id
    const config = await this.getNotificationConfig(businessId)
    
    if (!config) {
      throw new Error('No notification configuration found')
    }

    // Send email if enabled
    if (config.emailEnabled && notification.recipient_email) {
      await this.sendEmail({
        to: notification.recipient_email,
        subject: notification.subject,
        content: notification.content,
        businessId
      })
    }

    // Send SMS if enabled
    if (config.smsEnabled && notification.recipient_phone) {
      await this.sendSMS({
        to: notification.recipient_phone,
        content: this.stripHtmlFromContent(notification.content),
        businessId
      })
    }
  }

  private async sendEmail({ to, subject, content, businessId }: {
    to: string
    subject: string
    content: string
    businessId: string
  }) {
    const config = await this.getNotificationConfig(businessId)
    
    if (!config?.sendGridApiKey) {
      console.log('SendGrid not configured, logging email instead:', { to, subject })
      return
    }

    // Here you would integrate with SendGrid or your preferred email service
    // For now, we'll log the email
    console.log('Sending email:', {
      to,
      subject,
      content: content.substring(0, 100) + '...'
    })
  }

  private async sendSMS({ to, content, businessId }: {
    to: string
    content: string
    businessId: string
  }) {
    const config = await this.getNotificationConfig(businessId)
    
    if (!config?.twilioAccountSid) {
      console.log('Twilio not configured, logging SMS instead:', { to, content })
      return
    }

    // Here you would integrate with Twilio or your preferred SMS service
    // For now, we'll log the SMS
    console.log('Sending SMS:', {
      to,
      content: content.substring(0, 100) + '...'
    })
  }

  private generateBookingConfirmationContent(booking: any): string {
    const appointmentDate = format(new Date(booking.date), 'EEEE, MMMM do, yyyy')
    const appointmentTime = format(new Date(`${booking.date}T${booking.time}`), 'h:mm a')
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Booking Confirmed!</h2>
        <p>Hi ${booking.customers.first_name},</p>
        <p>Your appointment with <strong>${booking.businesses.name}</strong> has been confirmed.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Appointment Details</h3>
          <p><strong>Service:</strong> ${booking.appointment_types.name}</p>
          <p><strong>Date:</strong> ${appointmentDate}</p>
          <p><strong>Time:</strong> ${appointmentTime}</p>
          <p><strong>Staff Member:</strong> ${booking.staff.first_name} ${booking.staff.last_name}</p>
          ${booking.location ? `<p><strong>Location:</strong> ${booking.location.address}</p>` : ''}
        </div>
        
        <p>We'll send you a reminder 24 hours before your appointment.</p>
        <p>If you need to reschedule or cancel, please contact us at ${booking.businesses.phone} or ${booking.businesses.email}</p>
        
        <p>Thank you for choosing ${booking.businesses.name}!</p>
      </div>
    `
  }

  private generate24HourReminderContent(booking: any): string {
    const appointmentDate = format(new Date(booking.date), 'EEEE, MMMM do, yyyy')
    const appointmentTime = format(new Date(`${booking.date}T${booking.time}`), 'h:mm a')
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Appointment Reminder</h2>
        <p>Hi ${booking.customers.first_name},</p>
        <p>This is a friendly reminder that you have an appointment scheduled for <strong>tomorrow</strong>.</p>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="margin-top: 0; color: #92400e;">Tomorrow's Appointment</h3>
          <p><strong>Date:</strong> ${appointmentDate}</p>
          <p><strong>Time:</strong> ${appointmentTime}</p>
          <p><strong>Staff Member:</strong> ${booking.staff.first_name} ${booking.staff.last_name}</p>
          <p><strong>Service:</strong> ${booking.appointment_types.name}</p>
        </div>
        
        <p>Please make sure you're available at the scheduled time. If you need to reschedule, please contact us as soon as possible.</p>
        <p>Contact: ${booking.businesses.phone} or ${booking.businesses.email}</p>
        
        <p>See you tomorrow!</p>
        <p>- ${booking.businesses.name}</p>
      </div>
    `
  }

  private generate2HourReminderContent(booking: any): string {
    const appointmentTime = format(new Date(`${booking.date}T${booking.time}`), 'h:mm a')
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Appointment Starting Soon!</h2>
        <p>Hi ${booking.customers.first_name},</p>
        <p>Your appointment with <strong>${booking.businesses.name}</strong> starts in approximately 2 hours.</p>
        
        <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin-top: 0; color: #991b1b;">Today's Appointment</h3>
          <p><strong>Time:</strong> ${appointmentTime}</p>
          <p><strong>Staff Member:</strong> ${booking.staff.first_name} ${booking.staff.last_name}</p>
          ${booking.location ? `<p><strong>Location:</strong> ${booking.location.address}</p>` : ''}
        </div>
        
        <p>Please ensure you're ready for your appointment. If you're running late or need to reschedule, please contact us immediately.</p>
        <p><strong>Contact:</strong> ${booking.businesses.phone}</p>
        
        <p>Thank you!</p>
        <p>- ${booking.businesses.name}</p>
      </div>
    `
  }

  private stripHtmlFromContent(content: string): string {
    return content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
  }

  async cancelNotificationsForBooking(bookingId: string) {
    try {
      await supabase
        .from('scheduled_notifications')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('booking_id', bookingId)
        .eq('status', 'pending')
    } catch (error) {
      console.error('Error cancelling notifications:', error)
    }
  }

  async rescheduleNotificationsForBooking(bookingId: string, newDate: string, newTime: string) {
    try {
      // Cancel existing notifications
      await this.cancelNotificationsForBooking(bookingId)
      
      // Schedule new notifications
      await this.scheduleBookingNotifications(bookingId)
    } catch (error) {
      console.error('Error rescheduling notifications:', error)
    }
  }
}