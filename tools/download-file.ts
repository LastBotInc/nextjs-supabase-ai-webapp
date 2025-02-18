import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { program } from 'commander';
import chalk from 'chalk';
import cliProgress from 'cli-progress';
import mime from 'mime-types';

// Configure CLI options
program
  .option('-u, --url <url>', 'URL of the file to download')
  .option('-o, --output <path>', 'Complete output path including filename')
  .option('-f, --folder <path>', 'Output folder path (default: downloads)', 'downloads')
  .option('-n, --filename <name>', 'Output filename (if not provided, derived from URL or content)')
  .parse(process.argv);

const options = program.opts();

// Validate required options
if (!options.url) {
  console.error(chalk.red('Error: URL is required'));
  process.exit(1);
}

async function downloadFile() {
  try {
    // Create progress bar
    const progressBar = new cliProgress.SingleBar({
      format: 'Downloading |' + chalk.cyan('{bar}') + '| {percentage}% || {value}/{total} MB',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
    });

    // Get file information from URL
    const response = await axios({
      url: options.url,
      method: 'GET',
      responseType: 'stream'
    });

    const totalBytes = parseInt(response.headers['content-length'] || '0', 10);
    const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

    // Determine output path
    let outputPath: string;
    if (options.output) {
      outputPath = options.output;
    } else {
      // Create output folder if it doesn't exist
      if (!fs.existsSync(options.folder)) {
        fs.mkdirSync(options.folder, { recursive: true });
      }

      // Determine filename
      let filename = options.filename;
      if (!filename) {
        // Try to get filename from URL or content-disposition
        const urlFilename = path.basename(options.url.split('?')[0]);
        const contentDisposition = response.headers['content-disposition'];
        const contentDispositionFilename = contentDisposition?.match(/filename="?([^"]+)"?/)?.[1];
        
        filename = contentDispositionFilename || urlFilename;
        
        // If no extension, try to determine from content-type
        if (!path.extname(filename)) {
          const contentType = response.headers['content-type'];
          const extension = mime.extension(contentType);
          if (extension) {
            filename += '.' + extension;
          }
        }
      }

      outputPath = path.join(options.folder, filename);
    }

    // Create write stream
    const writer = fs.createWriteStream(outputPath);
    let downloadedBytes = 0;

    // Start progress bar
    progressBar.start(parseFloat(totalMB), 0);

    // Pipe the response to file with progress tracking
    response.data.on('data', (chunk: Buffer) => {
      downloadedBytes += chunk.length;
      const downloadedMB = (downloadedBytes / (1024 * 1024)).toFixed(2);
      progressBar.update(parseFloat(downloadedMB));
    });

    response.data.pipe(writer);

    // Handle completion
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    progressBar.stop();
    console.log(chalk.green(`\n✅ File downloaded successfully to ${outputPath}`));

  } catch (error) {
    console.error(chalk.red('Error downloading file:'), error);
    process.exit(1);
  }
}

downloadFile(); 