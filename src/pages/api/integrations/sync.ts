import type { APIRoute } from 'astro'
import { integrationManager, initializeIntegrations } from '../../../lib/integrations'

export const POST: APIRoute = async ({ request }) => {
  try {
    const { bookingData, businessConfig } = await request.json()

    // Initialize integrations with business config
    initializeIntegrations(businessConfig?.integrations)

    // Sync booking to all configured integrations
    const results = await integrationManager.syncBookingToAll(bookingData)

    const success = results.every(r => r.success)
    const errors = results.filter(r => !r.success).map(r => r.error)

    return new Response(JSON.stringify({
      success,
      results,
      errors: errors.length > 0 ? errors : null
    }), {
      status: success ? 200 : 207, // 207 = Multi-Status
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Integration sync error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}