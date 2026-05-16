/**
 * Nvidia NIM API Client
 * Uses Vercel serverless proxy to avoid CORS issues
 * Base URL: /api/nvidia (proxies to https://integrate.api.nvidia.com/v1)
 */

const NIM_BASE_URL = '/api/nvidia';

export interface NvidiaRequestOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

export interface NvidiaResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const DEFAULT_MODELS = {
  nano: 'nvidia/llama-3.1-nemotron-nano-8b-v1',
  instruct: 'meta/llama-3.1-8b-instruct',
  reasoning: 'deepseek-ai/deepseek-r1',
} as const;

export type NvidiaModelType = keyof typeof DEFAULT_MODELS;

export class NvidiaClient {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: NvidiaModelType = 'nano') {
    this.apiKey = apiKey;
    this.model = DEFAULT_MODELS[model];
  }

  setModel(model: NvidiaModelType) {
    this.model = DEFAULT_MODELS[model];
  }

  async chat(messages: ChatMessage[], options: NvidiaRequestOptions = {}): Promise<string> {
    const response = await fetch(NIM_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model: options.model || this.model,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 2048,
        top_p: options.top_p ?? 0.9,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Nvidia API Error (${response.status}): ${error}`);
    }

    const data: NvidiaResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async generate(prompt: string, systemInstruction?: string, options: NvidiaRequestOptions = {}): Promise<string> {
    const messages: ChatMessage[] = [];
    
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    return this.chat(messages, options);
  }

  async generateStructured<T>(
    prompt: string,
    systemInstruction: string,
    schema: object,
    options: NvidiaRequestOptions = {}
  ): Promise<T> {
    const fullPrompt = `${prompt}\n\nRespond in valid JSON matching this schema: ${JSON.stringify(schema, null, 2)}`;
    
    const messages: ChatMessage[] = [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: fullPrompt },
    ];

    const response = await this.chat(messages, {
      ...options,
      temperature: 0.3,
    });

    try {
      const parsed = JSON.parse(response);
      return parsed as T;
    } catch {
      throw new Error('Failed to parse AI response as JSON');
    }
  }
}

export function createNvidiaClient(apiKey: string, model?: NvidiaModelType): NvidiaClient {
  return new NvidiaClient(apiKey, model);
}

export function getNvidiaErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('429')) {
      return 'AI service is busy. Please try again in a moment.';
    }
    if (error.message.includes('401')) {
      return 'AI service authentication failed. Please contact support.';
    }
    if (error.message.includes('500') || error.message.includes('503')) {
      return 'AI service is temporarily unavailable. Please try again later.';
    }
    return error.message;
  }
  return 'An unexpected error occurred';
}