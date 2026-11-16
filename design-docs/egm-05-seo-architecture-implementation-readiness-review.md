# EGM-05 SEO & Structured Data — Implementation Readiness Review

**Review Date:** 2026-11-13  
**Reviewer:** egm-implementation-readiness  
**Source Document:** `design-docs/egm-05-seo-architecture.md`

---

## 1. Implementation Completeness Score: **88%**

| Subsystem | Score | Status |
|-----------|-------|--------|
| Structured Data (JSON-LD) | 95% | ✅ 10 schemas, well-implemented |
| Page-Specific Meta Tags | 90% | ✅ 11 PAGE_SEO entries |
| SEOHead Component | 95% | ✅ Comprehensive, handles dynamic routes |
| BlogPosting Schema | 100% | ✅ Dynamic from blog data |
| Keyword Strategy | 80% | ✅ Keywords in PAGE_SEO, not centralized |
| Technical SEO | 85% | ✅ Canonical, robots, OG, Twitter |
| AI/GEO Optimization | 90% | ✅ MedicalWebPage, talkAbout, structured data |
| Schema Injection Logic | 95% | ✅ Path-based conditional injection |
| AggregateRating | 40% | ⚠️ **Hardcoded** — should be dynamic |
| Physician Schema Coverage | 50% | ⚠️ Only 1 of 3 documented physicians |
| /contact Route SEO | 0% | ❌ **Missing** PAGE_SEO entry |
| Sitemap/Robots.txt | 0% | ❌ **Not implemented** |
| Multi-language SEO | 60% | ⚠️ og:locale only en_IN, no hreflang |
| Core Web Vitals | ? | ❓ Not measured |

---

## 2. Missing Components / Incomplete Implementations

### P0 — Blockers for Production

| Component | Status | Gap Description |
|-----------|--------|-----------------|
| **/contact PAGE_SEO** | ❌ Missing | Route exists in nav but no SEO config |
| **AggregateRating Dynamic** | ❌ Hardcoded | 4.8/247 reviews static — Google may penalize |
| **Sitemap.xml** | ❌ Missing | No auto-generation for 13+ routes |
| **Robots.txt** | ❌ Missing | No crawl control |

### P1 — Significant Gaps

| Component | Status | Gap Description |
|-----------|--------|-----------------|
| **Physician Schema (3 docs)** | ⚠️ Partial | Doc claims 3 physicians (line 36), only Dr. Sharma implemented |
| **hreflang / Multi-language** | ⚠️ Missing | og:locale=en_IN only; no hi/gu alternates |
| **BlogPosting author markup** | ⚠️ Partial | Uses `author.name` only — no @id, url, sameAs |
| **Image Optimization** | ⚠️ Missing | og:image uses static `/images/og-default.jpg` for most pages |
| **Schema Validation** | ❌ Missing | No test suite for JSON-LD validity |

### P2 — Nice to Have

| Component | Status |
|-----------|--------|
| FAQ schema on more pages | Only /, /booking, /ayurveda-skin-care |
| HowTo on service detail pages | Only /services/panchakarma, /services |
| Service-specific schemas | Not implemented |
| Review schema integration | Not implemented |
| VideoObject schema | Not implemented |

---

## 3. Blockers for Production Deployment

### 🔴 CRITICAL — Must Fix Before Launch

1. **Hardcoded AggregateRating (seo.ts lines 324-328)**
   - `"ratingValue": "4.8", "ratingCount": "247"` — static values
   - **Risk:** Google Search Console manual action for fake reviews
   - **Fix:** Connect to real review data or remove until dynamic

2. **Missing /contact PAGE_SEO Entry**
   - Route referenced in constants.ts NAV_ITEMS (label: "Contact", path: "/booking")
   - But no `contact` key in PAGE_SEO — falls back to `home`
   - **Fix:** Add `contact` entry to PAGE_SEO or fix nav label

3. **No Sitemap.xml / Robots.txt**
   - 13 routes + dynamic blog posts need discovery
   - **Fix:** Add `vite-plugin-sitemap` or generate at build

### 🟡 HIGH — Should Fix Before Launch

4. **Physician Schema Incomplete**
   - Design doc: "3 physician profiles with credentials" (line 36)
   - Code: Only Dr. Jinendradutt Sharma (PHYSICIAN_SCHEMA)
   - **Fix:** Add Dr. Sharlin Gor + 3rd physician schemas

5. **Multi-language SEO Missing**
   - Site supports en/hi/gu via LanguageContext
   - No `hreflang` tags, no translated meta, og:locale only en_IN
   - **Fix:** Add hreflang alternates, per-language PAGE_SEO

6. **BlogPosting Author Markup Thin**
   - Only `author.name` — no `@id`, `url`, `sameAs`, `credential`
   - **Fix:** Enhance with full Person schema

---

## 4. Technical Debt Resolution Order

| Order | Debt Item | Effort | Dependency |
|-------|-----------|--------|------------|
| 1 | Remove/dynamic AggregateRating | 0.5 days | Review data source |
| 2 | Add /contact PAGE_SEO entry | 0.25 days | Confirm route |
| 3 | Add sitemap generation | 0.5 days | vite-plugin-sitemap |
| 4 | Add robots.txt | 0.25 days | Public folder |
| 5 | Add 2 missing physician schemas | 0.5 days | Physician data |
| 6 | Add hreflang support | 1 day | Translated content |
| 7 | Enhance BlogPosting author | 0.5 days | Author data model |
| 8 | Per-page og:image | 1 day | Image assets |
| 9 | Schema validation tests | 1 day | Jest + schema.org validator |

**Total Critical Path: ~1.5 days** for P0 items

---

## 5. Effort Estimates for Gaps

| Gap Category | Estimated Effort | Risk if Deferred |
|--------------|------------------|------------------|
| AggregateRating fix | 0.5 days | **Manual penalty risk** |
| Sitemap + robots | 1 day | Poor crawl coverage |
| Contact SEO | 0.25 days | Wrong meta on page |
| Physician schemas | 0.5 days | Incomplete E-E-A-T |
| Multi-language SEO | 1 day | Missed hi/gu traffic |
| Schema validation | 1 day | Silent schema errors |

---

## 6. Architecture Decision Alignment

| Decision (Doc) | Implementation Status | Notes |
|----------------|----------------------|-------|
| 8 structured data blocks | ✅ **Exceeded** — 10 schemas | BlogPosting + SkinCareFAQ extra |
| Centralized in seo.ts | ✅ Implemented | Single source of truth |
| SEOHead with seoKey prop | 🟡 **Different** — uses path resolution | No seoKey prop, uses location.pathname |
| JSON-LD injection | ✅ Implemented | DOM manipulation in useEffect |
| No-render fallback | ✅ Implemented | Meta tags in initial HTML |
| Blog frontmatter SEO | ✅ Implemented | Dynamic BlogPosting schema |
| Service detail dynamic schema | ❌ **Not implemented** | Only generic service PAGE_SEO |
| MedicalBusiness global | ✅ Implemented | HOSPITAL_SCHEMA on all pages |
| FAQPage for AI citation | ✅ Implemented | FAQ_SCHEMA + SKIN_CARE_FAQ_SCHEMA |
| Keyword strategy | 🟡 Partial | In PAGE_SEO, not centralized |

---

## 7. Go/No-Go Recommendation

**CONDITIONAL GO for production** with P0 fixes (est. 1.5 days):

- ✅ Core SEO infrastructure excellent
- ✅ Structured data comprehensive (10 schemas)
- ✅ Dynamic blog post schema
- ✅ Path-based schema injection logic sound
- ⚠️ **Must fix:** AggregateRating (remove or make dynamic)
- ⚠️ **Must fix:** Add sitemap.xml + robots.txt
- ⚠️ **Must fix:** /contact PAGE_SEO entry
- ⚠️ **Should fix:** Physician schemas (2 missing), hreflang

**Pre-launch validation checklist:**
1. Google Rich Results Test on all page types
2. Schema.org validator on all JSON-LD
3. Search Console coverage report after deploy
4. Verify no AggregateRating in production without real data
5. Test hreflang with international targeting tool

---

*Report generated by egm-implementation-readiness reviewer*