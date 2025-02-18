import { createClient } from '@/utils/supabase/api'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const url = new URL(request.url)
  const locale = url.searchParams.get('locale')

  if (!locale) {
    return NextResponse.json({ error: 'Locale is required' }, { 
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
  
  try {
    const { data: dbTranslations, error } = await supabase
      .rpc('get_translations', { requested_locale: locale })
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: error.message }, { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }
    
    return NextResponse.json({ data: dbTranslations }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (err) {
    console.error('Error fetching translations:', err)
    return NextResponse.json({ error: 'Internal server error' }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
} 