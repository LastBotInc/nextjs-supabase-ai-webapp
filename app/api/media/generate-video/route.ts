import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI } from '@google/genai';
import { brandInfo } from '@/lib/brand-info';

// Initialize Gemini client
const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_KEY! });

// Function to enhance video prompt with brand style guide
function enhanceVideoPromptWithBrandStyle(originalPrompt: string): string {
  // Keep the user's request as the primary focus
  // Add brand name and styling cues as visual guidance only
  const brandName = brandInfo.name;
  const primaryTrait = brandInfo.personality.primary[0].toLowerCase();
  const industryStyle = brandInfo.industry === 'eCommerce Technology & Migration Services' ? 'modern tech' : 'professional';
  const toneStyle = brandInfo.tone.innovative > 7 ? 'innovative' : 'clean';

  // Structure: User request first, then brand styling guidance
  const enhancedPrompt = `${originalPrompt}. Brand styling: ${brandName} brand aesthetic: ${primaryTrait}, ${industryStyle}, ${toneStyle}. Use brand colors: blue (#4A90E2) and coral (#FF6B6B) as accent colors. High quality, professional composition.`;
  
  return enhancedPrompt;
}

// Function to upload video to Supabase Storage
async function uploadVideoToStorage(videoBuffer: Buffer, filename: string): Promise<{ path: string; url: string }> {
  const serviceRoleClient = createClient(undefined, true);
  
  const { data, error } = await serviceRoleClient.storage
    .from('media')
    .upload(`generated/videos/${filename}`, videoBuffer, {
      contentType: 'video/mp4',
      upsert: false
    });

  if (error) {
    console.error('Storage upload error:', error);
    throw new Error(`Failed to upload video to storage: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = serviceRoleClient.storage
    .from('media')
    .getPublicUrl(data.path);

  return {
    path: data.path,
    url: publicUrl
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎬 Starting video generation request...');

    // 1. Check authentication header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Missing or invalid authorization header');
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // 2. Create regular client to verify the token
    console.log('🔐 Verifying authentication...');
    const authClient = await createClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser(authHeader.split(' ')[1]);
    
    if (authError || !user) {
      console.log('❌ Authentication failed:', authError?.message);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 3. Check if user is admin
    console.log('👤 Checking admin status for user:', user.id);
    const serviceRoleClient = createClient(undefined, true);
    const { data: profile, error: profileError } = await serviceRoleClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      console.log('❌ Admin access denied:', profileError?.message);
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // 4. Parse request body
    const body = await request.json();
    const { assetId, prompt, model = 'veo-2.0-generate-001', aspectRatio = '16:9', durationSeconds = 5 } = body;

    if (!assetId || !prompt) {
      return NextResponse.json(
        { error: 'Asset ID and prompt are required' },
        { status: 400 }
      );
    }

    console.log('📝 Video generation request:', { assetId, prompt, model, aspectRatio, durationSeconds });

    // 5. Get the source image from database
    const { data: sourceAsset, error: assetError } = await serviceRoleClient
      .from('media_assets')
      .select('*')
      .eq('id', assetId)
      .single();

    if (assetError || !sourceAsset) {
      console.log('❌ Source asset not found:', assetError?.message);
      return NextResponse.json(
        { error: 'Source image not found' },
        { status: 404 }
      );
    }

    // 6. Download the source image
    console.log('📥 Downloading source image...');
    let imageBuffer: Buffer;
    
    if (sourceAsset.original_url.startsWith('http')) {
      // External URL - download it
      const imageResponse = await fetch(sourceAsset.original_url);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download source image: ${imageResponse.statusText}`);
      }
      imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    } else {
      // Supabase Storage path - get it from storage
      const { data: storageData, error: storageError } = await serviceRoleClient.storage
        .from('media')
        .download(sourceAsset.storage_path);
      
      if (storageError || !storageData) {
        console.error('Failed to download source image from storage. Full error:', storageError);
        throw new Error(`Failed to download source image from storage: ${storageError ? JSON.stringify(storageError) : 'Unknown error'}`);
      }
      
      imageBuffer = Buffer.from(await storageData.arrayBuffer());
    }

    // 7. Enhance prompt with brand styling
    const enhancedPrompt = enhanceVideoPromptWithBrandStyle(prompt);
    console.log('✨ Enhanced prompt:', enhancedPrompt);

    // 8. Generate video using Gemini Veo model
    console.log('🎬 Generating video with Veo model...');
    
    // Prepare generation parameters following gemini-video-tool.js pattern
    const generateParams: any = {
      model: model,
      prompt: enhancedPrompt,
      config: {
        personGeneration: 'dont_allow',
        aspectRatio: aspectRatio,
        numberOfVideos: 1,
        durationSeconds: durationSeconds,
        enhance_prompt: true
      },
      image: {
        imageBytes: imageBuffer.toString('base64'),
        mimeType: sourceAsset.mime_type
      }
    };

    console.log('Starting video generation...');
    let operation = await genAI.models.generateVideos(generateParams);
    
    // Poll for completion
    const maxAttempts = 60; // 10 minutes max (10 second intervals)
    let attempts = 0;
    
    while (!operation.done && attempts < maxAttempts) {
      attempts++;
      console.log(`Polling for completion... (${attempts}/${maxAttempts})`);
      await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
      
      operation = await genAI.operations.getVideosOperation({
        operation: operation,
      });
    }
    
    if (!operation.done) {
      throw new Error('Video generation timed out after 10 minutes');
    }
    
    if (!operation.response?.generatedVideos || operation.response.generatedVideos.length === 0) {
      throw new Error('No videos were generated');
    }

    const generatedVideo = operation.response.generatedVideos[0];
    if (!generatedVideo.video?.uri) {
      throw new Error('No video URI found in response');
    }

    // 9. Download the generated video
    console.log('📥 Downloading generated video...');
    const apiKey = process.env.GOOGLE_AI_STUDIO_KEY!;
    const videoUrl = `${generatedVideo.video.uri}&key=${apiKey}`;
    const videoResponse = await fetch(videoUrl);
    
    if (!videoResponse.ok) {
      throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }
    
    const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
    const filename = `video_${uuidv4()}.mp4`;

    // 10. Upload video to Supabase Storage
    console.log('☁️ Uploading video to storage...');
    const { path: storagePath, url: publicUrl } = await uploadVideoToStorage(videoBuffer, filename);

    // 11. Save video metadata to database
    console.log('💾 Saving video to database...');
    const { data: videoAsset, error: dbError } = await serviceRoleClient
      .from('media_assets')
      .insert({
        id: uuidv4(),
        title: `Generated Video: ${prompt.substring(0, 50)}...`,
        description: `Video generated from image using ${model}`,
        filename: filename,
        file_size: videoBuffer.length,
        mime_type: 'video/mp4',
        width: aspectRatio === '16:9' ? 1920 : aspectRatio === '9:16' ? 1080 : 1024,
        height: aspectRatio === '16:9' ? 1080 : aspectRatio === '9:16' ? 1920 : 1024,
        original_url: publicUrl,
        storage_path: storagePath,
        metadata: {
          model,
          original_prompt: prompt,
          enhanced_prompt: enhancedPrompt,
          brand_enhanced: true,
          source_asset_id: assetId,
          aspect_ratio: aspectRatio,
          duration_seconds: durationSeconds,
          generation_timestamp: new Date().toISOString()
        },
        user_id: user.id,
        is_generated: true,
        generation_prompt: prompt,
        generation_style: `${model} video generation`
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to save video to database: ${dbError.message}`);
    }

    console.log('✅ Video generation completed successfully');

    return NextResponse.json({
      success: true,
      data: {
        id: videoAsset.id,
        url: publicUrl,
        filename: filename,
        size: videoBuffer.length,
        duration: durationSeconds,
        aspectRatio: aspectRatio,
        model: model,
        prompt: prompt,
        enhancedPrompt: enhancedPrompt
      }
    });

  } catch (error) {
    console.error('❌ Video generation error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Video generation failed',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 