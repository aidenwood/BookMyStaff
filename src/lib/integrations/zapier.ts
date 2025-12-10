import type { CreateBookingRequest } from '../database/booking'
import type { IntegrationEvent } from './index'

export interface ZapierConfig {
  webhookUrl: string
  enabled: boolean
  events?: string[]
}

export class ZapierService {
  async sendWebhook(booking: CreateBookingRequest & { id: string }, config: ZapierConfig) {
    try {
      const payload = {
        event: 'booking_created',
        booking: {
          id: booking.id,
          businessId: booking.businessId,
          customer: booking.customer,
          staff: booking.staffId,
          service: booking.serviceId,
          date: booking.date,
          time: booking.time,
          duration: booking.duration,
          location: booking.location,
          price: booking.price,
          status: booking.status,
          notes: booking.notes,
          createdAt: new Date().toISOString()
        }
      }

      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Zapier webhook failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error sending Zapier webhook:', error)
      throw error
    }
  }

  async handleEvent(event: IntegrationEvent, config: ZapierConfig) {
    try {
      if (!config.events || config.events.includes(event.type)) {
        const payload = {
          event: event.type,
          data: event.data,
          businessId: event.businessId,
          timestamp: event.timestamp
        }

        await fetch(config.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
      }
    } catch (error) {
      console.error('Error handling Zapier event:', error)
      throw error
    }
  }

  async testWebhook(config: ZapierConfig): Promise<boolean> {
    try {
      const testPayload = {
        event: 'test',
        message: 'Test webhook from BookMyStaff',
        timestamp: new Date().toISOString()
      }

      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testPayload)
      })

      return response.ok
    } catch (error) {
      console.error('Zapier webhook test failed:', error)
      return false
    }
  }
}