import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BusinessSetupData, Business } from '../types/business'
import type { AppointmentData, StaffMember, Booking } from '../types/appointment'
import type { RegionConfig } from '../types/regions'

interface AppState {
  // Business Setup State
  businessSetup: BusinessSetupData
  updateBusinessSetup: (updates: Partial<BusinessSetupData>) => void
  setBusinessSetupStep: (step: number) => void
  resetBusinessSetup: () => void

  // Current Business Context
  currentBusiness: Business | null
  setCurrentBusiness: (business: Business | null) => void

  // Staff Management
  staff: StaffMember[]
  setStaff: (staff: StaffMember[]) => void
  addStaffMember: (staff: StaffMember) => void
  updateStaffMember: (id: string, updates: Partial<StaffMember>) => void
  removeStaffMember: (id: string) => void

  // Regions
  regions: RegionConfig[]
  setRegions: (regions: RegionConfig[]) => void
  addRegion: (region: RegionConfig) => void
  updateRegion: (id: string, updates: Partial<RegionConfig>) => void

  // Customer Booking Flow
  customerBooking: AppointmentData
  updateCustomerBooking: (updates: Partial<AppointmentData>) => void
  resetCustomerBooking: () => void

  // Bookings
  bookings: Booking[]
  setBookings: (bookings: Booking[]) => void
  addBooking: (booking: Booking) => void
  updateBooking: (id: string, updates: Partial<Booking>) => void

  // UI State
  isLoading: boolean
  setLoading: (loading: boolean) => void
  selectedRegion: string | null
  setSelectedRegion: (region: string | null) => void
}

const initialBusinessSetup: BusinessSetupData = {
  currentStep: 1,
  businessInfo: {},
  staffInvites: [],
  regions: [],
  services: []
}

const initialAppointmentData: AppointmentData = {
  selectedDate: null,
  selectedTime: null,
  staffMember: null,
  appointmentType: {
    id: '',
    businessId: '',
    name: 'Consultation',
    duration: 60,
    color: '#4ECDC4',
    isActive: true
  },
  duration: 60,
  customerInfo: {
    name: '',
    email: '',
    phone: ''
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Business Setup
      businessSetup: initialBusinessSetup,
      updateBusinessSetup: (updates) =>
        set((state) => ({
          businessSetup: { ...state.businessSetup, ...updates }
        })),
      setBusinessSetupStep: (step) =>
        set((state) => ({
          businessSetup: { ...state.businessSetup, currentStep: step }
        })),
      resetBusinessSetup: () =>
        set({ businessSetup: initialBusinessSetup }),

      // Current Business
      currentBusiness: null,
      setCurrentBusiness: (business) => set({ currentBusiness: business }),

      // Staff Management
      staff: [],
      setStaff: (staff) => set({ staff }),
      addStaffMember: (staff) =>
        set((state) => ({ staff: [...state.staff, staff] })),
      updateStaffMember: (id, updates) =>
        set((state) => ({
          staff: state.staff.map((s) => (s.id === id ? { ...s, ...updates } : s))
        })),
      removeStaffMember: (id) =>
        set((state) => ({ staff: state.staff.filter((s) => s.id !== id) })),

      // Regions
      regions: [],
      setRegions: (regions) => set({ regions }),
      addRegion: (region) =>
        set((state) => ({ regions: [...state.regions, region] })),
      updateRegion: (id, updates) =>
        set((state) => ({
          regions: state.regions.map((r) => (r.id === id ? { ...r, ...updates } : r))
        })),

      // Customer Booking
      customerBooking: initialAppointmentData,
      updateCustomerBooking: (updates) =>
        set((state) => ({
          customerBooking: { ...state.customerBooking, ...updates }
        })),
      resetCustomerBooking: () => set({ customerBooking: initialAppointmentData }),

      // Bookings
      bookings: [],
      setBookings: (bookings) => set({ bookings }),
      addBooking: (booking) =>
        set((state) => ({ bookings: [...state.bookings, booking] })),
      updateBooking: (id, updates) =>
        set((state) => ({
          bookings: state.bookings.map((b) => (b.id === id ? { ...b, ...updates } : b))
        })),

      // UI State
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),
      selectedRegion: null,
      setSelectedRegion: (region) => set({ selectedRegion: region })
    }),
    {
      name: 'bookmystaff-storage',
      partialize: (state) => ({
        businessSetup: state.businessSetup,
        currentBusiness: state.currentBusiness,
        selectedRegion: state.selectedRegion
      })
    }
  )
)