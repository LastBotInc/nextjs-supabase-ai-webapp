import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: Request) {
  try {
    // Get authorization token from request headers
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // Create regular client to verify the token
    const authClient = await createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser(authHeader.split(' ')[1])
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
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

    const { prompt } = await request.json()

    // Initialize Gemini API client
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" })

    // Generate content
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: `You are a professional landing page copywriter. Create a landing page based on this prompt: ${prompt}

Please return ONLY a JSON object in the following format, without any additional text, markdown, or code blocks:
{
  "title": "A compelling and concise page title",
  "content": "<div class='prose lg:prose-xl'><h1>Main headline that grabs attention</h1><p>Engaging opening paragraph that explains the value proposition...</p><!-- Rest of the content with proper HTML structure --></div>",
  "excerpt": "A compelling 2-3 sentence summary that would make someone want to read more",
  "meta_title": "SEO-optimized title under 60 characters",
  "meta_description": "Compelling meta description under 155 characters that encourages clicks from search results",
  "keywords": ["relevant", "seo", "keywords", "max 5"],
  "image_prompt": "Detailed prompt for an eye-catching featured image that matches the landing page's message"
}`
        }]
      }]
    })

    const response = await result.response
    const text = response.text()
    
    // Clean up the response text by removing any potential formatting
    const cleanText = text.replace(/```json\n|\n```|```/g, '').trim()
    
    try {
      const data = JSON.parse(cleanText)
      return NextResponse.json(data)
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError, 'Raw text:', cleanText)
      return NextResponse.json(
        { error: 'Failed to parse generated content. Please try again.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error generating landing page content:', error)
    return NextResponse.json(
      { error: 'Failed to generate content. Please try again.' },
      { status: 500 }
    )
  }
} 