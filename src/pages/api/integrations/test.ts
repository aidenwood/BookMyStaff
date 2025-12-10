import type { APIRoute } from 'astro'
import { PipedriveIntegration } from '../../../lib/integrations/pipedrive'
import { ZapierIntegration } from '../../../lib/integrations/zapier'
import { EmailIntegration } from '../../../lib/integrations/email'

export const POST: APIRoute = async ({ request }) => {
  try {
    const { type, config } = await request.json()
    let result = { connected: false, error: null }

    switch (type) {
      case 'pipedrive':
        if (config.apiKey && config.domain) {
          const pipedrive = new PipedriveIntegration(config.apiKey, config.domain)
          result.connected = await pipedrive.testConnection()
        } else {
          result.error = 'Missing API key or domain'
        }
        break

      case 'zapier':
        if (config.webhookUrl) {
          const zapier = new ZapierIntegration(config.webhookUrl)
          result.connected = await zapier.testConnection()
        } else {
          result.error = 'Missing webhook URL'
        }
        break

      case 'email':
        const email = new EmailIntegration()
        result.connected = await email.testConnection()
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