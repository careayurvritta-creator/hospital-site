# EGM-17: Performance Architecture

## Overview
The application is a Vite + React SPA optimized for Core Web Vitals. Performance is achieved through code splitting, aggressive caching, minimal dependencies, and client-side rendering with serverless API.

## Performance Targets (Core Web Vitals)

| Metric | Target | Current (Estimated) |
|--------|--------|---------------------|
| LCP (Largest Contentful Paint) | < 2.5s | ~1.8s |
| INP (Interaction to Next Paint) | < 200ms | ~100ms |
| CLS (Cumulative Layout Shift) | < 0.1 | ~0.05 |
| FCP (First Contentful Paint) | < 1.8s | ~1.2s |
| TTFB (Time to First Byte) | < 600ms | ~200ms (edge) |

## Bundle Analysis

### Current Bundle (Estimated)
```
dist/
├── index.html              # 2.1 KB
├── assets/
│   ├── index-<hash>.js     # ~180 KB (gzipped: ~55 KB)
│   ├── index-<hash>.css    # ~15 KB (gzipped: ~3 KB)
│   ├── vendor-<hash>.js    # ~45 KB (React, Router)
│   └── chunks/
│       ├── tools-<hash>.js      # ~35 KB (lazy loaded)
│       ├── blog-<hash>.js       # ~25 KB (lazy loaded)
│       ├── insurance-<hash>.js  # ~40 KB (lazy loaded)
│       └── reactbits-<hash>.js  # ~30 KB (lazy loaded)
```

### Code Splitting Strategy
- **Route-level**: Each page = separate chunk (automatic via React Router)
- **Component-level**: Heavy components lazy loaded
  - Tools page: Lazy loads all 5 tool components
  - ReactBits UI: Loaded on demand per component
  - AI Chat: Loaded when chat widget opened
- **Library-level**: Vendor chunk for React, Router, Lucide icons

### Dependency Audit
| Dependency | Size (gz) | Necessity | Alternative |
|------------|-----------|-----------|-------------|
| react/react-dom | 45 KB | Required | - |
| react-router-dom | 12 KB | Required | wouter (3 KB) |
| lucide-react | 18 KB | High | SVG sprites |
| jsPDF | 25 KB | Medium | Server-side PDF |
| tesseract.js | 40 KB | Low (tools only) | Server OCR |
| pdf.js | 30 KB | Low (insurance) | Server extraction |

**Optimization opportunity**: tesseract.js and pdf.js only used in Insurance page — should be lazy loaded.

## Rendering Strategy

### Client-Side Rendering (Current)
- All pages: CSR with React 18
- No SSR (Vite + static hosting)
- HTML shell: minimal, loads JS bundle
- Hydration: Full app hydrates on load

### Considered Alternatives
| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| SSR (Next.js) | SEO, FCP | Complexity, cost | Rejected — SEO handled via static metadata |
| SSG (Astro) | Performance | No interactivity | Rejected — tools need client JS |
| Island Architecture | Partial hydration | Migration effort | Future consideration |

### Optimization: Static Metadata
- All SEO metadata in `seo.ts` (build-time)
- Injected into `index.html` at build via Vite plugin
- No client-side SEO rendering needed

## Caching Strategy

### Static Assets (CDN - Vercel Edge)
| Asset Type | Cache-Control | Duration |
|------------|---------------|----------|
| HTML | `no-cache, must-revalidate` | Always fresh |
| JS/CSS (hashed) | `public, max-age=31536000, immutable` | 1 year |
| Images | `public, max-age=31536000, immutable` | 1 year |
| Fonts | `public, max-age=31536000, immutable` | 1 year |
| API responses | `public, max-age=300` | 5 minutes |

### Service Worker (Not Implemented)
- **Current**: No SW (Vercel handles caching)
- **Future**: Add SW for offline tool usage

### Browser Caching
- localStorage: Tool answers, language preference, consent
- IndexedDB: Not used (could cache generated PDFs)
- SessionStorage: Analytics session ID

## Resource Loading Optimization

### Preconnect / DNS Prefetch
```html
<!-- In index.html -->
<link rel="preconnect" href="https://api.nvidia.com" crossorigin>
<link rel="dns-prefetch" href="https://images.unsplash.com">
<link rel="dns-prefetch" href="https://fonts.googleapis.com">
<link rel="dns-prefetch" href="https://fonts.gstatic.com">
```

### Preload Critical Resources
```html
<link rel="preload" as="style" href="/assets/index-<hash>.css">
<link rel="preload" as="script" href="/assets/index-<hash>.js">
<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/inter-var.woff2">
```

### Image Optimization
- All images: Unsplash CDN with auto-format (WebP/AVIF)
- Responsive: `srcset` with 3 breakpoints (400w, 800w, 1200w)
- Lazy loading: `loading="lazy"` on all below-fold images
- Aspect ratio: Explicit `width`/`height` to prevent CLS
- Placeholders: Low-quality image placeholders (LQIP) for hero

### Font Optimization
- Variable font: Inter (single file, all weights)
- Subsetting: Latin + Devanagari (Hindi) + Gujarati
- Display: `font-display: swap`
- Preload: Critical font preloaded

## JavaScript Optimization

### React 18 Features
- Automatic batching: Multiple state updates batched
- Transitions: `useTransition` for non-urgent updates (tool step changes)
- Suspense: Not used (no server components)

### Memoization
```tsx
// Components wrapped in React.memo
const ServiceCard = React.memo(({ service, onClick }) => ...);

// Expensive calculations memoized
const doshaScores = useMemo(() => 
  calculateDoshaScores(answers), [answers]);

// Event handlers stabilized
const handleOptionSelect = useCallback((option) => {
  setAnswers(prev => ({ ...prev, [questionId]: option }));
}, [questionId]);
```

### Bundle Optimization (Vite/esbuild)
- Tree shaking: Enabled (ESM imports)
- Minification: esbuild (faster, smaller than terser)
- CSS code splitting: Per-component CSS chunks
- Module preloading: `<link rel="modulepreload">` for async chunks

## API Performance

### Nvidia NIM Proxy
- Cold start: ~200ms (Vercel function)
- Warm: ~50ms
- Streaming: Server-sent events (real-time tokens)
- Timeout: 30s (Vercel limit)
- Caching: 5-minute cache for identical prompts

### Rate Limiting
- Client-side: Debounce chat input (300ms)
- Server-side: 60 req/min/IP (Vercel edge)
- User-facing: Toast notification on limit

## Monitoring

### Real User Monitoring (RUM)
- Vercel Analytics: Enabled (free tier)
- Core Web Vitals: Collected automatically
- Custom metrics: Tool completion time, AI response time

### Synthetic Monitoring
- Lighthouse CI: Not configured (TODO)
- PageSpeed Insights: Manual checks
- WebPageTest: Manual checks

## Optimization Checklist

### Implemented
- [x] Code splitting (route + component level)
- [x] Asset hashing + long-term caching
- [x] Image optimization (CDN, WebP, lazy loading)
- [x] Font optimization (variable, subset, swap)
- [x] Preconnect / DNS prefetch
- [x] Gzip/Brotli compression (Vercel automatic)
- [x] Tree shaking + minification
- [x] React.memo + useMemo + useCallback

### Recommended
- [ ] Lazy load tesseract.js / pdf.js (Insurance only)
- [ ] Service Worker for offline tool usage
- [ ] Lighthouse CI in GitHub Actions
- [ ] Bundle size budget (CI fails if >200 KB gzipped)
- [ ] Critical CSS inlining (above-fold styles)
- [ ] Resource hints for third-party domains
- [ ] Interaction optimization: `useTransition` for tool navigation