#!/usr/bin/env node

require('dotenv').config({ path: process.env.DOTENV_CONFIG_PATH || '.env.local' });

const { Command } = require('commander');
const { shopifyApi, ApiVersion, Session } = require('@shopify/shopify-api');
const { restResources } = require('@shopify/shopify-api/rest/admin/2025-04'); // Ensure this matches your needs
require('@shopify/shopify-api/adapters/node'); // Import Node adapter

const program = new Command();

// --- Shopify API Client Initialization (Custom App Mode) ---

const shopifyShopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
const adminAccessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN; // shpat_... token
const apiKey = process.env.SHOPIFY_API_KEY; // Custom App API Key
const apiSecret = process.env.SHOPIFY_API_SECRET; // Custom App API Secret

if (!shopifyShopDomain || !adminAccessToken || !apiKey || !apiSecret) {
  console.error('Error: Missing required Shopify environment variables for custom app authentication.');
  console.error('Please ensure SHOPIFY_SHOP_DOMAIN, SHOPIFY_ADMIN_ACCESS_TOKEN, SHOPIFY_API_KEY, and SHOPIFY_API_SECRET are set in .env.local');
  process.exit(1);
}

const shopify = shopifyApi({
  apiKey: apiKey,
  apiSecretKey: apiSecret,
  scopes: ['read_orders', 'read_products', 'read_fulfillments', 'write_fulfillments'], // Added fulfillment scopes
  hostName: shopifyShopDomain.replace(/https?:\/\//, ''),
  apiVersion: ApiVersion.April25, // Match client config
  isCustomStoreApp: true,
  adminApiAccessToken: adminAccessToken || '',
  restResources,
});

// Create a session for the custom app
const session = new Session({
    shop: shopifyShopDomain,
    accessToken: adminAccessToken,
    isOnline: false,
    id: `custom-app-order-session-${shopifyShopDomain}`
});

// --- GraphQL Client Helper ---
async function shopifyGraphQL(query, variables = {}) {
    const client = new shopify.clients.Graphql({ session });
    try {
        const response = await client.query({
            data: { query, variables },
        });
        if (response.body.errors) {
            console.error('GraphQL Query returned errors:', JSON.stringify(response.body.errors, null, 2));
            const combinedMessage = response.body.errors.map((e) => e.message).join('; ');
            throw new Error(`GraphQL query failed: ${combinedMessage}`);
        }
        if (!response.body.data) {
             console.error('GraphQL query succeeded but returned no data:', response.body);
             throw new Error('GraphQL query succeeded but returned no data.');
        }
        return response.body.data;
    } catch (error) {
        console.error('Error during Shopify GraphQL request:', error.message);
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error(`Shopify API request failed: ${JSON.stringify(error)}`);
        }
    }
}

// --- Commander Setup ---
program
  .name('shopify-orders-tool')
  .description('CLI tool to manage Shopify orders using Admin API')
  .version('0.0.1');

// --- List Orders Command ---
program
    .command('list')
    .description('List orders with various filters')
    .option('--limit <number>', 'Number of orders to list', '10')
    .option('--query <string>', 'Shopify search query string (e.g., "status:open financial_status:paid")')
    .option('--sort-key <sortKey>', 'Sort key (e.g., PROCESSED_AT, TOTAL_PRICE, UPDATED_AT)', 'PROCESSED_AT')
    .option('--reverse', 'Reverse the sort order', false)
    .option('--fields <string>', 'Comma-separated list of fields to retrieve (e.g., id,name,totalPriceSet.shopMoney.amount)')
    .option('--cursor <string>', 'Cursor for pagination (for "after")')
    .action(async (options) => {
        console.log('Listing orders...');
        // Basic field set
        const defaultFields = `
            id
            name
            createdAt
            displayFinancialStatus
            displayFulfillmentStatus
            totalPriceSet {
                shopMoney {
                    amount
                    currencyCode
                }
            }
            customer {
                id
                firstName
                lastName
                email
            }
        `;

        let selectedFields = defaultFields;
        if (options.fields) {
            selectedFields = options.fields.split(',').map(f => f.trim()).join('\\n');
        }
        
        const queryParams = [
            `first: ${parseInt(options.limit, 10)}`,
            `sortKey: ${options.sortKey.toUpperCase()}`,
            `reverse: ${options.reverse}`
        ];
        if (options.query) {
            queryParams.push(`query: "${options.query}"`);
        }
        if (options.cursor) {
            queryParams.push(`after: "${options.cursor}"`);
        }

        const query = `
        query ListOrders {
            orders(${queryParams.join(', ')}) {
                edges {
                    cursor
                    node {
                        ${selectedFields}
                    }
                }
                pageInfo {
                    hasNextPage
                    hasPreviousPage
                    startCursor
                    endCursor
                }
            }
        }
        `;
        try {
            console.log("Executing GraphQL query:", query);
            const data = await shopifyGraphQL(query);
            console.log(JSON.stringify(data, null, 2));
        } catch (error) {
            // Error is already logged by shopifyGraphQL
            process.exitCode = 1;
        }
    });

// --- Get Order Command ---
program
  .command('get')
  .description('Get a single order by its ID')
  .requiredOption('--id <gid>', 'Order GID (e.g., gid://shopify/Order/12345)')
  .option('--fields <string>', 'Comma-separated list of fields to retrieve')
  .action(async (options) => {
    console.log(`Fetching order with ID: ${options.id}`);
    const defaultFields = `
        id
        name
        legacyResourceId
        createdAt
        updatedAt
        cancelledAt
        cancelReason
        displayFinancialStatus
        displayFulfillmentStatus
        email
        phone
        note
        tags
        totalPriceSet { shopMoney { amount currencyCode } }
        subtotalPriceSet { shopMoney { amount currencyCode } }
        totalTaxSet { shopMoney { amount currencyCode } }
        totalShippingPriceSet { shopMoney { amount currencyCode } }
        totalDiscountsSet { shopMoney { amount currencyCode } }
        customer { id firstName lastName email }
        billingAddress { address1 city provinceCode countryCode zip }
        shippingAddress { address1 city provinceCode countryCode zip }
        lineItems(first: 20) {
            edges {
                node {
                    id
                    title
                    quantity
                    sku
                    variantTitle
                    originalUnitPriceSet { shopMoney { amount currencyCode } }
                    discountedUnitPriceSet { shopMoney { amount currencyCode } }
                }
            }
        }
        fulfillments(first: 5) {
            id
            status
            createdAt
            trackingInfo(first: 1) {
                company
                number
                url
            }
        }
        # Metafields can be added if needed, similar to product tool
        # metafields(first: 10, namespace: "your_namespace") {
        #   edges { node { key value type } }
        # }
    `;
    let selectedFields = defaultFields;
    if (options.fields) {
        selectedFields = options.fields.split(',').map(f => f.trim()).join('\\n');
    }

    const query = `
      query GetOrder($id: ID!) {
        order(id: $id) {
          ${selectedFields}
        }
      }
    `;
    try {
      const data = await shopifyGraphQL(query, { id: options.id });
      console.log(JSON.stringify(data, null, 2));
    } catch (error) {
      process.exitCode = 1;
    }
  });

// --- Get Fulfillment Command ---
program
  .command('get-fulfillment')
  .description('Get a specific fulfillment by its ID')
  .requiredOption('--id <gid>', 'Fulfillment GID (e.g., gid://shopify/Fulfillment/12345)')
  .action(async (options) => {
    console.log(`Fetching fulfillment with ID: ${options.id}`);
    const query = `
      query GetFulfillment($id: ID!) {
        fulfillment(id: $id) {
          id
          status
          name
          createdAt
          updatedAt
          displayStatus
          service {
            handle
            id
            serviceName
          }
          trackingInfo {
            company
            number
            url
          }
          fulfillmentLineItems(first: 10) {
            edges {
              node {
                id
                quantity
                lineItem {
                  id
                  title
                  sku
                }
              }
            }
          }
          order {
            id
            name
          }
          location {
            id
            name
          }
        }
      }
    `;
    try {
      const data = await shopifyGraphQL(query, { id: options.id });
      console.log(JSON.stringify(data, null, 2));
    } catch (error) {
      process.exitCode = 1;
    }
  });

// --- Get Fulfillment Order Command ---
program
  .command('get-fulfillment-order')
  .description('Get a specific fulfillment order by its ID')
  .requiredOption('--id <gid>', 'FulfillmentOrder GID (e.g., gid://shopify/FulfillmentOrder/12345)')
  .action(async (options) => {
    console.log(`Fetching fulfillment order with ID: ${options.id}`);
    // Note: FulfillmentOrder is complex, this is a subset of fields.
    const query = `
      query GetFulfillmentOrder($id: ID!) {
        fulfillmentOrder(id: $id) {
          id
          status
          requestStatus
          supportedActions {
            action
          }
          destination {
            address1
            city
            countryCode
          }
          lineItems(first: 10) {
            edges {
              node {
                id
                remainingQuantity
                lineItem {
                  id
                  title
                  sku
                }
              }
            }
          }
          assignedLocation {
            name
            location {
              id
            }
          }
          order {
            id
            name
          }
        }
      }
    `;
    try {
      const data = await shopifyGraphQL(query, { id: options.id });
      console.log(JSON.stringify(data, null, 2));
    } catch (error) {
      process.exitCode = 1;
    }
  });

// --- Create Fulfillment Command (fulfillmentCreateV2) ---
program
  .command('create-fulfillment')
  .description('Create a fulfillment for an order using fulfillmentCreateV2. For complex scenarios, check Shopify docs.')
  .requiredOption('--order-gid <gid>', 'Order GID to fulfill (e.g., gid://shopify/Order/12345)')
  .option('--line-items <json_string>', 'JSON string of line items to fulfill (e.g., \'[{\\"fulfillmentLineItemId\\": \\"gid://shopify/FulfillmentOrderLineItem/ITEM_ID\\", \\"quantity\\": 1}]\'). If not provided, attempts to fulfill all unfulfilled items at the first available location.')
  .option('--tracking-company <company>', 'Tracking company name')
  .option('--tracking-number <number>', 'Tracking number')
  .option('--tracking-url <url>', 'Tracking URL')
  .option('--notify-customer <value>', 'Whether to notify the customer (true or false)', 'true')
  .option('--location-id <gid>', '(Optional) Location GID from which to fulfill. If not provided, Shopify may choose or require it based on order.')
  .action(async (options) => {
    console.log(`Creating fulfillment for order: ${options.orderGid}`);
    
    const fulfillmentInput = {};
    // fulfillmentInput.orderId = options.orderGid; // Removed: orderId is not a root field in FulfillmentV2Input when using lineItemsByFulfillmentOrder
    
    // Parse the string value for notifyCustomer, defaulting to true if option is somehow undefined despite default
    const notifyCustomer = (options.notifyCustomer === 'false') ? false : true; 
    fulfillmentInput.notifyCustomer = notifyCustomer;

    if (options.locationId) {
      fulfillmentInput.originLocationId = options.locationId;
    }

    if (options.lineItems) {
      try {
        fulfillmentInput.lineItemsByFulfillmentOrder = JSON.parse(options.lineItems).map(item => ({
            fulfillmentOrderId: item.fulfillmentOrderId, // User needs to provide this based on FO query
            fulfillmentOrderLineItems: [{ id: item.fulfillmentLineItemId, quantity: item.quantity }]
        }));
      } catch (e) {
        console.error('Error: Invalid JSON provided for --line-items.', e.message);
        process.exit(1);
        return;
      }
    } else {
        // If no line items specified, user must ensure the order can be fulfilled by default
        // Or fetch fulfillment orders first, then specify line items.
        // This simplified version does not auto-fetch and select line items.
        console.warn('Warning: No specific line items provided. Shopify will attempt default fulfillment. This may require a locationId or might fail if ambiguous.');
    }

    const trackingInfoInput = {};
    if (options.trackingCompany) trackingInfoInput.company = options.trackingCompany;
    if (options.trackingNumber) trackingInfoInput.number = options.trackingNumber;
    if (options.trackingUrl) trackingInfoInput.url = options.trackingUrl;

    if (Object.keys(trackingInfoInput).length > 0) {
        fulfillmentInput.trackingInfo = trackingInfoInput;
    }

    // The fulfillmentCreateV2 mutation is complex. 
    // This simplified version uses `lineItemsByFulfillmentOrder`.
    // For more control, refer to Shopify docs for using `fulfillmentOrdersToFulfill`.
    const mutation = `
      mutation FulfillmentCreateV2($fulfillment: FulfillmentV2Input!) {
        fulfillmentCreateV2(fulfillment: $fulfillment) {
          fulfillment {
            id
            status
            displayStatus
            name
            order {
              id
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    try {
      console.log("Executing fulfillmentCreateV2 mutation with input:", JSON.stringify({ fulfillment: fulfillmentInput }, null, 2));
      const data = await shopifyGraphQL(mutation, { fulfillment: fulfillmentInput });
      if (data.fulfillmentCreateV2?.userErrors?.length > 0) {
        console.error('Error creating fulfillment:', JSON.stringify(data.fulfillmentCreateV2.userErrors, null, 2));
        process.exitCode = 1;
      } else {
        console.log('Fulfillment creation initiated/successful:');
        console.log(JSON.stringify(data.fulfillmentCreateV2?.fulfillment, null, 2));
      }
    } catch (error) {
      // Error is already logged by shopifyGraphQL or the JSON.parse block
      if (process.exitCode !== 1) process.exitCode = 1; // Ensure exit code is set if not already
    }
  });

program.parse(process.argv);

// Handle cases where no command is specified
if (!process.argv.slice(2).length) {
  program.outputHelp();
} 