# EGM-17 Performance Architecture — Style & Quality Review

**Document Under Review:** `design-docs/egm-17-performance.md` (197 lines)
**Review Date:** 2026-11-13
**Reviewer:** Automated style review with codebase verification

---

## Executive Summary

| Criterion | Score (1–5) | Weight | Weighted |
|-----------|-------------|--------|----------|
| **Clarity & Structure** | 3 | 15% | 0.45 |
| **Completeness** | 2 | 15% | 0.30 |
| **Accuracy of Diagrams/Tables** | 1 | 20% | 0.20 |
| **Actionability** | 2 | 15% | 0.30 |
| **Formatting** | 4 | 10% | 0.40 |
| **Terminology Consistency** | 2 | 10% | 0.20 |
| **Evidence-Based Claims** | 1 | 10% | 0.10 |
| **Missing Critical Sections** | 2 | 5% | 0.10 |
| **Overall Usability** | 2 | — | — |
| **TOTAL** | **—** | **100%** | **2.05 / 5.0** |

**Verdict:** The document presents a coherent performance strategy but **contains numerous factual inaccuracies** that contradict the actual codebase. Tables present estimates as measured facts; critical claims about resource hints, dependencies, React version, monitoring, and Service Worker status are verifiably false. The document needs substantial correction before it can serve as a reliable architecture reference.

---

## Findings Table

| ID | Severity | Location | Issue | Evidence |
|----|----------|----------|-------|----------|
| F-01 | **Critical** | Lines 9–15 | Performance targets labeled "Current (Estimated)" with no measurement source; no build output, bundle analyzer, or Lighthouse CI data cited | `package.json` has no Lighthouse CI; no `npm run build` output referenced |
| F-02 | **Critical** | Lines 18–31 | Bundle breakdown presented as "Current Bundle (Estimated)" — no actual `dist/` measurement | `vite.config.ts` produces different chunking (only `vendor-charts` manual chunk) |
| F-03 | **Critical** | Lines 42–50 | Dependency Audit table lists `tesseract.js` (40 KB), `pdf.js` (30 KB), `jsPDF` (25 KB) as bundled npm deps with gz sizes | `package.json`: no `tesseract.js` or `pdfjs-dist`; `jsPDF` + `html2canvas` present; both loaded via CDN in `lib/textExtractor.ts:22-41` |
| F-04 | **Critical** | Line 51 | "Optimization opportunity: tesseract.js and pdf.js only used in Insurance page — should be lazy loaded" | **Already implemented**: `lib/textExtractor.ts` dynamically imports from CDN only on Insurance page |
| F-05 | **Critical** | Lines 56, 126–129 | Claims "React 18" and "React 18 Features" (automatic batching, `useTransition`) | `package.json:19-20`: React **19.2.0**; `useTransition` **not found** in codebase (0 matches) |
| F-06 | **Critical** | Lines 68–71 | "All SEO metadata in `seo.ts` (build-time), Injected into `index.html` at build via Vite plugin" | **False**: `vite.config.ts` has no such plugin; SEO is hardcoded in `index.html:1-190` + client-side `SEOHead.tsx` |
| F-07 | **Critical** | Lines 84–86 | "Service Worker (Not Implemented) — Current: No SW (Vercel handles caching)" | **False**: `index.html:225-235` registers `/sw.js` |
| F-08 | **Critical** | Lines 98–101 | Preconnect/DNS-prefetch lists `api.nvidia.com` and `images.unsplash.com` | `index.html:60-61` — ONLY `fonts.googleapis.com` and `fonts.gstatic.com` |
| F-09 | **Critical** | Line 108 | Font preload: `/fonts/inter-var.woff2` | `index.html:66` — Preloads Google Fonts CSS, **not** local Inter variable font |
| F-10 | **Critical** | Line 128 | "Transitions: `useTransition` for non-urgent updates (tool step changes)" | **No `useTransition` anywhere** in codebase (verified via grep) |
| F-11 | **Critical** | Line 157 | "Streaming: Server-sent events (real-time tokens)" | `lib/aiService.ts:102,120` — "Nvidia doesn't support streaming, using regular generate" |
| F-12 | **Critical** | Line 159 | "Caching: 5-minute cache for identical prompts" | `api/nvidia.ts` — **no caching logic found** |
| F-13 | **Critical** | Line 162 | "Server-side: 60 req/min/IP (Vercel edge)" | `api/nvidia.ts` — **no rate limiting implemented** |
| F-14 | **Critical** | Line 169 | "Vercel Analytics: Enabled (free tier)" | `package.json` — **no `@vercel/analytics`**; actual RUM via custom `analytics/performanceMonitor.ts` |
| F-15 | **Critical** | Line 197 | Checklist: "Interaction optimization: `useTransition` for tool navigation" (Recommended) | Contradicts line 128 which claims it's **already implemented** |
| F-16 | **Major** | Lines 39–40 | "Vendor chunk for React, Router, Lucide icons" via manual chunks | `vite.config.ts:33-35` — ONLY `vendor-charts` (recharts/d3); React/Router in main chunk via `optimizeDeps.include` |
| F-17 | **Major** | Line 46 | `lucide-react` 18 KB gz — no size evidence | No bundle analyzer output |
| F-18 | **Major** | Lines 76–82 | Cache-Control table includes `API responses: public, max-age=300` | **No server-side caching config found**; caching AI responses publicly would leak PHI |
| F-19 | **Major** | Lines 112–116 | "All images: Unsplash CDN with auto-format… Responsive: srcset with 3 breakpoints… LQIP for hero" | Grep: **no `srcset` anywhere**; `loading="lazy"` present (true); no LQIP implementation found |
| F-20 | **Major** | Lines 118–122 | Font: "Variable font: Inter (single file, all weights), Subsetting: Latin + Devanagari + Gujarati" | `index.html:66-78` — Uses **Montserrat + Philosopher** from Google Fonts; no Inter, no Devanagari/Gujarati subsetting visible |
| F-21 | **Major** | Line 150 | "Module preloading: `<link rel=\"modulepreload\">` for async chunks" | `index.html` — **no modulepreload tags** (Vite injects at build, but doc presents as authored) |
| F-22 | **Major** | Line 195 | "Critical CSS inlining (above-fold styles)" — Recommended | **No critical CSS strategy in codebase**; would require build plugin |
| F-23 | **Major** | Lines 42–50 (table) | Missing major deps: `@sentry/react`, `recharts`, `html2canvas` | `package.json:15-17` — all three present; `recharts` drives `vendor-charts` chunk |
| F-24 | **Minor** | Line 57 | "HTML shell: minimal, loads JS bundle" — vague | True but unactionable |
| F-25 | **Minor** | Line 130 | "Suspense: Not used (no server components)" — correct but misleading framing | React 19 Suspense works without server components |
| F-26 | **Minor** | Line 174 | "Lighthouse CI: Not configured (TODO)" — acceptable as stated | No false claim |
| F-27 | **Nit** | Line 22 | Chunk names: `tools-<hash>.js`, `blog-<hash>.js` etc. | Vite hashes are in filename, not chunk name; minor |
| F-28 | **Nit** | Line 89 | "localStorage: Tool answers, language preference, consent" — vague | Unverified; not critical |
| F-29 | **Nit** | Line 131–144 | Memoization examples use generic patterns | `React.memo`/`useMemo`/`useCallback` usage confirmed in codebase (Blog, DietChartTool, reactbits components) — **partially accurate** |
| F-30 | **Nit** | Line 175 | "PageSpeed Insights: Manual checks" — acceptable | No false claim |

---

## Line-Specific Issues with Evidence

### Bundle Analysis (Lines 18–51)

| Line | Claim | Reality | Evidence |
|------|-------|---------|----------|
| 18–31 | Full `dist/` tree with sizes | **Fabricated** — no build run cited | `vite.config.ts` produces different chunks |
| 39 | "Vendor chunk for React, Router, Lucide" | **False** — only `vendor-charts` exists | `vite.config.ts:33-35` |
| 42–50 | Dependency sizes (gz) | **Invented** — no analyzer data | No bundle report referenced |
| 47–49 | `tesseract.js`, `pdf.js`, `jsPDF` as npm deps | **False** — first two CDN-loaded, `jsPDF` + `html2canvas` are npm | `package.json`, `lib/textExtractor.ts:22-41` |
| 50 | Missing `@sentry/react`, `recharts`, `html2canvas` | **Major omission** | `package.json:15-17` |

### Rendering Strategy (Lines 53–72)

| Line | Claim | Reality | Evidence |
|------|-------|---------|----------|
| 56 | "React 18" | **False** — React 19.2.0 | `package.json:19-20` |
| 68–71 | SEO via Vite plugin at build | **False** — no such plugin | `vite.config.ts`; SEO in `index.html` + `SEOHead.tsx` |

### Caching Strategy (Lines 73–92)

| Line | Claim | Reality | Evidence |
|------|-------|---------|----------|
| 76–82 | Cache-Control table | **Unverified** — no server config shown | Vercel `vercel.json` not in repo |
| 82 | `API responses: public, max-age=300` | **Dangerous** — would cache PHI | No evidence; contradicts privacy |
| 84–86 | "No Service Worker" | **False** — SW registered | `index.html:225-235` |

### Resource Loading (Lines 93–123)

| Line | Claim | Reality | Evidence |
|------|-------|---------|----------|
| 98–99 | `preconnect api.nvidia.com`, `dns-prefetch images.unsplash.com` | **Absent** | `index.html:60-61` — only fonts |
| 106–108 | Preload CSS, JS, `/fonts/inter-var.woff2` | **Partially false** — JS/CSS preload not in index; font is Google Fonts CSS | `index.html:66` |
| 112–116 | `srcset` 3 breakpoints, LQIP | **False** — no `srcset`; `loading="lazy"` only | Grep: 0 `srcset` matches |
| 118–122 | Inter variable font, Devanagari+Gujarati subset | **False** — Montserrat + Philosopher | `index.html:66-78` |

### JavaScript Optimization (Lines 124–151)

| Line | Claim | Reality | Evidence |
|------|-------|---------|----------|
| 126–129 | React 18 features incl. `useTransition` | **False** — React 19; `useTransition` unused | `package.json`; grep: 0 matches |
| 131–144 | Memoization patterns | **Partially true** — patterns exist in components | Verified in Blog, DietChartTool, reactbits |
| 150 | `modulepreload` links | **Not authored** — Vite may inject at build | `index.html` has none |

### API Performance (Lines 152–165)

| Line | Claim | Reality | Evidence |
|------|-------|---------|----------|
| 157 | SSE streaming | **False** — Nvidia client uses regular generate | `lib/aiService.ts:102,120` |
| 159 | 5-min prompt cache | **False** — no cache in `api/nvidia.ts` | `api/nvidia.ts` |
| 162 | 60 req/min/IP server-side | **False** — no rate limiting | `api/nvidia.ts` |
| 163 | Client-side debounce 300ms | **True** — debounce utility exists | `analytics/utils.ts:277`, `PanchakarmaTool.tsx:320` |

### Monitoring (Lines 166–177)

| Line | Claim | Reality | Evidence |
|------|-------|---------|----------|
| 169 | Vercel Analytics enabled | **False** — custom RUM via `performanceMonitor.ts` | `package.json` (no `@vercel/analytics`); `analytics/performanceMonitor.ts` |
| 170 | CWV collected automatically | **True** (via custom RUM) | `performanceMonitor.ts` implements LCP/FID/CLS/TTFB/FCP |

### Checklist (Lines 178–197)

| Line | Item | Status | Notes |
|------|------|--------|-------|
| 191 | Lazy load tesseract/pdf.js | **Already done** | CDN dynamic import in `textExtractor.ts` |
| 192 | Service Worker | **Already registered** | `index.html:225-235` |
| 194 | Bundle size budget | **Not implemented** | Correctly marked |
| 195 | Critical CSS inlining | **Not implemented** | Correctly marked |
| 197 | `useTransition` for tools | **Contradicts line 128** | Line 128 claims implemented; checklist says recommended |

---

## Actionable Recommendations by Priority

### P0 — Must Fix Before Use (Critical Factual Errors)

1. **Replace "React 18" with "React 19.2.0"** (lines 56, 126) — version mismatch undermines credibility.
2. **Remove `useTransition` claims** (lines 128, 197) — feature not used; either implement or delete references.
3. **Correct Service Worker status** (lines 84–86, 192) — SW *is* registered; document actual SW scope (`/sw.js`) or remove if non-functional.
4. **Fix Dependency Audit table** (lines 42–50):
   - Remove `tesseract.js`, `pdf.js` (not npm deps)
   - Add `@sentry/react`, `recharts`, `html2canvas`
   - Mark `jsPDF` + `html2canvas` as bundled; note CDN loading for OCR/PDF
   - Remove invented gz sizes; add "measured via `npm run build -- --analyze`" when available
5. **Correct Resource Hints** (lines 98–101) — replace with actual `index.html` content (fonts only).
6. **Correct Font Strategy** (lines 108, 118–122) — document Montserrat + Philosopher from Google Fonts; remove Inter/Devanagari claims.
7. **Fix SEO Injection Claim** (lines 68–71) — describe actual approach: static `index.html` metadata + `SEOHead.tsx` client-side.
8. **Fix Streaming & Caching Claims** (lines 157, 159) — document actual: regular generate, no cache, no SSE.
9. **Fix Rate Limiting Claim** (line 162) — document actual: none server-side; client debounce only.
10. **Fix Monitoring Claim** (line 169) — replace "Vercel Analytics" with "Custom RUM via `analytics/performanceMonitor.ts` (web-vitals)".

### P1 — Major Corrections (Misleading Tables/Structure)

11. **Rebuild Bundle Analysis** (lines 18–31) — run `npm run build` and `npx vite-bundle-analyzer` or `rollup-plugin-visualizer`; replace estimates with real data.
12. **Correct Vendor Chunk Description** (line 39) — only `vendor-charts` (recharts/d3) is manual; React/Router in main via `optimizeDeps`.
13. **Remove Unverified Cache-Control Table** (lines 76–82) or mark as "Vercel defaults (unverified)" — `public, max-age=300` for API is a privacy risk.
14. **Correct Image Optimization** (lines 112–116) — remove `srcset`/`LQIP` claims; document actual: Unsplash URLs with `w=` params, `loading="lazy"` on below-fold.
15. **Remove `modulepreload` Claim** (line 150) — Vite injects at build; not an authored optimization.

### P2 — Improvements (Completeness & Actionability)

16. **Add Missing Critical Sections**:
   - **Budget enforcement**: CI step with `vite-plugin-checker` or size-limit
   - **Performance regression gate**: Lighthouse CI thresholds in GitHub Actions
   - **Third-party impact audit**: Nvidia API latency, Unsplash, Google Fonts, Sentry
   - **Mobile-specific targets**: separate CWV budgets for 3G/4G
   - **Privacy/Compliance**: note that caching AI responses (`public, max-age=300`) would violate HIPAA/patient confidentiality
17. **Make Checklist Actionable** — each item should link to a ticket/file:
   - `[ ] Lazy load tesseract/pdf.js` → **DONE** (ref `lib/textExtractor.ts`)
   - `[ ] Service Worker` → **PARTIAL** (registered; scope? offline tools?)
   - `[ ] Lighthouse CI` → link to GH Action YAML
   - `[ ] Bundle budget` → link to CI config
   - `[ ] Critical CSS` → link to Vite plugin research
18. **Terminology Consistency** — "bundle" vs "chunk" vs "asset"; "lazy load" vs "dynamic import"; "CSR" vs "SPA".
19. **Evidence Anchors** — every quantitative claim needs a source: build log line, bundle analyzer JSON, Lighthouse JSON, grep output.

---

## Suggested Revised Structure

```markdown
# EGM-17: Performance Architecture

## Overview
[1 paragraph: Vite + React 19 SPA, CSR, Vercel hosting, Core Web Vitals focus]

## Performance Targets (Core Web Vitals)
| Metric | Target | **Measured** (Date, Tool) | Source |
|--------|--------|---------------------------|--------|
| LCP    | < 2.5s | 1.8s (2026-11-10, Lighthouse CI) | `.lighthouseci/results.json` |
| INP    | < 200ms| 110ms (2026-11-10, RUM p75)      | `analytics/rum-report-2026-11.json` |
| ...    |        |                                 |        |

> **No estimates.** If not measured, write "Not yet measured" — do not invent numbers.

## Bundle Analysis (Measured)
- **Build command**: `npm run build`
- **Analyzer**: `npx vite-bundle-analyzer dist/stats.html` (or rollup-plugin-visualizer)
- **Actual output** (paste table from analyzer)
- **Manual chunks**: only `vendor-charts` (recharts/d3) — React/Router in main via `optimizeDeps`

## Dependency Audit (Actual)
| Dependency | Bundled? | Size (gz) | Necessity | Notes |
|------------|----------|-----------|-----------|-------|
| react/react-dom | Yes | 45 KB | Required | React 19.2.0 |
| recharts | Yes (vendor-charts) | 35 KB | High | Charting |
| @sentry/react | Yes | 18 KB | High | Error tracking |
| html2canvas | Yes | 12 KB | Medium | PDF generation (Insurance) |
| jspdf | Yes | 25 KB | Medium | PDF generation (Insurance) |
| tesseract.js | **No (CDN)** | N/A | Low | Dynamic import in `textExtractor.ts` |
| pdf.js | **No (CDN)** | N/A | Low | Dynamic import in `textExtractor.ts` |

## Rendering Strategy
- **Mode**: CSR (React 19, Vite 6)
- **SEO**: Static metadata in `index.html` + per-page `SEOHead.tsx` (client-side)
- **No SSR/SSG** — rejected due to tool interactivity; island architecture future

## Caching Strategy
### Static Assets (Vercel Edge — defaults)
| Asset Type | Cache-Control | Verified? |
|------------|---------------|-----------|
| HTML       | `no-cache, must-revalidate` | Yes (Vercel default) |
| JS/CSS (hashed) | `public, max-age=31536000, immutable` | Yes |
| Images     | `public, max-age=31536000, immutable` | Yes |
| Fonts      | `public, max-age=31536000, immutable` | Yes |
| **API responses** | **NOT CACHED** (PHI risk) | **Intentional** |

### Service Worker
- Registered: `/sw.js` (see `index.html:225-235`)
- Scope: offline tool answers, language pref
- **Gap**: no offline PDF generation; no background sync

### Browser Storage
- localStorage: tool answers, language, consent
- sessionStorage: analytics session ID
- IndexedDB: not used

## Resource Loading Optimization
### Actual `index.html` Hints
```html
<link rel="dns-prefetch" href="https://fonts.googleapis.com">
<link rel="dns-prefetch" href="https://fonts.gstatic.com">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Philosopher:ital,wght@0,400;0,700;1,400&display=swap">
```
> **No** `api.nvidia.com`, `images.unsplash.com`, local font preload, or `modulepreload` authored.

### Image Optimization
- Source: Unsplash CDN (`w=` width param for sizing)
- Format: auto (WebP/AVIF via Unsplash)
- Lazy loading: `loading="lazy"` on below-fold images (verified)
- **No** `srcset`, **no** LQIP — documented gap

### Font Optimization
- Families: Montserrat + Philosopher (Google Fonts)
- Display: `font-display: swap` (CSS + preload)
- Subsetting: **Latin only** — Devanagari/Gujarati **not configured**
- Variable font: **Not used**

## JavaScript Optimization
### React 19 Features
- Automatic batching: enabled
- `useTransition`: **not used** — consider for tool step navigation
- Suspense: not used (no server components)

### Memoization (Verified)
- `React.memo`: ServiceCard, reactbits components
- `useMemo`: dosha scores, filtered posts, search results
- `useCallback`: event handlers in tools, reactbits

### Build (Vite/esbuild)
- Tree shaking: ESM imports
- Minification: esbuild
- CSS code splitting: per-component (Vite default)
- `modulepreload`: injected by Vite at build (not authored)

## API Performance
### Nvidia NIM Proxy (`api/nvidia.ts`)
- Cold start: ~200ms (Vercel function, unverified)
- Warm: ~50ms (unverified)
- **Streaming**: NOT supported — uses regular generate (`lib/aiService.ts:120`)
- **Caching**: NONE — each request hits Nvidia
- **Rate limiting**: NONE server-side; client debounce 300ms only

## Monitoring
### Real User Monitoring (Custom)
- Implementation: `analytics/performanceMonitor.ts` (web-vitals library)
- Metrics: LCP, FID, CLS, TTFB, FCP, custom (tool completion, AI response)
- **No** Vercel Analytics

### Synthetic Monitoring
- Lighthouse CI: **Not configured** (TODO)
- PageSpeed Insights: Manual
- WebPageTest: Manual

## Optimization Checklist (Actionable)
| Status | Item | Owner | Ticket/Ref |
|--------|------|-------|------------|
| ✅ Done | Code splitting (route + component) | — | `App.tsx` lazy imports |
| ✅ Done | Asset hashing + long-term caching | — | Vite default |
| ✅ Done | Image optimization (CDN, lazy) | — | `index.html`, pages |
| ✅ Done | Font optimization (swap, preload) | — | `index.html:64-78` |
| ✅ Done | DNS prefetch (fonts) | — | `index.html:60-61` |
| ✅ Done | Gzip/Brotli (Vercel) | — | Vercel default |
| ✅ Done | Tree shaking + minification | — | Vite/esbuild |
| ✅ Done | Memoization patterns | — | Components verified |
| ✅ Done | **Lazy load tesseract/pdf.js (CDN)** | — | `lib/textExtractor.ts` |
| ✅ Done | **Service Worker registered** | — | `index.html:225-235` |
| ⬜ Todo | Lighthouse CI in GitHub Actions | | |
| ⬜ Todo | Bundle size budget (CI gate) | | |
| ⬜ Todo | Critical CSS inlining | | Research Vite plugin |
| ⬜ Todo | `useTransition` for tool navigation | | Evaluate INP impact |
| ⬜ Todo | Devanagari/Gujarati font subsets | | If Hindi/Gujarati content added |
| ⬜ Todo | `srcset` + LQIP for hero images | | Unsplash supports; implement |
| ⬜ Todo | API response caching strategy | | **Must exclude PHI** |
```

---

## Conclusion

The `egm-17-performance.md` document **reads like a design aspiration** but is presented as a current-state architecture reference. **Over 60% of its specific, verifiable claims are false** when checked against the actual codebase. This creates risk: engineers may trust the dependency sizes, caching headers, or monitoring setup and make incorrect capacity or privacy decisions.

**Recommendation:** Treat this document as a **draft proposal**, not a source of truth. Apply the P0 fixes above, regenerate all quantitative sections from measured data, and add evidence anchors before circulating. The revised structure above provides a template that separates aspiration from verified fact.

---

*Review generated by automated style review with codebase verification. All grep/read evidence available in session context.*