# Content Management System (CMS) Subsystem

## Overview

The Content Management System subsystem provides comprehensive content creation, editing, and management capabilities. It includes a powerful blog system with multi-language support, a media library for images and videos, rich text editing with AI assistance, and dynamic content scheduling. The CMS is designed to be user-friendly while offering advanced features like AI-powered content generation, SEO optimization, and real-time collaboration.

This subsystem serves as the content backbone of the application, enabling content creators to efficiently produce, manage, and publish various types of content while maintaining consistency across multiple languages and ensuring optimal performance through intelligent media handling.

## Key Components

### Blog System (`app/[locale]/blog/` & `app/[locale]/admin/blog/`)
- **PostEditor.tsx**: Rich text editor with AI assistance
- **RichTextEditor.tsx**: TipTap-based WYSIWYG editor
- **BlogContent.tsx**: Blog post renderer with formatting
- **PostList.tsx**: Admin blog post management interface

### Media Management (`app/[locale]/admin/media/`)
- **MediaDashboard.tsx**: Central media library interface
- **MediaGrid.tsx**: Visual media browser with filters
- **UploadZone.tsx**: Drag-and-drop file uploads
- **ImageGenerationModal.tsx**: AI image generation interface
- **VideoGenerationModal.tsx**: AI video creation tools

### Content Components (`components/blog/`)
- **ResearchPanel.tsx**: AI-powered research assistant
- **MediaSelector.tsx**: Media picker for content
- **SEOKeywordsSelector.tsx**: SEO keyword integration
- **FloatingNav.tsx**: Article navigation
- **Comments.tsx**: User comment system

### API Endpoints
- **app/api/blog/route.ts**: Blog CRUD operations
- **app/api/media/**: Media upload and management
- **app/api/ai/generate-content/**: AI content generation

## Dependencies

### External Dependencies
- `@tiptap/react`: Rich text editor framework
- `react-dropzone`: File upload handling
- `sharp`: Image optimization
- AI Services: Gemini, OpenAI, Replicate

### Internal Dependencies
- Database Layer: Content storage
- AI Integration: Content generation
- Media Storage: Supabase Storage
- SEO subsystem: Keyword optimization

## Entry Points

### Content Creation
1. **Blog Editor**: `/[locale]/admin/blog` - Create and edit posts
2. **Media Library**: `/[locale]/admin/media` - Manage media assets
3. **Content Generator**: `/[locale]/admin/content-generator` - AI content tools

### Public Access
1. **Blog Listing**: `/[locale]/blog` - Public blog page
2. **Blog Posts**: `/[locale]/blog/[slug]` - Individual articles
3. **Media Serving**: Direct media URLs with CDN

## Data Flow

### Content Creation Flow
1. Author creates content in rich text editor
2. AI assists with writing and research
3. Media assets uploaded and optimized
4. SEO keywords selected and integrated
5. Content saved with version history
6. Multi-language versions generated
7. Content published or scheduled

### Media Processing Flow
1. User uploads media files
2. Images automatically optimized (WebP conversion)
3. Thumbnails generated for gallery view
4. AI-generated alt text and descriptions
5. Media stored in Supabase Storage
6. CDN URLs generated for serving

### Publishing Flow
1. Content reviewed in preview mode
2. Publishing status updated
3. Scheduled posts handled by cron
4. Cache invalidation triggered
5. SEO metadata updated
6. Social media previews generated

## Key Patterns

### Rich Text Editor Integration
```typescript
const editor = useEditor({
  extensions: [
    StarterKit,
    Image,
    Link,
    Placeholder.configure({
      placeholder: 'Start writing...'
    })
  ],
  content: initialContent
});
```

### AI Content Generation
```typescript
// Generate content with AI
const response = await fetch('/api/ai/generate-content', {
  method: 'POST',
  body: JSON.stringify({
    prompt,
    contentType,
    persona
  })
});
```

### Media Upload Pattern
```typescript
const onDrop = useCallback(async (files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  
  await fetch('/api/media/upload', {
    method: 'POST',
    body: formData
  });
}, []);
```

## File Inventory

### Blog Components
- `components/blog/PostEditor.tsx` - Main blog editor component
- `components/blog/RichTextEditor.tsx` - Rich text editing
- `components/blog/RichTextEditorWrapper.tsx` - Editor wrapper
- `components/blog/BlogContent.tsx` - Blog post renderer
- `components/blog/MediaSelector.tsx` - Media selection tool
- `components/blog/ResearchPanel.tsx` - AI research panel
- `components/blog/SEOKeywordsSelector.tsx` - SEO integration
- `components/blog/FloatingNav.tsx` - Article navigation
- `components/blog/Comments.tsx` - Comment system
- `components/blog/CommentForm.tsx` - Comment submission

### Media Components
- `app/[locale]/admin/media/MediaDashboard.tsx` - Media library UI
- `app/[locale]/admin/media/MediaGrid.tsx` - Media grid view
- `app/[locale]/admin/media/MediaDetails.tsx` - Media details panel
- `app/[locale]/admin/media/MediaDetailModal.tsx` - Detail modal
- `app/[locale]/admin/media/UploadZone.tsx` - Upload interface
- `app/[locale]/admin/media/SearchFilter.tsx` - Media search
- `app/[locale]/admin/media/ImageGenerationModal.tsx` - AI images
- `app/[locale]/admin/media/VideoGenerationModal.tsx` - AI videos
- `app/[locale]/admin/media/MagicEditModal.tsx` - Image editing

### Page Routes
- `app/[locale]/blog/page.tsx` - Blog listing page
- `app/[locale]/blog/[slug]/page.tsx` - Blog post page
- `app/[locale]/admin/blog/page.tsx` - Blog admin page
- `app/[locale]/admin/media/page.tsx` - Media library page
- `app/[locale]/admin/cms/page.tsx` - CMS dashboard
- `app/[locale]/admin/content-generator/page.tsx` - AI content tools

### API Routes
- `app/api/blog/route.ts` - Blog CRUD operations
- `app/api/blog/similar/route.ts` - Similar posts API
- `app/api/blog/translate/route.ts` - Translation API
- `app/api/blog-image/route.ts` - Blog image handling
- `app/api/media/upload/route.ts` - Media upload
- `app/api/media/delete/route.ts` - Media deletion
- `app/api/media/edit/route.ts` - Media editing
- `app/api/media/generate/route.ts` - AI media generation
- `app/api/ai/generate-content/route.ts` - Content generation

### Supporting Files
- `types/media.ts` - Media type definitions
- `app/types/media.ts` - Additional media types
- `components/media-selector/` - Media selector module
- `scripts/seed-blog.ts` - Blog seeding script
- `scripts/update-blog-images.ts` - Image update utility

### Test Files
- `__tests__/components/blog/PostEditor.test.tsx`
- `__tests__/components/blog/RichTextEditor.test.tsx`
- `__tests__/components/media/MediaDashboard.test.tsx`
- `cypress/e2e/blog.cy.ts` - Blog E2E tests
- `cypress/e2e/media.cy.ts` - Media E2E tests