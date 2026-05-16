/**
 * Vercel Serverless API - Nvidia NIM Proxy
 * Proxies AI requests to Nvidia NIM with timeout handling
 */

export const config = {
  runtime: 'edge',
};

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

export default async function handler(request: Request) {
  console.log('[Nvidia API] Request received');
  
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const apiKey = process.env.NVIDIA_API_KEY;
    
    console.log('[Nvidia API] API key present:', !!apiKey);
    
    if (!apiKey) {
      console.error('[Nvidia API] No API key found');
      return new Response(JSON.stringify({ error: 'Nvidia API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    
    // Use a single, fast model - no fallback loop
    const model = 'meta/llama-3.1-8b-instruct';
    console.log('[Nvidia API] Using model:', model);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('[Nvidia API] Request timeout');
      controller.abort();
    }, 8000); // 8 second timeout (Vercel free tier limit is 10s)

    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...body, model }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log('[Nvidia API] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Nvidia API] Nvidia error:', response.status, errorText);
      return new Response(JSON.stringify({ 
        error: `Nvidia API error (${response.status})`, 
        details: errorText 
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('[Nvidia API] Success');
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[Nvidia Proxy] Error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return new Response(JSON.stringify({ 
        error: 'AI request timed out. Please try with a smaller document.' 
      }), {
        status: 504,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}