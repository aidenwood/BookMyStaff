export interface AppointmentData {
  selectedDate: string | null
  selectedTime: string | null
  staffMember: StaffMember | null
  appointmentType: AppointmentType
  duration: number
  customerInfo: CustomerInfo
  notes?: string
}

export interface CustomerInfo {
  name: string
  email: string
  phone: string
  address?: string
  postcode?: string
}

export interface StaffMember {
  id: string
  name: string
  email: string
  phone: string
  businessId: string
  role: 'staff' | 'admin' | 'owner'
  regions: string[]
  avatar?: string
  bio?: string
  skills?: string[]
  rating?: number
  isActive: boolean
  createdAt: string
}

export interface AvailabilitySlot {
  id?: string
  date: string
  time: string
  staffId: string
  region: string
  isBooked: boolean
  isAvailable: boolean
  appointmentId?: string
  duration: number
}

export interface RecurringAvailability {
  id: string
  staffId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  regions: string[]
  isActive: boolean
}

export interface Booking {
  id: string
  businessId: string
  customerId: string
  staffId: string
  appointmentTypeId: string
  date: string
  time: string
  duration: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  customerInfo: CustomerInfo
  notes?: string
  region: string
  confirmationCode: string
  createdAt: string
  updatedAt: string
}

export interface AppointmentType {
  id: string
  businessId: string
  name: string
  duration: number
  price?: number
  description?: string
  color: string
  isActive: boolean
}