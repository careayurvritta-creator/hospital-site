/**
 * Unified AI Service - Smart Fallback between Nvidia and Google
 * Primary: Nvidia NIM (free tier)
 * Fallback: Google Gemini
 * 
 * This service provides a unified interface for all AI features with automatic
 * fallback to ensure reliability. When Nvidia fails (rate limit, error), it
 * automatically tries Google Gemini.
 */

import { NvidiaClient, getNvidiaErrorMessage } from './nvidiaClient';
import { GoogleClient, getGoogleErrorMessage } from './googleClient';

export type AIProvider = 'nvidia' | 'google';

export interface AIRequestOptions {
  provider?: AIProvider;
  temperature?: number;
  max_tokens?: number;
}

export interface AIServiceConfig {
  nvidiaApiKey?: string;
  googleApiKey?: string;
  preferredProvider?: AIProvider;
}

class AIService {
  private nvidiaClient: NvidiaClient | null = null;
  private googleClient: GoogleClient | null = null;
  private config: AIServiceConfig = {};
  private initialized = false;
  private initError: string | null = null;
  private initializing = false;

  init(config: AIServiceConfig = {}) {
    if (this.initializing) return;
    this.initializing = true;

    try {
      this.config = {
        preferredProvider: 'nvidia',
        ...config,
      };

      console.log('[AI Service] Initializing with config:', {
        hasNvidiaKey: !!config.nvidiaApiKey,
        hasGoogleKey: !!config.googleApiKey,
        preferredProvider: this.config.preferredProvider,
      });

      if (this.config.nvidiaApiKey) {
        try {
          this.nvidiaClient = new NvidiaClient(this.config.nvidiaApiKey);
          console.log('[AI Service] Nvidia client initialized');
        } catch (e) {
          console.error('[AI Service] Failed to initialize Nvidia client:', e);
        }
      }

      if (this.config.googleApiKey) {
        try {
          this.googleClient = new GoogleClient(this.config.googleApiKey);
          console.log('[AI Service] Google client initialized');
        } catch (e) {
          console.error('[AI Service] Failed to initialize Google client:', e);
        }
      }

      if (!this.nvidiaClient && !this.googleClient) {
        this.initError = 'No API keys configured. Please set VITE_NVIDIA_API_KEY or VITE_GEMINI_API_KEY';
        console.warn('[AI Service]', this.initError);
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
      const nvidiaKey = import.meta.env.VITE_NVIDIA_API_KEY;
      const googleKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      console.log('[AI Service] Lazy initialization triggered');
      console.log('[AI Service] Environment keys available:', {
        hasNvidiaKey: !!nvidiaKey,
        hasGoogleKey: !!googleKey,
      });
      
      this.init({
        nvidiaApiKey: nvidiaKey,
        googleApiKey: googleKey,
        preferredProvider: nvidiaKey ? 'nvidia' : 'google',
      });
    } catch (e) {
      console.error('[AI Service] Lazy init error:', e);
      this.initError = 'Failed to initialize AI service';
      this.initialized = true;
    }
  }

  private getActiveProvider(preferredProvider?: AIProvider): AIProvider {
    return preferredProvider || this.config.preferredProvider || 'nvidia';
  }

  /**
   * Simple text generation with smart fallback
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

    const provider = this.getActiveProvider(options.provider);
    console.log('[AI Service] generate() called with provider:', provider);

    if (provider === 'nvidia' && this.nvidiaClient) {
      try {
        console.log('[AI Service] Trying Nvidia...');
        return await this.nvidiaClient.generate(prompt, systemInstruction, {
          temperature: options.temperature,
          max_tokens: options.max_tokens,
        });
      } catch (error) {
        console.warn('[AI Service] Nvidia failed, falling back to Google:', error);
        
        if (this.googleClient) {
          try {
            console.log('[AI Service] Trying Google fallback...');
            return await this.googleClient.generateContent(prompt, {
              systemInstruction,
              temperature: options.temperature,
              max_tokens: options.max_tokens,
            });
          } catch (googleError) {
            console.error('[AI Service] Google fallback also failed:', googleError);
            throw new Error(getFallbackMessage('text'));
          }
        }
      }
    }

    if (this.googleClient) {
      console.log('[AI Service] Using Google directly');
      return await this.googleClient.generateContent(prompt, {
        systemInstruction,
        temperature: options.temperature,
        max_tokens: options.max_tokens,
      });
    }

    throw new Error('No AI provider configured');
  }

  /**
   * Chat with streaming response
   */
  async chat(
    session: any,
    message: string
  ): Promise<string> {
    this.ensureInitialized();

    if (this.initError) {
      throw new Error(this.initError);
    }

    if (this.googleClient) {
      console.log('[AI Service] chat() using Google');
      return await this.googleClient.chat(session, message);
    }

    throw new Error('Chat requires Google Gemini (Nvidia NIM does not support streaming chat sessions)');
  }

  /**
   * Create a chat session (Google only for now)
   */
  async createChatSession(systemInstruction: string): Promise<any> {
    this.ensureInitialized();

    if (this.initError) {
      throw new Error(this.initError);
    }

    if (this.googleClient) {
      console.log('[AI Service] createChatSession() using Google');
      return await this.googleClient.createChatSession(systemInstruction);
    }

    throw new Error('Chat sessions require Google Gemini');
  }

  /**
   * Generate structured JSON response (Google preferred - better schema support)
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

    console.log('[AI Service] generateStructured() called');

    // Use Google directly for structured output - better schema handling
    if (this.googleClient) {
      try {
        console.log('[AI Service] Using Google for structured output');
        return await this.googleClient.generateWithSchema<T>(prompt, schema, {
          temperature: options.temperature,
          max_tokens: options.max_tokens,
        });
      } catch (error) {
        console.error('[AI Service] Google structured output failed:', error);
        throw new Error(getFallbackMessage('structured'));
      }
    }

    // Fallback to Nvidia only if Google is not available
    if (this.nvidiaClient) {
      try {
        console.log('[AI Service] Using Nvidia for structured output');
        return await this.nvidiaClient.generateStructured<T>(
          prompt,
          systemInstruction,
          schema,
          options
        );
      } catch (error) {
        console.error('[AI Service] Nvidia structured output failed:', error);
        throw new Error(getFallbackMessage('structured'));
      }
    }

    throw new Error('No AI provider configured');
  }

  /**
   * Generate image (Google only - Nvidia doesn't support image generation in free tier)
   */
  async generateImage(prompt: string): Promise<{ base64: string; mimeType: string } | null> {
    this.ensureInitialized();

    if (this.initError) {
      throw new Error(this.initError);
    }

    console.log('[AI Service] generateImage() called');

    if (this.googleClient) {
      console.log('[AI Service] Using Google for image generation');
      return await this.googleClient.generateImage(prompt);
    }

    throw new Error('Image generation requires Google Gemini');
  }

  /**
   * Analyze document/image with text extraction (Google only - Nvidia doesn't support image input)
   */
  async analyzeDocument(
    base64Image: string,
    mimeType: string,
    prompt: string
  ): Promise<string> {
    this.ensureInitialized();

    if (this.initError) {
      throw new Error(this.initError);
    }

    console.log('[AI Service] analyzeDocument() called');

    // Use Google directly - Nvidia doesn't support image input in free tier
    if (this.googleClient) {
      try {
        console.log('[AI Service] Using Google for document analysis');
        return await this.googleClient.generateContentWithImage(
          prompt,
          base64Image,
          mimeType
        );
      } catch (error) {
        console.error('[AI Service] Google document analysis failed:', error);
        throw new Error(getFallbackMessage('document'));
      }
    }

    throw new Error('No AI provider configured for document analysis');
  }

  /**
   * Location search with Google Maps integration (Google only)
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

    console.log('[AI Service] locationSearch() called');

    if (this.googleClient) {
      console.log('[AI Service] Using Google for location search');
      return await this.googleClient.generateWithGoogleMaps(query, lat, lng, systemInstruction);
    }

    throw new Error('Location search requires Google Gemini with Maps integration');
  }

  /**
   * Check if AI service is available
   */
  isAvailable(): boolean {
    this.ensureInitialized();
    return !!(this.nvidiaClient || this.googleClient);
  }

  /**
   * Get current provider status
   */
  getStatus(): { nvidia: boolean; google: boolean; preferred: AIProvider; error: string | null } {
    this.ensureInitialized();
    return {
      nvidia: !!this.nvidiaClient,
      google: !!this.googleClient,
      preferred: this.config.preferredProvider || 'nvidia',
      error: this.initError,
    };
  }

  /**
   * Debug method to check initialization
   */
  debug(): void {
    console.log('[AI Service Debug] Status:', this.getStatus());
    try {
      console.log('[AI Service Debug] Environment:', {
        VITE_NVIDIA_API_KEY: import.meta.env.VITE_NVIDIA_API_KEY ? '***' + import.meta.env.VITE_NVIDIA_API_KEY.slice(-4) : 'not set',
        VITE_GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY ? '***' + import.meta.env.VITE_GEMINI_API_KEY.slice(-4) : 'not set',
      });
    } catch (e) {
      console.log('[AI Service Debug] Cannot read env vars in debug mode');
    }
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
