import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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
    const supabase = await createClient(true)

    // Get request body
    const { id, ...updateData } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      )
    }

    // Get file info from database first to verify ownership
    const { data: fileData, error: fetchError } = await supabase
      .from('media_assets')
      .select('user_id')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching file:', fetchError)
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      )
    }

    if (!fileData) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (fileData.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to edit this file' },
        { status: 403 }
      )
    }

    // Update database record
    const { data, error: updateError } = await supabase
      .from('media_assets')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Database error:', updateError)
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('Error updating file:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update file' },
      { status: 500 }
    )
  }
} 