import { NextResponse } from 'next/server'
import { GoogleGenAI, Type } from '@google/genai'
import { createClient } from '@/utils/supabase/server'

const API_KEY = process.env.GOOGLE_AI_STUDIO_KEY

if (!API_KEY) {
  throw new Error('GOOGLE_AI_STUDIO_KEY is not set')
}

const ai = new GoogleGenAI({ apiKey: API_KEY })

export async function POST(request: Request) {
  try {
    console.log('\n📅 [POST /api/ai/generate-calendar] Content calendar generation request')

    // 1. Authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const authClient = await createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser(authHeader.split(' ')[1])
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Admin verification
    const { data: profile } = await authClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Create a service role client for database operations
    const serviceClient = await createClient(undefined, true)

    const { 
      startDate,
      endDate,
      frequency = 'daily', // daily, weekly, bi-weekly
      personaIds = [],
      contentTypes = ['blog'],
      locale = 'en',
      businessGoals = '',
      excludeWeekends = true
    } = await request.json()

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      )
    }

    // 3. Fetch active personas using service client
    let personas = []
    if (personaIds.length > 0) {
      const { data: selectedPersonas } = await serviceClient
        .from('ai_personas')
        .select('*')
        .in('id', personaIds)
        .eq('active', true)
      
      personas = selectedPersonas || []
    } else {
      // If no personas specified, get all active personas
      const { data: allPersonas } = await serviceClient
        .from('ai_personas')
        .select('*')
        .eq('active', true)
      
      personas = allPersonas || []
    }

    if (personas.length === 0) {
      return NextResponse.json(
        { error: 'No active personas found' },
        { status: 400 }
      )
    }

    // 4. Fetch persona queries to understand what questions they answer
    const personaIdsForQueries = personas.map(p => p.id)
    const { data: personaQueries } = await serviceClient
      .from('persona_queries')
      .select('*')
      .in('persona_id', personaIdsForQueries)
      .order('priority', { ascending: false })

    // 5. Build content calendar generation prompt
    const personaDescriptions = personas.map(p => {
      const traits = p.personality_traits as any || {}
      const demographics = traits.demographics || {}
      return `- ${p.name}: ${p.description} (${demographics.occupation || 'Professional'} in ${demographics.industry || 'Industry'}. Pain points: ${p.topics.join(', ')})`
    }).join('\n')

    const queriesByPersona = personas.map(p => {
      const queries = personaQueries?.filter(q => q.persona_id === p.id) || []
      const queryList = queries.slice(0, 5).map(q => `"${q.query}"`).join(', ')
      return `- ${p.name} typically searches for: ${queryList || 'General business solutions'}`
    }).join('\n')

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        calendar: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              topic: { type: Type.STRING },
              keywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              targetAudience: { type: Type.STRING },
              personaId: { type: Type.STRING },
              personaName: { type: Type.STRING },
              contentType: { type: Type.STRING },
              searchIntent: { type: Type.STRING },
              estimatedSearchVolume: { type: Type.STRING }
            }
          }
        },
        summary: { type: Type.STRING }
      },
      required: ["calendar", "summary"]
    }

    const calendarPrompt = `Generate a content calendar from ${startDate} to ${endDate} with ${frequency} posting frequency.

Target User Personas:
${personaDescriptions}

What These Users Search For:
${queriesByPersona}

Business Goals: ${businessGoals || 'Build authority and engage target audience'}
Content Types: ${contentTypes.join(', ')}
Language: ${locale === 'fi' ? 'Finnish market' : locale === 'sv' ? 'Swedish market' : 'English market'}
${excludeWeekends ? 'Exclude weekends from the calendar' : 'Include weekends'}

For each content piece, provide:
1. Date (YYYY-MM-DD format)
2. Topic (specific and actionable, addressing a real user need)
3. Keywords (3-5 SEO keywords/phrases the persona would actually search for)
4. Target audience description (which persona this is for)
5. Best persona ID and name (who is this content targeting)
6. Content type (from available types)
7. Search intent (informational, transactional, navigational, commercial)
8. Estimated search volume (high, medium, low)

Important guidelines:
- Base topics on actual questions and pain points of the personas
- Use natural language that matches how these personas would search
- Each piece should solve a specific problem the persona faces
- Vary content for different personas throughout the month
- Consider the persona's technical level and industry when choosing topics
- Mix educational content, case studies, and solution-focused pieces
- Ensure topics directly address the persona's goals and challenges

Also provide a summary of the content strategy.`

    // 6. Generate content calendar with Gemini
    console.log('🤖 Generating content calendar...')

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-05-20',
      contents: calendarPrompt,
      config: {
        temperature: 0.8,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
        responseSchema: responseSchema
      }
    })

    const text = response.text
    if (!text) {
      throw new Error('Empty response from Gemini API')
    }

    const generatedCalendar = JSON.parse(text)

    // 7. Validate persona IDs and map to actual persona IDs
    const validCalendar = generatedCalendar.calendar.map((item: any) => {
      // Find the matching persona by name (since AI might not know exact IDs)
      const matchingPersona = personas.find(p => 
        p.name.toLowerCase() === item.personaName?.toLowerCase() ||
        p.id === item.personaId
      )
      
      return {
        ...item,
        personaId: matchingPersona?.id || personas[0].id, // Fallback to first persona
        personaName: matchingPersona?.name || personas[0].name
      }
    })

    // 8. Save calendar entries to database
    const calendarEntries = validCalendar.map((item: any) => ({
      date: item.date,
      topic: item.topic,
      keywords: item.keywords,
      target_audience: item.targetAudience,
      persona_id: item.personaId,
      content_type: item.contentType,
      status: 'planned',
      locale,
      notes: `Search Intent: ${item.searchIntent}, Est. Volume: ${item.estimatedSearchVolume}`,
      created_by: user.id
    }))

    // Insert in batches to avoid conflicts using service client
    const { error: insertError } = await serviceClient
      .from('content_calendar')
      .insert(calendarEntries)

    if (insertError) {
      console.error('Error saving calendar entries:', insertError)
      // Continue even if some entries fail (might be duplicates)
    }

    console.log('✅ Content calendar generated successfully')
    
    return NextResponse.json({
      success: true,
      calendar: validCalendar,
      summary: generatedCalendar.summary,
      totalEntries: validCalendar.length,
      personas: personas.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description
      }))
    })

  } catch (error: Error | unknown) {
    console.error('❌ Calendar generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate calendar'
    return NextResponse.json(
      { error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error' },
      { status: 500 }
    )
  }
}