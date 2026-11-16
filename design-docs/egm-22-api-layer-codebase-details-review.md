# Design Doc 22 — API Layer Architecture: Codebase Details Review

**Review Date**: 2026-11-13  
**Reviewer**: EGM Codebase Details Reviewer (subagent)  
**Doc Under Review**: `design-docs/egm-22-api-layer.md` (304 lines, last updated 2026-11-13)  
**Codebase Path**: `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site`  

---

## Executive Summary

This review verifies **Design Document 22: API Layer Architecture** against the actual implementation in the `hospital-site` codebase. The doc describes two Vercel Edge Functions (`/api/nvidia.ts` for AI inference proxy, `/api/health.ts` for health checks), the client-side `AIService` abstraction in `lib/aiService.ts`, and the internal `NvidiaClient` in `lib/nvidiaClient.ts`.

**Overall Accuracy Rating: 7.5 / 10**

The document is **largely accurate** on architecture, provider selection, payload caps, CORS allowlist structure, environment variables, observability log strings, and the critical "No Fallback Path Exists" claim. However, the **§5 "Actual Client Behavior" column is systematically incorrect in 5 of 7 rows** — a high-severity discrepancy for any consumer of this doc. Additional findings include a stale implementation-plan item, a security-relevant omission (no-Origin bypass), missing coverage of `textExtractor.ts` and the Vite dev-proxy gap, and several smaller inaccuracies around 413 error variants, streaming handling, and the health endpoint runtime.

---

## Accuracy Rating Breakdown

| Dimension | Score | Notes |
|-----------|-------|-------|
| Architecture & Endpoints (§1–§2) | 9/10 | Edge runtime, provider selection, caps, CORS, env vars all verified |
| Client Integration (§3) | 7/10 | AIService surface correct; "NO history truncation" claim is **false** (§3.1 bullet) |
| Configuration (§4) | 9/10 | All vars match; scope column accurate |
| Error Handling (§5) | 4/10 | **Major issue**: 5/7 "Actual Client Behavior" rows wrong |
| Observability (§6) | 9/10 | Log strings match code exactly |
| Scaling & Limits (§7) | 7/10 | "40KB" is char-count approximation; health lacks edge runtime |
| Implementation Plan (§8) | 6/10 | One item (VERCEL_URL fix) is **stale/already done**; omits textExtractor/vite gaps |

---

## Findings Table

| Severity | ID | Section | Finding | File:Line Evidence |
|----------|----|---------|---------|---------------------|
| **Warning** | W1 | §5 | "Actual Client Behavior" column wrong in **5 of 7 rows** — client throws `Nvidia API Error (<status>): <body>` not plain `Error('...')` | `lib/nvidiaClient.ts:110,115` |
| **Warning** | W2 | §3.1 | Claims "NO history truncation" but `chat()` does `history.slice(-10)` | `lib/aiService.ts:127` |
| **Warning** | W3 | §8 (Phase 2) | Item "Fix VERCEL_URL CORS comparison (line 61-62)" is **stale** — code already compares hostname-to-hostname correctly | `api/nvidia.ts:62` |
| **Warning** | W4 | §2.1 | Omits **no-Origin bypass**: requests without `Origin` header skip validation entirely (`if (!origin) return true;`) — CI auto-poster path, security-relevant | `api/nvidia.ts:56` |
| **Suggestion** | S1 | §2.2 | `health.ts` lacks `export const runtime = 'edge'` — doc §1 claims both endpoints are Edge | `api/health.ts` (no runtime export) |
| **Suggestion** | S2 | §2.1 | Doc lists only `'Request too large'` for 413; code also returns `'Message too large'` (line 111) and `'Too many messages (max 40)'` (line 105) | `api/nvidia.ts:105,111` |
| **Suggestion** | S3 | §2.1 | Claims `stream` is "ignored; streaming not implemented" — but `stream` is **forwarded** to upstream via body spread | `api/nvidia.ts:141` |
| **Suggestion** | S4 | §7 | "Max Request Size: 40KB" cites `MAX_TOTAL_CHARS=40000` — chars ≠ bytes for non-ASCII; approximation only | `api/nvidia.ts:52` |
| **Suggestion** | S5 | §2.2 | Health handler ignores HTTP method — **any method returns 200** (no 405) | `api/health.ts` (no method check) |
| **Suggestion** | S6 | — | **Missing coverage**: `lib/textExtractor.ts` client-side PDF/OCR pipeline (pdf.js + Tesseract from CDN, 5-page cap) undocumented | `lib/textExtractor.ts:44` |
| **Suggestion** | S7 | — | **Missing coverage**: Vite dev server has **no `/api` proxy** — `vite.config.ts` port 3000, requires `vercel dev` for API routes locally | `vite.config.ts` (no server.proxy for /api) |
| **Suggestion** | S8 | §3.2 | `createNvidiaClient` factory and `getNvidiaErrorMessage` helper (maps 429/401/500/503) undocumented | `lib/nvidiaClient.ts:163,167-181` |
| **Suggestion** | S9 | §3.2 | Client defaults undocumented: `temperature: 0.7`, `max_tokens: 2048`, `top_p: 0.9`, `stream: false` | `lib/nvidiaClient.ts:82-85` |

---

## Detailed Findings

### W1 — §5 "Actual Client Behavior" Column Systematically Wrong (High Severity)
The doc's §5 table claims the client throws simple `Error('message')` strings. **Actual behavior** (`lib/nvidiaClient.ts:110,115`): all error throws use the format  
```typescript
throw new Error(`Nvidia API Error (${res.status}): ${JSON.stringify(errorData)}`);
```
**Row-by-row comparison:**

| Scenario | Doc Claims | Actual Code (`nvidiaClient.ts`) |
|----------|------------|----------------------------------|
| Invalid origin (403) | `Error('Origin not allowed')` | `Nvidia API Error (403): {"error":"Origin not allowed"}` |
| Missing API key (500) | `Error('AI service temporarily unavailable')` | Returns `{error:'Nvidia/DeepSeek API key not configured'}` from proxy (`api/nvidia.ts:90-93`), client wraps as `Nvidia API Error (500): ...` |
| Payload too large (413) | `Error('Request too large')` | `Nvidia API Error (413): {"error":"Request too large"}` (or "Message too large" / "Too many messages") |
| All models failed (502) | `Error('AI service temporarily unavailable')` | `Nvidia API Error (502): {"error":"All models failed"}` |
| Upstream 4xx/5xx non-retryable | `Error('AI API error (<status>)')` | `Nvidia API Error (<status>): <body>` ✓ **closest match** |
| Network timeout (client) | `Error('AI service request timed out. Please try again.')` | **Exact match** (`nvidiaClient.ts:95`) ✓ |
| Network timeout (server) | Falls to next model; 502 if all fail | Verified accurate (server logic `api/nvidia.ts:145-160`) |

**Impact**: Any frontend error-handling code written against this doc's §5 will mismatch actual thrown messages.

### W2 — "NO History Truncation" Claim is False
§3.1 bullet states: *"aiService.ts has NO toast logic, NO history truncation, NO automatic retry"*.  
**Actual**: `lib/aiService.ts:127` in `chat()`:
```typescript
const recentHistory = history.slice(-10); // keep last 10 messages
```
This **is** history truncation (last 10 messages). The doc contradicts the code.

### W3 — Stale Implementation Plan Item (VERCEL_URL Fix)
§8 Phase 2 item: *"Fix VERCEL_URL CORS comparison (line 61-62) — Compare hostname-to-hostname, not hostname-to-full-URL"*.  
**Actual**: `api/nvidia.ts:62` already does hostname-to-hostname:
```typescript
const vercelHost = process.env.VERCEL_URL?.replace(/^https?:\/\//, '').split('/')[0];
if (originHost === vercelHost) return true;
```
`VERCEL_URL` on Vercel is a bare hostname (e.g., `ayurvritta-git-main-user.vercel.app`), not a full URL. The fix is **already implemented**; the plan item is stale.

### W4 — No-Origin Bypass Omitted (Security-Relevant)
`api/nvidia.ts:56`:
```typescript
if (!origin) return true; // allow requests without Origin (e.g., curl, CI auto-poster)
```
Requests **without an `Origin` header skip the entire allowlist**. This is intentional for CI automation but is a **security-relevant behavior not documented** in §2.1 Security Hardening table or §5 error scenarios.

### S1 — Health Endpoint Not Edge Runtime
§1 Architecture table claims both endpoints use `runtime: 'edge'`.  
**Actual**: `api/health.ts` has **no `export const runtime = 'edge'`** — it runs as a standard Node.js function (14 lines, simple 200 response). Only `api/nvidia.ts:21-23` has the edge runtime export.

### S2 — Additional 413 Error Variants Undocumented
Doc §2.1 Response (Error) lists only `{ "error": "Request too large" }` for 413.  
**Actual** (`api/nvidia.ts`):
- Line 105: `'Too many messages (max 40)'` — 413 when `messages.length > MAX_MESSAGES`
- Line 111: `'Message too large'` — 413 when any single `message.content.length > MAX_MESSAGE_CHARS`
- Line 115: `'Request too large'` — 413 when `totalChars > MAX_TOTAL_CHARS`

Three distinct 413 messages exist; doc shows one.

### S3 — `stream` Parameter Forwarded, Not Ignored
Doc §2.1 Request example comment: `"stream": false // optional (ignored; streaming not implemented)`.  
**Actual**: `api/nvidia.ts:141` spreads the entire body to upstream:
```typescript
const upstreamRes = await fetch(apiUrl, {
  ...,
  body: JSON.stringify({ ...body, model: currentModel, stream: body.stream })
});
```
The `stream` value is **forwarded to the provider**. Whether the provider honors it is upstream-dependent, but the proxy does not ignore it.

### S4 — "40KB" is Character Approximation
§7 table: "Max Request Size: 40KB — `MAX_TOTAL_CHARS`".  
**Actual**: `MAX_TOTAL_CHARS = 40000` (characters, `api/nvidia.ts:52`). For non-ASCII (e.g., Devanagari, emoji), UTF-8 bytes > chars. "40KB" is an approximation; doc should clarify "≈40K characters".

### S5 — Health Endpoint Accepts Any HTTP Method
`api/health.ts` has **no method check** — `GET`, `POST`, `PUT`, `DELETE` all return `200 OK` with the same JSON. Doc §2.2 implies GET-only ("Request: `GET /api/health`").

### S6 — Missing `textExtractor.ts` Coverage
`lib/textExtractor.ts` implements a **client-side PDF text extraction + OCR pipeline**:
- Loads `pdfjs-dist` and `tesseract.js` from CDN (`textExtractor.ts:12-18`)
- `extractTextFromPDF(file, maxPages=5)` — **5-page cap** (`textExtractor.ts:44`)
- `extractTextWithOCR(imageFile, lang='eng')`
- Used by components for document analysis before sending to `aiService.analyzeDocument()`
**Completely absent from the design doc**.

### S7 — Vite Dev Server Lacks `/api` Proxy
`vite.config.ts` runs on port 3000 with **no `server.proxy` for `/api`**. Local development **requires `vercel dev`** to access API routes. This is a **dev-environment gap** not mentioned in the doc.

### S8 — Undocumented Factory & Error Mapper
`lib/nvidiaClient.ts` exports:
- `createNvidiaClient(apiKey?, model?)` factory at line 163
- `getNvidiaErrorMessage(status)` at lines 167-181 mapping 429→rate limit, 401→auth, 500/503→server errors
Neither appears in the doc.

### S9 — Client Defaults Undocumented
`NvidiaClient` constructor defaults (`nvidiaClient.ts:82-85`):
```typescript
temperature: 0.7,
max_tokens: 2048,
top_p: 0.9,
stream: false
```
Doc §3.2 shows no defaults; §2.1 shows `max_tokens: 1024` as example but that's the **proxy default** (line 119), not the client default.

---

## Reality-vs-Claims Table

| Doc Section | Claim | Reality | Status |
|-------------|-------|---------|--------|
| §1 Architecture | Both endpoints use `runtime: 'edge'` | Only `/api/nvidia.ts` has edge runtime; `/api/health.ts` is Node | ❌ Partial |
| §1 Architecture | "Rate Limiting" via payload caps | Accurate — request budgets, not token-bucket rate limiting | ✅ |
| §2.1 Provider Selection | DeepSeek priority → Nvidia fallback chain | Verbatim match `api/nvidia.ts:86-95` | ✅ |
| §2.1 Fallback Chain | `nvidia/nemotron-3.5-bolt-e4b` → `minimaxai/minimax-m3.1-flash` | Matches `DEFAULT_NVIDIA_MODELS` lines 30-33 | ✅ |
| §2.1 Timeout | 12s per model (`MODEL_TIMEOUT_MS`) | Line 36: `12000` | ✅ |
| §2.1 Retryable Statuses | `403,404,410,429,500,502,503,504` | Line 38 exact match | ✅ |
| §2.1 Payload Caps | `MAX_MESSAGES=40`, `MAX_MESSAGE_CHARS=12000`, `MAX_TOTAL_CHARS=40000`, `MAX_OUTPUT_TOKENS=4096` | Lines 49-52 exact match | ✅ |
| §2.1 CORS Duplicates | Allowlist has duplicate `ayurvrittaayurveda.in` | Lines 41-44: two entries for same domain | ✅ |
| §2.1 `max_tokens` Cap | Default 1024, capped at 4096 | Lines 119-123 verified | ✅ |
| §2.2 Health Response | `{status:"ok", message:"API is working", timestamp}` + 200 always | Verified exact shape + 200 always | ✅ |
| §3.1 AIService Methods | 10 public methods listed | All 10 verified in `aiService.ts` | ✅ |
| §3.1 Init Contract | Lazy init, `initialized`/`initializing`/`initError` flags, `NvidiaClient('proxy')` | Lines 43, 52-60, 70-78 verified | ✅ |
| §3.1 "No Fallback Path" | **No direct client→upstream path** | Verified: `nvidiaClient.ts:74` only fetches `/api/nvidia` | ✅ |
| §3.1 `generateImage` | Always throws (not supported) | Lines 194-199: throws `Error('Image generation not supported...')` | ✅ |
| §3.1 `analyzeDocument` | Insurance system prompt + `max_tokens: 4096` | Lines 225-227 verified | ✅ |
| §3.1 `locationSearch` | Returns `mapLinks: []` | Line 256 verified | ✅ |
| §3.2 NvidiaClient Retry | `maxRetries=2`, `baseDelayMs=1500`, retries on 429/500/502/503/504, 30s timeout | Lines 89-98 verified | ✅ |
| §3.2 Client Models | `nano/instruct/reasoning` defaults (different from server) | Lines 193-197 verified; doc correctly notes server uses different models | ✅ |
| §4 Config Vars | All 5 vars match + scope | Verified against `api/nvidia.ts` env reads | ✅ |
| §5 Client Behavior | 7-row table (see W1) | **5/7 rows wrong** | ❌ Major |
| §5 Client Notes | "NO history truncation" | **False** — `history.slice(-10)` at line 127 | ❌ |
| §6 Observability | Log strings `[AI Proxy]...`, `[AI Service]...`, `[NvidiaClient]...` | All verified in `api/nvidia.ts`, `aiService.ts`, `nvidiaClient.ts` | ✅ |
| §6 Observability | "No Sentry Integration" — API layer doesn't use `errorTracker.ts` | Verified: `errorTracker.ts` is client-only | ✅ |
| §7 Limits | Edge duration 30s, 12s/30s timeouts, 4096 tokens, 40KB chars, auto concurrency | All match except "40KB" ≈ chars (S4) | ⚠️ Approx |
| §8 Plan Item | Fix VERCEL_URL CORS comparison | **Already fixed** (W3) | ❌ Stale |
| §8 Plan Item | Fix CORS allowlist duplicates | Still present in code (lines 41-44) | ✅ Valid |
| §8 Plan Item | Document streaming contradiction | `aiService.ts:102` comment exists as claimed | ✅ Valid |

---

## Conclusion

**Design Document 22 is a solid architectural reference (7.5/10)** — it correctly captures the proxy architecture, provider fallback, payload caps, CORS structure, environment configuration, observability, and the critical "no fallback path" guarantee. **However, it has one high-impact error cluster (§5 client behavior) and several omissions** that would mislead developers implementing error handling, security audits, or local development setups.

**Priority Fixes for the Doc Owner:**
1. **Rewrite §5 "Actual Client Behavior" column** to match `Nvidia API Error (<status>): <body>` format (W1)
2. **Remove "NO history truncation" claim** or correct it to "keeps last 10 messages" (W2)
3. **Remove stale VERCEL_URL fix item** from §8 Phase 2 (W3)
4. **Document no-Origin bypass** in §2.1 Security Hardening (W4)
5. **Add `textExtractor.ts` and Vite dev-proxy gap** to a new "Client-Side Pipelines & Dev Environment" section (S6, S7)
6. **Correct health endpoint runtime** in §1 and §2.2 (S1)
7. **Document all three 413 variants**, `stream` forwarding, and health method handling (S2, S3, S5)
8. **Add `createNvidiaClient`/`getNvidiaErrorMessage` and client defaults** to §3.2 (S8, S9)

**No code changes required** — this is a documentation accuracy review only. All findings are evidence-backed with file:line references above.

---

*Review completed 2026-11-13. Evidence collected from: `api/nvidia.ts` (177 lines), `api/health.ts` (14 lines), `lib/aiService.ts` (300 lines), `lib/nvidiaClient.ts` (181 lines), `lib/textExtractor.ts`, `vite.config.ts`, `vercel.json`, `analytics/errorTracker.ts`.*