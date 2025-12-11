"use client"

import { Button } from "./button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"
import { cn } from "../../lib/utils"
import { Calendar } from "./calendar"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import * as React from "react"

interface DatePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: Date
  onValueChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  disablePast?: boolean
  disableFuture?: boolean
  availableDates?: Date[]
  unavailableDates?: Date[]
}

export default function DatePicker({
  className,
  value,
  onValueChange,
  placeholder = "Pick a date",
  disabled = false,
  disablePast = false,
  disableFuture = false,
  availableDates = [],
  unavailableDates = [],
  ...props
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (value !== date) {
      setDate(value)
    }
  }, [value])

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate)
    onValueChange?.(newDate)
    setOpen(false)
  }

  // Create disabled function for past/future dates
  const isDateDisabled = React.useCallback((date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (disablePast && date < today) {
      return true
    }
    
    if (disableFuture && date > today) {
      return true
    }
    
    // Check if date is in unavailable dates
    if (unavailableDates.length > 0) {
      return unavailableDates.some(unavailableDate => 
        unavailableDate.toDateString() === date.toDateString()
      )
    }
    
    // If available dates are specified, only allow those
    if (availableDates.length > 0) {
      return !availableDates.some(availableDate => 
        availableDate.toDateString() === date.toDateString()
      )
    }
    
    return false
  }, [disablePast, disableFuture, availableDates, unavailableDates])

  return (
    <div className={cn("grid gap-2", className)} {...props}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            autoFocus
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            disabled={isDateDisabled}
            availableDates={availableDates}
            unavailableDates={unavailableDates}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { DatePicker }