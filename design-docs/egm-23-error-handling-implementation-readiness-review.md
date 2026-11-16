# EGM-23 Error Handling — Implementation Readiness Review

**Date:** 2026-11-13
**Reviewer:** AI Agent (OpenCode)
**Design Doc:** `design-docs/egm-23-error-handling.md`
**Codebase:** `hospital-site/`
**Verdict:** **NEEDS WORK** (Implementability Score: **6/10**)

---

## Executive Summary

The EGM-23 design document proposes a comprehensive error handling strategy spanning React Error Boundaries, API-level resilience, client-side retry logic, structured validation, and observability. The codebase **already has meaningful infrastructure** in place — notably global error handlers in `eventTracker.ts`, exponential-backoff retry logic in `nvidiaClient.ts`, and Sentry integration via `@sentry/react` — but **critical gaps** prevent immediate implementation of the design as specified.

**Key blockers:**
- `react-error-boundary` package not installed; no ErrorBoundary components exist anywhere in the React tree
- `aiService.ts` has no fallback path when NVIDIA NIM fails (design §5 requirement)
- `zod` not installed; no validation schemas exist (design §6 requirement)
- Sentry DSN not configured despite `@sentry/react` being in `package.json`
- No test infrastructure for ErrorBoundary components (design §10 examples won't run)

**Strengths to build on:**
- `eventTracker.ts:157-177` already registers `window.onerror` and `unhandledrejection` handlers with Sentry capture
- `nvidiaClient.ts:107-163` implements 3-attempt exponential backoff (1.5s → 3s) with 30s timeout and `Retry-After` header respect
- `api/nvidia.ts` returns appropriate HTTP status codes (405, 403, 400, 413, 500, 502) with structured error payloads
- `errorTracker.ts` provides `captureException`, `captureMessage`, `setUserContext`, and React component wrapper via `withErrorBoundary` HOC

---

## Findings Table

| ID | Severity | Category | Finding | Design Doc Ref | Code Reference |
|----|----------|----------|---------|----------------|----------------|
| F-01 | **Critical** | Missing Dependency | `react-error-boundary` not in `package.json`; no ErrorBoundary components in codebase | §2, §3, §10 | `package.json`, `App.tsx`, `components/ChatToolCard.tsx` |
| F-02 | **Critical** | Missing Fallback | `aiService.ts` has no fallback provider/path when NVIDIA NIM fails | §5 | `lib/aiService.ts:1-93` |
| F-03 | **Critical** | Missing Dependency | `zod` not installed; no validation schemas for API inputs/outputs | §6 | `package.json`, `api/nvidia.ts`, `lib/nvidiaClient.ts` |
| F-04 | **Critical** | Config Gap | `@sentry/react` installed but `SENTRY_DSN` not configured; `initSentry()` is a no-op without it | §7, §8 | `analytics/errorTracker.ts:12-25`, `.env.example` |
| F-05 | **Warning** | Test Gap | No test files for ErrorBoundary components; design §10 examples reference non-existent test utils | §10 | `tests/` directory |
| F-06 | **Warning** | Incomplete Coverage | Global error handlers exist but don't capture React component render errors (need ErrorBoundary integration) | §8 | `analytics/eventTracker.ts:157-177` |
| F-07 | **Warning** | Retry Limitation | `nvidiaClient.ts` retry only covers network/5xx; doesn't retry on 429 with `Retry-After` parsing in all paths | §4 | `lib/nvidiaClient.ts:130-145` |
| F-08 | **Suggestion** | Observability | Structured logging (request ID correlation) not implemented across API/client boundary | §7 | `api/nvidia.ts`, `lib/nvidiaClient.ts` |
| F-09 | **Suggestion** | UX | No user-facing error fallback UI components (design §3 `ErrorFallback` not implemented) | §3 | `components/` |
| F-10 | **Suggestion** | Validation | API input validation in `api/nvidia.ts` is manual; would benefit from zod schema centralization | §6 | `api/nvidia.ts:40-65` |

---

## Detailed Findings

### F-01: Missing `react-error-boundary` Package & Components (Critical)

**Design Doc Claim (§2):** "Install `react-error-boundary` and wrap the app root."

**Reality:** 
- `package.json` dependencies: `react`, `react-dom`, `@sentry/react` — **no `react-error-boundary`**
- `App.tsx:1-58` — Root component renders `<ChatToolCard />` directly with **no ErrorBoundary wrapper**
- `components/ChatToolCard.tsx:1-187` — Main chat component has **no internal ErrorBoundary**
- No `ErrorBoundary` or `FallbackComponent` imports anywhere in codebase

**Impact:** Design §2, §3, §10 cannot be implemented until package is installed and boundaries are composed into the React tree.

---

### F-02: No Fallback Path in `aiService.ts` (Critical)

**Design Doc Claim (§5):** "Unified AI service with fallback provider support."

**Reality (`lib/aiService.ts:1-93`):**
```typescript
// Line 52-62: Single provider, no fallback
async function generateResponse(messages: Message[]): Promise<string> {
  const client = getNvidiaClient();
  return client.chatCompletion(messages);
}

// Line 84-93: Exports only NVIDIA client
export const aiService = { generateResponse, ... };
```

**Missing:**
- No `fallbackProviders` array or configuration
- No circuit-breaker or provider-switching logic
- No health-check abstraction for provider availability

**Impact:** Design §5 "fallback provider" requirement is entirely unimplemented.

---

### F-03: Missing `zod` Validation Schemas (Critical)

**Design Doc Claim (§6):** "Add zod schemas for API request/response validation."

**Reality:**
- `package.json` — **no `zod` dependency**
- `api/nvidia.ts:40-65` — Manual validation using `if` checks:
  ```typescript
  if (!messages || !Array.isArray(messages)) {
    return error(400, 'Messages array required');
  }
  ```
- `lib/nvidiaClient.ts` — No response schema validation; assumes NVIDIA API shape

**Impact:** Design §6 type-safe validation layer missing; manual validation is error-prone and not reusable.

---

### F-04: Sentry DSN Not Configured (Critical)

**Design Doc Claim (§7, §8):** "Configure Sentry with DSN; capture errors with context."

**Reality (`analytics/errorTracker.ts:12-25`):**
```typescript
export function initSentry(dsn?: string) {
  if (!dsn || import.meta.env.PROD === false) return; // No-op in dev
  Sentry.init({ dsn, ... });
}
```

- `.env.example` — **No `VITE_SENTRY_DSN` variable defined**
- `initSentry()` called in `main.tsx`? **Not verified** — no import found in codebase search
- `errorTracker.ts` exports `captureException`, `captureMessage`, `setUserContext` — **functional but uninitialized**

**Impact:** Observability (§7, §8) is non-functional without DSN configuration and initialization.

---

### F-05: No ErrorBoundary Test Infrastructure (Warning)

**Design Doc Claim (§10):** "Test examples for ErrorBoundary rendering, fallback, reset."

**Reality:**
- `tests/analytics/errorTracker.test.ts` — Only tests `errorTracker.ts` utilities
- **No test files** for React components, ErrorBoundaries, or fallback rendering
- Design §10 examples reference `render`, `screen`, `userEvent` from `@testing-library/react` — **not installed** (only `vitest` in `package.json`)

**Impact:** Design §10 test strategy cannot execute; CI gate would fail.

---

### F-06: Global Handlers Don't Catch React Render Errors (Warning)

**Reality (`analytics/eventTracker.ts:157-177`):**
```typescript
// Lines 157-177: window.onerror + unhandledrejection
window.addEventListener('error', (event) => { captureException(event.error); });
window.addEventListener('unhandledrejection', (event) => { captureException(event.reason); });
```

**Gap:** These handlers **do not catch** React component render errors (which are caught by ErrorBoundaries, not `window.error`). Without ErrorBoundaries (F-01), render errors become uncaught promise rejections or silent failures.

**Impact:** Design §8 "global error handling" is incomplete for React-specific errors.

---

### F-07: Retry Logic Doesn't Fully Handle 429/Rate Limiting (Warning)

**Reality (`lib/nvidiaClient.ts:130-145`):**
```typescript
// Retry on 5xx and network errors only
if (response.status >= 500 || !response.ok && response.status !== 429) {
  // retry logic
}

// 429 handling exists but only if Retry-After header present
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  if (retryAfter) { /* wait and retry */ }
}
```

**Gap:** If NVIDIA returns 429 **without** `Retry-After` header, the request fails immediately instead of applying exponential backoff. Design §4 implies robust retry on all retryable conditions.

---

### F-08: No Request ID Correlation Logging (Suggestion)

**Gap:** Neither `api/nvidia.ts` nor `lib/nvidiaClient.ts` generates or propagates a `request-id` / `trace-id` for correlating client↔server logs.

**Design §7 Implication:** "Structured logging with context" — currently missing correlation IDs.

---

### F-09: No User-Facing Error Fallback UI (Suggestion)

**Design §3:** Defines `ErrorFallback` component with retry button, error details, support link.

**Reality:** No such component exists in `components/`. ChatToolCard has no error state rendering.

---

### F-10: Manual API Validation Could Use Zod (Suggestion)

**Reality (`api/nvidia.ts:40-65`):** ~25 lines of manual validation logic for `messages`, `model`, `temperature`, `max_tokens`.

**Opportunity:** Centralized zod schemas would provide:
- Reusable validation for client & server
- Automatic TypeScript inference
- Clear error messages with path context

---

## Gap Analysis Table

| Design Doc Section | Requirement | Current State | Gap Size | Effort to Close |
|--------------------|-------------|---------------|----------|-----------------|
| §2 | Install `react-error-boundary` | ❌ Not installed | **Large** | Low (npm install + 2-3 components) |
| §2 | Wrap app root in ErrorBoundary | ❌ No wrapper in `App.tsx` | **Large** | Low (5-10 lines) |
| §3 | `ErrorFallback` component | ❌ Not created | **Medium** | Medium (new component + design) |
| §3 | Per-component ErrorBoundaries | ❌ None in `ChatToolCard` | **Medium** | Low (wrap risky sections) |
| §4 | Retry logic with exponential backoff | ✅ Exists in `nvidiaClient.ts` | **None** | — |
| §4 | Retry-After header respect | ⚠️ Partial (only if header present) | **Small** | Low (add default backoff for 429) |
| §5 | Fallback provider in `aiService` | ❌ Not implemented | **Large** | Medium (architectural change) |
| §6 | Zod schemas for validation | ❌ `zod` not installed, no schemas | **Large** | Medium (install + schema design) |
| §7 | Sentry configured with DSN | ⚠️ Package installed, DSN missing | **Medium** | Low (env var + init call) |
| §7 | Structured logging with context | ⚠️ Basic `captureException` only | **Medium** | Medium (request IDs, breadcrumbs) |
| §8 | Global error handlers | ✅ `window.onerror` + `unhandledrejection` | **None** | — |
| §8 | React render error capture | ❌ Requires ErrorBoundaries (F-01) | **Large** | Blocked on F-01 |
| §9 | CI/CD quality gates | ⚠️ No CI config found in repo | **Unknown** | Depends on CI setup |
| §10 | ErrorBoundary test examples | ❌ No test infra for components | **Large** | High (testing-library + tests) |

---

## Recommendations by Priority

### P0 — Must Fix Before Implementation Can Begin

1. **Install `react-error-boundary`** (`npm i react-error-boundary`)
2. **Create root ErrorBoundary in `App.tsx`** wrapping `<ChatToolCard />` with `ErrorFallback` component
3. **Install `zod`** (`npm i zod`) and create validation schemas in `lib/schemas/` for:
   - `api/nvidia.ts` request body
   - `nvidiaClient.ts` response shape
4. **Add `VITE_SENTRY_DSN` to `.env.example`** and call `initSentry(import.meta.env.VITE_SENTRY_DSN)` in `main.tsx`
5. **Implement fallback provider logic in `aiService.ts`** — at minimum a stub interface and configuration flag

### P1 — Should Fix for Design Completeness

6. **Create `components/ErrorFallback.tsx`** per design §3 spec (retry button, error details, support link)
7. **Add per-component ErrorBoundaries** in `ChatToolCard.tsx` around:
   - Message list rendering
   - Tool invocation UI
   - Streaming response handling
8. **Enhance 429 retry in `nvidiaClient.ts`** — apply exponential backoff when `Retry-After` header missing
9. **Add request ID correlation** — generate `crypto.randomUUID()` in client, pass via header, log in API

### P2 — Nice to Have / Follow-up

10. **Set up component testing** — install `@testing-library/react`, `@testing-library/user-event`, `jsdom`; add ErrorBoundary test file per design §10
11. **Add structured logging breadcrumbs** in `errorTracker.ts` (user actions, API calls, navigation)
12. **Create CI pipeline** with lint, typecheck, test, and build gates (design §9)
13. **Document error codes** — centralized `ERROR_CODES` enum shared between client/server

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| React render errors crash entire app (no ErrorBoundary) | High | High | P0 #1-2 |
| NVIDIA API failure = total chat failure (no fallback) | Medium | High | P0 #5 |
| Invalid API requests reach NVIDIA (no zod validation) | Medium | Medium | P0 #3 |
| Production errors invisible (Sentry not initialized) | High | Medium | P0 #4 |
| Test examples in design doc fail CI | High | Low | P2 #10 |

---

## Verdict

### **NEEDS WORK** — Implementability Score: **6/10**

**Rationale:**
- **Score 6/10** reflects that ~60% of the infrastructure exists (retry logic, global handlers, API error codes, Sentry package, errorTracker utilities)
- **Critical blockers (F-01 through F-04)** prevent the design's core requirements from being met
- **Estimated effort to reach READY:** 2-3 focused development sessions (P0 items only)
- **Full design compliance (including P1/P2):** 1-2 additional sessions

**Path to READY:**
1. Complete all P0 items → **READY for core implementation**
2. Complete P1 items → **READY for full design compliance**
3. Complete P2 items → **PRODUCTION-READY with observability & tests**

---

## Appendix: Files Referenced

| File | Lines | Purpose |
|------|-------|---------|
| `design-docs/egm-23-error-handling.md` | — | Source design document |
| `package.json` | 1-45 | Dependency verification |
| `App.tsx` | 1-58 | Root component (no ErrorBoundary) |
| `components/ChatToolCard.tsx` | 1-187 | Main chat UI (no ErrorBoundary) |
| `api/nvidia.ts` | 1-120 | Serverless API with manual validation |
| `lib/nvidiaClient.ts` | 1-200 | Client with retry logic (107-163) |
| `lib/aiService.ts` | 1-93 | Unified AI service (no fallback) |
| `analytics/errorTracker.ts` | 1-120 | Sentry wrapper, `withErrorBoundary` HOC |
| `analytics/eventTracker.ts` | 1-200 | Global handlers (157-177), analytics |
| `tests/analytics/errorTracker.test.ts` | 1-80 | Existing unit tests |
| `.env.example` | — | Environment template (no SENTRY_DSN) |

---

*Review generated by OpenCode agent. Verify all code references against current codebase before acting.*