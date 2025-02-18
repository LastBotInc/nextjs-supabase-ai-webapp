import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import path from 'path'

// Parse command line arguments
const args = process.argv.slice(2)
const envArg = args.find(arg => arg.startsWith('--env='))
const env = envArg ? envArg.split('=')[1] : 'dev'

// Determine environment file
const envFile = env === 'prod' ? '.env.production' : '.env.local'

// Load environment variables from appropriate .env file
const envConfig = config({ 
  path: path.resolve(process.cwd(), envFile),
  override: true
})

if (envConfig.error) {
  throw new Error(`Error loading environment file ${envFile}: ${envConfig.error}`)
}

console.log(`Using environment: ${env} (${envFile})`)

// Validate required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(`Error: Required environment variables not found in ${envFile}`)
  console.error('Make sure the following variables are set:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Initialize Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function enableSwedish() {
  try {
    // First check if Swedish exists
    const { data: existingLanguages, error: fetchError } = await supabase
      .from('languages')
      .select('code, enabled')
      .eq('code', 'sv')

    // If no rows or error, Swedish doesn't exist yet
    if (fetchError || !existingLanguages?.length) {
      console.log('Swedish language not found, adding it...')
      
      // Add Swedish
      const { error: insertError } = await supabase
        .from('languages')
        .insert({
          code: 'sv',
          name: 'Swedish',
          native_name: 'Svenska',
          enabled: true
        })

      if (insertError) {
        console.error('Error adding Swedish language:', insertError)
        process.exit(1)
      }

      console.log('✅ Added Swedish language successfully')
    } else if (!existingLanguages[0].enabled) {
      // Enable Swedish if it exists but is disabled
      const { error: updateError } = await supabase
        .from('languages')
        .update({ enabled: true })
        .eq('code', 'sv')

      if (updateError) {
        console.error('Error enabling Swedish language:', updateError)
        process.exit(1)
      }

      console.log('✅ Enabled Swedish language successfully')
    } else {
      console.log('✅ Swedish language is already enabled')
    }

    // Verify the status
    const { data: languages, error: verifyError } = await supabase
      .from('languages')
      .select('code, name, native_name, enabled')
      .order('name')

    if (verifyError) {
      console.error('Error verifying languages:', verifyError)
      process.exit(1)
    }

    console.log('\nCurrent language status:')
    languages.forEach(lang => {
      console.log(`- ${lang.name} (${lang.code}): ${lang.enabled ? 'enabled' : 'disabled'}`)
    })

  } catch (error) {
    console.error('Failed to enable Swedish:', error)
    process.exit(1)
  }
}

enableSwedish() 