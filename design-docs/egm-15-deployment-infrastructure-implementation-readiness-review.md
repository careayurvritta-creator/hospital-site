# EGM-15 Deployment & Infrastructure — Implementation Readiness Review

**Review Date:** 2026-11-13  
**Reviewer:** EGM Implementation Readiness Reviewer  
**Design Doc:** `design-docs/egm-15-deployment-infrastructure.md`  
**Codebase Root:** `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site`

---

## Executive Summary

| Metric | Score | Notes |
|--------|-------|-------|
| **Overall Implementability Score** | **7/10** | Design doc is accurate and thorough, but significant gaps exist between documented "current state" and production-ready infrastructure |

### Verdict: **NEEDS WORK**

The design document (`egm-15-deployment-infrastructure.md`) is **excellent as a forensic audit** — it correctly identifies all discrepancies between the previous (phantom) documentation and actual codebase state. However, as an **implementation readiness** document, it reveals that the infrastructure has **7 blocker/major gaps** that must be addressed before the deployment can be considered production-hardened.

The document itself is ready to guide implementation (it contains a clear Migration Plan), but the **infrastructure it describes is NOT ready for production** without executing Phases 1–5 of that plan.

---

## 10-Point Framework Assessment

| # | Criterion | Score | Status |
|---|-----------|-------|--------|
| 1 | Requirements Clarity | 9/10 | ✅ Clear, well-structured, traceable to master report |
| 2 | Architecture Alignment | 8/10 | ✅ Doc matches actual codebase; minor discrepancy in runtime (Edge vs Node) |
| 3 | Component Spec Completeness | 7/10 | ⚠️ Missing specs for health endpoint, rate limiter, CSP, caching layer |
| 4 | Data Flow Definition | 8/10 | ✅ Request→validation→upstream→response flow documented |
| 5 | Integration Points | 7/10 | ⚠️ Vercel env vars, GitHub Actions CI, NVIDIA/DeepSeek upstream documented; monitoring integration missing |
| 6 | Dependencies Identified | 8/10 | ✅ Runtime, upstream APIs, Vercel platform features identified |
| 7 | Edge Cases Covered | 6/10 | ⚠️ Upstream retry logic covered; missing: cold start budget, timeout cascading, quota exhaustion |
| 8 | Testing Strategy | 4/10 | ❌ **No tests for `api/nvidia.ts`**, no integration tests, no load tests |
| 9 | Performance Budget | 5/10 | ⚠️ Model timeout (12s) documented; no bundle size budget, no Core Web Vitals targets, no function duration budget |
| 10 | Migration/Compatibility | 9/10 | ✅ Phased migration plan with priorities and dependencies |

---

## Findings Table

| Severity | ID | Finding | Code Reference |
|----------|----|---------|----------------|
| **Critical** | C01 | **No `functions` config in `vercel.json`** — function duration uses Vercel defaults (10s Hobby / 60s Pro), not the documented 30s. Edge runtime (`api/nvidia.ts` line 22) has stricter limits. | `vercel.json` (no `functions` key); `api/nvidia.ts:22` |
| **Critical** | C02 | **No security headers on `/(.*)`** — missing `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Content-Security-Policy`. Only cache headers on `/images/*` and `/assets/*`. | `vercel.json:4-26` |
| **Critical** | C03 | **No `/api/health.ts` endpoint exists** — design doc confirms file does not exist; monitoring relies only on Vercel built-in uptime. | `api/` directory listing |
| **Critical** | C04 | **`api/nvidia.ts` runs on Edge runtime** (`export const config = { runtime: 'edge' }`) but design doc states "Runtime: Node.js 20 (Vercel default)". Edge runtime has different limits (CPU time, memory, APIs). | `api/nvidia.ts:21-23` |
| **Major** | M01 | **No rate limiting** on `/api/nvidia.ts` — relies entirely on upstream limits. Vulnerable to abuse/cost runaway. | `api/nvidia.ts` (no rate limit logic) |
| **Major** | M02 | **No response caching** — every request hits upstream NVIDIA/DeepSeek. Increases latency, cost, and upstream quota consumption. | `api/nvidia.ts:81` (doc confirms "No response caching") |
| **Major** | M03 | **No fallback to mock responses** — returns 502 when all models fail. No graceful degradation for user-facing chat. | `api/nvidia.ts:156-158` |
| **Major** | M04 | **No Content-Security-Policy header** — recommended CSP documented but not implemented. | `vercel.json` (no CSP) |
| **Major** | M05 | **No server-side error tracking** in `api/nvidia.ts` — errors only in Vercel function logs; Sentry not configured (`VITE_SENTRY_DSN` not set). | `api/nvidia.ts` (console.log only); `analytics/errorTracker.ts` (client-side only) |
| **Major** | M06 | **No tests for `api/nvidia.ts`** — zero test coverage for the only serverless function. | `tests/` directory (no API tests) |
| **Warning** | W01 | **Staging environment not configured** — no `develop` branch deployment; only `main` (production) and PR previews. | Design doc §Environments |
| **Warning** | W02 | **Vercel Analytics not confirmed enabled** — `VITE_GA_MEASUREMENT_ID` unused; custom `eventTracker.ts` exists but endpoint not verified. | `package.json` (no GA dep); `analytics/eventTracker.ts` |
| **Warning** | W03 | **`ALLOWED_ORIGIN_HOSTS` duplicates entries** — `ayurvrittaayurveda.in` and `www.ayurvrittaayurveda.in` listed twice. | `api/nvidia.ts:40-47` |
| **Warning** | W04 | **Service Worker references `/api/bookings` endpoint** (`sw.js:219`) which **does not exist** in `api/` directory. Background sync will fail silently. | `public/sw.js:204-235` |
| **Warning** | W05 | **No bundle size budget or performance monitoring** — Vite config has manual chunks for charts but no `build.reportCompressedSize` or CI budget enforcement. | `vite.config.ts:31-38` |
| **Suggestion** | S01 | **Environment variable documentation incomplete** — design doc lists required vars but no `.env.example` or README section exists. | Design doc §Environment Variables |
| **Suggestion** | S02 | **GitHub Actions workflow only runs blog autopost** — no CI for typecheck, lint, test, or build verification on PRs. | `.github/workflows/blog-autopost.yml` |
| **Suggestion** | S03 | **DeepSeek provider support added in code but not fully documented** — `api/nvidia.ts` supports `DEEPSEEK_API_KEY` fallback; design doc mentions it but gap analysis doesn't cover it. | `api/nvidia.ts:86, 95, 125-128` |
| **Suggestion** | S04 | **Service Worker version hardcoded** (`ayurvritta-v3`) — no automated version bump on deploy; manual process risks stale caches. | `public/sw.js:9` |
| **Suggestion** | S05 | **`MAX_OUTPUT_TOKENS = 4096`** tuned for auto-poster (950-1200 words) but may be excessive for chat, increasing cost/latency. | `api/nvidia.ts:52` |

---

## Detailed Findings with Code References

### C01: Missing `functions` Config in `vercel.json`

**Design Doc Claim:** "No `functions` key — uses Vercel defaults" (Gap Analysis: Blocker)

**Code Reality:**
```json
// vercel.json — ONLY 21 lines, no functions config
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [...],
  "rewrites": [...]
}
```

**Impact:** On Vercel Hobby plan, Edge functions default to **10s max duration**. The `api/nvidia.ts` uses a **12s per-model timeout** (`MODEL_TIMEOUT_MS = 12000`) and tries **2 models sequentially** (up to 24s). This **will timeout** on Hobby plan before completing fallback.

**Required Fix:** Add to `vercel.json`:
```json
"functions": {
  "api/nvidia.ts": { "maxDuration": 30 }
}
```

---

### C02: Missing Security Headers on `/(.*)`

**Design Doc Claim:** "Security headers on `/(.*)` — Not in vercel.json" (Gap Analysis: Blocker)

**Code Reality:** Only two header rules exist — both for static asset caching:
```json
"headers": [
  { "source": "/images/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
  { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
]
```

**Missing Headers (per design doc recommendation):**
| Header | Value |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Content-Security-Policy` | See recommended CSP in design doc |

**Required Fix:** Add header rule for `/(.*)` with security headers.

---

### C03: No `/api/health.ts` Endpoint

**Design Doc Claim:** "File does not exist — Only `api/nvidia.ts` exists" (Gap Analysis: Blocker)

**Code Reality:** `api/` directory contains only `nvidia.ts`.

**Impact:** No custom health check for load balancers, uptime monitors, or deployment verification. Relies solely on Vercel's built-in uptime monitoring (which only checks edge reachability, not function health).

**Required Fix:** Create `api/health.ts`:
```ts
export default function handler(req: Request) {
  return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

---

### C04: Edge Runtime vs Node.js Runtime Mismatch

**Design Doc Claim:** "Runtime: Node.js 20 (Vercel default)"

**Code Reality:**
```ts
// api/nvidia.ts:21-23
export const config = {
  runtime: 'edge',
};
```

**Impact:** Edge runtime has different constraints:
- **CPU time limit**: ~50ms (Hobby) / ~100ms (Pro) per request — but `MODEL_TIMEOUT_MS = 12000` is wall-clock, not CPU
- **No Node.js APIs** (e.g., `fs`, `crypto` subtleties)
- **Memory limit**: 128 MB (Edge) vs 1024 MB (Node.js) — design doc claims 1024 MB
- **Cold start**: ~500ms (Edge) vs ~50ms (Node.js warm) — design doc claims both

**Required Fix:** Either:
1. Change design doc to accurately reflect Edge runtime, OR
2. Change `api/nvidia.ts` to Node.js runtime (remove `export const config = { runtime: 'edge' }`) for higher limits and Node.js compatibility

---

### M01: No Rate Limiting on `/api/nvidia.ts`

**Design Doc Claim:** "Rate limiting: NOT implemented ❌" (Gap Analysis: Major)

**Code Reality:** No rate limiting logic in `api/nvidia.ts`. Only origin check and payload caps.

**Risk:** Abuse potential — attackers can hammer the endpoint, consuming NVIDIA/DeepSeek quota and Vercel function invocations. Cost runaway possible.

**Required Fix:** Implement rate limiting (in-function or via Edge Middleware):
```ts
// Simple in-memory rate limiter (per IP, 60 req/min as design doc suggests)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
```

---

### M02: No Response Caching

**Design Doc Claim:** "No response caching — every request hits upstream"

**Code Reality:** Confirmed — no caching layer in `api/nvidia.ts`.

**Impact:** 
- Identical prompts (common in chat) hit upstream every time
- Increased latency (1-2s per request)
- Upstream quota consumption
- Higher costs

**Required Fix:** Add in-memory or Vercel KV cache for identical `(model, messages, params)` hashes with 5-min TTL.

---

### M03: No Fallback to Mock Responses

**Design Doc Claim:** "Fallback to mock responses — Not implemented — returns 502"

**Code Reality:**
```ts
// api/nvidia.ts:156-158
if (!response) {
  console.error('[AI Proxy] All candidate models unavailable');
  return jsonResponse({ error: 'AI service temporarily unavailable' }, 502);
}
```

**Impact:** Chat UI shows generic error; no graceful degradation (e.g., cached responses, canned fallback).

**Required Fix:** Implement fallback — serve last successful response, or static fallback message.

---

### M06: Zero Test Coverage for `api/nvidia.ts`

**Design Doc Claim:** Testing Strategy not explicitly covered (Gap Analysis doesn't mention tests)

**Code Reality:** 
```
tests/
├── translations.test.ts
├── autopost.test.ts
└── analytics/
    └── errorTracker.test.ts
```
**No API route tests exist.**

**Risk:** Critical function (only serverless endpoint) has no:
- Unit tests for validation logic
- Integration tests for upstream proxy behavior
- Contract tests for request/response shapes
- Load/stress tests

**Required Fix:** Add `tests/api/nvidia.test.ts` using Vitest + MSW or `vitest-environment-edge-runtime`.

---

### W04: Service Worker References Non-Existent `/api/bookings`

**Code Reality:**
```js
// public/sw.js:219
const response = await fetch('/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(booking),
});
```

**Impact:** Background sync for bookings will **always fail** (404). Errors logged but not handled. Users think booking submitted; it's lost.

**Required Fix:** Either implement `/api/bookings` endpoint OR remove booking sync from SW.

---

### W03: Duplicate Entries in `ALLOWED_ORIGIN_HOSTS`

**Code Reality:**
```ts
// api/nvidia.ts:40-47
const ALLOWED_ORIGIN_HOSTS = [
  'ayurvrittaayurveda.in',
  'www.ayurvrittaayurveda.in',
  'ayurvrittaayurveda.in',      // DUPLICATE
  'www.ayurvrittaayurveda.in',  // DUPLICATE
  'localhost',
  '127.0.0.1',
];
```

**Impact:** Harmless but indicates lack of code review. Use `Set` or deduplicate.

---

## Gap Analysis Table

| Area | Design Doc Coverage | Codebase Reality | Gap Severity |
|------|---------------------|------------------|--------------|
| Vercel `functions` config | Documented as missing (Gap Analysis) | Missing | **Blocker** |
| Security headers | Documented as missing (Gap Analysis) | Missing | **Blocker** |
| Health endpoint | Documented as missing (Gap Analysis) | Missing | **Blocker** |
| Runtime accuracy | Claims Node.js 20 | Edge runtime | **Blocker** |
| Rate limiting | Documented as missing (Gap Analysis) | Missing | **Major** |
| Response caching | Documented as missing (Gap Analysis) | Missing | **Major** |
| Mock fallback | Documented as missing (Gap Analysis) | Missing | **Major** |
| CSP header | Recommended in Security section | Missing | **Major** |
| Server-side error tracking | Documented as missing (Gap Analysis) | Missing | **Major** |
| API test coverage | Not mentioned | Zero tests | **Major** |
| Staging environment | Documented as missing (Gap Analysis) | Missing | **Warning** |
| Vercel Analytics | "Not confirmed" | Not enabled | **Warning** |
| SW `/api/bookings` reference | Not mentioned | Broken reference | **Warning** |
| CI pipeline | Only blog-autopost.yml exists | No build/test/lint CI | **Warning** |
| Bundle size budget | Not mentioned | No budget enforcement | **Suggestion** |
| Env var documentation | Listed in design doc | No `.env.example` | **Suggestion** |
| DeepSeek provider docs | Mentioned in code comments | Not in Gap Analysis | **Suggestion** |
| SW version automation | Not mentioned | Hardcoded v3 | **Suggestion** |

---

## Recommendations by Priority

### P0 — Must Fix Before Production Deploy (Blockers)

| # | Action | File(s) | Effort |
|---|--------|---------|--------|
| 1 | Add `functions` config to `vercel.json` with `maxDuration: 30` for `api/nvidia.ts` | `vercel.json` | 5 min |
| 2 | Add security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) to `vercel.json` for `/(.*)` | `vercel.json` | 10 min |
| 3 | Create `/api/health.ts` endpoint | `api/health.ts` (new) | 15 min |
| 4 | **Resolve runtime mismatch**: Either update design doc to reflect Edge runtime, OR change `api/nvidia.ts` to Node.js runtime | `api/nvidia.ts`, design doc | 30 min |

### P1 — Should Fix Before Production (Major Gaps)

| # | Action | File(s) | Effort |
|---|--------|---------|--------|
| 5 | Implement rate limiting in `api/nvidia.ts` (60 req/min/IP) | `api/nvidia.ts` | 1 hr |
| 6 | Add response caching (5-min TTL, keyed by prompt hash) | `api/nvidia.ts` | 2 hr |
| 7 | Implement CSP header via `vercel.json` | `vercel.json` | 30 min |
| 8 | Add server-side error tracking (Sentry or custom) in `api/nvidia.ts` | `api/nvidia.ts`, `analytics/errorTracker.ts` | 1 hr |
| 9 | Write tests for `api/nvidia.ts` (validation, proxy logic, error paths) | `tests/api/nvidia.test.ts` (new) | 3 hr |

### P2 — Nice to Have Before Production

| # | Action | File(s) | Effort |
|---|--------|---------|--------|
| 10 | Add mock fallback for graceful degradation | `api/nvidia.ts` | 1 hr |
| 11 | Enable/verify Vercel Analytics in project settings | Vercel Dashboard | 10 min |
| 12 | Fix SW `/api/bookings` reference (implement endpoint or remove sync) | `public/sw.js`, `api/bookings.ts` (new) | 2 hr |
| 13 | Add CI workflow for typecheck, lint, test, build | `.github/workflows/ci.yml` (new) | 1 hr |
| 14 | Deduplicate `ALLOWED_ORIGIN_HOSTS` | `api/nvidia.ts` | 5 min |

### P3 — Post-Launch Improvements

| # | Action | File(s) | Effort |
|---|--------|---------|--------|
| 15 | Configure staging environment for `develop` branch | Vercel Dashboard | 10 min |
| 16 | Document all env vars in README / `.env.example` | `README.md`, `.env.example` (new) | 30 min |
| 17 | Automate SW version bump on deploy (Vite plugin or script) | `vite.config.ts`, `public/sw.js` | 1 hr |
| 18 | Add bundle size budget to Vite config + CI enforcement | `vite.config.ts`, CI workflow | 1 hr |
| 19 | DeepSeek provider documentation in design doc | Design doc | 15 min |

---

## Architecture Alignment Verification

| Component | Design Doc | Codebase | Match? |
|-----------|------------|----------|--------|
| `vercel.json` buildCommand | `npm run build` | `npm run build` | ✅ |
| `vercel.json` outputDirectory | `dist` | `dist` | ✅ |
| `vercel.json` SPA rewrites | `/(.*)` → `/index.html` | `/(.*)` → `/index.html` | ✅ |
| `vercel.json` static cache headers | `/images/*`, `/assets/*` 1yr immutable | Same | ✅ |
| `package.json` build script | `vite build` | `vite build` | ✅ |
| `package.json` React version | 19.2 | 19.2.0 | ✅ |
| `package.json` Vite version | 6 | 6.2.0 | ✅ |
| `vite.config.ts` Vitest config | Lines 50-54 | Lines 50-54 | ✅ |
| CI workflow | Only `blog-autopost.yml` | Only `blog-autopost.yml` | ✅ |
| `api/nvidia.ts` runtime | Claims Node.js 20 | **Edge runtime** | ❌ |
| `api/nvidia.ts` validation logic | Documented in tables | Matches code | ✅ |
| `api/nvidia.ts` upstream models | nemotron-3.5-bolt-e4b, minimax-m3.1-flash | Same | ✅ |
| `api/nvidia.ts` timeout | 12s per model | 12000ms | ✅ |
| `index.html` SW registration | Lines ~225-235 | Lines 225-235 | ✅ |
| `public/sw.js` version | v3 | `ayurvritta-v3` | ✅ |
| `public/sw.js` offline support | Documented | Implemented | ✅ |

---

## Testing Strategy Assessment

| Test Type | Exists? | Coverage | Notes |
|-----------|---------|----------|-------|
| Unit tests (components) | ❌ | 0% | Only translation, autopost, errorTracker tests |
| Unit tests (API route) | ❌ | 0% | **Critical gap** |
| Integration tests | ❌ | 0% | No test for Vercel function deployment |
| E2E tests | ❌ | 0% | No Playwright/Cypress config |
| Load/stress tests | ❌ | 0% | No k6/Artillery config |
| Contract tests | ❌ | 0% | No schema validation tests |
| Security tests | ❌ | 0% | No OWASP ZAP / SAST in CI |

**Verdict:** Testing strategy is **absent for infrastructure-critical code** (`api/nvidia.ts`). The design doc does not specify a testing strategy.

---

## Performance Budget Assessment

| Metric | Target | Current | Measured? |
|--------|--------|---------|-----------|
| Function max duration | 30s (doc) | 10s (Hobby default) | ❌ |
| Model timeout | 12s | 12s | ✅ (code) |
| Bundle size (JS) | Not defined | Unknown | ❌ |
| Bundle size (CSS) | Not defined | Unknown | ❌ |
| LCP | Not defined | Unknown | ❌ |
| FID/INP | Not defined | Unknown | ❌ |
| CLS | Not defined | Unknown | ❌ |
| TTI | Not defined | Unknown | ❌ |
| Cold start (Edge) | ~500ms | ~500ms | ✅ (platform) |
| Upstream latency (p95) | Not defined | ~1-2s | ❌ |

**Verdict:** No performance budgets defined or enforced. Design doc mentions model timeout but no end-to-end budgets.

---

## Migration/Compatibility Assessment

The design doc includes a **Phased Migration Plan (10 phases)** with clear priorities and dependencies. This is a **strength** — the remediation path is well-defined.

| Phase | Task | Priority | Ready to Execute? |
|-------|------|----------|-------------------|
| 1 | Add `functions` config to vercel.json | P0 | ✅ Yes |
| 2 | Add security headers to vercel.json | P0 | ✅ Yes |
| 3 | Implement rate limiting in api/nvidia.ts | P1 | ✅ Yes (design clear) |
| 4 | Add `/api/health.ts` endpoint | P1 | ✅ Yes |
| 5 | Configure CSP via vercel.json | P1 | ✅ Yes |
| 6 | Add response caching in api/nvidia.ts | P2 | ⚠️ Needs cache store decision (memory vs KV) |
| 7 | Verify/Enable Vercel Analytics | P2 | ✅ Yes |
| 8 | Configure staging for develop branch | P3 | ✅ Yes |
| 9 | Add server-side error tracking | P3 | ⚠️ Depends on egm-23 (errorTracker) |
| 10 | Document env vars in README | P3 | ✅ Yes |

**Compatibility Risks:**
- Edge → Node.js runtime change (if chosen) may require code adjustments (crypto, streams)
- CSP header may break inline scripts/styles — need `unsafe-inline` or nonce strategy
- Rate limiting in Edge function uses in-memory map (not shared across instances) — may need Vercel KV for accuracy

---

## Final Verdict

### **NEEDS WORK** — Infrastructure NOT Production-Ready

**The design document is an excellent audit and remediation guide, but the infrastructure it describes has 7 blocker/major gaps that must be resolved before production deployment.**

**Minimum Viable Production Checklist (P0 + P1):**
- [ ] `vercel.json` — `functions` config with `maxDuration: 30`
- [ ] `vercel.json` — Security headers on `/(.*)`
- [ ] `api/health.ts` — Created and deployed
- [ ] Runtime mismatch resolved (doc or code)
- [ ] `api/nvidia.ts` — Rate limiting implemented
- [ ] `api/nvidia.ts` — Response caching implemented
- [ ] `vercel.json` — CSP header configured
- [ ] `api/nvidia.ts` — Server-side error tracking added
- [ ] `tests/api/nvidia.test.ts` — Test coverage ≥80%

**Estimated Effort to Production-Ready:** ~12-15 hours

---

## Reviewer Notes

1. **Design Doc Quality:** The document is forensic-grade — it correctly identifies phantom configs and aligns with actual codebase. This is rare and valuable.

2. **Critical Finding — Runtime Mismatch:** The design doc claims Node.js 20 but code uses Edge runtime. This affects every performance/security assumption. Must be resolved first.

3. **Critical Finding — Function Timeout:** 12s × 2 models = 24s wall time > 10s Hobby limit. **Will fail in production on Hobby plan.** P0 fix required.

4. **Testing Gap:** Zero tests for the only serverless function is unacceptable for production. Add before deploy.

5. **SW Bug:** `/api/bookings` reference in SW is a silent data-loss bug. Fix or remove.

6. **CI Gap:** No PR validation pipeline. Add basic CI (typecheck + build + test) immediately.

---

*Review completed 2026-11-13. Next review after P0/P1 remediation.*