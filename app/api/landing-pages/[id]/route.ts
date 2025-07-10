import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET /api/landing-pages/[id]
export async function GET(
  request: Request,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const params = await paramsPromise
    const pageId = params.id

    if (!pageId) {
      return NextResponse.json({ error: 'Missing page ID' }, { status: 400 })
    }

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
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(authHeader.split(' ')[1])

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // After authentication, use service role client for database operations
    const supabase = await createClient(undefined, true)

    const { data: page, error: fetchError } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('id', pageId)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') { // Handle 'Not found' specifically
        return NextResponse.json({ error: 'Landing page not found' }, { status: 404 })
      }
      throw fetchError // Rethrow other errors
    }

    if (!page) {
         return NextResponse.json({ error: 'Landing page not found' }, { status: 404 })
    }

    return NextResponse.json(page) // Return the single page object directly
  } catch (err) {
    console.error('Error fetching landing page by ID:', err)
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : 'Failed to fetch landing page',
      },
      { status: 500 }
    )
  }
} 