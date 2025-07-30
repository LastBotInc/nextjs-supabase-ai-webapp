# AI Integration Subsystem

## Overview

The AI Integration subsystem provides comprehensive artificial intelligence capabilities throughout the application. It integrates multiple AI providers including Google's Gemini, OpenAI, Replicate, and Tavily to offer text generation, image creation, video synthesis, web research, and content analysis. The subsystem is designed with a provider-agnostic architecture, allowing seamless switching between AI services while maintaining consistent interfaces.

This subsystem powers intelligent features across the application, from content generation and translation to image editing and personalized user experiences. It includes sophisticated prompt engineering, response streaming, and error handling to ensure reliable AI-powered functionality.

## Key Components

### AI Service Clients
- **lib/gemini.ts**: Google Gemini API integration
- **tools/gemini.ts**: Gemini CLI tool for text generation
- **tools/openai-image-tool.js**: OpenAI DALL-E integration
- **tools/recraft.ts**: Recraft V3 image generation
- **tools/flux.ts**: Flux image generation
- **tools/tavily-search.ts**: Tavily web search API

### AI-Powered Features
- **Content Generation**: Blog posts, marketing copy, personas
- **Image Generation**: Multiple models (Gemini, DALL-E, Flux, Recraft)
- **Video Generation**: Replicate-based video synthesis
- **Translation**: Multi-language content translation
- **Research**: Web search and content analysis
- **Embeddings**: Vector embeddings for semantic search

### API Endpoints (`app/api/ai/`)
- **generate-content/route.ts**: Text content generation
- **generate-calendar/route.ts**: Content calendar creation
- **generate-personas/route.ts**: AI persona generation
- **analyze-brand/route.ts**: Brand analysis
- **generate-questions/route.ts**: FAQ generation

### Supporting Tools
- **LastBot Widget**: AI chatbot integration
- **Research Panel**: In-editor AI assistance
- **Content Enhancer**: AI-powered content improvement

## Dependencies

### External Dependencies
- `@google/generative-ai`: Gemini API client
- `openai`: OpenAI API client
- `replicate`: Replicate API for models
- `@tavily/core`: Tavily search API
- Various AI model APIs

### Internal Dependencies
- CMS: Content generation integration
- Media Management: AI-generated images/videos
- SEO: AI-powered optimization
- Database: Storing AI-generated content

## Entry Points

### AI Generation APIs
1. **Text Generation**: `/api/ai/generate-content`
2. **Image Generation**: `/api/media/generate`
3. **Video Generation**: `/api/media/generate-video`
4. **Translation**: `/api/blog/translate`
5. **Research**: `/api/tavily-search`

### CLI Tools
1. **Gemini**: `npm run gemini`
2. **Image Generation**: `npm run gemini-image`
3. **Video Generation**: `npm run generate-video`
4. **Web Search**: `npm run tavily-search`

## Data Flow

### Content Generation Flow
1. User provides prompt and parameters
2. System selects appropriate AI model
3. Prompt enhanced with context/persona
4. Request sent to AI provider
5. Response streamed back to user
6. Content post-processed and formatted
7. Result saved to database

### Image Generation Flow
1. User describes desired image
2. Style and parameters selected
3. Request routed to chosen model
4. Image generated and returned
5. Automatic optimization applied
6. Image stored in media library
7. CDN URL provided to user

### AI-Assisted Editing Flow
1. User selects content for enhancement
2. AI analyzes current content
3. Suggestions generated based on context
4. User reviews and applies changes
5. Content updated with AI improvements

## Key Patterns

### Streaming Response Pattern
```typescript
const stream = await geminiModel.generateContentStream({
  contents: [{ role: 'user', parts: [{ text: prompt }] }],
});

for await (const chunk of stream.stream) {
  yield chunk.text();
}
```

### Multi-Model Abstraction
```typescript
interface AIProvider {
  generateText(prompt: string, options?: any): Promise<string>;
  generateImage(prompt: string, options?: any): Promise<Buffer>;
}

class GeminiProvider implements AIProvider { ... }
class OpenAIProvider implements AIProvider { ... }
```

### Prompt Engineering
```typescript
const enhancedPrompt = `
  Acting as ${persona.role}, ${persona.traits}.
  Context: ${context}
  Task: ${userPrompt}
  Style: ${style}
  Constraints: ${constraints}
`;
```

## File Inventory

### Core AI Libraries
- `lib/gemini.ts` - Gemini API client configuration
- `utils/embeddings.ts` - Text embedding utilities
- `lib/ai/` - AI provider abstractions

### CLI Tools
- `tools/gemini.ts` - Gemini text generation CLI
- `tools/gemini-image-tool.js` - Gemini image CLI
- `tools/gemini-video-tool.js` - Video generation CLI
- `tools/openai-image-tool.js` - OpenAI image CLI
- `tools/recraft.ts` - Recraft image generation
- `tools/flux.ts` - Flux image generation
- `tools/generate-video.ts` - Video generation tool
- `tools/tavily-search.ts` - Web search tool
- `tools/imagen.ts` - Google Imagen integration
- `tools/minimax-image.ts` - Minimax image model

### API Routes
- `app/api/ai/generate-content/route.ts` - Content generation
- `app/api/ai/generate-content-bulk/route.ts` - Bulk generation
- `app/api/ai/generate-content-from-plan/route.ts` - Plan-based
- `app/api/ai/generate-content-plans/route.ts` - Content planning
- `app/api/ai/generate-calendar/route.ts` - Calendar generation
- `app/api/ai/generate-personas/route.ts` - Persona creation
- `app/api/ai/generate-questions/route.ts` - FAQ generation
- `app/api/ai/analyze-brand/route.ts` - Brand analysis
- `app/api/gemini/route.ts` - Gemini proxy endpoint
- `app/api/recraft/route.ts` - Recraft proxy
- `app/api/tavily-search/route.ts` - Search proxy

### Components
- `components/lastbot/LastBotWidget.tsx` - AI chatbot widget
- `components/lastbot/LastBotSearch.tsx` - AI search interface
- `components/blog/ResearchPanel.tsx` - AI research panel
- `components/admin/AIPersonaManager.tsx` - Persona management
- `components/admin/BulkContentGenerator.tsx` - Bulk AI content
- `components/admin/EnhancedBulkContentGenerator.tsx` - Enhanced bulk

### Supporting Files
- `scripts/seed-personas.ts` - AI persona seeding
- `scripts/generate-embeddings.ts` - Embedding generation
- `app/api/research-enhance/route.ts` - Research enhancement
- `app/api/lastbot-proxy/route.ts` - LastBot API proxy

### Test Files
- `__tests__/lib/gemini.test.ts` - Gemini tests
- `app/api/tavily-search/route.test.ts` - Search tests
- `app/api/recraft/__tests__/route.test.ts` - Recraft tests
- `cypress/e2e/gemini.cy.ts` - Gemini E2E tests
- `cypress/e2e/blog-ai.cy.ts` - AI blog tests

### Configuration
- Environment variables for API keys
- Model configuration in each tool
- Prompt templates and personas