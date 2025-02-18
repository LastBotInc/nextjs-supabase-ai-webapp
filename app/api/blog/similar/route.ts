import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { generateEmbeddings, preparePostContent } from '@/utils/embeddings'

type SimilarPost = {
  id: string
  title: string
  slug: string
  content: string
  similarity: number
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    const locale = searchParams.get('locale')
    
    if (!postId || !locale) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get the source post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Generate embeddings for the post
    const content = preparePostContent(post)
    const embedding = await generateEmbeddings(content)

    // Find similar posts using the match_posts function
    const { data: similarPosts, error: similarError } = await supabase
      .rpc('match_posts', {
        query_embedding: embedding,
        match_threshold: 0.7, // Minimum similarity threshold
        match_count: 3, // Number of similar posts to return
        min_content_length: 50
      })

    if (similarError) {
      console.error('Error finding similar posts:', similarError)
      return NextResponse.json(
        { error: 'Failed to find similar posts' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      posts: (similarPosts as SimilarPost[]).filter(p => p.id !== postId) // Exclude the source post
    })
  } catch (error) {
    console.error('Error in similar posts endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 