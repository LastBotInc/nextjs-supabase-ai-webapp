export interface TavilySearchResult {
  title: string
  url: string
  content: string
  score: number
  publishedDate: string
}

export interface TavilyImage {
  url: string;
  height?: number;
  width?: number;
  alt?: string;
}

export interface TavilySearchResponse {
  query: string
  responseTime: number
  results: TavilySearchResult[]
  images: TavilyImage[]
  answer?: string
}

export interface TavilySearchOptions {
  maxResults?: number
  searchDepth?: 'basic' | 'advanced'
  includeImages?: boolean
  includeAnswer?: boolean
  includeRawContent?: boolean
  topic?: 'general' | 'news'
  days?: number
} 