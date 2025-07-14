import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { GoogleGenAI, Type, HarmBlockThreshold, HarmCategory } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_KEY! })

// List of supported languages and their codes
const SUPPORTED_LANGUAGES = [
  { code: 'fi', name: 'Finnish' },
  { code: 'sv', name: 'Swedish' }
  // Add more languages here as needed
]

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 100) // Limit length
}

// Define the schema for translation response
const translationSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "Translated title of the blog post",
    },
    slug: {
      type: Type.STRING,
      description: "Translated URL slug in the target language, using lowercase letters, numbers, and hyphens only. Should be SEO-friendly and reflect the translated title.",
    },
    excerpt: {
      type: Type.STRING,
      description: "Translated excerpt/summary of the blog post",
    },
    meta_description: {
      type: Type.STRING,
      description: "Translated meta description for SEO",
    },
    content: {
      type: Type.STRING,
      description: "Translated main content of the blog post, preserving all markdown formatting and code blocks",
    },
  },
  required: ["title", "slug", "content"],
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
            6. Create a localized URL slug that reflects the translated title
            
            For the slug:
            - Use only lowercase letters, numbers, and hyphens
            - Replace spaces with hyphens
            - Remove special characters
            - Make it SEO-friendly in the target language
            
            Return the response as JSON with the following structure:
            {
              "title": "translated title",
              "slug": "translated-url-slug",
              "excerpt": "translated excerpt",
              "meta_description": "translated meta description",
              "content": "translated content with preserved formatting"
            }
            
            Here's the content to translate:
            
            Title: ${post.title}
            Slug: ${post.slug}
            Excerpt: ${post.excerpt || ''}
            Meta Description: ${post.meta_description || ''}
            Content:
            ${post.content}
          `

          // Generate content with structured JSON output
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ text: prompt }],
            config: {
              temperature: 0.7,
              maxOutputTokens: 32000,
              responseMimeType: 'application/json',
              responseSchema: translationSchema,
              safetySettings: [
                {
                  category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                  threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                  category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                  threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                  category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                  threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
                {
                  category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                  threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
              ],
            },
          })

          const translation = JSON.parse(response.text || '{}')

          // Ensure slug is properly formatted
          const finalSlug = translation.slug || generateSlug(translation.title)

          // Create translated version of the post
          const { data: translatedPost, error: insertError } = await supabase
            .from('posts')
            .insert({
              ...post,
              id: undefined, // Let Supabase generate a new ID
              title: translation.title,
              slug: finalSlug,
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
            postId: translatedPost.id,
            slug: finalSlug
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