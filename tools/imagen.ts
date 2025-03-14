import Replicate from 'replicate';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Debug: Check if REPLICATE_API_TOKEN is set
console.log('REPLICATE_API_TOKEN is', process.env.REPLICATE_API_TOKEN ? 'set' : 'not set');

interface Arguments {
  prompt: string;
  'aspect-ratio': string;
  'negative-prompt'?: string;
  'safety-filter-level': string;
  'num-outputs': number;
  seed?: number;
  folder?: string;
  filename?: string;
}

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('prompt', {
    type: 'string',
    description: 'Text prompt for image generation',
    demandOption: true
  })
  .option('aspect-ratio', {
    type: 'string',
    description: 'Aspect ratio of the generated image',
    default: '1:1'
  })
  .option('negative-prompt', {
    type: 'string',
    description: 'Text prompt for what to discourage in the generated images'
  })
  .option('safety-filter-level', {
    type: 'string',
    description: 'Safety filter level (block_low_and_above, block_medium_and_above, block_only_high)',
    default: 'block_medium_and_above'
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
  .option('folder', {
    type: 'string',
    description: 'Output folder path',
    default: 'public/images'
  })
  .option('filename', {
    type: 'string',
    description: 'Output filename'
  })
  .parseSync() as Arguments;

async function downloadImage(url: string, outputPath: string): Promise<void> {
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

  // Return promise that resolves when the write is finished
  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve());
    writer.on('error', reject);
  });
}

async function main() {
  try {
    // Initialize Replicate client
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Parse aspect ratio to get dimensions
    const [width, height] = argv['aspect-ratio'].split(':').map(Number);
    const baseSize = 1024;
    const dimensions = {
      width: baseSize * width,
      height: baseSize * height
    };

    console.log('Running Imagen 3 model with parameters:', {
      prompt: argv.prompt,
      negative_prompt: argv['negative-prompt'],
      safety_filter_level: argv['safety-filter-level'],
      num_outputs: argv['num-outputs'],
      seed: argv.seed,
      width: dimensions.width,
      height: dimensions.height
    });

    // Run the model
    const output = await replicate.run(
      "google/imagen-3",
      {
        input: {
          prompt: argv.prompt,
          negative_prompt: argv['negative-prompt'],
          safety_filter_level: argv['safety-filter-level'],
          num_outputs: argv['num-outputs'],
          seed: argv.seed,
          width: dimensions.width,
          height: dimensions.height
        }
      }
    );

    console.log('Raw output type:', typeof output, output instanceof ReadableStream ? 'ReadableStream' : '');

    // Handle direct binary image data
    if (output instanceof ReadableStream) {
      console.log('Output is a ReadableStream, saving directly as image...');
      
      // Create output directory if it doesn't exist
      const outputDir = argv.folder || 'public/images';
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Generate filename if not provided
      const extension = 'png'; // Imagen 3 outputs PNG format
      const baseFilename = argv.filename || `imagen-${Date.now()}`;
      const filename = baseFilename.endsWith(`.${extension}`) ? baseFilename : `${baseFilename}.${extension}`;
      const outputPath = path.join(outputDir, filename);
      
      // Create write stream
      const writer = fs.createWriteStream(outputPath);
      
      // Pipe the stream directly to file
      const reader = output.getReader();
      
      // Process the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        if (value) {
          writer.write(Buffer.from(value));
        }
      }
      
      // Close the writer
      writer.end();
      
      // Wait for the write to complete
      await new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log(`Image saved to ${outputPath}`);
          resolve(outputPath);
        });
        writer.on('error', reject);
      });
      
      // Return the results
      const results = [{ path: outputPath }];
      console.log(JSON.stringify(results));
      return;
    }

    // Handle URL outputs (original code path)
    let imageUrls: string[] = [];
    if (Array.isArray(output)) {
      imageUrls = output.filter(url => typeof url === 'string');
    } else if (typeof output === 'string') {
      imageUrls = [output];
    }

    console.log('Extracted image URLs:', imageUrls);

    if (imageUrls.length === 0) {
      throw new Error('No valid image URLs in output');
    }

    // Download all generated images
    const results = await Promise.all(imageUrls.map(async (imageUrl, index) => {
      if (!imageUrl.startsWith('http')) {
        throw new Error(`Invalid image URL returned: ${imageUrl}`);
      }

      // Generate filename if not provided
      const extension = 'webp'; // Imagen 3 outputs WebP format
      const baseFilename = argv.filename || `imagen-${Date.now()}`;
      const filename = argv['num-outputs'] > 1 
        ? `${baseFilename}-${index + 1}.${extension}`
        : `${baseFilename}.${extension}`;
      
      const outputPath = path.join(argv.folder || 'public/images', filename);

      // Download the image
      console.log(`Downloading image ${index + 1}...`);
      await downloadImage(imageUrl, outputPath);
      
      return { url: imageUrl, path: outputPath };
    }));

    // Output the results as JSON
    console.log(JSON.stringify(results));
  } catch (error) {
    console.error('Error generating image:', error);
    process.exit(1);
  }
}

main(); 