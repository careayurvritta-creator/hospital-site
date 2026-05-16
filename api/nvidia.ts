/**
 * Vercel Serverless API - Nvidia NIM Proxy
 * Proxies AI requests to Nvidia NIM to avoid CORS issues
 */

export const config = {
  runtime: 'edge',
};

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

const MODELS = [
  'meta/llama-3.1-70b-instruct',
  'meta/llama-3.3-70b-instruct',
  'meta/llama-3.1-8b-instruct',
  'meta/llama3-70b-instruct',
];

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
    console.log('[Nvidia API] Body received, model:', body.model);

    let lastError = null;
    
    for (const model of MODELS) {
      try {
        console.log('[Nvidia API] Trying model:', model);
        const response = await fetch(NVIDIA_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...body, model }),
        });

        console.log('[Nvidia API] Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('[Nvidia API] Success with model:', model);
          return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
        
        const errorText = await response.text();
        console.log('[Nvidia API] Model failed:', model, response.status, errorText);
        lastError = { status: response.status, text: errorText };
      } catch (err) {
        console.log('[Nvidia API] Model exception:', model, err);
        lastError = err;
      }
    }

    console.error('[Nvidia API] All models failed:', lastError);
    return new Response(JSON.stringify({ 
      error: `Nvidia API error: all models failed`, 
      details: lastError 
    }), {
      status: lastError?.status || 500,
      headers: { 'Content-Type': 'application/json' },
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
