import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    // 1. Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - Missing token' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.log('❌ Invalid token:', authError?.message);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    // 2. Check admin permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      console.log('❌ User is not admin:', user.id);
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    // 3. Parse query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('perPage') || '20');
    const offset = (page - 1) * perPage;

    // 4. Use service role client for database operations
    const supabaseAdmin = createClient({ useServiceRole: true });

    // 5. Get total count
    const { count, error: countError } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error getting product count:', countError);
      return NextResponse.json({ error: 'Failed to get product count' }, { status: 500 });
    }

    // 6. Fetch products with pagination
    const { data: products, error: productsError } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        title,
        description_html,
        vendor,
        product_type,
        status,
        shopify_product_id,
        created_at,
        updated_at,
        product_images(
          id,
          url,
          alt_text,
          position
        )
      `)
      .order('updated_at', { ascending: false })
      .range(offset, offset + perPage - 1);

    if (productsError) {
      console.error('❌ Error fetching products:', productsError);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    console.log(`✅ Fetched ${products?.length || 0} products (page ${page})`);

    return NextResponse.json({
      products: products || [],
      total: count || 0,
      page,
      perPage,
      hasMore: (products?.length || 0) === perPage
    });

  } catch (error) {
    console.error('❌ Unexpected error in products API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 