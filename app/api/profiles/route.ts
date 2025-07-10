import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { dedupingServerFetch } from '@/lib/utils/server-deduplication'

// Cache duration in seconds
const CACHE_DURATION = 300 // 5 minutes
const BATCH_SIZE = 50

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids')?.split(',') || []
    const select = searchParams.get('select') || '*'

    // Create Supabase client
    const supabase = await createClient(undefined, true)

    // Process IDs in batches
    const results = []
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      const batchIds = ids.slice(i, i + BATCH_SIZE)
      const { data, error } = await supabase
        .from('profiles')
        .select(select)
        .in('id', batchIds)

      if (error) throw error
      results.push(...(data || []))
    }

    // Add caching headers
    const headers = {
      'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
      'CDN-Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
      'Vercel-CDN-Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
      'Content-Type': 'application/json'
    }

    return NextResponse.json({ data: results }, { headers })
  } catch (error) {
    console.error('Error in profiles API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Protected route for updating profiles
export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const authClient = await createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser(
      authHeader.split(' ')[1]
    )
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const supabase = await createClient(undefined, true)

    const { data, error } = await supabase
      .from('profiles')
      .update(body)
      .eq('id', user.id)
      .select()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in profiles API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 