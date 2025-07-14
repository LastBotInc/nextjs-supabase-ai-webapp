'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, ChevronLeft, ChevronRight, Plus, Edit, Trash2, Sparkles, Clock, CheckCircle } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns'
import type { Database } from '@/types/database'

type ContentCalendarEntry = Database['public']['Tables']['content_calendar']['Row']
type AIPersona = Database['public']['Tables']['ai_personas']['Row']
type Post = Database['public']['Tables']['posts']['Row']

interface CalendarEntryWithRelations extends ContentCalendarEntry {
  ai_personas?: AIPersona | null
  posts?: Post | null
}

export default function ContentCalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState<CalendarEntryWithRelations[]>([])
  const [personas, setPersonas] = useState<AIPersona[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntryWithRelations | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  
  // Form state for editing
  const [editFormData, setEditFormData] = useState({
    topic: '',
    keywords: [] as string[],
    target_audience: '',
    persona_id: '',
    content_type: 'blog',
    time_slot: '09:00:00',
    notes: ''
  })

  // Generate calendar form state
  const [generateFormData, setGenerateFormData] = useState({
    frequency: 'daily',
    personaIds: [] as string[],
    contentTypes: ['blog'],
    businessGoals: '',
    excludeWeekends: true
  })

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [currentDate])

  async function loadData() {
    try {
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)
      
      // Load calendar entries for the month
      const { data: calendarData, error: calendarError } = await supabase
        .from('content_calendar')
        .select(`
          *,
          ai_personas (*),
          posts (*)
        `)
        .gte('date', start.toISOString().split('T')[0])
        .lte('date', end.toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (calendarError) throw calendarError
      setEntries(calendarData || [])
      
      // Load active personas
      const { data: personaData, error: personaError } = await supabase
        .from('ai_personas')
        .select('*')
        .eq('active', true)
        .order('name')

      if (personaError) throw personaError
      setPersonas(personaData || [])
    } catch (error) {
      console.error('Error loading calendar data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load calendar data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateCalendar() {
    try {
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)
      
      const response = await fetch('/api/ai/generate-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
          ...generateFormData
        })
      })

      if (!response.ok) throw new Error('Failed to generate calendar')
      
      const result = await response.json()
      
      toast({
        title: 'Success',
        description: `Generated ${result.totalEntries} content ideas for the month`
      })
      
      setIsGenerateDialogOpen(false)
      loadData()
    } catch (error) {
      console.error('Error generating calendar:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate calendar',
        variant: 'destructive'
      })
    }
  }

  async function handleGenerateContent(entry: CalendarEntryWithRelations) {
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          personaId: entry.persona_id,
          topic: entry.topic,
          keywords: entry.keywords || [],
          targetAudience: entry.target_audience,
          contentType: entry.content_type,
          locale: entry.locale
        })
      })

      if (!response.ok) throw new Error('Failed to generate content')
      
      toast({
        title: 'Success',
        description: 'Content generation started. Check back in a few moments.'
      })
      
      // Update status to generating
      await supabase
        .from('content_calendar')
        .update({ status: 'generating' })
        .eq('id', entry.id)
      
      loadData()
    } catch (error) {
      console.error('Error generating content:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate content',
        variant: 'destructive'
      })
    }
  }

  async function handleUpdateEntry() {
    if (!selectedEntry) return

    try {
      const { error } = await supabase
        .from('content_calendar')
        .update({
          topic: editFormData.topic,
          keywords: editFormData.keywords,
          target_audience: editFormData.target_audience,
          persona_id: editFormData.persona_id,
          content_type: editFormData.content_type,
          time_slot: editFormData.time_slot,
          notes: editFormData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedEntry.id)

      if (error) throw error
      
      toast({
        title: 'Success',
        description: 'Calendar entry updated successfully'
      })
      
      setIsEditDialogOpen(false)
      setSelectedEntry(null)
      loadData()
    } catch (error) {
      console.error('Error updating entry:', error)
      toast({
        title: 'Error',
        description: 'Failed to update entry',
        variant: 'destructive'
      })
    }
  }

  async function handleDeleteEntry(entry: CalendarEntryWithRelations) {
    if (!confirm('Are you sure you want to delete this calendar entry?')) return

    try {
      const { error } = await supabase
        .from('content_calendar')
        .delete()
        .eq('id', entry.id)

      if (error) throw error
      
      toast({
        title: 'Success',
        description: 'Calendar entry deleted successfully'
      })
      
      loadData()
    } catch (error) {
      console.error('Error deleting entry:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete entry',
        variant: 'destructive'
      })
    }
  }

  function openEditDialog(entry: CalendarEntryWithRelations) {
    setSelectedEntry(entry)
    setEditFormData({
      topic: entry.topic,
      keywords: entry.keywords || [],
      target_audience: entry.target_audience || '',
      persona_id: entry.persona_id || '',
      content_type: entry.content_type,
      time_slot: entry.time_slot,
      notes: entry.notes || ''
    })
    setIsEditDialogOpen(true)
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800'
      case 'generating': return 'bg-yellow-100 text-yellow-800'
      case 'generated': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-purple-100 text-purple-800'
      case 'published': return 'bg-gray-100 text-gray-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'generating': return <Clock className="h-4 w-4" />
      case 'generated': 
      case 'scheduled':
      case 'published': return <CheckCircle className="h-4 w-4" />
      default: return null
    }
  }

  // Generate calendar days
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Group entries by date
  const entriesByDate = entries.reduce((acc, entry) => {
    const dateKey = entry.date
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(entry)
    return acc
  }, {} as Record<string, CalendarEntryWithRelations[]>)

  if (loading) {
    return <div className="p-8">Loading calendar...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Content Calendar</h2>
          <p className="text-muted-foreground">Plan and schedule your AI-generated content</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsGenerateDialogOpen(true)}>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Calendar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-medium text-sm text-muted-foreground p-2">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {days.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd')
              const dayEntries = entriesByDate[dateKey] || []
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isTodayDate = isToday(day)
              
              return (
                <div
                  key={day.toISOString()}
                  className={`
                    min-h-[120px] p-2 border rounded-lg
                    ${!isCurrentMonth ? 'opacity-40' : ''}
                    ${isTodayDate ? 'bg-blue-50 border-blue-300' : ''}
                  `}
                >
                  <div className="font-medium text-sm mb-1">{format(day, 'd')}</div>
                  <div className="space-y-1">
                    {dayEntries.slice(0, 3).map((entry) => (
                      <div
                        key={entry.id}
                        className={`
                          text-xs p-1 rounded cursor-pointer hover:opacity-80
                          ${getStatusColor(entry.status)}
                        `}
                        onClick={() => openEditDialog(entry)}
                      >
                        <div className="flex items-center gap-1">
                          {getStatusIcon(entry.status)}
                          <span className="truncate font-medium">
                            For: {entry.ai_personas?.name || 'No persona'}
                          </span>
                        </div>
                        <div className="truncate">{entry.topic}</div>
                      </div>
                    ))}
                    {dayEntries.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayEntries.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit Entry Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Calendar Entry</DialogTitle>
            <DialogDescription>
              Update the content plan for this date
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={editFormData.topic}
                onChange={(e) => setEditFormData({ ...editFormData, topic: e.target.value })}
                placeholder="What should the content be about?"
              />
            </div>
            
            <div>
              <Label htmlFor="keywords">Keywords (comma-separated)</Label>
              <Input
                id="keywords"
                value={editFormData.keywords.join(', ')}
                onChange={(e) => setEditFormData({ 
                  ...editFormData, 
                  keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                })}
                placeholder="SEO keywords to target"
              />
            </div>
            
            <div>
              <Label htmlFor="target_audience">Target Audience</Label>
              <Input
                id="target_audience"
                value={editFormData.target_audience}
                onChange={(e) => setEditFormData({ ...editFormData, target_audience: e.target.value })}
                placeholder="Who is this content for?"
              />
            </div>
            
            <div>
              <Label htmlFor="persona">Target User Persona</Label>
              <Select
                value={editFormData.persona_id}
                onValueChange={(value) => setEditFormData({ ...editFormData, persona_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target persona" />
                </SelectTrigger>
                <SelectContent>
                  {personas.map((persona) => (
                    <SelectItem key={persona.id} value={persona.id}>
                      {persona.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="content_type">Content Type</Label>
              <Select
                value={editFormData.content_type}
                onValueChange={(value) => setEditFormData({ ...editFormData, content_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog">Blog Post</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="landing">Landing Page</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="time_slot">Publishing Time</Label>
              <Input
                id="time_slot"
                type="time"
                value={editFormData.time_slot}
                onChange={(e) => setEditFormData({ ...editFormData, time_slot: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                placeholder="Additional notes or instructions"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {selectedEntry && selectedEntry.status === 'planned' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    handleGenerateContent(selectedEntry)
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Now
                </Button>
              )}
              {selectedEntry && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    handleDeleteEntry(selectedEntry)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateEntry}>
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Calendar Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Content Calendar</DialogTitle>
            <DialogDescription>
              AI will create a content plan for {format(currentDate, 'MMMM yyyy')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="frequency">Posting Frequency</Label>
              <Select
                value={generateFormData.frequency}
                onValueChange={(value) => setGenerateFormData({ ...generateFormData, frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Target User Personas</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2">
                {personas.map((persona) => (
                  <label key={persona.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={generateFormData.personaIds.includes(persona.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setGenerateFormData({
                            ...generateFormData,
                            personaIds: [...generateFormData.personaIds, persona.id]
                          })
                        } else {
                          setGenerateFormData({
                            ...generateFormData,
                            personaIds: generateFormData.personaIds.filter(id => id !== persona.id)
                          })
                        }
                      }}
                    />
                    <span className="text-sm">{persona.name}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="businessGoals">Business Goals (optional)</Label>
              <Textarea
                id="businessGoals"
                value={generateFormData.businessGoals}
                onChange={(e) => setGenerateFormData({ ...generateFormData, businessGoals: e.target.value })}
                placeholder="What are your content goals for this month?"
                rows={2}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="excludeWeekends"
                checked={generateFormData.excludeWeekends}
                onChange={(e) => setGenerateFormData({ ...generateFormData, excludeWeekends: e.target.checked })}
              />
              <Label htmlFor="excludeWeekends">Exclude weekends</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateCalendar}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Calendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}