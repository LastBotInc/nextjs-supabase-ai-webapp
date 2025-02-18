# Backend Architecture

## Overview
This template uses a modern backend architecture with AI capabilities at its core:

## Database
We use Supabase as our backend service, providing:
- PostgreSQL database
- Authentication
- Real-time subscriptions
- Storage
- Edge Functions

### Authentication
Authentication is handled by Supabase Auth with the following features:
- Email/Password authentication
- Social providers (configurable)
- Session management
- Middleware protection for routes

### Database Schema
The template includes a basic schema with:
- User profiles
- Blog posts
- Media assets
- AI generations history
- Analytics events

### API Endpoints

#### Authentication & Users
- `/api/auth/*` - Authentication endpoints
- `/api/users/*` - User management
- `/api/profiles/*` - User profile management

#### Content Management
- `/api/blog/*` - Blog post CRUD operations
- `/api/blog-image/*` - Blog image management
- `/api/media/*` - Media asset management
- `/api/landing-pages/*` - Landing page management
- `/api/upload/*` - File upload handling

#### AI Services
- `/api/gemini/*` - Google Gemini AI integration
- `/api/recraft/*` - Recraft image generation
- `/api/tavily-search/*` - Web search and research
- `/api/research-enhance/*` - Research enhancement

#### Analytics & Tracking
- `/api/analytics/*` - Analytics data endpoints
- `/api/analytics-init/*` - Analytics initialization

#### Utilities
- `/api/html-to-md/*` - HTML to Markdown conversion
- `/api/sitemap/*` - Sitemap generation
- `/api/sse/*` - Server-sent events

#### Forms & Communication
- `/api/forms/*` - Form submission handling
- `/api/contact-notification/*` - Contact form notifications
- `/api/waitlist/*` - Waitlist management

#### Booking System
- `/api/booking/*` - Booking system endpoints
- `/api/appointment-types/*` - Appointment type management

#### Internationalization
- `/api/translations/*` - Translation management
- `/api/languages/*` - Language settings
- `/api/i18n/*` - Internationalization utilities

### Environment Variables
Required environment variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI Services
GOOGLE_AI_STUDIO_KEY=your-gemini-api-key
REPLICATE_API_KEY=your-replicate-key
TAVILY_API_KEY=your-tavily-key
```

## AI Service Architecture
The template integrates with the following AI services:

1. Supabase
   - Database
   - Authentication
   - File storage
   - Edge Functions

2. Google Gemini API
   - Text generation
   - Image analysis
   - Chat functionality

3. Recraft/Flux API
   - Image generation
   - Style transfer
   - Image editing

4. Tavily API
   - Web search
   - Content processing
   - Research enhancement
