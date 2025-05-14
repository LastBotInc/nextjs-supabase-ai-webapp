import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { inngest } from '@/lib/inngest-client'; // Your Inngest client

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dataSourceId = params.id;
    if (!dataSourceId) {
      return NextResponse.json({ error: 'Data source ID is required' }, { status: 400 });
    }

    // 1. Token Verification Layer
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const authClient = await createClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // 2. Admin Role Verification Layer
    const { data: profile, error: profileError } = await authClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Error verifying admin status' }, { status: 500 });
    }

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // 3. Fetch Data Source to ensure it exists and get its details
    const supabase = await createClient(true); // Service role for fetching source details
    const { data: dataSource, error: fetchError } = await supabase
      .from('data_sources')
      .select('id, identifier, feed_url, feed_type, detected_schema, name, status') // Select necessary fields
      .eq('id', dataSourceId)
      .single();

    if (fetchError || !dataSource) {
      if (fetchError?.code === 'PGRST116' || !dataSource) { // Not found
        return NextResponse.json({ error: 'Data source not found' }, { status: 404 });
      }
      console.error(`Error fetching data source ${dataSourceId} before triggering sync:`, fetchError);
      return NextResponse.json({ error: 'Failed to fetch data source details' }, { status: 500 });
    }
    
    if (dataSource.status === 'inactive') {
        return NextResponse.json({ message: `Data source ${dataSource.name || dataSource.identifier} is inactive. Sync not triggered.` }, { status: 400 });
    }

    // 4. Send Inngest event
    try {
      await inngest.send({
        name: 'app/data.source.sync.requested',
        data: {
          dataSourceId: dataSource.id,
          feedUrl: dataSource.feed_url,
          feedType: dataSource.feed_type,
          identifier: dataSource.identifier,
          // Include other relevant fields from the dataSource object if needed by the sync function
        },
        user: { id: user.id } // Pass the admin user who triggered it
      });
    } catch (inngestError) {
      console.error(`Error sending Inngest event for data source ${dataSourceId}:`, inngestError);
      return NextResponse.json({ error: 'Failed to trigger sync event' }, { status: 500 });
    }

    return NextResponse.json({ message: `Sync triggered for data source: ${dataSource.name || dataSource.identifier}` });

  } catch (err) {
    console.error('Unexpected error in POST /api/admin/data-sources/[id]/trigger-sync:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 