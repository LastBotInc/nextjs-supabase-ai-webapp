import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { addDays, format } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SlotCreationFormProps {
  onCreateSlots: (startTime: string, endTime: string, duration: number) => Promise<void>
}

export default function SlotCreationForm({ onCreateSlots }: SlotCreationFormProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { session } = useAuth()
  const t = useTranslations('Admin.calendar')

  // Default values for the form
  const today = new Date()
  const thirtyDaysFromNow = addDays(today, 30)

  const handleGenerateSlots = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!session?.access_token) {
      toast.error('Please log in to generate slots')
      return
    }

    setIsGenerating(true)
    try {
      const form = e.currentTarget
      const startDate = form.startDate.value
      const endDate = form.endDate.value
      const duration = parseInt(form.duration.value)

      // Validate that end date is after start date
      if (new Date(endDate) < new Date(startDate)) {
        toast.error('End date must be after start date')
        return
      }

      // Use the dates at midnight to ensure we cover the full days
      const startTime = `${startDate}T00:00:00.000Z`
      const endTime = `${endDate}T23:59:59.999Z`

      const response = await fetch('/api/booking/host/slots/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          startDate: startTime,
          endDate: endTime,
          duration
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate slots')
      }

      const data = await response.json()
      toast.success(`Successfully generated ${data.count} slots`)
      
      // Refresh the slots view with the actual date range
      await onCreateSlots(startTime, endTime, duration)
    } catch (error) {
      console.error('Error generating slots:', error)
      toast.error('Failed to generate slots')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <form onSubmit={handleGenerateSlots} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="startDate">{t('settings.startDate')}</Label>
          <Input
            type="date"
            id="startDate"
            name="startDate"
            defaultValue={format(today, 'yyyy-MM-dd')}
            min={format(today, 'yyyy-MM-dd')}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">{t('settings.endDate')}</Label>
          <Input
            type="date"
            id="endDate"
            name="endDate"
            defaultValue={format(thirtyDaysFromNow, 'yyyy-MM-dd')}
            min={format(today, 'yyyy-MM-dd')}
            required
          />
        </div>
        <div>
          <Label htmlFor="duration">{t('settings.slotDuration')}</Label>
          <Input
            type="number"
            id="duration"
            name="duration"
            defaultValue={30}
            min={15}
            max={480}
            required
          />
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          type="submit"
          disabled={isGenerating}
          size="lg"
          className="w-full max-w-md"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('slots.actions.generating')}
            </>
          ) : (
            t('slots.actions.generate')
          )}
        </Button>
      </div>
    </form>
  )
} 