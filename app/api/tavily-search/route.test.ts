import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { tavily } from '@tavily/core'; // Import tavily for mocking
import { createClient } from '@/utils/supabase/server';

// Import the handlers to test
import { GET, POST } from './route';

// Mock next/headers (used implicitly by createClient in the actual route)
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: (name: string) => {
      // Provide a simple mock cookie store for testing purposes
      const store: Record<string, string> = {
        'sb-access-token': 'mock-access-token',
        'sb-refresh-token': 'mock-refresh-token',
      };
      return store[name] ? { name, value: store[name] } : undefined;
    },
    set: (name: string, value: string, options: CookieOptions) => { /* no-op */ },
    remove: (name: string, options: CookieOptions) => { /* no-op */ },
  })),
}));

// Mock @tavily/core (used by BOTH handlers now)
const mockSearchFn = vi.fn().mockResolvedValue({ 
  results: [
    { title: 'Mock Core Result 1', url: 'http://mock-core.com/1', content: 'Mock core content 1' },
  ],
})
const mockSearchContextFn = vi.fn().mockResolvedValue([
  { title: 'Mock Context Result 1', url: 'http://mock-context.com/1', content: 'Mock context content 1' },
])

vi.mock('@tavily/core', () => ({
  tavily: vi.fn(() => ({ 
    search: mockSearchFn,
    searchContext: mockSearchContextFn
  }))
}));

// Mock Supabase createClient (used by both handlers)
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
    process.env.TAVILY_API_KEY = 'test-key'; // Ensure API key is set
    // Reset mocks for tavily methods specifically
    mockSearchFn.mockClear().mockResolvedValue({ 
      results: [
        { title: 'Mock Core Result 1', url: 'http://mock-core.com/1', content: 'Mock core content 1' },
      ],
    });
    mockSearchContextFn.mockClear().mockResolvedValue([
      { title: 'Mock Context Result 1', url: 'http://mock-context.com/1', content: 'Mock context content 1' },
    ]);
    // Reset getUser mock
    mockGetUser.mockClear().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null });
  });

  afterEach(() => {
    delete process.env.TAVILY_API_KEY; // Clean up
  });

  it('should return search results for a valid query', async () => {
    const request = new NextRequest('http://localhost/api/tavily-search?query=test');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('results');
    expect(data.results.length).toBeGreaterThan(0);
    expect(data.results[0].title).toBe('Mock Core Result 1'); // Check specific mock data from @tavily/core mock
    // Check if tavily was instantiated and search called
    const mockedTavilyCore = vi.mocked(tavily);
    expect(mockedTavilyCore).toHaveBeenCalledWith({ apiKey: 'test-key' });
    expect(mockedTavilyCore().search).toHaveBeenCalledWith('test', { searchDepth: 'basic', maxResults: 5 });
  });

  it('should proceed if user is not logged in (GET)', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null }); // Mock no user
    const request = new NextRequest('http://localhost/api/tavily-search?query=test');
    const response = await GET(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('results'); // Still returns results
    expect(vi.mocked(tavily().search)).toHaveBeenCalled(); // Ensure search was still called
  });

  it('should return 400 if query parameter is missing', async () => {
    const request = new NextRequest('http://localhost/api/tavily-search');
    const response = await GET(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data).toEqual({ error: 'Query parameter is required' });
    expect(vi.mocked(tavily().search)).not.toHaveBeenCalled();
  });

  it('should return 401 if TAVILY_API_KEY is missing', async () => {
    delete process.env.TAVILY_API_KEY;
    const request = new NextRequest('http://localhost/api/tavily-search?query=test');
    const response = await GET(request);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: 'Tavily API key is not configured' });
    expect(vi.mocked(tavily().search)).not.toHaveBeenCalled();
  });

  it('should return 500 if Tavily search fails', async () => {
    // Mock rejection on the @tavily/core mock
    vi.mocked(tavily().search).mockRejectedValueOnce(new Error('Search failed'));

    const request = new NextRequest('http://localhost/api/tavily-search?query=test');
    const response = await GET(request);
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: 'Search failed' }); // Error message comes from the rejected error
  });
});

// --- POST Handler Tests ---
describe('POST /api/tavily-search', () => {
  const mockUser = { id: 'test-user-id' };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TAVILY_API_KEY = 'test-key'; // Ensure API key is set
    // Reset mocks for tavily methods specifically
    mockSearchFn.mockClear().mockResolvedValue({ 
      results: [
        { title: 'Mock Core Result 1', url: 'http://mock-core.com/1', content: 'Mock core content 1' },
      ],
    });
    mockSearchContextFn.mockClear().mockResolvedValue([
      { title: 'Mock Context Result 1', url: 'http://mock-context.com/1', content: 'Mock context content 1' },
    ]);
    // Reset getUser mock
    mockGetUser.mockClear().mockResolvedValue({ data: { user: mockUser }, error: null });
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
    expect(vi.mocked(tavily().search)).toHaveBeenCalledWith('test search', expect.any(Object));
    expect(vi.mocked(tavily().searchContext)).not.toHaveBeenCalled();
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
    expect(vi.mocked(tavily().searchContext)).toHaveBeenCalledWith('test context', expect.any(Object));
    expect(vi.mocked(tavily().search)).not.toHaveBeenCalled();
  });


  it('should return 401 if user is not authenticated', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null }); // Mock no user
    const request = new NextRequest('http://localhost/api/tavily-search', {
      method: 'POST',
      body: JSON.stringify({ query: 'test' })
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should return 401 if auth fails', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: new Error('Auth Failed') }); // Mock auth error
    const request = new NextRequest('http://localhost/api/tavily-search', {
      method: 'POST',
      body: JSON.stringify({ query: 'test' })
    });
    const response = await POST(request);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data).toEqual({ error: 'Unauthorized' });
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
  });

  it('should return 500 if Tavily search throws an error', async () => {
    vi.mocked(tavily().search).mockRejectedValueOnce(new Error('Tavily Core Error'));
    const request = new NextRequest('http://localhost/api/tavily-search', {
      method: 'POST',
      body: JSON.stringify({ query: 'test search' })
    });
    const response = await POST(request);
    expect(response.status).toBe(500);
    const data = await response.json();
    // The actual route catches the error and returns a generic message
    expect(data).toEqual({ error: 'Tavily Core Error' }); // Match the caught error message
  });
}); 