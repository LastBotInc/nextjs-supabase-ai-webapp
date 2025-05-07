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

