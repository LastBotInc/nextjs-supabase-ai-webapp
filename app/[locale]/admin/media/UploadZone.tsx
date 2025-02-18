'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDropzone } from 'react-dropzone';
import { UploadProgress } from '@/types/media';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  uploads: UploadProgress[];
}

export function UploadZone({ onFilesSelected, uploads }: UploadZoneProps) {
  const t = useTranslations('Media');
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false)
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        data-testid="upload-zone"
        className={`
          border-2 border-dashed rounded-lg p-8
          transition-colors duration-200 ease-in-out
          flex flex-col items-center justify-center
          ${isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
          }
        `}
      >
        <input {...getInputProps()} data-testid="file-input" />
        <ArrowUpTrayIcon className="w-8 h-8 text-muted-foreground mb-4" />
        <p className="text-center text-muted-foreground">
          {t('dropzoneText')}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {t('supportedFormats')}
        </p>
      </div>

      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload, index) => (
            <div
              key={upload.file.name + index}
              className="bg-card p-4 rounded-md"
              data-testid="upload-progress"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium truncate">
                  {upload.file.name}
                </span>
                <span className="text-sm text-muted-foreground" data-testid="upload-status">
                  {upload.status === 'error' ? t('error') :
                   upload.status === 'complete' ? '100%' :
                   `${Math.round(upload.progress)}%`}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full
                    ${upload.status === 'error' ? 'bg-destructive' :
                      upload.status === 'complete' ? 'bg-primary' : 'bg-primary/60'
                    }`}
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
              {upload.error && (
                <p className="text-sm text-destructive mt-1" data-testid="upload-error">
                  {upload.error}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 