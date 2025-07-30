# System Architecture

## Tech Stack

- **Framework**: Next.js 15.3.1 with React 19 and TypeScript
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth (email/password + OAuth providers)
- **Styling**: Tailwind CSS with custom component library
- **AI Integration**: 
  - Google Gemini (text generation, image generation, video generation)
  - OpenAI (GPT models, DALL-E image generation)
  - Replicate (video generation, background removal)
  - Tavily (web search)
- **Background Jobs**: Inngest for async processing
- **Internationalization**: Built-in i18n support for en, fi, sv locales
- **Testing**: Vitest (unit tests), Cypress (E2E tests)

## Project Structure

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

## Key Architectural Patterns

### 1. Route Organization
- Uses Next.js 15 app router with locale-based route groups
- All user-facing routes are under `[locale]` for internationalization
- Admin routes are protected under `(admin)` route group
- Marketing pages use `(marketing)` route group

### 2. Component Architecture
- **Server Components** by default for better performance
- **Client Components** marked with 'use client' for interactivity
- Shared UI components in `components/ui/`
- Feature-specific components organized by domain
- Follows React 19 best practices

### 3. Database Integration
- Supabase client configured in `lib/supabase/`
- Type-safe database queries with generated types
- Row Level Security (RLS) policies for all tables
- Server-side client for API routes, browser client for frontend
- Connection pooling for optimal performance

### 4. Authentication Flow
- Middleware handles auth redirects and locale routing
- Protected routes check session in server components
- OAuth providers: Google, GitHub
- Email/password authentication with verification
- Turnstile integration for bot protection
- Role-based access control (RBAC)

### 5. AI Integration Architecture
- Multiple AI providers abstracted in `lib/ai/`
- Streaming responses for real-time AI interactions
- Image generation with Gemini and OpenAI
- Video generation with Replicate and Gemini
- Background processing with Inngest for heavy AI tasks
- Rate limiting and error handling

### 6. Background Jobs
Inngest functions in `lib/inngest/functions/` handle:
- Email sending via SendGrid
- AI content generation
- Image processing and optimization
- Analytics tracking
- Scheduled tasks

### 7. State Management
- Server state managed through Supabase queries
- Client state using React hooks and context
- Form state with react-hook-form
- Global state minimal, prefer server components

### 8. Performance Optimizations
- Image optimization with Next.js Image component
- Dynamic imports for code splitting
- Server-side rendering for initial page loads
- Static generation for marketing pages
- Edge runtime for middleware

## Environment Configuration

Environment variables are organized in `.env.local`:

### Required Variables
- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **AI Providers**: API keys for Gemini, OpenAI, Replicate, Tavily
- **Authentication**: OAuth client IDs and secrets
- **Email**: SendGrid API key
- **Analytics**: PostHog, Google Analytics

### Development vs Production
- Use `.env.local` for local development
- Production secrets managed through Vercel environment variables
- Different Supabase projects for dev/staging/production

## Security Considerations

1. **API Security**
   - All API routes validate authentication
   - Admin routes have additional role checks
   - Rate limiting on AI endpoints
   - Input validation and sanitization

2. **Database Security**
   - Row Level Security (RLS) enabled on all tables
   - Service role key only used in server-side code
   - Prepared statements prevent SQL injection

3. **Authentication Security**
   - PKCE flow for OAuth
   - Secure session management
   - CSRF protection via SameSite cookies
   - Bot protection with Turnstile

4. **Content Security**
   - CSP headers configured
   - XSS protection
   - Sanitized user inputs
   - Secure file uploads