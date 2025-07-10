'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { SupabaseClient } from '@supabase/supabase-js'
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

interface SEOKeyword {
  id: string
  keyword: string
  search_volume?: number
  cpc?: number
  competition?: number
  difficulty?: number
  search_intent?: string
  created_at: string
  project: {
    id: string
    name: string
    domain: string
  }
}

interface SEOKeywordsSelectorProps {
  supabaseClient: SupabaseClient
  onKeywordsSelected: (keywords: string[]) => void
}

export default function SEOKeywordsSelector({ supabaseClient, onKeywordsSelected }: SEOKeywordsSelectorProps) {
  const t = useTranslations('Blog.admin.seoKeywords')
  const [keywords, setKeywords] = useState<SEOKeyword[]>([])
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (isExpanded && keywords.length === 0) {
      fetchKeywords()
    }
  }, [isExpanded])

  const fetchKeywords = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session?.access_token) {
        setError('Not authenticated')
        return
      }

      const response = await fetch('/api/seo/keywords', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch keywords')
      }

      const result = await response.json()
      if (result.success) {
        setKeywords(result.data || [])
      } else {
        throw new Error(result.error || 'Failed to fetch keywords')
      }
    } catch (err) {
      console.error('Error fetching keywords:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch keywords')
    } finally {
      setLoading(false)
    }
  }

  const handleKeywordToggle = (keyword: string) => {
    setSelectedKeywords(prev => {
      const newSelection = prev.includes(keyword)
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
      
      // Automatically update the prompt when keywords are selected/deselected
      const updatedKeywords = prev.includes(keyword)
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
      
      console.log('🎯 Auto-updating keywords:', updatedKeywords)
      onKeywordsSelected(updatedKeywords)
      
      return newSelection
    })
  }

  const filteredKeywords = keywords.filter(keyword =>
    keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
    keyword.project.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatNumber = (num?: number) => {
    if (!num) return '-'
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getDifficultyColor = (difficulty?: number) => {
    if (!difficulty) return 'bg-gray-100 text-gray-800'
    if (difficulty <= 30) return 'bg-green-100 text-green-800'
    if (difficulty <= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('title')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('description')}
          </p>
          {selectedKeywords.length > 0 && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              {t('selectedCount', { count: selectedKeywords.length })}
            </p>
          )}
        </div>
        <div className="flex items-center">
          {isExpanded ? (
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">{t('loading')}</span>
            </div>
          )}

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm py-4">{error}</div>
          )}

          {!loading && !error && keywords.length === 0 && (
            <p className="text-gray-600 dark:text-gray-400 text-sm py-4">{t('noKeywords')}</p>
          )}

          {!loading && !error && keywords.length > 0 && (
            <>
              {/* Search */}
              <div className="relative mb-4 mt-4">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                />
              </div>

              {/* Keywords list */}
              <div className="max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {filteredKeywords.map((keyword) => (
                    <div
                      key={keyword.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedKeywords.includes(keyword.keyword)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={() => handleKeywordToggle(keyword.keyword)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedKeywords.includes(keyword.keyword)}
                            onChange={() => handleKeywordToggle(keyword.keyword)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {keyword.keyword}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <span className="font-medium">{t('project')}:</span>
                            <span className="ml-1">{keyword.project.name}</span>
                          </span>
                          {keyword.search_volume && (
                            <span className="flex items-center">
                              <EyeIcon className="w-3 h-3 mr-1" />
                              {formatNumber(keyword.search_volume)}
                            </span>
                          )}
                          {keyword.difficulty && (
                            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getDifficultyColor(keyword.difficulty)}`}>
                              {keyword.difficulty}/100
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
} 