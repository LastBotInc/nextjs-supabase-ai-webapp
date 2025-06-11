import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';
import axios from 'axios';

// Adobe Commerce API Client
class AdobeCommerceClient {
  private baseUrl: string;
  private consumerKey?: string;
  private consumerSecret?: string;
  private accessToken?: string;
  private accessTokenSecret?: string;
  private adminToken?: string;
  private storeCode: string;
  private authType: string;

  constructor() {
    this.baseUrl = process.env.ADOBE_API_URL || '';
    // Remove trailing /rest since we'll add it in makeRequest
    this.baseUrl = this.baseUrl.replace(/\/rest\/?$/, '');
    
    this.consumerKey = process.env.ADOBE_CONSUMER_KEY;
    this.consumerSecret = process.env.ADOBE_CONSUMER_SECRET;
    this.accessToken = process.env.ADOBE_ACCESS_TOKEN;
    this.accessTokenSecret = process.env.ADOBE_ACCESS_TOKEN_SECRET;
    this.adminToken = process.env.ADOBE_ADMIN_TOKEN;
    this.storeCode = process.env.ADOBE_STORE_CODE || 'default';
    
    // Determine auth type based on available credentials
    if (this.adminToken) {
      this.authType = 'admin_token';
    } else if (this.consumerKey && this.consumerSecret && this.accessToken && this.accessTokenSecret) {
      this.authType = 'oauth';
    } else {
      this.authType = 'none';
    }
  }

  hasValidCredentials(): boolean {
    return this.authType !== 'none' && !!this.baseUrl;
  }

  getDebugInfo() {
    return {
      baseUrl: this.baseUrl,
      authType: this.authType,
      storeCode: this.storeCode,
      hasConsumerKey: !!this.consumerKey,
      hasConsumerSecret: !!this.consumerSecret,
      hasAccessToken: !!this.accessToken,
      hasAccessTokenSecret: !!this.accessTokenSecret,
      hasAdminToken: !!this.adminToken
    };
  }

  // Generate OAuth 1.0 signature
  private generateOAuthSignature(method: string, url: string, params: Record<string, any> = {}): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    
    const oauthParams: Record<string, string> = {
      oauth_consumer_key: this.consumerKey!,
      oauth_token: this.accessToken!,
      oauth_signature_method: 'HMAC-SHA256',
      oauth_timestamp: timestamp,
      oauth_nonce: nonce,
      oauth_version: '1.0'
    };

    // Combine OAuth and request parameters
    const allParams = { ...oauthParams, ...params };
    
    // Create parameter string
    const paramString = Object.keys(allParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
      .join('&');
    
    // Create signature base string
    const signatureBaseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;
    
    // Create signing key
    const signingKey = `${encodeURIComponent(this.consumerSecret!)}&${encodeURIComponent(this.accessTokenSecret!)}`;
    
    // Generate signature
    const signature = crypto.createHmac('sha256', signingKey).update(signatureBaseString).digest('base64');
    
    // Add signature to OAuth params
    oauthParams.oauth_signature = signature;
    
    return oauthParams;
  }

  // Generate OAuth authorization header
  private generateAuthHeader(method: string, url: string, params: Record<string, any> = {}): string {
    const oauthParams = this.generateOAuthSignature(method, url, params);
    
    const authHeader = 'OAuth ' + Object.keys(oauthParams)
      .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
      .join(', ');
    
    return authHeader;
  }

  // Make authenticated API request
  async makeRequest(endpoint: string, params = {}, method = 'GET') {
    const url = `${this.baseUrl}/rest${endpoint}`;
    
    try {
      const config: any = {
        method,
        url,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      // Add authentication based on type
      if (this.authType === 'admin_token') {
        config.headers['Authorization'] = `Bearer ${this.adminToken}`;
      } else if (this.authType === 'oauth') {
        const authHeader = this.generateAuthHeader(method, url, params);
        config.headers['Authorization'] = authHeader;
      } else {
        throw new Error('No valid authentication method available');
      }

      if (method === 'GET' && Object.keys(params).length > 0) {
        config.params = params;
      } else if (method !== 'GET') {
        config.data = params;
      }

      const response = await axios(config);
      return response.data;
    } catch (error: any) {
      console.error('Adobe Commerce API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Adobe Commerce API request failed');
    }
  }

  // Search/List products
  async getProducts(options: {
    searchTerm?: string;
    limit?: number;
    page?: number;
  } = {}) {
    const { searchTerm, limit = 20, page = 1 } = options;
    
    const params: any = {
      'searchCriteria[pageSize]': limit,
      'searchCriteria[currentPage]': page
    };

    let filterIndex = 0;

    // Add search term filter if provided
    // Use only the first word to avoid OAuth signature issues with spaces
    if (searchTerm && searchTerm.trim()) {
      const firstWord = searchTerm.trim().split(' ')[0];
      params[`searchCriteria[filterGroups][${filterIndex}][filters][0][field]`] = 'name';
      params[`searchCriteria[filterGroups][${filterIndex}][filters][0][value]`] = `%${firstWord}%`;
      params[`searchCriteria[filterGroups][${filterIndex}][filters][0][condition_type]`] = 'like';
      filterIndex++;
    }

    // Only get active products
    params[`searchCriteria[filterGroups][${filterIndex}][filters][0][field]`] = 'status';
    params[`searchCriteria[filterGroups][${filterIndex}][filters][0][value]`] = '1'; // Enabled
    params[`searchCriteria[filterGroups][${filterIndex}][filters][0][condition_type]`] = 'eq';

    return await this.makeRequest('/V1/products', params);
  }

  // Test connection
  async testConnection() {
    try {
      const result = await this.getProducts({ limit: 1 });
      return {
        success: true,
        productCount: result.total_count || 0,
        storeUrl: this.baseUrl
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        storeUrl: this.baseUrl
      };
    }
  }

  // Get detailed product information including stock
  async getProductDetails(sku: string) {
    try {
      console.log(`🔍 Fetching detailed product data for SKU: ${sku}`);
      
      // Get basic product data with stock information
      const endpoint = `/V1/products/${encodeURIComponent(sku)}`;
      const productData = await this.makeRequest(endpoint, {}, 'GET');
      
      // Try to get media information separately
      let mediaData = null;
      try {
        const mediaEndpoint = `/V1/products/${encodeURIComponent(sku)}/media`;
        console.log(`🖼️ Fetching media for SKU: ${sku}`);
        mediaData = await this.makeRequest(mediaEndpoint, {}, 'GET');
        console.log(`📸 Media data found:`, mediaData?.length || 0, 'items');
      } catch (mediaError: any) {
        console.log(`⚠️ Media endpoint not available for ${sku}:`, mediaError.message);
      }

      // Try to get stock information separately
      let stockData = null;
      try {
        const stockEndpoint = `/V1/stockItems/${encodeURIComponent(sku)}`;
        stockData = await this.makeRequest(stockEndpoint, {}, 'GET');
        console.log(`📦 Stock data found for ${sku}:`, {
          qty: stockData?.qty,
          is_in_stock: stockData?.is_in_stock
        });
      } catch (stockError: any) {
        console.log(`⚠️ Stock data not available for ${sku}:`, stockError.message);
      }

      // Enhanced product data
      const enhancedProduct = {
        ...productData,
        media: mediaData,
        stock: stockData
      };

      console.log(`✅ Enhanced product data for ${sku}:`, {
        hasMedia: !!mediaData,
        hasStock: !!stockData,
        customAttributesCount: productData.custom_attributes?.length || 0
      });

      return enhancedProduct;
    } catch (error: any) {
      console.error(`❌ Error fetching enhanced product data for ${sku}:`, error.message);
      return null; // Return null instead of throwing to allow fallback to basic product data
    }
  }

  // Extract image URLs from Adobe Commerce product data
  getProductImages(product: any): string[] {
    const images: string[] = [];
    console.log(`🖼️ Extracting images for product: ${product.name || product.sku}`);

    // Function to convert relative path to full URL
    const makeFullImageUrl = (relativePath: string): string => {
      if (!relativePath || relativePath === 'no_selection') return '';
      
      // Remove leading slash if present
      const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
      
      // Construct full media URL
      // Adobe Commerce media URLs are typically: https://domain.com/media/catalog/product/...
      const baseMediaUrl = this.baseUrl.replace('/rest', '').replace(/\/$/, '');
      const fullUrl = `${baseMediaUrl}/media/catalog/product/${cleanPath}`;
      
      console.log(`🔗 Image URL constructed: ${relativePath} -> ${fullUrl}`);
      return fullUrl;
    };

    // Extract from media array if available (from separate media endpoint)
    if (product.media && Array.isArray(product.media)) {
      console.log(`📸 Found ${product.media.length} media items from media endpoint`);
      product.media.forEach((mediaItem: any, index: number) => {
        if (mediaItem.file || mediaItem.path) {
          const imagePath = mediaItem.file || mediaItem.path;
          const fullUrl = makeFullImageUrl(imagePath);
          if (fullUrl) {
            images.push(fullUrl);
            console.log(`✅ Media ${index + 1}: ${fullUrl}`);
          }
        }
      });
    }

    // Extract from custom attributes (fallback)
    const customAttributes = product.custom_attributes || [];
    const imageAttributes = ['image', 'small_image', 'thumbnail', 'swatch_image'];
    
    console.log(`🔍 Checking custom attributes for images...`);
    imageAttributes.forEach(attrName => {
      const attr = customAttributes.find((a: any) => a.attribute_code === attrName);
      if (attr && attr.value && attr.value !== 'no_selection') {
        const fullUrl = makeFullImageUrl(attr.value);
        if (fullUrl && !images.includes(fullUrl)) {
          images.push(fullUrl);
          console.log(`✅ Custom attribute ${attrName}: ${fullUrl}`);
        }
      }
    });

    // Extract from media_gallery_entries if available (from product data)
    if (product.media_gallery_entries && Array.isArray(product.media_gallery_entries)) {
      console.log(`📷 Found ${product.media_gallery_entries.length} media gallery entries`);
      product.media_gallery_entries.forEach((entry: any, index: number) => {
        if (entry.file) {
          const fullUrl = makeFullImageUrl(entry.file);
          if (fullUrl && !images.includes(fullUrl)) {
            images.push(fullUrl);
            console.log(`✅ Gallery ${index + 1}: ${fullUrl}`);
          }
        }
      });
    }

    console.log(`🖼️ Total images found: ${images.length}`, images);
    return images;
  }
}

// Shopify API helper functions
async function createShopifyProduct(product: any) {
  console.log('🔵 Creating Shopify product:', {
    title: product.title,
    sku: product.variants[0]?.sku,
    status: product.status || 'active'
  });

  const shopifyUrl = `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/2025-04/products.json`;
  
  try {
    const response = await axios.post(shopifyUrl, {
      product: product
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
      }
    });

    if (response.data?.product) {
      console.log('✅ Product created successfully:', response.data.product.id);
      return response.data.product;
    } else {
      console.error('❌ No product returned from Shopify');
      throw new Error('No product returned from Shopify');
    }
  } catch (error: any) {
    console.error('❌ Error creating Shopify product:', error.response?.data || error.message);
    throw new Error(`Failed to create product in Shopify: ${error.response?.data?.errors || error.message}`);
  }
}

async function updateShopifyProduct(productId: string, product: any) {
  console.log('🔄 Updating Shopify product:', {
    id: productId,
    title: product.title,
    sku: product.variants[0]?.sku
  });

  const shopifyUrl = `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/2025-04/products/${productId}.json`;
  
  try {
    const response = await axios.put(shopifyUrl, {
      product: product
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
      }
    });

    if (response.data?.product) {
      console.log('✅ Product updated successfully:', response.data.product.id);
      return response.data.product;
    } else {
      console.error('❌ No product returned from Shopify update');
      throw new Error('No product returned from Shopify update');
    }
  } catch (error: any) {
    console.error('❌ Error updating Shopify product:', error.response?.data || error.message);
    throw new Error(`Failed to update product in Shopify: ${error.response?.data?.errors || error.message}`);
  }
}

async function searchShopifyProductBySku(sku: string) {
  console.log('🔍 Searching for Shopify product by SKU:', sku);

  const shopifyUrl = `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/2025-04/products.json?fields=id,title,handle,variants&limit=250`;
  
  try {
    const response = await axios.get(shopifyUrl, {
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
      }
    });

    if (response.data?.products) {
      for (const product of response.data.products) {
        for (const variant of product.variants || []) {
          if (variant.sku === sku) {
            console.log('✅ Found existing product:', product.id);
            return product;
          }
        }
      }
    }
    
    console.log('ℹ️ No existing product found with SKU:', sku);
    return null;
  } catch (error: any) {
    console.error('❌ Error searching for Shopify product:', error.response?.data || error.message);
    throw new Error(`Failed to search for product in Shopify: ${error.response?.data?.errors || error.message}`);
  }
}

// Map Adobe Commerce product to Shopify format
function mapAdobeProductToShopify(adobeProduct: any, adobeAPI: AdobeCommerceClient) {
  console.log('🔵 Mapping Adobe product:', {
    name: adobeProduct.name,
    sku: adobeProduct.sku,
    price: adobeProduct.price,
    customAttributesCount: adobeProduct.custom_attributes?.length || 0,
    mediaCount: adobeProduct.media?.length || 0,
    hasStock: !!adobeProduct.stock
  });

  // Extract custom attributes for easier access
  const customAttributes = adobeProduct.custom_attributes?.reduce((acc: any, attr: any) => {
    acc[attr.attribute_code] = attr.value;
    return acc;
  }, {}) || {};

  // Get images using the new image extraction method
  const images = adobeAPI.getProductImages(adobeProduct);

  // Use stock data if available
  const stockData = adobeProduct.stock || adobeProduct.stock_item;
  const stockQty = stockData?.qty || 0;
  const isInStock = stockData?.is_in_stock || false;

  console.log('🔍 Custom attributes available:', Object.keys(customAttributes));
  console.log('📸 Images found:', images.length);
  console.log('📦 Stock info:', { qty: stockQty, inStock: isInStock });

  // Build rich product description
  const descriptionParts = [`<h2>${adobeProduct.name}</h2>`];
  
  // Add product details from custom attributes
  if (customAttributes.short_description) {
    descriptionParts.push(`<div class="short-description">${customAttributes.short_description}</div>`);
  }
  
  if (customAttributes.description) {
    descriptionParts.push(`<div class="description">${customAttributes.description}</div>`);
  }

  descriptionParts.push('<h3>Product Details</h3>');
  descriptionParts.push('<ul>');
  descriptionParts.push(`<li><strong>SKU:</strong> ${adobeProduct.sku}</li>`);
  
  if (adobeProduct.weight) {
    descriptionParts.push(`<li><strong>Weight:</strong> ${adobeProduct.weight} kg</li>`);
  }

  // Map custom attribute values to human-readable names where possible
  const attributeMapping: Record<string, string> = {
    'color': 'Color',
    'size_clothes': 'Size', 
    'material_clothes': 'Material',
    'season': 'Season',
    'package_size': 'Package Size',
    'model_clothes': 'Model',
    'spr_product_type': 'Product Type',
    'use_type': 'Use Type',
    'country_of_manufacture': 'Country of Manufacture'
  };

  // Add relevant custom attributes to description
  Object.entries(attributeMapping).forEach(([attrCode, displayName]) => {
    if (customAttributes[attrCode]) {
      descriptionParts.push(`<li><strong>${displayName}:</strong> ${customAttributes[attrCode]}</li>`);
    }
  });

  descriptionParts.push('</ul>');

  // Add product features
  const features = [];
  if (customAttributes.is_returnable === '2') features.push('This product is returnable.');
  if (customAttributes.gift_message_available === '2') features.push('Gift message available for this product.');
  if (customAttributes.gift_wrapping_available === '2') features.push('Gift wrapping available for this product.');
  
  if (features.length > 0) {
    descriptionParts.push('<h3>Product Features</h3>');
    features.forEach(feature => descriptionParts.push(`<p><em>${feature}</em></p>`));
  }

  const body_html = descriptionParts.join('\n');

  // Build comprehensive tags from all available data
  const tags = ['adobe-commerce', 'red-cross', 'imported'];
  
  // Add attribute-based tags
  if (customAttributes.color) tags.push(`color-${customAttributes.color}`);
  if (customAttributes.size_clothes) tags.push(`size-${customAttributes.size_clothes}`);
  if (customAttributes.material_clothes) tags.push(`material-${customAttributes.material_clothes}`);
  if (customAttributes.season) {
    const seasons = customAttributes.season.toString().split(',');
    seasons.forEach((season: string) => tags.push(`season-${season.trim()}`));
  }

  // Format price properly
  const price = parseFloat(adobeProduct.price?.toString() || '0').toFixed(2);

  // Create Shopify product structure with images
  const shopifyProduct = {
    title: adobeProduct.name,
    body_html,
    vendor: 'Red Cross Finland',
    product_type: customAttributes.spr_product_type || '',
    status: 'active',
    published: true,
    tags: tags.join(', '),
    images: images.map(imageUrl => ({
      src: imageUrl,
      alt: adobeProduct.name
    })),
    variants: [
      {
        title: 'Default Title',
        sku: adobeProduct.sku,
        price: price,
        inventory_management: 'shopify',
        inventory_quantity: stockQty,
        inventory_policy: isInStock ? 'continue' : 'deny',
        weight: parseFloat(adobeProduct.weight?.toString() || '0'),
        weight_unit: 'kg',
        requires_shipping: true,
        taxable: true
      }
    ]
  };

  console.log('✅ Final mapped product:', {
    title: shopifyProduct.title,
    price: shopifyProduct.variants[0].price,
    images: shopifyProduct.images.length,
    stock: shopifyProduct.variants[0].inventory_quantity,
    tags: shopifyProduct.tags.split(', ').length
  });

  return shopifyProduct;
}

// GET - Test connection and get info
export async function GET(request: Request) {
  try {
    // 1. Token Verification Layer
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const authClient = createClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // 2. Admin Role Verification Layer
    const { data: profile, error: profileError } = await authClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Error verifying admin status' }, { status: 500 });
    }

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const adobeAPI = new AdobeCommerceClient();
    
    if (!adobeAPI.hasValidCredentials()) {
      return NextResponse.json({
        isConfigured: false,
        connectionStatus: 'not_configured',
        error: 'Adobe Commerce credentials not configured. Check environment variables.'
      });
    }

    try {
      const testResult = await adobeAPI.testConnection();
      
      if (testResult.success) {
        return NextResponse.json({
          isConfigured: true,
          connectionStatus: 'connected',
          storeUrl: testResult.storeUrl,
          productCount: testResult.productCount,
          lastSync: null // Could track this in database if needed
        });
      } else {
        // Handle specific known errors
        let userFriendlyError = testResult.error;
        if (testResult.error?.includes('Signature method HMAC-SHA1 is not supported')) {
          userFriendlyError = 'OAuth authentication not supported. Admin token authentication required.';
        } else if (testResult.error?.includes('Specified request cannot be processed')) {
          userFriendlyError = 'Connection failed. Check credentials or try admin token authentication.';
        }
        
        return NextResponse.json({
          isConfigured: true,
          connectionStatus: 'error',
          storeUrl: testResult.storeUrl,
          error: userFriendlyError
        });
      }
    } catch (connectionError: any) {
      return NextResponse.json({
        isConfigured: true,
        connectionStatus: 'error',
        error: `Connection test failed: ${connectionError.message}`
      });
    }
  } catch (error: any) {
    console.error('Adobe Commerce info error:', error);
    return NextResponse.json({
      isConfigured: false,
      connectionStatus: 'error',
      error: error.message
    }, { status: 500 });
  }
}

// POST - Sync products from Adobe Commerce to Shopify
export async function POST(request: NextRequest) {
  try {
    // 1. Token Verification Layer
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const authClient = createClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // 2. Admin Role Verification Layer
    const { data: profile, error: profileError } = await authClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Error verifying admin status' }, { status: 500 });
    }

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    const { searchTerm, limit = 20, forceSync = false } = await request.json();
    
    console.log('🔄 Starting Adobe Commerce product sync...', {
      searchTerm,
      limit,
      forceSync
    });

    const adobeAPI = new AdobeCommerceClient();
    
    if (!adobeAPI.hasValidCredentials()) {
      return NextResponse.json({
        success: false,
        error: 'Adobe Commerce credentials not configured'
      });
    }

    // Test Shopify connection
    if (!process.env.SHOPIFY_SHOP_DOMAIN || !process.env.SHOPIFY_ADMIN_ACCESS_TOKEN) {
      return NextResponse.json({
        success: false,
        error: 'Shopify credentials not configured'
      });
    }

    const stats = {
      fetched: 0,
      created: 0,
      updated: 0,
      errors: 0
    };

    try {
      // Fetch products from Adobe Commerce
      console.log(`Fetching products from Adobe Commerce with search term: "${searchTerm}"`);
      const adobeProducts = await adobeAPI.getProducts({
        searchTerm,
        limit,
        page: 1
      });

      if (!adobeProducts?.items?.length) {
        return NextResponse.json({
          success: true,
          message: 'No products found in Adobe Commerce store',
          stats
        });
      }

      stats.fetched = adobeProducts.items.length;
      console.log(`Fetched ${stats.fetched} products from Adobe Commerce`);

      // Process each product
      let created = 0;
      let updated = 0;
      let skipped = 0;
      let errors = 0;

      for (const adobeProduct of adobeProducts.items) {
        try {
          console.log(`\n📦 Processing product: ${adobeProduct.name} (${adobeProduct.sku})`);
          
          // Get enhanced product details
          const detailedProduct = await adobeAPI.getProductDetails(adobeProduct.sku);
          const productToMap = detailedProduct || adobeProduct;
          
          // Map Adobe product to Shopify format
          const shopifyProduct = mapAdobeProductToShopify(productToMap, adobeAPI);
          
          // Check if product already exists
          const existingProduct = await searchShopifyProductBySku(adobeProduct.sku);
          
          if (existingProduct && !forceSync) {
            console.log(`⏭️ Product ${adobeProduct.sku} already exists in Shopify, skipping...`);
            skipped++;
          } else if (existingProduct && forceSync) {
            console.log(`🔄 Product ${adobeProduct.sku} exists, updating with enhanced data...`);
            // Update existing product with enhanced data
            const updatedProduct = await updateShopifyProduct(existingProduct.id, shopifyProduct);
            if (updatedProduct) {
              console.log(`✅ Updated product: ${updatedProduct.title}`);
              updated++;
            }
          } else {
            console.log(`➕ Creating new product: ${adobeProduct.name}`);
            // Create new product
            const createdProduct = await createShopifyProduct(shopifyProduct);
            if (createdProduct) {
              console.log(`✅ Created product: ${createdProduct.title}`);
              created++;
            }
          }
          
        } catch (error: any) {
          console.error(`❌ Error processing product ${adobeProduct.sku}:`, error.message);
          errors++;
        }
      }

      return NextResponse.json({
        success: true,
        message: `Product sync completed`,
        results: {
          total_processed: adobeProducts.items.length,
          created,
          updated,
          skipped,
          errors
        }
      });

    } catch (syncError: any) {
      console.error('Adobe Commerce sync error:', syncError);
      return NextResponse.json({
        success: false,
        error: `Sync failed: ${syncError.message}`,
        stats
      });
    }
  } catch (error: any) {
    console.error('Adobe Commerce sync error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 