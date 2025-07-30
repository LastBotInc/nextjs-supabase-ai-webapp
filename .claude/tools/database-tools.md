# Database & Seeding Tools

## Overview
Tools for managing Supabase database operations and seeding test data.

## Quick Commands

### Reset and Seed Database
```bash
# Reset DB + seed users + content types
npm run db:reset-and-seed

# Above + blog posts
npm run db:reset-and-seed:blog

# Above + translations
npm run db:reset-and-seed:all
```

## Individual Commands

### Supabase Operations
```bash
# Create new migration
supabase migration new [migration_name]

# Push migrations to database
supabase db push

# Reset database (⚠️ DESTRUCTIVE)
supabase db reset

# Generate types from database
supabase gen types typescript --local > lib/supabase/types.ts
```

### Seeding Commands
```bash
# Seed users
npm run seed:users:local    # Local environment
npm run seed:users:prod     # Production (be careful!)

# Seed blog content
npm run seed:blog:local     # AI-generated blog posts
npm run seed:blog:prod      # Production blog content

# Seed content types
npm run seed:content-types:local  # AI content generation configs
```

## Database Workflow

### 1. Schema Changes
```bash
# Create migration file
supabase migration new add_user_preferences

# Edit the migration file in supabase/migrations/
# Test locally
supabase db reset

# Push to production
supabase db push --db-url $PRODUCTION_DB_URL
```

### 2. Type Generation
After schema changes:
```bash
supabase gen types typescript --local > lib/supabase/types.ts
```

### 3. RLS Policies
Always add Row Level Security:
```sql
-- In your migration file
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON table_name
  FOR SELECT
  USING (auth.uid() = user_id);
```

## Seeding Best Practices

### Development Seeds
- Use realistic data
- Include edge cases
- Create various user roles
- Add sufficient test content

### Production Seeds
- Only seed essential data
- Never seed test users in production
- Verify environment before seeding
- Always backup first

### Seed Data Structure
```typescript
// Example seed structure
const testUsers = [
  {
    email: 'admin@example.com',
    role: 'admin',
    metadata: { test_account: true }
  },
  {
    email: 'user@example.com',
    role: 'user',
    metadata: { test_account: true }
  }
]
```

## Common Tasks

### Reset Everything
```bash
# Complete reset with all test data
npm run db:reset-and-seed:all
```

### Add Test Blog Posts
```bash
# Generate AI blog content
npm run seed:blog:local
```

### Verify Database State
```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS policies
SELECT * FROM pg_policies;
```

## Troubleshooting

### Migration Failures
1. Check SQL syntax
2. Verify foreign key constraints
3. Ensure proper order of operations
4. Test locally first

### Seeding Issues
1. Check authentication
2. Verify RLS policies
3. Ensure proper environment
4. Check for unique constraints

### Type Generation
1. Database must be running
2. Schema must be up to date
3. Run after migrations
4. Commit generated types