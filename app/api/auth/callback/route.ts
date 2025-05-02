import { NextRequest, NextResponse } from 'next/server';
import shopify from '@/lib/shopify/client';
// import { AppInstallations } from '@/lib/shopify/app-installations'; // Commented out non-existent helper

/**
 * @description Handles the OAuth callback from Shopify.
 * Exchanges the authorization code for an access token and stores the session.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const shop = searchParams.get('shop');
  const host = searchParams.get('host'); // Host is passed back by Shopify in callback query params

  console.log(`Callback received for shop: ${shop}, host: ${host}`);

  if (!shop || !host) {
    console.error('❌ OAuth Callback Error: Missing shop or host parameter in callback URL');
    return NextResponse.json(
      { error: 'Invalid callback request' },
      { status: 400 },
    );
  }

  try {
    // The library handles validation (hmac, state) and token exchange.
    // It uses the sessionStorage adapter (PgSessionStorage) configured in the client.
    const callbackResponse = await shopify.auth.callback({
      rawRequest: request,
      rawResponse: new NextResponse(), // Needs a response object to potentially modify headers
    });

    // The Session is now stored in the database via PgSessionStorage.
    const sessionId = callbackResponse.session.id;
    const sessionShop = callbackResponse.session.shop;
    console.log(`✅ OAuth successful. Session stored for shop: ${sessionShop} with ID: ${sessionId}`);

    // --- Post-Authentication Steps ---

    // 1. Register necessary webhooks (example: app uninstalled)
    // await shopify.webhooks.register({ session: callbackResponse.session });
    // console.log('Webhook registration attempted.');

    // 2. Update app installation status in your own DB (Optional but Recommended)
    // Example using a hypothetical helper:
    // await AppInstallations.save({ shop: sessionShop, isActive: true });

    // 3. Redirect user back into the Shopify Admin Embedded App
    //    Use the host parameter received in the callback URL.
    const decodedHost = Buffer.from(host, 'base64').toString('utf-8');
    const appUrl = `https://${decodedHost}/apps/${shopify.config.apiKey}`;

    console.log(`🚀 Redirecting to app URL: ${appUrl}`);
    return NextResponse.redirect(appUrl);

  } catch (error: any) {
    console.error('❌ OAuth Callback Error:', error);
    // Handle specific errors if needed
    return NextResponse.json(
      {
        error: 'OAuth callback failed',
        details: error.message,
      },
      { status: 500 },
    );
  }
} 