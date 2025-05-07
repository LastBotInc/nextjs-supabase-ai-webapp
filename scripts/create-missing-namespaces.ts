import fs from 'fs'
import path from 'path'
import { Command } from 'commander'

// Setup command line arguments
const program = new Command()
program
  .option('-r, --reference <locale>', 'Reference locale to copy from', 'en')
  .option('-e, --empty', 'Create empty files instead of copying from reference', false)
  .option('-d, --dry-run', 'Show what would be created without actually creating files', false)
  .option('-v, --verbose', 'Show detailed information', false)

program.parse()

const options = program.opts()
const LOCALES = ['en', 'fi', 'sv']

function log(...args: any[]) {
  console.log(...args)
}

function verbose(...args: any[]) {
  if (options.verbose) {
    console.log('[VERBOSE]', ...args)
  }
}

// Function to get all JSON files in a directory
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

// Load a namespace file
function loadFile(locale: string, namespace: string): any {
  const filePath = path.join(process.cwd(), 'messages', locale, `${namespace}.json`)
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'))
    }
  } catch (error) {
    console.error(`Error loading file ${filePath}:`, error)
  }
  return {}
}

// Create a namespace file
function createFile(locale: string, namespace: string, content: any, dryRun: boolean): void {
  const dirPath = path.join(process.cwd(), 'messages', locale)
  const filePath = path.join(dirPath, `${namespace}.json`)
  
  // Ensure the directory exists
  if (!dryRun && !fs.existsSync(dirPath)) {
    verbose(`Creating directory: ${dirPath}`)
    fs.mkdirSync(dirPath, { recursive: true })
  }
  
  if (dryRun) {
    log(`[DRY RUN] Would create file: ${filePath}`)
    return
  }
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2))
    log(`Created file: ${filePath}`)
  } catch (error) {
    console.error(`Error creating file ${filePath}:`, error)
  }
}

// Find and create missing namespace files
function createMissingNamespaces() {
  log('\n=== NAMESPACE FILE CREATION ===')
  log(`Reference locale: ${options.reference}`)
  log(`Create empty files: ${options.empty ? 'Yes' : 'No'}`)
  log(`Dry run: ${options.dryRun ? 'Yes' : 'No'}`)
  
  // Get all available namespaces across all locales
  const allNamespaces = new Set<string>()
  const localeNamespaces: Record<string, string[]> = {}
  
  // Check if reference locale exists
  const referenceLocaleDir = path.join(process.cwd(), 'messages', options.reference)
  if (!fs.existsSync(referenceLocaleDir)) {
    console.error(`Error: Reference locale directory not found: ${referenceLocaleDir}`)
    process.exit(1)
  }
  
  // Collect all namespaces from all locale directories
  for (const locale of LOCALES) {
    const localeDir = path.join(process.cwd(), 'messages', locale)
    
    if (!fs.existsSync(localeDir)) {
      log(`Warning: Locale directory for ${locale} does not exist. Will be created if needed.`)
      localeNamespaces[locale] = []
      continue
    }
    
    const namespaces = getJsonFiles(localeDir)
    localeNamespaces[locale] = namespaces
    
    // Add all namespaces to the set
    namespaces.forEach(namespace => allNamespaces.add(namespace))
  }
  
  // Get reference locale namespaces
  const referenceNamespaces = localeNamespaces[options.reference] || []
  
  if (referenceNamespaces.length === 0) {
    console.error(`Error: No namespace files found in reference locale: ${options.reference}`)
    process.exit(1)
  }
  
  log(`\nFound ${allNamespaces.size} unique namespaces across all locales`)
  log(`Reference locale (${options.reference}) has ${referenceNamespaces.length} namespaces`)
  
  // Create missing namespace files
  let totalCreated = 0
  
  for (const locale of LOCALES) {
    if (locale === options.reference) continue // Skip reference locale
    
    const missingNamespaces = referenceNamespaces.filter(ns => !localeNamespaces[locale].includes(ns))
    
    if (missingNamespaces.length === 0) {
      log(`\n✅ Locale ${locale} has all namespace files from reference locale`)
      continue
    }
    
    log(`\nMissing namespace files in ${locale}: ${missingNamespaces.length}`)
    
    for (const namespace of missingNamespaces) {
      let content = {}
      
      if (!options.empty) {
        // Copy content from reference locale
        content = loadFile(options.reference, namespace)
        verbose(`Copied content from ${options.reference}/${namespace}.json`)
      }
      
      // Create the namespace file
      createFile(locale, namespace, content, options.dryRun)
      totalCreated++
    }
  }
  
  // Summary
  if (options.dryRun) {
    log(`\n[DRY RUN] Would create ${totalCreated} namespace files`)
  } else {
    log(`\nCreated ${totalCreated} namespace files`)
  }
  
  log('\n=== NAMESPACE CREATION COMPLETE ===')
}

// Extract common namespaces from components
function findNamespacesInComponents() {
  log('\n=== SCANNING COMPONENTS FOR NAMESPACES ===')
  
  const componentsDir = path.join(process.cwd(), 'components')
  const appDir = path.join(process.cwd(), 'app')
  
  if (!fs.existsSync(componentsDir) && !fs.existsSync(appDir)) {
    console.error('Error: Neither components nor app directory found')
    return
  }
  
  // Define regex patterns to find useTranslations and getTranslations calls
  const useTranslationsPattern = /useTranslations\([\'\"]([^\'\"]+)[\'\"]\)/g
  const getTranslationsPattern = /getTranslations\([\'\"]([^\'\"]+)[\'\"]\)/g
  
  const foundNamespaces = new Set<string>()
  
  // Recursive function to search directories
  function searchDirectory(dir: string) {
    if (!fs.existsSync(dir)) return
    
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const itemPath = path.join(dir, item)
      const stats = fs.statSync(itemPath)
      
      if (stats.isDirectory()) {
        searchDirectory(itemPath) // Recursive call for subdirectories
      } else if (stats.isFile() && (itemPath.endsWith('.tsx') || itemPath.endsWith('.ts'))) {
        try {
          const content = fs.readFileSync(itemPath, 'utf8')
          
          // Search for useTranslations and getTranslations calls
          let match
          while ((match = useTranslationsPattern.exec(content)) !== null) {
            foundNamespaces.add(match[1])
          }
          
          while ((match = getTranslationsPattern.exec(content)) !== null) {
            foundNamespaces.add(match[1])
          }
        } catch (error) {
          console.error(`Error reading file ${itemPath}:`, error)
        }
      }
    }
  }
  
  // Search both components and app directories
  searchDirectory(componentsDir)
  searchDirectory(appDir)
  
  log(`\nFound ${foundNamespaces.size} unique namespaces referenced in components:`)
  
  const namespaceList = Array.from(foundNamespaces).sort()
  namespaceList.forEach(ns => log(`- ${ns}`))
  
  // Check which namespaces are missing in the reference locale
  const referenceLocale = options.reference
  const referenceLocaleDir = path.join(process.cwd(), 'messages', referenceLocale)
  
  if (!fs.existsSync(referenceLocaleDir)) {
    console.error(`Error: Reference locale directory not found: ${referenceLocaleDir}`)
    return
  }
  
  const existingNamespaces = getJsonFiles(referenceLocaleDir)
  const missingNamespaces = Array.from(foundNamespaces).filter(ns => !existingNamespaces.includes(ns))
  
  if (missingNamespaces.length === 0) {
    log(`\n✅ All namespaces referenced in components exist in reference locale ${referenceLocale}`)
    return
  }
  
  log(`\nMissing namespaces in reference locale ${referenceLocale}: ${missingNamespaces.length}`)
  missingNamespaces.forEach(ns => log(`- ${ns}`))
  
  // Create missing namespace files in all locales
  if (missingNamespaces.length > 0) {
    log('\nCreating missing namespace files in all locales...')
    
    for (const namespace of missingNamespaces) {
      for (const locale of LOCALES) {
        const localeDir = path.join(process.cwd(), 'messages', locale)
        const filePath = path.join(localeDir, `${namespace}.json`)
        
        if (fs.existsSync(filePath)) {
          verbose(`File already exists: ${filePath}`)
          continue
        }
        
        createFile(locale, namespace, {}, options.dryRun)
      }
    }
  }
  
  log('\n=== COMPONENT NAMESPACE SCAN COMPLETE ===')
}

// Main function
function main() {
  log('=== NAMESPACE MANAGEMENT TOOL ===')
  
  // Ensure messages directory exists
  const messagesDir = path.join(process.cwd(), 'messages')
  if (!fs.existsSync(messagesDir)) {
    console.error(`Error: Messages directory not found: ${messagesDir}`)
    process.exit(1)
  }
  
  // First, scan components to identify namespaces
  findNamespacesInComponents()
  
  // Then, create missing namespace files
  createMissingNamespaces()
  
  log('\nNamespace management completed successfully!')
}

main() 