import React from 'react'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  Users,
  MapPin,
  Clock,
  Star
} from 'lucide-react'
import AdminLayout from './AdminLayout'

interface MetricCardProps {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
  icon: React.ReactNode
}

function MetricCard({ title, value, change, changeType, icon }: MetricCardProps) {
  const ChangeIcon = changeType === 'positive' ? TrendingUp : TrendingDown
  const changeColor = changeType === 'positive' ? 'text-green-600' : 'text-red-600'

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className={`text-xs flex items-center gap-1 ${changeColor}`}>
              <ChangeIcon className="h-3 w-3" />
              {change}
            </p>
          </div>
          <div className="text-muted-foreground">
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
}

const revenueData = [
  { month: 'Jan', revenue: 8500, bookings: 95 },
  { month: 'Feb', revenue: 9200, bookings: 108 },
  { month: 'Mar', revenue: 11800, bookings: 132 },
  { month: 'Apr', revenue: 10500, bookings: 118 },
  { month: 'May', revenue: 12400, bookings: 145 },
  { month: 'Jun', revenue: 13800, bookings: 156 },
]

const regionData = [
  { region: 'Brisbane North', bookings: 45, revenue: 4200, percentage: 28 },
  { region: 'Gold Coast', bookings: 38, revenue: 3600, percentage: 24 },
  { region: 'Brisbane South', bookings: 32, revenue: 2800, percentage: 20 },
  { region: 'Logan', bookings: 28, revenue: 2200, percentage: 18 },
  { region: 'Ipswich', bookings: 18, revenue: 1400, percentage: 10 },
]

const staffPerformance = [
  { name: 'John Smith', bookings: 28, revenue: 2450, rating: 4.9, efficiency: 92 },
  { name: 'Emma Wilson', bookings: 24, revenue: 2180, rating: 4.8, efficiency: 88 },
  { name: 'David Brown', bookings: 22, revenue: 1950, rating: 4.7, efficiency: 85 },
  { name: 'Sarah Miller', bookings: 20, revenue: 1820, rating: 4.9, efficiency: 87 },
]

export default function AnalyticsDashboard() {
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue))

  return (
    <AdminLayout currentPage="Analytics">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Detailed insights into your business performance
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Revenue Growth"
            value="+18.2%"
            change="vs last month"
            changeType="positive"
            icon={<DollarSign className="h-5 w-5" />}
          />
          <MetricCard
            title="Booking Rate"
            value="+12.5%"
            change="vs last month"
            changeType="positive"
            icon={<Calendar className="h-5 w-5" />}
          />
          <MetricCard
            title="Staff Efficiency"
            value="88.4%"
            change="+3.2% improvement"
            changeType="positive"
            icon={<Users className="h-5 w-5" />}
          />
          <MetricCard
            title="Avg Response"
            value="2.1 hrs"
            change="-0.8 hrs faster"
            changeType="positive"
            icon={<Clock className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Revenue Trend Chart */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
              <div className="space-y-4">
                {revenueData.map((data) => (
                  <div key={data.month} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium w-8">{data.month}</span>
                      <div className="flex-1 bg-muted rounded-full h-2 w-32">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">${data.revenue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{data.bookings} bookings</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Regional Performance */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Regional Performance</h3>
              <div className="space-y-4">
                {regionData.map((region) => (
                  <div key={region.region} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{region.region}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">${region.revenue.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{region.bookings} bookings</div>
                      </div>
                    </div>
                    <div className="bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${region.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Staff Performance Table */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Staff Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Staff Member</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Bookings</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Revenue</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Rating</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {staffPerformance.map((staff) => (
                    <tr key={staff.name} className="border-b">
                      <td className="py-4 font-medium">{staff.name}</td>
                      <td className="py-4">{staff.bookings}</td>
                      <td className="py-4">${staff.revenue.toLocaleString()}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span>{staff.rating}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-muted rounded-full h-2 w-16">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${staff.efficiency}%` }}
                            />
                          </div>
                          <span className="text-sm">{staff.efficiency}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h4 className="font-semibold mb-2">Peak Hours</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>2:00 PM - 4:00 PM</span>
                  <span className="font-medium">32%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>10:00 AM - 12:00 PM</span>
                  <span className="font-medium">28%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>4:00 PM - 6:00 PM</span>
                  <span className="font-medium">22%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h4 className="font-semibold mb-2">Popular Services</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Property Inspection</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Maintenance Check</span>
                  <span className="font-medium">28%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Repair Service</span>
                  <span className="font-medium">18%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h4 className="font-semibold mb-2">Customer Satisfaction</h4>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">4.8/5</div>
                <p className="text-sm text-muted-foreground">Average rating</p>
                <p className="text-xs text-muted-foreground mt-2">Based on 156 reviews</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}