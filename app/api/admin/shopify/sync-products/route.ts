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

// Helper function to upload local image to Shopify using staged uploads
async function uploadLocalImageToShopify(shopifyGraphQLUrl: string, headers: any, imageUrl: string, filename: string): Promise<string | null> {
  try {
    console.log(`📤 Starting staged upload for local image: ${filename}`);
    
    // First, fetch the local image to get its content and metadata
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error(`❌ Failed to fetch local image: ${imageResponse.statusText}`);
      return null;
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const fileSize = imageBuffer.byteLength;
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
    
    console.log(`📊 Image metadata: ${fileSize} bytes, ${mimeType}`);
    
    // Step 1: Create staged upload target
    const stagedUploadMutation = `
      mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
        stagedUploadsCreate(input: $input) {
          stagedTargets {
            url
            resourceUrl
            parameters {
              name
              value
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const stagedUploadResponse = await fetch(shopifyGraphQLUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: stagedUploadMutation,
        variables: {
          input: [{
            filename: filename,
            mimeType: mimeType,
            resource: 'IMAGE',
            httpMethod: 'POST',
            fileSize: fileSize.toString()
          }]
        }
      })
    });

    const stagedUploadResult = await stagedUploadResponse.json();
    
    if (!stagedUploadResult.data?.stagedUploadsCreate || stagedUploadResult.data.stagedUploadsCreate.userErrors?.length > 0) {
      console.error('❌ Error creating staged upload:', stagedUploadResult.data?.stagedUploadsCreate?.userErrors);
      return null;
    }

    const stagedTarget = stagedUploadResult.data.stagedUploadsCreate.stagedTargets[0];
    if (!stagedTarget) {
      console.error('❌ No staged target returned');
      return null;
    }

    console.log(`✅ Staged upload target created: ${stagedTarget.url}`);

    // Step 2: Upload file to Shopify's cloud storage
    const formData = new FormData();
    
    // Add all the required parameters
    stagedTarget.parameters.forEach((param: any) => {
      formData.append(param.name, param.value);
    });
    
    // Add the file itself
    const blob = new Blob([imageBuffer], { type: mimeType });
    formData.append('file', blob, filename);

    const uploadResponse = await fetch(stagedTarget.url, {
      method: 'POST',
      body: formData
    });

    if (!uploadResponse.ok) {
      console.error(`❌ Failed to upload to staged target: ${uploadResponse.status} ${uploadResponse.statusText}`);
      return null;
    }

    console.log(`✅ File uploaded successfully to Shopify cloud storage`);
    console.log(`🔗 Shopify resource URL: ${stagedTarget.resourceUrl}`);
    return stagedTarget.resourceUrl;

  } catch (error) {
    console.error('❌ Error in staged upload process:', error);
    return null;
  }
}

// Helper function to validate and convert image URL
function validateAndConvertImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) {
    return null;
  }

  console.log('🖼️ Original image URL:', imageUrl);

  // Handle Supabase storage URLs - convert localhost to production
  if (imageUrl.includes('/storage/v1/object/public/')) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    if (!supabaseUrl || supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost')) {
      console.log('⚠️ Local Supabase URL detected - will use staged upload');
      return imageUrl; // Return as-is, will be handled by staged upload
    }

    // Extract the storage path
    const storagePathMatch = imageUrl.match(/\/storage\/v1\/object\/public\/(.+)$/);
    if (storagePathMatch) {
      const storagePath = storagePathMatch[1];
      const productionUrl = `${supabaseUrl}/storage/v1/object/public/${storagePath}`;
      console.log('🔗 Converted Supabase URL to production:', productionUrl);
      return productionUrl;
    }
  }

  // If it's a relative URL, convert to absolute
  if (imageUrl.startsWith('/')) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://localhost:3000';
    const absoluteUrl = `${baseUrl}${imageUrl}`;
    console.log('🔗 Converted relative URL to absolute:', absoluteUrl);
    return absoluteUrl;
  }

  // If it's already absolute, validate it
  try {
    const url = new URL(imageUrl);
    
    // Check if it's a localhost URL that needs staged upload
    if ((url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
      console.log('⚠️ Localhost URL detected - will use staged upload');
      return imageUrl; // Return as-is, will be handled by staged upload
    }

    // Prefer HTTPS for Shopify, but allow HTTP for development
    if (url.protocol !== 'https:' && !imageUrl.includes('localhost')) {
      console.log('⚠️ Non-HTTPS URL (may not work in Shopify):', imageUrl);
    }

    console.log('✅ Valid absolute URL:', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('❌ Invalid URL:', imageUrl, error);
    return null;
  }
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

// PUT method - Sync local products to Shopify
export async function PUT(request: Request) {
  try {
    console.log('\n📝 [PUT /api/admin/shopify/sync-products] Starting local to Shopify product sync...');

    // 1. Check admin authentication
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

    // Create service role client for database operations
    const supabaseAdmin = createClient(undefined, true);
    console.log('✅ Admin authentication successful');

    // 2. Check Shopify Configuration
    const shopifyShopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
    const adminAccessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!shopifyShopDomain || !adminAccessToken) {
      console.log('❌ Shopify configuration missing');
      return NextResponse.json({
        success: false,
        error: 'Shopify configuration missing',
        stats: { processed: 0, created: 0, updated: 0, errors: 1 }
      }, { status: 400 });
    }

    const shopifyGraphQLUrl = `https://${shopifyShopDomain}/admin/api/2024-10/graphql.json`;
    const graphqlHeaders = {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminAccessToken,
    };

    console.log('✅ Shopify configuration found');

    // 3. Fetch local products that need to be synced
    const { data: localProducts, error: fetchError } = await supabaseAdmin
      .from('products')
      .select(`
        id,
        title,
        handle,
        description_html,
        vendor,
        product_type,
        status,
        tags,
        shopify_product_id,
        featured_image,
        product_images(
          id,
          url,
          alt_text,
          position
        ),
        product_variants(
          id,
          title,
          price,
          compare_at_price,
          sku,
          inventory_quantity,
          shopify_variant_id
        )
      `)
      .order('updated_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching local products:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch local products',
        stats: { processed: 0, created: 0, updated: 0, errors: 1 }
      }, { status: 500 });
    }

    console.log(`📦 Found ${localProducts?.length || 0} local products to sync`);

    const stats = {
      processed: 0,
      created: 0,
      updated: 0,
      errors: 0,
      errorDetails: [] as string[]
    };

    // 4. Process each product
    for (const product of localProducts || []) {
      try {
        console.log(`\n📄 Processing product: ${product.title} (${product.id})`);
        stats.processed++;

        if (product.shopify_product_id) {
          // Update existing product
          await updateShopifyProduct(
            shopifyGraphQLUrl,
            graphqlHeaders,
            supabaseAdmin,
            product,
            stats,
            user.id
          );
        } else {
          // Create new product
          await createShopifyProduct(
            shopifyGraphQLUrl,
            graphqlHeaders,
            supabaseAdmin,
            product,
            stats,
            user.id
          );
        }
      } catch (error) {
        console.error(`❌ Error processing product: ${product.title}`, error);
        stats.errors++;
        stats.errorDetails.push(`${product.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log('\n✅ Local to Shopify product sync completed:', stats);

    return NextResponse.json({
      success: true,
      message: `Sync completed: ${stats.created} created, ${stats.updated} updated, ${stats.errors} errors`,
      stats
    });

  } catch (error) {
    console.error('❌ Unexpected error in product sync:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stats: { processed: 0, created: 0, updated: 0, errors: 1 }
    }, { status: 500 });
  }
}

// Helper function to create new product in Shopify
async function createShopifyProduct(
  shopifyGraphQLUrl: string,
  headers: any,
  supabase: any,
  product: any,
  stats: any,
  userId: string
) {
  console.log(`➕ Creating new product: ${product.title}`);

  // Handle image upload if present
  let productImages: any[] = [];
  
  // First, check if there's a featured_image
  if (product.featured_image) {
    console.log(`🖼️ Processing featured_image: ${product.featured_image}`);
    const validatedUrl = validateAndConvertImageUrl(product.featured_image);
    
    if (validatedUrl) {
      console.log(`✅ Validated URL: ${validatedUrl}`);
      let finalImageUrl = validatedUrl;
      
      // Check if this is a localhost URL that needs staged upload
      if (validatedUrl.includes('127.0.0.1') || validatedUrl.includes('localhost')) {
        console.log('🔄 Local featured image detected, using staged upload process...');
        const filename = `product-${product.id}-featured-${Date.now()}.jpg`;
        const uploadedUrl = await uploadLocalImageToShopify(shopifyGraphQLUrl, headers, validatedUrl, filename);
        
        if (uploadedUrl) {
          console.log(`✅ Staged upload successful: ${uploadedUrl}`);
          finalImageUrl = uploadedUrl;
        } else {
          console.log('⚠️ Staged upload failed for featured image, skipping');
        }
      }
      
      console.log(`🔍 Checking condition: (!${validatedUrl.includes('localhost')} && !${validatedUrl.includes('127.0.0.1')}) || ${finalImageUrl !== validatedUrl}`);
      console.log(`🔍 Condition result: ${(!validatedUrl.includes('localhost') && !validatedUrl.includes('127.0.0.1')) || finalImageUrl !== validatedUrl}`);
      
      // Only add the image if it's not a localhost URL OR if staged upload succeeded
      if ((!validatedUrl.includes('localhost') && !validatedUrl.includes('127.0.0.1')) || finalImageUrl !== validatedUrl) {
        console.log(`✅ Adding featured image to productImages: ${finalImageUrl}`);
        productImages.push({
          url: finalImageUrl,
          altText: product.title || 'Product image'
        });
      } else {
        console.log(`❌ Featured image NOT added - condition failed`);
      }
    } else {
      console.log(`❌ Featured image validation failed`);
    }
  } else {
    console.log(`ℹ️ No featured_image found for product`);
  }
  
  // Then, check product_images table
  if (product.product_images && product.product_images.length > 0) {
    for (const image of product.product_images) {
      const validatedUrl = validateAndConvertImageUrl(image.url);
      
      if (validatedUrl) {
        let finalImageUrl = validatedUrl;
        
        // Check if this is a localhost URL that needs staged upload
        if (validatedUrl.includes('127.0.0.1') || validatedUrl.includes('localhost')) {
          console.log('🔄 Local image detected, using staged upload process...');
          const filename = `product-${product.id}-${Date.now()}-${image.position || 0}.jpg`;
          const uploadedUrl = await uploadLocalImageToShopify(shopifyGraphQLUrl, headers, validatedUrl, filename);
          
          if (uploadedUrl) {
            finalImageUrl = uploadedUrl;
          } else {
            console.log('⚠️ Staged upload failed, skipping image');
            continue;
          }
        }
        
        productImages.push({
          url: finalImageUrl,
          altText: image.alt_text || ''
        });
      }
    }
  }

  const productInput = {
    title: product.title,
    handle: product.handle,
    descriptionHtml: product.description_html || '',
    vendor: product.vendor || '',
    productType: product.product_type || '',
    tags: product.tags || [],
    status: product.status?.toUpperCase() || 'DRAFT'
    // Note: images field removed from ProductInput as it's not supported
  };

  // Prepare media input for images (separate from product input)
  const mediaInput = productImages.length > 0 ? productImages.map(image => ({
    originalSource: image.url,
    alt: image.altText,
    mediaContentType: 'IMAGE'
  })) : [];

  console.log('📤 Sending product input to Shopify:', {
    ...productInput,
    descriptionHtml: `${productInput.descriptionHtml.substring(0, 100)}...`,
    mediaCount: mediaInput.length
  });

  const createMutation = `
    mutation CreateProduct($input: ProductInput!, $media: [CreateMediaInput!]) {
      productCreate(input: $input, media: $media) {
        product {
          id
          title
          handle
          status
          images(first: 10) {
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
                sku
                inventoryQuantity
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const response = await fetch(shopifyGraphQLUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: createMutation,
      variables: { 
        input: productInput,
        media: mediaInput.length > 0 ? mediaInput : null
      }
    })
  });

  const responseData = await response.json();
  console.log('📊 GraphQL Create Response:', JSON.stringify(responseData, null, 2));

  const productCreateResult = responseData.data?.productCreate;

  if (!productCreateResult) {
    console.error('❌ No productCreate result in response:', responseData);
    throw new Error('Invalid response from Shopify API');
  }

  if (productCreateResult.userErrors && productCreateResult.userErrors.length > 0) {
    console.error('❌ Error creating product:', productCreateResult.userErrors);
    throw new Error(`Failed to create product: ${productCreateResult.userErrors.map((e: any) => e.message).join(', ')}`);
  }

  const createdProduct = productCreateResult.product;
  if (!createdProduct) {
    console.error('❌ No product returned from creation');
    throw new Error('No product returned from Shopify');
  }

  // Extract Shopify ID from GID
  const shopifyProductId = parseInt(createdProduct.id.split('/').pop() || '0');

  console.log(`✅ Created product: ${createdProduct.title} (ID: ${createdProduct.id})${productImages.length > 0 ? ` with ${productImages.length} images` : ''}`);

  // Update variant pricing, SKU, and inventory
  const shopifyVariants = createdProduct.variants?.edges || [];
  const localVariant = product.product_variants?.[0]; // Get first variant from local DB
  
  console.log(`🔍 Debugging variant data for product ${product.title}:`);
  console.log(`  - Shopify variants count: ${shopifyVariants.length}`);
  console.log(`  - Local product_variants:`, product.product_variants);
  console.log(`  - Local variant (first):`, localVariant);
  
  if (shopifyVariants.length > 0 && localVariant) {
    const variantId = shopifyVariants[0].node.id;
    const price = localVariant.price || 0;
    const compareAtPrice = localVariant.compare_at_price;
    const sku = localVariant.sku || '';
    const inventoryQuantity = localVariant.inventory_quantity || 0;
    
    console.log(`💰 Updating variant pricing: ${price} EUR, SKU: ${sku}, Stock: ${inventoryQuantity} for variant ${variantId}`);
    
    try {
      const variantUpdateMutation = `
        mutation BulkUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
          productVariantsBulkUpdate(productId: $productId, variants: $variants) {
            productVariants {
              id
              price
              compareAtPrice
              sku
              inventoryQuantity
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variantInput: any = {
        id: variantId,
        price: String(price),
        sku: sku,
        inventoryQuantity: inventoryQuantity
      };

      // Only add compareAtPrice if it exists
      if (compareAtPrice && compareAtPrice > 0) {
        variantInput.compareAtPrice = String(compareAtPrice);
      }

              const variantResponse = await fetch(shopifyGraphQLUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            query: variantUpdateMutation,
            variables: {
              productId: createdProduct.id,
              variants: [{
                id: variantId,
                price: String(price),
                ...(compareAtPrice && compareAtPrice > 0 && { compareAtPrice: String(compareAtPrice) })
              }]
            }
          })
        });

      const variantData = await variantResponse.json();
      console.log('📊 Variant Update Response:', JSON.stringify(variantData, null, 2));

      const variantResult = variantData.data?.productVariantsBulkUpdate;
      if (variantResult?.userErrors?.length > 0) {
        console.error('❌ Error updating variant pricing:', variantResult.userErrors);
      } else {
        console.log(`✅ Updated variant pricing: ${price} EUR${compareAtPrice ? ` (compare at: ${compareAtPrice} EUR)` : ''}`);
        
        // TODO: Add inventory and SKU management via separate APIs
        // SKU can be managed via inventoryItem updates
        // Inventory quantities via inventorySetQuantities mutation  
        if (sku || inventoryQuantity !== null) {
          console.log(`ℹ️ SKU (${sku || 'N/A'}) and inventory (${inventoryQuantity}) management will be added in future updates`);
        }
      }
    } catch (variantError) {
      console.error('❌ Error updating variant pricing:', variantError);
      // Don't throw here - product creation was successful
    }
  } else {
    console.log(`⚠️ No Shopify variant found (${shopifyVariants.length}) or no local variant data (${!!localVariant}) - skipping variant update`);
  }

  // Update local product with Shopify ID
  await supabase
    .from('products')
    .update({ shopify_product_id: shopifyProductId })
    .eq('id', product.id);

  // Store mapping in external_product_mappings
  await supabase
    .from('external_product_mappings')
    .insert({
      internal_product_id: product.id,
      external_source_name: 'shopify',
      external_product_id: createdProduct.id,
      sync_status: 'synced',
      last_synced_at: new Date().toISOString()
    });

  stats.created++;
  return createdProduct;
}

// Helper function to update existing product in Shopify
async function updateShopifyProduct(
  shopifyGraphQLUrl: string,
  headers: any,
  supabase: any,
  product: any,
  stats: any,
  userId: string
) {
  console.log(`🔄 Updating existing product: ${product.title} (Shopify ID: ${product.shopify_product_id})`);

  const shopifyProductGid = `gid://shopify/Product/${product.shopify_product_id}`;

  // Handle image upload if present
  let productImages: any[] = [];
  
  // First, check if there's a featured_image
  if (product.featured_image) {
    console.log(`🖼️ Processing featured_image: ${product.featured_image}`);
    const validatedUrl = validateAndConvertImageUrl(product.featured_image);
    
    if (validatedUrl) {
      console.log(`✅ Validated URL: ${validatedUrl}`);
      let finalImageUrl = validatedUrl;
      
      // Check if this is a localhost URL that needs staged upload
      if (validatedUrl.includes('127.0.0.1') || validatedUrl.includes('localhost')) {
        console.log('🔄 Local featured image detected, using staged upload process...');
        const filename = `product-${product.id}-featured-${Date.now()}.jpg`;
        const uploadedUrl = await uploadLocalImageToShopify(shopifyGraphQLUrl, headers, validatedUrl, filename);
        
        if (uploadedUrl) {
          console.log(`✅ Staged upload successful: ${uploadedUrl}`);
          finalImageUrl = uploadedUrl;
        } else {
          console.log('⚠️ Staged upload failed for featured image, skipping');
        }
      }
      
      console.log(`🔍 Checking condition: (!${validatedUrl.includes('localhost')} && !${validatedUrl.includes('127.0.0.1')}) || ${finalImageUrl !== validatedUrl}`);
      console.log(`🔍 Condition result: ${(!validatedUrl.includes('localhost') && !validatedUrl.includes('127.0.0.1')) || finalImageUrl !== validatedUrl}`);
      
      // Only add the image if it's not a localhost URL OR if staged upload succeeded
      if ((!validatedUrl.includes('localhost') && !validatedUrl.includes('127.0.0.1')) || finalImageUrl !== validatedUrl) {
        console.log(`✅ Adding featured image to productImages: ${finalImageUrl}`);
        productImages.push({
          url: finalImageUrl,
          altText: product.title || 'Product image'
        });
      } else {
        console.log(`❌ Featured image NOT added - condition failed`);
      }
    } else {
      console.log(`❌ Featured image validation failed`);
    }
  } else {
    console.log(`ℹ️ No featured_image found for product`);
  }
  
  // Then, check product_images table
  if (product.product_images && product.product_images.length > 0) {
    for (const image of product.product_images) {
      const validatedUrl = validateAndConvertImageUrl(image.url);
      
      if (validatedUrl) {
        let finalImageUrl = validatedUrl;
        
        // Check if this is a localhost URL that needs staged upload
        if (validatedUrl.includes('127.0.0.1') || validatedUrl.includes('localhost')) {
          console.log('🔄 Local image detected, using staged upload process...');
          const filename = `product-${product.id}-${Date.now()}-${image.position || 0}.jpg`;
          const uploadedUrl = await uploadLocalImageToShopify(shopifyGraphQLUrl, headers, validatedUrl, filename);
          
          if (uploadedUrl) {
            finalImageUrl = uploadedUrl;
          } else {
            console.log('⚠️ Staged upload failed, skipping image');
            continue;
          }
        }
        
        productImages.push({
          url: finalImageUrl,
          altText: image.alt_text || ''
        });
      }
    }
  }

  const productInput = {
    title: product.title,
    handle: product.handle,
    descriptionHtml: product.description_html || '',
    vendor: product.vendor || '',
    productType: product.product_type || '',
    tags: product.tags || [],
    status: product.status?.toUpperCase() || 'DRAFT'
    // Note: Images cannot be updated via ProductInput - they need separate mutations
  };

  console.log('📤 Sending product update to Shopify:', {
    ...productInput,
    descriptionHtml: `${productInput.descriptionHtml.substring(0, 100)}...`,
    note: `Images not included in update (${productImages.length} images detected but require separate mutations)`
  });

  const updateMutation = `
    mutation UpdateProduct($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          title
          handle
          status
          images(first: 10) {
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
                sku
                inventoryQuantity
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const response = await fetch(shopifyGraphQLUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: updateMutation,
      variables: { 
        input: {
          id: shopifyProductGid,
          ...productInput
        }
      }
    })
  });

  const responseData = await response.json();
  console.log('📊 GraphQL Update Response:', JSON.stringify(responseData, null, 2));

  const productUpdateResult = responseData.data?.productUpdate;

  if (!productUpdateResult) {
    console.error('❌ No productUpdate result in response:', responseData);
    throw new Error('Invalid response from Shopify API');
  }

  if (productUpdateResult.userErrors && productUpdateResult.userErrors.length > 0) {
    console.error('❌ Error updating product:', productUpdateResult.userErrors);
    throw new Error(`Failed to update product: ${productUpdateResult.userErrors.map((e: any) => e.message).join(', ')}`);
  }

  const updatedProduct = productUpdateResult.product;
  console.log(`✅ Updated product: ${updatedProduct.title} (ID: ${updatedProduct.id}) - Note: Images require separate update mutations`);

  // Update variant pricing, SKU, and inventory if needed
  const shopifyVariants = updatedProduct.variants?.edges || [];
  const localVariant = product.product_variants?.[0]; // Get first variant from local DB
  
  if (shopifyVariants.length > 0 && localVariant) {
    const currentVariant = shopifyVariants[0].node;
    const price = localVariant.price || 0;
    const compareAtPrice = localVariant.compare_at_price;
    const sku = localVariant.sku || '';
    const inventoryQuantity = localVariant.inventory_quantity || 0;
    
    // Check if variant needs updating
    const needsUpdate = 
      String(currentVariant.price) !== String(price) ||
      currentVariant.sku !== sku ||
      currentVariant.inventoryQuantity !== inventoryQuantity;
    
    if (needsUpdate) {
      console.log(`💰 Updating variant pricing: ${price} EUR, SKU: ${sku}, Stock: ${inventoryQuantity} for variant ${currentVariant.id}`);
      
      try {
        const variantUpdateMutation = `
          mutation BulkUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
            productVariantsBulkUpdate(productId: $productId, variants: $variants) {
              productVariants {
                id
                price
                compareAtPrice
                sku
                inventoryQuantity
              }
              userErrors {
                field
                message
              }
            }
          }
        `;

        const variantResponse = await fetch(shopifyGraphQLUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            query: variantUpdateMutation,
            variables: {
              productId: shopifyProductGid,
              variants: [{
                id: currentVariant.id,
                price: String(price),
                ...(compareAtPrice && compareAtPrice > 0 && { compareAtPrice: String(compareAtPrice) })
              }]
            }
          })
        });

        const variantData = await variantResponse.json();
        console.log('📊 Variant Update Response:', JSON.stringify(variantData, null, 2));

        const variantResult = variantData.data?.productVariantsBulkUpdate;
        if (variantResult?.userErrors?.length > 0) {
          console.error('❌ Error updating variant pricing:', variantResult.userErrors);
        } else {
          console.log(`✅ Updated variant pricing: ${price} EUR${compareAtPrice ? ` (compare at: ${compareAtPrice} EUR)` : ''}`);
          
          // TODO: Add inventory and SKU management via separate APIs
          // SKU can be managed via inventoryItem updates
          // Inventory quantities via inventorySetQuantities mutation  
          if (sku || inventoryQuantity !== null) {
            console.log(`ℹ️ SKU (${sku || 'N/A'}) and inventory (${inventoryQuantity}) management will be added in future updates`);
          }
        }
      } catch (variantError) {
        console.error('❌ Error updating variant pricing:', variantError);
        // Don't throw here - product update was successful
      }
    } else {
      console.log(`✅ Variant pricing is up to date: ${currentVariant.price} EUR, SKU: ${currentVariant.sku || 'N/A'}, Stock: ${currentVariant.inventoryQuantity}`);
    }
  } else {
    console.log(`⚠️ No Shopify variant found (${shopifyVariants.length}) or no local variant data (${!!localVariant}) - skipping variant update`);
  }

  // For now, skip complex image update logic during product updates
  // Images will be handled by separate image update functions
  if (productImages.length > 0) {
    console.log(`🖼️ Product has ${productImages.length} images, but skipping image update during product update`);
    console.log(`ℹ️ Image updates should be handled separately via image-specific API endpoints`);
  }

  // Update mapping record
  await supabase
    .from('external_product_mappings')
    .upsert({
      internal_product_id: product.id,
      external_source_name: 'shopify',
      external_product_id: shopifyProductGid,
      sync_status: 'synced',
      last_synced_at: new Date().toISOString()
    });

  stats.updated++;
  return updatedProduct;
}