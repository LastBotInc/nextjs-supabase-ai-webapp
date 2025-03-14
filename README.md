# AI-Powered Next.js Template for Cursor IDE

A modern, AI-integrated Next.js template designed specifically for the Cursor IDE. This template provides a robust foundation for building intelligent web applications with features like AI image generation, web research, optimization tools, brand asset creation, and internationalization support.

![AI-powered workspace](public/images/home/hero.webp)

## Features

### 🤖 AI Integration
- **Gemini API Integration**
  - Text generation and chat capabilities
  - Image analysis and processing
  - Structured output generation
  - Configurable safety settings

- **AI Image Generation**
  - Recraft V3 API for digital illustrations
  - Flux API for photorealistic images
  - Multiple style options and customization
  - Batch generation support
  - Background removal capabilities

- **Research & Content Tools**
  - AI-powered web search with Tavily API
  - Multiple search modes: regular, Q&A, and context
  - Domain filtering and advanced search options
  - HTML to Markdown conversion
  - Content enhancement and structured data extraction

### 🌐 Internationalization
- Built-in support for multiple languages (English, Finnish)
- SEO-friendly URL structure with locale prefixes
- Server-side locale detection
- Client-side language switching
- JSON-based translation management
- Content localization support

### 🎨 Media & Assets
- Automatic image optimization with Sharp.js
- WebP conversion for modern browsers
- Background removal capabilities
- Flexible resizing and quality settings
- Asset organization and management
- Social media templates
- Business card designs

### 📅 Booking System
- Appointment scheduling
- Calendar management
- Timezone support
- Email notifications via SendGrid

### 📊 Analytics & Real-time Features
- Page view tracking
- Event tracking
- Session management
- User journey analysis
- Live updates
- Data synchronization
- Presence indicators
- Collaborative editing

## Tech Stack

- **Frontend**: Next.js 15.1.3, React 19
- **Styling**: Tailwind CSS, Geist Font
- **AI Services**: 
  - Gemini API (Google AI Studio)
  - Recraft V3 API
  - Flux API
  - Tavily API
- **Image Processing**: Sharp.js
- **Email**: SendGrid
- **Security**: Cloudflare Turnstile
- **Database**: Supabase with Row Level Security
- **Internationalization**: next-intl
- **Development**: TypeScript, ESLint
- **Testing**: Jest, Cypress
- **Performance**: Built-in image optimization, responsive design

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/LastBotInc/nextjs-ai-webpage.git
   cd nextjs-ai-webpage
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Configure the following environment variables in `.env.local`:

   **AI Services:**
   - `REPLICATE_API_TOKEN`: Get from [Replicate](https://replicate.com)
   - `GOOGLE_AI_STUDIO_KEY`: Get from [Google AI Studio](https://makersuite.google.com)
   - `TAVILY_API_KEY`: Get from [Tavily](https://tavily.com)
   - `SENDGRID_API_KEY`: Get from [SendGrid](https://sendgrid.com)

   **Security:**
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: Get from [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile)
   - `TURNSTILE_SECRET_KEY`: Get from Cloudflare Turnstile

   **Database (Supabase):**
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public API key
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role key (admin)
   - `SUPABASE_JWT_SECRET`: JWT secret (min 32 characters)
   - `SUPABASE_S3_ACCESS_KEY`: S3 compatible storage access key
   - `SUPABASE_S3_SECRET_KEY`: S3 compatible storage secret key
   - `SUPABASE_S3_REGION`: S3 region (use 'local' for development)

   **Test Data Configuration:**
   - `SEED_TEST_USER_EMAIL`: Email for test user (default: test@example.com)
   - `SEED_TEST_USER_PASSWORD`: Password for test user
   - `SEED_ADMIN_EMAIL`: Email for admin user (default: admin@example.com)
   - `SEED_ADMIN_PASSWORD`: Password for admin user

   **Other Configurations:**
   - `NODE_ENV`: Set to 'development' for local development
   - `NEXT_PUBLIC_SITE_URL`: Your site URL (http://localhost:3000 for local)

4. Initialize the database:
   ```bash
   # Reset the database (required after schema changes or when starting fresh)
   supabase db reset

   # Initialize development environment (run these in order)
   npm run seed:users:local        # Create test users and admin
   npm run seed:blog:local         # Create blog posts with AI-generated images
   npm run import-translations:local # Import language translations
   ```

   **Important**: Database initialization is required in these cases:
   - After every `supabase db reset`
   - When setting up the project for the first time
   - After pulling new migrations
   - If you encounter data-related issues

   **Note about blog seeding**:
   - The `seed:blog:local` script creates blog posts in both English and Finnish
   - It automatically generates and optimizes images for each post using AI
   - The process may take a few minutes as it involves AI image generation
   - Requires valid `REPLICATE_API_TOKEN` and `GOOGLE_AI_STUDIO_KEY` for content generation

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) to view the application

## Available Scripts

### Development Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm test`: Run Jest unit tests
- `npm run cypress`: Run Cypress E2E tests

### Database Scripts
- `supabase db reset`: Reset database to clean state
- `npm run seed:users:local`: Create test users and admin for development
- `npm run seed:users:prod`: Create initial users for production
- `npm run seed:blog:local`: Create blog posts with AI-generated images for development
- `npm run seed:blog:prod`: Create blog posts with AI-generated images for production
- `npm run import-translations:local`: Import translations for development
- `npm run import-translations:prod`: Import translations for production
- `npm run generate-embeddings`: Generate search embeddings for blog posts

### AI & Media Tools
- `npm run gemini`: Generate text or analyze images with Gemini API
- `npm run recraft`: Generate images using Recraft V3 API
- `npm run flux`: Generate photorealistic images using Flux API
- `npm run optimize-image`: Optimize and process images
- `npm run html-to-md`: Convert HTML content to Markdown
- `npm run tavily-search`: Perform AI-powered web searches
- `npm run download-file`: Download and process files
- `npm run generate-video`: Generate videos using various AI models

### Utility Scripts
- `npm run send-email-sendgrid`: Send emails using SendGrid
- `npm run check-translations`: Compare translation files for completeness
- `npm run submit-sitemap`: Submit sitemap to search engines
- `npm run test-analytics`: Test analytics tracking

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
