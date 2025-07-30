# SEO & Marketing Subsystem

## Overview

The SEO & Marketing subsystem provides comprehensive tools for search engine optimization, digital marketing, and online presence management. It includes advanced SEO analysis, keyword research, SERP tracking, landing page creation, and backlink monitoring. The system integrates with multiple SEO data providers and AI services to deliver actionable insights and automate marketing tasks.

This subsystem empowers marketers and content creators to optimize their online presence through data-driven strategies. It offers everything from technical SEO audits to AI-powered content optimization, ensuring maximum visibility and engagement across search engines and marketing channels.

## Key Components

### SEO Dashboard (`app/[locale]/admin/seo/`)
- **page.tsx**: Main SEO dashboard
- **SEODashboard.tsx**: SEO metrics overview
- **keywords/page.tsx**: Keyword research and tracking
- **technical/page.tsx**: Technical SEO audit
- **backlinks/page.tsx**: Backlink analysis
- **projects/**: SEO project management

### Landing Pages (`app/[locale]/admin/landing-pages/`)
- **LandingPageForm.tsx**: Landing page builder
- **SeoSettings.tsx**: Page-level SEO configuration
- **Analytics.tsx**: Landing page analytics
- **CtaSettings.tsx**: Call-to-action optimization
- **CustomCode.tsx**: Custom tracking codes

### Marketing Components
- **WebsiteAnalysis.tsx**: Site-wide SEO analysis
- **SERPAnalysisModal.tsx**: SERP feature tracking
- **ProjectSelector.tsx**: Multi-project management
- **SEOKeywordsSelector.tsx**: Keyword integration

### API Endpoints
- **app/api/seo/**: SEO data and analysis APIs
- **app/api/landing-pages/**: Landing page management
- **app/api/admin/seo/**: Admin SEO operations

## Dependencies

### External Dependencies
- DataForSEO API: SEO data provider
- AI Services: Content optimization
- Structured data libraries

### Internal Dependencies
- CMS: Content SEO optimization
- Analytics: Performance tracking
- AI Integration: Content generation
- Database: SEO data storage

## Entry Points

### Admin Interfaces
1. **SEO Dashboard**: `/[locale]/admin/seo`
2. **Keyword Research**: `/[locale]/admin/seo/keywords`
3. **Technical Audit**: `/[locale]/admin/seo/technical`
4. **Landing Pages**: `/[locale]/admin/landing-pages`
5. **SEO Projects**: `/[locale]/admin/seo/projects`

### Public Access
1. **Landing Pages**: `/preview/[id]` - Preview mode
2. **Dynamic Pages**: `/[locale]/[slug]` - Published pages
3. **Sitemap**: `/api/sitemap` - XML sitemap

## Data Flow

### SEO Analysis Flow
1. URL or domain submitted for analysis
2. Multiple SEO checks initiated in parallel
3. Technical audit performs on-page analysis
4. SERP data fetched for target keywords
5. Competitor analysis conducted
6. Results aggregated and scored
7. Recommendations generated with AI

### Landing Page Creation
1. Marketer defines page goals and target keywords
2. AI generates optimized content structure
3. SEO settings configured (meta, schema)
4. CTAs designed and placed strategically
5. Page published with automatic optimization
6. Analytics tracking initialized
7. Performance monitored and improved

### Keyword Research Flow
1. Seed keywords input by user
2. AI generates related keyword ideas
3. Search volume and difficulty analyzed
4. SERP features identified for each keyword
5. Keywords grouped by intent and topic
6. Content opportunities highlighted
7. Tracking initiated for selected keywords

## Key Patterns

### SEO Meta Generation
```typescript
export function generateMetadata({ title, description, keywords, locale }) {
  return {
    title: `${title} | ${siteName}`,
    description,
    keywords: keywords.join(', '),
    openGraph: {
      title,
      description,
      locale,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    }
  };
}
```

### Structured Data Implementation
```typescript
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: page.title,
  description: page.description,
  url: `${baseUrl}/${locale}/${page.slug}`,
  inLanguage: locale
};
```

### Landing Page Publishing
```typescript
// Publish with SEO optimization
await publishLandingPage({
  ...pageData,
  seo_settings: {
    meta_title: optimizedTitle,
    meta_description: optimizedDescription,
    canonical_url: canonicalUrl,
    structured_data: structuredData
  }
});
```

## File Inventory

### SEO Components
- `app/[locale]/admin/seo/page.tsx` - SEO dashboard
- `app/[locale]/admin/seo/keywords/page.tsx` - Keyword research
- `app/[locale]/admin/seo/technical/page.tsx` - Technical SEO
- `app/[locale]/admin/seo/backlinks/page.tsx` - Backlink analysis
- `app/[locale]/admin/seo/projects/page.tsx` - Project listing
- `app/[locale]/admin/seo/projects/new/page.tsx` - New project
- `app/[locale]/admin/seo/projects/[id]/page.tsx` - Project details
- `app/[locale]/admin/seo/projects/[id]/edit/page.tsx` - Edit project

### Landing Page Components
- `app/[locale]/admin/landing-pages/page.tsx` - Landing page list
- `app/[locale]/admin/landing-pages/[id]/page.tsx` - Page editor
- `app/[locale]/admin/landing-pages/[id]/LandingPageForm.tsx` - Form
- `app/[locale]/admin/landing-pages/[id]/SeoSettings.tsx` - SEO config
- `app/[locale]/admin/landing-pages/[id]/Analytics.tsx` - Analytics
- `app/[locale]/admin/landing-pages/[id]/CtaSettings.tsx` - CTAs
- `app/[locale]/admin/landing-pages/[id]/CustomCode.tsx` - Custom code
- `app/[locale]/admin/landing-pages/[id]/schema.ts` - Validation
- `app/[locale]/admin/landing-pages/LandingPagePublishToggle.tsx`

### Admin Components
- `components/admin/seo/SEODashboard.tsx` - Dashboard component
- `components/admin/seo/WebsiteAnalysis.tsx` - Site analysis
- `components/admin/seo/SERPAnalysisModal.tsx` - SERP tracking
- `components/admin/seo/ProjectSelector.tsx` - Project selector
- `components/landing-page/seo-settings.tsx` - SEO settings
- `components/landing-page/analytics.tsx` - Analytics view
- `components/landing-page/custom-code.tsx` - Code injection

### API Routes
- `app/api/seo/keywords/route.ts` - Keyword management
- `app/api/seo/keywords/research/route.ts` - Keyword research
- `app/api/seo/keywords/ai-generate/route.ts` - AI keywords
- `app/api/seo/projects/route.ts` - SEO projects
- `app/api/seo/serp/analysis/route.ts` - SERP analysis
- `app/api/seo/serp/track/route.ts` - SERP tracking
- `app/api/admin/seo/backlinks/route.ts` - Backlinks
- `app/api/admin/seo/technical-audit/route.ts` - Technical audit
- `app/api/admin/seo/website-analysis/route.ts` - Site analysis
- `app/api/landing-pages/route.ts` - Landing pages CRUD
- `app/api/landing-pages/[id]/route.ts` - Page operations
- `app/api/landing-pages/[id]/publish/route.ts` - Publishing
- `app/api/landing-pages/[id]/unpublish/route.ts` - Unpublishing
- `app/api/landing-pages/generate/route.ts` - AI generation
- `app/api/sitemap/route.ts` - Sitemap generation

### Supporting Files
- `lib/seo/locations.ts` - SEO location data
- `lib/dataforseo/client.ts` - DataForSEO client
- `lib/dataforseo/config.ts` - API configuration
- `types/seo.ts` - SEO type definitions
- `utils/metadata.ts` - Metadata utilities
- `components/structured-data.tsx` - Schema.org data
- `scripts/seed-seo-project.ts` - SEO project seeding
- `tools/submit-sitemap.ts` - Sitemap submission

### Database Schema
- `seo_projects` - SEO project management
- `seo_keywords` - Keyword tracking
- `seo_rankings` - SERP position tracking
- `seo_backlinks` - Backlink monitoring
- `seo_audit_results` - Technical audit data
- `landing_pages` - Landing page content

### Migration Files
- `20241230000000_add_seo_tables.sql` - Initial SEO tables
- `20250526170521_add_seo_tables.sql` - Additional tables
- `20250121104206_add_landing_pages.sql` - Landing pages
- `20250407180210_fix_landing_page_rls.sql` - RLS policies
- `20250407182326_add_cta_fields_to_landing_pages.sql` - CTA fields