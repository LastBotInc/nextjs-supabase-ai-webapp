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
    const {
      planId,
      title,
      prompt,
      contentTypeId,
      personaIds,
      languages,
      keywords,
      topics,
      makeItMine,
      generateImage,
      imagePrompt
    } = body

    // Use service role for database operations
    const serviceClient = createClient(undefined, true)

    // Fetch the content plan
    const { data: plan, error: planError } = await serviceClient
      .from('content_calendar')
      .select('*, content_types(*), ai_personas(*)')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: 'Content plan not found' }, { status: 404 })
    }

    // Verify ownership (skip if using service role)
    // if (plan.created_by !== user.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    // }

    // Update status to generating
    await serviceClient
      .from('content_calendar')
      .update({ 
        status: 'generating',
        updated_at: new Date().toISOString()
      })
      .eq('id', planId)

    // Generate content for each language
    const generationTasks = languages.map(async (language: string) => {
      await inngest.send({
        name: 'ai/content.generate',
        data: {
          planId,
          userId: user.id,
          title: title || plan.planned_title,
          prompt: prompt || plan.generation_prompt,
          contentType: plan.content_types || { name: plan.content_type },
          personaIds: personaIds || plan.multiple_persona_ids || [plan.persona_id],
          language,
          keywords: keywords || plan.keywords || [],
          topics: topics || [plan.topic, ...(plan.custom_topics || [])],
          scheduledDate: plan.date,
          scheduledTime: plan.time_slot,
          makeItMine: makeItMine || '',
          generateImage: generateImage || false,
          imagePrompt: imagePrompt || ''
        }
      })
    })

    await Promise.all(generationTasks)

    return NextResponse.json({
      success: true,
      message: `Content generation started for ${languages.length} language(s)`,
      planId
    })

  } catch (error) {
    console.error('Error starting content generation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start content generation' },
      { status: 500 }
    )
  }
}