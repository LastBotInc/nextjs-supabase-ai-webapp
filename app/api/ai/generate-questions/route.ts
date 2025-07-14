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
    console.log('\n❓ [POST /api/ai/generate-questions] Generating questions for persona')

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

    // Create a service role client for database operations to bypass RLS
    const serviceClient = await createClient(undefined, true)

    const { personaId, count = 50 } = await request.json()

    if (!personaId) {
      return NextResponse.json(
        { error: 'Persona ID is required' },
        { status: 400 }
      )
    }

    // 3. Fetch persona details using service client
    const { data: persona, error: personaError } = await serviceClient
      .from('ai_personas')
      .select('*')
      .eq('id', personaId)
      .single()

    if (personaError || !persona) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      )
    }

    // 4. Fetch existing questions for this persona to avoid duplicates
    const { data: existingQuestions } = await serviceClient
      .from('persona_queries')
      .select('query')
      .eq('persona_id', personaId)
    
    const existingQueries = existingQuestions?.map(q => q.query) || []

    // 5. Generate questions based on persona
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              query: { type: Type.STRING },
              intent: { type: Type.STRING },
              expectedContentType: { type: Type.STRING },
              priority: { type: Type.NUMBER }
            }
          }
        }
      },
      required: ["questions"]
    }

    const personaTraits = persona.personality_traits || {}
    const demographics = personaTraits.demographics || {}
    const goals = personaTraits.goals || []
    const painPoints = personaTraits.painPoints || []

    const prompt = `Based on the following user persona, generate ${count} typical questions they would ask when searching for AI solutions and services.

Persona: ${persona.name}
Description: ${persona.description}
Occupation: ${demographics.occupation || 'Business professional'}
Industry: ${demographics.industry || 'General business'}
Tech Savviness: ${demographics.techSavviness || 'Moderate'}

Their Goals:
${goals.join('\n')}

Their Pain Points:
${painPoints.join('\n')}

CRITICAL REQUIREMENTS:
- Each question MUST be maximum 2 sentences long
- Keep questions concise and focused
- Make them natural search queries or brief questions
- DO NOT duplicate any of these existing questions:
${existingQueries.length > 0 ? existingQueries.map(q => `  - "${q}"`).join('\n') : '  (No existing questions yet)'}

Generate realistic questions this persona would:
1. Type into Google when searching for solutions
2. Ask during a sales call or consultation
3. Need answered before making a purchase decision

For each question, provide:
- query: The actual question or search query (MAX 2 SENTENCES)
- intent: The underlying intent (informational, commercial, transactional, navigational)
- expectedContentType: What type of content would best answer this (blog, landing, case-study, demo, pricing)
- priority: 1-10 score based on how critical this question is to their decision-making

Mix different types of questions:
- General information seeking ("How does AI help marketing agencies?")
- Specific feature inquiries ("Does your AI tool integrate with HubSpot?")
- Pricing and ROI questions ("What's the ROI of AI for agencies?")
- Implementation questions ("How long does AI implementation take?")
- Security questions ("Is client data secure with AI tools?")
- Comparison questions ("ChatGPT vs Claude for marketing?")
- Support questions ("Do you offer AI training for teams?")

Examples of good questions:
- "How can AI help marketing agencies without losing creativity?"
- "What's the typical ROI for AI in mid-sized agencies?"
- "Best AI tools for content generation that maintain brand voice?"
- "How to implement AI without disrupting team workflows?"
- "AI pricing models for 50-person marketing teams?"

Remember: MAXIMUM 2 SENTENCES per question. Keep them short and focused.`

    console.log('🤖 Generating questions with Gemini...')

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-05-20',
      contents: prompt,
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

    const generatedData = JSON.parse(text)

    // 6. Save questions to database
    const questionsToSave = generatedData.questions.map((q: any) => ({
      persona_id: personaId,
      query: q.query,
      intent: q.intent,
      expected_content_type: q.expectedContentType,
      priority: q.priority
    }))

    const { data: savedQuestions, error: saveError } = await serviceClient
      .from('persona_queries')
      .insert(questionsToSave)
      .select()

    if (saveError) {
      console.error('Error saving questions:', saveError)
      // Return generated data even if save fails
      return NextResponse.json({
        success: true,
        questions: generatedData.questions,
        saved: false,
        error: saveError.message
      })
    }

    console.log('✅ Generated and saved', savedQuestions?.length || 0, 'questions for persona')
    
    return NextResponse.json({
      success: true,
      questions: generatedData.questions,
      saved: true,
      count: savedQuestions?.length || 0
    })

  } catch (error: Error | unknown) {
    console.error('❌ Question generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate questions'
    return NextResponse.json(
      { error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error' },
      { status: 500 }
    )
  }
}