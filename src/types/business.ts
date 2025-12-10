export interface Business {
  id: string
  name: string
  email: string
  phone: string
  address: string
  website?: string
  description?: string
  logo?: string
  ownerId: string
  industry: BusinessIndustry
  createdAt: string
  updatedAt: string
  settings: BusinessSettings
  integrations: BusinessIntegrations
}

export interface BusinessSettings {
  workingHours: {
    monday: DayHours
    tuesday: DayHours
    wednesday: DayHours
    thursday: DayHours
    friday: DayHours
    saturday: DayHours
    sunday: DayHours
  }
  appointmentTypes: AppointmentType[]
  defaultDuration: number
  timeZone: string
  currency: string
  bookingPolicy: {
    advanceBookingDays: number
    cancellationHours: number
    confirmationRequired: boolean
  }
}

export interface DayHours {
  isOpen: boolean
  start: string
  end: string
  breaks?: { start: string; end: string }[]
}

export interface AppointmentType {
  id: string
  name: string
  duration: number
  price?: number
  description?: string
  color: string
}

export interface BusinessInvite {
  id: string
  businessId: string
  email: string
  role: 'staff' | 'admin'
  status: 'pending' | 'accepted' | 'expired'
  invitedBy: string
  createdAt: string
  expiresAt: string
}

export interface BusinessIndustry {
  id: string
  name: string
  category: 'home_services' | 'healthcare' | 'beauty_wellness' | 'professional_services' | 'automotive' | 'education' | 'fitness' | 'other'
  defaultServices: string[]
  fieldMapping: Record<string, string>
}

export interface BusinessIntegrations {
  crm: {
    type: 'pipedrive' | 'hubspot' | 'salesforce' | 'none'
    apiKey?: string
    domain?: string
    isActive: boolean
  }
  zapier: {
    webhookUrl?: string
    isActive: boolean
    events: string[]
  }
  email: {
    provider: 'smtp' | 'sendgrid' | 'mailgun' | 'none'
    settings: Record<string, any>
    isActive: boolean
  }
  calendar: {
    provider: 'google' | 'outlook' | 'none'
    isActive: boolean
  }
}

export interface BusinessSetupData {
  currentStep: number
  businessInfo: Partial<Business>
  staffInvites: BusinessInvite[]
  regions: RegionConfig[]
  services: AppointmentType[]
  selectedIndustry: BusinessIndustry | null
  integrations: Partial<BusinessIntegrations>
}

export const BUSINESS_INDUSTRIES: BusinessIndustry[] = [
  {
    id: 'home_services',
    name: 'Home Services',
    category: 'home_services',
    defaultServices: ['Property Inspection', 'Maintenance', 'Repair', 'Installation'],
    fieldMapping: { customer: 'Property Owner', location: 'Property Address' }
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    category: 'healthcare',
    defaultServices: ['Consultation', 'Home Visit', 'Treatment', 'Follow-up'],
    fieldMapping: { customer: 'Patient', location: 'Visit Address' }
  },
  {
    id: 'beauty_wellness',
    name: 'Beauty & Wellness',
    category: 'beauty_wellness',
    defaultServices: ['Hair Service', 'Beauty Treatment', 'Massage', 'Wellness Session'],
    fieldMapping: { customer: 'Client', location: 'Service Location' }
  },
  {
    id: 'professional_services',
    name: 'Professional Services',
    category: 'professional_services',
    defaultServices: ['Consultation', 'Assessment', 'Training', 'Support'],
    fieldMapping: { customer: 'Client', location: 'Meeting Location' }
  },
  {
    id: 'automotive',
    name: 'Automotive Services',
    category: 'automotive',
    defaultServices: ['Mobile Mechanic', 'Car Wash', 'Inspection', 'Repair'],
    fieldMapping: { customer: 'Vehicle Owner', location: 'Service Address' }
  },
  {
    id: 'education',
    name: 'Education & Training',
    category: 'education',
    defaultServices: ['Tutoring', 'Training Session', 'Workshop', 'Coaching'],
    fieldMapping: { customer: 'Student/Trainee', location: 'Session Location' }
  },
  {
    id: 'fitness',
    name: 'Fitness & Personal Training',
    category: 'fitness',
    defaultServices: ['Personal Training', 'Group Session', 'Assessment', 'Coaching'],
    fieldMapping: { customer: 'Client', location: 'Training Location' }
  }
]