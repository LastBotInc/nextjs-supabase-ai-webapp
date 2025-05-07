export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { defaultLocale } from '@/app/i18n/config'
import { cookies } from 'next/headers'
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

// This handler is primarily responsible for redirecting the user after OAuth callback
export async function GET(request: Request) {
  console.log('[Auth Callback] Handler Invoked', { url: request.url });
  
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/' // Default redirection path
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  
  // Extract user's locale from the request URL referrer if available
  let userLocale = defaultLocale; // Default fallback
  const referrer = request.headers.get('referer');
  if (referrer) {
    const referrerUrl = new URL(referrer);
    const localeMatch = referrerUrl.pathname.match(/^\/(en|fi|sv)(\/|$)/);
    if (localeMatch && localeMatch[1]) {
      userLocale = localeMatch[1];
      console.log('[Auth Callback] Detected user locale from referrer:', userLocale);
    }
  }

  // If an error is already in the URL, forward to error page with details
  if (error) {
    console.error('[Auth Callback] Error in request params:', error, errorDescription);
    const errorUrl = new URL(`/${userLocale}/auth/auth-code-error`, requestUrl.origin);
    errorUrl.searchParams.append('error', `${error}: ${errorDescription || 'Unknown error'}`);
    return NextResponse.redirect(errorUrl);
  }

  if (!code) {
    console.warn('[Auth Callback] No code found in request URL.');
    const errorUrl = new URL(`/${userLocale}/auth/auth-code-error`, requestUrl.origin);
    errorUrl.searchParams.append('error', 'Missing authorization code');
    return NextResponse.redirect(errorUrl);
  }

  // Log cookie information for debugging
  try {
    const cookieList: string[] = [];
    for (const [name, value] of Object.entries(request.headers.get('cookie') || '')) {
      if (name.includes('verifier') || name.includes('code')) {
        cookieList.push(`${name}: (present)`);
      }
    }
    console.log('[Auth Callback] Auth cookie check:', cookieList);
  } catch (e) {
    console.log('[Auth Callback] Error checking cookies:', e);
  }

  try {
    // *** CRITICAL: We don't try to handle the session here. We just redirect to the client. ***
    // The auth state will be synced by middleware on the client side, which reads the URL fragment
    // This approach avoids the PKCE code verifier issues that happen server-side

    // Redirect to the client with the code and state in the URL
    let redirectPath = next;

    if (redirectPath.startsWith('//') || redirectPath.startsWith('http')) {
      console.warn('[Auth Callback] Invalid next path detected, defaulting to home.', { next: redirectPath });
      redirectPath = '/';
    }

    // Check if path has a locale prefix
    const localePattern = /^\/(en|fi|sv)(\/|$)/;
    if (!localePattern.test(redirectPath)) {
      const separator = (redirectPath === '/' || redirectPath.startsWith('/')) ? '' : '/';
      // Use the user's locale instead of defaultLocale
      redirectPath = `/${userLocale}${separator}${redirectPath}`;
      console.log('[Auth Callback] Prepended user locale:', { newPath: redirectPath, userLocale });
    } else {
      // Extract locale from next path
      const nextLocaleMatch = redirectPath.match(localePattern);
      const nextLocale = nextLocaleMatch ? nextLocaleMatch[1] : null;
      
      // If next param has a different locale than user's locale, respect user's locale
      if (nextLocale && nextLocale !== userLocale) {
        // Replace the locale in the path
        console.log('[Auth Callback] Replacing locale in next path:', { from: nextLocale, to: userLocale });
        redirectPath = redirectPath.replace(new RegExp(`^/${nextLocale}(/|$)`), `/${userLocale}$1`);
      }
    }

    if (redirectPath.includes('/auth/sign-in')) {
      console.warn('[Auth Callback] Redirect loop to sign-in detected, redirecting to home instead.', { originalNext: next });
      redirectPath = `/${userLocale}/`;
    }
    
    // Create the final redirect URL
    const finalRedirectUrl = new URL(redirectPath, requestUrl.origin);
    
    // Add auth parameters to trigger client-side session handling
    finalRedirectUrl.hash = `access_token=&refresh_token=&provider_token=&provider_refresh_token=&type=recovery&code=${code}`;
    
    console.log('[Auth Callback] FINAL REDIRECT DECISION:', {
      originalNext: next,
      userLocale,
      calculatedRedirectPath: redirectPath,
      finalRedirectUrl: finalRedirectUrl.toString().replace(finalRedirectUrl.hash, '(hash-hidden)')
    });
    
    return NextResponse.redirect(finalRedirectUrl);
    
  } catch (err) {
    console.error('[Auth Callback] Exception during auth process:', err);
    const errorUrl = new URL(`/${userLocale}/auth/auth-code-error`, requestUrl.origin);
    errorUrl.searchParams.append('error', `Exception: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return NextResponse.redirect(errorUrl);
  }
} 