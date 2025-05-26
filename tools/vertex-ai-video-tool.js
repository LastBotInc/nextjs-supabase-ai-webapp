#!/usr/bin/env node

import { JWT } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import { createWriteStream } from 'fs';
import { fileURLToPath } from 'url';

// Get dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
  .name("vertex-ai-video-tool")
  .description("Generate videos using Google's Veo models via Vertex AI API with native audio support.")
  .version("1.0.0");

program
  .command("generate")
  .description("Generate a video using Veo models on Vertex AI")
  .requiredOption("-p, --prompt <text>", "Text prompt for video generation")
  .option("-m, --model <name>", "Model to use: \"veo-2.0-generate-001\" or \"veo-3.0-generate-preview\"", "veo-2.0-generate-001")
  .option("-i, --image <path>", "Path to input image for image-to-video generation")
  .option("-o, --output <filename>", "Output filename pattern (e.g., 'video.mp4')", "video.mp4")
  .option("-f, --folder <path>", "Output folder path", "public/videos")
  .option("--negative-prompt <text>", "Text to discourage the model from generating")
  .option("--aspect-ratio <ratio>", "Aspect ratio: \"16:9\" or \"9:16\"", "16:9")
  .option("--person-generation <mode>", "Person generation mode: \"dont_allow\" or \"allow_adult\"", "dont_allow")
  .option("--number-of-videos <number>", "Number of videos to generate (1-4)", (value) => parseInt(value, 10), 1)
  .option("--duration-seconds <number>", "Duration in seconds (5-8)", (value) => parseInt(value, 10), 5)
  .option("--enhance-prompt", "Enable prompt rewriter (enabled by default)", true)
  .option("--no-enhance-prompt", "Disable prompt rewriter")
  .option("--region <region>", "Google Cloud region", "us-central1")
  .action(async (options) => {
    const { 
      prompt, 
      model, 
      image, 
      output, 
      folder, 
      negativePrompt, 
      aspectRatio, 
      personGeneration, 
      numberOfVideos, 
      durationSeconds, 
      enhancePrompt,
      region
    } = options;
    
    try {
      // Validate inputs
      if (!["veo-2.0-generate-001", "veo-3.0-generate-preview"].includes(model)) {
        console.error(`Error: Unsupported model '${model}'. Use 'veo-2.0-generate-001' or 'veo-3.0-generate-preview'.`);
        process.exit(1);
      }
      
      if (!["16:9", "9:16"].includes(aspectRatio)) {
        console.error(`Error: Unsupported aspect ratio '${aspectRatio}'. Use '16:9' or '9:16'.`);
        process.exit(1);
      }
      
      if (numberOfVideos < 1 || numberOfVideos > 4) {
        console.error("Error: Number of videos must be between 1 and 4.");
        process.exit(1);
      }
      
      if (durationSeconds < 5 || durationSeconds > 8) {
        console.error("Error: Duration must be between 5 and 8 seconds.");
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
      
      console.log(`Generating video with ${model} on Vertex AI...`);
      console.log(`Project ID: ${projectId}`);
      console.log(`Region: ${region}`);
      console.log(`Prompt: ${prompt}`);
      if (image) console.log(`Input image: ${image}`);
      console.log(`Output folder: ${folder}`);
      console.log(`Config: ${numberOfVideos} video(s), ${durationSeconds}s, ${aspectRatio}, person generation: ${personGeneration}`);
      
      // Prepare generation parameters according to official Vertex AI API format
      const requestBody = {
        instances: [{
          prompt: prompt
        }],
        parameters: {
          sampleCount: numberOfVideos
        }
      };
      
      // Add negative prompt if provided
      if (negativePrompt) {
        requestBody.instances[0].negativePrompt = negativePrompt;
      }
      
      // Add image if provided for image-to-video generation (using correct field name)
      if (image) {
        if (!fs.existsSync(image)) {
          console.error(`Error: Input image not found at ${image}`);
          process.exit(1);
        }
        
        const imageBytes = fs.readFileSync(image);
        const mimeType = path.extname(image).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
        
        requestBody.instances[0].image = {
          bytesBase64Encoded: imageBytes.toString('base64'),
          mimeType: mimeType
        };
        
        console.log(`Using image: ${image} (${mimeType})`);
      }
      
      // Make API call to start video generation using the official Vertex AI API format
      console.log("Starting video generation...");
      const generateUrl = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/${model}:predictLongRunning`;
      
      const generateResponse = await fetch(generateUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!generateResponse.ok) {
        const errorText = await generateResponse.text();
        throw new Error(`HTTP error! status: ${generateResponse.status}, response: ${errorText}`);
      }
      
      const operationData = await generateResponse.json();
      const operationName = operationData.name;
      
      console.log(`Operation started: ${operationName}`);
      
      // Poll for completion using the official Vertex AI fetchPredictOperation endpoint
      const maxAttempts = 120; // 20 minutes max (10 second intervals)
      let attempts = 0;
      let operation = { done: false };
      
      while (!operation.done && attempts < maxAttempts) {
        attempts++;
        console.log(`Polling for completion... (${attempts}/${maxAttempts})`);
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
        
        const pollUrl = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/${model}:fetchPredictOperation`;
        
        const pollResponse = await fetch(pollUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: JSON.stringify({
            operationName: operationName
          })
        });
        
        if (!pollResponse.ok) {
          const errorText = await pollResponse.text();
          throw new Error(`Polling error! status: ${pollResponse.status}, response: ${errorText}`);
        }
        
        operation = await pollResponse.json();
      }
      
      if (!operation.done) {
        console.error("Error: Video generation timed out after 20 minutes.");
        process.exit(1);
      }
      
      if (operation.error) {
        console.error("Error: Video generation failed:", JSON.stringify(operation.error, null, 2));
        process.exit(1);
      }
      
      if (!operation.response?.generatedSamples) {
        console.error("Error: No videos were generated.");
        console.log("Full response:", JSON.stringify(operation, null, 2));
        process.exit(1);
      }
      
      // Handle the response in the official Vertex AI format
      const generatedSamples = operation.response.generatedSamples || [];
      
      console.log(`Video generation completed! Generated ${generatedSamples.length} video(s).`);
      
      // Download generated videos
      const downloadPromises = generatedSamples.map(async (sample, index) => {
        const videoUri = sample.video?.uri;
        
        if (!videoUri) {
          console.error(`Error: No video URI found for sample ${index}`);
          return;
        }
        
        try {
          console.log(`Downloading video ${index + 1}...`);
          
          // For GCS URIs, we need to download using the Cloud Storage API
          const downloadUrl = videoUri.startsWith('gs://') 
            ? `https://storage.googleapis.com/${videoUri.slice(5)}`
            : videoUri;
          
          const resp = await fetch(downloadUrl, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            }
          });
          
          if (!resp.ok) {
            throw new Error(`HTTP error! status: ${resp.status}`);
          }
          
          // Generate output filename
          const baseFilename = path.basename(output, path.extname(output));
          const extension = path.extname(output) || '.mp4';
          const outputFilename = generatedSamples.length > 1
            ? `${baseFilename}_${index + 1}${extension}`
            : `${baseFilename}${extension}`;
          
          const outputPath = path.join(folder, outputFilename);
          const writer = createWriteStream(outputPath);
          
          // Stream the video data to file
          const reader = resp.body.getReader();
          const pump = () => reader.read().then(({ done, value }) => {
            if (done) {
              writer.end();
              return;
            }
            writer.write(Buffer.from(value));
            return pump();
          });
          
          await pump();
          
          console.log(`Video ${index + 1} saved to: ${outputPath}`);
          
        } catch (error) {
          console.error(`Error downloading video ${index + 1}:`, error.message);
        }
      });
      
      await Promise.all(downloadPromises);
      console.log("All videos downloaded successfully!");
      
    } catch (error) {
      console.error("Error generating video:", error.message);
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
  console.log('  # Generate a text-to-video with Veo 3 (with audio)');
  console.log('  $ vertex-ai-video generate -p "A musician playing piano with beautiful classical music" -m veo-3.0-generate-preview --person-generation allow_adult');
  console.log('');
  console.log('  # Generate an image-to-video with Veo 2');
  console.log('  $ vertex-ai-video generate -p "The scene comes to life" -i input.jpg -m veo-2.0-generate-001 --duration-seconds 8 --aspect-ratio 9:16');
  console.log('');
  console.log('  # Generate multiple videos with negative prompt');
  console.log('  $ vertex-ai-video generate -p "A peaceful forest scene with nature sounds" --negative-prompt "violence, scary" --number-of-videos 2 -m veo-3.0-generate-preview');
  console.log('');
});

program.parse(); 