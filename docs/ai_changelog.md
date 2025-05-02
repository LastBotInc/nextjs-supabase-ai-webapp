# AI Changelog

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

