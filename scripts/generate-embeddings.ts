import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { generateEmbeddings, preparePostContent } from '../utils/embeddings'
import { Database } from '../types/database'

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

// Debug: Log environment variables
console.log('Environment check:')
console.log('GOOGLE_AI_STUDIO_KEY exists:', !!process.env.GOOGLE_AI_STUDIO_KEY)
console.log('GOOGLE_AI_STUDIO_KEY length:', process.env.GOOGLE_AI_STUDIO_KEY?.length)
// Log first 6 and last 4 characters of the key
const key = process.env.GOOGLE_AI_STUDIO_KEY || ''
console.log('GOOGLE_AI_STUDIO_KEY format:', `${key.slice(0, 6)}...${key.slice(-4)}`)
console.log('Current working directory:', process.cwd())
console.log('.env.local path:', resolve(process.cwd(), '.env.local'))

// Initialize Supabase client with admin privileges
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function generateAllEmbeddings() {
  try {
    // Get all posts without embeddings
    const { data: posts, error: fetchError } = await supabaseAdmin
      .from('posts')
      .select('*')
      .is('embedding', null)

    if (fetchError) throw fetchError

    console.log(`Found ${posts?.length || 0} posts without embeddings`)

    // Process posts in batches to avoid rate limits
    const batchSize = 5
    for (let i = 0; i < (posts?.length || 0); i += batchSize) {
      const batch = posts!.slice(i, i + batchSize)
      
      // Process batch in parallel
      await Promise.all(
        batch.map(async (post) => {
          try {
            console.log(`Generating embeddings for post: ${post.title}`)
            
            // Generate embeddings
            const content = preparePostContent(post)
            const embedding = await generateEmbeddings(content)

            // Update post with embeddings
            const { error: updateError } = await supabaseAdmin
              .from('posts')
              .update({ embedding })
              .eq('id', post.id)

            if (updateError) throw updateError

            console.log(`✅ Updated embeddings for post: ${post.title}`)
          } catch (error) {
            console.error(`❌ Error processing post ${post.title}:`, error)
          }
        })
      )

      // Add a small delay between batches
      if (i + batchSize < (posts?.length || 0)) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log('Finished generating embeddings')
  } catch (error) {
    console.error('Error generating embeddings:', error)
    process.exit(1)
  }
}

generateAllEmbeddings() 