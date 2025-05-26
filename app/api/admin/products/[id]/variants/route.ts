import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // 3. Get product ID from params
    const { id } = await params;

    // 4. Use service role client for database operations
    const supabaseAdmin = createClient({ useServiceRole: true });

    // 5. Fetch variants for the product
    const { data: variants, error: variantsError } = await supabaseAdmin
      .from('product_variants')
      .select(`
        id,
        title,
        price,
        sku,
        inventory_quantity,
        shopify_variant_id
      `)
      .eq('product_id', id)
      .order('created_at', { ascending: true });

    if (variantsError) {
      console.error('❌ Error fetching variants:', variantsError);
      return NextResponse.json({ error: 'Failed to fetch variants' }, { status: 500 });
    }

    console.log(`✅ Fetched ${variants?.length || 0} variants for product ${id}`);

    return NextResponse.json({
      variants: variants || []
    });

  } catch (error) {
    console.error('❌ Unexpected error in variants API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 