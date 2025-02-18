'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { MediaAsset } from '@/types/media';
import { formatFileSize, formatDate } from '@/utils/format';
import Image from 'next/image';
import { FolderIcon } from '@heroicons/react/24/outline';

interface MediaDetailsProps {
  asset: MediaAsset;
  onClose: () => void;
}

export function MediaDetails({ asset, onClose }: MediaDetailsProps) {
  const t = useTranslations('Media');
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(asset.title || '');
  const [description, setDescription] = useState(asset.description || '');
  const [altText, setAltText] = useState(asset.altText || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const { error } = await supabase
        .from('media_assets')
        .update({
          title,
          description,
          alt_text: altText,
          updated_at: new Date().toISOString()
        })
        .eq('id', asset.id);

      if (error) throw error;

      setIsEditing(false);
    } catch (err) {
      console.error('Error updating media asset:', err);
      setError(t('updateError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('deleteConfirm'))) return;

    try {
      setError(null);

      // Extract the file path from the URL
      const fileUrl = new URL(asset.originalUrl);
      const filePath = fileUrl.pathname.split('/').pop();

      if (!filePath) {
        throw new Error('Invalid file path');
      }

      // Delete the file from storage first
      const { error: storageError } = await supabase
        .storage
        .from('media')
        .remove([filePath]);

      if (storageError) {
        throw storageError;
      }

      // Also delete optimized and thumbnail versions if they exist
      if (asset.optimizedUrl) {
        const optimizedPath = new URL(asset.optimizedUrl).pathname.split('/').pop();
        if (optimizedPath) {
          await supabase.storage.from('media').remove([optimizedPath]);
        }
      }

      if (asset.thumbnailUrl) {
        const thumbnailPath = new URL(asset.thumbnailUrl).pathname.split('/').pop();
        if (thumbnailPath) {
          await supabase.storage.from('media').remove([thumbnailPath]);
        }
      }

      // Then delete the database record
      const { error: dbError } = await supabase
        .from('media_assets')
        .delete()
        .eq('id', asset.id);

      if (dbError) throw dbError;

      onClose();
    } catch (err) {
      console.error('Error deleting media asset:', err);
      setError(t('deleteError'));
    }
  };

  return (
    <div className="bg-card rounded-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-semibold">
          {t('details')}
        </h2>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('title')}
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t('description')}
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-border bg-background px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t('altText')}
              </label>
              <input
                type="text"
                value={altText}
                onChange={e => setAltText(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {isSaving ? t('saving') : t('save')}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="aspect-square relative rounded-lg overflow-hidden">
            {asset.originalUrl ? (
              <Image
                src={asset.originalUrl}
                alt={asset.title || asset.filename}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <FolderIcon className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                {t('title')}
              </h3>
              <p>{asset.title || asset.filename}</p>
            </div>

            {asset.description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t('description')}
                </h3>
                <p>{asset.description}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                {t('fileInfo')}
              </h3>
              <p>{formatFileSize(asset.fileSize)} • {asset.mimeType}</p>
              {asset.width && asset.height && (
                <p>{asset.width} × {asset.height}px</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                {t('uploaded')}
              </h3>
              <p>{formatDate(asset.createdAt)}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <PencilIcon className="w-4 h-4" />
                {t('edit')}
              </button>
              <button
                onClick={handleDelete}
                data-testid="delete-button"
                className="flex items-center gap-1 text-sm text-destructive hover:text-destructive/80"
              >
                <TrashIcon className="w-4 h-4" />
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
} 