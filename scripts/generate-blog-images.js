#!/usr/bin/env node

/**
 * Blog Post Image Generator
 * 
 * This script generates images for blog posts using the Google Imagen 3 API
 * through direct API calls instead of relying on the gemini-image-tool.js CLI.
 * 
 * It creates appropriate prompts based on blog post titles and content,
 * then generates and saves images to the expected paths.
 */

const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { config } = require('dotenv');

// Load environment variables
const envConfig = config({ 
  path: path.resolve(process.cwd(), '.env.local'),
  override: true
});

if (envConfig.error) {
  throw new Error(`Error loading environment file .env.local: ${envConfig.error}`);
}

// Validate required environment variables
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_STUDIO_KEY;
if (!apiKey) {
  throw new Error('Missing required environment variables: either GEMINI_API_KEY or GOOGLE_AI_STUDIO_KEY is required');
}

// Blog post data from seed-blog.ts
// We're extracting a simplified version of the posts array
const getBlogPosts = () => {
  // This is a simplified representation of the posts array from seed-blog.ts
  return [
    {
      "slug": "new-ford-transit-model-released",
      "title": "New Ford Transit Custom: The King of Delivery Vans",
      "locale": "en",
      "subject": "news",
      "tags": ["ford", "transit", "commercial vehicles", "vans", "fleet management"]
    },
    {
      "slug": "new-ford-transit-model-released-fi",
      "title": "Uusi Ford Transit Custom: Jakeluautojen Kuningas",
      "locale": "fi",
      "subject": "news",
      "tags": ["ford", "transit", "hyötyajoneuvot", "pakettiautot", "kalustonhallinta"]
    },
    {
      "slug": "new-ford-transit-model-released-sv",
      "title": "Nya Ford Transit Custom: Leveransbilarnas Kung",
      "locale": "sv",
      "subject": "news",
      "tags": ["ford", "transit", "kommersiella fordon", "skåpbilar", "fordonsflottehantering"]
    },
    {
      "slug": "luxury-sports-car-leasing-options",
      "title": "Experience Luxury: Premium Sports Car Leasing Now Available",
      "locale": "en",
      "subject": "news",
      "tags": ["luxury cars", "sports cars", "premium leasing", "corporate benefits", "executive leasing"]
    },
    {
      "slug": "luxury-sports-car-leasing-options-fi",
      "title": "Koe Luksusta: Premium Urheiluautojen Leasing Nyt Saatavilla",
      "locale": "fi",
      "subject": "news",
      "tags": ["luksusautot", "urheiluautot", "premium-leasing", "yritysedut", "johdon leasing"]
    },
    {
      "slug": "luxury-sports-car-leasing-options-sv",
      "title": "Upplev Lyx: Premium Sportbilsleasing Nu Tillgänglig",
      "locale": "sv",
      "subject": "news",
      "tags": ["lyxbilar", "sportbilar", "premiumleasing", "företagsförmåner", "chefleasing"]
    },
    {
      "slug": "electric-truck-leasing-program-launched",
      "title": "Leading the Charge: New Electric Truck Leasing Program",
      "locale": "en",
      "subject": "news",
      "tags": ["electric vehicles", "commercial trucks", "sustainable transport", "fleet electrification", "zero emissions"]
    },
    {
      "slug": "electric-truck-leasing-program-launched-fi",
      "title": "Johtavana Suunnannäyttäjänä: Uusi Sähkökuorma-autojen Leasingohjelma",
      "locale": "fi",
      "subject": "news",
      "tags": ["sähköajoneuvot", "hyötyajoneuvot", "kestävä liikenne", "kaluston sähköistäminen", "nollapäästöt"]
    },
    {
      "slug": "electric-truck-leasing-program-launched-sv",
      "title": "Ledande Laddningen: Nytt Leasingprogram för Ellastbilar",
      "locale": "sv",
      "subject": "news",
      "tags": ["elfordon", "kommersiella lastbilar", "hållbara transporter", "elektrifiering av fordonsflottor", "nollutsläpp"]
    },
    {
      "slug": "optimizing-fleet-leasing-strategy",
      "title": "Optimizing Your Fleet Leasing Strategy for Maximum ROI",
      "locale": "en",
      "subject": "research",
      "tags": ["fleet management", "leasing strategy", "roi", "cost savings", "vehicle leasing"]
    },
    {
      "slug": "navigating-ev-transition-leasing",
      "title": "Navigating the Transition to Electric Vehicles (EVs) with Leasing",
      "locale": "en",
      "subject": "research",
      "tags": ["electric vehicles", "ev transition", "fleet leasing", "sustainability", "tco"]
    },
    {
      "slug": "maintenance-leasing-explained",
      "title": "Understanding Maintenance Leasing: Hassle-Free Fleet Management",
      "locale": "en",
      "subject": "research",
      "tags": ["maintenance leasing", "full-service leasing", "fleet management", "cost predictability", "vehicle maintenance"]
    },
    {
      "slug": "finnish-company-streamlines-deliveries-innolease",
      "title": "Case Study: Finnish Logistics Company Streamlines Deliveries with Innolease Flexible Leasing",
      "locale": "en",
      "subject": "case-stories",
      "tags": ["case study", "flexible leasing", "logistics", "fleet optimization", "seasonal demand"]
    },
    {
      "slug": "optimizing-fleet-leasing-strategy-fi",
      "title": "Kaluston Leasing-strategian Optimointi Maksimaalisen ROI:n Saavuttamiseksi",
      "locale": "fi",
      "subject": "research",
      "tags": ["kalustonhallinta", "leasing-strategia", "roi", "kustannussäästöt", "ajoneuvoleasing"]
    },
    {
      "slug": "navigating-ev-transition-leasing-fi",
      "title": "Sähköautoihin Siirtyminen Leasingin Avulla",
      "locale": "fi",
      "subject": "research",
      "tags": ["sähköautot", "ev-siirtymä", "kalustoleasing", "kestävä kehitys", "tco"]
    },
    {
      "slug": "optimizing-fleet-leasing-strategy-sv",
      "title": "Optimera Din Vagnparks Leasingstrategi för Maximal ROI",
      "locale": "sv",
      "subject": "research",
      "tags": ["vagnparkshantering", "leasingstrategi", "roi", "kostnadsbesparingar", "fordonsleasing"]
    },
    {
      "slug": "navigating-ev-transition-leasing-sv",
      "title": "Navigera Övergången till Elfordon (EV) med Leasing",
      "locale": "sv",
      "subject": "research",
      "tags": ["elfordon", "ev-övergång", "flottleasing", "hållbarhet", "tco"]
    }
  ];
};

// Create the output directory if it doesn't exist
const outputDir = path.join(process.cwd(), 'public/images/blog');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created output directory: ${outputDir}`);
}

/**
 * Generate a prompt for the blog post image based on the post information
 * 
 * @param {Object} post - The blog post data
 * @returns {string} - A detailed prompt for the image generation
 */
function generatePrompt(post) {
  // Define subject-specific imagery details
  const subjectImagery = {
    'news': 'photorealistic news article featured image, professional business photography',
    'research': 'professional data visualization or infographic style, clean business look',
    'case-stories': 'storytelling business photograph showing success, professional corporate photography',
    'generative-ai': 'futuristic AI visualization, technology concept art',
  };

  // Combine tags for additional context
  const tagContext = post.tags.join(', ');
  
  // Get the appropriate subject imagery description
  const subjectStyle = subjectImagery[post.subject] || 'professional business photograph';
  
  // Create base prompt with title and style
  let prompt = `Create a professional business blog image for the article titled "${post.title}". `;
  
  // Add subject-specific styling
  prompt += `Style: ${subjectStyle}. `;
  
  // Add tag context
  prompt += `Content should visually represent: ${tagContext}. `;
  
  // Add final quality instructions
  prompt += `High quality, clean composition, professional business imagery suitable for corporate website.`;
  
  return prompt;
}

/**
 * Generate an image using the Imagen 3.0 API
 * 
 * @param {string} prompt - Text prompt describing the image to generate
 * @param {Object} options - Configuration options
 * @param {string} options.outputPath - Path to save the generated image
 * @param {string} options.aspectRatio - Aspect ratio (e.g., "16:9")
 * @param {number} options.numOutputs - Number of images to generate (1-4)
 * @returns {Promise<boolean>} - Whether the image generation was successful
 */
async function generateImageWithImagen3(prompt, options) {
  console.log('Generating image with imagen-3.0...');
  console.log(`Prompt: ${prompt}`);
  console.log(`Output path: ${options.outputPath}`);

  try {
    // Imagen 3 API endpoint
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
    
    // Prepare request body
    const requestBody = {
      instances: [
        {
          prompt: prompt
        }
      ],
      parameters: {
        sampleCount: options.numOutputs || 1,
        aspectRatio: options.aspectRatio || "16:9"
      }
    };
    
    // Make API request
    console.log(`Sending request to Imagen 3 API...`);
    const response = await axios.post(apiUrl, requestBody);
    
    // Handle response
    if (response.data && response.data.predictions && response.data.predictions.length > 0) {
      const prediction = response.data.predictions[0]; // Get first prediction
      
      if (prediction.bytesBase64Encoded) {
        // Save image
        fs.writeFileSync(options.outputPath, Buffer.from(prediction.bytesBase64Encoded, 'base64'));
        console.log(`✅ Image saved to: ${options.outputPath}`);
        return true;
      } else {
        console.error('No image data in API response');
        return false;
      }
    } else {
      console.error('Unexpected API response format:', response.data);
      return false;
    }
  } catch (error) {
    console.error('Error generating image:', error.message);
    if (error.response) {
      console.error('API error status:', error.response.status);
      console.error('API error data:', JSON.stringify(error.response.data || ''));
    }
    return false;
  }
}

/**
 * Generate an image for a blog post
 * 
 * @param {Object} post - The blog post data
 * @returns {Promise<boolean>} - Whether the image generation was successful
 */
async function generateImageForPost(post) {
  const prompt = generatePrompt(post);
  const outputFilename = `${post.slug}.webp`;
  const outputPath = path.join(outputDir, outputFilename);
  
  console.log(`\n===== Generating image for: ${post.title} =====`);
  console.log(`Slug: ${post.slug}`);
  console.log(`Prompt: ${prompt}`);
  console.log(`Output: ${outputFilename}`);
  
  try {
    // Generate the image using direct API call
    const success = await generateImageWithImagen3(prompt, {
      outputPath,
      aspectRatio: "16:9",
      numOutputs: 1
    });
    
    return success;
  } catch (error) {
    console.error(`❌ Error generating image for ${post.slug}:`, error.message);
    return false;
  }
}

/**
 * Main function to generate images for all blog posts
 */
async function main() {
  console.log('==============================');
  console.log('  BLOG POST IMAGE GENERATOR');
  console.log('==============================');
  console.log(`Output directory: ${outputDir}`);
  
  const posts = getBlogPosts();
  console.log(`Found ${posts.length} blog posts to process`);
  
  // Track results
  const results = {
    total: posts.length,
    success: 0,
    failed: 0,
    skipped: 0
  };
  
  // Create a list to store failed posts for retry
  const failedPosts = [];
  
  // Check for --retry flag
  const isRetry = process.argv.includes('--retry');
  
  // Process each post
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const outputPath = path.join(outputDir, `${post.slug}.webp`);
    
    // Skip if image exists and not in retry mode
    if (fs.existsSync(outputPath) && !isRetry) {
      console.log(`⏩ Skipping ${post.slug} - Image already exists`);
      results.skipped++;
      continue;
    }
    
    // Generate the image
    console.log(`\n[${i+1}/${posts.length}] Processing: ${post.slug}`);
    
    try {
      const success = await generateImageForPost(post);
      if (success) {
        results.success++;
      } else {
        results.failed++;
        failedPosts.push(post);
      }
    } catch (error) {
      console.error(`Error generating image for ${post.slug}:`, error);
      results.failed++;
      failedPosts.push(post);
    }
  }
  
  // Print summary
  console.log('\n==============================');
  console.log('           SUMMARY');
  console.log('==============================');
  console.log(`Total posts: ${results.total}`);
  console.log(`Successfully generated: ${results.success}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Skipped (already exist): ${results.skipped}`);
  
  // Print failed posts
  if (failedPosts.length > 0) {
    console.log('\nFailed posts:');
    failedPosts.forEach((post, index) => {
      console.log(`${index+1}. ${post.slug}`);
    });
    
    // Provide retry command
    console.log('\nTo retry failed posts, run:');
    console.log('node scripts/generate-blog-images.js --retry');
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 