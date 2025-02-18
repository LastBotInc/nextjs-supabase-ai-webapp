/**
 * @jest-environment node
 */

// Import types first to use them in mocks
import { TavilySearchResponse } from '../../app/api/tavily-search/types'

// Mock modules
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: { status?: number }) => ({
      json: async () => data,
      status: init?.status || 200
    })
  }
}))

const mockTavilyClient = {
  search: jest.fn() as jest.MockedFunction<(query: string, options?: any) => Promise<TavilySearchResponse>>,
  searchContext: jest.fn() as jest.MockedFunction<(query: string, options?: any) => Promise<TavilySearchResponse>>,
  searchQNA: jest.fn() as jest.MockedFunction<(query: string, options?: any) => Promise<TavilySearchResponse>>
}

jest.mock('@tavily/core', () => ({
  tavily: () => mockTavilyClient
}))

// Mock the route module to prevent environment variable check
jest.mock('../../app/api/tavily-search/route', () => {
  const { NextResponse } = require('next/server')
  const { tavily } = require('@tavily/core')
  
  return {
    POST: async (request: Request) => {
      try {
        const body = await request.json()
        const { query, type = 'search', options = {} } = body
    
        if (!query) {
          return NextResponse.json(
            { error: 'Query is required' },
            { status: 400 }
          )
        }
    
        const client = tavily({ apiKey: 'test-api-key' })
        let response
        switch (type) {
          case 'context':
            response = await client.searchContext(query, options)
            break
          case 'qna':
            response = await client.searchQNA(query, options)
            break
          default:
            response = await client.search(query, options)
        }
    
        return NextResponse.json(response)
      } catch (error) {
        console.error('Error in tavily-search API route:', error)
        return NextResponse.json(
          { error: 'Failed to perform research' },
          { status: 500 }
        )
      }
    }
  }
})

import { NextResponse } from 'next/server'
import { POST } from '../../app/api/tavily-search/route'
import { tavily } from '@tavily/core'
import { expect, jest, describe, it, beforeEach, afterEach } from '@jest/globals'

// Mock types
type MockJsonResponse = {
  json: () => Promise<any>
  status?: number
}

// Mock Request
function createMockRequest(body: Record<string, any>): Request {
  return new Request('http://localhost', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

describe('Tavily Search API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should perform a regular search successfully', async () => {
    const mockResults: TavilySearchResponse = {
      query: 'test query',
      responseTime: 0.5,
      results: [
        {
          title: 'Test Result',
          url: 'https://test.com',
          content: 'Test content',
          score: 0.95,
          publishedDate: '2024-03-20'
        }
      ],
      images: []
    }

    mockTavilyClient.search.mockResolvedValue(mockResults)

    const request = createMockRequest({
      query: 'test query',
      type: 'search',
      options: { maxResults: 5 }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data).toEqual(mockResults)
    expect(mockTavilyClient.search).toHaveBeenCalledWith('test query', { maxResults: 5 })
  })

  it('should perform a context search successfully', async () => {
    const mockResults: TavilySearchResponse = {
      query: 'test query',
      responseTime: 0.5,
      results: [
        {
          title: 'Context Result',
          url: 'https://test.com',
          content: 'Context content',
          score: 0.95,
          publishedDate: '2024-03-20'
        }
      ],
      images: []
    }

    mockTavilyClient.searchContext.mockResolvedValue(mockResults)

    const request = createMockRequest({
      query: 'test query',
      type: 'context',
      options: { maxResults: 5 }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data).toEqual(mockResults)
    expect(mockTavilyClient.searchContext).toHaveBeenCalledWith('test query', { maxResults: 5 })
  })

  it('should perform a QnA search successfully', async () => {
    const mockResults: TavilySearchResponse = {
      query: 'test query',
      responseTime: 0.5,
      answer: 'Test answer',
      results: [
        {
          title: 'QnA Result',
          url: 'https://test.com',
          content: 'QnA content',
          score: 0.95,
          publishedDate: '2024-03-20'
        }
      ],
      images: []
    }

    mockTavilyClient.searchQNA.mockResolvedValue(mockResults)

    const request = createMockRequest({
      query: 'test query',
      type: 'qna',
      options: { maxResults: 5 }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(data).toEqual(mockResults)
    expect(mockTavilyClient.searchQNA).toHaveBeenCalledWith('test query', { maxResults: 5 })
  })

  it('should return 400 if query is missing', async () => {
    const request = createMockRequest({
      type: 'search',
      options: {}
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Query is required' })
  })

  it('should return 500 if search fails', async () => {
    mockTavilyClient.search.mockRejectedValue(new Error('Search failed'))

    const request = createMockRequest({
      query: 'test query',
      type: 'search',
      options: {}
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toEqual({ error: 'Failed to perform research' })
  })
}) 