import type { CreateBookingRequest } from '../database/booking'
import type { IntegrationEvent } from './index'

export interface PipedriveConfig {
  apiToken: string
  pipelineId?: string
  stageId?: string
  personFieldMapping?: Record<string, string>
  dealFieldMapping?: Record<string, string>
  enabled: boolean
}

export class PipedriveService {
  private baseUrl = 'https://api.pipedrive.com/v1'

  async createDeal(booking: CreateBookingRequest & { id: string }, config: PipedriveConfig) {
    try {
      // First, create or find the person (customer)
      const personId = await this.createOrFindPerson(booking, config)
      
      // Then create the deal
      const dealData = {
        title: `${booking.customer.firstName} ${booking.customer.lastName} - ${booking.date} ${booking.time}`,
        person_id: personId,
        pipeline_id: config.pipelineId,
        stage_id: config.stageId,
        value: booking.price,
        currency: 'USD',
        expected_close_date: booking.date,
        add_time: new Date().toISOString(),
        custom_fields: this.mapBookingToDeal(booking, config.dealFieldMapping || {})
      }

      const response = await fetch(`${this.baseUrl}/deals?api_token=${config.apiToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dealData)
      })

      if (!response.ok) {
        throw new Error(`Pipedrive API error: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Add note with booking details
      if (result.data?.id) {
        await this.addBookingNote(result.data.id, booking, config)
      }

      return result.data
    } catch (error) {
      console.error('Error creating Pipedrive deal:', error)
      throw error
    }
  }

  private async createOrFindPerson(booking: CreateBookingRequest & { id: string }, config: PipedriveConfig) {
    try {
      // Search for existing person by email
      const searchResponse = await fetch(
        `${this.baseUrl}/persons/search?term=${encodeURIComponent(booking.customer.email)}&api_token=${config.apiToken}`
      )

      if (searchResponse.ok) {
        const searchResult = await searchResponse.json()
        if (searchResult.data?.items?.length > 0) {
          return searchResult.data.items[0].item.id
        }
      }

      // Create new person
      const personData = {
        name: `${booking.customer.firstName} ${booking.customer.lastName}`,
        email: [{ value: booking.customer.email, primary: true }],
        phone: [{ value: booking.customer.phone, primary: true }],
        add_time: new Date().toISOString(),
        custom_fields: this.mapCustomerToPerson(booking, config.personFieldMapping || {})
      }

      const createResponse = await fetch(`${this.baseUrl}/persons?api_token=${config.apiToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(personData)
      })

      if (!createResponse.ok) {
        throw new Error(`Error creating person: ${createResponse.statusText}`)
      }

      const result = await createResponse.json()
      return result.data.id
    } catch (error) {
      console.error('Error managing person in Pipedrive:', error)
      throw error
    }
  }

  private async addBookingNote(dealId: string, booking: CreateBookingRequest & { id: string }, config: PipedriveConfig) {
    try {
      const noteContent = `
Booking Details:
- Service: ${booking.serviceId}
- Date: ${booking.date} at ${booking.time}
- Duration: ${booking.duration} minutes
- Location: ${booking.location.address}, ${booking.location.postcode}
- Staff: ${booking.staffId}
- Status: ${booking.status}
${booking.notes ? `- Notes: ${booking.notes}` : ''}

Booking ID: ${booking.id}
      `.trim()

      await fetch(`${this.baseUrl}/notes?api_token=${config.apiToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: noteContent,
          deal_id: dealId,
          add_time: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Error adding note to Pipedrive deal:', error)
    }
  }

  private mapCustomerToPerson(booking: CreateBookingRequest & { id: string }, fieldMapping: Record<string, string>) {
    const customFields: Record<string, any> = {}
    
    // Apply custom field mappings
    if (fieldMapping.address && booking.location.address) {
      customFields[fieldMapping.address] = booking.location.address
    }
    if (fieldMapping.postcode && booking.location.postcode) {
      customFields[fieldMapping.postcode] = booking.location.postcode
    }
    if (fieldMapping.region && booking.location.region) {
      customFields[fieldMapping.region] = booking.location.region
    }

    return customFields
  }

  private mapBookingToDeal(booking: CreateBookingRequest & { id: string }, fieldMapping: Record<string, string>) {
    const customFields: Record<string, any> = {}
    
    // Apply custom field mappings
    if (fieldMapping.bookingId) {
      customFields[fieldMapping.bookingId] = booking.id
    }
    if (fieldMapping.appointmentTime) {
      customFields[fieldMapping.appointmentTime] = `${booking.date} ${booking.time}`
    }
    if (fieldMapping.duration) {
      customFields[fieldMapping.duration] = booking.duration
    }
    if (fieldMapping.staff) {
      customFields[fieldMapping.staff] = booking.staffId
    }
    if (fieldMapping.service) {
      customFields[fieldMapping.service] = booking.serviceId
    }

    return customFields
  }

  async handleEvent(event: IntegrationEvent, config: PipedriveConfig) {
    try {
      // Handle different event types
      switch (event.type) {
        case 'booking_updated':
          await this.updateDeal(event.data, config)
          break
        case 'booking_cancelled':
          await this.updateDealStatus(event.data, config, 'lost')
          break
        default:
          console.log(`Unhandled Pipedrive event: ${event.type}`)
      }
    } catch (error) {
      console.error('Error handling Pipedrive event:', error)
      throw error
    }
  }

  private async updateDeal(bookingData: any, config: PipedriveConfig) {
    // Implementation for updating existing deals
    // Would need to store deal ID mapping somewhere
  }

  private async updateDealStatus(bookingData: any, config: PipedriveConfig, status: 'won' | 'lost') {
    // Implementation for updating deal status
    // Would need to store deal ID mapping somewhere
  }

  async testConnection(config: PipedriveConfig): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/users/me?api_token=${config.apiToken}`)
      return response.ok
    } catch (error) {
      console.error('Pipedrive connection test failed:', error)
      return false
    }
  }

  async getPipelines(apiToken: string) {
    try {
      const response = await fetch(`${this.baseUrl}/pipelines?api_token=${apiToken}`)
      if (response.ok) {
        const result = await response.json()
        return result.data || []
      }
      return []
    } catch (error) {
      console.error('Error fetching pipelines:', error)
      return []
    }
  }

  async getStages(apiToken: string, pipelineId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/stages?pipeline_id=${pipelineId}&api_token=${apiToken}`)
      if (response.ok) {
        const result = await response.json()
        return result.data || []
      }
      return []
    } catch (error) {
      console.error('Error fetching stages:', error)
      return []
    }
  }
}