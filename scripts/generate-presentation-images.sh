#!/bin/bash

# Create output directory
mkdir -p public/images/presentations

# Generate preview image
npm run flux -- \
  --prompt "A modern illustration showing digital transformation with AI, featuring connected nodes and flowing data streams in a minimalist style. Professional, high quality, detailed, clean design." \
  --folder public/images/presentations \
  --filename ai-transformation-preview.webp

# Generate AI Development image
npm run flux -- \
  --prompt "A developer working with AI assistance, showing code completion and generation in a futuristic interface. Professional, high quality, detailed, clean design." \
  --folder public/images/presentations \
  --filename ai-development.webp

# Generate AI Agents image
npm run flux -- \
  --prompt "Multiple AI agents working together in a network, showing autonomous decision making and collaboration. Professional, high quality, detailed, clean design." \
  --folder public/images/presentations \
  --filename ai-agents.webp

# Generate UX Transformation image
npm run flux -- \
  --prompt "A user interacting with an adaptive AI interface, showing personalized experiences and natural interactions. Professional, high quality, detailed, clean design." \
  --folder public/images/presentations \
  --filename ux-transformation.webp

# Generate Company Transformation image
npm run flux -- \
  --prompt "A modern company undergoing digital transformation, with AI integration across different departments. Professional, high quality, detailed, clean design." \
  --folder public/images/presentations \
  --filename company-transformation.webp

# Generate LastBot Solutions image
npm run flux -- \
  --prompt "LastBot's AI solutions helping companies transform, showing integration and innovation. Professional, high quality, detailed, clean design." \
  --folder public/images/presentations \
  --filename lastbot-solutions.webp

# Optimize all generated images
for img in public/images/presentations/*.webp; do
  npm run optimize-image -- "$img" "${img%.webp}-opt.webp" --quality 90
  mv "${img%.webp}-opt.webp" "$img"
done 