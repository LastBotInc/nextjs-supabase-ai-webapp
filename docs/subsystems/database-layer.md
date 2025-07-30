# Database & Data Layer Subsystem

## Overview

The Database & Data Layer subsystem provides the foundation for all data persistence and retrieval in the application. Built on Supabase (PostgreSQL), it implements a comprehensive schema with Row Level Security (RLS) policies, type-safe database operations, and real-time capabilities. This subsystem manages everything from user profiles to content storage, analytics data, and media assets.

The data layer is designed with security and scalability in mind, utilizing PostgreSQL's advanced features like JSONB columns for flexible data storage, full-text search capabilities, and vector embeddings for AI-powered features.

## Key Components

### Database Schema (`supabase/migrations/`)
- **Core Tables**: users, profiles, posts, media, languages
- **Feature Tables**: landing_pages, analytics_events, booking_slots, ai_personas
- **System Tables**: translations, brands, content_types, seo_projects

### Type Definitions (`lib/database.types.ts`)
- Auto-generated TypeScript types for all database tables
- Ensures type safety across the application
- Provides Insert, Update, and Row types for each table

### Supabase Clients
- **utils/supabase/client.ts**: Browser-side client for user operations
- **utils/supabase/server.ts**: Server-side client for secure operations
- **utils/supabase/api.ts**: API route utilities

### Migration System
- 40+ migration files tracking schema evolution
- Implements incremental database changes
- Maintains data integrity during updates

## Dependencies

### External Dependencies
- `@supabase/supabase-js`: Supabase JavaScript client
- `@supabase/ssr`: Server-side rendering support
- PostgreSQL extensions: pgvector, pg_net, uuid-ossp

### Internal Dependencies
- Authentication: User session management
- All feature subsystems depend on this layer for data persistence

## Entry Points

### Database Clients
1. **Server Components**: `createServerClient()` for SSR operations
2. **Client Components**: `createBrowserClient()` for client-side operations
3. **API Routes**: Direct database access with service role key

### Key Tables and Their Purposes
- **profiles**: Extended user information and preferences
- **posts**: Blog content with multi-language support
- **media**: Image and video asset management
- **analytics_events**: User behavior tracking
- **landing_pages**: Dynamic page content
- **booking_slots**: Appointment scheduling data

## Data Flow

### Read Operations
1. Component requests data through Supabase client
2. RLS policies automatically filter based on user context
3. Data is returned with full type safety
4. Real-time subscriptions available for live updates

### Write Operations
1. Data validation occurs at application level
2. Supabase client sends authenticated request
3. RLS policies verify write permissions
4. Database triggers handle cascading updates
5. Real-time updates broadcast to subscribers

### Migration Flow
1. New migration files created with `supabase migration new`
2. Schema changes tested locally
3. Migrations applied with `supabase db push`
4. Type definitions regenerated automatically

## Key Patterns

### Row Level Security (RLS)
```sql
-- Example: Users can only read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
```

### Type-Safe Queries
```typescript
// Fully typed database operations
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .eq('locale', locale)
  .order('created_at', { ascending: false });
```

### Real-time Subscriptions
```typescript
// Subscribe to changes
const subscription = supabase
  .channel('posts')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'posts' 
  }, handleChange)
  .subscribe();
```

## File Inventory

### Migration Files
- `supabase/migrations/20250102165500_initial.sql` - Initial schema setup
- `supabase/migrations/20250102165501_add_contacts.sql` - Contact form data
- `supabase/migrations/20250102165502_add_post_embeddings.sql` - AI embeddings
- `supabase/migrations/20250106000001_add_analytics.sql` - Analytics tables
- `supabase/migrations/20250106000002_add_translations.sql` - i18n support
- `supabase/migrations/20250110000001_add_media_tables.sql` - Media management
- `supabase/migrations/20250110000002_create_media_storage.sql` - S3 storage
- `supabase/migrations/20250121104206_add_landing_pages.sql` - Landing pages
- `supabase/migrations/20250214132738_create_booking_tables.sql` - Booking system
- `supabase/migrations/20250526170521_add_seo_tables.sql` - SEO features
- `supabase/migrations/20250710172003_add_ab_testing_system.sql` - A/B testing
- `supabase/migrations/20250711000002_create_ai_personas_table.sql` - AI personas
- `supabase/migrations/20250712000001_create_brands_table.sql` - Brand management
- (30+ additional migration files for incremental changes)

### Type and Utility Files
- `lib/database.types.ts` - Auto-generated database types
- `utils/supabase/client.ts` - Browser client configuration
- `utils/supabase/server.ts` - Server client configuration
- `utils/supabase/api.ts` - API route utilities
- `types/database.ts` - Additional custom types

### Seed Scripts
- `scripts/seed-users.ts` - User and profile seeding
- `scripts/seed-blog.ts` - Blog content generation
- `scripts/seed-content-types.ts` - Content type definitions
- `scripts/seed-brand.ts` - Brand information seeding
- `scripts/seed-personas.ts` - AI persona creation
- `scripts/seed-seo-project.ts` - SEO project setup

### Configuration Files
- `supabase/config.toml` - Supabase project configuration
- `.env.example` - Required environment variables
- `scripts/reset-and-seed.sh` - Database reset utilities

### Test Files
- `__tests__/supabase/client.test.ts` - Client configuration tests
- `__tests__/utils/supabase.test.ts` - Utility function tests