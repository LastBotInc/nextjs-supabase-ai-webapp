'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Dialog } from '@headlessui/react'
import { createClient } from '@/utils/supabase/client'
import { MediaAsset, MediaFilter, UploadProgress } from '@/types/media'
import { MediaGrid } from '@/app/[locale]/admin/media/MediaGrid'
import { UploadZone } from '@/app/[locale]/admin/media/UploadZone'
import { SearchFilter } from '@/app/[locale]/admin/media/SearchFilter'
import { MediaDetails } from '@/app/[locale]/admin/media/MediaDetails'

interface MediaSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (asset: MediaAsset) => void
}

export default function MediaSelector({ isOpen, onClose, onSelect }: MediaSelectorProps) {
  const t = useTranslations('Media')
  const supabase = createClient()
  const [filter, setFilter] = useState<MediaFilter>({
    search: '',
    type: ['image'],
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null)
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleFilesSelected = async (files: File[]) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error('Not authenticated')

    // Reuse the upload logic from UploadZone
    const newUploads: UploadProgress[] = files.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }))
    setUploads(prev => [...prev, ...newUploads])

    // Upload each file
    for (let index = 0; index < files.length; index++) {
      const file = files[index]
      try {
        // Update status to uploading
        setUploads(current => current.map((upload, i) => {
          if (i === index) {
            return { ...upload, status: 'uploading' }
          }
          return upload
        }))

        // Create form data
        const formData = new FormData()
        formData.append('file', file)

        // Upload via API route with auth token
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

        // Update upload status to complete
        setUploads(current => current.map((upload, i) => {
          if (i === index) {
            return {
              ...upload,
              progress: 100,
              status: 'complete'
            }
          }
          return upload
        }))

        // Trigger refresh of the media grid
        setRefreshTrigger(prev => prev + 1)

      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Unknown error occurred during upload'

        console.error('Upload failed:', {
          message: errorMessage,
          file: {
            name: file.name,
            size: file.size,
            type: file.type
          }
        })

        setUploads(current => current.map((upload, i) => {
          if (i === index) {
            return {
              ...upload,
              status: 'error',
              error: errorMessage
            }
          }
          return upload
        }))
      }
    }
  }

  const handleAssetSelect = (asset: MediaAsset | null) => {
    setSelectedAsset(asset)
  }

  const handleConfirmSelection = () => {
    if (selectedAsset) {
      onSelect(selectedAsset)
      onClose()
    }
  }

  const handleFilterChange = (newFilter: MediaFilter) => {
    setFilter(newFilter)
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl p-6 mx-4">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold">
              {t('selectMedia')}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <span className="sr-only">{t('close')}</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <SearchFilter filter={filter} onChange={handleFilterChange} />
              </div>

              <UploadZone onFilesSelected={handleFilesSelected} uploads={uploads} />
              
              <MediaGrid
                filter={filter}
                onAssetSelect={handleAssetSelect}
                selectedAsset={selectedAsset}
                refreshTrigger={refreshTrigger}
              />
            </div>

            {selectedAsset && (
              <MediaDetails
                asset={selectedAsset}
                onClose={() => setSelectedAsset(null)}
              />
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              onClick={handleConfirmSelection}
              disabled={!selectedAsset}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {t('select')}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  )
} 