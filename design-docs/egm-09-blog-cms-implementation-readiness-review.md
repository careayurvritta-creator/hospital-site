# EGM-09 Blog CMS — Implementation Readiness Review

**Document Reviewed:** `egm-09-blog-cms.md`  
**Review Date:** 2026-11-13  
**Reviewer:** EGM Implementation Readiness Reviewer  
**Codebase:** `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site` (React 19 + Vite 6 + React Router 6)

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Implementability Score** | **2 / 10** |
| **Verdict** | **NOT IMPLEMENTABLE AS-IS** |
| **Primary Blocker** | Design document describes a **Next.js architecture** (route-level code splitting, `getStaticProps`, Next.js Image, file-based routing) but the actual codebase is a **React 19 + Vite 6 SPA with React Router** using `import.meta.glob` for build-time loading. |
| **Secondary Blockers** | 18 inaccurate claims, 15 missing features, 14 undocumented features, fundamental component architecture mismatch (modular vs monolithic), no pagination, no structured data for BlogPosting schema, counts off by 19% |

**Bottom Line:** The design document documents an architecture that **does not exist**. Implementing from this spec would produce a Next.js application, not enhance the current React/Vite codebase. The document must be rewritten to match the actual stack or treated as an RFC for a Next.js migration.

---

## 10-Point Framework Assessment

| # | Criterion | Score (1–5) | Status | Evidence |
|---|-----------|-------------|--------|----------|
| 1 | **Requirements Clarity** | 2 | ❌ Critical | Requirements describe Next.js patterns (`getStaticProps`, Next.js Image, file-system routing) that don't exist in the codebase |
| 2 | **Architecture Alignment** | 1 | ❌ Critical | Design: Next.js + modular components (6+ files). Codebase: React/Vite + monolithic 743-line `Blog.tsx` |
| 3 | **Component Spec Completeness** | 2 | ❌ Critical | Specifies `BlogPostCard`, `BlogPostDetail`, `CategoryFilter`, `SearchFilter`, `RelatedPosts`, `BlogPagination` — **none exist** |
| 4 | **Data Flow Definition** | 2 | ❌ Critical | Pipeline shows `filterPublished()` → modular components; actual: `import.meta.glob` → single `Blog.tsx` with inline filters |
| 5 | **Integration Points** | 2 | ❌ Critical | Claims RSS/API integration, auto-post scheduler, external content sources — **no integration code exists** |
| 6 | **Dependencies Identified** | 2 | ❌ Critical | Lists Next.js, markdown/CMS libs — **package.json has none of these** (React 19, Vite 6, React Router 6 only) |
| 7 | **Edge Cases Covered** | 2 | ⚠️ Warning | Mentions draft handling, unknown slugs, medical disclaimers — **not implemented** (unknown slug handled in `SEOHead` only) |
| 8 | **Testing Strategy** | 1 | ❌ Critical | No testing strategy documented; codebase has Vitest config but **zero blog tests** |
| 9 | **Performance Budget** | 2 | ⚠️ Warning | Claims route-level code splitting, lazy loading, Next.js Image — **74 posts render simultaneously in 3-col grid, no pagination** |
| 10 | **Migration/Compatibility** | 1 | ❌ Critical | No migration path documented; design describes a **different framework entirely** |

**Average Score: 1.7 / 5** → **NOT IMPLEMENTABLE AS-IS**

---

## Findings Table

| Severity | ID | Finding | Location (Design Doc) | Location (Codebase) |
|----------|----|---------|----------------------|---------------------|
| **Critical** | C-01 | **Framework Mismatch**: Design describes Next.js (`getStaticProps`, Next.js Image, file-based routing); codebase is React 19 + Vite 6 + React Router 6 | Lines 1–119 (throughout) | `package.json`, `vite.config.ts`, `App.tsx` |
| **Critical** | C-02 | **Component Architecture Mismatch**: Design specifies 6+ modular components; codebase has **one 743-line `Blog.tsx`** handling list + detail via `useParams` | Lines 45–53, 75–76 | `pages/Blog.tsx` (lines 1–743) |
| **Critical** | C-03 | **No `filterPublished()` Function**: Design pipeline centers on `filterPublished()`; **function does not exist** — drafts excluded by folder separation in `import.meta.glob` | Line 43 | `data/blog/loadPosts.ts` (lines 4, 37–55) |
| **Critical** | C-04 | **Post/Category/Author Counts Wrong**: Design: 78 posts, 6 cats, 6 authors. Actual: 74 posts (0 drafts loaded), 5 cats, 2 authors | Lines 4, 10–22, 58–69, 119–126 | `loadPosts.ts`, `types.ts`, `authors.ts`, glob results |
| **Critical** | C-05 | **No Pagination Component**: Design documents `BlogPagination`; **does not exist** — 74 posts render in single grid | Line 53, 115 | `Blog.tsx` (no pagination logic) |
| **Critical** | C-06 | **No Article JSON-LD Structured Data**: Design promises full `Article` schema with `dateModified`, breadcrumbs, author physician schema; codebase has only `BlogPosting` with minimal fields | Lines 85–92 | `components/SEOHead.tsx` (lines 206–232) |
| **Critical** | C-07 | **Auto-Post Scheduler Not Implemented**: Design describes scheduling, draft auto-publish, RSS/API integration; `autopost-log.json` has **1 historical entry only**, no scheduler code | Lines 93–98 | `data/blog/autopost-log.json`, no scheduler in codebase |
| **Critical** | C-08 | **Image Optimization Mismatch**: Design claims Next.js Image; codebase uses native `<img loading="lazy">` | Line 117–118 | `Blog.tsx` lines 389–393, 597–601 |
| **Critical** | C-09 | **Draft/Published Folder Structure Missing**: Design: `published/YYYY-MM/`, `drafts/`; Actual: flat `posts/` + separate `drafts/` **not loaded at build** | Lines 10–22, 101–106 | `loadPosts.ts:4` (only `./posts/*.md`) |
| **Critical** | C-10 | **No RSS/API Integration Code**: Design claims RSS/API content ingestion; **zero integration code found** | Line 97 | Full codebase search — none |
| **Warning** | W-01 | **Medical Disclaimer Not Implemented**: Design requires disclaimer on medical claims; **not in codebase** | Line 110 | `Blog.tsx`, `SEOHead.tsx` — none |
| **Warning** | W-02 | **Terminology Glossary Missing**: Design requires Ayurvedic terminology glossary; **not implemented** | Line 111 | Not found |
| **Warning** | W-03 | **`nofollow` on External Links Missing**: Design requires `nofollow`; no link processing in markdown renderer | Line 112 | `Blog.tsx` lines 20–97 (custom renderer) |
| **Warning** | W-04 | **Internal Link Minimum Not Enforced**: Design requires 2+ internal links/post; **no validation** | Line 113 | Not implemented |
| **Warning** | W-05 | **`dateModified` Not Supported**: Design includes `dateModified` in schema; frontmatter parser doesn't extract it | Line 85 | `loadPosts.ts` lines 6–27 |
| **Warning** | W-06 | **Category Mismatch**: Design lists 6 categories (Panchakarma, Diet & Nutrition, Herbs & Remedies, Skin & Hair); codebase has 5 (Ayurveda, Yoga, Nutrition, Lifestyle, Wellness) | Lines 58–64 | `types.ts:1`, `loadPosts.ts:29–35` |
| **Warning** | W-07 | **Author Count Mismatch**: Design claims 6 authors with bios/credentials/social; codebase has 2 authors | Line 67 | `authors.ts` (2 entries) |
| **Warning** | W-08 | **Related Posts Algorithm Differs**: Design: category → tags → date; Code: category + author match only (no tag overlap, no date proximity) | Lines 71–75 | `Blog.tsx` lines 210–215 |
| **Suggestion** | S-01 | **14 Features Implemented But Undocumented**: Author filter pills, reading progress bar, save/bookmark, share, featured hero, newsletter, empty state, mobile drawer, stats bar, custom markdown renderer, animated hero, category gradients, 44/48px touch targets, autopost log | — | `Blog.tsx` throughout |
| **Suggestion** | S-02 | **Breadcrumb Schema Exists But Not Documented**: `SEOHead` generates `Breadcrumb_SCHEMA` for all non-home routes — design mentions breadcrumb schema but doesn't note it's already partially implemented | Line 84 | `components/SEOHead.tsx` lines 162–168, `seo.ts` |
| **Suggestion** | S-03 | **Physician Schema Exists**: `PHYSICIAN_SCHEMA` injected on about/booking/home — design mentions author→physician link but doesn't document this exists | Line 89 | `components/SEOHead.tsx` lines 154–160 |
| **Suggestion** | S-04 | **Code Splitting Exists at Route Level**: `Blog` is lazy-loaded in `App.tsx` — design claims route-level splitting for `BlogPost` but it's actually at page level | Line 115, 53 | `App.tsx` lines 16, 32–33, 42–43 |
| **Suggestion** | S-05 | **Search Implemented Client-Side**: Design shows `SearchFilter` in pipeline; actual search is client-side in `Blog.tsx` (title, excerpt, category, author) | Line 47 | `Blog.tsx` lines 195–208 |

---

## Detailed Findings with Code References

### C-01: Framework Mismatch (Critical)

**Design Doc Claims (throughout):**
- Next.js `getStaticProps` / `getStaticPaths` for build-time loading
- Next.js Image component for optimization
- File-system routing (`pages/blog/[slug].js`)
- Route-level code splitting per post

**Codebase Reality:**
```json
// package.json
"dependencies": {
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^6.22.3",   // ← React Router, not Next.js
  // No next, no @next/mdx, no next/image
}
```
```typescript
// vite.config.ts — custom markdown plugin, not Next.js
function markdownRawPlugin() {
  return {
    name: 'markdown-raw',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.md')) return null;
      return { code: `export default ${JSON.stringify(code)}`, map: null };
    },
  };
}
```
```tsx
// App.tsx — React Router routes, both /blog and /blog/:slug render same Blog component
<Route path="/blog" element={<Blog />} />
<Route path="/blog/:slug" element={<Blog />} />
```

**Impact:** Any implementation following this design doc would produce a Next.js app, not enhance the existing React/Vite codebase.

---

### C-02: Component Architecture Mismatch (Critical)

**Design Doc (Lines 45–53):**
```
File System → loadPosts.ts → parseFrontmatter() → filterPublished() → sort() → Blog.tsx
                                                                           │
                                               ┌───────────────────────────┤
                                               │                           │
                                         CategoryFilter              SearchFilter
                                               │                           │
                                               └───────────┬───────────────┘
                                                           │
                                                     BlogPost.tsx
                                                           │
                                                   RelatedPosts.tsx
```

**Codebase Reality (`pages/Blog.tsx` — 743 lines, single component):**
- Lines 1–97: Custom markdown renderer (`renderBoldText`, `renderContent`)
- Lines 99–115: Date formatting, saved posts localStorage
- Lines 116–165: Save/bookmark logic with localStorage persistence
- Lines 167–184: Share via Web Share API + clipboard fallback
- Lines 186–193: Newsletter subscribe (mailto)
- Lines 195–208: Client-side search filter (title, excerpt, category, author)
- Lines 210–215: Related posts algorithm (category + author only)
- Lines 217–261: Reading progress bar, detail view rendering
- Lines 248–253: `SEOHead` integration
- Lines 263–426: Post detail view (hero, content, meta, related)
- Lines 428–508: Featured post hero section
- Lines 513–554: Category filter pills + Author filter pills
- Lines 557–563: Mobile filter drawer toggle
- Lines 567–585: Stats bar (post count, categories, saved count)
- Lines 587–737: Blog list grid (3-column), empty state, no pagination

**No separate components exist:** `BlogPostCard`, `BlogPostDetail`, `CategoryFilter`, `SearchFilter`, `RelatedPosts`, `BlogPagination` — **all inline**.

---

### C-03: No `filterPublished()` Function (Critical)

**Design Doc (Line 43):** Pipeline centers on `filterPublished()` function.

**Codebase (`data/blog/loadPosts.ts`):**
```typescript
// Line 4: Only loads from ./posts/*.md — drafts in ./drafts/ are NEVER loaded
const modules = import.meta.glob('./posts/*.md', { eager: true })

// Lines 37–55: No filterPublished — all loaded posts are "published" by virtue of folder
export const ALL_POSTS: BlogPost[] = Object.values(modules)
  .map(({ default: raw }) => { /* parse frontmatter */ })
  .filter((p) => p.slug)
  .sort((a, b) => (a.date < b.date ? 1 : -1));
```

**Drafts exist on disk (18 files in `data/blog/drafts/`) but are excluded at build time by glob pattern, not by a `filterPublished()` function.**

---

### C-04: Count Discrepancies (Critical)

| Metric | Design Doc | Actual | Delta |
|--------|------------|--------|-------|
| Total posts | 78 | 74 | -4 (-5%) |
| Published | 60 | 74 | +14 (+23%) |
| Drafts | 18 | 0 (not loaded) | -18 (-100%) |
| Categories | 6 | 5 | -1 (-17%) |
| Authors | 6 | 2 | -4 (-67%) |

**Categories — Design (6):** Ayurveda Basics, Panchakarma, Diet & Nutrition, Herbs & Remedies, Lifestyle, Skin & Hair  
**Categories — Actual (5):** `Ayurveda`, `Yoga`, `Nutrition`, `Lifestyle`, `Wellness` (`types.ts:1`, `loadPosts.ts:29–35`)

**Authors — Design (6):** 6 authors with bios, credentials, social links  
**Authors — Actual (2):** `dr-sharma`, `dr-gor` (`authors.ts`)

---

### C-05: No Pagination (Critical)

**Design Doc (Line 53, 115):** Documents `BlogPagination` component.

**Codebase:** 74 posts render simultaneously in a 3-column CSS grid (`Blog.tsx` lines 709–713):
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
  {filteredPosts.map((post) => (
    <article key={post.slug} className="group">...</article>
  ))}
</div>
```

**Performance Risk:** 74 posts × (image + excerpt + meta) = heavy DOM, no virtualization, no pagination.

---

### C-06: Missing Article JSON-LD Structured Data (Critical)

**Design Doc (Lines 85–92):** Promises full `Article` schema with:
- `dateModified`
- `author` linking to physician schema
- `articleSection` (category)
- `mainEntityOfPage` for canonical
- Breadcrumb schema

**Codebase (`components/SEOHead.tsx` lines 206–232):** Only `BlogPosting` with minimal fields:
```typescript
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": activePost.title,
  "description": activePost.excerpt,
  "image": activePost.image,
  "author": { "@type": "Person", "name": activePost.author.name },  // No credentials, no physician link
  "publisher": { "@type": "Organization", "name": "Ayurvritta Ayurveda Hospital", "logo": {...} },
  "datePublished": activePost.date,  // No dateModified
  "mainEntityOfPage": `https://ayurvrittaayurveda.in${pathname}`
}
```
**Missing:** `dateModified`, `articleSection`, `author` `@id` linking to physician, `publisher` logo `@id`, breadcrumb schema (exists separately but not linked to article).

---

### C-07: Auto-Post Scheduler Not Implemented (Critical)

**Design Doc (Lines 93–98):**
- `autopost-log.json` tracks scheduled posts
- Posts can be scheduled for future publication
- Draft posts auto-publish on scheduled date
- Integration with external content sources (RSS, API)

**Codebase (`data/blog/autopost-log.json`):** Single historical entry only:
```json
[
  {
    "runDate": "2026-08-11",
    "postedDate": "2026-08-11",
    "status": "posted",
    "source": "nvidia-proxy",
    "slug": "uti-and-burning-urine-mootrakrichhra",
    ...
  }
]
```
**No scheduler code exists** — no cron, no build-time date checking, no draft→published migration logic.

---

### C-08: Image Optimization Mismatch (Critical)

**Design Doc (Lines 117–118):** "Image optimization: all blog images use Next.js Image or optimized URLs"

**Codebase:** Native `<img>` tags with `loading="lazy"` (`Blog.tsx` lines 389–393, 597–601):
```tsx
<img
  src={post.image}
  alt={post.title}
  className="w-full h-48 object-cover rounded-xl"
  loading="lazy"
/>
```
No `sharp` integration in build for blog images (only in `vite.config.ts` for general build), no WebP/AVIF conversion, no responsive `srcset`.

---

### C-09: Draft/Published Folder Structure Missing (Critical)

**Design Doc (Lines 10–22, 101–106):**
```
content/blog/
  ├─ posts/
  │   ├─ published/          # 60 published posts
  │   │   ├─ 2024/
  │   │   └─ 2025/
  │   └─ drafts/             # 18 draft posts
```

**Actual Structure:**
```
data/blog/
  ├─ posts/           # 74 .md files (FLAT, no year/month subfolders)
  └─ drafts/          # 18 .md files (NOT loaded by import.meta.glob)
```

**No `published/YYYY-MM/` organization exists.** All 74 posts in flat `posts/`.

---

### C-10: No RSS/API Integration (Critical)

**Design Doc (Line 97):** "Integration with external content sources (RSS, API)"

**Codebase:** Full search — **zero RSS parsing, zero API ingestion code**. No `@/lib/rss`, no `fetch` calls in `loadPosts.ts`, no scheduled jobs.

---

## Gap Analysis Table

| Design Doc Section | Claimed Feature | Codebase Status | Gap Severity |
|-------------------|-----------------|-----------------|--------------|
| Architecture (L6–54) | Next.js framework | React/Vite/React Router | **Critical** |
| Architecture (L45–53) | 6+ modular components | 1 monolithic `Blog.tsx` (743 lines) | **Critical** |
| Loading Pipeline (L43) | `filterPublished()` function | Not implemented (folder-based exclusion) | **Critical** |
| Content Types (L58–64) | 6 categories | 5 categories (different names) | **Critical** |
| Content Types (L66–69) | 6 authors | 2 authors | **Critical** |
| Auto-Post (L93–98) | Scheduler + RSS/API | 1 log entry, no scheduler | **Critical** |
| SEO (L79–92) | Full Article JSON-LD | Minimal BlogPosting only | **Critical** |
| Performance (L115–119) | Next.js Image, route splitting | Native `<img>`, page-level lazy only | **Critical** |
| Editorial (L101–106) | `published/YYYY-MM/` folders | Flat `posts/` | **Critical** |
| Quality (L108–113) | Medical disclaimer, glossary, nofollow, internal links | None implemented | **Warning** |
| Related Posts (L71–75) | Category → tags → date algorithm | Category + author only | **Warning** |
| Pagination (L53, 115) | `BlogPagination` component | Not implemented | **Critical** |
| Draft Handling (L105–106) | Drafts hidden via `filterPublished()` | Drafts excluded by glob pattern | **Warning** |

---

## Recommendations by Priority

### P0 — Must Fix Before Any Implementation

1. **Rewrite the design document to match the actual React/Vite/React Router architecture** — or explicitly mark as RFC for Next.js migration
2. **Add pagination** — 74 posts in single grid is a performance/UX failure
3. **Implement `filterPublished()` or document the folder-based exclusion strategy** — current approach is undocumented
4. **Add Article JSON-LD with `dateModified`, `articleSection`, physician author linking** — SEO/AI visibility gap
5. **Fix count discrepancies** — update doc to reflect 74 posts, 5 categories, 2 authors

### P1 — High Priority

6. **Extract modular components** from `Blog.tsx`: `BlogPostCard`, `BlogPostDetail`, `CategoryFilter`, `SearchFilter`, `RelatedPosts`, `BlogPagination`
7. **Add draft/published workflow** — either implement `filterPublished()` with a `published: boolean` frontmatter field, or add `published/` and `drafts/` folder loading with build-time filtering
8. **Implement auto-post scheduler** — or remove claims from design doc
9. **Add medical disclaimer injection** in markdown renderer for YMYL content
10. **Add `nofollow` to external links** in custom markdown renderer

### P2 — Medium Priority

11. **Add terminology glossary** (Ayurvedic terms tooltip/component)
12. **Improve related posts algorithm** — add tag overlap + date proximity signals
13. **Add `dateModified` frontmatter field + schema support**
14. **Implement RSS feed generation** (build-time)
15. **Add responsive images with `srcset` / WebP** via Vite plugin or build step

### P3 — Nice to Have

16. **Document the 14 undocumented features** (author filters, reading progress, save/bookmark, share, featured hero, newsletter, empty state, mobile drawer, stats bar, custom markdown, animated hero, category gradients, touch targets, autopost log)
17. **Add breadcrumb navigation UI** (schema exists, UI doesn't)
18. **Add internal link validation** (build-time check for 2+ internal links)
19. **Add blog tests** (Vitest + React Testing Library)

---

## Three Path-Forward Options

### Option A: Rewrite Design Doc for React/Vite (Recommended)
- **Effort:** Medium (2–3 days)
- **Action:** Rewrite `egm-09-blog-cms.md` to accurately describe:
  - React 19 + Vite 6 + React Router 6 architecture
  - `import.meta.glob` build-time loading
  - Single `Blog.tsx` with inline filters (or plan component extraction)
  - Actual categories (5), authors (2), post count (74)
  - Native `<img loading="lazy">` + Vite asset handling
  - Current SEO implementation (BlogPosting + Breadcrumb + Physician schemas)
  - Document the 14 undocumented features
  - Add missing items as **future enhancements** (pagination, draft workflow, scheduler, glossary, disclaimer)
- **Outcome:** Accurate spec for current codebase; enables incremental improvements

### Option B: Create Next.js Migration Design Doc
- **Effort:** High (2–3 weeks for design + implementation)
- **Action:** Create new document `egm-09-blog-cms-nextjs-migration.md` specifying:
  - Next.js 15 App Router architecture
  - `content/blog/published/YYYY-MM/` folder structure
  - `getStaticProps`/`generateStaticParams` for SSG
  - Next.js Image optimization
  - Modular component architecture (6+ components)
  - Full Article JSON-LD with all promised fields
  - Auto-post scheduler with cron/vercel cron
  - RSS/API ingestion pipeline
  - Draft preview via `next dev` + draft mode
  - Migration strategy: content migration, URL preservation, SEO continuity
- **Outcome:** Clear migration path; but current React/Vite site remains unchanged until migration completes

### Option C: Treat as RFC (Request for Comments)
- **Effort:** Low (documentation only)
- **Action:** Rename `egm-09-blog-cms.md` → `egm-09-blog-cms-rfc.md`, add header:
  ```
  # RFC: Blog CMS Redesign (Next.js Migration)
  **Status:** DRAFT — Not implemented
  **Current Implementation:** React 19 + Vite 6 (see egm-09-blog-cms-current.md)
  **Target Architecture:** Next.js 15 App Router
  ```
- Create companion `egm-09-blog-cms-current.md` documenting actual codebase (use this review as basis)
- **Outcome:** Preserves design intent without misleading implementers; clear separation of current vs target state

---

## Verdict

### **NOT IMPLEMENTABLE AS-IS**

**Reason:** The design document describes a **Next.js application architecture** that fundamentally does not match the **React 19 + Vite 6 + React Router 6** codebase. Every major architectural claim (framework, component structure, data pipeline, image optimization, routing, structured data) is inaccurate for the current implementation.

**Implementing from this document would produce the wrong application.**

---

## File Verification

This review has been written to:
```
F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site\design-docs\egm-09-blog-cms-implementation-readiness-review.md
```

**Verification:** Run `dir "F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site\design-docs\egm-09-blog-cms-implementation-readiness-review.md"` to confirm file exists.