/**
 * @jest-environment jsdom
 */
/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { expect } from '@jest/globals'
import AdminUsersPage from '@/app/[locale]/admin/users/page'
import { NextIntlClientProvider } from 'next-intl'

// Mock useAuth hook
jest.mock('@/components/auth/AuthProvider', () => ({
  useAuth: () => ({
    session: { user: { id: 'test-user-id' } },
    isAdmin: true
  })
}))

// Mock useParams hook
jest.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'en' })
}))

// Mock fetch for API calls
global.fetch = jest.fn((url) => {
  if (url.startsWith('/api/users')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
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
      })
    })
  }
  return Promise.reject(new Error('Not found'))
}) as jest.Mock

// Mock messages
const messages = {
  'Admin.users': {
    'title': 'Users',
    'email': 'Email',
    'id': 'ID',
    'created': 'Created',
    'lastSignIn': 'Last Sign In',
    'never': 'Never',
    'loading': 'Loading users...',
    'error': 'Failed to load users',
    'retry': 'Retry'
  }
}

describe('AdminUsersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderWithProvider = (component: React.ReactNode) => {
    return render(
      <NextIntlClientProvider locale="en" messages={messages}>
        {component}
      </NextIntlClientProvider>
    )
  }

  it('renders user list', async () => {
    renderWithProvider(<AdminUsersPage />)

    // Check loading state
    expect(screen.getByText(/loading users/i)).toBeInTheDocument()

    // Wait for users to load
    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument()
      expect(screen.getByText('user2@example.com')).toBeInTheDocument()
    })

    // Check table headers
    expect(screen.getByText(/email/i)).toBeInTheDocument()
    expect(screen.getByText(/id/i)).toBeInTheDocument()
    expect(screen.getByText(/created/i)).toBeInTheDocument()
    expect(screen.getByText(/last sign in/i)).toBeInTheDocument()
  })

  it('handles API errors', async () => {
    // Mock API error
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('API error'))

    renderWithProvider(<AdminUsersPage />)

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/failed to load users/i)).toBeInTheDocument()
    })

    // Check retry button
    expect(screen.getByText(/retry/i)).toBeInTheDocument()
  })

  it('handles pagination', async () => {
    renderWithProvider(<AdminUsersPage />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument()
    })

    // Check that fetch was called with correct pagination params
    expect(fetch).toHaveBeenCalledWith('/api/users?page=1&perPage=10')
  })
}) 