'use client'

import { useTranslations } from 'next-intl'
import { useState, useCallback, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/database'
import RichTextEditorWrapper from './RichTextEditorWrapper'
import Image from 'next/image'
import { Language } from '@/app/i18n/languages'
import ResearchPanel from './ResearchPanel'
import { ResearchScope, ResearchResult } from '@/types/research'

interface FormData {
  title: string
  content: string
  excerpt: string
  meta_description: string
  tags: string[]
  featured_image: string
  slug: string
  prompt: string
  image_prompt?: string
  locale: string
  published: boolean
  target_languages: string[]
}

type PostEditorProps = {
  post?: Database['public']['Tables']['posts']['Row']
  onSave: (post: FormData) => void
  onCancel: () => void
}

export default function PostEditor({ onSave, onCancel, post }: PostEditorProps) {
  const t = useTranslations('Blog.admin')
  const supabase = createClient()
  const [languages, setLanguages] = useState<Language[]>([])
  const [detectedLanguage, setDetectedLanguage] = useState<string>('en')

  // Add language fetching
  useEffect(() => {
    async function fetchLanguages() {
      try {
        const response = await fetch('/api/languages')
        const { data, error } = await response.json()
        if (error) throw new Error(error)
        setLanguages(data.filter((lang: Language) => lang.enabled))
      } catch (err) {
        console.error('Error fetching languages:', err)
      }
    }
    fetchLanguages()
  }, [])

  const [formData, setFormData] = useState<FormData>({
    title: post?.title || '',
    content: post?.content || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    meta_description: post?.meta_description || '',
    tags: post?.tags || [],
    featured_image: post?.featured_image || '',
    locale: post?.locale || 'en',
    published: post?.published || false,
    prompt: '',
    target_languages: []
  })

  const contentRef = useRef(formData.content)

  useEffect(() => {
    if (contentRef.current !== formData.content) {
      contentRef.current = formData.content
    }
  }, [formData.content])

  const handleContentChange = (content: string) => {
    if (content !== contentRef.current) {
      setFormData(prev => ({ ...prev, content }))
    }
  }

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      // Exclude fields that are not in the database schema
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { image_prompt, prompt, ...postData } = formData as Partial<FormData>

      let response
      if (post?.id) {
        response = await fetch('/api/blog', {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ ...postData, id: post.id, author_id: post.author_id || session.user.id }),
        })
      } else {
        response = await fetch('/api/blog', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ ...postData, author_id: session.user.id }),
        })
      }

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 401) {
          // Redirect to login if not authenticated
          window.location.href = '/auth/login?redirectTo=' + encodeURIComponent(window.location.pathname)
          return
        }
        throw new Error(error.error || 'Failed to save post')
      }

      const { data: result } = await response.json()
      onSave?.(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }, [formData, post, supabase, onSave])

  const generateContent = async () => {
    if (!formData.prompt) return
    
    setGenerating(true)
    setError(null)
    
    try {
      // Generate all content with Gemini
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ prompt: formData.prompt }),
      })

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 401) {
          // Redirect to login if not authenticated
          window.location.href = '/auth/login?redirectTo=' + encodeURIComponent(window.location.pathname)
          return
        }
        throw new Error(error.error || 'Failed to generate content')
      }
      
      const fields = await response.json()
      
      // Update form with generated fields and detected language
      setFormData(prev => ({
        ...prev,
        title: fields.title,
        content: fields.content,
        excerpt: fields.excerpt,
        meta_description: fields.meta_description,
        tags: fields.tags,
        slug: fields.slug,
        image_prompt: fields.image_prompt,
        locale: fields.detectedLanguage || 'en'
      }))

      setDetectedLanguage(fields.detectedLanguage || 'en')

      // Generate and upload image
      if (fields.image_prompt && fields.slug) {
        const imageResponse = await fetch('/api/blog-image', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            prompt: fields.image_prompt,
            slug: fields.slug,
            style: imageStyle
          }),
          credentials: 'include'
        })

        if (!imageResponse.ok) {
          const error = await imageResponse.json()
          if (imageResponse.status === 401) {
            // Redirect to login if not authenticated
            window.location.href = '/auth/login?redirectTo=' + encodeURIComponent(window.location.pathname)
            return
          }
          throw new Error(error.error || 'Failed to generate image')
        }
        
        const { url } = await imageResponse.json()
        setFormData(prev => ({
          ...prev,
          featured_image: url,
        }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content')
    } finally {
      setGenerating(false)
    }
  }

  const generateImage = async () => {
    if (!formData.title) return
    
    setGenerating(true)
    setError(null)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      const response = await fetch('/api/blog-image', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          prompt: formData.image_prompt || `Create a featured image for a blog post titled: ${formData.title}`,
          slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          style: imageStyle
        }),
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 401) {
          // Redirect to login if not authenticated
          window.location.href = '/auth/login?redirectTo=' + encodeURIComponent(window.location.pathname)
          return
        }
        throw new Error(error.error || 'Failed to generate image')
      }
      
      const { url } = await response.json()
      setFormData(prev => ({
        ...prev,
        featured_image: url,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image')
    } finally {
      setGenerating(false)
    }
  }

  // Add style selection state
  const [imageStyle, setImageStyle] = useState('digital_illustration')

  // Add style options
  const styleOptions = [
    { value: 'digital_illustration', label: 'Digital Illustration' },
    { value: 'realistic_image', label: 'Realistic' },
    { value: 'pixel_art', label: 'Pixel Art' },
    { value: 'hand_drawn', label: 'Hand Drawn' },
    { value: '2d_art_poster', label: '2D Art Poster' },
  ]

  const handleResearchSearch = async (query: string, scope?: ResearchScope): Promise<ResearchResult[]> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      const response = await fetch('/api/tavily-search', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          query,
          type: 'context',
          depth: 'advanced',
          max_tokens: scope?.maxTokens || 10000,
          max_results: scope?.maxResults || 5,
          topic: 'general'
        })
      })

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/auth/login?redirectTo=' + encodeURIComponent(window.location.pathname)
          return []
        }
        throw new Error('Failed to perform research')
      }

      const data = await response.json()
      
      if (!data.results || !Array.isArray(data.results)) {
        console.error('Invalid response format:', data)
        return []
      }
      
      // Transform the context results into the expected format
      const transformedResults = data.results.map((result: ResearchResult) => {
        // Extract title from content if not provided
        let title = result.title
        if (!title && result.snippet) {
          // Try to find the title in the first line of content
          const firstLine = result.snippet.split(' - ')[0].trim()
          if (firstLine) {
            title = firstLine
          }
        }
        
        // If still no title, extract from URL
        if (!title && result.url) {
          // Remove common file extensions and split by slashes
          const urlParts = result.url.replace(/\.html?$/, '').split('/')
          // Get the last meaningful part
          const lastPart = urlParts[urlParts.length - 1]
          // Convert kebab-case to Title Case
          title = lastPart
            .split('-')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        }

        return {
          title: title || 'Untitled',
          url: result.url || '',
          snippet: result.snippet || '', // content for context search, snippet for regular search
          score: result.score || 1,
          published_date: result.published_date || new Date().toISOString()
        }
      })

      return transformedResults
    } catch (error) {
      console.error('Research error:', error)
      throw error
    }
  }

  const handleResearchUse = (result: ResearchResult, query: string) => {
    setFormData(prev => ({
      ...prev,
      prompt: `${prev.prompt}\n\nWrite article about "${query}" based on this research:\n${result.title}\n${result.snippet}\nSource: ${result.url}`.trim()
    }))
  }
 
  const handleMultipleResearchUse = (results: ResearchResult[], query: string) => {
    if (!Array.isArray(results) || results.length === 0) return

    const researchText = results
      .filter(result => result.title || result.snippet || result.url)
      .map(result => 
        `${result.title || 'Untitled'}\n${result.snippet || ''}\nSource: ${result.url || 'No source'}`
      )
      .join('\n\n')

    if (!researchText) return

    setFormData(prev => ({
      ...prev,
      prompt: `${prev.prompt}\n\nWrite article about "${query}" based on this research:\n${researchText}`.trim()
    }))
  }

  return (
    <form
      className="space-y-6 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
      role="form"
      onSubmit={handleSubmit}
    >
      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 p-4 rounded-md" role="alert" aria-live="polite">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {!post && (
        <div className="space-y-4">
          <ResearchPanel 
            onSearch={handleResearchSearch} 
            onUseResult={handleResearchUse} 
            onUseMultipleResults={handleMultipleResearchUse}
          />

          <div className="flex justify-between items-center">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('fields.prompt')}
            </label>
            <button
              type="button"
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
              onClick={generateContent}
              disabled={!formData.prompt || generating}
              aria-label="Generate with AI"
            >
              {generating ? 'Generating...' : 'Generate with AI'}
            </button>
          </div>
          <textarea
            id="prompt"
            value={formData.prompt}
            onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
            rows={3}
            placeholder={t('fields.promptPlaceholder')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white px-3 py-1.5"
            required={!post}
          />
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('fields.title')}
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white px-3 py-1.5"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('fields.slug')}
        </label>
        <input
          type="text"
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white px-3 py-1.5"
          required
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('fields.content')}
        </label>
        <RichTextEditorWrapper
          content={formData.content}
          onChange={handleContentChange}
        />
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('fields.excerpt')}
        </label>
        <textarea
          id="excerpt"
          value={formData.excerpt || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white px-3 py-1.5"
        />
      </div>

      <div>
        <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('fields.metaDescription')}
        </label>
        <textarea
          id="meta_description"
          value={formData.meta_description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white px-3 py-1.5"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('fields.tags')}
        </label>
        <input
          type="text"
          id="tags"
          value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
          }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white px-3 py-1.5"
          placeholder="tag1, tag2, tag3"
        />
      </div>

      <div>
        <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('fields.featuredImage')}
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            id="featured_image"
            value={formData.featured_image || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
            className="flex-1 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white px-3 py-1.5"
          />
          <div className="flex items-center gap-4">
            <select
              value={imageStyle}
              onChange={(e) => setImageStyle(e.target.value)}
              className="block w-48 rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700"
            >
              {styleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={generateImage}
              disabled={!formData.title || generating}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {generating ? 'Generating...' : 'Generate Image'}
            </button>
          </div>
        </div>
        {formData.featured_image && (
          <div className="mt-2">
            <Image
              src={formData.featured_image}
              alt="Featured"
              width={1024}
              height={768}
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="locale" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('fields.locale')}
        </label>
        <select
          id="locale"
          value={formData.locale}
          onChange={(e) => setFormData(prev => ({ ...prev, locale: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white px-3 py-1.5"
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name} ({lang.native_name})
              {lang.code === detectedLanguage ? ` - ${t('fields.detectedLanguage')}` : ''}
            </option>
          ))}
        </select>
      </div>

      {!post && (
        <div>
          <label htmlFor="target_languages" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('fields.targetLanguages')}
          </label>
          <select
            id="target_languages"
            multiple
            value={formData.target_languages}
            onChange={(e) => {
              const options = Array.from(e.target.selectedOptions, option => option.value)
              setFormData(prev => ({ ...prev, target_languages: options }))
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white px-3 py-1.5"
          >
            {languages
              .filter(lang => lang.code !== formData.locale)
              .map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.native_name})
                </option>
              ))}
          </select>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('fields.targetLanguagesHelp')} {t('fields.targetLanguagesOptional')}
          </p>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="published"
          checked={formData.published}
          onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="published" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {formData.published ? t('unpublishPost') : t('publishPost')}
        </label>
      </div>

      <div className="flex items-center space-x-4">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {saving ? t('saving') : t('save')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            {t('cancel')}
          </button>
        )}
      </div>
    </form>
  )
}
