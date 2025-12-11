import type { APIRoute } from 'astro'
import { PipedriveService } from '../../../lib/integrations/pipedrive'
import { ZapierService } from '../../../lib/integrations/zapier'
import { EmailService } from '../../../lib/integrations/email'

export const POST: APIRoute = async ({ request }) => {
  try {
    const { type, config } = await request.json()
    let result = { connected: false, error: null }

    switch (type) {
      case 'pipedrive':
        if (config.apiKey && config.domain) {
          const pipedrive = new PipedriveService()
          result.connected = await pipedrive.testConnection(config)
        } else {
          result.error = 'Missing API key or domain'
        }
        break

      case 'zapier':
        if (config.webhookUrl) {
          const zapier = new ZapierService()
          result.connected = await zapier.testWebhook(config)
        } else {
          result.error = 'Missing webhook URL'
        }
        break

      case 'email':
        const email = new EmailService()
        result.connected = await email.testConnection(config, {})
        break

      default:
        result.error = 'Unknown integration type'
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        connected: false,
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