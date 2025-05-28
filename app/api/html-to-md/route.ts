import { NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'edge'
export const maxDuration = 60 // 1 minute

export async function POST(req: NextRequest) {
  try {
    console.log('\n📝 [POST /api/html-to-md] HTML to Markdown conversion request')

    // 1. Token Verification Layer
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ Missing or invalid auth header')
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log('🔑 Creating auth client...')
    // Create regular client to verify the token
    const authClient = await createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser(authHeader.split(' ')[1])
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ User authenticated:', user.id)

    const { html, selector } = await req.json()
    
    if (!html) {
      return new Response(
        JSON.stringify({ error: 'HTML content is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Dynamic import of TurndownService
    const { default: TurndownService } = await import('turndown')
    
    // Initialize Turndown with minimal config
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced'
    })
    
    // Convert HTML to Markdown
    let content = html
    if (selector) {
      // If selector is provided, create a temporary DOM element
      const dom = new DOMParser().parseFromString(html, 'text/html')
      const element = dom.querySelector(selector)
      content = element ? element.innerHTML : html
    }
    
    const markdown = turndownService.turndown(content)
    
    console.log('✅ HTML to Markdown conversion successful')
    return new Response(
      JSON.stringify({ markdown }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('❌ HTML to Markdown conversion error:', err)
    return new Response(
      JSON.stringify({ error: 'Error converting HTML to Markdown' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
} 