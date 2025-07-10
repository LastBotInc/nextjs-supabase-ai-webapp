'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/AuthProvider';
import { MediaAsset } from '@/types/media';
import Image from 'next/image';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface MagicEditModalProps {
  asset: MediaAsset;
  onClose: () => void;
  onSuccess: () => void;
}

export function MagicEditModal({ asset, onClose, onSuccess }: MagicEditModalProps) {
  const t = useTranslations('Media');
  const { session } = useAuth();
  const [editPrompt, setEditPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = async () => {
    if (!editPrompt.trim()) {
      setError(t('editPromptRequired'));
      return;
    }

    if (!session?.access_token) {
      setError('Authentication required');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/media/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          assetId: asset.id,
          editPrompt: editPrompt.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to edit image');
      }

      if (result.success && result.data) {
        onSuccess();
      } else {
        throw new Error('No edited image data received');
      }
    } catch (err) {
      console.error('Error editing image:', err);
      setError(err instanceof Error ? err.message : 'Failed to edit image');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('magicEdit')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Original Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('originalImage')}
            </label>
            <div className="relative aspect-video w-full max-w-md mx-auto rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <Image
                src={asset.originalUrl}
                alt={asset.altText || asset.title || ''}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Edit Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('editPrompt')}
            </label>
            <textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              placeholder={t('editPromptPlaceholder')}
              className="
                w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                rounded-md shadow-sm placeholder-gray-400 
                bg-white dark:bg-gray-800 
                text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              "
              rows={3}
              disabled={isGenerating}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('editPromptHelp')}
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="
              px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
              bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
              rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleEdit}
            disabled={isGenerating || !editPrompt.trim()}
            className="
              px-4 py-2 text-sm font-medium text-white 
              bg-blue-600 hover:bg-blue-700 
              rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2
            "
          >
            {isGenerating && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isGenerating ? t('editing') : t('editImage')}
          </button>
        </div>
      </div>
    </div>
  );
} 