import { NextResponse } from 'next/server'
import { GoogleGenAI, Type } from '@google/genai'
import { createClient } from '@/utils/supabase/server'
import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'

// Configure marked with syntax highlighting
marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code: string, lang: string) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  }
}));

// Set marked options
marked.setOptions({
  gfm: true,
  breaks: true,
  pedantic: false
});

const API_KEY = process.env.GOOGLE_AI_STUDIO_KEY

if (!API_KEY) {
  throw new Error('GOOGLE_AI_STUDIO_KEY is not set')
}

const ai = new GoogleGenAI({ apiKey: API_KEY })

export async function POST(request: Request) {
  try {
    console.log('\n🎭 [POST /api/ai/generate-content] Persona-based content generation request')

    // 1. Authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ Missing or invalid authorization header')
      return NextResponse.json(
        { error: 'Missing or invalid authorization header', code: 'AUTH_HEADER_MISSING' },
        { status: 401 }
      )
    }

    const authClient = await createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser(authHeader.split(' ')[1])
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_FAILED' },
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
      console.error('❌ User is not admin:', user.id)
      return NextResponse.json(
        { error: 'Forbidden - Admin access required', code: 'ADMIN_REQUIRED' },
        { status: 403 }
      )
    }

    const { 
      personaId,
      topic,
      keywords = [],
      targetAudience,
      contentType = 'blog',
      locale = 'en',
      temperature = 0.7,
      maxTokens = 8192
    } = await request.json()

    if (!personaId || !topic) {
      console.error('❌ Missing required parameters:', { personaId: !!personaId, topic: !!topic })
      return NextResponse.json(
        { error: 'Persona ID and topic are required', code: 'PARAMS_MISSING' },
        { status: 400 }
      )
    }

    // 3. Fetch persona details
    const { data: persona, error: personaError } = await authClient
      .from('ai_personas')
      .select('*')
      .eq('id', personaId)
      .eq('active', true)
      .single()

    if (personaError || !persona) {
      console.error('❌ Persona not found:', { personaId, error: personaError })
      return NextResponse.json(
        { error: 'Persona not found or inactive', code: 'PERSONA_NOT_FOUND' },
        { status: 404 }
      )
    }

    console.log('🎭 Using persona:', persona.name)

    // 4. Build the content generation prompt
    const personaTraits = persona.personality_traits || {}
    const tone = personaTraits.tone || 'professional'
    const style = personaTraits.style || 'informative'
    const expertise = personaTraits.expertise || 'general'

    // Define content schema based on content type
    let responseSchema
    let contentPrompt

    if (contentType === 'blog') {
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "A compelling, SEO-friendly title under 60 characters"
          },
          content: {
            type: Type.STRING,
            description: "The main blog post content in markdown format"
          },
          excerpt: {
            type: Type.STRING,
            description: "A compelling 2-3 sentence summary"
          },
          meta_description: {
            type: Type.STRING,
            description: "SEO optimized description under 160 characters"
          },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "3-5 relevant tags"
          },
          image_prompt: {
            type: Type.STRING,
            description: "A detailed prompt for generating the featured image"
          }
        },
        required: ["title", "content", "excerpt", "meta_description", "tags", "image_prompt"]
      }

      contentPrompt = `You are ${persona.name}, ${persona.description}.

${persona.system_prompt}

Your personality traits:
- Tone: ${tone}
- Style: ${style}
- Expertise level: ${expertise}
- Specialized topics: ${persona.topics.join(', ')}

Generate a comprehensive blog post about: "${topic}"

Target audience: ${targetAudience || 'General audience'}
Keywords to incorporate naturally: ${keywords.join(', ')}
Language: ${locale === 'fi' ? 'Finnish' : locale === 'sv' ? 'Swedish' : 'English'}

Instructions:
1. Write in your distinctive voice and style as defined above
2. Title should be compelling and SEO-friendly (under 60 characters)
3. Content should use proper markdown formatting with headings, lists, and emphasis
4. Naturally incorporate the provided keywords throughout the content
5. Include a clear introduction, body with subsections, and conclusion
6. Excerpt should capture the essence in 2-3 sentences
7. Meta description should be optimized for search (under 160 characters)
8. Include 3-5 relevant tags
9. Create a detailed image prompt that reflects the content and your persona's style

Remember to maintain your unique perspective and expertise throughout the content.`

    } else if (contentType === 'social') {
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          posts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                platform: { type: Type.STRING },
                content: { type: Type.STRING },
                hashtags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              }
            }
          }
        },
        required: ["posts"]
      }

      contentPrompt = `You are ${persona.name}, ${persona.description}.

${persona.system_prompt}

Create social media posts about: "${topic}"

Target audience: ${targetAudience || 'General audience'}
Keywords to incorporate: ${keywords.join(', ')}

Generate posts for:
1. Twitter/X (280 characters max)
2. LinkedIn (professional tone, 1300 characters max)
3. Instagram (engaging caption, 2200 characters max)

Include relevant hashtags for each platform.`

    } else if (contentType === 'email') {
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          preheader: { type: Type.STRING },
          content: { type: Type.STRING },
          cta: { type: Type.STRING }
        },
        required: ["subject", "preheader", "content", "cta"]
      }

      contentPrompt = `You are ${persona.name}, ${persona.description}.

${persona.system_prompt}

Create an email about: "${topic}"

Target audience: ${targetAudience || 'General audience'}
Keywords to incorporate: ${keywords.join(', ')}

Generate:
1. Subject line (compelling, under 50 characters)
2. Preheader text (complements subject, under 100 characters)
3. Email content in markdown format
4. Clear call-to-action text`
    }

    // 5. Generate content with Gemini with retry logic
    console.log('🤖 Generating content with Gemini...')
    
    let attempts = 0
    const maxAttempts = 3
    let lastError: Error | null = null

    while (attempts < maxAttempts) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-preview-05-20',
          contents: contentPrompt,
          config: {
            temperature,
            maxOutputTokens: maxTokens,
            responseMimeType: 'application/json',
            responseSchema: responseSchema
          }
        })

        const text = response.text
        if (!text) {
          throw new Error('Empty response from Gemini API')
        }

        const generatedContent = JSON.parse(text)

        // 6. Process content based on type
        let processedContent
        
        if (contentType === 'blog') {
          // Convert markdown to HTML for blog posts
          const htmlContent = marked(generatedContent.content || '')
          
          // Generate slug from title
          const slug = generatedContent.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')

          processedContent = {
            ...generatedContent,
            content: htmlContent,
            slug,
            personaId,
            generationPrompt: topic,
            autoGenerated: true,
            locale
          }
        } else {
          processedContent = {
            ...generatedContent,
            personaId,
            generationPrompt: topic,
            contentType,
            locale
          }
        }
        
        console.log('✅ Content generated successfully with persona:', persona.name)
        
        return NextResponse.json({
          success: true,
          content: processedContent,
          persona: {
            id: persona.id,
            name: persona.name,
            description: persona.description
          }
        })
        
      } catch (error) {
        attempts++
        lastError = error as Error
        console.error(`❌ Generation attempt ${attempts} failed:`, error)
        
        if (attempts < maxAttempts) {
          console.log(`🔄 Retrying in ${attempts * 1000}ms...`)
          await new Promise(resolve => setTimeout(resolve, attempts * 1000))
        }
      }
    }

    // All attempts failed
    console.error('❌ All generation attempts failed:', lastError)
    return NextResponse.json(
      { 
        error: 'Content generation failed after multiple attempts', 
        code: 'GENERATION_FAILED',
        details: process.env.NODE_ENV === 'development' ? lastError?.message : undefined
      },
      { status: 500 }
    )

  } catch (error: Error | unknown) {
    console.error('❌ Content generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate content'
    return NextResponse.json(
      { 
        error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}