'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/utils/supabase/client';
import { UploadZone } from './UploadZone';
import { MediaGrid } from './MediaGrid';
import { MediaDetails } from './MediaDetails';
import { ImageGenerationModal } from './ImageGenerationModal';
import { SearchFilter } from './SearchFilter';
import { MediaAsset, MediaFilter, UploadProgress } from '@/types/media';

interface MediaDashboardProps {
  filter: MediaFilter;
  onFilterChange: (filter: MediaFilter) => void;
}

export function MediaDashboard({ filter, onFilterChange }: MediaDashboardProps) {
  const t = useTranslations('Media');
  const supabase = createClient();
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(0); // Trigger for refreshing the grid

  const handleFilesSelected = async (files: File[]) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error('Not authenticated')

    const newUploads: UploadProgress[] = files.map(file => ({
      file,
      progress: 0,
      status: 'pending'
    }));
    setUploads(prev => [...prev, ...newUploads]);

    // Upload each file
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      try {
        // Update status to uploading
        setUploads(current => current.map((upload, i) => {
          if (i === index) {
            return { ...upload, status: 'uploading' };
          }
          return upload;
        }));

        // Create form data
        const formData = new FormData();
        formData.append('file', file);
        const path = `uploads/${Date.now()}-${file.name}`;
        formData.append('path', path);

        // Upload via API route with auth token
        const response = await fetch('/api/media/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          },
          body: formData
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Upload failed');
        }

        // Update upload status to complete
        setUploads(current => current.map((upload, i) => {
          if (i === index) {
            return {
              ...upload,
              progress: 100,
              status: 'complete'
            };
          }
          return upload;
        }));

        // Trigger refresh of the media grid
        setShouldRefresh(prev => prev + 1);

      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Unknown error occurred during upload';

        console.error('Upload failed:', {
          message: errorMessage,
          file: {
            name: file.name,
            size: file.size,
            type: file.type
          }
        });

        setUploads(current => current.map((upload, i) => {
          if (i === index) {
            return {
              ...upload,
              status: 'error',
              error: errorMessage
            };
          }
          return upload;
        }));
      }
    }
  };

  const handleGenerateClick = () => {
    setIsGenerationModalOpen(true);
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center gap-6">
        <SearchFilter filter={filter} onChange={onFilterChange} />
        <button
          onClick={handleGenerateClick}
          className="h-10 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 whitespace-nowrap"
        >
          {t('generateNew')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
        <div className="space-y-6">
          <UploadZone onFilesSelected={handleFilesSelected} uploads={uploads} />
          <MediaGrid
            filter={filter}
            onAssetSelect={setSelectedAsset}
            selectedAsset={selectedAsset}
            refreshTrigger={shouldRefresh}
          />
        </div>

        {selectedAsset && (
          <MediaDetails
            asset={selectedAsset}
            onClose={() => setSelectedAsset(null)}
          />
        )}
      </div>

      <ImageGenerationModal
        isOpen={isGenerationModalOpen}
        onClose={() => setIsGenerationModalOpen(false)}
        onSuccess={() => setShouldRefresh(prev => prev + 1)}
      />
    </div>
  );
} 