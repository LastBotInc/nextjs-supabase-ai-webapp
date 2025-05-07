import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export const createClient = () => {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: {
          name: 'sb-session',
          path: '/',
          domain: process.env.NODE_ENV === 'development' ? 'localhost' : undefined,
          sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        },
        auth: {
          storageKey: 'sb-session',
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
          debug: false // Disable debug logging
        }
      }
    )
  }
  return client
}
