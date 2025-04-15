/**
 * @jest-environment jsdom
 */
/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { setupSupabaseMock, setupSupabaseEnv } from '../../../../../__tests__/utils/supabase'
import AdminUsersPage from '@/app/[locale]/admin/users/page'
import { NextIntlClientProvider, useTranslations } from 'next-intl'
// Import vitest functions
import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest'
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

// Extend expect matchers for Vitest
declare global {
  namespace Vi { // Use Vi namespace
    interface Assertion<T = any> extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
    interface AsymmetricMatchersContaining extends TestingLibraryMatchers<typeof expect.stringContaining, unknown> {}
  }
}

// Mock useAuth hook using vi
vi.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => ({
    session: { user: { id: 'test-user-id' } },
    isAdmin: true,
    loading: false // Add loading state to the mock
  })
}))

// Mock useParams and useRouter from next/navigation using vi
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  // Add other router methods if needed
};
vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' }),
  useRouter: () => mockRouter, // Include useRouter in the mock
}))

// Mock fetch for API calls using vi
global.fetch = vi.fn(async (url: string | URL | Request): Promise<Response> => { // Return Promise<Response>
  const urlString = url.toString();
  if (urlString.startsWith('/api/users')) {
    const mockResponseData = {
      users: [
        {
          id: '1',
          email: 'user1@example.com',
          created_at: '2024-01-01T00:00:00Z',
          last_sign_in_at: '2024-01-15T00:00:00Z'
        },
        {
          id: '2',
          email: 'user2@example.com',
          created_at: '2024-01-02T00:00:00Z',
          last_sign_in_at: null
        }
      ],
      total: 2
    };
    return new Response(JSON.stringify(mockResponseData), { // Use Response constructor
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  // Simulate a network error or not found for other URLs
  return new Response(null, { status: 404, statusText: 'Not Found' }); 
});

// Mock messages
const messages = {
  Admin: { // Nest under 'Admin' namespace as used in the component
    users: {
      title: 'Users',
      email: 'Email',
      id: 'ID',
      created: 'Created',
      lastSignIn: 'Last Sign In',
      never: 'Never',
      loading: 'Loading users...',
      error: 'Failed to load users',
      retry: 'Retry',
      previous: 'Previous', // Add missing keys used in component
      next: 'Next',
      page: 'Page'
    }
  }
}

// Mock next-intl useTranslations
vi.mock('next-intl', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-intl')>();
  return {
    ...actual,
    useTranslations: (namespace: string) => (key: string) => {
      // Basic lookup in our mock messages object
      const keys = key.split('.');
      let current: any = messages;
      // Assuming namespace is 'Admin.users', adjust if component uses different structure
      const nsParts = namespace.split('.');
      for (const part of nsParts) {
        current = current?.[part];
      }
      for (const k of keys) {
        current = current?.[k];
      }
      return current || `${namespace}.${key}`; // Return key if not found
    },
    // Keep NextIntlClientProvider as is, it's needed for context
    NextIntlClientProvider: actual.NextIntlClientProvider,
  };
});

describe('AdminUsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks() // Use vi
    mockRouter.push.mockClear(); // Clear router mock calls
    mockRouter.replace.mockClear();
  })

  const renderWithProvider = (component: React.ReactNode) => {
    // Pass the nested messages object to the provider
    return render(
      <NextIntlClientProvider locale="en" messages={messages}>
        {component}
      </NextIntlClientProvider>
    )
  }

  it('renders user list', async () => {
    renderWithProvider(<AdminUsersPage />)

    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument()
      expect(screen.getByText('user2@example.com')).toBeInTheDocument()
    })

    // Now assert using the actual expected text
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getByText('Created')).toBeInTheDocument()
    expect(screen.getByText('Last Sign In')).toBeInTheDocument() // Use actual text
  })

  it('handles API errors', async () => {
    // Mock fetch to reject
    const apiError = new Error('API error');
    vi.mocked(global.fetch).mockRejectedValueOnce(apiError);

    renderWithProvider(<AdminUsersPage />)

    await waitFor(() => {
      // Assert the actual error message rendered by the component
      // The component likely catches the error and displays error.message
      expect(screen.getByText('API error')).toBeInTheDocument()
    })

    // Assert Retry button is still present
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('handles pagination', async () => {
    renderWithProvider(<AdminUsersPage />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument()
    })

    // Check that fetch was called with correct pagination params
    // Correct the expected URL to include the host if fetch requires it
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/users?page=1&perPage=10'), expect.anything())
  })
}) 