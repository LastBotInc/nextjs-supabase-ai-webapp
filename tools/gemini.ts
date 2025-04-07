import { GoogleGenAI, Type, HarmBlockThreshold, HarmCategory } from '@google/genai';
import { program } from 'commander';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.GOOGLE_AI_STUDIO_KEY;

if (!API_KEY) {
  console.error('Error: GOOGLE_AI_STUDIO_KEY environment variable is not set');
  process.exit(1);
}

// Initialize Gemini with the new API
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Configure CLI options
program
  .option('-p, --prompt <text>', 'Text prompt or question for the model')
  .option('-m, --model <name>', 'Model to use', 'gemini-2.0-flash-001')
  .option('-t, --temperature <number>', 'Sampling temperature', '0.7')
  .option('--max-tokens <number>', 'Maximum tokens to generate', '2048')
  .option('--top-p <number>', 'Nucleus sampling parameter', '0.95')
  .option('--top-k <number>', 'Top-k sampling parameter', '40')
  .option('-i, --image <path>', 'Path to image file for vision tasks')
  .option('-f, --file <path>', 'Path to local file (PDF, DOCX, TXT, etc.)')
  .option('-u, --url <url>', 'URL to a document to analyze (PDF, DOCX, TXT, etc.)')
  .option('-c, --chat-history <path>', 'Path to JSON file containing chat history')
  .option('-s, --stream', 'Stream the response', false)
  .option('--safety-settings <json>', 'JSON string of safety threshold configurations')
  .option('--schema <json>', 'JSON schema for structured output')
  .option('--json <type>', 'Return structured JSON data. Available types: recipes, tasks, products, custom')
  .option('--mime-type <type>', 'MIME type of the file (e.g., application/pdf)', 'auto')
  .option('--ground', 'Enable Google Search grounding for up-to-date information', false)
  .option('--show-search-data', 'Show the search entries used for grounding (when using --ground)', false)
  .parse(process.argv);

const options = program.opts();

// Validate required options
if (!options.prompt) {
  console.error('Error: prompt is required');
  process.exit(1);
}

// Parse safety settings
const safetySettings = options.safetySettings ? 
  JSON.parse(options.safetySettings) : 
  [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

// Helper function to determine MIME type from file extension
function getMimeType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc': 'application/msword',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.json': 'application/json',
    '.md': 'text/markdown',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };

  return mimeTypes[extension] || 'application/octet-stream';
}

// Helper function to read chat history
const readChatHistory = (filePath: string) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading chat history:', error);
    return [];
  }
};

// Helper function to read and encode image
const readImage = async (imagePath: string) => {
  try {
    const imageData = fs.readFileSync(imagePath);
    return {
      inlineData: {
        data: Buffer.from(imageData).toString('base64'),
        mimeType: path.extname(imagePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg',
      },
    };
  } catch (error) {
    console.error('Error reading image:', error);
    process.exit(1);
  }
};

// Helper function to read and encode local file
const readLocalFile = async (filePath: string, mimeType = 'auto') => {
  try {
    const fileData = fs.readFileSync(filePath);
    const actualMimeType = mimeType === 'auto' ? getMimeType(filePath) : mimeType;
    
    return {
      inlineData: {
        data: Buffer.from(fileData).toString('base64'),
        mimeType: actualMimeType,
      },
    };
  } catch (error) {
    console.error('Error reading file:', error);
    process.exit(1);
  }
};

// Helper function to fetch and encode remote file
const fetchRemoteFile = async (fileUrl: string, mimeType = 'auto') => {
  try {
    console.log(`Fetching document from ${fileUrl}...`);
    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    
    const fileData = await response.arrayBuffer();
    const actualMimeType = mimeType === 'auto' ? 
      response.headers.get('content-type') || getMimeType(fileUrl) : 
      mimeType;
    
    return {
      inlineData: {
        data: Buffer.from(fileData).toString('base64'),
        mimeType: actualMimeType,
      },
    };
  } catch (error) {
    console.error('Error fetching file:', error);
    process.exit(1);
  }
};

// New function to get structured JSON response
async function getStructuredJsonResponse(prompt: string, jsonType: string, customSchema?: any) {
  let schema;
  
  // Define schemas for different types of structured data
  switch (jsonType) {
    case 'recipes':
      schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            recipeName: {
              type: Type.STRING,
              description: 'Name of the recipe',
            },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: 'List of ingredients needed for the recipe',
            },
            preparationTime: {
              type: Type.INTEGER,
              description: 'Time in minutes to prepare the recipe',
            },
            difficulty: {
              type: Type.STRING,
              description: 'Difficulty level (Easy, Medium, Hard)',
            },
            instructions: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: 'Step-by-step instructions for making the recipe',
            },
          },
          required: ['recipeName', 'ingredients', 'instructions'],
        },
      };
      break;
    
    case 'tasks':
      schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            taskName: {
              type: Type.STRING,
              description: 'Name of the task',
            },
            priority: {
              type: Type.STRING,
              description: 'Priority level (Low, Medium, High)',
            },
            dueDate: {
              type: Type.STRING,
              description: 'Due date for the task in YYYY-MM-DD format',
            },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: 'Steps required to complete the task',
            },
          },
          required: ['taskName', 'priority'],
        },
      };
      break;
    
    case 'products':
      schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            productName: {
              type: Type.STRING,
              description: 'Name of the product',
            },
            price: {
              type: Type.NUMBER,
              description: 'Price of the product',
            },
            category: {
              type: Type.STRING,
              description: 'Category the product belongs to',
            },
            features: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: 'Key features of the product',
            },
            rating: {
              type: Type.NUMBER,
              description: 'Customer rating from 1 to 5',
            },
          },
          required: ['productName', 'price', 'category'],
        },
      };
      break;
    
    case 'custom':
      if (!customSchema) {
        throw new Error('Custom schema must be provided when using the "custom" type');
      }
      // Convert string TYPE_X values to Type enum values if needed
      schema = convertSchemaTypes(customSchema);
      break;
    
    default:
      throw new Error(`Unknown JSON type: ${jsonType}`);
  }
  
  // Set config with schema
  const config = {
    temperature: parseFloat(options.temperature),
    maxOutputTokens: parseInt(options.maxTokens),
    topP: parseFloat(options.topP),
    topK: parseInt(options.topK),
    safetySettings,
    responseMimeType: 'application/json',
    responseSchema: schema,
  };
  
  // Generate content with structured JSON output
  const response = await ai.models.generateContent({
    model: options.model,
    contents: prompt,
    config,
  });
  
  // Access the text property using the getter
  const text = response.text;
  return text;
}

// Helper function to convert string TYPE_X values to Type enum values
function convertSchemaTypes(schema: any): any {
  if (typeof schema !== 'object' || schema === null) {
    return schema;
  }

  // If it's an array, process each item
  if (Array.isArray(schema)) {
    return schema.map(item => convertSchemaTypes(item));
  }

  // Create a new object to avoid modifying the original
  const result: any = {};

  // Process each property
  for (const [key, value] of Object.entries(schema)) {
    if (key === 'type') {
      // Convert string type values to Type enum values
      if (value === 'TYPE_STRING' || value === 'string') {
        result[key] = Type.STRING;
      } else if (value === 'TYPE_NUMBER' || value === 'number') {
        result[key] = Type.NUMBER;
      } else if (value === 'TYPE_INTEGER' || value === 'integer') {
        result[key] = Type.INTEGER;
      } else if (value === 'TYPE_BOOLEAN' || value === 'boolean') {
        result[key] = Type.BOOLEAN;
      } else if (value === 'TYPE_ARRAY' || value === 'array') {
        result[key] = Type.ARRAY;
      } else if (value === 'TYPE_OBJECT' || value === 'object') {
        result[key] = Type.OBJECT;
      } else {
        // Use the original value if it doesn't match known types
        result[key] = value;
      }
    } else if (typeof value === 'object' && value !== null) {
      // Recursively process nested objects and arrays
      result[key] = convertSchemaTypes(value);
    } else {
      // Use the original value for non-object properties
      result[key] = value;
    }
  }

  return result;
}

// Function to process Google Search grounding responses
function processGroundingResponse(response: any) {
  // Print the main content - use the getter, don't try to call it
  console.log(response.text);
  
  // If there's no groundingMetadata, return
  if (!response.candidates?.[0]?.groundingMetadata?.groundingAttributions) {
    console.log('\nNo sources were used for grounding this response.');
    return;
  }
  
  // Display search sources if requested
  if (options.showSearchData) {
    console.log('\n-------------------');
    console.log('SOURCES USED:');
    console.log('-------------------');
    
    const attributions = response.candidates[0].groundingMetadata.groundingAttributions;
    attributions.forEach((attribution: any, index: number) => {
      if (attribution.sourceInfo?.title && attribution.sourceInfo?.uri) {
        console.log(`[${index + 1}] ${attribution.sourceInfo.title}`);
        console.log(`    ${attribution.sourceInfo.uri}`);
      }
    });
  }
}

async function main() {
  try {
    // Handle structured JSON response
    if (options.json) {
      try {
        const customSchema = options.schema ? JSON.parse(options.schema) : undefined;
        const jsonResponse = await getStructuredJsonResponse(options.prompt, options.json, customSchema);
        console.log(jsonResponse);
        return;
      } catch (error) {
        console.error('Error generating structured JSON:', error);
        process.exit(1);
      }
    }

    // Define generation config
    const generationConfig = {
      temperature: parseFloat(options.temperature),
      maxOutputTokens: parseInt(options.maxTokens),
      topP: parseFloat(options.topP),
      topK: parseInt(options.topK),
    };

    // Base parameters for the API call
    const params: any = {
      model: options.model,
      generationConfig,
      safetySettings
    };

    // Configuration object specifically for tools or other config options
    const config: any = {};

    // Add schema if provided (for non-JSON mode)
    const schema = options.schema ? JSON.parse(options.schema) : null;
    if (schema && !options.json) { 
      config.responseMimeType = "application/json";
      config.responseSchema = schema;
    }

    // Add search tool to config if grounding is enabled
    if (options.ground) {
      config.tools = [{ googleSearch: {} }];
    }

    // Prepare content
    let contents: any = [];
    
    // Always add the prompt as the first element
    contents.push({ text: options.prompt });

    // Check if we need to add a file (local or remote)
    if (options.file) {
      const filePart = await readLocalFile(options.file, options.mimeType);
      contents.push(filePart);
    } else if (options.url) {
      const remotePart = await fetchRemoteFile(options.url, options.mimeType);
      contents.push(remotePart);
    } else if (options.image) {
      const imagePart = await readImage(options.image);
      contents.push(imagePart);
    }

    // Add contents to parameters
    params.contents = contents;

    // Add the config object to parameters if it has any properties
    if (Object.keys(config).length > 0) {
      params.config = config;
    }

    // Handle chat vs. single generation
    if (options.chatHistory) {
      console.warn("Warning: Grounding and detailed config may have limited functionality in chat history mode.");
      const history = readChatHistory(options.chatHistory);
      const chat = ai.chats.create({
        history,
        model: options.model,
      });
      
      if (options.stream) {
        const result = await chat.sendMessageStream(contents); // Send only content parts
        for await (const chunk of result) {
          process.stdout.write(chunk.text || '');
        }
        console.log('\n');
      } else {
        const result = await chat.sendMessage(contents); // Send only content parts
        console.log(result.text);
      }
    } else {
      // Single generation
      if (options.stream) {
        const responseStream = await ai.models.generateContentStream(params);
        for await (const chunk of responseStream) {
          process.stdout.write(chunk.text || '');
        }
        console.log('\n');
        console.warn("Warning: Grounding metadata might not be fully available in streaming mode.");
      } else {
        // Non-streaming single generation
        const response = await ai.models.generateContent(params);
        
        // For grounded responses, process and show attributions if requested
        if (options.ground) {
          processGroundingResponse(response);
        } else {
          console.log(response.text);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();