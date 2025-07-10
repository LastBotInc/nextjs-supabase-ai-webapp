'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { createClient } from '@/utils/supabase/client';
import { GenerationOptions } from '@/types/media';

interface ImageGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const STYLES = [
  'digital_illustration',
  'realistic_image',
  'pixel_art',
  'hand_drawn',
  'grain',
  'infantile_sketch',
  '2d_art_poster',
  'handmade_3d',
  'hand_drawn_outline',
  'engraving_color'
];

const SIZES = [
  { width: 1024, height: 1024 },
  { width: 1365, height: 1024 },
  { width: 1024, height: 1365 },
  { width: 1536, height: 1536 }
];

const AI_MODELS = [
  { value: 'imagen-3.0', label: 'imagen-3_0' },
  { value: 'imagen-4.0', label: 'imagen-4_0' },
  { value: 'gpt-image-1', label: 'gpt-image-1' }
] as const;

export function ImageGenerationModal({ isOpen, onClose, onSuccess }: ImageGenerationModalProps) {
  const t = useTranslations('Media');
  const supabase = createClient();
  const [options, setOptions] = useState<GenerationOptions>({
    prompt: '',
    model: 'imagen-3.0',
    style: 'digital_illustration',
    width: 1024,
    height: 1024
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      setIsGenerating(true);
      setError(null);

      // Call the media generation API through our backend
      const response = await fetch('/api/media/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(options)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate image');
      }

      if (!result.data) {
        throw new Error('No image data received');
      }

      onSuccess?.(); // Call the success callback if provided
      onClose();
    } catch (err) {
      console.error('Error generating image:', err instanceof Error ? err.message : 'Unknown error');
      setError(err instanceof Error ? err.message : t('generationError'));
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
      <div className="fixed inset-x-4 top-[50%] translate-y-[-50%] sm:inset-x-auto sm:left-[50%] sm:translate-x-[-50%] sm:max-w-lg w-full">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('generateImage')}
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {t('prompt')}
              </label>
              <textarea
                value={options.prompt}
                onChange={e => setOptions({ ...options, prompt: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('promptPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {t('model')}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('modelHelp')}</p>
              <select
                value={options.model}
                onChange={e => setOptions({ ...options, model: e.target.value as GenerationOptions['model'] })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {AI_MODELS.map(model => (
                  <option key={model.value} value={model.value}>
                    {t(`models.${model.label}`)}
                  </option>
                ))}
              </select>
            </div>

            {/* Only show style selection for Imagen models */}
            {options.model?.startsWith('imagen') && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {t('style')}
                </label>
                <select
                  value={options.style}
                  onChange={e => setOptions({ ...options, style: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {STYLES.map(style => (
                    <option key={style} value={style}>
                      {style.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {t('size')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SIZES.map(size => (
                  <button
                    key={`${size.width}x${size.height}`}
                    onClick={() => setOptions({ ...options, ...size })}
                    className={`
                      p-2 text-sm border rounded-md transition-colors
                      ${options.width === size.width && options.height === size.height
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    {size.width} × {size.height}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {t('negativePrompt')}
              </label>
              <input
                type="text"
                value={options.negativePrompt || ''}
                onChange={e => setOptions({ ...options, negativePrompt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('negativePromptPlaceholder')}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                disabled={isGenerating}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleGenerate}
                disabled={!options.prompt || isGenerating}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? t('generating') : t('generate')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 