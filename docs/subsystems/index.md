# NextJS Supabase AI WebApp - Subsystem Architecture

This document provides an overview of the subsystem architecture for the NextJS Supabase AI WebApp. The codebase is organized into 12 logical subsystems, each responsible for specific functionality and features.

## Subsystem Overview

### Core Infrastructure
1. **[Authentication & Authorization](./authentication.md)** - User authentication, session management, and access control
2. **[Database & Data Layer](./database-layer.md)** - Supabase integration, data models, and database operations
3. **[Internationalization (i18n)](./internationalization.md)** - Multi-language support and localization system
4. **[Routing & Middleware](./routing-middleware.md)** - Next.js routing, middleware, and request handling

### Feature Subsystems
5. **[Content Management System (CMS)](./cms.md)** - Blog posts, media management, and content editing
6. **[AI Integration](./ai-integration.md)** - Integration with multiple AI services for content generation
7. **[Analytics & Monitoring](./analytics.md)** - User analytics, A/B testing, and session tracking
8. **[SEO & Marketing](./seo-marketing.md)** - SEO tools, landing pages, and marketing features
9. **[Booking & Calendar](./booking-calendar.md)** - Appointment scheduling and calendar management

### Supporting Subsystems
10. **[Admin Dashboard](./admin-dashboard.md)** - Administrative interface and management tools
11. **[Background Jobs](./background-jobs.md)** - Inngest integration for async processing
12. **[Testing & Development Tools](./testing-tools.md)** - Testing infrastructure and development utilities

## Architecture Principles

The application follows these key architectural principles:

- **Server-First Approach**: Leverages Next.js 15 App Router with React Server Components by default
- **Type Safety**: Full TypeScript implementation with generated database types
- **Security First**: Row Level Security (RLS) policies on all database tables
- **Modular Design**: Clear separation of concerns with feature-based organization
- **AI-Native**: Deep integration with multiple AI providers for various features
- **Internationalization**: Built-in multi-language support from the ground up

## Technology Stack Summary

- **Framework**: Next.js 15.3.1 with React 19
- **Database**: Supabase (PostgreSQL with RLS)
- **Styling**: Tailwind CSS with custom component library
- **AI Services**: Gemini, OpenAI, Replicate, Tavily
- **Background Jobs**: Inngest
- **Authentication**: Supabase Auth
- **Deployment**: Optimized for Vercel

## Quick Navigation

Each subsystem document includes:
- Overview and responsibilities
- Key components and file structure
- Dependencies and interactions
- Entry points and APIs
- Data flow and patterns
- Complete file inventory

Start exploring by selecting any subsystem from the list above.