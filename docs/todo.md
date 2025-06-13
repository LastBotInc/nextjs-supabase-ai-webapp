# Project Tasks

## Public Pages

### Home Page
- [ ] Hero section with value proposition
- [ ] Ready-made solutions section
- [ ] Custom solutions section
- [ ] Featured customers carousel
- [ ] Customer success stories
- [ ] Why choose LastBot section
- [ ] Featured use cases
- [ ] Call-to-action for demo booking

### Services Page
- [ ] AI Strategy Consulting section
- [ ] Custom AI Development section
- [ ] AI Integration Services section
- [ ] Training and Support section
- [ ] Pricing information section

### Use Cases Page
- [ ] Customer Service AI section
- [ ] Customer Insights section
- [ ] AI Agents section
- [ ] Outbound Marketing section
- [ ] Case studies section

### Technology Page
- [ ] AI Core Platform section
- [ ] Integration capabilities section
- [ ] Security features section
- [ ] Scalability information section

### Company Page
- [ ] About LastBot section
- [ ] Team members section
- [ ] Company values section
- [ ] Contact information section
- [ ] Office locations section

### Careers Page
- [ ] Open positions section
- [ ] Company culture section
- [ ] Benefits section
- [ ] Application process section

### Blog Page
✅ Article listings
✅ Categories
✅ Search functionality
✅ Featured posts

### Contact Page
✅ Contact form
✅ Office locations
✅ Support channels

### Solutions Page
- [✅] Deep Profiling Section
  - [✅] Generate AI illustration for deep profiling
  - [✅] Add section content and layout
  - [✅] Add translations
  - [✅] Test responsiveness
  - [✅] Optimize image performance
  - [✅] Update layout (image left, text right)

- [✅] AI Personalized Email Marketing Section
  - [✅] Generate AI illustration for email marketing
  - [✅] Add section content and layout
  - [✅] Add translations
  - [✅] Test responsiveness
  - [✅] Optimize image performance
  - [✅] Update layout (text left, image right)

- [✅] AI Sales Coach Section
  - [✅] Add translations
  - [✅] Test responsiveness
  - [✅] Optimize image performance

### Healthcare Domain Page
- [✅] Create domains directory structure
- [✅] Design healthcare page layout
  - [✅] Hero section with healthcare focus
  - [✅] Remote healthcare solutions section
  - [✅] AI nurse assistant use cases
  - [✅] Doctor appointment optimization
  - [✅] Patient engagement features
  - [✅] Healthcare analytics section
  - [✅] Video showcase section
- [✅] Generate AI illustrations
  - [✅] Remote healthcare consultation
  - [✅] AI nurse assistant
  - [✅] Patient analytics dashboard
  - [✅] Smart scheduling system
- [✅] Implement page components
  - [✅] Create page layout
  - [✅] Add content sections
  - [✅] Add translations (English, Finnish, Swedish)
  - [✅] Integrate illustrations
  - [✅] Add video showcase
- [⏳] Test implementation
  - [✅] Unit tests for ImagePlaceholder component
  - [✅] Unit tests for Healthcare page
  - [ ] Integration tests
  - [ ] Responsive design tests
  - [ ] Performance tests

## Admin Section

### Blog Management
✅ Post editor
✅ Post list
✅ Category management
✅ Media library

### Product Management
✅ Product editor with AI content generation
✅ Product list and management
✅ MediaSelector component for image selection
  - ✅ Generic reusable media selection modal
  - ✅ Browse existing media assets with search
  - ✅ Upload new files directly from selector
  - ✅ AI image generation integration
  - ✅ MIME type filtering support
  - ✅ Complete internationalization (en/fi/sv)
  - ✅ Integration with ProductEditor
  - ✅ Documentation and usage examples

### User Management
✅ User list
✅ Role management
✅ Access control

### Contact Management
- [x] Contact list view
  - [x] Display all contacts
  - [x] Allow deleting contacts
  - [x] Add state management functionality
  - [x] Add unit tests for contact management
  - [ ] Add E2E tests for contact management
  - [x] Document contact management features

### Landing Pages Management
- [ ] Landing Page Admin Interface
  - [ ] Landing page list view with search and filters
  - [ ] Landing page editor with AI assistance
    - [ ] AI text generation using brand guidelines
    - [ ] AI image generation with brand style
  - [ ] SEO settings management
  - [ ] Preview functionality
  - [ ] Publishing workflow
  - [ ] Analytics integration

- [ ] Landing Page Data Model
  - [ ] Database schema for landing pages
  - [ ] Migration scripts
  - [ ] Type definitions
  - [ ] API endpoints

- [ ] Landing Page Frontend
  - [ ] Dynamic page routing
  - [ ] SEO component integration
  - [ ] Responsive layout components
  - [ ] Loading states
  - [ ] Error handling

- [ ] Landing Page Testing
  - [ ] Unit tests for components
  - [ ] Integration tests for AI features
  - [ ] E2E tests for admin workflow
  - [ ] SEO validation tests

## Technical Tasks

### Image Optimization Tasks
- [x] Optimize AI inbox image
  - [x] Remove background if needed (not needed for UI screenshot)
  - [x] Resize for web use (1024x768)
  - [x] Convert to optimal format (WebP)
  - [x] Ensure high quality (90% quality)

### Bug Fixes
- [✅] Fix keyword research competition and difficulty values.
- [x] Fix solutions page button widths
  - Modified Button component to use inline-flex and w-fit
  - Buttons now align with their content width
  - Tested the changes on solutions page
- [ ] Fix contact form email notifications
  - Investigate email sending failures
  - Fix Supabase Edge Function configuration
  - Test email notifications
  - Document the solution

### Setup
✅ Next.js 15 setup
✅ TypeScript configuration
✅ Tailwind CSS setup
✅ Supabase integration
✅ Authentication setup
✅ Internationalization setup

### Development
- [ ] Design system implementation
- [ ] Component library development
- [ ] Responsive design implementation
- [ ] Dark mode support
- [ ] Animation system
- [ ] SEO optimization
- [ ] Performance optimization
- [ ] Accessibility implementation
- [ ] Add LastBot account usage information to registration page

### Testing
✅ Jest setup
✅ Cypress setup
- [ ] Unit tests for components
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance testing
- [ ] Accessibility testing

### Deployment
✅ Development environment
✅ Staging environment
✅ Production environment
- [ ] CI/CD pipeline
- [ ] Monitoring setup
- [ ] Analytics integration

### Database Initialization
1. Initialize Production Database ⏳
   - Reset database to clean state
   - Create initial users
   - Create blog posts with AI-generated images
   - Import translations
   - Generate search embeddings
   - Verify data integrity

### SEO Enhancement Tasks ✅
1. Metadata Component Implementation ✅
   - Create reusable metadata component with localization support ✅
   - Support dynamic meta title and description ✅
   - Support OpenGraph and Twitter cards ✅
   - Support dynamic image generation for social sharing ✅
   - Support canonical URLs and alternates for languages ✅

2. Public Pages SEO Implementation ✅
   - Add metadata to home page ✅
   - Add metadata to services page ✅
   - Add metadata to solutions page ✅
   - Add metadata to tech page ✅
   - Add metadata to company page ✅
   - Add metadata to careers page ✅
   - Add metadata to contact page ✅
   - Create and optimize OG images for all pages ✅

3. Blog SEO Enhancement ✅
   - Enhance blog listing page metadata ✅
   - Improve blog post metadata ✅
   - Add structured data for blog posts ✅
   - Add JSON-LD support ✅
   - Add reading time and publish date metadata ✅
   - Create default OG image for blog posts ✅

4. SEO Testing and Validation ✅
   - Test metadata rendering ✅
   - Validate OpenGraph tags ✅
   - Test sitemap generation ✅
   - Test robots.txt configuration ✅
   - Test structured data implementation ✅
   - Test social media preview cards ✅
   - Test OG image rendering ✅

5. DataForSEO Integration ✅
   - Database schema implementation ✅
     - SEO projects table ✅
     - SERP tracking table ✅
     - Keyword research table ✅
     - Backlink analysis table ✅
     - Technical audits table ✅
     - Content analysis table ✅
     - DataForSEO tasks table ✅
   - TypeScript types and interfaces ✅
   - DataForSEO client library ✅
     - Rate limiting implementation ✅
     - Error handling ✅
     - All 12 API sections support ✅
   - API endpoints implementation ✅
     - SEO projects CRUD ✅
     - SERP tracking API ✅
     - Authentication and authorization ✅
   - Admin dashboard implementation ✅
     - SEO dashboard page ✅
     - Metrics overview ✅
     - Project management ✅
     - Activity tracking ✅
   - Navigation integration ✅
     - Admin navigation updates ✅
     - Multi-language support ✅
   - Configuration and setup ✅
     - Environment variables ✅
     - Location and language codes ✅
     - Setup documentation ✅
   - Keyword research page ✅
   - Keyword research API endpoint ✅
   - Multi-language translations ✅

6. SEO Monitoring Setup ✅
   - Setup SEO monitoring tools ✅
   - Configure SEO performance tracking ✅
   - Setup automated SEO testing ✅
   - Configure SEO error reporting ✅

## Next Priority Tasks
1. Implement Healthcare Domain Page
2. Implement home page hero section
3. Create services page layout
4. Develop use cases showcase
5. Build technology page

## Translation Tasks

### Add Missing Finnish Translations ✅

1. Add translations for Navigation section ✅
   - Menu items
   - Account related texts
   - Admin section labels

2. Add translations for Auth section ✅
   - Sign in/up forms
   - Error messages
   - Email verification texts

3. Add translations for Admin section ✅
   - Dashboard texts
   - Analytics labels
   - User management texts

4. Add translations for Media section ✅
   - Media library UI
   - Upload texts
   - File management texts

5. Add translations for CookieConsent ✅
   - Consent message
   - Button texts
   - Preferences texts

6. Add translations for Footer ✅
   - Copyright text
   - Links

7. Add translations for Privacy section ✅
   - Policy sections
   - Data protection texts
   - Cookie policy

8. Add translations for Profile section ✅
   - Settings texts
   - Preferences
   - Security settings

9. Add translations for Account section ✅
   - Account management
   - Security settings
   - Notification preferences

### Add Swedish Translations ⏳

1. Add Swedish locale configuration ✅
   - Update i18n config
   - Create Swedish translation file
   - Enable Swedish in language settings

2. Add translations for Navigation section ✅
   - Menu items
   - Account related texts
   - Admin section labels

3. Add translations for Auth section ✅
   - Sign in/up forms
   - Error messages
   - Email verification texts

4. Add translations for Admin section ✅
   - Dashboard texts
   - Analytics labels
   - User management texts

5. Add translations for Media section ✅
   - Media library UI
   - Upload texts
   - File management texts

6. Add translations for CookieConsent ✅
   - Consent message
   - Button texts
   - Preferences texts

7. Add translations for Footer ✅
   - Copyright text
   - Links

8. Add translations for Privacy section ✅
   - Policy sections
   - Data protection texts
   - Cookie policy

9. Add translations for Profile section ✅
   - Settings texts
   - Preferences
   - Security settings

10. Add translations for Account section ✅
    - Account management
    - Security settings
    - Notification preferences

### Deploy Translations ⏳

1. Deploy Swedish translations to production ⏳
   - Push database migrations
   - Deploy translation files
   - Verify language selection works
   - Test all translated pages

2. Verify Finnish translations in production ⏳
   - Test language switching
   - Verify all sections are translated
   - Check fallback behavior

3. Post-deployment validation ⏳
   - Test language persistence
   - Verify SEO metadata
   - Check performance impact

### Translation Tools Enhancement ⏳

1. Add clean parameter to import-translations script ✅
   - Add --clean parameter to delete existing translations ✅
   - Add confirmation prompt for safety ✅
   - Test with both dev and prod environments ✅
   - Update documentation ✅

## Internationalization
- ⏳ Fix locale-aware links in home page
  1. Update Button component to handle locale-aware routing
  2. Fix internal links in home page to include locale
  3. Test links work correctly for all locales
  4. Add unit tests for locale-aware routing
  5. Document the fix in learnings.md

## Research Section Implementation on Tech Page ⏳

1. Add new research section to tech page
   - Create new section component with grid layout
   - Add research topics:
     - AI Agents and workflows
     - Advanced RAG
     - Customer intelligence and personalisation
     - Reinforcement learning framework
   - Style with consistent theme
   - Add animations and visual elements

2. Add translations
   - Add new translation keys for research section
   - Add English translations
   - Ensure i18n support

3. Testing
   - Write unit tests for new section
   - Test responsive layout
   - Verify translations work

4. Documentation
   - Update changelog
   - Document new section in frontend.md

## Research Topic Pages Implementation ✅

1. Create individual pages for research topics ✅
   - Create page for AI Agents and Workflows ✅
   - Create page for Advanced RAG ✅
   - Create page for Customer Intelligence and Personalisation ✅
   - Create page for Reinforcement Learning Framework ✅
   - Add detailed content for each topic ✅
   - Implement consistent styling with tech page ✅
   - Add animations and visual elements ✅
   - Fix locale-aware navigation links ✅

2. Update Tech page
   - Add links to individual topic pages
   - Update hover effects to indicate clickable areas
   - Ensure proper navigation with locale support

3. Add translations
   - Add translation keys for new pages
   - Add English translations
   - Ensure i18n support

4. Testing
   - Test navigation between pages
   - Verify responsive layout
   - Test translations
   - Verify locale-aware routing

5. Documentation
   - Update changelog
   - Document new pages in frontend.md

## Rename use-cases to solutions
- [ ] Rename app/[locale]/use-cases directory to app/[locale]/solutions
- [ ] Update navigation paths in app/i18n/navigation.ts
- [ ] Update navigation links in app/components/Navigation.tsx
- [ ] Update links in app/[locale]/page.tsx
- [ ] Update translation keys in messages/en.json and messages/fi.json
- [ ] Update sitemap routes in app/api/sitemap/route.ts

# Todo List

## Blog
- ✅ Add subject field to blog posts
- ✅ Update blog page to support filtering by subjects
- ✅ Add latest news section to About page
- ✅ Add latest research section to Tech page
- ✅ Update seed script with categorized content
- ✅ Add translations for new blog subjects
- ✅ Rebrand Blog page to Brancoy HI Engine (content, structured data, styles)
- ⏳ Add RSS feed for blog posts
- ⏳ Add social sharing buttons
- ❌ Add blog post analytics
- ❌ Add blog post search

## Tech Page
- ✅ Add latest research section
- ✅ Add research areas overview
- ✅ Add core technology section
- ⏳ Add interactive demos
- ❌ Add research paper downloads
- ❌ Add API documentation

## About Page
- ✅ Add latest news section
- ✅ Update team section
- ✅ Add careers section
- ⏳ Add partner logos
- ❌ Add testimonials
- ❌ Add company timeline

## Next Priority Tasks
1. Add RSS feed for blog posts
2. Add interactive demos to tech page
3. Add partner logos to about page
4. Add blog post analytics
5. Add research paper downloads

## Security Enhancements

### Add Cloudflare Turnstile Captcha ✅
1. Install and configure Cloudflare Turnstile ✅
   - Install `react-turnstile` package ✅
   - Set up Cloudflare Turnstile site keys ⏳
   - Add environment variables for Turnstile configuration ⏳

2. Implement Turnstile in Registration Form ✅
   - Add Turnstile component to RegisterForm ✅
   - Update form submission to validate Turnstile token ✅
   - Add error handling for Turnstile validation ✅
   - Add unit tests for Turnstile integration ⏳

3. Implement Turnstile in Contact Form ✅
   - Add Turnstile component to ContactForm ✅
   - Update form submission to validate Turnstile token ✅
   - Add error handling for Turnstile validation ✅
   - Add unit tests for Turnstile integration ⏳

4. Add Server-side Validation ✅
   - Create middleware for Turnstile token validation ✅
   - Add token validation to registration API ✅
   - Add token validation to contact form API ✅
   - Add error handling for invalid tokens ✅

5. Documentation ✅
   - Update security documentation with Turnstile implementation ✅
   - Add Turnstile configuration guide ⏳
   - Document error handling and validation process ✅

## SEO and Metadata Update
- ✅ Update root layout metadata with brand information
- ✅ Update page-specific metadata
  - ✅ Blog posts
  - ✅ Admin pages
  - ✅ Services pages
  - ✅ Solutions pages
- ✅ Update robots.txt and sitemap
  - ✅ Update robots.txt with correct sitemap URL
  - ✅ Implement dynamic sitemap generation
- ⏳ Validate metadata implementation
  - ❌ Test metadata rendering
  - ❌ Validate OpenGraph tags
  - ❌ Test sitemap generation

## Performance Optimization Tasks

### Authentication Optimization ✅
1. [x] Optimize AuthProvider initialization
   - Reduce timeout from 5s to 3s to match Navigation timeout
   - Implement proper request cancellation
   - Add request caching
   - Improve error handling

2. [x] Optimize admin status check
   - Move admin check to separate hook
   - Implement proper caching
   - Add error boundary
   - Reduce unnecessary re-renders

3. [x] Improve session management
   - Implement proper session persistence
   - Add offline support
   - Optimize token refresh logic

### Resource Loading Optimization ⏳
1. [ ] Optimize font loading
   - Implement font preloading
   - Use font-display: swap
   - Reduce font file sizes

2. [ ] Optimize JavaScript bundles
   - Implement code splitting
   - Reduce main bundle size
   - Add proper lazy loading

3. [ ] Optimize image loading
   - Implement proper image optimization
   - Add lazy loading
   - Use WebP format
   - Implement proper caching

### Navigation Optimization ✅
1. [x] Optimize locale handling
   - Cache locale data
   - Implement proper fallbacks
   - Reduce unnecessary fetches

2. [x] Improve real-time updates
   - Optimize websocket connections
   - Implement proper connection management
   - Add offline support

3. [x] Reduce render blocking
   - Implement proper code splitting
   - Add Suspense boundaries
   - Optimize component tree

### Image Generation Tools
- [ ] Implement Flux image generation tool
  - [ ] Create flux.ts based on recraft.ts template
  - [ ] Add support for Flux model parameters
  - [ ] Add error handling and validation
  - [ ] Test with various prompts
  - [ ] Document usage in README.md

# Project Todo List

## Public Pages

### Solutions Page
- ✅ Add new sections:
  - ✅ Deep Customer Data Profiling
  - ✅ AI-Powered Email Marketing
  - ✅ AI Sales Coach
- ✅ Add translations for new sections:
  - ✅ English
  - ✅ Swedish
  - ✅ Finnish
- ✅ Update layout for better visual flow
- ✅ Improve accessibility with descriptive alt texts
- ✅ Generate and optimize section illustrations

## AI-First Customer Service Product Page ⏳

1. Create new product page
   - [ ] Create new route and page component for AI-first customer service
   - [ ] Add page metadata and SEO optimization
   - [ ] Design and implement hero section
   - [ ] Add feature highlights section
   - [ ] Add benefits section
   - [ ] Add case studies/testimonials section
   - [ ] Add call-to-action section
   - [ ] Add responsive images and animations
   - [ ] Implement i18n translations

2. Update Solutions Page
   - [ ] Add link to the new product page from customer service section
   - [ ] Update customer service section content
   - [ ] Add transition animations

3. Testing
   - [ ] Write unit tests for new components
   - [ ] Write e2e tests for navigation and interactions
   - [ ] Test responsive design across devices
   - [ ] Test i18n functionality

4. Documentation
   - [ ] Update frontend.md with new page structure
   - [ ] Document components and styling
   - [ ] Update translations documentation

### Presentations Feature
- [ ] Presentations Index Page
  - [ ] Create presentations directory structure
  - [ ] Design grid layout for presentation cards
  - [ ] Implement presentation card component
  - [ ] Add responsive grid layout
  - [ ] Add metadata and SEO

- [ ] Presentation Viewer
  - [ ] Create full-screen presentation layout
  - [ ] Implement slide navigation (keyboard, touch, buttons)
  - [ ] Add slide transitions
  - [ ] Add progress indicator
  - [ ] Add presentation controls (fullscreen, exit)
  - [ ] Implement responsive design
  - [ ] Add keyboard shortcuts

- [ ] "Navigating AI Transformation" Presentation
  - [ ] Design presentation layout and style
  - [ ] Create slide components
  - [ ] Generate AI illustrations for key concepts
  - [ ] Implement content sections:
    - [ ] AI-assisted development
    - [ ] AI agents integration
    - [ ] UX transformation
    - [ ] Company transformation
    - [ ] LastBot solutions
  - [ ] Add animations and transitions
  - [ ] Test responsive behavior
  - [ ] Add SEO metadata

- [ ] Testing
  - [ ] Unit tests for presentation components
  - [ ] Integration tests for navigation
  - [ ] E2E tests for presentation flow
  - [ ] Performance testing
  - [ ] Accessibility testing

## Metadata Testing Implementation ⏳

1. Create test utilities
- [✅] Create test helper for fetching metadata from pages
- [✅] Create metadata validation utilities
- [✅] Setup test data and mocks

2. Implement tests
- [✅] Create test file for metadata validation
- [✅] Implement tests for blog pages metadata
- [✅] Implement tests for presentation pages metadata
- [✅] Implement tests for static pages metadata
- [✅] Add Open Graph data validation
- [✅] Add Twitter card validation
- [ ] Add structured data validation

3. Documentation
- [✅] Document test approach in architecture.md
- [✅] Add examples of running metadata tests
- [ ] Document common metadata issues and solutions

4. Validation
- [ ] Run tests and fix any failures
- [ ] Validate test coverage
- [ ] Document any found metadata issues

Next priority: Run the tests and fix any failures

## Booking Calendar Implementation

### Database Setup ✅
1. Create booking_slots table ✅
2. Create booking_settings table ✅
3. Create bookings table ✅
4. Set up Row Level Security policies ✅
5. Create database functions for recurring operations ✅

### Backend API Implementation ✅
1. Implement public endpoints ✅
   - Available slots endpoint ✅
   - Create booking endpoint ✅
2. Implement protected endpoints ✅
   - Host slots management ✅
   - Settings management ✅
   - Bookings management ✅
3. Set up email notifications ✅
   - Configure SendGrid templates ✅
   - Implement notification triggers ✅

### Frontend Implementation ✅
1. Public Booking Page ✅
   - Calendar component ✅
   - Time slot selector ✅
   - Booking form ✅
   - Confirmation flow ✅
2. Host Calendar Management ✅
   - Calendar view ✅
   - Settings panel ✅
   - Bookings list ✅
3. Shared Components ✅
   - Calendar grid ✅
   - Time slot picker ✅
   - Settings forms ✅

### Testing ❌
1. Unit Tests
   - API endpoints
   - Database functions
   - Frontend components
2. Integration Tests
   - Booking flow
   - Settings management
   - Email notifications
3. E2E Tests
   - Complete booking process
   - Host management features

### Documentation ✅
1. API documentation ✅
2. Database schema ✅
3. Frontend components ✅
4. Testing guide ❌
5. Deployment instructions ❌

Next Priority Tasks:
1. Write unit tests for booking components
2. Create E2E tests for booking flow
3. Complete testing documentation
4. Write deployment guide

## Features

- ❌ Implement user profile management page
- ❌ Add blog commenting system
- ❌ Integrate newsletter signup
- ✅ Add admin functionality for landing pages (CRUD)
- ✅ Add `published` status control to landing page form
- ✅ Add `published` status toggle to landing page index
- ✅ Add image generation to landing page admin
- ✅ Add AI content generation to landing page admin

## Bugs

- ✅ Fix landing page RLS / public access
- ✅ Resolve synchronous `searchParams`/`params` access errors
- ✅ Fix Supabase auth warnings (`getUser` vs `getSession`)
- ✅ Fix broken authentication flow after refactor
- ✅ Remove extraneous Supabase auth debug logs

## Refactoring

- ❌ Refactor shared components into library
- ❌ Improve global state management

## Documentation

- ❌ Update README with setup instructions
- ❌ Document API endpoints

### Landing Page Feature
-   ✅ Implement basic landing page CRUD (Admin)
-   ✅ Implement public view for landing pages
-   ✅ Add publish/unpublish functionality
-   ✅ Add basic SEO fields (meta title, description)
-   ✅ Add custom code injection (head, css, js)
-   ✅ Fix landing page editor fields being empty on edit
-   ✅ Redesign public landing page view
-   ✅ Add dynamic CTA content management to landing pages

- [✅] Implement AI-powered product generation for Shopify (`shopify_product generate`)
  - [✅] Generate product text details using Gemini (including realistic pricing/variants)
  - [✅] Generate product image using Imagen 3
  - [✅] Create product in Shopify via Admin API
  - [✅] Upload generated image to Shopify
  - [✅] Associate uploaded image with the created product
- ✅ Fix Shopify product generation (price and description issues) - Price fixed, description requires metafields.

### Shopify Tool Enhancements
- ✅ Fix Shopify product generation (`generate`) to correctly handle description via metafields and adapt to API 2025-04 changes (`productSet`, `productVariantsBulkUpdate`).

- ✅ Further enhance `schema-detector` to extract vendor from URL and use it to influence schema naming and filename (e.g., `caffitella_product_feed.json`).

- ✅ Generate and save a JSON schema file for Shopify products including variants (`schemas/shopify_product_variants_schema.json`).

- ❌ Create `shopify-localisation-tool` for managing Shopify translations (pull/push from/to `messages/[locale]/shopify.json`).

✅ Define SQL schema for Products and Variants
✅ Define SQL schema for Categories (Collections)
✅ Define SQL schema for Inventory
✅ Define SQL schema for Orders and Fulfillments
✅ Define SQL schema for External Product Mappings table
✅ Create Supabase migration for Products and Variants
✅ Create Supabase migration for Categories
✅ Create Supabase migration for Inventory
✅ Create Supabase migration for Orders and Fulfillments
✅ Create Supabase migration for External Product Mappings
✅ Define SQL schema for Data Sources table
✅ Create Supabase migration for Data Sources table
❌ Implement data-source-importer tool script (Supabase insert failing)
❌ Add data-source-importer to .cursorrules and package.json
❌ Test data-source-importer tool

✅ Rebrand and scope the project to Brancoy hi-engine (update @brand-info.ts, @description.md, @frontend.md first)

### Brancoy HI Engine Homepage
- ⏳ Implement Homepage Structure (`app/[locale]/page.tsx`)
  - ✅ Hero Section (Headline, Sub-headline, CTAs, Background Image)
  - ✅ Key Benefits Bar (Data Accuracy, Faster Migration, AI Optimization)
  - ✅ "The Smartest Way to Move to Shopify" Section (Collect, Analyze, Localize)
  - ✅ Feature Deep Dive Sections (Content & SEO, Collaborate, Succeed with Shopify - with Images)
  - ✅ "The Foundation for Intelligent eCommerce" Section (Benefits, CTA for assessment)
  - ✅ "Why AI-Powered Migration?" Section (Reinforce key benefits)
  - ✅ Social Proof/Testimonials Section (Placeholder)
  - ✅ Final CTA Section ("Meet the Brancoy AI engine...")
  - ✅ Footer (Placeholder)
- ✅ Localize Homepage Content
  - ✅ Extract English content to `messages/en/Index.json`
  - ✅ Create and translate `messages/fi/Index.json`
  - ✅ Create and translate `messages/sv/Index.json`
  - ✅ Integrate `useTranslations` hook in `app/[locale]/page.tsx`
- ❌ Update `docs/frontend.md` if homepage implementation deviates from initial plan
- ❌ Test homepage responsiveness
- ❌ Review and refine homepage styling

### Brancoy HI Engine About Us Page
- ❌ Define About Us page structure in `docs/frontend.md` (based on existing placeholder)
- ✅ Create English translations in `messages/en/About.json`
- ✅ Create Finnish translations in `messages/fi/About.json`
- ✅ Create Swedish translations in `messages/sv/About.json`
- ✅ Implement About Us page component (`app/[locale]/about/page.tsx`)
  - ✅ Fix linter errors related to Link import and getTranslations usage
  - ✅ Integrate translations
  - ✅ Add section structure (Hero, Our Story, Team, Values, Why Partner, CTA)
  - ✅ Implement basic styling with Tailwind CSS
- ✅ Generate and integrate placeholder images (optional, for structure)
- ❌ Test About Us page responsiveness
- ❌ Review and refine About Us page styling

### Data Synchronization
- [ ] Implement Inngest cron job for polling data sources
  - [✅] Define Inngest function to fetch all `data_sources` (e.g., hourly cron) (`dispatchDataSourceSyncJobs`)
  - [✅] For each source, dispatch an Inngest event (e.g., `app/data.source.sync.requested`) with source details (in `dispatchDataSourceSyncJobs`)
  - [✅] Define Inngest function to listen to `app/data.source.sync.requested` (`syncProductDataSource`)
  - [✅] Fetch data from the source's `feed_url` (in `syncProductDataSource`)
  - [✅] Parse fetched data (JSON and XML) (in `syncProductDataSource`)
  - [✅] Compare fetched items with existing `products` via `external_product_mappings` (in `syncProductDataSource`)
  - [✅] Create new `products`, `product_variants`, and `external_product_mappings` for new items (in `syncProductDataSource`)
  - [✅] Update existing `products` and `product_variants` if changes are detected (in `syncProductDataSource`)
  - [✅] Implement robust error handling and update `data_sources` status (e.g., on fetch failure) (in `syncProductDataSource`)
  - [✅] Update `last_fetched_at` in `data_sources` on successful/failed attempt (in `syncProductDataSource`)
  - [ ] Add concurrency limits to product sync function if necessary (concurrency added to Shopify sync, can be added to `syncProductDataSource` if needed)
  - [✅] Register new Inngest functions in the API route (`dispatchDataSourceSyncJobs`, `syncProductDataSource`)
  - [ ] Test the cron job and sync process end-to-end (External Feed -> App DB)
  - [ ] Document the data synchronization process and Inngest functions (External Feed -> App DB)

- [ ] Implement App DB <-> Shopify Synchronization
  - [ ] App DB -> Shopify Sync:
    - [✅] Define Inngest function `syncLocalProductToShopify` to sync a single product from local DB to Shopify.
    - [✅] Trigger function with event `app/product.sync.to.shopify.requested` (carrying `internal_product_id`).
    - [✅] Fetch product and variants from local Supabase DB.
    - [✅] Prepare product data for Shopify GraphQL API (including metafields for description).
    - [✅] Check `external_product_mappings` for existing Shopify product ID.
    - [✅] If exists, update product in Shopify; otherwise, create new product.
    - [✅] Upsert Shopify product GID into `external_product_mappings` (variant mapping is a TODO within the function).
    - [✅] Register `syncLocalProductToShopify` in Inngest API route.
    - [ ] Implement a mechanism to trigger `app/product.sync.to.shopify.requested` events (e.g., from Admin UI, DB trigger, or batch job).
    - [ ] Handle image synchronization (deferred).
    - [ ] Thoroughly test App DB -> Shopify sync.
  - [ ] Shopify -> App DB Sync:
    - [✅] Implement UI-triggered Shopify product sync functionality
      - [✅] Create API endpoint `/api/admin/shopify/sync-products` for syncing products from Shopify
      - [✅] Add product sync UI section to admin data-sync page
      - [✅] Support both regular sync (50 products) and full sync (200 products, force mode)
      - [✅] Real-time progress display with statistics (total, created, updated, errors)
      - [✅] Comprehensive error handling and user feedback
      - [✅] Multilingual support (English, Finnish, Swedish)
    - [ ] Define Inngest function (e.g., `syncShopifyProductToLocalDB`) to fetch/sync a single product from Shopify to local.
    - [ ] Could be triggered by Shopify webhooks (e.g., on product create/update) or a periodic full sync.
    - [✅] Fetch product data from Shopify using GraphQL API.
    - [✅] Check `external_product_mappings` (source_name: 'shopify', external_product_id: Shopify GID).
    - [✅] If exists, update local `products`/`product_variants`.
    - [✅] If not, create new local `products`/`product_variants` and mapping.
    - [ ] Consider conflict resolution strategy (Shopify as source of truth?).
    - [✅] Test Shopify -> App DB sync via UI.
  - [ ] Document App DB <-> Shopify synchronization.

### Data Source Management
- [✅] Add Caffitella product feed as a data source via `data-source-importer` tool.

### Admin UI for Data Sync
- [✅] Design Admin UI for Data Sync Management (in `docs/frontend.md`)
  - [✅] Define views: List of `data_sources`, detailed view with logs/schema.
  - [✅] Outline components: Table, Status Badges, Action Buttons, Log Viewer.
- [✅] Develop Admin API Endpoints for Data Sync
  - [✅] `GET /api/admin/data-sources`: List all data sources (with admin protection).
  - [✅] `GET /api/admin/data-sources/[id]`: Get details for a specific data source (with admin protection).
  - [✅] `POST /api/admin/data-sources/[id]/trigger-sync`: Manually trigger sync (Inngest event) for a source (with admin protection).
  - [✅] `GET /api/admin/shopify/store-info`: Get Shopify store information and connection status.
  - [✅] `POST /api/admin/data-sources/add`: Add new data sources via URL.
- [✅] Implement Admin Frontend Pages for Data Sync (`app/[locale]/admin/data-sync/`)
  - [✅] `page.tsx`: Enhanced with Shopify store section and inline data source addition form.
  - [✅] `[id]/page.tsx`: Show detailed source information, schema, allow triggering sync.
  - [✅] Ensure pages use `AdminLayoutClient` and call new admin APIs.
- [✅] Update Navigation (`app/components/Navigation.tsx`)
  - [✅] Add "Data Sync" link to admin sidebar.
- [✅] Add translations for new Admin Data Sync UI elements.
  - [✅] Added comprehensive translations for Shopify integration and data source management.
  - [✅] Translations added for English, Finnish, and Swedish.
- [✅] Test Admin Data Sync UI and API functionality.
  - [✅] Enhanced UI with Shopify store detection and real-time status display.
  - [✅] Added inline form for adding new data sources.
  - [✅] Improved error handling and user feedback.

## UI/UX & Styling
- ✅ Define UI/UX patterns for Brancoy HI Engine in `docs/frontend.md`
- ✅ Update `docs/frontend.md` with new visual style guidelines based on reference image.
- ✅ Update `tailwind.config.ts` with new color palette and font families.
- ✅ Apply new visual styles (light theme, new color palette, button styles) to Homepage (`app/[locale]/page.tsx`)
- ✅ Create/Update a shared `Button` component with new styles.
- ⏳ Apply new visual styles to About Us page (`app/[locale]/about/page.tsx`)
- ✅ Apply new visual styles to Blog page (`app/[locale]/blog/page.tsx` and `app/[locale]/blog/[slug]/page.tsx`)
- ⏳ Review and update global styles (`styles/globals.css` or Tailwind config) to reflect new branding.
- ⏳ Ensure consistent typography across the application based on new guidelines.

✅ Apply new visual styles (light theme, dark contrasting sections, brand colors) to `app/[locale]/about/page.tsx`.
✅ Update logo in `app/components/Navigation.tsx` to `images/brancoy_logo_black.webp`.
✅ Update `app/components/Navigation.tsx` background to light blue and adjust text/link colors.

### Phase 6: Blog Page Styling & Global Styles

- [⏳] Fix Inngest job failure: "column data_sources.status does not exist"
  - [✅] Identify missing `status` column in `data_sources` table.
  - [✅] Identify `source_type` vs `feed_type` mismatch in `data_sources` table.
  - [✅] Create new migration `add_status_to_data_sources`.
  - [✅] Add DDL to create `status` column and rename `source_type` to `feed_type`.
  - [ ] User to run database migrations.

## Shopify Integration

### Articles Management
✅ Shopify Articles Tool Implementation
  ✅ Create shopify-articles-tool.cjs CLI tool
  ✅ Implement blog management (list, get, create, delete)
  ✅ Implement article management (list, get, create, update, delete)
  ✅ Add AI-powered article generation using Gemini
  ✅ Add Finnish translation support for articles
  ✅ Add GraphQL API integration following 2025-04 patterns
  ✅ Add comprehensive error handling and validation
  ✅ Test tool with existing Shopify store
  ✅ Add tool definition to .cursorrules
  ✅ Document implementation in ai_changelog.md

### Blog Sync Integration
❌ Internal Blog System Sync
  ❌ Create API endpoint for syncing Shopify articles to internal blog
  ❌ Create API endpoint for syncing internal blog posts to Shopify
  ❌ Implement bidirectional sync functionality
  ❌ Add conflict resolution for simultaneous edits
  ❌ Create admin UI for managing sync settings
  ❌ Add sync status monitoring and logging
  ❌ Test sync functionality end-to-end

✅ Fix "Cannot read properties of undefined (reading 'auth')" browser error when pressing "generate with AI" button at blog creation.

- [✅] Fix delete button in MediaGrid.tsx.
- [✅] Add download button to media grid.
- [✅] Make default image grid images a bit larger.

### Shopify Metafields Support System
- ✅ **Database Schema**: Create Supabase tables for metafield definitions and mappings
- ✅ **Metafield Detection**: Enhance data source schema detection to identify metafield candidates
- ✅ **Metafield Definition API**: Create endpoints to manage metafield definitions in Shopify
- ⏳ **Metafield Value Management**: Implement APIs to set/get metafield values for products/collections/etc
- ✅ **Schema-to-Metafield Tool**: Build tool to analyze API specs/schemas and generate metafield definitions
- ⏳ **Integration with Data Sources**: Auto-create metafields when importing data that doesn't match standard Shopify fields
- ❌ **Admin UI**: Create admin interface to manage metafield definitions and mappings
- ⏳ **Documentation**: Document the metafields system and its usage patterns

### Shopify Metafields Implementation Details
- ✅ **Core Tables**: `metafield_definitions`, `metafield_mappings`, `external_field_mappings`
- ✅ **API Endpoints**: `/admin/metafields/*` routes for CRUD operations
- ✅ **Shopify GraphQL Integration**: Use metafieldDefinitionCreate/metafieldsSet mutations
- ✅ **Field Detection Logic**: Analyze schemas to identify non-standard fields requiring metafields
- ✅ **Type Mapping**: Map JSON schema types to Shopify metafield types
- ⏳ **Validation Rules**: Implement metafield validation based on detected data patterns
- ⏳ **Bulk Operations**: Support bulk metafield creation and updates
- ❌ **Testing**: Comprehensive test coverage for metafield functionality

### Schema-to-Metafield Generator Tool
- ✅ **Tool Implementation**: `tools/schema-to-metafields-generator.cjs`
- ✅ **API Schema Analysis**: Analyze API specs/schemas for metafield candidates
- ✅ **JSON Schema Analysis**: Analyze JSON schemas for metafield candidates
- ✅ **CSV Header Detection**: Parse CSV files to identify potential metafields
- ✅ **Feed Analysis**: Enhance existing data source analysis for metafield detection
- ✅ **Definition Generation**: Auto-generate metafield definitions with appropriate types
