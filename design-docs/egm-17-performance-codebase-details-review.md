# EGM-17 Performance Architecture vs Codebase Implementation Audit

## Executive Summary

This audit compares the claims in the EGM-17 Performance Architecture design document (design-docs/egm-17-performance.md) against the actual codebase implementation in the hospital-site directory. The review reveals **significant discrepancies** between documented architecture and implemented reality across five critical areas: analytics implementation, service worker status, dependency audit, code splitting strategy, and resource loading optimization.

**Overall Assessment**: The design document describes an aspirational architecture that does not match the current codebase. Several "not implemented" features are fully implemented, while several claimed implementations do not exist.

## Verification Matrix

| Design Doc Claim                                                        | Actual Implementation                                    | Status                 | Evidence                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Analytics: "Vercel Analytics only (free tier)"                          | 17-module custom analytics system                        | ❌ Major Discrepancy    | analytics/ directory with 17 modules: consentManager, eventTracker, performanceMonitor, userSegmentation, bookingFunnelTracker, chatBotAnalytics, abTestManager, contentPerformanceTracker, recommendationEngine, sentimentAnalyzer, reportGenerator, dataGovernance, mobileDeviceDetector, touchTracker, mobileScrollTracker, config, types, utils |
| Service Worker: "Not Implemented"                                       | Full PWA SW at public/sw.js (v3)                         | ❌ Major Discrepancy    | 270-line SW with static/dynamic caching, push notifications, background sync, IndexedDB for offline bookings, cache versioning                                                                                                                                                                                                                      |
| Dependencies: tesseract.js (40 KB), pdf.js (30 KB)                      | Neither in package.json                                  | ❌ Major Discrepancy    | package.json shows: react, react-dom, react-router-dom, lucide-react, jspdf, recharts, @sentry/react, html2canvas — NO tesseract.js, NO pdf.js                                                                                                                                                                                                      |
| Code Splitting: "Route-level chunks: tools, blog, insurance, reactbits" | Only vendor-charts chunk (recharts/d3)                   | ❌ Major Discrepancy    | vite.config.ts manualChunks only splits recharts/d3; no route-level lazy loading configured                                                                                                                                                                                                                                                         |
| React Version: "React 18"                                               | React 19.2.0                                             | ⚠️ Version Mismatch    | package.json: "react": "^19.2.0", "react-dom": "^19.2.0"                                                                                                                                                                                                                                                                                            |
| Bundle: "vendor-.js \~45 KB (React, Router)"                            | Cannot verify — no build artifacts                       | ⚠️ Unverifiable        | No dist/ directory exists; build not run during audit                                                                                                                                                                                                                                                                                               |
| Preload Critical Resources: JS, CSS, Font preload tags                  | Only Google Fonts preconnect/preload                     | ⚠️ Partial Match       | index.html has dns-prefetch + preconnect for fonts.googleapis.com/gstatic.com; NO preload for app JS/CSS chunks                                                                                                                                                                                                                                     |
| Image Optimization: "Unsplash CDN, WebP/AVIF, srcset, LQIP"             | Partial — uses Unsplash but no srcset/LQIP in components | ⚠️ Partial Match       | Components use static Unsplash URLs; no responsive images implementation found                                                                                                                                                                                                                                                                      |
| Font: "Inter variable, Latin+Devanagari+Gujarati, font-display: swap"   | Montserrat + Philosopher (Google Fonts), display=swap    | ❌ Different Font Stack | index.html loads Montserrat/Philosopher; no Inter, no Devanagari/Gujarati subset                                                                                                                                                                                                                                                                    |
| SEO: "All metadata in seo.ts, injected at build via Vite plugin"        | Static metadata in index.html, no seo.ts found           | ❌ Not Implemented      | No seo.ts file; no Vite plugin for metadata injection; all SEO hardcoded in index.html                                                                                                                                                                                                                                                              |
| Monitoring: "Vercel Analytics + Custom metrics"                         | Custom analytics + GA4 + Clarity (configurable)          | ⚠️ Different Stack     | Analytics system supports GA4, Clarity; Vercel Analytics not referenced in code                                                                                                                                                                                                                                                                     |
| Rate Limiting: "Client debounce 300ms, Server 60 req/min/IP"            | Not found in codebase                                    | ❌ Not Implemented      | No debounce on chat input found; no server rate limit config visible                                                                                                                                                                                                                                                                                |
| React 18 Features: "useTransition for tool step changes"                | Not found in components reviewed                         | ❌ Not Implemented      | No useTransition usage found in Layout, MobileHeader, ChatBot, VoiceInput components                                                                                                                                                                                                                                                                |

## Detailed Findings by Category

### 1. Analytics System (Critical Discrepancy)

**Design Doc Claim**: "Vercel Analytics: Enabled (free tier)" — minimal, automatic CWV collection.

**Reality**: A **full-featured, 17-module custom analytics platform** exists at analytics/:

- **consentManager.ts**: GDPR-compliant consent with granular categories (analytics, marketing, personalization), localStorage persistence, subscription model
- **eventTracker.ts**: Page views, custom events, GA4/Clarity integration, consent-gated
- **performanceMonitor.ts**: Core Web Vitals (LCP, FID, CLS, FCP, TTFB), Resource Timing, Navigation Timing, custom marks
- **userSegmentation.ts**: Behavioral segmentation (new/returning, engaged, converter, tool-user, blog-reader, service-browser, mobile/desktop)
- **bookingFunnelTracker.ts**: 8-step funnel (landing → service → date → details → confirm → payment → success → confirmation)
- **chatBotAnalytics.ts**: Session tracking, message analytics, intent categorization, satisfaction scoring
- **abTestManager.ts**: Experiment framework with variants, assignment persistence, conversion tracking
- **contentPerformanceTracker.ts**: Content engagement, scroll depth, read time, share tracking
- **recommendationEngine.ts**: Content/service recommendations based on behavior
- **sentimentAnalyzer.ts**: Text sentiment for chat feedback
- **reportGenerator.ts**: Automated analytics reports
- **dataGovernance.ts**: Data retention, anonymization, export/deletion (GDPR/CCPA)
- **mobileDeviceDetector.ts**: Device type, platform, connection, touch capability detection
- **touchTracker.ts**: Touch gestures, tap patterns, swipe tracking
- **mobileScrollTracker.ts**: Mobile scroll performance, momentum tracking

**Impact**: Design doc severely understates analytics capability. This is a production-grade analytics platform, not "Vercel Analytics only."

### 2. Service Worker (Critical Discrepancy)

**Design Doc Claim**: "Service Worker (Not Implemented) — Current: No SW (Vercel handles caching) — Future: Add SW for offline tool usage"

**Reality**: **Fully implemented PWA Service Worker at public/sw.js (version v3)**:

- **Static caching**: App shell (/, index.html, manifest.json, offline.html)
- **Dynamic caching**: 60-entry bounded cache for hashed assets
- **Network-first for HTML**: Navigation requests try network, fallback to cached shell
- **Cache-first for assets**: Scripts/styles served from cache (Vite content hashing respected)
- **Image handling**: Network-only with transparent pixel fallback
- **Push notifications**: Full Web Push API support with actions, vibration, badge, icon
- **Background sync**: booking-sync tag for offline form submissions
- **IndexedDB integration**: ayurvritta-offline DB with pending-bookings store
- **Cache versioning**: ayurvritta-v3, ayurvritta-static-v3, ayurvritta-dynamic-v3
- **Registered in index.html**: navigator.serviceWorker.register('/sw.js')

**Impact**: Design doc is factually incorrect. SW is production-ready with offline booking support.

### 3. Dependency Audit (Critical Discrepancy)

**Design Doc Claim** (lines 41-51):

| Dependency   | Size (gz) | Necessity        |
| ------------ | --------- | ---------------- |
| tesseract.js | 40 KB     | Low (tools only) |
| pdf.js       | 30 KB     | Low (insurance)  |

**Reality**: **Neither dependency exists in package.json**.

Actual dependencies:

{  
"@sentry/react": "^10.52.0",  
"html2canvas": "^1.4.1",  
"jspdf": "^4.2.1",  
"lucide-react": "^0.555.0",  
"react": "^19.2.0",  
"react-dom": "^19.2.0",  
"react-router-dom": "^6.22.3",  
"recharts": "^3.5.1"  
}

**Impact**: The "Optimization opportunity" section (line 51) recommending lazy loading of tesseract.js/pdf.js is **irrelevant** — these don't exist. jsPDF (4.2.1) and html2canvas are present for client-side PDF generation.

### 4. Code Splitting Strategy (Critical Discrepancy)

**Design Doc Claim** (lines 33-39):

- Route-level: "Each page = separate chunk (automatic via React Router)"
- Component-level: Tools page lazy loads 5 tools, ReactBits on demand, AI Chat on widget open
- Library-level: Vendor chunk for React, Router, Lucide

**Reality** (vite.config.ts lines 31-39):

manualChunks: (id) =&gt; {  
if (id.includes('node\_modules')) {  
if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';  
}  
}

**Only one manual chunk: vendor-charts** (recharts + d3). No route-level splitting, no component-level lazy loading configured in Vite. React Router lazy loading would require React.lazy() + Suspense in route definitions — not verified in components.

**Impact**: Bundle analysis table (lines 19-31) showing tools-&lt;hash&gt;.js, blog-&lt;hash&gt;.js, insurance-&lt;hash&gt;.js, reactbits-&lt;hash&gt;.js is **fictional** — these chunks are not generated by current config.

### 5. Resource Loading Optimization (Partial Discrepancy)

**Design Doc Claim** (lines 104-109):

&lt;link rel="preload" as="style" href="/assets/index-&lt;hash&gt;.css"&gt;  
&lt;link rel="preload" as="script" href="/assets/index-&lt;hash&gt;.js"&gt;  
&lt;link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/inter-var.woff2"&gt;

**Reality** (index.html lines 59-79):

- ✅ DNS prefetch: fonts.googleapis.com, fonts.gstatic.com
- ✅ Preconnect: fonts.googleapis.com, fonts.gstatic.com (crossorigin)
- ✅ Font preload: Google Fonts CSS (not woff2 file) with media="print" onload pattern
- ❌ **NO preload for app JS/CSS chunks** (/assets/index-&lt;hash&gt;.js/css)
- ❌ **NO Inter variable font** — uses Montserrat + Philosopher
- ❌ **NO Devanagari/Gujarati subsets** — Google Fonts Latin only

**Impact**: Critical resource preloading for app bundles is missing. Font stack differs entirely from design doc.

## Additional Discrepancies

### React Version Mismatch

- **Doc**: "React 18" (lines 56, 126)
- **Code**: React 19.2.0 (package.json)
- Automatic batching, Transitions, Suspense behavior differs in React 19

### SEO Implementation

- **Doc**: "All SEO metadata in seo.ts (build-time), injected into index.html at build via Vite plugin"
- **Code**: No seo.ts file found. All metadata hardcoded in index.html. No Vite plugin for metadata injection.

### Font Strategy

- **Doc**: Inter variable, Latin+Devanagari+Gujarati, font-display: swap
- **Code**: Montserrat (300-700) + Philosopher (400/700 italic), Google Fonts, display=swap via URL param

### Monitoring Stack

- **Doc**: Vercel Analytics + custom metrics
- **Code**: Custom analytics + GA4 (G-XXXXXXXXXX) + Clarity (XXXXXXXXXX) — both configurable but not configured

### Rate Limiting

- **Doc**: Client debounce 300ms, Server 60 req/min/IP (Vercel edge)
- **Code**: No debounce implementation found in chat components; no server config visible

### Lighthouse CI

- **Doc**: "Not configured (TODO)" — matches reality

### Bundle Size Budget

- **Doc**: "CI fails if &gt;200 KB gzipped" — not implemented in CI config

## Component-Level Verification (Sample)

| Component             | Design Doc Claim                          | Actual Implementation                             |
| --------------------- | ----------------------------------------- | ------------------------------------------------- |
| Layout.tsx            | React.memo, useMemo, useCallback patterns | Standard React component, no memoization visible  |
| MobileHeader.tsx      | Memoized                                  | Not memoized                                      |
| ChatBot.tsx           | Lazy loaded when chat widget opened       | Direct import in Layout, not lazy                 |
| VoiceInput.tsx        | useTransition for state updates           | No useTransition usage                            |
| AnalyticsProvider.tsx | Initializes analytics                     | Full analytics initialization with consent gating |

## Recommendations

### Immediate (Documentation Sync)

1. **Update EGM-17 design doc** to reflect actual analytics implementation (17 modules)
2. **Remove "Not Implemented" for Service Worker** — document v3 capabilities
3. **Remove tesseract.js/pdf.js from dependency audit** — they don't exist
4. **Correct React version** to 19.2.0
5. **Update font stack** to Montserrat + Philosopher
6. **Document actual code splitting** (vendor-charts only)

### Architecture Improvements

1. **Implement route-level code splitting** via React.lazy() + Suspense in router
2. **Add preload hints** for critical JS/CSS chunks in index.html (requires build-time hash injection)
3. **Configure GA4/Clarity IDs** in analytics config
4. **Add client-side rate limiting** (debounce) to chat input
5. **Implement bundle size budget** in CI pipeline
6. **Add Lighthouse CI** to GitHub Actions

### Analytics Enhancements

1. **Document the 17-module analytics system** in design docs
2. **Add Vercel Analytics integration** alongside custom system (if desired)
3. **Configure consent defaults** for regions (GDPR/CCPA)

## Conclusion

The EGM-17 Performance Architecture document **does not accurately represent** the current codebase state. It appears to describe a **target architecture** rather than the **as-built implementation**. Key systems (analytics, service worker) are significantly more advanced than documented, while claimed optimizations (code splitting, preload hints, specific dependencies) are absent.

**Priority Action**: Treat this document as a **requirements specification** for future work, not a current state description. Update it to match reality before using it for planning or stakeholder communication.

*Audit conducted: 2026-11-13*  
*Codebase: hospital-site (Vite + React 19 + TypeScript)*  
*Design Doc: design-docs/egm-17-performance.md*
