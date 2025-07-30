# AI Generation Tools

## Overview
Comprehensive AI tools for text, image, and video generation using multiple providers.

## Text Generation

### Gemini Text Generation
```bash
# Basic text generation
npm run gemini -- --prompt "Explain quantum computing"

# With specific model
npm run gemini -- --prompt "Write a poem" --model gemini-2.5-pro-exp-03-25

# With temperature control
npm run gemini -- --prompt "Creative story" --temperature 0.9

# With grounded search (real-time info)
npm run gemini -- --prompt "Latest AI news" --ground --show-search-data

# Structured JSON output
npm run gemini -- --prompt "List recipes" --json recipes
npm run gemini -- --prompt "Create tasks" --json tasks --schema '{"type":"array"}'
```

### Document Analysis
```bash
# Analyze PDF from URL
npm run gemini -- --prompt "Summarize this document" --url "https://example.com/doc.pdf"

# Analyze local file
npm run gemini -- --prompt "Extract key points" --file "./documents/report.pdf"

# With specific MIME type
npm run gemini -- --prompt "Analyze content" --file "./data.txt" --mime-type text/plain
```

## Image Generation

### Gemini Image Generation
```bash
# Generate image with Gemini 2.0
npm run gemini-image -- generate -p "A futuristic city at sunset"

# Generate with Imagen 3.0
npm run gemini-image -- generate -p "Abstract art" -m imagen-3.0 --aspect-ratio 16:9

# Generate multiple images
npm run gemini-image -- generate -p "Nature scene" -m imagen-3.0 -n 4

# Edit existing image
npm run gemini-image -- edit -i input.jpg -p "Add a rainbow" -o edited.jpg
```

### OpenAI Image Generation
```bash
# Generate with GPT-image-1
npm run openai-image -- generate -p "Cyberpunk landscape" -m gpt-image-1

# Generate with DALL-E 3
npm run openai-image -- generate -p "Oil painting of mountains" -m dall-e-3 -q hd

# With custom size
npm run openai-image -- generate -p "Portrait" -s 1792x1024

# Edit image
npm run openai-image -- edit -i photo.jpg -p "Change background to beach"
```

## Video Generation

### Gemini Video (Veo)
```bash
# Text to video
npm run gemini-video -- generate -p "Cat playing with yarn" -m veo-2.0-generate-001

# Image to video
npm run gemini-video -- generate -p "Animate this scene" -i image.jpg --duration-seconds 8

# With options
npm run gemini-video -- generate -p "Action scene" --aspect-ratio 9:16 --number-of-videos 2
```

### Replicate Video Generation
```bash
# Basic video generation
npm run generate-video -- --prompt "Dancing robot" --model kling-1.6

# With OpenAI image generation first
npm run generate-video -- --image-prompt "Futuristic robot" \
  --openai-image-output public/images/robot.png \
  --prompt "Robot starts dancing" \
  --image public/images/robot.png

# Different models
npm run generate-video -- --prompt "Nature time-lapse" --model minimax --duration 5
```

## Media Processing

### Image Optimization
```bash
# Basic optimization
npm run optimize-image -- input.png output.webp

# With options
npm run optimize-image -- photo.jpg optimized.jpg \
  --resize 800x600 \
  --format webp \
  --quality 85

# Remove background
npm run optimize-image -- portrait.png transparent.png --remove-bg
```

### Advanced Background Removal
```bash
npm run remove-background-advanced -- \
  --input photo.jpg \
  --output no-bg.png \
  --tolerance 40
```

### File Download
```bash
# Download file
npm run download-file -- --url "https://example.com/image.jpg"

# With custom output
npm run download-file -- \
  --url "https://example.com/doc.pdf" \
  --folder downloads \
  --filename "report.pdf"
```

## AI Tool Best Practices

### 1. Prompt Engineering
- Be specific and descriptive
- Include style, mood, and details
- Use examples when helpful
- Iterate on prompts

### 2. Model Selection
- **Gemini 2.0**: Fast, versatile
- **Gemini 2.5 Pro**: Advanced reasoning
- **Imagen 3.0**: High-quality images
- **GPT-image-1**: Creative images
- **Veo**: Smooth video generation

### 3. Cost Optimization
- Use appropriate models for tasks
- Cache results when possible
- Batch similar requests
- Monitor API usage

### 4. Error Handling
- Check API key configuration
- Verify rate limits
- Handle timeout gracefully
- Log errors for debugging

## Common Workflows

### Blog Content Generation
```bash
# Generate article
npm run gemini -- --prompt "Write a 500-word article about sustainable technology" \
  --model gemini-2.5-pro-exp-03-25

# Generate hero image
npm run gemini-image -- generate -p "Sustainable technology illustration" \
  -m imagen-3.0 -o blog-hero.png

# Optimize image
npm run optimize-image -- blog-hero.png blog-hero-optimized.webp \
  --resize 1200x630 --quality 85
```

### Marketing Materials
```bash
# Generate product descriptions
npm run gemini -- --prompt "Write 5 product descriptions" --json products

# Create promotional images
npm run openai-image -- generate -p "Product showcase" -m gpt-image-1 -n 3

# Generate promo video
npm run gemini-video -- generate -p "Product in action" --duration-seconds 5
```

## Environment Setup

Required environment variables:
```bash
# Gemini
GOOGLE_AI_STUDIO_KEY=your_key
GEMINI_API_KEY=your_key

# OpenAI
OPENAI_API_KEY=your_key

# Replicate
REPLICATE_API_TOKEN=your_token
```