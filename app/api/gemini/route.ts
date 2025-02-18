import { NextResponse } from 'next/server'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { createClient } from '@/utils/supabase/server'
import { brandInfo, getGeminiPrompt } from '@/lib/brand-info'
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
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert line breaks to <br>
  pedantic: false // Don't be too strict
});

const API_KEY = process.env.GOOGLE_AI_STUDIO_KEY

if (!API_KEY) {
  throw new Error('GOOGLE_AI_STUDIO_KEY is not set')
}

const genAI = new GoogleGenerativeAI(API_KEY)

export async function POST(request: Request) {
  try {
    // Get authorization token from request headers
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401 }
      )
    }
    const token = authHeader.split(' ')[1]

    // Create authenticated Supabase client using service role
    const supabase = await createClient(true)

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    const { prompt, modelName = 'gemini-2.0-flash-exp', temperature = 0.7, maxTokens = 2048 } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Configure the model with provided parameters
    const generativeModel = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            title: {
              type: SchemaType.STRING,
              description: "A compelling, SEO-friendly title under 60 characters"
            },
            content: {
              type: SchemaType.STRING,
              description: "The main blog post content in markdown format"
            },
            excerpt: {
              type: SchemaType.STRING,
              description: "A compelling 2-3 sentence summary of the post"
            },
            meta_description: {
              type: SchemaType.STRING,
              description: "SEO optimized description under 160 characters"
            },
            tags: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "3-5 relevant tags for the post"
            },
            image_prompt: {
              type: SchemaType.STRING,
              description: "A detailed prompt for generating the featured image"
            }
          },
          required: ["title", "content", "excerpt", "meta_description", "tags", "image_prompt"]
        }
      }
    })

    // Create a structured prompt for blog content generation using brand voice
    const structuredPrompt = getGeminiPrompt(`Generate a blog post based on this topic: "${prompt}"

Instructions:
1. Title should be compelling, SEO-friendly, and under 60 characters
2. Content should use proper markdown headings (##, ###), include bullet points, code blocks if relevant, and have a clear structure with introduction and conclusion
3. Excerpt should capture the essence of the post in 2-3 sentences
4. Meta description should be optimized for search and under 160 characters
5. Include 3-5 relevant tags
6. Create a detailed image prompt that will generate an engaging featured image

The content should be written in a way that reflects ${brandInfo.name}'s identity: ${brandInfo.description}`)

    const result = await generativeModel.generateContent(structuredPrompt)
    const response = await result.response
    const text = response.text()

    try {
      // Parse the generated text as JSON (should be already in JSON format)
      const parsedContent = JSON.parse(text)
      
      // Convert markdown content to HTML
      const htmlContent = marked(parsedContent.content || '')
      
      // Generate slug from title
      const slug = parsedContent.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      
      // Validate and clean the response
      const cleanedContent = {
        title: typeof parsedContent.title === 'string' ? parsedContent.title.trim() : '',
        content: typeof htmlContent === 'string' ? htmlContent.trim() : '',
        excerpt: typeof parsedContent.excerpt === 'string' ? parsedContent.excerpt.trim() : '',
        meta_description: typeof parsedContent.meta_description === 'string' ? 
          parsedContent.meta_description.substring(0, 160).trim() : '',
        tags: Array.isArray(parsedContent.tags) ? 
          parsedContent.tags.filter((tag: unknown) => typeof tag === 'string').slice(0, 5) : [],
        image_prompt: typeof parsedContent.image_prompt === 'string' ? 
          parsedContent.image_prompt.trim() : '',
        slug
      }

      return NextResponse.json(cleanedContent)
    } catch (error) {
      console.error('Failed to parse generated content:', error)
      console.error('Raw text:', text)
      // Fallback to returning just the text if parsing fails
      return NextResponse.json({ 
        content: text,
        excerpt: '',
        meta_description: '',
        tags: [],
        image_prompt: ''
      })
    }
  } catch (error: Error | unknown) {
    console.error('Gemini API error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate content'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
} 