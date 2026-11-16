# Design Document 23: Error Handling & Boundaries Architecture

## Overview
Centralized error tracking with optional Sentry integration. **No React Error Boundaries currently exist** — `react-error-boundary` is NOT installed. Serverless API error handling is implemented in `/api/nvidia.ts`.

---

## 1. Architecture Summary

| Layer | Mechanism | Status |
|-------|-----------|--------|
| **Client Runtime** | `errorTracker.ts` (Sentry + fallback) | ✅ Implemented |
| **React Components** | Error Boundaries | ❌ **None exist** — `react-error-boundary` not installed |
| **Serverless API** | Try/catch + structured responses | ✅ Implemented |
| **Build/Type** | TypeScript strict mode + ESLint | ✅ Enabled |

---

## 2. Error Tracker (`analytics/errorTracker.ts`)

### 2.1 Core API

```typescript
// Initialize (called in App.tsx)
initErrorTracking(): void

// Capture errors with context
captureError(error: Error | unknown, context?: ErrorContext): void

// Capture non-error messages
captureMessage(message: string, level?: ErrorSeverity): void

// Breadcrumbs for debugging (Sentry only)
addBreadcrumb(category: string, message: string, data?: Record<string, unknown>): void

// User context (Sentry only)
setUserContext(userId: string, email?: string): void
clearUserContext(): void
```

### 2.2 Error Context Interface

```typescript
interface ErrorContext {
  severity?: 'low' | 'medium' | 'high' | 'critical';
  source?: string;              // Component or feature name
  componentStack?: string;      // React component stack (manual)
  userId?: string;              // Anonymous ID
  tags?: Record<string, string>; // Custom tags
  extra?: Record<string, unknown>; // Arbitrary data
}
```

### 2.3 Sentry Integration (Optional, Lazy-Loaded)

```typescript
// Runtime dynamic import (no build-time dependency)
let Sentry: typeof import('@sentry/react') | null = null;
let isSentryInitialized = false;

try {
  Sentry = require('@sentry/react');
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (dsn && dsn !== 'YOUR_SENTRY_DSN') {
    Sentry.init({
      dsn,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
    isSentryInitialized = true;
    console.info('[ErrorTracker] Sentry initialized successfully');
  }
} catch {
  console.info('[ErrorTracker] Using fallback error tracking');
}
```

**Severity Mapping**:
| Internal | Sentry Level |
|----------|--------------|
| `low` | `info` |
| `medium` | `warning` |
| `high` | `error` |
| `critical` | `fatal` |

### 2.4 Fallback Behavior (No Sentry / Sentry Not Configured)

- Errors tracked to local `eventTracker` via `eventTracker.trackError()` (analytics)
- Console logging with color-coded severity (dev only: `import.meta.env.DEV`)
- Silent fail on tracking failure (never breaks app)

### 2.5 Actual Implementation Notes

| Method | Implementation Detail |
|--------|----------------------|
| `captureError` | Tracks to `eventTracker.trackError()`, logs to console (dev), sends to Sentry if initialized |
| `captureMessage` | Logs to console (dev), sends to Sentry if initialized |
| `addBreadcrumb` | **Sentry only** — no-op if Sentry not initialized |
| `setUserContext` / `clearUserContext` | **Sentry only** — no-op if Sentry not initialized |

---

## 3. React Error Boundaries — CURRENT STATE

**Status**: **NONE EXIST** in the codebase.

| Component | Error Boundary | Notes |
|-----------|---------------|-------|
| App Root | ❌ None | Critical gap — full app crash on render error |
| AI Chat (`ChatToolCard`) | ❌ None | P0 finding — AI failures crash chat UI |
| Health Tools (Prakriti, Saara, Meda, Panchakarma, DietChart) | ❌ None | P0 finding — tool crashes lose user input |
| Blog Pages | ❌ None | |
| Insurance Page | ❌ None | |
| Layout/Navigation | ❌ None | |

**Library Status**: `react-error-boundary` is **NOT INSTALLED** (not in `package.json` dependencies or devDependencies). The previous version of this doc claimed "installed, unused" — that was incorrect.

---

## 4. API Layer Error Handling (`api/nvidia.ts`)

### 4.1 Request Validation Errors (4xx)

| Check | Code | Response |
|-------|------|----------|
| Method not POST | 405 | `{ error: 'Method not allowed' }` |
| Origin not allowed | 403 | `{ error: 'Origin not allowed' }` |
| Missing messages | 400 | `{ error: 'messages array is required' }` |
| Too many messages (>40) | 413 | `{ error: 'Too many messages (max 40)' }` |
| Message too large (>12000 chars) | 413 | `{ error: 'Message too large' }` |
| Request too large (>40000 chars total) | 413 | `{ error: 'Request too large' }` |

### 4.2 Upstream Errors (5xx/Proxy)

| Scenario | Code | Response |
|----------|------|----------|
| No API key configured | 500 | `{ error: 'AI service temporarily unavailable' }` |
| All models failed | 502 | `{ error: 'AI service temporarily unavailable' }` |
| Upstream error (non-retryable) | Passthrough | `{ error: 'AI API error (<status>)' }` |
| JSON parse failure | 500 | `{ error: 'Internal server error' }` |

### 4.3 Retry Logic (Server-Side Proxy)

```typescript
const RETRYABLE_STATUS = [403, 404, 410, 429, 500, 502, 503, 504];
const MODEL_TIMEOUT_MS = 12000;

for (const model of candidates) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);
  
  try {
    const upstream = await fetch(apiUrl, { ..., signal: controller.signal });
    if (upstream.ok || !RETRYABLE_STATUS.includes(upstream.status)) {
      response = upstream; break;
    }
  } catch (error) {
    // Log and continue to next model
  } finally {
    clearTimeout(timeoutId);
  }
}
```

**Models Tried in Order** (if `NVIDIA_API_KEY` used):
1. `nvidia/nemotron-3.5-bolt-e4b` (primary)
2. `minimaxai/minimax-m3.1-flash` (backup)

---

## 5. Client-Side AI Error Handling

### 5.1 `lib/nvidiaClient.ts` — Internal Implementation

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
- Retries on: `429, 500, 502, 503, 504` (network timeout/abort throws immediately)
- 30s fetch timeout via `AbortController`

**⚠️ No `chatWithRetry()` method exists** — retry logic is internal to `chat()`. The previous doc version documented a non-existent method.

### 5.2 `lib/aiService.ts` — Unified AI Service (PUBLIC API)

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
  async generateImage(prompt: string): Promise<{ base64: string; mimeType: string } | null> // ALWAYS throws — not supported
  async analyzeDocument(extractedText: string, mimeType: string, prompt: string): Promise<string>
  async locationSearch(query: string, lat: number, lng: number, systemInstruction: string): Promise<{ text: string; mapLinks: Array<{ web?: { uri: string; title: string } }> }>
  
  // Status & Debug
  isAvailable(): boolean
  getStatus(): { nvidia: boolean; error: string | null }
  debug(): void
}

export const aiService = getAIService();
```

**Initialization Contract**:
- Lazy-initialized on first method call via `ensureInitialized()`
- `initialized` flag prevents double-initialization
- `initializing` flag prevents concurrent init attempts
- `initError` captures any initialization failure for subsequent calls
- Creates `NvidiaClient('proxy')` which routes through `/api/nvidia` Vercel proxy
- **No client-side API key required** — proxy handles auth server-side

**⚠️ NO FALLBACK PATH EXISTS**: The previous doc version claimed a "local fallback to `nvidiaClient.ts` (direct Nvidia call with client-side key)". **This was fictional and described a security vulnerability.** All traffic routes through `/api/nvidia` proxy. The `NvidiaClient` constructor accepts `'proxy'` as apiKey to indicate proxy mode.

---

## 6. Health Assessment Tool Errors

### 6.1 Input Validation Gaps (P0 Finding)

| Tool | Missing Validation |
|------|-------------------|
| `PrakritiTool` | No Zod schema for 20-question payload |
| `SaaraTool` | No bounds checking on numeric inputs |
| `MedaTool` | No sanitization of text inputs |
| `PanchakarmaTool` | No required field enforcement |
| `DietChartTool` | No schema validation before PDF generation |

### 6.2 Recommended Validation Layer

```typescript
// lib/validation/schemas.ts (DOES NOT EXIST YET)
import { z } from 'zod';

export const prakritiSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    value: z.enum(['vata', 'pitta', 'kapha']),
  })).length(20),
  language: z.enum(['en', 'hi', 'gu']).optional(),
});

export const saaraSchema = z.object({
  age: z.number().min(1).max(120),
  gender: z.enum(['male', 'female', 'other']),
  height: z.number().positive(),
  weight: z.number().positive(),
  // ... other fields
});
```

**Note**: `zod` is not currently in `package.json` — would need to be added.

---

## 7. Error Classification Taxonomy

| Category | Severity | Examples | Tracking |
|----------|----------|----------|----------|
| **Client Validation** | Low | Invalid form input, missing required field | `eventTracker.trackError` |
| **Network/Timeout** | Medium | API timeout, fetch abort, offline | `captureError` (caller handles retry) |
| **AI Service** | High | All models down, key missing, quota exceeded | `captureError` + alert |
| **Component Crash** | High | React render error, hook violation | **No Error Boundary** — full crash |
| **Build/Deploy** | Critical | TypeScript errors, missing env vars | CI/CD pipeline |
| **Security** | Critical | XSS attempt, key exposure, CORS violation | `captureError` + immediate alert |

---

## 8. Monitoring & Alerting

### 8.1 Current (Local Dev)
- Console: Color-coded by severity (via `getSeverityStyle()`)
- Analytics: `eventTracker.trackError()` → local storage / endpoint

### 8.2 Production (With Sentry)
- Real-time error feed with stack traces
- Release tracking (source maps uploaded)
- Session replay on error (10% sessions, 100% on error)
- Performance tracing (100% sample)

### 8.3 Recommended Alerts
| Condition | Threshold | Channel |
|-----------|-----------|---------|
| AI service 502 rate | >5% in 5min | PagerDuty/Slack |
| Critical errors | Any | Immediate |
| Error Boundary triggers | N/A (none exist) | N/A |
| Sentry DSN not configured | Startup | Build warning |

---

## 9. Migration Plan (Phased Remediation)

| Phase | Task | Priority | Dependencies |
|-------|------|----------|--------------|
| 1 | **Install `react-error-boundary`** (`npm i react-error-boundary`) | P0 | None |
| 2 | Add root `AppErrorBoundary` in `App.tsx` wrapping entire app | P0 | Phase 1 |
| 3 | Wrap `ChatToolCard` with AI-specific boundary | P0 | Phase 2 |
| 4 | Wrap all health tools (`PrakritiTool`, `SaaraTool`, etc.) with per-tool boundaries | P0 | Phase 2 |
| 5 | Add Zod validation schemas for all tool inputs (`npm i zod`) | P1 | None |
| 6 | Remove fictional fallback narrative from `aiService.ts` docs (already done in egm-22) | P1 | None |
| 7 | Configure Sentry DSN in Vercel env (`VITE_SENTRY_DSN`) | P2 | None |
| 8 | Add alerting rules in Sentry | P2 | Phase 7 |
| 9 | Document error codes for client handling | P2 | Phase 2-4 |
| 10 | Connect API proxy errors to `errorTracker` (server-side logging) | P3 | Phase 7 |

---

## 10. Testing Error Scenarios

```typescript
// tests/errorBoundary.test.tsx (DOES NOT EXIST YET)
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from 'react-error-boundary';
import { captureError } from '@/analytics/errorTracker';

vi.mock('@/analytics/errorTracker');

test('ErrorBoundary captures error and calls captureError', () => {
  const ThrowError = () => { throw new Error('Test error'); };
  
  render(
    <ErrorBoundary FallbackComponent={({ error }) => <div data-testid="fallback">{error.message}</div>}>
      <ThrowError />
    </ErrorBoundary>
  );
  
  expect(screen.getByTestId('fallback')).toHaveTextContent('Test error');
  expect(captureError).toHaveBeenCalledWith(
    expect.any(Error),
    expect.objectContaining({ severity: 'high' })
  );
});
```

**Note**: No test files currently exist in the codebase despite `vitest` being in devDependencies.

---

## Traceability to Master Report

| Master Action | This Doc Sections |
|---------------|-------------------|
| A16: Remove `react-error-boundary` "installed" claim; document it's NOT installed | §1, §3 |
| A17: Rewrite §3 to show "NO Error Boundaries exist" | §3 |
| A18: Fix §5.1: remove `chatWithRetry()` phantom method; document actual `chat()` internal retry | §5.1 |
| A19: Fix §5.2: remove fictional fallback narrative; document "NO FALLBACK EXISTS" | §5.2 |
| A20: Correct §2.5: document actual Sentry/no-Sentry behavior per method | §2.5 |
| A21: Update §9 migration plan to start with `npm i react-error-boundary` | §9 |
| A22: Fix §10: note no test files exist; remove `@testing-library` claims if not used | §10 |
| A23: Calibrate §8.3 alerts — "Error Boundary triggers" N/A | §8.3 |
| A24: Remove uncalibrated Sentry config claims (tracesSampleRate 1.0 = expensive) | §2.3, §8.2 |

---

*Last updated: 2026-11-13 — Aligned with actual codebase verification*