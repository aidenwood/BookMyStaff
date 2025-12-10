# PR V2.2: Pipedrive Integration Service

**Branch**: `feature/v2-pipedrive-service`  
**Base**: `feature/v2-core-infrastructure`  
**Estimated Time**: 4-5 days

## Summary
Create comprehensive Pipedrive API integration service for managing staff availability, bookings, and Activities synchronization.

## Changes

### 1. Environment Configuration
**File**: `.env.local` (example)
```env
PIPEDRIVE_API_TOKEN=your_pipedrive_token_here
PIPEDRIVE_COMPANY_DOMAIN=your_company_domain
```

### 2. Pipedrive API Client
**New File**: `src/lib/pipedrive/client.ts`
```typescript
class PipedriveClient {
  private baseUrl: string
  private apiToken: string

  constructor() {
    this.baseUrl = `https://${process.env.PIPEDRIVE_COMPANY_DOMAIN}.pipedrive.com/v1`
    this.apiToken = process.env.PIPEDRIVE_API_TOKEN!
  }

  async getActivities(params: GetActivitiesParams): Promise<Activity[]>
  async createActivity(activity: CreateActivityParams): Promise<Activity>
  async updateActivity(id: string, updates: UpdateActivityParams): Promise<Activity>
  async deleteActivity(id: string): Promise<boolean>
}
```

### 3. Activities Service
**New File**: `src/lib/pipedrive/activities.ts`
```typescript
export class ActivitiesService {
  private client: PipedriveClient

  // Staff availability methods
  async getStaffAvailability(staffEmail: string, startDate: string, endDate: string): Promise<AvailabilitySlot[]>
  async setStaffAvailability(staffEmail: string, slots: AvailabilitySlot[]): Promise<void>
  async getStaffByRegion(region: string): Promise<StaffMember[]>

  // Customer booking methods
  async getAvailableSlots(region: string, date: string): Promise<AvailabilitySlot[]>
  async bookAppointment(appointment: AppointmentBooking): Promise<string>
  async getBookingsForDate(staffEmail: string, date: string): Promise<BookingDetails[]>

  // Utility methods
  private mapActivityToSlot(activity: Activity): AvailabilitySlot
  private createAvailabilityActivity(slot: AvailabilitySlot): CreateActivityParams
  private createBookingActivity(booking: AppointmentBooking): CreateActivityParams
}
```

### 4. Data Transformation Layer
**New File**: `src/lib/pipedrive/transformers.ts`
```typescript
export const transformPipedriveActivity = (activity: any): AvailabilitySlot => {
  return {
    date: activity.due_date,
    time: activity.due_time,
    staffId: activity.user_id,
    region: activity.custom_fields?.region || '',
    isBooked: activity.type === 'booking'
  }
}

export const transformBookingToActivity = (booking: AppointmentBooking): any => {
  return {
    subject: `Appointment - ${booking.customerName}`,
    type: 'booking',
    due_date: booking.date,
    due_time: booking.time,
    duration: booking.duration,
    note: `Address: ${booking.address}\nPhone: ${booking.phone}\nType: ${booking.type}`,
    user_id: booking.staffId,
    custom_fields: {
      region: booking.region,
      customer_email: booking.customerEmail
    }
  }
}
```

### 5. Availability Logic Engine
**New File**: `src/lib/availability/engine.ts`
```typescript
export class AvailabilityEngine {
  private activitiesService: ActivitiesService

  async calculateAvailability(region: string, date: string): Promise<AvailabilitySlot[]> {
    // 1. Get all staff working in the region
    // 2. Get their availability for the date
    // 3. Get existing bookings
    // 4. Calculate free slots
    // 5. Return available time slots
  }

  async findNextAvailableSlot(region: string): Promise<AvailabilitySlot | null> {
    // Find the earliest available appointment slot
  }

  async validateBookingSlot(slot: AvailabilitySlot): Promise<boolean> {
    // Double-check slot is still available before booking
  }

  private generateWorkingHourSlots(date: string): string[] {
    // Generate 1-hour slots between working hours
  }

  private filterBookedSlots(availableSlots: AvailabilitySlot[], bookedSlots: AvailabilitySlot[]): AvailabilitySlot[] {
    // Remove already booked time slots
  }
}
```

### 6. API Routes (Astro)
**New File**: `src/pages/api/availability/[region].ts`
```typescript
export async function GET({ params, url }: APIContext) {
  const { region } = params
  const date = url.searchParams.get('date')
  
  const engine = new AvailabilityEngine()
  const slots = await engine.calculateAvailability(region, date)
  
  return new Response(JSON.stringify(slots))
}
```

**New File**: `src/pages/api/booking/create.ts`
```typescript
export async function POST({ request }: APIContext) {
  const booking = await request.json()
  
  const service = new ActivitiesService()
  const confirmationId = await service.bookAppointment(booking)
  
  return new Response(JSON.stringify({ success: true, confirmationId }))
}
```

### 7. Error Handling & Logging
**New File**: `src/lib/pipedrive/errors.ts`
```typescript
export class PipedriveError extends Error {
  constructor(message: string, public statusCode: number, public response?: any) {
    super(message)
  }
}

export class AvailabilityError extends Error {
  constructor(message: string, public slot?: AvailabilitySlot) {
    super(message)
  }
}

export const logPipedriveOperation = (operation: string, data: any, result: any) => {
  console.log(`[Pipedrive] ${operation}:`, { data, result, timestamp: new Date().toISOString() })
}
```

## Testing
- [ ] Pipedrive API connection successful
- [ ] Activities CRUD operations work
- [ ] Availability calculation logic correct
- [ ] Data transformation functions accurate
- [ ] Error handling covers edge cases
- [ ] API routes respond correctly

## Configuration
- [ ] Environment variables set
- [ ] Pipedrive custom fields configured for regions
- [ ] Activity types set up for 'availability' and 'booking'

## Next Steps
- Move to PR V2.3: Customer Booking Flow (Steps 7-8)
- Begin implementing calendar UI components