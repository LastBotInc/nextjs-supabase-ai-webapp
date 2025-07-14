import { NextResponse } from 'next/server'
import { GoogleGenAI, Type } from '@google/genai'
import { createClient } from '@/utils/supabase/server'
import { brandInfo } from '@/lib/brand-info'

const API_KEY = process.env.GOOGLE_AI_STUDIO_KEY

if (!API_KEY) {
  throw new Error('GOOGLE_AI_STUDIO_KEY is not set')
}

const ai = new GoogleGenAI({ apiKey: API_KEY })

export async function POST(request: Request) {
  try {
    console.log('\n🎭 [POST /api/ai/generate-personas] Generating user personas from brand info')

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

    // 2. Admin verification - First verify with the user's token
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

    const { count = 5 } = await request.json()

    // 3. Fetch existing personas to avoid duplicates
    const { data: existingPersonas } = await serviceClient
      .from('ai_personas')
      .select('name, description, personality_traits')
    
    const existingPersonaNames = existingPersonas?.map(p => p.name) || []
    const existingPersonaDescriptions = existingPersonas?.map(p => p.description) || []

    // 4. Generate personas based on brand info
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        personas: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              demographics: {
                type: Type.OBJECT,
                properties: {
                  age: { type: Type.STRING },
                  occupation: { type: Type.STRING },
                  industry: { type: Type.STRING },
                  techSavviness: { type: Type.STRING }
                }
              },
              goals: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              painPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              howTheyFindUs: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              personalityTraits: {
                type: Type.OBJECT,
                properties: {
                  decisionMaking: { type: Type.STRING },
                  communicationStyle: { type: Type.STRING },
                  buyingBehavior: { type: Type.STRING }
                }
              }
            }
          }
        }
      },
      required: ["personas"]
    }

    const prompt = `Based on the following brand information, generate ${count} detailed user personas who would be interested in our services.

Brand: ${brandInfo.name}
Description: ${brandInfo.description}

Our brand personality emphasizes: ${brandInfo.personality.primary.join(', ')}
We avoid being: ${brandInfo.personality.avoid.join(', ')}

IMPORTANT: We already have these personas, so DO NOT duplicate or create similar ones:
Existing persona names: ${existingPersonaNames.length > 0 ? existingPersonaNames.join(', ') : 'None yet'}
${existingPersonaDescriptions.length > 0 ? `Existing descriptions to avoid: ${existingPersonaDescriptions.map(d => d.substring(0, 50) + '...').join('; ')}` : ''}

Generate diverse NEW personas that represent different segments of our target audience. For each persona, include:
1. A realistic name and detailed description (MUST be different from existing ones)
2. Demographics (age range, occupation, industry, tech savviness level)
3. Their main goals related to AI and digital transformation
4. Pain points they're experiencing that we could solve
5. How they might discover our services (search terms, referrals, etc.)
6. Personality traits that affect their buying decisions

Make sure the personas are diverse in terms of:
- Company size (from startups to enterprises)
- Industries (avoid industries already covered by existing personas)
- Technical expertise levels
- Decision-making roles
- Geographic locations

Each persona should represent a real potential customer who would benefit from our AI-first, human-centric approach. Ensure they are distinctly different from any existing personas.`

    console.log('🤖 Generating user personas with Gemini...')

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

    // 5. Save personas to database
    const personasToSave = generatedData.personas.map((persona: any) => ({
      name: persona.name,
      description: persona.description,
      personality_traits: {
        demographics: persona.demographics,
        goals: persona.goals,
        painPoints: persona.painPoints,
        howTheyFindUs: persona.howTheyFindUs,
        personalityTraits: persona.personalityTraits
      },
      system_prompt: `You are ${persona.name}, ${persona.description}. Your goals include: ${persona.goals.join(', ')}. Your main challenges are: ${persona.painPoints.join(', ')}.`,
      topics: [...new Set([
        ...persona.goals.map((g: string) => g.split(' ').slice(0, 3).join(' ')),
        ...persona.painPoints.map((p: string) => p.split(' ').slice(0, 3).join(' '))
      ])].slice(0, 5),
      active: true,
      created_by: user.id
    }))

    // Insert all personas using service client to bypass RLS
    const { data: savedPersonas, error: saveError } = await serviceClient
      .from('ai_personas')
      .insert(personasToSave)
      .select()

    if (saveError) {
      console.error('Error saving personas:', saveError)
      // Return generated data even if save fails
      return NextResponse.json({
        success: true,
        personas: generatedData.personas,
        saved: false,
        error: saveError.message
      })
    }

    console.log('✅ Generated and saved', savedPersonas?.length || 0, 'user personas')
    
    return NextResponse.json({
      success: true,
      personas: generatedData.personas,
      saved: true,
      count: savedPersonas?.length || 0
    })

  } catch (error: Error | unknown) {
    console.error('❌ Persona generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate personas'
    return NextResponse.json(
      { error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error' },
      { status: 500 }
    )
  }
}