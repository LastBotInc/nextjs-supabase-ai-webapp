# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Claude Code Workflow System

This project uses an organized workflow system for Claude Code with the following structure:

### Directory Organization
```
.claude/
├── docs/                    # Architecture & feature documentation
│   ├── architecture.md      # System overview, tech stack, patterns
│   ├── api-reference.md     # API endpoints documentation
│   └── features/           # Feature-specific documentation
├── workflows/              # Task-specific workflows
│   ├── debugging.md        # Systematic debugging approach
│   ├── feature-dev.md      # New feature development
│   ├── testing.md          # Testing procedures
│   ├── deployment.md       # Deployment checklist
│   └── refactoring.md      # Code refactoring guide
├── agents/                 # Specialized agent prompts
│   ├── code-reviewer.md    # Code review specialist
│   ├── test-writer.md      # Test generation agent
│   ├── debugger.md         # Debug specialist
│   └── api-designer.md     # API design agent
└── patterns/               # Project-specific patterns
    ├── components/         # React component patterns
    ├── api/               # API route patterns
    ├── database/          # Database query patterns
    └── testing/           # Test patterns
```

### Using Workflows

When working on tasks, reference the appropriate workflow:
- **Debugging issues**: Follow `.claude/workflows/debugging.md`
- **Building features**: Follow `.claude/workflows/feature-dev.md`
- **Writing tests**: Follow `.claude/workflows/testing.md`
- **Deploying**: Follow `.claude/workflows/deployment.md`
- **Refactoring**: Follow `.claude/workflows/refactoring.md`

### Using Specialized Agents

For specialized tasks, use the Task tool with the appropriate agent:
- **Code reviews**: `Task(subagent_type="general-purpose", prompt="Please review this code following .claude/agents/code-reviewer.md")`
- **Test writing**: `Task(subagent_type="unit-test-implementer", prompt="Write tests following .claude/agents/test-writer.md")`
- **Debugging**: `Task(subagent_type="general-purpose", prompt="Debug this issue following .claude/agents/debugger.md")`
- **API design**: `Task(subagent_type="general-purpose", prompt="Design this API following .claude/agents/api-designer.md")`

### Using Patterns

When implementing features, reference the appropriate patterns:
- **Components**: See `.claude/patterns/components/`
- **API routes**: See `.claude/patterns/api/`
- **Database**: See `.claude/patterns/database/`
- **Testing**: See `.claude/patterns/testing/`

### Using Project Tools

This project includes extensive command-line tools. See `.claude/tools/` for:
- **Translation tools**: Managing localization
- **Database tools**: Migrations and seeding
- **AI tools**: Text, image, and video generation
- **Media tools**: Image processing and optimization
- **Deployment tools**: Vercel and GitHub CLI integration

## Common Development Commands

### Development
```bash
npm run dev              # Start development server with Inngest background jobs
npm run dev:next         # Start Next.js dev server only
npm run dev:inngest      # Start Inngest dev server only
```

**For comprehensive tool documentation, see:** `.claude/tools/`

### Testing
```bash
npm test                 # Run unit tests with Vitest
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run cypress          # Run E2E tests
npm run test:e2e:headless # Run E2E tests headlessly
```

**For comprehensive testing guidance, see:** `.claude/workflows/testing.md`

### Database Operations
```bash
# Quick setup - reset and seed essentials
npm run db:reset-and-seed       # Reset DB + seed users + content types
npm run db:reset-and-seed:blog  # Above + blog posts
npm run db:reset-and-seed:all   # Above + translations

# Individual operations
supabase db reset               # Reset database to initial state
npm run seed:users:local        # Seed test users (creates 2+ users)
npm run seed:blog:local         # Seed blog with AI-generated content
npm run seed:content-types:local # Seed content types for AI generation
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

**For detailed workflows, see:** `.claude/workflows/`

## CRITICAL DATABASE RULES

**NEVER USE `supabase db reset` WITHOUT EXPLICIT USER PERMISSION**

The database contains hours of carefully configured test data. Database resets are extremely disruptive and should only be done when explicitly requested by the user. If you need to apply migrations or make schema changes, consider:

1. Creating incremental migrations instead of resetting
2. Using `supabase migration new` to create new migration files
3. Testing changes on a separate branch or database
4. Always asking the user before any destructive database operations

This is a hard rule - no exceptions.