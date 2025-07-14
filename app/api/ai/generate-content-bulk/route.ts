import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { inngest } from '@/lib/inngest-client'

export async function POST(request: NextRequest) {
  try {
    // Check authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // Create regular client to verify the token
    const authClient = createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser(authHeader.split(' ')[1])
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planIds } = body

    if (!planIds || !Array.isArray(planIds) || planIds.length === 0) {
      return NextResponse.json({ error: 'No plan IDs provided' }, { status: 400 })
    }

    // Use service role client for database operations
    const serviceClient = createClient(undefined, true)

    // Fetch all content plans
    const { data: plans, error: plansError } = await serviceClient
      .from('content_calendar')
      .select('*, content_types(*), ai_personas(*)')
      .in('id', planIds)
      .in('status', ['planned', 'generating']) // Process both planned and generating (in case of retry)

    if (plansError || !plans || plans.length === 0) {
      return NextResponse.json({ error: 'No valid content plans found' }, { status: 404 })
    }

    // Update all plans to generating status
    await serviceClient
      .from('content_calendar')
      .update({ 
        status: 'generating',
        updated_at: new Date().toISOString()
      })
      .in('id', planIds)

    await inngest.send({
      name: 'ai/content.generate.bulk',
      data: {
        userId: user.id,
        plans: plans.map(plan => ({
          planId: plan.id,
          title: plan.planned_title || plan.topic,
          prompt: plan.generation_prompt,
          contentType: plan.content_types || { name: plan.content_type },
          personaIds: plan.multiple_persona_ids || [plan.persona_id],
          languages: plan.languages || [plan.locale],
          keywords: plan.keywords || [],
          topics: [plan.topic, ...(plan.custom_topics || [])],
          scheduledDate: plan.date,
          scheduledTime: plan.time_slot,
          makeItMine: '',  // Can be customized per plan if needed
          generateImage: false,  // Can be enabled per plan if needed
          imagePrompt: ''  // Can be customized per plan if needed
        }))
      }
    })

    return NextResponse.json({
      success: true,
      message: `Bulk content generation started for ${plans.length} plan(s)`,
      plansProcessed: plans.length
    })

  } catch (error) {
    console.error('Error starting bulk content generation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start bulk content generation' },
      { status: 500 }
    )
  }
}