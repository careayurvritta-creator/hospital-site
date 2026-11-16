# Consolidated Review Report: EGM-24 Constants & Data Layer Architecture

**Document Reviewed**: `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site\design-docs\egm-24-constants-data-layer.md`
**Review Date**: 2026-11-13
**Review Process**: Elephant-Goldfish Model (EGM) 5-Stage Review Protocol
**Artifact Directory**: `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site\design-docs\`

---

## Executive Summary

**OVERALL VERDICT: FAILS — The document describes a phantom architecture that does not exist in the codebase.**

The design document presents a clean, modular, type-safe, validated, and extensible data layer. The actual codebase has:
- **Zero runtime validation** (despite claims of TypeScript enforcement)
- **Material drift** between `constants.ts` and `knowledge/hospital/services.json` (different prices, structures, descriptions)
- **No auto-generation pipeline** (documented as "implemented," actually manual)
- **Phantom React hooks** (`useServices()`, `usePrograms()`, etc.) that don't exist
- **Inflated translation metrics** (~150 keys/locale claimed; ~40 actual)
- **Incorrect SEO export signatures** (named exports documented; default object exported)
- **Custom RAG over-engineering** (197 lines for 6 small JSON files, rebuilds index per query)
- **No test strategy** for data integrity, schema validation, or i18n completeness

**The document must be substantially rewritten to reflect actual code reality before it can serve as a reliable design reference.**

---

## Review Stages Summary

| Stage | Reviewer | Report | Key Finding |
|-------|----------|--------|-------------|
| 5 | egm-zoom-out (Initial) | `zoom_out_report.md` | Material drift: doc describes fictional system; claims don't match source files |
| 6 | egm-comprehension | `comprehension_report.md` | Terminology, diagram, completeness failures across all sections |
| 7 | egm-design (Critique) | `design_critique_report.md` | Coupling, validation gaps, performance, testability, extensibility risks |
| 8 | egm-zoom-out (Intermediate) | `intermediate_zoom_out_report.md` | Synthesis: document is aspirational fiction; 5 Blockers, 7 Majors, 5 Nits |

**Stage 9 (Implementation Readiness Test)**: **NOT EXECUTED** — Document lacks "Detailed Implementation Plan" section. Per EGM skill, FeatureRange = entire document, DetailedRange = N/A, making Stage 9 inapplicable.

---

## Consolidated Findings by Severity

### 🔴 BLOCKERS (5) — Document Unusable Until Fixed

| ID | Finding | Evidence |
|----|---------|----------|
| **B1** | **Phantom hooks documented**: `useServices()`, `usePrograms()`, `useInsurance()`, `useTranslations()`, `useSEO()` do not exist. Components import constants directly. | §7 Data Flow diagram, §8.1 usage patterns; actual: `import { SERVICES } from '@/constants'` |
| **B2** | **Auto-generation claimed as implemented**: "knowledge/services.json (auto-generated from constants.ts? Currently manual)" with `?` admitting it's not done, but diagram shows it as operational. | §8.3, §9.3, §10 P1; knowledge/services.json exists with divergent data |
| **B3** | **SEO export mismatch**: Document shows named exports (`generateServiceSEO`, `generatePageSEO`, `generateProgramSEO`, etc.); actual code uses `export default { PAGE_SEO, HOSPITAL_SCHEMA, FAQ_SCHEMA, ... }` | §4.3, seo.ts line 909; implementers get `undefined` imports |
| **B4** | **Translation API mismatch**: Document shows function call `t('services.categories.abhyanga')` with fallback; actual code uses direct property access `t.services.categories.abhyanga` (throws if missing) | §8.1, LanguageContext.tsx line 20; different runtime behavior |
| **B5** | **Knowledge retrieval API mismatch**: Document shows `searchKnowledge(query, topK)`; actual exports are `retrieveKnowledge(query, maxChunks)` and `getKnowledgeContext(query)` | §6.1, knowledge/index.ts lines 131, 169; function names differ |

### 🟡 MAJORS (7) — Significant Architecture Gaps

| ID | Finding | Evidence |
|----|---------|----------|
| **M1** | **No runtime validation layer**: Document claims TypeScript enforces rules (§9.2); reality: zero runtime guards. Invalid data (missing `price`, negative `rating`, duplicate `id`) reaches UI. | §9.2, entire data layer; TypeScript types erase at compile time |
| **M2** | **Translation completeness unenforced**: 3 locales, ~40 keys each — no compile-time check that all keys exist in all locales. Missing keys cause runtime fallbacks/undefined. | §5.3, translations.ts, §9.3; doc claims "must exist in all 3 locales" but no tooling enforces |
| **M3** | **Service data drift**: `constants.ts` SERVICES vs `knowledge/hospital/services.json` — different structures, prices, descriptions. Two sources of truth for same domain. | §3.2, §6, §9.3; price diffs: Abhyanga ₹1600 vs ₹1300, Shirodhara ₹2000 vs ₹1500, Vamana ₹1100 vs ₹5000 |
| **M4** | **Program data drift**: constants.ts has 5 programs with IDs `thyroid`, `diabetes`, `ckd`, `stress`, `weight`; knowledge JSON has different names/structure | §3.3, knowledge/services.json programs array; AI and UI diverge |
| **M5** | **Custom RAG over-engineering**: 197-line retrieval for 6 small JSON files; rebuilds index on every query. No caching, no pre-computation, O(n) scoring per query. | §6.1, knowledge/index.ts; simple Map lookup would be simpler/faster |
| **M6** | **SEO schema validation absent**: 909 lines of hand-written JSON-LD; no schema.org type checking, no CI validation. Invalid structured data ships to production. | §4, seo.ts, §9.3, §10; Google Search Console errors only post-deploy |
| **M7** | **Translation key inflation**: Document claims ~150 keys/locale; actual ~40. Suggests document describes planned state, not actual. | §5.3, translations.ts; 3.75× inflation misrepresents i18n coverage |

### 🟢 NITS (5) — Editorial / Calibration

| ID | Finding |
|----|---------|
| **N1** | Service category count: doc says 9, code has 10 (`women`, `others` added) |
| **N2** | SEO schema count: doc table says 8, code exports 10+ |
| **N3** | "70+ sub-services" — actual count is ~73 (verifiable) |
| **N4** | Filler language: "serves as the single source of truth", "comprehensive", "robust" scattered throughout |
| **N5** | §10 "Future Improvements" reads as backlog, not architecture — should be in separate tracking doc |

---

## Root Cause Analysis

The document was written as an **aspirational specification** (what the architecture *should* be) but presented as a **descriptive architecture document** (what the architecture *is*). This creates a dangerous mismatch:

1. **No single source of truth enforcement**: `constants.ts` is the de facto source, but `knowledge/` manually duplicates it with no sync mechanism
2. **No build-time generation pipeline**: Despite §10 P1 "auto-generate knowledge JSON from constants" being documented as P1, no script exists
3. **No runtime validation culture**: TypeScript interfaces are treated as sufficient; Zod/io-ts never adopted
4. **No i18n infrastructure investment**: Custom translation object built instead of adopting `next-i18next`/`i18next`/`lingui`
5. **Custom RAG built without evaluation**: For 6 small JSON files, established libraries (`flexsearch`, `lunr`) or simple Map would suffice
6. **SEO schemas hand-written without validation**: No `schema-dts`, no CI check against Schema.org

---

## Recommended Remediation Plan

### Phase 1: Correct the Narrative (Address Blockers — 1-2 days)
| Action | Owner | Deliverable |
|--------|-------|-------------|
| Rewrite §7 Data Flow to show actual import patterns | Author | Accurate diagram |
| Rewrite §8.3 to show actual knowledge integration (manual) | Author | Honest documentation |
| Fix §4.3 SEO exports to match `export default { ... }` | Author | Correct signatures |
| Fix §8.1 Translation usage to show `t.services.categories[service.id]` | Author | Correct API |
| Fix §6.1 function names to `retrieveKnowledge` / `getKnowledgeContext` | Author | Correct API |

### Phase 2: Document Actual Gaps Honestly (Address Majors — 3-5 days)
| Action | Owner | Deliverable |
|--------|-------|-------------|
| Add §3.6 "Validation Gaps" — list what TypeScript doesn't catch | Author | Gap inventory |
| Add §6.3 "Drift Inventory" — table mapping constants ↔ knowledge with deltas | Author | Drift register |
| Add §5.4 "i18n Completeness Status" — actual key counts, missing keys | Author | i18n audit |
| Rewrite §6.1 to acknowledge custom RAG is pragmatic for current scale | Author | Honest assessment |

### Phase 3: Prune Speculative Future (Address YAGNI — 1 day)
| Action | Owner | Deliverable |
|--------|-------|-------------|
| Move §10 to separate `ROADMAP.md` | Author | Clean architecture doc |
| Remove "auto-generated" references until script exists | Author | No phantom claims |
| Remove "headless CMS", "IRDAI sync", "price versioning" | Author | YAGNI compliance |

### Phase 4: Structural Fixes (Engineering — 2-4 weeks)
| Priority | Fix | Effort |
|----------|-----|--------|
| P0 | Build script: auto-generate `knowledge/hospital/services.json` from `constants.ts` | 2 days |
| P0 | Add Zod schemas for `Service`, `Program`, `InsurancePartner`; validate at build | 3 days |
| P1 | Add `TranslationNamespace` type + CI check for key parity across EN/HI/GU | 2 days |
| P1 | Memoize `buildKnowledgeChunks()` — build once, reuse | 1 day |
| P1 | Add JSON-LD schema validation in CI (use `schema-dts`) | 2 days |
| P2 | Split `constants.ts` into domain modules (`services.ts`, `programs.ts`, `insurance.ts`, etc.) | 3 days |
| P2 | Evaluate headless CMS for blog + service content | 1 week |

---

## Artifacts Produced

| File | Purpose |
|------|---------|
| `zoom_out_report.md` | Initial architectural assessment (drift detection) |
| `comprehension_report.md` | Terminology, diagram, completeness audit |
| `design_critique_report.md` | Coupling, validation, performance, testability, extensibility audit |
| `intermediate_zoom_out_report.md` | Synthesis of prior three reviews with severity classification |
| `consolidated_review_report_egm24.md` | **This file — unified decision record** |

---

## Approval Gate

**Status: BLOCKED**

The document cannot be approved for implementation use in its current state. It describes a phantom architecture that would mislead any implementer.

**Required for approval:**
1. All 5 Blockers resolved (Phase 1 complete)
2. All 7 Majors acknowledged in document with gap inventory (Phase 2 complete)
3. Speculative future content moved to separate roadmap (Phase 3 complete)
4. Author signs off that document now reflects actual code reality

---

*Generated by EGM Review Orchestrator per Elephant-Goldfish Model*
*Date: 2026-11-13*
*Standards: zoom-out-standard.md, comprehension-standard.md, design-standard.md*