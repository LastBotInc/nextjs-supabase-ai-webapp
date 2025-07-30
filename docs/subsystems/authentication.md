# Authentication & Authorization Subsystem

## Overview

The Authentication & Authorization subsystem handles all aspects of user identity management, including user registration, login, session management, and access control. It leverages Supabase Auth for secure authentication with support for multiple providers and implements role-based access control (RBAC) for protecting resources.

This subsystem ensures that users can securely access the application while maintaining proper authorization boundaries between regular users and administrators. It also integrates with Cloudflare Turnstile for bot protection during authentication flows.

## Key Components

### Auth Routes (`app/[locale]/auth/`)
- **sign-in/page.tsx**: Sign-in page with email/password and OAuth options
- **register/page.tsx**: User registration page with Turnstile verification
- **sign-out/page.tsx**: Sign-out handling page
- **callback/route.ts**: OAuth callback handler for provider authentication
- **auth-code-error/page.tsx**: Error handling for authentication failures
- **check-email/page.tsx**: Email verification prompt page

### Auth Components (`components/auth/`)
- **AuthProvider.tsx**: React context provider for authentication state
- **SignInForm.tsx**: Reusable sign-in form component
- **RegisterForm.tsx**: Registration form with validation and bot protection

### API Routes
- **app/api/auth/callback/route.ts**: Server-side OAuth callback processing
- **app/api/auth/validate-turnstile/route.ts**: Turnstile token validation endpoint

### Middleware Integration
- **middleware.ts**: Authentication checks, session validation, and protected route enforcement

## Dependencies

### External Dependencies
- `@supabase/auth-helpers-nextjs`: Supabase Auth integration for Next.js
- `@supabase/auth-ui-react`: Pre-built auth UI components
- `@supabase/ssr`: Server-side rendering support for Supabase
- `react-turnstile`: Cloudflare Turnstile React component

### Internal Dependencies
- Database Layer: User profiles and session storage
- Routing & Middleware: Protected route handling
- Internationalization: Localized auth messages

## Entry Points

### Public APIs
1. **Authentication Endpoints**
   - `/api/auth/callback`: OAuth provider callbacks
   - `/api/auth/validate-turnstile`: Bot verification

2. **User-Facing Routes**
   - `/[locale]/auth/sign-in`: Sign-in page
   - `/[locale]/auth/register`: Registration page
   - `/[locale]/auth/sign-out`: Sign-out handler

### Internal APIs
- `AuthProvider` context: Provides `user`, `session`, and auth methods
- Supabase client instances: Server and client-side auth operations

## Data Flow

### Registration Flow
1. User fills registration form with email/password
2. Turnstile verification token is validated via API
3. Supabase Auth creates user account
4. Profile record is automatically created via database trigger
5. User is redirected to check-email page for verification

### Sign-In Flow
1. User provides credentials (email/password or OAuth)
2. Supabase Auth validates credentials
3. Session tokens are set as HTTP-only cookies
4. Middleware validates session on subsequent requests
5. User is redirected to intended destination or dashboard

### Session Management
1. Middleware checks session validity on each request
2. Expired sessions trigger automatic refresh attempts
3. Invalid sessions redirect to sign-in page
4. Admin routes require additional `is_admin` profile check

## Key Patterns

### Server-Side Session Validation
```typescript
// Pattern used in middleware and server components
const supabase = createServerClient(...)
const { data: { session } } = await supabase.auth.getSession()
```

### Protected Route Pattern
```typescript
// Admin route protection in middleware
if (isAdminRoute && !session?.user?.id) {
  return NextResponse.redirect(`/${locale}/auth/sign-in`)
}
```

### Role-Based Access Control
- User roles stored in `profiles.is_admin` column
- Middleware enforces admin access for `/admin/*` routes
- RLS policies restrict database access based on user ID

## File Inventory

### Route Files
- `app/[locale]/auth/sign-in/page.tsx` - Sign-in page component
- `app/[locale]/auth/register/page.tsx` - Registration page component
- `app/[locale]/auth/sign-out/page.tsx` - Sign-out handler page
- `app/[locale]/auth/callback/route.ts` - Auth callback route handler
- `app/[locale]/auth/auth-code-error/page.tsx` - Auth error page
- `app/[locale]/auth/check-email/page.tsx` - Email verification prompt
- `app/api/auth/callback/route.ts` - API callback handler
- `app/api/auth/validate-turnstile/route.ts` - Turnstile validation API

### Component Files
- `components/auth/AuthProvider.tsx` - Authentication context provider
- `components/auth/SignInForm.tsx` - Reusable sign-in form
- `components/auth/RegisterForm.tsx` - Registration form with validation

### Configuration Files
- `middleware.ts` - Auth middleware with session management
- `utils/supabase/client.ts` - Client-side Supabase configuration
- `utils/supabase/server.ts` - Server-side Supabase configuration
- `utils/turnstile.ts` - Turnstile verification utilities

### Type Definitions
- `types/database.ts` - User and profile type definitions
- Database tables: `auth.users`, `public.profiles`

### Test Files
- `__tests__/components/auth/SignInForm.test.tsx` - Sign-in form tests
- `cypress/e2e/auth.cy.ts` - End-to-end authentication tests