#!/usr/bin/env node

import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { Command } from "commander";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';

// Get dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const program = new Command();

program
  .name("gemini-video-tool")
  .description("Generate videos using Google's Veo models via Gemini API.")
  .version("1.0.0");

program
  .command("generate")
  .description("Generate a video using Veo models")
  .requiredOption("-p, --prompt <text>", "Text prompt for video generation")
  .option("-m, --model <name>", "Model to use (\"veo-3.0-generate-preview\" or \"veo-2.0-generate-001\")", "veo-2.0-generate-001")
  .option("-i, --image <path>", "Path to input image for image-to-video generation")
  .option("-o, --output <filename>", "Output filename pattern (e.g., 'video.mp4')", "video.mp4")
  .option("-f, --folder <path>", "Output folder path", "public/videos")
  .option("--negative-prompt <text>", "Text to discourage the model from generating")
  .option("--aspect-ratio <ratio>", "Aspect ratio: \"16:9\" or \"9:16\"", "16:9")
  .option("--person-generation <mode>", "Person generation mode: \"dont_allow\" or \"allow_adult\"", "dont_allow")
  .option("--number-of-videos <number>", "Number of videos to generate (1 or 2)", (value) => parseInt(value, 10), 1)
  .option("--duration-seconds <number>", "Duration in seconds (5-8)", (value) => parseInt(value, 10), 5)
  .option("--enhance-prompt", "Enable prompt rewriter (enabled by default)", true)
  .option("--no-enhance-prompt", "Disable prompt rewriter")
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
      enhancePrompt 
    } = options;
    
    try {
      // Validate inputs
      if (!["veo-3.0-generate-preview", "veo-2.0-generate-001"].includes(model)) {
        console.error(`Error: Unsupported model '${model}'. Use 'veo-3.0-generate-preview' or 'veo-2.0-generate-001'.`);
        process.exit(1);
      }
      
      if (!["16:9", "9:16"].includes(aspectRatio)) {
        console.error(`Error: Unsupported aspect ratio '${aspectRatio}'. Use '16:9' or '9:16'.`);
        process.exit(1);
      }
      
      if (numberOfVideos < 1 || numberOfVideos > 2) {
        console.error("Error: Number of videos must be 1 or 2.");
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
      
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_STUDIO_KEY;
      if (!apiKey) {
        console.error("Error: GEMINI_API_KEY or GOOGLE_AI_STUDIO_KEY environment variable is not set.");
        process.exit(1);
      }
      
      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      console.log(`Generating video with ${model}...`);
      console.log(`Prompt: ${prompt}`);
      if (image) console.log(`Input image: ${image}`);
      console.log(`Output folder: ${folder}`);
      console.log(`Config: ${numberOfVideos} video(s), ${durationSeconds}s, ${aspectRatio}, person generation: ${personGeneration}`);
      
      // Prepare generation parameters
      const generateParams = {
        model: model,
        prompt: prompt,
        config: {
          personGeneration: personGeneration,
          aspectRatio: aspectRatio,
          numberOfVideos: numberOfVideos,
          durationSeconds: durationSeconds,
          enhance_prompt: enhancePrompt
        }
      };
      
      // Add negative prompt if provided
      if (negativePrompt) {
        generateParams.negativePrompt = negativePrompt;
      }
      
      // Add image if provided for image-to-video generation
      if (image) {
        if (!fs.existsSync(image)) {
          console.error(`Error: Input image not found at ${image}`);
          process.exit(1);
        }
        
        const imageBytes = fs.readFileSync(image);
        const mimeType = path.extname(image).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
        
        generateParams.image = {
          imageBytes: imageBytes.toString('base64'),
          mimeType: mimeType
        };
        
        console.log(`Using image: ${image} (${mimeType})`);
      }
      
      console.log("Starting video generation...");
      let operation = await ai.models.generateVideos(generateParams);
      
      // Poll for completion
      const maxAttempts = 120; // 20 minutes max (10 second intervals)
      let attempts = 0;
      
      while (!operation.done && attempts < maxAttempts) {
        attempts++;
        console.log(`Polling for completion... (${attempts}/${maxAttempts})`);
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
        
        operation = await ai.operations.getVideosOperation({
          operation: operation,
        });
      }
      
      if (!operation.done) {
        console.error("Error: Video generation timed out after 20 minutes.");
        process.exit(1);
      }
      
      if (!operation.response?.generatedVideos) {
        console.error("Error: No videos were generated.");
        console.log("Full response:", JSON.stringify(operation, null, 2));
        process.exit(1);
      }
      
      console.log(`Video generation completed! Generated ${operation.response.generatedVideos.length} video(s).`);
      
      // Download generated videos
      const downloadPromises = operation.response.generatedVideos.map(async (generatedVideo, index) => {
        if (!generatedVideo.video?.uri) {
          console.error(`Error: No video URI found for video ${index}`);
          return;
        }
        
        try {
          console.log(`Downloading video ${index + 1}...`);
          
          // Append API key to the video URI
          const videoUrl = `${generatedVideo.video.uri}&key=${apiKey}`;
          const resp = await fetch(videoUrl);
          
          if (!resp.ok) {
            throw new Error(`HTTP error! status: ${resp.status}`);
          }
          
          // Generate output filename
          const baseFilename = path.basename(output, path.extname(output));
          const extension = path.extname(output) || '.mp4';
          const outputFilename = numberOfVideos > 1 
            ? `${baseFilename}_${index + 1}${extension}`
            : `${baseFilename}${extension}`;
          
          const outputPath = path.join(folder, outputFilename);
          const writer = createWriteStream(outputPath);
          
          // Stream the video data to file
          await new Promise((resolve, reject) => {
            Readable.fromWeb(resp.body).pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
          });
          
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
  console.log('  # Generate a text-to-video');
  console.log('  $ gemini-video generate -p "A cat playing with a ball of yarn" -m veo-2.0-generate-001');
  console.log('');
  console.log('  # Generate an image-to-video with custom settings');
  console.log('  $ gemini-video generate -p "The scene comes to life" -i input.jpg -m veo-2.0-generate-001 --duration-seconds 8 --aspect-ratio 9:16');
  console.log('');
  console.log('  # Generate multiple videos with negative prompt');
  console.log('  $ gemini-video generate -p "A peaceful forest scene" --negative-prompt "violence, scary" --number-of-videos 2');
  console.log('');
});

program.parse(); 