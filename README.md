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

### 🔄 Background Jobs & Event Processing
- **Inngest Integration**
  - Event-driven background job processing
  - Serverless function execution
  - Queue management
  - Scheduled tasks and cron jobs
  - Reliable event delivery
  - Local development with Inngest Dev Server
  - Retries and error handling

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
- **Background Jobs**: Inngest
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
   - `OPENAI_API_KEY`: Get from [OpenAI](https://platform.openai.com/api-keys)

   **Email:**
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

   **Background Jobs (Inngest):**
   - `INNGEST_EVENT_KEY`: Your Inngest event key (optional for local development)
   - `INNGEST_SIGNING_KEY`: Your Inngest signing key (optional for local development)

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

   This will:
   - Generate namespace manifests for translations
   - Start the Next.js development server
   - Start the Inngest development server (for background jobs)

6. Open [http://localhost:3000](http://localhost:3000) to view the application

## Using Inngest for Background Jobs

This project uses [Inngest](https://www.inngest.com/) for handling background jobs, scheduled tasks, and event-driven processing in a serverless environment.

### What is Inngest?

Inngest is a developer platform that lets you run reliable background jobs and workflows in your web app without managing infrastructure. Features include:

- **Event-driven functions**: Trigger jobs based on events in your application
- **Scheduled jobs**: Set up cron-like schedules for recurring tasks
- **Retries and error handling**: Automatic retries with backoff for failed jobs
- **Local development**: Test your background jobs locally before deployment
- **Observability**: Monitor job execution, performance, and errors

### Local Development with Inngest

When you run `npm run dev`, the Inngest development server starts automatically alongside Next.js. The development server runs on port 8290 by default.

You can also start the servers separately:
- Next.js only: `npm run dev:next`
- Inngest only: `npm run dev:inngest`

### Viewing the Inngest Dev UI

The Inngest Dev UI is available at [http://localhost:8290/dev](http://localhost:8290/dev) when the Inngest server is running. This interface allows you to:

- View registered functions
- See event history
- Manually trigger events
- Inspect execution details
- Debug job failures

### Creating Inngest Functions

Inngest functions are defined in the `app/inngest` directory. To create a new function:

1. Define your function in a file within the `app/inngest` directory
2. Export it as part of the Inngest client
3. Register it in the `/api/inngest` route handler

Example function definition:
```typescript
// app/inngest/example.ts
import { inngest } from './client';

// Define a function that runs when 'app/example.event' occurs
export const exampleFunction = inngest.createFunction(
  { id: 'example-function' },
  { event: 'app/example.event' },
  async ({ event, step }) => {
    // Process the event
    const result = await step.run('process-data', async () => {
      // Your logic here
      return { processed: true };
    });
    
    return { success: true, data: result };
  }
);
```

### Production Deployment

For production, you need to:

1. Sign up for an Inngest account at [https://www.inngest.com/](https://www.inngest.com/)
2. Get your API keys from the Inngest dashboard
3. Add the following environment variables to your production environment:
   - `INNGEST_EVENT_KEY`: Your Inngest event key
   - `INNGEST_SIGNING_KEY`: Your Inngest signing key
4. Deploy your application as normal

## Available Scripts

### Development Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm test`: Run Jest unit tests
- `npm run cypress`: Run Cypress E2E tests

### Database & Seeding
- `supabase db reset`: Reset the database
- `supabase migration new <name>`: Create a new migration file
- `supabase db push`: Apply database migration changes
- `npm run seed:users:local`: Seed users for local development
- `npm run seed:users:prod`: Seed users for production
- `npm run seed:blog:local`: Seed blog data for local development
- `npm run seed:blog:prod`: Seed blog data for production

### Translations
- `npm run check-translations`: Compare translation files
- `npm run import-translations:local`: Import translations for local development
- `npm run import-translations:prod`: Import translations for production

### AI & Content Tools
- `npm run gemini -- --prompt "..." [options]`: Interact with Google Gemini API (text, chat, vision, document analysis, grounding)
- `node tools/gemini-image-tool.js generate -p "..." [options]`: Generate images with Gemini/Imagen
- `node tools/gemini-image-tool.js edit -i <input> -p "..." [options]`: Edit images with Gemini
- `npm run generate-video -- --prompt "..." [options]`: Generate videos with Replicate models (minimax, hunyuan, mochi, ltx)
- `npm run html-to-md -- --url <url> [options]`: Convert webpage HTML to Markdown

### Image & Media Tools
- `npm run optimize-image -- --input <in> --output <out> [options]`: Optimize images (resize, format, quality, remove BG via Replicate)
- `npm run remove-background-advanced -- --input <in> --output <out> [options]`: Advanced background removal (color tolerance)
- `npm run download-file -- --url <url> [options]`: Download files from URLs

### Deprecated/Removed Tools (Examples)
- `npm run recraft` (Replaced by `gemini-image`)
- `npm run flux` (Replaced by `gemini-image`)
- `npm run tavily-search` (Integrated into `gemini` tool with grounding)
- `npm run generate-embeddings` (Potentially replaced by db functions or other tools)
- `npm run send-email-sendgrid` (Handled by application logic)
- `npm run submit-sitemap` (Manual or CI process)
- `npm run test-analytics` (Use E2E tests)

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
