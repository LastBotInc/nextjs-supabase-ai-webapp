'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, getDay, subMonths, addMonths } from 'date-fns'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

interface CalendarGridProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  disabledDates?: string[]
  availableDates?: string[]
}

export default function CalendarGrid({
  selectedDate,
  onDateSelect,
  disabledDates = [],
  availableDates = []
}: CalendarGridProps) {
  // Ensure selectedDate is a proper Date object
  const parsedSelectedDate = selectedDate instanceof Date ? selectedDate : new Date(selectedDate)
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(parsedSelectedDate))

  // Update current month when selected date changes
  useEffect(() => {
    if (!isSameMonth(parsedSelectedDate, currentMonth)) {
      setCurrentMonth(startOfMonth(parsedSelectedDate))
    }
  }, [parsedSelectedDate])

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  })

  // Convert Sunday-based day number (0-6) to Monday-based (1-7)
  const getMondayBasedDay = (date: Date) => {
    const day = getDay(date)
    return day === 0 ? 6 : day - 1
  }

  const handleDateSelect = (date: Date) => {
    onDateSelect(date)
  }

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const isDateDisabled = (date: Date) => {
    return disabledDates.includes(format(date, 'yyyy-MM-dd'))
  }

  const isDateAvailable = (date: Date) => {
    return availableDates.includes(format(date, 'yyyy-MM-dd'))
  }

  // Helper function to check if a date is selected
  const isDateSelected = (date: Date) => {
    return isSameDay(date, parsedSelectedDate)
  }

  return (
    <div className="w-full">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={previousMonth}
          className="p-2 text-gray-400 hover:text-gray-500"
        >
          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
        </button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          type="button"
          onClick={nextMonth}
          className="p-2 text-gray-400 hover:text-gray-500"
        >
          <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Week days header - Starting from Monday */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isDisabled = !isSameMonth(day, currentMonth) || isDateDisabled(day)
          const isAvailable = isDateAvailable(day)
          const isSelected = isDateSelected(day)
          const dayOfWeek = getMondayBasedDay(day)
          const gridColumn = index === 0 ? dayOfWeek + 1 : undefined
          const isCurrentDay = isToday(day)

          return (
            <button
              key={day.toISOString()}
              onClick={() => !isDisabled && handleDateSelect(day)}
              disabled={isDisabled}
              style={{ gridColumn }}
              className={clsx(
                'aspect-square p-2 flex items-center justify-center rounded-lg text-sm relative transition-colors',
                {
                  'cursor-not-allowed opacity-50': isDisabled,
                  'hover:bg-gray-100 dark:hover:bg-gray-700': !isDisabled && !isSelected,
                  'bg-primary-800 text-white ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900': isSelected && !isDisabled,
                  'bg-white dark:bg-gray-800': !isDisabled && !isSelected,
                  'ring-1 ring-primary-500': isCurrentDay && !isSelected
                }
              )}
            >
              <time dateTime={format(day, 'yyyy-MM-dd')}>
                {format(day, 'd')}
              </time>
              {/* Always show green dot for available dates, regardless of selection */}
              {isAvailable && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-green-500 rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
} 