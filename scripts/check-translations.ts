import fs from 'fs'
import path from 'path'

const LOCALES = ['en', 'fi', 'sv']

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

// Get all JSON files in a directory
function getJsonFiles(dir: string): string[] {
  try {
    return fs.readdirSync(dir)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''))
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error)
    return []
  }
}

// Load a namespace JSON file for a locale
function loadNamespaceFile(locale: string, namespace: string): Record<string, any> {
  const filePath = path.join(process.cwd(), 'messages', locale, `${namespace}.json`)
  
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'))
    }
    return {}
  } catch (error) {
    console.error(`Error loading namespace ${namespace} for locale ${locale}:`, error)
    return {}
  }
}

function checkTranslations() {
  console.log('=== TRANSLATION CHECK REPORT ===\n')

  // Get all available namespaces across all locales
  const allNamespaces = new Set<string>()
  let localeDirectories: Record<string, string[]> = {}
  
  // Collect all namespaces from all locale directories
  for (const locale of LOCALES) {
    const localeDir = path.join(process.cwd(), 'messages', locale)
    
    if (!fs.existsSync(localeDir)) {
      console.warn(`Warning: Locale directory for ${locale} does not exist.`)
      localeDirectories[locale] = []
      continue
    }
    
    const namespaces = getJsonFiles(localeDir)
    localeDirectories[locale] = namespaces
    
    // Add all namespaces to the set
    namespaces.forEach(namespace => allNamespaces.add(namespace))
  }
  
  // Sort namespaces for consistent reporting
  const namespacesList = Array.from(allNamespaces).sort()
  
  console.log('Detected Namespaces:', namespacesList.join(', '))
  console.log(`\nTotal Namespaces: ${namespacesList.length}\n`)
  
  // Check for missing namespace files
  console.log('=== MISSING NAMESPACE FILES ===')
  let missingNamespaceFiles = false
  
  for (const locale of LOCALES) {
    const missingNamespaces = namespacesList.filter(ns => !localeDirectories[locale].includes(ns))
    
    if (missingNamespaces.length > 0) {
      missingNamespaceFiles = true
      console.log(`\nMissing in ${locale}:`)
      missingNamespaces.forEach(ns => console.log(`- ${ns}.json`))
    } else {
      console.log(`✅ ${locale}: All namespace files present`)
    }
  }
  
  if (!missingNamespaceFiles) {
    console.log('\n✅ All locales have all namespace files.')
  }
  
  // Check for missing keys within each namespace
  console.log('\n=== MISSING KEYS BY NAMESPACE ===')
  
  for (const namespace of namespacesList) {
    console.log(`\n## Namespace: ${namespace}`)
    
    // Load namespace content for each locale
    const namespaceContent: Record<string, Record<string, string>> = {}
    const flattenedContent: Record<string, Record<string, string>> = {}
    
    for (const locale of LOCALES) {
      namespaceContent[locale] = loadNamespaceFile(locale, namespace)
      flattenedContent[locale] = flattenObject(namespaceContent[locale])
    }
    
    // Compare keys between locales
    for (const sourceLocale of LOCALES) {
      const sourceKeys = Object.keys(flattenedContent[sourceLocale])
      
      if (sourceKeys.length === 0) {
        continue // Skip empty namespaces
      }
      
      for (const targetLocale of LOCALES) {
        if (sourceLocale === targetLocale) continue
        
        const targetKeys = Object.keys(flattenedContent[targetLocale])
        const missingKeys = sourceKeys.filter(key => !targetKeys.includes(key))
        
        if (missingKeys.length > 0) {
          console.log(`\nKeys in ${sourceLocale} missing from ${targetLocale}:`)
          missingKeys.forEach(key => console.log(`- ${key}`))
        }
      }
    }
    
    // Summary for this namespace
    console.log(`\nSummary for ${namespace}:`)
    for (const locale of LOCALES) {
      const keyCount = Object.keys(flattenedContent[locale]).length
      console.log(`- ${locale}: ${keyCount} keys`)
    }
  }
  
  // Overall statistics
  console.log('\n=== OVERALL STATISTICS ===')
  
  const totalKeysByLocale: Record<string, number> = {}
  
  for (const locale of LOCALES) {
    let totalKeys = 0
    
    for (const namespace of namespacesList) {
      const content = loadNamespaceFile(locale, namespace)
      totalKeys += Object.keys(flattenObject(content)).length
    }
    
    totalKeysByLocale[locale] = totalKeys
  }
  
  console.log('\nTotal translation keys by locale:')
  for (const locale of LOCALES) {
    console.log(`- ${locale}: ${totalKeysByLocale[locale]}`)
  }
  
  console.log('\n=== END OF REPORT ===')
}

checkTranslations() 