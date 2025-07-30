# Background Jobs Subsystem

## Overview

The Background Jobs subsystem handles asynchronous processing, scheduled tasks, and event-driven workflows using Inngest. It enables the application to perform time-consuming operations without blocking user interactions, including email sending, AI content generation, image processing, and data synchronization. The system provides reliable job execution with automatic retries, error handling, and monitoring capabilities.

This subsystem is crucial for maintaining application responsiveness while handling resource-intensive tasks. It processes events in a scalable, serverless manner, ensuring that heavy operations like AI generation or bulk data processing don't impact the user experience.

## Key Components

### Inngest Configuration
- **lib/inngest-client.ts**: Inngest client setup
- **lib/inngest-functions.ts**: Function definitions
- **app/api/inngest/route.ts**: Inngest webhook handler
- **app/api/inngest/trigger/route.ts**: Manual trigger endpoint

### Job Functions
- Email sending workflows
- AI content generation jobs
- Image processing tasks
- Analytics aggregation
- Data synchronization
- Scheduled maintenance tasks

### Development Tools
- Inngest Dev Server (port 8290)
- Local function testing
- Event replay capabilities
- Job monitoring dashboard

## Dependencies

### External Dependencies
- `inngest`: Core job processing library
- Background job infrastructure
- Event-driven architecture

### Internal Dependencies
- Email Service: Notification delivery
- AI Integration: Content generation
- Media Processing: Image/video handling
- Database: Job state persistence

## Entry Points

### Event Triggers
1. **HTTP Webhook**: `/api/inngest` - Receives events
2. **Manual Trigger**: `/api/inngest/trigger` - Testing
3. **Application Events**: Programmatic triggering
4. **Scheduled Jobs**: Cron-based execution

### Development Interface
1. **Dev UI**: `http://localhost:8290/dev`
2. **Function Registry**: View all functions
3. **Event History**: Track executions
4. **Manual Testing**: Trigger events

## Data Flow

### Job Execution Flow
1. Event triggered in application
2. Event sent to Inngest queue
3. Inngest routes to appropriate function
4. Function executes with retry logic
5. Results logged and monitored
6. Success/failure callbacks fired
7. Cleanup and state updates

### Email Processing
1. Email event triggered
2. Template and data prepared
3. SendGrid API called
4. Delivery status tracked
5. Retry on failure
6. Bounce handling

### AI Generation Jobs
1. Generation request queued
2. AI provider selected
3. Content generated in chunks
4. Progress updates sent
5. Results stored in database
6. User notified of completion

## Key Patterns

### Function Definition
```typescript
export const sendEmailFunction = inngest.createFunction(
  { id: 'send-email', name: 'Send Email' },
  { event: 'email/send.requested' },
  async ({ event, step }) => {
    await step.run('prepare-email', async () => {
      return prepareEmailTemplate(event.data);
    });
    
    const result = await step.run('send-via-sendgrid', async () => {
      return sendEmail(event.data);
    });
    
    return { success: true, messageId: result.id };
  }
);
```

### Event Triggering
```typescript
// Trigger from application code
await inngest.send({
  name: 'email/send.requested',
  data: {
    to: user.email,
    subject: 'Welcome!',
    template: 'welcome',
    data: { name: user.name }
  }
});
```

### Step Functions
```typescript
// Multi-step job with checkpoints
const generateContent = inngest.createFunction(
  { id: 'generate-content' },
  { event: 'content/generate.requested' },
  async ({ event, step }) => {
    const outline = await step.run('generate-outline', async () => {
      return generateOutline(event.data.topic);
    });
    
    const content = await step.run('generate-full-content', async () => {
      return generateFromOutline(outline);
    });
    
    await step.run('save-to-database', async () => {
      return saveContent(content);
    });
  }
);
```

## File Inventory

### Core Inngest Files
- `lib/inngest-client.ts` - Inngest client configuration
- `lib/inngest-functions.ts` - Function definitions
- `app/api/inngest/route.ts` - Webhook handler
- `app/api/inngest/trigger/route.ts` - Manual trigger

### Function Definitions
- Email sending functions
- Content generation functions
- Image processing functions
- Analytics aggregation functions
- Maintenance task functions

### Supabase Edge Functions
- `supabase/functions/_shared/cors.ts` - CORS utilities
- `supabase/functions/_shared/email.ts` - Email helpers
- `supabase/functions/_shared/types.ts` - Shared types
- `supabase/functions/contact-notification/index.ts` - Contact emails
- `supabase/functions/send-email/index.ts` - Email sending
- `supabase/functions/gemini/index.ts` - Gemini processing

### Configuration Files
- `supabase/functions/gemini/deno.json` - Deno config
- `supabase/functions/gemini/import_map.json` - Import map
- `supabase/functions/gemini/deno.lock` - Lock file

### Development Scripts
- `npm run dev:inngest` - Start Inngest dev server
- `npm run dev` - Start with Inngest included

### Test Files
- `supabase/functions/gemini/index.test.ts` - Function tests
- `supabase/functions/gemini/deno.test.json` - Test config

### Supporting Infrastructure
- Environment variables for Inngest
- Event type definitions
- Error handling utilities
- Retry configuration
- Monitoring integration

### Documentation
- Inngest function documentation
- Event catalog
- Deployment guides
- Monitoring setup