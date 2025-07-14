import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SafetySetting } from 'npm:@google/generative-ai';
import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  image?: {
    data: string;
    mimeType: string;
  };
  chatHistory?: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>;
  stream?: boolean;
  safetySettings?: SafetySetting[];
}

type GenerativeAIFactory = (apiKey: string) => GoogleGenerativeAI;

export async function handleRequest(
  req: Request,
  GenerativeAIFactory: GenerativeAIFactory = (apiKey: string) => new GoogleGenerativeAI(apiKey)
) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const API_KEY = Deno.env.get('GOOGLE_AI_STUDIO_KEY');
    if (!API_KEY) {
      throw new Error('GOOGLE_AI_STUDIO_KEY environment variable is not set');
    }

    // Parse request body
    const body: RequestBody = await req.json();
    const { 
      prompt,
      model = 'gemini-2.5-flash',
      temperature = 0.7,
      maxTokens = 2048,
      topP = 0.95,
      topK = 40,
      image,
      chatHistory,
      stream = false,
      safetySettings
    } = body;

    // Validate required fields
    if (!prompt) {
      throw new Error('prompt is required');
    }

    // Initialize Gemini
    const genAI = GenerativeAIFactory(API_KEY);
    const modelInstance = genAI.getGenerativeModel({ 
      model,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        topP,
        topK,
      },
      safetySettings: safetySettings ?? [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Prepare content parts
    const contentParts: any[] = [prompt];

    // Add image if provided
    if (image) {
      contentParts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType,
        },
      });
    }

    // Handle chat vs. single generation
    if (chatHistory) {
      const chat = modelInstance.startChat({ history: chatHistory });
      
      if (stream) {
        const result = await chat.sendMessageStream(contentParts);
        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of result.stream) {
                const text = chunk.text();
                controller.enqueue(new TextEncoder().encode(text));
              }
              controller.close();
            } catch (error) {
              controller.error(error);
            }
          },
        });

        return new Response(stream, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } else {
        const result = await chat.sendMessage(contentParts);
        return new Response(
          JSON.stringify({ text: result.response.text() }),
          { 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
    } else {
      if (stream) {
        const result = await modelInstance.generateContentStream(contentParts);
        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of result.stream) {
                const text = chunk.text();
                controller.enqueue(new TextEncoder().encode(text));
              }
              controller.close();
            } catch (error) {
              controller.error(error);
            }
          },
        });

        return new Response(stream, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } else {
        const result = await modelInstance.generateContent(contentParts);
        return new Response(
          JSON.stringify({ text: result.response.text() }),
          { 
            headers: { 
              ...corsHeaders,
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
}

serve((req) => handleRequest(req)); 