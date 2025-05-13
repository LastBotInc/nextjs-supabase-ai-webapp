import axios from 'axios';
import * as fs from 'fs';
import { pipeline } from 'stream/promises';

export async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  await pipeline(response.data, fs.createWriteStream(outputPath));
} 