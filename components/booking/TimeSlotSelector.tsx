'use client'

import { format, parseISO, addMinutes } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { BookingSlot, AvailableSlot } from '@/lib/types/booking'
import clsx from 'clsx'

interface TimeSlotSelectorProps {
  slots: (BookingSlot | AvailableSlot)[]
  selectedSlot: BookingSlot | AvailableSlot | null
  onSlotSelect: (slot: BookingSlot | AvailableSlot) => void
  timezone: string
  appointmentDuration?: number
}

export default function TimeSlotSelector({
  slots,
  selectedSlot,
  onSlotSelect,
  timezone,
  appointmentDuration = 30 // Default to 30 minutes if not specified
}: TimeSlotSelectorProps) {
  const formatTimeInTimezone = (isoString: string) => {
    const utcDate = parseISO(isoString)
    const zonedDate = toZonedTime(utcDate, timezone)
    return format(zonedDate, 'h:mm a')
  }

  // Sort slots by start time
  const sortedSlots = [...slots].sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  )

  // Combine consecutive slots to match appointment duration
  const combinedSlots: AvailableSlot[] = []
  const requiredSlots = appointmentDuration / 15 // Calculate how many 15-min slots we need

  for (let i = 0; i <= sortedSlots.length - requiredSlots; i++) {
    const currentSlot = sortedSlots[i]
    const slotsNeeded = []
    let isValidCombination = true

    // Check if we can combine enough consecutive slots
    for (let j = 0; j < requiredSlots; j++) {
      const slot = sortedSlots[i + j]
      if (!slot || slot.status !== 'available' || 
          (j > 0 && new Date(slot.start_time).getTime() !== 
                    new Date(slotsNeeded[j-1].end_time).getTime())) {
        isValidCombination = false
        break
      }
      slotsNeeded.push(slot)
    }

    if (isValidCombination) {
      // Create a combined slot
      const lastSlot = slotsNeeded[slotsNeeded.length - 1]
      const slotId = 'id' in currentSlot ? currentSlot.id : currentSlot.slot_id
      combinedSlots.push({
        slot_id: slotId,
        start_time: currentSlot.start_time,
        end_time: lastSlot.end_time,
        duration: appointmentDuration,
        status: 'available',
        user_id: currentSlot.user_id,
        original_slots: slotsNeeded.map(s => 'id' in s ? s.id : s.slot_id)
      })
      // Skip the slots we just combined
      i += requiredSlots - 1
    }
  }

  if (combinedSlots.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No available time slots for this date.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
      {combinedSlots.map((slot) => (
        <button
          key={slot.slot_id}
          onClick={() => onSlotSelect(slot)}
          disabled={slot.status !== 'available'}
          className={clsx(
            'p-4 rounded-lg text-center transition-colors',
            'hover:bg-gray-100 dark:hover:bg-gray-700',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
            {
              'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700':
                slot.status === 'available' && 
                (selectedSlot ? ('slot_id' in selectedSlot ? selectedSlot.slot_id !== slot.slot_id : selectedSlot.id !== slot.slot_id) : true),
              'bg-primary-500 text-white border border-primary-500':
                selectedSlot && ('slot_id' in selectedSlot ? selectedSlot.slot_id === slot.slot_id : selectedSlot.id === slot.slot_id),
              'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed':
                slot.status !== 'available'
            }
          )}
        >
          <div className="text-sm font-medium">
            {formatTimeInTimezone(slot.start_time)} - {formatTimeInTimezone(slot.end_time)}
          </div>
          <div className="text-xs mt-1">
            {slot.duration} minutes
          </div>
        </button>
      ))}
    </div>
  )
} 