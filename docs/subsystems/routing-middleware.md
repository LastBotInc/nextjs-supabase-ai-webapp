# Routing & Middleware Subsystem

## Overview

The Routing & Middleware subsystem forms the backbone of request handling in the application. Built on Next.js 15's App Router, it implements locale-based routing, authentication checks, and request preprocessing. The middleware layer ensures secure access to protected routes, handles locale detection and validation, and manages session persistence across requests.

This subsystem orchestrates how requests flow through the application, from initial URL access to final page rendering. It seamlessly integrates authentication, internationalization, and authorization checks while maintaining optimal performance through intelligent caching and request optimization.

## Key Components

### Middleware (`middleware.ts`)
- Centralized request processing
- Locale detection and validation
- Authentication verification
- Admin route protection
- Cookie management for sessions

### App Router Structure (`app/`)
- **[locale]/** - Locale-based dynamic routing
- **api/** - API route handlers
- **layout.tsx** - Root layout component
- **providers.tsx** - Global provider setup

### Route Groups (`app/[locale]/`)
- **(admin)/** - Administrative routes with auth protection
- **(auth)/** - Authentication-related pages
- **(marketing)/** - Public marketing pages
- **blog/**, **book/**, **presentations/** - Feature routes

### API Routes (`app/api/`)
- RESTful endpoints for all features
- Edge and Node.js runtime support
- Structured response handling

## Dependencies

### External Dependencies
- Next.js App Router
- `next-intl/middleware` for i18n routing
- Supabase SSR for session management

### Internal Dependencies
- Authentication: Session validation
- Internationalization: Locale routing
- Database Layer: User permission checks

## Entry Points

### Request Flow
1. **Middleware**: All requests pass through middleware first
2. **Route Matching**: Next.js matches request to route
3. **Layout Wrapping**: Layouts wrap page components
4. **Page Rendering**: Final page component renders

### Route Types
- **Static Routes**: Pre-rendered at build time
- **Dynamic Routes**: Server-rendered on demand
- **API Routes**: JSON API endpoints
- **Route Handlers**: Custom request handling

## Data Flow

### Middleware Processing
1. Request enters middleware
2. Static assets bypass processing
3. API routes get header forwarding
4. Locale detection and validation
5. Authentication check for protected routes
6. Admin authorization verification
7. Request forwarded to route handler

### Locale-Based Routing
1. Extract locale from URL path
2. Validate against enabled languages
3. Redirect invalid locales to default
4. Pass locale to page components
5. Maintain locale in navigation

### Protected Route Flow
1. Middleware checks session existence
2. Verifies user authentication status
3. Checks admin privileges for admin routes
4. Redirects unauthenticated users
5. Allows access to authorized users

## Key Patterns

### Middleware Configuration
```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|patterns|robots.txt).*)',
    '/',
    '/api/:path*',
    '/admin'
  ]
}
```

### Route Group Organization
```
app/[locale]/
├── (admin)/     # Layout group for admin routes
├── (auth)/      # Layout group for auth pages
├── (marketing)/ # Layout group for public pages
```

### Dynamic Route Parameters
```typescript
// File: app/[locale]/blog/[slug]/page.tsx
export default function BlogPost({ 
  params: { locale, slug } 
}: { 
  params: { locale: string; slug: string } 
}) {
  // Access dynamic parameters
}
```

### API Route Handler
```typescript
export async function GET(request: Request) {
  // Handle GET request
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  // Handle POST request
  return NextResponse.json({ success: true });
}
```

## File Inventory

### Core Routing Files
- `middleware.ts` - Main middleware configuration
- `app/layout.tsx` - Root layout wrapper
- `app/providers.tsx` - Global providers setup
- `app/robots.ts` - Robots.txt generation
- `next.config.js` - Next.js configuration

### Locale Routes
- `app/[locale]/layout.tsx` - Locale-specific layout
- `app/[locale]/page.tsx` - Home page
- `app/[locale]/providers.tsx` - Locale providers
- `app/[locale]/[slug]/page.tsx` - Dynamic page routes

### Feature Routes
- `app/[locale]/about/page.tsx` - About page
- `app/[locale]/blog/page.tsx` - Blog listing
- `app/[locale]/blog/[slug]/page.tsx` - Blog posts
- `app/[locale]/presentations/page.tsx` - Presentations
- `app/[locale]/presentations/[slug]/page.tsx` - Presentation viewer
- `app/[locale]/book/[slug]/page.tsx` - Booking pages
- `app/[locale]/privacy/page.tsx` - Privacy policy
- `app/[locale]/preview/[id]/page.tsx` - Content preview

### Admin Routes
- `app/[locale]/admin/layout.tsx` - Admin layout
- `app/[locale]/admin/page.tsx` - Admin dashboard
- `app/[locale]/admin/*/page.tsx` - Various admin pages

### Account Routes
- `app/[locale]/account/layout.tsx` - Account layout
- `app/[locale]/account/settings/page.tsx` - User settings
- `app/[locale]/account/security/page.tsx` - Security settings
- `app/[locale]/account/appointments/page.tsx` - User appointments

### API Routes
- `app/api/*/route.ts` - Feature-specific APIs
- `app/api/inngest/route.ts` - Background job handler
- `app/api/auth/*/route.ts` - Authentication APIs
- `app/api/admin/*/route.ts` - Admin-only APIs

### Test Files
- `cypress/e2e/home.cy.ts` - Homepage routing tests
- Various integration tests for routing behavior

### Supporting Files
- `vercel.json` - Vercel deployment configuration
- `app/site.webmanifest/route.ts` - PWA manifest
- `utils/getBaseUrl.ts` - Base URL utilities
- `types/navigation.ts` - Navigation type definitions