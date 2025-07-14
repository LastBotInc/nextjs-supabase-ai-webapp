import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenAI, Type } from '@google/genai'
import { eachDayOfInterval, isWeekend, format } from 'date-fns'
import { cookies } from 'next/headers'

const API_KEY = process.env.GOOGLE_AI_STUDIO_KEY

if (!API_KEY) {
  throw new Error('GOOGLE_AI_STUDIO_KEY is not set')
}

const ai = new GoogleGenAI({ apiKey: API_KEY })

export async function POST(request: NextRequest) {
  try {
    // Check authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ Missing or invalid authorization header')
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // Create server-side Supabase client with proper auth
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      contentTypeIds,
      personaIds,
      languages,
      keywords,
      customTopics,
      startDate,
      endDate,
      timeSlots,
      excludeWeekends
    } = body

    // Fetch content types
    const { data: contentTypes } = await supabase
      .from('content_types')
      .select('*')
      .in('id', contentTypeIds)

    // Fetch personas
    const { data: personas } = await supabase
      .from('ai_personas')
      .select('*')
      .in('id', personaIds)

    // Fetch brand info for context
    const { data: brands } = await supabase
      .from('brands')
      .select('*')
      .single()

    // Calculate available dates
    const allDates = eachDayOfInterval({
      start: new Date(startDate),
      end: new Date(endDate)
    })

    const availableDates = excludeWeekends 
      ? allDates.filter(date => !isWeekend(date))
      : allDates

    // Calculate total content plans needed based on schedule
    const totalPlansNeeded = availableDates.length * timeSlots.length * languages.length

    // Prepare content generation prompt
    const prompt = `
You are a content strategist creating content plans for a company.

Company Information:
${brands ? `
Name: ${brands.name}
Description: ${brands.description}
Mission: ${brands.mission}
Values: ${brands.values?.join(', ')}
` : 'A modern technology company'}

Task: Generate ${totalPlansNeeded} unique content plans that will be scheduled across the following dates.
Available dates: ${availableDates.length} days from ${startDate} to ${endDate}

Content Types Available (IMPORTANT: Use these exact UUIDs in your response):
${contentTypes?.map(ct => `
- ID: ${ct.id} (USE THIS EXACT UUID)
  Name: ${ct.name}
  Description: ${ct.description}
  Typical length: ${ct.typical_length_min}-${ct.typical_length_max} words
  Keywords focus: ${ct.keywords?.join(', ')}
`).join('\n')}

Target Personas (IMPORTANT: Use these exact UUIDs in your response):
${personas?.map(p => `
- ID: ${p.id} (USE THIS EXACT UUID)
  Name: ${p.name}
  Description: ${p.description}
  Topics: ${p.topics?.join(', ')}
`).join('\n')}

Languages to support: ${languages.join(', ')}

SEO Keywords to incorporate: ${keywords}

${customTopics ? `Custom topics to cover:
${customTopics}` : ''}

For each content plan, provide:
1. A title that feels HUMAN and VARIED (50-70 chars). CRITICAL TITLE REQUIREMENTS:
   - NEVER use the "X: How to Y" format
   - AVOID patterns like "The Ultimate Guide to...", "X Tips for...", "Everything You Need to Know About..."
   - Mix these professional title styles:
     * Questions: "Why Are Finnish Startups Outperforming Silicon Valley Giants?"
     * Insights: "The Hidden Cost of Microservices Architecture"
     * Analysis: "Machine Learning Models That Actually Work in Production"
     * Case Studies: "How Netflix Reduced Deployment Time by 90%"
     * Trends: "The Shift from DevOps to Platform Engineering"
     * Perspectives: "Rethinking Data Privacy in the Age of LLMs"
     * Research: "What 500 CTOs Revealed About Tech Debt"
     * Guides: "Building Resilient Systems at Scale"
   - Use proper capitalization and punctuation
   - Include specific metrics: "37%" not "about 40%", "$2.8M" not "millions"
   - Be precise with quantities when relevant
   - Focus on value and outcomes
2. The main topic/theme
3. 3-5 relevant keywords (mix professional and casual terms)
4. Which content type it should use
5. Which persona(s) it targets
6. A detailed content generation prompt (150-200 words) that sounds like briefing a friend, not a robot

IMPORTANT: Each generation prompt should emphasize ANTI-AI DETECTION writing:
- Tell the AI to write like someone texting or posting on social media
- Include instructions for sentence fragments, run-ons, and tangents
- Request specific imperfections: typos, inconsistent capitalization, filler words
- Ask for strong opinions, contradictions, and emotional reactions
- Demand colloquialisms, slang, and industry jargon without explanation
- Specify to start mid-thought and end abruptly
- Include "btw", "tbh", "ngl", "literally", "like" frequently
- Request at least one controversial take or hot opinion
- Ask for specific odd numbers (37%, $2,847, 11:43 AM)
- Tell it to reference random pop culture or memes without context

Example prompt style: "Write a comprehensive analysis of [topic] that balances technical depth with accessibility. Include specific examples from industry practice, relevant data points, and practical applications. Address common challenges and present solutions based on real-world experience. Maintain a professional tone while keeping the content engaging and valuable for practitioners in the field."

TITLE VARIETY CHECK - Your titles MUST include:
- At least 3 different title formats (question, statement, insight, etc.)
- NO repeated patterns or formulas
- Professional yet engaging tone
- Clear value proposition
- Different lengths within the 50-70 char range
- Thought-provoking without being clickbait
- Focus on outcomes or insights
- ZERO titles with colons followed by generic explanations

Format your response as a JSON array with exactly ${totalPlansNeeded} objects:
[
  {
    "title": "Why Microservices Fail at Scale",
    "topic": "Architectural patterns and scalability challenges",
    "keywords": ["microservices", "architecture", "scalability", "distributed systems", "monolith"],
    "contentTypeId": "ACTUAL_UUID_FROM_ABOVE (e.g., ${contentTypes?.[0]?.id || 'uuid-here'})",
    "targetPersonaIds": ["ACTUAL_UUID_FROM_ABOVE (e.g., ${personas?.[0]?.id || 'uuid-here'})"],
    "generationPrompt": "Write a comprehensive analysis of why microservices architectures often fail to deliver promised benefits at scale. Include a case study of a company that transitioned from monolith to 47 microservices and back to 3 core services. Address the complexity of orchestration tools like Kubernetes, configuration management challenges, and the hidden costs of distributed systems. Explain the 'distributed monolith' anti-pattern with concrete examples. Provide actionable guidance for architects deciding between monolithic and microservices approaches. Target technical leaders and senior developers. Approximately 1500 words.",
    "suggestedLength": 1500
  }
]

CRITICAL: You MUST use the exact UUID values provided above for contentTypeId and targetPersonaIds. Do NOT use placeholder values like "how-to-tutorial-uuid".

Ensure variety in topics, avoid repetition, and align content with the company's mission and values.
Make titles engaging and click-worthy - think clickable but authentic, not clickbait.

FINAL REMINDERS: 
1. TITLES MUST BE DIVERSE - I should NOT see patterns like:
   ❌ "AI in Healthcare: Transforming Patient Care"
   ❌ "The Future of Work: Remote vs Office"
   ❌ "5 Ways to Improve Your Productivity"
   ✅ "Why Healthcare AI Projects Fail 87% of the Time"
   ✅ "The Real Cost of Hybrid Work Models"
   ✅ "Productivity Tools Are Solving the Wrong Problem"

2. GENERATION PROMPTS should be professional briefs:
   - Clear scope and objectives
   - Specific examples and data points to include
   - Industry context and relevance
   - Key challenges to address
   - Practical solutions and recommendations
   - Target audience considerations
   
3. Keywords: Use industry-standard terms and common search queries
`

    // Define schema for the response
    const responseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          topic: { type: Type.STRING },
          keywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          contentTypeId: { type: Type.STRING },
          targetPersonaIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          generationPrompt: { type: Type.STRING },
          suggestedLength: { type: Type.INTEGER }
        },
        required: ['title', 'topic', 'keywords', 'contentTypeId', 'targetPersonaIds', 'generationPrompt']
      }
    }

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 64000,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        thinkingConfig: {
          thinkingBudget: 4096
        }
      }
    })
    
    // Access the text property directly (it's a getter)
    const responseText = result.text
    
    if (!responseText) {
      console.error('Empty response from AI. Full result:', JSON.stringify(result, null, 2))
      throw new Error('Empty response from AI')
    }
    
    // Parse the JSON response directly (should be valid JSON due to schema)
    const contentPlans = JSON.parse(responseText)
    
    // Helper function to validate UUID
    const isValidUUID = (uuid: string) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      return uuidRegex.test(uuid)
    }
    
    // Get valid content type and persona IDs
    const validContentTypeIds = contentTypes?.map(ct => ct.id) || []
    const validPersonaIds = personas?.map(p => p.id) || []
    
    // Validate and fix content plans
    const validatedPlans = contentPlans.map((plan: any) => {
      // Validate content type ID
      let contentTypeId = plan.contentTypeId
      if (!isValidUUID(contentTypeId) || !validContentTypeIds.includes(contentTypeId)) {
        console.warn(`Invalid content type ID: ${contentTypeId}, using first available`)
        contentTypeId = validContentTypeIds[0]
      }
      
      // Validate persona IDs
      let targetPersonaIds = plan.targetPersonaIds || []
      targetPersonaIds = targetPersonaIds.filter((id: string) => 
        isValidUUID(id) && validPersonaIds.includes(id)
      )
      if (targetPersonaIds.length === 0) {
        console.warn(`No valid persona IDs, using first available`)
        targetPersonaIds = [validPersonaIds[0]]
      }
      
      return {
        ...plan,
        contentTypeId,
        targetPersonaIds
      }
    })
    
    // Distribute plans across available dates and time slots
    let planIndex = 0
    const calendarEntries = []

    for (const date of availableDates) {
      for (const timeSlot of timeSlots) {
        for (const language of languages) {
          if (planIndex < validatedPlans.length) {
            const plan = validatedPlans[planIndex]
            
            calendarEntries.push({
              date: format(date, 'yyyy-MM-dd'),
              time_slot: `${timeSlot}:00`,
              topic: plan.topic,
              planned_title: plan.title,
              generation_prompt: plan.generationPrompt,
              keywords: plan.keywords,
              content_type: 'blog', // Always use 'blog' since the check constraint only allows specific values
              content_type_id: plan.contentTypeId,
              persona_id: plan.targetPersonaIds[0] || null, // Primary persona
              multiple_persona_ids: plan.targetPersonaIds.filter(id => id !== null),
              languages: [language],
              locale: language,
              status: 'planned',
              created_by: user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            
            planIndex++
          }
        }
      }
    }

    // Log the first entry to debug
    console.log('Sample calendar entry:', JSON.stringify(calendarEntries[0], null, 2))
    console.log('User ID:', user.id)
    console.log('Total entries to insert:', calendarEntries.length)
    
    // Create a service role client for inserting (bypasses RLS)
    const serviceClient = createClient(undefined, true)
    
    // Insert all calendar entries using service role
    const { data: insertedEntries, error: insertError } = await serviceClient
      .from('content_calendar')
      .insert(calendarEntries)
      .select()

    if (insertError) {
      console.error('Error inserting calendar entries:', insertError)
      throw insertError
    }

    return NextResponse.json({
      success: true,
      plansCreated: insertedEntries?.length || 0,
      message: `Successfully created ${insertedEntries?.length || 0} content plans`
    })

  } catch (error) {
    console.error('Error generating content plans:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate content plans' },
      { status: 500 }
    )
  }
}