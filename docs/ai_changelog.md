# AI Changelog

## 2025-05-03
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

## 2025-04-29
- **Fix `shopify_product` tool:**
  - Updated `@google/genai` package and corrected `GoogleGenAI` initialization.
  - Refined Gemini API response parsing to handle different JSON structures (`{products: []}`, `{product: {}}`, bare object).
  - Implemented full image upload flow for the `generate` command:
    - Used `stagedUploadsCreate` to get upload target.
    - Performed POST upload using `fetch` and `FormData`.
    - Used `fileCreate` to register the uploaded file.
    - Replaced incorrect `productUpdate` with `productCreateMedia` to associate image.
  - Improved GraphQL error handling in `shopifyGraphQL` helper.
  - Further refined Gemini API response parsing to handle direct array results.

## [Current Date] - Refactor Shopify Product Generation

- **Goal:** Fix the `shopify_product` tool's `generate` command to reliably create products with price and description.
- **Issue:** Encountered numerous Shopify GraphQL API errors related to deprecated fields (`productVariantUpdate`), invalid input fields (`bodyHtml` on `ProductInput` and `ProductSetInput`), and syntax errors.
- **Solution:**
    - Refactored product creation to use the `productSet` mutation.
    - Simplified the Gemini LLM prompt/schema to request flat product data.
    - Implemented mapping logic in the tool to convert the flat LLM response to the nested `productSetInput` required by Shopify, including creating the default variant structure.
    - Added fallback logic for the price if the LLM fails to provide it.
    - Separated image upload/association steps from the core product creation.
    - Identified that `bodyHtml` (description) cannot be set directly via `productSet` or `productUpdate` in the current API version (2025-04) and requires a separate metafield update (to be implemented later).
- **Outcome:** The `generate` command now reliably creates products with title, tags, vendor, status, price (with fallback), and associated image. Description update needs to be handled via metafields.

*   **Refactored Shopify Product Tool (`generate`):** Updated the product generation command (`node tools/shopify-product-tool.js generate`) to comply with Shopify Admin GraphQL API version 2025-04. This involved:
    *   Switching from `bodyHtml` to a custom metafield (`custom.description_html`) for product descriptions, using the `metafieldsSet` mutation after product creation.
    *   Adapting the product creation mutation to use `productSet` correctly for the new API version.
    *   Adapting the variant price update logic to use the `productVariantsBulkUpdate` mutation.
    *   Fixing various GraphQL schema errors related to input types and field names (`ProductSetInput` vs `ProductInput`, `defaultVariant` vs `variants` connection).

## 2025-05-04
- Invented a new command-line tool `schema-detector` (implemented in `tools/schema-detector.ts` and defined in `.cursorrules` and `package.json`) that uses Gemini to detect a JSON schema from a given feed URL. The tool fetches the first 5 items from the feed, constructs a prompt for Gemini, and saves the resulting schema to the `/schemas` directory.

## 2025-05-05
- Enhanced `schema-detector` tool:
  - Added support for XML feeds (using `xml2js` for parsing).
  - The output JSON file now includes the original `feed_url` at the root level.
  - Improved the prompt to Gemini to encourage more descriptive field details in the generated schema.

- Further enhanced `schema-detector` tool:
  - Implemented vendor name extraction from the feed URL.
  - Updated the Gemini prompt to use the extracted vendor name, guiding it to produce more specific schema `name`, `description`, and `identifier` (e.g., `caffitella_product_feed`).
  - The output filename is now more context-aware based on the Gemini-generated identifier (e.g., `caffitella_product_feed.json`).

## 2025-05-06
- Generated a JSON schema for Shopify products and variants using the Gemini tool and saved it to `schemas/shopify_product_variants_schema.json`. The schema includes product details (id, title, vendor, etc.) and an array of variants with their respective fields (id, price, sku, etc.).

## 2025-05-07
- Implemented a new `schema-mapper-tool` in `tools/schema-mapper-tool.ts` that:
  - Takes a source schema (e.g., a product feed schema from `schema-detector`) and a target schema (e.g., Shopify product schema)
  - Uses Gemini AI to generate a TypeScript mapper function between the two schemas
  - Outputs the mapper to the `components/mappers` directory
  - Includes TypeScript interfaces, error handling, and JSDoc comments
  - Added an npm script `schema-mapper` in package.json
- Created an example mapper `components/mappers/caffitellaToShopify.ts` manually as a reference
- Generated a complete mapper `components/mappers/caffitellaToShopifyMapper.ts` using the tool

## 2025-05-08
- Implemented a new `feed-to-shopify-exporter` tool that:
  - Takes product feed data (directly from URL or from a schema file) and exports it to Shopify
  - Uses the `caffitellaToShopify` mapper to transform feed data to Shopify format
  - Supports dry-run mode for testing without creating actual products
  - Includes user confirmation, error handling, and results summary
  - Features configurable product limits to control batch size
  - Added as an npm script: `npm run feed-to-shopify`
- Successfully tested the exporter with Caffitella product feed data

## 2025-05-09
- Invented `shopify-localisation-tool` (script: `tools/shopify-localisation-tool.cjs` and definition in `.cursorrules`) for managing Shopify store translations. Initial commands include listing locales, updating locale status, and pulling/pushing translations for specific resource GIDs.

## DATE TBD

*   **Enhanced `shopify-orders-tool.cjs` with Fulfillment Management:**
    *   Added `read_fulfillments` and `write_fulfillments` to Shopify API scopes.
    *   Implemented `get-fulfillment` command to retrieve fulfillment details by GID.
    *   Implemented `get-fulfillment-order` command to retrieve fulfillment order details by GID.
    *   Implemented `create-fulfillment` command (using `fulfillmentCreateV2` mutation) to create new fulfillments, with options for line items, tracking info, and customer notification.
    *   Updated `.cursorrules` to include these new subcommands and their options.

- Enhanced `tools/shopify-product-tool.cjs` with commands for managing Shopify collections, price lists, and inventory (get-collection, get-price-list, get-inventory-item, get-inventory-level, adjust-inventory, set-inventory). Updated API scopes.

- **Date:** $(date +'%Y-%m-%d')
  - **Summary:** Implemented `data-source-importer` tool and debugged execution.
  - **Details:**
    - Created `tools/data-source-importer.ts` script to fetch a feed URL, detect its schema via Gemini, and store it in the `data_sources` Supabase table.
    - Added `data-source-importer` script to `package.json` (using `tsx`).
    - Attempted to add tool definition to `.cursorrules` (failed due to linter/parsing issues with `edit_file` on this specific file, manual addition required by user).
    - Tested the tool: Feed fetching and schema detection by Gemini work successfully.
    - **Issue:** Supabase insert operation consistently fails with an empty error object `{}`, despite using service role key and trying various troubleshooting steps (minimal insert, explicit fetch). Further local debugging by the user is recommended to resolve the Supabase connection/insert issue.

## Rebranded project to Brancoy HI Engine: Updated `lib/brand-info.ts`, `docs/description.md`, and `docs/frontend.md` to align with the new brand identity and project scope based on https://brancoy.fi/pages/brancoy-hi-engine.

## 2025-05-03
- **Phase 2: Homepage Implementation & Localization (In Progress)**
    - ... (previous entries)
    - Swedish translations for homepage (`messages/sv/Index.json`) created.
    - Generated and optimized 4 images for the homepage sections (hero, content-seo, collaboration, succeed-shopify) and saved them to `public/images/homepage/` as WebP.
    - Integrated generated images into `app/[locale]/page.tsx`.
    - Created translation files for "About Us" page (`messages/en/About.json`, `messages/fi/About.json`, `messages/sv/About.json`).

## [YYYY-MM-DD] - Phase 3: About Page Implementation & Fixes

- **`app/[locale]/about/page.tsx` Development:**
  - Successfully implemented the initial structure for the About Us page.
  - Resolved i18n issues in `app/[locale]/about/page.tsx`:
    - Corrected `Link` component import strategy by first attempting direct import from `next-intl/navigation`, then by updating `app/i18n/server-utils.ts` to re-export `Link` and importing from there.
    - Ensured `getTranslations` is used correctly with explicit `{ locale, namespace }` in both `generateMetadata` and the page component.
    - Added `setupMetadataLocale(locale)` call in `generateMetadata` and ensured `setupServerLocale(locale)` is present in the page component for robust i18n initialization.
    - Removed incorrect `useTranslations` import from the server component.
  - Generated 3 new images for the About page (hero, team, values) using the `gemini-image` tool (`node tools/gemini-image-tool.js generate ...`) with `imagen-3.0` model.
  - Optimized the generated images to WebP format using the `image-optimizer` tool, ensuring correct argument passing (`npm run optimize-image -- --input ... --output ...`).
  - Integrated the optimized WebP images into `app/[locale]/about/page.tsx`, uncommenting and adjusting the `next/image` components for hero and team sections.
- **Translation Files:** Created `messages/en/About.json`, `messages/fi/About.json`, and `messages/sv/About.json` for the About page content.
- **`app/i18n/server-utils.ts` Update:** Modified to correctly export `getMessages` and navigation utilities (`Link`, `redirect`, etc.) from `next-intl`, aligning it more closely with the project's i18n strategy and rules, and ensuring it sources `Locale` and `locales` from `./config`.
- **Troubleshooting:**
  - Addressed `gemini-image` tool usage (direct script call `node tools/...` vs. `npm run <script_alias>`).
  - Re-confirmed fix for `image-optimizer` argument parsing when called via `npm run`. // Already in learnings, but good to note here too.

## [YYYY-MM-DD] - Blog Page Rebranding to Brancoy HI Engine

- Updated `app/[locale]/blog/page.tsx`:
  - Changed structured data (Schema.org) to use "Brancoy" as publisher and "Brancoy Team" as author.
  - Modified subject filter definitions to use translation keys (`t('subjects.id')`) instead of hardcoded labels.
  - Updated active subject filter button color and post title hover color to Brancoy brand blue (`#4A90E2`).
- Updated `messages/en/Blog.json`:
  - Revised `description` and `noPosts` messages to align with Brancoy HI Engine branding and tone.
  - Added new keys and translations for blog subject filters (`subjects.all`, `subjects.news`, etc.).
- Updated `messages/fi/Blog.json`:
  - Translated the new/updated English keys (description, noPosts, subject filters) to Finnish.
- Updated `messages/sv/Blog.json`:
  - Translated the new/updated English keys (description, noPosts, subject filters) to Swedish.

## 2025-05-10
- **Feat:** Implemented Inngest cron job for polling and syncing product data sources.
  - Created `dispatchDataSourceSyncJobs` Inngest function (runs hourly via cron `TZ=UTC 0 * * * *`) to:
    - Fetch active `data_sources` from Supabase.
    - Dispatch an `app/data.source.sync.requested` event for each source.
  - Created `syncProductDataSource` Inngest function triggered by `app/data.source.sync.requested` to:
    - Filter for `product_feed` type sources.
    - Fetch data from the source's `feed_url` (currently supports JSON).
    - Handle fetch errors and update `data_sources` table status/error_message.
    - Parse items from the feed.
    - For each item:
      - Check for existing `external_product_mappings`.
      - If mapping exists, update `products` and `product_variants`.
      - If no mapping, create new `products`, `product_variants`, and `external_product_mappings`.
      - Uses a simplified field mapping for now (needs to be made more robust, ideally using `detectedSchema`).
    - Update `last_fetched_at` and reset error status in `data_sources` on successful run part.
  - Registered both new functions in `app/api/inngest/route.ts`.
  - Added related tasks to `docs/todo.md`.
- **Chore:** Removed the example `helloWorld` Inngest function from `lib/inngest-functions.ts` and `app/api/inngest/route.ts`.

## [YYYY-MM-DD] - Fix Inngest Job "column data_sources.status does not exist"
- **Fix:** Resolved Inngest job failure for `Dispatch Data Source Sync Jobs`.
  - The error "column data_sources.status does not exist" was caused by a mismatch between the Inngest function's query and the database schema.
  - Created a new database migration (`20250514073717_add_status_to_data_sources.sql`) to:
    - Add the missing `status` column (TEXT, DEFAULT 'active', NOT NULL) to the `data_sources` table.
    - Rename the existing `source_type` column to `feed_type` to align with the Inngest function and `DataSource` interface expectations.
  - Instructed user to run database migrations to apply the schema changes.

## [YYYY-MM-DD] - Visual Style Redefinition

- Updated `docs/frontend.md` to align with the new visual style provided in the reference image.
  - Changed the primary theme from dark to predominantly light with contrasting dark sections.
  - Redefined the color palette: primary backgrounds (white, light gray), dark section backgrounds (charcoal), text colors, primary accent (brand blue), and a new secondary accent (subtle orange/coral).
  - Detailed specific CTA button styles (primary, secondary, dark).
  - Suggested modern sans-serif font families (e.g., Inter, Manrope).
  - Noted the use of subtle box shadows for depth on UI elements.

## [YYYY-MM-DD] - Homepage Styling Update (Phase 1)

- Updated `tailwind.config.ts`:
  - Added new color palette: `brand.blue`, `brand.coral`, `light.background`, `light.card`, `light.text`, `dark.background`, `dark.card`, `dark.text`.
  - Added `Inter` and `Manrope` to the sans-serif font family stack.
- Updated `app/[locale]/page.tsx` (Homepage) to reflect the new visual style:
  - Switched primary theme from dark to light (`bg-light-background`, `text-light-text`).
  - Updated section backgrounds (e.g., Hero to `bg-light-card`, "Why AI" to `bg-dark-background`).
  - Replaced placeholder purple/gray button styles with new variants: `primary` (brand-blue), `secondary` (light theme outline), and `darkCta`.
  - Adjusted text colors for readability on new backgrounds.
  - Changed card styles in sections like "Smartest Way" and "Foundation" to `bg-white shadow-md`.

## [YYYY-MM-DD] - Shared Button Component Refactor

- Refactored `app/components/Button.tsx`:
  - Updated `variant` prop type to include `darkCta`.
  - Changed `baseStyles` from `rounded-full` to `rounded-md`.
  - Updated `variantStyles` for `primary` (brand-blue), `secondary` (light theme outline), and added `darkCta` style, aligning with the new visual guidelines.
- Updated `app/[locale]/page.tsx` (Homepage) to remove its local Button definition and import the shared `Button` component from `app/components/Button.tsx`.

## [YYYY-MM-DD] - Fix Button Component Client/Server Error

- Added `'use client';` directive to `app/components/Button.tsx`.
  - **Reason:** Resolved Next.js error "Event handlers cannot be passed to Client Component props." The `Button` component uses `onClick` and `onKeyDown`, requiring it to be a Client Component when used within Server Components like the Homepage.

## [YYYY-MM-DD] - About Us Page Styling Update

- Updated `app/[locale]/about/page.tsx` to align with the new visual style:
  - Switched primary theme from dark to light (`bg-light-background`, `text-light-text`).
  - Updated section backgrounds (e.g., Hero to `bg-light-card`, "Our Values" to `bg-dark-background`).
  - Adjusted text colors for readability on new backgrounds.
  - Changed card styles in "Our Values" section to `bg-dark-card` with `text-brand-blue` highlights.
  - Replaced custom Link-based CTAs with the shared `Button` component, applying appropriate variants and some custom classes for the specific design on brand-blue background.
  - Removed unused `useTranslations` import.

## [YYYY-MM-DD] - Admin UI for Data Sync Management
- **Feat:** Implemented Admin UI and API for managing data source synchronization.
  - **API Endpoints (`app/api/admin/data-sources/`):**
    - `GET /`: Lists all data sources. Protected by admin role.
    - `GET /[id]`: Retrieves details for a specific data source. Protected by admin role.
    - `POST /[id]/trigger-sync`: Manually triggers an Inngest event (`app/data.source.sync.requested`) for the specified data source. Protected by admin role.
  - **Frontend Pages (`app/[locale]/admin/data-sync/`):
    - `page.tsx`: Displays a list of data sources with their status, type, last fetched time. Allows admins to trigger a manual sync for each source and navigate to a detail view.
    - `[id]/page.tsx`: Shows detailed information for a specific data source, including its detected schema (JSON). Allows triggering a manual sync.
    - Both pages use `AdminLayoutClient` for authentication and layout.
  - **Navigation:** Added a "Data Sync" link to the admin sidebar in `app/components/Navigation.tsx`.
  - **Documentation:** Updated `docs/frontend.md` with UI design and `docs/todo.md` with implementation tasks.

*   Updated `app/components/Button.tsx` to be a client component, resolving "Event handlers cannot be passed to Client Component props" error.
*   Applied new visual styles (light theme, dark contrasting sections, brand colors) to `app/[locale]/about/page.tsx`.
*   Updated logo in `app/components/Navigation.tsx` to `images/brancoy_logo_black.webp`.
*   Updated `app/components/Navigation.tsx` background to light blue (`brand.lightBlue`) and adjusted text/link colors for contrast.
*   `docs/learnings.md` updated with button component fix and image tool usage notes.
## Phase 6: Blog Page Styling & Global Styles (Current)

## [YYYY-MM-DD] - Data Source Management
- **Feat:** Added Caffitella product feed (`caffitella_product_feed`) as a new data source using the `data-source-importer` tool. The tool successfully fetched the feed, detected the schema via Gemini, and stored it in the `data_sources` table.

*   Updated `app/components/Button.tsx` to be a client component, resolving "Event handlers cannot be passed to Client Component props" error.

