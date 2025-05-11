import Replicate from 'replicate';
import { config } from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import ora from 'ora';
import chalk from 'chalk';
import * as path from 'path';
import * as fs from 'fs';
import { downloadFile } from './utils/download';
import axios from 'axios';
import { OpenAI } from 'openai';

// Load environment variables
config({
  path: process.env.NODE_ENV === 'development' ? '.env.local' : '.env'
});

// Define the model configuration interface
interface ModelConfig {
  model: string;
  description: string;
  maxDuration: number;
  resolution: string;
  supportsImage?: boolean;
  aspectRatios?: string[];
}

const SUPPORTED_MODELS: Record<string, ModelConfig> = {
  'kling-1.6': {
    model: 'kwaivgi/kling-v1.6-standard',
    description: 'Generate high-quality 5-10 second 720p videos with excellent text responsiveness and motion quality',
    maxDuration: 10,
    resolution: '720p',
    supportsImage: true,
    aspectRatios: ['16:9', '9:16', '1:1'] 
  },
  'kling-2.0': {
    model: 'kwaivgi/kling-v2.0',
    description: 'Latest version of Kling AI with improved image quality and motion transitions',
    maxDuration: 10,
    resolution: '720p',
    supportsImage: true,
    aspectRatios: ['16:9', '9:16', '1:1']
  },
  'minimax': {
    model: 'minimax/video-01',
    description: 'Generate high-quality 6-second 720p videos from text or image prompts',
    maxDuration: 6,
    resolution: '720p',
    supportsImage: true
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
  imagePrompt?: string;
  output?: string;
  folder?: string;
  aspectRatio?: string;
  negativePrompt?: string;
  cfgScale?: number;
  imageSize?: string;
  imageStyle?: string;
}

// Function to generate an image with OpenAI
async function generateImage(prompt: string, size: string = '1024x1024', style?: string): Promise<string> {
  const spinner = ora('Generating image with OpenAI GPT-image-1...').start();
  
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required in .env file');
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    spinner.text = `Generating image with prompt: "${prompt}"`;
    
    // Different models have different parameter requirements
    let response;
    if (style) {
      // Use DALL-E 3 if style is specified
      spinner.text = 'Using DALL-E 3 model with style parameter...';
      response = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: size as "1024x1024" | "1792x1024" | "1024x1792",
        style: style as "natural" | "vivid",
        response_format: "url"
      });
    } else {
      // Use GPT-image-1 by default
      spinner.text = 'Using GPT-image-1 model...';
      response = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        size: size as "1024x1024" | "1792x1024" | "1024x1792"
      });
    }

    // Log the entire response structure for debugging
    console.log('OpenAI Response:', JSON.stringify(response, null, 2));

    // Check if the response has the expected structure
    if (!response || !response.data || response.data.length === 0) {
      throw new Error('Invalid response from OpenAI: Empty or missing data');
    }

    // Get the URL from the response based on the model used
    let imageUrl: string;
    if (response.data[0].url) {
      imageUrl = response.data[0].url;
    } else if (response.data[0].b64_json) {
      // Some models might return base64 data instead of URL
      imageUrl = `data:image/png;base64,${response.data[0].b64_json}`;
    } else {
      throw new Error('No image URL or base64 data found in response');
    }

    spinner.succeed(chalk.green('Image generated successfully'));
    return imageUrl;
  } catch (error: unknown) {
    // Enhanced error logging
    if (error instanceof Error) {
      console.error('Detailed error:', error);
      if ('response' in (error as any)) {
        console.error('API Response:', (error as any).response?.data);
      }
    }
    
    spinner.fail(chalk.red(`Error generating image: ${error instanceof Error ? error.message : 'Unknown error'}`));
    throw error;
  }
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

    // Validate aspect ratio if model supports different ratios
    if (options.aspectRatio && selectedModel.aspectRatios && !selectedModel.aspectRatios.includes(options.aspectRatio)) {
      throw new Error(`Aspect ratio ${options.aspectRatio} not supported for ${options.model}. Supported ratios: ${selectedModel.aspectRatios.join(', ')}`);
    }

    // Prepare input based on model requirements
    const input: any = {
      prompt: options.prompt,
    };
    
    // Add duration/frames depending on model
    if (options.model.startsWith('kling')) {
      input.duration = options.duration || selectedModel.maxDuration;
    } else {
      input.num_frames = Math.floor((options.duration || selectedModel.maxDuration) * 30); // 30fps for non-Kling models
    }

    // Add model-specific parameters
    if (options.aspectRatio && selectedModel.aspectRatios) {
      input.aspect_ratio = options.aspectRatio;
    }

    if (options.negativePrompt) {
      input.negative_prompt = options.negativePrompt;
    }

    if (options.cfgScale !== undefined) {
      input.cfg_scale = options.cfgScale;
    }

    // Handle image input - either from local file or image prompt
    if (options.imagePrompt && selectedModel.supportsImage) {
      spinner.text = 'Generating image from prompt before video generation...';
      // Generate image with OpenAI
      const imageUrl = await generateImage(
        options.imagePrompt, 
        options.imageSize || '1024x1024',
        options.imageStyle
      );
      
      // For Kling models, use start_image parameter 
      if (options.model.startsWith('kling')) {
        spinner.text = 'Using generated image as start_image for video...';
        input.start_image = imageUrl;
      } else {
        spinner.text = 'Using generated image as first_frame_image for video...';
        // For Minimax, the parameter is first_frame_image
        if (options.model === 'minimax') {
          input.first_frame_image = imageUrl;
        } else {
          input.image = imageUrl;
        }
      }
    } 
    // Handle local image file path
    else if (options.image) {
      if (!fs.existsSync(options.image)) {
        throw new Error(`Input image not found: ${options.image}`);
      }
      
      if (!selectedModel.supportsImage) {
        throw new Error(`The ${options.model} model does not support image input`);
      }
      
      spinner.warn(chalk.yellow('Using local image files is not fully supported by Replicate APIs. URL is required. Consider using --image-prompt instead.'));
      
      // For Kling models, use start_image parameter 
      if (options.model.startsWith('kling')) {
        input.start_image = fs.readFileSync(options.image, { encoding: 'base64' });
      } else {
        input.image = fs.readFileSync(options.image, { encoding: 'base64' });
      }
    }

    spinner.text = 'Generating video...';
    const output = await replicate.run(
      selectedModel.model as unknown as `${string}/${string}`,
      { input }
    );

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
      default: 'kling-1.6'
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
    .option('image-prompt', {
      type: 'string',
      description: 'Text prompt to generate an image before video generation'
    })
    .option('image-size', {
      type: 'string',
      description: 'Size for generated image (1024x1024, 1792x1024, or 1024x1792)',
      default: '1024x1024'
    })
    .option('image-style', {
      type: 'string',
      description: 'Style for generated image (natural or vivid). Note: Uses DALL-E 3 model when specified instead of GPT-image-1'
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
    .option('aspect-ratio', {
      alias: 'a',
      type: 'string',
      description: 'Aspect ratio (for models that support it: 16:9, 9:16, 1:1)'
    })
    .option('negative-prompt', {
      alias: 'n',
      type: 'string',
      description: 'Negative prompt to specify what to avoid in the generated video'
    })
    .option('cfg-scale', {
      type: 'number',
      description: 'How strongly the video adheres to the prompt (0-1)'
    })
    .help()
    .argv;

  try {
    await generateVideo({
      prompt: argv.prompt,
      model: argv.model as keyof typeof SUPPORTED_MODELS,
      duration: argv.duration,
      image: argv.image,
      imagePrompt: argv['image-prompt'],
      imageSize: argv['image-size'],
      imageStyle: argv['image-style'],
      output: argv.output,
      folder: argv.folder,
      aspectRatio: argv['aspect-ratio'],
      negativePrompt: argv['negative-prompt'],
      cfgScale: argv['cfg-scale']
    });
  } catch (error) {
    process.exit(1);
  }
}

// Replace the CommonJS require.main check with a direct call
// This is a common pattern in ESM to detect the entry module
main().catch(error => {
  console.error(error);
  process.exit(1);
});

export { generateVideo, generateImage, SUPPORTED_MODELS }; 