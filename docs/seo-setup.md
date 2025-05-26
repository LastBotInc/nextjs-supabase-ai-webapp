# SEO Integration Setup Guide

This guide covers the setup and configuration of the DataForSEO integration for comprehensive SEO analytics and monitoring.

## Prerequisites

1. **DataForSEO Account**: Sign up at [DataForSEO](https://dataforseo.com/) and obtain API credentials
2. **Admin Access**: Ensure you have admin privileges in the application
3. **Database Migration**: The SEO tables should be created via the migration system

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# DataForSEO API Configuration
DATAFORSEO_LOGIN=your_dataforseo_login
DATAFORSEO_PASSWORD=your_dataforseo_password
DATAFORSEO_API_URL=https://api.dataforseo.com/v3
DATAFORSEO_RATE_LIMIT=2000
DATAFORSEO_DEFAULT_LOCATION=2840
DATAFORSEO_DEFAULT_LANGUAGE=en
DATAFORSEO_DEFAULT_DEVICE=desktop
DATAFORSEO_TIMEOUT=30000
```

### Environment Variable Details

- **DATAFORSEO_LOGIN**: Your DataForSEO account login (required)
- **DATAFORSEO_PASSWORD**: Your DataForSEO account password (required)
- **DATAFORSEO_API_URL**: DataForSEO API base URL (default: https://api.dataforseo.com/v3)
- **DATAFORSEO_RATE_LIMIT**: API calls per minute limit (default: 2000)
- **DATAFORSEO_DEFAULT_LOCATION**: Default location code for searches (default: 2840 = US)
- **DATAFORSEO_DEFAULT_LANGUAGE**: Default language code (default: en)
- **DATAFORSEO_DEFAULT_DEVICE**: Default device type (default: desktop)
- **DATAFORSEO_TIMEOUT**: API request timeout in milliseconds (default: 30000)

## Database Setup

The SEO integration requires several database tables. Run the migration to create them:

```bash
supabase migration up --include-all
```

This creates the following tables:
- `seo_projects` - SEO project management
- `serp_tracking` - SERP position tracking
- `keyword_research` - Keyword research data
- `backlink_analysis` - Backlink analysis results
- `technical_audits` - Technical SEO audit results
- `content_analysis` - Content analysis data
- `dataforseo_tasks` - DataForSEO API task tracking

## Features Overview

### 1. SEO Projects
- Create and manage SEO projects for different domains
- Project-based organization of all SEO data
- Settings and configuration per project

### 2. SERP Tracking
- Track keyword rankings across search engines
- Historical position data
- SERP feature detection
- Location and device-specific tracking

### 3. Keyword Research
- Search volume analysis
- Keyword difficulty assessment
- Related keyword suggestions
- Competitive keyword analysis

### 4. Backlink Analysis
- Backlink profile monitoring
- Referring domain analysis
- Anchor text distribution
- Link quality assessment

### 5. Technical SEO Audits
- Page speed analysis
- Core Web Vitals monitoring
- Technical issue detection
- Mobile-friendliness checks

### 6. Content Analysis
- Content gap analysis
- Topic clustering
- Content performance metrics
- Competitor content analysis

## API Endpoints

### Projects Management
- `GET /api/seo/projects` - List all projects
- `POST /api/seo/projects` - Create new project
- `PUT /api/seo/projects` - Update project
- `DELETE /api/seo/projects` - Delete project

### SERP Tracking
- `POST /api/seo/serp/track` - Add keywords to track
- `GET /api/seo/serp/track` - Get tracked keywords
- `DELETE /api/seo/serp/track` - Remove keywords from tracking

### Keyword Research
- `POST /api/seo/keywords/research` - Perform keyword research
- `GET /api/seo/keywords/suggestions` - Get keyword suggestions
- `POST /api/seo/keywords/volume` - Get search volume data

### Backlinks
- `POST /api/seo/backlinks/analyze` - Analyze backlinks
- `GET /api/seo/backlinks/summary` - Get backlink summary
- `GET /api/seo/backlinks/referring-domains` - Get referring domains

### Technical Audits
- `POST /api/seo/technical/audit` - Start technical audit
- `GET /api/seo/technical/results` - Get audit results
- `POST /api/seo/technical/lighthouse` - Run Lighthouse audit

## Usage Examples

### Creating a New SEO Project

```typescript
const response = await fetch('/api/seo/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'My Website SEO',
    domain: 'example.com',
    description: 'SEO tracking for main website',
    settings: {
      defaultLocation: 2840, // US
      defaultLanguage: 'en',
      trackingFrequency: 'daily'
    }
  })
});
```

### Adding Keywords to Track

```typescript
const response = await fetch('/api/seo/serp/track', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    project_id: 'project-uuid',
    keywords: ['seo tools', 'keyword tracking', 'serp analysis'],
    location_code: 2840,
    language_code: 'en',
    search_engine: 'google'
  })
});
```

### Performing Keyword Research

```typescript
const response = await fetch('/api/seo/keywords/research', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    project_id: 'project-uuid',
    seed_keywords: ['digital marketing'],
    location_code: 2840,
    language_code: 'en',
    include_serp_info: true
  })
});
```

## DataForSEO Location Codes

Common location codes for targeting:

- **2840** - United States
- **2826** - United Kingdom  
- **2124** - Canada
- **2036** - Australia
- **2276** - Germany
- **2250** - France
- **2724** - Spain
- **2380** - Italy
- **2752** - Sweden
- **2246** - Finland

## Rate Limiting and Costs

- **Rate Limit**: 2000 API calls per minute
- **Cost Optimization**: Use Standard mode for batch processing, Live mode for real-time data
- **Task Management**: DataForSEO uses a task-based system - submit tasks, then retrieve results
- **Monitoring**: Track API usage and costs through the DataForSEO dashboard

## Error Handling

The integration includes comprehensive error handling:

- **Authentication Errors**: Invalid credentials
- **Rate Limiting**: Automatic retry with exponential backoff
- **API Errors**: Detailed error messages and status codes
- **Network Issues**: Timeout and connection error handling

## Security Considerations

- **Environment Variables**: Store credentials securely in environment variables
- **API Access**: Restrict admin access to SEO features
- **Data Privacy**: Handle SEO data according to privacy regulations
- **Rate Limiting**: Implement client-side rate limiting to prevent abuse

## Monitoring and Maintenance

- **Task Status**: Monitor DataForSEO task completion
- **Data Freshness**: Set up automated data refresh schedules
- **Error Logging**: Monitor API errors and failures
- **Cost Tracking**: Monitor DataForSEO usage and costs

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD
   - Check DataForSEO account status

2. **Rate Limit Exceeded**
   - Reduce request frequency
   - Implement proper rate limiting

3. **Task Timeout**
   - Increase DATAFORSEO_TIMEOUT value
   - Check DataForSEO service status

4. **Database Errors**
   - Verify migration was successful
   - Check database connection

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=dataforseo:*
```

This will log all DataForSEO API requests and responses for troubleshooting.

## Support

For issues related to:
- **DataForSEO API**: Contact DataForSEO support
- **Integration Issues**: Check the application logs and error messages
- **Feature Requests**: Submit through the admin interface

## Next Steps

After setup:
1. Create your first SEO project
2. Add keywords to track
3. Set up automated reporting
4. Configure alerts for ranking changes
5. Explore advanced features like competitor analysis 