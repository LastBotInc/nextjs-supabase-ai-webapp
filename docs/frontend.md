# Frontend Documentation

## Views/Screens

### Public Pages (`/[locale]`)

1. Home Page (`/`)
   - Template features showcase
   - Getting started guide
   - Documentation links
   - GitHub repository link

2. Blog Page (`/blog`)
   - Article listings
   - Categories
   - Search functionality
   - Featured posts
   - AI-enhanced content

3. Privacy Page (`/privacy`)
   - Privacy policy
   - Data handling
   - Cookie information

4. Preview Page (`/preview/[id]`)
   - Content preview
   - Share functionality
   - Version comparison

5. Public Booking Page (`/book/[userId]`)
   - Month view calendar
   - Available time slots for selected date
   - Timezone selector
   - Booking form with fields:
     - Name
     - Email
     - Company (optional)
     - Description/Agenda (optional)
   - Confirmation screen
   - Success/Error messages
   - Responsive design for all devices

### Admin Pages (`/[locale]/admin`)

1. Dashboard (`/admin`)
   - Overview statistics
   - Quick actions
   - Recent activity

2. Blog Management (`/admin/blog`)
   - Post editor with AI assistance
   - Post list
   - Category management
   - Media library
   - AI image generation

3. User Management (`/admin/users`)
   - User list
   - Role management
   - Access control
   - Profile management

4. Media Management (`/admin/media`)
   - Media asset library
   - Folder organization
   - AI image generation
   - Optimization tools

5. Analytics Dashboard (`/admin/analytics`)
   - Page view tracking
   - User behavior
   - Performance metrics
   - Custom reports

6. Calendar Management (`/admin/calendar`)
   - Calendar view with booked/available slots
   - Settings panel:
     - Default meeting duration
     - Buffer times
     - Working hours
     - Blocked dates
     - Timezone settings
   - Upcoming meetings list
   - Past meetings history
   - Quick actions:
     - Block time slots
     - Cancel meetings
     - Copy booking link

7. Contact Management (`/admin/contacts`)
   - Contact list
   - Status tracking
   - Communication history
   - Task management

8. Landing Pages (`/admin/landing-pages`)
   - Page builder
   - Template management
   - SEO settings
   - Performance tracking

9. Translation Management (`/admin/translations`)
   - Language settings
   - Translation editor
   - Import/Export
   - Missing keys tracking

## UI/UX Patterns

### Design System
- Colors:
  - Primary Gradient Colors:
    - Pink: #E078F9
    - Purple: #B800DF
    - Indigo: #824BFC
    - Light Blue: #767FFF
    - Blue: #2B39FF
    - Deep Purple: #5D00F8
    - Cyan: #8BFCFF
  - Base Colors:
    - White: #FFFFFF
    - Dark Gray: #262626
    - Medium Gray: #6B6B6B
  - Gradients:
    - Primary: bg-gradient-to-r from-[#E078F9] via-[#2B39FF] to-[#8BFCFF]
    - Secondary: bg-gradient-to-r from-[#E078F9] to-[#2B39FF]
  - Dark Mode:
    - Background: #262626
    - Card Background: #1F1F1F
    - Text: #FFFFFF

- Typography:
  - Headings: Geist Sans
  - Body: Inter
  - Code: Geist Mono
  
- Heading Styles:
  - Main Headings (H1):
    - Font: Geist Sans
    - Size: text-5xl (3rem) on mobile, text-6xl (3.75rem) on desktop
    - Weight: font-extrabold
    - Line Height: leading-[1.1] (1.1)
    - Gradient: bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400
    - Style: bg-clip-text text-transparent
    - Margin Bottom: mb-6
    - Container: max-w-4xl mx-auto text-center
    - Tracking: tracking-tight

  - Section Headings (H2):
    - Font: Geist Sans
    - Size: text-4xl (2.25rem)
    - Weight: font-bold
    - Color: text-white with gradient background
    - Container: Dark card with gradient (from-gray-800 to-gray-900)
    - Card Style: rounded-2xl p-8
    - Hover Effects: 
      - Scale: transform hover:scale-105
      - Shadow: hover:shadow-2xl hover:shadow-purple-500/10
      - Transition: transition-all duration-300

  - Content Headings (H3):
    - Font: Geist Sans
    - Size: text-2xl (1.5rem)
    - Weight: font-bold
    - Color: text-white
    - Container: Dark card with gradient (from-gray-800 to-gray-900)
    - Card Style: rounded-2xl p-8
    - Hover Effects:
      - Scale: transform hover:scale-105
      - Text Gradient: group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400
      - Shadow: hover:shadow-2xl hover:shadow-purple-500/10
      - Transition: transition-all duration-300

- Components:
  - Buttons:
    - Primary: Purple fill
    - Secondary: Purple outline
    - Ghost: Transparent with hover
  - Cards:
    - White background
    - Subtle shadow
    - Rounded corners
  - Forms:
    - Clean, minimal design
    - Inline validation
    - Clear error states

### Responsive Design
- Mobile-first approach
- Breakpoints:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

### Animations
- Subtle hover effects
- Smooth page transitions
- Loading states
- Micro-interactions

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode
- Focus indicators

## Styling Approach

1. Tailwind CSS
   - Custom configuration
   - Component classes
   - Utility-first approach
   - Dark mode support

2. CSS Modules
   - For complex components
   - Animation keyframes
   - Custom properties

3. CSS-in-JS (styled-components)
   - Dynamic styling
   - Theme provider
   - Global styles

## Performance Optimization

1. Image Optimization
   - Next.js Image component
   - Responsive images
   - WebP format
   - Lazy loading

2. Code Splitting
   - Route-based splitting
   - Component lazy loading
   - Dynamic imports

3. Caching Strategy
   - Static page generation
   - Incremental Static Regeneration
   - API response caching

4. Core Web Vitals
   - LCP optimization
   - FID improvement
   - CLS minimization