import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Import cookies
import { createClient } from '@/utils/supabase/server'; // Assumes your server client factory

export async function GET(request: Request) {
  try {
    // 1. Token Verification Layer
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    // For authClient, it's okay if it falls back to createSupabaseClient if cookies() isn't strictly needed for getUser with token
    const authClient = await createClient(); 
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }
    console.log('[API /admin/data-sources] Authenticated User ID:', user.id);

    // 2. Admin Role Verification Layer
    // authClient here might also benefit from cookies() if profile check depends on session context not derived from token alone
    const { data: profile, error: profileError } = await authClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Error verifying admin status' }, { status: 500 });
    }
    console.log('[API /admin/data-sources] User admin status:', profile?.is_admin);

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // 3. Service Role Operations Layer
    const cookieStore = cookies(); // Get cookie store
    const supabase = await createClient(cookieStore, true); // Pass cookieStore and useServiceRole=true
    console.log('[API /admin/data-sources] Attempting to fetch data sources with service role client (using createServerClient from @supabase/ssr via cookies)...');

    const { data: dataSources, error: fetchError } = await supabase
      .from('data_sources')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('[API /admin/data-sources] Error fetching data sources:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch data sources' }, { status: 500 });
    }
    
    console.log('[API /admin/data-sources] Fetched data sources:', dataSources);
    console.log('[API /admin/data-sources] Count of fetched data sources:', dataSources?.length);


    return NextResponse.json(dataSources);

  } catch (err) {
    console.error('[API /admin/data-sources] Unexpected error in GET /api/admin/data-sources:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 