'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/auth/AuthProvider';
import { MediaAsset } from '@/types/media';
import { XMarkIcon, PlayIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface VideoGenerationModalProps {
  asset: MediaAsset;
  onClose: () => void;
  onSuccess: () => void;
}

export function VideoGenerationModal({ asset, onClose, onSuccess }: VideoGenerationModalProps) {
  const t = useTranslations('Media');
  const { session } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError(t('videoPromptRequired'));
      return;
    }

    if (!session?.access_token) {
      setError('Authentication required');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/media/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          assetId: asset.id,
          prompt: prompt.trim(),
          model: 'veo-2.0-generate-001',
          aspectRatio: '16:9',
          durationSeconds: 5
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Video generation failed');
      }

      const result = await response.json();
      console.log('Video generation successful:', result);
      
      onSuccess();
    } catch (error) {
      console.error('Video generation error:', error);
      setError(error instanceof Error ? error.message : 'Video generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-300 dark:border-gray-600">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <PlayIcon className="h-5 w-5" />
            {t('generateVideo')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Original Image Preview */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t('sourceImage')}
            </h3>
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <Image
                src={asset.originalUrl}
                alt={asset.altText || asset.title || ''}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Video Generation Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="video-prompt" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t('videoPrompt')}
              </label>
              <textarea
                id="video-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('videoPromptPlaceholder')}
                className="
                  w-full px-3 py-2 rounded-md resize-none
                  bg-white dark:bg-gray-700
                  text-gray-900 dark:text-gray-100
                  border border-gray-300 dark:border-gray-600
                  placeholder-gray-500 dark:placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                "
                rows={3}
                required
              />
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {t('videoPromptHelp')}
              </p>
            </div>

            {/* Video Settings Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t('videoSettings')}
              </h4>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div>• {t('videoModel')}: Veo 2.0</div>
                <div>• {t('videoDuration')}: 5 seconds</div>
                <div>• {t('videoAspectRatio')}: 16:9 (Landscape)</div>
                <div>• {t('videoQuality')}: High quality</div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="
                  flex-1 px-4 py-2 rounded-md
                  bg-gray-100 dark:bg-gray-700
                  text-gray-700 dark:text-gray-300
                  hover:bg-gray-200 dark:hover:bg-gray-600
                  focus:outline-none focus:ring-2 focus:ring-gray-500
                  transition-colors
                "
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className="
                  flex-1 px-4 py-2 rounded-md
                  bg-blue-600 hover:bg-blue-700
                  disabled:bg-blue-400 disabled:cursor-not-allowed
                  text-white font-medium
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  transition-colors
                  flex items-center justify-center gap-2
                "
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    {t('generatingVideo')}
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4" />
                    {t('generateVideo')}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 