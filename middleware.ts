import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createI18nMiddleware from 'next-intl/middleware'
import { staticLocales, defaultLocale } from './app/i18n/config'

// Add debug mode flag at the top after imports
const DEBUG_MODE = process.env.NODE_ENV === 'development' && process.env.DEBUG_AUTH === 'true'

function log(...args: any[]) {
  if (DEBUG_MODE) {
    console.log(...args)
  }
}

// Create middleware with static locales for initial config
const i18nMiddleware = createI18nMiddleware({
  locales: staticLocales,
  defaultLocale,
  localePrefix: 'always'
})

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and images
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/images/') ||
    request.nextUrl.pathname === '/favicon.ico' ||
    request.nextUrl.pathname === '/auth/callback'  // Skip for auth callback path
  ) {
    return NextResponse.next()
  }

  // For API routes, pass through the request with headers
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next()
    // Copy all headers from the request to the response
    request.headers.forEach((value, key) => {
      response.headers.set(key, value)
    })
    return response
  }

  let response = NextResponse.next()

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = request.cookies.get(name)
          log('🍪 [Middleware] Getting cookie:', { name, value: cookie?.value?.substring(0, 20) + '...' })
          return cookie?.value
        },
        set(name: string, value: string, options: any) {
          // Ensure proper cookie settings for auth
          if (name.includes('auth') || name === 'sb-access-token' || name === 'sb-refresh-token' || name === 'sb-session') {
            options.path = '/'
            
            if (process.env.NODE_ENV === 'development') {
              options.secure = false
              options.sameSite = 'lax'
              options.domain = 'localhost'
            } else {
              options.secure = true
              options.sameSite = 'lax'
            }

            // Set longer expiry for refresh token and session
            if (name === 'sb-refresh-token' || name === 'sb-session') {
              options.maxAge = 60 * 60 * 24 * 7 // 7 days
            }
          }
          
          log('🍪 [Middleware] Setting cookie:', { name, options })
          response.cookies.set({
            name,
            value,
            ...options
          })
        },
        remove(name: string, options: any) {
          log('🍪 [Middleware] Removing cookie:', { name })
          
          // Ensure all auth cookies are removed with correct settings
          response.cookies.set({
            name,
            value: '',
            path: '/',
            expires: new Date(0),
            maxAge: 0,
            domain: process.env.NODE_ENV === 'development' ? 'localhost' : undefined,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'lax'
          })
          
          // Also try to delete it
          try {
            response.cookies.delete(name)
          } catch (e) {
            log('Cookie delete failed, using set with past expiry instead')
          }
        },
      },
      auth: {
        storageKey: 'sb-session',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        debug: DEBUG_MODE
      }
    }
  )

  // Get session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  // Add debug logging for session
  log('Middleware session check:', {
    hasSession: !!session,
    sessionError,
    cookies: request.cookies.getAll().map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })),
    path: request.nextUrl.pathname
  })

  // Get enabled languages
  const { data: languages } = await supabase
    .from('languages')
    .select('code, enabled')
    .eq('enabled', true)

  // Get the current path segments
  const pathSegments = request.nextUrl.pathname.split('/')
  const locale = pathSegments[1] || defaultLocale
  const isAdminRoute = pathSegments.includes('admin') || pathSegments.includes('hallinta')

  // Handle booking routes
  if (pathSegments[1] === 'book') {
    const slug = pathSegments[2]
    if (slug) {
      // Redirect to localized booking page
      response = NextResponse.redirect(
        new URL(`/${defaultLocale}/book/${slug}`, request.url)
      )
      return response
    }
  }

  // Check if the locale is enabled
  const enabledLocales = languages?.map((lang: { code: string }) => lang.code) || staticLocales
  const isValidLocale = enabledLocales.includes(locale)

  // If locale is not valid, redirect to default locale
  if (!isValidLocale && pathSegments.length > 1) {
    response = NextResponse.redirect(
      new URL(`/${defaultLocale}${request.nextUrl.pathname.slice(locale.length + 1)}`, request.url)
    )
  }

  // If accessing admin route and not authenticated, redirect to sign in
  if (isAdminRoute) {
    // Add debug logging
    log('Admin route access:', {
      hasSession: !!session,
      userId: session?.user?.id,
      path: request.nextUrl.pathname,
      cookies: request.cookies.getAll().map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' }))
    })

    if (!session?.user?.id) {
      log('No valid session, redirecting to sign in')
      response = NextResponse.redirect(
        new URL(`/${locale}/auth/sign-in?next=${request.nextUrl.pathname}`, request.url)
      )
    } else {
      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single()

      // Add debug logging
      log('Admin check:', { profile, error: profileError?.message })

      // If error fetching profile or not admin, redirect to home
      if (profileError || !profile?.is_admin) {
        log('Not admin or error, redirecting to home')
        response = NextResponse.redirect(
          new URL(`/${locale}`, request.url)
        )
      }
    }
  }

  // Redirect admin root to admin/blog
  if (pathSegments.length === 3 && pathSegments[2] === 'admin') {
    response = NextResponse.redirect(
      new URL(`/${locale}/admin/blog`, request.url)
    )
  }

  // Redirect to locale path if accessing root
  if (request.nextUrl.pathname === '/') {
    // Get browser's preferred language from Accept-Language header
    const acceptLanguage = request.headers.get('Accept-Language')
    let preferredLocale = defaultLocale

    if (acceptLanguage) {
      // Parse the Accept-Language header and get the first preferred language code
      const preferredLanguage = acceptLanguage.split(',')[0].trim().split('-')[0]
      
      // Check if the preferred language is in our enabled locales
      if (enabledLocales.includes(preferredLanguage)) {
        preferredLocale = preferredLanguage
      }
    }

    response = NextResponse.redirect(new URL(`/${preferredLocale}`, request.url))
  }

  // Get i18n response
  const i18nResponse = i18nMiddleware(request)

  // Copy cookies from i18n response and ensure they are properly set
  i18nResponse.cookies.getAll().forEach(cookie => {
    response.cookies.set({
      name: cookie.name,
      value: cookie.value,
      path: cookie.path || '/',
      domain: cookie.domain,
      expires: cookie.expires,
      httpOnly: cookie.httpOnly,
      maxAge: cookie.maxAge,
      sameSite: cookie.sameSite || 'lax',
      secure: cookie.secure || process.env.NODE_ENV === 'production'
    })
  })

  return response
}

export const config = {
  matcher: [
    // Match all routes except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - images/ (image files)
    // - patterns/ (pattern files)
    // - robots.txt (SEO file)
    '/((?!_next/static|_next/image|favicon.ico|images|patterns|robots.txt).*)',
    '/', // Match the root path
    '/api/:path*' // Match API routes
  ]
}
