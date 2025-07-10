import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { brandInfo } from '@/lib/brand-info';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Function to enhance edit prompt with brand style guide
function enhanceEditPromptWithBrandStyle(originalPrompt: string): string {
  // Keep the user's edit request as the primary focus
  // Add brand name and styling cues as visual guidance only
  const brandName = brandInfo.name;
  const primaryTrait = brandInfo.personality.primary[0].toLowerCase();
  const industryStyle = brandInfo.industry === 'eCommerce Technology & Migration Services' ? 'modern tech' : 'professional';
  const toneStyle = brandInfo.tone.innovative > 7 ? 'innovative' : 'clean';

  // Structure: User edit request first, then brand styling guidance
  const enhancedPrompt = `${originalPrompt}. Apply edits with ${brandName} brand aesthetic: ${primaryTrait}, ${industryStyle} ${toneStyle} style. Use brand colors: blue (#4A90E2) and coral (#FF6B6B) as accent colors. High quality, professional composition.`;

  return enhancedPrompt;
}

// Function to upload image buffer to Supabase Storage
async function uploadImageToStorage(
  supabase: any,
  imageBuffer: ArrayBuffer,
  filename: string,
  contentType: string = 'image/png'
): Promise<{ publicUrl: string; storagePath: string }> {
  // Generate unique storage path
  const storagePath = `edited/${Date.now()}-${filename}`;
  
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

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting image edit...');

    // 1. Get authorization token from request headers
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ Missing or invalid authorization header');
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
    const { assetId, editPrompt } = await request.json();

    if (!assetId || !editPrompt) {
      return NextResponse.json(
        { error: 'Asset ID and edit prompt are required' },
        { status: 400 }
      );
    }

    // 6. Get the original asset from database
    console.log('📄 Fetching original asset...');
    const { data: asset, error: assetError } = await supabase
      .from('media_assets')
      .select('*')
      .eq('id', assetId)
      .single();

    if (assetError || !asset) {
      console.log('❌ Asset not found:', assetError?.message);
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    // 7. Enhance edit prompt with brand style guide
    const enhancedPrompt = enhanceEditPromptWithBrandStyle(editPrompt);
    console.log('🎨 Enhanced edit prompt with brand styling');

    // 8. Download the original image to edit
    console.log('📥 Downloading original image for editing...');
    let originalImageBuffer: ArrayBuffer;
    
    if (asset.original_url.startsWith('http')) {
      // Handle absolute URL (including Supabase Storage URLs)
      const originalImageResponse = await fetch(asset.original_url);
      if (!originalImageResponse.ok) {
        throw new Error('Failed to download original image');
      }
      originalImageBuffer = await originalImageResponse.arrayBuffer();
    } else {
      // Handle relative path - this shouldn't happen with new storage system but keeping for backward compatibility
      throw new Error('Relative paths not supported for editing');
    }
    
    // Create a File object from the buffer (following openai-image-tool.js pattern)
    const imageFile = new File([originalImageBuffer], asset.filename, { 
      type: asset.mime_type || 'image/png' 
    });

    // 9. Edit image using OpenAI (following openai-image-tool.js pattern)
    console.log('🎨 Editing image with OpenAI GPT-1-image...');
    const editParams = {
      model: "gpt-image-1" as const,
      image: imageFile, // Pass the File object instead of URL
      prompt: enhancedPrompt,
      n: 1,
      size: "1024x1024" as const // OpenAI edit only supports specific sizes
    };

    const editResponse = await openai.images.edit(editParams);

    if (!editResponse.data || !editResponse.data[0]) {
      throw new Error('No edited image data returned from OpenAI');
    }

    const editedImageData = editResponse.data[0];
    
    let imageBuffer: ArrayBuffer;
    
    // Check if we got a URL or base64 data (following openai-image-tool.js pattern)
    if (editedImageData.url) {
      // Download from URL
      console.log('📥 Downloading edited image from URL...');
      const imageResponse = await fetch(editedImageData.url);
      if (!imageResponse.ok) {
        throw new Error('Failed to download edited image from URL');
      }
      imageBuffer = await imageResponse.arrayBuffer();
    } else if (editedImageData.b64_json) {
      // Use base64 data directly
      console.log('📥 Processing base64 image data...');
      imageBuffer = Buffer.from(editedImageData.b64_json, 'base64').buffer;
    } else {
      throw new Error('No image data (URL or base64) returned from OpenAI');
    }

    // 10. Upload the edited image to Supabase Storage
    console.log('☁️ Uploading edited image to Supabase Storage...');
    const filename = `edited_${uuidv4()}.png`;
    const { publicUrl, storagePath } = await uploadImageToStorage(
      supabase,
      imageBuffer,
      filename,
      'image/png'
    );

    console.log('✅ Edited image uploaded to storage:', publicUrl);

    // 11. Save edited image to database as new asset
    console.log('💾 Saving edited image to database...');
    const editedMediaData = {
      id: uuidv4(),
      filename: filename,
      file_size: imageBuffer.byteLength,
      mime_type: 'image/png',
      width: 1024,
      height: 1024,
      alt_text: `Edited: ${asset.alt_text || editPrompt}`.substring(0, 255),
      original_url: publicUrl,
      storage_path: storagePath,
      user_id: user.id,
      is_generated: true,
      generation_prompt: editPrompt, // Store original edit prompt for user reference
      generation_style: 'magic_edit',
      source: 'generated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      metadata: {
        model: 'gpt-image-1',
        edit_prompt: editPrompt, // Original edit prompt for user reference
        enhanced_prompt: enhancedPrompt, // Enhanced prompt with brand styling
        original_asset_id: assetId,
        brand_enhanced: true, // Flag to indicate brand styling was applied
        generated_at: new Date().toISOString(),
        openai_model_id: 'gpt-image-1',
        edit_type: 'magic_edit'
      }
    };

    const { data: savedMedia, error: saveError } = await supabase
      .from('media_assets')
      .insert(editedMediaData)
      .select()
      .single();

    if (saveError) {
      console.error('❌ Failed to save edited media to database:', saveError);
      return NextResponse.json(
        { error: 'Failed to save edited media to database', details: saveError },
        { status: 500 }
      );
    }

    console.log('✅ Edited media saved to database successfully');

    console.log('✅ Image edit completed successfully');
    return NextResponse.json({
      success: true,
      data: savedMedia,
      url: publicUrl
    });

  } catch (error) {
    console.error('❌ Error in image edit:', error);
    return NextResponse.json(
      { 
        error: 'Failed to edit image', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 