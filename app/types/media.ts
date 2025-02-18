export interface MediaAsset {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string | null;
  description: string | null;
  altText: string | null;
  filename: string;
  fileSize: number;
  mimeType: string;
  width: number | null;
  height: number | null;
  originalUrl: string;
  optimizedUrl: string | null;
  thumbnailUrl: string | null;
  metadata: Record<string, string | number | boolean | null>;
  userId: string;
  isGenerated: boolean;
  generationPrompt: string | null;
  generationStyle: string | null;
}

export interface MediaFilter {
  search?: string;
  type?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

export interface GenerationOptions {
  prompt: string;
  style?: string;
  width?: number;
  height?: number;
  negativePrompt?: string;
} 