# EGM-05 SEO & Structured Data — Style Review

**Review Date:** 2026-11-13  
**Reviewer:** egm-style  
**Source Document:** `design-docs/egm-05-seo-architecture.md`

---

## 1. Structure Compliance

| Required Section | Present? | Quality |
|------------------|----------|---------|
| Overview | ✅ | Clear scope: 909 lines, 8 blocks, 10 routes |
| Structured Data Blocks (1-9) | ✅ | 9 schemas documented with JSON |
| Page-Specific SEO Table | ✅ | 10 routes with title/description focus |
| SEO Head Component | ✅ | Features listed |
| Keyword Strategy | ✅ | 4 categories + AI citation |
| Technical Implementation | ✅ | 5 bullets |
| Integration Points | ✅ | 4 integration points |

**Verdict:** ✅ **All required sections present** — follows EGM SEO template.

---

## 2. Formatting Consistency

### Tables
- ✅ Page-Specific SEO table: consistent columns (Route, Title Template, Meta Description Focus)
- ⚠️ Structured data blocks use JSON code blocks, not tables

### Code Blocks
- ✅ Language tag: `json` for schemas
- ✅ Well-formatted JSON with proper indentation
- ⚠️ Only MedicalBusiness shown in full; others summarized

### Diagrams
- ❌ No diagrams (architecture, flow, schema relationships)

### Headings
- ✅ Consistent hierarchy (##, ###)
- ✅ Numbered schema blocks (1-9)

---

## 3. Clarity and Readability

### Strengths
- Clear overview with metrics (909 lines, 8 blocks, 10 routes)
- Each schema block has purpose + application scope
- Page-specific table is actionable for implementation
- Keyword strategy categorized logically
- Integration points show data flow

### Issues
| Location | Issue | Severity |
|----------|-------|----------|
| Line 4 | "8 structured data blocks" | 🔴 **False** — code has 10 |
| Line 8 | MedicalBusiness numbered as "1" | ✅ Accurate |
| Line 26 | FAQPage: "8 FAQ pairs" | 🔴 **False** — 35 in FAQ_SCHEMA + 24 in SKIN_CARE_FAQ_SCHEMA |
| Line 31 | Organization | ✅ Accurate |
| Line 35 | Physician: "3 physician profiles" | 🔴 **False** — only 1 implemented |
| Line 39 | BreadcrumbList | ✅ Accurate |
| Line 43 | "HowTo Blocks (3x)" | ✅ Accurate (3 implemented) |
| Line 48 | MedicalWebPage: "9. MedicalWebPage" | 🟡 Numbering off (should be 8 or 9) |
| Line 54 | Page-Specific SEO: 10 routes | 🔴 **False** — 11 PAGE_SEO entries |
| Line 63 | `/contact` route in table | 🔴 **False** — no PAGE_SEO entry |
| Line 66 | `/skin-care` route | 🔴 **False** — key is `ayurveda-skin-care` |
| Line 69 | "Renders title, meta description, keywords" | ✅ Accurate |
| Line 71 | "Outputs JSON-LD for all structured data" | ✅ Accurate |
| Line 83 | "All SEO data centralized in seo.ts" | ✅ Accurate |
| Line 85 | "SEOHead accepts seoKey prop" | 🔴 **False** — uses path resolution, no seoKey prop |
| Line 87 | "No-render fallback: meta tags in initial HTML" | 🟡 Partial — SPA, no SSR |
| Line 91 | "SEOHead rendered in root Layout" | 🟡 **False** — rendered in App.tsx root, not Layout |
| Line 92 | "Individual pages pass seo prop" | 🔴 **False** — SEOHead reads location.pathname |

---

## 4. Completeness

### TODOs / TBDs / Placeholders
- None explicitly marked

### Missing Information
- **BlogPosting Schema** — Implemented but not documented
- **SkinCare FAQ Schema** — 24 FAQs implemented, doc says 8 generic
- **AggregateRating** — Hardcoded in code, not mentioned in doc
- **Physician Schema count** — Doc says 3, code has 1
- **Multi-language SEO** — Not addressed (site supports en/hi/gu)
- **hreflang** — Not mentioned
- **Sitemap/Robots.txt** — Not mentioned
- **Schema validation/testing** — Not mentioned
- **Image optimization strategy** — og:image mostly static default
- **Service-specific schemas** — Not implemented, not mentioned
- **Review schema** — Not mentioned
- **Core Web Vitals / Performance** — Not mentioned
- **seoKey prop vs path resolution** — Doc describes props pattern, code uses location

---

## 5. Tone and Professionalism

| Aspect | Assessment |
|--------|------------|
| Technical precision | Medium — multiple factual inaccuracies vs code |
| Honesty about gaps | Low — presents target as current |
| Actionability | High — page table is implementation-ready |
| Spec vs. reality | 🔴 **Problem** — describes aspirational state |

### Tone Issues
- Reads as **target specification** not **current implementation audit**
- No distinction between "designed" and "implemented"
- Counts (8 blocks, 10 routes, 8 FAQs, 3 physicians) don't match code

---

## 6. Specific Style Violations

| # | Violation | Location | Fix |
|---|-----------|----------|-----|
| 1 | False count: "8 structured data blocks" | Line 4 | Update to "10 structured data schemas" |
| 2 | False count: "8 FAQ pairs" | Line 27 | Update to "35 general + 24 skin-care FAQs" |
| 3 | False count: "3 physician profiles" | Line 36 | Update to "1 physician profile (Dr. Sharma); 2 planned" |
| 4 | False count: "10 routes" in SEO table | Line 54 | Update to "11 PAGE_SEO entries" |
| 5 | False route: `/contact` | Line 63 | Remove or add PAGE_SEO entry |
| 6 | False route key: `/skin-care` | Line 66 | Update to `ayurveda-skin-care` |
| 7 | False prop: "seoKey prop" | Line 85 | Update to "path-based resolution via useLocation" |
| 8 | False location: "SEOHead in root Layout" | Line 91 | Update to "SEOHead at App.tsx root" |
| 9 | False pattern: "pages pass seo prop" | Line 92 | Update to "SEOHead auto-resolves from pathname" |
| 10 | Missing BlogPosting schema | Entire doc | Add section |
| 11 | Missing SkinCare FAQ detail | Line 26 | Document 24-question schema |
| 12 | No frontmatter metadata | Top of file | Add version, date, author, status |
| 13 | MedicalWebPage numbered 9 of 8 | Line 48 | Fix numbering |

---

## 7. Comparison to EGM Conventions

| Convention | Compliance |
|------------|------------|
| Schema examples in JSON | ✅ Good |
| Page-specific SEO table | ✅ Good |
| Keyword strategy categories | ✅ Good |
| Integration points listed | ✅ Good |
| Frontmatter metadata | ❌ Missing |
| Spec vs. implementation separation | ❌ Mixed |
| Accurate counts matching code | ❌ Multiple mismatches |
| All implemented schemas documented | ❌ BlogPosting missing |
| Multi-language considerations | ❌ Missing |

---

## 8. Recommendations

### Quick Wins (Do Now)
1. Add frontmatter with version, date, author, status
2. Correct all counts to match codebase:
   - Line 4: "10 structured data schemas (909 lines in seo.ts)"
   - Line 27: "FAQPage: 35 general FAQs + 24 skin-care FAQs"
   - Line 36: "Physician: 1 profile implemented (Dr. Sharma); 2 planned"
   - Line 54: "11 PAGE_SEO entries"
   - Line 63: Remove `/contact` or add entry
   - Line 66: Change to `/ayurveda-skin-care`
3. Fix MedicalWebPage numbering (line 48)
4. Update SEOHead integration description (lines 85, 91, 92)

### Structural Improvements
1. Split into **Current Implementation** and **Target Architecture**
2. Add **BlogPosting Schema** section (implemented, not documented)
3. Add **SkinCare FAQ Schema** section with 24-question detail
4. Add **AggregateRating** note (hardcoded, needs dynamic source)
5. Add **Missing/Planned** section:
   - 2 additional Physician schemas
   - hreflang for en/hi/gu
   - Sitemap.xml generation
   - Robots.txt
   - Service-specific schemas
   - Review schema
6. Add **Multi-language SEO** section
7. Add **Schema Validation/Testing** section

### Polish
1. Verify all PAGE_SEO keys against actual object
2. Document schema injection logic (which schema on which path)
3. Show BlogPosting schema example
4. Note og:image strategy (mostly static default)
5. Add mermaid diagram for SEOHead → seo.ts → page flow

---

## 9. Overall Style Score: **50/100**

| Dimension | Score |
|-----------|-------|
| Structure | 80 |
| Formatting | 75 |
| Clarity | 35 |
| Completeness | 40 |
| Tone | 45 |
| Convention Adherence | 40 |

**Primary issue:** Document describes target architecture with multiple factual inaccuracies vs. actual implementation. Counts don't match, patterns differ, implemented features undocumented.

---

*Report generated by egm-style reviewer*