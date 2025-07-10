'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Search, Loader2, X, ExternalLink } from 'lucide-react'

interface SearchResult {
  id: string
  title: string
  summary: string // Changed from content to summary
  url?: string
  score?: number
  metadata?: Record<string, any>
}

interface LastBotSearchProps {
  className?: string
}

export default function LastBotSearch({ className }: LastBotSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const params = useParams()
  const locale = params.locale as string || 'en'

  // Get configuration from environment
  const widgetId = process.env.NEXT_PUBLIC_LASTBOT_WIDGET_ID
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_LASTBOT_ONE === 'true'

  // Don't render if LastBot is not enabled or missing config
  if (!isEnabled) {
    return null
  }

  const searchUrl = `/api/lastbot-proxy`

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setError(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: searchQuery, locale, widget_id: widgetId }),
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      // Handle different possible response formats
      let searchResults: SearchResult[] = []
      
      if (Array.isArray(data)) {
        searchResults = data
      } else if (data.results && Array.isArray(data.results)) {
        searchResults = data.results
      } else if (data.data && Array.isArray(data.data)) {
        searchResults = data.data
      } else {
        console.warn('Unexpected search response format:', data)
        searchResults = []
      }

      setResults(searchResults)
      setIsExpanded(true)
    } catch (err) {
      console.error('Search error:', err)
      setError(err instanceof Error ? err.message : 'Search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Debounce search - wait 500ms after user stops typing
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(newQuery)
    }, 500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    performSearch(query)
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setError(null)
    setIsExpanded(false)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className={`lastbot-search-container relative ${className || ''}`}>
      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsExpanded(true)}
            placeholder="Search..."
            className="w-full sm:w-64 bg-gray-800 text-white pl-10 pr-4 py-2 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Results Container - Absolutely positioned */}
      {isExpanded && (
        <div 
            className="absolute top-full mt-2 w-96 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
            onMouseLeave={() => setIsExpanded(false)}
        >
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Searching...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-3 bg-red-50 border-b border-red-200">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Results List */}
          {(results.length > 0) ? (
            <div className="lastbot-search-results max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <a
                    key={result.id || index}
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {result.title || 'Untitled'}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 overflow-hidden" style={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {result.summary || 'No summary available.'}
                        </p>
                      </div>
                      {result.url && (
                        <ExternalLink className="h-4 w-4 text-gray-400 ml-4 flex-shrink-0" />
                      )}
                    </div>
                  </a>
                ))}
            </div>
          ) : (
            !loading && query && <p className="p-4 text-sm text-gray-500">No results found for "{query}"</p>
          )}
        </div>
      )}
    </div>
  )
} 