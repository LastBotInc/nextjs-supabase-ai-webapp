# API Reference

## Authentication Endpoints

### POST /api/auth/callback
Handles OAuth callbacks from providers (Google, GitHub).

### POST /api/auth/confirm
Confirms email verification tokens.

## AI Endpoints

### POST /api/ai/chat
Streams AI responses for chat interactions.
- **Body**: `{ message: string, conversationId?: string }`
- **Response**: Server-sent events stream

### POST /api/ai/generate-image
Generates images using AI providers.
- **Body**: `{ prompt: string, provider: 'gemini' | 'openai', options?: {...} }`
- **Response**: `{ imageUrl: string }`

### POST /api/ai/generate-video
Generates videos using Replicate or Gemini.
- **Body**: `{ prompt: string, imageUrl?: string, duration?: number }`
- **Response**: `{ videoUrl: string, jobId: string }`

## Admin Endpoints

All admin endpoints require authentication and admin role.

### GET /api/admin/users
Lists all users with pagination.
- **Query**: `?page=1&limit=20&search=query`
- **Response**: `{ users: User[], total: number }`

### PUT /api/admin/users/:id
Updates user details or role.
- **Body**: `{ role?: string, metadata?: object }`
- **Response**: `{ user: User }`

### GET /api/admin/analytics
Retrieves analytics data.
- **Query**: `?period=7d|30d|90d`
- **Response**: `{ views: number, users: number, events: Event[] }`

## Content Endpoints

### GET /api/blog/posts
Lists published blog posts.
- **Query**: `?page=1&limit=10&tag=tagname`
- **Response**: `{ posts: Post[], total: number }`

### GET /api/blog/posts/:slug
Retrieves a single blog post by slug.
- **Response**: `{ post: Post }`

### POST /api/blog/posts (Admin only)
Creates a new blog post.
- **Body**: `{ title: string, content: string, tags: string[] }`
- **Response**: `{ post: Post }`

## Inngest Endpoints

### POST /api/inngest
Inngest webhook endpoint for background job processing.
- Handles email sending, AI generation, analytics

## Utility Endpoints

### GET /api/health
Health check endpoint.
- **Response**: `{ status: 'ok', timestamp: string }`

### POST /api/contact
Handles contact form submissions.
- **Body**: `{ name: string, email: string, message: string }`
- **Response**: `{ success: boolean }`

## Error Responses

All endpoints follow consistent error format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {} // Optional additional data
  }
}
```

Common error codes:
- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error