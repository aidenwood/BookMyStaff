import React, { useState } from 'react'
import { 
  Search, 
  Filter, 
  Calendar, 
  MoreHorizontal, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  Plus
} from 'lucide-react'
import { Button } from '../ui/button'
import AdminLayout from './AdminLayout'

interface Booking {
  id: string
  customer: {
    name: string
    email: string
    phone: string
  }
  service: string
  staff: string
  date: string
  time: string
  duration: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  amount: string
  region: string
  notes?: string
}

const bookings: Booking[] = [
  {
    id: 'BK-001',
    customer: {
      name: 'Sarah Johnson',
      email: 'sarah@email.com',
      phone: '+61 4XX XXX XXX'
    },
    service: 'Property Inspection',
    staff: 'John Smith',
    date: '2024-12-11',
    time: '2:00 PM',
    duration: '2 hours',
    status: 'confirmed',
    amount: '$85.00',
    region: 'Brisbane North',
    notes: 'Customer requested early arrival'
  },
  {
    id: 'BK-002',
    customer: {
      name: 'Mike Chen',
      email: 'mike@email.com', 
      phone: '+61 4XX XXX XXX'
    },
    service: 'Maintenance Check',
    staff: 'Emma Wilson',
    date: '2024-12-11',
    time: '4:30 PM',
    duration: '1.5 hours',
    status: 'pending',
    amount: '$120.00',
    region: 'Gold Coast'
  },
  {
    id: 'BK-003',
    customer: {
      name: 'Lisa Martinez',
      email: 'lisa@email.com',
      phone: '+61 4XX XXX XXX'
    },
    service: 'Repair Service',
    staff: 'David Brown',
    date: '2024-12-12',
    time: '10:00 AM', 
    duration: '3 hours',
    status: 'confirmed',
    amount: '$195.00',
    region: 'Brisbane South'
  },
  {
    id: 'BK-004',
    customer: {
      name: 'Robert Davis',
      email: 'robert@email.com',
      phone: '+61 4XX XXX XXX'
    },
    service: 'Consultation',
    staff: 'Sarah Miller',
    date: '2024-12-12',
    time: '1:00 PM',
    duration: '1 hour',
    status: 'cancelled',
    amount: '$75.00',
    region: 'Logan'
  },
  {
    id: 'BK-005',
    customer: {
      name: 'Jennifer Wilson',
      email: 'jen@email.com',
      phone: '+61 4XX XXX XXX'
    },
    service: 'Property Inspection',
    staff: 'John Smith',
    date: '2024-12-10',
    time: '9:00 AM',
    duration: '2 hours',
    status: 'completed',
    amount: '$85.00',
    region: 'Brisbane North'
  }
]

const statusConfig = {
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'bg-red-100 text-red-800',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    className: 'bg-blue-100 text-blue-800',
  }
}

export default function BookingsManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedBookings, setSelectedBookings] = useState<string[]>([])

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.staff.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const toggleBookingSelection = (bookingId: string) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    )
  }

  const toggleAllBookings = () => {
    setSelectedBookings(
      selectedBookings.length === filteredBookings.length 
        ? [] 
        : filteredBookings.map(b => b.id)
    )
  }

  return (
    <AdminLayout currentPage="Bookings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
            <p className="text-muted-foreground">
              Manage all customer bookings and appointments
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Booking
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search bookings..."
              className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
            
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{filteredBookings.length} booking(s) found</span>
          {selectedBookings.length > 0 && (
            <span>{selectedBookings.length} selected</span>
          )}
        </div>

        {/* Bookings Table */}
        <div className="rounded-lg border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedBookings.length === filteredBookings.length && filteredBookings.length > 0}
                      onChange={toggleAllBookings}
                      className="rounded border-input"
                    />
                  </th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Service</th>
                  <th className="p-4 font-medium">Staff</th>
                  <th className="p-4 font-medium">Date & Time</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => {
                  const StatusIcon = statusConfig[booking.status].icon
                  return (
                    <tr key={booking.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedBookings.includes(booking.id)}
                          onChange={() => toggleBookingSelection(booking.id)}
                          className="rounded border-input"
                        />
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="font-medium">{booking.customer.name}</p>
                          <p className="text-sm text-muted-foreground">{booking.customer.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="font-medium">{booking.service}</p>
                          <p className="text-sm text-muted-foreground">{booking.duration}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="font-medium">{booking.staff}</p>
                          <p className="text-sm text-muted-foreground">{booking.region}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <p className="font-medium">{booking.date}</p>
                          <p className="text-sm text-muted-foreground">{booking.time}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusConfig[booking.status].className}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[booking.status].label}
                        </span>
                      </td>
                      <td className="p-4 font-medium">{booking.amount}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No bookings found</p>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredBookings.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing 1 to {filteredBookings.length} of {filteredBookings.length} results
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}