import { RegionConfig, DEFAULT_REGIONS } from '../types/regions'

export const REGIONS: RegionConfig[] = DEFAULT_REGIONS.map((region, index) => ({
  ...region,
  id: `region_${index + 1}`,
  businessId: 'default'
}))

export const WORKING_HOURS = {
  start: '09:00',
  end: '17:00',
  slotDuration: 60, // minutes
  breakDuration: 30, // minutes
  lunchBreak: {
    start: '12:00',
    end: '13:00'
  }
}

export const APPOINTMENT_SETTINGS = {
  maxAdvanceBookingDays: 90,
  minAdvanceBookingHours: 2,
  maxCancellationHours: 24,
  defaultDuration: 60,
  bufferBetweenAppointments: 15, // minutes
}

export const findRegionByPostcode = (postcode: string): RegionConfig | null => {
  return REGIONS.find(region => 
    region.postcodes.includes(postcode) && region.isActive
  ) || null
}

export const getRegionColor = (regionId: string): string => {
  const region = REGIONS.find(r => r.id === regionId)
  return region?.color || '#6B7280'
}

export const getAvailableRegions = (): RegionConfig[] => {
  return REGIONS.filter(region => region.isActive)
}