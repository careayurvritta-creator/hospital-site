# Zoom-Out Review: EGM-24 Constants & Data Layer Architecture

**Document reviewed:** `egm-24-constants-data-layer.md`
**Review date:** 2026-11-13
**Reviewer:** egm-zoom-out (per `zoom-out-standard.md`)

---

## Executive Summary

**Verdict: FAILS — Material drift between documented design and actual implementation.**

The design document describes an architecture that does not exist in the codebase. Key metrics (line counts, namespace counts, service categories, program IDs, testimonial data, translation coverage, function names) are materially inaccurate. The document appears to capture an aspirational or stale state rather than the current reality. This violates the zoom-out standard's **Context Sufficiency** (the reviewer cannot determine the true system from the doc) and **Root Problem Focus** (the doc masks the real drift problems by presenting a tidy but fictional architecture).

---

## 1. Architectural Coherence — Does the data layer architecture make sense as a unified system?

### Finding: The "single source of truth" claim is false in practice.

| Claim in Doc | Actual State | Coherence Impact |
|--------------|--------------|------------------|
| **translations.ts** = ~1200 lines, 50+ namespaces, ~150 keys/lang | 209 lines, 8 namespaces (`common`, `nav`, `hero`, `trust`, `testimonials`, `faq`, `footer`), ~50 keys total | Doc overstates i18n coverage by 6x. No `TranslationNamespace` type exists. |
| **Services** = 9 categories (abhyanga, swedana, dhara, vasti, nasya, raktamokshana, lepa, agnikarma, panchakarma) | 11 services: `abhyanga`, `swedana`, `dhara`, `panchakarma`, `basti`, `netra`, `nasya`, `oral`, `rakta`, `women`, `others` | "vasti" vs "basti", "raktamokshana" vs "rakta", missing `netra`/`oral`/`women`/`others`. `lepa`/`agnikarma` are sub-services under `rakta`. |
| **Programs** = 5 IDs: `panchakarma-detox`, `post-covid-recovery`, `stress-management`, `weight-management`, `geriatric-care` | 5 different IDs: `thyroid`, `diabetes`, `ckd`, `stress`, `weight` with different titles/durations | Zero overlap in IDs. Doc's program table is fabricated. |
| **Testimonials** = Rajesh Kumar, Priya Sharma, Amit Patel, Sunita Devi, Vikram Singh | Nandini Sharma, Krishna Dhobi, Ranjana Guha, Shaikh Amrin, Aashima Singh | Completely different data. |
| **knowledge/services.json** = 9 services × full details | 7 service categories + 5 programs in different structure | Doc's `services.json` example (`abhyanga` with `subServices`) doesn't match actual file. |
| **SEO routes** = 10 including `ayurveda-skin-care` | `PAGE_SEO` keys: `home`, `ayurveda-skin-care`, `about`, `services`, `programs`, `booking`, `tools`, `insurance` | Partial match but doc implies completeness that doesn't exist. |
| **searchKnowledge** function | Actual: `retrieveKnowledge` | Function name mismatch. |
| **LanguageContext** persists to localStorage, applies `<html lang>` | Does neither — no localStorage, no document.lang | Doc describes features that don't exist. |

**Root cause:** The document reads like a design *proposal* or *snapshot from an earlier iteration*, not a living architecture doc. It presents a coherent system that has since diverged (or was never fully implemented).

---

## 2. Scope Boundaries — Is it clear what belongs in this layer vs. other layers?

### Finding: Scope is ambiguous and incomplete.

| Layer | In Doc | Actual | Gap |
|-------|--------|--------|-----|
| **Blog content** | Not mentioned | `data/blog/` with 60+ markdown posts, `types.ts`, `authors.ts`, `loadPosts.ts` | Largest content surface (60+ posts) is a *separate data layer* with its own types, loader, and markdown parser. Undermines "single source of truth". |
| **SEO structured data** | Described as part of data layer | `seo.ts` (909 lines) mixes static page config + helper functions + JSON-LD generation | Boundary unclear: is `generateServiceSEO` a data-layer function or a presentation helper? It imports `Service` from constants — coupling. |
| **Knowledge base (RAG)** | Included in data layer | `knowledge/*.json` + `index.ts` — but `services.json` duplicates constants with drift | Knowledge base should *derive* from constants, not duplicate. Doc acknowledges this (P1 future) but current state is drift. |
| **Types** | `types.ts` = domain types | `types.ts` imports `LucideIcon` (UI icon) — presentation leaks into domain | `LucideIcon` in `Service.icon` couples domain to `lucide-react`. |
| **Translations** | Centralized in `translations.ts` | `translations.ts` is flat object; `LanguageContext.tsx` consumes it; no i18n library | No interpolation, pluralization, or fallback strategy. Scope of "translation layer" is underspecified. |

**Zoom-out standard check — Right Placement (Architectural Fit):** Blog data is misplaced — it should either be in the unified data layer or explicitly excluded with rationale. The doc's silence on blog is an architectural omission.

---

## 3. Non-Functional Qualities

### 3.1 Maintainability
- **constants.ts (738 lines)** — Single file with 11 services, 70+ sub-services, 51 insurance partners, 5 programs, 5 testimonials. No modular split by domain.
- **knowledge/index.ts** — `buildKnowledgeChunks()` rebuilds the entire chunk array on **every search call** (no memoization/caching). O(n) per query where n = total chunks.
- **seo.ts (909 lines)** — Mixes data (PAGE_SEO) with behavior (helper functions). Hard to tree-shake; all 909 lines likely bundled.

### 3.2 Scalability
- Knowledge retrieval is synchronous, linear scan with string matching. Not suitable for >100 chunks.
- No pagination or indexing strategy for blog posts (60+ markdown files loaded via `import.meta.glob` at build).
- Insurance partners array (51 items) rendered as-is — no lazy loading or virtualization considered.

### 3.3 Type Safety
| File | Issue |
|------|-------|
| `translations.ts` | No `TranslationNamespace` type. `TRANSLATIONS` is untyped object. Keys not validated across `en`/`hi`/`gu` — missing keys fail silently at runtime. |
| `knowledge/index.ts` | Uses `any` extensively (`dosha: any`, `d: any`, `data: [string, any]`). No JSON schema validation on import. |
| `types.ts` | `LucideIcon` import couples domain types to UI library. |
| `seo.ts` | `generateBlogPostSEO(post: BlogPost)` — `BlogPost` not in `types.ts` (it's in `data/blog/types.ts`). Cross-layer type dependency undocumented. |

### 3.4 i18n Readiness
- **Coverage:** 8 namespaces, ~50 keys — far from "50+ namespaces, ~150 keys" claimed.
- **Architecture:** Flat object per language; no nested namespace typing; no interpolation (`{variable}`); no pluralization; no ICU message format.
- **Runtime:** `LanguageContext` provides `t` as full object; components use `t.nav.home` — but missing key returns `undefined` (no fallback). Doc's example shows `t(\`services.categories.\${service.id}\`) || service.title` — fragile string concatenation, not type-safe.

---

## 4. Cross-Cutting Concerns

### 4.1 Drift Risk — **ACTIVE DRIFT CONFIRMED**

| Data Point | constants.ts | knowledge/services.json | Delta |
|------------|--------------|-------------------------|-------|
| Abhyanga Full Body price | 1600 | 1300 | **₹300 diff** |
| Kati Vasti price | 1200 | 1000 | **₹200 diff** |
| Shirodhara price | 2000 | 1500 | **₹500 diff** |
| Vamana price | 1100 | 5000 | **₹3900 diff** |
| Virechana price | 500 | 3000 | **₹2500 diff** |
| Patra Pinda Sweda | 1700 | 1500 | **₹200 diff** |
| Shashtika Pinda Sweda | 1900 | 2000 | **₹100 diff** |

The doc's "Known Issues" table (9.3) flags this as "Drift risk — Auto-generate knowledge/services.json from constants.ts" but **the drift is already live and material**. Prices shown to users via the site (constants) differ from prices fed to the AI chatbot (knowledge).

### 4.2 Duplication
- **Hospital info** appears in 3 places: `knowledge/index.ts::HOSPITAL_INFO`, `knowledge/hospital/services.json` (location, phone, hours, doctor), `seo.ts::medicalBusinessSchema`.
- **Insurance examples** in `services.json::insurance.examples` (5 names) are a subset of `INSURANCE_PARTNERS` (51 entries).
- **Service descriptions** duplicated between `constants.ts` (full) and `services.json` (abridged).

### 4.3 Validation Gap
- No runtime validation (Zod, io-ts, etc.) despite P1 in future improvements.
- TypeScript only validates at authoring time; JSON files (`knowledge/*.json`) are `any`-typed at import — schema drift undetected.
- Translations: no build-time check that all 3 locales have identical keys.

### 4.4 CMS Gap — Acknowledged but No Migration Path
- Doc lists "Headless CMS for content editing" as P3/High effort.
- Current workflow: edit TypeScript/JSON → PR → Deploy. Non-technical updates impossible.
- Blog uses markdown frontmatter (closer to CMS) but still requires code deploy for new posts.

---

## 5. Zoom-Out Standard Compliance Check

| Criterion | Pass/Fail | Notes |
|-----------|-----------|-------|
| **0. Context Sufficiency** | **FAIL** | Doc presents a fictional system; reviewer cannot determine true architecture from doc alone. |
| **1. Root Problem Focus** | **FAIL** | Doc masks real problems (drift, duplication, incomplete i18n) behind a tidy but inaccurate narrative. |
| **2. Simplicity & Extensibility** | Partial | Data flow diagram is clean, but actual code has dead ends (knowledge rebuild on every query, no modular constants). YAGNI violations: future improvements include price history, IRDAI API sync — speculative. |
| **3. Anti-Weeds (Altitude Control)** | Partial | Doc stays at architecture level (good), but §8 drops into component implementation snippets (premature detail). |
| **4. Leverage Existing** | **FAIL** | Doc ignores existing blog data layer (`data/blog/*`). `LucideIcon` in types couples to UI lib. No reuse of validation patterns (Zod not used anywhere). |

---

## 6. Required Corrections (Blocking)

1. **Update all metrics to match source** — line counts, service categories, program IDs, testimonial data, translation namespaces, function names.
2. **Document the blog data layer** — either integrate it into the architecture or explicitly exclude with rationale.
3. **Resolve knowledge/constants drift** — either auto-generate `knowledge/hospital/services.json` from `constants.ts` (P1) or accept duplication with a sync protocol.
4. **Remove `LucideIcon` from `types.ts`** — use string icon keys; resolve to components at presentation layer.
5. **Add `TranslationNamespace` type** and build-time key parity check across locales.
6. **Memoize `buildKnowledgeChunks()`** — build once, reuse across queries.
7. **Split `constants.ts`** into domain modules (`services.ts`, `programs.ts`, `insurance.ts`, `testimonials.ts`, `navigation.ts`) with barrel export.

---

## 7. Recommended Next Steps

| Priority | Action |
|----------|--------|
| P0 | Correct the design doc to reflect actual code (or update code to match doc — decide which is source of truth). |
| P0 | Auto-generate `knowledge/hospital/services.json` from `constants.ts` via build script. |
| P1 | Add Zod schemas for `Service`, `Program`, `InsurancePartner`; validate constants at build. |
| P1 | Extract `TranslationNamespace` type; add CI check for key parity across `en`/`hi`/`gu`. |
| P2 | Split `constants.ts` into domain modules. |
| P2 | Memoize knowledge chunk building; add simple index for retrieval. |
| P3 | Evaluate headless CMS for blog + service content (unify with markdown frontmatter pattern). |

---

## Appendix: Source File Reference (Actual State)

| File | Lines | Key Exports | Notes |
|------|-------|-------------|-------|
| `constants.ts` | 738 | `NAV_ITEMS`, `FOOTER_LINKS`, `INSURANCE_PARTNERS` (51), `SERVICES` (11), `PROGRAMS` (5), `TESTIMONIALS` (5) | Single large file |
| `types.ts` | 57 | `Language`, `NavItem`, `SubService`, `Service`, `Program`, `Testimonial`, `Advice`, `InsurancePartner` | Imports `LucideIcon` |
| `seo.ts` | 909 | `PAGE_SEO`, `generatePageSEO`, `generateServiceSEO`, `generateProgramSEO`, `generateBlogPostSEO`, `generateFAQSchema`, `generateBreadcrumbSchema`, `generateMedicalBusinessSchema` | `BlogPost` from `data/blog/types.ts` |
| `translations.ts` | 209 | `TRANSLATIONS` (object), `Language`, `LANGUAGES` | 8 namespaces, ~50 keys/lang |
| `knowledge/index.ts` | 197 | `retrieveKnowledge`, `getKnowledgeContext`, `HOSPITAL_INFO` | Rebuilds chunks per query; uses `any` |
| `knowledge/hospital/services.json` | 146 | Service categories (7), programs (5), insurance, booking | Duplicates constants with price drift |
| `components/LanguageContext.tsx` | 35 | `LanguageProvider`, `useLanguage` | No localStorage, no `document.lang` |
| `data/blog/types.ts` | 29 | `BlogPost`, `BlogAuthor`, `BlogCategory` | Separate type domain |
| `data/blog/loadPosts.ts` | 66 | `ALL_POSTS` (from markdown glob) | Build-time markdown loader |

---

**End of Report**