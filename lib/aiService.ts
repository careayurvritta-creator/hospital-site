/**
 * Unified AI Service - Nvidia NIM Only
 * Uses Nvidia NIM for all AI operations
 * 
 * Nvidia NIM provides free access with ~40 requests/minute rate limit
 * Base URL: https://integrate.api.nvidia.com/v1
 */

import { NvidiaClient, getNvidiaErrorMessage } from './nvidiaClient';

export type AIProvider = 'nvidia';

export interface AIRequestOptions {
  temperature?: number;
  max_tokens?: number;
}

export interface AIServiceConfig {
  nvidiaApiKey?: string;
}

class AIService {
  private nvidiaClient: NvidiaClient | null = null;
  private config: AIServiceConfig = {};
  private initialized = false;
  private initError: string | null = null;
  private initializing = false;

  init(config: AIServiceConfig = {}) {
    if (this.initializing) return;
    this.initializing = true;

    try {
      this.config = {
        ...config,
      };

      console.log('[AI Service] Initializing with Nvidia NIM (via Vercel proxy)');

      // NvidiaClient routes through /api/nvidia Vercel proxy which handles auth server-side
      // API key is NOT needed client-side - the proxy uses NVIDIA_API_KEY from Vercel env
      try {
        this.nvidiaClient = new NvidiaClient('proxy');
        console.log('[AI Service] Nvidia client initialized (using Vercel proxy auth)');
      } catch (e) {
        console.error('[AI Service] Failed to initialize Nvidia client:', e);
      }

      if (!this.nvidiaClient) {
        this.initError = 'Failed to initialize AI client';
        console.error('[AI Service]', this.initError);
      }
    } catch (e) {
      console.error('[AI Service] Initialization error:', e);
      this.initError = 'Failed to initialize AI service';
    } finally {
      this.initialized = true;
      this.initializing = false;
    }
  }

  private ensureInitialized() {
    if (this.initialized || this.initializing) return;
    
    try {
      console.log('[AI Service] Lazy initialization triggered');
      this.init({});
    } catch (e) {
      console.error('[AI Service] Lazy init error:', e);
      this.initError = 'Failed to initialize AI service';
      this.initialized = true;
    }
  }

  /**
   * Simple text generation
   */
  async generate(
    prompt: string,
    systemInstruction?: string,
    options: AIRequestOptions = {}
  ): Promise<string> {
    this.ensureInitialized();

    if (this.initError) {
      throw new Error(this.initError);
    }

    if (!this.nvidiaClient) {
      throw new Error('Nvidia client not available');
    }

    console.log('[AI Service] generate() using Nvidia');
    
    return await this.nvidiaClient.generate(prompt, systemInstruction, {
      temperature: options.temperature,
      max_tokens: options.max_tokens,
    });
  }

  /**
   * Chat with streaming response (Nvidia doesn't support streaming, using regular generate)
   */
  async chat(
    session: any,
    message: string
  ): Promise<string> {
    this.ensureInitialized();

    if (this.initError) {
      throw new Error(this.initError);
    }

    if (!this.nvidiaClient) {
      throw new Error('Nvidia client not available');
    }

    console.log('[AI Service] chat() using Nvidia');
    
    // Nvidia doesn't support streaming chat sessions, so we use regular generate
    // We'll maintain conversation context in the session object
    const history = session.history || [];
    history.push({ role: 'user', content: message });
    
    const messages = [
      { role: 'system' as const, content: session.systemInstruction || '' },
      ...history.slice(-10), // Keep last 10 messages for context
    ];
    
    const response = await this.nvidiaClient.chat(messages);
    
    history.push({ role: 'assistant', content: response });
    session.history = history;
    
    return response;
  }

  /**
   * Create a chat session (Nvidia style - stores context)
   */
  async createChatSession(systemInstruction: string): Promise<any> {
    this.ensureInitialized();

    if (this.initError) {
      throw new Error(this.initError);
    }

    if (!this.nvidiaClient) {
      throw new Error('Nvidia client not available');
    }

    console.log('[AI Service] createChatSession() using Nvidia');
    
    // Create a session object that stores conversation history
    return {
      systemInstruction,
      history: [],
    };
  }

  /**
   * Generate structured JSON response
   */
  async generateStructured<T>(
    prompt: string,
    systemInstruction: string,
    schema: object,
    options: AIRequestOptions = {}
  ): Promise<T> {
    this.ensureInitialized();

    if (this.initError) {
      throw new Error(this.initError);
    }

    if (!this.nvidiaClient) {
      throw new Error('Nvidia client not available');
    }

    console.log('[AI Service] generateStructured() using Nvidia');
    
    return await this.nvidiaClient.generateStructured<T>(
      prompt,
      systemInstruction,
      schema,
      options
    );
  }

  /**
   * Generate image - NOT SUPPORTED by Nvidia NIM free tier
   * Returns null with error message
   */
  async generateImage(prompt: string): Promise<{ base64: string; mimeType: string } | null> {
    this.ensureInitialized();
    
    console.warn('[AI Service] Image generation not supported by Nvidia NIM free tier');
    throw new Error('Image generation requires a separate service. Please contact support.');
  }

  /**
   * Analyze document - Extracts text first, then uses Nvidia for analysis
   */
  async analyzeDocument(
    extractedText: string,
    mimeType: string,
    prompt: string
  ): Promise<string> {
    this.ensureInitialized();

    if (this.initError) {
      throw new Error(this.initError);
    }

    if (!this.nvidiaClient) {
      throw new Error('Nvidia client not available');
    }

    console.log('[AI Service] analyzeDocument() using Nvidia');
    console.log('[AI Service] Extracted text length:', extractedText.length);

    // Combine prompt with extracted text
    const fullPrompt = `${prompt}\n\n--- Document Content ---\n\n${extractedText}\n\n--- End of Document ---\n\nPlease analyze the document content above and provide your response.`;

    return await this.nvidiaClient.generate(fullPrompt, 'You are an insurance expert specializing in Indian health insurance policies and AYUSH coverage.', {
      max_tokens: 4096,
    });
  }

  /**
   * Location search using Nvidia (no Maps integration)
   */
  async locationSearch(
    query: string,
    lat: number,
    lng: number,
    systemInstruction: string
  ): Promise<{ text: string; mapLinks: Array<{ web?: { uri: string; title: string } }> }> {
    this.ensureInitialized();

    if (this.initError) {
      throw new Error(this.initError);
    }

    if (!this.nvidiaClient) {
      throw new Error('Nvidia client not available');
    }

    console.log('[AI Service] locationSearch() using Nvidia');

    const prompt = `Location query: ${query}\nHospital location: Lat ${lat}, Lng ${lng}`;
    const text = await this.nvidiaClient.generate(prompt, systemInstruction);

    return {
      text,
      mapLinks: [], // No map links from Nvidia
    };
  }

  /**
   * Check if AI service is available
   */
  isAvailable(): boolean {
    this.ensureInitialized();
    return !!this.nvidiaClient;
  }

  /**
   * Get current provider status
   */
  getStatus(): { nvidia: boolean; google: boolean; preferred: AIProvider; error: string | null } {
    this.ensureInitialized();
    return {
      nvidia: !!this.nvidiaClient,
      google: false,
      preferred: 'nvidia',
      error: this.initError,
    };
  }

  /**
   * Debug method to check initialization
   */
  debug(): void {
    console.log('[AI Service Debug] Status:', this.getStatus());
    console.log('[AI Service Debug] Auth: Vercel serverless proxy (NVIDIA_API_KEY set on server)');
  }
}

function getFallbackMessage(type: 'text' | 'structured' | 'document' | 'image'): string {
  const messages = {
    text: 'AI service is temporarily unavailable. Please try again in a moment.',
    structured: 'Unable to generate personalized recommendations right now. Our team can still help you with diet planning - please contact our Ayurvedic physicians.',
    document: 'Document analysis is currently unavailable. Our Insurance Desk can help verify your policy manually. Contact: +91 94266 84047',
    image: 'Image generation is temporarily unavailable. Your Prakriti assessment is complete - please consult our doctors for detailed recommendations.',
  };
  
  return messages[type];
}

// Create singleton instance safely
let aiServiceInstance: AIService | null = null;

export function getAIService(): AIService {
  if (!aiServiceInstance) {
    aiServiceInstance = new AIService();
  }
  return aiServiceInstance;
}

export const aiService = getAIService();

export default aiService;
