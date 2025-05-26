#!/usr/bin/env node

import { JWT } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import { fileURLToPath } from 'url';

// Get dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name("vertex-ai-image-tool")
  .description("Generate images using Google's Vertex AI API with Imagen models (4.0 and 3.0).")
  .version("1.0.0");

program
  .command("generate")
  .description("Generate an image using Vertex AI Imagen models")
  .requiredOption("-p, --prompt <text>", "Text prompt for image generation")
  .option("-m, --model <name>", "Model to use: \"imagen-4.0\" or \"imagen-3.0\" (Gemini models use regular gemini-image tool)", "imagen-4.0")
  .option("-o, --output <path>", "Output file path (e.g., output.png). Extension determines format.", "vertex-generated-image.png")
  .option("-f, --folder <path>", "Output folder path", "public/images")
  .option("-n, --num-outputs <number>", "Number of images to generate (1-4)", (value) => parseInt(value, 10), 1)
  .option("--negative-prompt <text>", "Negative prompt (things to avoid)")
  .option("--aspect-ratio <ratio>", "Aspect ratio (e.g., \"1:1\", \"16:9\", \"9:16\", \"4:3\", \"3:4\")", "1:1")
  .option("--region <region>", "Google Cloud region", "us-central1")
  .option("--safety-filter <level>", "Safety filter level: \"block_few\", \"block_some\", \"block_most\"", "block_some")
  .action(async (options) => {
    const { 
      prompt, 
      model, 
      output, 
      folder, 
      numOutputs, 
      negativePrompt, 
      aspectRatio, 
      region,
      safetyFilter
    } = options;
    
    try {
      // Validate inputs
      const supportedModels = ["imagen-4.0", "imagen-3.0"];
      if (!supportedModels.includes(model)) {
        console.error(`Error: Unsupported model '${model}'. Use: ${supportedModels.join(', ')}`);
        console.error("Note: For Gemini models, use the regular 'npm run gemini-image' tool instead.");
        process.exit(1);
      }
      
      const supportedRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];
      if (!supportedRatios.includes(aspectRatio)) {
        console.error(`Error: Unsupported aspect ratio '${aspectRatio}'. Use: ${supportedRatios.join(', ')}`);
        process.exit(1);
      }
      
      if (numOutputs < 1 || numOutputs > 4) {
        console.error("Error: Number of outputs must be between 1 and 4.");
        process.exit(1);
      }
      
      // Ensure the output directory exists
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
        console.log(`Created output directory: ${folder}`);
      }
      
      // Load service account credentials
      const credentialsPath = path.resolve(__dirname, '../vertex-ai-service-account.json');
      if (!fs.existsSync(credentialsPath)) {
        console.error("Error: Service account credentials file not found at", credentialsPath);
        process.exit(1);
      }
      
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      const projectId = credentials.project_id;
      
      // Create JWT client for authentication
      const jwtClient = new JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });
      
      // Get access token
      const tokens = await jwtClient.authorize();
      const accessToken = tokens.access_token;
      
      console.log(`Generating image with ${model} on Vertex AI...`);
      console.log(`Project ID: ${projectId}`);
      console.log(`Region: ${region}`);
      console.log(`Prompt: ${prompt}`);
      console.log(`Output folder: ${folder}`);
      console.log(`Config: ${numOutputs} image(s), ${aspectRatio}, safety: ${safetyFilter}`);
      
      // Determine the model endpoint based on the selected model
      let modelEndpoint;
      switch (model) {
        case "imagen-4.0":
          modelEndpoint = "imagen-4.0-generate-preview-05-20";
          break;
        case "imagen-3.0":
          modelEndpoint = "imagen-3.0-generate-002";
          break;
        default:
          throw new Error(`Unsupported model: ${model}`);
      }
      
      // Prepare request body according to Vertex AI API format
      const requestBody = {
        instances: [{
          prompt: prompt
        }],
        parameters: {
          sampleCount: numOutputs
        }
      };
      
      // Add Imagen-specific parameters
      if (aspectRatio !== "1:1") {
        requestBody.parameters.aspectRatio = aspectRatio;
      }
      if (negativePrompt) {
        requestBody.instances[0].negativePrompt = negativePrompt;
      }
      if (safetyFilter !== "block_some") {
        requestBody.parameters.safetyFilterLevel = safetyFilter;
      }
      
      // Make API call using Vertex AI endpoint
      console.log("Generating image...");
      const apiUrl = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/${modelEndpoint}:predict`;
      
      console.log(`API URL: ${apiUrl}`);
      console.log(`Request Body: ${JSON.stringify(requestBody, null, 2)}`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }
      
      const responseData = await response.json();
      
      console.log(`Response status: ${response.status}`);
      console.log(`Response structure: ${JSON.stringify(Object.keys(responseData), null, 2)}`);
      
      // Handle response - Imagen format only
      let generatedImages = [];
      
      if (responseData.predictions && responseData.predictions.length > 0) {
        generatedImages = responseData.predictions.map(prediction => ({
          imageBytes: prediction.bytesBase64Encoded,
          mimeType: 'image/png'
        }));
      }
      
      if (generatedImages.length === 0) {
        console.error('No images found in response');
        console.log('Full response:', JSON.stringify(responseData, null, 2));
        throw new Error('No images generated');
      }
      
      // Save generated images
      generatedImages.forEach((imageData, index) => {
        const extension = path.extname(output) || '.png';
        const baseFilename = path.basename(output, extension);
        const filename = generatedImages.length > 1 ? `${baseFilename}_${index + 1}${extension}` : output;
        const outputPath = path.join(folder, filename);
        
        // Save image
        fs.writeFileSync(outputPath, Buffer.from(imageData.imageBytes, 'base64'));
        console.log(`Image ${index + 1} saved to: ${outputPath}`);
      });
      
      console.log(`Successfully generated ${generatedImages.length} image(s)!`);
      
    } catch (error) {
      console.error("Error generating image:", error.message);
      if (error.response?.data) {
        console.error("API Error Details:", JSON.stringify(error.response.data, null, 2));
      }
      process.exit(1);
    }
  });

// Add help examples
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  # Generate an image with Imagen 4.0');
  console.log('  $ vertex-ai-image generate -p "A futuristic cityscape at sunset" -m imagen-4.0 --aspect-ratio 16:9');
  console.log('');
  console.log('  # Generate multiple images with Imagen 3.0');
  console.log('  $ vertex-ai-image generate -p "A peaceful mountain lake" -m imagen-3.0 -n 3 --negative-prompt "people, buildings"');
  console.log('');
  console.log('  # Generate with custom safety filter');
  console.log('  $ vertex-ai-image generate -p "A dragon in a fantasy landscape" -m imagen-4.0 --safety-filter block_few');
  console.log('');
  console.log('Note: For Gemini image generation and editing, use: npm run gemini-image');
  console.log('');
});

program.parse(); 