'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Sparkles, Plus, Trash2, Calendar, Clock, CheckCircle, XCircle, 
  Loader2, PlayCircle, PauseCircle, AlertCircle, Languages,
  FileType, Users, Search, Settings
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import type { Database } from '@/types/database'
import { useTranslations } from 'next-intl'

type AIPersona = Database['public']['Tables']['ai_personas']['Row']
type ContentType = Database['public']['Tables']['content_types']['Row']
type KeywordResearch = Database['public']['Tables']['keyword_research']['Row']

interface BulkGenerationConfig {
  id: string
  contentTypes: string[]
  personas: string[]
  languages: string[]
  keywords: string[]
  customTopics: string[]
  numberOfPosts: number
  schedulingOptions: {
    startDate: string
    endDate: string
    timeSlots: string[]
    excludeWeekends: boolean
  }
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused'
  progress: {
    total: number
    completed: number
    failed: number
  }
}

interface GenerationQueueItem {
  id: string
  configId: string
  contentTypeId: string
  personaId: string
  language: string
  topic: string
  keywords: string[]
  scheduledDate?: string
  scheduledTime?: string
  status: 'pending' | 'generating' | 'generated' | 'failed'
  result?: any
  error?: string
}

export default function EnhancedBulkContentGenerator() {
  const [personas, setPersonas] = useState<AIPersona[]>([])
  const [contentTypes, setContentTypes] = useState<ContentType[]>([])
  const [savedKeywords, setSavedKeywords] = useState<KeywordResearch[]>([])
  const [availableLanguages] = useState([
    { code: 'en', name: 'English' },
    { code: 'fi', name: 'Finnish' },
    { code: 'sv', name: 'Swedish' }
  ])
  
  const [configs, setConfigs] = useState<BulkGenerationConfig[]>([])
  const [queue, setQueue] = useState<GenerationQueueItem[]>([])
  const [activeConfig, setActiveConfig] = useState<BulkGenerationConfig | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    selectedContentTypes: [] as string[],
    selectedPersonas: [] as string[],
    selectedLanguages: ['en'],
    selectedKeywords: [] as string[],
    customTopics: '',
    numberOfPosts: 10,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    timeSlots: ['09:00', '14:00'],
    excludeWeekends: true
  })
  
  const supabase = createClient()
  const t = useTranslations('Admin')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Load personas
      const { data: personasData } = await supabase
        .from('ai_personas')
        .select('*')
        .eq('active', true)
        .order('name')
      
      // Load content types
      const { data: contentTypesData } = await supabase
        .from('content_types')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      // Load saved keywords
      const { data: keywordsData } = await supabase
        .from('keyword_research')
        .select('*')
        .order('search_volume', { ascending: false })
        .limit(100)
      
      setPersonas(personasData || [])
      setContentTypes(contentTypesData || [])
      setSavedKeywords(keywordsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    }
  }

  function createConfiguration() {
    if (formData.selectedContentTypes.length === 0 || formData.selectedPersonas.length === 0) {
      toast.error('Please select at least one content type and persona')
      return
    }

    const topics = [
      ...formData.selectedKeywords,
      ...formData.customTopics.split(',').map(t => t.trim()).filter(t => t)
    ]

    if (topics.length === 0) {
      toast.error('Please add some keywords or topics')
      return
    }

    const totalItems = formData.selectedContentTypes.length * 
                      formData.selectedPersonas.length * 
                      formData.selectedLanguages.length * 
                      Math.min(topics.length, formData.numberOfPosts)

    const config: BulkGenerationConfig = {
      id: Date.now().toString(),
      contentTypes: formData.selectedContentTypes,
      personas: formData.selectedPersonas,
      languages: formData.selectedLanguages,
      keywords: formData.selectedKeywords,
      customTopics: formData.customTopics.split(',').map(t => t.trim()).filter(t => t),
      numberOfPosts: formData.numberOfPosts,
      schedulingOptions: {
        startDate: formData.startDate,
        endDate: formData.endDate,
        timeSlots: formData.timeSlots,
        excludeWeekends: formData.excludeWeekends
      },
      status: 'pending',
      progress: {
        total: totalItems,
        completed: 0,
        failed: 0
      }
    }

    setConfigs([...configs, config])
    createQueueItems(config)
    
    // Reset form
    setFormData({
      selectedContentTypes: [],
      selectedPersonas: [],
      selectedLanguages: ['en'],
      selectedKeywords: [],
      customTopics: '',
      numberOfPosts: 10,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      timeSlots: ['09:00', '14:00'],
      excludeWeekends: true
    })
    
    toast.success(`Created bulk generation config with ${totalItems} items`)
  }

  function createQueueItems(config: BulkGenerationConfig) {
    const items: GenerationQueueItem[] = []
    const topics = [...config.keywords, ...config.customTopics]
    const scheduleDates = generateScheduleDates(config.schedulingOptions)
    
    let dateIndex = 0
    
    for (const contentTypeId of config.contentTypes) {
      for (const personaId of config.personas) {
        for (const language of config.languages) {
          for (let i = 0; i < Math.min(topics.length, config.numberOfPosts); i++) {
            const schedule = scheduleDates[dateIndex % scheduleDates.length]
            dateIndex++
            
            items.push({
              id: `${config.id}-${Date.now()}-${Math.random()}`,
              configId: config.id,
              contentTypeId,
              personaId,
              language,
              topic: topics[i % topics.length],
              keywords: config.keywords.slice(0, 5), // Use first 5 keywords
              scheduledDate: schedule.date,
              scheduledTime: schedule.time,
              status: 'pending'
            })
          }
        }
      }
    }
    
    setQueue([...queue, ...items])
  }

  function generateScheduleDates(options: BulkGenerationConfig['schedulingOptions']) {
    const dates: { date: string; time: string }[] = []
    const start = new Date(options.startDate)
    const end = new Date(options.endDate)
    
    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      if (options.excludeWeekends && (d.getDay() === 0 || d.getDay() === 6)) {
        continue
      }
      
      for (const timeSlot of options.timeSlots) {
        dates.push({
          date: format(new Date(d), 'yyyy-MM-dd'),
          time: timeSlot
        })
      }
    }
    
    return dates
  }

  async function startGeneration(configId: string) {
    const config = configs.find(c => c.id === configId)
    if (!config) return
    
    setActiveConfig(config)
    setIsGenerating(true)
    setIsPaused(false)
    
    // Update config status
    setConfigs(configs.map(c => 
      c.id === configId ? { ...c, status: 'running' } : c
    ))
    
    // Trigger Inngest function
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.access_token) {
        throw new Error('No session')
      }

      const response = await fetch('/api/inngest/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`
        },
        body: JSON.stringify({
          name: 'content/bulk-generation.start',
          data: {
            configId,
            items: queue.filter(item => item.configId === configId)
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start bulk generation')
      }

      toast.success('Bulk generation started in background')
    } catch (error) {
      console.error('Error starting generation:', error)
      toast.error('Failed to start bulk generation')
      setIsGenerating(false)
      setConfigs(configs.map(c => 
        c.id === configId ? { ...c, status: 'failed' } : c
      ))
    }
  }

  async function pauseGeneration() {
    setIsPaused(true)
    // In a real implementation, this would signal the Inngest function to pause
    toast.info('Generation paused')
  }

  async function resumeGeneration() {
    setIsPaused(false)
    // In a real implementation, this would signal the Inngest function to resume
    toast.info('Generation resumed')
  }

  function deleteConfig(configId: string) {
    setConfigs(configs.filter(c => c.id !== configId))
    setQueue(queue.filter(item => item.configId !== configId))
    if (activeConfig?.id === configId) {
      setActiveConfig(null)
      setIsGenerating(false)
    }
  }

  const getContentTypeName = (id: string) => contentTypes.find(ct => ct.id === id)?.name || 'Unknown'
  const getPersonaName = (id: string) => personas.find(p => p.id === id)?.name || 'Unknown'

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Bulk Content Generator
            </span>
            {isGenerating && (
              <div className="flex items-center gap-2">
                {isPaused ? (
                  <Button size="sm" variant="outline" onClick={resumeGeneration}>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={pauseGeneration}>
                    <PauseCircle className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                )}
              </div>
            )}
          </CardTitle>
          <CardDescription>
            Generate multiple content pieces across different types, personas, and languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="configure" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="configure">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </TabsTrigger>
              <TabsTrigger value="queue">
                <Clock className="h-4 w-4 mr-2" />
                Queue ({queue.length})
              </TabsTrigger>
              <TabsTrigger value="history">
                <CheckCircle className="h-4 w-4 mr-2" />
                History ({configs.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="configure" className="space-y-6">
              {/* Content Types Selection */}
              <div>
                <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                  <FileType className="h-4 w-4" />
                  Content Types
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {contentTypes.map(ct => (
                    <label key={ct.id} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={formData.selectedContentTypes.includes(ct.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              selectedContentTypes: [...formData.selectedContentTypes, ct.id]
                            })
                          } else {
                            setFormData({
                              ...formData,
                              selectedContentTypes: formData.selectedContentTypes.filter(id => id !== ct.id)
                            })
                          }
                        }}
                      />
                      <span className="text-sm">{ct.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Personas Selection */}
              <div>
                <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4" />
                  Customer Personas
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {personas.map(persona => (
                    <label key={persona.id} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={formData.selectedPersonas.includes(persona.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              selectedPersonas: [...formData.selectedPersonas, persona.id]
                            })
                          } else {
                            setFormData({
                              ...formData,
                              selectedPersonas: formData.selectedPersonas.filter(id => id !== persona.id)
                            })
                          }
                        }}
                      />
                      <span className="text-sm">{persona.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Languages Selection */}
              <div>
                <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                  <Languages className="h-4 w-4" />
                  Languages
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {availableLanguages.map(lang => (
                    <label key={lang.code} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={formData.selectedLanguages.includes(lang.code)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              selectedLanguages: [...formData.selectedLanguages, lang.code]
                            })
                          } else {
                            setFormData({
                              ...formData,
                              selectedLanguages: formData.selectedLanguages.filter(code => code !== lang.code)
                            })
                          }
                        }}
                      />
                      <span className="text-sm">{lang.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Keywords Selection */}
              <div>
                <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                  <Search className="h-4 w-4" />
                  SEO Keywords
                </Label>
                <div className="space-y-3">
                  <div className="max-h-40 overflow-y-auto border rounded-md p-3 space-y-2">
                    {savedKeywords.length > 0 ? (
                      savedKeywords.map(kw => (
                        <label key={kw.id} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={formData.selectedKeywords.includes(kw.keyword)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setFormData({
                                    ...formData,
                                    selectedKeywords: [...formData.selectedKeywords, kw.keyword]
                                  })
                                } else {
                                  setFormData({
                                    ...formData,
                                    selectedKeywords: formData.selectedKeywords.filter(k => k !== kw.keyword)
                                  })
                                }
                              }}
                            />
                            <span className="text-sm">{kw.keyword}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>Vol: {kw.search_volume || 'N/A'}</span>
                            <span>Diff: {kw.difficulty || 'N/A'}</span>
                          </div>
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No saved keywords. Go to SEO tools to research keywords.</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="customTopics" className="text-sm">Custom Topics (comma-separated)</Label>
                    <Textarea
                      id="customTopics"
                      value={formData.customTopics}
                      onChange={(e) => setFormData({ ...formData, customTopics: e.target.value })}
                      placeholder="AI trends 2024, Machine learning basics, Best practices for automation..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Generation Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numberOfPosts">Number of Posts per Combination</Label>
                  <Input
                    id="numberOfPosts"
                    type="number"
                    min={1}
                    max={50}
                    value={formData.numberOfPosts}
                    onChange={(e) => setFormData({ ...formData, numberOfPosts: parseInt(e.target.value) || 1 })}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Scheduling Options */}
              <div>
                <Label className="text-base font-semibold flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4" />
                  Scheduling Options
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Time Slots</Label>
                    <div className="flex gap-2 mt-1">
                      {formData.timeSlots.map((slot, index) => (
                        <div key={index} className="flex items-center gap-1">
                          <Input
                            type="time"
                            value={slot}
                            onChange={(e) => {
                              const newSlots = [...formData.timeSlots]
                              newSlots[index] = e.target.value
                              setFormData({ ...formData, timeSlots: newSlots })
                            }}
                            className="w-32"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                timeSlots: formData.timeSlots.filter((_, i) => i !== index)
                              })
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            timeSlots: [...formData.timeSlots, '12:00']
                          })
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="excludeWeekends"
                      checked={formData.excludeWeekends}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, excludeWeekends: checked as boolean })
                      }
                    />
                    <Label htmlFor="excludeWeekends" className="cursor-pointer">
                      Exclude weekends
                    </Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={createConfiguration}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Bulk Generation
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="queue" className="space-y-4">
              {queue.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No items in queue. Create a bulk generation to get started.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {configs.map(config => {
                    const configItems = queue.filter(item => item.configId === config.id)
                    if (configItems.length === 0) return null
                    
                    return (
                      <Card key={config.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                              Batch #{config.id.slice(-6)}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                config.status === 'completed' ? 'default' :
                                config.status === 'running' ? 'secondary' :
                                config.status === 'failed' ? 'destructive' :
                                'outline'
                              }>
                                {config.status}
                              </Badge>
                              {config.status === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => startGeneration(config.id)}
                                  disabled={isGenerating}
                                >
                                  <PlayCircle className="h-4 w-4 mr-1" />
                                  Start
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteConfig(config.id)}
                                disabled={config.status === 'running'}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2 text-sm">
                              <Badge variant="outline">
                                {config.contentTypes.length} Content Types
                              </Badge>
                              <Badge variant="outline">
                                {config.personas.length} Personas
                              </Badge>
                              <Badge variant="outline">
                                {config.languages.length} Languages
                              </Badge>
                              <Badge variant="outline">
                                {config.progress.total} Total Items
                              </Badge>
                            </div>
                            
                            {config.status !== 'pending' && (
                              <div className="space-y-2">
                                <Progress 
                                  value={(config.progress.completed / config.progress.total) * 100} 
                                  className="h-2"
                                />
                                <div className="flex justify-between text-xs text-gray-500">
                                  <span>{config.progress.completed} completed</span>
                                  {config.progress.failed > 0 && (
                                    <span className="text-red-500">{config.progress.failed} failed</span>
                                  )}
                                  <span>{config.progress.total - config.progress.completed - config.progress.failed} remaining</span>
                                </div>
                              </div>
                            )}
                            
                            <details className="cursor-pointer">
                              <summary className="text-sm text-gray-600 hover:text-gray-800">
                                View items ({configItems.length})
                              </summary>
                              <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                                {configItems.map(item => (
                                  <div key={item.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                    <div>
                                      <span className="font-medium">{item.topic}</span>
                                      <span className="text-gray-500 ml-2">
                                        {getContentTypeName(item.contentTypeId)} • {getPersonaName(item.personaId)} • {item.language}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {item.status === 'generating' && <Loader2 className="h-3 w-3 animate-spin" />}
                                      {item.status === 'generated' && <CheckCircle className="h-3 w-3 text-green-600" />}
                                      {item.status === 'failed' && <XCircle className="h-3 w-3 text-red-600" />}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {configs.filter(c => c.status === 'completed' || c.status === 'failed').length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No completed generations yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {configs
                    .filter(c => c.status === 'completed' || c.status === 'failed')
                    .map(config => (
                      <Card key={config.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">
                              Batch #{config.id.slice(-6)}
                            </CardTitle>
                            <Badge variant={config.status === 'completed' ? 'default' : 'destructive'}>
                              {config.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <p className="text-gray-500">Total Items</p>
                              <p className="font-medium">{config.progress.total}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Completed</p>
                              <p className="font-medium text-green-600">{config.progress.completed}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Failed</p>
                              <p className="font-medium text-red-600">{config.progress.failed}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Success Rate</p>
                              <p className="font-medium">
                                {Math.round((config.progress.completed / config.progress.total) * 100)}%
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}