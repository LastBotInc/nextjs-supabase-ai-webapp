'use client';

import { useTranslations } from 'next-intl';
import { MediaAsset } from '@/types/media';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface MediaDetailModalProps {
  asset: MediaAsset;
  onClose: () => void;
}

export function MediaDetailModal({ asset, onClose }: MediaDetailModalProps) {
  const t = useTranslations('Media');

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col items-center p-2 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white/50 dark:bg-gray-800/50 rounded-full p-1 z-10"
          aria-label={t('close')}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Media Content */}
        <div className="w-full h-full flex-grow flex items-center justify-center overflow-hidden p-2">
          {asset.mimeType.startsWith('image/') ? (
            <div className="relative flex items-center justify-center w-full h-full">
              <Image
                src={asset.originalUrl}
                alt={asset.altText || asset.title || ''}
                width={asset.width || 1200}
                height={asset.height || 1200}
                className="object-contain max-w-full max-h-[85vh] rounded-md"
                priority
              />
            </div>
          ) : asset.mimeType.startsWith('video/') ? (
            <video 
              src={asset.originalUrl} 
              className="max-w-full max-h-[85vh] rounded-md"
              controls 
              autoPlay
              loop
              playsInline
              aria-label={asset.title || t('videoPreview')}
            >
              {t('videoNotSupported')}
            </video>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-700 dark:text-gray-300 p-8">
              <p>{t('unsupportedFormat')}</p>
              <p className="text-sm">{asset.filename}</p>
            </div>
          )}
        </div>
        
        {/* Optional: Title/Filename display below media */}
        {(asset.title || asset.filename) && (
            <div className="w-full text-center p-3 bg-gray-50 dark:bg-gray-800/50 mt-auto rounded-b-lg">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {asset.title || asset.filename}
                </p>
            </div>
        )}
      </div>
    </div>
  );
} 