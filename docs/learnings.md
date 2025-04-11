# Technical Learnings and Best Practices

## Vehicle Leasing Application Development for Innolease

### Business Domain Modeling
- Structure vehicle data models with comprehensive technical specifications
- Implement contract models that support various leasing types (financial, flexible, maintenance)
- Design database schemas to handle complex corporate hierarchies
- Implement proper vehicle status lifecycle management

### Vehicle Data Integration
- Use standardized VIN (Vehicle Identification Number) lookups for vehicle data
- Implement mileage tracking with validation rules
- Design efficient vehicle search with multiple filtering options
- Create views for vehicle availability and assignment status

### Contract Management
- Design flexible contract templates that support multiple leasing types
- Implement proper end-of-lease workflows
- Create validation rules for contract values based on vehicle type
- Develop residual value calculation algorithms

### Financial Operations
- Implement invoice generation based on contract terms
- Design payment tracking systems with overdue notifications
- Create financial reporting with drill-down capabilities
- Implement cost allocation across departments

### Fleet Management
- Design dashboards with real-time vehicle status
- Implement maintenance scheduling and tracking
- Create driver-vehicle assignment workflows
- Develop fleet cost analytics and optimization tools

### Service Provider Integration
- Design standard API interfaces for maintenance providers (Vianor, Euromaster)
- Implement service booking workflows
- Create service quality tracking mechanisms
- Design invoice matching for service costs

### Multilingual Implementation for Finnish Market
- Implement proper handling of Finnish special characters
- Design UI/UX with Finnish business terminology
- Ensure all documentation and contracts support Finnish
- Add Swedish language support for bilingual requirements
- Implement English as a secondary language for international clients

## Next.js 15 and React 19

### Server Components and Routing
- Use server components by default for better performance
- Mark client components with 'use client' directive
- Use app directory structure for better organization
- Implement catch-all routes with [...slug]
- Use middleware for route protection and locale handling

### Common Issues and Solutions
1. **Module Resolution**
   - Error: "Cannot find module 'next/dist/server/app-render'"
   - Solution: Add to `transpilePackages` and `serverExternalPackages` in next.config.js
   ```js
   {
     transpilePackages: [
       'next',
       'react',
       '@supabase/auth-helpers-nextjs',
       'next/dist/server/app-render'
     ],
     serverExternalPackages: [
       '@google/generative-ai',
       'next/dist/server/app-render/work-unit-async-storage.external'
     ]
   }
   ```

2. **Font Loading**
   - Error: "next/font requires SWC although Babel is being used"
   - Solution: Remove `.babelrc` to allow SWC compiler usage
   - Context: Next.js 13+ features require SWC compiler

3. **Headers in Server Components**
   - Error: "Headers/cookies/params should be awaited"
   - Solution: Always await these functions in async components
   ```typescript
   export default async function MyComponent() {
     const headersList = await headers();
     const userAgent = headersList.get('user-agent');
   }
   ```

## Supabase Integration

### Authentication
- Use createBrowserClient for client-side auth
- Use createServerClient with cookies for server-side auth
- Implement protected routes in middleware
- Use Row Level Security (RLS) for data protection
- Configure proper session timeouts and cookie settings

### Cookie Configuration
```typescript
cookieOptions: {
  name: 'sb-session',
  path: '/',
  domain: process.env.NODE_ENV === 'development' ? 'localhost' : undefined,
  sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'strict',
  secure: process.env.NODE_ENV === 'production'
}
```

### Session Timeout Fix
1. Configure session timeouts in `supabase/config.toml`:
```toml
[auth]
jwt_expiry = 604800  # 7 days in seconds

[auth.sessions]
timebox = "7d"
inactivity_timeout = "8h"
```

2. Set proper cookie settings in server client:
```typescript
if (name.includes('auth') || name === 'sb-refresh-token') {
  options.path = '/'
  options.maxAge = 60 * 60 * 24 * 7 // 7 days
  
  if (process.env.NODE_ENV === 'development') {
    options.secure = false
    options.sameSite = 'lax'
  }
}
```

### API Authentication Pattern
```typescript
// 1. Create regular client for auth
const authClient = await createClient()
const { data: { user } } = await authClient.auth.getUser(token)

// 2. Create service role client for admin operations
const supabase = await createClient(true)
```

### Auth Loading State Fix
- Issue: Navigation items getting stuck in loading state
- Solution:
  1. Only set loading state for SIGNED_IN and SIGNED_OUT events
  2. Remove redundant loading state management
  3. Simplify Navigation component's loading state logic
  4. Add better logging for auth state changes
  5. Reduce loading timeout from 5s to 3s

## Internationalization

### next-intl Setup
- Configure middleware for locale detection
- Use locale-prefixed routes for better SEO
- Use Link from '@/app/i18n/navigation' for proper locale handling
- Handle missing translations with fallbacks

### Translation Fallback Handling
- Issue: Navigation items falling back to English
- Solution:
  1. Add proper translations for all enabled languages
  2. Improve translation loading error handling
  3. Add warning when falling back to default locale
  4. Check for enabled locales with missing files

### Common Issues
- Error: "useTranslations not callable in async component"
- Solution: Use getTranslations from 'next-intl/server'
```typescript
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('namespace')
  return { title: t('title') }
}
```

## Testing Best Practices

### Jest
- Configure for TypeScript
- Mock external services
- Test both success and error cases
- Use snapshot testing for UI components

### Cypress
- Reset database state before tests
- Mock authentication for protected routes
- Test both authenticated and unauthenticated states
- Use data-testid for reliable selectors

### API Route Testing
```typescript
describe('API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle successful request', async () => {
    const mockClient = {
      search: jest.fn().mockResolvedValue(mockResults)
    }

    const response = await POST(request)
    const data = await response.json()

    expect(data).toEqual(mockResults)
    expect(mockClient.search).toHaveBeenCalled()
  })
})
```

## Performance Optimization

### Authentication and Navigation
- Implement proper request cancellation with AbortController
- Use session storage for faster initial loads
- Add proper caching layers (memory, session, localStorage)
- Match loading timeouts across components
- Implement proper cleanup in useEffect

### Request Handling Optimization
```typescript
const fetchWithTimeout = async (url: string, options: RequestInit) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeout)
    return response
  } catch (error) {
    clearTimeout(timeout)
    throw error
  }
}
```

### Image and Data Handling
- Use next/image for automatic optimization
- Implement lazy loading for images
- Use server components for initial data fetch
- Add pagination for large datasets
- Use optimistic updates for better UX

## Development Workflow

### Version Control
- Use conventional commits
- Create feature branches
- Review code changes
- Test before merging

### Documentation
- Keep documentation up to date
- Document API changes
- Add code comments for complex logic
- Update changelog regularly

## Security Considerations

### Authentication
- Implement proper session handling
- Use secure cookie settings
- Add rate limiting for auth endpoints
- Validate user input thoroughly

### Data Access
- Use RLS policies for access control
- Validate user permissions server-side
- Sanitize user input
- Use prepared statements for queries

## API Authentication

### Bearer Token vs Cookie Authentication
When implementing authentication in Next.js API routes with Supabase, bearer token authentication is more reliable:

1. **Consistency**: Works the same across all environments
2. **Debugging**: Token is visible in request headers
3. **Client Integration**: Simple session token access

### Mixed Public/Protected API Endpoints

1. **Method-Based Access Control**: 
```typescript
// Public GET endpoint
export async function GET() {
  const supabase = createClient()
  const { data, error } = await supabase.from('table').select()
}

// Protected POST endpoint
export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    )
  }
  // Verify token and handle request
}
```

2. **Route-Based Access Control**:
   - Public: `/api/languages`
   - Protected: `/api/admin/languages`

3. **Client Implementation**:
```typescript
const { data: { session } } = await supabase.auth.getSession()
if (!session?.access_token) throw new Error('Not authenticated')

const response = await fetch('/api/protected-route', {
  headers: { 
    'Authorization': `Bearer ${session.access_token}`
  }
})
```

### Common Issues Solved:

1. **401 Unauthorized Errors**: 
   - Cause: Missing/invalid authorization header
   - Solution: Always include bearer token

2. **Token Verification**: 
   - Use standard client for auth
   - Use service role client for admin operations

3. **Error Handling**:
   - Use consistent error format
   - Include proper HTTP status codes

### References
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
