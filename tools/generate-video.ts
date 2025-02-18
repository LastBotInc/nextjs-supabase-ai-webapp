import Replicate from 'replicate';
import { config } from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import ora from 'ora';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { downloadFile } from './utils/download';

// Load environment variables
config({
  path: process.env.NODE_ENV === 'development' ? '.env.local' : '.env'
});

const SUPPORTED_MODELS = {
  'minimax': {
    model: 'minimax/video-01',
    description: 'Generate high-quality 5-second 720p videos from text or image prompts',
    maxDuration: 5,
    resolution: '720p'
  },
  'hunyuan': {
    model: 'tencent/hunyuan-video',
    description: 'Open-source model for generating 4-6 second 720p videos',
    maxDuration: 6,
    resolution: '720p'
  },
  'mochi': {
    model: 'genmoai/mochi-1',
    description: 'Open-source video generation with high-fidelity motion',
    maxDuration: 5,
    resolution: '720p'
  },
  'ltx': {
    model: 'lightricks/ltx-video',
    description: 'Low-memory open-source video model',
    maxDuration: 4,
    resolution: '720p'
  }
};

interface VideoGenerationOptions {
  prompt: string;
  model: keyof typeof SUPPORTED_MODELS;
  duration?: number;
  image?: string;
  output?: string;
  folder?: string;
}

async function generateVideo(options: VideoGenerationOptions) {
  const spinner = ora('Initializing video generation...').start();

  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is required in .env file');
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const selectedModel = SUPPORTED_MODELS[options.model];
    if (!selectedModel) {
      throw new Error(`Unsupported model: ${options.model}. Available models: ${Object.keys(SUPPORTED_MODELS).join(', ')}`);
    }

    if (options.duration && options.duration > selectedModel.maxDuration) {
      throw new Error(`Maximum duration for ${options.model} is ${selectedModel.maxDuration} seconds`);
    }

    // Prepare input based on model requirements
    const input: any = {
      prompt: options.prompt,
      num_frames: Math.floor((options.duration || selectedModel.maxDuration) * 30), // 30fps
    };

    if (options.image) {
      if (!fs.existsSync(options.image)) {
        throw new Error(`Input image not found: ${options.image}`);
      }
      input.image = fs.readFileSync(options.image, { encoding: 'base64' });
    }

    spinner.text = 'Generating video...';
    const output = await replicate.run(`${selectedModel.model}` as const, { input });

    if (!output || typeof output !== 'string') {
      throw new Error('Failed to generate video: Invalid output from API');
    }

    // Handle output file
    const outputFolder = options.folder || 'public/videos';
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }

    const filename = options.output || `generated-${Date.now()}.mp4`;
    const outputPath = path.join(outputFolder, filename);

    spinner.text = 'Downloading video...';
    await downloadFile(output, outputPath);

    spinner.succeed(chalk.green(`Video generated successfully: ${outputPath}`));
    return outputPath;
  } catch (error: unknown) {
    spinner.fail(chalk.red(`Error generating video: ${error instanceof Error ? error.message : 'Unknown error'}`));
    throw error;
  }
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option('prompt', {
      alias: 'p',
      type: 'string',
      description: 'Text description of the desired video',
      demandOption: true
    })
    .option('model', {
      alias: 'm',
      type: 'string',
      choices: Object.keys(SUPPORTED_MODELS),
      description: 'Video generation model to use',
      default: 'minimax'
    })
    .option('duration', {
      alias: 'd',
      type: 'number',
      description: 'Duration of the video in seconds'
    })
    .option('image', {
      alias: 'i',
      type: 'string',
      description: 'Path to input image for image-to-video generation'
    })
    .option('output', {
      alias: 'o',
      type: 'string',
      description: 'Output filename'
    })
    .option('folder', {
      alias: 'f',
      type: 'string',
      description: 'Output folder path',
      default: 'public/videos'
    })
    .help()
    .argv;

  try {
    await generateVideo({
      prompt: argv.prompt,
      model: argv.model as keyof typeof SUPPORTED_MODELS,
      duration: argv.duration,
      image: argv.image,
      output: argv.output,
      folder: argv.folder
    });
  } catch (error) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { generateVideo, SUPPORTED_MODELS }; 