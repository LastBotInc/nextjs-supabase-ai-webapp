'use client'

import { useTranslations } from 'next-intl'
import { useState, useCallback, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { getGeminiPrompt } from '@/lib/brand-info'
import { MediaSelector } from '@/components/media-selector'
import { MediaAsset } from '@/types/media'
import { PhotoIcon } from '@heroicons/react/24/outline'

interface Product {
  id?: string
  title: string
  description_html: string
  vendor: string | null
  product_type: string | null
  tags: string[]
  handle: string
  featured_image?: string
  status: string
}

interface FormData {
  title: string
  description_html: string
  vendor: string
  product_type: string
  tags: string[]
  handle: string
  featured_image: string
  status: string
  prompt: string
  image_prompt?: string
}

type ProductEditorProps = {
  product?: Product
  onSave: (product: FormData) => void
  onCancel: () => void
  supabaseClient: ReturnType<typeof createClient>
}

export default function ProductEditor({ onSave, onCancel, product, supabaseClient }: ProductEditorProps) {
  const t = useTranslations('Admin.products')

  const [formData, setFormData] = useState<FormData>({
    title: product?.title || '',
    description_html: product?.description_html || '',
    handle: product?.handle || '',
    vendor: product?.vendor || '',
    product_type: product?.product_type || '',
    tags: product?.tags || [],
    featured_image: product?.featured_image || '',
    status: product?.status || 'draft',
    prompt: ''
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generatingImage, setGeneratingImage] = useState(false)
  const [showMediaSelector, setShowMediaSelector] = useState(false)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    // Basic validation
    const validationErrors: string[] = []
    if (!formData.title) {
      validationErrors.push('Title is required')
    }
    if (!formData.handle) {
      validationErrors.push('Handle is required')
    }
    if (formData.handle && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.handle)) {
      validationErrors.push('Handle must be lowercase letters, numbers, and hyphens only')
    }

    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '))
      setSaving(false)
      return
    }

    try {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      // Exclude fields that are not in the database schema
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { image_prompt, prompt, ...productData } = formData as Partial<FormData>

      let response
      if (product?.id) {
        response = await fetch('/api/admin/products', {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ ...productData, id: product.id }),
        })
      } else {
        response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify(productData),
        })
      }

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 401) {
          window.location.href = '/auth/sign-in?redirectTo=' + encodeURIComponent(window.location.pathname)
          return
        }
        throw new Error(error.error || 'Failed to save product')
      }

      const { data: result } = await response.json()
      onSave?.(result)
    } catch (err) {
      console.error('Save error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }, [formData, product, supabaseClient, onSave])

  const generateContent = async () => {
    if (!formData.prompt) return
    
    setGenerating(true)
    setError(null)
    
    try {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      // Create brand-aligned prompt for product content
      const brandPrompt = getGeminiPrompt(`
        Create compelling product content for an eCommerce product with the following requirements:
        
        Product prompt: ${formData.prompt}
        
        Please provide a JSON response with the following fields:
        - title: A compelling product title (max 60 characters)
        - description_html: Rich HTML product description (200-500 words) that highlights features, benefits, and use cases
        - vendor: Appropriate vendor/brand name
        - product_type: Product category/type
        - tags: Array of 5-8 relevant product tags for SEO and categorization
        - handle: URL-friendly handle (lowercase, hyphens only)
        
        Focus on creating content that would appeal to our target audience of eCommerce business owners and highlight how this product could benefit their Shopify stores or business operations.
      `)

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          prompt: brandPrompt,
          json: 'custom',
          schema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description_html: { type: 'string' },
              vendor: { type: 'string' },
              product_type: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } },
              handle: { type: 'string' }
            },
            required: ['title', 'description_html', 'vendor', 'product_type', 'tags', 'handle']
          }
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 401) {
          window.location.href = '/auth/sign-in?redirectTo=' + encodeURIComponent(window.location.pathname)
          return
        }
        throw new Error(error.error || 'Failed to generate content')
      }
      
      const fields = await response.json()
      
      setFormData(prev => ({
        ...prev,
        title: fields.title || prev.title,
        description_html: fields.description_html || prev.description_html,
        vendor: fields.vendor || prev.vendor,
        product_type: fields.product_type || prev.product_type,
        tags: fields.tags || prev.tags,
        handle: fields.handle || prev.handle
      }))
    } catch (err) {
      console.error('Generate content error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate content')
    } finally {
      setGenerating(false)
    }
  }

  const generateImage = async () => {
    if (!formData.title && !formData.prompt) return
    
    setGeneratingImage(true)
    setError(null)
    
    try {
      const { data: { session } } = await supabaseClient.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      const imagePrompt = formData.image_prompt || 
        `Professional product photography of ${formData.title || formData.prompt}. Clean white background, high quality, commercial photography style, well-lit, sharp focus, product showcase.`

      const response = await fetch('/api/media/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          prompt: imagePrompt,
          model: 'imagen-3.0',
          folder: 'products'
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 401) {
          window.location.href = '/auth/sign-in?redirectTo=' + encodeURIComponent(window.location.pathname)
          return
        }
        throw new Error(error.error || 'Failed to generate image')
      }
      
      const { url } = await response.json()
      
      setFormData(prev => ({
        ...prev,
        featured_image: url
      }))
    } catch (err) {
      console.error('Generate image error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate image')
    } finally {
      setGeneratingImage(false)
    }
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    setFormData(prev => ({ ...prev, tags: tagsArray }))
  }

  const generateHandle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData(prev => ({
      ...prev,
      title,
      handle: prev.handle || generateHandle(title)
    }))
  }

  const handleMediaSelect = (asset: MediaAsset) => {
    setFormData(prev => ({
      ...prev,
      featured_image: asset.originalUrl
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            {product ? 'Edit Product' : 'Create New Product'}
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* AI Content Generation */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                AI Content Generation
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Product Description Prompt
                  </label>
                  <textarea
                    value={formData.prompt}
                    onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                    placeholder="Describe the product you want to create (e.g., 'High-quality wireless headphones with noise cancellation')"
                    className="w-full px-3 py-2 border border-blue-200 dark:border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-900/30 dark:text-blue-100"
                    rows={2}
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={generateContent}
                    disabled={!formData.prompt || generating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {generating ? 'Generating...' : 'Generate Content'}
                  </button>
                  <button
                    type="button"
                    onClick={generateImage}
                    disabled={(!formData.title && !formData.prompt) || generatingImage}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {generatingImage ? 'Generating...' : 'Generate Image'}
                  </button>
                </div>
              </div>
            </div>

            {/* Product Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Handle *
                </label>
                <input
                  type="text"
                  value={formData.handle}
                  onChange={(e) => setFormData(prev => ({ ...prev, handle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                  title="Handle must be lowercase letters, numbers, and hyphens only"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vendor
                </label>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Type
                </label>
                <input
                  type="text"
                  value={formData.product_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={handleTagsChange}
                  placeholder="tag1, tag2, tag3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description_html}
                onChange={(e) => setFormData(prev => ({ ...prev, description_html: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows={6}
                placeholder="Enter product description (HTML supported)"
              />
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Featured Image
              </label>
              
              {/* Current Image Display */}
              {formData.featured_image ? (
                <div className="mb-4 p-4 border border-gray-300 dark:border-gray-600 rounded-md">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Image
                        src={formData.featured_image}
                        alt="Featured image preview"
                        width={120}
                        height={120}
                        className="rounded-md object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                        {formData.featured_image}
                      </p>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                        className="mt-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        {t('editor.removeImage')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {t('editor.noImageSelected')}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowMediaSelector(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  {t('editor.selectFromLibrary')}
                </button>
                
                {/* Manual URL Input (fallback) */}
                <details className="flex-1">
                  <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                    {t('editor.enterUrlManually')}
                  </summary>
                  <div className="mt-2">
                    <input
                      type="url"
                      value={formData.featured_image}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </details>
              </div>
            </div>

            {/* Custom Image Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Custom Image Prompt (optional)
              </label>
              <input
                type="text"
                value={formData.image_prompt || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, image_prompt: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Custom prompt for image generation"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Media Selector Modal */}
      <MediaSelector
        isOpen={showMediaSelector}
        onClose={() => setShowMediaSelector(false)}
        onSelect={handleMediaSelect}
        title={t('editor.selectProductImage')}
        mimeTypeFilter={['image/jpeg', 'image/png', 'image/webp', 'image/gif']}
        allowUpload={true}
        allowGeneration={true}
      />
    </div>
  )
} 