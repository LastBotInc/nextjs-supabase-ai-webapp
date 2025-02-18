// Set environment variables before importing the route
process.env.TAVILY_API_KEY = 'test-token';

// Mock Tavily client
const mockSearch = jest.fn();
const mockSearchContext = jest.fn();
jest.mock('@tavily/core', () => ({
  tavily: jest.fn(() => ({
    search: mockSearch,
    searchContext: mockSearchContext
  }))
}));

import { createClient } from '@/utils/supabase/server';
import { POST } from '../route';
import '@testing-library/jest-dom';

interface MockResponse {
  status: number;
  json: () => Promise<unknown>;
}

// Mock dependencies
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data: Record<string, unknown>, init?: { status?: number }): MockResponse => ({
      ...data,
      status: init?.status || 200,
      json: async () => data
    }))
  }
}));

jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn()
}));

describe('POST /api/tavily-search', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Supabase auth
    (createClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
      }
    });
  });

  it('should perform a regular search successfully', async () => {
    // Mock request
    const request = new Request('http://localhost/api/tavily-search', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        query: 'test query',
        type: 'search',
        depth: 'basic',
        max_results: 5
      })
    });

    // Mock Tavily response
    const mockResults = [
      {
        url: 'https://example.com/1',
        title: 'Test Result 1',
        content: 'Test content 1',
        score: 0.9,
        publishedDate: '2024-01-01'
      }
    ];
    mockSearch.mockResolvedValueOnce({ results: mockResults });

    // Execute request
    const response = await POST(request);
    const data = await response.json();

    // Verify response
    expect(response.status).toBe(200);
    expect(data.results).toEqual([{
      url: 'https://example.com/1',
      title: 'Test Result 1',
      snippet: 'Test content 1',
      score: 0.9,
      published_date: '2024-01-01'
    }]);

    // Verify Tavily was called with correct parameters
    expect(mockSearch).toHaveBeenCalledWith('test query', {
      searchDepth: 'basic',
      maxResults: 5,
      topic: undefined,
      days: undefined,
      includeAnswer: false
    });
  });

  it('should perform a context search successfully', async () => {
    // Mock request
    const request = new Request('http://localhost/api/tavily-search', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        query: 'test query',
        type: 'context',
        depth: 'advanced',
        max_tokens: 1000,
        max_results: 3
      })
    });

    // Mock Tavily response
    const mockResults = [
      {
        url: 'https://example.com/1',
        title: 'Context Result',
        content: 'Detailed content',
        score: 0.95,
        publishedDate: '2024-01-01'
      }
    ];
    mockSearchContext.mockResolvedValueOnce(mockResults);

    // Execute request
    const response = await POST(request);
    const data = await response.json();

    // Verify response
    expect(response.status).toBe(200);
    expect(data.results).toEqual([{
      url: 'https://example.com/1',
      title: 'Context Result',
      snippet: 'Detailed content',
      score: 0.95,
      published_date: '2024-01-01'
    }]);

    // Verify Tavily was called with correct parameters
    expect(mockSearchContext).toHaveBeenCalledWith('test query', {
      searchDepth: 'advanced',
      maxTokens: 1000,
      maxResults: 3,
      topic: undefined,
      days: undefined
    });
  });

  it('should handle missing authorization header', async () => {
    const request = new Request('http://localhost/api/tavily-search', {
      method: 'POST',
      body: JSON.stringify({ query: 'test' })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Missing or invalid authorization header');
  });

  it('should handle invalid authorization token', async () => {
    // Mock unauthorized user
    (createClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: new Error('Invalid token') })
      }
    });

    const request = new Request('http://localhost/api/tavily-search', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer invalid-token'
      },
      body: JSON.stringify({ query: 'test' })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should handle Tavily API errors', async () => {
    const request = new Request('http://localhost/api/tavily-search', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        query: 'test query',
        type: 'search'
      })
    });

    // Mock Tavily error
    mockSearch.mockRejectedValueOnce(new Error('API error'));

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to perform search');
  });

  it('should handle context search with string response', async () => {
    const request = new Request('http://localhost/api/tavily-search', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        query: 'test query',
        type: 'context'
      })
    });

    // Mock string response that needs parsing
    const mockStringResult = JSON.stringify([{
      url: 'https://example.com/1',
      title: 'String Result',
      content: 'String content',
      score: 0.8,
      publishedDate: '2024-01-01'
    }]);
    mockSearchContext.mockResolvedValueOnce(mockStringResult);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toEqual([{
      url: 'https://example.com/1',
      title: 'String Result',
      snippet: 'String content',
      score: 0.8,
      published_date: '2024-01-01'
    }]);
  });

  it('should handle context search with double-stringified response', async () => {
    const request = new Request('http://localhost/api/tavily-search', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        query: 'test query',
        type: 'context'
      })
    });

    // Mock double-stringified response
    const mockResult = [{
      url: 'https://example.com/1',
      title: 'Double String Result',
      content: 'Double string content',
      score: 0.7,
      publishedDate: '2024-01-01'
    }];
    const doubleStringified = JSON.stringify(JSON.stringify(mockResult));
    mockSearchContext.mockResolvedValueOnce(doubleStringified);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toEqual([{
      url: 'https://example.com/1',
      title: 'Double String Result',
      snippet: 'Double string content',
      score: 0.7,
      published_date: '2024-01-01'
    }]);
  });

  it('should handle context search with unparseable response', async () => {
    const request = new Request('http://localhost/api/tavily-search', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        query: 'test query',
        type: 'context'
      })
    });

    // Mock unparseable response
    const rawContent = 'Unparseable content';
    mockSearchContext.mockResolvedValueOnce(rawContent);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toEqual([{
      title: 'Search Results',
      url: '',
      snippet: rawContent,
      score: 1,
      published_date: expect.any(String)
    }]);
  });

  it('should handle missing query parameter', async () => {
    const request = new Request('http://localhost/api/tavily-search', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        type: 'search'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Query parameter is required');
  });

  it('should handle topic and days parameters in regular search', async () => {
    const request = new Request('http://localhost/api/tavily-search', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        query: 'test query',
        type: 'search',
        topic: 'news',
        days: 7
      })
    });

    mockSearch.mockResolvedValueOnce({ results: [] });

    const response = await POST(request);
    expect(response.status).toBe(200);

    expect(mockSearch).toHaveBeenCalledWith('test query', expect.objectContaining({
      topic: 'news',
      days: 7
    }));
  });

  it('should handle topic and days parameters in context search', async () => {
    const request = new Request('http://localhost/api/tavily-search', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        query: 'test query',
        type: 'context',
        topic: 'news',
        days: 7
      })
    });

    mockSearchContext.mockResolvedValueOnce([]);

    const response = await POST(request);
    expect(response.status).toBe(200);

    expect(mockSearchContext).toHaveBeenCalledWith('test query', expect.objectContaining({
      topic: 'news',
      days: 7
    }));
  });

  it('should handle non-array context search response', async () => {
    const request = new Request('http://localhost/api/tavily-search', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        query: 'test query',
        type: 'context'
      })
    });

    // Mock single object response
    const mockResult = {
      url: 'https://example.com/1',
      title: 'Single Result',
      content: 'Single content',
      score: 0.8,
      publishedDate: '2024-01-01'
    };
    mockSearchContext.mockResolvedValueOnce(mockResult);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toEqual([{
      url: 'https://example.com/1',
      title: 'Single Result',
      snippet: 'Single content',
      score: 0.8,
      published_date: '2024-01-01'
    }]);
  });

  it('should handle maxResults parameter limits', async () => {
    const request = new Request('http://localhost/api/tavily-search', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify({
        query: 'test query',
        type: 'search',
        max_results: 1000 // Unreasonably large
      })
    });

    mockSearch.mockResolvedValueOnce({ results: [] });

    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: 'max_results must be between 1 and 50'
    });
  });
}); 