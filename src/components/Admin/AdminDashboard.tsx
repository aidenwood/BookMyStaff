import React from 'react'
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Star
} from 'lucide-react'
import { Button } from '../ui/button'

interface StatCardProps {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
}

function StatCard({ title, value, change, changeType, icon }: StatCardProps) {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  }[changeType]

  const ChangeIcon = changeType === 'positive' ? ArrowUp : changeType === 'negative' ? ArrowDown : null

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium">{title}</h3>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </div>
      <div className="p-6 pt-0">
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs ${changeColor} flex items-center gap-1`}>
          {ChangeIcon && <ChangeIcon className="h-3 w-3" />}
          {change}
        </p>
      </div>
    </div>
  )
}

interface RecentBooking {
  id: string
  customer: string
  service: string
  staff: string
  time: string
  status: 'confirmed' | 'pending' | 'cancelled'
  amount: string
}

const recentBookings: RecentBooking[] = [
  {
    id: 'BK-001',
    customer: 'Sarah Johnson',
    service: 'Property Inspection',
    staff: 'John Smith',
    time: '2:00 PM Today',
    status: 'confirmed',
    amount: '$85.00'
  },
  {
    id: 'BK-002',
    customer: 'Mike Chen',
    service: 'Maintenance Check',
    staff: 'Emma Wilson',
    time: '4:30 PM Today',
    status: 'pending',
    amount: '$120.00'
  },
  {
    id: 'BK-003',
    customer: 'Lisa Martinez',
    service: 'Repair Service',
    staff: 'David Brown',
    time: '10:00 AM Tomorrow',
    status: 'confirmed',
    amount: '$195.00'
  },
  {
    id: 'BK-004',
    customer: 'Robert Davis',
    service: 'Consultation',
    staff: 'Sarah Miller',
    time: '1:00 PM Tomorrow',
    status: 'cancelled',
    amount: '$75.00'
  }
]

interface TopStaffMember {
  name: string
  revenue: string
  bookings: number
  rating: number
  region: string
}

const topStaff: TopStaffMember[] = [
  { name: 'John Smith', revenue: '$2,450', bookings: 28, rating: 4.9, region: 'Brisbane North' },
  { name: 'Emma Wilson', revenue: '$2,180', bookings: 24, rating: 4.8, region: 'Gold Coast' },
  { name: 'David Brown', revenue: '$1,950', bookings: 22, rating: 4.7, region: 'Brisbane South' },
  { name: 'Sarah Miller', revenue: '$1,820', bookings: 20, rating: 4.9, region: 'Logan' }
]

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back, John</h2>
          <p className="text-muted-foreground">
            Here's what's happening with your business today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value="$12,847"
            change="+12.5% from last month"
            changeType="positive"
            icon={<DollarSign className="h-4 w-4" />}
          />
          <StatCard
            title="Total Bookings"
            value="247"
            change="+8.2% from last month"
            changeType="positive"
            icon={<Calendar className="h-4 w-4" />}
          />
          <StatCard
            title="Active Staff"
            value="12"
            change="+2 new this month"
            changeType="positive"
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            title="Avg Response Time"
            value="2.4 hrs"
            change="-15% from last month"
            changeType="positive"
            icon={<Clock className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Recent Bookings */}
          <div className="col-span-4 rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-col space-y-1.5">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">Recent Bookings</h3>
              <p className="text-sm text-muted-foreground">
                Latest appointments and their status
              </p>
            </div>
            <div className="p-6 pt-0">
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{booking.customer}</p>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          booking.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {booking.status === 'confirmed' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {booking.status === 'pending' && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {booking.status === 'cancelled' && <XCircle className="h-3 w-3 mr-1" />}
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{booking.service} • {booking.staff}</p>
                      <p className="text-xs text-muted-foreground">{booking.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{booking.amount}</p>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Performing Staff */}
          <div className="col-span-3 rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 flex flex-col space-y-1.5">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">Top Staff</h3>
              <p className="text-sm text-muted-foreground">
                Best performing team members this month
              </p>
            </div>
            <div className="p-6 pt-0 space-y-4">
              {topStaff.map((staff, index) => (
                <div key={staff.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{staff.name}</p>
                      <p className="text-xs text-muted-foreground">{staff.region}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-medium">{staff.revenue}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs">{staff.rating}</span>
                      <span className="text-xs text-muted-foreground">({staff.bookings})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 flex flex-col space-y-1.5">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Quick Actions</h3>
            <p className="text-sm text-muted-foreground">
              Common tasks and shortcuts
            </p>
          </div>
          <div className="p-6 pt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button className="h-20 flex flex-col gap-2" variant="outline">
                <Calendar className="h-6 w-6" />
                <span>New Booking</span>
              </Button>
              <Button className="h-20 flex flex-col gap-2" variant="outline">
                <Users className="h-6 w-6" />
                <span>Add Staff Member</span>
              </Button>
              <Button className="h-20 flex flex-col gap-2" variant="outline">
                <MapPin className="h-6 w-6" />
                <span>Manage Regions</span>
              </Button>
              <Button className="h-20 flex flex-col gap-2" variant="outline">
                <TrendingUp className="h-6 w-6" />
                <span>View Reports</span>
              </Button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}