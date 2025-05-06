const fs = require('fs');
const path = require('path');

/**
 * Updates the namespace list in utils/i18n-helpers.ts based on the actual
 * files present in the messages/en directory.
 * 
 * This script is meant to be run during the build process to ensure the
 * production build has an up-to-date list of namespaces.
 */
function updateNamespaceList() {
  console.log('Updating namespace list for production build...');
  
  try {
    // Get namespaces by scanning the /messages/en directory
    const namespacesDir = path.join(process.cwd(), 'messages', 'en');
    
    if (!fs.existsSync(namespacesDir)) {
      console.error(`Directory not found: ${namespacesDir}`);
      process.exit(1);
    }
    
    // Get all JSON files and extract their names without extensions
    const namespaces = fs.readdirSync(namespacesDir)
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''))
      .sort(); // Sort alphabetically for consistency
    
    console.log(`Found ${namespaces.length} namespaces: ${namespaces.join(', ')}`);
    
    // Read the current i18n-helpers.ts file
    const helperFilePath = path.join(process.cwd(), 'utils', 'i18n-helpers.ts');
    let helperFileContent = fs.readFileSync(helperFilePath, 'utf8');
    
    // Split the array into chunks of 4 items for better readability
    const formattedNamespaces = namespaces
      .map(ns => `'${ns}'`)
      .reduce((chunks, item, index) => {
        const chunkIndex = Math.floor(index / 4);
        
        if (!chunks[chunkIndex]) {
          chunks[chunkIndex] = [];
        }
        
        chunks[chunkIndex].push(item);
        return chunks;
      }, [])
      .map(chunk => `    ${chunk.join(', ')}`)
      .join(',\n');
    
    // Create the replacement array
    const replacementArray = `[
${formattedNamespaces}
  ]`;
    
    // Replace the namespace array in the file
    const updatedContent = helperFileContent.replace(
      /return \[([\s\S]*?)\];/m,
      `return ${replacementArray};`
    );
    
    // Write the updated content back to the file
    fs.writeFileSync(helperFilePath, updatedContent);
    
    console.log('Successfully updated namespace list in utils/i18n-helpers.ts');
  } catch (error) {
    console.error('Error updating namespace list:', error);
    process.exit(1);
  }
}

updateNamespaceList(); 