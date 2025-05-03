# Architecture

## Technical Stack

### Frontend
- Next.js 15.1.3 (React 19)
- TypeScript
- Tailwind CSS for styling
- Geist font family
- next-intl for internationalization

### Backend
- Next.js API Routes
- Supabase for database and authentication
- Recraft V3 API integration
- Tavily API for web search
- Image processing libraries (Sharp)
- Send emails with SendGrid and use SENDGRID_API_KEY from env

### Database
- PostgreSQL (via Supabase)
- Row Level Security (RLS) policies
- Real-time subscriptions
- Authentication and user management

### Development Tools
- ESLint for code quality
- PostCSS for CSS processing
- Turbopack for development
- Git for version control
- Jest for unit testing
- Cypress for E2E testing

## Project Structure

```
├── app/                  # Next.js app directory
│   ├── [locale]/        # Locale-specific routes
│   │   ├── blog/        # Blog feature routes
│   │   │   ├── [slug]/  # Individual blog post pages
│   │   │   └── page.tsx # Blog listing page
│   │   ├── admin/       # Admin routes
│   │   │   └── blog/    # Blog admin interface
│   │   └── auth/        # Authentication routes
│   └── layout.tsx       # Root layout
├── components/          # Reusable React components
│   ├── auth/           # Authentication components
│   └── blog/           # Blog-related components
├── i18n/               # Internationalization setup
├── messages/           # Translation files
│   ├── en/            # English translations by namespace
│   ├── fi/            # Finnish translations by namespace
│   ├── sv/            # Swedish translations by namespace
│   └── backup/        # Backup of original locale files
├── public/             # Static assets
│   └── images/         # Optimized images
├── tools/              # CLI tools
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
    └── supabase/       # Supabase client utilities
```

## Authentication

Authentication is handled by Supabase Auth with the following features:
- Email/Password authentication
- Social providers (GitHub)
- Session management
- Protected routes via middleware
- Automatic profile creation

### Implementation Details

#### Client Architecture
- Singleton Supabase client to prevent multiple instances
- AuthProvider context for centralized auth state management
- Proper session and loading state handling
- Automatic redirection based on auth state

#### Components
- `AuthProvider`: Global auth state manager
  - Manages session state
  - Handles admin status
  - Provides Supabase client instance
  - Manages auth state changes
  - Handles automatic token refresh

- `SignInForm`: Authentication form component
  - Handles form submission state
  - Manages loading states
  - Provides error feedback
  - Handles redirects after successful auth
  - Implements accessibility features

#### State Management
- Session state: Tracks current user session
- Loading states:
  - `authLoading`: Initial auth state check
  - `isSubmitting`: Form submission state
- Admin status: Tracks user's admin privileges
- Error handling: Form-level error messages

#### Security Features
- PKCE (Proof Key for Code Exchange) flow
- Secure cookie management
- Protected route middleware
- Row Level Security (RLS) policies
- Session persistence configuration
- Cloudflare Turnstile integration
  - Bot protection for registration and contact forms
  - Server-side token validation
  - Automatic token expiration handling
  - Dark mode support with auto theme detection

#### Authentication Flow
1. Initial auth state check on app load
2. User submits credentials
3. Supabase auth validates credentials
4. Session established and stored securely
5. Auth state updated via event listeners
6. Admin status checked from profiles table
7. User redirected based on role

#### Protected Routes
- Admin routes require authentication
- Authentication state checked on every request
- Locale validation and enforcement
- Middleware handles unauthorized access

#### Session Management
- Automatic token refresh
- Secure cookie storage
- Cross-tab session synchronization
- Proper cleanup on sign-out

## Internationalization Structure

The project uses next-intl for internationalization with the following structure:

- Supported locales: English (en), Finnish (fi), Swedish (sv)
- Translation files organized by namespace and locale:
  ```
  messages/
  ├── en/                  # English translations
  │   ├── Index.json       # Homepage translations
  │   ├── Blog.json        # Blog-related translations
  │   ├── Footer.json      # Footer translations
  │   └── ...              # Other namespaces
  ├── fi/                  # Finnish translations
  │   ├── Index.json
  │   ├── Blog.json
  │   └── ...
  ├── sv/                  # Swedish translations
  │   ├── Index.json
  │   ├── Blog.json
  │   └── ...
  └── backup/              # Backup of original monolithic files
  ```
- Each namespace file contains translations for a specific feature or component
- Maintenance scripts:
  - `npm run split-locales`: Splits monolithic locale files into namespace-based files
  - `npm run check-translations`: Checks for missing translations between locales
  - `npm run import-translations:local/prod`: Imports translations from external sources