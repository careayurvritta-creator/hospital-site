# EGM-15 Deployment Infrastructure — Codebase Details Review

**Review Date**: 2026-11-13  
**Reviewer**: EGM Codebase Details Reviewer (subagent)  
**Target Document**: `design-docs/egm-15-deployment-infrastructure.md`  
**Codebase Root**: `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site`  
**Accuracy Score**: **5/10** — Significant factual errors in core infrastructure claims (runtime type, health endpoint existence, provider support). Document is partially aligned but contains multiple critical misstatements.

---

## Executive Summary

The design document attempts to describe the "actual" deployment state by contrasting against a "phantom" previous version. While it correctly identifies many missing features (security headers, rate limiting, caching, CSP), **the document itself contains critical inaccuracies** about what actually exists in the codebase:

| Area | Document Claim | Reality | Severity |
|------|----------------|---------|----------|
| **Health Endpoint** | "File does not exist" (4×) | `api/health.ts` exists, returns 200 OK | **Critical** |
| **API Runtime** | "Node.js 20 serverless, 1024MB, 10s/60s default" | **Edge runtime** (`runtime: 'edge'`), no memory config, ~30s edge limit | **Critical** |
| **Provider Support** | Only `NVIDIA_API_KEY` | **Dual provider**: DeepSeek (`DEEPSEEK_API_KEY`) + NVIDIA, auto-selected | **Critical** |
| **GA4 Implementation** | "Not implemented" | Implemented in `analytics/index.ts:83-121`, loaded via `AnalyticsProvider` on consent | **Warning** |
| **GA4 Env Var** | `VITE_GA_MEASUREMENT_ID` | `VITE_GA4_MEASUREMENT_ID` + `VITE_CLARITY_PROJECT_ID` | **Warning** |
| **Sentry** | "Not configured" | `@sentry/react` installed but `require()` fails in ESM/Vite → never initializes | **Warning** |
| **Event Tracker** | "local storage + endpoint" | Sends to `window.gtag` (GA4), no custom endpoint | **Suggestion** |
| **PWA / SW** | Not mentioned | `sw.js` (v3), `offline.html`, `manifest.json`, registered in `index.html` | **Suggestion** |
| **Build Type-Check** | "TypeScript compilation" step | `vite build` only — **no `tsc`**; type errors don't fail build | **Warning** |

---

## Findings Table

### Critical (3)

| ID | Finding | File:Line Evidence | Impact |
|----|---------|-------------------|--------|
| **C-1** | **`api/health.ts` EXISTS** — Document claims "File does not exist" in 4 locations (Gap Analysis table line 234, Monitoring line 162, Actual API Routes line 60, Migration Plan Phase 4). Actual file: `api/health.ts:1-14` returns `200 {status:'ok', message:'API is working', timestamp}`. | `api/health.ts:1-14` | Migration Plan Phase 4 ("Add `/api/health.ts`") is **already done**; monitoring section is wrong; any external uptime checks against `/api/health` would work. |
| **C-2** | **`api/nvidia.ts` is an Edge Function**, not a Node.js serverless function. `export const config = { runtime: 'edge' }` at `api/nvidia.ts:21-23`. Document claims: "Runtime: Node.js 20", "Memory: 1024 MB", "Cold start: ~50ms warm / ~500ms cold", "Max duration: 10s Hobby / 60s Pro". Edge functions have no memory config, near-zero cold start, and a ~30s hard limit (code comment `nvidia.ts:35`: "Keeps us under Vercel's ~30s edge limit"). | `api/nvidia.ts:21-23,35` | Migration Plan Phase 1 ("Add `functions` config with `maxDuration: 30`") is **meaningless for Edge runtime** — `functions` config does not apply to edge functions; maxDuration is set differently or not at all. Capacity planning based on Node.js defaults is wrong. |
| **C-3** | **DeepSeek provider support completely omitted**. `api/nvidia.ts` auto-selects provider: if `DEEPSEEK_API_KEY` set → uses DeepSeek (`deepseek-chat` or `DEEPSEEK_MODEL`); else NVIDIA. Document's Environment Variables section (lines 124-137) lists **only** `NVIDIA_API_KEY` as required. Also missing: `DEEPSEEK_MODEL`, `NVIDIA_MODEL` for model override. | `api/nvidia.ts:5-7, 25-26, 30-33, 86-95, 125-128` | Production deployment missing a documented env var; CI/CD config incomplete; the "phantom" DeepSeek path is actually the primary if key present. |

### Warning (7)

| ID | Finding | File:Line Evidence | Impact |
|----|---------|-------------------|--------|
| **W-1** | **Missing API key error response differs**. Document (line 88): `500 { error: 'AI service temporarily unavailable' }`. Actual (`nvidia.ts:89-93`): `500 { error: 'Nvidia API key not configured' }` or `500 { error: 'DeepSeek API key not configured' }` — **specific, provider-aware message**. | `api/nvidia.ts:89-93` | Monitoring/alerting on exact error string will mismatch; debugging harder. |
| **W-2** | **GA4 IS implemented** but gated. Document (line 172): "Google Analytics: Not implemented". Actual: `analytics/index.ts:83-121` exports `loadGA4()` which injects `gtag` script; `components/AnalyticsProvider.tsx:110-111,124-125` calls `loadGA4()`/`loadClarity()` on analytics consent. Env var is `VITE_GA4_MEASUREMENT_ID` (config.ts:16), not `VITE_GA_MEASUREMENT_ID`. | `analytics/index.ts:83-121`, `components/AnalyticsProvider.tsx:110-111,124-125`, `analytics/config.ts:16` | Doc understates analytics capability; env var name mismatch could cause deployment confusion. |
| **W-3** | **Additional client-side env vars undocumented**: `VITE_CLARITY_PROJECT_ID` (config.ts:20), `VITE_SENTRY_DSN` (errorTracker.ts:34). Document only mentions `VITE_SENTRY_DSN` and `VITE_GA_MEASUREMENT_ID`. | `analytics/config.ts:16,20`, `analytics/errorTracker.ts:34` | Missing env var docs → deployment gaps. |
| **W-4** | **Build has no TypeScript type-check step**. `package.json:8`: `"build": "vite build"` only. Vite uses esbuild to transpile (strips types) — **no `tsc`**. Document (line 101): "TypeScript compilation (~5.8)" implies type-checking step. | `package.json:8`, `vite.config.ts:29` (`minify: 'esbuild'`), `tsconfig.json` (not invoked) | Type errors don't block deploy; "compilation" claim is misleading. |
| **W-5** | **`@sentry/react` installed but unusable**. `package.json:15`: `"@sentry/react": "^10.52.0"`. `errorTracker.ts:33` uses `require('@sentry/react')` — **fails in ESM/Vite** (`ReferenceError: require is not defined`), caught silently → fallback tracking only. Sentry never initializes regardless of DSN. | `package.json:15`, `analytics/errorTracker.ts:22-52` | Dependency present but dead code; Sentry cannot be enabled without refactor to dynamic `import()`. |
| **W-6** | **EventTracker uses GA4 `gtag`, not a custom endpoint**. Document (line 173): "Custom analytics: `analytics/eventTracker.ts` exists (local storage + endpoint)". Actual: `eventTracker.ts:495-503` calls `(window as any).gtag('event', ...)` — requires GA4 script loaded. No custom endpoint. | `analytics/eventTracker.ts:495-503` | Misrepresents data flow; no server-side analytics ingestion exists. |
| **W-7** | **Service Worker / PWA infrastructure completely absent from document**. Files: `public/sw.js` (cache version `ayurvritta-v3`, lines 1-8), `public/offline.html`, `public/manifest.json`, registered in `index.html:224-236`. SW caches static assets, provides offline page, interacts with `/images/*` and `/assets/*` caching from `vercel.json`. | `public/sw.js:1-8`, `index.html:224-236`, `vercel.json:4-17` | SW cache versioning must be bumped on deploy; stale SW can serve old app shell; interacts with immutable asset caching. |

### Suggestion (7)

| ID | Finding | File:Line Evidence | Impact |
|----|---------|-------------------|--------|
| **S-1** | **Production domain confirmed but not documented**. `api/nvidia.ts:40-47` `ALLOWED_ORIGIN_HOSTS` includes `ayurvrittaayurveda.in` / `www.ayurvrittaayurveda.in`; `robots.txt:55` sitemap URL uses same domain; `index.html:33,41,46,52,56,57,86,95,128` all reference `https://ayurvrittaayurveda.in`. | `api/nvidia.ts:40-47`, `public/robots.txt:55`, `index.html` | Domain should be in Infrastructure table; DNS/CNAME notes missing. |
| **S-2** | **Duplicate entries in `ALLOWED_ORIGIN_HOSTS`**. `nvidia.ts:41-44`: `ayurvrittaayurveda.in`, `www.ayurvrittaayurveda.in` listed **twice each**. Harmless but sloppy. | `api/nvidia.ts:41-44` | Code hygiene. |
| **S-3** | **Vercel bot branches suggest Speed Insights / Web Analytics attempted**. `git branch -a` shows `remotes/origin/vercel/set-up-vercel-speed-insights-f-63rjn6` and `vercel/vercel-web-analytics-to-projec-6xzhrx`. No `@vercel/analytics` or `@vercel/speed-insights` in `package.json` → likely not merged. Document line 172: "Vercel Analytics: Not confirmed" — partially confirmed attempted. | `.github/workflows/` (no config), `package.json` (no packages), git branches | Worth noting in Monitoring section. |
| **S-4** | **No `.env.example` file exists**; README has no env var documentation. Migration Plan Phase 10 ("Document all env vars in project README") still valid. | `glob .env*` (no matches), `README.md` (no env section) | Onboarding/deployment friction. |
| **S-5** | **Migration Plan Phase 1 invalid for Edge runtime**. Adding `"functions": { "api/nvidia.ts": { "maxDuration": 30 } }` to `vercel.json` **does not affect Edge functions**. Edge function duration is controlled by Vercel platform limits (~30s) and code-level timeouts (`MODEL_TIMEOUT_MS=12000`). | `api/nvidia.ts:21-23,35-36`, `vercel.json` (no `functions` key) | Remediation plan contains unactionable step. |
| **S-6** | **Recommended CSP connect-src incorrect**. Document (lines 200-208): `connect-src 'self' https://api.nvidia.com;`. Actual upstream: `https://integrate.api.nvidia.com` (nvidia.ts:25) **and** `https://api.deepseek.com` (nvidia.ts:26). CSP would block DeepSeek if enabled. | `api/nvidia.ts:25-26` | CSP as written would break failover provider. |
| **S-7** | **Environment table omits `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL`, `NVIDIA_MODEL`**. These are read in `api/nvidia.ts:86-95,125-128`. | `api/nvidia.ts:86-95,125-128` | Incomplete env var reference for deploy. |

---

## Detailed Findings with Code References

### 1. Health Endpoint — Document Contradicts Itself (C-1)

**Document claims (4 occurrences):**
- Line 49: "`/api/health.ts` endpoint — File does not exist"
- Line 162: "No `/api/health` endpoint exists"
- Line 234: Gap Analysis — "`/api/health.ts` exists — File does not exist — Blocker"
- Migration Plan Phase 4: "Add `/api/health.ts` endpoint for monitoring"

**Actual code** (`api/health.ts:1-14`):
```typescript
/**
 * Health check endpoint
 */
export default async function handler(req: Request) {
  return new Response(JSON.stringify({ 
    status: 'ok',
    message: 'API is working',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

**Impact**: The health endpoint **exists and works**. Migration Plan Phase 4 is already complete. Any uptime monitor configured against `/api/health` would succeed. Document's "Blocker" severity is wrong.

---

### 2. API Runtime — Edge vs Node.js (C-2)

**Document claims (lines 150-155):**
```
Runtime: Node.js 20 (Vercel default) ✅
Max duration: Vercel default (10s Hobby, 60s Pro) — NOT 30s configured
Memory: 1024 MB (default) ✅
Cold start: ~50ms (warm), ~500ms (cold) ✅
```

**Actual code** (`api/nvidia.ts:21-23, 35-36`):
```typescript
export const config = {
  runtime: 'edge',
};

// ...
const MODEL_TIMEOUT_MS = 12000;
// Per-model budget. Keeps us under Vercel's ~30s edge limit across models.
```

**Key differences:**
| Property | Document | Reality (Edge) |
|----------|----------|----------------|
| Runtime | Node.js 20 | **Edge (V8 isolates)** |
| Memory | 1024 MB | Not configurable |
| Cold start | ~500ms | **~0-50ms** (no Node bootstrap) |
| Max duration | 10s/60s | **~30s hard limit** (platform) |
| `functions` config | Applies | **Ignored for edge** |

**Impact**: Migration Plan Phase 1 ("Add `functions` config with `maxDuration: 30`") is **not applicable** to edge functions. The `vercel.json` `functions` key only configures Node.js serverless functions. Edge function limits are platform-enforced. The code already enforces per-model 12s timeout to stay within the ~30s edge budget.

---

### 3. Dual Provider Support — DeepSeek Omitted (C-3)

**Document** (lines 124-137, 194): Lists only `NVIDIA_API_KEY` as required server-side env var.

**Actual code** (`api/nvidia.ts:5-7, 25-26, 86-95, 125-128`):
```typescript
// Provider selection (automatic, no code change needed):
// - If DEEPSEEK_API_KEY is set in Vercel env -> uses DeepSeek's own API
//   (api.deepseek.com, model "deepseek-chat") - fast, cheap and reliable.
// - Otherwise falls back to Nvidia NIM (integrate.api.nvidia.com).

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

// ...

const useDeepseek = Boolean(process.env.DEEPSEEK_API_KEY);
const apiKey = useDeepseek ? process.env.DEEPSEEK_API_KEY : process.env.NVIDIA_API_KEY;
const apiUrl = useDeepseek ? DEEPSEEK_API_URL : NVIDIA_API_URL;

const candidates = (useDeepseek
  ? [process.env.DEEPSEEK_MODEL || 'deepseek-chat']
  : [process.env.NVIDIA_MODEL, ...DEFAULT_NVIDIA_MODELS]
).filter(...);
```

**Missing env vars from document:**
- `DEEPSEEK_API_KEY` — enables DeepSeek path (primary if set)
- `DEEPSEEK_MODEL` — override DeepSeek model (default: `deepseek-chat`)
- `NVIDIA_MODEL` — override primary NVIDIA model (prepended to fallback list)

**Impact**: Production deployment docs incomplete. If `DEEPSEEK_API_KEY` is set (as the comment suggests for "fast, cheap and reliable"), the NVIDIA key becomes unused. CI/CD and Vercel env var configuration must account for both.

---

### 4. GA4 Implementation Exists (W-2)

**Document** (line 172): "Google Analytics: Not implemented"

**Actual code**:
- `analytics/index.ts:83-121` — `loadGA4()` injects GTM script, initializes `gtag`, configures consent mode
- `analytics/index.ts:126-140` — `loadClarity()` loads Microsoft Clarity
- `components/AnalyticsProvider.tsx:110-111, 124-125` — calls both on analytics consent

```typescript
// AnalyticsProvider.tsx:108-126
if (state.analytics && !gaLoaded) {
  loadGA4();
  loadClarity();
  gaLoaded = true;
}
```

**Env var names** (config.ts:16,20):
```typescript
export const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || 'G-XXXXXXXXXX';
export const CLARITY_PROJECT_ID = import.meta.env.VITE_CLARITY_PROJECT_ID || 'XXXXXXXXXX';
```
Document uses `VITE_GA_MEASUREMENT_ID` (wrong prefix/name).

---

### 5. Sentry Installed But Unusable (W-5)

**Document** (line 169): "Sentry: Not configured (`VITE_SENTRY_DSN` not set)"

**Actual code** (`analytics/errorTracker.ts:22-52`):
```typescript
let Sentry: typeof import('@sentry/react') | null = null;

export const initErrorTracking = (): void => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Sentry = require('@sentry/react');  // ← FAILS in ESM/Vite
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    if (dsn && dsn !== 'YOUR_SENTRY_DSN') {
      Sentry.init({ ... });
      isSentryInitialized = true;
    }
  } catch {
    console.info('[ErrorTracker] Using fallback error tracking');
  }
};
```

**Problem**: Project has `"type": "module"` (`package.json:5`). Vite bundles ESM. `require()` is **not available** → throws `ReferenceError` → caught silently → `isSentryInitialized` stays `false`. Even with valid DSN, Sentry never initializes.

**Fix**: Replace `require` with dynamic `import()`:
```typescript
const SentryModule = await import('@sentry/react');
Sentry = SentryModule;
```

---

### 6. Service Worker / PWA Missing from Doc (W-7, S-1)

**Files present**:
- `public/sw.js` — Cache version `ayurvritta-v3` (line 7), caches static assets, serves `offline.html`
- `public/offline.html` — Offline fallback page
- `public/manifest.json` — PWA manifest
- `index.html:224-236` — Registers SW on load

```javascript
// index.html:224-236
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registered:', registration))
      .catch(err => console.log('SW registration failed:', err));
  });
}
```

**Interaction with `vercel.json` caching**: SW caches `/` (index.html), `/manifest.json`, `/offline.html`. `vercel.json` sets 1-year immutable cache on `/images/*` and `/assets/*`. On deploy, SW version must be bumped (`ayurvritta-v3` → `v4`) or users may see stale app shell despite new assets.

**Document omission**: Entire PWA/SW layer absent from Infrastructure, Monitoring, or Rollback sections.

---

### 7. Build Pipeline — No Type-Check (W-4)

**Document** (lines 98-105):
```
npm ci
npm run build (Vite 6)
  ├─ TypeScript compilation (~5.8)
  ├─ Vite bundle (esbuild/Rolldown)
  ├─ CSS extraction (Tailwind v3)
  └─ Asset hashing
```

**Actual** (`package.json:8`, `vite.config.ts:29`):
```json
"build": "vite build"
```
```typescript
build: {
  minify: 'esbuild',  // not Rolldown (Vite 6 uses Rollup)
  target: 'esnext',
}
```

**Missing**: No `tsc --noEmit` or `vue-tsc` step. Vite's `build` uses esbuild to **transpile only** (strips types). Type errors **do not fail the build**.

**Recommendation**: Add `"build": "tsc --noEmit && vite build"` or use `vite-plugin-checker`.

---

### 8. CSP Recommendation Would Block DeepSeek (S-6)

**Document** (lines 200-208):
```http
Content-Security-Policy:
  connect-src 'self' https://api.nvidia.com;
```

**Actual upstreams** (`api/nvidia.ts:25-26`):
```typescript
const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
```

**Issue**: `connect-src` allows `api.nvidia.com` but actual NVIDIA endpoint is `integrate.api.nvidia.com` (subdomain mismatch). DeepSeek `api.deepseek.com` not allowed. CSP as written breaks both providers.

**Correct CSP** would need:
```http
connect-src 'self' https://integrate.api.nvidia.com https://api.deepseek.com;
```

---

### 9. Migration Plan Phase 1 Invalid for Edge (S-5)

**Phase 1** (line 249): "Add `functions` config to vercel.json with `maxDuration: 30` for `api/nvidia.ts`"

**Problem**: `vercel.json` `functions` config **only applies to Node.js serverless functions**. Edge functions (declared via `export const config = { runtime: 'edge' }`) ignore this key. Edge function duration is platform-limited (~30s). The code already self-limits via `MODEL_TIMEOUT_MS=12000` × 2 models = ~24s max.

**Valid remediation**: None needed for duration; the 12s per-model timeout is appropriate. If more time needed, must optimize upstream calls, not config.

---

## Verified Reality vs Document Claims Comparison Table

| Category | Document Claim | Verified Reality | Match? |
|----------|----------------|------------------|--------|
| **Hosting Platform** | Vercel static SPA + 1 serverless function | Vercel static SPA + **1 Edge function** (`runtime: 'edge'`) | ⚠️ Partial |
| **Build Command** | `npm run build` | `npm run build` → `vite build` | ✅ |
| **Output Directory** | `dist` | `dist` (vite.config.ts:28) | ✅ |
| **vercel.json headers** | Cache-Control on `/images/*`, `/assets/*` | Exactly matches (lines 4-17) | ✅ |
| **vercel.json rewrites** | `/(.*)` → `/index.html` | Matches (lines 18-20) | ✅ |
| **vercel.json functions** | Absent (phantom) | Absent — **correct**, but doc wrongly implies it should be added | ✅/⚠️ |
| **Security Headers** | None on `/(.*)` | None — **correct** | ✅ |
| **API Routes** | Only `api/nvidia.ts` | **Two routes**: `api/nvidia.ts` + `api/health.ts` | ❌ |
| **Health Endpoint** | Does not exist | Exists, returns 200 OK | ❌ |
| **NVIDIA Proxy Runtime** | Node.js 20 serverless | **Edge runtime** | ❌ |
| **Max Duration** | 10s/60s (Vercel default) | ~30s edge platform limit | ❌ |
| **Memory** | 1024 MB | Not applicable (Edge) | ❌ |
| **Cold Start** | ~500ms | Near-zero | ❌ |
| **Provider** | NVIDIA only | **DeepSeek (primary if key) + NVIDIA fallback** | ❌ |
| **Env Vars (server)** | `NVIDIA_API_KEY` only | `NVIDIA_API_KEY`, `DEEPSEEK_API_KEY`, `NVIDIA_MODEL`, `DEEPSEEK_MODEL` | ❌ |
| **Env Vars (client)** | `VITE_SENTRY_DSN`, `VITE_GA_MEASUREMENT_ID` | `VITE_SENTRY_DSN`, `VITE_GA4_MEASUREMENT_ID`, `VITE_CLARITY_PROJECT_ID` | ⚠️ |
| **Missing API Key Error** | Generic "AI service temporarily unavailable" | Provider-specific message | ❌ |
| **Rate Limiting** | Not implemented | Not implemented | ✅ |
| **Response Caching** | Not implemented | Not implemented | ✅ |
| **Mock Fallback** | Not implemented | Not implemented (502) | ✅ |
| **GA4** | Not implemented | Implemented (consent-gated, loads gtag) | ❌ |
| **Clarity** | Not mentioned | Implemented (consent-gated) | ❌ |
| **Sentry** | Not configured (DSN not set) | Installed but **broken** (require fails in ESM) | ❌ |
| **Event Tracker** | Local storage + endpoint | Sends to `window.gtag` (GA4) | ❌ |
| **PWA / SW** | Not mentioned | Full SW (v3), offline.html, manifest, registered | ❌ |
| **Build Type-Check** | TypeScript compilation step | **No type-check** (vite build only) | ❌ |
| **Staging Env** | Not configured (no `develop`) | No `develop` branch; only `main` + Vercel bot branches | ✅ |
| **Rollback** | Vercel instant rollback | Vercel instant rollback | ✅ |
| **RTO/RPO** | <5 min / 0 | <5 min / 0 (stateless) | ✅ |
| **Production Domain** | Not stated | `ayurvrittaayurveda.in` (confirmed in code) | ❌ |

---

## Conclusion

The document **correctly identifies missing production hardening** (security headers, rate limiting, CSP, caching, monitoring) but **fails to accurately describe the current deployed reality** in three critical areas:

1. **Health endpoint exists** — Document says it doesn't (4×). Migration Plan Phase 4 is already done.
2. **API is Edge runtime, not Node.js** — All runtime characteristics (memory, cold start, max duration, `functions` config applicability) are wrong. Migration Plan Phase 1 proposes an invalid fix.
3. **Dual provider (DeepSeek + NVIDIA) completely undocumented** — Server-side env vars, model selection, and failover logic missing from Environment Variables and API Behavior sections.

**Additional notable gaps**: GA4/Clarity implemented but documented as absent; Sentry installed but broken; Service Worker/PWA layer absent; build lacks type-check; CSP recommendation would block actual upstreams.

**Recommended actions**:
1. **Immediately correct** the health endpoint, runtime type, and provider support sections.
2. **Remove or rewrite** Migration Plan Phase 1 (invalid for Edge) and Phase 4 (already done).
3. **Add** DeepSeek env vars to Environment Variables table.
4. **Document** PWA/SW infrastructure and its interaction with `vercel.json` caching.
5. **Fix** Sentry initialization (dynamic import) if Sentry is desired.
6. **Add** `tsc --noEmit` to build script for type safety.
7. **Create** `.env.example` and update README with env var docs (Migration Plan Phase 10).

**Overall Accuracy**: **5/10** — The document is useful as a "gap analysis vs ideal" but unreliable as a "current state reference" due to fundamental factual errors in core infrastructure description.