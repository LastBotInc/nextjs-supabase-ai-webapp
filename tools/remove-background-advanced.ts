import sharp from 'sharp';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path';
import fs from 'fs';

interface Arguments {
  input: string;
  output: string;
  tolerance?: number;
}

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('input', {
    type: 'string',
    description: 'Path to input image',
    demandOption: true
  })
  .option('output', {
    type: 'string',
    description: 'Path to output image',
    demandOption: true
  })
  .option('tolerance', {
    type: 'number',
    description: 'Color tolerance for background detection (0-255)',
    default: 30
  })
  .parseSync() as Arguments;

async function removeBackgroundAdvanced() {
  try {
    console.log(`Processing image: ${argv.input} -> ${argv.output}`);
    
    // Create output directory if it doesn't exist
    const outputDir = path.dirname(argv.output);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Load the image
    const image = sharp(argv.input);
    const metadata = await image.metadata();
    
    // Extract image data
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    const width = info.width;
    const height = info.height;
    const channels = info.channels;
    
    // Create a new buffer for the processed image
    const outputBuffer = Buffer.alloc(data.length);
    
    // Detect background color from corners
    const cornerPixels = [
      { x: 0, y: 0 },                    // Top-left
      { x: width - 1, y: 0 },            // Top-right
      { x: 0, y: height - 1 },           // Bottom-left
      { x: width - 1, y: height - 1 }    // Bottom-right
    ];
    
    // Sample colors from corners to determine background color
    const backgroundSamples = cornerPixels.map(({ x, y }) => {
      const idx = (y * width + x) * channels;
      return {
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2]
      };
    });
    
    // Calculate average background color
    const avgBackground = {
      r: Math.round(backgroundSamples.reduce((sum, color) => sum + color.r, 0) / backgroundSamples.length),
      g: Math.round(backgroundSamples.reduce((sum, color) => sum + color.g, 0) / backgroundSamples.length),
      b: Math.round(backgroundSamples.reduce((sum, color) => sum + color.b, 0) / backgroundSamples.length)
    };
    
    console.log(`Detected background color: RGB(${avgBackground.r}, ${avgBackground.g}, ${avgBackground.b})`);
    
    const tolerance = argv.tolerance || 30;
    
    // Process each pixel
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * channels;
        
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];
        
        // Check if the pixel is close to the background color
        const isBackground = (
          Math.abs(r - avgBackground.r) <= tolerance &&
          Math.abs(g - avgBackground.g) <= tolerance &&
          Math.abs(b - avgBackground.b) <= tolerance
        );
        
        // Copy RGB values
        outputBuffer[idx] = r;
        outputBuffer[idx + 1] = g;
        outputBuffer[idx + 2] = b;
        
        // Set alpha to 0 (transparent) if the pixel is background or already transparent
        outputBuffer[idx + 3] = (isBackground || a < 128) ? 0 : 255;
      }
    }
    
    // Create a new image from the processed buffer
    await sharp(outputBuffer, {
      raw: {
        width,
        height,
        channels
      }
    })
    .png()
    .toFile(argv.output);
    
    console.log(`Background removed successfully: ${argv.output}`);
    
    // Get file sizes for comparison
    const inputStats = fs.statSync(argv.input);
    const outputStats = fs.statSync(argv.output);
    const reduction = 100 - (outputStats.size / inputStats.size * 100);
    
    console.log(`Original size: ${(inputStats.size / 1024).toFixed(2)} KB`);
    console.log(`Processed size: ${(outputStats.size / 1024).toFixed(2)} KB`);
    console.log(`Size reduction: ${reduction.toFixed(2)}%`);
    
    return {
      input: argv.input,
      output: argv.output,
      originalSize: inputStats.size,
      processedSize: outputStats.size,
      reduction: reduction
    };
  } catch (error) {
    console.error('Error removing background:', error);
    process.exit(1);
  }
}

removeBackgroundAdvanced(); 