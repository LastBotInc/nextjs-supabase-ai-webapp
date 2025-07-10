import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const authSupabase = createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'running'
    
    // Get user session from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await authSupabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await authSupabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Use service role client for database operations
    const supabase = createAdminClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch experiments with variants
    const { data: experiments, error } = await supabase
      .from('ab_experiments')
      .select(`
        *,
        variants:ab_variants(*),
        created_by:profiles!ab_experiments_created_by_fkey(
          id,
          name,
          email
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching experiments:', error)
      return NextResponse.json({ error: 'Failed to fetch experiments' }, { status: 500 })
    }

    return NextResponse.json({ experiments })
  } catch (error) {
    console.error('Error in GET /api/ab-testing/experiments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authSupabase = createClient()
    const body = await request.json()
    
    // Get user session from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await authSupabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await authSupabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Use service role client for database operations
    const supabase = createAdminClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const {
      name,
      description,
      hypothesis,
      traffic_allocation = 100,
      target_pages,
      target_audiences,
      exclude_audiences,
      primary_goal,
      secondary_goals,
      minimum_sample_size = 1000,
      confidence_level = 95.0,
      variants = []
    } = body

    // Validate required fields
    if (!name || !primary_goal) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, primary_goal' 
      }, { status: 400 })
    }

    // Validate variants
    if (variants.length < 2) {
      return NextResponse.json({ 
        error: 'At least 2 variants are required' 
      }, { status: 400 })
    }

    // Check if at least one variant is marked as control
    const hasControl = variants.some((v: any) => v.is_control)
    if (!hasControl) {
      return NextResponse.json({ 
        error: 'At least one variant must be marked as control' 
      }, { status: 400 })
    }

    // Validate traffic weights sum to 100
    const totalWeight = variants.reduce((sum: number, v: any) => sum + (v.traffic_weight || 0), 0)
    if (totalWeight !== 100) {
      return NextResponse.json({ 
        error: 'Variant traffic weights must sum to 100' 
      }, { status: 400 })
    }

    // Create experiment
    const { data: experiment, error: experimentError } = await supabase
      .from('ab_experiments')
      .insert({
        name,
        description,
        hypothesis,
        traffic_allocation,
        target_pages,
        target_audiences,
        exclude_audiences,
        primary_goal,
        secondary_goals,
        minimum_sample_size,
        confidence_level,
        created_by: user.id,
        status: 'draft'
      })
      .select()
      .single()

    if (experimentError) {
      console.error('Error creating experiment:', experimentError)
      return NextResponse.json({ error: 'Failed to create experiment' }, { status: 500 })
    }

    // Create variants
    const variantData = variants.map((variant: any) => ({
      experiment_id: experiment.id,
      name: variant.name,
      description: variant.description,
      is_control: variant.is_control,
      traffic_weight: variant.traffic_weight,
      config: variant.config || {}
    }))

    const { data: createdVariants, error: variantsError } = await supabase
      .from('ab_variants')
      .insert(variantData)
      .select()

    if (variantsError) {
      console.error('Error creating variants:', variantsError)
      // Cleanup: delete the experiment if variants creation failed
      await supabase.from('ab_experiments').delete().eq('id', experiment.id)
      return NextResponse.json({ error: 'Failed to create variants' }, { status: 500 })
    }

    // Return complete experiment with variants
    const completeExperiment = {
      ...experiment,
      variants: createdVariants
    }

    return NextResponse.json({ 
      experiment: completeExperiment,
      message: 'Experiment created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/ab-testing/experiments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 