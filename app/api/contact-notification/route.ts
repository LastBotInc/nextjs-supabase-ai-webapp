import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: Omit<ResponseCookie, 'name' | 'value'>) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              console.error('Error setting cookie:', error)
            }
          },
          remove(name: string, options: Omit<ResponseCookie, 'name' | 'value'>) {
            try {
              cookieStore.delete({ name, ...options })
            } catch (error) {
              console.error('Error removing cookie:', error)
            }
          },
        },
      }
    )

    const data = await request.json()

    // Get admin emails
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('email')
      .eq('is_admin', true)

    if (profilesError) {
      console.error('Error fetching admin emails:', profilesError)
      return NextResponse.json({ error: 'Failed to fetch admin emails' }, { status: 500 })
    }

    // Send email to each admin using Edge Functions
    const adminEmails = profiles.map(profile => profile.email)
    const emailPromises = adminEmails.map(email => {
      return supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: 'New Contact Form Submission',
          template: 'contact_notification',
          data: {
            name: data.name,
            email: data.email,
            message: data.message
          }
        }
      })
    })

    await Promise.all(emailPromises)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending notifications:', error)
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 })
  }
} 