# Comprehension Review Report: egm-24-constants-data-layer.md

**Reviewer:** egm-comprehension (Naive Reader Persona)  
**Target Document:** F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site\design-docs\egm-24-constants-data-layer.md  
**Source Files Audited:** constants.ts, types.ts, seo.ts, translations.ts, knowledge/index.ts, knowledge/siddhanta/tridosha.json, knowledge/hospital/services.json, components/LanguageContext.tsx

---

## Paraphrase

### What This Proposes
The document describes a constants-and-data-layer architecture for the Ayurvritta hospital site. It centralizes all static content (services, programs, insurance partners, navigation, SEO, translations, and a RAG knowledge base for an AI chatbot) into five TypeScript/JSON files. The architecture uses TypeScript interfaces for type safety, tree-shaking at build time to inline constants, and React context for language switching. It also documents maintenance procedures, known issues, and future improvements.

### How the Existing System Works, Per This Document
The system stores domain data in `constants.ts` (738 lines), types in `types.ts` (57 lines), SEO structured data and page metadata in `seo.ts` (909 lines), translations for three languages in `translations.ts` (~1200 lines), and six JSON files for the AI knowledge base. At build time, TypeScript compiles and tree-shakes the constants into the bundle. At runtime, React components import typed data directly, while the AI service retrieves knowledge chunks via keyword matching. The `LanguageContext` provider manages language state and persists it to localStorage.

---

## Findings

### 1. Terminology Precision — 🔴 **Major**

| # | Issue | Location | Discrepancy |
|---|-------|----------|-------------|
| 1 | **File line count mismatch for `translations.ts`** | Section 1, Table row 5 | Document claims `~1200+` lines. Actual file is **209 lines** total (all three languages combined). |
| 2 | **Service category count mismatch** | Section 3.2, Table (lines 107–118) | Document lists **9 service categories** with IDs `vasti`, `raktamokshana`, `lepa`, `agnikarma`. Actual `constants.ts` has **11 service objects** with different IDs: `basti` (not `vasti`), `rakta` (not `raktamokshana`), `netra`, `oral`, `women`, `others`. Categories `lepa` and `agnikarma` don't exist as top-level services. |
| 3 | **Sub-service counts don't match** | Section 3.2, Table | Document claims specific counts (e.g., 13 for abhyanga, 15 for swedana). Actual: abhyanga=11, swedana=14, dhara=7, basti=4, netra=5, nasya=5, oral=3, rakta=4, women=2, others=7, panchakarma=4. Total ≈ 66. |
| 4 | **Program IDs and data don't match** | Section 3.3, Table (lines 142–148) | Document lists 5 programs with IDs like `panchakarma-detox`, `post-covid-recovery`. Actual `constants.ts` has **6 programs** with IDs: `thyroid`, `diabetes`, `ckd`, `stress`, `weight` (different titles, durations, icons). |
| 5 | **Insurance partner count discrepancy** | Section 3.4 | Document claims "51 partners (38 Insurers + 13 TPAs)". Actual: 4 PSU + 27 Private + 13 TPA = **44 total**. Private list in doc shows 27 names, not 34. |
| 6 | **Testimonial data mismatch** | Section 3.5 | Document shows placeholder names (Rajesh Kumar, Priya Sharma). Actual has real patient names (Nandini Sharma, Krishna Dhobi, Ranjana Guha, Shaikh Amrin, Aashima Singh) with different conditions. |
| 7 | **Knowledge retrieval function names wrong** | Section 6.1 (lines 284–291) | Document shows `searchKnowledge()` and `getKnowledgeContext()`. Actual exports `retrieveKnowledge()` and `getKnowledgeContext()`. `searchKnowledge` does not exist. |
| 8 | **SEO helper function signatures reference undefined types** | Section 4.3 (lines 215–222) | Signatures reference `SEOData`, `BlogPost`, `FAQ`, `BreadcrumbItem`, `JsonLd` — none defined in `types.ts` or `seo.ts`. No such helper functions exist in `seo.ts`. |
| 9 | **Translation namespace structure mismatch** | Section 5.1 (lines 231–242) | Document shows `export const translations: Record<Language, TranslationNamespace>`. Actual exports `TRANSLATIONS` (uppercase) with structure: `common`, `nav`, `hero`, `trust`, `testimonials`, `faq`, `footer`. `TranslationNamespace` type not defined. |
| 10 | **Translation key counts inflated** | Section 5.3, Table (lines 257–266) | Document claims ~150 keys per language. Actual: ~35–48 keys per language across 7 namespaces. |

---

### 2. Diagram Accuracy — 🔴 **Major**

| # | Issue | Location | Discrepancy |
|---|-------|----------|-------------|
| 1 | **Runtime hooks don't exist** | Section 7, Runtime diagram (lines 324–330) | Diagram shows `useServices()`, `usePrograms()`, `useInsurance()`, `useTranslations()`, `useSEO()`. **None exist**. Section 8.1 shows direct imports (`import { SERVICES } from '@/constants'`). |
| 2 | **Server-side API misrepresented** | Section 7, Runtime diagram | Diagram shows `/api/nvidia.ts` reading env vars. Actual AI integration in `knowledge/index.ts` is client-callable via direct imports. No `/api/nvidia.ts` in provided sources. |
| 3 | **Build-time tree-shaking claim oversimplified** | Section 7, Build-time diagram | Claims "constants inlined (dead code elim)." But `constants.ts` imports `LucideIcon` React components from `lucide-react` which are not tree-shakable as plain values — they're bundled. |

---

### 3. Completeness — 🔴 **Major**

| # | Gap | Location | Rationale |
|---|-----|----------|-----------|
| 1 | **Missing type definitions in SEO section** | Section 4.3 | Helper functions reference `SEOData`, `BlogPost`, `FAQ`, `BreadcrumbItem`, `JsonLd` — none exist. |
| 2 | **No explanation of `LucideIcon` dependency** | Section 2 | `Service` and `Program` use `icon: LucideIcon` but document never explains it's a React component (not serializable for JSON-LD). |
| 3 | **Knowledge base file paths wrong** | Section 6, Table (lines 272–280) | Table lists `services.json` at root; actual import is `./hospital/services.json`. |
| 4 | **AI service integration point not shown** | Section 6.2 | References `lib/aiService.ts` — **not provided in Goldfish context**. Integration mechanism opaque. |
| 5 | **Language persistence not implemented** | Section 5.2 | Comment says "Persisted to localStorage" but `LanguageContext.tsx` only uses `useState` — **no localStorage logic exists**. |
| 6 | **No `useTranslation` hook** | Section 8.1 | Example calls `useTranslation()` but **not defined** in sources. Actual context provides `t` via `useLanguage()`. |
| 7 | **Program structure inconsistency** | Section 3.3 vs code | `Program` interface requires `subtitle`, `idealFor`, `includes` — document's table omits these. Actual data has them. |

---

### 4. Reading Comprehension — 🟡 **Nit**

| # | Clarity Issue | Location | Rationale |
|---|---------------|----------|-----------|
| 1 | **Ambiguous "auto-generated" note** | Section 8.3, line 389 | "auto-generated from constants.ts? Currently manual" — speculative, unclear if current state, TODO, or question. |
| 2 | **Unenforced "Validation Rules"** | Section 9.2 | "Language keys must exist in all 3 locales" — **not enforced by TypeScript** (plain const, no key-parity constraint). |
| 3 | **Price drift unacknowledged** | Section 6 vs 3.2 | `knowledge/hospital/services.json` shows different price ranges (e.g., Abhyanga "₹500-₹1500" vs constants 400–1600). |
| 4 | **Unused `Advice` interface** | Section 2 | Defined in `types.ts` but never referenced in document or `constants.ts`. |
| 5 | **Inconsistent export casing** | Throughout | Document uses `translations` (lowercase); actual export is `TRANSLATIONS` (uppercase). |

---

## Summary

| Criterion | Rating | Key Problem |
|-----------|--------|-------------|
| **Terminology Precision** | 🔴 **Major** | Factual mismatches: service categories, programs, insurance counts, function names, type signatures, translation structure. |
| **Diagram Accuracy** | 🔴 **Major** | Runtime diagram invents non-existent hooks and misrepresents AI integration. |
| **Completeness** | 🔴 **Major** | Referenced types missing (`SEOData`, `BlogPost`, `FAQ`, `BreadcrumbItem`, `JsonLd`, `TranslationNamespace`); key impl details absent; drift unacknowledged. |
| **Reading Comprehension** | 🟡 **Nit** | Speculative comments, unenforced validation claims, minor inconsistencies. |

---

## Recommendation

**This document requires significant revision before serving as an accurate architectural reference.** The discrepancies describe a system that materially differs from the implemented codebase. A naive reader would form an incorrect mental model.

**Priority fixes:**
1. Align service/program/insurance tables with actual `constants.ts` data.
2. Remove or correct non-existent SEO helper function signatures.
3. Fix knowledge retrieval function names to match `knowledge/index.ts`.
4. Correct runtime diagram to show actual import patterns (direct imports, not hooks).
5. Add missing type definitions or remove references to them.
6. Verify and correct translation key counts and structure.
7. Clarify or remove speculative "auto-generated?" comments.

---