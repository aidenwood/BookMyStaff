# PR V2.1: Core Infrastructure & Dependencies

**Branch**: `feature/v2-core-infrastructure`  
**Base**: `main`  
**Estimated Time**: 3-4 days

## Summary
Set up foundational infrastructure for the V2 appointment booking system including dependencies, type definitions, and store extensions.

## Changes

### 1. Package Dependencies
**File**: `package.json`
```json
{
  "dependencies": {
    "@mobiscroll/react": "^5.24.0",
    "date-fns": "^3.6.0",
    "@types/node": "^20.0.0"
  }
}
```

### 2. Type Definitions
**New File**: `src/types/appointment.ts`
```typescript
export interface AppointmentData {
  selectedDate: string | null
  selectedTime: string | null
  staffMember: StaffMember | null
  appointmentType: 'inspection' | 'consultation'
  duration: number // in minutes, default 60
}

export interface StaffMember {
  id: string
  name: string
  email: string
  phone: string
  regions: string[]
  avatar?: string
}

export interface AvailabilitySlot {
  date: string
  time: string
  staffId: string
  region: string
  isBooked: boolean
}

export interface RegionConfig {
  name: string
  color: string
  postcodes: string[]
}
```

### 3. Extended Form Store
**File**: `src/lib/store.ts`
```typescript
// Add to FormData interface
appointmentData: AppointmentData
selectedRegion: string
bookingConfirmation: string

// Add to FormStore interface
updateAppointment: (field: keyof AppointmentData, value: any) => void
resetAppointment: () => void

// Update currentStep max from 6 to 8
nextStep: () => set((state) => ({
  currentStep: Math.min(state.currentStep + 1, 8),
}))
```

### 4. Configuration Files
**New File**: `src/config/regions.ts`
```typescript
export const REGIONS: RegionConfig[] = [
  { name: 'Brisbane North', color: '#FF6B6B', postcodes: ['4000', '4006', '4010'] },
  { name: 'Brisbane South', color: '#4ECDC4', postcodes: ['4101', '4102', '4103'] },
  { name: 'Gold Coast', color: '#45B7D1', postcodes: ['4215', '4217', '4220'] },
  // Add more regions as needed
]

export const WORKING_HOURS = {
  start: '09:00',
  end: '17:00',
  slotDuration: 60 // minutes
}
```

### 5. Utility Functions
**New File**: `src/utils/dateHelpers.ts`
```typescript
import { format, addMinutes, isSameDay, parseISO } from 'date-fns'

export const generateTimeSlots = (date: string, startTime: string, endTime: string): string[] => {
  // Generate hourly time slots for a given date
}

export const formatAppointmentTime = (date: string, time: string): string => {
  // Format appointment date/time for display
}

export const isSlotAvailable = (slot: AvailabilitySlot, bookedSlots: AvailabilitySlot[]): boolean => {
  // Check if a time slot is available
}
```

## Testing
- [ ] Package installation successful
- [ ] Type definitions compile without errors
- [ ] Store updates work correctly
- [ ] Configuration files are properly structured
- [ ] Utility functions pass unit tests

## Migration Notes
- No database migrations required
- Existing form data structure preserved
- New fields added with sensible defaults

## Next Steps
- Move to PR V2.2: Pipedrive Integration Service
- Begin work on API service layer