import sharp from 'sharp';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

async function invertColors(inputPath: string, outputPath: string) {
  try {
    // Load and process the image
    await sharp(inputPath)
      .ensureAlpha() // Ensure we have an alpha channel
      .negate({ alpha: false }) // Invert all channels except alpha
      .toFile(outputPath);

    console.log(`✅ Inverted image saved to ${outputPath}`);
  } catch (error) {
    console.error('Error inverting colors:', error);
    process.exit(1);
  }
}

interface Arguments {
  input: string;
  output: string;
}

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    type: 'string',
    description: 'Input image path',
    demandOption: true
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'Output image path',
    demandOption: true
  })
  .help()
  .parseSync() as Arguments;

// Run the color inversion
void invertColors(
  path.resolve(process.cwd(), argv.input),
  path.resolve(process.cwd(), argv.output)
); 