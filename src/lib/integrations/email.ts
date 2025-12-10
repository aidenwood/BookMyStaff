import type { CreateBookingRequest } from '../database/booking'
import type { IntegrationEvent } from './index'
import type { Business } from '../../types/business'

export interface EmailConfig {
  provider: 'sendgrid' | 'mailgun' | 'resend' | 'smtp'
  apiKey?: string
  domain?: string
  fromEmail: string
  fromName: string
  enabled: boolean
  templates?: {
    customerConfirmation?: string
    staffNotification?: string
    customerReminder?: string
  }
}

export class EmailService {
  async sendBookingConfirmation(booking: CreateBookingRequest & { id: string }, business: Business) {
    const config = business.integrations?.email
    if (!config?.enabled) return

    try {
      const emailData = {
        to: booking.customer.email,
        from: { email: config.fromEmail, name: config.fromName || business.name },
        subject: `Booking Confirmation - ${business.name}`,
        html: this.generateConfirmationEmail(booking, business),
        templateId: config.templates?.customerConfirmation
      }

      await this.sendEmail(emailData, config)
    } catch (error) {
      console.error('Error sending confirmation email:', error)
      throw error
    }
  }

  async sendStaffNotification(booking: CreateBookingRequest & { id: string }, business: Business) {
    const config = business.integrations?.email
    if (!config?.enabled) return

    try {
      const emailData = {
        to: business.email, // Or specific staff email
        from: { email: config.fromEmail, name: config.fromName || business.name },
        subject: `New Booking - ${booking.customer.firstName} ${booking.customer.lastName}`,
        html: this.generateStaffNotificationEmail(booking, business),
        templateId: config.templates?.staffNotification
      }

      await this.sendEmail(emailData, config)
    } catch (error) {
      console.error('Error sending staff notification email:', error)
      throw error
    }
  }

  private async sendEmail(emailData: any, config: EmailConfig) {
    switch (config.provider) {
      case 'sendgrid':
        return await this.sendViaSendGrid(emailData, config)
      case 'resend':
        return await this.sendViaResend(emailData, config)
      case 'mailgun':
        return await this.sendViaMailgun(emailData, config)
      default:
        throw new Error(`Unsupported email provider: ${config.provider}`)
    }
  }

  private async sendViaSendGrid(emailData: any, config: EmailConfig) {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: emailData.to }],
          subject: emailData.subject
        }],
        from: emailData.from,
        content: [{
          type: 'text/html',
          value: emailData.html
        }],
        ...(emailData.templateId && { template_id: emailData.templateId })
      })
    })

    if (!response.ok) {
      throw new Error(`SendGrid error: ${response.statusText}`)
    }

    return response
  }

  private async sendViaResend(emailData: any, config: EmailConfig) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${emailData.from.name} <${emailData.from.email}>`,
        to: [emailData.to],
        subject: emailData.subject,
        html: emailData.html
      })
    })

    if (!response.ok) {
      throw new Error(`Resend error: ${response.statusText}`)
    }

    return response
  }

  private async sendViaMailgun(emailData: any, config: EmailConfig) {
    const formData = new FormData()
    formData.append('from', `${emailData.from.name} <${emailData.from.email}>`)
    formData.append('to', emailData.to)
    formData.append('subject', emailData.subject)
    formData.append('html', emailData.html)

    const response = await fetch(`https://api.mailgun.net/v3/${config.domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${config.apiKey}`)}`
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Mailgun error: ${response.statusText}`)
    }

    return response
  }

  private generateConfirmationEmail(booking: CreateBookingRequest & { id: string }, business: Business): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Booking Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4ECDC4; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Booking Confirmed!</h1>
            <p>Your appointment with ${business.name} has been scheduled</p>
        </div>
        
        <div class="content">
            <p>Dear ${booking.customer.firstName},</p>
            <p>Thank you for booking with us! Here are your appointment details:</p>
            
            <div class="booking-details">
                <h3>Appointment Details</h3>
                <div class="detail-row">
                    <strong>Date:</strong>
                    <span>${new Date(booking.date).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                    <strong>Time:</strong>
                    <span>${booking.time}</span>
                </div>
                <div class="detail-row">
                    <strong>Duration:</strong>
                    <span>${booking.duration} minutes</span>
                </div>
                <div class="detail-row">
                    <strong>Location:</strong>
                    <span>${booking.location.address}</span>
                </div>
                <div class="detail-row">
                    <strong>Price:</strong>
                    <span>$${booking.price}</span>
                </div>
                <div class="detail-row">
                    <strong>Confirmation #:</strong>
                    <span>${booking.id.slice(-8).toUpperCase()}</span>
                </div>
            </div>
            
            <p><strong>What's next?</strong></p>
            <ul>
                <li>You'll receive a reminder 24 hours before your appointment</li>
                <li>Our team may contact you to confirm details</li>
                <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>Questions? Contact us at ${business.phone} or ${business.email}</p>
            <p>© ${new Date().getFullYear()} ${business.name}</p>
        </div>
    </div>
</body>
</html>
    `
  }

  private generateStaffNotificationEmail(booking: CreateBookingRequest & { id: string }, business: Business): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Booking Alert</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #FF6B35; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Booking Alert</h1>
            <p>A new appointment has been scheduled</p>
        </div>
        
        <div class="content">
            <div class="booking-details">
                <h3>Customer Information</h3>
                <div class="detail-row">
                    <strong>Name:</strong>
                    <span>${booking.customer.firstName} ${booking.customer.lastName}</span>
                </div>
                <div class="detail-row">
                    <strong>Email:</strong>
                    <span>${booking.customer.email}</span>
                </div>
                <div class="detail-row">
                    <strong>Phone:</strong>
                    <span>${booking.customer.phone}</span>
                </div>
            </div>
            
            <div class="booking-details">
                <h3>Appointment Details</h3>
                <div class="detail-row">
                    <strong>Date:</strong>
                    <span>${new Date(booking.date).toLocaleDateString()}</span>
                </div>
                <div class="detail-row">
                    <strong>Time:</strong>
                    <span>${booking.time}</span>
                </div>
                <div class="detail-row">
                    <strong>Location:</strong>
                    <span>${booking.location.address}, ${booking.location.postcode}</span>
                </div>
                <div class="detail-row">
                    <strong>Staff:</strong>
                    <span>${booking.staffId}</span>
                </div>
                <div class="detail-row">
                    <strong>Service:</strong>
                    <span>${booking.serviceId}</span>
                </div>
                <div class="detail-row">
                    <strong>Price:</strong>
                    <span>$${booking.price}</span>
                </div>
                <div class="detail-row">
                    <strong>Booking ID:</strong>
                    <span>${booking.id}</span>
                </div>
            </div>
            
            ${booking.notes ? `
            <div class="booking-details">
                <h3>Customer Notes</h3>
                <p>${booking.notes}</p>
            </div>
            ` : ''}
        </div>
    </div>
</body>
</html>
    `
  }

  async handleEvent(event: IntegrationEvent, business: Business) {
    const config = business.integrations?.email
    if (!config?.enabled) return

    try {
      switch (event.type) {
        case 'booking_updated':
          // Send update notification
          break
        case 'booking_cancelled':
          // Send cancellation notification
          break
        default:
          console.log(`Unhandled email event: ${event.type}`)
      }
    } catch (error) {
      console.error('Error handling email event:', error)
      throw error
    }
  }

  async testConnection(config: EmailConfig, business: Business): Promise<boolean> {
    try {
      const testEmailData = {
        to: business.email,
        from: { email: config.fromEmail, name: config.fromName || business.name },
        subject: 'Test Email from BookMyStaff',
        html: '<p>This is a test email from your BookMyStaff integration.</p>'
      }

      await this.sendEmail(testEmailData, config)
      return true
    } catch (error) {
      console.error('Email test failed:', error)
      return false
    }
  }
}