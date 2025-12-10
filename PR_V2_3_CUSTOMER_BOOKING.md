# PR V2.3: Customer Booking Flow (Steps 7-8)

**Branch**: `feature/v2-customer-booking`  
**Base**: `feature/v2-pipedrive-service`  
**Estimated Time**: 5-6 days

## Summary
Implement customer-facing appointment booking interface with double-month calendar and time slot selection, extending the existing multistep form.

## Changes

### 1. Calendar Configuration
**New File**: `src/components/Calendar/CalendarConfig.ts`
```typescript
export const calendarConfig = {
  theme: 'ios',
  display: 'inline',
  controls: ['calendar'],
  pages: 2, // Double month view
  calendarType: 'month',
  selectMultiple: false,
  showOuterDays: true,
  firstDay: 1, // Monday
  responsive: {
    medium: {
      display: 'center'
    }
  }
}
```

### 2. FormStep7: Date Selection
**New File**: `src/components/FormStep7.tsx`
```typescript
import { Datepicker } from '@mobiscroll/react'
import { useFormStore } from '../lib/store'
import { AvailabilityEngine } from '../lib/availability/engine'

export default function FormStep7() {
  const { formData, updateAppointment, nextStep } = useFormStore()
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Load available dates based on customer region
  useEffect(() => {
    loadAvailableDates(formData.autoSuburb)
  }, [formData.autoSuburb])

  const handleDateSelect = (date: string) => {
    updateAppointment('selectedDate', date)
  }

  const handleNextAvailable = async () => {
    // Book next available appointment logic
  }

  return (
    <div className="form-step">
      <div className="step-header">
        <h2>Select Appointment Date</h2>
        <p>Choose a date for your property inspection</p>
      </div>

      <div className="calendar-container">
        <Datepicker
          {...calendarConfig}
          value={formData.appointmentData.selectedDate}
          onSelectionChange={handleDateSelect}
          invalid={unavailableDates}
          marked={availableDates.map(date => ({
            date,
            color: '#4ECDC4'
          }))}
        />
      </div>

      <div className="quick-actions">
        <button 
          className="btn-secondary btn-next-available"
          onClick={handleNextAvailable}
          disabled={loading}
        >
          📅 Book Next Available Appointment
        </button>
      </div>

      <div className="step-navigation">
        <button 
          className="btn-primary"
          onClick={nextStep}
          disabled={!formData.appointmentData.selectedDate}
        >
          Continue to Time Selection →
        </button>
      </div>
    </div>
  )
}
```

### 3. FormStep8: Time & Staff Selection
**New File**: `src/components/FormStep8.tsx`
```typescript
export default function FormStep8() {
  const { formData, updateAppointment, nextStep } = useFormStore()
  const [availableStaff, setAvailableStaff] = useState<StaffMember[]>([])
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null)

  useEffect(() => {
    if (formData.appointmentData.selectedDate) {
      loadAvailableStaff()
    }
  }, [formData.appointmentData.selectedDate])

  const loadAvailableStaff = async () => {
    // Load staff available for selected date in customer's region
  }

  const handleStaffSelect = (staffId: string) => {
    setSelectedStaff(staffId)
    loadTimeSlots(staffId)
  }

  const handleTimeSelect = (time: string) => {
    updateAppointment('selectedTime', time)
    const staff = availableStaff.find(s => s.id === selectedStaff)
    updateAppointment('staffMember', staff)
  }

  return (
    <div className="form-step">
      <div className="step-header">
        <h2>Select Time & Inspector</h2>
        <p>Choose your preferred time and inspector for {formatDate(formData.appointmentData.selectedDate)}</p>
      </div>

      <div className="staff-selection">
        <h3>Available Inspectors in {formData.autoSuburb}</h3>
        <div className="staff-grid">
          {availableStaff.map(staff => (
            <StaffCard
              key={staff.id}
              staff={staff}
              isSelected={selectedStaff === staff.id}
              onClick={() => handleStaffSelect(staff.id)}
            />
          ))}
        </div>
      </div>

      {selectedStaff && (
        <div className="time-selection">
          <h3>Available Times</h3>
          <div className="time-slots-grid">
            {timeSlots.map(time => (
              <TimeSlot
                key={time}
                time={time}
                isSelected={formData.appointmentData.selectedTime === time}
                onClick={() => handleTimeSelect(time)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="step-navigation">
        <button 
          className="btn-secondary"
          onClick={() => window.history.back()}
        >
          ← Back to Date Selection
        </button>
        <button 
          className="btn-primary"
          onClick={nextStep}
          disabled={!formData.appointmentData.selectedTime}
        >
          Continue to Confirmation →
        </button>
      </div>
    </div>
  )
}
```

### 4. Staff Card Component
**New File**: `src/components/Calendar/StaffCard.tsx`
```typescript
interface StaffCardProps {
  staff: StaffMember
  isSelected: boolean
  onClick: () => void
}

export default function StaffCard({ staff, isSelected, onClick }: StaffCardProps) {
  return (
    <div 
      className={`staff-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="staff-avatar">
        {staff.avatar ? (
          <img src={staff.avatar} alt={staff.name} />
        ) : (
          <div className="avatar-placeholder">
            {staff.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="staff-info">
        <h4>{staff.name}</h4>
        <p className="staff-regions">
          {staff.regions.join(', ')}
        </p>
        <div className="staff-rating">
          ⭐⭐⭐⭐⭐ 4.9
        </div>
      </div>
    </div>
  )
}
```

### 5. Time Slot Component
**New File**: `src/components/Calendar/TimeSlot.tsx`
```typescript
interface TimeSlotProps {
  time: string
  isSelected: boolean
  onClick: () => void
  isDisabled?: boolean
}

export default function TimeSlot({ time, isSelected, onClick, isDisabled = false }: TimeSlotProps) {
  return (
    <button
      className={`time-slot ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={isDisabled}
    >
      {time}
    </button>
  )
}
```

### 6. Update MultiStepForm
**File**: `src/components/MultiStepForm.tsx`
```typescript
// Add imports
import FormStep7 from './FormStep7'
import FormStep8 from './FormStep8'

// Update renderStep function
const renderStep = () => {
  switch (currentStep) {
    case 1: return <FormStep1 />
    case 2: return <FormStep2 />
    case 3: return <FormStep3 />
    case 4: return <FormStep4 />
    case 5: return <FormStep5 />
    case 6: return <FormStep6 />
    case 7: return <FormStep7 />
    case 8: return <FormStep8 />
    default: return <FormStep1 />
  }
}
```

### 7. Enhanced API Integration
**File**: `src/lib/api.ts`
```typescript
// Add appointment booking to submission
export async function submitToZapier(formData: any) {
  const submissionData = {
    ...formData,
    appointment: {
      date: formData.appointmentData.selectedDate,
      time: formData.appointmentData.selectedTime,
      staff: formData.appointmentData.staffMember,
      confirmationId: generateConfirmationId()
    }
  }

  // Create Pipedrive Activity for the booking
  const activitiesService = new ActivitiesService()
  await activitiesService.bookAppointment(submissionData.appointment)

  // Continue with existing Zapier submission...
}
```

### 8. Styling
**New File**: `src/styles/calendar.css`
```css
.calendar-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.staff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.staff-card {
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.staff-card.selected {
  border-color: #4ECDC4;
  background-color: #f8fffe;
}

.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin: 20px 0;
}

.time-slot {
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.time-slot.selected {
  border-color: #4ECDC4;
  background-color: #4ECDC4;
  color: white;
}

.btn-next-available {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 25px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.btn-next-available:hover {
  transform: translateY(-2px);
}
```

## Testing
- [ ] Calendar displays correctly with double-month view
- [ ] Available dates load based on staff availability
- [ ] Staff filtering works by region
- [ ] Time slot selection functions properly
- [ ] "Next Available" booking works
- [ ] Form navigation between steps 6-7-8
- [ ] Mobile responsiveness verified

## Integration Points
- [ ] Connects to Pipedrive service from PR V2.2
- [ ] Uses types from PR V2.1
- [ ] Integrates with existing form store
- [ ] Updates Zapier submission with appointment data

## Next Steps
- Move to PR V2.4: Staff Authentication & Portal Base
- Begin implementing staff-side functionality