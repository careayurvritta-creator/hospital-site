# EGM-09 Blog CMS — Style Review

**Document Reviewed**: `egm-09-blog-cms.md`  
**Review Date**: 2026-11-13  
**Reviewer**: EGM Style Reviewer  
**Review Scope**: Style, clarity, documentation quality, formatting, and actionability

---

## Executive Summary

| Criterion | Score (1–5) | Assessment |
|-----------|-------------|------------|
| **Clarity & Structure** | 3/5 | Well-organized sections but logical flow breaks between architecture and content types |
| **Completeness** | 2/5 | Missing critical aspects: error handling, testing, API contracts, deployment |
| **Accuracy of Diagrams/Tables** | 1/5 | **Critical mismatch** — diagrams describe Next.js architecture; codebase is React/Vite |
| **Actionability** | 2/5 | Developer would build wrong architecture; no implementation details for missing features |
| **Formatting** | 3/5 | Good Markdown basics; inconsistent code block syntax highlighting; some terminology drift |

**Overall Style Score: 2.2 / 5** — *Needs significant revision before use as implementation reference*

---

## Findings Table

| Severity | Count | Description |
|----------|-------|-------------|
| **Critical** | 3 | Architecture diagrams describe Next.js; codebase is Vite/React Router. Component structure claims modular design; codebase has monolithic 743-line Blog.tsx. Post/category/author counts are 19–67% inflated. |
| **Major** | 5 | Missing: error handling, testing strategy, API contracts, deployment pipeline, rollback plan. Auto-post system described but no scheduler exists. Structured data (JSON-LD) promised but not implemented. |
| **Minor** | 6 | Inconsistent terminology ("BlogPost" vs "BlogPostDetail"). No date format spec for frontmatter. Missing `filterPublished()` function referenced in pipeline. No pagination design despite 74 posts. |
| **Nit** | 4 | Code blocks use inconsistent syntax (`yaml` vs `text`). ASCII diagram uses `└─` vs `├─` inconsistently. "Next.js Image" mentioned but not a Next.js project. Trailing whitespace in some lines. |

---

## Specific Style Issues with Line References

### Critical Issues

| Line | Issue | Evidence |
|------|-------|----------|
| 6–22 | **Architecture describes Next.js; codebase is Vite + React Router** | Directory tree shows `content/blog/` with `published/YYYY-MM/` folders; actual codebase has flat `data/blog/posts/` (74 files, no year/month folders). Loading pipeline references `getStaticProps` / Next.js Image (line 117); actual uses `import.meta.glob({ eager: true })` and native `<img loading="lazy">`. |
| 51–54 | **Component diagram shows 6 modular components; reality is 1 monolithic Blog.tsx** | Diagram lists `BlogPost.tsx`, `RelatedPosts.tsx`, `CategoryFilter`, `SearchFilter` as separate files. Codebase has single 743-line `Blog.tsx` containing all logic (custom markdown renderer, filters, search, hero, progress bar, save/share, newsletter). |
| 116–119 | **Performance claims reference Next.js features not in codebase** | "Posts loaded at build time via getStaticProps" — Vite uses `import.meta.glob`. "Next.js Image or optimized URLs" — uses native `<img>`. "Route-level code splitting" — no route splitting; single component handles all routes via `useParams`. |

### Major Issues

| Line | Issue | Detail |
|------|-------|--------|
| 77–92 | **SEO/Structured Data promises unimplemented features** | Claims "Breadcrumb schema", "Article schema with `dateModified`", "author links to physician schema", "`mainEntityOfPage`". Codebase review: `SEOHead` only provides basic meta tags; no JSON-LD structured data exists. |
| 93–98 | **Auto-post system described but non-functional** | `autopost-log.json` has 1 historical entry; no scheduling logic, no cron, no RSS/API integration. "Draft posts auto-publish on scheduled date" — no draft folder exists, no publish automation. |
| 108–113 | **Content governance rules unenforced** | "Medical disclaimer injection", "Ayurvedic terminology glossary", "External links: nofollow", "Internal links: at least 2 per post" — none implemented. No validation pipeline, no linter, no CI check. |
| — | **Missing: Error handling section** | No discussion of: malformed frontmatter, missing images, build-time parse failures, runtime search/filter errors, localStorage quota exceeded. |
| — | **Missing: Testing strategy** | No unit test plan for `parseFrontmatter`, `filterPublished`, related posts algorithm, search. No E2E test for category filter, author filter, pagination (missing), save/share. |

### Minor Issues

| Line | Issue | Detail |
|------|-------|--------|
| 25–39 | **Frontmatter spec incomplete** | No date format specified (`YYYY-MM-DD` vs ISO 8601). `description` field in spec but codebase uses `excerpt`. `tags` array in spec but codebase doesn't use tags for related posts (uses category + author only). |
| 43–54 | **Pipeline diagram references `filterPublished()` function that doesn't exist** | Line 43 shows `filterPublished()` in pipeline; codebase review confirms no such function. All 74 posts are treated as published. |
| 58–64 | **Category count mismatch** | Lists 6 categories including "Panchakarma", "Diet & Nutrition", "Herbs & Remedies", "Skin & Hair". Actual: 5 categories (Ayurveda, Yoga, Nutrition, Lifestyle, Wellness). "Nutrition" ≠ "Diet & Nutrition" — terminology drift. |
| 66–69 | **Author count mismatch** | Claims 6 authors with bios, credentials, social links. Actual: 2 authors (dr-sharma, dr-gor). No social links in author data. |
| 115–119 | **Pagination not addressed** | 74 posts rendered in 3-column grid with no pagination. Document promises `BlogPagination` component (per codebase review) — not in this doc. Performance risk: all posts loaded simultaneously. |
| 71–75 | **Related posts algorithm uses tags; codebase doesn't** | Spec: "Secondary signal: Tag overlap". Codebase: related posts use category + author match only; no tag field in frontmatter parsing. |

### Nit Issues

| Line | Issue | Detail |
|------|-------|--------|
| 26 | Code block uses `yaml` syntax highlight; line 8–22 uses `text` | Inconsistent: frontmatter example should use `yaml`; directory tree should use `text` or `tree` (both used inconsistently). |
| 9–22 | ASCII tree uses mixed `├─` / `└─` without clear convention | Line 11: `├─ posts/`, line 12: `│   ├─ published/`, line 18: `│   └─ drafts/`, line 20: `└─ config/` — last item uses `└─` correctly but internal structure inconsistent. |
| 117 | "Next.js Image" — terminology error | Project is Vite/React Router, not Next.js. Should say "optimized images via Vite plugins or CDN" or similar. |
| Various | Trailing whitespace | Lines 5, 39, 54, 119 have trailing spaces. |

---

## Recommendations for Improving Documentation Quality

### 1. Align Architecture to Codebase (Critical)
- **Rewrite Architecture section** to reflect actual Vite + React Router + `import.meta.glob` pipeline
- **Replace component diagram** with accurate representation: single `Blog.tsx` with internal functions/sections
- **Update directory tree** to match `data/blog/posts/` flat structure + `authors.ts`, `types.ts`, `loadPosts.ts`
- **Remove Next.js references** entirely; document Vite-specific patterns

### 2. Add Missing Critical Sections (Major)
| Section | Required Content |
|---------|------------------|
| **Error Handling** | Frontmatter parse errors, missing image fallbacks, search index corruption, localStorage quota, build-time vs runtime error boundaries |
| **Testing Strategy** | Unit tests: `loadPosts.ts` (parse, sort, filter), related posts scoring, search ranking. E2E: category/author filter, save/share, hero carousel, responsive breakpoints. Coverage target: 80%+ |
| **API Contracts** | If RSS/API ingestion planned, define: endpoint schema, auth, rate limits, retry policy, data transformation to frontmatter |
| **Deployment & Rollback** | Build command, preview deployments, cache invalidation, rollback procedure, feature flags for auto-post |

### 3. Fix Data Discrepancies (Major)
- **Post count**: Update to 74 (remove draft/published distinction unless implementing)
- **Categories**: List actual 5; rename "Nutrition" → "Diet & Nutrition" if aligning to design intent
- **Authors**: List actual 2; add placeholder for 4 future authors if planned
- **Related posts**: Remove "tag overlap" signal; document actual category + author algorithm

### 4. Make Document Actionable (Major)
- **Add file-level implementation map**: Which functions in `Blog.tsx` map to which features (search: lines 195–208, filters: 513–554, hero: 461–508, etc.)
- **Document `loadPosts.ts` API**: Export types, function signatures, sort/filter behavior
- **Specify frontmatter TypeScript interface** (from `types.ts`) so developers know exact shape
- **Add migration path** if draft/published folders + 6 categories + 6 authors are future goals

### 5. Formatting & Consistency (Minor/Nit)
- **Standardize code blocks**: `yaml` for frontmatter, `typescript` for TS interfaces, `text` for ASCII trees
- **Fix ASCII tree**: Use consistent `├──` / `└──` with proper indentation (4 spaces per level)
- **Add table of contents** for navigation (document is 119 lines; ToC improves scanability)
- **Define terminology glossary**: "Published" vs "Draft", "Category" vs "Tag", "Post" vs "Article"

---

## Suggested Revised Structure

```markdown
# EGM-09: Blog & Content Management System

## Overview (2–3 paragraphs, accurate post/category/author counts)

## Architecture (Vite + React Router)
### File Structure (accurate tree)
### Loading Pipeline (import.meta.glob → parseFrontmatter → sort → Blog.tsx)
### Component Map (Blog.tsx sections with line references)

## Content Model
### Frontmatter Schema (TypeScript interface)
### Categories (actual 5)
### Authors (actual 2 + expansion plan)
### Related Posts Algorithm (category + author only)

## SEO & Structured Data (current + planned)
### Implemented: Meta tags, Open Graph, Twitter Cards
### Missing: JSON-LD Article, Breadcrumb, Physician schema

## Auto-Post System (current state + roadmap)
### Current: autopost-log.json (manual)
### Planned: Scheduler, RSS/API, draft folder

## Content Governance
### Editorial Workflow (current: manual; planned: draft folder)
### Quality Standards (with automation checklist)

## Error Handling
### Build-time / Runtime / Data errors

## Testing Strategy
### Unit / Integration / E2E

## Deployment
### Build, Preview, Rollback, Feature Flags

## Performance
### Current: build-time load, lazy images, no pagination
### Planned: Pagination, virtualization, ISR (if migrating)

## Appendix: File Reference Map
```

---

## Conclusion

This document currently **describes an aspirational Next.js architecture** that does not exist in the codebase. A developer following this design would:

1. Create Next.js project structure (wrong framework)
2. Build 6 modular components (codebase has 1 monolith)
3. Implement draft/published folders + 6 categories + 6 authors (data doesn't exist)
4. Add JSON-LD structured data (no implementation exists)
5. Build auto-post scheduler (no backend/infrastructure)

**Recommendation**: Treat this as a **design proposal / RFC**, not an implementation reference. Either:
- **Option A**: Rewrite to match current codebase (for maintenance/docs)
- **Option B**: Keep as RFC with clear "Future State" labeling and create migration tickets

The codebase details review (`egm-09-blog-cms-codebase-details-review.md`) should be linked as a companion document for any developer working on this system.