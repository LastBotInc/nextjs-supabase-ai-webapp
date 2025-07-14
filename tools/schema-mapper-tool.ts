import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const API_KEY = process.env.GOOGLE_AI_STUDIO_KEY;

if (!API_KEY) {
  console.error('Error: GOOGLE_AI_STUDIO_KEY environment variable is not set');
  process.exit(1);
}

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: API_KEY! });

const program = new Command();

program
  .option('-s, --source <path>', 'Path to the source schema JSON file')
  .option('-t, --target <path>', 'Path to the target schema JSON file (Shopify schema)')
  .option('-o, --output <path>', 'Output path for the generated mapper function', 'components/mappers')
  .option('-n, --name <name>', 'Name for the mapper function (will be used as filename and function name)')
  .parse(process.argv);

const options = program.opts();

if (!options.source) {
  console.error('Error: --source is required');
  process.exit(1);
}

if (!options.target) {
  console.error('Error: --target is required');
  process.exit(1);
}

if (!options.name) {
  console.error('Error: --name is required');
  process.exit(1);
}

async function readSchema(schemaPath: string): Promise<any> {
  try {
    const schemaContent = await fs.readFile(schemaPath, 'utf-8');
    const schema = JSON.parse(schemaContent);
    
    // Handle different schema formats
    if (schema.json_schema) {
      // Format from schema-detector tool
      return schema.json_schema;
    } else {
      // Direct JSON schema format
      return schema;
    }
  } catch (error) {
    console.error(`Error reading schema file at ${schemaPath}:`, error);
    process.exit(1);
  }
}

async function generateMapperFunction(sourceSchema: any, targetSchema: any, mapperName: string): Promise<string> {
  try {
    const generationAndSafetyConfig = {
      responseMimeType: "text/plain",
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

    const promptContent = `
Create a TypeScript mapper function that transforms data from a source schema to a target schema.
The function name should be: ${mapperName}

### SOURCE SCHEMA:
${JSON.stringify(sourceSchema, null, 2)}

### TARGET SCHEMA (Shopify):
${JSON.stringify(targetSchema, null, 2)}

Requirements:
1. Create a well-typed TypeScript function that maps from the source schema to the target schema
2. Include TypeScript interfaces for both the source and target data structures
3. Handle all required fields from the target schema
4. Add appropriate error handling and fallbacks for missing data
5. Add JSDoc comments that explain the mapping logic
6. Export the function and interfaces

Return ONLY the TypeScript code without any markdown formatting or explanations.
The code should be ready to save directly to a .ts file.
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
    
    return text;

  } catch (error) {
    console.error('Error interacting with Gemini API:', error);
    process.exit(1);
  }
}

async function saveMapperFunction(mapperCode: string, outputDir: string, mapperName: string): Promise<void> {
  try {
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    // Construct the file path
    const fileName = `${mapperName}.ts`;
    const filePath = path.join(outputDir, fileName);
    
    // Write the mapper function to file
    await fs.writeFile(filePath, mapperCode, 'utf-8');
    
    console.log(`\nMapper function has been saved to ${filePath}`);
  } catch (error) {
    console.error('Error saving mapper function:', error);
    process.exit(1);
  }
}

async function main() {
  // Read schemas
  console.log(`Reading source schema from ${options.source}...`);
  const sourceSchema = await readSchema(options.source);
  
  console.log(`Reading target schema from ${options.target}...`);
  const targetSchema = await readSchema(options.target);
  
  // Generate mapper function
  console.log(`Generating mapper function ${options.name}...`);
  const mapperCode = await generateMapperFunction(sourceSchema, targetSchema, options.name);
  
  // Save mapper function
  await saveMapperFunction(mapperCode, options.output, options.name);
  
  console.log('\nMapper function generation completed successfully!');
}

main(); 