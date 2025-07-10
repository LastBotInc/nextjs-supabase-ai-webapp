import { tavily } from '@tavily/core'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

interface SearchResult {
  title: string
  url: string
  snippet: string
  score: number
  published_date: string
}

interface TavilyResult {
  url: string
  title?: string
  content: string
  publishedDate?: string
  score?: number
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }

  const tavilyApiKey = process.env.TAVILY_API_KEY
  if (!tavilyApiKey) {
    return NextResponse.json({ error: 'Tavily API key is not configured' }, { status: 401 })
  }

  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
       console.log("[GET /api/tavily-search] User not logged in, proceeding without user context.");
    }

    const tavilyClientCore = tavily({ apiKey: tavilyApiKey })
    const searchResponse = await tavilyClientCore.search(query, {
      searchDepth: 'basic',
      maxResults: 5
    })

    const results = (searchResponse.results || []).map((item: TavilyResult) => ({
      title: item.title || item.url?.split('/').pop() || 'Untitled',
      url: item.url,
      snippet: item.content,
      score: item.score || 1,
      published_date: item.publishedDate || new Date().toISOString()
    }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Tavily search error (GET):', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch search results';
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('\n📝 [POST /api/tavily-search] Web research request')

    // 1. Token Verification Layer
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ Missing or invalid auth header')
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    console.log('🔑 Creating auth client...')
    // Create regular client to verify the token
    const authClient = await createClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser(authHeader.split(' ')[1])
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', user.id)

    const {
      query,
      type = 'search',
      depth = 'basic',
      max_tokens,
      max_results = 5,
      topic,
      days,
      include_answer = false
    } = await request.json()

    console.log('[POST /api/tavily-search] Request:', { query, type, depth, max_tokens, max_results })

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    if (type !== 'search' && type !== 'context') {
      return NextResponse.json(
        { error: 'Invalid search type' },
        { status: 400 }
      )
    }

    const tavilyApiKey = process.env.TAVILY_API_KEY
    if (!tavilyApiKey) {
      return NextResponse.json({ error: 'Tavily API key is not configured' }, { status: 401 })
    }

    const tavilyClientCore = tavily({ apiKey: tavilyApiKey })

    let results: SearchResult[] = []
    if (type === 'context') {
      const contextResultsRaw = await tavilyClientCore.searchContext(query, {
        searchDepth: depth,
        maxTokens: max_tokens,
        maxResults: max_results,
        topic,
        days
      })

      console.log('[POST /api/tavily-search] Context search raw response:', contextResultsRaw)

      try {
        let parsedResults: TavilyResult[] = []
        if (typeof contextResultsRaw === 'string') {
          parsedResults = JSON.parse(contextResultsRaw);
          if (typeof parsedResults === 'string') {
            parsedResults = JSON.parse(parsedResults);
          }
        } else if (Array.isArray(contextResultsRaw)) {
          parsedResults = contextResultsRaw
        } else if (typeof contextResultsRaw === 'object' && contextResultsRaw !== null) {
          parsedResults = [contextResultsRaw as TavilyResult]
        }

        if (Array.isArray(parsedResults)) {
          results = parsedResults.map(item => ({
            title: item.title || item.url?.split('/').pop() || 'Untitled',
            url: item.url,
            snippet: item.content,
            score: item.score || 1,
            published_date: item.publishedDate || new Date().toISOString()
          }))
        } else {
           throw new Error("Parsed context results were not an array.")
        }
      } catch (error) {
        console.error('[POST /api/tavily-search] Failed to process context results:', error)
        results = [{
          title: 'Raw Context Results',
          url: '' as string,
          snippet: String(contextResultsRaw),
          score: 1,
          published_date: new Date().toISOString()
        }]
      }
    } else {
      const searchResponse = await tavilyClientCore.search(query, {
        searchDepth: depth,
        maxResults: max_results,
        topic,
        days,
        includeAnswer: false
      })

      results = (searchResponse.results || []).map((item: TavilyResult) => ({
        title: item.title || item.url?.split('/').pop() || 'Untitled',
        url: item.url,
        snippet: item.content,
        score: item.score || 1,
        published_date: item.publishedDate || new Date().toISOString()
      }))
    }

    console.log('[POST /api/tavily-search] Final results:', results)
    return NextResponse.json({ results })

  } catch (error) {
    console.error('❌ Tavily search error (POST):', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to perform search';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
} 