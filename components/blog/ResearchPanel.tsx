'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { MagnifyingGlassIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { ResearchScope, ResearchResult } from '@/types/research'

interface ImageMetadata {
  url: string;
  width?: number;
  height?: number;
}

interface ResearchPanelProps {
  onSearch: (query: string, scope?: ResearchScope) => Promise<ResearchResult[]>
  onUseMultipleResults: (results: ResearchResult[], query: string) => void
}

export default function ResearchPanel({ onSearch, onUseMultipleResults }: ResearchPanelProps) {
  const t = useTranslations('Blog')
  const supabase = createClient()
  
  const [isExpanded, setIsExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ResearchResult[]>([])
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extendingResults, setExtendingResults] = useState<{ [key: string]: boolean }>({})

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    
    setLoading(true)
    setError(null)
    setSelectedResults(new Set())
    
    try {
      const results = await onSearch(query, {
        maxResults: 5,
        maxTokens: 10000
      })
      setResults(results)
    } catch (error) {
      console.error('Research error:', error)
      setError(error instanceof Error ? error.message : 'Failed to perform research')
    } finally {
      setLoading(false)
    }
  }

  const extendResult = async (result: ResearchResult) => {
    if (!result.url) return
    
    setExtendingResults(prev => ({ ...prev, [result.url]: true }))
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      const response = await fetch('/api/html-to-md', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ url: result.url }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/auth/login?redirectTo=' + encodeURIComponent(window.location.pathname)
          return
        }
        throw new Error('Failed to convert content to markdown')
      }
      
      const { markdown, metadata } = await response.json()
      
      setResults(prev => prev.map(r => {
        if (r.url === result.url) {
          return {
            ...r,
            snippet: markdown,
            datePublished: metadata.datePublished || r.published_date,
            dateModified: metadata.dateModified,
            author: metadata.author,
            publisher: metadata.publisher,
            images: metadata.images?.map((img: ImageMetadata) => img.url),
            description: metadata.description
          }
        }
        return r
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert content to markdown')
    } finally {
      setExtendingResults(prev => ({ ...prev, [result.url]: false }))
    }
  }

  const toggleResultSelection = (url: string) => {
    const newSelected = new Set(selectedResults)
    if (newSelected.has(url)) {
      newSelected.delete(url)
    } else {
      newSelected.add(url)
    }
    setSelectedResults(newSelected)
  }

  const handleUseSelected = () => {
    if (selectedResults.size === 0) return
    const selectedItems = results.filter(r => selectedResults.has(r.url))
    onUseMultipleResults?.(selectedItems, query)
  }

  return (
    <div className="border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" data-testid="research-panel">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
          data-testid="research-toggle"
        >
          <div className="flex items-center gap-2">
            <MagnifyingGlassIcon className="h-5 w-5" />
            <span className="font-medium">{t('admin.research.title')}</span>
          </div>
          {isExpanded ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4" data-testid="research-panel-content">
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('admin.research.searchPlaceholder')}
                className="flex-1 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white px-3 py-1.5"
                data-testid="research-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSearch(e)
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => handleSearch(e)}
                disabled={loading || !query.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                data-testid="research-search-button"
              >
                {loading ? t('admin.research.searching') : t('admin.research.search')}
              </button>
            </div>

            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400" data-testid="research-error">
                {error}
              </p>
            )}

            {results.length > 0 && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <span 
                    className="text-sm text-gray-600 dark:text-gray-400"
                    data-testid="selected-count"
                  >
                    {selectedResults.size > 0 ? `${selectedResults.size} selected` : ''}
                  </span>
                  <button
                    type="button"
                    data-testid="use-selected-button"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={selectedResults.size === 0}
                    onClick={handleUseSelected}
                  >
                    {t('admin.research.useSelected')}
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  {results.map((result, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-white dark:bg-gray-800">
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={selectedResults.has(result.url)}
                          onChange={() => toggleResultSelection(result.url)}
                          className="mt-1"
                          data-testid={`result-checkbox-${index}`}
                        />
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {result.title}
                              </h3>
                              <a 
                                href={result.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2 block"
                              >
                                {result.url}
                              </a>
                              {result.author && (
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  By {result.author}
                                  {result.publisher && ` • ${result.publisher}`}
                                  {result.datePublished && ` • ${new Date(result.datePublished).toLocaleDateString()}`}
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => extendResult(result)}
                              disabled={extendingResults[result.url || '']}
                              className="px-3 py-1 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                            >
                              {extendingResults[result.url || ''] ? t('admin.research.extending') : t('admin.research.extend')}
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                            {result.snippet}
                          </p>
                          {result.images && result.images.length > 0 && (
                            <div className="mt-2">
                              <Image
                                src={result.images[0]}
                                alt={`Image 1 from ${result.title}`}
                                width={100}
                                height={100}
                                className="max-w-full h-auto rounded"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedResults.size > 0 && t('admin.research.selected', { count: selectedResults.size })}
                    </span>
                    <button
                      type="button"
                      onClick={handleUseSelected}
                      disabled={selectedResults.size === 0}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('admin.research.useSelected')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 