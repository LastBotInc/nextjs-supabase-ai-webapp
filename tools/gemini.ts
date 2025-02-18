import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SchemaType } from '@google/generative-ai';
import { program } from 'commander';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.GOOGLE_AI_STUDIO_KEY;

if (!API_KEY) {
  console.error('Error: GOOGLE_AI_STUDIO_KEY environment variable is not set');
  process.exit(1);
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(API_KEY);

// Configure CLI options
program
  .option('-p, --prompt <text>', 'Text prompt or question for the model')
  .option('-m, --model <name>', 'Model to use', 'gemini-2.0-flash-001')
  .option('-t, --temperature <number>', 'Sampling temperature', '0.7')
  .option('--max-tokens <number>', 'Maximum tokens to generate', '2048')
  .option('--top-p <number>', 'Nucleus sampling parameter', '0.95')
  .option('--top-k <number>', 'Top-k sampling parameter', '40')
  .option('-i, --image <path>', 'Path to image file for vision tasks')
  .option('-c, --chat-history <path>', 'Path to JSON file containing chat history')
  .option('-s, --stream', 'Stream the response', false)
  .option('--safety-settings <json>', 'JSON string of safety threshold configurations')
  .option('--schema <json>', 'JSON schema for structured output')
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
        data: imageData.toString('base64'),
        mimeType: path.extname(imagePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg',
      },
    };
  } catch (error) {
    console.error('Error reading image:', error);
    process.exit(1);
  }
};

async function main() {
  try {
    // Parse schema if provided
    const schema = options.schema ? JSON.parse(options.schema) : null;

    // Get the model with configuration
    const model = genAI.getGenerativeModel({ 
      model: options.model,
      generationConfig: {
        temperature: parseFloat(options.temperature),
        maxOutputTokens: parseInt(options.maxTokens),
        topP: parseFloat(options.topP),
        topK: parseInt(options.topK),
        ...(schema && {
          responseMimeType: "application/json",
          responseSchema: schema
        })
      },
      safetySettings,
    });

    // Prepare content parts
    const contentParts: any[] = [options.prompt];

    // Add image if provided
    if (options.image) {
      const imageData = await readImage(options.image);
      contentParts.push(imageData);
    }

    // Handle chat vs. single generation
    if (options.chatHistory) {
      const history = readChatHistory(options.chatHistory);
      const chat = model.startChat({ history });
      
      if (options.stream) {
        const result = await chat.sendMessageStream(contentParts);
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          process.stdout.write(chunkText);
        }
        process.stdout.write('\n');
      } else {
        const result = await chat.sendMessage(contentParts);
        console.log(result.response.text());
      }
    } else {
      if (options.stream) {
        const result = await model.generateContentStream(contentParts);
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          process.stdout.write(chunkText);
        }
        process.stdout.write('\n');
      } else {
        const result = await model.generateContent(contentParts);
        console.log(result.response.text());
      }
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();