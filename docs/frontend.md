# Frontend Documentation

## Views/Screens

### Public Pages (`/[locale]`)

1. Home Page (`/`)
   - **Hero Section:** Large background image/video, clear value proposition headline, description, primary CTA ('Request a Quote'), secondary CTA ('Learn More').
   - **Campaigns Section (New):**
     - **Location:** Below Hero section.
     - **Title:** "Current Campaigns" (localized).
     - **Layout:** Responsive grid (1-col mobile, 2-col tablet/desktop) with light background (e.g., `bg-gray-50`).
     - **Card Template:** 
       - Vehicle Image (16:9 ratio).
       - Tagline Badge (e.g., "Limited Stock!") - styled distinctively.
       - Vehicle Title (Make/Model) - bold.
       - Indicative Price (e.g., "From €XXX/month + VAT") - smaller text.
       - Pill-shaped Tags (e.g., "Van", "Electric").
       - CTA Button ("View Offer") - standard style.
   - **Leasing Solutions Overview:** Brief cards summarizing the 4 main leasing types (Financial, Flexible, Maintenance, MiniLeasing) with icons and links.
   - **Fleet Management Tools Overview:** Cards highlighting key digital tools (InnoFleet Manager, Reporting, etc.).
   - **Testimonials:** Rotating or static customer quotes.
   - **Partner Logos:** Display logos of key service partners.
   - **Environmental Focus/EV Section:** Highlighting EV options and benefits.
   - **Final CTA:** Clear call-to-action section.

2. Leasing Solutions (`/leasing-solutions`)
   - Financial Leasing
   - Flexible Leasing
   - Maintenance Leasing
   - MiniLeasing
   - Comparison calculator

3. Fleet Management (`/fleet-management`)
   - InnoFleet Manager overview
   - Fleet reporting features
   - Cost tracking tools
   - Service management

4. Services (`/services`)
   - Vehicle maintenance network
   - Tire service partners
   - Inspection services
   - Electric vehicle services
   - Fleet optimization

5. About Us (`/about`)
   - Company history
   - Team information
   - Corporate responsibility
   - Autolle.com Group connection

6. Blog (`/blog`)
   - Industry news
   - Leasing tips
   - Fleet management insights
   - Vehicle industry updates
   - EV transition guidance

7. Contact Page (`/contact`)
   - Contact form
   - Office locations
   - Service request form
   - Leasing inquiry form

8. Privacy Policy (`/privacy`)
   - Data protection information
   - Cookie policy
   - GDPR compliance

### Client Portal (`/[locale]/portal`)

1. Dashboard (`/portal`)
   - Fleet overview
   - Contract summaries
   - Upcoming service reminders
   - Recent activities
   - Cost analytics

2. Vehicles (`/portal/vehicles`)
   - Vehicle list with details
   - Status indicators
   - Contract information
   - Document access
   - Service history

3. Contracts (`/portal/contracts`)
   - Active contracts
   - Contract details
   - Payment schedules
   - End-of-lease options
   - Contract documents

4. Maintenance (`/portal/maintenance`)
   - Service booking
   - Maintenance history
   - Tire management
   - Inspection scheduling
   - Repair records

5. Reports (`/portal/reports`)
   - Cost reports
   - Usage reports
   - Emissions analytics
   - Custom report builder
   - Export options

6. User Management (`/portal/users`)
   - Driver accounts
   - Permission settings
   - Role management
   - Activity logs
   - Driver-vehicle assignments

7. Documents (`/portal/documents`)
   - Contracts
   - Invoices
   - Service records
   - Vehicle documentation
   - Corporate policies

8. Settings (`/portal/settings`)
   - Company information
   - Notification preferences
   - API integration settings
   - Multi-factor authentication
   - Language preferences

### Admin Portal (`/[locale]/admin`)

1. Dashboard (`/admin`)
   - Client overview
   - Contract analytics
   - Vehicle status summary
   - Financial metrics
   - Service provider performance

2. Client Management (`/admin/clients`)
   - Client list
   - Account details
   - Contract assignments
   - Communication history
   - Notes and follow-ups

3. Vehicle Management (`/admin/vehicles`)
   - Vehicle inventory
   - Availability status
   - Maintenance scheduling
   - Location tracking
   - Procurement planning

4. Contract Management (`/admin/contracts`)
   - Contract creation
   - Template management
   - Approval workflows
   - Renewal tracking
   - Contract analytics

5. Financial Management (`/admin/finance`)
   - Invoice generation
   - Payment tracking
   - Pricing management
   - Financial reporting
   - Expense tracking

6. Service Management (`/admin/services`)
   - Service provider network
   - Appointment scheduling
   - Service quality tracking
   - Maintenance planning
   - Service analytics

7. Content Management (`/admin/content`)
   - Website content editor
   - Blog post management
   - Document templates
   - Email templates
   - Marketing materials

8. System Settings (`/admin/settings`)
   - User management
   - Role configuration
   - System logs
   - API management
   - Integration settings

## UI/UX Patterns

### Design System
- Colors:
  - Primary Colors:
    - Innolease Blue: #0E4C92
    - Innolease Light Blue: #3A8DDE
    - Innolease Dark Blue: #072B54
    - Accent Orange: #F68B1F
    - Accent Green: #16A75C
  - Neutral Colors:
    - White: #FFFFFF
    - Light Gray: #F5F7FA
    - Medium Gray: #D1D5DB
    - Dark Gray: #4B5563
    - Charcoal: #1E293B
  - Semantic Colors:
    - Success: #16A75C
    - Warning: #F59E0B
    - Error: #EF4444
    - Info: #3A8DDE
  - Dark Mode:
    - Background: #1E293B
    - Card Background: #0F172A
    - Text: #F5F7FA

- Typography:
  - Headings: Inter
  - Body: Inter
  - Monospace: Roboto Mono
  
- Heading Styles:
  - Main Headings (H1):
    - Font: Inter
    - Size: text-4xl (2.25rem) on mobile, text-5xl (3rem) on desktop
    - Weight: font-bold
    - Color: Innolease Blue (#0E4C92)
    - Line Height: leading-tight (1.25)
    - Margin Bottom: mb-6

  - Section Headings (H2):
    - Font: Inter
    - Size: text-3xl (1.875rem)
    - Weight: font-semibold
    - Color: Innolease Blue (#0E4C92)
    - Line Height: leading-tight (1.25)
    - Margin Bottom: mb-4

  - Content Headings (H3):
    - Font: Inter
    - Size: text-2xl (1.5rem)
    - Weight: font-medium
    - Color: Innolease Dark Blue (#072B54)
    - Line Height: leading-normal (1.5)
    - Margin Bottom: mb-3

- Components:
  - Buttons:
    - Primary: Innolease Blue with white text
    - Secondary: White with Innolease Blue border and text
    - Tertiary: Transparent with Innolease Blue text
    - Success: Green with white text
    - Danger: Red with white text
    - Disabled: Light gray with dark gray text
    - Hover: Slightly darker shade with smooth transition
    - Focus: Blue outline with 2px width

  - Cards:
    - Default: White background, light shadow, rounded corners (0.5rem)
    - Elevated: White background, medium shadow, rounded corners (0.5rem)
    - Interactive: Hover effect with scale transform and deeper shadow
    - Vehicle Card: Special design for displaying vehicle information
    - Contract Card: Special design for displaying contract information

  - Forms:
    - Input fields: Light background, dark border, focus state with blue outline
    - Dropdowns: Custom styled with chevron icon
    - Checkboxes: Custom styled with blue check
    - Radio buttons: Custom styled with blue dot
    - Toggle switches: Blue when active, gray when inactive
    - Form validation: Inline error messages in red
    - Form sections: Logical grouping with clear section headers

  - Tables:
    - Responsive design for all screen sizes
    - Sortable columns with indicators
    - Filterable data
    - Pagination
    - Row actions (edit, delete, view)
    - Expandable rows for additional details
    - Zebra striping for better readability
    - Fixed headers for scrollable tables

  - Data Visualization:
    - Cost charts: Bar and line charts
    - Fleet composition: Pie and donut charts
    - Timeline charts: For contract and maintenance tracking
    - Vehicle status indicators: Color-coded status badges
    - Emissions dashboard: Environmental impact visualization
    - Cost comparisons: Side-by-side bar charts

### Responsive Design
- Mobile-first approach
- Breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

### Animations
- Subtle hover effects on interactive elements
- Loading states with minimal animations
- Page transitions for a smooth experience
- Micro-interactions for feedback
- Chart animations for data presentation

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode
- Focus indicators
- Accessible form labels
- Alternative text for images
- Semantic HTML structure

## Styling Approach

1. Tailwind CSS
   - Custom configuration for Innolease brand colors
   - Consistent spacing and sizing
   - Component-specific utilities
   - Responsive utility classes
   - Dark mode support

2. CSS Modules
   - For complex components
   - Animation keyframes
   - Custom properties
   - Vehicle display modules
   - Fleet dashboard components

3. Reusable Components
   - Button variants
   - Form elements
   - Card designs
   - Table components
   - Modal dialogs
   - Navigation elements
   - Vehicle cards

## User Flows

1. Vehicle Selection Process
   - Browse available vehicles
   - Compare specifications
   - View pricing options
   - Select leasing type
   - Customize lease terms
   - Submit inquiry

2. Client Portal Onboarding
   - Initial login
   - Profile setup
   - Vehicle assignment
   - Dashboard introduction
   - Feature tour
   - Notification setup

3. Maintenance Booking
   - Select vehicle
   - Choose service type
   - View available time slots
   - Select preferred service location
   - Confirm booking
   - Receive confirmation
   - Get reminders

4. End-of-Lease Process
   - Receive notification of approaching end date
   - Review end-of-lease options
   - Schedule vehicle inspection
   - Complete return checklist
   - Schedule return appointment
   - Process contract termination
   - Explore renewal options

5. Fleet Report Generation
   - Select report type
   - Define parameters
   - Choose visualization options
   - Generate report
   - Export in preferred format
   - Schedule recurring reports

## Performance Optimization

1. Image Optimization
   - Next.js Image component
   - WebP format for vehicle images
   - Responsive sizing
   - Lazy loading
   - Blur placeholders

2. Code Splitting
   - Route-based splitting
   - Component lazy loading
   - Dynamic imports for heavy components
   - Separate bundles for admin and client portals

3. Caching Strategy
   - Static generation for public pages
   - ISR for semi-dynamic content
   - API response caching
   - Local storage for user preferences

4. Core Web Vitals
   - LCP optimization for vehicle imagery
   - FID improvement with code splitting
   - CLS minimization with proper image dimensions
   - Server-side rendering for data-heavy pages

- **Card Layouts:** Used extensively for summarizing services (Leasing Solutions, Fleet Tools), displaying blog posts, testimonials, and **campaign offers**.