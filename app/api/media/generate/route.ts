import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { GenerationOptions } from '@/types/media';
import { brandInfo } from '@/lib/brand-info';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Initialize Google GenAI client
const googleAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_STUDIO_KEY! });

// Function to enhance prompt with brand style guide
function enhancePromptWithBrandStyle(originalPrompt: string): string {
  // Keep the user's request as the primary focus
  // Add brand name and styling cues as visual guidance only
  const brandName = brandInfo.name;
  const primaryTrait = brandInfo.personality.primary[0].toLowerCase();
  const industryStyle = brandInfo.industry === 'eCommerce Technology & Migration Services' ? 'modern tech' : 'professional';
  const toneStyle = brandInfo.tone.innovative > 7 ? 'innovative' : 'clean';
  
  // Structure: User request first, then brand styling guidance
  const enhancedPrompt = `${originalPrompt}. Brand styling: ${brandName} brand aesthetic with ${primaryTrait}, ${industryStyle}, ${toneStyle} visual style. Use brand colors: blue (#4A90E2) and coral (#FF6B6B) accents. High quality, professional composition.`;

  return enhancedPrompt;
}

// Function to get image size from URL or file
async function getImageMetadata(urlOrPath: string): Promise<{ fileSize: number }> {
  try {
    if (urlOrPath.startsWith('http')) {
      // Handle URL
      const response = await fetch(urlOrPath, { method: 'HEAD' });
      if (!response.ok) throw new Error('Failed to fetch image metadata');
      
      const size = parseInt(response.headers.get('content-length') || '0');
      return { fileSize: size };
    } else {
      // Handle local file
      const stats = fs.statSync(urlOrPath);
      return { fileSize: stats.size };
    }
  } catch (error) {
    console.error('Error getting image metadata:', error);
    return { fileSize: 0 };
  }
}

// Function to upload image buffer to Supabase Storage
async function uploadImageToStorage(
  supabase: any,
  imageBuffer: ArrayBuffer,
  filename: string,
  contentType: string = 'image/png'
): Promise<{ publicUrl: string; storagePath: string }> {
  // Generate unique storage path
  const storagePath = `generated/${Date.now()}-${filename}`;
  
  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(storagePath, imageBuffer, {
      contentType,
      upsert: true
    });

  if (uploadError) {
    throw new Error(`Failed to upload to storage: ${uploadError.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(storagePath);

  return { publicUrl, storagePath };
}

// Function to generate image using OpenAI
async function generateWithOpenAI(options: GenerationOptions): Promise<{ publicUrl: string; storagePath: string; imageBuffer: ArrayBuffer }> {
  try {
    console.log('🎨 Generating image with OpenAI GPT-1-image');
    
    // Enhance prompt with brand style guide
    const enhancedPrompt = enhancePromptWithBrandStyle(options.prompt);
    console.log('🎨 Enhanced prompt with brand styling');
    
    // Create parameters object following openai-image-tool.js pattern
    const params = {
      model: "gpt-image-1",
      prompt: enhancedPrompt,
      n: 1,
      size: options.size || "1024x1024",
      quality: "auto" as const
    };

    // Generate image using the exact pattern from openai-image-tool.js
    const imageResponse = await openai.images.generate(params);

    if (!imageResponse.data || !imageResponse.data[0]) {
      throw new Error('No image data returned from OpenAI');
    }

    const imageData = imageResponse.data[0];
    
    // Handle both URL and base64 responses like in openai-image-tool.js
    let imageBuffer: ArrayBuffer;
    
    if (imageData.url) {
      // Download from URL
      console.log('📥 Downloading image from OpenAI URL...');
      const response = await fetch(imageData.url);
      if (!response.ok) {
        throw new Error('Failed to download generated image');
      }
      imageBuffer = await response.arrayBuffer();
    } else if (imageData.b64_json) {
      // Use base64 data directly
      console.log('📥 Processing base64 image data...');
      imageBuffer = Buffer.from(imageData.b64_json, 'base64').buffer;
    } else {
      throw new Error('No image URL or base64 data returned from OpenAI');
    }

    return { publicUrl: '', storagePath: '', imageBuffer };
    
  } catch (error) {
    console.error('OpenAI generation error:', error);
    throw new Error(`OpenAI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Function to generate image using Google GenAI (following gemini-image-tool.js pattern)
async function generateWithGoogleGenAI(options: GenerationOptions): Promise<{ publicUrl: string; storagePath: string; imageBuffer: ArrayBuffer }> {
  try {
    console.log('🎨 Generating image with Google GenAI:', options.model);
    
    // Enhance prompt with brand style guide
    const enhancedPrompt = enhancePromptWithBrandStyle(options.prompt);
    console.log('🎨 Enhanced prompt with brand styling');
    
    const apiKey = process.env.GOOGLE_AI_STUDIO_KEY;
    if (!apiKey) {
      throw new Error('Google AI Studio API key not configured');
    }

    const genAI = new GoogleGenAI({ apiKey: apiKey });
    
    if (options.model === 'imagen-3.0') {
      // Use Imagen 3.0 API pattern from gemini-image-tool.js
      const extension = '.png';
      const baseFilename = `imagen-${uuidv4()}`;
      const filename = `${baseFilename}${extension}`;
      const folder = path.join(process.cwd(), 'public', 'images', 'generated');
      
      // Ensure directory exists
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }

      // Use the Imagen 3.0 API endpoint pattern from the tool
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
      
      const requestBody = {
        instances: [
          {
            prompt: enhancedPrompt
          }
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: options.size === '1024x1792' ? '9:16' : 
                      options.size === '1792x1024' ? '16:9' : '1:1'
        }
      };

      console.log('Sending request to Imagen 3 API...');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Imagen API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.predictions || !result.predictions[0] || !result.predictions[0].bytesBase64Encoded) {
        throw new Error('No image data returned from Imagen API');
      }

      // Save image
      const outputPath = path.join(folder, filename);
      const imageBuffer = Buffer.from(result.predictions[0].bytesBase64Encoded, 'base64').buffer;
      
      return { publicUrl: '', storagePath: '', imageBuffer };
      
    } else {
      // Use Gemini 2.0 Flash pattern from gemini-image-tool.js
      const filename = `gemini-${uuidv4()}.png`;
      const folder = path.join(process.cwd(), 'public', 'images', 'generated');
      
      // Ensure directory exists
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }

      // Use the exact pattern from gemini-image-tool.js
      const result = await genAI.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: enhancedPrompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE']
        },
      });

      // Handle response exactly like in gemini-image-tool.js
      if (result && result.candidates && result.candidates.length > 0 && result.candidates[0]?.content?.parts) {
        for (const part of result.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.mimeType?.startsWith("image/") && part.inlineData.data) {
            const imageData = Buffer.from(part.inlineData.data, "base64");
            const imageBuffer = imageData.buffer;
            return { publicUrl: '', storagePath: '', imageBuffer };
          }
        }
      }
      
      throw new Error("No image found in response");
    }
    
  } catch (error) {
    console.error('Google GenAI generation error:', error);
    throw new Error(`Google GenAI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('\n📝 [POST /api/media/generate]');

    // 1. Token Verification Layer
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ Missing or invalid auth header');
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
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
    const { data: profile, error: profileError } = await authClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      console.log('❌ User is not admin:', profileError?.message);
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // 4. Create service role client for database operations (bypasses RLS)
    console.log('🔑 Creating service role client...');
    const supabase = await createClient(undefined, true); // Service role client bypasses RLS

    // 5. Parse request body
    const { prompt, model, style, size } = await request.json();

    if (!prompt || !model) {
      return NextResponse.json(
        { error: 'Prompt and model are required' },
        { status: 400 }
      );
    }

    let imageBuffer: ArrayBuffer;
    let metadata: any = {
      model,
      prompt,
      style,
      size,
      generated_at: new Date().toISOString()
    };

    if (model === 'gpt-image-1') {
      const result = await generateWithOpenAI({ prompt, model, style, size });
      imageBuffer = result.imageBuffer;
    } else if (model === 'imagen-3.0' || model === 'imagen-4.0') {
      const result = await generateWithGoogleGenAI({ prompt, model, style, size });
      imageBuffer = result.imageBuffer;
    } else {
      return NextResponse.json(
        { error: 'Unsupported model' },
        { status: 400 }
      );
    }

    // 6. Upload image to Supabase Storage
    console.log('☁️ Uploading image to Supabase Storage...');
    const filename = `${uuidv4()}.png`;
    const { publicUrl, storagePath } = await uploadImageToStorage(
      supabase,
      imageBuffer,
      filename,
      'image/png'
    );

    console.log('✅ Image uploaded to storage:', publicUrl);

    // 7. Calculate dimensions based on size parameter
    let width = 1024;
    let height = 1024;
    if (size === '1024x1792') {
      width = 1024;
      height = 1792;
    } else if (size === '1792x1024') {
      width = 1792;
      height = 1024;
    }

    const mediaData = {
      id: uuidv4(),
      filename: filename,
      file_size: imageBuffer.byteLength,
      mime_type: 'image/png',
      width,
      height,
      alt_text: prompt.substring(0, 255),
      original_url: publicUrl,
      storage_path: storagePath,
      user_id: user.id,
      is_generated: true,
      generation_prompt: prompt,
      generation_style: style,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        model,
        prompt,
        style,
        size,
        generated_at: new Date().toISOString(),
        brand_enhanced: true,
        ...(model.startsWith('imagen') && {
          google_model_id: model,
          aspect_ratio: size === '1024x1792' ? '9:16' : size === '1792x1024' ? '16:9' : '1:1',
        }),
        ...(model === 'gpt-image-1' && {
          openai_model_id: 'gpt-image-1',
        })
      }
    };

    // 8. Save to database using service role client
    console.log('📊 Saving media to database...');
    const { data: savedMedia, error: saveError } = await supabase
      .from('media_assets')
      .insert(mediaData)
      .select()
      .single();

    if (saveError) {
      console.error('❌ Error saving media to database:', saveError);
      return NextResponse.json(
        { error: 'Failed to save media to database' },
        { status: 500 }
      );
    }

    console.log('✅ Media generation completed successfully');
    return NextResponse.json({
      success: true,
      data: savedMedia,
      url: publicUrl
    });

  } catch (error) {
    console.error('❌ Media generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate media' },
      { status: 500 }
    );
  }
} 