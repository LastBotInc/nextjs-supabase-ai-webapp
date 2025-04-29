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
    - Kupari (Copper): #C49A6C
    - Piki (Pitch Black): #231F20
    - Sähkö (Electric Blue): #4441E8
  - Neutral Colors:
    - Beige: #E8E4DA
    - Maantie (Road Grey): #D9D9D9
    - Betoni (Concrete): #6D6E71
    - White: #FFFFFF
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
  - Primary Font: Inter Tight
  - Available Weights: Light, Regular, Bold, Black
  - Headings: Inter Tight
  - Body: Inter Tight
  - Monospace: Roboto Mono (Review if needed, or use Inter Tight)
  
- Heading Styles:
  - Main Headings (H1):
    - Font: Inter Tight
    - Size: text-4xl (2.25rem) on mobile, text-5xl (3rem) on desktop
    - Weight: font-bold
    - Color: Innolease Blue (#0E4C92)
    - Line Height: leading-tight (1.25)
    - Margin Bottom: mb-6

  - Section Headings (H2):
    - Font: Inter Tight
    - Size: text-3xl (1.875rem)
    - Weight: font-semibold
    - Color: Innolease Blue (#0E4C92)
    - Line Height: leading-tight (1.25)
    - Margin Bottom: mb-4

  - Content Headings (H3):
    - Font: Inter Tight
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

### Graphical Patterns and Overlays

- **Patterns:** The brand utilizes distinct graphical elements derived from the logo:
    - A single, curved parallelogram shape.
    - A wavy pattern formed by repeating and mirroring this shape.
    - A tiled pattern using variations of the shape.
    - These are typically rendered in neutral colors like 'Road Grey' or 'Concrete Grey'.

- **Usage:** These patterns can be used subtly as background overlays on containers, images, or sections (e.g., hero sections, feature cards) to reinforce brand identity without overwhelming the content.

- **Implementation (CSS Overlay):**
    - **Method:** Use CSS pseudo-elements (`::before` or `::after`) on the container element.
    - **Styling:** Apply the pattern using `background-image` (preferably an SVG for scalability and sharpness) or potentially CSS gradients/masks for simpler patterns. Set `background-repeat`, `background-size`, and `background-position` as needed.
    - **Subtlety:** Control visibility using the `opacity` property (e.g., `opacity: 0.05` or `opacity: 0.1`).
    - **Interaction:** Ensure the overlay doesn't interfere with user interaction by setting `pointer-events: none;`.
    - **Layering:** Use `position: absolute`, `inset: 0`, and potentially `z-index` to position the overlay correctly behind content.
    - **Blending:** Consider `background-blend-mode` (e.g., `multiply`, `overlay`) for interesting effects when layered over images or colors.
    - **Centralization:** Store SVG patterns or common CSS overlay utility classes centrally for consistency.

- **Conceptual Example (Pattern Overlay):**
  ```css
  .container-with-pattern-overlay {
    position: relative;
    overflow: hidden; 
  }

  .container-with-pattern-overlay::after {
    content: "";
    position: absolute;
    inset: 0; /* Cover entire container */
    background-image: url('/path/to/innolease-pattern.svg'); 
    background-repeat: repeat;
    background-size: 60px 60px; /* Example size */
    opacity: 0.08; /* Adjust for subtlety */
    pointer-events: none; 
    z-index: 0; /* Behind content if needed */
  }
  ```

- **Example (Text Overlay):** As seen in some card examples, a simple semi-transparent overlay can be used behind text sections placed over images to ensure readability. This typically uses `background-color` with an alpha value (e.g., `rgba(0, 0, 0, 0.5)`) on a pseudo-element covering the text area.

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

## SEO-Optimized Page Structure (Finnish Site)

### Main Navigation

1. Asiakastarinat (Customer Stories) (`/fi/asiakastarinat`)
   - Success stories of clients using Innolease services
   - Case studies categorized by industry and leasing type
   - Testimonials with measurable results

2. Kampanjat (Campaigns) (`/fi/kampanjat`)
   - Current vehicle offers
   - Seasonal promotions
   - Limited-time deals
   - Special leasing terms

3. Blogi (Blog) (`/fi/blogi`)
   - Industry insights
   - Vehicle information
   - Leasing advice
   - Fleet management tips

4. Avoimet työpaikat (Open Positions) (`/fi/tyopaikat`)
   - Career opportunities
   - Company culture information
   - Benefits overview
   - Application process

5. Asiakaspalvelu (Customer Service) (`/fi/asiakaspalvelu`)
   - Contact methods
   - FAQ section
   - Support request form
   - Service hours

6. Yhteystiedot (Contact Information) (`/fi/yhteystiedot`)
   - Office locations
   - Department contacts
   - Map integration
   - Contact form

### Main Service Categories

1. Yritysleasingit (Business Leasing) (`/fi/yritysleasingit`)
   - B2B leasing solutions
   - Corporate fleet options
   - Volume pricing
   - Custom leasing programs

2. Muut palvelut (Other Services) (`/fi/muut-palvelut`)
   - Complementary services beyond leasing
   - Add-on options
   - Partner services
   - Special requirements

3. Tietoa meistä (About Us) (`/fi/tietoa-meista`)
   - Company history
   - Mission and values
   - Team information
   - Corporate responsibility

4. Asiakkaille (For Customers) (`/fi/asiakkaille`)
   - Client resources
   - Support materials
   - Guides and documentation
   - Self-service tools

5. Auton vuokraus (Car Rental) (`/fi/auton-vuokraus`)
   - Short-term rental options
   - Rental process
   - Vehicle classes
   - Pricing information

### Service Submenu Items

1. Autoleasing (Car Leasing) (`/fi/autoleasing`)
   - Personal vehicle leasing
   - Corporate vehicle leasing
   - Leasing term options
   - Vehicle selection

2. Huollon varaus (Service Booking) (`/fi/huollon-varaus`)
   - Maintenance scheduling
   - Service center locations
   - Service types
   - Online booking system

3. Autoilijan opas (Driver's Guide) (`/fi/autoilijan-opas`)
   - Vehicle operation tips
   - Maintenance guidelines
   - Troubleshooting advice
   - Emergency procedures

4. Vuokraa auto (Rent a Car) (`/fi/vuokraa-auto`)
   - Rental process steps
   - Available vehicles
   - Rental terms
   - Reservation system

5. Kone- ja laitelasing (Machine and Equipment Leasing) (`/fi/kone-ja-laitelasing`)
   - Industrial equipment options
   - Specialized machinery leasing
   - Equipment maintenance
   - Lease-to-own options

6. Rengaspalvelut (Tire Services) (`/fi/rengaspalvelut`)
   - Seasonal tire change
   - Tire storage
   - Tire selection guidance
   - Tire service locations

7. Kalustoraportti (Fleet Report) (`/fi/kalustoraportti`)
   - Fleet status reporting
   - Asset management tools
   - Usage analytics
   - Cost tracking

8. Minileasing (`/fi/minileasing`)
   - Short-term leasing options
   - Flexible terms
   - Quick vehicle access
   - Simplified process

9. Autokannan hallinnointi (Fleet Management) (`/fi/autokannan-hallinnointi`)
   - Fleet administration tools
   - Maintenance scheduling
   - Vehicle lifecycle management
   - Driver management

10. Päästöraportti (Emission Report) (`/fi/paastoraportti`)
    - Environmental impact tracking
    - CO2 emissions monitoring
    - Sustainability metrics
    - Regulatory compliance reporting

11. Kausiauito (Seasonal Car) (`/fi/kausiauito`)
    - Seasonal vehicle options
    - Short-term availability
    - Specific-use vehicles
    - Seasonal pricing

12. Opas auton palautukseen (Guide to Returning a Car) (`/fi/auton-palautus`)
    - End-of-lease procedures
    - Return condition requirements
    - Inspection process
    - Final settlement information

13. Sijaisautopalvelu (Replacement Car Service) (`/fi/sijaisautopalvelu`)
    - Temporary vehicle provision
    - Service vehicle options
    - Booking process
    - Availability information

14. Sopimuksen päättyminen (Contract Termination) (`/fi/sopimuksen-paattyminen`)
    - End-of-contract options
    - Contract renewal
    - Vehicle return process
    - Final payment information

15. Yhteiskäyttöauto (Shared Use Car) (`/fi/yhteiskayttoauto`)
    - Vehicle sharing programs
    - Corporate vehicle pooling
    - Access systems
    - Booking platform

16. Maastavienti asiakirja (Export Documents) (`/fi/maastavienti-asiakirja`)
    - Vehicle export documentation
    - International requirements
    - Process guidelines
    - Support services

17. Kilometrien ilmoitus (Mileage Reporting) (`/fi/kilometrien-ilmoitus`)
    - Mileage tracking system
    - Reporting methods
    - Usage monitoring
    - Excess mileage information

### Authentication

1. Kirjaudu Innoon (Log in to Inno) (`/fi/kirjaudu`)
   - Client portal access
   - User authentication
   - Account management
   - Secure login system

## Navigation Design

### Main Navigation Structure

The site will use a single main navigation at the top of all pages, with dropdown menus for organizing the extensive page structure.

#### Top-Level Navigation Items

1. **Leasing-palvelut** (Leasing Services) - Dropdown
   - Autoleasing (Car Leasing)
   - Kone- ja laitelasing (Machine and Equipment Leasing)
   - Minileasing
   - Kausiauito (Seasonal Car)
   - Sijaisautopalvelu (Replacement Car Service)
   - Yhteiskäyttöauto (Shared Use Car)

2. **Asiakkaalle** (For Customers) - Dropdown
   - Autoilijan opas (Driver's Guide)
   - Opas auton palautukseen (Guide to Returning a Car)
   - Leaseingauton palautusohje (Leasing Car Return Instructions)
   - Sopimuksen päättyminen (Contract Termination)
   - Kilometrien ilmoitus (Mileage Reporting)
   - Maastavienti asiakirja (Export Documents)

3. **Auton vuokraus** (Car Rental) - Dropdown
   - Vuokraa auto (Rent a Car)
   - Huollon varaus (Service Booking)
   - Rengaspalvelut (Tire Services)

4. **Ajankohtaista** (Current Topics) - Dropdown
   - Blogi (Blog)
   - Kampanjat (Campaigns)
   - Asiakastarinat (Customer Stories)
   - Avoimet työpaikat (Open Positions)

5. **Tietoa meistä** (About Us) - Dropdown
   - Yritysleasingit (Business Leasing)
   - Autokannan hallinnointi (Fleet Management)
   - Muut palvelut (Other Services)
   - Asiakaspalvelu (Customer Service)

6. **Yhteystiedot** (Contact Information) - CTA Button
   - Direct link to contact page

#### Mobile Navigation

- Hamburger menu icon for smaller screens
- Expandable accordion-style dropdowns for mobile
- "Yhteystiedot" button remains visible outside menu

#### Navigation Features

- Active state highlighting
- Dropdown indicator icons
- Smooth reveal animations for dropdowns
- Sticky behavior on scroll
- Transparent to solid background transition when scrolling

### Footer Design

The footer will be organized into four main columns with links to essential pages and information.

#### Column 1: Company Information
- Logo
- Company name (Innolease Oy)
- Address (Katuosoite 10, 01150 Kaupunki)
- Business ID (Y-tunnus: 2661196-9)
- Copyright info (© 2025 Innolease Oy)

#### Column 2: Office Locations
- Helsinki (with link)
- Oulu (with link)
- Vantaa (with link)
- Raisio (with link)

#### Column 3: Resources
- Kalustoraportointi (Fleet Reporting)
- Päästöraportti (Emissions Report)
- Sähköinen ajopalvkirja (Electronic Driving Log)
- Autoilijan opas (Driver's Guide)
- Leasingauton palautusohje (Leasing Car Return Guide)

#### Column 4: Tools
- Autopäättäjän työkalut (Car Decision-maker Tools)
- Autoetulaskuri (Car Benefit Calculator)
- Sähköautojen vertailu (Electric Car Comparison)

#### Additional Footer Elements
- Social media icons (Facebook, Twitter, Instagram)
- Language selector (FI, SV, EN)
- Privacy policy link
- Terms of service link
- Cookie policy link
- Newsletter signup

#### Footer Responsive Behavior
- Columns stack on smaller screens
- Full width on mobile devices
- Collapsible sections on mobile for better space usage

### Navigation Implementation

For implementing the navigation and footer, we'll use the following approach:

1. **Main Navigation Component**
   - Create a reusable `MainNavigation` component
   - Implement dropdown functionality with React state management
   - Use CSS transitions for smooth interactions
   - Handle responsive design with Tailwind breakpoints

2. **Footer Component**
   - Create a reusable `Footer` component
   - Implement responsive grid layout
   - Ensure all links are accessible
   - Optimize for mobile viewing

3. **Common Features**
   - All navigation links to use Next.js `Link` component for client-side navigation
   - Internationalization support for all menu items
   - SEO-friendly markup structure
   - Keyboard navigation support
   - ARIA attributes for accessibility

This navigation structure ensures all important pages are easily accessible while maintaining a clean, uncluttered interface. The dropdown menus organize content logically without overwhelming users with too many top-level options.