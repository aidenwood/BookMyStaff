import type { Booking } from '../../types/appointment'
import type { BusinessIntegrations } from '../../types/business'

export interface IntegrationProvider {
  name: string
  type: 'crm' | 'webhook' | 'email' | 'calendar'
  isConfigured: boolean
  testConnection(): Promise<boolean>
  syncBooking(booking: Booking): Promise<boolean>
  syncAvailability?(staffId: string, availability: any[]): Promise<boolean>
}

export abstract class BaseIntegration implements IntegrationProvider {
  abstract name: string
  abstract type: 'crm' | 'webhook' | 'email' | 'calendar'
  abstract isConfigured: boolean

  abstract testConnection(): Promise<boolean>
  abstract syncBooking(booking: Booking): Promise<boolean>

  protected async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Integration request failed:`, error)
      throw error
    }
  }

  protected formatBookingData(booking: Booking): Record<string, any> {
    return {
      id: booking.id,
      customerName: booking.customerInfo.name,
      customerEmail: booking.customerInfo.email,
      customerPhone: booking.customerInfo.phone,
      customerAddress: booking.customerInfo.address,
      staffId: booking.staffId,
      appointmentType: booking.appointmentType.name,
      date: booking.date,
      time: booking.time,
      duration: booking.duration,
      status: booking.status,
      region: booking.region,
      confirmationCode: booking.confirmationCode,
      notes: booking.notes,
      createdAt: booking.createdAt
    }
  }
}

export class IntegrationManager {
  private providers: Map<string, IntegrationProvider> = new Map()

  registerProvider(provider: IntegrationProvider): void {
    this.providers.set(provider.name, provider)
  }

  getProvider(name: string): IntegrationProvider | undefined {
    return this.providers.get(name)
  }

  getConfiguredProviders(): IntegrationProvider[] {
    return Array.from(this.providers.values()).filter(p => p.isConfigured)
  }

  async syncBookingToAll(booking: Booking): Promise<{ provider: string; success: boolean; error?: string }[]> {
    const results = []
    const configuredProviders = this.getConfiguredProviders()

    for (const provider of configuredProviders) {
      try {
        const success = await provider.syncBooking(booking)
        results.push({ provider: provider.name, success })
      } catch (error) {
        console.error(`Failed to sync booking to ${provider.name}:`, error)
        results.push({ 
          provider: provider.name, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return results
  }

  async testAllConnections(): Promise<{ provider: string; connected: boolean; error?: string }[]> {
    const results = []
    const configuredProviders = this.getConfiguredProviders()

    for (const provider of configuredProviders) {
      try {
        const connected = await provider.testConnection()
        results.push({ provider: provider.name, connected })
      } catch (error) {
        console.error(`Failed to test connection to ${provider.name}:`, error)
        results.push({ 
          provider: provider.name, 
          connected: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return results
  }
}