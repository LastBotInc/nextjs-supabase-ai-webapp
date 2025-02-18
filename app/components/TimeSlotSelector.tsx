import React, { useState } from 'react'
import { format } from 'date-fns'

const TimeSlotSelector: React.FC<{
  slots: { id: string; start_time: string; end_time: string; duration: number }[]
  selectedSlot?: { id: string }
  onSlotSelect: (slot: { id: string }) => void
  timezone: string
}> = ({ slots, selectedSlot, onSlotSelect, timezone }) => {
  const [groupedSlots, setGroupedSlots] = useState<{ id: string; start_time: string; end_time: string; duration: number }[]>(slots)

  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
      {groupedSlots.map((slot) => {
        const startTime = new Date(slot.start_time)
        const endTime = new Date(slot.end_time)
        const isSelected = selectedSlot?.id === slot.id

        return (
          <button
            key={slot.id}
            onClick={() => onSlotSelect(slot)}
            className={`
              w-full flex items-center justify-between p-4 rounded-lg
              transition-all duration-200 ease-in-out
              ${
                isSelected
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
              }
            `}
          >
            <div className="text-lg font-medium">
              {format(startTime, 'h:mm a')} -{' '}
              {format(endTime, 'h:mm a')}
            </div>
            <div className="text-sm opacity-80">
              {slot.duration} min
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default TimeSlotSelector 