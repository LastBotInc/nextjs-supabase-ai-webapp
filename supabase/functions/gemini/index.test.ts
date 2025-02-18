/// <reference types="jest" />

import { GoogleGenerativeAI, GenerativeModel, GenerationConfig, SafetySetting, GenerateContentResult, GenerateContentStreamResult, ChatSession, CountTokensResponse, EmbedContentResponse, BatchEmbedContentsResponse, BatchEmbedContentsRequest, ModelParams, RequestOptions, CachedContent, EnhancedGenerateContentResponse, Content, BlockReason, HarmCategory, HarmBlockThreshold, HarmProbability } from "@google/generative-ai";

// Mock environment variables
process.env.GOOGLE_AI_STUDIO_KEY = 'test-key';

// Mock interfaces
interface MockResponse {
  status: number;
  body: any;
}

// Mock classes
class MockGenerativeModel implements Partial<GenerativeModel> {
  async generateContent(prompt: string): Promise<GenerateContentResult> {
    return {
      response: {
        text: () => "Test response",
        candidates: [{
          content: {
            parts: [{ text: "Test response" }]
          }
        }]
      }
    } as any;
  }

  async generateContentStream(prompt: string): Promise<GenerateContentStreamResult> {
    return {
      stream: async function* () {
        yield {
          response: {
            text: () => "Test response",
            candidates: [{
              content: {
                parts: [{ text: "Test response" }]
              }
            }]
          }
        } as any;
      }
    } as any;
  }

  startChat(): ChatSession {
    return {
      sendMessage: async (message: string) => ({
        response: {
          text: () => "Test chat response"
        }
      }) as any,
      getHistory: () => [],
      sendMessageStream: async function* (message: string) {
        yield {
          response: {
            text: () => "Test stream response"
          }
        } as any;
      }
    };
  }
}

class MockGoogleGenerativeAI implements Partial<GoogleGenerativeAI> {
  apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getGenerativeModel(modelConfig: ModelParams): GenerativeModel {
    return new MockGenerativeModel() as any;
  }

  getGenerativeModelFromCachedContent(cachedContent: CachedContent): GenerativeModel {
    return new MockGenerativeModel() as any;
  }
}

// Mock factory
function createMockFactory() {
  return new MockGoogleGenerativeAI('test-key');
}

describe("Gemini API Tests", () => {
  it("should handle text generation request", async () => {
    const request = new Request("http://localhost/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: "Test prompt",
      }),
    });

    const response = await handleRequest(request, createMockFactory);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.text).toBe("Test response");
  });

  it("should handle streaming request", async () => {
    const request = new Request("http://localhost/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: "Test prompt",
        stream: true,
      }),
    });

    const response = await handleRequest(request, createMockFactory);
    expect(response.status).toBe(200);

    const reader = response.body?.getReader();
    const { value } = await reader!.read();
    const text = new TextDecoder().decode(value);
    expect(JSON.parse(text).text).toBe("Test response");
  });

  it("should handle errors", async () => {
    const request = new Request("http://localhost/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const response = await handleRequest(request, createMockFactory);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe("Missing prompt");
  });
}); 