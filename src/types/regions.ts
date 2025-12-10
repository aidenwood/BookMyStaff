export interface RegionConfig {
  id: string
  businessId: string
  name: string
  color: string
  postcodes: string[]
  isActive: boolean
  description?: string
  travelTime?: number
}

export interface PostcodeData {
  postcode: string
  suburb: string
  state: string
  latitude: number
  longitude: number
}

export interface RegionAvailability {
  regionId: string
  staffIds: string[]
  totalSlots: number
  availableSlots: number
  nextAvailable?: {
    date: string
    time: string
    staffId: string
  }
}

export const DEFAULT_REGIONS: Omit<RegionConfig, 'id' | 'businessId'>[] = [
  {
    name: 'Brisbane North',
    color: '#FF6B6B',
    postcodes: ['4000', '4006', '4010', '4011', '4012', '4013', '4014'],
    isActive: true,
    description: 'Brisbane North including CBD and northern suburbs'
  },
  {
    name: 'Brisbane South',
    color: '#4ECDC4',
    postcodes: ['4101', '4102', '4103', '4104', '4105', '4106', '4107'],
    isActive: true,
    description: 'Brisbane South including southern suburbs'
  },
  {
    name: 'Gold Coast',
    color: '#45B7D1',
    postcodes: ['4215', '4217', '4220', '4223', '4225', '4227', '4230'],
    isActive: true,
    description: 'Gold Coast region'
  },
  {
    name: 'Logan',
    color: '#96CEB4',
    postcodes: ['4114', '4116', '4118', '4119', '4120', '4121', '4123'],
    isActive: true,
    description: 'Logan area'
  },
  {
    name: 'Ipswich',
    color: '#FECA57',
    postcodes: ['4300', '4301', '4302', '4303', '4304', '4305', '4306'],
    isActive: true,
    description: 'Ipswich and surrounding areas'
  }
]