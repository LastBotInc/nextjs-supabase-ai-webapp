import { NextResponse } from 'next/server'
import Replicate from 'replicate'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

const REPLICATE_API_KEY = process.env.REPLICATE_API_TOKEN
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET_NAME = 'blog-images'

if (!REPLICATE_API_KEY) {
  throw new Error('REPLICATE_API_TOKEN is not set')
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Supabase environment variables are not set')
}

const replicate = new Replicate({
  auth: REPLICATE_API_KEY,
})

// Create Supabase client with service role key for admin operations
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: Request) {
  try {
    console.log('\n🖼️ [POST /api/blog-image] Admin AI image generation request')

    // 1. Token Verification Layer
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ Missing or invalid auth header')
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    console.log('🔑 Creating auth client...')
    // Create regular client to verify the token
    const authClient = await createServerClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser(authHeader.split(' ')[1])

    if (authError || !user) {
      console.error('❌ Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', user.id)

    // 2. Admin Role Verification Layer
    const { data: profile } = await authClient
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      console.error('❌ User is not admin:', user.id)
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    console.log('✅ Admin access verified for user:', user.id)

    const { prompt, slug, style = 'digital_illustration' } = await request.json()

    if (!prompt || !slug) {
      return NextResponse.json(
        { error: 'Prompt and slug are required' },
        { status: 400 }
      )
    }

    console.log('🎨 Generating image with Recraft...')

    // Generate image with Recraft
    const output = await replicate.run(
      "recraft-ai/recraft-v3",
      {
        input: {
          prompt,
          style,
          width: 1200,
          height: 630,
          num_outputs: 1,
        }
      }
    )

    // Convert output to array if it's a string
    const images = typeof output === 'string' ? [output] : output

    if (!images || !Array.isArray(images) || images.length === 0) {
      throw new Error('No images generated')
    }

    console.log('📥 Downloading and optimizing image...')

    // Download the image
    const imageUrl = images[0]
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())

    // Optimize image with Sharp
    const optimizedImage = await sharp(imageBuffer)
      .webp({ quality: 85 }) // Convert to WebP with good quality
      .resize(1200, 630, { 
        fit: 'cover',
        position: 'center'
      })
      .toBuffer()

    console.log('🗂️ Preparing storage bucket...')

    // Create bucket if it doesn't exist (using service role)
    const { data: buckets } = await supabaseAdmin
      .storage
      .listBuckets()

    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME)

    if (!bucketExists) {
      console.log('📁 Creating storage bucket...')
      const { error: createError } = await supabaseAdmin
        .storage
        .createBucket(BUCKET_NAME, {
          public: true,
          allowedMimeTypes: ['image/webp'],
          fileSizeLimit: 5242880 // 5MB
        })

      if (createError) throw createError
    }

    console.log('☁️ Uploading image to storage...')

    // Upload file (using service role)
    const fileName = `${slug}-${Date.now()}.webp`
    const { error: uploadError } = await supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .upload(fileName, optimizedImage, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)

    console.log('✅ Image generated and uploaded successfully:', publicUrl)

    return NextResponse.json({ url: publicUrl })
  } catch (error: Error | unknown) {
    console.error('❌ Image generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate and upload image'
    return NextResponse.json(
      { error: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error' },
      { status: 500 }
    )
  }
} 