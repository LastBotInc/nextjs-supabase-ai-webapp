require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const Replicate = require('replicate');

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

interface Bucket {
  id: string;
  name: string;
  owner: string;
  created_at: string;
  updated_at: string;
  public: boolean;
}

export async function ensureBucketExists() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some((bucket: Bucket) => bucket.name === 'blog-images');

  if (!bucketExists) {
    console.log('Creating blog-images bucket...');
    const { error } = await supabase.storage.createBucket('blog-images', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (error) {
      console.error('Error creating bucket:', error);
      process.exit(1);
    }
    console.log('Bucket created successfully');
  }
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  locale: string;
}

export async function generateAndUploadImage(post: BlogPost): Promise<string | null> {
  try {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const outputPath = path.join(tempDir, `${post.id}.png`);

    // Generate image using Replicate API directly
    const output = await replicate.run(
      "recraft-ai/recraft-v3",
      {
        input: {
          prompt: post.excerpt,
          style: 'digital_illustration',
          width: 1024,
          height: 768,
          num_outputs: 1
        }
      }
    );

    // Get the image URL
    let imageUrl: string;
    if (Array.isArray(output)) {
      if (output.length === 0 || typeof output[0] !== 'string') {
        throw new Error('No image URL in output array');
      }
      imageUrl = output[0];
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else {
      throw new Error('Unexpected output format from Replicate');
    }

    if (!imageUrl.startsWith('http')) {
      throw new Error('Invalid image URL returned');
    }

    // Download the generated image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(imageBuffer));

    // Optimize the image
    execSync(`npm run optimize-image -- ${outputPath} ${outputPath} --resize 1024x768 --format webp --quality 90`);

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('blog-images')
      .upload(`posts/${post.id}.webp`, fs.readFileSync(outputPath), {
        contentType: 'image/webp',
        upsert: true
      });

    if (error) throw error;

    // Clean up temp file
    fs.unlinkSync(outputPath);

    // Return public URL
    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(`posts/${post.id}.webp`);

    return publicUrl;
  } catch (error) {
    console.error(`Error processing image for post ${post.id}:`, error);
    return null;
  }
}

export async function updateBlogImages() {
  await ensureBucketExists();

  // Get all blog posts
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, excerpt, locale');

  if (error) {
    console.error('Error fetching posts:', error);
    return;
  }

  for (const post of posts) {
    console.log(`Processing post: ${post.title}`);
    const imageUrl = await generateAndUploadImage(post);

    if (imageUrl) {
      // Update post with new image URL
      const { error: updateError } = await supabase
        .from('posts')
        .update({ featured_image: imageUrl })
        .eq('id', post.id);

      if (updateError) {
        console.error(`Error updating post ${post.id}:`, updateError);
      } else {
        console.log(`Successfully updated image for: ${post.title}`);
      }
    }
  }
}

// Run the update if this is the main module
if (require.main === module) {
  updateBlogImages().catch(console.error);
}
