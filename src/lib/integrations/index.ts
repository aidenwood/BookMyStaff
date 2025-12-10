export * from './pipedrive'
export * from './zapier'
export * from './email'
export * from './notifications'

import { PipedriveService } from './pipedrive'
import { ZapierService } from './zapier'
import { EmailService } from './email'
import { NotificationService } from './notifications'
import type { CreateBookingRequest } from '../database/booking'
import type { Business } from '../../types/business'

export interface IntegrationEvent {
  type: 'booking_created' | 'booking_updated' | 'booking_cancelled' | 'staff_assigned'
  data: any
  businessId: string
  timestamp: string
}

export class IntegrationManager {
  private pipedriveService = new PipedriveService()
  private zapierService = new ZapierService()
  private emailService = new EmailService()
  private notificationService = new NotificationService()

  async syncBookingToAllIntegrations(
    booking: CreateBookingRequest & { id: string },
    business: Business
  ) {
    const integrations = business.integrations || {}
    const results: { [key: string]: boolean } = {}

    try {
      // Pipedrive Integration
      if (integrations.pipedrive?.enabled) {
        try {
          await this.pipedriveService.createDeal(booking, integrations.pipedrive)
          results.pipedrive = true
        } catch (error) {
          console.error('Pipedrive sync failed:', error)
          results.pipedrive = false
        }
      }

      // Zapier Integration
      if (integrations.zapier?.enabled) {
        try {
          await this.zapierService.sendWebhook(booking, integrations.zapier)
          results.zapier = true
        } catch (error) {
          console.error('Zapier sync failed:', error)
          results.zapier = false
        }
      }

      // Email Notifications
      if (integrations.email?.enabled || true) { // Always send emails if configured
        try {
          await this.emailService.sendBookingConfirmation(booking, business)
          await this.emailService.sendStaffNotification(booking, business)
          results.email = true
        } catch (error) {
          console.error('Email sync failed:', error)
          results.email = false
        }
      }

      // Push/SMS Notifications
      if (integrations.notifications?.enabled) {
        try {
          await this.notificationService.sendBookingNotifications(booking, business)
          results.notifications = true
        } catch (error) {
          console.error('Notification sync failed:', error)
          results.notifications = false
        }
      }

      return results
    } catch (error) {
      console.error('Integration sync failed:', error)
      throw error
    }
  }

  async triggerEvent(event: IntegrationEvent, business: Business) {
    const integrations = business.integrations || {}

    // Send to all enabled integrations
    const promises = []

    if (integrations.pipedrive?.enabled) {
      promises.push(
        this.pipedriveService.handleEvent(event, integrations.pipedrive)
          .catch(error => console.error('Pipedrive event failed:', error))
      )
    }

    if (integrations.zapier?.enabled) {
      promises.push(
        this.zapierService.handleEvent(event, integrations.zapier)
          .catch(error => console.error('Zapier event failed:', error))
      )
    }

    if (integrations.email?.enabled) {
      promises.push(
        this.emailService.handleEvent(event, business)
          .catch(error => console.error('Email event failed:', error))
      )
    }

    await Promise.allSettled(promises)
  }

  async testIntegration(
    type: 'pipedrive' | 'zapier' | 'email' | 'notifications',
    config: any,
    business: Business
  ): Promise<boolean> {
    try {
      switch (type) {
        case 'pipedrive':
          return await this.pipedriveService.testConnection(config)
        case 'zapier':
          return await this.zapierService.testWebhook(config)
        case 'email':
          return await this.emailService.testConnection(config, business)
        case 'notifications':
          return await this.notificationService.testConnection(config)
        default:
          return false
      }
    } catch (error) {
      console.error(`${type} test failed:`, error)
      return false
    }
  }
}

export const integrationManager = new IntegrationManager()

// Initialize integrations with configuration
export function initializeIntegrations(config?: any) {
  // Configuration would be used to setup integration services
  // For now, this is a no-op as services are initialized on demand
  console.log('Integrations initialized with config:', config)
}