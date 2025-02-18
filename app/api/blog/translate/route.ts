import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_KEY!)

// List of supported languages and their codes
const SUPPORTED_LANGUAGES = [
  { code: 'fi', name: 'Finnish' }
  // Add more languages here as needed
]

// Define the schema for translation response
const translationSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: {
      type: SchemaType.STRING,
      description: "Translated title of the blog post",
      nullable: false,
    },
    excerpt: {
      type: SchemaType.STRING,
      description: "Translated excerpt/summary of the blog post",
      nullable: true,
    },
    meta_description: {
      type: SchemaType.STRING,
      description: "Translated meta description for SEO",
      nullable: true,
    },
    content: {
      type: SchemaType.STRING,
      description: "Translated main content of the blog post, preserving all markdown formatting and code blocks",
      nullable: false,
    },
  },
  required: ["title", "content"],
}

export async function POST(request: Request) {
  try {
    const { postId } = await request.json()
    const supabase = await createClient()

    // Fetch the original English post
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('locale', 'en')
      .single()

    if (fetchError || !post) {
      return NextResponse.json(
        { error: 'Original post not found' },
        { status: 404 }
      )
    }

    // Initialize model with schema
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-001',
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: translationSchema,
      },
    })

    // Translate to each supported language
    const translations = await Promise.all(
      SUPPORTED_LANGUAGES.map(async (lang) => {
        try {
          // Create prompt for translation
          const prompt = `
            You are a professional translator. Translate the following blog post from English to ${lang.name}.
            Maintain the same tone, style, and technical accuracy.
            
            Important rules:
            1. Keep all markdown formatting intact (like #, *, _, etc.)
            2. Keep all code blocks unchanged (content between \`\`\` or \`)
            3. Keep all HTML tags unchanged
            4. Only translate the actual content text
            5. Preserve line breaks and paragraph structure
            
            Here's the content to translate:
            
            Title: ${post.title}
            Excerpt: ${post.excerpt || ''}
            Meta Description: ${post.meta_description || ''}
            Content:
            ${post.content}
          `

          const result = await model.generateContent(prompt)
          const translation = JSON.parse(result.response.text())

          // Create translated version of the post
          const { data: translatedPost, error: insertError } = await supabase
            .from('posts')
            .insert({
              ...post,
              id: undefined, // Let Supabase generate a new ID
              title: translation.title,
              excerpt: translation.excerpt || post.excerpt,
              meta_description: translation.meta_description || post.meta_description,
              content: translation.content,
              locale: lang.code,
              created_at: post.created_at, // Keep same creation date as original
              updated_at: new Date().toISOString()
            })
            .select()
            .single()

          if (insertError) {
            throw insertError
          }

          return {
            language: lang.code,
            success: true,
            postId: translatedPost.id
          }
        } catch (error) {
          console.error(`Translation error for ${lang.code}:`, error)
          return {
            language: lang.code,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      })
    )

    return NextResponse.json({ translations })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Failed to translate post' },
      { status: 500 }
    )
  }
} 