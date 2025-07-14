import { NextRequest } from 'next/server'
import { headers } from 'next/headers'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const headersList = headers()
  
  // Create SSE response
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()
  const encoder = new TextEncoder()

  // Handle client connection
  try {
    // Write SSE headers
    const response = new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

    // Keep connection alive
    const keepAlive = setInterval(async () => {
      try {
        await writer.write(encoder.encode('event: ping\ndata: keep-alive\n\n'))
      } catch (err) {
        clearInterval(keepAlive)
      }
    }, 30000)

    return response
  } catch (err) {
    console.error('SSE Error:', err)
    return new Response('Error establishing SSE connection', { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    // Dynamic import of dependencies
    const [{ createClient }, { GoogleGenerativeAI }] = await Promise.all([
      import('@supabase/supabase-js'),
      import('@google/generative-ai')
    ])
    
    // Initialize clients
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_KEY!)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash'
    })
    
    // Process request and send response
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()
    const encoder = new TextEncoder()
    
    // Return streaming response
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (err) {
    console.error('SSE Processing Error:', err)
    return new Response('Error processing SSE request', { status: 500 })
  }
} 