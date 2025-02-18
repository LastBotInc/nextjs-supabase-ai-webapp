import { getGeminiPrompt } from './brand-info'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface TranslationInput {
  title: string
  content: string
  excerpt?: string
  meta_description?: string
  targetLanguage: string
}

interface TranslationOutput {
  title: string
  content: string
  excerpt: string
  meta_description: string
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

function extractJSON(text: string): string {
  // Remove markdown code block markers if present
  const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || text.match(/(\{[\s\S]*\})/)
  return jsonMatch ? jsonMatch[1].trim() : text.trim()
}

export async function generateTranslation(input: TranslationInput): Promise<TranslationOutput> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_KEY!)
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-001',
    generationConfig: {
      temperature: 0.1,
    }
  })

  const targetLanguage = languageMap[input.targetLanguage] || input.targetLanguage

  const prompt = getGeminiPrompt(`
    You are a professional translator. Your task is to translate the following content from English to ${targetLanguage}.
    You MUST translate all text content while following these rules:
    
    1. Translate all text content to ${targetLanguage}
    2. Keep all markdown formatting intact (like #, *, _, etc.)
    3. Keep all code blocks unchanged (content between \`\`\` or \`)
    4. Keep all HTML tags unchanged
    5. Preserve line breaks and paragraph structure
    6. Maintain the same tone and style
    7. Return ONLY a valid JSON object with the following structure:
    {
      "title": "translated title",
      "content": "translated content",
      "excerpt": "translated excerpt",
      "meta_description": "translated meta description"
    }
    
    Original content to translate:
    
    Title: ${input.title}
    ${input.excerpt ? `Excerpt: ${input.excerpt}\n` : ''}
    ${input.meta_description ? `Meta Description: ${input.meta_description}\n` : ''}
    Content:
    ${input.content}
    
    Remember: Return ONLY the JSON object with the translations. Do not include any other text, markdown formatting, or explanations.
  `)

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1
      }
    })

    const response = await result.response.text()
    const cleanJSON = extractJSON(response)
    const translation = JSON.parse(cleanJSON)
      
    // Validate that we actually got translations and not just copied content
    const isTranslated = 
      translation.title !== input.title ||
      translation.content !== input.content ||
      (input.excerpt && translation.excerpt !== input.excerpt) ||
      (input.meta_description && translation.meta_description !== input.meta_description)

    if (!isTranslated) {
      throw new Error('Content was not translated')
    }

    return {
      title: translation.title,
      content: translation.content,
      excerpt: translation.excerpt || input.excerpt || '',
      meta_description: translation.meta_description || input.meta_description || ''
    }
  } catch (err: Error | unknown) {
    console.error('Translation error:', err)
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    throw new Error(`Failed to translate content to ${targetLanguage}: ${errorMessage}`)
  }
} 