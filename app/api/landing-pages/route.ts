import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET /api/landing-pages
export async function GET(request: Request) {
  try {
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
    const { data: { user }, error: authError } = await authClient.auth.getUser(authHeader.split(' ')[1])
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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
    
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'en'
    const published = searchParams.get('published') === 'true'
    const slug = searchParams.get('slug')

    let query = supabase
      .from('landing_pages')
      .select('*')
      .eq('locale', locale)

    if (published !== undefined) {
      query = query.eq('published', published)
    }

    if (slug) {
      query = query.eq('slug', slug)
    }

    const { data: pages, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ pages })
  } catch (err) {
    console.error('Error fetching landing pages:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch landing pages' },
      { status: 500 }
    )
  }
}

// POST /api/landing-pages
export async function POST(request: Request) {
  try {
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
    const { data: { user }, error: authError } = await authClient.auth.getUser(authHeader.split(' ')[1])
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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
    
    const data = await request.json()
    
    // Create the landing page
    const { data: page, error: insertError } = await supabase
      .from('landing_pages')
      .insert([{
        ...data,
        created_by: user.id,
        updated_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (insertError) throw insertError

    return NextResponse.json(page)
  } catch (err) {
    console.error('Error creating landing page:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create landing page' },
      { status: 500 }
    )
  }
}

// PATCH /api/landing-pages
export async function PATCH(request: Request) {
  try {
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
    const { data: { user }, error: authError } = await authClient.auth.getUser(authHeader.split(' ')[1])
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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
    
    const { id, ...updates } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Missing page ID' }, { status: 400 })
    }

    // If publishing status is changing, update published_at
    if ('published' in updates) {
      updates.published_at = updates.published ? new Date().toISOString() : null
    }

    const { data: page, error: updateError } = await supabase
      .from('landing_pages')
      .update({
        ...updates,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json(page)
  } catch (err) {
    console.error('Error updating landing page:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update landing page' },
      { status: 500 }
    )
  }
}

// DELETE /api/landing-pages
export async function DELETE(request: Request) {
  try {
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
    const { data: { user }, error: authError } = await authClient.auth.getUser(authHeader.split(' ')[1])
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
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
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing page ID' }, { status: 400 })
    }

    const { error } = await supabase
      .from('landing_pages')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error deleting landing page:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete landing page' },
      { status: 500 }
    )
  }
} 