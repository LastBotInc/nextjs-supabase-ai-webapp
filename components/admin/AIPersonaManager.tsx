'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlusCircle, Edit2, Trash2, Sparkles, User, MessageSquare } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import type { Database } from '@/types/database'

type AIPersona = Database['public']['Tables']['ai_personas']['Row']
type PersonaQuery = Database['public']['Tables']['persona_queries']['Row']

export default function AIPersonaManager() {
  const [personas, setPersonas] = useState<AIPersona[]>([])
  const [personaQueries, setPersonaQueries] = useState<Record<string, PersonaQuery[]>>({})
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingPersona, setEditingPersona] = useState<AIPersona | null>(null)
  const [selectedPersona, setSelectedPersona] = useState<AIPersona | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    system_prompt: '',
    topics: [] as string[],
    active: true,
    personality_traits: {
      tone: 'professional',
      style: 'informative',
      expertise: 'expert'
    }
  })
  
  const [newQuery, setNewQuery] = useState({
    query: '',
    intent: '',
    expected_content_type: 'blog',
    priority: 0
  })

  const supabase = createClient()

  useEffect(() => {
    loadPersonas()
  }, [])

  async function generatePersonas() {
    setIsGenerating(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.access_token) {
        throw new Error('No session')
      }

      const response = await fetch('/api/ai/generate-personas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`
        },
        body: JSON.stringify({ count: 5 })
      })

      if (!response.ok) {
        throw new Error('Failed to generate personas')
      }

      const result = await response.json()
      
      toast({
        title: 'Success',
        description: `Generated ${result.count} user personas based on brand info`
      })
      
      loadPersonas()
    } catch (error) {
      console.error('Error generating personas:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate personas',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  async function generateQuestionsForPersona(personaId: string) {
    setIsGeneratingQuestions(true)
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.access_token) {
        throw new Error('No session')
      }

      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session.access_token}`
        },
        body: JSON.stringify({ personaId, count: 50 })
      })

      if (!response.ok) {
        throw new Error('Failed to generate questions')
      }

      const result = await response.json()
      
      toast({
        title: 'Success',
        description: `Generated ${result.count} questions for this persona`
      })
      
      loadPersonas()
    } catch (error) {
      console.error('Error generating questions:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate questions',
        variant: 'destructive'
      })
    } finally {
      setIsGeneratingQuestions(false)
    }
  }

  async function loadPersonas() {
    try {
      const { data, error } = await supabase
        .from('ai_personas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPersonas(data || [])
      
      // Load queries for each persona
      if (data && data.length > 0) {
        const queryPromises = data.map(async (persona) => {
          const { data: queries } = await supabase
            .from('persona_queries')
            .select('*')
            .eq('persona_id', persona.id)
            .order('priority', { ascending: false })
          
          return { personaId: persona.id, queries: queries || [] }
        })
        
        const allQueries = await Promise.all(queryPromises)
        const queryMap: Record<string, PersonaQuery[]> = {}
        allQueries.forEach(({ personaId, queries }) => {
          queryMap[personaId] = queries
        })
        setPersonaQueries(queryMap)
      }
    } catch (error) {
      console.error('Error loading personas:', error)
      toast({
        title: 'Error',
        description: 'Failed to load AI personas',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateOrUpdate() {
    try {
      const personaData = {
        name: formData.name,
        description: formData.description,
        system_prompt: formData.system_prompt,
        topics: formData.topics,
        active: formData.active,
        personality_traits: formData.personality_traits
      }

      if (editingPersona) {
        const { error } = await supabase
          .from('ai_personas')
          .update(personaData)
          .eq('id', editingPersona.id)

        if (error) throw error
        toast({
          title: 'Success',
          description: 'Persona updated successfully'
        })
      } else {
        const { error } = await supabase
          .from('ai_personas')
          .insert(personaData)

        if (error) throw error
        toast({
          title: 'Success',
          description: 'Persona created successfully'
        })
      }

      setIsCreateDialogOpen(false)
      setEditingPersona(null)
      resetForm()
      loadPersonas()
    } catch (error) {
      console.error('Error saving persona:', error)
      toast({
        title: 'Error',
        description: 'Failed to save persona',
        variant: 'destructive'
      })
    }
  }

  async function handleDelete(persona: AIPersona) {
    if (!confirm(`Are you sure you want to delete ${persona.name}?`)) return

    try {
      const { error } = await supabase
        .from('ai_personas')
        .delete()
        .eq('id', persona.id)

      if (error) throw error
      
      toast({
        title: 'Success',
        description: 'Persona deleted successfully'
      })
      loadPersonas()
    } catch (error) {
      console.error('Error deleting persona:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete persona',
        variant: 'destructive'
      })
    }
  }

  async function handleAddQuery() {
    if (!selectedPersona || !newQuery.query) return

    try {
      const { error } = await supabase
        .from('persona_queries')
        .insert({
          persona_id: selectedPersona.id,
          query: newQuery.query,
          intent: newQuery.intent,
          expected_content_type: newQuery.expected_content_type,
          priority: newQuery.priority
        })

      if (error) throw error
      
      toast({
        title: 'Success',
        description: 'Query added successfully'
      })
      
      setNewQuery({
        query: '',
        intent: '',
        expected_content_type: 'blog',
        priority: 0
      })
      
      loadPersonas()
    } catch (error) {
      console.error('Error adding query:', error)
      toast({
        title: 'Error',
        description: 'Failed to add query',
        variant: 'destructive'
      })
    }
  }

  async function handleDeleteQuery(queryId: string) {
    try {
      const { error } = await supabase
        .from('persona_queries')
        .delete()
        .eq('id', queryId)

      if (error) throw error
      
      loadPersonas()
    } catch (error) {
      console.error('Error deleting query:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete query',
        variant: 'destructive'
      })
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      description: '',
      system_prompt: '',
      topics: [],
      active: true,
      personality_traits: {
        tone: 'professional',
        style: 'informative',
        expertise: 'expert'
      }
    })
  }

  function openEditDialog(persona: AIPersona) {
    setEditingPersona(persona)
    setFormData({
      name: persona.name,
      description: persona.description,
      system_prompt: persona.system_prompt,
      topics: persona.topics,
      active: persona.active,
      personality_traits: persona.personality_traits as any || {
        tone: 'professional',
        style: 'informative',
        expertise: 'expert'
      }
    })
    setIsCreateDialogOpen(true)
  }

  if (loading) {
    return <div className="p-8">Loading personas...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Personas</h2>
          <p className="text-muted-foreground">Manage user personas for content strategy</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={generatePersonas}
            disabled={isGenerating}
            variant="outline"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate from Brand Info'}
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Persona
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {personas.map((persona) => (
          <Card key={persona.id} className={`${!persona.active ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <CardTitle className="text-lg">{persona.name}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEditDialog(persona)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(persona)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{persona.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm">Topics</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {persona.topics.map((topic, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Demographics</Label>
                  <div className="text-sm text-muted-foreground mt-1">
                    {persona.personality_traits && (persona.personality_traits as any).demographics && (
                      <>
                        {(persona.personality_traits as any).demographics.occupation || 'N/A'} in{' '}
                        {(persona.personality_traits as any).demographics.industry || 'N/A'}
                      </>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm">Typical Questions ({personaQueries[persona.id]?.length || 0})</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => setSelectedPersona(persona)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Manage Questions
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Status</Label>
                  <Badge variant={persona.active ? 'default' : 'secondary'}>
                    {persona.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPersona ? 'Edit Persona' : 'Create New User Persona'}
            </DialogTitle>
            <DialogDescription>
              Define the characteristics of your target user persona
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Tech Expert Sarah"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A brief description of this persona's expertise and style"
                rows={2}
              />
            </div>
            
            <div>
              <Label htmlFor="goals">Goals and Needs</Label>
              <Textarea
                id="goals"
                value={formData.system_prompt}
                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                placeholder="What are this persona's main goals and what solutions are they looking for?"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="topics">Pain Points / Challenges (comma-separated)</Label>
              <Input
                id="topics"
                value={formData.topics.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  topics: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                })}
                placeholder="e.g., Time constraints, Budget limitations, Technical complexity"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false)
              setEditingPersona(null)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrUpdate}>
              {editingPersona ? 'Update' : 'Create'} Persona
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Questions Dialog */}
      <Dialog open={!!selectedPersona} onOpenChange={() => setSelectedPersona(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manage Questions for {selectedPersona?.name}</DialogTitle>
            <DialogDescription>
              Define typical questions and queries this persona can answer
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2 mb-4">
              <Button
                onClick={() => selectedPersona && generateQuestionsForPersona(selectedPersona.id)}
                disabled={isGeneratingQuestions}
                variant="outline"
                className="w-full"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGeneratingQuestions ? 'Generating Questions...' : 'Generate Questions with AI'}
              </Button>
            </div>
            
            <div className="grid grid-cols-12 gap-2">
                <div className="col-span-6">
                  <Input
                    placeholder="Question or search query"
                    value={newQuery.query}
                    onChange={(e) => setNewQuery({ ...newQuery, query: e.target.value })}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    placeholder="Intent (optional)"
                    value={newQuery.intent}
                    onChange={(e) => setNewQuery({ ...newQuery, intent: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Priority"
                    value={newQuery.priority}
                    onChange={(e) => setNewQuery({ ...newQuery, priority: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="col-span-1">
                  <Button onClick={handleAddQuery} className="w-full">
                    Add
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedPersona && personaQueries[selectedPersona.id]?.map((query) => (
                <div key={query.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{query.query}</p>
                    {query.intent && (
                      <p className="text-sm text-muted-foreground">Intent: {query.intent}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Priority: {query.priority}</Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteQuery(query.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {selectedPersona && (!personaQueries[selectedPersona.id] || personaQueries[selectedPersona.id].length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  No questions added yet. Add some typical queries this persona can answer.
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPersona(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}