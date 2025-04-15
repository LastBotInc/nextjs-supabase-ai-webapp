/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ResearchPanel from '../ResearchPanel'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { NextIntlClientProvider } from 'next-intl'
import { ResearchResult, ResearchScope } from '@/types/research'

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getSession: () => Promise.resolve({
        data: {
          session: {
            access_token: 'test-token',
            refresh_token: 'test-refresh-token',
            expires_at: Date.now() + 3600
          }
        },
        error: null
      })
    }
  })
}))

// Mock translations
const mockTranslations = {
  Blog: {
    admin: {
      research: {
        title: 'Research',
        searchPlaceholder: 'Search...',
        search: 'Search',
        selected: '{count} selected',
        searching: 'Searching...',
        extending: 'Extending...',
        extend: 'Extend',
        useSelected: 'Use Selected'
      }
    }
  }
}

// Helper function to render with translations
const renderWithTranslations = (component: React.ReactNode) => {
  return render(
    <NextIntlClientProvider messages={mockTranslations} locale="en">
      {component}
    </NextIntlClientProvider>
  )
}

describe('ResearchPanel', () => {
  const mockOnSearch = vi.fn() as vi.MockedFunction<(query: string, options?: ResearchScope) => Promise<ResearchResult[]>>
  const mockOnUseMultipleResults = vi.fn() as vi.MockedFunction<(results: ResearchResult[], query: string) => void>

  mockOnSearch.mockResolvedValue([])

  const defaultProps = {
    onSearch: mockOnSearch,
    onUseMultipleResults: mockOnUseMultipleResults
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders research panel', () => {
    renderWithTranslations(<ResearchPanel {...defaultProps} />)
    expect(screen.getByText('Research')).toBeInTheDocument()
  })

  it('handles search', async () => {
    const mockResults: ResearchResult[] = [
      {
        title: 'Test Article 1',
        url: 'https://example.com/1',
        snippet: 'Test snippet 1',
        score: 0.9,
        published_date: '2024-01-01'
      }
    ]
    mockOnSearch.mockResolvedValueOnce(mockResults)

    renderWithTranslations(<ResearchPanel {...defaultProps} />)
    
    // Click the toggle button to expand the panel
    const toggleButton = screen.getByTestId('research-toggle')
    fireEvent.click(toggleButton)

    // Now we can find the search input and button
    const input = screen.getByPlaceholderText(mockTranslations.Blog.admin.research.searchPlaceholder)
    const searchButton = screen.getByText(mockTranslations.Blog.admin.research.search)

    fireEvent.change(input, { target: { value: 'test query' } })
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('test query', { maxResults: 5, maxTokens: 10000 })
    })
  })

  // ... rest of the tests with defaultProps ...
}) 