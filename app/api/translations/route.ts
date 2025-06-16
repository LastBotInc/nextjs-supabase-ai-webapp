import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { invalidateTranslationCache } from '@/app/i18n';

export async function GET(request: Request) {
  const supabase = await createClient()
  try {
    const { searchParams } = new URL(request.url)
    const namespace = searchParams.get('namespace')
    const locale = searchParams.get('locale')
    let query = supabase.from('translations').select('*')
    if (namespace) {
      query = query.eq('namespace', namespace)
    }
    if (locale) {
      query = query.eq('locale', locale)
    }
    query = query.order('namespace').order('key').order('locale')
    const { data, error } = await query
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ data })
  } catch (err) {
    console.error('Error fetching translations:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    // First verify user authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // Use anon client for authentication
    const authClient = createClient()
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

    // Use service role client for database operations
    const supabase = createClient(undefined, true)
    
    const body = await request.json()
    const { namespace, key, locale, value } = body

    const { error } = await supabase
      .from('translations')
      .upsert({
        namespace,
        key,
        locale,
        value,
        is_html: value.includes('<') && value.includes('>'),
        last_edited_by: user.id
      }, {
        onConflict: 'namespace,key,locale'
      })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Invalidate cache for the updated locale
    invalidateTranslationCache(locale)
    
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error updating translation:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 