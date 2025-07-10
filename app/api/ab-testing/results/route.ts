import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const authSupabase = createClient()
    const { searchParams } = new URL(request.url)
    const experimentId = searchParams.get('experimentId')

    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 },
      )
    }

    const token = authHeader.split(' ')[1]
    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await authSupabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    if (!experimentId) {
      return NextResponse.json(
        { error: 'experimentId is required' },
        { status: 400 },
      )
    }

    // Use a service role client for admin-level database operations
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    await supabaseAdmin.rpc('refresh_ab_experiment_results')

    const { data: rawResults, error: resultsError } = await supabaseAdmin
      .from('ab_experiment_results')
      .select('*')
      .eq('experiment_id', experimentId)

    if (resultsError) {
      console.error('Error fetching results:', resultsError)
      return NextResponse.json(
        { error: 'Failed to fetch results' },
        { status: 500 },
      )
    }

    const { data: experiment, error: experimentError } = await supabaseAdmin
      .from('ab_experiments')
      .select('id, name, description, status, ab_variants ( name, is_control )')
      .eq('id', experimentId)
      .single()

    if (experimentError) {
      console.error('Error fetching experiment:', experimentError)
      return NextResponse.json(
        { error: 'Failed to fetch experiment' },
        { status: 500 },
      )
    }
    
    const controlVariant = experiment.ab_variants.find(v => v.is_control);
    const controlResult = rawResults.find(r => r.variant_name === controlVariant?.name);

    if (!controlResult) {
       return NextResponse.json({
         experiment,
         results: [],
         statisticalSignificance: {
           summary: 'Not enough data to compute significance.'
         },
         timeSeries: [],
       });
    }

    const otherVariant = experiment.ab_variants.find(v => !v.is_control);
    const otherResult = rawResults.find(r => r.variant_name === otherVariant?.name);

    let significance = {}
    if (controlResult && otherResult) {
        const { data, error } = await supabaseAdmin.rpc('calculate_statistical_significance', {
            control_conversions: controlResult.conversions || 0,
            control_exposures: controlResult.visitors || 0,
            variant_conversions: otherResult.conversions || 0,
            variant_exposures: otherResult.visitors || 0
        });

        if (error) {
            console.error('Error calculating significance:', error);
        } else {
            significance = data;
        }
    }

    const { data: timeSeriesRaw, error: timeSeriesError } = await supabaseAdmin
        .rpc('get_daily_conversion_rates', { p_experiment_id: experimentId });

    if (timeSeriesError) {
        console.error('Error fetching time series data:', timeSeriesError);
    }
    
    const response = {
      experiment,
      results: rawResults,
      statisticalSignificance: significance,
      timeSeries: timeSeriesRaw || [],
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in GET /api/ab-testing/results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
} 