import { GoogleGenAI, Type, HarmBlockThreshold, HarmCategory } from '@google/genai'

interface TranslationInput {
  title: string
  content: string
  excerpt?: string
  meta_description?: string
  slug?: string
  targetLanguage: string
}

interface TranslationOutput {
  title: string
  content: string
  excerpt: string
  meta_description: string
  slug: string
}

const languageMap: Record<string, string> = {
  'fi': 'Finnish',
  'sv': 'Swedish',
  'no': 'Norwegian',
  'da': 'Danish',
  'de': 'German',
  'fr': 'French',
  'es': 'Spanish',
  'it': 'Italian',
  'nl': 'Dutch',
  'pl': 'Polish',
  'ru': 'Russian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese'
}

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

export async function generateTranslation(input: TranslationInput): Promise<TranslationOutput> {
  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_KEY! })
  const targetLanguage = languageMap[input.targetLanguage] || input.targetLanguage

  const prompt = `
    You are a professional translator. Translate the following blog post from English to ${targetLanguage}.
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
    - Should reflect the translated title, not the original English slug
    
    Here's the content to translate:
    
    Title: ${input.title}
    ${input.slug ? `Original Slug: ${input.slug}\n` : ''}
    ${input.excerpt ? `Excerpt: ${input.excerpt}\n` : ''}
    ${input.meta_description ? `Meta Description: ${input.meta_description}\n` : ''}
    Content:
    ${input.content}
  `

  try {
    // Generate content with structured JSON output
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-001',
      contents: [{ text: prompt }],
      config: {
        temperature: 0.7,
        maxOutputTokens: 4096,
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

    return {
      title: translation.title,
      content: translation.content,
      excerpt: translation.excerpt || input.excerpt || '',
      meta_description: translation.meta_description || input.meta_description || '',
      slug: finalSlug
    }
  } catch (err: Error | unknown) {
    console.error('Translation error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    throw new Error(`Failed to translate content to ${targetLanguage}: ${errorMessage}`)
  }
} 