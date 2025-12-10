"use client"

import { Button } from "./button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"
import { cn } from "../../lib/utils"
import { Calendar } from "./calendar"
import { addDays, format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import * as React from "react"
import { type DateRange } from "react-day-picker"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: DateRange
  onValueChange?: (range: DateRange | undefined) => void
  placeholder?: string
  disabled?: boolean
}

export default function DateRangePicker({
  className,
  value,
  onValueChange,
  placeholder = "Pick a date range",
  disabled = false,
  ...props
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(
    value || {
      from: addDays(new Date(), -20),
      to: new Date(),
    }
  )

  React.useEffect(() => {
    if (value !== date) {
      setDate(value)
    }
  }, [value])

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate)
    onValueChange?.(newDate)
  }

  return (
    <div className={cn("grid gap-2", className)} {...props}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            autoFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
            doubleMonth={true}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { DateRangePicker }