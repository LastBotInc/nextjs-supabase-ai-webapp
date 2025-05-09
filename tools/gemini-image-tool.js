#!/usr/bin/env node

import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { Command } from "commander";
import axios from "axios";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';

// Get dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') }); // Explicitly load .env.local

const program = new Command();

program
  .name("gemini-image-tool")
  .description("Generate and edit images using Google's Gemini and Imagen APIs.")
  .version("1.0.0");

program
  .command("generate")
  .description("Generate an image using Gemini or Imagen API")
  .requiredOption("-p, --prompt <text>", "Text prompt for image generation")
  .option("-m, --model <name>", "Model to use (\"gemini-2.0\" or \"imagen-3.0\")", "gemini-2.0")
  .option("-o, --output <path>", "Output file path (e.g., output.png). Extension determines format.", "gemini-generated-image.png")
  .option("-f, --folder <path>", "Output folder path", "public/images")
  .option("-n, --num-outputs <number>", "Number of images to generate (Imagen 3 supports up to 4)", (value) => parseInt(value, 10), 1)
  .option("--negative-prompt <text>", "Negative prompt (Imagen 3 only)")
  .option("--aspect-ratio <ratio>", "Aspect ratio (Imagen 3 only, e.g., \"1:1\", \"16:9\", \"9:16\", \"4:3\", \"3:4\")", "1:1")
  .action(async (options) => {
    const { prompt, model, output, folder, numOutputs, negativePrompt, aspectRatio } = options;
    
    try {
      // Ensure the output directory exists
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }
      
      if (model === "gemini-2.0") {
        console.log(`Generating image with ${model}...`);
        console.log(`Prompt: ${prompt}`);
        console.log(`Output folder: ${folder}`);
        
        // Use the new @google/genai syntax
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_STUDIO_KEY;
        if (!apiKey) {
          console.error("Error: GEMINI_API_KEY or GOOGLE_AI_STUDIO_KEY environment variable is not set.");
          process.exit(1);
        }
        const genAI = new GoogleGenAI({ apiKey: apiKey });
        
        // Create a function to handle image generation
        const generateImageWithGemini = async (promptText) => {
          const result = await genAI.models.generateContent({
            model: "gemini-2.0-flash-preview-image-generation",
            contents: promptText,
            config: {
              responseModalities: ['TEXT', 'IMAGE']
            },
          });

          // Access candidates directly from the result object
          if (result && result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts) {
            for (const part of result.candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.mimeType.startsWith("image/")) {
                return Buffer.from(part.inlineData.data, "base64");
              }
            }
          }
          throw new Error("No image found in response");
        };

        try {
          const imageData = await generateImageWithGemini(prompt);
          const outputPath = path.join(folder, output);
          fs.writeFileSync(outputPath, imageData);
          console.log(`Generated image saved to: ${outputPath}`);
        } catch (err) {
          console.error("Error generating image with Gemini:", err.message);
          throw err;
        }
      } else if (model === "imagen-3.0") {
        const extension = path.extname(output) || '.png';
        const baseFilename = path.basename(output, extension);
        await generateImageWithImagen3(prompt, { 
          folder, 
          output,
          numOutputs, 
          negativePrompt, 
          aspectRatio,
          extension 
        });
      } else {
        console.error(`Error: Unsupported model '${model}'. Use 'gemini-2.0' or 'imagen-3.0'.`);
        process.exit(1);
      }
    } catch (error) {
      console.error("Error generating image:", error.message);
      process.exit(1);
    }
  });

program
  .command("edit")
  .description("Edit an existing image based on a prompt (Gemini 2.0 only).")
  .requiredOption("-i, --input-image <path>", "Path to the input image.")
  .requiredOption("-p, --edit-prompt <text>", "Text prompt describing the edit.")
  .option("-o, --output <path>", "Output file path (e.g., edited-image.png).", "gemini-edited-image.png")
  .option("-f, --folder <path>", "Output folder path", "public/images")
  .action(async (options) => {
    const { inputImage, editPrompt, output, folder } = options;
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_STUDIO_KEY;

    if (!apiKey) {
      console.error("Error: GEMINI_API_KEY or GOOGLE_AI_STUDIO_KEY environment variable is not set.");
      process.exit(1);
    }

    if (!fs.existsSync(inputImage)) {
      console.error(`Error: Input image not found at ${inputImage}`);
      process.exit(1);
    }

    const outputDir = path.resolve(folder);
     if (!fs.existsSync(outputDir)) {
       fs.mkdirSync(outputDir, { recursive: true });
       console.log(`Created output directory: ${outputDir}`);
     }
    const outputPath = path.join(outputDir, output);

    console.log(`Editing image '${inputImage}' with gemini-2.0...`);
    console.log(`Edit Prompt: ${editPrompt}`);

    try {
        const ai = new GoogleGenAI({ apiKey: apiKey });
        const modelName = 'gemini-2.0-flash-preview-image-generation'; // Use example model

        console.log(`Using model for editing: ${modelName} as per example structure`);

        const imageBytes = fs.readFileSync(inputImage);
        const base64Image = imageBytes.toString('base64');
        const mimeType = path.extname(inputImage) === '.png' ? 'image/png' : 'image/jpeg'; // Basic type detection

        // Use structured contents for editing as per previous findings
        const editingContents = [{ role: "user", parts: [
            { text: editPrompt },
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Image
                }
            }
        ]}];

         // Call generateContent directly on ai.models as per user example
         const response = await ai.models.generateContent({
             model: modelName, // Pass model name here
             contents: editingContents, // Use structured contents for edit
             config: { // Add config block back as per example
                 responseModalities: ['TEXT', 'IMAGE']
             },
         });

         let imageSaved = false;
         if (response.candidates && response.candidates.length > 0 && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const imageData = part.inlineData.data;
                    const buffer = Buffer.from(imageData, 'base64');
                    fs.writeFileSync(outputPath, buffer);
                    console.log(`Edited image saved as ${outputPath}`);
                    imageSaved = true;
                    break; // Assume only one image is generated
                } else if (part.text) {
                    console.log("Text response received during edit:", part.text); // Log any text part
                }
            }
            if (!imageSaved) {
                console.error("No edited image data found in the response parts.");
            }
         } else {
            console.error("Failed to edit image. Response structure might be unexpected or empty.");
            console.log("Full response:", JSON.stringify(response, null, 2));
         }

    } catch (error) {
        console.error("Error during image editing:", error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
          if (error.response?.data?.error?.message) {
            console.error("API Error Message:", error.response.data.error.message);
          }
          if (error.message.includes('responseMimeType')) {
             console.error("Hint: The selected Gemini model might not support direct image editing with responseMimeType. You might need a different model or API endpoint specifically for editing.")
           }
          if (error.message.includes('429')) {
             console.error("Hint: You might have hit an API rate limit. Please wait and try again.")
           }
        process.exit(1);
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

/**
 * Generate an image using the Imagen 3.0 API
 * 
 * Uses the Gemini API's Imagen 3.0 model to generate high-quality images based on text prompts.
 * Supported model: imagen-3.0-generate-002
 * 
 * Features:
 * - High-quality image generation
 * - Multiple image generation (up to 4)
 * - Custom aspect ratios (1:1, 16:9, 9:16, 4:3, 3:4)
 * - Negative prompts
 * 
 * @param {string} prompt - The text prompt describing the image to generate
 * @param {Object} options - Configuration options
 * @param {string} options.folder - Output folder path
 * @param {string} options.output - Output filename
 * @param {number} options.numOutputs - Number of images to generate (1-4)
 * @param {string} options.negativePrompt - Negative prompt (things to avoid)
 * @param {string} options.aspectRatio - Aspect ratio (1:1, 16:9, 9:16, 4:3, 3:4)
 * @param {string} options.extension - File extension (.png, .jpg)
 * @returns {Promise<string>} - Path to the generated image
 */
async function generateImageWithImagen3(prompt, options) {
  console.log('Generating image with imagen-3.0...');
  console.log(`Prompt: ${prompt}`);
  console.log(`Output folder: ${options.folder}`);

  try {
    // Create output folder if it doesn't exist
    if (!fs.existsSync(options.folder)) {
      fs.mkdirSync(options.folder, { recursive: true });
    }

    console.log('Sending request to Imagen 3 API...');
    
    // Imagen 3 API endpoint
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_STUDIO_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
    
    console.log(`API URL: ${apiUrl}`);
    
    // Prepare request body
    const requestBody = {
      instances: [
        {
          prompt: prompt
        }
      ],
      parameters: {
        sampleCount: options.numOutputs || 1,
        aspectRatio: options.aspectRatio || "1:1"
      }
    };
    
    // Add negative prompt if provided
    if (options.negativePrompt) {
      requestBody.instances[0].negativePrompt = options.negativePrompt;
    }
    
    console.log(`Request Body: ${JSON.stringify(requestBody, null, 2)}`);

    // Make API request
    const response = await axios.post(apiUrl, requestBody);
    
    console.log(`Response status: ${response.status}`);
    
    // Handle response - log the full response structure
    console.log(`Response structure: ${JSON.stringify(Object.keys(response.data), null, 2)}`);
    
    // Handle response based on actual API return format
    if (response.data && response.data.predictions && response.data.predictions.length > 0) {
      const predictions = response.data.predictions;
      
      // Process each generated image
      predictions.forEach((prediction, index) => {
        if (prediction.bytesBase64Encoded) {
          const extension = options.extension || '.png';
          const baseFilename = path.basename(options.output, extension);
          const filename = options.numOutputs > 1 ? `${baseFilename}_${index + 1}${extension}` : options.output;
          const outputPath = path.join(options.folder, filename);
          
          // Save image
          fs.writeFileSync(outputPath, Buffer.from(prediction.bytesBase64Encoded, 'base64'));
          console.log(`Image ${index + 1} saved to: ${outputPath}`);
        }
      });
      
      return path.join(options.folder, options.output);
    } else {
      console.error('Unexpected API response format:', response.data);
      throw new Error('Unexpected API response format');
    }
  } catch (error) {
    console.error('Axios error:', error.message);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data || ''));
      throw new Error(JSON.stringify(error.response.data || ''));
    } else {
      throw error;
    }
  }
} 