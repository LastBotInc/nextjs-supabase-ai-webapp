import Replicate from 'replicate';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Enable verbose debugging
const DEBUG = true;

interface Arguments {
  prompt: string;
  'aspect-ratio'?: string;
  'negative-prompt'?: string;
  'num-outputs'?: number;
  seed?: number;
  'guidance-scale'?: number;
  'steps'?: number;
  folder?: string;
  filename?: string;
  debug?: boolean;
  model?: string;
}

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('prompt', {
    type: 'string',
    description: 'Text description of the desired image',
    demandOption: true
  })
  .option('aspect-ratio', {
    type: 'string',
    description: 'Aspect ratio of the generated image (e.g., "1:1", "16:9", "3:4")',
    default: '1:1'
  })
  .option('negative-prompt', {
    type: 'string',
    description: 'Text description of what to avoid in the image'
  })
  .option('num-outputs', {
    type: 'number',
    description: 'Number of images to generate',
    default: 1
  })
  .option('seed', {
    type: 'number',
    description: 'Random seed for reproducibility'
  })
  .option('guidance-scale', {
    type: 'number',
    description: 'Guidance scale for image generation',
    default: 7.5
  })
  .option('steps', {
    type: 'number',
    description: 'Number of diffusion steps',
    default: 50
  })
  .option('folder', {
    type: 'string',
    description: 'Output folder path',
    default: 'public/images'
  })
  .option('filename', {
    type: 'string',
    description: 'Output filename'
  })
  .option('debug', {
    type: 'boolean',
    description: 'Enable debug mode',
    default: false
  })
  .option('model', {
    type: 'string',
    description: 'Model to use',
    default: 'minimax/image-01'
  })
  .parseSync() as Arguments;

// Helper for verbose logging
function log(message: string, ...args: any[]) {
  if (DEBUG || argv.debug) {
    console.log(`[DEBUG] ${message}`, ...args);
  }
}

async function downloadImage(url: string, outputPath: string) {
  log(`Downloading image from: ${url}`);
  log(`Saving to: ${outputPath}`);
  
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });

    // Create output directory if it doesn't exist
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create write stream
    const writer = fs.createWriteStream(outputPath);

    // Pipe the response data to the file
    response.data.pipe(writer);

    return new Promise<void>((resolve, reject) => {
      writer.on('finish', () => {
        log(`Successfully downloaded image to ${outputPath}`);
        resolve();
      });
      writer.on('error', (err) => {
        log(`Error writing file: ${err.message}`);
        reject(err);
      });
    });
  } catch (error: any) {
    log(`Error downloading image: ${error.message}`);
    throw new Error(`Failed to download image: ${error.message}`);
  }
}

// Simple function to save a ReadableStream to a file
async function saveReadableStreamToFile(stream: any, outputPath: string): Promise<void> {
  log(`Saving ReadableStream to: ${outputPath}`);
  
  // Create output directory if it doesn't exist
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Convert readable stream to buffer
  const chunks: Buffer[] = [];
  
  try {
    // If stream has getReader method (Web ReadableStream)
    if (typeof stream.getReader === 'function') {
      const reader = stream.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(Buffer.from(value));
      }
    } else if (typeof stream.on === 'function') {
      // Node.js readable stream
      await new Promise<void>((resolve, reject) => {
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => resolve());
        stream.on('error', reject);
      });
    } else {
      throw new Error('Provided stream is not a valid ReadableStream');
    }
    
    // Write the buffer to a file
    const buffer = Buffer.concat(chunks);
    fs.writeFileSync(outputPath, buffer);
    log(`Successfully saved stream to ${outputPath}`);
    return Promise.resolve();
  } catch (error: any) {
    log(`Error saving stream: ${error.message}`);
    throw new Error(`Failed to save stream: ${error.message}`);
  }
}

// Validate API token
function validateApiToken() {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error('REPLICATE_API_TOKEN is not set in .env.local file');
  }
  
  if (token.startsWith('r8_') && token.length > 10) {
    log('API token format appears valid');
    return true;
  } else {
    console.warn('Warning: API token format may be invalid (should start with r8_ and be longer than 10 characters)');
    return false;
  }
}

async function main() {
  try {
    console.log(`Starting image generation tool with model: ${argv.model}...`);
    
    // Validate API token
    validateApiToken();
    
    // Initialize Replicate client
    log('Initializing Replicate client');
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Get the model ID
    const modelId = argv.model || 'minimax/image-01';

    // Prepare input for the model
    const input: any = {
      prompt: argv.prompt,
      aspect_ratio: argv['aspect-ratio'],
      num_outputs: argv['num-outputs'] || 1
    };

    // Add optional parameters if provided
    if (argv['negative-prompt']) {
      input.negative_prompt = argv['negative-prompt'];
    }
    if (argv.seed !== undefined) {
      input.seed = argv.seed;
    }
    if (argv['guidance-scale'] !== undefined) {
      input.guidance_scale = argv['guidance-scale'];
    }
    if (argv.steps !== undefined) {
      input.steps = argv.steps;
    }

    console.log(`Generating image with ${argv.model}...`);
    console.log('Prompt:', argv.prompt);
    log('Using model parameters:', JSON.stringify(input, null, 2));
    
    // Run the model
    log('Calling Replicate API...');
    const output: any = await replicate.run(
      modelId as `${string}/${string}` | `${string}/${string}:${string}`,
      { input }
    );
    
    log('Received output from API:', output);

    // Handle the output
    if (!output) {
      throw new Error('Empty response from Replicate API');
    }
    
    // Create folder if it doesn't exist
    const outputDir = path.resolve(process.cwd(), argv.folder || 'public/images');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate base filename if not provided
    const baseFilename = argv.filename || `image-${Date.now()}`;
    
    // Check if output contains ReadableStream
    let savedFiles: string[] = [];
    
    if (Array.isArray(output)) {
      log('Output is an array');
      
      // Handle array of ReadableStreams
      if (output.some(item => item && typeof item === 'object' && item.constructor && item.constructor.name === 'ReadableStream')) {
        log('Array contains ReadableStreams');
        
        for (let i = 0; i < output.length; i++) {
          const item = output[i];
          if (item && typeof item === 'object' && item.constructor && item.constructor.name === 'ReadableStream') {
            const ext = path.extname(baseFilename) || '.jpg';
            const baseName = path.basename(baseFilename, ext);
            const outputFilename = output.length > 1 ? `${baseName}_${i}${ext}` : `${baseName}${ext}`;
            const outputPath = path.join(outputDir, outputFilename);
            
            await saveReadableStreamToFile(item, outputPath);
            savedFiles.push(outputPath);
            console.log(`✅ Image saved to ${outputPath}`);
          }
        }
      } else {
        // Regular URL handling
        const imageUrls = output.filter((item: any) => typeof item === 'string' && item.startsWith('http'));
        
        if (imageUrls.length > 0) {
          log(`Found ${imageUrls.length} image URLs in array`);
          
          for (let i = 0; i < imageUrls.length; i++) {
            const imageUrl = imageUrls[i];
            const ext = path.extname(baseFilename) || '.jpg';
            const baseName = path.basename(baseFilename, ext);
            const outputFilename = imageUrls.length > 1 ? `${baseName}_${i}${ext}` : `${baseName}${ext}`;
            const outputPath = path.join(outputDir, outputFilename);
            
            await downloadImage(imageUrl, outputPath);
            savedFiles.push(outputPath);
            console.log(`✅ Image saved to ${outputPath}`);
          }
        }
      }
    } else if (typeof output === 'string' && output.startsWith('http')) {
      // Single URL
      log('Output is a single URL string');
      const outputPath = path.join(outputDir, baseFilename);
      await downloadImage(output, outputPath);
      savedFiles.push(outputPath);
      console.log(`✅ Image saved to ${outputPath}`);
    } else if (output && typeof output === 'object') {
      // Check if it's a ReadableStream
      if (output.constructor && output.constructor.name === 'ReadableStream') {
        log('Output is a ReadableStream');
        const outputPath = path.join(outputDir, baseFilename);
        await saveReadableStreamToFile(output, outputPath);
        savedFiles.push(outputPath);
        console.log(`✅ Image saved to ${outputPath}`);
      } else {
        // Try to extract URLs from properties that might contain them
        log('Output is an object, looking for URL properties');
        const outputObj = output as Record<string, any>;
        const imageUrls: string[] = [];
        
        // First check for common URL properties
        const possibleUrlProps = ['url', 'image', 'output', 'result'];
        for (const prop of possibleUrlProps) {
          if (outputObj[prop] && typeof outputObj[prop] === 'string' && outputObj[prop].startsWith('http')) {
            imageUrls.push(outputObj[prop]);
          }
        }
        
        // If we couldn't find any in direct properties, look for arrays
        if (imageUrls.length === 0) {
          for (const key in outputObj) {
            if (Array.isArray(outputObj[key])) {
              const urls = outputObj[key].filter((item: any) => 
                typeof item === 'string' && item.startsWith('http')
              );
              if (urls.length > 0) {
                imageUrls.push(...urls);
              }
            }
          }
        }
        
        // If we found URLs, download them
        if (imageUrls.length > 0) {
          log(`Found ${imageUrls.length} image URLs in object`);
          
          for (let i = 0; i < imageUrls.length; i++) {
            const imageUrl = imageUrls[i];
            const ext = path.extname(baseFilename) || '.jpg';
            const baseName = path.basename(baseFilename, ext);
            const outputFilename = imageUrls.length > 1 ? `${baseName}_${i}${ext}` : `${baseName}${ext}`;
            const outputPath = path.join(outputDir, outputFilename);
            
            await downloadImage(imageUrl, outputPath);
            savedFiles.push(outputPath);
            console.log(`✅ Image saved to ${outputPath}`);
          }
        } else {
          // Check for ReadableStream properties
          for (const key in outputObj) {
            if (outputObj[key] && 
                typeof outputObj[key] === 'object' && 
                outputObj[key].constructor && 
                outputObj[key].constructor.name === 'ReadableStream') {
              
              log(`Found ReadableStream in property: ${key}`);
              const ext = path.extname(baseFilename) || '.jpg';
              const baseName = path.basename(baseFilename, ext);
              const outputFilename = `${baseName}_${key}${ext}`;
              const outputPath = path.join(outputDir, outputFilename);
              
              await saveReadableStreamToFile(outputObj[key], outputPath);
              savedFiles.push(outputPath);
              console.log(`✅ Image saved to ${outputPath}`);
            }
          }
        }
      }
    }
    
    if (savedFiles.length === 0) {
      // Try one more fallback - save the raw response as JSON
      const jsonPath = path.join(outputDir, `${path.basename(baseFilename, path.extname(baseFilename))}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2));
      console.log(`⚠️ No images could be extracted. Raw response saved to ${jsonPath}`);
      
      // If fallback models are available, suggest them
      console.log('\nSuggestion: Try a different model. For pixel art, these models often work well:');
      console.log('1. stability-ai/stable-diffusion-xl');
      console.log('2. cjwbw/anything-v3');
      console.log('3. cjwbw/dreamshaper-xl');
      
      throw new Error('No valid image data could be extracted from the response');
    }

    // Output the result as JSON
    console.log(`Successfully generated ${savedFiles.length} image(s)`);
    console.log(JSON.stringify({ 
      paths: savedFiles,
      count: savedFiles.length
    }, null, 2));
    
  } catch (error: any) {
    console.error('Error generating image:', error.message);
    
    if (error.response) {
      console.error('API Response Error:');
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    }
    
    if (DEBUG || argv.debug) {
      console.error('Full error details:', error);
    }
    
    process.exit(1);
  }
}

main(); 