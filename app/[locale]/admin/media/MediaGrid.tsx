'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MediaAsset, MediaFilter } from '@/types/media';
import Image from 'next/image';
import { FolderIcon } from '@heroicons/react/24/outline';

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
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const loadAssets = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('media_assets')
          .select('*')
          .order('created_at', { ascending: false });

        // Apply filters
        if (filter.search) {
          query = query.or(`title.ilike.%${filter.search}%,description.ilike.%${filter.search}%`);
        }
        if (filter.type) {
          query = query.eq('mime_type', filter.type);
        }
        if (filter.dateRange) {
          const [dateFrom, dateTo] = filter.dateRange;
          query = query.gte('created_at', dateFrom.toISOString());
          query = query.lte('created_at', dateTo.toISOString());
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error loading media assets:', error);
          return;
        }

        setAssets(data.map(mapDatabaseAsset));
      } catch (error) {
        console.error('Error loading media assets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, [supabase, filter, refreshTrigger]); // Add refreshTrigger to dependencies

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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {assets.map((asset) => (
        <button
          key={asset.id}
          onClick={() => onAssetSelect(asset)}
          className={`
            relative aspect-square rounded-lg overflow-hidden
            focus:outline-none focus:ring-2 focus:ring-primary
            ${selectedAsset?.id === asset.id ? 'ring-2 ring-primary' : ''}
          `}
        >
          <Image
            src={asset.originalUrl}
            alt={asset.altText || asset.title || ''}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </button>
      ))}
    </div>
  );
} 