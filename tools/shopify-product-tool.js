#!/usr/bin/env node

require('dotenv').config({ path: process.env.DOTENV_CONFIG_PATH || '.env.local' });

const { Command } = require('commander');
const { shopifyApi, ApiVersion, Session, LATEST_API_VERSION } = require('@shopify/shopify-api');
const { restResources } = require('@shopify/shopify-api/rest/admin/2025-04'); // Use the same version as client
const { GoogleGenAI, HarmCategory, HarmBlockThreshold, Type } = require('@google/genai'); // Gemini Text
const axios = require('axios'); // For Imagen API
const fs = require('fs');
const path = require('path');
require('@shopify/shopify-api/adapters/node'); // Import Node adapter

const program = new Command();

const DEFAULT_PRICE = 999.99; // Default price if AI doesn't provide one

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
  scopes: ['read_products', 'write_products'], // Adjust scopes as needed
  hostName: shopifyShopDomain.replace(/https?:\/\//, ''),
  apiVersion: ApiVersion.April25, // Match client config
  isCustomStoreApp: true, // IMPORTANT for custom app token auth
  adminApiAccessToken: adminAccessToken || '',
  restResources,
  // No session storage needed for custom app token auth typically
});

// Create a session for the custom app
const session = new Session({
    shop: shopifyShopDomain,
    accessToken: adminAccessToken,
    isOnline: false, // Offline token for admin access
    id: `custom-app-session-${shopifyShopDomain}` // Simple unique ID
});

// --- Gemini AI Client Initialization ---
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_STUDIO_KEY;
let genAI;
if (geminiApiKey) {
    genAI = new GoogleGenAI({ apiKey: geminiApiKey });
    console.log("Gemini client initialized with API Key.");
} else {
    console.warn("Warning: GEMINI_API_KEY or GOOGLE_AI_STUDIO_KEY not found in .env.local. AI generation features will be disabled.");
    // genAI remains undefined, functions should check for its existence
}

// --- GraphQL Client Helper ---
// Simple helper, consider using graphql-request for more complex needs
async function shopifyGraphQL(query, variables = {}) {
    const client = new shopify.clients.Graphql({ session });
    try {
        const response = await client.query({
            data: { query, variables },
        });
        // Check for GraphQL user errors in the response body
        if (response.body.errors) {
            console.error('GraphQL Query returned errors:', JSON.stringify(response.body.errors, null, 2));
            // Combine error messages for a clearer exception
            const combinedMessage = response.body.errors.map((e) => e.message).join('; ');
            throw new Error(`GraphQL query failed: ${combinedMessage}`);
        }
        // Handle cases where data might be missing even without errors
        if (!response.body.data) {
             console.error('GraphQL query succeeded but returned no data:', response.body);
             throw new Error('GraphQL query succeeded but returned no data.');
        }
        return response.body.data;
    } catch (error) {
        console.error('Error during Shopify GraphQL request:', error);
        // Ensure a standard Error object is thrown
        if (error instanceof Error) {
            throw error; // Re-throw if already an Error
        } else {
            // Wrap other error types in a standard Error
            throw new Error(`Shopify API request failed: ${JSON.stringify(error)}`);
        }
    }
}

// --- Gemini Product Data Generation Helper ---
/**
 * Generates detailed product data using Google Gemini based on provided instructions.
 * @param {string} instructions - User instructions for the type of products.
 * @param {number} amount - Number of products to generate.
 * @returns {Promise<Array<object>>} - A promise that resolves to an array of flat product data objects.
 */
async function generateProductDataWithGemini(instructions, amount) {
    if (!genAI) {
        throw new Error("Gemini API key not configured. Cannot generate product data.");
    }
    console.log(`Generating ${amount} product(s) data with Gemini based on: "${instructions}"`);

    // Schema with Tags and Finnish Translations (snake_case)
    const simplifiedProductSchema = {
        type: Type.OBJECT,
        properties: {
            products: {
                type: Type.ARRAY,
                description: `List of ${amount} product details including title, description_html (EN), price, tags, title_fi (FI), and description_html_fi (FI).`,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: 'Compelling product title (English).' },
                        description_html: { type: Type.STRING, description: 'Detailed product description in HTML format (English). REQUIRED.' },
                        price: { type: Type.NUMBER, description: 'Numeric price (e.g., 1499.99). REQUIRED.' },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Array of relevant string tags/keywords. REQUIRED.' },
                        title_fi: { type: Type.STRING, description: 'Finnish translation of the title. REQUIRED.' },
                        description_html_fi: { type: Type.STRING, description: 'Finnish translation of the description_html (HTML format). REQUIRED.' }
                    },
                    required: ["title", "description_html", "price", "tags", "title_fi", "description_html_fi"]
                }
            }
        },
        required: ["products"]
    };

    // Enhanced Prompt with Tags and Finnish Translations
    const prompt = `Generate detailed and realistic data for ${amount} Shopify product(s). Instructions: ${instructions}. 
Provide fields: title (EN), description_html (EN, HTML format), price (numeric), tags (array of strings), title_fi (Finnish title), description_html_fi (Finnish HTML description).
It is CRITICAL that you provide ALL fields, including Finnish translations (title_fi, description_html_fi). Do NOT omit any fields.`;

    try {
        const result = await genAI.models.generateContent({
            model: "gemini-2.0-flash", 
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: simplifiedProductSchema, // Use simplified schema
                temperature: 0.7,
            },
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            ],
        });
        
        const modelResponse = result;

        if (!modelResponse || !modelResponse.candidates || modelResponse.candidates.length === 0 || !modelResponse.candidates[0].content || !modelResponse.candidates[0].content.parts || modelResponse.candidates[0].content.parts.length === 0 || !modelResponse.candidates[0].content.parts[0].text) {
            console.error("Error: Unexpected response structure from Gemini API:", JSON.stringify(modelResponse, null, 2));
            throw new Error("Unexpected response structure from Gemini API.");
        }

        const responseText = modelResponse.candidates[0].content.parts[0].text;
        const cleanedText = responseText.replace(/^```json\n?|\n?```$/g, '');
        
        let generatedData;
        try {
            generatedData = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error("Error parsing JSON response from Gemini:", parseError);
            console.error("Original cleaned text:", cleanedText);
            throw new Error("Failed to parse JSON response from Gemini.");
        }

        // Ensure the structure is { products: [...] }, an array [{...}], or handle single object {...} for amount=1
        let finalProductArray = [];
        if (generatedData && generatedData.products && Array.isArray(generatedData.products)) {
            // Case 1: Standard { products: [...] } structure
            finalProductArray = generatedData.products;
        } else if (Array.isArray(generatedData) && generatedData.length === 1 && 
                   typeof generatedData[0] === 'object' && 
                   generatedData[0].title && generatedData[0].description_html && 
                   typeof generatedData[0].price === 'number' && Array.isArray(generatedData[0].tags) &&
                   generatedData[0].title_fi && generatedData[0].description_html_fi) {
            // Case 2: Direct array with one valid product object [{...}]
            console.warn("Parsed data was a single-element array.");
            finalProductArray = generatedData; 
        } else if (amount === 1 && generatedData && typeof generatedData === 'object' && 
                   generatedData.title && generatedData.description_html && 
                   typeof generatedData.price === 'number' && Array.isArray(generatedData.tags) &&
                   generatedData.title_fi && generatedData.description_html_fi) { 
            // Case 3: Single object {...} - needs wrapping
            console.warn("Parsed data was a single object, wrapping in array.");
            finalProductArray = [generatedData];
        } else {
            // None of the expected structures matched
            console.error("Error: Final generatedData structure is invalid or missing required fields (EN/FI/tags/price).", generatedData);
            throw new Error("Final generatedData structure is invalid or missing required fields.");
        }

        console.log(`✅ Successfully parsed data for ${finalProductArray.length} product(s).`);
        return finalProductArray; // Return the array of flat product objects
    } catch (error) {
        console.error("Error generating product data with Gemini:", error);
        throw error;
    }
}

// --- Imagen 3 Image Generation Helper (Adapted from gemini-image-tool.js) ---
async function generateImageWithImagen3(prompt, folder = 'public/images/generated_products', baseFilename = 'product-image') {
    if (!geminiApiKey) { // Re-check API key for Imagen via Gemini API
        throw new Error("Gemini API key not configured. Cannot generate image.");
    }
    console.log(`Generating image with Imagen 3 for prompt: "${prompt}"`);

    try {
        // Ensure output folder exists
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
            console.log(`Created image directory: ${folder}`);
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${geminiApiKey}`;
        const requestBody = {
            instances: [{ prompt: prompt }],
            parameters: {
                sampleCount: 1, // Generate one image per product for now
                aspectRatio: "1:1" // Default aspect ratio
            }
        };

        const response = await axios.post(apiUrl, requestBody);

        if (response.data && response.data.predictions && response.data.predictions.length > 0) {
            const prediction = response.data.predictions[0];
            if (prediction.bytesBase64Encoded) {
                const timestamp = Date.now();
                // Sanitize filename based on prompt (simple version)
                const safeBase = baseFilename.replace(/\W+/g, '-').substring(0, 30);
                const filename = `${safeBase}-${timestamp}.png`;
                const outputPath = path.join(folder, filename);
                fs.writeFileSync(outputPath, Buffer.from(prediction.bytesBase64Encoded, 'base64'));
                console.log(`✅ Image saved to: ${outputPath}`);
                return outputPath; // Return the path of the saved image
            } else {
                 throw new Error('Imagen 3 response prediction missing image data.');
            }
        } else {
            console.error('Unexpected Imagen 3 API response format:', response.data);
            throw new Error('Unexpected Imagen 3 API response format');
        }
    } catch (error) {
        console.error('Error generating image with Imagen 3:', error.response ? JSON.stringify(error.response.data || error.message) : error.message);
        throw error;
    }
}

/**
 * Uploads an image file to Shopify's staged upload target.
 * @param {string} uploadUrl - The target URL provided by Shopify's staged upload endpoint.
 * @param {Array<object>} parameters - The parameters required for the upload target.
 * @param {string} imagePath - The local path to the image file.
 * @param {string} imageFilename - The desired filename for the image.
 * @returns {Promise<boolean>} - A promise that resolves to true if upload is successful, false otherwise.
 */
async function uploadToShopifyTarget(uploadUrl, parameters, imagePath, imageFilename) {
    const formData = new FormData();
    parameters.forEach(({ name, value }) => {
        formData.append(name, value);
    });
    const fileBuffer = fs.readFileSync(imagePath);
    formData.append('file', new Blob([fileBuffer]), imageFilename); 

    console.log(`Uploading image to Shopify target URL: ${uploadUrl}`);
    try {
        const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error(`❌ Image upload failed (${uploadResponse.status}): ${errorText}`);
            return false; // Indicate failure
        }
        console.log("✅ Image uploaded to Shopify successfully.");
        return true; // Indicate success
    } catch (error) {
        console.error(`❌ Image upload network error:`, error.message);
        return false; // Indicate failure
    }
}

/**
 * Creates a file record in Shopify after a successful staged upload.
 * @param {string} resourceUrl - The resourceUrl from the staged upload target.
 * @param {string} altText - Alt text for the image.
 * @returns {Promise<object|null>} - A promise that resolves to the created file object or null on failure.
 */
async function createFileRecord(resourceUrl, altText) {
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
        console.error("❌ File creation API error:", error.message);
        return null; // Indicate failure
    }
}

/**
 * Associates an uploaded media file (image) with a product.
 * @param {string} productId - The GID of the product.
 * @param {string} resourceUrl - The resourceUrl from the staged upload target.
 * @param {string} altText - Alt text for the image.
 * @returns {Promise<boolean>} - A promise that resolves to true if association is successful or pending, false on error.
 */
async function associateMediaWithProduct(productId, resourceUrl, altText) {
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
            // Don't return false here, product exists, just image failed
            console.warn(`   Product ${productId} created, but image association failed.`);
            return true; // Still consider it a partial success
        } else if (createMediaResult.productCreateMedia?.media?.[0]?.status === 'READY') {
            console.log(`✅ Image successfully associated with product ${productId}.`);
            return true;
        } else {
            console.warn(`   Image association for product ${productId} initiated, but final status is ${createMediaResult.productCreateMedia?.media?.[0]?.status || 'unknown'}.`);
            return true; // Consider pending association a success for workflow
        }
    } catch (error) {
        console.error(`❌ Image association API error:`, error.message);
        return false; // Indicate failure
    }
}

// --- Commander Setup ---
program
  .name('shopify-product-tool')
  .description('CLI tool to manage Shopify products using Admin API')
  .version('0.0.1');

// --- Get Product Command ---
program
  .command('get')
  .description('Get a product by its ID')
  .requiredOption('--id <gid>', 'Product GID (e.g., gid://shopify/Product/12345)')
  .action(async (options) => {
    console.log(`Fetching product with ID: ${options.id}`);
    const query = `
      query GetProduct($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          status
          vendor
          productType
          createdAt
          updatedAt
          variants(first: 5) {
            edges {
              node {
                id
                title
                sku
                price
              }
            }
          }
        }
      }
    `;
    try {
      const data = await shopifyGraphQL(query, { id: options.id });
      console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Failed to get product ${options.id}`);
        process.exitCode = 1;
    }
  });

// --- List Products Command ---
program
    .command('list')
    .description('List products')
    .option('--limit <number>', 'Number of products to list', '10')
    .option('--status <status>', 'Filter by status (ACTIVE, ARCHIVED, DRAFT)')
    .action(async (options) => {
        console.log(`Listing products (limit: ${options.limit}${options.status ? `, status: ${options.status}` : ''})...`);
        let queryFilter = `first: ${parseInt(options.limit, 10)}`;
        if (options.status) {
            queryFilter += `, query: "status:${options.status.toUpperCase()}"`;
        }
        const query = `
        query ListProducts {
            products(${queryFilter}) {
                edges {
                    node {
                        id
                        title
                        handle
                        status
                        variants(first: 1) {
                          edges {
                            node {
                              price
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
        try {
            const data = await shopifyGraphQL(query);
            console.log(JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(`Failed to list products`);
            process.exitCode = 1;
        }
    });

// --- Create Product Command ---
program
  .command('create')
  .description('Create a new product manually')
  .requiredOption('--title <title>', 'Product title')
  .option('--bodyHtml <html_string>', 'Product description (HTML)')
  .option('--vendor <vendor>', 'Product vendor')
  .option('--productType <type>', 'Product type')
  .option('--status <status>', 'Product status (ACTIVE, ARCHIVED, DRAFT)', 'DRAFT')
  .option('--tags <tags>', 'Comma-separated list of tags')
  .action(async (options) => {
    console.log(`Creating product manually: ${options.title}`);
    const input = {
      title: options.title,
      bodyHtml: options.bodyHtml,
      vendor: options.vendor,
      productType: options.productType,
      status: options.status.toUpperCase(),
      tags: options.tags ? options.tags.split(',').map(tag => tag.trim()) : undefined,
    };
    const mutation = `
      mutation ProductCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            status
          }
          userErrors {
            field
            message
          }
        }
      }`;
    try {
      const data = await shopifyGraphQL(mutation, { input });
      if (data.productCreate?.userErrors?.length > 0) {
        console.error('Error creating product:', JSON.stringify(data.productCreate.userErrors, null, 2));
        process.exitCode = 1;
      } else {
        console.log('Product created successfully:');
        console.log(JSON.stringify(data.productCreate.product, null, 2));
      }
    } catch (error) {
        console.error(`Failed to create product`);
        process.exitCode = 1;
    }
  });

// --- Generate Products Command (NEW) ---
program
  .command('generate')
  .description('Generate and create products using AI')
  .requiredOption('-a, --amount <number>', 'Number of products to generate', (value) => parseInt(value, 10))
  .requiredOption('-i, --instructions <text>', 'Instructions for the type of products to generate')
  .option('--status <status>', 'Status for generated products (ACTIVE, ARCHIVED, DRAFT)', 'DRAFT')
  .option('--img-folder <path>', 'Folder to save generated images', 'public/images/generated_products')
  .action(async (options) => {
    console.log(`Generating ${options.amount} products based on instructions: "${options.instructions}"`);

    try {
      const productDataArray = await generateProductDataWithGemini(options.instructions, options.amount);

      if (!productDataArray || productDataArray.length === 0) {
        console.error('No product data was generated. Exiting.');
        process.exit(1);
      }

      console.log(`--- Starting Product Creation (${productDataArray.length} products) ---`);

      for (const productData of productDataArray) {
        console.log(`\nProcessing generated product: "${productData.title}"`);

        const priceToUse = (typeof productData.price === 'number' && productData.price > 0) 
                           ? productData.price 
                           : DEFAULT_PRICE; 
        const priceString = priceToUse.toFixed(2);
        // Look for snake_case description field from AI response
        const descriptionToUse = productData.description_html; 

        if (priceToUse === DEFAULT_PRICE && (!productData.price || productData.price <= 0)) {
            console.warn(`⚠️ AI did not provide a valid price. Using default: ${priceString}`);
        }
        if (!descriptionToUse) {
            // Adjusted warning for snake_case
            console.warn(`⚠️ AI did not provide a description (description_html). Product will be created without one.`);
        }

        const tagsToUse = (Array.isArray(productData.tags) && productData.tags.length > 0) 
                          ? productData.tags 
                          : ["generated"]; // Fallback tags
        
        if (tagsToUse.length === 1 && tagsToUse[0] === "generated") {
            console.warn(`⚠️ AI did not provide valid tags. Using default: ["generated"]`);
        }

        // Extract Finnish translations
        const titleFi = productData.title_fi;
        const descriptionHtmlFi = productData.description_html_fi;

        // Input for productCreate mutation (with tags)
        const productCreateInput = {
            title: productData.title,
            descriptionHtml: descriptionToUse || '<p>Default description - AI failed to provide one.</p>', 
            vendor: "Generated Goods", // Keep fallback
            productType: "Generated", // Keep fallback
            tags: tagsToUse, // Use AI tags or fallback
            status: options.status.toUpperCase(),
        };

        // Use productCreate mutation
        const productCreateMutation = `
            mutation productCreate($input: ProductInput!) {
              productCreate(input: $input) {
                product {
                  id
                  handle
                  title
                  variants(first: 1) {
                    nodes {
                       id
                       sku
                       price # Will likely be 0.00 initially
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

        let productId = null;
        let defaultVariantId = null;
        let createdPrice = null; // Price returned from productCreate (likely 0.00)

        try {
          console.log(`Attempting to create product "${productData.title}" using productCreate...`);
          
          const createResult = await shopifyGraphQL(productCreateMutation, { input: productCreateInput }); 
          
          const createdProduct = createResult.productCreate?.product;
          productId = createdProduct?.id;
          defaultVariantId = createdProduct?.variants?.nodes?.[0]?.id; 
          createdPrice = createdProduct?.variants?.nodes?.[0]?.price;
          
          if (createResult.productCreate?.userErrors?.length > 0) {
             console.error("Error during productCreate:", JSON.stringify(createResult.productCreate.userErrors, null, 2));
             // Throw an error to prevent further processing for this product
             throw new Error(`Product creation failed with user errors: ${JSON.stringify(createResult.productCreate.userErrors)}`);
          }

          if (!productId || !defaultVariantId) {
            console.error("Error: Failed to create product or retrieve its default variant ID.", createResult);
            continue; // Skip to next product
          }
          // Log the initial state (price likely 0)
          console.log(`✅ Product created (ID: ${productId}). Default Variant ID: ${defaultVariantId}, Initial Price: ${createdPrice}`);
          
          // --- Price Update using productVariantsBulkUpdate (Now ALWAYS runs after create) ---
          // Use the priceString determined earlier (AI or default)
          if (productId && defaultVariantId) {
             try {
                  console.log(`   Attempting to set price for default variant ${defaultVariantId} to ${priceString}...`);
                  const variantBulkUpdateMutation = `
                      mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
                          productVariantsBulkUpdate(productId: $productId, variants: $variants) {
                              productVariants {
                                  id
                                  price
                              }
                              userErrors {
                                  field
                                  message
                              }
                          }
                      }
                  `;
                  const variantUpdateInput = {
                      id: defaultVariantId,
                      price: priceString
                  };

                  const variantUpdateResult = await shopifyGraphQL(
                       variantBulkUpdateMutation, 
                       { productId: productId, variants: [variantUpdateInput] }
                  );

                  if (variantUpdateResult.productVariantsBulkUpdate?.userErrors?.length > 0) {
                      console.error(`   ❌ Error setting price for variant ${defaultVariantId}:`, variantUpdateResult.productVariantsBulkUpdate.userErrors);
                      // Don't necessarily stop the whole process, but log error
                  } else if (variantUpdateResult.productVariantsBulkUpdate?.productVariants?.[0]?.id) {
                      console.log(`   ✅ Price set successfully for variant ${defaultVariantId} to ${variantUpdateResult.productVariantsBulkUpdate.productVariants[0].price}.`);
                  } else {
                      console.warn(`   ⚠️ Price set mutation ran, but no confirmation ID received.`, variantUpdateResult);
                  }
              } catch (variantError) {
                  console.error(`   ❌ Exception occurred while setting price:`, variantError);
              }
          }
          // --- REMOVED the previous price check/fallback logic, as the update now always runs ---

          // --- Register Finnish Translations (if available and product created) ---
          if (productId && titleFi && descriptionHtmlFi) {
             console.log(`   Attempting to register Finnish translations for product ${productId}...`);
             let titleDigest = null;
             let descriptionDigest = null;
             let digestsFound = false;
             const maxRetries = 3;
             const retryDelay = 3000; // 3 seconds

             for (let attempt = 1; attempt <= maxRetries; attempt++) {
                 console.log(`      Attempt ${attempt}/${maxRetries}: Fetching digests for EN title and descriptionHtml...`);
                 try {
                     const translatableResourceQuery = `
                         query($resourceId: ID!) {
                             translatableResource(resourceId: $resourceId) {
                                 resourceId
                                 translatableContent {
                                     key
                                     digest
                                     locale
                                 }
                             }
                         }
                     `;
                     const digestResult = await shopifyGraphQL(translatableResourceQuery, { resourceId: productId });
                     const originalContent = digestResult.translatableResource?.translatableContent;
                     
                     if (originalContent && Array.isArray(originalContent)) {
                        originalContent.forEach(content => {
                           if (content.key === 'title' && content.locale === 'en') titleDigest = content.digest;
                           if (content.key === 'descriptionHtml' && content.locale === 'en') descriptionDigest = content.digest;
                        });
                     }

                     if (titleDigest && descriptionDigest) {
                         console.log(`      Digests found successfully.`);
                         digestsFound = true;
                         break; // Exit loop if digests are found
                     } else {
                         console.warn(`      Digests not found on attempt ${attempt}.`);
                     }

                 } catch (digestError) {
                     console.error(`      Error fetching digests on attempt ${attempt}:`, digestError);
                     // Don't break loop on error, allow retries
                 }
                 
                 if (attempt < maxRetries) {
                     console.log(`      Waiting ${retryDelay / 1000}s before next attempt...`);
                     await new Promise(resolve => setTimeout(resolve, retryDelay));
                 }
             } // End retry loop

             // Proceed only if digests were found
             if (digestsFound) {
                 try {
                     console.log(`      Registering translations with digests...`);
                     const translationsRegisterMutation = `
                         mutation translationsRegister($resourceId: ID!, $translations: [TranslationInput!]!) {
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
                     const translationsInput = [
                         { locale: "fi", key: "title", value: titleFi, translatableContentDigest: titleDigest },
                         { locale: "fi", key: "descriptionHtml", value: descriptionHtmlFi, translatableContentDigest: descriptionDigest }
                     ];

                     const transResult = await shopifyGraphQL(
                         translationsRegisterMutation, 
                         { resourceId: productId, translations: translationsInput }
                     );

                     if (transResult.translationsRegister?.userErrors?.length > 0) {
                         console.error(`   ❌ Error registering Finnish translations:`, transResult.translationsRegister.userErrors);
                     } else if (transResult.translationsRegister?.translations?.length > 0) {
                         console.log(`   ✅ Finnish translations registered successfully.`);
                     } else {
                         console.warn(`   ⚠️ Translation registration ran, but no confirmation received.`, transResult);
                     }
                 } catch (transError) {
                     console.error(`   ❌ Exception occurred while registering Finnish translations:`, transError);
                 }
             } else {
                  console.error(`   ❌ Failed to fetch required digests after ${maxRetries} attempts. Skipping translation.`);
             }
          } else if (productId) {
              console.warn(`   ⚠️ Skipping Finnish translation registration (missing title_fi or description_html_fi from AI).`);
          }

        } catch (shopifyError) {
          console.error(`❌ Failed during product creation/update for "${productData.title}":`, shopifyError.message);
          continue; // Skip to the next product if creation/initial update fails
        }
        
        // --- Image Generation and Association (existing logic remains) ---
        let imagePath = null;
        if (productId) {
          try {
            const imagePrompt = `High-quality product photography of ${productData.title}. Clean background.`;
            imagePath = await generateImageWithImagen3(imagePrompt, options.imgFolder, productData.title);
          } catch (imgError) {
            console.warn(`⚠️ Failed to generate image for "${productData.title}". Proceeding without image.`);
          }
        }

        // 4. Upload and Associate Image if available
        if (productId && imagePath) {
          try {
              console.log(`Attempting to upload and associate image: ${imagePath}`);
              const imageFilename = path.basename(imagePath);
              const imageStats = fs.statSync(imagePath);
              const imageMimeType = 'image/png'; // Assuming PNG from Imagen

              // --- Step 4.1: Staged Upload Create ---
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
                  mimeType: imageMimeType,
                  httpMethod: 'POST',
                  fileSize: imageStats.size.toString(),
              }];

              console.log("Requesting staged upload target...");
              const stagedUploadResult = await shopifyGraphQL(stagedUploadsQuery, { input: stagedUploadInput });

              if (stagedUploadResult.stagedUploadsCreate?.userErrors?.length > 0) {
                  console.error("❌ Staged upload creation failed:", stagedUploadResult.stagedUploadsCreate.userErrors);
                  throw new Error("Staged upload creation failed.");
              }

              const target = stagedUploadResult.stagedUploadsCreate?.stagedTargets?.[0];
              if (!target || !target.url || !target.parameters || !target.resourceUrl) {
                  console.error("❌ Invalid staged upload target received:", target);
                  throw new Error("Invalid staged upload target received.");
              }
              console.log("✅ Staged upload target received.");

              // --- Step 4.2: Upload File to Target URL ---
              const uploadSuccess = await uploadToShopifyTarget(target.url, target.parameters, imagePath, imageFilename);

              if (!uploadSuccess) {
                  throw new Error("Image upload to Shopify failed.");
              }

              // --- Step 4.3: Create File Record in Shopify ---
              const fileCreateResult = await createFileRecord(target.resourceUrl, productData.title);

              if (!fileCreateResult) {
                  throw new Error("File creation failed.");
              }

              // --- Step 4.4: Associate Image with Product --- 
              // Using productCreateMedia mutation
              const associateResult = await associateMediaWithProduct(productId, target.resourceUrl, productData.title);

              if (!associateResult) {
                  throw new Error("Image association failed.");
              }

          } catch (uploadError) {
              console.error(`❌ Failed to upload/associate image for product ${productId}:`, uploadError.message);
              // Continue to next product even if image fails
          }
        } else if (productId) {
            console.log(`   Skipping image upload for product ${productId} (no image generated/found).`);
        }
      }

      console.log(`\n--- Product Generation Complete ---`);

    } catch (error) {
      console.error('\n❌ Product generation process failed:', error.message);
      process.exitCode = 1;
    }
  });

// --- Update Product Command ---
program
  .command('update')
  .description('Update an existing product')
  .requiredOption('--id <gid>', 'Product GID to update (e.g., gid://shopify/Product/12345)')
  .option('--title <title>', 'New product title')
  .option('--status <status>', 'New product status (ACTIVE, ARCHIVED, DRAFT)')
  // Add more options as needed
  .action(async (options) => {
    console.log(`Updating product: ${options.id}`);
    const input = {
      id: options.id,
      title: options.title,
      status: options.status ? options.status.toUpperCase() : undefined,
      // Add other fields to update
    };

    // Remove undefined fields from input
    Object.keys(input).forEach(key => input[key] === undefined && delete input[key]);

    if (Object.keys(input).length <= 1) {
        console.error("Error: No update fields provided besides ID.");
        process.exit(1);
    }

    const mutation = `
      mutation ProductUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            title
            status
            updatedAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    try {
      const data = await shopifyGraphQL(mutation, { input });
      if (data.productUpdate?.userErrors?.length > 0) {
        console.error('Error updating product:', JSON.stringify(data.productUpdate.userErrors, null, 2));
        process.exitCode = 1;
      } else {
        console.log('Product updated successfully:');
        console.log(JSON.stringify(data.productUpdate.product, null, 2));
      }
    } catch (error) {
        console.error(`Failed to update product ${options.id}`);
        process.exitCode = 1;
    }
  });

// --- Delete Product Command ---
program
  .command('delete')
  .description('Delete a product by its ID')
  .requiredOption('--id <gid>', 'Product GID to delete (e.g., gid://shopify/Product/12345)')
  .action(async (options) => {
    console.log(`Deleting product: ${options.id}`);
    const input = { id: options.id };

    const mutation = `
      mutation ProductDelete($input: ProductDeleteInput!) {
        productDelete(input: $input) {
          deletedProductId
          userErrors {
            field
            message
          }
        }
      }
    `;

    try {
      const data = await shopifyGraphQL(mutation, { input });
      if (data.productDelete?.userErrors?.length > 0) {
        console.error('Error deleting product:', JSON.stringify(data.productDelete.userErrors, null, 2));
        process.exitCode = 1;
      } else {
        console.log(`Product deleted successfully: ${data.productDelete.deletedProductId}`);
      }
    } catch (error) {
        console.error(`Failed to delete product ${options.id}`);
        process.exitCode = 1;
    }
  });

program.parse(process.argv);

// Handle cases where no command is specified
if (!process.argv.slice(2).length) {
  program.outputHelp();
}