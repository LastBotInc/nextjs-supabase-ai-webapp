export interface ResearchScope {
  maxResults?: number
  maxTokens?: number
}

export interface ResearchResult {
  title: string
  url: string
  snippet: string
  score: number
  published_date: string
  datePublished?: string
  dateModified?: string
  author?: string
  publisher?: string
  images?: string[]
  description?: string
  readabilityScore?: number
  sentiment?: string
  topics?: string[]
  outline?: string[]
} 