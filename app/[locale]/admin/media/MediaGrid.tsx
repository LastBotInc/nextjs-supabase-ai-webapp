'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MediaAsset, MediaFilter } from '@/types/media';
import Image from 'next/image';
import { FolderIcon, SparklesIcon, PencilIcon, TrashIcon, EyeIcon, PlayIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { MagicEditModal } from './MagicEditModal';
import { VideoGenerationModal } from './VideoGenerationModal';
import { MediaDetailModal } from './MediaDetailModal';
import { useAuth } from '@/components/auth/AuthProvider';

interface MediaGridProps {
  filter: MediaFilter;
  selectedAsset: MediaAsset | null;
  onAssetSelect: (asset: MediaAsset | null) => void;
  refreshTrigger?: number;
}

// Database asset type
interface DatabaseAsset {
  id: string;
  created_at: string;
  updated_at: string;
  title: string | null;
  description: string | null;
  alt_text: string | null;
  filename: string;
  file_size: number;
  mime_type: string;
  width: number | null;
  height: number | null;
  original_url: string;
  optimized_url: string | null;
  thumbnail_url: string | null;
  metadata: Record<string, unknown>;
  user_id: string;
  is_generated: boolean;
  generation_prompt: string | null;
  generation_style: string | null;
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
  };
}

export function MediaGrid({ filter, selectedAsset, onAssetSelect, refreshTrigger = 0 }: MediaGridProps) {
  const t = useTranslations('Media');
  const { session } = useAuth();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [videoGeneratingAsset, setVideoGeneratingAsset] = useState<MediaAsset | null>(null);
  const [viewingAsset, setViewingAsset] = useState<MediaAsset | null>(null);
  const supabase = createClientComponentClient();

  const loadAssets = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('media_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter.search) {
        query = query.or(`title.ilike.%${filter.search}%,description.ilike.%${filter.search}%`);
      }
      if (filter.type && filter.type.length > 0 && !filter.type.includes('all')) {
        // Ensure filter.type is an array of strings for the 'in' operator
        const validTypes = Array.isArray(filter.type) ? filter.type : [filter.type];
        query = query.in('mime_type', validTypes);
      }      
      if (filter.dateRange) {
        const [dateFrom, dateTo] = filter.dateRange;
        query = query.gte('created_at', dateFrom.toISOString());
        query = query.lte('created_at', dateTo.toISOString());
      }
      if (typeof filter.isGenerated === 'boolean') {
        query = query.eq('is_generated', filter.isGenerated);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading media assets:', error);
        setAssets([]); // Clear assets on error
        return;
      }
      setAssets(data.map(mapDatabaseAsset));
    } catch (error) {
      console.error('Error loading media assets:', error);
      setAssets([]); // Clear assets on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, refreshTrigger]); // Supabase client is stable, filter and refreshTrigger are dependencies

  const handleDeleteAsset = async (assetId: string, event: React.MouseEvent) => {
    event.stopPropagation(); 

    if (!session?.access_token) {
      alert(t('authenticationRequired')); 
      return;
    }

    if (window.confirm(t('deleteConfirm'))) {
      try {
        // setLoading(true); // Consider a more granular loading state for the specific item if needed
        const response = await fetch('/api/media/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ assetId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || t('deleteError'));
        }
        
        await loadAssets(); 
        if (selectedAsset?.id === assetId) {
          onAssetSelect(null);
        }
        // Consider adding a success notification here

      } catch (error) {
        console.error('Error deleting asset:', error);
        alert(error instanceof Error ? error.message : t('deleteError'));
      } finally {
        // setLoading(false);
      }
    }
  };

  const handleDownloadAsset = (asset: MediaAsset, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!asset.originalUrl || !asset.filename) {
      console.error('Asset URL or filename is missing, cannot download.');
      alert(t('downloadErrorMissingInfo'));
      return;
    }
    try {
      const link = document.createElement('a');
      link.href = asset.originalUrl;
      link.setAttribute('download', asset.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading asset:", error);
      alert(t('downloadErrorGeneric'));
    }
  };

  const handleMagicEdit = (asset: MediaAsset, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent asset selection
    setEditingAsset(asset);
    setShowEditModal(true);
  };

  const handleVideoGeneration = (asset: MediaAsset) => {
    setVideoGeneratingAsset(asset);
  };

  const handleVideoGenerationSuccess = () => {
    setVideoGeneratingAsset(null);
    // Trigger refresh of assets
    window.location.reload();
  };

  const handleViewAsset = (asset: MediaAsset, event?: React.MouseEvent) => {
    event?.stopPropagation(); // Prevent asset selection if triggered from button
    setViewingAsset(asset);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-muted rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderIcon className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-semibold text-foreground">
          {t('noMedia')}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('uploadPrompt')}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="relative group"
          >
            <button
              onClick={(e) => handleViewAsset(asset, e)}
              className={`
                relative aspect-square rounded-lg overflow-hidden w-full
                focus:outline-none focus:ring-2 focus:ring-primary
                ${selectedAsset?.id === asset.id ? 'ring-2 ring-primary' : ''}
              `}
            >
              {asset.mimeType.startsWith('image/') ? (
                <Image
                  src={asset.originalUrl}
                  alt={asset.altText || asset.title || ''}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : asset.mimeType.startsWith('video/') ? (
                <video 
                  src={asset.originalUrl} 
                  className="object-cover w-full h-full"
                  controls 
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground">
                  {/* Placeholder for other file types, e.g., document icon */}
                  <span>{asset.filename}</span>
                </div>
              )}
            </button>
            
            {/* Action buttons overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
              <button
                onClick={(e) => handleViewAsset(asset, e)}
                className="p-2 bg-white/90 hover:bg-white text-gray-700 rounded-full transition-colors"
                title={t('details')}
              >
                <EyeIcon className="h-4 w-4" />
              </button>
              
              {/* Magic Edit button - only for images */}
              {asset.mimeType.startsWith('image/') && (
                <button
                  onClick={(e) => handleMagicEdit(asset, e)}
                  className="p-2 bg-white/90 hover:bg-white text-gray-700 rounded-full transition-colors"
                  title={t('magicEdit')}
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              )}

              {/* Video Generation button - only for images */}
              {asset.mimeType.startsWith('image/') && (
                <button
                  onClick={() => handleVideoGeneration(asset)}
                  className="p-2 bg-white/90 hover:bg-white text-purple-700 rounded-full transition-colors"
                  title={t('generateVideo')}
                >
                  <PlayIcon className="h-4 w-4" />
                </button>
              )}
              
              <button
                onClick={(e) => handleDownloadAsset(asset, e)}
                className="p-2 bg-white/90 hover:bg-white text-blue-600 rounded-full transition-colors"
                title={t('download')}
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
              </button>

              <button
                onClick={(e) => handleDeleteAsset(asset.id, e)}
                className="p-2 bg-white/90 hover:bg-white text-red-600 rounded-full transition-colors"
                title={t('delete')}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Magic Edit Modal */}
      {showEditModal && editingAsset && (
        <MagicEditModal
          asset={editingAsset}
          onClose={() => {
            setShowEditModal(false);
            setEditingAsset(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingAsset(null);
            // Trigger refresh of assets
            window.location.reload();
          }}
        />
      )}

      {/* Video Generation Modal */}
      {videoGeneratingAsset && (
        <VideoGenerationModal
          asset={videoGeneratingAsset}
          onClose={() => setVideoGeneratingAsset(null)}
          onSuccess={handleVideoGenerationSuccess}
        />
      )}

      {/* Media Detail Modal */}
      {viewingAsset && (
        <MediaDetailModal 
          asset={viewingAsset} 
          onClose={() => setViewingAsset(null)} 
        />
      )}
    </>
  );
} 