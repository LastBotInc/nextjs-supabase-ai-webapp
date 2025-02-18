import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'
  const locale = requestUrl.pathname.split('/')[1]

  if (code) {
    const supabase = createClient()

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Make sure the next URL is absolute and includes locale
      const nextUrl = next.startsWith('/')
        ? new URL(next.startsWith(`/${locale}`) ? next : `/${locale}${next}`, requestUrl.origin)
        : new URL(next)
      return NextResponse.redirect(nextUrl)
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(new URL(`/${locale}/auth/auth-code-error`, requestUrl.origin))
}
