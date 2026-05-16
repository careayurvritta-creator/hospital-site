/**
 * Vercel Serverless API - Nvidia NIM Proxy
 * Proxies AI requests to Nvidia NIM to avoid CORS issues
 */

export const config = {
  runtime: 'edge',
};

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

export default async function handler(request: Request) {
  console.log('[Nvidia API] Request received');
  
  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Try both env var names for compatibility
    const apiKey = process.env.NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY;
    
    console.log('[Nvidia API] API key present:', !!apiKey);
    
    if (!apiKey) {
      console.error('[Nvidia API] No API key found');
      return new Response(JSON.stringify({ error: 'Nvidia API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the request body
    const body = await request.json();
    console.log('[Nvidia API] Body received, model:', body.model);

    // Forward the request to Nvidia NIM
    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('[Nvidia API] Nvidia response:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Nvidia API] Nvidia error:', errorText);
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
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}