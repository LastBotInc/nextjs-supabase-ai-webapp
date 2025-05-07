import { program } from 'commander';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { Parser as XmlParser } from 'xml2js';
import { spawn } from 'child_process';
import { createInterface } from 'readline';
import axios from 'axios';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Define interfaces that match the mapper function
interface CaffitellaProduct {
  id: string;
  title: string;
  link: string;
  image_link: string;
  price: string;
  categories: {
    category: string[];
  };
  description?: string;
  title_fi?: string;
  description_html_fi?: string;
}

interface ShopifyVariant {
  id: number;
  title: string;
  price: string;
  sku: string;
  inventoryQuantity: number;
}

interface ShopifyProduct {
  id: number;
  title: string;
  vendor: string;
  productType: string;
  tags: string[];
  status: 'active' | 'draft' | 'archived';
  variants: ShopifyVariant[];
  title_fi?: string;
  description_html_fi?: string;
}

// Implementation of the mapper function to avoid import issues
function caffitellaToShopify(source: CaffitellaProduct): ShopifyProduct & { description?: string, image_link?: string, title_fi?: string, description_html_fi?: string } {
  // Extract categories for product type and tags
  const categories = source.categories?.category || [];
  const productType = categories.length > 0 ? categories[0] : 'Other';
  
  // Convert European price format (comma as decimal separator) to standard format with dot
  const standardizedPrice = source.price ? source.price.replace(',', '.') : '0.00';
  
  // Create a single variant with the product price
  const variant: ShopifyVariant = {
    id: parseInt(source.id, 10) || 0,
    title: 'Default',
    price: standardizedPrice,
    sku: `CAFF-${source.id}`,
    inventoryQuantity: 1
  };
  
  return {
    id: parseInt(source.id, 10) || 0,
    title: source.title || 'Unnamed Product',
    vendor: 'Caffitella',
    productType: productType,
    tags: categories,
    status: 'active',
    variants: [variant],
    description: source.description,
    image_link: source.image_link,
    title_fi: source.title_fi,
    description_html_fi: source.description_html_fi
  };
}

// Shopify environment check
const requiredEnvVars = [
  'SHOPIFY_SHOP_DOMAIN',
  'SHOPIFY_ADMIN_ACCESS_TOKEN',
  'SHOPIFY_API_KEY',
  'SHOPIFY_API_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} environment variable is not set`);
    process.exit(1);
  }
}

// Initialize the Shopify session for GraphQL calls
const shopifyShopDomain = process.env.SHOPIFY_SHOP_DOMAIN;
const adminAccessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

// Helper function for GraphQL calls
async function shopifyGraphQL(query: string, variables: any = {}) {
  try {
    const response = await fetch(`https://${shopifyShopDomain}/admin/api/2025-04/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminAccessToken!
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL returned errors:', data.errors);
      throw new Error(`GraphQL query failed: ${data.errors.map((e: any) => e.message).join('; ')}`);
    }
    
    return data.data;
  } catch (error) {
    console.error('Error during Shopify GraphQL request:', error);
    throw error;
  }
}

// Helper for downloading an image
async function downloadImage(imageUrl: string, outputFolder = 'temp'): Promise<string> {
  try {
    // Create output folder if it doesn't exist
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }

    // Generate a filename from the URL
    const filename = path.basename(imageUrl).split('?')[0]; // Remove query params
    const outputPath = path.join(outputFolder, filename);

    // Download the image
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(outputPath, Buffer.from(response.data));

    console.log(`Downloaded image to ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}

// Helper for uploading an image to Shopify
async function uploadToShopifyTarget(uploadUrl: string, parameters: any[], imagePath: string, imageFilename: string): Promise<boolean> {
  try {
    const formData = new FormData();
    parameters.forEach(({ name, value }) => {
      formData.append(name, value);
    });
    
    const fileBuffer = fs.readFileSync(imagePath);
    formData.append('file', new Blob([fileBuffer]), imageFilename);

    console.log(`Uploading image to Shopify target URL: ${uploadUrl}`);
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: formData as any, // Type casting due to differences in node-fetch FormData
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error(`❌ Image upload failed (${uploadResponse.status}): ${errorText}`);
      return false; // Indicate failure
    }
    
    console.log("✅ Image uploaded to Shopify successfully.");
    return true; // Indicate success
  } catch (error) {
    console.error(`❌ Image upload network error:`, error);
    return false; // Indicate failure
  }
}

// Create a file record in Shopify
async function createFileRecord(resourceUrl: string, altText: string): Promise<any> {
  const fileCreateQuery = `
    mutation fileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files {
          id
          fileStatus
          ... on MediaImage {
            image {
              url
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
  
  const fileCreateInput = [{
    alt: altText,
    contentType: "IMAGE",
    originalSource: resourceUrl, 
  }];

  console.log("Creating file record in Shopify...");
  
  try {
    const fileCreateResult = await shopifyGraphQL(fileCreateQuery, { files: fileCreateInput });

    if (fileCreateResult.fileCreate?.userErrors?.length > 0) {
      console.error("❌ File creation failed:", fileCreateResult.fileCreate.userErrors);
      return null; // Indicate failure
    }

    const createdFile = fileCreateResult.fileCreate?.files?.[0];
    if (!createdFile || createdFile.fileStatus === 'FAILED') {
      console.error("❌ File creation failed or file processing failed:", createdFile);
      return null; // Indicate failure
    }

    // Wait briefly for file processing if needed (optional, might need polling)
    if (createdFile.fileStatus !== 'READY') {
      console.log(`File status is ${createdFile.fileStatus}, waiting briefly...`);
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
    }

    console.log(`✅ File record created (ID: ${createdFile.id}).`);
    return createdFile; // Return the file object on success
  } catch (error) {
    console.error("❌ File creation API error:", error);
    return null; // Indicate failure
  }
}

// Associate media with product
async function associateMediaWithProduct(productId: string, resourceUrl: string, altText: string): Promise<boolean> {
  const createMediaMutation = `
    mutation productCreateMedia($media: [CreateMediaInput!]!, $productId: ID!) {
      productCreateMedia(media: $media, productId: $productId) {
        media {
          id
          status
          ... on MediaImage {
            image {
              url
            }
          }
        }
        mediaUserErrors {
          field
          message
          code
        }
        product {
          id
          title
        }
      }
    }
  `;
  
  const createMediaInput = [{
    alt: altText,
    mediaContentType: "IMAGE",
    originalSource: resourceUrl, 
  }];

  console.log(`Associating image with product ${productId}...`);
  
  try {
    const createMediaResult = await shopifyGraphQL(createMediaMutation, { 
      media: createMediaInput,
      productId: productId 
    });

    if (createMediaResult.productCreateMedia?.mediaUserErrors?.length > 0) {
      console.error("❌ Product image association failed:", createMediaResult.productCreateMedia.mediaUserErrors);
      return false;
    } else if (createMediaResult.productCreateMedia?.media?.[0]?.status === 'READY') {
      console.log(`✅ Image successfully associated with product ${productId}.`);
      return true;
    } else {
      console.warn(`   Image association for product ${productId} initiated, but final status is ${createMediaResult.productCreateMedia?.media?.[0]?.status || 'unknown'}.`);
      return true; // Consider pending association a success for workflow
    }
  } catch (error) {
    console.error(`❌ Image association API error:`, error);
    return false; // Indicate failure
  }
}

// Get staged upload target from Shopify
async function getStagedUploadTarget(imagePath: string, imageFilename: string, mimeType = 'image/jpeg'): Promise<any> {
  const stats = fs.statSync(imagePath);
  const fileSize = stats.size;

  const stagedUploadsQuery = `
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
  
  const stagedUploadInput = [{
    resource: "IMAGE",
    filename: imageFilename,
    mimeType: mimeType,
    httpMethod: 'POST',
    fileSize: String(fileSize),
  }];

  console.log("Requesting staged upload target...");
  
  try {
    const stagedUploadResult = await shopifyGraphQL(stagedUploadsQuery, { input: stagedUploadInput });

    if (stagedUploadResult.stagedUploadsCreate?.userErrors?.length > 0) {
      console.error("❌ Staged upload creation failed:", stagedUploadResult.stagedUploadsCreate.userErrors);
      return null;
    }

    const target = stagedUploadResult.stagedUploadsCreate?.stagedTargets?.[0];
    if (!target || !target.url || !target.parameters || !target.resourceUrl) {
      console.error("❌ Invalid staged upload target received:", target);
      return null;
    }
    
    console.log("✅ Staged upload target received.");
    return target;
  } catch (error) {
    console.error("❌ Error getting staged upload target:", error);
    return null;
  }
}

// Function to handle image upload workflow for a product
async function uploadProductImage(productId: string, imageUrl: string, title: string): Promise<boolean> {
  try {
    // Step 1: Download the image
    console.log(`Starting image upload workflow for product ${productId} with image ${imageUrl}`);
    const imagePath = await downloadImage(imageUrl);
    const imageFilename = path.basename(imagePath);
    
    // Step 2: Get staged upload target
    const target = await getStagedUploadTarget(imagePath, imageFilename);
    if (!target) {
      throw new Error("Failed to get staged upload target");
    }
    
    // Step 3: Upload to Shopify target
    const uploadSuccess = await uploadToShopifyTarget(target.url, target.parameters, imagePath, imageFilename);
    if (!uploadSuccess) {
      throw new Error("Failed to upload image to Shopify target");
    }
    
    // Step 4: Create file record
    const fileCreateResult = await createFileRecord(target.resourceUrl, title);
    if (!fileCreateResult) {
      throw new Error("Failed to create file record");
    }
    
    // Step 5: Associate image with product
    const associateResult = await associateMediaWithProduct(productId, target.resourceUrl, title);
    if (!associateResult) {
      throw new Error("Failed to associate image with product");
    }
    
    // Clean up temp file
    fs.unlinkSync(imagePath);
    
    return true;
  } catch (error) {
    console.error(`Error in image upload workflow:`, error);
    return false;
  }
}

program
  .description('Export product feed to Shopify')
  .option('-f, --feed-url <url>', 'Direct URL of the feed')
  .option('-s, --schema <path>', 'Path to the schema JSON file that contains the feed URL')
  .option('-l, --limit <number>', 'Maximum number of products to export', '10')
  .option('-d, --dry-run', 'Perform a dry run without actually creating products', false)
  .parse(process.argv);

const options = program.opts();

if (!options.feedUrl && !options.schema) {
  console.error('Error: Either --feed-url or --schema is required');
  process.exit(1);
}

async function fetchFeedContent(feedUrl: string): Promise<any[]> {
  try {
    console.log(`Fetching feed from ${feedUrl}...`);
    const response = await fetch(feedUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.statusText} (status: ${response.status})`);
    }
    const contentType = response.headers.get('content-type');
    const feedText = await response.text();

    let data;

    if (contentType && (contentType.includes('application/json') || contentType.includes('text/json'))) {
      data = JSON.parse(feedText);
    } else if (contentType && (contentType.includes('application/xml') || contentType.includes('text/xml'))) {
      console.log('Detected XML content type. Parsing XML...');
      const parser = new XmlParser({ explicitArray: false, mergeAttrs: true });
      const jsonData = await parser.parseStringPromise(feedText);
      if (jsonData.rss && jsonData.rss.channel && Array.isArray(jsonData.rss.channel.item)) {
        data = jsonData.rss.channel.item;
      } else if (jsonData.feed && Array.isArray(jsonData.feed.entry)) {
        data = jsonData.feed.entry;
      } else if (jsonData.products && Array.isArray(jsonData.products.product)) {
          data = jsonData.products.product;
      } else if (jsonData.shop && Array.isArray(jsonData.shop.item)) {
        data = jsonData.shop.item;
      } else {
        const rootKey = Object.keys(jsonData)[0];
        if (rootKey && Array.isArray(jsonData[rootKey])) {
            data = jsonData[rootKey];
        } else if (rootKey && typeof jsonData[rootKey] === 'object' && jsonData[rootKey] !== null) {
            const nestedKeys = Object.keys(jsonData[rootKey]);
            for (const nestedKey of nestedKeys) {
                if (Array.isArray(jsonData[rootKey][nestedKey])) {
                    data = jsonData[rootKey][nestedKey];
                    break;
                }
            }
        }
        if (!Array.isArray(data)) {
             console.warn("Could not automatically find an array of items in the XML structure. Using the entire parsed JSON object as a single item.");
             return [jsonData];
        }
      }
    } else {
      throw new Error(`Unsupported content type: ${contentType}. Only application/json and application/xml are currently supported.`);
    }
    
    if (Array.isArray(data)) {
        return data;
    } else if (typeof data === 'object' && data !== null) {
        const commonArrayKeys = ['items', 'products', 'entries', 'feed', 'data', 'channel', 'shop'];
        for (const key of commonArrayKeys) {
            if (Array.isArray((data as any)[key])) {
                return (data as any)[key];
            }
        }
        console.warn("Parsed feed content is a single object, not an array. Wrapping it for schema detection.");
        return [data];
    }

    throw new Error('Could not find an array of items in the feed content after parsing.');

  } catch (error) {
    console.error('Error fetching or parsing feed:', error);
    process.exit(1);
  }
}

interface ProductCreationResult {
  id?: string;
  success: boolean;
  output?: string;
}

interface ExportResult {
  product: ShopifyProduct;
  result?: ProductCreationResult;
  error?: Error;
}

async function createShopifyProduct(product: ShopifyProduct & { description?: string, image_link?: string }, dryRun: boolean = false): Promise<ProductCreationResult> {
  if (dryRun) {
    console.log('DRY RUN: Would create product:', JSON.stringify(product, null, 2));
    return { id: `dry-run-id-${Date.now()}`, success: true };
  }
  
  // Use the Shopify product tool to create the product
  return new Promise((resolve, reject) => {
    const args = [
      'tools/shopify-product-tool.cjs',
      'create',
      `--title=${product.title}`,
      `--vendor=${product.vendor}`,
      `--productType=${product.productType}`,
      `--status=${product.status.toLowerCase()}`,
      `--tags=${product.tags.join(',')}`
    ];

    // Add description if available
    if (product.description) {
      args.push(`--bodyHtml=${product.description}`);
    }

    // Add Finnish translations if available
    if (product.title_fi) {
      args.push(`--titleFi=${product.title_fi}`);
    }
    if (product.description_html_fi) {
      args.push(`--bodyHtmlFi=${product.description_html_fi}`);
    }
    
    console.log(`Executing: node ${args.join(' ')}`);
    
    const child = spawn('node', args, { stdio: ['pipe', 'pipe', 'pipe'] });
    
    let output = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
      console.log(`stdout: ${data}`);
    });
    
    child.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
    
    child.on('close', async (code) => {
      if (code === 0) {
        try {
          // Try to extract the product ID from the output
          const match = output.match(/id": "([^"]+)"/);
          const productId = match ? match[1] : undefined;
          
          // Handle price update if needed - first extract variant ID
          const variantMatch = output.match(/variants":\s*{\s*"nodes":\s*\[\s*{\s*"id":\s*"([^"]+)"/);
          const variantId = variantMatch ? variantMatch[1] : undefined;
          
          // If we have a product ID, first update price if needed
          if (productId && variantId && product.variants && product.variants.length > 0 && product.variants[0].price !== '0.00') {
            console.log(`Updating price for variant ${variantId} to ${product.variants[0].price}...`);
            
            // Use GraphQL directly to update the price
            const updatePriceArgs = [
              'tools/shopify-product-tool.cjs',
              'update-price',
              `--productId=${productId}`,
              `--variantId=${variantId}`,
              `--price=${product.variants[0].price}`
            ];
            
            console.log(`Executing price update: node ${updatePriceArgs.join(' ')}`);
            
            const priceChild = spawn('node', updatePriceArgs, { stdio: ['pipe', 'pipe', 'pipe'] });
            
            priceChild.stdout.on('data', (data) => {
              console.log(`Price update stdout: ${data}`);
            });
            
            priceChild.stderr.on('data', (data) => {
              console.error(`Price update stderr: ${data}`);
            });
            
            await new Promise<void>((priceResolve) => {
              priceChild.on('close', (priceCode) => {
                if (priceCode === 0) {
                  console.log(`Price updated successfully for variant ${variantId}`);
                } else {
                  console.error(`Price update failed for variant ${variantId}`);
                }
                priceResolve();
              });
            });
          }
          
          // If we have a product ID and an image link, use the product tool to upload the image
          if (productId && product.image_link) {
            console.log(`Product created successfully with ID ${productId}. Now uploading image from ${product.image_link}...`);
            
            // Use the update command with --image parameter
            const imageArgs = [
              'tools/shopify-product-tool.cjs', 
              'update',
              `--id=${productId}`,
              `--image=${product.image_link}`
            ];
            
            console.log(`Executing image upload: node ${imageArgs.join(' ')}`);
            
            const imageChild = spawn('node', imageArgs, { stdio: ['pipe', 'pipe', 'pipe'] });
            
            imageChild.stdout.on('data', (data) => {
              console.log(`Image upload stdout: ${data}`);
            });
            
            imageChild.stderr.on('data', (data) => {
              console.error(`Image upload stderr: ${data}`);
            });
            
            imageChild.on('close', (imageCode) => {
              if (imageCode === 0) {
                console.log(`Image uploaded successfully for product ${productId}`);
              } else {
                console.error(`Image upload failed for product ${productId}`);
              }
              
              // Consider the product creation successful even if image upload fails
              resolve({ id: productId, success: true, output });
            });
          } else {
            resolve({ id: productId, success: true, output });
          }
        } catch (error) {
          console.error('Error parsing product creation output:', error);
          resolve({ success: true, output }); // Still consider it a success if the process succeeded
        }
      } else {
        reject(new Error(`Product creation process exited with code ${code}`));
      }
    });
  });
}

async function getUserConfirmation(prompt: string): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${prompt} (y/n): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

async function main() {
  try {
    // Determine the feed URL - either direct or from schema
    let feedUrl = options.feedUrl;
    
    if (!feedUrl && options.schema) {
      // Read the feed URL from the schema file
      const schemaPath = path.resolve(options.schema);
      if (!fs.existsSync(schemaPath)) {
        console.error(`Schema file not found: ${schemaPath}`);
        process.exit(1);
      }
      
      const schemaData = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      if (!schemaData.feed_url) {
        console.error(`Schema file does not contain a feed_url: ${schemaPath}`);
        process.exit(1);
      }
      
      feedUrl = schemaData.feed_url;
      console.log(`Using feed URL from schema: ${feedUrl}`);
    }
    
    // Fetch the feed content
    const feedItems = await fetchFeedContent(feedUrl);
    console.log(`Found ${feedItems.length} items in the feed.`);
    
    // Apply limit
    const limit = parseInt(options.limit, 10);
    const itemsToProcess = feedItems.slice(0, limit);
    console.log(`Processing ${itemsToProcess.length} items (limit: ${limit}).`);
    
    // Transform to Shopify format
    const shopifyProducts: (ShopifyProduct & { description?: string, image_link?: string })[] = [];
    
    for (const item of itemsToProcess) {
      try {
        const shopifyProduct = caffitellaToShopify(item as CaffitellaProduct);
        shopifyProducts.push(shopifyProduct);
      } catch (error) {
        console.error(`Error mapping item to Shopify format:`, error);
        console.error('Item that failed:', JSON.stringify(item, null, 2));
      }
    }
    
    console.log(`Mapped ${shopifyProducts.length} products to Shopify format.`);
    
    // Confirm with user
    if (!options.dryRun) {
      const confirmed = await getUserConfirmation(
        `You are about to create ${shopifyProducts.length} products in your Shopify store. Continue?`
      );
      
      if (!confirmed) {
        console.log('Operation canceled by user.');
        process.exit(0);
      }
    }
    
    // Create in Shopify
    const results: ExportResult[] = [];
    for (let i = 0; i < shopifyProducts.length; i++) {
      const product = shopifyProducts[i];
      console.log(`Creating product ${i + 1}/${shopifyProducts.length}: ${product.title}`);
      
      try {
        const result = await createShopifyProduct(product, options.dryRun);
        results.push({ product, result });
        console.log(`Successfully ${options.dryRun ? 'simulated creation of' : 'created'} product: ${product.title}`);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error creating product ${product.title}:`, error);
          results.push({ product, error });
        } else {
          const genericError = new Error('Unknown error occurred during product creation');
          console.error(`Error creating product ${product.title}:`, genericError);
          results.push({ product, error: genericError });
        }
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Summary
    console.log('\n----- Export Summary -----');
    console.log(`Total products processed: ${shopifyProducts.length}`);
    console.log(`Successful: ${results.filter(r => r.result?.success).length}`);
    console.log(`Failed: ${results.filter(r => r.error).length}`);
    
    if (results.filter(r => r.error).length > 0) {
      console.log('\nFailed products:');
      results.filter(r => r.error).forEach(r => {
        if (r.error) {
          console.log(`- ${r.product.title}: ${r.error.message}`);
        }
      });
    }
    
  } catch (error) {
    console.error('Error during export process:', error);
    process.exit(1);
  }
}

main(); 