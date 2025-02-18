import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { GenerationOptions } from '@/types/media';
import { v4 as uuidv4 } from 'uuid';
import Replicate from 'replicate';

// Function to get image size from URL
async function getImageMetadata(url: string): Promise<{ size: number }> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) throw new Error('Failed to fetch image metadata');
    
    const size = parseInt(response.headers.get('content-length') || '0', 10);
    if (!size) throw new Error('Could not determine file size');
    
    return { size };
  } catch (error) {
    console.error('Error fetching image metadata:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    // Get authorization token from request headers
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // Create regular client to verify the token
    console.log('🔑 Creating auth client...')
    const authClient = await createClient()
    
    // Verify token and get user
    console.log('🔑 Verifying auth token...')
    const { data: { user }, error: authError } = await authClient.auth.getUser(authHeader.split(' ')[1])
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', user.id)

    // Check if user is admin
    console.log('🔒 Checking admin status...')
    const { data: profile, error: profileError } = await authClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('❌ Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'Failed to verify permissions' },
        { status: 500 }
      )
    }

    if (!profile?.is_admin) {
      console.error('❌ User not admin:', user.id)
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    console.log('✅ Admin status verified')

    // After authentication, use service role client for database operations
    console.log('🔑 Creating service role client...')
    const supabase = await createClient(true)

    // Get generation options from request
    const options: GenerationOptions = await request.json();

    // Validate required fields
    if (!options.prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Check for REPLICATE_API_TOKEN
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error('Missing REPLICATE_API_TOKEN environment variable')
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      )
    }

    // Initialize Replicate client
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Run the model with error handling
    let output;
    try {
      output = await replicate.run(
        "recraft-ai/recraft-v3",
        {
          input: {
            prompt: options.prompt,
            style: options.style || 'digital_illustration',
            negative_prompt: options.negativePrompt,
            width: options.width || 1024,
            height: options.height || 1024,
            num_outputs: options.numOutputs || 1,
            seed: options.seed,
          }
        }
      );

      if (!output || (Array.isArray(output) && output.length === 0)) {
        console.error('Empty response from Replicate API')
        return NextResponse.json(
          { error: 'Failed to generate image - empty response' },
          { status: 500 }
        )
      }
    } catch (replicateError) {
      console.error('Replicate API error:', replicateError)
      return NextResponse.json(
        { error: replicateError instanceof Error ? replicateError.message : 'Failed to generate image' },
        { status: 500 }
      )
    }

    // Get metadata for all generated images
    const urls = Array.isArray(output) ? output : [output];
    const imagesWithMetadata = await Promise.all(
      urls.map(async (url: string) => {
        try {
          const { size } = await getImageMetadata(url);
          
          // Generate a filename from the prompt
          const sanitizedPrompt = options.prompt
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
            .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
            .substring(0, 50); // Limit length
          const timestamp = new Date().getTime();
          const filename = `${sanitizedPrompt}-${timestamp}.png`;

          return {
            id: uuidv4(),
            original_url: url,
            storage_path: null,
            file_size: size,
            mime_type: 'image/png',
            filename: filename,
            title: options.prompt,
            user_id: user.id,
            source: 'generated',
            metadata: {
              prompt: options.prompt,
              style: options.style,
              negative_prompt: options.negativePrompt,
              width: options.width,
              height: options.height,
              seed: options.seed,
              generator: 'recraft'
            }
          };
        } catch (error) {
          console.error('Error processing image:', error);
          throw error;
        }
      })
    );

    // Save generation results to database
    const { error: dbError } = await supabase
      .from('media_assets')
      .insert(imagesWithMetadata);

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: output });
  } catch (err) {
    console.error('Error generating image:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to generate image' },
      { status: 500 }
    );
  }
} 