import { inngest } from './inngest-client';
import { createClient } from '@supabase/supabase-js';
import { Parser as XmlParser } from 'xml2js'; // Added for XML parsing

// Define a type for our data source records for clarity
interface DataSource {
  id: string;
  identifier: string;
  feed_url: string;
  feed_type: string; // e.g., 'product_feed', 'inventory_feed'
  detected_schema: Record<string, any> | null;
  // Add other relevant fields from your data_sources table
  created_at: string;
  updated_at: string;
  last_fetched_at: string | null;
  last_schema_update_at: string | null;
  name: string | null;
  status: string; // e.g., 'active', 'inactive', 'error'
  error_message: string | null;
}

// Function to fetch data sources and dispatch sync events
export const dispatchDataSourceSyncJobs = inngest.createFunction(
  { 
    id: 'dispatch-data-source-sync-jobs',
    name: 'Dispatch Data Source Sync Jobs',
  }, // Cron schedule: "TZ=UTC 0 * * * *" for every hour at minute 0, UTC timezone
  { cron: 'TZ=UTC 0 * * * *' }, 
  async ({ step, logger }) => {
    logger.info('Starting to dispatch data source sync jobs...');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      logger.error('Supabase URL or Service Key is not configured.');
      throw new Error('Supabase environment variables are not set.');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: dataSources, error } = await step.run('fetch-active-data-sources', async () => {
      return supabase
        .from('data_sources')
        .select('*')
        .eq('status', 'active'); // Only fetch active sources
    }) as { data: DataSource[] | null; error: any }; // Type assertion for clarity

    if (error) {
      logger.error('Error fetching data sources:', error);
      throw new Error(`Failed to fetch data sources: ${error.message}`);
    }

    if (!dataSources || dataSources.length === 0) {
      logger.info('No active data sources found to sync.');
      return { message: 'No active data sources found.' };
    }

    logger.info(`Found ${dataSources.length} active data sources.`);

    const events = dataSources.map((source) => ({
      name: 'app/data.source.sync.requested',
      data: {
        dataSourceId: source.id,
        feedUrl: source.feed_url,
        feedType: source.feed_type,
        detectedSchema: source.detected_schema,
        identifier: source.identifier,
        // Pass any other necessary fields from the source
      },
      // Optionally add a user context if relevant, though for cron this might be system
    }));

    await step.sendEvent('dispatch-sync-events', events);

    logger.info(`Dispatched ${events.length} sync events.`);
    return { message: `Successfully dispatched ${events.length} sync events.` };
  }
);

// Placeholder for the product sync function
export const syncProductDataSource = inngest.createFunction(
  { 
    id: 'sync-product-data-source',
    name: 'Sync Product Data Source',
    // Consider adding concurrency limits if feed processing is resource-intensive
    // concurrency: {
    //   limit: 5, // Max 5 functions of this type running at once
    // },
  },
  { event: 'app/data.source.sync.requested' },
  async ({ event, step, logger }) => {
    // Filter to only process product feeds for now, as requested
    if (event.data.feedType !== 'product_feed') {
      logger.info(`Skipping non-product feed: ${event.data.identifier} (type: ${event.data.feedType})`);
      return { message: 'Skipped non-product feed.'};
    }
    
    logger.info(`Processing product data source sync for: ${event.data.identifier}`, { dataSourceId: event.data.dataSourceId });

    const { dataSourceId, feedUrl, detectedSchema, identifier } = event.data;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      logger.error('Supabase URL or Service Key is not configured for product sync.');
      // Cannot update data_sources table without credentials
      throw new Error('Supabase environment variables are not set for product sync.');
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    const updateDataSourceStatus = async (status: string, errorMessage: string | null, fetchedAt?: Date) => {
      const updatePayload: Partial<DataSource> = { 
        status, 
        error_message: errorMessage,
        last_fetched_at: (fetchedAt || new Date()).toISOString()
      };
      if (status === 'active' && !errorMessage) { // Clear error on success
        updatePayload.error_message = null;
      }
      const { error: updateError } = await supabase
        .from('data_sources')
        .update(updatePayload)
        .eq('id', dataSourceId);
      if (updateError) {
        logger.error(`Failed to update data source ${dataSourceId} status to ${status}:`, updateError);
      }
    };

    let rawFeedData: any;
    let itemsToProcess: any[] = [];

    try {
      rawFeedData = await step.run(`fetch-feed-data-${identifier}`, async () => {
        const response = await fetch(feedUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type')?.toLowerCase() || '';
        const feedText = await response.text();
        let parsedData;

        if (contentType.includes('application/json') || contentType.includes('text/json')) {
          parsedData = JSON.parse(feedText);
        } else if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
          logger.info(`Detected XML content type for ${identifier}. Parsing XML...`);
          const parser = new XmlParser({ explicitArray: false, mergeAttrs: true });
          const jsonDataFromXml = await parser.parseStringPromise(feedText);
          
          // Attempt to find the array of items in common XML structures
          if (jsonDataFromXml.rss && jsonDataFromXml.rss.channel && Array.isArray(jsonDataFromXml.rss.channel.item)) {
            parsedData = jsonDataFromXml.rss.channel.item;
          } else if (jsonDataFromXml.feed && Array.isArray(jsonDataFromXml.feed.entry)) {
            parsedData = jsonDataFromXml.feed.entry;
          } else if (jsonDataFromXml.products && Array.isArray(jsonDataFromXml.products.product)) {
            parsedData = jsonDataFromXml.products.product;
          } else if (jsonDataFromXml.shop && Array.isArray(jsonDataFromXml.shop.item)) {
            parsedData = jsonDataFromXml.shop.item;
          } else {
            // Try to find the first array in the root object
            const rootKey = Object.keys(jsonDataFromXml)[0];
            if (rootKey && Array.isArray(jsonDataFromXml[rootKey])) {
                parsedData = jsonDataFromXml[rootKey];
            } else if (rootKey && typeof jsonDataFromXml[rootKey] === 'object' && jsonDataFromXml[rootKey] !== null) {
                const nestedKeys = Object.keys(jsonDataFromXml[rootKey]);
                for (const nestedKey of nestedKeys) {
                    if (Array.isArray(jsonDataFromXml[rootKey][nestedKey])) {
                        parsedData = jsonDataFromXml[rootKey][nestedKey];
                        break;
                    }
                }
            }
            if (!Array.isArray(parsedData)) {
                 logger.warn(`Could not automatically find an array of items in the XML structure for ${identifier}. Using the entire parsed JSON object if it's an array, or wrapping it.`);
                 parsedData = Array.isArray(jsonDataFromXml) ? jsonDataFromXml : [jsonDataFromXml]; // Fallback
            }
          }
        } else {
          logger.warn(`Unsupported or ambiguous content type for ${identifier}: ${contentType}. Attempting JSON parse.`);
          // Try JSON parse as a fallback if content type is unclear but not explicitly XML
          try {
            parsedData = JSON.parse(feedText);
          } catch (jsonParseError) {
            logger.error(`Failed to parse feed for ${identifier} as JSON after ambiguous content type. Content type: ${contentType}`, jsonParseError);
            throw new Error(`Unsupported content type: ${contentType}. Failed to parse as JSON or XML.`);
          }
        }
        return parsedData;
      });

      logger.info(`Successfully fetched and parsed data for ${identifier}`);
      
      // Determine itemsToProcess from rawFeedData
      if (Array.isArray(rawFeedData)) {
        itemsToProcess = rawFeedData;
      } else if (rawFeedData && typeof rawFeedData === 'object') {
        // Common root keys for product arrays
        const commonKeys = ['products', 'items', 'entries', 'data', 'records', 'results'];
        let found = false;
        for (const key of commonKeys) {
          if (Array.isArray(rawFeedData[key])) {
            itemsToProcess = rawFeedData[key];
            found = true;
            break;
          }
        }
        if (!found) {
          // If no common key found, and it's an object, assume it might be a single item feed
          logger.warn(`Feed for ${identifier} is a single object or has an unknown array structure. Processing as a single item array.`);
          itemsToProcess = [rawFeedData];
        }
      } else {
        logger.warn(`Feed data for ${identifier} is not an array or a recognizable object structure. No items to process.`);
        itemsToProcess = [];
      }

    } catch (error) {
      const fetchTime = new Date();
      logger.error(`Error fetching or parsing feed data for ${identifier}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown fetch or parse error';
      await updateDataSourceStatus('error', errorMessage, fetchTime);
      throw error; // Re-throw to let Inngest handle retries/failure
    }

    if (!itemsToProcess || itemsToProcess.length === 0) {
      logger.info(`No items found in feed for ${identifier}`);
      await updateDataSourceStatus('active', null); // Still update last_fetched_at and ensure status is active
      return { message: 'No items to process.'};
    }
    logger.info(`Found ${itemsToProcess.length} items in feed for ${identifier}`);

    // 4. For each item, check if it exists in `external_product_mappings`
    //    - If yes, get internal_product_id, then update `products` and `product_variants`.
    //    - If no, create new `products`, `product_variants`, and `external_product_mappings`.
    //    This will involve multiple Supabase operations per item.
    //    Use `step.run` for each logical block of operations for better observability & retries.

    let productsCreated = 0;
    let productsUpdated = 0;
    let variantsCreated = 0;
    let variantsUpdated = 0;

    for (const item of itemsToProcess) {
      // Basic field mapping - THIS IS A SIMPLIFICATION and needs to be robust
      // Ideally, use `detectedSchema` or a pre-defined mapping for the source.
      const externalProductId = item.id?.toString() || item.product_id?.toString() || item.sku?.toString(); // Must have an external ID
      // Handle cases where variant ID might be part of a nested structure or needs specific extraction
      let externalVariantId = item.variant_id?.toString() || item.sku?.toString(); 
      if (!externalVariantId && item.variants && Array.isArray(item.variants) && item.variants.length > 0) {
        // If variants array exists, use the first variant's ID or SKU as a fallback for the main mapping
        // This assumes the top-level item represents the product, and variants are nested.
        // More complex logic would iterate through item.variants and create multiple mappings.
        externalVariantId = item.variants[0].id?.toString() || item.variants[0].sku?.toString() || externalProductId;
      } else if (!externalVariantId) {
        externalVariantId = externalProductId; // Fallback if no distinct variant ID
      }
      
      if (!externalProductId) {
        logger.warn('Skipping item due to missing external product ID', { item });
        continue;
      }

      const productTitle = item.title || item.name || 'Untitled Product';
      const productHandle = (item.handle || productTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').substring(0,250));
      const productStatus = item.status || 'DRAFT'; // Default to DRAFT
      const productDescription = item.body_html || item.description || null;
      const productVendor = item.vendor || null;
      const productType = item.product_type || null;

      const variantSku = item.sku || externalVariantId || externalProductId;
      const variantPrice = parseFloat(item.price) || 0;
      const variantCompareAtPrice = parseFloat(item.compare_at_price) || null;
      // ... other variant fields like barcode, weight, inventory_quantity etc.

      await step.run(`process-item-${externalProductId}`, async () => {
        // Check existing mapping
        const { data: mapping, error: mapError } = await supabase
          .from('external_product_mappings')
          .select('internal_product_id, internal_variant_id')
          .eq('external_source_name', identifier)
          .eq('external_product_id', externalProductId)
          .eq('external_variant_id', externalVariantId) // Assuming one mapping per variant
          .maybeSingle();

        if (mapError) {
          logger.error(`Error checking product mapping for ${externalProductId} from ${identifier}:`, mapError);
          throw mapError; // Let Inngest retry
        }

        let internalProductId: string;
        let internalVariantId: string;

        if (mapping) { // Product/Variant mapping exists - UPDATE
          internalProductId = mapping.internal_product_id;
          internalVariantId = mapping.internal_variant_id;
          
          // Update Product
          const { error: productUpdateError } = await supabase
            .from('products')
            .update({
              title: productTitle,
              handle: productHandle, // Be careful with handle updates, could break URLs
              status: productStatus,
              description_html: productDescription,
              vendor: productVendor,
              product_type: productType,
              // shopify_product_id: item.shopify_product_id // Only if the feed provides it directly and it's trusted
            })
            .eq('id', internalProductId);
          if (productUpdateError) throw productUpdateError;
          productsUpdated++;

          // Update Variant
          const { error: variantUpdateError } = await supabase
            .from('product_variants')
            .update({
              title: item.variant_title || productTitle, // Variant title or product title
              sku: variantSku,
              price: variantPrice,
              compare_at_price: variantCompareAtPrice,
              // shopify_variant_id: item.shopify_variant_id, // If provided
              // inventory_quantity: item.inventory_quantity // If provided & managing inventory here
            })
            .eq('id', internalVariantId);
          if (variantUpdateError) throw variantUpdateError;
          variantsUpdated++;

        } else { // No mapping - CREATE new product and variant
          // Create Product
          const { data: newProduct, error: productCreateError } = await supabase
            .from('products')
            .insert({
              title: productTitle,
              handle: productHandle,
              status: productStatus,
              description_html: productDescription,
              vendor: productVendor,
              product_type: productType,
              // shopify_product_id: item.shopify_product_id 
            })
            .select('id')
            .single();
          
          if (productCreateError) throw productCreateError;
          if (!newProduct) throw new Error('Failed to create product or get ID');
          internalProductId = newProduct.id;
          productsCreated++;

          // Create Variant
          const { data: newVariant, error: variantCreateError } = await supabase
            .from('product_variants')
            .insert({
              product_id: internalProductId,
              title: item.variant_title || productTitle,
              sku: variantSku,
              price: variantPrice,
              compare_at_price: variantCompareAtPrice,
              // shopify_variant_id: item.shopify_variant_id,
              // inventory_quantity: item.inventory_quantity
            })
            .select('id')
            .single();

          if (variantCreateError) throw variantCreateError;
          if (!newVariant) throw new Error('Failed to create variant or get ID');
          internalVariantId = newVariant.id;
          variantsCreated++;

          // Create Mapping
          const { error: mappingCreateError } = await supabase
            .from('external_product_mappings')
            .insert({
              internal_product_id: internalProductId,
              internal_variant_id: internalVariantId,
              external_source_name: identifier,
              external_product_id: externalProductId,
              external_variant_id: externalVariantId,
              raw_data: item, // Store the raw item for reference/debugging
            });
          if (mappingCreateError) throw mappingCreateError;
        }
      }); // End step.run for item processing
    } // End for loop

    // 5. Update `last_fetched_at` in `data_sources` table
    await step.run(`update-data-source-timestamp-${identifier}`, async () => {
      // This step now effectively confirms successful processing of all items
      await updateDataSourceStatus('active', null); 
    });

    const summary = `Processed ${identifier}: ${itemsToProcess.length} items. Products: ${productsCreated} created, ${productsUpdated} updated. Variants: ${variantsCreated} created, ${variantsUpdated} updated.`;
    logger.info(summary);
    return { message: summary };
  }
); 