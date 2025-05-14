import { inngest } from './inngest-client';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { shopifyApi, Session, ApiVersion } from '@shopify/shopify-api';
import { restResources } from '@shopify/shopify-api/rest/admin/2025-04'; // Ensure this matches your setup
import '@shopify/shopify-api/adapters/node'; // Node adapter

// Types for product data (can be expanded)
interface LocalProductVariant {
  id: string;
  product_id: string;
  title: string | null;
  sku: string | null;
  price: number | null;
  compare_at_price: number | null;
  // shopify_variant_id: string | null; // From products table, not external_mappings
  // inventory_quantity: number | null;
  // barcode: string | null;
  // ... other variant fields
}

interface LocalProduct {
  id: string;
  title: string | null;
  handle: string | null;
  description_html: string | null;
  vendor: string | null;
  product_type: string | null;
  status: string | null; // e.g., DRAFT, ACTIVE, ARCHIVED
  tags: string[] | null;
  // shopify_product_id: string | null; // From products table, not external_mappings
  created_at: string;
  updated_at: string;
  product_variants: LocalProductVariant[];
}

interface ShopifySyncEventData {
  internal_product_id: string;
  force_create?: boolean; // If true, forces creation even if a Shopify ID exists locally (for re-sync)
}

// --- Shopify API Client Setup ---
const shopifyShopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
const adminAccessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;

let shopify: ReturnType<typeof shopifyApi> | null = null;
let shopifySession: Session | null = null;

if (shopifyShopDomain && adminAccessToken && apiKey && apiSecret) {
  shopify = shopifyApi({
    apiKey: apiKey,
    apiSecretKey: apiSecret,
    scopes: ['write_products', 'read_products', 'write_inventory', 'read_inventory'],
    hostName: shopifyShopDomain.replace(/https?:\/\//, ''),
    apiVersion: ApiVersion.April25, // Corrected: Ensure ApiVersion enum is used
    isCustomStoreApp: true, // Corrected: Ensure this is true for custom app token auth
    isEmbeddedApp: false, // Added: Required for non-embedded apps
    adminApiAccessToken: adminAccessToken, // Ensured this is passed if available at init
    restResources,
  });

  shopifySession = new Session({
    shop: shopifyShopDomain,
    accessToken: adminAccessToken,
    isOnline: false,
    id: `inngest-shopify-sync-session-${shopifyShopDomain}`,
    state: `inngest-shopify-sync-state-${shopifyShopDomain}` // Ensured state property is present
  });
} else {
  console.warn('Shopify Admin API credentials not fully configured. Shopify sync functions may not operate correctly.');
}

async function shopifyGraphQLClient(query: string, variables: Record<string, any> = {}) {
  if (!shopify || !shopifySession) {
    throw new Error('Shopify client not initialized. Check environment variables.');
  }
  const client = new shopify.clients.Graphql({ session: shopifySession });
  try {
    const response = await client.query({ data: { query, variables } });
    
    // Ensure response and response.body are valid before proceeding
    if (!response || typeof response.body !== 'object' || response.body === null) {
      console.error('Shopify GraphQL request returned an invalid or empty response body.', response);
      throw new Error('Shopify GraphQL request returned an invalid or empty response body.');
    }

    // Now, response.body is known to be an object
    // It's still good practice to cast response.body to a more specific type if possible,
    // or check for property existence if its structure is variable.
    // For simplicity, we assume it has a structure with optional 'errors' and 'data' fields.
    const body = response.body as { errors?: any[], data?: any }; // Basic cast

    if (body.errors && body.errors.length > 0) {
      console.error('Shopify GraphQL Query returned errors:', JSON.stringify(body.errors, null, 2));
      const combinedMessage = body.errors.map((e: any) => e.message).join('; ');
      throw new Error(`Shopify GraphQL query failed: ${combinedMessage}`);
    }
    if (!body.data) {
      console.error('Shopify GraphQL query succeeded but returned no data:', body);
      throw new Error('Shopify GraphQL query succeeded but returned no data.');
    }
    return body.data;
  } catch (error) {
    console.error('Error during Shopify GraphQL request:', error);
    if (error instanceof Error) throw error;
    throw new Error(`Shopify API request failed: ${JSON.stringify(error)}`);
  }
}


// --- Main Inngest Function ---
export const syncLocalProductToShopify = inngest.createFunction(
  {
    id: 'sync-local-product-to-shopify',
    name: 'Sync Local Product to Shopify',
    concurrency: { // Limit concurrency to avoid hitting Shopify API rate limits too quickly
      limit: 3,
    },
  },
  { event: 'app/product.sync.to.shopify.requested' },
  async ({ event, step, logger }) => {
    const { internal_product_id, force_create } = event.data as ShopifySyncEventData;

    if (!shopify || !shopifySession) {
      logger.error('Shopify client not initialized. Cannot sync product.');
      throw new Error('Shopify client not initialized. Check Shopify Admin API environment variables.');
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      logger.error('Supabase credentials not configured.');
      throw new Error('Supabase credentials not configured.');
    }
    const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch local product data
    const { data: localProduct, error: fetchError } = await step.run('fetch-local-product', async () => {
      return supabase
        .from('products')
        .select(`
          *,
          product_variants (
            *
          )
        `)
        .eq('id', internal_product_id)
        .single<LocalProduct>();
    });

    if (fetchError || !localProduct) {
      logger.error(`Failed to fetch local product ${internal_product_id}:`, fetchError);
      throw new Error(`Failed to fetch local product ${internal_product_id}. Error: ${fetchError?.message}`);
    }
    logger.info(`Fetched local product: ${localProduct.title} (ID: ${localProduct.id})`);

    // 2. Check for existing Shopify mapping
    let shopifyProductId: string | null = null;
    if (!force_create) {
        const { data: mapping, error: mapError } = await step.run('check-shopify-mapping', async () => {
            return supabase
                .from('external_product_mappings')
                .select('external_product_id')
                .eq('internal_product_id', localProduct.id)
                .eq('external_source_name', 'shopify') // Specific source name for Shopify
                .maybeSingle();
        });

        if (mapError) {
            logger.warn(`Could not check Shopify mapping for ${localProduct.id}: ${mapError.message}`);
            // Decide if this is a fatal error or if we should proceed to create
        }
        if (mapping && mapping.external_product_id) {
            shopifyProductId = mapping.external_product_id;
            logger.info(`Product ${localProduct.id} already mapped to Shopify ID: ${shopifyProductId}. Will update.`);
        }
    }


    // 3. Prepare Shopify product input
    // Metafields for description (Shopify requires descriptionHtml as a metafield)
    const descriptionMetafieldInput = localProduct.description_html ? {
        namespace: "custom", // Or your preferred namespace
        key: "description_html",
        type: "multi_line_text_field",
        value: localProduct.description_html,
    } : null;
    
    const variantsInput = localProduct.product_variants?.map(v => ({
        sku: v.sku,
        price: v.price?.toString(), // Shopify expects price as string
        compareAtPrice: v.compare_at_price?.toString(),
        // id: v.shopify_variant_id, // If updating an existing variant with its GID
        // barcode: v.barcode,
        // inventoryQuantities: [{ availableQuantity: v.inventory_quantity, locationId: "gid://shopify/Location/YOUR_LOCATION_ID"}] // Requires location ID
        // title: v.title, // Variant title if different from product title
    })) || [];

    const productInput: Record<string, any> = {
      title: localProduct.title,
      handle: localProduct.handle,
      vendor: localProduct.vendor,
      productType: localProduct.product_type,
      status: localProduct.status?.toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'DRAFT', // Shopify statuses
      tags: localProduct.tags || [],
      variants: variantsInput,
      metafields: descriptionMetafieldInput ? [descriptionMetafieldInput] : [],
    };
    
    // Add an empty options array if variants exist, as Shopify requires it for products with variants.
    if (variantsInput.length > 0 && !productInput.options) {
        productInput.options = [{ name: "Title", values: ["Default Title"] }]; // Shopify default if no real options
    }


    // 4. Create or Update product in Shopify
    let shopifyProductGid: string | null = shopifyProductId; // Use existing GID if updating
    let operationType: 'create' | 'update' = 'create';

    if (shopifyProductGid && !force_create) { // Update existing product
      operationType = 'update';
      productInput.id = shopifyProductGid; // Add GID for update mutation
      
      // For updates, variants need to be handled differently.
      // If variants have GIDs, we'd use productVariantsBulkUpdate.
      // For simplicity here, productUpdate might replace variants if not careful or GIDs are not present.
      // The current `productInput.variants` might re-create variants if their GIDs are not part of the input.
      // This section needs careful handling for robust variant updates.
      // For now, let's assume `productInput.variants` re-creates/updates based on SKU or position.
      
      // Example: To update variants properly, you might need to fetch their GIDs first
      // or structure the update using `productVariantsBulkUpdate` mutation.
      // This simplified example might lead to variants being recreated if GIDs aren't managed.
      logger.warn('Updating variants on existing Shopify product. Variant handling is simplified and might recreate variants if GIDs are not managed.')


      const UPDATE_PRODUCT_MUTATION = `
        mutation productUpdate($input: ProductInput!) {
          productUpdate(input: $input) {
            product {
              id
              title
              variants(first: 10) { edges { node { id sku price } } }
            }
            userErrors { field message }
          }
        }`;
      
      try {
        const result = await step.run('update-shopify-product', async () => {
          return shopifyGraphQLClient(UPDATE_PRODUCT_MUTATION, { input: productInput });
        });
        
        if (result.productUpdate.userErrors.length > 0) {
          logger.error(`Shopify product update failed for ${localProduct.id}:`, result.productUpdate.userErrors);
          throw new Error(`Shopify product update failed: ${JSON.stringify(result.productUpdate.userErrors)}`);
        }
        shopifyProductGid = result.productUpdate.product.id; // Re-affirm GID
        logger.info(`Successfully updated product in Shopify: ${shopifyProductGid}`);

      } catch (error) {
        logger.error(`Error updating product ${localProduct.id} (Shopify ID ${shopifyProductGid}) in Shopify:`, error);
        throw error;
      }

    } else { // Create new product
      operationType = 'create';
      const CREATE_PRODUCT_MUTATION = `
        mutation productCreate($input: ProductInput!) {
          productCreate(input: $input) {
            product {
              id
              title
              variants(first: 10) { edges { node { id sku price } } }
            }
            userErrors { field message }
          }
        }`;

      try {
        const result = await step.run('create-shopify-product', async () => {
          return shopifyGraphQLClient(CREATE_PRODUCT_MUTATION, { input: productInput });
        });

        if (result.productCreate.userErrors.length > 0) {
          logger.error(`Shopify product creation failed for ${localProduct.id}:`, result.productCreate.userErrors);
          throw new Error(`Shopify product creation failed: ${JSON.stringify(result.productCreate.userErrors)}`);
        }
        shopifyProductGid = result.productCreate.product.id;
        logger.info(`Successfully created product in Shopify: ${shopifyProductGid}`);
      } catch (error) {
        logger.error(`Error creating product ${localProduct.id} in Shopify:`, error);
        throw error;
      }
    }

    // 5. Update/Create mapping in `external_product_mappings`
    if (shopifyProductGid) {
      // We need to map local variant IDs to Shopify variant GIDs.
      // The create/update result gives Shopify variant GIDs. We need to match them.
      // This is simplified: assumes order or SKU matching. Robust matching needed for complex variant scenarios.
      // For now, just map the product. Variant mapping needs more logic.
      
      const mappingData = {
        internal_product_id: localProduct.id,
        external_product_id: shopifyProductGid,
        external_source_name: 'shopify',
        // internal_variant_id and external_variant_id would be added here in a loop for each variant
        raw_data: { shopifyProductId: shopifyProductGid } // Store minimal reference
      };

      await step.run('update-product-mapping', async () => {
        const { error: upsertError } = await supabase
          .from('external_product_mappings')
          .upsert(mappingData, { 
            onConflict: 'internal_product_id,external_source_name', // Assuming one Shopify mapping per local product
            // Consider adding external_product_id to onConflict if a local product could map to multiple Shopify stores (not current case)
          });
        if (upsertError) {
          logger.error(`Failed to upsert Shopify product mapping for ${localProduct.id}:`, upsertError);
          // Non-fatal, but log it.
        } else {
          logger.info(`Upserted Shopify product mapping for ${localProduct.id} to Shopify ID ${shopifyProductGid}`);
        }
      });

      // TODO: Iterate through localProduct.product_variants and result.productCreate/Update.product.variants
      // and map them based on SKU or order, then upsert into external_product_mappings with internal_variant_id
      // and external_variant_id (Shopify Variant GID).
      logger.warn('Variant mapping to external_product_mappings is not yet fully implemented.');

    } else {
      logger.error(`No Shopify Product GID obtained for local product ${localProduct.id}. Mapping skipped.`);
    }
    
    return { 
      message: `Product ${localProduct.id} (${localProduct.title}) ${operationType}d in Shopify. Shopify GID: ${shopifyProductGid || 'N/A'}` 
    };
  }
); 