import { NotificationService } from './NotificationService'

export class NotificationScheduler {
  private notificationService = new NotificationService()
  private intervalId: NodeJS.Timeout | null = null

  start(intervalMinutes: number = 5) {
    // Process pending notifications every 5 minutes
    this.intervalId = setInterval(async () => {
      try {
        await this.notificationService.processPendingNotifications()
      } catch (error) {
        console.error('Error processing notifications:', error)
      }
    }, intervalMinutes * 60 * 1000)

    console.log(`Notification scheduler started (checking every ${intervalMinutes} minutes)`)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('Notification scheduler stopped')
    }
  }

  // Manual trigger for testing
  async processNow() {
    try {
      await this.notificationService.processPendingNotifications()
      console.log('Notifications processed manually')
    } catch (error) {
      console.error('Error processing notifications manually:', error)
    }
  }
}

// Singleton instance for the scheduler
export const notificationScheduler = new NotificationScheduler()