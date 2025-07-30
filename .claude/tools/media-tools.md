# Media Processing Tools

## Overview
Tools for processing images, converting files, and handling media assets.

## Image Processing

### Image Optimization
Comprehensive image optimization with Sharp.

```bash
# Basic optimization
npm run optimize-image -- input.jpg output.jpg

# With resizing
npm run optimize-image -- photo.png thumbnail.png --resize 200x200

# Format conversion
npm run optimize-image -- image.png image.webp --format webp

# Quality adjustment
npm run optimize-image -- photo.jpg compressed.jpg --quality 70

# Remove background (AI-powered)
npm run optimize-image -- portrait.jpg transparent.png --remove-bg

# All options combined
npm run optimize-image -- input.png output.webp \
  --remove-bg \
  --resize 800x600 \
  --format webp \
  --quality 85
```

### Advanced Background Removal
Local background removal using color detection.

```bash
# Default tolerance
npm run remove-background-advanced -- --input photo.jpg --output transparent.png

# Custom tolerance (0-255)
npm run remove-background-advanced -- \
  --input product.jpg \
  --output product-transparent.png \
  --tolerance 50
```

## File Processing

### HTML to Markdown Conversion
Convert web pages to Markdown format.

```bash
# Basic conversion
npm run html-to-md -- --url "https://example.com/article"

# With custom output
npm run html-to-md -- \
  --url "https://docs.example.com" \
  --output "docs/converted.md"

# Target specific content
npm run html-to-md -- \
  --url "https://example.com" \
  --selector "main.content" \
  --output "content.md"
```

### File Download
Download files with progress tracking.

```bash
# Basic download
npm run download-file -- --url "https://example.com/file.pdf"

# Custom output location
npm run download-file -- \
  --url "https://example.com/image.jpg" \
  --folder "public/downloads" \
  --filename "custom-name.jpg"

# Download to specific path
npm run download-file -- \
  --url "https://example.com/doc.pdf" \
  --output "documents/report.pdf"
```

## Image Processing Workflows

### Product Image Pipeline
```bash
# 1. Download product image
npm run download-file -- \
  --url "https://supplier.com/product.jpg" \
  --output "raw/product.jpg"

# 2. Remove background
npm run optimize-image -- \
  raw/product.jpg \
  processed/product-transparent.png \
  --remove-bg

# 3. Create multiple sizes
npm run optimize-image -- \
  processed/product-transparent.png \
  public/images/product-thumb.webp \
  --resize 150x150 --format webp

npm run optimize-image -- \
  processed/product-transparent.png \
  public/images/product-full.webp \
  --resize 800x800 --format webp
```

### Blog Image Optimization
```bash
# 1. Optimize hero image
npm run optimize-image -- \
  uploads/blog-hero.png \
  public/blog/hero.webp \
  --resize 1200x630 \
  --format webp \
  --quality 85

# 2. Create social media versions
npm run optimize-image -- \
  uploads/blog-hero.png \
  public/blog/hero-twitter.jpg \
  --resize 1200x675 \
  --format jpeg \
  --quality 90

npm run optimize-image -- \
  uploads/blog-hero.png \
  public/blog/hero-og.jpg \
  --resize 1200x630 \
  --format jpeg \
  --quality 90
```

## Best Practices

### Image Optimization
1. **Choose the right format**:
   - WebP: Best for web, smaller files
   - JPEG: Photos with many colors
   - PNG: Images needing transparency

2. **Optimize dimensions**:
   - Don't serve larger than needed
   - Create responsive image sets
   - Consider retina displays (2x)

3. **Balance quality**:
   - 85-90: High quality, larger files
   - 70-85: Good quality, balanced
   - Below 70: Visible compression

### Background Removal
1. **AI-powered (Replicate)**:
   - Best for complex backgrounds
   - Handles hair, fur, transparency
   - Requires API key

2. **Color-based (local)**:
   - Fast, no API needed
   - Best for solid backgrounds
   - Adjust tolerance as needed

### File Downloads
1. **Error handling**:
   - Check network connectivity
   - Verify URL accessibility
   - Handle large files appropriately

2. **Organization**:
   - Use consistent folder structure
   - Name files descriptively
   - Clean up temporary files

## Common Issues

### Memory Errors
For large images:
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run optimize-image -- ...
```

### Format Support
Supported formats:
- Input: JPEG, PNG, WebP, GIF, SVG, TIFF
- Output: JPEG, PNG, WebP

### Quality Settings
- PNG: Lossless, no quality setting
- JPEG: 1-100 (higher is better)
- WebP: 1-100 (80-90 recommended)

## Performance Tips

1. **Batch Processing**:
   ```bash
   # Process multiple images
   for img in raw/*.jpg; do
     npm run optimize-image -- "$img" "processed/$(basename "$img" .jpg).webp" \
       --format webp --quality 85
   done
   ```

2. **Caching**:
   - Processed images are cached
   - Clear cache if needed
   - Use consistent settings

3. **Parallel Processing**:
   - Process independent images simultaneously
   - Monitor system resources
   - Adjust based on CPU/RAM