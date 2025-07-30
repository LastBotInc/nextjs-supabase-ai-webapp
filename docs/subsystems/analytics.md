# Analytics & Monitoring Subsystem

## Overview

The Analytics & Monitoring subsystem provides comprehensive tracking and analysis of user behavior, system performance, and business metrics. It includes custom-built analytics with privacy-first design, A/B testing capabilities, session tracking, and real-time monitoring. The system captures detailed user interactions while respecting privacy regulations and provides actionable insights through intuitive dashboards.

This subsystem enables data-driven decision making by tracking page views, user events, geographic distribution, and conversion metrics. It also includes advanced features like user agent analysis, session reconstruction, and experimental feature testing through A/B tests.

## Key Components

### Analytics Core
- **lib/analytics.ts**: Core analytics client and utilities
- **lib/analytics-init.ts**: Analytics initialization
- **lib/geographic-analytics.ts**: Geographic data processing
- **lib/user-agent-parser.ts**: User agent analysis
- **lib/ab-testing.ts**: A/B testing framework

### Admin Dashboard (`app/[locale]/admin/analytics/`)
- **page.tsx**: Main analytics dashboard
- **ab-testing.tsx**: A/B test management
- **geographic.tsx**: Geographic distribution view
- **user-agents.tsx**: Browser and device analytics
- **services.ts**: Analytics data services

### Client Components
- **AnalyticsInitializer.tsx**: Client-side tracking setup
- **AnalyticsScript.tsx**: Analytics script injection
- **AnalyticsWrapper.tsx**: Analytics context provider
- **ABTestButton.tsx**: A/B test component wrapper

### API Endpoints (`app/api/`)
- **analytics/events/route.ts**: Event tracking
- **analytics/page-view/route.ts**: Page view tracking
- **analytics/sessions/route.ts**: Session management
- **analytics/realtime/route.ts**: Real-time data
- **ab-testing/experiments/route.ts**: A/B test management

## Dependencies

### External Dependencies
- `ua-parser-js`: User agent parsing
- `@vercel/analytics`: Vercel Analytics integration
- `@vercel/speed-insights`: Performance monitoring

### Internal Dependencies
- Database Layer: Analytics data storage
- Authentication: User identification
- Middleware: Request interception

## Entry Points

### Client-Side Tracking
1. **Page Views**: Automatic tracking on navigation
2. **Custom Events**: `trackEvent()` function
3. **A/B Tests**: `useABTest()` hook
4. **Session Tracking**: Automatic session management

### Admin Interfaces
1. **Analytics Dashboard**: `/[locale]/admin/analytics`
2. **A/B Testing**: `/[locale]/admin/analytics/ab-testing`
3. **Geographic View**: `/[locale]/admin/analytics/geographic`
4. **User Agents**: `/[locale]/admin/analytics/user-agents`

## Data Flow

### Event Tracking Flow
1. User interaction triggers event
2. Event data collected with context
3. Data sent to analytics API
4. Server validates and enriches data
5. Event stored in database
6. Real-time updates broadcast
7. Dashboards reflect new data

### Session Management
1. New visitor receives session ID
2. Session tracked across page views
3. User agent and location captured
4. Session duration calculated
5. Engagement metrics computed
6. Session data aggregated

### A/B Testing Flow
1. Experiment defined with variants
2. User assigned to variant
3. Assignment persisted in cookies
4. Variant-specific content served
5. Conversion events tracked
6. Statistical significance calculated
7. Results displayed in dashboard

## Key Patterns

### Event Tracking Pattern
```typescript
trackEvent({
  event_type: 'button_click',
  page_url: window.location.href,
  metadata: {
    button_id: 'cta-main',
    variant: 'A'
  }
});
```

### A/B Test Implementation
```typescript
const { variant, trackConversion } = useABTest('homepage-cta');

return (
  <Button 
    onClick={() => {
      trackConversion();
      // Handle click
    }}
  >
    {variant === 'A' ? 'Get Started' : 'Start Free Trial'}
  </Button>
);
```

### Analytics Initialization
```typescript
useEffect(() => {
  initializeAnalytics({
    user_id: session?.user?.id,
    locale: locale
  });
}, [session, locale]);
```

## File Inventory

### Core Analytics Files
- `lib/analytics.ts` - Analytics utilities and client
- `lib/analytics-init.ts` - Initialization logic
- `lib/geographic-analytics.ts` - Geographic processing
- `lib/user-agent-parser.ts` - User agent parsing
- `lib/ab-testing.ts` - A/B testing framework
- `utils/analytics.ts` - Additional utilities

### Components
- `components/analytics/AnalyticsInitializer.tsx` - Setup component
- `components/analytics/AnalyticsScript.tsx` - Script loader
- `components/analytics/AnalyticsWrapper.tsx` - Context provider
- `components/ab-testing/ABTestButton.tsx` - A/B test button

### Admin Pages
- `app/[locale]/admin/analytics/page.tsx` - Dashboard
- `app/[locale]/admin/analytics/ab-testing.tsx` - A/B tests
- `app/[locale]/admin/analytics/geographic.tsx` - Geographic view
- `app/[locale]/admin/analytics/user-agents.tsx` - User agents
- `app/[locale]/admin/analytics/services.ts` - Data services
- `app/[locale]/admin/analytics/loading.tsx` - Loading state
- `app/[locale]/admin/analytics/error.tsx` - Error handling

### API Routes
- `app/api/analytics/events/route.ts` - Event tracking
- `app/api/analytics/page-view/route.ts` - Page views
- `app/api/analytics/sessions/route.ts` - Sessions
- `app/api/analytics/realtime/route.ts` - Real-time data
- `app/api/analytics/geographic/route.ts` - Geographic data
- `app/api/analytics/user-agents/route.ts` - User agents
- `app/api/analytics-init/route.ts` - Initialization
- `app/api/ab-testing/experiments/route.ts` - Experiments
- `app/api/ab-testing/results/route.ts` - Test results

### Database Schema
- `analytics_events` table - Event storage
- `analytics_sessions` table - Session data
- `ab_experiments` table - A/B test definitions
- `ab_assignments` table - User assignments
- `ab_conversions` table - Conversion tracking

### Supporting Files
- `scripts/test-analytics.ts` - Analytics testing script
- `components/ui/charts.tsx` - Chart components
- `components/ui/DynamicLineChart.tsx` - Line charts
- `components/ui/DynamicBarChart.tsx` - Bar charts

### Test Files
- `__tests__/utils/analytics.test.ts` - Unit tests
- `app/test-ab/page.tsx` - A/B test page

### Migration Files
- `20250106000001_add_analytics.sql` - Analytics tables
- `20250110000005_enhance_analytics_schema.sql` - Enhancements
- `20250710172003_add_ab_testing_system.sql` - A/B testing
- `20250710184757_fix_ab_testing_rls_policies.sql` - RLS fixes