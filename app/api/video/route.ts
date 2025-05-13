import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import { Readable } from 'stream';

/**
 * NOTE: This API route works locally but won't work on Vercel's serverless environment.
 * 
 * On Vercel, serverless functions don't have direct filesystem access to static files in the public directory.
 * For production use, we should:
 * 1. Use direct static paths for videos (e.g., /videos/your-video.mp4) 
 * 2. Or store videos in a cloud storage service like AWS S3, Cloudinary, etc.
 * 
 * The homepage has been updated to use direct static paths.
 */

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Path to the video file
    const videoPath = path.join(process.cwd(), 'public', 'lastbot-combined-generation.mp4');
    
    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      console.error('Video file not found at path:', videoPath);
      return new NextResponse('Video not found', { status: 404 });
    }
    
    // Get file size
    const stat = await fsPromises.stat(videoPath);
    const fileSize = stat.size;
    
    // Get range header
    const range = request.headers.get('range');
    
    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      
      // Read the specific chunk of the file
      const file = fs.createReadStream(videoPath, { start, end });
      
      // Create response with 206 Partial Content status
      return new Response(file as unknown as ReadableStream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': 'video/mp4',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    } else {
      // Return the entire file
      const videoBuffer = await fsPromises.readFile(videoPath);
      
      return new NextResponse(videoBuffer, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': fileSize.toString(),
          'Cache-Control': 'public, max-age=3600',
          'Accept-Ranges': 'bytes'
        }
      });
    }
  } catch (error) {
    console.error('Error serving video:', error);
    return new NextResponse('Error serving video', { status: 500 });
  }
} 