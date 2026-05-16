/**
 * Nvidia NIM API Proxy for Vercel
 * Handles CORS by routing through Vercel serverless function
 */

export const runtime = 'edge';

export default async function handler(req: Request) {
  console.log('[Nvidia API] Request received');
  
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { messages, model, temperature, max_tokens } = body;

    console.log('[Nvidia API] Model:', model || 'default');
    console.log('[Nvidia API] Messages count:', messages?.length);

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      console.error('[Nvidia API] No API key configured');
      return new Response(JSON.stringify({ error: 'Nvidia API key not configured on server' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('[Nvidia API] Calling Nvidia...');
    
    const nvidiaResponse = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'nvidia/llama-3.1-nemotron-nano-8b-v1',
        messages,
        temperature: temperature || 0.6,
        max_tokens: max_tokens || 4096,
        top_p: 0.95,
        stream: false
      })
    });

    console.log('[Nvidia API] Nvidia response status:', nvidiaResponse.status);

    if (!nvidiaResponse.ok) {
      const errorText = await nvidiaResponse.text();
      console.error('[Nvidia API] Nvidia error:', errorText);
      return new Response(JSON.stringify({ error: `Nvidia API error: ${nvidiaResponse.status}`, details: errorText }), {
        status: nvidiaResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await nvidiaResponse.json();
    console.log('[Nvidia API] Success, sending response');
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[Nvidia API Proxy] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}