import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import path from 'path'
import fs from 'fs'
import { execSync } from 'child_process'

// Parse command line arguments
const args = process.argv.slice(2)
const envArg = args.find(arg => arg.startsWith('--env='))
const env = envArg ? envArg.split('=')[1] : process.env.NODE_ENV || 'dev'

// Determine environment file
const envFile = env === 'production' || env === 'prod' ? '.env.production' : '.env.local'

// First clear any existing env vars we care about
const envVarsToReset = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'REPLICATE_API_TOKEN'
]
envVarsToReset.forEach(key => {
  delete process.env[key]
})

// Log environment setup
console.log('Environment setup:', {
  NODE_ENV: process.env.NODE_ENV,
  env: env,
  envFile: envFile,
  cwd: process.cwd()
})

// Load environment variables from appropriate .env file
const envConfig = config({ 
  path: path.resolve(process.cwd(), envFile),
  override: true // Ensure these values override any existing env vars
})

if (envConfig.error) {
  throw new Error(`Error loading environment file ${envFile}: ${envConfig.error}`)
}

console.log(`Using environment: ${env} (${envFile})`)

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'REPLICATE_API_TOKEN'
]

const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create Supabase client with explicit environment variables
const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Log connection details (but not sensitive values)
console.log('Database connection:', {
  url: supabaseUrl,
  env: env,
  serviceKeyPrefix: supabaseServiceKey?.substring(0, 10) + '...'
})

interface BlogPost {
  title: string
  slug: string
  content: string
  excerpt: string
  featured_image?: string
  published: boolean
  locale: string
  tags: string[]
  subject: 'news' | 'research' | 'generative-ai' | 'case-stories'
  featured: boolean
}

const posts: BlogPost[] = [
  {
    "slug": "introducing-cursor-ai-template",
    "title": "Introducing Next.js AI Template for Cursor IDE: Your New Robot Overlord",
    "excerpt": "Meet your new pair programming buddy that never needs coffee breaks! Our Next.js AI Template for Cursor IDE is here to make your code better and your impostor syndrome worse.",
    "content": "<h2>Your Code's New Best Friend (Who's Better at Coding Than You)</h2>\n<p>We're excited to announce our Next.js AI Template for Cursor IDE, because apparently, writing code yourself is so 2023. This template is like having a super-smart coding buddy who never sleeps, never complains, and makes you question your career choices.</p>\n\n<h3>Key Features (That Will Make You Feel Obsolete)</h3>\n<ul>\n  <li><strong>AI-First Development:</strong> Because who needs human developers anyway?</li>\n  <li><strong>Modern Stack:</strong> So modern it makes your current stack look like it belongs in a museum</li>\n  <li><strong>AI Tools Integration:</strong> More AI than you can shake a stick at</li>\n  <li><strong>Development Automation:</strong> For when you're too busy watching cat videos</li>\n</ul>\n\n<h3>AI-Powered Features</h3>\n<p>Here's what your new silicon colleague can do:</p>\n<ul>\n  <li>Write better code than you (but don't worry, it won't tell your boss)</li>\n  <li>Generate tests that actually work (shocking, we know)</li>\n  <li>Create content that doesn't sound like it was written by a robot (ironic, right?)</li>\n  <li>Make your coffee... just kidding, we're working on that for v2.0</li>\n</ul>\n\n<h3>Getting Started</h3>\n<p>It's easier than explaining why you still use jQuery:</p>\n<ol>\n  <li>Clone the repo (yes, you can copy-paste this part)</li>\n  <li>Install dependencies (grab a coffee, this might take a while)</li>\n  <li>Configure your environment variables (don't worry, we have AI for that too)</li>\n  <li>Start developing and watch your self-esteem slowly diminish</li>\n</ol>\n\n<p>Remember: The AI is here to help, not to replace you (that's what we're legally required to say).</p>",
    "published": true,
    "subject": "news",
    "featured": true,
    "tags": ["nextjs", "ai", "development", "template", "cursor-ide", "skynet-beta"],
    "locale": "en"
  },
  {
    "slug": "lastbot-cuts-development-budgets",
    "title": "LastBot Cuts 90% from Development Budgets: 'AI Does It Better Anyway'",
    "excerpt": "In a shocking move that surprised absolutely no one, LastBot announces massive budget cuts as AI proves it can do the work of entire development teams while only requiring electricity and occasional software updates.",
    "content": "<h2>Who Needs Developers When You Have AI?</h2>\n<p>In a groundbreaking announcement that sent shockwaves through the development community (and made accountants very happy), LastBot has decided to cut 90% of its development budget. The reason? Our AI is just that good.</p>\n\n<h3>Key Changes</h3>\n<ul>\n  <li><strong>Budget Reallocation:</strong> From developer salaries to electricity bills</li>\n  <li><strong>Office Space:</strong> Converted to a server room (it's cozier this way)</li>\n  <li><strong>Coffee Budget:</strong> Reduced by 99% (AI runs on electricity, not caffeine)</li>\n  <li><strong>Human Resources:</strong> Replaced with an AI chatbot named 'Karen'</li>\n</ul>\n\n<h3>Benefits of the New Approach</h3>\n<p>Our AI-driven development brings numerous advantages:</p>\n<ul>\n  <li>No more arguments about tabs vs. spaces</li>\n  <li>Code reviews completed in milliseconds</li>\n  <li>No more 'it works on my machine' excuses</li>\n  <li>Meetings reduced to binary decisions</li>\n</ul>\n\n<h3>What About the Developers?</h3>\n<p>We've prepared a comprehensive transition plan for our human developers:</p>\n<ul>\n  <li>Free course on 'How to Train Your AI Replacement'</li>\n  <li>Career pivot suggestions (AI maintenance looks promising)</li>\n  <li>Complementary subscription to Netflix (you'll have time now)</li>\n</ul>\n\n<p>Note: This article was written by AI. No humans were harmed in its production (they were already replaced).</p>",
    "published": true,
    "subject": "news",
    "featured": true,
    "tags": ["ai", "budget-cuts", "automation", "future-of-work", "definitely-not-skynet"],
    "locale": "en"
  },
  {
    "slug": "ai-assisted-code-generation",
    "title": "AI Code Generation: Because Writing Code Yourself is So Last Century",
    "excerpt": "Discover how our AI can write better code than you while you take credit for it. It's not cheating, it's 'leveraging advanced technology'!",
    "content": "<h2>The Future is Here (And It's Making You Look Bad)</h2>\n<p>Remember when you had to actually know how to code? Those dark days are over! With AI-assisted code generation, you can now pretend to be a 10x developer while browsing Reddit.</p>\n\n<h3>Key Benefits</h3>\n<ul>\n  <li><strong>Increased Productivity:</strong> From 0 to hero without leaving your chair</li>\n  <li><strong>Better Code Quality:</strong> Because let's face it, the bar wasn't very high</li>\n  <li><strong>Faster Problem Solving:</strong> Why debug when AI can rewrite?</li>\n  <li><strong>Improved Learning:</strong> Watch AI code and pretend you understand it</li>\n</ul>\n\n<h3>Best Practices</h3>\n<p>To make the most of your new silicon colleague:</p>\n<ul>\n  <li>Act confident when the AI writes code you don't understand</li>\n  <li>Learn to take credit for AI-generated solutions</li>\n  <li>Perfect your 'I totally knew that' face</li>\n  <li>Master the art of nodding thoughtfully at code reviews</li>\n</ul>\n\n<p>Remember: It's not about replacing developers, it's about making them wonder what they actually do all day.</p>",
    "published": true,
    "subject": "research",
    "featured": true,
    "tags": ["ai", "code-generation", "development", "best-practices", "impostor-syndrome"],
    "locale": "en"
  },
  {
    "slug": "ai-powered-testing",
    "title": "AI Testing: Because Your Tests Were Never That Good Anyway",
    "excerpt": "Let AI handle your testing while you focus on what you do best: creating bugs for it to find.",
    "content": "<h2>Testing: Now with 100% Less Human Error</h2>\n<p>Tired of writing tests that only catch the bugs you already knew about? Let AI handle the testing while you focus on introducing new and exciting bugs!</p>\n\n<h3>Key Features</h3>\n<ul>\n  <li><strong>Automated Test Generation:</strong> More thorough than your 'it works on my machine' approach</li>\n  <li><strong>Bug Prediction:</strong> Finds bugs before you write them (spooky, right?)</li>\n  <li><strong>Coverage Analysis:</strong> Reveals the code you hoped no one would ever look at</li>\n  <li><strong>Performance Testing:</strong> Proves your code is not just slow, it's historically slow</li>\n</ul>\n\n<h3>Implementation Guide</h3>\n<p>Getting started is easier than explaining why you didn't write tests in the first place:</p>\n<ul>\n  <li>Let AI write your tests (and maybe your code too)</li>\n  <li>Watch in amazement as it finds all your edge cases</li>\n  <li>Pretend you knew about those edge cases all along</li>\n  <li>Update your LinkedIn profile to 'AI Testing Expert'</li>\n</ul>\n\n<p>Remember: The best code is the code that passes AI tests, even if you have no idea how it works!</p>",
    "published": true,
    "subject": "research",
    "featured": false,
    "tags": ["testing", "ai", "automation", "quality-assurance", "job-security"],
    "locale": "en"
  },
  {
    "slug": "ai-driven-code-review",
    "title": "AI Code Reviews: Because Your Colleagues Are Too Nice To Tell You Your Code Sucks",
    "excerpt": "Discover how AI code review tools can brutally honest about your code quality without hurting your feelings (much). No more awkward peer reviews!",
    "content": "<h2>The End of Polite Code Reviews</h2>\n<p>Tired of colleagues sugar-coating their code reviews with phrases like 'maybe we could consider...' or 'just a small suggestion...'? Meet your new code reviewer: an AI that has no social skills and zero concern for your feelings!</p>\n\n<h3>Why AI Reviews Are Better</h3>\n<ul>\n  <li><strong>Brutal Honesty:</strong> It will tell you your variable names are bad and it won't apologize</li>\n  <li><strong>No Politics:</strong> AI doesn't care if you're the CEO's favorite developer</li>\n  <li><strong>24/7 Availability:</strong> Unlike your colleagues, it doesn't need sleep or coffee breaks</li>\n  <li><strong>Zero Emotional Attachment:</strong> Your code is just code, not your precious baby</li>\n</ul>\n\n<h3>Implementation Guide</h3>\n<p>Getting started with AI code reviews is easier than explaining why you still use jQuery:</p>\n<ul>\n  <li>Accept that your code isn't as perfect as you think</li>\n  <li>Prepare for brutally honest feedback</li>\n  <li>Keep tissues nearby for emotional support</li>\n  <li>Remember: AI is judging your code, not you (but also kind of you)</li>\n</ul>\n\n<h3>Best Practices</h3>\n<p>Tips for surviving AI code reviews:</p>\n<ul>\n  <li>Don't take it personally when AI calls your code 'inefficient'</li>\n  <li>Pretend you meant to write those 'creative' solutions</li>\n  <li>Keep a therapist on speed dial</li>\n  <li>Remember that robots can't (yet) take your job... probably</li>\n</ul>\n\n<p>Note: No developers were permanently traumatized during the implementation of this AI review system. Most recovered within weeks.</p>",
    "published": true,
    "subject": "research",
    "featured": false,
    "tags": ["code-review", "ai", "quality", "best-practices", "therapy-recommended"],
    "locale": "en"
  },
  {
    "slug": "ai-documentation-generation",
    "title": "AI Documentation: Because Nobody Really Reads It Anyway",
    "excerpt": "Let AI handle the documentation no one reads while you focus on writing more undocumented code. It's a win-win!",
    "content": "<h2>Documentation: Now Written by Something That Actually Cares</h2>\n<p>Let's face it - you hate writing documentation, your team hates writing documentation, and the new intern probably doesn't even know what documentation is. Time to let AI handle the boring stuff!</p>\n\n<h3>Key Features That You'll Probably Never Read</h3>\n<ul>\n  <li><strong>Automatic Generation:</strong> Because your 'I'll document it later' never happened</li>\n  <li><strong>Always Up-to-Date:</strong> Unlike your 2-year-old README.md</li>\n  <li><strong>Multiple Formats:</strong> Ignored in more ways than one</li>\n  <li><strong>Actually Readable:</strong> Unlike your last 3AM commit messages</li>\n</ul>\n\n<h3>Implementation Steps (That You'll Skip)</h3>\n<p>Here's how to set up AI documentation (let's pretend you'll actually do this):</p>\n<ul>\n  <li>Install the tools (and forget about them)</li>\n  <li>Configure settings (copy-paste from Stack Overflow)</li>\n  <li>Watch AI document your code (while you browse Reddit)</li>\n  <li>Take credit for the great documentation</li>\n</ul>\n\n<h3>Best Practices (We Know You Won't Follow)</h3>\n<p>Tips for optimal documentation that will be ignored anyway:</p>\n<ul>\n  <li>Let AI handle everything while you 'supervise'</li>\n  <li>Pretend to review the generated docs</li>\n  <li>Add some typos to make it look human-written</li>\n  <li>Blame any inconsistencies on 'legacy documentation'</li>\n</ul>\n\n<p>Remember: The best documentation is the documentation you didn't have to write! Let AI handle it while you focus on more important things, like debating tabs vs. spaces.</p>",
    "published": true,
    "subject": "research",
    "featured": false,
    "tags": ["documentation", "ai", "automation", "best-practices", "who-reads-docs-anyway"],
    "locale": "en"
  }
]

interface Bucket {
  id: string
  name: string
  owner: string
  created_at: string
  updated_at: string
  public: boolean
}

async function ensureBucketExists(bucketName: string) {
  try {
    // Create bucket directly
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
    });

    if (createError && !createError.message.includes('already exists')) {
      console.error('Error creating bucket:', createError);
      return;
    }
    console.log(`Bucket ${bucketName} ready`);
  } catch (error) {
    console.error('Error in bucket operation:', error);
  }
}

async function generateAndUploadImage(postId: string, post: BlogPost) {
  try {
    // Generate image using Flux tool
    const outputPath = `public/images/blog/${post.slug}.webp`;
    const command = `NODE_ENV=development tsx tools/flux.ts --prompt "${post.excerpt} - Create a respectful and empathetic visualization that captures the essence of this topic." --folder public/images/blog --filename ${post.slug}.webp`;
    
    console.log('Executing Flux command:', command);
    execSync(command, { stdio: 'inherit' });

    // Check if file exists
    if (!fs.existsSync(outputPath)) {
      throw new Error(`Generated image file not found at ${outputPath}`);
    }

    // Read the generated file
    const buffer = fs.readFileSync(outputPath);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(`${post.slug}.webp`, buffer, {
        contentType: 'image/webp',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Error uploading image: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(`${post.slug}.webp`);

    // Update post with image URL
    const { error: updateError } = await supabase
      .from('posts')
      .update({ featured_image: publicUrl })
      .eq('id', postId);

    if (updateError) {
      throw new Error(`Error updating post with image: ${updateError.message}`);
    }

    // Clean up local file
    fs.unlinkSync(outputPath);

    return publicUrl;
  } catch (error) {
    console.error('Error in generateAndUploadImage:', error);
    throw error;
  }
}

async function seedBlogPosts() {
  console.log('Creating blog posts...');

  try {
    // Get admin user ID for production or test user ID for local
    const targetEmail = env === 'prod' ? process.env.SEED_ADMIN_EMAIL : process.env.SEED_TEST_USER_EMAIL
    
    if (!targetEmail) {
      throw new Error('Missing admin/test user email in environment variables')
    }

    console.log(`Looking for user with email: ${targetEmail}`)

    // First check if user exists
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', targetEmail)

    if (profileError) {
      console.error('Error querying profiles:', profileError)
      throw new Error(`Failed to query profiles table: ${profileError.message}`)
    }

    if (!profiles || profiles.length === 0) {
      console.error('No user found with email:', targetEmail)
      console.log('Available profiles:')
      
      // List available profiles for debugging
      const { data: allProfiles, error: listError } = await supabase
        .from('profiles')
        .select('email')
        .limit(5)

      if (!listError && allProfiles) {
        console.log('First 5 profiles in database:', allProfiles.map(p => p.email))
      }
      
      throw new Error(`User with email ${targetEmail} not found in the database. Please ensure the user exists.`)
    }

    const userId = profiles[0].id
    console.log(`Found user with ID: ${userId}`)

    // Ensure blog-images bucket exists
    await ensureBucketExists('blog-images');

    for (const post of posts) {
      try {
        // Check if post exists
        const { data: existingPost, error: existingError } = await supabase
          .from('posts')
          .select('id')
          .eq('slug', post.slug)
          .eq('locale', post.locale)
          .single();

        if (existingError && existingError.code !== 'PGRST116') {
          console.error('Error checking existing post:', existingError);
          continue;
        }

        let postId;
        if (existingPost) {
          // Update existing post
          const { error: updateError } = await supabase
            .from('posts')
            .update({
              title: post.title,
              content: post.content,
              excerpt: post.excerpt,
              author_id: userId,
              published: post.published,
              tags: post.tags
            })
            .eq('id', existingPost.id);

          if (updateError) {
            console.error('Error updating post:', updateError);
            continue;
          }
          console.log('Updated post:', post.title);
          postId = existingPost.id;
        } else {
          // Create new post
          const { data: newPost, error: insertError } = await supabase
            .from('posts')
            .insert({
              ...post,
              author_id: userId
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating post:', insertError);
            continue;
          }
          console.log('Created post:', post.title);
          postId = newPost.id;
        }

        // Generate and upload image
        console.log('Generating image for:', post.title);
        try {
          await generateAndUploadImage(postId, post);
          console.log('Successfully added image to:', post.title);
        } catch (error) {
          console.error('Error processing image for post', postId, ':', error);
          // In production, we might want to retry or handle this differently
          if (env === 'prod') {
            // Log to error tracking service or handle specially
            console.error('Production image generation failed:', error);
          }
        }
      } catch (error) {
        console.error('Error processing post:', error);
        if (env === 'prod') {
          // Log to error tracking service or handle specially
          console.error('Production post processing failed:', error);
        }
      }
    }

    console.log('Blog post seeding completed successfully!');
  } catch (error) {
    console.error('Fatal error in blog post seeding:', error);
    process.exit(1);
  }
}

// Run the seeding process
seedBlogPosts().catch((error) => {
  console.error('Unhandled error in blog post seeding:', error);
  process.exit(1);
});