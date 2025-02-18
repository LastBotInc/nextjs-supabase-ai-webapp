/// <reference types="jest" />
// Set environment variables before importing the route
process.env.REPLICATE_API_TOKEN = 'test-token';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'test-url';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

// Mock Replicate
const mockRun = jest.fn();
jest.mock('replicate', () => {
  return jest.fn().mockImplementation(() => ({
    run: mockRun
  }));
});

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { POST } from '../route';
import '@testing-library/jest-dom';

// Mock Next.js cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
  }))
}));

// Mock dependencies
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data: any, init?: { status?: number }) => ({
      ...data,
      status: init?.status || 200,
      json: async () => data
    }))
  }
}));

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn()
}));

// Store original environment variables
const originalEnv = process.env;

describe('POST /api/recraft', () => {
  const mockSession = {
    user: { id: 'test-user-id' },
    access_token: 'test-token'
  };

  const mockCookieStore = {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn()
  };

  beforeAll(() => {
    process.env = {
      ...originalEnv,
      REPLICATE_API_TOKEN: 'test-token',
      NEXT_PUBLIC_SUPABASE_URL: 'test-url',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key'
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Supabase auth
    (createServerClient as jest.Mock).mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } })
      }
    });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should generate an image successfully', async () => {
    // Mock request
    const request = new Request('http://localhost/api/recraft', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'test prompt',
        style: 'digital_illustration',
        width: 1024,
        height: 768
      })
    });

    // Mock Replicate response
    const mockImageUrl = 'https://example.com/image.png';
    mockRun.mockResolvedValueOnce([mockImageUrl]);

    // Execute request
    const response = await POST(request);
    const data = await response.json();

    // Verify response
    expect(response.status).toBe(200);
    expect(data.images).toEqual([mockImageUrl]);

    // Verify Replicate was called with correct parameters
    expect(mockRun).toHaveBeenCalledWith(
      'recraft-ai/recraft-v3',
      {
        input: {
          prompt: 'test prompt',
          style: 'digital_illustration',
          width: 1024,
          height: 768,
          num_outputs: 1
        }
      }
    );
  });

  it('should handle missing prompt', async () => {
    const request = new Request('http://localhost/api/recraft', {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Prompt is required');
  });

  it('should handle unauthorized requests', async () => {
    // Mock unauthorized session
    (createServerClient as jest.Mock).mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null } })
      }
    });

    const request = new Request('http://localhost/api/recraft', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test' })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should handle Replicate API errors', async () => {
    const request = new Request('http://localhost/api/recraft', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test prompt' })
    });

    // Mock Replicate error
    mockRun.mockRejectedValueOnce(new Error('API error'));

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('API error');
  });

  it('should handle empty image response', async () => {
    const request = new Request('http://localhost/api/recraft', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test prompt' })
    });

    // Mock empty response
    mockRun.mockResolvedValueOnce([]);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('No images generated');
  });

  it('should use default values for optional parameters', async () => {
    const request = new Request('http://localhost/api/recraft', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test prompt' })
    });

    mockRun.mockResolvedValueOnce(['test-url']);

    await POST(request);

    expect(mockRun).toHaveBeenCalledWith(
      'recraft-ai/recraft-v3',
      {
        input: {
          prompt: 'test prompt',
          style: 'digital_illustration', // default value
          width: 1024, // default value
          height: 768, // default value
          num_outputs: 1
        }
      }
    );
  });
}); 