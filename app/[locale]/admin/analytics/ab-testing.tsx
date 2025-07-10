'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/components/auth/AuthProvider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { 
  Target, 
  CheckCircle, 
  Percent, 
  Users, 
  ArrowRight, 
  Plus, 
  Play, 
  Pause, 
  Edit, 
  Trash2,
  Settings
} from 'lucide-react'

// Define types for our data to ensure type safety
interface Experiment {
  id: string
  name: string
  description: string
  hypothesis?: string
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived'
  traffic_allocation: number
  primary_goal?: string
  created_at: string
  ab_variants?: Variant[]
}

interface Variant {
  id: string
  experiment_id: string
  name: string
  description?: string
  is_control: boolean
  traffic_weight: number
  config: Record<string, any>
}

interface VariantResult {
  variant_name: string
  visitors: number
  conversions: number
  conversion_rate: number
}

interface StatisticalSignificance {
  z_score: number
  p_value: number
  is_significant: boolean
  winner: string | null
  confidence: string
  summary: string
}

interface ExperimentResults {
  experiment: Experiment
  results: VariantResult[]
  statisticalSignificance: StatisticalSignificance
  timeSeries: { date: string; control_cr: number; variant_a_cr: number }[]
}

interface NewExperiment {
  name: string
  description: string
  hypothesis: string
  primary_goal: string
  traffic_allocation: number
}

interface NewVariant {
  name: string
  description: string
  is_control: boolean
  traffic_weight: number
  config: Record<string, any>
}

const ABTestingDashboard = () => {
  const { session } = useAuth()
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [selectedExperimentId, setSelectedExperimentId] = useState<string | null>(null)
  const [results, setResults] = useState<ExperimentResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showVariantDialog, setShowVariantDialog] = useState(false)
  const [editingExperiment, setEditingExperiment] = useState<Experiment | null>(null)

  // Form states
  const [newExperiment, setNewExperiment] = useState<NewExperiment>({
    name: '',
    description: '',
    hypothesis: '',
    primary_goal: '',
    traffic_allocation: 100
  })
  const [newVariant, setNewVariant] = useState<NewVariant>({
    name: '',
    description: '',
    is_control: false,
    traffic_weight: 50,
    config: {}
  })
  const [variants, setVariants] = useState<NewVariant[]>([])

  const supabase = createClient()

  // Fetch all experiments
  const fetchExperiments = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('ab_experiments')
        .select(`
          id, name, description, hypothesis, status, traffic_allocation, 
          primary_goal, created_at,
          ab_variants (id, name, description, is_control, traffic_weight, config)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setExperiments(data || [])
      if (data && data.length > 0 && !selectedExperimentId) {
        setSelectedExperimentId(data[0].id)
      }
    } catch (err: any) {
      setError('Failed to fetch experiments. Please check your connection and permissions.')
      console.error('Error fetching experiments:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedExperimentId])

  // Fetch results for the selected experiment
  const fetchResults = useCallback(async () => {
    if (!selectedExperimentId || !session) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/ab-testing/results?experimentId=${selectedExperimentId}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch experiment results.')
      }

      const data = await response.json()
      setResults(data)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching results:', err)
      setResults(null)
    } finally {
      setLoading(false)
    }
  }, [selectedExperimentId, session])

  // Create new experiment
  const createExperiment = async () => {
    if (!session) return

    try {
      setLoading(true)
      const response = await fetch('/api/ab-testing/experiments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          ...newExperiment,
          variants: variants
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create experiment.')
      }

      const data = await response.json()
      setShowCreateDialog(false)
      setNewExperiment({
        name: '',
        description: '',
        hypothesis: '',
        primary_goal: '',
        traffic_allocation: 100
      })
      setVariants([])
      await fetchExperiments()
      setSelectedExperimentId(data.experiment.id)
    } catch (err: any) {
      setError(err.message)
      console.error('Error creating experiment:', err)
    } finally {
      setLoading(false)
    }
  }

  // Update experiment status
  const updateExperimentStatus = async (experimentId: string, status: string) => {
    if (!session) return

    try {
      setLoading(true)
      const { error } = await supabase
        .from('ab_experiments')
        .update({ status })
        .eq('id', experimentId)

      if (error) throw error
      await fetchExperiments()
      if (selectedExperimentId === experimentId) {
        await fetchResults()
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Error updating experiment status:', err)
    } finally {
      setLoading(false)
    }
  }

  // Delete experiment
  const deleteExperiment = async (experimentId: string) => {
    if (!session || !confirm('Are you sure you want to delete this experiment?')) return

    try {
      setLoading(true)
      const { error } = await supabase
        .from('ab_experiments')
        .delete()
        .eq('id', experimentId)

      if (error) throw error
      await fetchExperiments()
      if (selectedExperimentId === experimentId) {
        setSelectedExperimentId(experiments[0]?.id || null)
        setResults(null)
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Error deleting experiment:', err)
    } finally {
      setLoading(false)
    }
  }

  // Add variant to new experiment
  const addVariant = () => {
    if (!newVariant.name) return
    setVariants([...variants, newVariant])
    setNewVariant({
      name: '',
      description: '',
      is_control: false,
      traffic_weight: 50,
      config: {}
    })
    setShowVariantDialog(false)
  }

  // Remove variant from new experiment
  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  useEffect(() => {
    fetchExperiments()
  }, [])

  useEffect(() => {
    if (selectedExperimentId && session) {
      fetchResults()
    }
  }, [selectedExperimentId, session, fetchResults])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">A/B Testing Dashboard</h1>
          <p className="text-gray-400">
            Create, manage, and analyze A/B test experiments.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                New Experiment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-gray-800 text-white">
              <DialogHeader>
                <DialogTitle>Create New A/B Test Experiment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input
                    value={newExperiment.name}
                    onChange={(e) => setNewExperiment({ ...newExperiment, name: e.target.value })}
                    placeholder="e.g., Homepage Button Color Test"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={newExperiment.description}
                    onChange={(e) => setNewExperiment({ ...newExperiment, description: e.target.value })}
                    placeholder="Brief description of what you're testing"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Hypothesis</label>
                  <Textarea
                    value={newExperiment.hypothesis}
                    onChange={(e) => setNewExperiment({ ...newExperiment, hypothesis: e.target.value })}
                    placeholder="What do you expect to happen and why?"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Goal</label>
                  <Input
                    value={newExperiment.primary_goal}
                    onChange={(e) => setNewExperiment({ ...newExperiment, primary_goal: e.target.value })}
                    placeholder="e.g., button_click, signup, purchase"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Traffic Allocation (%)</label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={newExperiment.traffic_allocation}
                    onChange={(e) => setNewExperiment({ ...newExperiment, traffic_allocation: parseInt(e.target.value) })}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Variants</h3>
                    <Dialog open={showVariantDialog} onOpenChange={setShowVariantDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Variant
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-800 text-white">
                        <DialogHeader>
                          <DialogTitle>Add Variant</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Name</label>
                            <Input
                              value={newVariant.name}
                              onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                              placeholder="e.g., Control, Variant A"
                              className="bg-gray-700 border-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <Input
                              value={newVariant.description}
                              onChange={(e) => setNewVariant({ ...newVariant, description: e.target.value })}
                              placeholder="Brief description of this variant"
                              className="bg-gray-700 border-gray-600"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Traffic Weight (%)</label>
                            <Input
                              type="number"
                              min="1"
                              max="100"
                              value={newVariant.traffic_weight}
                              onChange={(e) => setNewVariant({ ...newVariant, traffic_weight: parseInt(e.target.value) })}
                              className="bg-gray-700 border-gray-600"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="is_control"
                              checked={newVariant.is_control}
                              onChange={(e) => setNewVariant({ ...newVariant, is_control: e.target.checked })}
                              className="rounded"
                            />
                            <label htmlFor="is_control" className="text-sm font-medium">
                              This is the control variant
                            </label>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={addVariant} disabled={!newVariant.name}>
                            Add Variant
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {variants.length > 0 && (
                    <div className="space-y-2">
                      {variants.map((variant, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                          <div>
                            <span className="font-medium">{variant.name}</span>
                            {variant.is_control && (
                              <Badge className="ml-2 bg-blue-600">Control</Badge>
                            )}
                            <p className="text-sm text-gray-400">{variant.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{variant.traffic_weight}%</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeVariant(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={createExperiment}
                  disabled={!newExperiment.name || variants.length < 2 || loading}
                >
                  {loading ? 'Creating...' : 'Create Experiment'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <div className="w-full md:w-72">
            <Select
              onValueChange={setSelectedExperimentId}
              value={selectedExperimentId ?? ''}
              disabled={loading || experiments.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an experiment..." />
              </SelectTrigger>
              <SelectContent>
                {experiments.map(exp => (
                  <SelectItem key={exp.id} value={exp.id}>
                    {exp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Experiments List */}
      <Card className="bg-gray-800/50 border-gray-700 text-white">
        <CardHeader>
          <CardTitle>All Experiments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-800">
                <TableHead className="text-white">Name</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Variants</TableHead>
                <TableHead className="text-white">Traffic</TableHead>
                <TableHead className="text-white">Created</TableHead>
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experiments.map(experiment => (
                <TableRow
                  key={experiment.id}
                  className="border-gray-700 hover:bg-gray-800"
                >
                  <TableCell>
                    <div>
                      <div className="font-medium">{experiment.name}</div>
                      <div className="text-sm text-gray-400">{experiment.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        experiment.status === 'running'
                          ? 'bg-green-600'
                          : experiment.status === 'draft'
                          ? 'bg-gray-600'
                          : experiment.status === 'completed'
                          ? 'bg-blue-600'
                          : 'bg-yellow-600'
                      }
                    >
                      {experiment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{experiment.ab_variants?.length || 0}</TableCell>
                  <TableCell>{experiment.traffic_allocation}%</TableCell>
                  <TableCell>
                    {new Date(experiment.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {experiment.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => updateExperimentStatus(experiment.id, 'running')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      {experiment.status === 'running' && (
                        <Button
                          size="sm"
                          onClick={() => updateExperimentStatus(experiment.id, 'paused')}
                          className="bg-yellow-600 hover:bg-yellow-700"
                        >
                          <Pause className="w-4 h-4" />
                        </Button>
                      )}
                      {experiment.status === 'paused' && (
                        <Button
                          size="sm"
                          onClick={() => updateExperimentStatus(experiment.id, 'running')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteExperiment(experiment.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}

      {!loading && results && (
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
          {/* Main Results Column */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-gray-800/50 border-gray-700 text-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{results.experiment.name}</span>
                  <Badge
                    className={
                      results.experiment.status === 'running'
                        ? 'bg-green-500'
                        : 'bg-gray-500'
                    }
                  >
                    {results.experiment.status}
                  </Badge>
                </CardTitle>
                <p className="text-gray-400 pt-2">
                  {results.experiment.description}
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-800">
                      <TableHead className="text-white">Variant</TableHead>
                      <TableHead className="text-white">Visitors</TableHead>
                      <TableHead className="text-white">Conversions</TableHead>
                      <TableHead className="text-white">
                        Conversion Rate
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.results.map(variant => (
                      <TableRow
                        key={variant.variant_name}
                        className="border-gray-700 hover:bg-gray-800"
                      >
                        <TableCell>{variant.variant_name}</TableCell>
                        <TableCell>{variant.visitors}</TableCell>
                        <TableCell>{variant.conversions}</TableCell>
                        <TableCell>
                          {typeof variant.conversion_rate === 'number'
                            ? (variant.conversion_rate * 100).toFixed(2)
                            : '0.00'}
                          %
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 text-white">
              <CardHeader>
                <CardTitle>Conversion Rate Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={results.timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="control_cr"
                      stroke="#3B82F6"
                      name="Control CR"
                    />
                    <Line
                      type="monotone"
                      dataKey="variant_a_cr"
                      stroke="#10B981"
                      name="Variant A CR"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card className="bg-gray-800/50 border-gray-700 text-white">
              <CardHeader>
                <CardTitle>Statistical Significance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-yellow-900/20 rounded-lg">
                    <p className="text-yellow-400 font-semibold">
                      {results.statisticalSignificance.summary ||
                        'Not enough data to compute significance.'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Confidence</p>
                      <p className="font-bold text-lg">
                        {results.statisticalSignificance.confidence || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">P-value</p>
                      <p className="font-bold text-lg">
                        {results.statisticalSignificance.p_value?.toFixed(4) ?? 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Z-score</p>
                      <p className="font-bold text-lg">
                        {results.statisticalSignificance.z_score?.toFixed(4) ?? 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Winner</p>
                      <p className="font-bold text-lg">
                        {results.statisticalSignificance.winner || 'Inconclusive'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!loading && !results && selectedExperimentId && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Data Yet</h3>
            <p className="text-gray-400">
              This experiment hasn't collected any data yet. Start the experiment to begin tracking results.
            </p>
          </div>
        </div>
      )}

      {!loading && experiments.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Experiments</h3>
            <p className="text-gray-400 mb-4">
              Get started by creating your first A/B test experiment.
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Experiment
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ABTestingDashboard 