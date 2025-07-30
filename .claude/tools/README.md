# Project Tools Reference

This directory contains documentation for all project-specific command-line tools available via npm scripts.

## Tool Categories

### 🌐 Translations & Localization
- [translation-tools.md](./translation-tools.md) - Managing translations and localization

### 🌱 Database & Seeding
- [database-tools.md](./database-tools.md) - Database operations and data seeding

### 🤖 AI Generation Tools
- [ai-tools.md](./ai-tools.md) - AI content, image, and video generation

### 🖼️ Media Processing
- [media-tools.md](./media-tools.md) - Image and file processing utilities

### 🚀 Deployment & DevOps
- [deployment-tools.md](./deployment-tools.md) - Vercel and GitHub CLI tools

## Quick Reference

### Most Common Commands

```bash
# Development
npm run dev              # Start full dev environment
npm run build            # Production build

# Testing
npm test                 # Run unit tests
npm run cypress          # Run E2E tests

# Database
npm run db:reset-and-seed       # Reset DB + seed essentials
npm run db:reset-and-seed:all   # Reset DB + seed everything

# AI Generation
npm run gemini -- --prompt "Your prompt"     # Gemini text
npm run gemini-image -- generate -p "prompt" # Gemini images
npm run generate-video -- --prompt "prompt"   # Video generation

# Deployment
npm run vercel -- deploy --prod              # Deploy to production
npm run github -- pr-create                  # Create PR
```

## Tool Execution Pattern

All tools follow this pattern:
```bash
npm run [tool-name] -- [options]
```

The `--` is important - it separates npm arguments from tool arguments.

## Adding New Tools

To add a new tool:
1. Create the tool script in `tools/` directory
2. Add npm script in `package.json`
3. Document in appropriate category file
4. Update this README with common usage