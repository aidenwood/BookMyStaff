import { format, addMinutes, isSameDay, parseISO, addDays, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns'
import { WORKING_HOURS } from '../config/regions'

export const generateTimeSlots = (
  date: string, 
  startTime: string = WORKING_HOURS.start, 
  endTime: string = WORKING_HOURS.end,
  slotDuration: number = WORKING_HOURS.slotDuration
): string[] => {
  const slots: string[] = []
  const baseDate = new Date(date)
  
  let currentTime = new Date(`${date}T${startTime}:00`)
  const endDateTime = new Date(`${date}T${endTime}:00`)

  while (currentTime < endDateTime) {
    slots.push(format(currentTime, 'HH:mm'))
    currentTime = addMinutes(currentTime, slotDuration)
  }

  return slots
}

export const formatAppointmentTime = (date: string, time: string): string => {
  const datetime = new Date(`${date}T${time}:00`)
  return format(datetime, 'EEEE, MMMM do, yyyy \'at\' h:mm a')
}

export const formatDisplayDate = (date: string): string => {
  return format(new Date(date), 'EEEE, MMMM do')
}

export const formatDisplayTime = (time: string): string => {
  const [hours, minutes] = time.split(':')
  const datetime = new Date()
  datetime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
  return format(datetime, 'h:mm a')
}

export const isSlotInPast = (date: string, time: string): boolean => {
  const slotDateTime = new Date(`${date}T${time}:00`)
  return isBefore(slotDateTime, new Date())
}

export const isSlotAvailable = (
  slot: { date: string; time: string },
  bookedSlots: { date: string; time: string; duration: number }[]
): boolean => {
  const slotStart = new Date(`${slot.date}T${slot.time}:00`)
  
  return !bookedSlots.some(booked => {
    const bookedStart = new Date(`${booked.date}T${booked.time}:00`)
    const bookedEnd = addMinutes(bookedStart, booked.duration)
    
    return (
      (slotStart >= bookedStart && slotStart < bookedEnd) ||
      (addMinutes(slotStart, 60) > bookedStart && slotStart < bookedStart)
    )
  })
}

export const getNextAvailableDates = (
  excludeDates: string[] = [], 
  daysAhead: number = 30
): string[] => {
  const dates: string[] = []
  let currentDate = startOfDay(new Date())
  
  for (let i = 0; i < daysAhead; i++) {
    const dateStr = format(currentDate, 'yyyy-MM-dd')
    
    // Skip weekends and excluded dates
    const dayOfWeek = currentDate.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !excludeDates.includes(dateStr)) {
      dates.push(dateStr)
    }
    
    currentDate = addDays(currentDate, 1)
  }
  
  return dates
}

export const generateDateRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = []
  let currentDate = new Date(startDate)
  const end = new Date(endDate)
  
  while (currentDate <= end) {
    dates.push(format(currentDate, 'yyyy-MM-dd'))
    currentDate = addDays(currentDate, 1)
  }
  
  return dates
}

export const isWorkingDay = (date: string): boolean => {
  const dayOfWeek = new Date(date).getDay()
  return dayOfWeek >= 1 && dayOfWeek <= 5 // Monday to Friday
}

export const calculateDuration = (startTime: string, endTime: string): number => {
  const start = new Date(`2000-01-01T${startTime}:00`)
  const end = new Date(`2000-01-01T${endTime}:00`)
  return (end.getTime() - start.getTime()) / (1000 * 60) // minutes
}

export const addBusinessDays = (date: Date, days: number): Date => {
  let result = new Date(date)
  let addedDays = 0
  
  while (addedDays < days) {
    result = addDays(result, 1)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays++
    }
  }
  
  return result
}