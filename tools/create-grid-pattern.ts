#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { program } from 'commander';
import chalk from 'chalk';

interface GridOptions {
  width: number;
  height: number;
  spacing: number;
  lineWidth: number;
  color: string;
  bgColor: string;
  dots: boolean;
  output: string;
}

program
  .name('create-grid-pattern')
  .description('Generate SVG grid patterns with customizable options')
  .option('-w, --width <number>', 'SVG width in pixels', '800')
  .option('-h, --height <number>', 'SVG height in pixels', '800')
  .option('-s, --spacing <number>', 'Grid spacing in pixels', '40')
  .option('-l, --line-width <number>', 'Line width in pixels', '1')
  .option('-c, --color <string>', 'Grid line color (CSS color or hex)', '#cccccc')
  .option('-b, --bg-color <string>', 'Background color (CSS color or hex)', 'transparent')
  .option('-d, --dots', 'Create dot pattern instead of grid lines', false)
  .option('-o, --output <string>', 'Output file path', 'public/patterns/grid.svg')
  .parse(process.argv);

const options = program.opts() as unknown as GridOptions;

// Convert string values to numbers
options.width = parseInt(options.width as unknown as string, 10);
options.height = parseInt(options.height as unknown as string, 10);
options.spacing = parseInt(options.spacing as unknown as string, 10);
options.lineWidth = parseFloat(options.lineWidth as unknown as string);

// Ensure output directory exists
const outputDir = path.dirname(options.output);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function createGridPattern(options: GridOptions): string {
  const { width, height, spacing, lineWidth, color, bgColor, dots } = options;
  
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">\n`;
  
  // Add background if not transparent
  if (bgColor !== 'transparent') {
    svg += `  <rect width="${width}" height="${height}" fill="${bgColor}" />\n`;
  }
  
  if (dots) {
    // Create dot pattern
    svg += `  <g fill="${color}">\n`;
    for (let x = spacing; x < width; x += spacing) {
      for (let y = spacing; y < height; y += spacing) {
        const dotRadius = lineWidth;
        svg += `    <circle cx="${x}" cy="${y}" r="${dotRadius}" />\n`;
      }
    }
    svg += `  </g>\n`;
  } else {
    // Create grid pattern
    svg += `  <g stroke="${color}" stroke-width="${lineWidth}">\n`;
    
    // Vertical lines
    for (let x = spacing; x < width; x += spacing) {
      svg += `    <line x1="${x}" y1="0" x2="${x}" y2="${height}" />\n`;
    }
    
    // Horizontal lines
    for (let y = spacing; y < height; y += spacing) {
      svg += `    <line x1="0" y1="${y}" x2="${width}" y2="${y}" />\n`;
    }
    
    svg += `  </g>\n`;
  }
  
  svg += `</svg>`;
  return svg;
}

try {
  const svgContent = createGridPattern(options);
  fs.writeFileSync(options.output, svgContent);
  
  console.log(chalk.green('✓ Grid pattern created successfully!'));
  console.log(chalk.blue(`Output: ${options.output}`));
  console.log(chalk.gray(`Dimensions: ${options.width}x${options.height}px`));
  console.log(chalk.gray(`Spacing: ${options.spacing}px, Line width: ${options.lineWidth}px`));
  console.log(chalk.gray(`Pattern type: ${options.dots ? 'Dots' : 'Grid'}`));
} catch (error) {
  console.error(chalk.red('Error creating grid pattern:'), error);
  process.exit(1);
} 