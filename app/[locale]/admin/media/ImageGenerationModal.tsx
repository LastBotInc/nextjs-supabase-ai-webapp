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

export function ImageGenerationModal({ isOpen, onClose, onSuccess }: ImageGenerationModalProps) {
  const t = useTranslations('Media');
  const supabase = createClient();
  const [options, setOptions] = useState<GenerationOptions>({
    prompt: '',
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

      // Call the Recraft API through our backend
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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed inset-x-4 top-[50%] translate-y-[-50%] sm:inset-x-auto sm:left-[50%] sm:translate-x-[-50%] sm:max-w-lg w-full">
        <div className="bg-card rounded-lg shadow-lg">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {t('generateImage')}
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-full"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                {t('prompt')}
              </label>
              <textarea
                value={options.prompt}
                onChange={e => setOptions({ ...options, prompt: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-md"
                placeholder={t('promptPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t('style')}
              </label>
              <select
                value={options.style}
                onChange={e => setOptions({ ...options, style: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
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

            <div>
              <label className="block text-sm font-medium mb-1">
                {t('size')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SIZES.map(size => (
                  <button
                    key={`${size.width}x${size.height}`}
                    onClick={() => setOptions({ ...options, ...size })}
                    className={`
                      p-2 text-sm border rounded-md
                      ${options.width === size.width && options.height === size.height
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted'
                      }
                    `}
                  >
                    {size.width} × {size.height}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t('negativePrompt')}
              </label>
              <input
                type="text"
                value={options.negativePrompt || ''}
                onChange={e => setOptions({ ...options, negativePrompt: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder={t('negativePromptPlaceholder')}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
                disabled={isGenerating}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleGenerate}
                disabled={!options.prompt || isGenerating}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
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