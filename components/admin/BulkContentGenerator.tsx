'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Plus, Trash2, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import type { Database } from '@/types/database'

type AIPersona = Database['public']['Tables']['ai_personas']['Row']

interface ContentItem {
  id: string
  topic: string
  keywords: string[]
  targetAudience: string
  personaId: string
  contentType: 'blog' | 'social' | 'email'
  scheduledDate?: string
  scheduledTime?: string
  status: 'pending' | 'generating' | 'generated' | 'failed'
  result?: any
}

export default function BulkContentGenerator() {
  const [personas, setPersonas] = useState<AIPersona[]>([])
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentGeneratingId, setCurrentGeneratingId] = useState<string | null>(null)
  
  // Form state for adding new items
  const [newItem, setNewItem] = useState({
    topic: '',
    keywords: '',
    targetAudience: '',
    personaId: '',
    contentType: 'blog' as const,
    scheduledDate: '',
    scheduledTime: '09:00'
  })

  const supabase = createClient()

  // Load personas on mount
  useState(() => {
    loadPersonas()
  })

  async function loadPersonas() {
    try {
      const { data, error } = await supabase
        .from('ai_personas')
        .select('*')
        .eq('active', true)
        .order('name')

      if (error) throw error
      setPersonas(data || [])
    } catch (error) {
      console.error('Error loading personas:', error)
      toast({
        title: 'Error',
        description: 'Failed to load AI personas',
        variant: 'destructive'
      })
    }
  }

  function addContentItem() {
    if (!newItem.topic || !newItem.personaId) {
      toast({
        title: 'Error',
        description: 'Topic and persona are required',
        variant: 'destructive'
      })
      return
    }

    const item: ContentItem = {
      id: Date.now().toString(),
      topic: newItem.topic,
      keywords: newItem.keywords.split(',').map(k => k.trim()).filter(k => k),
      targetAudience: newItem.targetAudience,
      personaId: newItem.personaId,
      contentType: newItem.contentType,
      scheduledDate: newItem.scheduledDate,
      scheduledTime: newItem.scheduledTime,
      status: 'pending'
    }

    setContentItems([...contentItems, item])
    
    // Reset form
    setNewItem({
      topic: '',
      keywords: '',
      targetAudience: '',
      personaId: newItem.personaId, // Keep persona selected
      contentType: 'blog',
      scheduledDate: newItem.scheduledDate, // Keep date
      scheduledTime: '09:00'
    })
  }

  function removeContentItem(id: string) {
    setContentItems(contentItems.filter(item => item.id !== id))
  }

  async function generateAllContent() {
    setIsGenerating(true)
    
    for (const item of contentItems) {
      if (item.status === 'generated') continue
      
      setCurrentGeneratingId(item.id)
      
      // Update status to generating
      setContentItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, status: 'generating' as const } : i
      ))
      
      try {
        const response = await fetch('/api/ai/generate-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({
            personaId: item.personaId,
            topic: item.topic,
            keywords: item.keywords,
            targetAudience: item.targetAudience,
            contentType: item.contentType,
            locale: 'en'
          })
        })

        if (!response.ok) throw new Error('Failed to generate content')
        
        const result = await response.json()
        
        // Update status to generated and store result
        setContentItems(prev => prev.map(i => 
          i.id === item.id ? { ...i, status: 'generated' as const, result: result.content } : i
        ))
        
        // If scheduled, create calendar entry and post
        if (item.scheduledDate && result.content) {
          await createScheduledPost(item, result.content)
        }
        
      } catch (error) {
        console.error('Error generating content:', error)
        
        // Update status to failed
        setContentItems(prev => prev.map(i => 
          i.id === item.id ? { ...i, status: 'failed' as const } : i
        ))
      }
      
      // Small delay between generations
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    setIsGenerating(false)
    setCurrentGeneratingId(null)
    
    const successCount = contentItems.filter(i => i.status === 'generated').length
    toast({
      title: 'Bulk Generation Complete',
      description: `Successfully generated ${successCount} out of ${contentItems.length} items`
    })
  }

  async function createScheduledPost(item: ContentItem, content: any) {
    try {
      // First create the post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          title: content.title,
          content: content.content,
          excerpt: content.excerpt,
          meta_description: content.meta_description,
          tags: content.tags,
          slug: content.slug,
          locale: content.locale || 'en',
          published: false,
          scheduled_publish_at: `${item.scheduledDate}T${item.scheduledTime}:00`,
          ai_persona_id: item.personaId,
          generation_prompt: item.topic,
          auto_generated: true,
          subject: 'generative-ai'
        })
        .select()
        .single()

      if (postError) throw postError
      
      // Then create calendar entry
      const { error: calendarError } = await supabase
        .from('content_calendar')
        .insert({
          date: item.scheduledDate,
          time_slot: `${item.scheduledTime}:00`,
          topic: item.topic,
          keywords: item.keywords,
          target_audience: item.targetAudience,
          persona_id: item.personaId,
          content_type: item.contentType,
          status: 'scheduled',
          post_id: post.id,
          locale: 'en'
        })

      if (calendarError) {
        console.error('Error creating calendar entry:', calendarError)
      }
    } catch (error) {
      console.error('Error creating scheduled post:', error)
    }
  }

  function getPersonaName(personaId: string) {
    return personas.find(p => p.id === personaId)?.name || 'Unknown'
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'generating':
        return <Clock className="h-4 w-4 animate-spin" />
      case 'generated':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bulk Content Generator</h2>
        <p className="text-muted-foreground">Generate multiple content pieces at once</p>
      </div>

      {/* Add new content item form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Content to Generate</CardTitle>
          <CardDescription>
            Add multiple topics and generate them all at once
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={newItem.topic}
                onChange={(e) => setNewItem({ ...newItem, topic: e.target.value })}
                placeholder="What should the content be about?"
                onKeyPress={(e) => e.key === 'Enter' && addContentItem()}
              />
            </div>
            
            <div>
              <Label htmlFor="persona">Target Persona</Label>
              <Select
                value={newItem.personaId}
                onValueChange={(value) => setNewItem({ ...newItem, personaId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target user persona" />
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
              <Label htmlFor="keywords">Keywords (optional)</Label>
              <Input
                id="keywords"
                value={newItem.keywords}
                onChange={(e) => setNewItem({ ...newItem, keywords: e.target.value })}
                placeholder="SEO keywords, comma-separated"
              />
            </div>
            
            <div>
              <Label htmlFor="targetAudience">Target Audience (optional)</Label>
              <Input
                id="targetAudience"
                value={newItem.targetAudience}
                onChange={(e) => setNewItem({ ...newItem, targetAudience: e.target.value })}
                placeholder="Who is this for?"
              />
            </div>
            
            <div>
              <Label htmlFor="contentType">Content Type</Label>
              <Select
                value={newItem.contentType}
                onValueChange={(value: any) => setNewItem({ ...newItem, contentType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog">Blog Post</SelectItem>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="scheduledDate">Schedule Date (optional)</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={newItem.scheduledDate}
                onChange={(e) => setNewItem({ ...newItem, scheduledDate: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="scheduledTime">Schedule Time</Label>
              <Input
                id="scheduledTime"
                type="time"
                value={newItem.scheduledTime}
                onChange={(e) => setNewItem({ ...newItem, scheduledTime: e.target.value })}
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={addContentItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add to Queue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content queue */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Content Queue ({contentItems.length})</CardTitle>
              <CardDescription>
                Review and generate all content at once
              </CardDescription>
            </div>
            {contentItems.length > 0 && (
              <Button 
                onClick={generateAllContent} 
                disabled={isGenerating}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate All'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] pr-4 overflow-y-auto">
            {contentItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No content items added yet. Add some topics above to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {contentItems.map((item) => (
                  <div
                    key={item.id}
                    className={`
                      p-4 border rounded-lg space-y-2
                      ${currentGeneratingId === item.id ? 'border-blue-500 bg-blue-50' : ''}
                      ${item.status === 'generated' ? 'bg-green-50' : ''}
                      ${item.status === 'failed' ? 'bg-red-50' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(item.status)}
                          <h4 className="font-medium">{item.topic}</h4>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <Badge variant="outline">{getPersonaName(item.personaId)}</Badge>
                          <Badge variant="outline">{item.contentType}</Badge>
                          {item.scheduledDate && (
                            <Badge variant="outline">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(item.scheduledDate), 'MMM d')} at {item.scheduledTime}
                            </Badge>
                          )}
                        </div>
                        {item.keywords.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Keywords: {item.keywords.join(', ')}
                          </p>
                        )}
                        {item.targetAudience && (
                          <p className="text-sm text-muted-foreground">
                            Audience: {item.targetAudience}
                          </p>
                        )}
                      </div>
                      {item.status === 'pending' && !isGenerating && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeContentItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    {item.status === 'generated' && item.result && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm font-medium text-green-700">
                          ✓ Generated: {item.result.title || 'Content ready'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        {contentItems.length > 0 && (
          <CardFooter>
            <div className="text-sm text-muted-foreground">
              {contentItems.filter(i => i.status === 'generated').length} generated,{' '}
              {contentItems.filter(i => i.status === 'pending').length} pending,{' '}
              {contentItems.filter(i => i.status === 'failed').length} failed
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}