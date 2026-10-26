/**
 * Vercel Serverless API - Nvidia NIM Proxy
 * Proxies AI requests to Nvidia NIM with timeout handling.
 *
 * Abuse hardening:
 * - Browser calls are restricted to our own site origins (server-to-server
 *   calls without an Origin header still work, e.g. the blog auto-poster CI).
 * - Payload size and output tokens are capped.
 * - Upstream error details stay in server logs instead of leaking to clients.
 */

export const config = {
  runtime: 'edge',
};

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

const ALLOWED_ORIGIN_HOSTS = [
  'ayurvritta.com',
  'www.ayurvritta.com',
  'ayurvrittaayurveda.in',
  'www.ayurvrittaayurveda.in',
  'localhost',
  '127.0.0.1',
];

const MAX_MESSAGES = 40;
const MAX_MESSAGE_CHARS = 12000;
const MAX_TOTAL_CHARS = 40000;
const MAX_OUTPUT_TOKENS = 2048;

function isAllowedOrigin(origin: string | null): boolean {
  // No Origin header = non-browser client (e.g. GitHub Actions auto-poster).
  if (!origin) return true;
  try {
    const host = new URL(origin).hostname;
    if (ALLOWED_ORIGIN_HOSTS.includes(host)) return true;
    // Vercel sets VERCEL_URL for the current deployment (previews included).
    const deploymentHost = process.env.VERCEL_URL;
    return Boolean(deploymentHost && host === deploymentHost);
  } catch {
    return false;
  }
}

function jsonResponse(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!isAllowedOrigin(request.headers.get('origin'))) {
    return jsonResponse({ error: 'Origin not allowed' }, 403);
  }

  try {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      console.error('[Nvidia API] No API key found');
      return jsonResponse({ error: 'Nvidia API key not configured' }, 500);
    }

    const body = await request.json();

    // Payload caps so the proxy cannot be used for oversized/costly jobs.
    const messages = body?.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      return jsonResponse({ error: 'messages array is required' }, 400);
    }
    if (messages.length > MAX_MESSAGES) {
      return jsonResponse({ error: `Too many messages (max ${MAX_MESSAGES})` }, 413);
    }
    let totalChars = 0;
    for (const message of messages) {
      const content = typeof message?.content === 'string' ? message.content : '';
      if (content.length > MAX_MESSAGE_CHARS) {
        return jsonResponse({ error: 'Message too large' }, 413);
      }
      totalChars += content.length;
    }
    if (totalChars > MAX_TOTAL_CHARS) {
      return jsonResponse({ error: 'Request too large' }, 413);
    }

    // Use a single, fast model - no fallback loop
    const model = 'meta/llama-3.1-8b-instruct';
    const requestedTokens = Number(body.max_tokens);
    const maxTokens = Math.min(
      Number.isFinite(requestedTokens) && requestedTokens > 0 ? requestedTokens : 1024,
      MAX_OUTPUT_TOKENS
    );

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('[Nvidia API] Request timeout');
      controller.abort();
    }, 25000); // 25 second timeout (Vercel pro tier limit is 30s)

    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...body, model, max_tokens: maxTokens }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log('[Nvidia API] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Nvidia API] Nvidia error:', response.status, errorText);
      // Do not forward upstream error details to clients.
      return jsonResponse({ error: `Nvidia API error (${response.status})` }, response.status);
    }

    const data = await response.json();
    console.log('[Nvidia API] Success');
    return jsonResponse(data, 200);
  } catch (error) {
    console.error('[Nvidia Proxy] Error:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return jsonResponse({
        error: 'AI request timed out. Please try with a smaller document.'
      }, 504);
    }

    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}
