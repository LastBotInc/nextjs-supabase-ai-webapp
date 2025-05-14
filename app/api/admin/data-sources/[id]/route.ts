import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
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

    // 3. Service Role Operations Layer
    const supabase = await createClient(true);

    const { data: dataSource, error: fetchError } = await supabase
      .from('data_sources')
      .select('*')
      .eq('id', dataSourceId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') { // Not found
        return NextResponse.json({ error: 'Data source not found' }, { status: 404 });
      }
      console.error(`Error fetching data source ${dataSourceId}:`, fetchError);
      return NextResponse.json({ error: `Failed to fetch data source ${dataSourceId}` }, { status: 500 });
    }

    if (!dataSource) {
      return NextResponse.json({ error: 'Data source not found' }, { status: 404 });
    }

    return NextResponse.json(dataSource);

  } catch (err) {
    console.error('Unexpected error in GET /api/admin/data-sources/[id]:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 