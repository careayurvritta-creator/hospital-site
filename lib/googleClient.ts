/**
 * Google Gemini API Client
 * Wrapper around @google/genai for consistent interface
 */

export interface GoogleRequestOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  systemInstruction?: string;
}

export interface ChatSession {
  sendMessageStream: (options: { message: string }) => AsyncGenerator<{ text: () => string }>;
}

export interface GenerateContentResult {
  response: {
    text: () => string;
  };
  candidates?: Array<{
    content: {
      parts: Array<{
        inlineData?: {
          data: string;
          mimeType: string;
        };
        text?: string;
      }>;
    };
  }>;
}

export class GoogleClient {
  private apiKey: string;
  private client: any = null;
  private model: string;
  private initError: string | null = null;
  private initializing = false;

  constructor(apiKey: string, model: string = 'gemini-2.0-flash') {
    this.apiKey = apiKey;
    this.model = model;
    console.log('[GoogleClient] Constructor called, apiKey present:', !!apiKey);
  }

  private async getClient(): Promise<any> {
    if (this.client) {
      return this.client;
    }
    
    if (this.initError) {
      throw new Error(this.initError);
    }
    
    if (this.initializing) {
      // Wait for initialization to complete
      while (this.initializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (this.initError) {
        throw new Error(this.initError);
      }
      return this.client;
    }
    
    this.initializing = true;
    
    try {
      console.log('[GoogleClient] Loading @google/genai module...');
      const { GoogleGenAI } = await import('@google/genai');
      console.log('[GoogleClient] Module loaded successfully');
      
      console.log('[GoogleClient] Creating GoogleGenAI instance...');
      this.client = new GoogleGenAI({ apiKey: this.apiKey });
      console.log('[GoogleClient] GoogleGenAI instance created');
      
      return this.client;
    } catch (error) {
      console.error('[GoogleClient] Failed to initialize:', error);
      this.initError = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    } finally {
      this.initializing = false;
    }
  }

  setModel(model: string) {
    this.model = model;
  }

  async createChatSession(systemInstruction: string): Promise<any> {
    console.log('[GoogleClient] createChatSession called');
    const client = await this.getClient();
    
    return client.chats.create({
      model: this.model,
      config: {
        systemInstruction,
      },
    });
  }

  async chat(session: any, message: string): Promise<string> {
    console.log('[GoogleClient] chat called');
    const result = await session.sendMessageStream({ message });
    let fullText = '';
    
    for await (const chunk of result) {
      if (chunk.text) {
        fullText += chunk.text;
      }
    }
    
    return fullText;
  }

  async generateContent(prompt: string, options: GoogleRequestOptions = {}): Promise<string> {
    console.log('[GoogleClient] generateContent called');
    const client = await this.getClient();

    const result = await client.models.generateContent({
      model: options.model || this.model,
      contents: prompt,
      config: options.systemInstruction ? {
        systemInstruction: options.systemInstruction,
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.max_tokens ?? 2048,
      } : {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.max_tokens ?? 2048,
      },
    });

    return result.text || '';
  }

  async generateContentWithImage(prompt: string, imageBase64: string, mimeType: string, options: GoogleRequestOptions = {}): Promise<string> {
    console.log('[GoogleClient] generateContentWithImage called');
    const client = await this.getClient();

    try {
      const result = await client.models.generateContent({
        model: options.model || 'gemini-2.0-flash',
        contents: [
          { text: prompt },
          { inlineData: { data: imageBase64, mimeType } }
        ],
        config: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.max_tokens ?? 4096,
        },
      });

      console.log('[GoogleClient] generateContentWithImage success');
      return result.text || '';
    } catch (error) {
      console.error('[GoogleClient] generateContentWithImage error:', error);
      throw error;
    }
  }

  async generateImage(prompt: string): Promise<{ base64: string; mimeType: string } | null> {
    console.log('[GoogleClient] generateImage called');
    const client = await this.getClient();

    const result = await client.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (result.candidates && result.candidates[0]?.content?.parts) {
      for (const part of result.candidates[0].content.parts) {
        if (part.inlineData) {
          return {
            base64: part.inlineData.data,
            mimeType: part.inlineData.mimeType || 'image/png',
          };
        }
      }
    }
    return null;
  }

  async generateWithSchema<T>(
    prompt: string,
    schema: object,
    options: GoogleRequestOptions = {}
  ): Promise<T> {
    console.log('[GoogleClient] generateWithSchema called');
    const client = await this.getClient();

    const result = await client.models.generateContent({
      model: options.model || 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        temperature: options.temperature ?? 0.3,
        maxOutputTokens: options.max_tokens ?? 4096,
      },
    });

    const text = result.text || '';
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error('Failed to parse AI response as JSON');
    }
  }

  async generateWithGoogleMaps(query: string, lat: number, lng: number, systemInstruction: string): Promise<{
    text: string;
    mapLinks: Array<{ web?: { uri: string; title: string } }>;
  }> {
    console.log('[GoogleClient] generateWithGoogleMaps called');
    const client = await this.getClient();

    const result = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: query,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng,
            },
          },
        },
        systemInstruction,
      },
    });

    const text = result.text || '';
    
    const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    return {
      text,
      mapLinks: chunks,
    };
  }
}

export function createGoogleClient(apiKey: string, model?: string): GoogleClient {
  return new GoogleClient(apiKey, model);
}

export function getGoogleErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('API_KEY')) {
      return 'AI service API key not configured. Please contact support.';
    }
    if (error.message.includes('429')) {
      return 'AI service rate limit exceeded. Please try again later.';
    }
    if (error.message.includes('503') || error.message.includes('unavailable')) {
      return 'AI service is temporarily unavailable. Please try again.';
    }
    return error.message;
  }
  return 'An unexpected error occurred';
}
