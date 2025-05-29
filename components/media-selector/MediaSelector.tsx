'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/utils/supabase/client'
import { MediaAsset, MediaFilter } from '@/types/media'
import Image from 'next/image'
import { 
  XMarkIcon, 
  MagnifyingGlassIcon, 
  PhotoIcon, 
  CloudArrowUpIcon,
  CheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface MediaSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (asset: MediaAsset) => void
  selectedAssetId?: string
  title?: string
  allowUpload?: boolean
  allowGeneration?: boolean
  mimeTypeFilter?: string[] // e.g., ['image/jpeg', 'image/png', 'image/webp']
}

// Database asset type
interface DatabaseAsset {
  id: string
  created_at: string
  updated_at: string
  title: string | null
  description: string | null
  alt_text: string | null
  filename: string
  file_size: number
  mime_type: string
  width: number | null
  height: number | null
  original_url: string
  optimized_url: string | null
  thumbnail_url: string | null
  metadata: Record<string, unknown>
  user_id: string
  is_generated: boolean
  generation_prompt: string | null
  generation_style: string | null
}

// Helper to convert snake_case database fields to camelCase
function mapDatabaseAsset(asset: DatabaseAsset): MediaAsset {
  return {
    id: asset.id,
    createdAt: new Date(asset.created_at),
    updatedAt: new Date(asset.updated_at),
    title: asset.title,
    description: asset.description,
    altText: asset.alt_text,
    filename: asset.filename,
    fileSize: asset.file_size,
    mimeType: asset.mime_type,
    width: asset.width,
    height: asset.height,
    originalUrl: asset.original_url,
    optimizedUrl: asset.optimized_url,
    thumbnailUrl: asset.thumbnail_url,
    metadata: asset.metadata,
    userId: asset.user_id,
    isGenerated: asset.is_generated,
    generationPrompt: asset.generation_prompt,
    generationStyle: asset.generation_style
  }
}

export default function MediaSelector({
  isOpen,
  onClose,
  onSelect,
  selectedAssetId,
  title = 'Select Media',
  allowUpload = true,
  allowGeneration = true,
  mimeTypeFilter
}: MediaSelectorProps) {
  const t = useTranslations('Media')
  const supabase = createClient()
  
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generationPrompt, setGenerationPrompt] = useState('')

  const loadAssets = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('media_assets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50) // Limit for performance

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,filename.ilike.%${searchTerm}%`)
      }

      if (mimeTypeFilter && mimeTypeFilter.length > 0) {
        query = query.in('mime_type', mimeTypeFilter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error loading media assets:', error)
        return
      }

      setAssets(data.map(mapDatabaseAsset))
    } catch (error) {
      console.error('Error loading media assets:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase, searchTerm, mimeTypeFilter])

  useEffect(() => {
    if (isOpen) {
      loadAssets()
    }
  }, [isOpen, loadAssets])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      const file = files[0]
      const formData = new FormData()
      formData.append('file', file)
      const path = `uploads/${Date.now()}-${file.name}`
      formData.append('path', path)

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Reload assets to show the new upload
      await loadAssets()
      
      // Auto-select the newly uploaded asset
      if (result.data) {
        const newAsset = mapDatabaseAsset(result.data)
        onSelect(newAsset)
        onClose()
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert(error instanceof Error ? error.message : t('uploadFailed'))
    } finally {
      setUploading(false)
      // Reset the input
      event.target.value = ''
    }
  }

  const handleGenerate = async () => {
    if (!generationPrompt.trim()) return

    setGenerating(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      const response = await fetch('/api/media/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          prompt: generationPrompt,
          model: 'imagen-3.0'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Generation failed')
      }

      // Reload assets to show the new generation
      await loadAssets()
      
      // Auto-select the newly generated asset
      if (result.data) {
        const newAsset = mapDatabaseAsset(result.data)
        onSelect(newAsset)
        onClose()
      }
    } catch (error) {
      console.error('Generation failed:', error)
      alert(error instanceof Error ? error.message : t('generationFailed'))
    } finally {
      setGenerating(false)
      setGenerationPrompt('')
    }
  }

  const handleAssetSelect = (asset: MediaAsset) => {
    onSelect(asset)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Search and Actions */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Upload Button */}
            {allowUpload && (
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer disabled:opacity-50">
                <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                {uploading ? t('uploading') : t('upload')}
                <input
                  type="file"
                  accept={mimeTypeFilter ? mimeTypeFilter.join(',') : 'image/*'}
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* AI Generation */}
          {allowGeneration && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder={t('promptPlaceholder')}
                  value={generationPrompt}
                  onChange={(e) => setGenerationPrompt(e.target.value)}
                  className="flex-1 px-3 py-2 border border-blue-200 dark:border-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-900/30 dark:text-blue-100"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button
                  onClick={handleGenerate}
                  disabled={!generationPrompt.trim() || generating}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  {generating ? t('generating') : t('generate')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Media Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <PhotoIcon className="w-12 h-12 mb-4" />
              <p>{t('noMediaFound')}</p>
              {searchTerm && (
                <p className="text-sm">{t('tryAdjustingSearch')}</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => handleAssetSelect(asset)}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedAssetId === asset.id
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="aspect-square relative">
                    {asset.mimeType.startsWith('image/') ? (
                      <Image
                        src={asset.originalUrl}
                        alt={asset.altText || asset.filename}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <PhotoIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Selection indicator */}
                    {selectedAssetId === asset.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <CheckIcon className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Generated indicator */}
                    {asset.isGenerated && (
                      <div className="absolute top-2 left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <SparklesIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Asset info */}
                  <div className="p-2 bg-white dark:bg-gray-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {asset.title || asset.filename}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {(asset.fileSize / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  )
} 