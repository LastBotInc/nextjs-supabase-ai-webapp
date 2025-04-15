import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { AuthFlowType } from '@supabase/supabase-js'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'
import { cookies } from 'next/headers'

// Helper to check if an object has the expected cookie store methods
const isValidCookieStore = (obj: any): boolean => {
  return obj && 
    typeof obj.get === 'function' && 
    typeof obj.set === 'function' && 
    typeof obj.remove === 'function';
}

export const createClient = (cookieStore?: any, useServiceRole: boolean = false) => {
  // If no cookie store is provided, or it doesn't have the expected methods,
  // create a client without cookie handling
  if (!cookieStore || !isValidCookieStore(cookieStore)) {
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      useServiceRole 
        ? process.env.SUPABASE_SERVICE_ROLE_KEY!
        : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
          flowType: 'pkce' as AuthFlowType,
          debug: false // Disable debug logging
        }
      }
    )
  }
  
  // If cookieStore is the Next.js cookies() object, use its methods
  if (cookieStore.getAll && typeof cookieStore.getAll === 'function') {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      useServiceRole 
        ? process.env.SUPABASE_SERVICE_ROLE_KEY!
        : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => 
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          }
        }
      }
    )
  }

  // Otherwise use the standard cookie store interface
  const config = {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set(name, value, options)
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.remove(name, options)
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      }
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
      flowType: 'pkce' as AuthFlowType,
      debug: false // Disable debug logging
    }
  }

  // Use service role key for admin operations
  const apiKey = useServiceRole 
    ? process.env.SUPABASE_SERVICE_ROLE_KEY!
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    apiKey,
    config
  )
}
