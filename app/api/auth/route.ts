import { NextRequest, NextResponse } from 'next/server';
import shopify from '@/lib/shopify/client';
import { DeliveryMethod } from '@shopify/shopify-api';

/**
 * @description Initiates the Shopify OAuth flow.
 * Redirects the user to the Shopify authorization screen.
 * Requires the 'shop' query parameter.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const shop = searchParams.get('shop');

  if (!shop) {
    console.error('❌ OAuth Error: Missing shop parameter');
    return NextResponse.json(
      { error: 'Missing shop parameter' },
      { status: 400 },
    );
  }

  // Ensure the shop parameter is a valid Shopify domain
  if (!/^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/.test(shop)) {
    console.error('❌ OAuth Error: Invalid shop parameter', { shop });
    return NextResponse.json({ error: 'Invalid shop parameter' }, { status: 400 });
  }

  console.log(`🚀 Initiating OAuth for shop: ${shop}`);

  try {
    // Start the OAuth process (asking for offline token initially)
    // The library handles constructing the redirect URL.
    await shopify.auth.begin({
      shop: shop,
      callbackPath: '/api/auth/callback', // Path for Shopify to redirect back to
      isOnline: false, // Request offline access token first
      rawRequest: request,
      // Optional: Define webhook handlers during auth if desired
      // webhookHandlers: {
      //   APP_UNINSTALLED: {
      //     deliveryMethod: DeliveryMethod.Http,
      //     callbackUrl: '/api/webhooks',
      //   },
      // },
    });

    // shopify.auth.begin automatically handles the redirection
    // so we shouldn't reach here if successful.
    // If it doesn't redirect automatically (depends on adapter/version),
    // you might need to manually construct and return a NextResponse.redirect()
    // However, the typical flow relies on the library handling it.
    console.error('❌ OAuth Error: shopify.auth.begin did not redirect.');
    return NextResponse.json(
      { error: 'OAuth initiation failed' },
      { status: 500 },
    );
  } catch (error: any) {
    console.error('❌ OAuth Error during begin:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate OAuth process',
        details: error.message,
      },
      { status: 500 },
    );
  }
} 