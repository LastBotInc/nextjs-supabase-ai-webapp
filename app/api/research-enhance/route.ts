import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'
import { tavily } from '@tavily/core'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

interface GeminiAnalysis {
  summary: string
  keyPoints: string[]
  targetAudience: string
  writingStyle: string
  confidenceScore: number
}

interface TavilyAnalysis {
  readability_score?: number
  sentiment?: string
  topics?: string[]
  outline?: string[]
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_KEY || '')
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2048,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
})

// Initialize Tavily
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

    const { url, title, snippet } = await request.json()

    // Get detailed data from Tavily using context search
    const tavilyContext = await tavilyClient.searchContext(url, {
      searchDepth: 'advanced',
      maxTokens: 10000,
      maxResults: 1,
    })

    // Generate summary and key points with Gemini using the expanded context
    const prompt = `
      Please analyze this article:
      Title: ${title}
      Content: ${snippet}
      Additional Context: ${tavilyContext}
      URL: ${url}

      Provide a JSON response with:
      1. A concise 2-3 sentence summary
      2. 3-5 key points
      3. The target audience
      4. The writing style (academic, journalistic, blog, etc.)
      5. A confidence score (0-1) for the factual accuracy based on the source and content

      Format the response as a JSON object with these exact keys:
      {
        "summary": "string",
        "keyPoints": ["string"],
        "targetAudience": "string",
        "writingStyle": "string",
        "confidenceScore": number
      }
    `

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }]}],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        topP: 0.8,
        topK: 40,
      }
    })

    const geminiAnalysis = JSON.parse(result.response.text()) as GeminiAnalysis

    // Parse the context for additional insights
    const contextAnalysisPrompt = `
      Analyze this content and provide a JSON response with:
      1. Readability score (0-1)
      2. Overall sentiment (positive, negative, or neutral)
      3. Main topics (up to 5)
      4. Content outline (up to 5 main points)

      Content: ${tavilyContext}

      Format as:
      {
        "readability_score": number,
        "sentiment": "string",
        "topics": ["string"],
        "outline": ["string"]
      }
    `

    const contextAnalysis = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: contextAnalysisPrompt }]}],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    })

    const tavilyAnalysis = JSON.parse(contextAnalysis.response.text()) as TavilyAnalysis

    // Combine all analysis
    const enhancedData = {
      ...geminiAnalysis,
      readabilityScore: tavilyAnalysis.readability_score || null,
      sentiment: tavilyAnalysis.sentiment || null,
      topics: tavilyAnalysis.topics || [],
      outline: tavilyAnalysis.outline || [],
      sourceInfo: {
        domain: new URL(url).hostname,
        score: 1, // Context search doesn't provide relevance score
      }
    }

    return NextResponse.json(enhancedData)
  } catch (error) {
    console.error('Error enhancing research:', error)
    return NextResponse.json(
      { error: 'Failed to enhance research data' },
      { status: 500 }
    )
  }
} 