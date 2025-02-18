declare module '@google/generative-ai' {
  export enum HarmCategory {
    HARM_CATEGORY_HARASSMENT = 'HARM_CATEGORY_HARASSMENT',
    HARM_CATEGORY_HATE_SPEECH = 'HARM_CATEGORY_HATE_SPEECH',
    HARM_CATEGORY_SEXUALLY_EXPLICIT = 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    HARM_CATEGORY_DANGEROUS_CONTENT = 'HARM_CATEGORY_DANGEROUS_CONTENT',
  }

  export enum HarmBlockThreshold {
    BLOCK_LOW_AND_ABOVE = 'BLOCK_LOW_AND_ABOVE',
    BLOCK_MEDIUM_AND_ABOVE = 'BLOCK_MEDIUM_AND_ABOVE',
    BLOCK_HIGH_AND_ABOVE = 'BLOCK_HIGH_AND_ABOVE',
    BLOCK_ONLY_HIGH = 'BLOCK_ONLY_HIGH',
  }

  interface SafetySetting {
    category: HarmCategory
    threshold: HarmBlockThreshold
  }

  interface GenerationConfig {
    temperature?: number
    maxOutputTokens?: number
    topP?: number
    topK?: number
  }

  interface ModelConfig {
    model: string
    generationConfig?: GenerationConfig
    safetySettings?: SafetySetting[]
  }

  interface ContentPart {
    text: string
  }

  interface Content {
    role: string
    parts: ContentPart[]
  }

  interface GenerateContentRequest {
    contents: Content[]
    generationConfig?: GenerationConfig
  }

  interface GenerateContentResponse {
    response: {
      text: () => string
    }
  }

  interface GenerativeModel {
    generateContent(request: GenerateContentRequest): Promise<GenerateContentResponse>
  }

  export class GoogleGenerativeAI {
    constructor(apiKey: string)
    getGenerativeModel(config: ModelConfig): GenerativeModel
  }
} 