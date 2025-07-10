import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import LastBotSearch from '@/components/lastbot/LastBotSearch'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_ENABLE_LASTBOT_ONE: 'true',
  NEXT_PUBLIC_LASTBOT_BASE_URL: 'https://smartia.lastbot.com/widgets/',
  NEXT_PUBLIC_LASTBOT_WIDGET_ID: '05c8e32c-99c1-4e0e-b350-d39299c7bbae'
}

describe('LastBotSearch', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Set environment variables
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value
    })
  })

  afterEach(() => {
    // Clean up environment variables
    Object.keys(mockEnv).forEach(key => {
      delete process.env[key]
    })
  })

  it('should render search input when enabled', () => {
    render(<LastBotSearch />)
    
    expect(screen.getByPlaceholderText('Search knowledge base...')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('should not render when ENABLE_LASTBOT_ONE is false', () => {
    process.env.NEXT_PUBLIC_ENABLE_LASTBOT_ONE = 'false'
    
    const { container } = render(<LastBotSearch />)
    
    expect(container.firstChild).toBeNull()
  })

  it('should not render when base URL is missing', () => {
    delete process.env.NEXT_PUBLIC_LASTBOT_BASE_URL
    
    const { container } = render(<LastBotSearch />)
    
    expect(container.firstChild).toBeNull()
  })

  it('should not render when widget ID is missing', () => {
    delete process.env.NEXT_PUBLIC_LASTBOT_WIDGET_ID
    
    const { container } = render(<LastBotSearch />)
    
    expect(container.firstChild).toBeNull()
  })

  it('should perform search on form submission', async () => {
    const mockResults = [
      {
        id: '1',
        title: 'Test Result',
        content: 'This is a test result content',
        score: 0.95
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults
    })

    render(<LastBotSearch />)
    
    const input = screen.getByPlaceholderText('Search knowledge base...')
    const form = input.closest('form')
    
    fireEvent.change(input, { target: { value: 'test query' } })
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'https://smartia.lastbot.com/widgets/05c8e32c-99c1-4e0e-b350-d39299c7bbae/search',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ q: 'test query' }),
        }
      )
    })
  })

  it('should display search results', async () => {
    const mockResults = [
      {
        id: '1',
        title: 'Test Result 1',
        content: 'This is the first test result',
        score: 0.95,
        url: 'https://example.com/1'
      },
      {
        id: '2',
        title: 'Test Result 2',
        content: 'This is the second test result',
        score: 0.87
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults
    })

    render(<LastBotSearch />)
    
    const input = screen.getByPlaceholderText('Search knowledge base...')
    fireEvent.change(input, { target: { value: 'test' } })

    // Wait for debounced search
    await waitFor(() => {
      expect(screen.getByText('Found 2 results')).toBeInTheDocument()
    }, { timeout: 1000 })

    expect(screen.getByText('Test Result 1')).toBeInTheDocument()
    expect(screen.getByText('Test Result 2')).toBeInTheDocument()
    expect(screen.getByText('This is the first test result')).toBeInTheDocument()
    expect(screen.getByText('Relevance: 95%')).toBeInTheDocument()
  })

  it('should handle different response formats', async () => {
    const mockResults = [
      {
        id: '1',
        title: 'Test Result',
        content: 'Test content'
      }
    ]

    // Test response with results property
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockResults })
    })

    render(<LastBotSearch />)
    
    const input = screen.getByPlaceholderText('Search knowledge base...')
    fireEvent.change(input, { target: { value: 'test' } })

    await waitFor(() => {
      expect(screen.getByText('Found 1 result')).toBeInTheDocument()
    }, { timeout: 1000 })

    expect(screen.getByText('Test Result')).toBeInTheDocument()
  })

  it('should show loading state during search', async () => {
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => []
      }), 100))
    )

    render(<LastBotSearch />)
    
    const input = screen.getByPlaceholderText('Search knowledge base...')
    const form = input.closest('form')
    
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.submit(form!)

    expect(screen.getByText('Searching...')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.queryByText('Searching...')).not.toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('should handle search errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<LastBotSearch />)
    
    const input = screen.getByPlaceholderText('Search knowledge base...')
    const form = input.closest('form')
    
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('should handle HTTP error responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    })

    render(<LastBotSearch />)
    
    const input = screen.getByPlaceholderText('Search knowledge base...')
    const form = input.closest('form')
    
    fireEvent.change(input, { target: { value: 'test' } })
    fireEvent.submit(form!)

    await waitFor(() => {
      expect(screen.getByText('Search failed: 404 Not Found')).toBeInTheDocument()
    })
  })

  it('should clear search when clear button is clicked', async () => {
    render(<LastBotSearch />)
    
    const input = screen.getByPlaceholderText('Search knowledge base...')
    
    fireEvent.change(input, { target: { value: 'test query' } })
    expect(input).toHaveValue('test query')
    
    const clearButton = screen.getByRole('button', { name: '' }) // X button
    fireEvent.click(clearButton)
    
    expect(input).toHaveValue('')
  })

  it('should debounce search input', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => []
    })

    render(<LastBotSearch />)
    
    const input = screen.getByPlaceholderText('Search knowledge base...')
    
    // Type multiple characters quickly
    fireEvent.change(input, { target: { value: 't' } })
    fireEvent.change(input, { target: { value: 'te' } })
    fireEvent.change(input, { target: { value: 'tes' } })
    fireEvent.change(input, { target: { value: 'test' } })

    // Wait for debounce
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    }, { timeout: 1000 })
  })

  it('should toggle expanded state', async () => {
    const mockResults = [
      {
        id: '1',
        title: 'Test Result',
        content: 'Test content'
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResults
    })

    render(<LastBotSearch />)
    
    const input = screen.getByPlaceholderText('Search knowledge base...')
    fireEvent.change(input, { target: { value: 'test' } })

    await waitFor(() => {
      expect(screen.getByText('Found 1 result')).toBeInTheDocument()
    }, { timeout: 1000 })

    // Should have expand/collapse button
    const toggleButton = screen.getByText('Collapse')
    expect(toggleButton).toBeInTheDocument()
    
    fireEvent.click(toggleButton)
    expect(screen.getByText('Expand')).toBeInTheDocument()
  })
}) 