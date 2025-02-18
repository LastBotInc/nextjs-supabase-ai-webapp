import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { Command } from 'commander'

// Setup command line arguments
const program = new Command()
program
  .option('-e, --env <environment>', 'Environment (dev or prod)', 'dev')
  .option('-c, --clean', 'Clean existing translations before import')
  .option('-d, --debug', 'Enable debug mode')

program.parse()

const options = program.opts()

function debug(...args: any[]) {
  if (options.debug) {
    console.log('[DEBUG]', ...args)
  }
}

console.log('\nScript environment:')
console.log(`- NODE_ENV: ${process.env.NODE_ENV}`)
console.log(`- Selected env: ${options.env}`)
console.log('-------------------\n')

// Load environment variables based on environment
const envFile = options.env === 'prod' ? '.env.production' : '.env.local'
const envPath = path.join(process.cwd(), envFile)

debug('Script start:', {
  NODE_ENV: process.env.NODE_ENV,
  selectedEnv: options.env,
  envFile,
  envPath,
  cwd: process.cwd()
})

if (!fs.existsSync(envPath)) {
  console.error(`Error: ${envFile} not found`)
  console.error('Make sure you have the correct .env file:')
  console.error('- Development: .env.local')
  console.error('- Production: .env.production')
  process.exit(1)
}

dotenv.config({ path: envPath })

// Debug environment loading
console.log('\nEnvironment Debug:')
console.log('- process.env.NODE_ENV:', process.env.NODE_ENV)
console.log('- options.env:', options.env)
console.log('- envFile:', envFile)
console.log('- envPath:', envPath)
console.log('- process.cwd():', process.cwd())
console.log('- __dirname:', __dirname)
console.log('-------------------\n')

// Validate required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

debug('Environment loaded:', {
  url: supabaseUrl,
  serviceKey: supabaseServiceKey?.substring(0, 20) + '...'
})

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(`Error: Required environment variables not found in ${envFile}`)
  console.error('Make sure the following variables are set:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Log Supabase connection details
console.log('Supabase Connection:')
console.log('- URL:', supabaseUrl)
console.log('- Service Key (first 20 chars):', supabaseServiceKey.substring(0, 20))
console.log('-------------------\n')

// Initialize Supabase client
console.log('\nCreating Supabase client with:')
console.log('URL:', supabaseUrl)
console.log('Service Key:', supabaseServiceKey)
console.log('-------------------\n')

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Flatten nested object with dot notation
function flattenObject(obj: any, prefix = ''): Record<string, string> {
  return Object.keys(obj).reduce((acc: Record<string, string>, k: string) => {
    const pre = prefix.length ? prefix + '.' : ''
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      Object.assign(acc, flattenObject(obj[k], pre + k))
    } else {
      acc[pre + k] = String(obj[k])
    }
    return acc
  }, {})
}

async function importTranslations() {
  try {
    console.log(`Using environment: ${options.env} (${envFile})`)
    console.log(`Supabase URL: ${supabaseUrl}`)
    
    // Check if translations table exists by trying to select from it
    const { data, error: tableCheckError } = await supabase
      .from('translations')
      .select('count')
      .limit(1)
      .single()
    
    if (tableCheckError) {
      console.error('Error checking translations table:', tableCheckError)
      process.exit(1)
    }
    
    console.log('✅ Translations table exists and is accessible')
    
    // If clean option is specified, delete all existing translations
    if (options.clean) {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise<string>(resolve => {
        readline.question(`⚠️ WARNING: This will delete ALL translations from the ${options.env} database. Are you sure? (yes/no): `, resolve);
      });

      readline.close();

      if (answer.toLowerCase() !== 'yes') {
        console.log('Operation cancelled.');
        process.exit(0);
      }

      console.log('Deleting all translations...');
      const { error: deleteError } = await supabase
        .from('translations')
        .delete()
        .not('id', 'is', null) // Delete all non-null rows (effectively all rows)

      if (deleteError) {
        console.error('Error deleting translations:', deleteError);
        process.exit(1);
      }

      console.log('✅ All translations deleted successfully');
    }
    
    // Read all translation files
    const messagesDir = path.join(process.cwd(), 'messages')
    const files = fs.readdirSync(messagesDir)
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue
      
      const locale = path.basename(file, '.json')
      const filePath = path.join(messagesDir, file)
      console.log(`\nProcessing ${locale} translations from ${filePath}`)
      
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      console.log('Content loaded successfully')
      
      // Flatten the nested JSON structure
      const flatTranslations = flattenObject(content)
      console.log(`Flattened ${Object.keys(flatTranslations).length} translations`)
      
      // Prepare translations for batch insert
      const translations = Object.entries(flatTranslations).map(([key, value]) => {
        const [namespace, ...keyParts] = key.split('.')
        return {
          namespace,
          key: keyParts.join('.'),
          locale,
          value,
          is_html: value.includes('<') && value.includes('>')
        }
      })
      
      console.log(`Prepared ${translations.length} translations for import`)
      
      // Insert translations in batches of 100
      for (let i = 0; i < translations.length; i += 100) {
        const batch = translations.slice(i, i + 100)
        console.log(`\nInserting batch ${Math.floor(i/100) + 1} (${batch.length} items)`)
        console.log('First item in batch:', batch[0])
        
        const { error, data, status, statusText } = await supabase
          .from('translations')
          .upsert(batch, {
            onConflict: 'namespace,key,locale'
          })
          .select()
        
        console.log('Supabase response:', { status, statusText, data })
        
        if (error) {
          console.error(`Error importing translations for ${locale}:`, error)
          console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          continue
        }
        
        console.log(`Successfully imported ${data?.length || 0} translations`)
      }
      
      // Verify the import
      const { data: count } = await supabase
        .from('translations')
        .select('*', { count: 'exact', head: true })
        .eq('locale', locale)
      
      console.log(`✅ Imported translations for ${locale} (Total count: ${count})`)
    }
    
    console.log('\n🎉 All translations imported successfully!')
  } catch (error) {
    console.error('Failed to import translations:', error)
    process.exit(1)
  }
}

importTranslations() 