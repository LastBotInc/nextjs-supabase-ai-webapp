import { tavily } from '@tavily/core'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

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

const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY || '' })

export async function POST(request: Request) {
  try {
    // Get authorization token from request headers
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }
    const token = authHeader.split(' ')[1]

    // Create authenticated Supabase client
    const supabase = await createClient()

    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { query, type, depth, max_tokens, max_results, topic, days } = await request.json()

    // Validate required parameters
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    // Validate max_results
    if (max_results !== undefined) {
      if (max_results < 1 || max_results > 50) {
        return NextResponse.json(
          { error: 'max_results must be between 1 and 50' },
          { status: 400 }
        )
      }
    }

    console.log('Search request:', { query, type, depth, max_tokens, max_results })

    let results: SearchResult[] = []
    if (type === 'context') {
      // Use searchContext for more detailed content
      const contextResults = await tavilyClient.searchContext(query, {
        searchDepth: depth,
        maxTokens: max_tokens,
        maxResults: max_results,
        topic,
        days
      })

      console.log('Context search raw response:', contextResults)

      try {
        // Handle the response, which might be a string or already parsed
        let parsedResults: TavilyResult[] = []
        
        if (typeof contextResults === 'string') {
          try {
            // First parse attempt - for double-stringified JSON
            const firstParse = JSON.parse(contextResults)
            console.log('First parse type:', typeof firstParse)
            
            if (typeof firstParse === 'string') {
              // If still a string, parse again
              parsedResults = JSON.parse(firstParse)
            } else if (Array.isArray(firstParse)) {
              parsedResults = firstParse
            }
          } catch (parseError) {
            console.error('Parse error:', parseError)
            throw parseError
          }
        } else if (Array.isArray(contextResults)) {
          parsedResults = contextResults
        } else if (typeof contextResults === 'object' && contextResults !== null) {
          parsedResults = [contextResults as TavilyResult]
        }

        console.log('Parsed results:', parsedResults)

        // Map the results to our expected format
        if (Array.isArray(parsedResults)) {
          results = parsedResults.map(item => ({
            title: item.title || item.url.split('/').pop() || 'Untitled',
            url: item.url,
            snippet: item.content,
            score: item.score || 1,
            published_date: item.publishedDate || new Date().toISOString()
          }))
        }

      } catch (error) {
        console.error('Failed to process context results:', error)
        // Create a single result with the raw content if parsing fails
        results = [{
          title: 'Search Results',
          url: '',
          snippet: String(contextResults),
          score: 1,
          published_date: new Date().toISOString()
        }]
      }
    } else {
      // Regular search
      const searchResponse = await tavilyClient.search(query, {
        searchDepth: depth,
        maxResults: max_results,
        topic,
        days,
        includeAnswer: false
      })
      
      results = (searchResponse.results || []).map((item: TavilyResult) => ({
        title: item.title || item.url.split('/').pop() || 'Untitled',
        url: item.url,
        snippet: item.content,
        score: item.score || 1,
        published_date: item.publishedDate || new Date().toISOString()
      }))
    }

    console.log('Final results:', results)
    return NextResponse.json({ results })
  } catch (error) {
    console.error('Tavily search error:', error)
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    )
  }
} 