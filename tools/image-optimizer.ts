import Replicate from 'replicate';
import dotenv from 'dotenv';
import { writeFile, readFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Ensure script only runs in development
if (process.env.NODE_ENV === 'production') {
  console.error('This tool is only available in development environment');
  process.exit(1);
}

dotenv.config({ path: '.env.local' });

interface OptimizeOptions {
  input: string;  // Path to input image
  output: string; // Path to output image
  removeBackground?: boolean;
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  };
  format?: 'png' | 'jpeg' | 'webp';
  quality?: number; // 1-100
}

async function optimizeImage(options: OptimizeOptions) {
  try {
    let imageBuffer = await readFile(options.input);
    let pipeline = sharp(imageBuffer);

    // Remove background if requested
    if (options.removeBackground) {
      console.log('Removing background...');
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });

      // Convert image to base64 URL
      const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;

      const output = await replicate.run(
        "lucataco/remove-bg:95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1",
        {
          input: {
            image: base64Image
          }
        }
      );

      // Download the processed image
      if (typeof output === 'string') {
        const response = await fetch(output);
        imageBuffer = Buffer.from(await response.arrayBuffer());
        pipeline = sharp(imageBuffer);
      } else {
        throw new Error('Expected string URL from remove-bg API');
      }
    }

    // Resize if requested
    if (options.resize) {
      console.log('Resizing image...');
      pipeline = pipeline.resize({
        width: options.resize.width,
        height: options.resize.height,
        fit: options.resize.fit || 'cover'
      });
    }

    // Convert format if requested
    if (options.format) {
      console.log(`Converting to ${options.format}...`);
      switch (options.format) {
        case 'png':
          pipeline = pipeline.png();
          break;
        case 'jpeg':
          pipeline = pipeline.jpeg({
            quality: options.quality || 80
          });
          break;
        case 'webp':
          pipeline = pipeline.webp({
            quality: options.quality || 80
          });
          break;
      }
    }

    // Ensure output directory exists
    const outputDir = path.dirname(options.output);
    await mkdir(outputDir, { recursive: true });

    // Save the processed image
    await pipeline.toFile(options.output);
    console.log(`Image saved to ${options.output}`);

  } catch (error) {
    console.error('Failed to optimize image:', error);
    throw error;
  }
}

// Parse command line arguments using yargs
const argv = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    type: 'string',
    description: 'Path to input image',
    demandOption: true
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'Path to output image',
    demandOption: true
  })
  .option('remove-bg', {
    alias: 'r',
    type: 'boolean',
    description: 'Remove image background using AI',
    default: false
  })
  .option('resize', {
    type: 'string',
    description: 'Resize image (format: WIDTHxHEIGHT, e.g. 800x600)'
  })
  .option('format', {
    alias: 'f',
    type: 'string',
    choices: ['png', 'jpeg', 'webp'],
    description: 'Convert to format'
  })
  .option('quality', {
    alias: 'q',
    type: 'number',
    description: 'Set output quality (1-100)',
    default: 80
  })
  .help()
  .parseSync();

// Convert yargs output to OptimizeOptions
const options: OptimizeOptions = {
  input: argv.input,
  output: argv.output,
  removeBackground: argv['remove-bg'],
  format: argv.format as 'png' | 'jpeg' | 'webp',
  quality: argv.quality
};

// Parse resize option if provided
if (argv.resize) {
  const [width, height] = argv.resize.split('x').map(Number);
  if (!isNaN(width) && !isNaN(height)) {
    options.resize = { width, height };
  } else {
    console.error('Invalid resize format. Use WIDTHxHEIGHT (e.g., 800x600)');
    process.exit(1);
  }
}

optimizeImage(options);
