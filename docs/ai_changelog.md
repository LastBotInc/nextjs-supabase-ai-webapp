# AI Changelog

## Recent Changes

### 2025-01-10 - LastBot Chat Widget Integration
- **Added LastBot chat widget support** to the application
- **Created LastBotWidget component** (`components/lastbot/LastBotWidget.tsx`) with configurable environment variables
- **Updated Content Security Policy** in `next.config.js` to allow LastBot domains:
  - Added `https://*.lastbot.com` and `https://assets.lastbot.com` to script-src
  - Added `https://*.lastbot.com` and `wss://*.lastbot.com` to connect-src
  - Added `https://*.lastbot.com` to frame-src and child-src
- **Environment variables added**:
  - `NEXT_PUBLIC_ENABLE_LASTBOT_ONE` - Boolean to enable/disable widget
  - `NEXT_PUBLIC_LASTBOT_BASE_URL` - Base URL for LastBot widgets
  - `NEXT_PUBLIC_LASTBOT_WIDGET_ID` - Unique widget identifier
- **Integrated widget into root layout** for global availability on public pages
- **Added comprehensive unit tests** for the LastBot widget component
- **Widget features**:
  - Conditional rendering based on environment variables
  - Automatic script loading with error handling
  - Configurable widget properties (auto-open, fullscreen, etc.)
  - Development-only debug logging

## 2025-01-10 - Comprehensive User Agent Analytics Implementation

### Added
- **User Agent Parser Library** (`lib/user-agent-parser.ts`):
  - Comprehensive user agent string parsing using `ua-parser-js`
  - Browser, OS, device type, and engine detection
  - Bot/crawler detection with 15+ indicators
  - Device type classification (mobile, tablet, desktop)
  - Browser version analysis and "modern browser" detection
  - Geographic and architecture information extraction
  - Diversity index calculations for analytics insights

- **User Agent Analytics API** (`app/api/analytics/user-agents/route.ts`):
  - GET endpoint for user agent analytics with date range filtering
  - POST endpoint for individual user agent parsing
  - Batch parsing and database update functionality
  - Chart-ready data formatting for browsers, OS, devices, and versions
  - Time series analysis for browser/device diversity trends
  - Comprehensive insights calculation (diversity, modern browser %, etc.)

- **User Agent Analytics Dashboard** (`app/[locale]/admin/analytics/user-agents.tsx`):
  - Complete analytics dashboard with 8 different chart types
  - Pie chart for browser distribution
  - Bar chart for operating systems
  - Custom device type visualization with progress bars
  - Horizontal bar chart for browser versions
  - Time series chart for diversity trends over time
  - Key metrics cards with real-time data
  - Parse user agents button for database updates
  - Loading states and empty state handling
  - Responsive design with grid layouts

- **Analytics Dashboard Integration**:
  - Added "User Agents" tab to main analytics dashboard
  - Integrated with existing date range selection
  - Consistent styling with other analytics components
  - Real-time refresh capabilities

- **Comprehensive Translations**:
  - English, Finnish, and Swedish translations for all UI elements
  - Culturally appropriate terminology for each language
  - Technical terms properly localized

### Technical Features
- **Advanced User Agent Analysis**:
  - Simpson's Diversity Index for browser ecosystem measurement
  - Modern browser percentage calculation
  - Bot traffic detection and filtering
  - Device vendor and model identification
  - CPU architecture detection
  - Screen resolution and connection type analysis

- **Performance Optimizations**:
  - Batch processing for database updates
  - Efficient chart data formatting
  - Loading skeletons for better UX
  - Lazy loading for large datasets

- **Data Insights**:
  - Browser market share analysis
  - Operating system distribution
  - Device type trends
  - Version fragmentation analysis
  - Geographic technology adoption patterns

### Database Integration
- Seamless integration with existing `analytics_events` table
- Automatic parsing of existing user agent strings
- Real-time data updates and visualization
- Support for historical trend analysis

### Dependencies Added
- `ua-parser-js`: User agent string parsing
- `@types/ua-parser-js`: TypeScript definitions
- Enhanced Recharts usage for specialized charts

This implementation provides comprehensive user agent analytics comparable to Google Analytics, with detailed browser, OS, and device insights, trend analysis, and actionable business intelligence for understanding your website's audience technology preferences.

## 2025-01-10 - Enhanced Analytics Dashboard with Charts and Date Selection

### Added
- **Interactive Charts**: Added comprehensive chart visualizations using Recharts library
  - Area chart for page views over time with gradient fills
  - Horizontal bar chart for top pages performance
  - Pie chart for traffic sources distribution
  - Donut chart for device types breakdown
  - Line chart for engagement metrics trends
- **Enhanced Date Selection**: Added comprehensive date range selector with options:
  - Last Hour, Last 24 Hours, Last 7 Days, Last 30 Days, Last 90 Days, Last Year
- **Empty State Handling**: Added proper empty states for all charts when no data is available
- **Real Data Integration**: Fixed all charts to use only real database data instead of mock data

### Fixed
- **Removed Mock Data**: Eliminated all random/fake data generation from charts
- **Proper Loading States**: Added skeleton loading for better UX
- **Metric Cards**: Removed fake percentage changes, showing only real metrics
- **Translation Updates**: Added comprehensive translations for analytics features

### Enhanced
- **Chart Interactions**: Added tooltips, legends, and responsive containers
- **Visual Design**: Consistent color schemes and professional styling
- **Performance**: Optimized chart rendering and data processing
- **Accessibility**: Proper ARIA labels and keyboard navigation

The analytics dashboard now provides accurate, real-time insights with professional-grade visualizations and comprehensive user agent analysis capabilities.

## 2025-01-10 - Analytics System Phase 1 Implementation

### Database Schema Enhancement
- **Extended analytics_events table** with 20+ new columns for comprehensive tracking:
  - Event categorization (event_category, event_action, event_label)
  - Page metadata (page_title, page_load_time)
  - Device information (browser, os, device_type, screen_resolution)
  - Geographic data (region, timezone)
  - Engagement metrics (scroll_depth, time_on_page)
  - E-commerce tracking (revenue, currency, items)
  - Custom dimensions and metrics support
- **Enhanced analytics_sessions table** with engagement scoring
- **Real-time views** (analytics_realtime, analytics_active_sessions)
- **Materialized view** (analytics_hourly_stats) for performance
- **Database functions** for engagement scoring and automated triggers
- **Comprehensive indexes** for query performance optimization

### Analytics Library Rewrite
- **Complete rewrite** of `lib/analytics.ts` with Google Analytics 4-like capabilities
- **Enhanced event tracking** with categories, actions, labels, and custom dimensions
- **Scroll depth tracking** with milestone events (25%, 50%, 75%, 100%)
- **Time-on-page measurements** using Page Visibility API for accuracy
- **Advanced device detection** (browser, OS, screen resolution, connection type)
- **Geographic tracking** with timezone and region detection
- **Specialized tracking functions**:
  - `trackClick()` - Link and button interactions
  - `trackFormSubmit()` - Form completion tracking
  - `trackDownload()` - File download events
  - `trackVideoPlay()` - Media engagement
  - `trackSearch()` - Search query tracking
  - `trackPurchase()` - E-commerce transactions
  - `trackCustomEvent()` - Flexible custom events
- **Auto-tracking setup** for common user interactions
- **Enhanced session management** with 30-minute expiration
- **Reliable page unload tracking** using sendBeacon API
- **SPA route change detection** for Next.js navigation

### API Endpoints Enhancement
- **Updated event tracking API** (`app/api/analytics/events/route.ts`) to handle enhanced properties
- **Enhanced session API** (`app/api/analytics/sessions/route.ts`) for new session data
- **New real-time API** (`app/api/analytics/realtime/route.ts`) for live analytics
- **Comprehensive error handling** and validation
- **TypeScript type safety** throughout the API layer

### Component Updates
- **Enhanced AnalyticsInitializer** with new tracking capabilities
- **Auto-tracking setup** for common interactions
- **SPA navigation detection** for accurate page view tracking
- **Updated analytics services** with comprehensive data fetching

### Database Type Generation
- **Generated updated TypeScript types** from enhanced schema using Supabase CLI
- **Type-safe database operations** throughout the application

This implementation establishes a robust foundation for advanced analytics comparable to Google Analytics 4, with comprehensive event tracking, real-time capabilities, and extensive customization options.

## 2025-05-03
- **Feat:** Updated translations admin page namespace mappings:
  - Cleaned up namespace mappings in the translations admin page to only include existing namespaces
  - Updated `utils/i18n-helpers.ts` to only return namespaces that actually exist in the messages directory
  - Removed 26 non-existent namespaces (Billing, Campaigns, Calculators, etc.) from the namespace list
  - Simplified namespace mapping labels to use English names for better clarity
  - Removed path filter that was limiting available namespaces in the UI
  - All 16 actual namespaces are now properly mapped and available for editing

- **Feat:** Implemented namespace-based localization structure:
  - Created a script (`scripts/split-locales.js`) to split monolithic locale files into separate namespace files
  - Organized translations by feature/component under locale-specific folders (en/, fi/, sv/)
  - Added backup mechanism to preserve original locale files
  - Generated comprehensive localization report showing namespace coverage across all locales
  - Added npm script `split-locales` to package.json
  - Created detailed README.md in the messages directory documenting the new structure
  - Updated documentation in architecture.md, frontend.md, and .cursorrules
  - Added new `<localize>` action to .cursorrules with language-specific guidance for translations

## 2025-03-25
- Enhanced the Gemini AI tool with advanced capabilities:
  - Added document processing support for PDF, DOCX, and other file types
  - Implemented Google Search grounding feature for real-time information
  - Added structured JSON output functionality with predefined schemas
  - Fixed API compatibility with the latest @google/genai library (v0.7.0)
  - Updated documentation in .cursorrules with examples

## 2024-03-21
- Rescoped project from LastBot website to "AI-Powered Next.js Template for Cursor IDE"
- Updated project documentation:
  - Revised project description and core features
  - Restructured frontend documentation to focus on template features
  - Updated backend documentation to emphasize AI integration
  - Removed company-specific content and features
  - Added comprehensive AI service integration documentation

## 2023-07-27
- **Fix Build Errors:** Resolved `Dynamic server usage` errors during `npm run build` by adding `export const dynamic = 'force-dynamic';` to necessary page files (admin layout, privacy, root locale page, test, account pages, profile settings, most auth pages). Ignored build-time i18n database errors as requested. Build now completes successfully despite some remaining dynamic usage warnings.

## [Current Session]
- **Fix:** Resolved synchronous access errors for `searchParams` and `params` in multiple page components (`/admin/landing-pages`, `/blog`, `/[slug]`).
- **Fix:** Replaced insecure `getSession`/`onAuthStateChange` usage with `getUser()` in `AuthProvider` and `middleware` as per Supabase recommendations.
- **Fix:** Addressed authentication flow issues caused by the `getUser` refactor by refining middleware cookie handling.
- **Fix:** Removed extraneous Supabase auth debug logs by removing `DEBUG_AUTH` env variable.
- **Fix:** Resolved `supabase.from is not a function` error on public landing pages by using `createServerClient` with anon key.
- **Fix:** Addressed RLS permission errors on public landing pages (guided user to fix policy, code already correct).
- **Feat:** Added a 'Published' switch to the landing page admin form (`LandingPageForm.tsx`).
- **Fix:** Corrected the landing page editor (`[id]/page.tsx`) to use PATCH for updates and POST for creates.
- **Docs:** Updated the `Available Scripts` section in `README.md` to accurately reflect the command-line tools defined in `.cursorrules`.
- **Chore:** Added `NODE_ENV=production` prefix to production-related npm scripts in `package.json`.

*   Fixed landing page editor form showing empty fields due to missing API route for fetching single page by ID. Added `app/api/landing-pages/[id]/route.ts`.
*   Fixed Supabase RLS policy preventing anonymous users from viewing published landing pages. Refined RLS policies in migration `20250407180210`.
*   Fixed Next.js 15 warning by awaiting `params` in API route and `generateMetadata`.
*   Redesigned public landing page (`/[slug]`) styling using Tailwind CSS, added hero section with generated background, and improved typography.
*   Added dynamic CTA fields (`cta_headline`, `cta_description`, etc.) to `landing_pages` table (migration `20250407182326`).
*   Added "CTA" tab and fields to landing page editor.
*   Updated public landing page to display CTA content from the database.
*   Fixed missing translation keys for editor tabs/buttons.
*   Fixed Tiptap editor hydration error by setting `immediatelyRender: false`.
*   Removed unused preload link from `app/layout.tsx`.
*   Adjusted prose font sizes and colors for better readability on landing page.
*   Fixed i18n-ally translation detection issue by standardizing translation key paths in analytics components. Added missing translation keys for analytics fields (gaMeasurementId, gtmContainerId, fbPixelId, linkedinPixelId) to all language files.

## AI Changes Log

### 2025-06-04: Enhanced Video Generation Tool with Integrated Image Generation

- Enhanced the generate-video tool to support integrated image-to-video workflow
- Added `--image-prompt` parameter to generate an image with OpenAI GPT-image-1 before video creation
- Added support for image style and size parameters for generated images
- Improved URL handling for Replicate models that require image URLs
- Fixed compatibility issues between different model image input requirements
- Added warning for local image files which may not be supported by all models
- Added OpenAI dependency for image generation functionality

### 2025-06-03: Enhanced Video Generation Tool with Kling AI Models

- Updated the generate-video tool to support more Replicate video generation models
- Added support for Kling v1.6 standard and Kling v2.0 models
- Made Kling v1.6 the default model (previously minimax)
- Added support for aspect ratio selection (16:9, 9:16, 1:1) for supported models
- Enhanced image-to-video capabilities with proper parameter handling per model
- Added negative prompt and cfg_scale parameters for finer control
- Improved TypeScript typing with a ModelConfig interface
- Fixed module import issues for better compatibility

### 2025-04-20: Added OpenAI GPT-image-1 and DALL-E Image Generation Tool

- Created a new command-line tool for both image generation and editing using OpenAI's latest models
- Added support for GPT-image-1 and DALL-E 3 models
- Implemented advanced prompt optimization using GPT-4 Vision
- Added reference image support for GPT-image-1
- Configured various options for customization (size, style, quality)
- Updated package.json with necessary dependencies
- Added documentation in .cursorrules

### 2025-04-14: Enhanced GitHub CLI Tool with Task Management

- Installed inngest library for background task/event support.
- Added inngest client in lib/inngest-client.ts.
- Added sample background function in lib/inngest-functions.ts.
- Added API route handler in app/api/inngest/route.ts for Inngest event/function execution.

## 2025-06-05: Enhanced Homepage with AI-Generated Video Background

- Added the AI-generated video as a dynamic background on the homepage
- Implemented a fallback mechanism that shows a static image until the video loads
- Added graceful error handling to try multiple paths for video loading
- Improved loading experience with smooth opacity transitions
- Ensured the video is responsive across all device sizes
- Enhanced code with proper TypeScript typing and useRef for video control

## 2025-06-05: Fixed Homepage Hero Layout with Static Image

- Replaced video hero with static image solution due to persistent video loading issues
- Created separate StaticHero component for better maintainability
- Preserved the split-screen layout with text on left and visual element on right
- Optimized image loading with proper sizing attributes
- Added fallback gradient overlays for improved text readability
- Made the solution compatible with both local development and production deployment

