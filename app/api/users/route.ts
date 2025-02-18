import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Get URL parameters
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const perPage = parseInt(url.searchParams.get('perPage') || '10')

    // Get authorization token from request headers
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401 }
      )
    }
    const token = authHeader.split(' ')[1]

    // Create regular client to verify the token
    console.log('🔑 Creating auth client...')
    const authClient = await createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser(token)

    if (authError || !user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', user.id)

    // After authentication, use service role client for database operations
    console.log('🔑 Creating service role client...')
    const supabase = await createClient(true)

    // Check if user is admin by querying the profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403 }
      )
    }

    // Fetch users using service role client
    const { data: { users }, error } = await supabase.auth.admin.listUsers({
      page: page,
      perPage: perPage,
    })

    if (error) throw error

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error in users API route:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    )
  }
} 