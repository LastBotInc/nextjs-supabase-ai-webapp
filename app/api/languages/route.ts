import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { dedupingServerFetch } from '@/lib/utils/server-deduplication'

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_KEY || '')

// Cache duration in seconds
const CACHE_DURATION = 300 // 5 minutes

export async function GET() {
  try {
    console.log('\n🌐 [GET /api/languages]')
    
    // Create regular Supabase client for public reads
    console.log('🔑 Creating service role client...')
    const supabase = await createClient(undefined, true)
    
    // Get all languages and filter in the query
    console.log('📊 Fetching languages...')
    const { data, error } = await supabase
      .from('languages')
      .select('code, name, native_name, enabled')
      .eq('enabled', true)
      .order('name')

    if (error) {
      console.error('❌ [GET /api/languages] Database error:', error)
      return NextResponse.json({ error: error.message }, { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }

    console.log('✅ Successfully fetched languages:', data?.length)

    // Add caching headers
    const headers = {
      'Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
      'CDN-Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
      'Vercel-CDN-Cache-Control': `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
      'Content-Type': 'application/json'
    }

    return NextResponse.json({ data }, { headers })
  } catch (err) {
    console.error('❌ [GET /api/languages] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log('\n🌐 [POST /api/languages]')
    
    // First verify user authentication
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ [POST /api/languages] Missing or invalid auth header')
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // Create Supabase client with service role for admin operations
    console.log('🔑 Creating service role client...')
    const supabase = await createClient(undefined, true)
    
    // Get user from token
    console.log('🔑 Verifying user...')
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.split(' ')[1])
    
    if (authError || !user) {
      console.error('❌ [POST /api/languages] Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', user.id)

    // Check if user is admin
    const { data: profile } = await supabase
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

    // Parse request body
    const body = await request.json()
    const { code, name } = body

    if (!code || !name) {
      console.error('❌ [POST /api/languages] Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Initialize model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Generate native name translation
    console.log('🤖 Generating native name translation...')
    const prompt = `Translate the language name "${name}" to its native form (how it's written in that language). Return only the translated text, nothing else.`
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    })
    const translatedText = result.response.text().trim()

    // Insert new language with service role client
    console.log('📝 Inserting new language...')
    const { data, error } = await supabase
      .from('languages')
      .insert([
        {
          code,
          name,
          native_name: translatedText,
          enabled: true,
          last_edited_by: user.id
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('❌ [POST /api/languages] Database error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Successfully added language:', code)
    return NextResponse.json({ data }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (err) {
    console.error('❌ [POST /api/languages] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    console.log('\n🌐 [PATCH /api/languages]')
    
    // Get authorization token from request headers
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ [PATCH /api/languages] Missing or invalid auth header')
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // Create authenticated Supabase client
    console.log('🔑 Creating service role client...')
    const supabase = await createClient(undefined, true)

    // Verify the token and get user
    console.log('🔑 Verifying user...')
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.split(' ')[1])

    if (authError || !user) {
      console.error('❌ [PATCH /api/languages] Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', user.id)

    const { code, enabled } = await request.json()

    // Validate input
    if (!code || typeof enabled !== 'boolean') {
      console.error('❌ [PATCH /api/languages] Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Update language with user ID
    console.log('📝 Updating language status...')
    const { data, error } = await supabase
      .from('languages')
      .update({ 
        enabled,
        last_edited_by: user.id 
      })
      .eq('code', code)
      .select()
      .single()

    if (error) {
      console.error('❌ [PATCH /api/languages] Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Successfully updated language:', code)
    return NextResponse.json({ data })
  } catch (err) {
    console.error('❌ [PATCH /api/languages] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    console.log('\n🌐 [DELETE /api/languages]')
    
    // Get authorization token from request headers
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ [DELETE /api/languages] Missing or invalid auth header')
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // Create authenticated Supabase client
    console.log('🔑 Creating service role client...')
    const supabase = await createClient(undefined, true)

    // Verify the token and get user
    console.log('🔑 Verifying user...')
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.split(' ')[1])

    if (authError || !user) {
      console.error('❌ [DELETE /api/languages] Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', user.id)

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      console.error('❌ [DELETE /api/languages] Missing language code')
      return NextResponse.json(
        { error: 'Language code is required' },
        { status: 400 }
      )
    }

    // Delete language
    console.log('🗑️ Deleting language...')
    const { error } = await supabase
      .from('languages')
      .delete()
      .eq('code', code)

    if (error) {
      console.error('❌ [DELETE /api/languages] Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('✅ Successfully deleted language:', code)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ [DELETE /api/languages] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 