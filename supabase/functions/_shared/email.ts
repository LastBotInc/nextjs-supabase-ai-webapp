import { createClient } from 'npm:@supabase/supabase-js'
import { Database } from '../types/database.ts'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const supabaseAdmin = createClient<Database>(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const { error } = await supabaseAdmin.auth.admin.sendRawEmail({
    to,
    subject,
    html,
  })

  if (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export async function getAdminEmails() {
  const supabaseAdmin = createClient<Database>(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const { data: profiles, error } = await supabaseAdmin
    .from('profiles')
    .select('email')
    .eq('is_admin', true)

  if (error) {
    console.error('Error fetching admin emails:', error)
    throw error
  }

  return profiles.map((profile: { email: string }) => profile.email)
} 