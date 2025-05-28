import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function DELETE(request: NextRequest) {
  try {
    console.log('\n🗑️ [DELETE /api/media/delete]');

    // 1. Authentication and Admin Check (Standard Pattern)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }
    const authClient = await createClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser(authHeader.split(' ')[1]);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const serviceRoleClient = createClient(undefined, true);
    const { data: profile, error: profileError } = await serviceRoleClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    if (profileError || !profile?.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 2. Get asset ID from request body
    const { assetId } = await request.json();
    if (!assetId) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 });
    }
    console.log('🗑️ Attempting to delete asset ID:', assetId);

    // 3. Fetch asset details to get storage_path
    const { data: asset, error: fetchError } = await serviceRoleClient
      .from('media_assets')
      .select('storage_path, filename')
      .eq('id', assetId)
      .single();

    if (fetchError || !asset) {
      console.error('❌ Asset not found or error fetching:', fetchError);
      return NextResponse.json({ error: 'Asset not found or failed to fetch details' }, { status: 404 });
    }

    // 4. Delete from Supabase Storage (if storage_path exists)
    if (asset.storage_path) {
      console.log('☁️ Deleting from Supabase Storage:', asset.storage_path);
      const { error: storageError } = await serviceRoleClient.storage
        .from('media')
        .remove([asset.storage_path]);
      // Note: .remove() expects an array of paths

      if (storageError) {
        // Log the error but proceed to delete from DB, as storage path might be invalid
        console.warn('⚠️ Error deleting from Supabase Storage (will still attempt DB delete):', storageError);
      } else {
        console.log('✅ Successfully deleted from Supabase Storage');
      }
    } else {
      console.warn('⚠️ No storage_path found for asset, skipping storage deletion. Filename:', asset.filename);
    }

    // 5. Delete from media_assets table in database
    console.log('💾 Deleting from media_assets table...');
    const { error: dbError } = await serviceRoleClient
      .from('media_assets')
      .delete()
      .eq('id', assetId);

    if (dbError) {
      console.error('❌ Error deleting from database:', dbError);
      return NextResponse.json({ error: 'Failed to delete media from database' }, { status: 500 });
    }

    console.log('✅ Media asset deleted successfully from database');
    return NextResponse.json({ success: true, message: 'Media asset deleted successfully' });

  } catch (error) {
    console.error('❌ Unexpected error in DELETE /api/media/delete:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 