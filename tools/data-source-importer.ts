import { program } from 'commander';
import dotenv from 'dotenv';
import fs from 'fs'; // Keep for potential future use, though not directly used for schema saving
import path from 'path'; // Keep for potential future use
import fetch from 'node-fetch';
import { Parser as XmlParser } from 'xml2js';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GOOGLE_AI_STUDIO_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!GEMINI_API_KEY) {
  console.error('Error: GOOGLE_AI_STUDIO_KEY environment variable is not set');
  process.exit(1);
}
if (!SUPABASE_URL) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL environment variable is not set');
  process.exit(1);
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
  process.exit(1);
}

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY! });
// Initialize Supabase Admin Client
const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  global: { fetch: fetch as any }, // Explicitly provide node-fetch
  auth: {
    persistSession: false, // Not strictly necessary for service role, but good practice in scripts
    autoRefreshToken: false // Not needed for service role
  }
});

program
  .description('Fetches a data feed, detects its schema, and imports it as a new data source in Supabase.')
  .requiredOption('-u, --url <url>', 'URL of the data feed to import')
  .option('-t, --type <type>', 'Type of the data source (e.g., product_feed, inventory_feed)', 'product_feed')
  .parse(process.argv);

const options = program.opts();

// Functions adapted from schema-detector.ts
function extractVendorName(url: string): string | null {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split('.');
    if (parts.length > 0) {
      let potentialVendor = parts[0];
      if (potentialVendor.toLowerCase() === 'www' && parts.length > 1) {
        potentialVendor = parts[1];
      }
      const sanitized = potentialVendor.toLowerCase().replace(/[^a-z0-9_-]/gi, '');
      return sanitized.length > 0 ? sanitized : null;
    }
  } catch (e) {
    console.warn(`Could not parse URL to extract vendor name: ${url}`, e);
  }
  return null;
}

async function fetchFeedContent(feedUrl: string): Promise<any[]> {
  try {
    console.log(`Fetching feed from ${feedUrl}...`);
    const response = await fetch(feedUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.statusText} (status: ${response.status})`);
    }
    const contentType = response.headers.get('content-type');
    const feedText = await response.text();
    let data;

    if (contentType && (contentType.includes('application/json') || contentType.includes('text/json'))) {
      data = JSON.parse(feedText);
    } else if (contentType && (contentType.includes('application/xml') || contentType.includes('text/xml'))) {
      console.log('Detected XML content type. Parsing XML...');
      const parser = new XmlParser({ explicitArray: false, mergeAttrs: true });
      const jsonData = await parser.parseStringPromise(feedText);
      // Simplified XML data extraction logic (add more robust extraction if needed)
      const rootKey = Object.keys(jsonData)[0];
      if (rootKey && Array.isArray(jsonData[rootKey])) {
          data = jsonData[rootKey];
      } else if (rootKey && typeof jsonData[rootKey] === 'object' && jsonData[rootKey] !== null) {
          const nestedKeys = Object.keys(jsonData[rootKey]);
          for (const nestedKey of nestedKeys) {
              if (Array.isArray(jsonData[rootKey][nestedKey])) {
                  data = jsonData[rootKey][nestedKey];
                  break;
              }
          }
      } else if (jsonData.rss && jsonData.rss.channel && Array.isArray(jsonData.rss.channel.item)) {
        data = jsonData.rss.channel.item;
      } else if (jsonData.feed && Array.isArray(jsonData.feed.entry)) {
        data = jsonData.feed.entry;
      }
      // Fallback if no array is found directly
      if (!Array.isArray(data)) {
           console.warn("Could not automatically find an array of items in the XML structure. Using the entire parsed JSON object as a single item for schema detection.");
           return [jsonData]; // Return the whole structure as a single item array
      }
    } else {
      throw new Error(`Unsupported content type: ${contentType}. Only application/json and application/xml are currently supported.`);
    }
    
    if (Array.isArray(data)) {
        return data;
    } else if (typeof data === 'object' && data !== null) {
        // Attempt to find a common array key if the root is an object
        const commonArrayKeys = ['items', 'products', 'entries', 'feed', 'data', 'records', 'results'];
        for (const key of commonArrayKeys) {
            if (Array.isArray((data as any)[key])) {
                return (data as any)[key];
            }
        }
        console.warn("Parsed feed content is a single object, not an array, and no common array key found. Wrapping it for schema detection.");
        return [data]; // Wrap the single object in an array
    }
    throw new Error('Could not find an array of items in the feed content after parsing.');
  } catch (error) {
    console.error('Error fetching or parsing feed:', error);
    throw error; // Re-throw to be caught by main
  }
}

interface SchemaDetectionResult {
  json_schema: object;
  name: string;
  description: string;
  identifier: string;
}

async function detectSchemaWithGemini(sampleItems: any[], vendorName: string | null, feedUrl: string): Promise<SchemaDetectionResult> {
  try {
    const generationAndSafetyConfig = {
      responseMimeType: "application/json", // Expect JSON from Gemini
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    };

    const vendorContextInfo = vendorName ? `The items in this feed are from the vendor: "${vendorName}". Please use this vendor information prominently in the generated schema name, description, and identifier.` : 'No specific vendor identified for this feed.';
    const identifierExample = vendorName ? `${vendorName}_product_feed` : 'generic_feed_schema';
    const nameExample = vendorName ? `${vendorName} Product Feed` : 'Generic Feed Data';

    // Correctly escaped template literal for the prompt
    const promptContent = `
Detect a detailed JSON schema from the provided JSON object examples.
The feed URL is: ${feedUrl}
${vendorContextInfo}

For each field in the schema, please provide a "description" attribute that explains the purpose or content of that field.
Infer data types specifically (e.g., "string", "integer", "number", "boolean", "array", "object").

The schema name should clearly describe the content, incorporating the vendor if known (e.g., "${nameExample}").
The identifier must be a concise, filesystem-friendly string, incorporating the vendor if known, and indicating it's a feed schema (e.g., "${identifierExample}", or if not product-specific, "${vendorName || 'generic'}_items_schema").

### JSON OBJECT EXAMPLES:
${JSON.stringify(sampleItems, null, 2)}

Return the single item schema (not an array of items, but the schema for one item) as valid JSON. The output must be a JSON object containing the following fields:
{
  "json_schema": { /* full JSON schema including type:object, properties field for the object, and a description for each property */ },
  "name": "Schema Name (e.g., ${nameExample}, Cool Widgets Data)",
  "description": "A brief but informative description of what this schema represents, explicitly mentioning the vendor: ${vendorName || 'Unknown Vendor'}.",
  "identifier": "schema_identifier (e.g., ${identifierExample}, other_vendor_data_feed)"
}
`;

    console.log('\nSending prompt to Gemini for schema detection...');
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash-001', // or a more advanced model if needed
      contents: [{ role: "user", parts: [{ text: promptContent }] }],
      config: generationAndSafetyConfig,
    });
    const text = result.text;

    if (!text) {
        console.error("Error: Gemini returned an empty response for schema detection.");
        if (result.promptFeedback) {
            console.error("Prompt Feedback:", JSON.stringify(result.promptFeedback, null, 2));
        }
        throw new Error("Gemini returned an empty response for schema detection.");
    }
    
    console.log('\nGemini Schema Detection Response Text:', text);
    let parsedResponse;
    try {
        parsedResponse = JSON.parse(text);
    } catch (parseError) {
        console.error("Error: Failed to parse Gemini's schema detection response as JSON.", parseError);
        console.error("Gemini's raw response was:", text);
        throw new Error("Failed to parse Gemini's schema detection response.");
    }

    if (!parsedResponse.json_schema || !parsedResponse.identifier || !parsedResponse.name || !parsedResponse.description) {
        console.error("Error: Gemini's schema response is missing one or more required fields (json_schema, identifier, name, description).");
        console.error("Parsed response:", JSON.stringify(parsedResponse, null, 2));
        throw new Error("Gemini's schema response is missing required fields.");
    }
    return parsedResponse as SchemaDetectionResult;
  } catch (error) {
    console.error('Error interacting with Gemini API for schema detection:', error);
    throw error; // Re-throw to be caught by main
  }
}

async function importDataSource(
    feedUrl: string, 
    sourceType: string, 
    vendorName: string | null, 
    schemaInfo: SchemaDetectionResult
  ) {
  console.log(`\nImporting data source into Supabase...`);
  const now = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from('data_sources')
    .insert([{
      name: schemaInfo.name,
      identifier: schemaInfo.identifier + '_' + Date.now(),
      feed_url: feedUrl + '_' + Date.now(),
      description: schemaInfo.description,
      source_type: sourceType,
      vendor_name: vendorName,
    }]);

  if (error) {
    console.error('Error inserting data source into Supabase:', JSON.stringify(error, null, 2)); // Log the full error object
    // Check for unique constraint violation on identifier or feed_url
    if (error.code === '23505') { // PostgreSQL unique violation error code
        if (error.message.includes('data_sources_identifier_key')) {
            console.error(`Error: A data source with the identifier "${schemaInfo.identifier}" already exists.`);
            throw new Error(`Data source with identifier "${schemaInfo.identifier}" already exists.`);
        } else if (error.message.includes('data_sources_feed_url_key')) {
            console.error(`Error: A data source with the feed URL "${feedUrl}" already exists.`);
            throw new Error(`Data source with feed URL "${feedUrl}" already exists.`);
        }
    }
    throw error;
  }

  console.log('Successfully initiated insert for data source with identifier:', schemaInfo.identifier);
  // Cannot log 'data' here anymore as we are not selecting it.
  // return data; // Cannot return data
}

async function main() {
  const feedUrl = options.url;
  const sourceType = options.type;

  try {
    console.log(`Starting data source import for URL: ${feedUrl}`);
    const feedItems = await fetchFeedContent(feedUrl);
    if (!feedItems || feedItems.length === 0) {
      console.error('No items found in the feed or feed is not an array of items.');
      process.exit(1);
    }
    const sampleItems = feedItems.slice(0, 5); // Use up to 5 samples for schema detection
    console.log(`Extracted ${sampleItems.length} sample items from the feed.`);

    const vendorName = extractVendorName(feedUrl);
    if (vendorName) console.log(`Extracted vendor name: ${vendorName}`);

    const schemaInfo = await detectSchemaWithGemini(sampleItems, vendorName, feedUrl);
    
    await importDataSource(feedUrl, sourceType, vendorName, schemaInfo);

    console.log('\nData source import process completed successfully.');

  } catch (error: any) {
    console.error(`\nError during data source import process: ${error.message || JSON.stringify(error, null, 2)}`); // Log message or full error
    process.exit(1);
  }
}

main(); 