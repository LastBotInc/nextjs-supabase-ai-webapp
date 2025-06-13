import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Shopify GraphQL client setup
const SHOPIFY_SHOP_DOMAIN = process.env.SHOPIFY_SHOP_DOMAIN;
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

interface ShopifyGraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: string[];
}

interface ShopifyGraphQLResponse {
  data?: any;
  errors?: ShopifyGraphQLError[];
}

async function shopifyGraphQL(query: string, variables: any = {}): Promise<any> {
  if (!SHOPIFY_SHOP_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
    throw new Error('Shopify credentials not configured');
  }

  const response = await fetch(`https://${SHOPIFY_SHOP_DOMAIN}/admin/api/2024-10/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
  }

  const result: ShopifyGraphQLResponse = await response.json();
  
  if (result.errors && result.errors.length > 0) {
    throw new Error(`Shopify GraphQL error: ${result.errors.map(e => e.message).join(', ')}`);
  }

  return result.data;
}

// Map internal metafield types to Shopify metafield types
function mapToShopifyType(internalType: string): string {
  const typeMap: Record<string, string> = {
    'text': 'single_line_text_field',
    'textarea': 'multi_line_text_field',
    'number': 'number_integer',
    'decimal': 'number_decimal',
    'boolean': 'boolean',
    'date': 'date',
    'datetime': 'date_time',
    'url': 'url',
    'json': 'json',
    'rich_text': 'rich_text_field',
    'color': 'color',
    'dimension': 'dimension',
    'weight': 'weight',
    'volume': 'volume',
    'money': 'money',
    'rating': 'rating',
    'product_reference': 'product_reference',
    'collection_reference': 'collection_reference',
    'file_reference': 'file_reference',
  };

  return typeMap[internalType] || 'single_line_text_field';
}

// POST /api/admin/metafields/shopify-sync - Sync metafield definitions to Shopify
export async function POST(request: Request) {
  try {
    console.log('\n📝 [POST /api/admin/metafields/shopify-sync]');

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

    // 3. Parse request body
    const { metafield_definition_ids } = await request.json();
    
    if (!metafield_definition_ids || !Array.isArray(metafield_definition_ids)) {
      return NextResponse.json(
        { error: 'metafield_definition_ids array is required' },
        { status: 400 }
      );
    }

    // 4. Fetch metafield definitions to sync
    const supabase = await createClient(undefined, true);
    const { data: metafields, error: fetchError } = await supabase
      .from('metafield_definitions')
      .select('*')
      .in('id', metafield_definition_ids)
      .is('shopify_definition_id', null) // Only sync those not yet in Shopify
      .eq('is_active', true);

    if (fetchError) {
      console.error('❌ Error fetching metafields:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch metafield definitions' }, { status: 500 });
    }

    if (!metafields || metafields.length === 0) {
      return NextResponse.json(
        { message: 'No metafield definitions found to sync' },
        { status: 200 }
      );
    }

    console.log(`🔄 Syncing ${metafields.length} metafield definitions to Shopify...`);

    const results = [];
    const errors = [];

    // 5. Sync each metafield definition to Shopify
    for (const metafield of metafields) {
      try {
        console.log(`🔄 Creating Shopify metafield definition: ${metafield.namespace}.${metafield.key}`);

        const shopifyType = mapToShopifyType(metafield.metafield_type);
        
        // Create metafield definition in Shopify
        const mutation = `
          mutation MetafieldDefinitionCreate($definition: MetafieldDefinitionInput!) {
            metafieldDefinitionCreate(definition: $definition) {
              createdDefinition {
                id
                name
                namespace
                key
                ownerType
                type {
                  name
                }
                description
                validations {
                  name
                  value
                }
              }
              userErrors {
                field
                message
                code
              }
            }
          }
        `;

        const variables = {
          definition: {
            name: metafield.name,
            namespace: metafield.namespace,
            key: metafield.key,
            ownerType: metafield.owner_type,
            type: shopifyType,
            description: metafield.description || null,
            validations: metafield.validation_rules ? Object.entries(metafield.validation_rules).map(([name, value]) => ({ name, value })) : [],
            access: {
              storefront: metafield.storefront_visible ? 'PUBLIC_READ' : 'PRIVATE'
            }
          }
        };

        const result = await shopifyGraphQL(mutation, variables);

        if (result.metafieldDefinitionCreate?.userErrors?.length > 0) {
          const errorMessages = result.metafieldDefinitionCreate.userErrors.map((error: any) => error.message).join(', ');
          console.error(`❌ Shopify error for ${metafield.namespace}.${metafield.key}:`, errorMessages);
          errors.push({
            metafield_id: metafield.id,
            namespace: metafield.namespace,
            key: metafield.key,
            error: errorMessages
          });
          continue;
        }

        const createdDefinition = result.metafieldDefinitionCreate?.createdDefinition;
        if (!createdDefinition) {
          console.error(`❌ No definition returned for ${metafield.namespace}.${metafield.key}`);
          errors.push({
            metafield_id: metafield.id,
            namespace: metafield.namespace,
            key: metafield.key,
            error: 'No definition returned from Shopify'
          });
          continue;
        }

        // Update local metafield definition with Shopify ID
        const { error: updateError } = await supabase
          .from('metafield_definitions')
          .update({
            shopify_definition_id: createdDefinition.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', metafield.id);

        if (updateError) {
          console.error(`❌ Error updating metafield ${metafield.id}:`, updateError);
          errors.push({
            metafield_id: metafield.id,
            namespace: metafield.namespace,
            key: metafield.key,
            error: `Failed to update local record: ${updateError.message}`
          });
          continue;
        }

        console.log(`✅ Successfully synced ${metafield.namespace}.${metafield.key} - Shopify ID: ${createdDefinition.id}`);
        results.push({
          metafield_id: metafield.id,
          namespace: metafield.namespace,
          key: metafield.key,
          shopify_definition_id: createdDefinition.id,
          status: 'success'
        });

      } catch (error) {
        console.error(`❌ Error syncing ${metafield.namespace}.${metafield.key}:`, error);
        errors.push({
          metafield_id: metafield.id,
          namespace: metafield.namespace,
          key: metafield.key,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`✅ Sync completed: ${results.length} success, ${errors.length} errors`);

    return NextResponse.json({
      message: `Sync completed: ${results.length} success, ${errors.length} errors`,
      results,
      errors
    });

  } catch (err) {
    console.error('❌ Unexpected error in POST /api/admin/metafields/shopify-sync:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// GET /api/admin/metafields/shopify-sync - Get sync status
export async function GET(request: Request) {
  try {
    console.log('\n📝 [GET /api/admin/metafields/shopify-sync]');

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

    // 3. Get sync status
    const supabase = await createClient(undefined, true);
    
    const [syncedResult, unsyncedResult] = await Promise.all([
      supabase
        .from('metafield_definitions')
        .select('count')
        .not('shopify_definition_id', 'is', null),
      supabase
        .from('metafield_definitions')
        .select('count')
        .is('shopify_definition_id', null)
        .eq('is_active', true)
    ]);

    const syncedCount = syncedResult.count || 0;
    const unsyncedCount = unsyncedResult.count || 0;

    console.log(`📊 Sync status: ${syncedCount} synced, ${unsyncedCount} unsynced`);

    return NextResponse.json({
      synced_count: syncedCount,
      unsynced_count: unsyncedCount,
      total_count: syncedCount + unsyncedCount,
      shopify_configured: !!(SHOPIFY_SHOP_DOMAIN && SHOPIFY_ADMIN_ACCESS_TOKEN)
    });

  } catch (err) {
    console.error('❌ Unexpected error in GET /api/admin/metafields/shopify-sync:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 