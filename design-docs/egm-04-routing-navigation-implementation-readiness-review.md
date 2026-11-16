# EGM-04 Routing & Navigation — Implementation Readiness Review

**Review Date:** 2026-11-13  
**Reviewer:** egm-implementation-readiness  
**Source Document:** `design-docs/egm-04-routing-navigation.md`

---

## 1. Implementation Completeness Score: **82%**

| Subsystem | Score | Status |
|-----------|-------|--------|
| Router Configuration | 90% | ✅ Lazy + Suspense, proper fallback |
| Route Definitions | 85% | ⚠️ Missing /contact, path mismatch |
| Layout Component | 95% | ✅ Comprehensive, accessible |
| Desktop Navigation | 95% | ✅ NavLink wrapper, active states |
| Mobile Navigation | 95% | ✅ Bottom nav + full-screen menu |
| Language Persistence | 100% | ✅ localStorage + Context |
| Hash Anchor Navigation | 90% | ✅ Programs uses scrollIntoView |
| 404 Handling | 80% | ⚠️ Redirects to "/" (acceptable) |
| Scroll Behavior | 90% | ✅ Progress bar, scroll-to-top |
| Accessibility | 85% | ✅ Skip link, ARIA, focus management |
| SEO Integration | 70% | ⚠️ SEOHead at root, no per-route meta |
| HashRouter Fallback | 0% | ❌ **Not implemented** |
| Lazy Loading | 100% | ✅ All pages lazy except Home |

---

## 2. Missing Components / Incomplete Implementations

### P0 — Blockers for Production

| Component | Status | Gap Description |
|-----------|--------|-----------------|
| **HashRouter Fallback** | ❌ Missing | Design doc claims it; only BrowserRouter exists |
| **Contact Route** | ❌ Missing | Listed in nav (constants.ts) but no route/component |
| **SkinCare Route Path** | 🟡 Mismatch | Doc: `/skin-care` → Code: `/ayurveda-skin-care` |
| **BlogPost Route** | 🟡 Mismatch | Doc: separate component → Code: same Blog component |

### P1 — Significant Gaps

| Component | Status | Gap Description |
|-----------|--------|-----------------|
| **Per-Route SEO Meta** | ⚠️ Partial | SEOHead at root only; no dynamic meta per route |
| **Route Guards / Auth** | ❌ Missing | No protection for booking, tools if needed |
| **Prefetching** | ❌ Missing | No `<link rel="prefetch">` for likely next pages |
| **Navigation Analytics** | ❌ Missing | No page view tracking in router |
| **Transition Animations** | ⚠️ Partial | CSS animations in Layout, not route transitions |

### P2 — Nice to Have

| Component | Status |
|-----------|--------|
| Sitemap generation | Not implemented |
| Route-based code splitting verification | Implemented but not measured |
| Offline route caching | Not implemented |

---

## 3. Blockers for Production Deployment

### 🔴 CRITICAL — Must Fix Before Launch

1. **HashRouter Fallback Not Implemented**
   - Doc claims "HashRouter fallback strategy" (line 84)
   - Only `BrowserRouter` used — breaks on static hosting (GitHub Pages, S3, etc.)
   - Fix: Add HashRouter detection or dual-router strategy

2. **Missing /contact Route**
   - NAV_ITEMS includes `/booking` labeled "Contact" (constants.ts line 12)
   - Footer links to `/privacy` and `/terms` only
   - No Contact page component exists
   - Fix: Create Contact.tsx + add route, or rename nav item

3. **Route Path Mismatch: SkinCare**
   - Design doc: `/skin-care` (line 21)
   - Actual route: `/ayurveda-skin-care` (App.tsx line 44)
   - Fix: Align one to the other

### 🟡 HIGH — Should Fix Before Launch

4. **Per-Route SEO Meta Missing**
   - `SEOHead` rendered once at root (App.tsx line 30)
   - No dynamic title/description/og tags per route
   - Fix: Use `react-helmet-async` or route-level meta component

5. **No Route-Level Analytics**
   - No page view tracking on navigation
   - `analytics/chatBotAnalytics.ts` exists but not for routing
   - Fix: Add `useEffect` in Layout or router listener

---

## 4. Technical Debt Resolution Order

| Order | Debt Item | Effort | Dependency |
|-------|-----------|--------|------------|
| 1 | Add HashRouter fallback | 0.5 days | Hosting decision |
| 2 | Create Contact page + route | 1 day | Design decision |
| 3 | Align SkinCare route path | 0.25 days | SEO/redirects |
| 4 | Add per-route SEO meta | 1 day | react-helmet-async |
| 5 | Add route analytics | 0.5 days | analytics lib |
| 6 | Verify Blog handles slug correctly | 0.5 days | Code review |

**Total Critical Path: ~2 days** for P0 items

---

## 5. Effort Estimates for Gaps

| Gap Category | Estimated Effort | Risk if Deferred |
|--------------|------------------|------------------|
| HashRouter Fallback | 0.5 days | **Static hosting broken** |
| Contact Route | 1 day | Broken nav link |
| SEO Meta per Route | 1 day | Poor search visibility |
| Route Analytics | 0.5 days | No navigation insights |
| Prefetching | 0.5 days | Slower perceived perf |

---

## 6. Architecture Decision Alignment

| Decision (Doc) | Implementation Status | Notes |
|----------------|----------------------|-------|
| Client-side routing (BrowserRouter) | ✅ Implemented | With lazy loading |
| Hash fallback strategy | ❌ **Not implemented** | Critical gap |
| 14-route surface | 🟡 13 routes | Contact missing |
| Lazy loading all pages | ✅ Implemented | Suspense + PageLoader |
| 404 renders Home | 🟡 Redirects to "/" | Acceptable SPA pattern |
| Hash anchors for Programs | ✅ Implemented | scrollIntoView |
| Language persistence (localStorage) | ✅ Implemented | LanguageContext |
| CSS-based transitions | ✅ Partial | Layout animations only |

---

## 7. Go/No-Go Recommendation

**CONDITIONAL GO for production** with P0 fixes (est. 2 days):

- ✅ Core routing solid with lazy loading
- ✅ Layout comprehensive with accessibility
- ✅ Mobile navigation excellent (safe areas, animations)
- ⚠️ Must add HashRouter fallback for hosting flexibility
- ⚠️ Must add Contact route or fix nav label
- ⚠️ Must align SkinCare route path

**Recommended staging checks:**
1. Test on static host (Netlify/GitHub Pages) without HashRouter → will fail
2. Click "Contact" in nav → 404
3. Navigate to `/skin-care` → 404 (actual is `/ayurveda-skin-care`)
4. Verify SEO meta on each page → all same

---

*Report generated by egm-implementation-readiness reviewer*