'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/use-toast'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, isWeekend, differenceInDays } from 'date-fns'
import { 
  Calendar, ChevronLeft, ChevronRight, Plus, Edit, Trash2, Sparkles, 
  Clock, CheckCircle, FileType, Users, Search, Settings, Languages,
  PlayCircle, AlertCircle, Loader2, X, Eye, PenSquare
} from 'lucide-react'
import type { Database } from '@/types/database'

// Dynamic import of PostEditor to avoid SSR issues
const PostEditor = dynamic(() => import('@/components/blog/PostEditor'), {
  loading: () => <div className="p-8 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>,
  ssr: false,
})

type ContentCalendarEntry = Database['public']['Tables']['content_calendar']['Row']
type AIPersona = Database['public']['Tables']['ai_personas']['Row']
type ContentType = Database['public']['Tables']['content_types']['Row']
type Post = Database['public']['Tables']['posts']['Row']
type KeywordResearch = Database['public']['Tables']['keyword_research']['Row']

interface CalendarEntryWithRelations extends ContentCalendarEntry {
  ai_personas?: AIPersona | null
  posts?: Post | null
  content_types?: ContentType | null
}

export default function ContentPlannerView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState<CalendarEntryWithRelations[]>([])
  const [personas, setPersonas] = useState<AIPersona[]>([])
  const [contentTypes, setContentTypes] = useState<ContentType[]>([])
  const [seoKeywords, setSeoKeywords] = useState<KeywordResearch[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntryWithRelations | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isGeneratePlanDialogOpen, setIsGeneratePlanDialogOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedPlans, setSelectedPlans] = useState<string[]>([])
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [customKeywords, setCustomKeywords] = useState('')
  const [makeItMine, setMakeItMine] = useState('')
  const [generateImage, setGenerateImage] = useState(false)
  const [imagePrompt, setImagePrompt] = useState('')
  const [isEditingPost, setIsEditingPost] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [generatingEntries, setGeneratingEntries] = useState<Set<string>>(new Set())
  
  // Form state for generating content plans
  const [planFormData, setPlanFormData] = useState({
    contentTypeIds: [] as string[],
    personaIds: [] as string[],
    languages: ['en'],
    keywords: '',
    customTopics: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    timeSlots: ['09:00', '14:00'],
    excludeWeekends: true
  })

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [currentDate])

  // Subscribe to real-time updates for content calendar
  useEffect(() => {
    const channel = supabase
      .channel('content-calendar-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'content_calendar'
        },
        (payload) => {
          console.log('📡 Real-time update received:', payload)
          const updatedEntry = payload.new as ContentCalendarEntry
          
          // If it was generating and now it's not, remove from tracking
          if (generatingEntries.has(updatedEntry.id) && updatedEntry.status !== 'generating') {
            setGeneratingEntries(prev => {
              const next = new Set(prev)
              next.delete(updatedEntry.id)
              return next
            })
            
            // Reload data to get the complete entry with relations
            loadData()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, generatingEntries])

  // Poll for updates when entries are generating (as backup to real-time)
  useEffect(() => {
    if (generatingEntries.size === 0) return

    const pollInterval = setInterval(async () => {
      console.log('🔄 Polling for updates on generating entries:', Array.from(generatingEntries))
      
      const { data: updatedEntries, error } = await supabase
        .from('content_calendar')
        .select(`
          *,
          ai_personas (*),
          posts (*),
          content_types (*)
        `)
        .in('id', Array.from(generatingEntries))
      
      if (!error && updatedEntries) {
        const stillGenerating = new Set<string>()
        
        updatedEntries.forEach(entry => {
          if (entry.status === 'generating') {
            stillGenerating.add(entry.id)
          } else {
            console.log(`✅ Entry ${entry.id} completed with status: ${entry.status}`)
          }
        })
        
        setGeneratingEntries(stillGenerating)
        
        // If any entries completed, reload all data
        if (stillGenerating.size < generatingEntries.size) {
          loadData()
        }
      }
    }, 10000) // Poll every 10 seconds as backup

    return () => clearInterval(pollInterval)
  }, [generatingEntries, supabase])

  async function loadData() {
    try {
      console.log('🔄 Loading content planner data...')
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)
      
      // Load calendar entries for the month with related data
      const { data: calendarData, error: calendarError } = await supabase
        .from('content_calendar')
        .select(`
          *,
          ai_personas (*),
          posts (*),
          content_types (*)
        `)
        .gte('date', start.toISOString().split('T')[0])
        .lte('date', end.toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (calendarError) {
        console.error('❌ Calendar error:', calendarError)
        throw calendarError
      }
      console.log('✅ Calendar entries loaded:', calendarData?.length || 0)
      setEntries(calendarData || [])
      
      // Load personas (same as AIPersonaManager)
      const { data: personaData, error: personaError } = await supabase
        .from('ai_personas')
        .select('*')
        .order('created_at', { ascending: false })

      if (personaError) {
        console.error('❌ Persona error:', personaError)
        throw personaError
      }
      console.log('✅ Personas loaded:', personaData?.length || 0, personaData)
      setPersonas(personaData || [])
      
      // Load content types
      const { data: contentTypeData, error: contentTypeError } = await supabase
        .from('content_types')
        .select('*')
        .order('name')

      if (contentTypeError) {
        console.error('❌ Content type error:', contentTypeError)
        throw contentTypeError
      }
      console.log('✅ Content types loaded:', contentTypeData?.length || 0, contentTypeData)
      setContentTypes(contentTypeData || [])
      
      // Load SEO keywords
      const { data: keywordData, error: keywordError } = await supabase
        .from('keyword_research')
        .select('*')
        .order('search_volume', { ascending: false })
        .limit(100)

      if (keywordError) {
        console.error('⚠️ Keyword error (non-blocking):', keywordError)
      } else {
        console.log('✅ Keywords loaded:', keywordData?.length || 0)
        setSeoKeywords(keywordData || [])
      }
    } catch (error) {
      console.error('❌ Error loading data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load data. Check browser console for details.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateContentPlans() {
    setIsGenerating(true)
    
    try {
      // Combine selected keywords and custom keywords
      const allKeywords = [
        ...selectedKeywords,
        ...customKeywords.split(',').map(k => k.trim()).filter(k => k)
      ].join(', ')

      const response = await fetch('/api/ai/generate-content-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          ...planFormData,
          keywords: allKeywords
        })
      })

      if (!response.ok) throw new Error('Failed to generate content plans')
      
      const result = await response.json()
      
      toast({
        title: 'Success',
        description: `Generated ${result.plansCreated} content plans`
      })
      
      setIsGeneratePlanDialogOpen(false)
      loadData()
    } catch (error) {
      console.error('Error generating plans:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate content plans',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleGenerateContent(entry: CalendarEntryWithRelations) {
    try {
      const response = await fetch('/api/ai/generate-content-from-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          planId: entry.id,
          title: entry.planned_title,
          prompt: entry.generation_prompt,
          contentTypeId: entry.content_type_id,
          personaIds: entry.multiple_persona_ids || [entry.persona_id],
          languages: entry.languages || [entry.locale],
          keywords: entry.keywords,
          topics: [entry.topic, ...(entry.custom_topics || [])],
          makeItMine: makeItMine, // Include personal insights
          generateImage: generateImage,
          imagePrompt: imagePrompt
        })
      })

      if (!response.ok) throw new Error('Failed to generate content')
      
      toast({
        title: 'Success',
        description: `Content generation started${generateImage ? ' with image generation' : ''}. Check back in a few moments.`
      })
      
      // Update status to generating
      await supabase
        .from('content_calendar')
        .update({ status: 'generating' })
        .eq('id', entry.id)
      
      // Add to generating entries for polling
      setGeneratingEntries(prev => new Set([...prev, entry.id]))
      
      // Clear form fields after use
      setMakeItMine('')
      setGenerateImage(false)
      setImagePrompt('')
      
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

  async function handleBulkGenerate() {
    if (selectedPlans.length === 0) {
      toast({
        title: 'No plans selected',
        description: 'Please select at least one plan to generate content',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch('/api/ai/generate-content-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          planIds: selectedPlans
        })
      })

      if (!response.ok) throw new Error('Failed to start bulk generation')
      
      // Add all to generating entries for polling
      setGeneratingEntries(prev => new Set([...prev, ...selectedPlans]))
      
      toast({
        title: 'Bulk generation started',
        description: `Generating content for ${selectedPlans.length} plans`
      })
      
      setSelectedPlans([])
      loadData()
    } catch (error) {
      console.error('Error starting bulk generation:', error)
      toast({
        title: 'Error',
        description: 'Failed to start bulk generation',
        variant: 'destructive'
      })
    }
  }

  async function handleDeleteEntry(entry: CalendarEntryWithRelations) {
    if (!confirm('Are you sure you want to delete this content plan?')) return

    try {
      const { error } = await supabase
        .from('content_calendar')
        .delete()
        .eq('id', entry.id)

      if (error) throw error
      
      toast({
        title: 'Success',
        description: 'Content plan deleted successfully'
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

  async function handleViewPost(entry: CalendarEntryWithRelations) {
    if (!entry.post_id) return
    
    try {
      const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', entry.post_id)
        .single()
      
      if (error) throw error
      
      setEditingPost(post)
      setIsEditingPost(true)
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Error loading post:', error)
      toast({
        title: 'Error',
        description: 'Failed to load post',
        variant: 'destructive'
      })
    }
  }

  function handleCancelPostEdit() {
    setIsEditingPost(false)
    setEditingPost(null)
  }

  async function handleSavePost(savedPost: any) {
    // Update the post status in content calendar if needed
    if (savedPost && selectedEntry) {
      const newStatus = savedPost.published ? 'published' : 'scheduled'
      await supabase
        .from('content_calendar')
        .update({ status: newStatus })
        .eq('id', selectedEntry.id)
    }
    
    toast({
      title: 'Success',
      description: 'Post updated successfully'
    })
    
    setIsEditingPost(false)
    setEditingPost(null)
    loadData()
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'generating': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'generated': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'scheduled': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'published': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'generating': return <Clock className="h-4 w-4 animate-spin" />
      case 'generated': 
      case 'scheduled':
      case 'published': return <CheckCircle className="h-4 w-4" />
      case 'failed': return <AlertCircle className="h-4 w-4" />
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
    return <div className="p-8 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  }

  // Show PostEditor when editing a post
  if (isEditingPost && editingPost) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <PostEditor
            post={editingPost}
            onSave={handleSavePost}
            onCancel={handleCancelPostEdit}
            supabaseClient={supabase}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Content Calendar & Planner</h2>
          <p className="text-muted-foreground">Plan, generate, and schedule AI-powered content</p>
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
          <Button onClick={() => setIsGeneratePlanDialogOpen(true)}>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate & Schedule Content
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedPlans.length > 0 && (
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <span className="text-sm font-medium">
              {selectedPlans.length} plan(s) selected
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedPlans([])}
              >
                <X className="h-4 w-4 mr-1" />
                Clear Selection
              </Button>
              <Button 
                size="sm"
                onClick={handleBulkGenerate}
              >
                <PlayCircle className="h-4 w-4 mr-1" />
                Generate Selected
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar */}
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
                    ${isTodayDate ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300' : ''}
                  `}
                >
                  <div className="font-medium text-sm mb-1">{format(day, 'd')}</div>
                  <div className="space-y-1">
                    {dayEntries.slice(0, 3).map((entry) => (
                      <div
                        key={entry.id}
                        className={`
                          text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity
                          ${getStatusColor(entry.status)}
                        `}
                        onClick={() => {
                          setSelectedEntry(entry)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <div className="flex items-center gap-1">
                          {entry.status === 'planned' && (
                            <input
                              type="checkbox"
                              className="h-3 w-3"
                              checked={selectedPlans.includes(entry.id)}
                              onChange={(e) => {
                                e.stopPropagation()
                                if (e.target.checked) {
                                  setSelectedPlans([...selectedPlans, entry.id])
                                } else {
                                  setSelectedPlans(selectedPlans.filter(id => id !== entry.id))
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                          {getStatusIcon(entry.status)}
                          <span className="truncate font-medium flex-1">
                            {entry.planned_title || entry.topic}
                          </span>
                          {entry.post_id && (
                            <Eye 
                              className="h-3 w-3 opacity-60 hover:opacity-100 cursor-pointer" 
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewPost(entry)
                              }}
                            />
                          )}
                        </div>
                        {entry.languages && entry.languages.length > 0 && (
                          <div className="flex gap-1 mt-0.5">
                            {entry.languages.map(lang => (
                              <span key={lang} className="text-[10px] opacity-75">
                                {lang.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        )}
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

      {/* View/Edit Entry Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open)
        if (!open) {
          setMakeItMine('') // Clear when closing
          setGenerateImage(false)
          setImagePrompt('')
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Content Plan Details</DialogTitle>
            <DialogDescription>
              {selectedEntry?.status === 'planned' ? 'Review and generate content from this plan' : 'View content details'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedEntry.status)}>
                    {selectedEntry.status}
                  </Badge>
                </div>
                <div>
                  <Label>Scheduled Date</Label>
                  <p className="text-sm">{format(new Date(selectedEntry.date), 'PPP')} at {selectedEntry.time_slot}</p>
                </div>
              </div>

              <div>
                <Label>Title</Label>
                <p className="text-sm font-medium">{selectedEntry.planned_title || selectedEntry.topic}</p>
              </div>

              <div>
                <Label>Content Type</Label>
                <p className="text-sm">{selectedEntry.content_types?.name || selectedEntry.content_type}</p>
              </div>

              <div>
                <Label>Languages</Label>
                <div className="flex gap-2 mt-1">
                  {(selectedEntry.languages || [selectedEntry.locale]).map(lang => (
                    <Badge key={lang} variant="secondary">{lang}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Target Personas</Label>
                <p className="text-sm">{selectedEntry.ai_personas?.name || 'General audience'}</p>
              </div>

              <div>
                <Label>Keywords</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(selectedEntry.keywords || []).map((keyword, idx) => (
                    <Badge key={idx} variant="secondary">{keyword}</Badge>
                  ))}
                </div>
              </div>

              {selectedEntry.generation_prompt && (
                <div>
                  <Label>Generation Prompt</Label>
                  <Textarea 
                    value={selectedEntry.generation_prompt} 
                    readOnly 
                    className="text-sm"
                    rows={6}
                  />
                </div>
              )}

              {selectedEntry.status === 'planned' && (
                <>
                  <div>
                    <Label>Make it yours</Label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Add your personal insights, experiences, or unique perspectives to make this content truly yours
                    </p>
                    <Textarea
                      value={makeItMine}
                      onChange={(e) => setMakeItMine(e.target.value)}
                      placeholder="E.g., 'I've personally experienced this when working with clients in Finland...' or 'Include my opinion that AI should augment human creativity, not replace it' or 'Add a section about my 5-year journey in EdTech...'"
                      className="text-sm"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="generate-image"
                        checked={generateImage}
                        onCheckedChange={(checked) => setGenerateImage(checked as boolean)}
                      />
                      <Label htmlFor="generate-image" className="font-medium">
                        Generate featured image
                      </Label>
                    </div>
                    
                    {generateImage && (
                      <div>
                        <Label>Image prompt</Label>
                        <p className="text-xs text-muted-foreground mb-2">
                          Describe the image you want to generate (optional - AI will create one based on content if left empty)
                        </p>
                        <Textarea
                          value={imagePrompt}
                          onChange={(e) => setImagePrompt(e.target.value)}
                          placeholder="E.g., 'Modern abstract visualization of data flowing through neural networks, blue and purple color scheme' or leave empty for auto-generation"
                          className="text-sm"
                          rows={3}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {selectedEntry.notes && (
                <div>
                  <Label>Notes</Label>
                  <p className="text-sm text-muted-foreground">{selectedEntry.notes}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {selectedEntry?.status === 'planned' && (
                <Button
                  variant="default"
                  onClick={() => {
                    setIsEditDialogOpen(false)
                    handleGenerateContent(selectedEntry)
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Content
                </Button>
              )}
              {selectedEntry?.post_id && (
                <Button
                  variant="default"
                  onClick={() => handleViewPost(selectedEntry)}
                >
                  <PenSquare className="h-4 w-4 mr-2" />
                  Edit Post
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  if (selectedEntry) handleDeleteEntry(selectedEntry)
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Content Plans Dialog */}
      <Dialog open={isGeneratePlanDialogOpen} onOpenChange={setIsGeneratePlanDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate & Schedule Content Plans</DialogTitle>
            <DialogDescription>
              Configure your content generation parameters. AI will create content plans that you can review before generating the actual content.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="content" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Content Settings</TabsTrigger>
              <TabsTrigger value="targeting">Targeting</TabsTrigger>
              <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-4">
              <div>
                <Label>Content Types ({contentTypes.filter(t => t.is_active).length} available)</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-700 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-2">
                  {loading ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading content types...</p>
                  ) : contentTypes.length > 0 ? (
                    contentTypes.filter(type => type.is_active).map((type) => (
                      <label key={type.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded">
                        <Checkbox
                          checked={planFormData.contentTypeIds.includes(type.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setPlanFormData({
                                ...planFormData,
                                contentTypeIds: [...planFormData.contentTypeIds, type.id]
                              })
                            } else {
                              setPlanFormData({
                                ...planFormData,
                                contentTypeIds: planFormData.contentTypeIds.filter(id => id !== type.id)
                              })
                            }
                          }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{type.name}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No content types available (check console for errors)</p>
                  )}
                </div>
              </div>

              <div>
                <Label>Keywords</Label>
                {seoKeywords.length > 0 && (
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-700 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-2 mb-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Select from saved SEO keywords:</p>
                    <div className="flex flex-wrap gap-2">
                      {seoKeywords.slice(0, 20).map((keyword) => (
                        <label
                          key={keyword.id}
                          className={`flex items-center space-x-1 px-2 py-1 rounded-md cursor-pointer transition-colors ${
                            selectedKeywords.includes(keyword.keyword)
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          <Checkbox
                            checked={selectedKeywords.includes(keyword.keyword)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedKeywords([...selectedKeywords, keyword.keyword])
                              } else {
                                setSelectedKeywords(selectedKeywords.filter(k => k !== keyword.keyword))
                              }
                            }}
                            className="h-3 w-3"
                          />
                          <span className="text-xs">{keyword.keyword}</span>
                          {keyword.search_volume && (
                            <span className="text-[10px] opacity-60">({keyword.search_volume})</span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <Textarea
                  value={customKeywords}
                  onChange={(e) => setCustomKeywords(e.target.value)}
                  placeholder="Add custom keywords (comma-separated)..."
                  rows={2}
                  className="mt-2"
                />
                {(selectedKeywords.length > 0 || customKeywords) && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Total keywords: {selectedKeywords.length + customKeywords.split(',').filter(k => k.trim()).length}
                  </p>
                )}
              </div>

              <div>
                <Label>Custom Topics (one per line)</Label>
                <Textarea
                  value={planFormData.customTopics}
                  onChange={(e) => setPlanFormData({ ...planFormData, customTopics: e.target.value })}
                  placeholder="Enter specific topics you want to cover..."
                  rows={3}
                  className="mt-2"
                />
              </div>

            </TabsContent>
            
            <TabsContent value="targeting" className="space-y-4">
              <div>
                <Label>Target Personas ({personas.filter(p => p.active).length} available)</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-700 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-2">
                  {loading ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading personas...</p>
                  ) : personas.length > 0 ? (
                    personas.filter(persona => persona.active).map((persona) => (
                      <label key={persona.id} className="flex items-start space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded">
                        <Checkbox
                          checked={planFormData.personaIds.includes(persona.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setPlanFormData({
                                ...planFormData,
                                personaIds: [...planFormData.personaIds, persona.id]
                              })
                            } else {
                              setPlanFormData({
                                ...planFormData,
                                personaIds: planFormData.personaIds.filter(id => id !== persona.id)
                              })
                            }
                          }}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{persona.name}</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{persona.description}</p>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No personas available (check console for errors)</p>
                  )}
                </div>
              </div>

              <div>
                <Label>Languages</Label>
                <div className="space-y-2 mt-2">
                  {[
                    { code: 'en', name: 'English' },
                    { code: 'fi', name: 'Finnish' },
                    { code: 'sv', name: 'Swedish' }
                  ].map((lang) => (
                    <label key={lang.code} className="flex items-center space-x-2">
                      <Checkbox
                        checked={planFormData.languages.includes(lang.code)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPlanFormData({
                              ...planFormData,
                              languages: [...planFormData.languages, lang.code]
                            })
                          } else {
                            setPlanFormData({
                              ...planFormData,
                              languages: planFormData.languages.filter(l => l !== lang.code)
                            })
                          }
                        }}
                      />
                      <span className="text-sm">{lang.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="scheduling" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={planFormData.startDate}
                    onChange={(e) => setPlanFormData({ ...planFormData, startDate: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={planFormData.endDate}
                    onChange={(e) => setPlanFormData({ ...planFormData, endDate: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label>Publishing Times</Label>
                <div className="space-y-2 mt-2">
                  {['09:00', '12:00', '14:00', '16:00', '18:00'].map((time) => (
                    <label key={time} className="flex items-center space-x-2">
                      <Checkbox
                        checked={planFormData.timeSlots.includes(time)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPlanFormData({
                              ...planFormData,
                              timeSlots: [...planFormData.timeSlots, time]
                            })
                          } else {
                            setPlanFormData({
                              ...planFormData,
                              timeSlots: planFormData.timeSlots.filter(t => t !== time)
                            })
                          }
                        }}
                      />
                      <span className="text-sm">{time}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={planFormData.excludeWeekends}
                  onCheckedChange={(checked) => setPlanFormData({ ...planFormData, excludeWeekends: checked as boolean })}
                />
                <Label>Exclude weekends</Label>
              </div>

              {/* Show estimated number of content plans */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Estimated content plans:</strong> {(() => {
                    const start = new Date(planFormData.startDate)
                    const end = new Date(planFormData.endDate)
                    const days = differenceInDays(end, start) + 1
                    const weekendDays = planFormData.excludeWeekends ? Math.floor(days / 7) * 2 : 0
                    const availableDays = days - weekendDays
                    const postsPerDay = planFormData.timeSlots.length
                    return availableDays * postsPerDay * planFormData.languages.length
                  })()} posts
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  ({planFormData.timeSlots.length} posts/day × {planFormData.languages.length} languages × available days)
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGeneratePlanDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateContentPlans} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Plans...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Content Plans
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}