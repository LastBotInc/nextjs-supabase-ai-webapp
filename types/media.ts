export type MediaAsset = {
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
  metadata: Record<string, any>;
  userId: string;
  isGenerated: boolean;
  generationPrompt: string | null;
  generationStyle: string | null;
};

export type MediaVariant = {
  id: string;
  createdAt: Date;
  parentId: string;
  variantType: string;
  url: string;
  width: number | null;
  height: number | null;
  metadata: Record<string, any>;
};

export type MediaUsage = {
  id: string;
  createdAt: Date;
  mediaId: string;
  entityType: string;
  entityId: string;
  context: string | null;
};

export type UploadProgress = {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'optimizing' | 'complete' | 'error';
  error?: string;
};

export type GenerationOptions = {
  prompt: string;
  style?: string;
  width?: number;
  height?: number;
  negativePrompt?: string;
  numOutputs?: number;
  seed?: number;
};

export type MediaFilter = {
  search?: string;
  type?: string[];
  dateRange?: [Date, Date];
  isGenerated?: boolean;
  sortBy?: 'createdAt' | 'title' | 'fileSize';
  sortOrder?: 'asc' | 'desc';
}; 