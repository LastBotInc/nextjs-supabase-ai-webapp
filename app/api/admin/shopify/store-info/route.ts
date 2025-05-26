import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { shopifyApi, Session, ApiVersion } from '@shopify/shopify-api';
import { restResources } from '@shopify/shopify-api/rest/admin/2025-04';
import '@shopify/shopify-api/adapters/node';

interface ShopifyStoreInfo {
  isConfigured: boolean;
  shopDomain?: string;
  shopName?: string;
  productCount?: number;
  lastSyncAt?: string;
  connectionStatus: 'connected' | 'error' | 'not_configured';
  error?: string;
}

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

    // 3. Check Shopify Configuration
    const shopifyShopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
    const adminAccessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    const apiKey = process.env.SHOPIFY_API_KEY;
    const apiSecret = process.env.SHOPIFY_API_SECRET;

    console.log('Shopify Environment Check:', {
      shopDomain: shopifyShopDomain ? 'SET' : 'MISSING',
      accessToken: adminAccessToken ? 'SET' : 'MISSING',
      apiKey: apiKey ? 'SET' : 'MISSING',
      apiSecret: apiSecret ? 'SET' : 'MISSING'
    });

    const storeInfo: ShopifyStoreInfo = {
      isConfigured: !!(shopifyShopDomain && adminAccessToken && apiKey && apiSecret),
      shopDomain: shopifyShopDomain,
      connectionStatus: 'not_configured'
    };

    if (!storeInfo.isConfigured) {
      return NextResponse.json(storeInfo);
    }

    try {
      // 4. Initialize Shopify API Client
      const shopify = shopifyApi({
        apiKey: apiKey!,
        apiSecretKey: apiSecret!,
        scopes: ['read_products', 'read_orders'],
        hostName: shopifyShopDomain!.replace(/https?:\/\//, ''),
        apiVersion: ApiVersion.April25,
        isCustomStoreApp: true,
        isEmbeddedApp: false,
        adminApiAccessToken: adminAccessToken!,
        restResources,
      });

      const shopifySession = new Session({
        shop: shopifyShopDomain!,
        accessToken: adminAccessToken!,
        isOnline: false,
        id: `admin-store-info-session-${shopifyShopDomain}`,
        state: `admin-store-info-state-${shopifyShopDomain}`
      });

      // 5. Fetch Shop Information using GraphQL
      const client = new shopify.clients.Graphql({ session: shopifySession });
      
      const shopQuery = `
        query {
          shop {
            name
            myshopifyDomain
            plan {
              displayName
            }
          }
        }
      `;

      const response = await client.query({ data: { query: shopQuery } });
      
      if (!response || typeof response.body !== 'object' || response.body === null) {
        throw new Error('Invalid response from Shopify API');
      }

      const body = response.body as { errors?: any[], data?: any };

      if (body.errors && body.errors.length > 0) {
        console.error('Shopify GraphQL Query returned errors:', body.errors);
        throw new Error(`Shopify API error: ${body.errors.map((e: any) => e.message).join('; ')}`);
      }

      if (!body.data) {
        throw new Error('No data returned from Shopify API');
      }

      // 6. Get product count using REST API
      const restClient = new shopify.clients.Rest({ session: shopifySession });
      const productCountResponse = await restClient.get({
        path: 'products/count',
      });

      const productCount = (productCountResponse.body as any)?.count || 0;

      // 7. Get last sync information from our database
      const supabase = await createClient(true); // Service role
      const { data: lastSync } = await supabase
        .from('external_product_mappings')
        .select('updated_at')
        .eq('external_source_name', 'shopify')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      storeInfo.shopName = body.data.shop.name;
      storeInfo.productCount = productCount;
      storeInfo.lastSyncAt = lastSync?.updated_at || null;
      storeInfo.connectionStatus = 'connected';

    } catch (shopifyError) {
      console.error('Error connecting to Shopify:', shopifyError);
      storeInfo.connectionStatus = 'error';
      storeInfo.error = shopifyError instanceof Error ? shopifyError.message : 'Unknown Shopify API error';
    }

    return NextResponse.json(storeInfo);

  } catch (err) {
    console.error('Unexpected error in GET /api/admin/shopify/store-info:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 