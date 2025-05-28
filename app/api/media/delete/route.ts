import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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

    // After authentication, use service role client for database operations
    const supabase = await createClient(undefined, true)

    // Get file ID from URL params
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('id')

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      )
    }

    // Get file info from database first
    const { data: fileData, error: fetchError } = await supabase
      .from('media_assets')
      .select('storage_path, user_id')
      .eq('id', fileId)
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
        { error: 'Unauthorized to delete this file' },
        { status: 403 }
      )
    }

    // Delete from storage first
    const { error: storageError } = await supabase.storage
      .from('media')
      .remove([fileData.storage_path])

    if (storageError) {
      console.error('Storage error:', storageError)
      return NextResponse.json(
        { error: storageError.message },
        { status: 500 }
      )
    }

    // Delete database record
    const { error: dbError } = await supabase
      .from('media_assets')
      .delete()
      .eq('id', fileId)

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: dbError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Error deleting file:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to delete file' },
      { status: 500 }
    )
  }
} 