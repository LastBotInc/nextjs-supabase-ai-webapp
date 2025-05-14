#!/usr/bin/env node

require('dotenv').config({ path: process.env.DOTENV_CONFIG_PATH || '.env.local' });

const { Command } = require('commander');
const { shopifyApi, ApiVersion, Session } = require('@shopify/shopify-api');
// We will use 2024-10 API version based on the provided documentation links
const { restResources } = require('@shopify/shopify-api/rest/admin/2024-10');
const fs = require('fs');
const path = require('path');
require('@shopify/shopify-api/adapters/node'); // Import Node adapter

const program = new Command();

// --- Shopify API Client Initialization ---
const shopifyShopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
const adminAccessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;

if (!shopifyShopDomain || !adminAccessToken || !apiKey || !apiSecret) {
  console.error('Error: Missing required Shopify environment variables for custom app authentication.');
  console.error('Please ensure SHOPIFY_SHOP_DOMAIN, SHOPIFY_ADMIN_ACCESS_TOKEN, SHOPIFY_API_KEY, and SHOPIFY_API_SECRET are set in .env.local');
  process.exit(1);
}

const shopify = shopifyApi({
  apiKey: apiKey,
  apiSecretKey: apiSecret,
  scopes: ['read_locales', 'write_locales', 'read_translations', 'write_translations', 'read_products', 'read_market_localizations'], // Added more scopes for localization
  hostName: shopifyShopDomain.replace(/^https?:\/\//, ''),
  apiVersion: ApiVersion.October24, // Using October 2024 API version
  isCustomStoreApp: true,
  adminApiAccessToken: adminAccessToken || '',
  restResources,
});

const session = new Session({
    shop: shopifyShopDomain,
    accessToken: adminAccessToken,
    isOnline: false,
    id: `custom-app-session-${shopifyShopDomain}`
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
  .name('shopify-localisation-tool')
  .description('CLI tool to manage Shopify store localizations and translations')
  .version('0.0.1');

// --- List Shop Locales Command ---
program
  .command('list-shop-locales')
  .description('List locales enabled on the shop.')
  .option('--published <boolean>', 'Return only published locales (true/false)')
  .action(async (options) => {
    console.log('Fetching shop locales...');
    const query = `
      query ShopLocales($published: Boolean) {
        shopLocales(published: $published) {
          locale
          name
          primary
          published
        }
      }
    `;
    try {
      const variables = {};
      if (options.published !== undefined) {
        variables.published = options.published === 'true';
      }
      const data = await shopifyGraphQL(query, variables);
      console.log(JSON.stringify(data.shopLocales, null, 2));
    } catch (error) {
        console.error('Failed to list shop locales.');
        process.exitCode = 1;
    }
  });

// --- List Available Locales Command ---
program
  .command('list-available-locales')
  .description('List all locales available on Shopify.')
  .action(async () => {
    console.log('Fetching all available locales...');
    const query = `
      query AvailableLocales {
        availableLocales {
          isoCode
          name
        }
      }
    `;
    try {
      const data = await shopifyGraphQL(query);
      console.log(JSON.stringify(data.availableLocales, null, 2));
    } catch (error) {
        console.error('Failed to list available locales.');
        process.exitCode = 1;
    }
  });

// --- Update Shop Locale Command ---
program
    .command('update-shop-locale')
    .description('Updates a locale for a shop (e.g., publish or unpublish).')
    .requiredOption('--locale <isoCode>', 'ISO code of the locale to update (e.g., fr, de)')
    .option('--publish', 'Publish the locale')
    .option('--unpublish', 'Unpublish the locale')
    .action(async (options) => {
        if (!options.publish && !options.unpublish) {
            console.error('Error: You must specify either --publish or --unpublish.');
            program.help(); // Show help if no action specified
            process.exit(1);
        }
        if (options.publish && options.unpublish) {
            console.error('Error: Cannot specify both --publish and --unpublish.');
            process.exit(1);
        }

        const newPublishedStatus = !!options.publish;
        console.log(`Updating locale '${options.locale}' to published: ${newPublishedStatus}...`);

        const mutation = `
            mutation ShopLocaleUpdate($locale: String!, $shopLocale: ShopLocaleInput!) {
                shopLocaleUpdate(locale: $locale, shopLocale: $shopLocale) {
                    shopLocale {
                        locale
                        name
                        primary
                        published
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }
        `;
        const variables = {
            locale: options.locale,
            shopLocale: {
                published: newPublishedStatus
            }
        };

        try {
            const data = await shopifyGraphQL(mutation, variables);
            if (data.shopLocaleUpdate?.userErrors?.length > 0) {
                console.error('Error updating shop locale:', JSON.stringify(data.shopLocaleUpdate.userErrors, null, 2));
                process.exitCode = 1;
            } else {
                console.log('Shop locale updated successfully:');
                console.log(JSON.stringify(data.shopLocaleUpdate.shopLocale, null, 2));
            }
        } catch (error) {
            console.error(`Failed to update shop locale '${options.locale}'.`);
            process.exitCode = 1;
        }
    });


// --- Pull Translations Command ---
program
  .command('pull-translations')
  .description('Pull translations for a specific resource GID and locale.')
  .requiredOption('--gid <resourceGid>', 'The GID of the resource (e.g., product, collection)')
  .requiredOption('--locale <targetLocale>', 'The target locale to pull translations for (e.g., fr, de)')
  .option('--source-locale <sourceLocale>', 'The source locale for digests (e.g., en)', 'en')
  .action(async (options) => {
    const { gid, locale: targetLocale, sourceLocale } = options;
    console.log(`Pulling translations for resource ${gid}, target locale: ${targetLocale}, source: ${sourceLocale}`);

    const translatableResourceQuery = `
      query TranslatableResourceWithTranslations($resourceId: ID!, $targetLocale: String!) {
        translatableResource(resourceId: $resourceId) {
          resourceId
          # This gives keys and digests, typically from the shop's primary locale (our source)
          sourceContent: translatableContent {
            key
            value # Original value in source language
            digest
            locale # Should be the source/primary locale
          }
          # This gives translated values for the target locale
          targetTranslations: translations(locale: $targetLocale) {
            key
            value
            locale # Should be the targetLocale
          }
        }
      }
    `;

    try {
      console.log(`   Fetching translatable content and target translations for ${gid} (target: ${targetLocale})...`);
      // We pass targetLocale to the query for the translations field.
      // The sourceLocale option is conceptually for knowing which locale the digests belong to, 
      // but Shopify usually provides digests based on the original content (often the primary shop locale).
      const queryResult = await shopifyGraphQL(translatableResourceQuery, { resourceId: gid, targetLocale: targetLocale });
      
      const resource = queryResult.translatableResource;
      if (!resource) {
        console.error(`Resource with GID ${gid} not found or not translatable.`);
        process.exit(1);
      }

      const sourceContents = resource.sourceContent;
      if (!sourceContents || sourceContents.length === 0) {
        console.error(`No translatable keys found for resource ${gid} (source content). Ensure the resource has content and is marked translatable.`);
        process.exit(1);
      }
      console.log(`   Found ${sourceContents.length} translatable keys/digests from source content (locale: ${sourceContents[0]?.locale || sourceLocale}).`);

      const targetTranslationsArray = resource.targetTranslations || [];
      console.log(`   Found ${targetTranslationsArray.length} existing translated entries for ${targetLocale}.`);
      
      const targetTranslationsMap = new Map();
      targetTranslationsArray.forEach(t => targetTranslationsMap.set(t.key, t.value));

      const translationsForFile = {};
      sourceContents.forEach(sourceEntry => {
        const key = sourceEntry.key;
        const digest = sourceEntry.digest;
        const translatedValue = targetTranslationsMap.get(key);

        translationsForFile[key] = {
          value: translatedValue !== undefined ? translatedValue : `NEEDS TRANSLATION for ${key}`,
          source_digest: digest,
          source_value: sourceEntry.value, // Store the original source value for reference
          source_locale: sourceEntry.locale || sourceLocale, // Store the locale of the source content
          status: translatedValue !== undefined ? 'translated' : 'pending_translation'
        };
      });
      
      let resourceType = 'UNKNOWN_RESOURCE_TYPE';
      if (gid.includes('Product/')) resourceType = 'PRODUCTS';
      else if (gid.includes('Collection/')) resourceType = 'COLLECTIONS';
      else if (gid.includes('Article/')) resourceType = 'ARTICLES';
      else if (gid.includes('ShopPolicy/')) resourceType = 'SHOP_POLICIES';
      else if (gid.includes('Link/')) resourceType = 'LINKS';
      else if (gid.includes('Metafield/')) resourceType = 'METAFIELDS';

      const outputDir = path.join('messages', targetLocale);
      const outputFile = path.join(outputDir, 'shopify.json');

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`Created directory: ${outputDir}`);
      }

      let existingData = {};
      if (fs.existsSync(outputFile)) {
        try {
          existingData = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
        } catch (e) {
          console.warn(`Warning: Could not parse existing ${outputFile}. It will be overwritten if new data is for the same resource type. Error: ${e.message}`);
          existingData = {};
        }
      }
      
      if (!existingData[resourceType]) {
          existingData[resourceType] = {};
      }
      existingData[resourceType][gid] = translationsForFile;

      fs.writeFileSync(outputFile, JSON.stringify(existingData, null, 2));
      console.log(`Translations for ${gid} (${targetLocale}) saved to ${outputFile}`);
      console.log(`Please review ${outputFile}, update translations (replace "NEEDS TRANSLATION..." placeholders), and then use 'push-translations'.`);

    } catch (error) {
      console.error(`Failed to pull translations for ${gid} (${targetLocale}). ${error.message}`);
      process.exitCode = 1;
    }
  });

// --- Push Translations Command ---
program
  .command('push-translations')
  .description('Push translations for a specific resource GID and locale from local file.')
  .requiredOption('--gid <resourceGid>', 'The GID of the resource to push translations for')
  .requiredOption('--locale <targetLocale>', 'The target locale to push translations for (e.g., fr, de)')
  .action(async (options) => {
    const { gid, targetLocale } = options;
    console.log(`Pushing translations for resource ${gid}, locale: ${targetLocale}`);

    const inputFile = path.join('messages', targetLocale, 'shopify.json');
    if (!fs.existsSync(inputFile)) {
      console.error(`Error: Translation file not found at ${inputFile}`);
      console.error(`Please run 'pull-translations' first for this resource and locale.`);
      process.exit(1);
    }

    let resourceType = 'UNKNOWN_RESOURCE_TYPE';
    if (gid.includes('Product/')) resourceType = 'PRODUCTS';
    else if (gid.includes('Collection/')) resourceType = 'COLLECTIONS';
    else if (gid.includes('Article/')) resourceType = 'ARTICLES';
    else if (gid.includes('ShopPolicy/')) resourceType = 'SHOP_POLICIES';
    else if (gid.includes('Link/')) resourceType = 'LINKS';
    else if (gid.includes('Metafield/')) resourceType = 'METAFIELDS';


    try {
      const allTranslationsForLocale = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
      const translationsForResource = allTranslationsForLocale[resourceType]?.[gid];

      if (!translationsForResource) {
        console.error(`Error: No translations found for GID ${gid} (Type: ${resourceType}) in ${inputFile}`);
        process.exit(1);
      }

      const translationsToRegister = [];
      for (const key in translationsForResource) {
        const entry = translationsForResource[key];
        // Ensure value is not the placeholder and source_digest exists
        if (entry.value && entry.source_digest && !entry.value.startsWith('NEEDS TRANSLATION for')) { 
          translationsToRegister.push({
            locale: targetLocale,
            key: key,
            value: entry.value,
            translatableContentDigest: entry.source_digest // This is the digest of the *original* content
          });
        } else {
          console.warn(`   Skipping key '${key}' for ${gid}: missing value, source_digest, or still has placeholder text.`);
        }
      }

      if (translationsToRegister.length === 0) {
        console.log('No valid translations to push for this resource. Ensure placeholders are replaced and values are present.');
        process.exit(0);
      }

      console.log(`   Found ${translationsToRegister.length} translation entries to register for ${gid}.
   Preview: ${JSON.stringify(translationsToRegister.slice(0,2), null, 2)}...`);


      const translationsRegisterMutation = `
        mutation TranslationsRegister($resourceId: ID!, $translations: [TranslationInput!]!) {
          translationsRegister(resourceId: $resourceId, translations: $translations) {
            translations {
              locale
              key
              value
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const result = await shopifyGraphQL(translationsRegisterMutation, {
        resourceId: gid,
        translations: translationsToRegister
      });

      if (result.translationsRegister?.userErrors?.length > 0) {
        console.error('Error registering translations:', JSON.stringify(result.translationsRegister.userErrors, null, 2));
        process.exitCode = 1;
      } else {
        console.log('Translations pushed successfully:');
        console.log(JSON.stringify(result.translationsRegister.translations, null, 2));
      }

    } catch (error) {
      console.error(`Failed to push translations for ${gid} (target locale ${targetLocale}). Error: ${error.message}`);
      process.exitCode = 1;
    }
  });


// --- Helper function to list resource GIDs by type (with basic pagination) ---
async function listAllResourceGids(resourceType, maxPages = 5) {
  const gids = [];
  let hasNextPage = true;
  let cursor = null;
  let pageCount = 0;
  const BATCH_SIZE = 50; // Number of items to fetch per page

  console.log(`   Listing all GIDs for resource type: ${resourceType}`);

  let query;
  let fieldName;

  switch (resourceType.toUpperCase()) {
    case 'PRODUCTS':
      fieldName = 'products';
      query = `query ListProducts($first: Int!, $after: String) {
        ${fieldName}(first: $first, after: $after, sortKey: ID) {
          edges { node { id } }
          pageInfo { hasNextPage endCursor }
        }
      }`;
      break;
    case 'COLLECTIONS':
      fieldName = 'collections';
      query = `query ListCollections($first: Int!, $after: String) {
        ${fieldName}(first: $first, after: $after, sortKey: ID) {
          edges { node { id } }
          pageInfo { hasNextPage endCursor }
        }
      }`;
      break;
    case 'ARTICLES': // This lists articles across all blogs
      fieldName = 'articles';
      query = `query ListArticles($first: Int!, $after: String) {
        ${fieldName}(first: $first, after: $after, sortKey: ID) {
          edges { node { id } }
          pageInfo { hasNextPage endCursor }
        }
      }`;
      break;
    // Add cases for other resource types here: SHOP_POLICIES, ONLINE_STORE_THEME, etc.
    default:
      console.error(`   Unsupported resource type for listing: ${resourceType}`);
      return [];
  }

  while (hasNextPage && pageCount < maxPages) {
    pageCount++;
    console.log(`      Fetching page ${pageCount} for ${resourceType} (cursor: ${cursor})...`);
    try {
      const data = await shopifyGraphQL(query, { first: BATCH_SIZE, after: cursor });
      const resourceData = data[fieldName];
      
      if (resourceData?.edges) {
        resourceData.edges.forEach(edge => gids.push(edge.node.id));
      }
      hasNextPage = resourceData?.pageInfo?.hasNextPage || false;
      cursor = resourceData?.pageInfo?.endCursor || null;
      console.log(`      Found ${resourceData?.edges?.length || 0} GIDs this page. Total so far: ${gids.length}. Next page: ${hasNextPage}`);
    } catch (error) {
      console.error(`      Error fetching page ${pageCount} of ${resourceType}: ${error.message}`);
      hasNextPage = false; // Stop pagination on error
    }
  }
  if (pageCount >= maxPages && hasNextPage) {
    console.warn(`   Reached max page limit (${maxPages}) for ${resourceType}. There might be more GIDs to fetch.`);
  }
  console.log(`   Finished listing GIDs for ${resourceType}. Total found: ${gids.length}`);
  return gids;
}

// --- Pull All Typed Translations Command ---
program
  .command('pull-all-typed-translations')
  .description('Pulls all translations for specified resource types and locales, saving to type-specific JSON files.')
  .requiredOption('--locales <locales>', 'Comma-separated list of target locales (e.g., en,fi,sv)')
  .requiredOption('--resource-types <types>', 'Comma-separated list of resource types (e.g., PRODUCTS,COLLECTIONS,ARTICLES)')
  .option('--source-locale <locale>', 'The source locale for digests (default: en)', 'en')
  .action(async (options) => {
    const targetLocales = options.locales.split(',').map(l => l.trim()).filter(l => l);
    const resourceTypesToFetch = options.resourceTypes.split(',').map(rt => rt.trim().toUpperCase()).filter(rt => rt);
    const sourceLocaleForDigests = options.sourceLocale;

    if (targetLocales.length === 0) {
      console.error('Error: No target locales specified.');
      process.exit(1);
    }
    if (resourceTypesToFetch.length === 0) {
      console.error('Error: No resource types specified.');
      process.exit(1);
    }

    console.log(`Starting pull for all typed translations.`);
    console.log(`Target Locales: ${targetLocales.join(', ')}`);
    console.log(`Resource Types: ${resourceTypesToFetch.join(', ')}`);
    console.log(`Source Locale for Digests: ${sourceLocaleForDigests}`);

    const translatableResourceQuery = `
      query TranslatableResourceWithTranslations($resourceId: ID!, $targetLocale: String!) {
        translatableResource(resourceId: $resourceId) {
          resourceId
          sourceContent: translatableContent {
            key
            value
            digest
            locale
          }
          targetTranslations: translations(locale: $targetLocale) {
            key
            value
            locale
          }
        }
      }
    `;

    for (const locale of targetLocales) {
      console.log(`
Processing locale: ${locale}`);
      const outputDir = path.join('messages', locale);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`  Created directory: ${outputDir}`);
      }

      for (const resourceType of resourceTypesToFetch) {
        console.log(`  Fetching all resources of type: ${resourceType}`);
        const gids = await listAllResourceGids(resourceType);

        if (gids.length === 0) {
          console.log(`    No GIDs found for ${resourceType}. Skipping.`);
          continue;
        }

        const allTranslationsForType = {};
        let count = 0;

        for (const gid of gids) {
          count++;
          console.log(`    Processing GID ${count}/${gids.length}: ${gid} (Type: ${resourceType}, Locale: ${locale})`);
          try {
            const queryResult = await shopifyGraphQL(translatableResourceQuery, { resourceId: gid, targetLocale: locale });
            const resource = queryResult.translatableResource;

            if (!resource) {
              console.warn(`      Resource ${gid} not found or not translatable. Skipping.`);
              continue;
            }

            const sourceContents = resource.sourceContent;
            if (!sourceContents || sourceContents.length === 0) {
              console.warn(`      No translatable keys for GID ${gid}. Skipping.`);
              continue;
            }

            const targetTranslationsArray = resource.targetTranslations || [];
            const targetTranslationsMap = new Map();
            targetTranslationsArray.forEach(t => targetTranslationsMap.set(t.key, t.value));

            const translationsForFileEntry = {};
            sourceContents.forEach(sourceEntry => {
              const key = sourceEntry.key;
              const digest = sourceEntry.digest;
              const translatedValue = targetTranslationsMap.get(key);
              translationsForFileEntry[key] = {
                value: translatedValue !== undefined ? translatedValue : `NEEDS TRANSLATION for ${key}`,
                source_digest: digest,
                source_value: sourceEntry.value,
                source_locale: sourceEntry.locale || sourceLocaleForDigests,
                status: translatedValue !== undefined ? 'translated' : 'pending_translation'
              };
            });
            allTranslationsForType[gid] = translationsForFileEntry;

          } catch (error) {
            console.error(`      Error processing GID ${gid}: ${error.message}. Skipping this GID.`);
          }
        }
        
        if (Object.keys(allTranslationsForType).length > 0) {
            const outputFilename = `shopify_${resourceType.toLowerCase()}.json`;
            const outputFile = path.join(outputDir, outputFilename);
            // Read existing data if file exists, to merge intelligently (though this command usually overwrites for the type)
            let existingDataForFile = {};
            // This command is designed to fetch ALL for a type, so it usually overwrites the file for that type.
            // If you want to merge with existing, more complex logic would be needed here, but for now, it will replace content for this type.
            fs.writeFileSync(outputFile, JSON.stringify(allTranslationsForType, null, 2));
            console.log(`    Successfully wrote ${Object.keys(allTranslationsForType).length} entries for ${resourceType} to ${outputFile}`);
        } else {
            console.log(`    No translations processed for ${resourceType} in ${locale}. No file written.`);
        }
      }
    }
    console.log("\nPull all typed translations process completed.");
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
} 