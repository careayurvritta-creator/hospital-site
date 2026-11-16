# EGM-09 Blog CMS - Codebase Details Review

**Document Reviewed**: `egm-09-blog-cms.md`
**Review Date**: 2026-11-13
**Reviewer**: egm-codebase-details (via EGM orchestrator)
**Context Files**: components/Blog.tsx, data/blog/loadPosts.ts, data/blog/types.ts, data/blog/authors.ts, data/blog/autopost-log.json, package.json

---

## Executive Summary

The design document describes a **Next.js-based blog system** with 78 posts organized in draft/published folders, 6 categories, and an auto-post scheduler — but the actual codebase is a **React/Vite SPA with 74 posts, 5 categories, and a single monolithic `Blog.tsx` component (743 lines)**. The design doc documents an architecture that **does not match the implemented code**.

---

## 1. Accurate Claims (15 items)

| Claim | Evidence |
|-------|----------|
| File-based CMS with Markdown + YAML frontmatter | `data/blog/loadPosts.ts:6-27` parses frontmatter |
| Posts loaded at build time via `import.meta.glob` | `data/blog/loadPosts.ts:4` |
| Frontmatter fields: title, excerpt, category, authorId, date, readTime, image, content, featured | `loadPosts.ts:41-52` |
| 5 categories: Ayurveda, Yoga, Nutrition, Lifestyle, Wellness | `types.ts:1` |
| 2 authors with bios, credentials, reg numbers | `authors.ts:3-34` |
| Related posts algorithm (category + author match) | `Blog.tsx:210-215` |
| SEO via `SEOHead` component | `Blog.tsx:248-253` |
| Category filter pills UI | `Blog.tsx:513-526` |
| Author filter pills UI | `Blog.tsx:528-554` |
| Search across title, excerpt, category, author | `Blog.tsx:195-208` |
| Save/bookmark with localStorage | `Blog.tsx:116-165` |
| Share via Web Share API + clipboard | `Blog.tsx:167-184` |
| Reading progress bar | `Blog.tsx:138-148, 256-261` |
| Featured post hero section | `Blog.tsx:461-508` |
| Lazy loading on blog images | `Blog.tsx:389-393, 597-601` |

---

## 2. Inaccurate/Misleading Claims (18 items)

| Design Doc Claim | Reality |
|------------------|---------|
| 78 posts (18 drafts + 60 published) | **74 posts total**, no drafts/published separation |
| 6 categories (including Panchakarma, Diet & Nutrition, Herbs & Remedies, Skin & Hair) | **5 categories**: Ayurveda, Yoga, Nutrition, Lifestyle, Wellness |
| 6 authors | **2 authors**: dr-sharma, dr-gor |
| Next.js Image component | **Native `<img>` tags** with `loading="lazy"` |
| Route-level code splitting | **Monolithic component** handles all routes via `useParams` |
| `published/YYYY-MM/` folder structure | **Flat `posts/` folder** |
| `filterPublished()` function | **No such function exists** |
| Separate components (BlogPostCard, BlogPostDetail, etc.) | **All logic in single `Blog.tsx`** |
| Auto-post scheduler | **`autopost-log.json` has 1 historical entry only** — no scheduling logic |
| RSS/API integration | **No integration code found** |
| Full Article JSON-LD schema | **Only basic meta tags** — no structured data |
| Breadcrumb schema | **Not implemented** |
| `nofollow` on external links | **No link processing** |
| Internal link minimum enforcement | **No validation** |
| Medical disclaimer injection | **Not implemented** |
| Ayurvedic terminology glossary | **Not implemented** |

---

## 3. Missing Features (15 items)

| Feature | Design Doc Reference | Status |
|---------|---------------------|--------|
| Draft/published folder separation | Lines 10-22, 101-106 | ❌ Missing |
| 6th category "Panchakarma" etc. | Lines 58-64 | ❌ Only 5 categories |
| 4 additional authors | Line 67 | ❌ Only 2 authors |
| `filterPublished()` function | Line 43 | ❌ Not implemented |
| Separate UI components | Lines 45-53 | ❌ All inline |
| Auto-post scheduler | Lines 93-97 | ❌ No scheduling |
| RSS/API content ingestion | Line 97 | ❌ Not implemented |
| Article JSON-LD structured data | Lines 85-91 | ❌ Missing |
| Breadcrumb navigation + schema | Line 84 | ❌ Not implemented |
| `nofollow` external links | Line 112 | ❌ Missing |
| Internal link validation | Line 113 | ❌ Missing |
| Medical disclaimer | Line 110 | ❌ Not implemented |
| Terminology glossary | Line 111 | ❌ Missing |
| `dateModified` support | Line 85 | ❌ Not implemented |
| Year/month folder organization | Lines 13-17 | ❌ Flat structure |

---

## 4. Features Implemented But Not Documented (14 items)

| Feature | Location |
|---------|----------|
| Author filter pills (by doctor) | `Blog.tsx:528-554` |
| Reading progress bar | `Blog.tsx:138-148, 256-261` |
| Save/bookmark with localStorage | `Blog.tsx:116-165` |
| Share via Web Share API + clipboard | `Blog.tsx:167-184` |
| Featured post hero section | `Blog.tsx:461-508` |
| Newsletter subscribe (mailto) | `Blog.tsx:186-193, 693-708` |
| Empty state with clear filters | `Blog.tsx:715-737` |
| Mobile filter drawer toggle | `Blog.tsx:114, 557-563` |
| Stats bar (count, categories, saved) | `Blog.tsx:567-585` |
| Custom markdown renderer | `Blog.tsx:21-97` |
| Animated hero background | `Blog.tsx:421-426` |
| Category color gradients | `Blog.tsx:9-15` |
| 44px/48px touch targets | Throughout |
| `autopost-log.json` tracking | `data/blog/autopost-log.json` |

---

## 5. Architecture Mismatch Summary

| Aspect | Design Doc | Codebase |
|--------|------------|----------|
| Framework | Next.js | React 18 + Vite + React Router |
| Build-time | `getStaticProps` | Vite `import.meta.glob({ eager: true })` |
| Component structure | Modular (6+ components) | Monolithic 743-line `Blog.tsx` |
| Pagination | `BlogPagination` component | **None** |
| Draft handling | Folder-based | **None** |
| Image optimization | Next.js Image | Native `<img>` |
| Structured data | Full Article schema | Basic meta only |

---

## 6. Post Count Verification

| Metric | Design Doc | Actual |
|--------|------------|--------|
| Total posts | 78 | **74** |
| Published | 60 | **74** |
| Drafts | 18 | **0** |
| Categories | 6 | **5** |
| Authors | 6 | **2** |

---

## 7. Top 5 Findings Summary (150 words)

**1. Framework Mismatch:** The design doc describes Next.js features (Next.js Image, getStaticProps, route splitting) but the codebase uses React Router with Vite's `import.meta.glob`. This creates a fundamental architectural disconnect.

**2. Missing Component Architecture:** The doc specifies 6 separate components (BlogPostCard, BlogPostDetail, etc.) but all functionality is implemented in a single 743-line `Blog.tsx` file.

**3. Count Discrepancies:** Posts: 78 → 74, Categories: 6 → 5, Authors: 6 → 2, Drafts: 18 → 0. The design doc overstates by 19%.

**4. No Pagination:** With 74 posts rendered simultaneously in a 3-column grid, the site will have performance issues. The documented `BlogPagination` component doesn't exist.

**5. Missing Structured Data:** The doc promises Article JSON-LD schema with breadcrumbs, but `SEOHead` only provides basic meta tags. This impacts SEO and AI search visibility.