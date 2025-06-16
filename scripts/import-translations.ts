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

// Utility function to safely stringify values for storage
function toSafeString(value: unknown): string {
  // Stringify if value is an object or array (and not null), else convert to string
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value)
  }
  return String(value)
}

// Flatten nested object with dot notation
function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  return Object.keys(obj).reduce((acc: Record<string, string>, k: string) => {
    const pre = prefix.length ? prefix + '.' : ''
    const value = obj[k]
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(acc, flattenObject(value as Record<string, unknown>, pre + k))
    } else {
      // Use toSafeString for arrays or objects, otherwise String
      acc[pre + k] = toSafeString(value)
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
    
    // Read all locales
    const messagesDir = path.join(process.cwd(), 'messages')
    const locales = fs.readdirSync(messagesDir)
      .filter(item => {
        const itemPath = path.join(messagesDir, item)
        return fs.statSync(itemPath).isDirectory()
      })
    
    console.log(`Found locales: ${locales.join(', ')}`)
    
    // Process each locale directory
    for (const locale of locales) {
      const localeDir = path.join(messagesDir, locale)
      
      // Check if it's a directory
      if (!fs.statSync(localeDir).isDirectory()) {
        continue
      }
      
      console.log(`\nProcessing locale: ${locale}`)
      
      // Get all JSON files in the locale directory
      const namespaceFiles = fs.readdirSync(localeDir)
        .filter(file => file.endsWith('.json'))
      
      console.log(`Found ${namespaceFiles.length} namespace files`)
      
      let allTranslations: any[] = []
      
      // Process each namespace file
      for (const namespaceFile of namespaceFiles) {
        const namespace = path.basename(namespaceFile, '.json')
        const filePath = path.join(localeDir, namespaceFile)
        
        console.log(`\nProcessing namespace: ${namespace} from ${filePath}`)
        
        // Read the namespace file
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        
        // Flatten the nested JSON structure
        const flatTranslations = flattenObject(content)
        console.log(`Flattened ${Object.keys(flatTranslations).length} translations`)
        
        // Prepare translations for batch insert
        const translations = Object.entries(flatTranslations).map(([key, value]) => {
          // Use toSafeString for all values
          const storedValue = toSafeString(value)
          return {
            namespace,
            key,
            locale,
            value: storedValue,
            is_html: storedValue.includes('<') && storedValue.includes('>')
          }
        })
        
        allTranslations = [...allTranslations, ...translations]
        console.log(`Added ${translations.length} translations to batch (Total: ${allTranslations.length})`)
      }
      
      // Insert translations in batches of 100
      for (let i = 0; i < allTranslations.length; i += 100) {
        const batch = allTranslations.slice(i, i + 100)
        console.log(`\nInserting batch ${Math.floor(i/100) + 1} (${batch.length} items)`)
        
        if (options.debug) {
          console.log('First item in batch:', batch[0])
        }
        
        const { error, data, status, statusText } = await supabase
          .from('translations')
          .upsert(batch, {
            onConflict: 'namespace,key,locale'
          })
          .select()
        
        if (options.debug) {
          console.log('Supabase response:', { status, statusText, data })
        } else {
          console.log('Supabase response status:', status)
        }
        
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