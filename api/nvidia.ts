/**
 * Vercel Serverless API - Nvidia NIM Proxy
 * Proxies AI requests to Nvidia NIM with timeout handling.
 *
 * Abuse hardening:
 * - Browser calls are restricted to our own site origins (server-to-server
 *   calls without an Origin header still work, e.g. the blog auto-poster CI).
 * - Payload size and output tokens are capped.
 * - Upstream error details stay in server logs instead of leaking to clients.
 *
 * Reliability:
 * - NVIDIA's free tier is intermittently slow and retires models (HTTP 410).
 *   We try each candidate model in order and move to the next on timeout,
 *   overload (429/5xx), retired (410), unknown (404) or not-enabled (403).
 *   Set NVIDIA_MODEL in Vercel env to pin a specific model (e.g. DeepSeek).
 */

export const config = {
  runtime: 'edge',
};

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

// Order matters: first model is tried first. gpt-oss-20b is the most
// reliable on NVIDIA's free tier (DeepSeek/Llama models frequently time out).
const DEFAULT_MODELS = [
  'openai/gpt-oss-20b',
  'meta/llama-3.3-70b-instruct',
];

// Per-model budget. Two models x 12s keeps us under Vercel's ~30s edge limit.
const MODEL_TIMEOUT_MS = 12000;

const RETRYABLE_STATUS = [403, 404, 410, 429, 500, 502, 503, 504];

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
const MAX_OUTPUT_TOKENS = 4096; // auto-poster writes 950-1200 word articles

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

    const requestedTokens = Number(body.max_tokens);
    const maxTokens = Math.min(
      Number.isFinite(requestedTokens) && requestedTokens > 0 ? requestedTokens : 1024,
      MAX_OUTPUT_TOKENS
    );

    // Try each candidate model until one responds (see DEFAULT_MODELS).
    const candidates = [process.env.NVIDIA_MODEL, ...DEFAULT_MODELS].filter(
      (m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i
    );

    let response: Response | null = null;
    for (const model of candidates) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);
      try {
        const upstream = await fetch(NVIDIA_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...body, model, max_tokens: maxTokens }),
          signal: controller.signal,
        });
        console.log('[Nvidia API] model', model, '-> status', upstream.status);
        if (upstream.ok || !RETRYABLE_STATUS.includes(upstream.status)) {
          response = upstream;
          break;
        }
      } catch (error) {
        // Timeout or network error on this model -> try the next one.
        console.log('[Nvidia API] model', model, '->', error instanceof Error ? error.name : 'error');
      } finally {
        clearTimeout(timeoutId);
      }
    }

    if (!response) {
      console.error('[Nvidia API] All candidate models unavailable');
      return jsonResponse({ error: 'AI service temporarily unavailable' }, 502);
    }

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
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}
