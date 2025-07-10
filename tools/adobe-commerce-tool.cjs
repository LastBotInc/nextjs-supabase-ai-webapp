#!/usr/bin/env node

const { Command } = require('commander');
const crypto = require('crypto');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

class AdobeCommerceAPI {
  constructor() {
    // Remove trailing /rest if present to avoid duplication
    this.baseUrl = (process.env.ADOBE_API_URL || '').replace(/\/rest$/, '');
    this.consumerKey = process.env.ADOBE_CONSUMER_KEY;
    this.consumerSecret = process.env.ADOBE_CONSUMER_SECRET;
    this.accessToken = process.env.ADOBE_ACCESS_TOKEN;
    this.accessTokenSecret = process.env.ADOBE_ACCESS_TOKEN_SECRET;
    this.storeCode = process.env.ADOBE_STORE_CODE || 'default';
    
    // Admin token authentication (alternative to OAuth)
    this.adminUsername = process.env.ADOBE_ADMIN_USERNAME;
    this.adminPassword = process.env.ADOBE_ADMIN_PASSWORD;
    this.adminToken = process.env.ADOBE_ADMIN_TOKEN; // Pre-generated token
    
    this.authType = this.determineAuthType();
  }

  // Determine which authentication method to use
  determineAuthType() {
    if (this.adminToken) {
      return 'admin_token';
    } else if (this.consumerKey && this.consumerSecret && this.accessToken && this.accessTokenSecret) {
      return 'oauth';
    } else if (this.adminUsername && this.adminPassword) {
      return 'admin_credentials';
    } else {
      return 'none';
    }
  }

  // Check if we have proper credentials
  hasValidCredentials() {
    if (this.authType === 'none') {
      console.error('❌ Missing required Adobe Commerce API credentials in .env.local');
      console.error('Option 1 - OAuth 1.0: ADOBE_API_URL, ADOBE_CONSUMER_KEY, ADOBE_CONSUMER_SECRET, ADOBE_ACCESS_TOKEN, ADOBE_ACCESS_TOKEN_SECRET');
      console.error('Option 2 - Admin Token: ADOBE_API_URL, ADOBE_ADMIN_TOKEN');
      console.error('Option 3 - Admin Credentials: ADOBE_API_URL, ADOBE_ADMIN_USERNAME, ADOBE_ADMIN_PASSWORD (requires 2FA setup)');
      return false;
    }
    
    if (!this.baseUrl) {
      console.error('❌ Missing ADOBE_API_URL in .env.local');
      return false;
    }
    
    return true;
  }

  // Generate admin token using 2FA authentication
  async generateAdminToken(otp) {
    if (!this.adminUsername || !this.adminPassword) {
      throw new Error('Admin username and password required for token generation');
    }

    const url = `${this.baseUrl}/rest/${this.storeCode}/V1/tfa/provider/google/authenticate`;
    
    try {
      const response = await axios.post(url, {
        username: this.adminUsername,
        password: this.adminPassword,
        otp: otp
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      this.adminToken = response.data;
      console.log('✅ Admin token generated successfully');
      console.log('💡 Save this token in .env.local as ADOBE_ADMIN_TOKEN for future use:', this.adminToken);
      return this.adminToken;
    } catch (error) {
      console.error('❌ Failed to generate admin token:', error.response?.data || error.message);
      throw error;
    }
  }

  // Generate OAuth 1.0 signature (compatible with test-adobe-connection.js)
  generateOAuthSignature(method, url, parameters) {
    const oauthParams = {
      oauth_consumer_key: this.consumerKey,
      oauth_token: this.accessToken,
      oauth_signature_method: 'HMAC-SHA256',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_nonce: crypto.randomBytes(16).toString('hex'),
      oauth_version: '1.0'
    };

    // Combine OAuth and request parameters
    const allParams = { ...oauthParams, ...parameters };

    // Create parameter string
    const paramString = Object.keys(allParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
      .join('&');

    // Create signature base string
    const signatureBaseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;

    // Create signing key
    const signingKey = `${encodeURIComponent(this.consumerSecret)}&${encodeURIComponent(this.accessTokenSecret)}`;

    // Generate signature
    const signature = crypto
      .createHmac('sha256', signingKey)
      .update(signatureBaseString)
      .digest('base64');

    oauthParams.oauth_signature = signature;

    return oauthParams;
  }

  // Generate OAuth 1.0 Authorization header
  generateAuthHeader(method, url, parameters = {}) {
    const oauthParams = this.generateOAuthSignature(method, url, parameters);
    
    const authHeader = 'OAuth ' + Object.keys(oauthParams)
      .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
      .join(', ');

    return authHeader;
  }

  // Make authenticated API request
  async makeRequest(endpoint, params = {}, method = 'GET') {
    const url = `${this.baseUrl}/rest${endpoint}`;
    
    try {
      const config = {
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
    } catch (error) {
      console.error('❌ API Request failed:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        console.error('💡 Check your Adobe Commerce API credentials and permissions');
        if (this.authType === 'admin_token') {
          console.error('💡 Your admin token may have expired. Tokens are valid for 4 hours by default.');
        }
      }
      throw error;
    }
  }

  // Search products using V1/products endpoint (requires auth)
  async searchProducts(options = {}) {
    const {
      requestName = 'quick_search_container',
      searchTerm,
      categoryId,
      priceFrom,
      priceTo,
      sku,
      conditionType = 'like',
      limit = 20,
      page = 1
    } = options;

    const params = {};
    let filterGroupIndex = 0;

    // Helper function to add filter
    const addFilter = (field, value, conditionType = 'like') => {
      params[`searchCriteria[filterGroups][${filterGroupIndex}][filters][0][field]`] = field;
      params[`searchCriteria[filterGroups][${filterGroupIndex}][filters][0][value]`] = value;
      params[`searchCriteria[filterGroups][${filterGroupIndex}][filters][0][condition_type]`] = conditionType;
      filterGroupIndex++;
    };

    // Add search term filter (search in name and description)
    if (searchTerm) {
      // Search in product name
      params[`searchCriteria[filterGroups][${filterGroupIndex}][filters][0][field]`] = 'name';
      params[`searchCriteria[filterGroups][${filterGroupIndex}][filters][0][value]`] = `%${searchTerm}%`;
      params[`searchCriteria[filterGroups][${filterGroupIndex}][filters][0][condition_type]`] = 'like';
      
      // Also search in SKU as alternative filter
      params[`searchCriteria[filterGroups][${filterGroupIndex}][filters][1][field]`] = 'sku';
      params[`searchCriteria[filterGroups][${filterGroupIndex}][filters][1][value]`] = `%${searchTerm}%`;
      params[`searchCriteria[filterGroups][${filterGroupIndex}][filters][1][condition_type]`] = 'like';
      filterGroupIndex++;
    }

    // Add category filter
    if (categoryId) addFilter('category_id', categoryId, 'eq');

    // Add price range filters
    if (priceFrom) addFilter('price', priceFrom, 'gteq');
    if (priceTo) addFilter('price', priceTo, 'lteq');

    // Add SKU filter
    if (sku) addFilter('sku', `%${sku}%`, conditionType);

    // Add pagination
    params['searchCriteria[pageSize]'] = limit;
    params['searchCriteria[currentPage]'] = page;

    // Add sorting
    params['searchCriteria[sortOrders][0][field]'] = 'created_at';
    params['searchCriteria[sortOrders][0][direction]'] = 'DESC';

    return await this.makeRequest('/V1/products', params);
  }

  // Get products using V1/products endpoint (requires auth)
  async getProducts(options = {}) {
    const {
      sku,
      name,
      categoryId,
      priceFrom,
      priceTo,
      status,
      visibility,
      limit = 20,
      page = 1,
      sortField = 'created_at',
      sortDirection = 'DESC'
    } = options;

    const params = {};
    let filterGroupIndex = 0;

    // Helper function to add filter
    const addFilter = (field, value, conditionType = 'like') => {
      params[`searchCriteria[filterGroups][${filterGroupIndex}][filters][0][field]`] = field;
      params[`searchCriteria[filterGroups][${filterGroupIndex}][filters][0][value]`] = value;
      params[`searchCriteria[filterGroups][${filterGroupIndex}][filters][0][condition_type]`] = conditionType;
      filterGroupIndex++;
    };

    // Add filters
    if (sku) addFilter('sku', `%${sku}%`, 'like');
    if (name) addFilter('name', `%${name}%`, 'like');
    if (categoryId) addFilter('category_id', categoryId, 'eq');
    if (status) addFilter('status', status, 'eq');
    if (visibility) addFilter('visibility', visibility, 'eq');

    // Price range requires special handling
    if (priceFrom) addFilter('price', priceFrom, 'gteq');
    if (priceTo) addFilter('price', priceTo, 'lteq');

    // Add pagination
    params['searchCriteria[pageSize]'] = limit;
    params['searchCriteria[currentPage]'] = page;

    // Add sorting
    params['searchCriteria[sortOrders][0][field]'] = sortField;
    params['searchCriteria[sortOrders][0][direction]'] = sortDirection;

    return await this.makeRequest('/V1/products', params);
  }

  // Get product by SKU
  async getProductBySku(sku) {
    return await this.makeRequest(`/V1/products/${encodeURIComponent(sku)}`);
  }

  // Get categories
  async getCategories() {
    return await this.makeRequest('/V1/categories');
  }

  // Get product attributes
  async getProductAttributes() {
    return await this.makeRequest('/V1/products/attributes');
  }
}

// CLI Commands
const program = new Command();

program
  .name('adobe-commerce-tool')
  .description('Adobe Commerce API tool for fetching products')
  .version('1.0.0');

// Search products command
program
  .command('search')
  .description('Search products using V1/products endpoint (requires authentication)')
  .option('-t, --term <term>', 'Search term')
  .option('-c, --category <id>', 'Category ID')
  .option('--price-from <price>', 'Minimum price')
  .option('--price-to <price>', 'Maximum price')
  .option('-s, --sku <sku>', 'SKU to search for')
  .option('--container <name>', 'Search container (quick_search_container, advanced_search_container, catalog_view_container)', 'quick_search_container')
  .option('--condition <type>', 'Condition type for SKU search (like, eq, etc.)', 'like')
  .option('-l, --limit <number>', 'Number of results per page', '20')
  .option('-p, --page <number>', 'Page number', '1')
  .action(async (options) => {
    const api = new AdobeCommerceAPI();
    
    console.log('🔍 Searching products...');
    console.log('Search parameters:', {
      container: options.container,
      term: options.term,
      category: options.category,
      sku: options.sku,
      priceRange: options.priceFrom || options.priceTo ? `${options.priceFrom || '0'} - ${options.priceTo || '∞'}` : null
    });

    try {
      const result = await api.searchProducts({
        requestName: options.container,
        searchTerm: options.term,
        categoryId: options.category,
        priceFrom: options.priceFrom,
        priceTo: options.priceTo,
        sku: options.sku,
        conditionType: options.condition,
        limit: parseInt(options.limit),
        page: parseInt(options.page)
      });

      console.log('\n✅ Search Results:');
      console.log('Total results:', result.search_criteria?.total_count || 'Unknown');
      
      if (result.items && result.items.length > 0) {
        console.log('\nProducts found:');
        result.items.forEach((item, index) => {
          console.log(`${index + 1}. ID: ${item.id}, Score: ${item.score}`);
          if (item.custom_attributes) {
            const nameAttr = item.custom_attributes.find(attr => attr.attribute_code === 'name');
            const skuAttr = item.custom_attributes.find(attr => attr.attribute_code === 'sku');
            const priceAttr = item.custom_attributes.find(attr => attr.attribute_code === 'price');
            
            if (nameAttr) console.log(`   Name: ${nameAttr.value}`);
            if (skuAttr) console.log(`   SKU: ${skuAttr.value}`);
            if (priceAttr) console.log(`   Price: ${priceAttr.value}`);
          }
        });
      } else {
        console.log('No products found matching the criteria');
      }

      if (result.aggregations) {
        console.log('\n📊 Aggregations available:', Object.keys(result.aggregations));
      }

    } catch (error) {
      console.error('❌ Search failed:', error.message);
      process.exit(1);
    }
  });

// List products command (requires auth)
program
  .command('list')
  .description('List products using V1/products endpoint (requires authentication)')
  .option('-s, --sku <sku>', 'Filter by SKU (partial match)')
  .option('-n, --name <name>', 'Filter by name (partial match)')
  .option('-c, --category <id>', 'Filter by category ID')
  .option('--price-from <price>', 'Minimum price')
  .option('--price-to <price>', 'Maximum price')
  .option('--status <status>', 'Product status (1=enabled, 2=disabled)')
  .option('--visibility <visibility>', 'Product visibility (1=not visible, 2=catalog, 3=search, 4=catalog+search)')
  .option('-l, --limit <number>', 'Number of results per page', '20')
  .option('-p, --page <number>', 'Page number', '1')
  .option('--sort-field <field>', 'Sort field', 'created_at')
  .option('--sort-dir <direction>', 'Sort direction (ASC/DESC)', 'DESC')
  .action(async (options) => {
    const api = new AdobeCommerceAPI();
    
    console.log('📋 Listing products...');
    console.log('Filter parameters:', {
      sku: options.sku,
      name: options.name,
      category: options.category,
      priceRange: options.priceFrom || options.priceTo ? `${options.priceFrom || '0'} - ${options.priceTo || '∞'}` : null,
      status: options.status,
      visibility: options.visibility
    });

    try {
      const result = await api.getProducts({
        sku: options.sku,
        name: options.name,
        categoryId: options.category,
        priceFrom: options.priceFrom,
        priceTo: options.priceTo,
        status: options.status,
        visibility: options.visibility,
        limit: parseInt(options.limit),
        page: parseInt(options.page),
        sortField: options.sortField,
        sortDirection: options.sortDir
      });

      console.log('\n✅ Products List:');
      console.log('Total results:', result.total_count);
      
      if (result.items && result.items.length > 0) {
        console.log(`\nShowing page ${options.page} (${result.items.length} products):`);
        result.items.forEach((product, index) => {
          console.log(`\n${index + 1}. ${product.name}`);
          console.log(`   SKU: ${product.sku}`);
          console.log(`   ID: ${product.id}`);
          console.log(`   Price: ${product.price}`);
          console.log(`   Status: ${product.status === 1 ? 'Enabled' : 'Disabled'}`);
          console.log(`   Type: ${product.type_id}`);
          if (product.extension_attributes?.category_links) {
            const categories = product.extension_attributes.category_links.map(cat => cat.category_id).join(', ');
            console.log(`   Categories: ${categories}`);
          }
        });
      } else {
        console.log('No products found matching the criteria');
      }

    } catch (error) {
      console.error('❌ List failed:', error.message);
      process.exit(1);
    }
  });

// Get product by SKU command
program
  .command('get')
  .description('Get a specific product by SKU')
  .argument('<sku>', 'Product SKU')
  .action(async (sku) => {
    const api = new AdobeCommerceAPI();
    
    console.log(`🔍 Getting product with SKU: ${sku}...`);

    try {
      const product = await api.getProductBySku(sku);

      console.log('\n✅ Product Details:');
      console.log(`Name: ${product.name}`);
      console.log(`SKU: ${product.sku}`);
      console.log(`ID: ${product.id}`);
      console.log(`Price: ${product.price}`);
      console.log(`Status: ${product.status === 1 ? 'Enabled' : 'Disabled'}`);
      console.log(`Type: ${product.type_id}`);
      console.log(`Weight: ${product.weight || 'N/A'}`);
      console.log(`Created: ${product.created_at}`);
      console.log(`Updated: ${product.updated_at}`);

      if (product.custom_attributes && product.custom_attributes.length > 0) {
        console.log('\n📋 Custom Attributes:');
        product.custom_attributes.forEach(attr => {
          if (attr.value && attr.value !== '' && attr.value !== '0') {
            console.log(`   ${attr.attribute_code}: ${attr.value}`);
          }
        });
      }

      if (product.extension_attributes?.category_links) {
        console.log('\n🏷️  Categories:');
        product.extension_attributes.category_links.forEach(cat => {
          console.log(`   Category ID: ${cat.category_id}, Position: ${cat.position}`);
        });
      }

    } catch (error) {
      console.error('❌ Get product failed:', error.message);
      process.exit(1);
    }
  });

// List categories command
program
  .command('categories')
  .description('List all categories')
  .action(async () => {
    const api = new AdobeCommerceAPI();
    
    console.log('📂 Fetching categories...');

    try {
      const categories = await api.getCategories();

      console.log('\n✅ Categories:');
      
      const printCategory = (category, indent = 0) => {
        const prefix = '  '.repeat(indent);
        console.log(`${prefix}${category.id}: ${category.name} (Level: ${category.level}, Active: ${category.is_active})`);
        
        if (category.children_data && category.children_data.length > 0) {
          category.children_data.forEach(child => {
            printCategory(child, indent + 1);
          });
        }
      };

      if (categories.children_data) {
        categories.children_data.forEach(category => {
          printCategory(category);
        });
      } else {
        console.log('No categories found');
      }

    } catch (error) {
      console.error('❌ Get categories failed:', error.message);
      process.exit(1);
    }
  });

// Test API connection
async function testConnection() {
  const api = new AdobeCommerceAPI();
  
  console.log('🔗 Testing Adobe Commerce API connection...');
  console.log('Base URL:', api.baseUrl);
  console.log('Store Code:', api.storeCode);
  console.log('Auth Type:', api.authType);
  
  if (!api.hasValidCredentials()) {
    process.exit(1);
  }

  try {
    // Try to get a simple API response
    const result = await api.getProducts({ limit: 1 });
    console.log('✅ Connection successful!');
    console.log(`📊 Found ${result.total_count} total products`);
    
    if (result.items && result.items.length > 0) {
      const product = result.items[0];
      console.log(`📦 Sample product: ${product.name} (SKU: ${product.sku})`);
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

// Generate admin token
async function generateToken(otp) {
  const api = new AdobeCommerceAPI();
  
  console.log('🔑 Generating admin token...');
  
  if (!api.adminUsername || !api.adminPassword) {
    console.error('❌ Admin username and password required');
    console.error('💡 Set ADOBE_ADMIN_USERNAME and ADOBE_ADMIN_PASSWORD in .env.local');
    process.exit(1);
  }
  
  try {
    const token = await api.generateAdminToken(otp);
    console.log('✅ Token generated successfully!');
    console.log('🔑 Token:', token);
    console.log('💡 Add this to your .env.local file:');
    console.log(`ADOBE_ADMIN_TOKEN=${token}`);
  } catch (error) {
    console.error('❌ Token generation failed:', error.message);
    process.exit(1);
  }
}

// CLI Commands
program
  .command('test')
  .description('Test API connection and credentials')
  .action(testConnection);

program
  .command('generate-token')
  .description('Generate admin token using 2FA authentication')
  .argument('<otp>', 'One-time password from 2FA app (e.g., Google Authenticator)')
  .action(generateToken);

program.parse(); 