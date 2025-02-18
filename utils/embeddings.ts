import { GoogleGenerativeAI } from '@google/generative-ai'


/**
 * Generates embeddings for text content using Google's Gemini API
 * @param text Text content to generate embeddings for
 * @returns Float32Array of embeddings
 */
export async function generateEmbeddings(text: string): Promise<number[]> {
  try {
    console.log('Generating embeddings for text:', text)
    console.log('Google AI Studio key:', process.env.GOOGLE_AI_STUDIO_KEY)
    // Initialize Gemini API client
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_KEY!)

    // Use text-embedding-004 model for embeddings
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" })
    
    // Generate embeddings
    const result = await model.embedContent(text)
    const embedding = result.embedding.values
    
    return embedding
  } catch (error) {
    console.error('Error generating embeddings:', error)
    throw error
  }
}

/**
 * Prepares blog post content for embedding generation
 * Combines relevant fields into a single text
 */
export function preparePostContent(post: {
  title: string
  content: string
  excerpt?: string | null
  meta_description?: string | null
  tags?: string[] | null
}) {
  return `
    Title: ${post.title}
    ${post.meta_description ? `Description: ${post.meta_description}` : ''}
    ${post.excerpt ? `Excerpt: ${post.excerpt}` : ''}
    ${post.tags?.length ? `Tags: ${post.tags.join(', ')}` : ''}
    Content: ${post.content}
  `.trim()
}