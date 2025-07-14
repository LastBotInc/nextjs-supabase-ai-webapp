import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkPersonas() {
  console.log('🔍 Checking personas in database...')
  
  const { data, error } = await supabase
    .from('ai_personas')
    .select('*')
  
  if (error) {
    console.error('❌ Error fetching personas:', error)
  } else {
    console.log('✅ Found personas:', data?.length || 0)
    data?.forEach(persona => {
      console.log(`  - ${persona.name} (active: ${persona.active})`)
    })
  }
}

checkPersonas().catch(console.error)