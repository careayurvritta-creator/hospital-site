# Design Document 22: API Layer Architecture

## Overview
The API layer provides serverless endpoints for AI inference proxying and health checks, deployed as Vercel Edge Functions for low latency and global distribution. Client-side AI integration routes exclusively through the `/api/nvidia` proxy — no direct upstream calls from the browser.

---

## 1. Architecture Summary

| Aspect | Detail |
|--------|--------|
| **Runtime** | Vercel Edge Runtime (`runtime: 'edge'`) |
| **Deployment** | Vercel Edge Functions (auto-scaled) |
| **Protocols** | HTTP/REST (POST for AI, GET for health) |
| **Authentication** | API keys in Vercel Environment Variables (server-only) |
| **CORS** | Origin allowlist (production domain + localhost + Vercel preview URLs) |
| **Rate Limiting** | Payload caps + model-level timeouts (request budgets, not traditional rate limiting) |

---

## 2. Endpoints

### 2.1 AI Inference Proxy — `/api/nvidia.ts`

**Purpose**: Secure proxy to upstream LLM providers (DeepSeek or Nvidia NIM), preventing API key exposure to clients.

#### Request
```typescript
POST /api/nvidia
Content-Type: application/json
Origin: https://ayurvrittaayurveda.in (validated)

{
  "messages": [
    { "role": "system", "content": "You are an Ayurveda assistant..." },
    { "role": "user", "content": "What is my prakriti?" }
  ],
  "max_tokens": 1024,      // optional, capped at 4096
  "temperature": 0.7,      // optional
  "stream": false          // optional (ignored; streaming not implemented)
}
```

#### Response (Success)
```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1699999999,
  "model": "nvidia/nemotron-3.5-bolt-e4b",
  "choices": [{
    "index": 0,
    "message": { "role": "assistant", "content": "Your prakriti is..." },
    "finish_reason": "stop"
  }],
  "usage": { "prompt_tokens": 150, "completion_tokens": 200, "total_tokens": 350 }
}
```

#### Response (Error)
```json
{ "error": "AI service temporarily unavailable" }  // 502
{ "error": "Origin not allowed" }                   // 403
{ "error": "messages array is required" }           // 400
{ "error": "Request too large" }                    // 413
{ "error": "Internal server error" }                // 500
```

#### Provider Selection Logic
```typescript
const useDeepseek = Boolean(process.env.DEEPSEEK_API_KEY);
const apiKey = useDeepseek ? process.env.DEEPSEEK_API_KEY : process.env.NVIDIA_API_KEY;
const apiUrl = useDeepseek ? DEEPSEEK_API_URL : NVIDIA_API_URL;
const candidates = useDeepseek
  ? [process.env.DEEPSEEK_MODEL || 'deepseek-chat']
  : [process.env.NVIDIA_MODEL, ...DEFAULT_NVIDIA_MODELS]
    .filter((m, i, arr) => Boolean(m) && arr.indexOf(m) === i); // deduplicate
```

**Priority**: DeepSeek (if key present) → Nvidia NIM fallback chain.

#### Fallback Chain (Nvidia)
1. `nvidia/nemotron-3.5-bolt-e4b` (primary — ~1-2s response)
2. `minimaxai/minimax-m3.1-flash` (backup)

Each model tried with 12s timeout. Retryable statuses: `403, 404, 410, 429, 500, 502, 503, 504`.

#### Security Hardening
| Mechanism | Implementation |
|-----------|----------------|
| **Origin Validation** | Allowlist: `ayurvrittaayurveda.in`, `www.ayurvrittaayurveda.in` (duplicates in source), `localhost`, `127.0.0.1`, plus `VERCEL_URL` for previews |
| **Payload Caps** | `MAX_MESSAGES=40`, `MAX_MESSAGE_CHARS=12000`, `MAX_TOTAL_CHARS=40000`, `MAX_OUTPUT_TOKENS=4096` |
| **No Key Leakage** | Upstream errors logged server-side only; client receives generic messages |
| **Method Restriction** | Only `POST` allowed; `405` for others |

---

### 2.2 Health Check — `/api/health.ts`

**Purpose**: Infrastructure monitoring, load balancer probes, deployment verification.

#### Request
```bash
GET /api/health
```

#### Response
```json
{
  "status": "ok",
  "message": "API is working",
  "timestamp": "2026-11-13T10:30:00.000Z"
}
```

**Status Code**: `200 OK` always (unless platform failure).

---

## 3. Client Integration

### 3.1 Frontend AI Service (`lib/aiService.ts`)

**Entry Point**: `getAIService()` returns singleton `AIService` instance.

**Public API Surface**:
```typescript
class AIService {
  // Initialization (lazy, auto-called on first use)
  init(config?: AIServiceConfig): void
  private ensureInitialized(): void
  
  // Core generation methods
  async generate(prompt: string, systemInstruction?: string, options?: AIRequestOptions): Promise<string>
  async chat(session: any, message: string): Promise<string>
  async createChatSession(systemInstruction: string): Promise<any>
  async generateStructured<T>(prompt: string, systemInstruction: string, schema: object, options?: AIRequestOptions): Promise<T>
  
  // Specialized operations
  async generateImage(prompt: string): Promise<{ base64: string; mimeType: string } | null> // ALWAYS throws — not supported by Nvidia NIM free tier
  async analyzeDocument(extractedText: string, mimeType: string, prompt: string): Promise<string>
  async locationSearch(query: string, lat: number, lng: number, systemInstruction: string): Promise<{ text: string; mapLinks: Array<{ web?: { uri: string; title: string } }> }>
  
  // Status & Debug
  isAvailable(): boolean
  getStatus(): { nvidia: boolean; error: string | null }
  debug(): void
}

export const aiService = getAIService();
export default aiService;
```

**Initialization Contract**:
- Lazy-initialized on first method call via `ensureInitialized()`
- `initialized` flag prevents double-initialization
- `initializing` flag prevents concurrent init attempts
- `initError` captures any initialization failure for subsequent calls
- Creates `NvidiaClient('proxy')` which routes through `/api/nvidia` Vercel proxy
- **No client-side API key required** — proxy handles auth server-side using `NVIDIA_API_KEY` from Vercel env

**Flow**:
1. Client → `aiService.generate()` / `chat()` / etc. → `NvidiaClient('proxy')` → `fetch('/api/nvidia', ...)`
2. Vercel Edge Function → Provider (DeepSeek/Nvidia) with server-side API key
3. Response → Client

**⚠️ No Fallback Path Exists**: The document previously claimed a "local fallback to `nvidiaClient.ts` (direct Nvidia call with client-side key — deprecated path, security risk)." **This is fictional.** There is NO direct client-to-upstream path. All traffic routes through `/api/nvidia` proxy. The `NvidiaClient` constructor accepts `'proxy'` as apiKey to indicate proxy mode.

---

### 3.2 Direct Nvidia Client (`lib/nvidiaClient.ts`)

**Status**: Internal implementation detail. Used by `AIService` in `'proxy'` mode. Can also be instantiated directly with an API key for server-side/Node usage (not used in this codebase).

```typescript
export class NvidiaClient {
  constructor(apiKey: string, model: NvidiaModelType = 'nano')
  setModel(model: NvidiaModelType): void
  async chat(messages: ChatMessage[], options?: NvidiaRequestOptions): Promise<string>
  async generate(prompt: string, systemInstruction?: string, options?: NvidiaRequestOptions): Promise<string>
  async generateStructured<T>(prompt: string, systemInstruction: string, schema: object, options?: NvidiaRequestOptions): Promise<T>
}
```

**Retry Logic** (inside `chat()`):
- `maxRetries = 2` (3 attempts total)
- `baseDelayMs = 1500` (exponential: 1.5s, 3s)
- Retries on: `429, 500, 502, 503, 504` (network timeout aborts throw immediately)
- 30s fetch timeout via `AbortController`

**Models** (client-side defaults, overridden by server proxy):
```typescript
const DEFAULT_MODELS = {
  nano: 'nvidia/llama-3.1-nemotron-nano-8b-v1',
  instruct: 'openai/gpt-oss-20b',
  reasoning: 'deepseek-ai/deepseek-r1',
} as const;
```

**Note**: Server-side proxy (`/api/nvidia`) uses DIFFERENT models: `nvidia/nemotron-3.5-bolt-e4b` and `minimaxai/minimax-m3.1-flash`. Client-side models are only used if `NvidiaClient` is instantiated directly with an API key (not the current architecture).

---

## 4. Configuration (Vercel Environment Variables)

| Variable | Required | Scope | Description |
|----------|----------|-------|-------------|
| `DEEPSEEK_API_KEY` | Optional* | Server (proxy) | DeepSeek API key (preferred provider) |
| `DEEPSEEK_MODEL` | Optional | Server (proxy) | Override model (default: `deepseek-chat`) |
| `NVIDIA_API_KEY` | Required* | Server (proxy) | Nvidia NIM API key (fallback) |
| `NVIDIA_MODEL` | Optional | Server (proxy) | Override primary Nvidia model |
| `VERCEL_URL` | Auto | Server (proxy) | Deployment hostname for preview CORS |

*Required if `DEEPSEEK_API_KEY` not set.

**Client-side**: No environment variables required. The `NvidiaClient` in `'proxy'` mode sends no Authorization header.

---

## 5. Error Handling

| Scenario | HTTP Status | Actual Client Behavior |
|----------|-------------|------------------------|
| Invalid origin | 403 | Throws `Error('Origin not allowed')` — caller must handle |
| Missing API key (server) | 500 | Throws `Error('AI service temporarily unavailable')` |
| Payload too large | 413 | Throws `Error('Request too large')` |
| All models failed | 502 | Throws `Error('AI service temporarily unavailable')` |
| Upstream 4xx/5xx (non-retryable) | Passthrough (4xx/5xx) | Throws `Error('AI API error (<status>)')` |
| Network timeout (client) | N/A | Throws `Error('AI service request timed out. Please try again.')` |
| Network timeout (server) | 502 | Falls to next model in chain; if all fail, returns 502 |

**Client Behavior Notes**: 
- `aiService.ts` has NO toast logic, NO history truncation, NO automatic retry
- Error handling is delegated to callers (React components)
- `getNvidiaErrorMessage()` helper exists for user-facing messages

---

## 6. Observability

- **Console Logs**: `[AI Proxy] deepseek/nvidia <model> -> status <code>`
- **Success**: `[AI Proxy] Success`
- **Failures**: `[AI Proxy] Upstream error: <status> <body>` (server only)
- **Client Logs**: `[AI Service] generate() using Nvidia`, `[NvidiaClient] Sending request to /api/nvidia`
- **No Sentry Integration**: API layer does not integrate with `errorTracker.ts` (client-only)

---

## 7. Scaling & Limits

| Limit | Value | Source |
|-------|-------|--------|
| Edge Function Duration | 30s | Vercel platform |
| Per-Model Timeout | 12s | `MODEL_TIMEOUT_MS` (server), 30s (client fetch) |
| Max Output Tokens | 4096 | `MAX_OUTPUT_TOKENS` |
| Max Request Size | 40KB | `MAX_TOTAL_CHARS` |
| Concurrent Executions | Auto | Vercel platform |

---

## 8. Implementation Plan (Actionable)

| Item | Priority | Target File(s) | Exact Change | Test Plan | Phase |
|------|----------|----------------|--------------|-----------|-------|
| Remove fictional fallback narrative from docs | P0 | This doc (§3.1) | Delete "Fallback" paragraph; add "No Fallback Path Exists" note | Doc review | 1 |
| Document actual `AIService` public API | P0 | This doc (§3.1) | Replace `askAI()` with actual 10 methods | Doc review | 1 |
| Fix `NvidiaClient` API documentation | P0 | This doc (§3.2) | Remove `chatWithRetry()`; document actual `chat()`, `generate()`, `generateStructured()` | Doc review | 1 |
| Correct model lists | P0 | This doc (§3.2, §2.1) | Separate server proxy models vs client defaults; remove stale models | Doc review | 1 |
| Fix network timeout status | P0 | This doc (§5) | Change 504 → 502 for server-side; document client timeout throws | Doc review | 1 |
| Mark config vars as server-only | P0 | This doc (§4) | Add "Scope" column; clarify client needs no env vars | Doc review | 1 |
| Remove "Rate Limiting" from architecture table | P1 | This doc (§1) | Replace with "Request Budgets / Abuse Hardening" | Doc review | 1 |
| Fix CORS allowlist duplicates | P1 | `api/nvidia.ts` line 40-47 | Remove duplicate `ayurvrittaayurveda.in` entries | Unit test | 2 |
| Fix `VERCEL_URL` CORS comparison | P1 | `api/nvidia.ts` line 61-62 | Compare hostname-to-hostname, not hostname-to-full-URL | Unit test | 2 |
| Document `AIService` initialization contract | P1 | This doc (§3.1) | Add lazy init, `initError`, `initialized`, `initializing` flags | Doc review | 2 |
| Document hardcoded values in `analyzeDocument`, `locationSearch`, `generateImage` | P1 | This doc (§3.1) | Note `max_tokens: 4096`, insurance system prompt, empty `mapLinks[]` | Doc review | 2 |
| Resolve streaming contradiction | P1 | `lib/aiService.ts` line 102, §8 P1 | Remove "Nvidia doesn't support streaming" comment OR implement streaming | Integration test | 3 |
| Add request/response logging to errorTracker | P2 | This doc (§8 P2), `analytics/errorTracker.ts` | Connect proxy to tracker; address PII/redaction risk | Integration test | 3 |
| Health check with dependency verification | P3 | `api/health.ts` | Add optional `?deep=1` to verify upstream reachability; document 200-always vs 503 tradeoff | Integration test | 3 |

---

## Traceability to Master Report

| Master Action | This Doc Sections |
|---------------|-------------------|
| A1: Rewrite §3.2 `nvidiaClient.ts` to match actual | §3.2 |
| A2: Remove phantom fallback narrative from §3.1 | §3.1 |
| A3: Correct §3.1 API surface to document `AIService` class methods | §3.1 |
| A4: Fix §5 "Network timeout" row: status 502, server-side retry logic | §5 |
| A5: Remove "Rate Limiting" from §1; replace with "Request Budgets" | §1 |
| A6: Fix CORS allowlist duplicates in code & doc | §2.1, §8 (Phase 2) |
| A7: Separate server vs client retry policies | §2.1, §3.2 |
| A8: Update §4 configuration table to mark vars as server-only | §4 |
| A9: Fix `VERCEL_URL` CORS logic | §8 (Phase 2) |
| A10: Document `aiService.ts` initialization contract and all public methods | §3.1 |
| A11: Rewrite §8 as true implementation plan | §8 |
| A12: Resolve streaming contradiction | §8 (Phase 3) |
| A13: Calibrate "Client Behavior" column in §5 | §5 |
| A14: Remove uncalibrated deployment/concurrency claims | §1, §7 |
| A15: Clean up filler words, redundancy | Throughout |

---

*Last updated: 2026-11-13 — Aligned with actual codebase verification*