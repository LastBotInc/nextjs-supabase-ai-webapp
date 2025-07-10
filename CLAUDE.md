# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development
```bash
npm run dev              # Start development server with Inngest background jobs
npm run dev:next         # Start Next.js dev server only
npm run dev:inngest      # Start Inngest dev server only
```

### Testing
```bash
npm test                 # Run unit tests with Vitest
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run cypress          # Run E2E tests
npm run test:e2e:headless # Run E2E tests headlessly
```

### Database Operations
```bash
supabase db reset        # Reset database to initial state
npm run seed:users:local # Seed test users (creates 40+ users)
npm run seed:blog:local  # Seed blog with AI-generated content
npm run import-translations:local # Import translations to Supabase
```

### Build & Deployment
```bash
npm run build            # Production build with namespace generation
npm run vercel           # Deploy to Vercel
npm run github           # Configure GitHub repository
```

### AI Tool Commands
```bash
npm run gemini          # Gemini text generation
npm run gemini-image    # Gemini image generation
npm run generate-video  # Video generation with Replicate
npm run openai-image    # OpenAI image generation
```

## High-Level Architecture

### Tech Stack
- **Framework**: Next.js 15.3.1 with React 19 and TypeScript
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth (email/password + OAuth)
- **Styling**: Tailwind CSS with custom components
- **AI Integration**: Gemini, OpenAI, Replicate, Tavily
- **Background Jobs**: Inngest
- **Internationalization**: Built-in i18n for en, fi, sv locales

### Project Structure
```
app/
├── [locale]/          # Internationalized route groups
│   ├── (admin)/       # Admin dashboard routes
│   ├── (auth)/        # Authentication pages
│   ├── (marketing)/   # Public marketing pages
│   ├── blog/          # Blog feature
│   └── ...            # Other features
├── api/               # API routes
│   ├── inngest/       # Inngest function endpoints
│   └── auth/          # Auth callbacks
components/
├── ui/                # Base UI components
├── admin/             # Admin-specific components
├── auth/              # Authentication components
└── lastbot/           # AI chatbot components
lib/
├── ai/                # AI provider integrations
├── supabase/          # Supabase client and types
└── inngest/           # Background job functions
```

### Key Architectural Patterns

1. **Route Organization**: Uses Next.js 15 app router with locale-based route groups. All user-facing routes are under `[locale]` for internationalization.

2. **Component Architecture**: 
   - Server Components by default for better performance
   - Client Components marked with 'use client' for interactivity
   - Shared UI components in `components/ui/`
   - Feature-specific components organized by domain

3. **Database Integration**:
   - Supabase client configured in `lib/supabase/`
   - Type-safe database queries with generated types
   - Row Level Security (RLS) policies for all tables
   - Server-side client for API routes, browser client for frontend

4. **Authentication Flow**:
   - Middleware handles auth redirects and locale routing
   - Protected routes check session in server components
   - OAuth and email/password authentication supported
   - Turnstile integration for bot protection

5. **AI Integration Architecture**:
   - Multiple AI providers abstracted in `lib/ai/`
   - Streaming responses for real-time AI interactions
   - Image and video generation capabilities
   - Background processing with Inngest for heavy AI tasks

6. **Background Jobs**: Inngest functions in `lib/inngest/functions/` handle:
   - Email sending
   - AI content generation
   - Image processing
   - Analytics tracking

### Environment Configuration
Required environment variables are documented in `.env.example`. Key categories:
- Supabase connection (URL, anon key, service role key)
- AI provider API keys (Gemini, OpenAI, Replicate, Tavily)
- Authentication providers (Google, GitHub OAuth)
- Email service (SendGrid)
- Analytics and monitoring

### Testing Strategy
- Unit tests with Vitest for utilities and components
- E2E tests with Cypress for critical user flows
- Test utilities available in `cypress/support/`
- Mock data and fixtures for consistent testing

### Development Workflow
1. Always run `npm run dev` for full development environment
2. Use `supabase db reset` when schema changes are needed
3. Test database operations with local seed commands
4. Run tests before committing: `npm test`
5. Build locally to catch type errors: `npm run build`