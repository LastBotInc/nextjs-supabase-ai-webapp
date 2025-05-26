import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface SyncProductsRequest {
  limit?: number;
  force?: boolean; // Force re-sync even if products exist
}

interface SyncResult {
  success: boolean;
  message: string;
  stats: {
    total: number;
    created: number;
    updated: number;
    errors: number;
  };
  errors?: string[];
}

interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  images: {
    edges: Array<{
      node: {
        id: string;
        url: string;
        altText?: string;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: string;
        compareAtPrice?: string;
        sku?: string;
        inventoryQuantity: number;
      };
    }>;
  };
}

export async function POST(request: Request) {
  try {
    console.log('\n📝 [POST /api/admin/shopify/sync-products] Starting product sync...');

    // 1. Parse request body
    const body: SyncProductsRequest = await request.json();
    const { limit = 50, force = false } = body;

    console.log('📋 Sync options:', { limit, force });

    // 2. Check admin authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ No authorization header found');
      return NextResponse.json({ error: 'Unauthorized - Missing token' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.log('❌ Invalid token:', authError?.message);
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      console.log('❌ User is not admin:', user.id);
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    // Create service role client for database operations (bypasses RLS)
    const supabaseAdmin = createClient(undefined, true);

    console.log('✅ Admin authentication successful');

    // 3. Check Shopify Configuration
    const shopifyShopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
    const adminAccessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!shopifyShopDomain || !adminAccessToken) {
      console.log('❌ Shopify configuration missing');
      return NextResponse.json({
        success: false,
        error: 'Shopify configuration missing. Please set SHOPIFY_SHOP_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN environment variables.',
        stats: { total: 0, created: 0, updated: 0, errors: 1 }
      }, { status: 400 });
    }

    console.log('✅ Shopify configuration found');

    // 4. Use direct GraphQL fetch instead of Shopify API library
    const shopifyGraphQLUrl = `https://${shopifyShopDomain}/admin/api/2024-10/graphql.json`;
    
    const graphqlHeaders = {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminAccessToken,
    };
    
    const productsQuery = `
      query getProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
              description
              vendor
              productType
              tags
              status
              createdAt
              updatedAt
              images(first: 5) {
                edges {
                  node {
                    id
                    url
                    altText
                  }
                }
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price
                    compareAtPrice
                    sku
                    inventoryQuantity
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    console.log('🔍 Fetching products from Shopify...');
    const response = await fetch(shopifyGraphQLUrl, {
      method: 'POST',
      headers: graphqlHeaders,
      body: JSON.stringify({
        query: productsQuery,
        variables: { first: limit }
      })
    });

    if (!response.ok) {
      throw new Error(`Shopify GraphQL API error: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    
    if (responseData.errors) {
      console.error('❌ GraphQL errors:', responseData.errors);
      throw new Error(`Shopify GraphQL errors: ${JSON.stringify(responseData.errors)}`);
    }
    
    if (!responseData || !responseData.data) {
      console.error('❌ Invalid response structure:', responseData);
      throw new Error(`Invalid response from Shopify GraphQL API: ${JSON.stringify(responseData)}`);
    }

    const products: ShopifyProduct[] = responseData.data.products.edges.map((edge: any) => edge.node);
    console.log(`📦 Found ${products.length} products from Shopify`);

    // 7. Sync products to database
    const stats = {
      total: products.length,
      created: 0,
      updated: 0,
      errors: 0
    };

    const errors: string[] = [];

    for (const product of products) {
      try {
        // Extract Shopify ID from GID
        const shopifyId = product.id.split('/').pop();
        if (!shopifyId) {
          throw new Error(`Invalid Shopify product ID: ${product.id}`);
        }
        
        const shopifyProductId = parseInt(shopifyId);
        
        // Check if product exists
        const { data: existingProduct } = await supabaseAdmin
          .from('products')
          .select('id')
          .eq('shopify_product_id', shopifyProductId)
          .single();

        const productData = {
          shopify_product_id: shopifyProductId,
          title: product.title,
          handle: product.handle,
          description_html: product.description || '',
          vendor: product.vendor || '',
          product_type: product.productType || '',
          tags: product.tags || [],
          status: product.status.toLowerCase(),
          updated_at: new Date().toISOString()
        };

        if (existingProduct && !force) {
          // Update existing product
          const { error: updateError } = await supabaseAdmin
            .from('products')
            .update(productData)
            .eq('shopify_product_id', shopifyProductId);

          if (updateError) {
            console.error(`❌ Error updating product ${product.title}:`, updateError);
            errors.push(`Failed to update product ${product.title}: ${updateError.message}`);
            stats.errors++;
          } else {
            console.log(`✅ Updated product: ${product.title}`);
            stats.updated++;

            // Sync images for updated product
            if (product.images.edges.length > 0) {
              await syncProductImages(supabaseAdmin, existingProduct.id, product.images.edges);
            }

            // Sync variants for updated product too
            if (product.variants.edges.length > 0) {
              for (const variantEdge of product.variants.edges) {
                const variant = variantEdge.node;
                const variantShopifyId = variant.id.split('/').pop();
                
                if (!variantShopifyId) {
                  console.error(`❌ Invalid variant ID: ${variant.id}`);
                  continue;
                }

                // Check if variant already exists
                const { data: existingVariant } = await supabaseAdmin
                  .from('product_variants')
                  .select('id')
                  .eq('shopify_variant_id', parseInt(variantShopifyId))
                  .single();

                const variantData = {
                  product_id: existingProduct.id,
                  shopify_variant_id: parseInt(variantShopifyId),
                  title: variant.title,
                  price: parseFloat(variant.price),
                  compare_at_price: variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : null,
                  sku: variant.sku || null,
                  inventory_quantity: variant.inventoryQuantity || 0,
                  weight: null,
                  weight_unit: null,
                  updated_at: new Date().toISOString()
                };

                if (existingVariant) {
                  // Update existing variant
                  const { error: variantUpdateError } = await supabaseAdmin
                    .from('product_variants')
                    .update(variantData)
                    .eq('shopify_variant_id', parseInt(variantShopifyId));

                  if (variantUpdateError) {
                    console.error(`❌ Error updating variant for ${product.title}:`, variantUpdateError);
                    errors.push(`Failed to update variant for ${product.title}: ${variantUpdateError.message}`);
                  }
                } else {
                  // Create new variant
                  const { error: variantError } = await supabaseAdmin
                    .from('product_variants')
                    .insert({
                      ...variantData,
                      created_at: new Date().toISOString()
                    });

                  if (variantError) {
                    console.error(`❌ Error creating variant for ${product.title}:`, variantError);
                    errors.push(`Failed to create variant for ${product.title}: ${variantError.message}`);
                  }
                }
              }
            }
          }
        } else {
          // Create new product
          const { data: newProduct, error: insertError } = await supabaseAdmin
            .from('products')
            .insert({
              ...productData,
              created_at: new Date().toISOString()
            })
            .select('id')
            .single();

          if (insertError) {
            console.error(`❌ Error creating product ${product.title}:`, insertError);
            errors.push(`Failed to create product ${product.title}: ${insertError.message}`);
            stats.errors++;
          } else {
            console.log(`✅ Created product: ${product.title}`);
            stats.created++;

            // Sync images for new product
            if (product.images.edges.length > 0) {
              await syncProductImages(supabaseAdmin, newProduct.id, product.images.edges);
            }

            // Sync variants if product was created successfully
            if (newProduct && product.variants.edges.length > 0) {
              for (const variantEdge of product.variants.edges) {
                const variant = variantEdge.node;
                const variantShopifyId = variant.id.split('/').pop();
                
                if (!variantShopifyId) {
                  console.error(`❌ Invalid variant ID: ${variant.id}`);
                  continue;
                }

                const variantData = {
                  product_id: newProduct.id,
                  shopify_variant_id: parseInt(variantShopifyId),
                  title: variant.title,
                  price: parseFloat(variant.price),
                  compare_at_price: variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : null,
                  sku: variant.sku || null,
                  inventory_quantity: variant.inventoryQuantity || 0,
                  weight: null, // Weight not available in this API version
                  weight_unit: null, // Weight unit not available in this API version
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                };

                const { error: variantError } = await supabaseAdmin
                  .from('product_variants')
                  .insert(variantData);

                if (variantError) {
                  console.error(`❌ Error creating variant for ${product.title}:`, variantError);
                  errors.push(`Failed to create variant for ${product.title}: ${variantError.message}`);
                }
              }
            }
          }
        }
      } catch (productError) {
        console.error(`❌ Error processing product ${product.title}:`, productError);
        errors.push(`Failed to process product ${product.title}: ${productError instanceof Error ? productError.message : 'Unknown error'}`);
        stats.errors++;
      }
    }

    // 8. Update last sync timestamp
    const { error: syncUpdateError } = await supabaseAdmin
      .from('data_sources')
      .update({ 
        last_fetched_at: new Date().toISOString(),
        status: 'active'
      })
      .eq('identifier', 'shopify-products');

    if (syncUpdateError) {
      console.log('⚠️ Could not update sync timestamp:', syncUpdateError.message);
    }

    console.log('📊 Sync completed:', stats);

    const result: SyncResult = {
      success: stats.errors === 0 || stats.created > 0 || stats.updated > 0,
      message: `Sync completed: ${stats.created} created, ${stats.updated} updated, ${stats.errors} errors`,
      stats,
      errors: errors.length > 0 ? errors : undefined
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Unexpected error in sync products API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        stats: { total: 0, created: 0, updated: 0, errors: 1 }
      },
      { status: 500 }
    );
  }
}

// Helper function to sync product images
async function syncProductImages(
  supabaseAdmin: any,
  productId: string,
  imageEdges: Array<{ node: { id: string; url: string; altText?: string } }>
) {
  try {
    // Delete existing images for this product
    await supabaseAdmin
      .from('product_images')
      .delete()
      .eq('product_id', productId);

    // Insert new images
    const imageData = imageEdges.map((edge, index) => {
      const shopifyImageId = edge.node.id.split('/').pop();
      return {
        product_id: productId,
        shopify_image_id: shopifyImageId,
        url: edge.node.url,
        alt_text: edge.node.altText || null,
        position: index
      };
    });

    if (imageData.length > 0) {
      const { error: imageError } = await supabaseAdmin
        .from('product_images')
        .insert(imageData);

      if (imageError) {
        console.error(`❌ Error syncing images for product ${productId}:`, imageError);
      } else {
        console.log(`✅ Synced ${imageData.length} images for product ${productId}`);
      }
    }
  } catch (error) {
    console.error(`❌ Error in syncProductImages:`, error);
  }
} 