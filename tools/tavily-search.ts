import { tavily } from '@tavily/core';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config({ path: '.env.local' });

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

if (!TAVILY_API_KEY) {
  console.error(chalk.red('Error: TAVILY_API_KEY is required in .env.local file'));
  process.exit(1);
}

const client = tavily({ apiKey: TAVILY_API_KEY });

interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  raw_content?: string;
  image_url?: string;
  image_description?: string;
}

interface SearchResponse {
  query: string;
  results: SearchResult[];
  answer?: string;
  responseTime: number;
  images?: { url: string; description?: string }[];
}

interface SearchOptions {
  searchDepth?: 'basic' | 'advanced';
  topic?: 'general' | 'news';
  days?: number;
  timeRange?: string;
  maxResults?: number;
  includeDomains?: string[];
  excludeDomains?: string[];
  includeAnswer?: boolean;
  includeRawContent?: boolean;
  includeImages?: boolean;
  includeImageDescriptions?: boolean;
  maxTokens?: number;
}

async function search() {
  const argv = await yargs(hideBin(process.argv))
    .option('query', {
      alias: 'q',
      type: 'string',
      description: 'Search query',
      demandOption: true
    })
    .option('type', {
      alias: 't',
      type: 'string',
      description: 'Search type (search, context, or qna)',
      choices: ['search', 'context', 'qna'],
      default: 'search'
    })
    .option('depth', {
      alias: 'd',
      type: 'string',
      description: 'Search depth (basic or advanced)',
      choices: ['basic', 'advanced'],
      default: 'basic'
    })
    .option('max-results', {
      alias: 'm',
      type: 'number',
      description: 'Maximum number of results',
      default: 5
    })
    .option('include', {
      alias: 'i',
      type: 'array',
      description: 'Domains to include (comma-separated)',
    })
    .option('exclude', {
      alias: 'e',
      type: 'array',
      description: 'Domains to exclude (comma-separated)',
    })
    .option('topic', {
      alias: 'o',
      type: 'string',
      description: 'Search topic (general or news)',
      choices: ['general', 'news'],
      default: 'general'
    })
    .option('days', {
      alias: 'y',
      type: 'number',
      description: 'Number of days back for news search',
      default: 3
    })
    .option('time-range', {
      type: 'string',
      description: 'Time range for search results (e.g., "1d", "1w", "1m")',
    })
    .option('max-tokens', {
      type: 'number',
      description: 'Maximum tokens for context search (default: 4000)',
      default: 4000
    })
    .option('include-images', {
      type: 'boolean',
      description: 'Include images in search results',
      default: false
    })
    .option('include-image-descriptions', {
      type: 'boolean',
      description: 'Include image descriptions',
      default: false
    })
    .option('include-answer', {
      type: 'boolean',
      description: 'Include short answer to query',
      default: false
    })
    .option('include-raw-content', {
      type: 'boolean',
      description: 'Include raw HTML content',
      default: false
    })
    .help()
    .argv;

  try {
    let response;
    const options: SearchOptions = {
      searchDepth: argv.depth as 'basic' | 'advanced',
      maxResults: argv['max-results'],
      includeDomains: argv.include?.map(String),
      excludeDomains: argv.exclude?.map(String),
      topic: argv.topic as 'general' | 'news',
      days: argv.days,
      timeRange: argv['time-range'],
      maxTokens: argv['max-tokens'],
      includeImages: argv['include-images'],
      includeImageDescriptions: argv['include-image-descriptions'],
      includeAnswer: argv['include-answer'],
      includeRawContent: argv['include-raw-content']
    };

    switch (argv.type) {
      case 'context':
        response = await client.searchContext(argv.query, options);
        console.log(chalk.green('\nContext Results:\n'));
        console.log(chalk.gray('Content and sources within token limit:\n'));
        console.log(response);
        break;

      case 'qna':
        response = await client.searchQNA(argv.query, {
          ...options,
          searchDepth: options.searchDepth || 'advanced' // QNA defaults to advanced
        });
        console.log(chalk.green('\nQuestion & Answer:\n'));
        console.log(chalk.blue('Q: ') + argv.query);
        console.log(chalk.yellow('A: ') + response);
        break;

      default:
        response = await client.search(argv.query, options) as SearchResponse;
        console.log(chalk.green('\nSearch Results:\n'));
        console.log(chalk.gray(`Query: ${response.query}`));
        console.log(chalk.gray(`Response time: ${response.responseTime}s\n`));

        response.results.forEach((result: SearchResult, index: number) => {
          console.log(chalk.blue(`\n${index + 1}. ${result.title}`));
          console.log(chalk.gray(`${result.url} (Score: ${result.score})`));
          console.log(result.content);

          if (result.raw_content) {
            console.log(chalk.yellow('\nRaw Content:'));
            console.log(result.raw_content);
          }

          if (result.image_url) {
            console.log(chalk.magenta('\nImage:'));
            console.log(`URL: ${result.image_url}`);
            if (result.image_description) {
              console.log(`Description: ${result.image_description}`);
            }
          }
        });

        if (response.images && response.images.length > 0) {
          console.log(chalk.magenta('\nAdditional Images:'));
          response.images.forEach((image, index) => {
            console.log(`\n${index + 1}. URL: ${image.url}`);
            if (image.description) {
              console.log(`   Description: ${image.description}`);
            }
          });
        }

        if (response.answer) {
          console.log(chalk.yellow('\nAnalysis:'));
          console.log(response.answer);
        }
    }

  } catch (error) {
    console.error(chalk.red('Error performing search:'), error);
    process.exit(1);
  }
}

search();
