import React, { useState, useEffect } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  X, 
  AlertTriangle,
  Eye,
  Send,
  Calendar,
  Users,
  Activity
} from 'lucide-react'
import { Button } from '../ui/button'
import { Alert, AlertDescription } from '../ui/alert'
import { useAuthStore } from '../../lib/authStore'
import { supabase } from '../../lib/supabase'
import { notificationScheduler } from '../../lib/notifications/NotificationScheduler'

interface NotificationLog {
  id: string
  bookingId: string
  notificationType: string
  scheduledFor: string
  sentAt?: string
  status: 'pending' | 'sent' | 'failed'
  recipientEmail?: string
  recipientPhone?: string
  subject?: string
  errorMessage?: string
  booking?: {
    customerName: string
    serviceName: string
    appointmentDate: string
    appointmentTime: string
  }
}

interface NotificationStats {
  totalScheduled: number
  totalSent: number
  totalFailed: number
  pendingToday: number
  emailsSent24h: number
  smsSent24h: number
}

export default function NotificationDashboard() {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<NotificationLog[]>([])
  const [stats, setStats] = useState<NotificationStats>({
    totalScheduled: 0,
    totalSent: 0,
    totalFailed: 0,
    pendingToday: 0,
    emailsSent24h: 0,
    smsSent24h: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent' | 'failed'>('all')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (user?.businessId) {
      loadNotifications()
      loadStats()
    }
  }, [user, filter])

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      
      let query = supabase
        .from('scheduled_notifications')
        .select(`
          *,
          bookings (
            customers (first_name, last_name),
            appointment_types (name),
            date,
            time
          )
        `)
        .order('scheduled_for', { ascending: false })
        .limit(100)

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error

      const formattedNotifications: NotificationLog[] = (data || []).map(item => ({
        id: item.id,
        bookingId: item.booking_id,
        notificationType: item.notification_type,
        scheduledFor: item.scheduled_for,
        sentAt: item.sent_at,
        status: item.status,
        recipientEmail: item.recipient_email,
        recipientPhone: item.recipient_phone,
        subject: item.subject,
        errorMessage: item.error_message,
        booking: item.bookings ? {
          customerName: `${item.bookings.customers?.first_name || ''} ${item.bookings.customers?.last_name || ''}`.trim(),
          serviceName: item.bookings.appointment_types?.name || 'Unknown Service',
          appointmentDate: item.bookings.date,
          appointmentTime: item.bookings.time
        } : undefined
      }))

      setNotifications(formattedNotifications)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      const yesterday = format(new Date(Date.now() - 24 * 60 * 60 * 1000), 'yyyy-MM-dd')

      const [
        { count: totalScheduled },
        { count: totalSent },
        { count: totalFailed },
        { count: pendingToday },
        { count: emailsSent24h },
        { count: smsSent24h }
      ] = await Promise.all([
        supabase.from('scheduled_notifications').select('*', { count: 'exact', head: true }),
        supabase.from('scheduled_notifications').select('*', { count: 'exact', head: true }).eq('status', 'sent'),
        supabase.from('scheduled_notifications').select('*', { count: 'exact', head: true }).eq('status', 'failed'),
        supabase.from('scheduled_notifications').select('*', { count: 'exact', head: true }).eq('status', 'pending').gte('scheduled_for', today),
        supabase.from('scheduled_notifications').select('*', { count: 'exact', head: true }).eq('status', 'sent').gte('sent_at', yesterday + ' 00:00:00').not('recipient_email', 'is', null),
        supabase.from('scheduled_notifications').select('*', { count: 'exact', head: true }).eq('status', 'sent').gte('sent_at', yesterday + ' 00:00:00').not('recipient_phone', 'is', null)
      ])

      setStats({
        totalScheduled: totalScheduled || 0,
        totalSent: totalSent || 0,
        totalFailed: totalFailed || 0,
        pendingToday: pendingToday || 0,
        emailsSent24h: emailsSent24h || 0,
        smsSent24h: smsSent24h || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleProcessNotifications = async () => {
    try {
      setIsProcessing(true)
      await notificationScheduler.processNow()
      await loadNotifications()
      await loadStats()
    } catch (error) {
      console.error('Error processing notifications:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'booking_created':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'reminder_24h':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'reminder_2h':
        return <Bell className="h-4 w-4 text-orange-600" />
      case 'booking_cancelled':
        return <X className="h-4 w-4 text-red-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-600 bg-green-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatNotificationType = (type: string) => {
    switch (type) {
      case 'booking_created': return 'Booking Confirmation'
      case 'reminder_24h': return '24 Hour Reminder'
      case 'reminder_2h': return '2 Hour Reminder'
      case 'booking_cancelled': return 'Cancellation Notice'
      case 'booking_rescheduled': return 'Reschedule Notice'
      default: return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return format(date, 'MMM do, h:mm a')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Notification Dashboard</h1>
          <p className="text-gray-600">Monitor and manage automated notifications</p>
        </div>
        <Button onClick={handleProcessNotifications} disabled={isProcessing}>
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Process Now
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalScheduled}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Successfully Sent</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Today</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center">
            <Mail className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Emails (24h)</p>
              <p className="text-2xl font-bold text-gray-900">{stats.emailsSent24h}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">SMS (24h)</p>
              <p className="text-2xl font-bold text-gray-900">{stats.smsSent24h}</p>
            </div>
          </div>
        </div>

        {stats.totalFailed > 0 && (
          <div className="bg-white border border-red-200 rounded-xl p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-900">{stats.totalFailed}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex space-x-4">
          {(['all', 'pending', 'sent', 'failed'] as const).map((filterOption) => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? "default" : "outline"}
              onClick={() => setFilter(filterOption)}
              size="sm"
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600">Notifications will appear here once bookings are created.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getNotificationTypeIcon(notification.notificationType)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">
                        {formatNotificationType(notification.notificationType)}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                        {notification.status}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      {notification.booking && (
                        <p className="text-sm text-gray-600">
                          <strong>{notification.booking.customerName}</strong> • {notification.booking.serviceName}
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-600">
                        {notification.recipientEmail && (
                          <span className="inline-flex items-center mr-4">
                            <Mail className="h-3 w-3 mr-1" />
                            {notification.recipientEmail}
                          </span>
                        )}
                        {notification.recipientPhone && (
                          <span className="inline-flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {notification.recipientPhone}
                          </span>
                        )}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>
                          Scheduled: {formatTime(notification.scheduledFor)}
                        </span>
                        {notification.sentAt && (
                          <span>
                            Sent: {formatTime(notification.sentAt)}
                          </span>
                        )}
                        {notification.status === 'pending' && (
                          <span>
                            Due: {formatDistanceToNow(new Date(notification.scheduledFor), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      
                      {notification.errorMessage && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertDescription className="text-xs">
                            {notification.errorMessage}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}