# Architecture

## Technical Stack

### Frontend
- Next.js 15.1.3 (React 19)
- TypeScript
- Tailwind CSS for styling
- Inter font family
- next-intl for internationalization (Finnish, Swedish, English)

### Backend
- Next.js API Routes
- Supabase for database and authentication
- Vehicle data integration via APIs
- Service provider integrations (maintenance, tires, inspections)
- PDF generation for contracts and reports
- Email notifications via SendGrid
- SMS notifications for service reminders

### Database
- PostgreSQL (via Supabase)
- Row Level Security (RLS) policies
- Real-time fleet status updates
- Corporate hierarchy and permissions management
- Vehicle and contract data models

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
│   ├── [locale]/        # Locale-specific routes (fi, sv, en)
│   │   ├── leasing/     # Public leasing information
│   │   │   ├── [type]/  # Specific leasing type pages
│   │   │   └── page.tsx # Leasing solutions overview
│   │   ├── portal/      # Client portal routes
│   │   │   ├── vehicles/# Vehicle management interface
│   │   │   ├── contracts/# Contract management
│   │   │   └── maintenance/# Maintenance booking
│   │   ├── admin/       # Admin portal routes
│   │   │   ├── clients/ # Client management
│   │   │   └── vehicles/# Vehicle fleet management
│   │   └── auth/        # Authentication routes
│   └── layout.tsx       # Root layout
├── components/          # Reusable React components
│   ├── auth/           # Authentication components
│   ├── vehicles/       # Vehicle display components
│   ├── contracts/      # Contract-related components
│   ├── maintenance/    # Maintenance booking components
│   └── dashboard/      # Dashboard and reporting components
├── i18n/               # Internationalization setup
├── messages/           # Translation files
│   ├── en/            # English translations by namespace
│   ├── fi/            # Finnish translations by namespace
│   ├── sv/            # Swedish translations by namespace
│   └── backup/        # Backup of original locale files
├── public/             # Static assets
│   └── images/         # Vehicle and brand images
├── tools/              # CLI tools and utilities
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
    ├── supabase/       # Supabase client utilities
    ├── vehicles/       # Vehicle data processing
    ├── contracts/      # Contract calculations
    └── reports/        # Report generation utilities
```

## Authentication

Authentication is handled by Supabase Auth with the following features:
- Email/Password authentication
- Corporate account hierarchy
- Role-based access control (Fleet Manager, Driver, Admin)
- Protected routes via middleware
- Automatic profile creation

### Implementation Details

#### Client Architecture
- Singleton Supabase client to prevent multiple instances
- AuthProvider context for centralized auth state management
- Corporate hierarchy management
- Multi-role support for different access levels

#### Components
- `AuthProvider`: Global auth state manager
  - Manages session state
  - Handles role-based access
  - Provides Supabase client instance
  - Manages auth state changes
  - Handles automatic token refresh

- `SignInForm`: Authentication form component
  - Corporate account login
  - Role selection if applicable
  - Manages loading states
  - Provides error feedback
  - Handles redirects based on user role

#### State Management
- Session state: Tracks current user session
- Company context: Tracks corporate hierarchy
- User role: Determines access level and available features
- Loading states:
  - `authLoading`: Initial auth state check
  - `isSubmitting`: Form submission state
- Error handling: Form-level error messages

#### Security Features
- PKCE (Proof Key for Code Exchange) flow
- Secure cookie management
- Protected route middleware
- Row Level Security (RLS) policies
- Corporate data isolation
- IP address tracking for unusual login detection

#### Authentication Flow
1. Initial auth state check on app load
2. User submits corporate credentials
3. Supabase auth validates credentials
4. Role and company context established
5. Auth state updated via event listeners
6. User redirected to appropriate portal (admin, client, or driver)

#### Protected Routes
- Admin routes require admin authentication
- Client portal requires valid company account
- Driver-specific views for company vehicle users
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