import { createServerClient } from '@supabase/ssr'
import { headers, cookies } from 'next/headers'
import { AuthFlowType } from '@supabase/supabase-js'

export const createClient = async (useServiceRole: boolean = false) => {
  const config = {
    cookies: {
      get: () => undefined,
      set: () => {},
      remove: () => {}
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
