# Tools Quick Reference for Claude Code

## How to Execute Tools

All tools are executed using the Bash tool with npm scripts:
```
Bash(command="npm run [tool-name] -- [options]")
```

## Most Used Tools

### 1. Database Reset & Seed
```bash
# Full reset with all data
npm run db:reset-and-seed:all
```

### 2. Translation Check
```bash
# Verify all translations are complete
npm run check-translations
```

### 3. AI Text Generation
```bash
# Generate content with Gemini
npm run gemini -- --prompt "Write a blog post about AI" --model gemini-2.5-pro-exp-03-25
```

### 4. Image Generation
```bash
# Generate image with Imagen 3
npm run gemini-image -- generate -p "Modern office space" -m imagen-3.0
```

### 5. Image Optimization
```bash
# Optimize for web
npm run optimize-image -- input.png output.webp --resize 1200x800 --format webp --quality 85
```

### 6. Deploy to Vercel
```bash
# Production deployment
npm run vercel -- --prod
```

### 7. Create GitHub PR
```bash
# Create pull request
npm run github -- pr-create --title "Feature: Add dashboard"
```

## Tool Categories Reference

| Category | Documentation | Common Use |
|----------|--------------|------------|
| Translations | `.claude/tools/translation-tools.md` | Manage i18n |
| Database | `.claude/tools/database-tools.md` | Schema & seeding |
| AI Generation | `.claude/tools/ai-tools.md` | Content creation |
| Media | `.claude/tools/media-tools.md` | Image processing |
| Deployment | `.claude/tools/deployment-tools.md` | Deploy & manage |

## Example Workflows

### Creating AI-Generated Blog Content
```bash
# 1. Generate article
npm run gemini -- --prompt "Write about sustainable tech" --json

# 2. Generate hero image
npm run gemini-image -- generate -p "Sustainable technology" -o hero.png

# 3. Optimize image
npm run optimize-image -- hero.png hero.webp --resize 1200x630

# 4. Seed to database
npm run seed:blog:local
```

### Preparing for Deployment
```bash
# 1. Check translations
npm run check-translations

# 2. Run tests
npm test

# 3. Build project
npm run build

# 4. Deploy preview
npm run vercel

# 5. Create PR
npm run github -- pr-create
```

## Important Notes

1. **Always include `--` between npm command and tool options**
2. **Check environment variables are set for AI tools**
3. **Use appropriate models for cost optimization**
4. **Test commands locally before production**
5. **Reference full documentation for advanced options**