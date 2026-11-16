# EGM-17 Performance Architecture — Implementation Readiness Review

**Design Document:** `design-docs/egm-17-performance.md`  
**Review Date:** 2026-11-13  
**Reviewer:** OpenCode Agent (via `code-review` skill + `code-explorer` verification)  
**Codebase Commit:** Current working tree (`hospital-site/`)

---

## Executive Summary

| Dimension | Score (1–10) | Rationale |
|-----------|--------------|-----------|
| **Overall Implementability** | **3 / 10** | The design document describes an aspirational target architecture that **does not match the current codebase** in 14+ material ways. Implementing from this doc as-is would produce incorrect work estimates, missed dependencies, and runtime gaps. |
| Requirements Clarity | 4 | Targets are specific but presented as "Current (Estimated)" with no measurement evidence; several claims are contradicted by actual code. |
| Architecture Alignment | 2 | Document describes React 18, Inter font, Vercel Analytics, no SW — actual: React 19, Montserrat/Philosopher, 20-module custom analytics, full SW v3. |
| Component Spec Completeness | 3 | Key components (SEO injection plugin, rate-limit middleware, bundle budget CI, Lighthouse CI) are documented as implemented/configured but **do not exist**. |
| Data Flow Definition | 4 | Caching/API flows described but omit the actual custom analytics pipeline and SW fetch handling. |
| Integration Points | 3 | Mentions Vercel edge functions for rate limiting; actual has no `middleware.ts`, no `vercel.json` functions config. |
| Dependencies Identified | 2 | Lists `tesseract.js` and `pdf.js` as dependencies — **neither is in `package.json`**. Omits `@sentry/react`, `recharts`, `html2canvas` which are present. |
| Edge Cases Covered | 3 | Offline support documented as "Future" — actual SW v3 implements it. No discussion of React 19 migration implications. |
| Testing Strategy | 2 | Lighthouse CI "Not configured (TODO)" — no CI config exists. No bundle-size budget enforcement. Vitest present but no performance tests. |
| Performance Budget | 1 | Targets listed (LCP < 2.5s, etc.) but **no measurement baseline**, no CI gate, no budget tooling (`size-limit`, `bundlewatch` absent). |
| Migration/Compatibility | 2 | No migration path from React 18→19, no compat notes for SW v3 upgrade, no analytics migration from custom→Vercel (or vice versa). |

> **Verdict:** **DO NOT USE this document for implementation planning** without a major rewrite. The document is a *design aspiration*, not a *current-state specification*. Treat it as a requirements target to be validated, not a build guide.

---

## Findings Table

| # | Design Doc Claim (§) | Codebase Reality | Evidence | Severity |
|---|----------------------|------------------|----------|----------|
| F1 | "React 18" (Rendering) | **React 19.2.0** | `package.json:19-20` | 🔴 Critical |
| F2 | "Vercel Analytics: Enabled (free tier)" (Monitoring) | **20-module custom analytics system** (`performanceMonitor.ts`, `errorTracker.ts`, `abTestManager.ts`, etc.) | `analytics/` dir (20 files) | 🔴 Critical |
| F3 | "Service Worker (Not Implemented)" (Caching) | **Full SW v3** (`ayurvritta-v3`) with static/dynamic caches, offline.html, bounded dynamic cache (60 entries) | `public/sw.js:9-12, 15-60` | 🔴 Critical |
| F4 | Dependencies: `tesseract.js` (40 KB), `pdf.js` (30 KB) | **Absent from `package.json`** | `package.json:14-23` | 🔴 Critical |
| F5 | Dependencies: omits `@sentry/react`, `recharts`, `html2canvas` | **Present in `package.json`** (Sentry 10.52, Recharts 3.5, html2canvas 1.4) | `package.json:15-17, 22` | 🔴 Critical |
| F6 | Code splitting: route + component + library chunks (vendor, tools, blog, insurance, reactbits) | **Only `vendor-charts` manual chunk** (recharts/d3). Route-level lazy exists (`App.tsx:9-19`). No component-level lazy for tools/reactbits/AI chat visible. | `vite.config.ts:33-37`, `App.tsx:9-19` | 🟠 High |
| F7 | Font: "Variable font: Inter (single file, all weights), Subsetting: Latin + Devanagari + Gujarati" | **Montserrat + Philosopher** from Google Fonts (multiple weights, no Devanagari subset visible) | `index.html:64-74` | 🟠 High |
| F8 | SEO: "All SEO metadata in `seo.ts` … Injected into `index.html` at build via Vite plugin" | **No Vite plugin for SEO injection**. `seo.ts` (894 lines) imported directly in components (`SEOHead.tsx`). | `vite.config.ts:26` (plugins), `App.tsx:4` | 🟠 High |
| F9 | Preload: `<link rel="preload" as="script" href="/assets/index-<hash>.js">` and CSS | **No JS/CSS preload** (hashed filenames unknown at build). Only font stylesheet preload present. | `index.html:59-74` | 🟠 High |
| F10 | Preconnect: `api.nvidia.com`, `images.unsplash.com` | **Only `fonts.googleapis.com` + `fonts.gstatic.com`** | `index.html:60-61, 64-65` | 🟠 High |
| F11 | Rate limiting: "Server-side: 60 req/min/IP (Vercel edge)" | **No `middleware.ts`, no `vercel.json` functions config**. `vercel.json` is 21 lines (build + headers + rewrite only). | `vercel.json:1-21` | 🟠 High |
| F12 | Caching headers table (HTML, JS/CSS, Images, Fonts, API) | **Only `/images/` and `/assets/`** have `Cache-Control` in `vercel.json`. No HTML, font, API headers. | `vercel.json:4-16` | 🟠 High |
| F13 | Image optimization: "Unsplash CDN with auto-format (WebP/AVIF), srcset 3 breakpoints, LQIP" | **Unverified** — no component audit performed; design doc appears aspirational. | — | 🟡 Medium |
| F14 | Lighthouse CI: "Not configured (TODO)" | **No Lighthouse CI config** (no `.github/workflows/lighthouse.yml`, no `lighthouse` in `package.json`) | grep search | 🟡 Medium |
| F15 | Bundle budget: "CI fails if >200 KB gzipped" (Recommended) | **No `size-limit`, `bundlewatch`, or `bundlesize` in `package.json`** | `package.json:14-37` | 🟡 Medium |
| F16 | Critical CSS inlining (Recommended) | **Not implemented** | — | 🟡 Medium |
| F17 | React 18 features: automatic batching, `useTransition`, no Suspense | **React 19 has different semantics** (auto-batching always on, `useTransition` exists but behavior differs). `useOptimistic`, `useActionState` available but unused. | `package.json:19-20` | 🟡 Medium |
| F18 | `index.html` size "2.1 KB" | **Actual: ~9 KB** (239 lines with inline JSON-LD, noscript, fonts, PWA) | `index.html:1-239` | 🟢 Low |
| F19 | Bundle sizes (index 180 KB, vendor 45 KB, chunks 25-40 KB) | **Unmeasured** — no build artifacts or `dist/` analysis in review scope | — | 🟢 Low |

---

## Detailed Findings with Code References

### 🔴 F1–F5: Fundamental Architecture Mismatches

**React Version (F1)**
```json
// package.json:19-20
"react": "^19.2.0",
"react-dom": "^19.2.0",
```
Design doc §56 states "All pages: CSR with React 18". React 19 changes: automatic batching always enabled (no opt-in), new `use` hook, `useActionState`/`useOptimistic`, different Suspense boundaries. Any performance guidance assuming React 18 semantics is suspect.

**Analytics Stack (F2)**
```
analytics/
├── abTestManager.ts
├── bookingFunnelTracker.ts
├── chatBotAnalytics.ts
├── config.ts           # GA4 + Clarity IDs from env
├── consentManager.ts
├── contentPerformanceTracker.ts
├── dataGovernance.ts
├── errorTracker.ts     # Sentry integration (VITE_SENTRY_DSN)
├── eventTracker.ts
├── index.ts
├── mobileDeviceDetector.ts
├── mobileScrollTracker.ts
├── performanceMonitor.ts   # <-- Core Web Vitals collection
├── recommendationEngine.ts
├── reportGenerator.ts
├── sentimentAnalyzer.ts
├── touchTracker.ts
├── types.ts
├── userSegmentation.ts
└── utils.ts
```
Design doc §169 claims "Vercel Analytics: Enabled (free tier)" and "Core Web Vitals: Collected automatically". Reality: **custom 20-module analytics** with `performanceMonitor.ts` likely collecting CWV manually, Sentry for errors (`errorTracker.ts:34` reads `VITE_SENTRY_DSN`). This is a **different architecture** requiring different implementation effort.

**Service Worker (F3)**
```javascript
// public/sw.js:9-12
const CACHE_NAME = 'ayurvritta-v3';
const STATIC_CACHE = 'ayurvritta-static-v3';
const DYNAMIC_CACHE = 'ayurvritta-dynamic-v3';
const MAX_DYNAMIC_ENTRIES = 60;
```
Design doc §84-86: "Current: No SW (Vercel handles caching) — Future: Add SW for offline tool usage". Reality: **SW v3 is live**, registered in `index.html:225-236`, caches static assets (`/, /index.html, /manifest.json, /offline.html`), dynamic cache with LRU eviction (`trimDynamicCache()` at `sw.js:54-60`), offline fallback. The design doc is **factually inverted**.

**Phantom Dependencies (F4)**
Design doc §41-50 lists `tesseract.js` (40 KB) and `pdf.js` (30 KB) as dependencies with optimization notes. **Neither exists in `package.json`**. This inflates the reported bundle estimate and misdirects lazy-loading effort.

**Missing Dependencies (F5)**
```json
// package.json:15-17, 22
"@sentry/react": "^10.52.0",
"html2canvas": "^1.4.1",
"jspdf": "^4.2.1",
"recharts": "^3.5.1"
```
Design doc dependency audit omits these entirely. `recharts` + `d3-*` **are** the `vendor-charts` chunk (`vite.config.ts:35`). `@sentry/react` adds ~10-15 KB gzipped. `html2canvas` + `jspdf` are heavy (~50 KB combined) and used for PDF generation — should be lazy-loaded but design doc doesn't mention them.

---

### 🟠 F6–F12: Implementation Gaps Requiring Significant Work

**Code Splitting (F6)**
```typescript
// vite.config.ts:33-37
manualChunks: (id) => {
  if (id.includes('node_modules')) {
    if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
  }
},
```
Only **one manual chunk** (`vendor-charts`). Design doc describes 5 chunks (`vendor`, `tools`, `blog`, `insurance`, `reactbits`). Route-level lazy loading **is implemented** in `App.tsx:9-19` (12 routes lazy, only `Home` eager), but component-level lazy for Tools page, ReactBits, AI Chat is **not visible** in the codebase (ReactBits not in deps; AI Chat location unknown).

**Font Stack (F7)**
```html
<!-- index.html:64-74 -->
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Philosopher:ital,wght@0,400;0,700;1,400&display=swap">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Philosopher:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
```
Design doc §118-122: "Variable font: Inter (single file, all weights), Subsetting: Latin + Devanagari + Gujarati, `font-display: swap`, Preload: Critical font preloaded". Reality: **Two multi-weight families** (Montserrat 5 weights, Philosopher 3 weights), **no variable font**, **no Devanagari/Gujarati subset** (would require `&subset=devanagari,gujarati`). The preload pattern is correct but for wrong fonts.

**SEO Injection (F8)**
```typescript
// vite.config.ts:26
plugins: [markdownRawPlugin(), react()],
```
Only two plugins: custom markdown plugin + React. **No Vite plugin for SEO injection**. `App.tsx:4` imports `SEOHead` which likely consumes `seo.ts` at runtime. Design doc §69-71 claims build-time injection via Vite plugin — **this plugin does not exist**.

**Resource Preload (F9)**
```html
<!-- index.html:59-74 -->
<!-- Only font preload exists -->
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Montserrat...">
```
Design doc §104-109 shows preload for `/assets/index-<hash>.css`, `/assets/index-<hash>.js`, and `/fonts/inter-var.woff2`. **Hashed asset filenames are unknown at build time** — these preloads cannot be hardcoded in `index.html`. Would require a Vite plugin (e.g., `vite-plugin-preload`) or HTML transform. **Not implemented**.

**Third-Party Preconnect (F10)**
Design doc §96-101: `preconnect api.nvidia.com`, `dns-prefetch images.unsplash.com`, `fonts.googleapis.com`, `fonts.gstatic.com`. Actual: **only fonts**. NVIDIA API proxy (§154-159) would benefit from preconnect; Unsplash images if used would benefit from dns-prefetch. Both missing.

**Rate Limiting (F11)**
```json
// vercel.json:1-21 (entire file)
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    { "source": "/images/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
    { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
  ],
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
Design doc §161-164: "Server-side: 60 req/min/IP (Vercel edge)". **No `middleware.ts`**, **no `vercel.json` functions config**, **no edge middleware**. Client-side debounce (300ms) may exist in chat component but unverified. Server-side rate limiting **does not exist**.

**Caching Headers (F12)**
Design doc §75-82 specifies 5 cache-control rules. `vercel.json` implements **only 2** (images, assets). Missing: HTML (`no-cache`), Fonts (`immutable`), API (`max-age=300`). Also missing security headers (CSP, HSTS, etc.) documented in other EGMs but absent here.

---

### 🟡 F13–F17: Unverified / Aspirational Items

**Image Optimization (F13)** — Design doc §111-116 makes specific claims (Unsplash CDN, WebP/AVIF, 3-breakpoint srcset, LQIP). No component-level verification performed. Given other sections' accuracy, treat as **unverified aspirational**.

**Lighthouse CI (F14)** — Design doc §174: "Not configured (TODO)". Confirmed absent. No GitHub Actions workflow, no `lighthouse` dependency.

**Bundle Budget (F15)** — Design doc §194 recommends "CI fails if >200 KB gzipped". No `size-limit`, `bundlewatch`, or `bundlesize` in `package.json` devDependencies. No CI step.

**Critical CSS (F16)** — Design doc §195 recommends inlining. Not implemented. Would require `vite-plugin-critical-css` or similar.

**React 19 Migration (F17)** — Design doc written for React 18. Codebase is on React 19.2.0. Performance characteristics differ (e.g., automatic batching always on, new hooks). No migration notes in design doc.

---

## Gap Analysis Table

| Design Doc Section | Status | Gap Description | Effort to Align |
|--------------------|--------|-----------------|-----------------|
| §6 Performance Targets | ⚠️ Unverified | Targets listed but no baseline measurements, no CI gate | Medium (add Lighthouse CI + budget) |
| §16-31 Bundle Analysis | 🔴 **Major** | Phantom deps (tesseract, pdf.js), missing deps (Sentry, recharts, html2canvas, jspdf), wrong chunk count | High (rewrite based on actual `package.json` + build analysis) |
| §33-40 Code Splitting | 🟠 **Partial** | Route-level ✅, Component-level ❌, Library-level ✅ (vendor-charts only) | Medium (add component lazy, more manualChunks) |
| §41-51 Dependency Audit | 🔴 **Wrong** | 2 phantom, 4 missing, sizes estimated not measured | High (regenerate from actual bundle) |
| §53-67 Rendering Strategy | 🔴 **Wrong** | React 18 → React 19, SSR/SSG alternatives outdated | Medium (update for React 19) |
| §68-72 Static Metadata | 🟠 **Partial** | `seo.ts` exists but no Vite injection plugin; runtime import | Medium (add Vite plugin or document runtime pattern) |
| §73-92 Caching Strategy | 🔴 **Major** | SW exists (v3) but doc says "Not Implemented"; vercel.json headers incomplete | High (doc rewrite + add missing headers) |
| §93-123 Resource Loading | 🔴 **Major** | Wrong fonts, missing preconnect, impossible preload (hashed names), unverified images | High |
| §124-151 JS Optimization | 🟠 **Partial** | React 18 patterns on React 19; memo examples not verified in components | Medium |
| §152-165 API Performance | 🔴 **Major** | Rate limiting missing; NIM proxy config unverified | High |
| §166-176 Monitoring | 🔴 **Major** | Custom 20-module analytics vs Vercel Analytics claim; Lighthouse CI missing | High |
| §178-197 Optimization Checklist | 🟠 **Mixed** | Some ✅ (code splitting, hashing, images?, fonts?, preconnect?, compression, tree-shaking, memo), many ❌ (lazy tesseract/pdf.js, SW, Lighthouse CI, bundle budget, critical CSS, resource hints, useTransition) | High |

---

## Recommendations by Priority

### 🔴 P0 — Must Fix Before Any Implementation Work

1. **Rewrite the design document to match current reality** — This is not a "refresh"; the document describes a different application. Use this review as the delta list.
2. **Delete phantom dependencies** (`tesseract.js`, `pdf.js`) from the dependency audit; add actual deps (`@sentry/react`, `recharts`, `html2canvas`, `jspdf`) with measured gzip sizes from a real build.
3. **Correct the Service Worker section** — Document SW v3 capabilities, cache strategy, offline support, versioning (`ayurvritta-v3`). Remove "Future: Add SW" language.
4. **Correct the Analytics section** — Document the 20-module custom system (`performanceMonitor.ts` for CWV, `errorTracker.ts` for Sentry, `config.ts` for GA4/Clarity). If Vercel Analytics is *also* enabled, state both; if not, remove the claim.
5. **Fix React version** — Update all React 18 references to React 19. Note any performance implication changes (auto-batching, new hooks).
6. **Fix Font section** — Document Montserrat + Philosopher, weight counts, subset status, preload pattern. If Devanagari/Gujarati support is needed, add subset parameter.

### 🟠 P1 — High-Impact Implementation Gaps

7. **Add missing `vercel.json` cache headers** — HTML (`no-cache`), Fonts (`immutable`), API (`max-age=300`). Align with design doc §75-82 table.
8. **Add rate-limiting middleware** — Create `middleware.ts` with 60 req/min/IP logic or document that it's intentionally client-side only.
9. **Implement component-level code splitting** — Lazy-load `recharts` (already in vendor-charts), `html2canvas`/`jspdf` (PDF tools), any heavy components on Tools/Insurance pages.
10. **Add Vite plugin for resource hints** — Use `vite-plugin-preload` or `vite-plugin-html-transform` to inject hashed JS/CSS preloads. Add `preconnect` for `api.nvidia.com`, `dns-prefetch` for `images.unsplash.com`.
11. **Add Lighthouse CI** — GitHub Actions workflow with `lighthouse-ci` action, budgets matching §6 targets.
12. **Add bundle size budget** — `size-limit` in `package.json` with CI gate (200 KB gzipped main bundle as design doc recommends).

### 🟡 P2 — Medium Priority

13. **Verify/implement image optimization claims** — Audit actual image components for WebP/AVIF, srcset, LQIP, explicit width/height.
14. **Add critical CSS inlining** — `vite-plugin-critical-css` or similar for above-fold styles.
15. **Document custom analytics architecture** — `performanceMonitor.ts` CWV collection method, sampling, beacon endpoint.
16. **Add SEO Vite plugin (optional)** — If build-time injection is desired, create/use a plugin; otherwise update doc to reflect runtime `SEOHead` pattern.
17. **Add security headers to `vercel.json`** — CSP, HSTS, X-Frame-Options, Referrer-Policy (per EGM-18 findings).

### 🟢 P3 — Nice to Have

18. **Measure actual bundle sizes** — Run `vite build && npx serve dist` + `bundle-analyzer` or `gzip-size-cli` to populate §16-31 table with real data.
19. **Add performance test suite** — Vitest benchmarks for key interactions (tool calculations, PDF generation, chart rendering).
20. **Document React 19 migration notes** — Any codemods run, breaking changes encountered, new hook usage.

---

## Clear Verdict

> **This design document is NOT implementation-ready.**
>
> It describes a **hypothetical React 18 application with Vercel Analytics, no Service Worker, Inter font, and phantom dependencies**. The actual codebase is a **React 19 application with a 20-module custom analytics system, a full-featured Service Worker v3, Montserrat/Philosopher fonts, and a different dependency set**.
>
> **Do not assign implementation tasks based on this document.** Any sprint planning using its estimates will be off by 2-3×. The document must be rewritten from a **current-state audit** (which this review partially provides) before it can serve as a reliable implementation guide.
>
> **Recommended next step:** Convert this review into an updated `egm-17-performance.md` that reflects the actual architecture, then re-assess implementation readiness.

---

## Appendix: Verification Methodology

| Check | Method | Files Examined |
|-------|--------|----------------|
| Dependencies | Direct `package.json` read | `package.json` |
| Build config | Direct `vite.config.ts` read | `vite.config.ts` |
| Route splitting | Direct `App.tsx` read | `App.tsx` |
| HTML resource hints | Direct `index.html` read | `index.html` |
| Service Worker | Direct `sw.js` read | `public/sw.js` |
| Analytics modules | Directory listing | `analytics/` |
| Vercel config | Direct `vercel.json` read | `vercel.json` |
| Missing configs | `grep`/`glob` search | `.github/`, `package.json`, root |

**Note:** Component-level verification (memo usage, image optimization, lazy components) was **not** performed — only architectural/structural claims were verified. A full component audit would likely reveal additional gaps.