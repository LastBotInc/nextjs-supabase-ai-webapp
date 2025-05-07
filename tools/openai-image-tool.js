#!/usr/bin/env node
// @ts-check
// This file is ESM

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Command } from 'commander';
import axios from 'axios';
import OpenAI from 'openai';
import chalk from 'chalk';
import ora from 'ora';
import dotenv from 'dotenv';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const program = new Command();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

program
  .name('openai-image-tool')
  .description('Generate and edit images using OpenAI\'s GPT-image-1 model')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate an image using OpenAI\'s GPT-image-1 model')
  .requiredOption('-p, --prompt <text>', 'Text prompt for image generation')
  .option('-o, --output <path>', 'Output file path (e.g., output.png)', 'openai-generated-image.png')
  .option('-f, --folder <path>', 'Output folder path', 'public/images')
  .option('-s, --size <size>', 'Image size (1024x1024, 1536x1024, 1024x1536, or auto)', '1024x1024')
  .option('-q, --quality <quality>', 'Image quality (low, medium, high, or auto)', 'auto')
  .option('-t, --format <format>', 'Output format (png, jpeg, or webp)', 'png')
  .option('-c, --compression <level>', 'Compression level (0-100) for jpeg or webp', '80')
  .option('-b, --background <type>', 'Background type (opaque or transparent)', 'opaque')
  .option('-n, --number <number>', 'Number of images to generate', '1')
  .action(async (options) => {
    const { prompt, output, folder, size, quality, format, compression, background, number } = options;
    
    try {
      // Ensure the output directory exists
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }

      // Validate API key
      if (!process.env.OPENAI_API_KEY) {
        console.error('Error: OPENAI_API_KEY environment variable is not set.');
        process.exit(1);
      }

      // Validate inputs
      const validSizes = ['1024x1024', '1536x1024', '1024x1536', 'auto'];
      if (!validSizes.includes(size)) {
        console.error(`Error: Size must be one of: ${validSizes.join(', ')}`);
        process.exit(1);
      }

      const validQualities = ['low', 'medium', 'high', 'auto'];
      if (!validQualities.includes(quality)) {
        console.error(`Error: Quality must be one of: ${validQualities.join(', ')}`);
        process.exit(1);
      }

      const validFormats = ['png', 'jpeg', 'webp'];
      if (!validFormats.includes(format)) {
        console.error(`Error: Format must be one of: ${validFormats.join(', ')}`);
        process.exit(1);
      }

      if (background === 'transparent' && format === 'jpeg') {
        console.error('Error: Transparent background is only supported with png and webp formats.');
        process.exit(1);
      }

      const spinner = ora(`Generating image with GPT-image-1...`).start();
      console.log(chalk.blue(`Prompt: ${prompt}`));
      
      try {
        // Create parameters object
        const params = {
          model: "gpt-image-1",
          prompt: prompt,
          n: parseInt(number, 10),
          size: size,
          quality: quality
        };

        // Add optional parameters
        if (format !== 'png') {
          params.format = format;
        }

        if ((format === 'jpeg' || format === 'webp') && compression) {
          params.output_compression = parseInt(compression, 10);
        }

        if (background === 'transparent' && (format === 'png' || format === 'webp')) {
          params.background = 'transparent';
        }

        // Generate image
        spinner.text = 'Generating image with GPT-image-1...';
        const imageResponse = await openai.images.generate(params);

        if (imageResponse.data && imageResponse.data.length > 0) {
          // Process returned data
          for (let i = 0; i < imageResponse.data.length; i++) {
            const imageData = imageResponse.data[i];
            const outputFile = imageResponse.data.length > 1 
              ? `${path.basename(output, path.extname(output))}-${i+1}${path.extname(output)}`
              : output;
            const outputPath = path.join(folder, outputFile);
            
            // Check if we got a URL or base64 data
            if (imageData.url) {
              // Download from URL
              spinner.text = `Downloading image ${i+1} from URL...`;
              try {
                const response = await axios.get(imageData.url, { responseType: 'arraybuffer' });
                fs.writeFileSync(outputPath, Buffer.from(response.data));
                spinner.succeed(`Generated image ${i+1} saved to: ${outputPath}`);
              } catch (downloadErr) {
                spinner.fail(`Error downloading image: ${downloadErr.message}`);
                continue;
              }
            } else if (imageData.b64_json) {
              // Save base64 data directly
              fs.writeFileSync(outputPath, Buffer.from(imageData.b64_json, 'base64'));
              spinner.succeed(`Generated image ${i+1} saved to: ${outputPath}`);
            } else {
              spinner.fail(`No image data returned for image ${i+1}`);
              continue;
            }
          }
        } else {
          spinner.fail('No image data returned from API');
        }
      } catch (err) {
        spinner.fail(`Error generating image: ${err.message}`);
        if (err.response) {
          console.error(JSON.stringify(err.response.data, null, 2));
        }
        process.exit(1);
      }
    } catch (error) {
      console.error("Error generating image:", error.message);
      process.exit(1);
    }
  });

program
  .command('edit')
  .description('Edit an image or create a new image using reference images')
  .requiredOption('-i, --input-image <paths...>', 'Path(s) to input image(s) for reference or editing')
  .option('-m, --mask <path>', 'Path to mask image for inpainting (transparent areas will be replaced)')
  .requiredOption('-p, --prompt <text>', 'Text prompt describing the edit or generation')
  .option('-o, --output <path>', 'Output file path (e.g., edited-image.png)', 'openai-edited-image.png')
  .option('-f, --folder <path>', 'Output folder path', 'public/images')
  .option('-s, --size <size>', 'Image size (1024x1024, 1536x1024, 1024x1536, or auto)', '1024x1024')
  .option('-q, --quality <quality>', 'Image quality (low, medium, high, or auto)', 'auto')
  .option('-t, --format <format>', 'Output format (png, jpeg, or webp)', 'png')
  .option('-c, --compression <level>', 'Compression level (0-100) for jpeg or webp', '80')
  .option('-b, --background <type>', 'Background type (opaque or transparent)', 'opaque')
  .action(async (options) => {
    const { inputImage, mask, prompt, output, folder, size, quality, format, compression, background } = options;

    if (!process.env.OPENAI_API_KEY) {
      console.error('Error: OPENAI_API_KEY environment variable is not set.');
      process.exit(1);
    }

    // Validate inputs
    if (!inputImage || inputImage.length === 0) {
      console.error('Error: At least one input image is required.');
      process.exit(1);
    }

    const outputDir = path.resolve(folder);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`Created output directory: ${outputDir}`);
    }
    
    // Check if all input images exist
    for (const img of inputImage) {
      if (!fs.existsSync(img)) {
        console.error(`Error: Input image not found at ${img}`);
        process.exit(1);
      }
    }

    // Check if mask exists when provided
    if (mask && !fs.existsSync(mask)) {
      console.error(`Error: Mask image not found at ${mask}`);
      process.exit(1);
    }

    const outputPath = path.join(outputDir, output);
    const spinner = ora(`Editing image with GPT-image-1...`).start();
    console.log(chalk.blue(`Edit prompt: ${prompt}`));

    try {
      // Convert input images to File objects using OpenAI's toFile utility
      const { toFile } = await import('openai');
      
      // Add images and mask
      const imageFiles = [];
      for (const imgPath of inputImage) {
        const mimeType = path.extname(imgPath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
        const file = await toFile(fs.createReadStream(imgPath), null, { type: mimeType });
        imageFiles.push(file);
      }
      
      // Create parameters object with required fields
      const params = {
        model: "gpt-image-1",
        prompt: prompt,
        image: imageFiles.length === 1 ? imageFiles[0] : imageFiles
      };
      
      if (mask) {
        const maskMimeType = path.extname(mask).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
        params.mask = await toFile(fs.createReadStream(mask), null, { type: maskMimeType });
      }

      // Add optional parameters
      if (size !== '1024x1024') {
        params.size = size;
      }
      
      if (quality !== 'auto') {
        params.quality = quality;
      }
      
      if (format !== 'png') {
        params.format = format;
      }

      if ((format === 'jpeg' || format === 'webp') && compression) {
        params.output_compression = parseInt(compression, 10);
      }

      if (background === 'transparent' && (format === 'png' || format === 'webp')) {
        params.background = 'transparent';
      }

      // Send the edit request
      spinner.text = 'Processing image edit with GPT-image-1...';
      const imageResponse = await openai.images.edit(params);

      if (imageResponse.data && imageResponse.data.length > 0) {
        // Process returned data
        const imageData = imageResponse.data[0];
        
        // Check if we got a URL or base64 data
        if (imageData.url) {
          // Download from URL
          spinner.text = `Downloading edited image from URL...`;
          try {
            const response = await axios.get(imageData.url, { responseType: 'arraybuffer' });
            fs.writeFileSync(outputPath, Buffer.from(response.data));
            spinner.succeed(`Edited image saved to: ${outputPath}`);
          } catch (downloadErr) {
            spinner.fail(`Error downloading edited image: ${downloadErr.message}`);
            process.exit(1);
          }
        } else if (imageData.b64_json) {
          // Save base64 data directly
          fs.writeFileSync(outputPath, Buffer.from(imageData.b64_json, 'base64'));
          spinner.succeed(`Edited image saved to: ${outputPath}`);
        } else {
          spinner.fail('No image data returned');
          process.exit(1);
        }
      } else {
        spinner.fail('No image data returned from API');
      }
    } catch (error) {
      spinner.fail(`Error editing image: ${error.message}`);
      if (error.response) {
        console.error(JSON.stringify(error.response.data, null, 2));
      }
      process.exit(1);
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
} 