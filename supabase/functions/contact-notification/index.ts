import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

interface ContactFormData {
  name: string
  company: string | null
  email: string
  description: string
}

serve(async (req: Request) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Get the request body
    const contact: ContactFormData = await req.json()

    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get admin emails
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('is_admin', true)

    if (profilesError) {
      console.error('Error fetching admin emails:', profilesError)
      throw profilesError
    }

    const adminEmails = profiles.map((profile: { email: string }) => profile.email)

    // Send email to each admin
    for (const adminEmail of adminEmails) {
      const { error: emailError } = await supabaseAdmin.auth.admin.sendRawEmail({
        to: adminEmail,
        subject: 'New Contact Form Submission',
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${contact.name}</p>
          <p><strong>Company:</strong> ${contact.company || 'N/A'}</p>
          <p><strong>Email:</strong> ${contact.email}</p>
          <p><strong>Message:</strong></p>
          <p>${contact.description}</p>
        `
      })

      if (emailError) {
        console.error(`Error sending email to ${adminEmail}:`, emailError)
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error processing contact form:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}) 