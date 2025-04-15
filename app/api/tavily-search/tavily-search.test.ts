import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { tavily } from '@tavily/core'; // Import tavily for mocking
import { createClient } from '@/utils/supabase/server';

// Import the handlers to test
import { GET, POST } from './route';

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn((name: string) => {
      const store: Record<string, string> = {
        'sb-access-token': 'mock-access-token',
        'sb-refresh-token': 'mock-refresh-token',
      };
      return store[name] ? { name, value: store[name] } : undefined;
    }),
    set: vi.fn(),
    remove: vi.fn(),
  })),
}));

// Define mocks for tavily methods *outside* the factory
const mockTavilySearch = vi.fn();
const mockTavilySearchContext = vi.fn();

// Mock @tavily/core using the external mocks
vi.mock('@tavily/core', () => ({
  tavily: vi.fn(() => ({
    search: mockTavilySearch, // Use external mock
    searchContext: mockTavilySearchContext // Use external mock
  }))
}));

// Mock Supabase createClient
const mockGetUser = vi.fn();
vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser }
  }))
}));

// Define the expected type for the cookie store argument *if needed for casting inside tests*
// Note: The mock above for next/headers already returns the correct synchronous structure.
type ExpectedCookieStore = {
  get: (name: string) => { value: string | undefined } | undefined;
  set: (name: string, value: string, options: CookieOptions) => void;
  remove: (name: string, options: CookieOptions) => void;
};


// --- GET Handler Tests ---
describe('GET /api/tavily-search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TAVILY_API_KEY = 'test-key';
    mockGetUser.mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null });
    // Reset external tavily mocks
    mockTavilySearch.mockResolvedValue({ // Default success response
      results: [
        { title: 'Mock Core Result 1', url: 'http://mock-core.com/1', content: 'Mock core content 1' },
      ],
    });
    mockTavilySearchContext.mockResolvedValue([]); // Default for context (not used in GET)
  });

  afterEach(() => {
    delete process.env.TAVILY_API_KEY;
  });

  it('should return search results for a valid query', async () => {
    const request = new NextRequest('http://localhost/api/tavily-search?query=test');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('results');
    expect(data.results[0].title).toBe('Mock Core Result 1');
    // Check if tavily was instantiated (implicitly via the mock factory)
    expect(vi.mocked(tavily)).toHaveBeenCalledWith({ apiKey: 'test-key' });
    // Check the external mock function directly
    expect(mockTavilySearch).toHaveBeenCalledWith('test', { searchDepth: 'basic', maxResults: 5 });
  });

  it('should proceed if user is not logged in (GET)', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    const request = new NextRequest('http://localhost/api/tavily-search?query=test');
    const response = await GET(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('results');
    expect(mockTavilySearch).toHaveBeenCalled(); // Ensure search was still called
  });

  it('should return 400 if query parameter is missing', async () => {
    const request = new NextRequest('http://localhost/api/tavily-search');
    const response = await GET(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ error: 'Query parameter is required' });
    expect(mockTavilySearch).not.toHaveBeenCalled();
  });

  it('should return 401 if TAVILY_API_KEY is missing', async () => {
    delete process.env.TAVILY_API_KEY;
    const request = new NextRequest('http://localhost/api/tavily-search?query=test');
    const response = await GET(request);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: 'Tavily API key is not configured' });
    expect(mockTavilySearch).not.toHaveBeenCalled();
  });

  it('should return 500 if Tavily search fails', async () => {
    // Mock rejection on the external mock function
    const testError = new Error('Search failed');
    mockTavilySearch.mockRejectedValueOnce(testError);

    const request = new NextRequest('http://localhost/api/tavily-search?query=test');
    const response = await GET(request);
    expect(response.status).toBe(500);
    const data = await response.json();
    // Check if the error message propagated correctly
    expect(data).toEqual({ error: 'Search failed' });
  });
});

// --- POST Handler Tests ---
describe('POST /api/tavily-search', () => {
  const mockUser = { id: 'test-user-id' };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TAVILY_API_KEY = 'test-key';
    mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    // Reset external tavily mocks
    mockTavilySearch.mockResolvedValue({ // Default success response
      results: [
        { title: 'Mock Core Result 1', url: 'http://mock-core.com/1', content: 'Mock core content 1' },
      ],
    });
    mockTavilySearchContext.mockResolvedValue([
       { title: 'Mock Context Result 1', url: 'http://mock-context.com/1', content: 'Mock context content 1' },
    ]); // Default success for context
  });

  afterEach(() => {
    delete process.env.TAVILY_API_KEY;
  });

  it('should perform a regular search successfully', async () => {
    const request = new NextRequest('http://localhost/api/tavily-search', {
      method: 'POST',
      body: JSON.stringify({ query: 'test search' })
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('results');
    expect(data.results[0].title).toBe('Mock Core Result 1');
    // Check the external mock function directly
    expect(mockTavilySearch).toHaveBeenCalledWith('test search', expect.any(Object));
    expect(mockTavilySearchContext).not.toHaveBeenCalled();
  });

  it('should perform a context search successfully', async () => {
    const request = new NextRequest('http://localhost/api/tavily-search', {
      method: 'POST',
      body: JSON.stringify({ query: 'test context', type: 'context' })
    });
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('results');
    expect(data.results[0].title).toBe('Mock Context Result 1');
     // Check the external mock function directly
    expect(mockTavilySearchContext).toHaveBeenCalledWith('test context', expect.any(Object));
    expect(mockTavilySearch).not.toHaveBeenCalled();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    const request = new NextRequest('http://localhost/api/tavily-search', {
      method: 'POST',
      body: JSON.stringify({ query: 'test' })
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(mockTavilySearch).not.toHaveBeenCalled();
    expect(mockTavilySearchContext).not.toHaveBeenCalled();
  });

  it('should return 401 if auth fails', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: new Error('Auth Failed') });
    const request = new NextRequest('http://localhost/api/tavily-search', {
      method: 'POST',
      body: JSON.stringify({ query: 'test' })
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: 'Unauthorized' });
    expect(mockTavilySearch).not.toHaveBeenCalled();
    expect(mockTavilySearchContext).not.toHaveBeenCalled();
  });

  it('should return 400 if query is missing', async () => {
    const request = new NextRequest('http://localhost/api/tavily-search', {
      method: 'POST',
      body: JSON.stringify({})
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ error: 'Query parameter is required' });
    expect(mockTavilySearch).not.toHaveBeenCalled();
    expect(mockTavilySearchContext).not.toHaveBeenCalled();
  });

  it('should return 400 if search type is invalid', async () => {
    const request = new NextRequest('http://localhost/api/tavily-search', {
      method: 'POST',
      body: JSON.stringify({ query: 'test', type: 'invalid' })
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ error: 'Invalid search type' });
    expect(mockTavilySearch).not.toHaveBeenCalled();
    expect(mockTavilySearchContext).not.toHaveBeenCalled();
  });

  it('should return 500 if Tavily search throws an error', async () => {
    // Mock rejection on the external mock function
    const testError = new Error('Tavily Core Error');
    mockTavilySearch.mockRejectedValueOnce(testError);
    const request = new NextRequest('http://localhost/api/tavily-search', {
      method: 'POST',
      body: JSON.stringify({ query: 'test search' })
    });
    const response = await POST(request);
    expect(response.status).toBe(500);
    const data = await response.json();
    // The actual route catches the error and returns its message
    expect(data).toEqual({ error: 'Tavily Core Error' });
  });

   it('should return 500 if Tavily context search throws an error', async () => {
    // Mock rejection on the external mock function
    const testError = new Error('Tavily Context Error');
    mockTavilySearchContext.mockRejectedValueOnce(testError);
    const request = new NextRequest('http://localhost/api/tavily-search', {
      method: 'POST',
      body: JSON.stringify({ query: 'test context search', type: 'context' })
    });
    const response = await POST(request);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: 'Tavily Context Error' });
  });
}); 