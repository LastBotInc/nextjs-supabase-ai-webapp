import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface MetafieldDefinition {
  name: string;
  namespace: string;
  key: string;
  owner_type: string;
  metafield_type: string;
  description?: string;
  validation_rules?: any;
  storefront_visible?: boolean;
  source_identifier?: string;
}

// GET /api/admin/metafields - List metafield definitions
export async function GET(request: Request) {
  try {
    console.log('\n📝 [GET /api/admin/metafields]');

    // 1. Authentication
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
      console.error('❌ Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // 2. Admin verification
    const { data: profile, error: profileError } = await authClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Error verifying admin status' }, { status: 500 });
    }

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // 3. Extract query parameters
    const { searchParams } = new URL(request.url);
    const owner_type = searchParams.get('owner_type');
    const namespace = searchParams.get('namespace');
    const source_identifier = searchParams.get('source_identifier');
    const auto_generated = searchParams.get('auto_generated');

    // 4. Fetch metafield definitions
    const supabase = await createClient(undefined, true);
    let query = supabase
      .from('metafield_definitions')
      .select(`
        *,
        created_by_profile:profiles!metafield_definitions_created_by_fkey(
          id,
          full_name,
          username
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (owner_type) {
      query = query.eq('owner_type', owner_type);
    }
    if (namespace) {
      query = query.eq('namespace', namespace);
    }
    if (source_identifier) {
      query = query.eq('source_identifier', source_identifier);
    }
    if (auto_generated !== null) {
      query = query.eq('auto_generated', auto_generated === 'true');
    }

    const { data: metafields, error: fetchError } = await query;

    if (fetchError) {
      console.error('❌ Error fetching metafields:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch metafield definitions' }, { status: 500 });
    }

    console.log(`✅ Fetched ${metafields?.length || 0} metafield definitions`);
    return NextResponse.json(metafields);

  } catch (err) {
    console.error('❌ Unexpected error in GET /api/admin/metafields:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/admin/metafields - Create metafield definition
export async function POST(request: Request) {
  try {
    console.log('\n📝 [POST /api/admin/metafields]');

    // 1. Authentication
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
      console.error('❌ Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // 2. Admin verification
    const { data: profile, error: profileError } = await authClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Error verifying admin status' }, { status: 500 });
    }

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // 3. Parse and validate request body
    const body: MetafieldDefinition = await request.json();
    
    if (!body.name || !body.namespace || !body.key || !body.owner_type || !body.metafield_type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, namespace, key, owner_type, metafield_type' },
        { status: 400 }
      );
    }

    // Validate owner_type
    const validOwnerTypes = ['PRODUCT', 'COLLECTION', 'ARTICLE', 'BLOG', 'PAGE', 'CUSTOMER', 'ORDER', 'DRAFT_ORDER', 'COMPANY', 'COMPANY_LOCATION', 'LOCATION'];
    if (!validOwnerTypes.includes(body.owner_type)) {
      return NextResponse.json(
        { error: `Invalid owner_type. Must be one of: ${validOwnerTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // 4. Check for existing definition
    const supabase = await createClient(undefined, true);
    const { data: existing } = await supabase
      .from('metafield_definitions')
      .select('id')
      .eq('namespace', body.namespace)
      .eq('key', body.key)
      .eq('owner_type', body.owner_type)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Metafield definition with this namespace, key, and owner_type already exists' },
        { status: 409 }
      );
    }

    // 5. Create metafield definition
    const { data: metafield, error: createError } = await supabase
      .from('metafield_definitions')
      .insert({
        ...body,
        created_by: user.id,
        auto_generated: body.source_identifier ? true : false
      })
      .select(`
        *,
        created_by_profile:profiles!metafield_definitions_created_by_fkey(
          id,
          full_name,
          username
        )
      `)
      .single();

    if (createError) {
      console.error('❌ Error creating metafield definition:', createError);
      return NextResponse.json({ error: 'Failed to create metafield definition' }, { status: 500 });
    }

    console.log('✅ Created metafield definition:', metafield.id);
    return NextResponse.json(metafield, { status: 201 });

  } catch (err) {
    console.error('❌ Unexpected error in POST /api/admin/metafields:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 