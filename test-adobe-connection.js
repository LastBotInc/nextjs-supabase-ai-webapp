const crypto = require('crypto');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const baseUrl = process.env.ADOBE_API_URL?.replace('/rest', '') || 'https://punaisenristinkauppa.fi';
const consumerKey = process.env.ADOBE_CONSUMER_KEY;
const consumerSecret = process.env.ADOBE_CONSUMER_SECRET;
const accessToken = process.env.ADOBE_ACCESS_TOKEN;
const accessTokenSecret = process.env.ADOBE_ACCESS_TOKEN_SECRET;
const storeCode = 'default';

console.log('Configuration:');
console.log('Base URL:', baseUrl);
console.log('Store Code:', storeCode);
console.log('Consumer Key:', consumerKey ? consumerKey.substring(0, 8) + '...' : 'Missing');
console.log('Consumer Secret:', consumerSecret ? consumerSecret.substring(0, 8) + '...' : 'Missing');
console.log('Access Token:', accessToken ? accessToken.substring(0, 8) + '...' : 'Missing');
console.log('Access Token Secret:', accessTokenSecret ? accessTokenSecret.substring(0, 8) + '...' : 'Missing');

// Generate OAuth 1.0 signature
function generateOAuthSignature(method, url, parameters) {
  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_token: accessToken,
    oauth_signature_method: 'HMAC-SHA256',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_version: '1.0'
  };

  console.log('\nOAuth Parameters:');
  console.log('Timestamp:', oauthParams.oauth_timestamp);
  console.log('Nonce:', oauthParams.oauth_nonce);

  // Combine OAuth and request parameters
  const allParams = { ...oauthParams, ...parameters };

  // Create parameter string
  const paramString = Object.keys(allParams)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
    .join('&');

  console.log('Parameter String:', paramString);

  // Create signature base string
  const signatureBaseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(paramString)}`;

  console.log('Signature Base String:', signatureBaseString);

  // Create signing key
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(accessTokenSecret)}`;

  console.log('Signing Key:', signingKey.substring(0, 20) + '...');

  // Generate signature
  const signature = crypto
    .createHmac('sha256', signingKey)
    .update(signatureBaseString)
    .digest('base64');

  oauthParams.oauth_signature = signature;

  console.log('Generated Signature:', signature);

  return oauthParams;
}

// Generate OAuth 1.0 Authorization header
function generateAuthHeader(method, url, parameters = {}) {
  const oauthParams = generateOAuthSignature(method, url, parameters);
  
  const authHeader = 'OAuth ' + Object.keys(oauthParams)
    .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
    .join(', ');

  console.log('Authorization Header:', authHeader);

  return authHeader;
}

async function testConnection() {
  const endpoint = '/V1/categories';
      const url = `${baseUrl}/rest${endpoint}`;
  
  console.log('\n=== Testing Adobe Commerce Connection ===');
  console.log('Request URL:', url);
  console.log('Method: GET');
  
  try {
    const authHeader = generateAuthHeader('GET', url);
    
    const config = {
      method: 'GET',
      url,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'User-Agent': 'Adobe-Commerce-Test-Client/1.0'
      }
    };

    console.log('\nRequest Headers:', config.headers);
    
    const response = await axios(config);
    console.log('\n✅ Success!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('\n❌ Error occurred:');
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Response Data:', error.response?.data);
    console.log('Error Message:', error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('- Check if OAuth credentials are correctly configured in Adobe Commerce admin');
      console.log('- Verify that the consumer key and secret match what\'s configured in Adobe Commerce');
      console.log('- Ensure the access token and access token secret are valid');
      console.log('- Check if the OAuth application has the necessary permissions');
    } else if (error.response?.status === 400) {
      console.log('\n💡 400 Error troubleshooting:');
      console.log('- This might indicate an issue with the OAuth signature or request format');
      console.log('- Check if the store code is correct');
      console.log('- Verify the API endpoint URL structure');
    }
  }
}

testConnection(); 