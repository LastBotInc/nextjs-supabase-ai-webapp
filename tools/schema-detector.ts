import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { program } from 'commander';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { Parser as XmlParser } from 'xml2js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.GOOGLE_AI_STUDIO_KEY;

if (!API_KEY) {
  console.error('Error: GOOGLE_AI_STUDIO_KEY environment variable is not set');
  process.exit(1);
}

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: API_KEY! });

program
  .option('-u, --url <url>', 'URL of the feed to detect schema from')
  .option('-o, --output-dir <dir>', 'Directory to save the schema', 'schemas')
  .parse(process.argv);

const options = program.opts();

if (!options.url) {
  console.error('Error: --url is required');
  process.exit(1);
}

function extractVendorName(url: string): string | null {
  try {
    const hostname = new URL(url).hostname; // e.g., "caffitella.fi", "www.example.com"
    const parts = hostname.split('.'); // e.g., ["caffitella", "fi"], ["www", "example", "com"]
    if (parts.length > 0) {
      let potentialVendor = parts[0];
      if (potentialVendor.toLowerCase() === 'www' && parts.length > 1) {
        potentialVendor = parts[1];
      }
      // Basic sanitization for filename friendliness and general use
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
      if (jsonData.rss && jsonData.rss.channel && Array.isArray(jsonData.rss.channel.item)) {
        data = jsonData.rss.channel.item;
      } else if (jsonData.feed && Array.isArray(jsonData.feed.entry)) {
        data = jsonData.feed.entry;
      } else if (jsonData.products && Array.isArray(jsonData.products.product)) {
          data = jsonData.products.product;
      } else if (jsonData.shop && Array.isArray(jsonData.shop.item)) {
        data = jsonData.shop.item;
      } else {
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
        }
        if (!Array.isArray(data)) {
             console.warn("Could not automatically find an array of items in the XML structure. Using the entire parsed JSON object as a single item for schema detection.");
             return [jsonData];
        }
      }
    } else {
      throw new Error(`Unsupported content type: ${contentType}. Only application/json and application/xml are currently supported.`);
    }
    
    if (Array.isArray(data)) {
        return data;
    } else if (typeof data === 'object' && data !== null) {
        const commonArrayKeys = ['items', 'products', 'entries', 'feed', 'data', 'channel', 'shop'];
        for (const key of commonArrayKeys) {
            if (Array.isArray((data as any)[key])) {
                return (data as any)[key];
            }
        }
        console.warn("Parsed feed content is a single object, not an array. Wrapping it for schema detection.");
        return [data];
    }

    throw new Error('Could not find an array of items in the feed content after parsing.');

  } catch (error) {
    console.error('Error fetching or parsing feed:', error);
    process.exit(1);
  }
}

async function detectSchema(sampleItems: any[], vendorName: string | null) {
  try {
    const generationAndSafetyConfig = {
      responseMimeType: "application/json",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    };

    const vendorContextInfo = vendorName ? `The items in this feed are from the vendor: "${vendorName}". Please use this vendor information prominently in the generated schema name, description, and identifier.` : 'No specific vendor identified for this feed.';
    const identifierExample = vendorName ? `${vendorName}_product_feed` : 'generic_feed_schema';
    const nameExample = vendorName ? `${vendorName} Product Feed` : 'Generic Feed Data';

    const promptContent = `
Detect a detailed JSON schema from the provided JSON object examples.
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

    console.log('\nSending prompt to Gemini...');

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: "user", parts: [{ text: promptContent }] }],
      config: generationAndSafetyConfig,
    });

    const text = result.text;

    if (!text) {
        console.error("Error: Gemini returned an empty response.");
        if (result.promptFeedback) {
            console.error("Prompt Feedback:", JSON.stringify(result.promptFeedback, null, 2));
        }
        process.exit(1);
    }
    
    console.log('\nGemini Response Text:');
    console.log(text);

    let parsedResponse;
    try {
        parsedResponse = JSON.parse(text);
    } catch (parseError) {
        console.error("Error: Failed to parse Gemini's response as JSON.", parseError);
        console.error("Gemini's raw response was:", text);
        process.exit(1);
    }

    if (!parsedResponse.json_schema || !parsedResponse.identifier || !parsedResponse.name || !parsedResponse.description) {
        console.error("Error: Gemini's response is missing one or more required fields (json_schema, identifier, name, description).");
        console.error("Parsed response:", JSON.stringify(parsedResponse, null, 2));
        process.exit(1);
    }
    
    return parsedResponse;

  } catch (error) {
    console.error('Error interacting with Gemini API:', error);
    process.exit(1);
  }
}

function saveSchema(schemaData: any, outputDir: string, feedUrl: string) {
  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`Created output directory: ${outputDir}`);
    }
    
    // Create the full JSON object to save, including the feed URL and Gemini's response
    const outputData = {
      feed_url: feedUrl,
      ...schemaData // This includes json_schema, name, description, identifier from Gemini
    };
    
    // The file will store the whole object (feed_url, name, description, identifier, json_schema)
    // The json_schema itself is nested under the 'json_schema' key.
    const filePath = path.join(outputDir, `${schemaData.identifier}.json`);
    fs.writeFileSync(filePath, JSON.stringify(outputData, null, 2));
    
    console.log(`Schema and metadata saved to ${filePath}`);
    console.log('---');
    console.log('Feed URL:', feedUrl);
    console.log('Name:', schemaData.name);
    console.log('Description:', schemaData.description);
    console.log('Identifier:', schemaData.identifier);
    console.log('---');

  } catch (error) {
    console.error('Error saving schema file:', error);
    process.exit(1);
  }
}

async function main() {
  const feedUrl = options.url;
  const vendorName = extractVendorName(feedUrl);
  if (vendorName) {
    console.log(`Extracted vendor name: ${vendorName}`);
  } else {
    console.log('Could not extract a specific vendor name from URL.');
  }

  const feedItems = await fetchFeedContent(feedUrl);
  if (!feedItems || feedItems.length === 0) {
    console.error('No items found in the feed or feed is not an array of items.');
    process.exit(1);
  }

  const sampleItems = feedItems.slice(0, 5);
  console.log(`\nExtracted ${sampleItems.length} sample items from the feed.`);

  const schemaInfo = await detectSchema(sampleItems, vendorName);
  saveSchema(schemaInfo, options.outputDir, feedUrl);
}

main(); 