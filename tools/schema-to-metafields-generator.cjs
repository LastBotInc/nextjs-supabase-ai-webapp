#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
require('dotenv').config({ path: '.env.local' });

const program = new Command();

// Standard Shopify product fields that don't need metafields
const STANDARD_SHOPIFY_FIELDS = new Set([
  'id', 'title', 'handle', 'body_html', 'vendor', 'product_type', 'tags',
  'status', 'published_at', 'created_at', 'updated_at', 'template_suffix',
  'published_scope', 'variants', 'options', 'images', 'image', 'seo_title',
  'seo_description', 'metafields_global_title_tag', 'metafields_global_description_tag'
]);

// Standard product variant fields
const STANDARD_VARIANT_FIELDS = new Set([
  'id', 'product_id', 'title', 'price', 'sku', 'position', 'inventory_policy',
  'compare_at_price', 'fulfillment_service', 'inventory_management',
  'option1', 'option2', 'option3', 'created_at', 'updated_at', 'taxable',
  'barcode', 'grams', 'weight', 'weight_unit', 'inventory_item_id',
  'inventory_quantity', 'old_inventory_quantity', 'requires_shipping'
]);

// Map JSON schema types to Shopify metafield types
function mapToShopifyMetafieldType(jsonType, format, description = '') {
  const desc = description.toLowerCase();
  
  if (jsonType === 'string') {
    if (format === 'uri' || desc.includes('url') || desc.includes('link')) {
      return 'url';
    }
    if (format === 'date-time') {
      return 'date_time';
    }
    if (format === 'date') {
      return 'date';
    }
    if (desc.includes('rich') || desc.includes('html') || desc.includes('formatted')) {
      return 'rich_text_field';
    }
    if (desc.length > 100 || desc.includes('description') || desc.includes('content')) {
      return 'multi_line_text_field';
    }
    return 'single_line_text_field';
  }
  
  if (jsonType === 'number' || jsonType === 'integer') {
    if (desc.includes('price') || desc.includes('cost') || desc.includes('money')) {
      return 'money';
    }
    if (desc.includes('rating') || desc.includes('score')) {
      return 'rating';
    }
    if (desc.includes('weight')) {
      return 'weight';
    }
    if (desc.includes('dimension') || desc.includes('size') || desc.includes('length') || desc.includes('width') || desc.includes('height')) {
      return 'dimension';
    }
    if (desc.includes('volume')) {
      return 'volume';
    }
    return jsonType === 'integer' ? 'number_integer' : 'number_decimal';
  }
  
  if (jsonType === 'boolean') {
    return 'boolean';
  }
  
  if (jsonType === 'array') {
    return 'json';
  }
  
  if (jsonType === 'object') {
    return 'json';
  }
  
  return 'single_line_text_field';
}

// Generate metafield key from field name
function generateMetafieldKey(fieldName) {
  return fieldName
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

// Generate metafield namespace from schema identifier
function generateNamespace(identifier) {
  const parts = identifier.split('_');
  if (parts.length > 1) {
    return parts[0]; // e.g., "caffitella" from "caffitella_product_feed"
  }
  return identifier.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Analyze schema and identify metafield candidates
function analyzeSchema(schema, schemaInfo) {
  const metafieldCandidates = [];
  const namespace = generateNamespace(schemaInfo.identifier);
  
  function analyzeProperties(properties, parentPath = '') {
    for (const [fieldName, fieldSchema] of Object.entries(properties)) {
      const fullPath = parentPath ? `${parentPath}.${fieldName}` : fieldName;
      
      // Skip standard Shopify fields
      if (STANDARD_SHOPIFY_FIELDS.has(fieldName) || STANDARD_VARIANT_FIELDS.has(fieldName)) {
        console.log(`  ⏭️  Skipping standard field: ${fieldName}`);
        continue;
      }
      
      // Handle nested objects
      if (fieldSchema.type === 'object' && fieldSchema.properties) {
        console.log(`  🔍 Analyzing nested object: ${fieldName}`);
        analyzeProperties(fieldSchema.properties, fullPath);
        continue;
      }
      
      // Generate metafield definition
      const metafieldType = mapToShopifyMetafieldType(
        fieldSchema.type,
        fieldSchema.format,
        fieldSchema.description || ''
      );
      
      const metafieldDef = {
        name: fieldSchema.title || fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/_/g, ' '),
        namespace: namespace,
        key: generateMetafieldKey(fieldName),
        owner_type: 'PRODUCT', // Default to PRODUCT, can be overridden
        metafield_type: metafieldType,
        description: fieldSchema.description || `Auto-generated from ${schemaInfo.name}`,
        validation_rules: {},
        storefront_visible: true,
        auto_generated: true,
        source_identifier: schemaInfo.identifier
      };
      
      // Add validation rules based on schema
      if (fieldSchema.minimum !== undefined) {
        metafieldDef.validation_rules.min = fieldSchema.minimum;
      }
      if (fieldSchema.maximum !== undefined) {
        metafieldDef.validation_rules.max = fieldSchema.maximum;
      }
      if (fieldSchema.enum) {
        metafieldDef.validation_rules.choices = fieldSchema.enum;
      }
      if (fieldSchema.pattern) {
        metafieldDef.validation_rules.regex = fieldSchema.pattern;
      }
      
      // Clean up empty validation rules
      if (Object.keys(metafieldDef.validation_rules).length === 0) {
        delete metafieldDef.validation_rules;
      }
      
      metafieldCandidates.push({
        field_name: fieldName,
        field_path: fullPath,
        metafield_definition: metafieldDef
      });
      
      console.log(`  ✅ Generated metafield: ${metafieldDef.namespace}.${metafieldDef.key} (${metafieldDef.metafield_type})`);
    }
  }
  
  if (schema.properties) {
    analyzeProperties(schema.properties);
  }
  
  return metafieldCandidates;
}

// Create metafield definitions via API
async function createMetafieldDefinitions(metafieldCandidates, apiUrl, authToken) {
  const results = {
    created: [],
    errors: [],
    skipped: []
  };
  
  for (const candidate of metafieldCandidates) {
    try {
      console.log(`\n📝 Creating metafield: ${candidate.metafield_definition.name}`);
      
      const response = await fetch(`${apiUrl}/admin/metafields`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(candidate.metafield_definition)
      });
      
      if (response.ok) {
        const created = await response.json();
        results.created.push({
          field_name: candidate.field_name,
          metafield_id: created.id,
          definition: created
        });
        console.log(`  ✅ Created: ${created.id}`);
      } else {
        const error = await response.json();
        if (error.error && error.error.includes('already exists')) {
          console.log(`  ⏭️  Skipped (already exists): ${candidate.metafield_definition.namespace}.${candidate.metafield_definition.key}`);
          results.skipped.push({
            field_name: candidate.field_name,
            reason: 'Already exists',
            error: error.error
          });
        } else {
          console.log(`  ❌ Failed: ${error.error}`);
          results.errors.push({
            field_name: candidate.field_name,
            error: error.error
          });
        }
      }
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
      results.errors.push({
        field_name: candidate.field_name,
        error: err.message
      });
    }
  }
  
  return results;
}

// Main command handler
async function generateMetafields(schemaPath, options) {
  try {
    console.log('🔍 Schema-to-Metafields Generator\n');
    console.log('=' .repeat(50));
    
    // 1. Load schema file
    console.log(`📂 Loading schema from: ${schemaPath}`);
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }
    
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const schemaData = JSON.parse(schemaContent);
    
    console.log(`✅ Loaded schema: ${schemaData.name || 'Unknown'}`);
    console.log(`   Identifier: ${schemaData.identifier || 'unknown'}`);
    console.log(`   Description: ${schemaData.description || 'No description'}`);
    
    // 2. Analyze schema
    console.log('\n🔍 Analyzing schema for metafield candidates...');
    const metafieldCandidates = analyzeSchema(schemaData.json_schema, {
      name: schemaData.name || 'Unknown Schema',
      identifier: schemaData.identifier || 'unknown_schema',
      description: schemaData.description
    });
    
    console.log(`\n📊 Analysis complete: ${metafieldCandidates.length} metafield candidates found`);
    
    // 3. Output results
    if (options.output) {
      const outputData = {
        schema_info: {
          name: schemaData.name,
          identifier: schemaData.identifier,
          description: schemaData.description
        },
        metafield_candidates: metafieldCandidates,
        generated_at: new Date().toISOString()
      };
      
      fs.writeFileSync(options.output, JSON.stringify(outputData, null, 2));
      console.log(`\n💾 Results saved to: ${options.output}`);
    }
    
    // 4. Create metafields via API (if requested)
    if (options.create && options.apiUrl) {
      if (!options.authToken) {
        console.log('\n⚠️  Warning: No auth token provided, skipping API creation');
        console.log('   Use --auth-token to provide authentication');
      } else {
        console.log(`\n🚀 Creating metafield definitions via API: ${options.apiUrl}`);
        const results = await createMetafieldDefinitions(metafieldCandidates, options.apiUrl, options.authToken);
        
        console.log('\n📈 Creation Results:');
        console.log(`  ✅ Created: ${results.created.length}`);
        console.log(`  ⏭️  Skipped: ${results.skipped.length}`);
        console.log(`  ❌ Errors: ${results.errors.length}`);
        
        if (results.errors.length > 0) {
          console.log('\n❌ Errors:');
          results.errors.forEach(err => {
            console.log(`  - ${err.field_name}: ${err.error}`);
          });
        }
      }
    }
    
    // 5. Summary
    console.log('\n🎉 Generation complete!');
    if (!options.create) {
      console.log('\n💡 To create these metafields via API, use:');
      console.log(`   node ${process.argv[1]} "${schemaPath}" --create --api-url http://localhost:3000/api --auth-token YOUR_TOKEN`);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// CLI Setup
program
  .name('schema-to-metafields-generator')
  .description('Generate Shopify metafield definitions from JSON schemas')
  .version('1.0.0');

program
  .argument('<schema-path>', 'Path to the JSON schema file')
  .option('-o, --output <path>', 'Output file for generated metafield definitions')
  .option('-c, --create', 'Create metafield definitions via API')
  .option('--api-url <url>', 'API base URL', 'http://localhost:3000/api')
  .option('--auth-token <token>', 'Authentication token for API')
  .option('--owner-type <type>', 'Default owner type for metafields', 'PRODUCT')
  .action(generateMetafields);

// Add examples to help
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  # Analyze schema and save results');
  console.log('  $ node schema-to-metafields-generator.cjs schemas/caffitella_product_feed.json -o metafields.json');
  console.log('');
  console.log('  # Analyze and create metafields via API');
  console.log('  $ node schema-to-metafields-generator.cjs schemas/caffitella_product_feed.json --create --auth-token YOUR_TOKEN');
  console.log('');
  console.log('  # Use custom API URL');
  console.log('  $ node schema-to-metafields-generator.cjs schemas/caffitella_product_feed.json --create --api-url https://api.example.com --auth-token YOUR_TOKEN');
});

// Run the CLI
if (require.main === module) {
  program.parse();
}

module.exports = { generateMetafields, analyzeSchema, mapToShopifyMetafieldType }; 