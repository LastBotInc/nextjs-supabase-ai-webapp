const fs = require('fs');
const path = require('path');

// Configuration
const localesPath = path.join(__dirname, '../messages');
const outputBasePath = path.join(__dirname, '../messages');
const locales = ['en', 'fi', 'sv'];
const backupDir = path.join(__dirname, '../messages/backup');
const reportFile = path.join(__dirname, '../messages/localization-report.md');

// Function to create directories if they don't exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// Function to backup original locale files
function backupLocaleFiles() {
  console.log('Backing up original locale files...');
  
  // Create backup directory
  ensureDirectoryExists(backupDir);
  
  // Backup each locale file
  locales.forEach(locale => {
    const sourceFilePath = path.join(localesPath, `${locale}.json`);
    const destFilePath = path.join(backupDir, `${locale}.json.bak`);
    
    fs.copyFileSync(sourceFilePath, destFilePath);
    console.log(`  Backed up ${locale}.json to backup/${locale}.json.bak`);
  });
  
  console.log('Backup completed successfully!');
}

// Function to split a locale file into multiple namespace files
function splitLocaleFile(locale) {
  console.log(`\nProcessing ${locale} locale...`);
  
  const inputFilePath = path.join(localesPath, `${locale}.json`);
  const outputDirPath = path.join(outputBasePath, locale);
  
  // Ensure the output directory exists
  ensureDirectoryExists(outputDirPath);
  
  // Read the locale file
  const localeData = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));
  
  // Extract namespaces (top-level keys)
  const namespaces = Object.keys(localeData);
  console.log(`  Found ${namespaces.length} namespaces in ${locale}.json`);
  
  // Create a file for each namespace
  namespaces.forEach(namespace => {
    const namespaceData = localeData[namespace];
    const outputFilePath = path.join(outputDirPath, `${namespace}.json`);
    
    // Write the namespace data to a separate file
    fs.writeFileSync(outputFilePath, JSON.stringify(namespaceData, null, 2), 'utf8');
    console.log(`  Created ${locale}/${namespace}.json`);
  });
  
  console.log(`Completed processing ${locale} locale`);
  
  // Return the list of namespaces for reporting
  return namespaces;
}

// Function to generate a report of all namespaces per locale
function generateReport(namespacesByLocale) {
  console.log('\nGenerating localization report...');
  
  // Get union of all namespaces
  const allNamespaces = new Set();
  Object.values(namespacesByLocale).forEach(namespaces => {
    namespaces.forEach(namespace => allNamespaces.add(namespace));
  });
  
  const sortedNamespaces = Array.from(allNamespaces).sort();
  
  // Generate report content
  let reportContent = '# Localization Report\n\n';
  reportContent += `Generated on: ${new Date().toISOString()}\n\n`;
  reportContent += '## Namespace Coverage\n\n';
  
  // Generate table
  reportContent += '| Namespace | ' + locales.map(locale => `${locale} |`).join(' ') + '\n';
  reportContent += '|' + '-'.repeat(10) + '|' + locales.map(() => '-'.repeat(5) + '|').join('') + '\n';
  
  // Fill table with data
  sortedNamespaces.forEach(namespace => {
    reportContent += `| ${namespace} | `;
    reportContent += locales.map(locale => {
      const hasNamespace = namespacesByLocale[locale].includes(namespace);
      return hasNamespace ? ' ✅ |' : ' ❌ |';
    }).join(' ');
    reportContent += '\n';
  });
  
  // Add summary
  reportContent += '\n## Summary\n\n';
  reportContent += `Total namespaces across all locales: ${sortedNamespaces.length}\n\n`;
  
  locales.forEach(locale => {
    const namespaces = namespacesByLocale[locale];
    const missing = sortedNamespaces.filter(ns => !namespaces.includes(ns));
    
    reportContent += `### ${locale}\n`;
    reportContent += `- Namespaces: ${namespaces.length}\n`;
    
    if (missing.length > 0) {
      reportContent += `- Missing namespaces: ${missing.length}\n`;
      reportContent += '  - ' + missing.join('\n  - ') + '\n';
    } else {
      reportContent += `- Missing namespaces: None\n`;
    }
    reportContent += '\n';
  });
  
  // Write report to file
  fs.writeFileSync(reportFile, reportContent, 'utf8');
  console.log(`Report generated at: ${reportFile}`);
}

// Main function
function main() {
  console.log('=== Starting Locale Splitting Process ===');
  
  // First backup the original files
  backupLocaleFiles();
  
  // Process each locale and collect namespace information
  const namespacesByLocale = {};
  locales.forEach(locale => {
    namespacesByLocale[locale] = splitLocaleFile(locale);
  });
  
  // Generate a comprehensive report
  generateReport(namespacesByLocale);
  
  console.log('\n=== Locale splitting completed successfully! ===');
  console.log('Original files were backed up to the backup directory.');
  console.log('New structure:');
  locales.forEach(locale => {
    console.log(`- ${locale}/`);
    console.log('  - [Namespace].json');
  });
  console.log('\nA detailed report has been generated at messages/localization-report.md');
}

// Run the script
main(); 