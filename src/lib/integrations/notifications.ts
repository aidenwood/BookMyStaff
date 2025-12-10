import type { CreateBookingRequest } from '../database/booking'
import type { IntegrationEvent } from './index'
import type { Business } from '../../types/business'

export interface NotificationConfig {
  push?: {
    enabled: boolean
    vapidKey?: string
    endpoint?: string
  }
  sms?: {
    enabled: boolean
    provider: 'twilio' | 'aws-sns'
    accountSid?: string
    authToken?: string
    fromNumber?: string
  }
  enabled: boolean
}

export class NotificationService {
  async sendBookingNotifications(booking: CreateBookingRequest & { id: string }, business: Business) {
    const config = business.integrations?.notifications
    if (!config?.enabled) return

    const promises = []

    // Send push notification
    if (config.push?.enabled) {
      promises.push(this.sendPushNotification(booking, business, config))
    }

    // Send SMS notification
    if (config.sms?.enabled) {
      promises.push(this.sendSMSNotification(booking, business, config))
    }

    await Promise.allSettled(promises)
  }

  private async sendPushNotification(booking: CreateBookingRequest & { id: string }, business: Business, config: NotificationConfig) {
    try {
      // Implementation would depend on your push notification service
      // For example, using Web Push API, Firebase Cloud Messaging, etc.
      
      const notification = {
        title: `New Booking - ${business.name}`,
        body: `${booking.customer.firstName} ${booking.customer.lastName} booked for ${booking.date} at ${booking.time}`,
        icon: business.logo || '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: {
          bookingId: booking.id,
          businessId: booking.businessId,
          url: `/bookings/${booking.id}`
        }
      }

      // Mock push notification - in real implementation, you'd use a service like:
      // - Firebase Cloud Messaging
      // - Apple Push Notification service
      // - Web Push API
      console.log('Push notification sent:', notification)

    } catch (error) {
      console.error('Error sending push notification:', error)
      throw error
    }
  }

  private async sendSMSNotification(booking: CreateBookingRequest & { id: string }, business: Business, config: NotificationConfig) {
    try {
      if (!config.sms?.enabled) return

      const message = `New booking for ${business.name}: ${booking.customer.firstName} ${booking.customer.lastName} on ${booking.date} at ${booking.time}. Location: ${booking.location.address}. Booking ID: ${booking.id.slice(-8).toUpperCase()}`

      switch (config.sms.provider) {
        case 'twilio':
          await this.sendViaTwilio(message, config.sms)
          break
        case 'aws-sns':
          await this.sendViaAWSSNS(message, config.sms)
          break
        default:
          throw new Error(`Unsupported SMS provider: ${config.sms.provider}`)
      }

    } catch (error) {
      console.error('Error sending SMS notification:', error)
      throw error
    }
  }

  private async sendViaTwilio(message: string, smsConfig: any) {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${smsConfig.accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${smsConfig.accountSid}:${smsConfig.authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: smsConfig.fromNumber,
        To: '+61400000000', // Business owner's number - would be configurable
        Body: message
      })
    })

    if (!response.ok) {
      throw new Error(`Twilio SMS failed: ${response.statusText}`)
    }

    return await response.json()
  }

  private async sendViaAWSSNS(message: string, smsConfig: any) {
    // AWS SNS implementation would go here
    // This is a simplified mock
    console.log('AWS SNS SMS would be sent:', message)
  }

  async sendReminder(booking: any, business: Business, type: 'sms' | 'push' | 'email') {
    const config = business.integrations?.notifications
    if (!config?.enabled) return

    try {
      const reminderMessage = `Reminder: You have an appointment with ${business.name} tomorrow at ${booking.time}. Location: ${booking.location.address}. Questions? Call ${business.phone}`

      switch (type) {
        case 'sms':
          if (config.sms?.enabled) {
            await this.sendViaTwilio(reminderMessage, config.sms)
          }
          break
        case 'push':
          if (config.push?.enabled) {
            const notification = {
              title: 'Appointment Reminder',
              body: reminderMessage,
              icon: business.logo || '/icon-192x192.png',
              data: { bookingId: booking.id }
            }
            console.log('Reminder push notification sent:', notification)
          }
          break
      }
    } catch (error) {
      console.error('Error sending reminder:', error)
      throw error
    }
  }

  async handleEvent(event: IntegrationEvent, config: NotificationConfig) {
    try {
      // Handle different notification events
      switch (event.type) {
        case 'booking_updated':
          // Send update notification
          break
        case 'booking_cancelled':
          // Send cancellation notification
          break
        case 'staff_assigned':
          // Send staff assignment notification
          break
        default:
          console.log(`Unhandled notification event: ${event.type}`)
      }
    } catch (error) {
      console.error('Error handling notification event:', error)
      throw error
    }
  }

  async testConnection(config: NotificationConfig): Promise<boolean> {
    try {
      let results = []

      if (config.push?.enabled) {
        // Test push notification
        results.push(true) // Mock success
      }

      if (config.sms?.enabled && config.sms.provider === 'twilio') {
        // Test Twilio connection
        const testResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config.sms.accountSid}.json`, {
          headers: {
            'Authorization': `Basic ${btoa(`${config.sms.accountSid}:${config.sms.authToken}`)}`
          }
        })
        results.push(testResponse.ok)
      }

      return results.every(result => result === true)
    } catch (error) {
      console.error('Notification test failed:', error)
      return false
    }
  }

  async scheduleReminder(bookingId: string, reminderDate: Date, reminderType: 'sms' | 'push' | 'email') {
    try {
      // This would integrate with a job scheduler like:
      // - Redis with Bull Queue
      // - AWS EventBridge
      // - Cron jobs
      // - Database-based scheduler

      console.log(`Reminder scheduled for booking ${bookingId} at ${reminderDate.toISOString()} via ${reminderType}`)
      
      // Mock scheduling - in real implementation, you'd store this in a job queue
      const reminderJob = {
        id: `reminder-${bookingId}-${Date.now()}`,
        bookingId,
        type: reminderType,
        scheduledFor: reminderDate.toISOString(),
        status: 'scheduled'
      }

      return reminderJob
    } catch (error) {
      console.error('Error scheduling reminder:', error)
      throw error
    }
  }
}