import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { CreateAppointmentTypeRequest } from '@/lib/types/booking'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/database.types'

export async function GET(request: NextRequest) {
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

    // After authentication, use service role client for database operations
    const supabase = await createClient(undefined, true)

    // Fetch appointment types
    const { data: appointmentTypes, error } = await supabase
      .from('appointment_types')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching appointment types:', error)
      return NextResponse.json(
        { error: 'Failed to fetch appointment types' },
        { status: 500 }
      )
    }

    return NextResponse.json(appointmentTypes)
  } catch (error) {
    console.error('Error in GET /api/appointment-types:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Creating new appointment type...')
    
    // Get authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ Missing or invalid auth header')
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // Verify token and get user
    console.log('🔑 Verifying authentication...')
    const authClient = await createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser(
      authHeader.split(' ')[1]
    )
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized', details: authError },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    console.log('Request body:', {
      ...body,
      description: body.description ? `${body.description.slice(0, 20)}...` : undefined
    })

    if (!body.name || !body.duration) {
      console.error('❌ Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const baseSlug = generateSlug(body.name)
    
    // Create service role client for database operations
    console.log('🔑 Creating service role client...')
    const supabase = await createClient(undefined, true)

    // Check for existing slugs to avoid conflicts
    let slug = baseSlug
    let counter = 1
    let slugExists = true

    while (slugExists) {
      const { data: existing, error: slugCheckError } = await supabase
        .from('appointment_types')
        .select('id')
        .eq('slug', slug)
        .eq('user_id', user.id)
        .maybeSingle()

      if (slugCheckError) {
        console.error('❌ Error checking slug:', slugCheckError)
        return NextResponse.json(
          { error: 'Failed to validate slug' },
          { status: 500 }
        )
      }

      if (!existing) {
        slugExists = false
      } else {
        slug = `${baseSlug}-${counter}`
        counter++
      }
    }

    // Create appointment type
    console.log('📝 Creating appointment type with slug:', slug)
    const { data, error } = await supabase
      .from('appointment_types')
      .insert({
        name: body.name,
        slug,
        description: body.description,
        duration: body.duration,
        price: body.is_free ? null : body.price,
        is_free: body.is_free ?? false,
        user_id: user.id,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating appointment type:', error)
      return NextResponse.json(
        { error: 'Failed to create appointment type', details: error },
        { status: 500 }
      )
    }

    console.log('✅ Successfully created appointment type:', data.id)
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 