import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { join } from 'path'
import { writeFile } from 'fs/promises'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { prompt, style = 'digital_illustration', width = 1024, height = 1024, folder = 'public/images', filename } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'No prompt provided' },
        { status: 400 }
      )
    }

    // Call Recraft API
    const response = await fetch('https://api.recraft.ai/v2/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify({
        prompt,
        style,
        width,
        height,
        num_outputs: 1,
      }),
    })

    if (!response.ok) {
      throw new Error(`Recraft API error: ${await response.text()}`)
    }

    const { images } = await response.json()
    if (!images?.[0]) {
      throw new Error('No image generated')
    }

    // Download the image
    const imageResponse = await fetch(images[0])
    if (!imageResponse.ok) {
      throw new Error('Failed to download generated image')
    }

    const buffer = Buffer.from(await imageResponse.arrayBuffer())
    const finalFilename = filename || `${Date.now()}-${Math.random().toString(36).substring(7)}.png`
    const filePath = join(process.cwd(), folder, finalFilename)

    // Save locally first
    await writeFile(filePath, buffer)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('media')
      .upload(`generated/${finalFilename}`, buffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (error) {
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(`generated/${finalFilename}`)

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
} 