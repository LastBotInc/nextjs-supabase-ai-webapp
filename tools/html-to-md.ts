import { config } from 'dotenv';
import axios from 'axios';
import TurndownService from 'turndown';
import * as fs from 'fs';
import * as path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

config({ path: '.env.local' });

async function scrapeAndConvert() {
  const argv = await yargs(hideBin(process.argv))
    .option('url', {
      alias: 'u',
      description: 'URL to scrape',
      type: 'string',
      demandOption: true
    })
    .option('output', {
      alias: 'o',
      description: 'Output file path',
      type: 'string',
      default: 'output.md'
    })
    .option('selector', {
      alias: 's',
      description: 'CSS selector to target specific content',
      type: 'string'
    })
    .help()
    .argv;

  try {
    // Fetch HTML content
    const response = await axios.get(argv.url);
    const html = response.data;

    // Initialize Turndown
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });

    // Convert HTML to Markdown
    let content = html;
    if (argv.selector) {
      // If selector is provided, we would need a DOM parser
      // This is a simplified version - in production you might want to use jsdom
      content = html.match(new RegExp(`<${argv.selector}.*?</${argv.selector}>`, 's'))?.[0] || html;
    }

    const markdown = turndownService.turndown(content);

    // Ensure output directory exists
    const outputDir = path.dirname(argv.output);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write to file
    fs.writeFileSync(argv.output, markdown);
    console.log(`✅ Successfully converted HTML to Markdown and saved to ${argv.output}`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

scrapeAndConvert();
