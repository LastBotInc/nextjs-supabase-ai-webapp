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
    const supabaseAdmin = createClient(undefined, true);

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
        featured_image,
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

export async function POST(request: Request) {
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

    // 3. Parse request body
    const body = await request.json();
    const { title, description_html, vendor, product_type, tags, handle, status, featured_image } = body;

    // 4. Validate required fields
    if (!title || !handle) {
      return NextResponse.json({ error: 'Title and handle are required' }, { status: 400 });
    }

    // 5. Use service role client for database operations
    const supabaseAdmin = createClient(undefined, true);

    // 6. Check if handle already exists
    const { data: existingProduct } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('handle', handle)
      .single();

    if (existingProduct) {
      return NextResponse.json({ error: 'A product with this handle already exists' }, { status: 400 });
    }

    // 7. Create the product
    const { data: product, error: createError } = await supabaseAdmin
      .from('products')
      .insert({
        title,
        description_html: description_html || '',
        vendor: vendor || null,
        product_type: product_type || null,
        tags: tags || [],
        handle,
        status: status || 'draft',
        featured_image: featured_image || null
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating product:', createError);
      return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }

    console.log(`✅ Created product: ${product.title} (ID: ${product.id})`);

    return NextResponse.json({
      data: product,
      message: 'Product created successfully'
    });

  } catch (error) {
    console.error('❌ Unexpected error in products POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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

    // 3. Parse request body
    const body = await request.json();
    const { id, title, description_html, vendor, product_type, tags, handle, status, featured_image } = body;

    // 4. Validate required fields
    if (!id || !title || !handle) {
      return NextResponse.json({ error: 'ID, title and handle are required' }, { status: 400 });
    }

    // 5. Use service role client for database operations
    const supabaseAdmin = createClient(undefined, true);

    // 6. Check if handle already exists for a different product
    const { data: existingProduct } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('handle', handle)
      .neq('id', id)
      .single();

    if (existingProduct) {
      return NextResponse.json({ error: 'A product with this handle already exists' }, { status: 400 });
    }

    // 7. Update the product
    const { data: product, error: updateError } = await supabaseAdmin
      .from('products')
      .update({
        title,
        description_html: description_html || '',
        vendor: vendor || null,
        product_type: product_type || null,
        tags: tags || [],
        handle,
        status: status || 'draft',
        featured_image: featured_image || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating product:', updateError);
      return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }

    console.log(`✅ Updated product: ${product.title} (ID: ${product.id})`);

    return NextResponse.json({
      data: product,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('❌ Unexpected error in products PUT API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 