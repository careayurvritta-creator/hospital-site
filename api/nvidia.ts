/**
 * Vercel Serverless API - AI Proxy (DeepSeek or Nvidia NIM)
 *
 * Provider selection (automatic, no code change needed):
 * - If DEEPSEEK_API_KEY is set in Vercel env -> uses DeepSeek's own API
 *   (api.deepseek.com, model "deepseek-chat") - fast, cheap and reliable.
 * - Otherwise falls back to Nvidia NIM (integrate.api.nvidia.com).
 *
 * Abuse hardening:
 * - Browser calls are restricted to our own site origins (server-to-server
 *   calls without an Origin header still work, e.g. the blog auto-poster CI).
 * - Payload size and output tokens are capped.
 * - Upstream error details stay in server logs instead of leaking to clients.
 *
 * Reliability (NVIDIA fallback):
 * - NVIDIA's free tier is intermittently slow and retires models (HTTP 410).
 *   We try each candidate model in order and move to the next on timeout,
 *   overload (429/5xx), retired (410), unknown (404) or not-enabled (403).
 */

export const config = {
  runtime: 'nodejs',
};

// Sentry server-side initialization (Phase 10: API proxy errors → errorTracker)
// VITE_SENTRY_DSN is stripped by Vite from server-side code, so we read SENTRY_DSN.
let sentryInitialized = false;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Sentry = require('@sentry/node');
  const dsn = process.env.SENTRY_DSN;
  if (dsn && dsn !== 'YOUR_SENTRY_DSN') {
    Sentry.init({
      dsn,
      tracesSampleRate: 1.0,
    });
    sentryInitialized = true;
    console.log('[AI Proxy] Sentry initialized');
  }
} catch {
  // @sentry/node not available — continue without Sentry
}

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

// Nvidia fallback order — small/fast models verified active on this key:
// nemotron-3.5-bolt-e4b responds in ~1-2s; minimax-m3.1-flash is the backup.
const DEFAULT_NVIDIA_MODELS = [
  'nvidia/nemotron-3.5-bolt-e4b',
  'minimaxai/minimax-m3.1-flash',
];

// Per-model budget. Keeps us under Vercel's ~30s edge limit across models.
const MODEL_TIMEOUT_MS = 12000;

const RETRYABLE_STATUS = [403, 404, 410, 429, 500, 502, 503, 504];

const ALLOWED_ORIGIN_HOSTS = [
  'ayurvrittaayurveda.in',
  'www.ayurvrittaayurveda.in',
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
    if (sentryInitialized) {
      try {
        const Sentry = require('@sentry/node');
        Sentry.captureMessage('[AI Proxy] Method not allowed (405)', 'warning');
      } catch { /* silent */ }
    }
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  if (!isAllowedOrigin(request.headers.get('origin'))) {
    if (sentryInitialized) {
      try {
        const Sentry = require('@sentry/node');
        Sentry.captureMessage('[AI Proxy] Origin not allowed (403)', 'warning');
      } catch { /* silent */ }
    }
    return jsonResponse({ error: 'Origin not allowed' }, 403);
  }

  try {
    // Provider selection
    const useDeepseek = Boolean(process.env.DEEPSEEK_API_KEY);
    const apiKey = useDeepseek ? process.env.DEEPSEEK_API_KEY : process.env.NVIDIA_API_KEY;

    if (!apiKey) {
      if (sentryInitialized) {
        try {
          const Sentry = require('@sentry/node');
          Sentry.captureMessage(
            useDeepseek ? 'DeepSeek API key not configured' : 'Nvidia API key not configured',
            'fatal'
          );
        } catch { /* silent */ }
      }
      return jsonResponse({
        error: useDeepseek ? 'DeepSeek API key not configured' : 'Nvidia API key not configured'
      }, 500);
    }

    const apiUrl = useDeepseek ? DEEPSEEK_API_URL : NVIDIA_API_URL;

    const body = await request.json();

    // Payload caps so the proxy cannot be used for oversized/costly jobs.
    const messages = body?.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
      if (sentryInitialized) {
        try {
          const Sentry = require('@sentry/node');
          Sentry.captureMessage('[AI Proxy] Missing messages array (400)', 'warning');
        } catch { /* silent */ }
      }
      return jsonResponse({ error: 'messages array is required' }, 400);
    }
    if (messages.length > MAX_MESSAGES) {
      if (sentryInitialized) {
        try {
          const Sentry = require('@sentry/node');
          Sentry.captureMessage(`[AI Proxy] Too many messages: ${messages.length} > ${MAX_MESSAGES} (413)`, 'warning');
        } catch { /* silent */ }
      }
      return jsonResponse({ error: `Too many messages (max ${MAX_MESSAGES})` }, 413);
    }
    let totalChars = 0;
    for (const message of messages) {
      const content = typeof message?.content === 'string' ? message.content : '';
      if (content.length > MAX_MESSAGE_CHARS) {
        if (sentryInitialized) {
          try {
            const Sentry = require('@sentry/node');
            Sentry.captureMessage(`[AI Proxy] Message too large: ${content.length} > ${MAX_MESSAGE_CHARS} (413)`, 'warning');
          } catch { /* silent */ }
        }
        return jsonResponse({ error: 'Message too large' }, 413);
      }
      totalChars += content.length;
    }
    if (totalChars > MAX_TOTAL_CHARS) {
      if (sentryInitialized) {
        try {
          const Sentry = require('@sentry/node');
          Sentry.captureMessage(`[AI Proxy] Request too large: ${totalChars} > ${MAX_TOTAL_CHARS} (413)`, 'warning');
        } catch { /* silent */ }
      }
      return jsonResponse({ error: 'Request too large' }, 413);
    }

    const requestedTokens = Number(body.max_tokens);
    const maxTokens = Math.min(
      Number.isFinite(requestedTokens) && requestedTokens > 0 ? requestedTokens : 1024,
      MAX_OUTPUT_TOKENS
    );

    const candidates = (useDeepseek
      ? [process.env.DEEPSEEK_MODEL || 'deepseek-chat']
      : [process.env.NVIDIA_MODEL, ...DEFAULT_NVIDIA_MODELS]
    ).filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

    let response: Response | null = null;
    for (const model of candidates) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);
      try {
        const upstream = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...body, model, max_tokens: maxTokens }),
          signal: controller.signal,
        });
        console.log('[AI Proxy]', useDeepseek ? 'deepseek' : 'nvidia', model, '-> status', upstream.status);
        if (upstream.ok || !RETRYABLE_STATUS.includes(upstream.status)) {
          response = upstream;
          break;
        }
      } catch (error) {
        console.log('[AI Proxy]', model, '->', error instanceof Error ? error.name : 'error');
      } finally {
        clearTimeout(timeoutId);
      }
    }

    if (!response) {
      console.error('[AI Proxy] All candidate models unavailable');
      if (sentryInitialized) {
        try {
          const Sentry = require('@sentry/node');
          Sentry.captureMessage('[AI Proxy] All candidate models unavailable (502)', 'error');
        } catch { /* silent */ }
      }
      return jsonResponse({ error: 'AI service temporarily unavailable' }, 502);
    }

    console.log('[AI Proxy] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI Proxy] Upstream error:', response.status, errorText);
      if (sentryInitialized) {
        try {
          const Sentry = require('@sentry/node');
          Sentry.captureException(new Error(`[AI Proxy] Upstream error ${response.status}: ${errorText.slice(0, 200)}`), {
            tags: { status: String(response.status) },
            extra: { bodyLength: errorText.length },
          });
        } catch { /* silent */ }
      }
      // Do not forward upstream error details to clients.
      return jsonResponse({ error: `AI API error (${response.status})` }, response.status);
    }

    const data = await response.json();
    console.log('[AI Proxy] Success');
    return jsonResponse(data, 200);
  } catch (error) {
    console.error('[AI Proxy] Error:', error);
    if (sentryInitialized) {
      try {
        const Sentry = require('@sentry/node');
        Sentry.captureException(error);
      } catch { /* silent */ }
    }
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}
