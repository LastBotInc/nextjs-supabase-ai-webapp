import Replicate from 'replicate';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

interface Arguments {
  prompt: string;
  'prompt-upsampling'?: boolean;
  'num-outputs': number;
  seed?: number;
  folder?: string;
  filename?: string;
}

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('prompt', {
    type: 'string',
    description: 'Text description of the desired image',
    demandOption: true
  })
  .option('prompt-upsampling', {
    type: 'boolean',
    description: 'Enable prompt upsampling for better results',
    default: true
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

async function downloadImage(url: string, outputPath: string) {
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

    // Run the model
    const output = await replicate.run(
      "black-forest-labs/flux-1.1-pro",
      {
        input: {
          prompt: argv.prompt,
          prompt_upsampling: argv['prompt-upsampling'],
          num_outputs: argv['num-outputs'],
          seed: argv.seed
        }
      }
    );

    // Handle both array and direct URL outputs
    let imageUrl: string;
    if (Array.isArray(output)) {
      if (output.length === 0 || typeof output[0] !== 'string') {
        throw new Error('No image URL in output array');
      }
      imageUrl = output[0];
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else {
      throw new Error('Unexpected output format from Replicate');
    }

    if (!imageUrl.startsWith('http')) {
      throw new Error('Invalid image URL returned');
    }

    // Generate filename if not provided
    const filename = argv.filename || `flux-${Date.now()}.webp`;
    const outputPath = path.join(argv.folder || 'public/images', filename);

    // Download the image
    console.log('Downloading image...');
    await downloadImage(imageUrl, outputPath);
    console.log(`Image saved to ${outputPath}`);

    // Output the result as JSON
    console.log(JSON.stringify({ url: imageUrl, path: outputPath }));
  } catch (error) {
    console.error('Error generating image:', error);
    process.exit(1);
  }
}

main(); 