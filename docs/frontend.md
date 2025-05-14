# Frontend Documentation - Brancoy HI Engine

## Overall Philosophy
The frontend for Brancoy HI Engine should project intelligence, efficiency, and reliability. The UI will be clean, modern, and intuitive, guiding users through the migration and optimization process seamlessly. The design will be data-driven, with clear visualizations of progress and AI-driven insights.

## Target Users
1.  **eCommerce Businesses/Clients:** Companies looking to migrate to Shopify and optimize their online store. They need a clear understanding of the process, progress, and the value HI Engine provides.
2.  **Brancoy Admin/Experts:** Internal team members who manage migration projects, configure the HI Engine, and collaborate with clients.

## Views/Screens

### Public-Facing Pages (`/[locale]`)

1.  **Homepage (`/`)** (based on `https://brancoy.fi/pages/brancoy-hi-engine`)
    *   **Hero Section:** Headline: "Seamlessly Migrate & Optimize Your eCommerce to Shopify". Sub-headline explaining the HI Engine. CTA buttons: "Start Migration" and "Schedule a Demo". Visuals representing AI and Shopify.
    *   **Key Benefits Bar:** "100% Data Accuracy", "10x Faster Migration", "24/7 AI Optimization".
    *   **"The Smartest Way to Move to Shopify" Section:**
        *   **Collect Data:** Explanation and visuals (platform logos like WooCommerce, Magento, BigCommerce).
        *   **Analyze:** Explanation of AI review and optimization (product descriptions, keywords).
        *   **Localize:** Explanation of content, currency, and SEO adaptation for target markets.
    *   **Feature Deep Dive Sections:**
        *   **Content & SEO Optimization:** Image resizing, background editing, text optimization with Google Search Console/Trends insights.
        *   **Collaborate Together:** Emphasize partnership between Brancoy experts, HI Engine, and client teams.
        *   **Succeed with Shopify:** Focus on the future-proof, scalable, optimized store.
    *   **"The Foundation for Intelligent eCommerce" Section:** Benefits like Future-Proof Foundation, Focus on Growth, Scalable AI Power. Call for a free migration assessment.
    *   **"Why AI-Powered Migration?" Section:** Reinforce data accuracy, migration speed, ongoing optimization.
    *   **Social Proof/Testimonials (Optional):** Quote from Co-Founder or client testimonials.
    *   **Final CTA:** "Meet the Brancoy AI engine built for commerce. Migration will never be the same." CTA: "Start Migration".
    *   **Footer:** Contact info, service links, privacy policy, newsletter signup.

2.  **Services Pages (e.g., `/services/shopify-migration`, `/services/ecommerce-optimization`)**
    *   Detailed descriptions of specific services offered through the HI Engine.
    *   Case studies or examples.
    *   Specific CTAs related to the service.

3.  **Blog (`/blog`)**
    *   Articles on eCommerce trends, Shopify best practices, AI in commerce, migration tips.
    *   Categorization and search functionality.

4.  **About Us (`/about`)**
    *   Brancoy's mission, team, and expertise.

5.  **Contact Us (`/contact`)**
    *   Contact form, email addresses, and location information (Helsinki, Stockholm).

6.  **Privacy Policy (`/privacy`) & Terms of Service (`/terms`)**

### Client Portal (Authenticated - `/[locale]/portal`)

1.  **Dashboard (`/portal/dashboard`)**
    *   Overview of current migration project status (e.g., Data Collection: 100%, Analysis: 75%, Localization: In Progress).
    *   Key AI-driven insights and recommendations.
    *   Quick links to relevant sections (e.g., Review Product Data, Approve SEO Keywords).
    *   Communication panel with Brancoy team.

2.  **Project Details (`/portal/project/:projectId`)**
    *   **Data Collection Status:** View connected sources, data sync progress.
    *   **Analysis & Optimization Review:**
        *   Product data: View AI-generated descriptions, keyword suggestions. Approve or request revisions.
        *   SEO Review: View proposed SEO strategies, target keywords.
        *   Image Review: View optimized images, background removal results.
    *   **Localization Hub:**
        *   Select target markets/languages.
        *   Review localized content, pricing.
    *   **Migration Progress Tracker:** Detailed view of migration stages and timelines.
    *   **Reporting:** Access reports on data accuracy, optimization impact.

3.  **Account Settings (`/portal/account`)**
    *   Profile information.
    *   Notification preferences.

### Brancoy Admin Panel (Authenticated - `/[locale]/admin`)

1.  **Admin Dashboard (`/admin/dashboard`)**
    *   Overview of all active client projects.
    *   Key performance indicators for HI Engine.
    *   System alerts and notifications.

2.  **Client Management (`/admin/clients`)**
    *   List of all clients and their projects.
    *   Create new client projects, configure initial settings.

3.  **Project Management (`/admin/projects/:projectId`)**
    *   Detailed view of a specific client project (similar to client portal but with more control).
    *   Configure AI model parameters for the project.
    *   Manage data connectors and ETL processes.
    *   Oversee and approve/override AI suggestions.
    *   Manual data input/correction tools.
    *   Communication log with the client.

4.  **HI Engine Configuration (`/admin/engine-settings`)**
    *   Manage AI model versions and settings (Gemini, image processing models).
    *   Configure platform integrations (Google Search Console, etc.).
    *   Manage localization rules and translation memory.

5.  **User Management (`/admin/users`)**
    *   Manage Brancoy team member accounts and roles.

6.  **Content Management (for public site - `/admin/content`)**
    *   Manage blog posts, service pages, etc.

7.  **Data Synchronization Management (`/admin/data-sync`)**
    *   **Data Sources List View (`/admin/data-sync/page.tsx`):**
        *   Displays a table of all configured `data_sources`.
        *   Columns: Name/Identifier (link to detail), Feed URL, Type, Status (badge), Last Fetched, Last Schema Update.
        *   Actions per row: "Trigger Sync Now", "View Logs/Details".
        *   Fetches data from `GET /api/admin/data-sources`.
    *   **Data Source Detail View (`/admin/data-sync/[id]/page.tsx`):**
        *   Displays all details of a specific data source.
        *   Shows `detected_schema` (pretty-printed JSON).
        *   Shows `error_message` if present.
        *   Action: "Trigger Sync Now" for this specific source.
        *   (Future) Sync History/Logs section: Table of past sync attempts, status, items processed, errors, duration.
        *   Fetches data from `GET /api/admin/data-sources/[id]`.

## UI/UX Patterns for Brancoy HI Engine

### Design Philosophy
*   **Clarity & Trust:** The UI must clearly communicate complex AI processes and build trust through transparency.
*   **Efficiency:** Streamline workflows for both clients and Brancoy admins.
*   **Intelligence Made Visible:** Visualize AI insights and the impact of optimizations effectively.

### Branding Consistency (referencing the provided UI image and `https://brancoy.fi/pages/brancoy-hi-engine`)
*   **Color Palette:** The design will feature a predominantly light and airy theme with clean white and light gray backgrounds. This will be contrasted with dedicated dark sections (charcoal/dark gray) for specific emphasis or content blocks.
    *   **Primary Backgrounds:** White (e.g., `#FFFFFF`), Light Gray (e.g., `#F3F4F6` or `#E5E7EB`).
    *   **Dark Section Backgrounds:** Dark Gray/Charcoal (e.g., `#1F2937`, `#111827`).
    *   **Text on Light Backgrounds:** Dark Gray/Black (e.g., `#1F2937`, `#374151`).
    *   **Text on Dark Backgrounds:** White/Light Gray (e.g., `#F9FAFB`, `#E5E7EB`).
    *   **Primary Accent (Brand Blue):** A medium, clear blue (e.g., `#3B82F6` or similar to the blue in buttons and highlights in the image). Used for CTAs, links, active states, and key highlights.
    *   **Secondary Accent (Subtle Orange/Coral):** A muted orange or coral (as seen in one of the feature icons in the image) can be used sparingly for specific iconography or calls to attention where differentiation is needed.
    *   **CTAs (Buttons):**
        *   Primary CTA: Solid brand blue background with white text, rounded corners.
        *   Secondary CTA: White background with a brand blue border and brand blue text, rounded corners.
        *   Dark CTA (on light backgrounds, for specific actions): Solid dark gray/black background with white text, rounded corners (e.g., "Start Migration" in the final CTA section of the image).
    *   **Gradients:** Subtle gradients can be used for larger background areas or specific highlights, often incorporating shades of blue or gray.
*   **Typography:** Modern, clean sans-serif fonts.
    *   Headings: A strong, clear sans-serif (e.g., Inter, Manrope, or similar to the image). Weights will vary for hierarchy (e.g., Bold, Semibold).
    *   Body Text: Highly readable sans-serif, ensuring good contrast and legibility.
*   **Iconography:** Clean, modern, and professional icons. Often two-toned or monochromatic, matching the accent colors or a neutral gray.
*   **Imagery/Visuals:** High-quality product mockups, abstract representations of data/AI, UI screenshots. Maintain a professional and polished look.
    *   Shadows: Subtle box shadows on cards and interactive elements to create depth.

### Key UI Components
*   **Dashboards:** Modular cards displaying key metrics, progress bars, and quick actions.
*   **Data Tables & Lists:** Clean, sortable, and filterable tables for product data, client lists, etc. Inline editing where appropriate.
*   **Progress Indicators:** Visual cues for migration stages, AI processing, data loading.
*   **AI Suggestion Cards:** Clearly present AI-generated content (e.g., product descriptions) with options to accept, edit, or reject.
*   **Comparison Views:** Side-by-side display of original vs. AI-optimized content/images.
*   **Interactive Charts & Graphs:** Visualize data accuracy, SEO improvements, migration speed.
*   **Forms:** Intuitive and clean forms for project setup, configuration, and client input.
*   **Notifications & Alerts:** Non-intrusive but clear notifications for important events or required actions.

### UX Principles
*   **Guided Workflows:** Lead users through complex processes step-by-step.
*   **Feedback & Transparency:** Provide clear feedback on actions and system status. Explain *why* AI makes certain suggestions.
*   **Contextual Information:** Offer tooltips, help icons, and brief explanations for technical terms or AI features.
*   **Role-Based Views:** Tailor the interface and available actions based on whether the user is a client or a Brancoy admin.
*   **Mobile Responsiveness:** Ensure key information and actions are accessible on tablets for client review, and potentially on mobile for Brancoy admin quick checks.

## Styling Approach
*   **Tailwind CSS:** Primary styling framework, configured with the Brancoy HI Engine brand colors and typography.
*   **CSS Modules:** For component-specific styles that are complex or require more isolation.
*   **Headless UI Components (e.g., Radix UI, Headless UI):** For accessible, unstyled primitives to build custom components upon.

## Internationalization
*   The platform must support multiple languages (initially English, Finnish, Swedish as per the Brancoy site).
*   Follow the existing `messages/` structure for translations, with namespaces relevant to HI Engine features (e.g., `Dashboard.json`, `ProjectSetup.json`, `ProductOptimization.json`).

## Performance Optimization
*   Standard Next.js best practices: Image optimization, code splitting, lazy loading.
*   Efficient data fetching and state management, especially for large datasets in the client/admin portals.