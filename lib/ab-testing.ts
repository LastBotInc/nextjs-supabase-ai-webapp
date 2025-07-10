import { createClient } from '@/utils/supabase/client'
import { trackCustomEvent } from './analytics'

// Types for A/B testing
export interface ABExperiment {
  id: string
  name: string
  description?: string
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived'
  traffic_allocation: number
  target_pages?: string[]
  primary_goal: string
  variants: ABVariant[]
}

export interface ABVariant {
  id: string
  experiment_id: string
  name: string
  description?: string
  is_control: boolean
  traffic_weight: number
  config: Record<string, any>
}

export interface ABAssignment {
  id: string
  experiment_id: string
  variant_id: string
  user_id?: string
  session_id?: string
  fingerprint?: string
  assigned_at: string
  first_exposure_at?: string
  last_exposure_at?: string
  exposure_count: number
}

export interface ABEvent {
  experiment_id: string
  variant_id: string
  assignment_id: string
  event_type: 'exposure' | 'conversion' | 'custom'
  event_name?: string
  event_value?: number
  event_properties?: Record<string, any>
  page_url?: string
  page_title?: string
}

// A/B Testing Manager Class
export class ABTestingManager {
  private supabase = createClient()
  private assignments: Map<string, ABAssignment> = new Map()
  private experiments: Map<string, ABExperiment> = new Map()
  private sessionId: string
  private fingerprint: string
  private userId?: string

  constructor() {
    this.sessionId = this.getOrCreateSessionId()
    this.fingerprint = this.generateFingerprint()
    this.initializeUser()
  }

  // Initialize user context
  private async initializeUser() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      this.userId = user?.id
    } catch (error) {
      console.warn('Failed to get user context:', error)
    }
  }

  // Generate or retrieve session ID
  private getOrCreateSessionId(): string {
    const existing = sessionStorage.getItem('ab_session_id')
    if (existing) return existing
    
    const newSessionId = crypto.randomUUID()
    sessionStorage.setItem('ab_session_id', newSessionId)
    return newSessionId
  }

  // Generate browser fingerprint for consistent assignment
  private generateFingerprint(): string {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx!.textBaseline = 'top'
    ctx!.font = '14px Arial'
    ctx!.fillText('AB Testing Fingerprint', 2, 2)
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|')
    
    // Simple hash function
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36)
  }

  // Load active experiments
  async loadExperiments(): Promise<void> {
    try {
      const { data: experiments, error } = await this.supabase
        .from('ab_experiments')
        .select(`
          *,
          variants:ab_variants(*)
        `)
        .eq('status', 'running')

      if (error) throw error

      experiments?.forEach((exp: any) => {
        this.experiments.set(exp.id, exp as ABExperiment)
      })
    } catch (error) {
      console.error('Failed to load experiments:', error)
    }
  }

  // Check if user should be included in experiment
  private shouldIncludeUser(experiment: ABExperiment): boolean {
    // Check traffic allocation
    if (Math.random() * 100 > experiment.traffic_allocation) {
      return false
    }

    // Check page targeting
    if (experiment.target_pages && experiment.target_pages.length > 0) {
      const currentPath = window.location.pathname
      const matchesPage = experiment.target_pages.some(page => 
        currentPath === page || currentPath.startsWith(page)
      )
      if (!matchesPage) return false
    }

    // Additional targeting logic can be added here
    return true
  }

  // Assign user to variant using consistent hashing
  private assignToVariant(experiment: ABExperiment): ABVariant | null {
    const variants = experiment.variants.filter(v => v.traffic_weight > 0)
    if (variants.length === 0) return null

    // Use fingerprint + experiment ID for consistent assignment
    const hashInput = `${this.fingerprint}-${experiment.id}`
    let hash = 0
    for (let i = 0; i < hashInput.length; i++) {
      hash = ((hash << 5) - hash) + hashInput.charCodeAt(i)
      hash = hash & hash
    }
    
    const hashValue = Math.abs(hash) % 100
    let cumulativeWeight = 0
    
    for (const variant of variants) {
      cumulativeWeight += variant.traffic_weight
      if (hashValue < cumulativeWeight) {
        return variant
      }
    }
    
    return variants[0] // Fallback to first variant
  }

  // Get variant assignment for an experiment
  async getVariant(experimentName: string): Promise<ABVariant | null> {
    try {
      // Find experiment by name
      const experiment = Array.from(this.experiments.values())
        .find(exp => exp.name === experimentName)
      
      if (!experiment) return null

      // Check if user should be included
      if (!this.shouldIncludeUser(experiment)) return null

      // Check for existing assignment
      const existingAssignment = this.assignments.get(experiment.id)
      if (existingAssignment) {
        const variant = experiment.variants.find(v => v.id === existingAssignment.variant_id)
        if (variant) {
          await this.trackExposure(experiment, variant, existingAssignment)
          return variant
        }
      }

      // Create new assignment
      const variant = this.assignToVariant(experiment)
      if (!variant) return null

      const assignment = await this.createAssignment(experiment, variant)
      if (assignment) {
        this.assignments.set(experiment.id, assignment)
        await this.trackExposure(experiment, variant, assignment)
        return variant
      }

      return null
    } catch (error) {
      console.error('Failed to get variant:', error)
      return null
    }
  }

  // Create assignment in database
  private async createAssignment(experiment: ABExperiment, variant: ABVariant): Promise<ABAssignment | null> {
    try {
      const assignmentData = {
        experiment_id: experiment.id,
        variant_id: variant.id,
        user_id: this.userId,
        session_id: this.sessionId,
        fingerprint: this.fingerprint,
        user_agent: navigator.userAgent,
        country: await this.getCountry(),
        language: navigator.language,
        referrer: document.referrer || null
      }

      const { data, error } = await this.supabase
        .from('ab_assignments')
        .insert(assignmentData)
        .select()
        .single()

      if (error) throw error
      return data as ABAssignment
    } catch (error) {
      console.error('Failed to create assignment:', error)
      return null
    }
  }

  // Track exposure event
  private async trackExposure(experiment: ABExperiment, variant: ABVariant, assignment: ABAssignment): Promise<void> {
    try {
      // Update assignment exposure
      const { error: updateError } = await this.supabase
        .from('ab_assignments')
        .update({
          last_exposure_at: new Date().toISOString(),
          exposure_count: assignment.exposure_count + 1,
          ...(assignment.first_exposure_at ? {} : { first_exposure_at: new Date().toISOString() })
        })
        .eq('id', assignment.id)

      if (updateError) throw updateError

      // Track exposure event
      await this.trackEvent({
        experiment_id: experiment.id,
        variant_id: variant.id,
        assignment_id: assignment.id,
        event_type: 'exposure',
        event_name: 'variant_exposure',
        page_url: window.location.href,
        page_title: document.title
      })
    } catch (error) {
      console.error('Failed to track exposure:', error)
    }
  }

  // Track conversion event
  async trackConversion(experimentName: string, conversionGoal: string, value?: number, properties?: Record<string, any>): Promise<void> {
    try {
      const experiment = Array.from(this.experiments.values())
        .find(exp => exp.name === experimentName)
      
      if (!experiment) return

      const assignment = this.assignments.get(experiment.id)
      if (!assignment) return

      const variant = experiment.variants.find(v => v.id === assignment.variant_id)
      if (!variant) return

      await this.trackEvent({
        experiment_id: experiment.id,
        variant_id: variant.id,
        assignment_id: assignment.id,
        event_type: 'conversion',
        event_name: conversionGoal,
        event_value: value,
        event_properties: properties,
        page_url: window.location.href,
        page_title: document.title
      })

      // Also track in general analytics
      await trackCustomEvent('ab_test_conversion', 'experiment', 'conversion', conversionGoal, {
        experiment_name: experimentName,
        variant_name: variant.name,
        conversion_goal: conversionGoal,
        value: value,
        ...properties
      })
    } catch (error) {
      console.error('Failed to track conversion:', error)
    }
  }

  // Track custom event
  async trackCustomEvent(experimentName: string, eventName: string, value?: number, properties?: Record<string, any>): Promise<void> {
    try {
      const experiment = Array.from(this.experiments.values())
        .find(exp => exp.name === experimentName)
      
      if (!experiment) return

      const assignment = this.assignments.get(experiment.id)
      if (!assignment) return

      const variant = experiment.variants.find(v => v.id === assignment.variant_id)
      if (!variant) return

      await this.trackEvent({
        experiment_id: experiment.id,
        variant_id: variant.id,
        assignment_id: assignment.id,
        event_type: 'custom',
        event_name: eventName,
        event_value: value,
        event_properties: properties,
        page_url: window.location.href,
        page_title: document.title
      })
    } catch (error) {
      console.error('Failed to track custom event:', error)
    }
  }

  // Track event in database
  private async trackEvent(event: ABEvent): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('ab_events')
        .insert({
          ...event,
          user_id: this.userId,
          session_id: this.sessionId,
          timestamp: new Date().toISOString()
        })

      if (error) throw error
    } catch (error) {
      console.error('Failed to track event:', error)
    }
  }

  // Get user's country (simplified)
  private async getCountry(): Promise<string | null> {
    try {
      // This could be enhanced with a geolocation service
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      return timezone.split('/')[0] || null
    } catch {
      return null
    }
  }

  // Get variant configuration
  getVariantConfig(experimentName: string): Record<string, any> | null {
    const experiment = Array.from(this.experiments.values())
      .find(exp => exp.name === experimentName)
    
    if (!experiment) return null

    const assignment = this.assignments.get(experiment.id)
    if (!assignment) return null

    const variant = experiment.variants.find(v => v.id === assignment.variant_id)
    return variant?.config || null
  }

  // Check if user is in experiment
  isInExperiment(experimentName: string): boolean {
    const experiment = Array.from(this.experiments.values())
      .find(exp => exp.name === experimentName)
    
    return experiment ? this.assignments.has(experiment.id) : false
  }

  // Get variant name for experiment
  getVariantName(experimentName: string): string | null {
    const experiment = Array.from(this.experiments.values())
      .find(exp => exp.name === experimentName)
    
    if (!experiment) return null

    const assignment = this.assignments.get(experiment.id)
    if (!assignment) return null

    const variant = experiment.variants.find(v => v.id === assignment.variant_id)
    return variant?.name || null
  }
}

// Global instance
let abTestingManager: ABTestingManager | null = null

// Initialize A/B testing
export async function initializeABTesting(): Promise<ABTestingManager> {
  if (!abTestingManager) {
    abTestingManager = new ABTestingManager()
    await abTestingManager.loadExperiments()
  }
  return abTestingManager
}

// Convenience functions
export async function getVariant(experimentName: string): Promise<ABVariant | null> {
  const manager = await initializeABTesting()
  return manager.getVariant(experimentName)
}

export async function trackConversion(experimentName: string, conversionGoal: string, value?: number, properties?: Record<string, any>): Promise<void> {
  const manager = await initializeABTesting()
  return manager.trackConversion(experimentName, conversionGoal, value, properties)
}

export async function trackABCustomEvent(experimentName: string, eventName: string, value?: number, properties?: Record<string, any>): Promise<void> {
  const manager = await initializeABTesting()
  return manager.trackCustomEvent(experimentName, eventName, value, properties)
}

export async function getVariantConfig(experimentName: string): Promise<Record<string, any> | null> {
  const manager = await initializeABTesting()
  return manager.getVariantConfig(experimentName)
}

export async function isInExperiment(experimentName: string): Promise<boolean> {
  const manager = await initializeABTesting()
  return manager.isInExperiment(experimentName)
}

export async function getVariantName(experimentName: string): Promise<string | null> {
  const manager = await initializeABTesting()
  return manager.getVariantName(experimentName)
} 