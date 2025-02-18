import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'
import { UAParser } from 'ua-parser-js'

export async function POST(request: Request) {
  try {
    // Get headers safely
    let pathname = '/'
    let userAgent = ''
    let locale = 'en'
    let referrer = ''
    let sessionId = ''
    
    try {
      const headersList = await headers()
      referrer = headersList.get('referer') || ''
      userAgent = headersList.get('user-agent') || ''
      locale = headersList.get('accept-language')?.split(',')[0]?.split('-')[0] || 'en'
      
      if (referrer) {
        const url = new URL(referrer)
        pathname = url.pathname
        // Extract locale from pathname if it exists
        const localeMatch = pathname.match(/^\/(fi|en)(\/|$)/)
        if (localeMatch) {
          locale = localeMatch[1]
        }
      }

      // Get session ID from request body
      const body = await request.json().catch(() => ({}))
      sessionId = body.sessionId || ''

    } catch (e) {
      console.error('Error getting headers:', e)
    }

    // Parse user agent for device info
    const parser = new UAParser(userAgent)
    const deviceType = parser.getDevice().type || 'desktop'

    // Create Supabase client with server-side configuration
    const supabase = await createClient()

    // Get auth session if available
    const { data: { session: authSession } } = await supabase.auth.getSession()

    let existingSession = null
    if (sessionId) {
      // Check if session exists and is still valid (within 30 minutes)
      const { data: session } = await supabase
        .from('analytics_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (session) {
        existingSession = session
      }
    }

    if (!existingSession) {
      // Create new session
      sessionId = uuidv4()
      const { data: session, error } = await supabase
        .from('analytics_sessions')
        .insert([{
          id: sessionId,
          first_page: pathname,
          user_id: authSession?.user?.id,
          referrer,
          user_agent: userAgent,
          device_type: deviceType,
          locale: locale
        }])
        .select()
        .single()

      if (error) {
        throw error
      }

      existingSession = session
    }

    return NextResponse.json({ sessionId, existingSession })
  } catch (error) {
    console.error('Error in analytics initialization:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 