#!/usr/bin/env node

const { Command } = require('commander');
const { shopifyApi } = require('@shopify/shopify-api');
const { ApiVersion } = require('@shopify/shopify-api');
require('dotenv').config({ path: '.env.local' });
require('@shopify/shopify-api/adapters/node'); // Import Node adapter

// Initialize Shopify API
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: ['read_products', 'write_products'],
  hostName: process.env.SHOPIFY_SHOP_DOMAIN.replace(/https?:\/\//, ''),
  apiVersion: ApiVersion.October24,
  isCustomStoreApp: true,
  adminApiAccessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
});

// Create session
const { Session } = require('@shopify/shopify-api');
const session = new Session({
  shop: process.env.SHOPIFY_SHOP_DOMAIN,
  accessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
  isOnline: false,
  id: `custom-app-session-${process.env.SHOPIFY_SHOP_DOMAIN}`,
});

// GraphQL client
const client = new shopify.clients.Graphql({ session });

// GraphQL Queries and Mutations
const COLLECTIONS_QUERY = `
  query GetCollections($first: Int) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          sortOrder
          productsCount
          updatedAt
        }
      }
    }
  }
`;

const COLLECTION_CREATE_MUTATION = `
  mutation CreateCollection($input: CollectionInput!) {
    collectionCreate(input: $input) {
      collection {
        id
        title
        handle
        description
        sortOrder
        productsCount
        updatedAt
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Commands
const program = new Command();

program
  .name('shopify-collections-tool')
  .description('Manage Shopify Collections using GraphQL Admin API')
  .version('1.0.0');

// List Collections
program
  .command('list')
  .description('List collections')
  .option('-l, --limit <number>', 'Number of collections to list', '10')
  .action(async (options) => {
    try {
      console.log('Fetching collections...');
      const response = await client.query({
        data: {
          query: COLLECTIONS_QUERY,
          variables: { first: parseInt(options.limit) },
        },
      });

      console.log('Response:', JSON.stringify(response.body, null, 2));

      if (response.body.data.collections.edges.length === 0) {
        console.log('No collections found.');
        return;
      }

      console.log('\n📁 Collections:');
      response.body.data.collections.edges.forEach(({ node }) => {
        console.log(`- ${node.title} (${node.handle}) - ${node.productsCount} products`);
      });

    } catch (error) {
      console.error('Error listing collections:', error.message);
      process.exit(1);
    }
  });

// Create Collection
program
  .command('create')
  .description('Create a new collection')
  .requiredOption('-t, --title <string>', 'Collection title')
  .option('-h, --handle <string>', 'Collection handle (URL slug)')
  .option('-d, --description <string>', 'Collection description')
  .option('-s, --sort-order <string>', 'Sort order (ALPHA_ASC, ALPHA_DESC, BEST_SELLING, CREATED, CREATED_DESC, MANUAL, PRICE_ASC, PRICE_DESC)', 'MANUAL')
  .action(async (options) => {
    try {
      console.log('Creating collection with options:', options);
      
      const input = {
        title: options.title,
        handle: options.handle,
        descriptionHtml: options.description,
        sortOrder: options.sortOrder,
      };

      console.log('Input data:', input);

      const response = await client.query({
        data: {
          query: COLLECTION_CREATE_MUTATION,
          variables: { input },
        },
      });

      console.log('Response:', JSON.stringify(response.body, null, 2));

      if (response.body.data.collectionCreate.userErrors.length > 0) {
        console.error('Errors creating collection:');
        response.body.data.collectionCreate.userErrors.forEach(error => {
          console.error(`- ${error.field}: ${error.message}`);
        });
        process.exit(1);
      }

      const collection = response.body.data.collectionCreate.collection;
      console.log('\n✅ Collection created successfully!');
      console.log(`ID: ${collection.id}`);
      console.log(`Title: ${collection.title}`);
      console.log(`Handle: ${collection.handle}`);
      console.log(`Sort Order: ${collection.sortOrder}`);

    } catch (error) {
      console.error('Error creating collection:', error.message);
      console.error('Error details:', error);
      process.exit(1);
    }
  });

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(0);
}
