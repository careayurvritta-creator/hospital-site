# EGM-15: Deployment & Infrastructure Architecture

## Overview
The application is deployed on Vercel as a **static SPA (Vite + React 19)** with **one serverless function** (`/api/nvidia.ts`) acting as a proxy to NVIDIA NIM. The previous version of this doc described a phantom `vercel.json` with functions config, security headers, health endpoint, rate limiting, and caching — **none of which exist in the actual configuration**.

---

## Actual Vercel Configuration (`vercel.json` — 21 lines)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/images/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### What's Actually Configured
| Setting | Value | Notes |
|---------|-------|-------|
| Build command | `npm run build` | Standard Vite build |
| Output directory | `dist` | Vite default |
| **Functions config** | ❌ **NONE** | No `functions` key — uses Vercel defaults |
| **Security headers** | ❌ **NONE** | No X-Content-Type-Options, X-Frame-Options, Referrer-Policy on `/(.*)` |
| Static asset caching | ✅ `/images/*`, `/assets/*` | 1 year, immutable |
| SPA routing | ✅ Rewrite `/(.*)` → `/index.html` | Client-side routing |

### What the Previous Doc Claimed (PHANTOM — DOES NOT EXIST)
| Phantom Config | Reality |
|----------------|---------|
| `"functions": { "api/**/*.ts": { "maxDuration": 30 } }` | **Not in vercel.json** — Vercel defaults apply |
| Security headers on `/(.*)` | **Not in vercel.json** — Only cache headers on `/images/*` and `/assets/*` |
| `/api/health.ts` endpoint | **File does not exist** — Only `api/nvidia.ts` exists |
| Rate limiting (60 req/min/IP) | **Not implemented** — No edge middleware |
| Response caching (5 min) | **Not implemented** — No caching in `api/nvidia.ts` |
| Fallback to mock responses | **Not implemented** — `api/nvidia.ts` returns 502 on upstream failure |

---

## Actual API Routes

```
api/
└── nvidia.ts      # ONLY serverless function — Nvidia NIM proxy
```

### `api/nvidia.ts` — Actual Behavior

**Request Validation (4xx)**
| Check | Code | Response |
|-------|------|----------|
| Method not POST | 405 | `{ error: 'Method not allowed' }` |
| Origin not allowed | 403 | `{ error: 'Origin not allowed' }` |
| Missing messages | 400 | `{ error: 'messages array is required' }` |
| Too many messages (>40) | 413 | `{ error: 'Too many messages (max 40)' }` |
| Message too large (>12000 chars) | 413 | `{ error: 'Message too large' }` |
| Request too large (>40000 chars total) | 413 | `{ error: 'Request too large' }` |

**Upstream Proxy Logic**
- **Models tried in order** (when `NVIDIA_API_KEY` configured):
  1. `nvidia/nemotron-3.5-bolt-e4b` (primary)
  2. `minimaxai/minimax-m3.1-flash` (backup)
- **Retryable status codes**: `[403, 404, 410, 429, 500, 502, 503, 504]`
- **Model timeout**: 12 seconds per model (`AbortController`)
- **No response caching** — every request hits upstream
- **No rate limiting** — relies on upstream limits
- **No fallback to mock** — returns 502 if all models fail

**Error Responses (5xx)**
| Scenario | Code | Response |
|----------|------|----------|
| No API key configured | 500 | `{ error: 'AI service temporarily unavailable' }` |
| All models failed | 502 | `{ error: 'AI service temporarily unavailable' }` |
| Upstream non-retryable error | Passthrough | `{ error: 'AI API error (<status>)' }` |
| JSON parse failure | 500 | `{ error: 'Internal server error' }` |

---

## Build Pipeline (Actual)

```
Git Push → Vercel Build
  ├─ npm ci
  ├─ npm run build (Vite 6)
  │   ├─ TypeScript compilation (~5.8)
  │   ├─ Vite bundle (esbuild/Rolldown)
  │   ├─ CSS extraction (Tailwind v3)
  │   └─ Asset hashing
  └─ Deploy SPA to CDN + api/nvidia.ts as serverless function
```

**No separate "API function bundling" step** — Vercel auto-detects `api/` directory.

---

## Environments (Actual)

| Environment | Branch | Notes |
|-------------|--------|-------|
| Production | `main` | Vercel production deployment |
| Preview | `feature/*`, PR branches | Auto-generated `*.vercel.app` URLs |
| **Staging** | ❌ **No `develop` branch deployment** | Not configured |

---

## Environment Variables (Actual Requirements)

### Required for Production
```bash
# Server-side only (set in Vercel Dashboard → Settings → Environment Variables)
NVIDIA_API_KEY=***          # Required for /api/nvidia.ts proxy to work
```

### Client-Side (VITE_ prefixed — exposed in bundle)
```bash
# Optional — only if features need them
VITE_SENTRY_DSN=            # For error tracking (optional)
VITE_GA_MEASUREMENT_ID=     # For Google Analytics (optional, not currently used)
```

**Note**: The previous doc listed `VITE_API_BASE_URL`, `VITE_NVIDIA_API_KEY` (client-side!), `VITE_ANALYTICS_ENDPOINT` — **these are not used** by the current codebase. The AI proxy uses server-side `NVIDIA_API_KEY` only.

---

## Infrastructure Components (Actual)

### CDN (Vercel Edge Network)
- Global edge locations: 35+ regions ✅
- Automatic HTTPS ✅
- HTTP/2 + HTTP/3 ✅
- Brotli compression ✅
- Edge caching: Only for `/images/*` and `/assets/*` (per vercel.json)

### Serverless Function (`api/nvidia.ts`)
- Runtime: Node.js 20 (Vercel default) ✅
- Max duration: **Vercel default (10s Hobby, 60s Pro)** — NOT 30s configured
- Memory: 1024 MB (default) ✅
- Cold start: ~50ms (warm), ~500ms (cold) ✅
- Concurrency: Automatic scaling ✅

---

## Monitoring & Observability (Actual)

### Health Checks
- **No `/api/health` endpoint exists**
- Vercel built-in uptime monitoring only
- No custom health check implementation

### Error Tracking
- Client-side: `analytics/errorTracker.ts` (Sentry optional, fallback to local eventTracker)
- Server-side: **No error tracking in `api/nvidia.ts`** — errors only in Vercel function logs
- Sentry: **Not configured** (`VITE_SENTRY_DSN` not set)

### Analytics
- Vercel Analytics: **Not confirmed enabled** (no `VITE_GA_MEASUREMENT_ID` used)
- Custom analytics: `analytics/eventTracker.ts` exists (local storage + endpoint)
- Google Analytics: **Not implemented**

---

## Security (Actual vs Recommended)

### Current Headers (from vercel.json)
| Header | Scope | Value |
|--------|-------|-------|
| `Cache-Control` | `/images/*`, `/assets/*` | `public, max-age=31536000, immutable` |

### Missing Security Headers (Not in vercel.json)
| Header | Recommended Value |
|--------|-------------------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Content-Security-Policy` | See recommended below |

### API Security (Actual)
- Nvidia API key: **Server-side only** (`NVIDIA_API_KEY` in Vercel env) ✅
- Rate limiting: **NOT implemented** ❌
- Input validation: **Implemented in `api/nvidia.ts`** ✅
- CORS: **Origin check in `api/nvidia.ts`** (allows same-origin + configured origins) ✅

### Recommended CSP (Not Configured)
```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https://images.unsplash.com;
  connect-src 'self' https://api.nvidia.com;
```

---

## Rollback Strategy (Actual)
- **Vercel**: Instant rollback via dashboard (previous deployment) ✅
- **DNS**: Vercel manages ✅
- **Database**: No database (stateless) ✅
- **State**: No server state to migrate ✅

---

## Disaster Recovery (Actual)
- **RTO**: <5 minutes (Vercel redeploy) ✅
- **RPO**: 0 (no data loss — stateless) ✅
- **Backup**: Git repository is source of truth ✅
- **Recovery**: `git revert` + push to main ✅

---

## Gap Analysis (Previous Doc vs Reality)

| Previous Doc Claim | Reality | Severity |
|--------------------|---------|----------|
| `functions` config with `maxDuration: 30` | **Absent** — uses Vercel defaults | Blocker |
| Security headers on `/(.*)` | **Absent** — only cache headers on static assets | Blocker |
| `/api/health.ts` exists | **File does not exist** | Blocker |
| Rate limiting (60 req/min/IP) | **Not implemented** | Major |
| Response caching (5 min) | **Not implemented** | Major |
| Fallback to mock responses | **Not implemented** — returns 502 | Major |
| `VITE_NVIDIA_API_KEY` client-side env | **Security risk** — key is server-side only | Blocker |
| Vercel Analytics enabled | **Not confirmed** | Minor |
| Staging environment on `develop` | **Not configured** | Minor |
| CSP recommended | **Not configured** | Major |

---

## Migration Plan (Phased Remediation)

| Phase | Task | Priority | Dependencies |
|-------|------|----------|--------------|
| 1 | **Add `functions` config to vercel.json** with `maxDuration: 30` for `api/nvidia.ts` | P0 | None |
| 2 | **Add security headers** to vercel.json for `/(.*)` | P0 | None |
| 3 | **Implement rate limiting** in `api/nvidia.ts` (or edge middleware) | P1 | None |
| 4 | **Add `/api/health.ts`** endpoint for monitoring | P1 | None |
| 5 | **Configure CSP** via vercel.json headers | P1 | Phase 2 |
| 6 | **Add response caching** for identical prompts in `api/nvidia.ts` | P2 | None |
| 7 | **Verify/Enable Vercel Analytics** in project settings | P2 | None |
| 8 | **Configure staging environment** for `develop` branch | P3 | None |
| 9 | **Add server-side error tracking** in `api/nvidia.ts` → `errorTracker` | P3 | Phase 1 of egm-23 |
| 10 | **Document all env vars** in project README | P3 | None |

---

## Traceability to Master Report

| Master Action | This Doc Sections |
|---------------|-------------------|
| A8: Fix vercel.json — remove phantom `functions` config, security headers | Actual Vercel Configuration, Gap Analysis |
| A9: Document actual `api/nvidia.ts` behavior (no caching, no rate limiting, no mock fallback) | Actual API Routes |
| A10: Remove phantom `/api/health.ts` | Actual API Routes, Gap Analysis |
| A11: Correct env vars — `NVIDIA_API_KEY` server-side only | Environment Variables |
| A12: Add missing security headers to vercel.json | Security, Migration Plan |
| A13: Document actual build pipeline (no separate API bundling) | Build Pipeline |

---

*Last updated: 2026-11-13 — Aligned with actual codebase verification*