# AI Changelog

## 2024-07-13

- **Feat:** Implemented comprehensive Leasing Solutions page with:
  - Four main leasing types: Financial, Flexible, Maintenance, and MiniLeasing
  - Interactive monthly payment calculator for Financial Leasing
  - Detailed feature comparison table between leasing options
  - Case study showcase for Flexible Leasing
  - Pricing structure display for MiniLeasing
  - FAQ section with expandable/collapsible answers
  - Strong call-to-action section
- **i18n:** Added translations for Leasing Solutions page in English, Finnish, and Swedish
- **Navigation:** Updated navigation menu to include the Leasing Solutions page link
- **Components:** Created reusable UI components:

  - SectionContainer for consistent section styling
  - Extended Button component to support multiple variants including "white"
  - Vehicle-themed icon components

- **Brand:** Created custom Innolease logo with vehicle-themed icon and professional blue/gray color scheme
- **Update:** Replaced LastBot logo with new Innolease logo in the navigation component
- **Enhancement:** Used Gemini 2.0 model for higher quality text rendering in the logo
- **Optimization:** Processed the logo through image optimizer for best quality and performance
- **UI Improvement:** Created inverted version of the logo with white text and transparent background for better visibility on dark navigation bar
- **Fix:** Resolved logo transparency issues by creating a truly transparent PNG with white text and icon specifically optimized for dark backgrounds
- **Solution:** Implemented a pure SVG logo component to guarantee transparency and perfect white rendering on the black navigation bar
- **Fix:** Corrected SVG text rendering by replacing path-based text with proper SVG text element for better readability and accuracy

## 2024-07-12

- **Fix:** Improved text visibility throughout the Innolease home page by:
  - Enhancing text contrast by updating gray color values from light gray to darker variants
  - Adding appropriate text wrappers with explicit color classes for list items
  - Enhancing contrast for checkmarks, list labels, and icons
  - Adjusting color values in the CTA section for better readability
- **Asset:** Generated new leasing solutions and fleet management images using Gemini 2.0 model for improved text clarity
- **Enhancement:** Added proper text formatting (font-medium, font-semibold) in various sections

## 2024-07-11

- **Feat:** Implemented the Innolease home page with the following components:
  - Hero section with branded background and call-to-action
  - Leasing solutions section showcasing the four leasing options
  - Fleet management tools overview with visual representation
  - Client testimonials section with company references
  - Service partner network section highlighting Vianor, Euromaster, and A-Katsastus
  - Environmental responsibility section with emissions savings visualization
  - Clear call-to-action section for inquiries
- **Asset:** Generated brand-appropriate imagery for hero background, leasing solutions, and fleet management sections
- **Enhancement:** Added new icon components to support the UI (IconCar, IconTools, IconChart, etc.)
- **i18n:** Added translations in English, Finnish, and Swedish for all home page content

## 2024-07-10

- Rescoped the entire project to focus on Innolease vehicle leasing platform:
  - Updated brand information in `lib/brand-info.ts` to reflect Innolease's identity, tone, and messaging
  - Completely revised `docs/description.md` with Innolease's business model and features
  - Restructured `docs/frontend.md` with B2B vehicle leasing UI/UX patterns
  - Updated `docs/architecture.md` to focus on vehicle and fleet management architecture
  - Revised `docs/datamodel.md` with comprehensive vehicle leasing data models
  - Updated `docs/backend.md` with maintenance, fleet, and financial service integrations
  - Restructured `docs/todo.md` with a detailed roadmap for Innolease implementation
  - Emphasized Finnish, Swedish, and English internationalization

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

* Fixed landing page editor form showing empty fields due to missing API route for fetching single page by ID. Added `app/api/landing-pages/[id]/route.ts`.
* Fixed Supabase RLS policy preventing anonymous users from viewing published landing pages. Refined RLS policies in migration `20250407180210`.
* Fixed Next.js 15 warning by awaiting `params` in API route and `generateMetadata`.
* Redesigned public landing page (`/[slug]`) styling using Tailwind CSS, added hero section with generated background, and improved typography.
* Added dynamic CTA fields (`cta_headline`, `cta_description`, etc.) to `landing_pages` table (migration `20250407182326`).
* Added "CTA" tab and fields to landing page editor.
* Updated public landing page to display CTA content from the database.
* Fixed missing translation keys for editor tabs/buttons.
* Fixed Tiptap editor hydration error by setting `immediatelyRender: false`.
* Removed unused preload link from `app/layout.tsx`.
* Adjusted prose font sizes and colors for better readability on landing page.
* Fixed blog seeding script (`scripts/seed-blog.ts`) to use valid `subject` values allowed by the database schema (mapped `leasing-tips` and `ev` to `research`).
* Refined Finnish translations (`messages/fi.json`) for public pages (Index, Footer, About, LeasingSolutions, Blog) for natural language, correct phrasing, and standard capitalization.
* Modified blog seeding script (`scripts/seed-blog.ts`) to remove image generation/upload and use local image paths (`/images/blog/[slug].webp`) instead.
* Generated 8 featured images for blog posts (EN, FI, SV) using the `gemini-image` tool and saved them to `public/images/blog/`.
* Fixed `getTranslations` call and client component import path in `app/[locale]/leasing-solutions/page.tsx` to resolve build error.
* Replaced "LastBot" references with "Innolease" branding and content across multiple files (code, config, docs). Rewritten `AIBotMessage` component.
* Fixed build error in `app/layout.tsx` by removing duplicate static `metadata` export.
* Fixed `MISSING_MESSAGE` build error by adding `Index.meta` keys to `messages/en.json`.
* Added new "Campaigns" section to the home page (`components/pages/home/index.tsx`) with two placeholder vehicle campaigns (Ford Transit, Polestar 2) and generated images. Added placeholder translations to `messages/en.json`.

## 2024-08-13

- Fixed build error caused by duplicate Icon components in `app/components/Icons.tsx`.
- Corrected text color and contrast issues in the FAQ section on the Leasing Solutions page.
- Implemented the Blog page (`app/[locale]/blog/page.tsx`, `app/[locale]/blog/[slug]/page.tsx`):
  - Updated UI styles to match Innolease branding.
  - Replaced placeholder/LastBot content.
  - Updated blog seeding script (`scripts/seed-blog.ts`) with Innolease-relevant articles (Leasing Strategy, EV Transition, Maintenance Leasing, Case Study).
  - Added necessary translations (EN, FI, SV).
- Implemented the About Us page (`app/[locale]/about/page.tsx`):
  - Created page structure with sections for History, Values, Team, Coverage/Stats, Partners, CTA.
  - Applied Innolease branding and styles.
  - Added necessary translations (EN, FI, SV).
  - Fixed Button component type error to accept anchor attributes.
- Added placeholder Finnish and Swedish versions for two blog articles in `scripts/seed-blog.ts`.

## 2024-08-14

- **Fix:** Resolved build errors (`INSUFFICIENT_PATH`) in `utils/metadata.ts` by implementing a helper function (`getNestedTranslation`) to safely handle potentially nested translation keys (`meta.title`/`title`, `meta.description`/`description`) when generating page metadata.

## 2025-04-23: Navigation and Site Structure Implementation

- Redesigned `Navigation.tsx` with dropdown menus for improved information architecture
- Updated `Footer.tsx` with comprehensive four-column design
- Implemented placeholder pages for all Finnish site sections including:
  - Main navigation items (Leasing Services, For Customers, Car Rental, etc.)
  - Customer service pages
  - Tools and resources
  - Contact pages
- Created two detailed page templates:
  - Contact page with form and office locations
  - Campaigns page with vehicle offers
- Added sticky header with background transition on scroll
- Improved mobile navigation with accordion-style dropdowns
- Implemented newsletter signup in footer
- Added social media links and legal information sections

## [Date: 2024-05-05]

### Fixed Edge Runtime Compatibility for Namespace Loading

- Removed file system operations from middleware that was causing Edge Runtime errors
- Simplified i18n-helpers.ts to use a pre-generated list of namespaces without conditional logic
- Updated update-namespace-list.js script to modify the simplified helper file
- Ensured build-time namespace list generation still works correctly
- Removed development-time dynamic scanning that wasn't compatible with Edge Runtime

These changes maintain the automated namespace discovery during builds while ensuring compatibility with Next.js Edge Runtime for middleware.

---

### Dynamic Namespace Loading for Translations

- Replaced hardcoded namespace list in `app/i18n/config.ts` with a dynamic system
- Created `utils/i18n-helpers.ts` with functions to scan for available namespaces
- Added `scripts/update-namespace-list.js` to update namespace list during build
- Updated `package.json` with `update-namespaces` script
- Modified build process to automatically update namespaces
- Enhanced middleware to dynamically scan for namespaces in development mode
- Implemented caching to minimize file system operations

This change eliminates the need to manually maintain the list of translation namespaces when new namespaces are added to the application, reducing maintenance burden and preventing potential bugs from missing namespaces.

---

- Added /messages/CorporateLeasing.json translations for fi, sv, en, split into logical blocks for yritysleasing page.
- Implemented app/[locale]/yritysleasing/page.tsx using new content blocks, common layout and card components, and translation keys. Used placeholders for images.
- Rewritten messages/fi/CarLeasing.json to be more verbose, friendly, and informative, using new content from /source and other fi JSONs. Expanded benefits, examples, and FAQ sections.
- Translated and updated messages/sv/CarLeasing.json and messages/en/CarLeasing.json with the new, improved content and structure.
- Ensured all three languages have matching, customer-oriented content and structure for CarLeasing.json.
- Added comprehensive, verbose, and informative content for the MachineLeasing page in Finnish, Swedish, and English. The new JSON includes meta, title, intro, terms (as a list), vehicles (as a table), benefits (as a list), practical examples, FAQ, and a call-to-action. All translations follow localization and natural language guidelines.
