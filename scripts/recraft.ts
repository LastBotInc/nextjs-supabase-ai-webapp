import Replicate from 'replicate';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

interface Arguments {
  prompt: string;
  style: string;
  'negative-prompt'?: string;
  width: number;
  height: number;
  'num-outputs': number;
  seed?: number;
}

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('prompt', {
    type: 'string',
    description: 'Text description of the desired image',
    demandOption: true
  })
  .option('style', {
    type: 'string',
    description: 'Image style to use',
    default: 'digital_illustration'
  })
  .option('negative-prompt', {
    type: 'string',
    description: 'Things to avoid in the image'
  })
  .option('width', {
    type: 'number',
    description: 'Image width in pixels',
    default: 1024
  })
  .option('height', {
    type: 'number',
    description: 'Image height in pixels',
    default: 1024
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
  .parseSync() as Arguments;

async function main() {
  try {
    // Initialize Replicate client
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Run the model
    const output = await replicate.run(
      "recraft-ai/recraft-v3",
      {
        input: {
          prompt: argv.prompt,
          style: argv.style,
          width: argv.width,
          height: argv.height,
          num_outputs: argv['num-outputs'],
          negative_prompt: argv['negative-prompt'],
          seed: argv.seed
        }
      }
    ) as string[];

    // Output the result as JSON
    console.log(JSON.stringify({ url: output[0] }));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main(); 