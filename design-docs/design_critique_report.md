# Design Critique Report: Constants & Data Layer Architecture (`egm-24-constants-data-layer.md`)

**Target Document:** `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site\design-docs\egm-24-constants-data-layer.md`  
**Review Standard:** `design-standard.md` (via `agents/design_critic.md`)  
**Reviewer:** Design Critic Goldfish  

---

## Executive Summary

The proposed Constants and Data Layer architecture provides a comprehensive single source of truth for static content, clinical services, insurance partners, structured SEO metadata, translations, and RAG knowledge chunks for the Ayurvritta Ayurveda Hospital site. While the domain modeling of classical Ayurveda concepts (`tridosha`, `prakriti`, `dhatu`, `panchakarma`, `pathya`) and hospital metadata is exceptionally thorough and clinically robust, the architecture exhibits significant architectural coupling, redundancy, type safety gaps, and operational maintenance risks. 

Below is the detailed evaluation across the six required audit vectors.

---

## Detailed Findings

### 1. Design Quality (Separation of Concerns, Abstraction Levels, Coupling)

* **[Blocker] 1.1 Duplication and Drift Risk Between `constants.ts` and `knowledge/*.json`**
  * **Affected Scope:** `constants.ts` vs. `knowledge/hospital/services.json` and `knowledge/index.ts`
  * **Finding & Recommendation:** Services, pricing, and program details are manually duplicated across `constants.ts` and JSON knowledge files under `knowledge/hospital/services.json`. As noted in Section 9.3 of the design doc, this introduces severe maintenance drift. When service prices or descriptions change in `constants.ts`, the AI RAG knowledge base will provide outdated pricing or details. 
  * *Recommendation:* Eliminate duplication by automatically generating or deriving `knowledge/hospital/services.json` from `constants.ts` at build time (e.g., via a pre-build script), or make `constants.ts` the single runtime import source for both UI components and the RAG index builder.

* **[Major] 1.2 Monolithic Static Files (`translations.ts`, `seo.ts`, `constants.ts`)**
  * **Affected Scope:** `translations.ts` (~1200+ lines), `seo.ts` (909 lines), `constants.ts` (738 lines)
  * **Finding & Recommendation:** Storing all translations, page-specific SEO schemas, and 51+ insurance partners in massive monolithic files violates single responsibility and modular architecture principles. This increases merge conflicts and bloats initial cognitive load for developers.
  * *Recommendation:* Split `translations.ts` into namespaced JSON files per locale (e.g., `locales/en/common.json`, `locales/en/services.json`) loaded dynamically or bundled via an i18n loader. Modularize `seo.ts` into discrete schema builders per route.

---

### 2. Error Handling (Validation, Error Boundaries, Failure Modes)

* **[Blocker] 2.1 Lack of Runtime Type Safety and Zod Validation**
  * **Affected Scope:** `constants.ts`, `types.ts`, and JSON knowledge parsing (`knowledge/index.ts`)
  * **Finding & Recommendation:** TypeScript interfaces provide compile-time guarantees only. Because clinical data (pricing, insurance partners, sub-services) and raw JSON files are parsed directly at runtime, missing required fields (e.g., `price` as a number, mandatory `description`) or malformed JSON schema results in runtime crashes or undefined rendering errors in production.
  * *Recommendation:* Implement runtime schema validation using **Zod** for all constants, translation files, and JSON knowledge entries during build/startup. Fail fast in CI/CD if schema validation fails.

* **[Major] 2.2 Fragile Keyword-Based RAG Retrieval Fallback**
  * **Affected Scope:** `knowledge/index.ts` (`retrieveKnowledge`, `getKnowledgeContext`)
  * **Finding & Recommendation:** The search mechanism relies entirely on naive substring matching and keyword frequency scoring (`score += 1`, `score += 3`). If a user queries colloquial terms or medical synonyms not explicitly listed in `keywords` arrays (e.g., searching "sugar" instead of "Prameha" or "blood sugar"), retrieval returns zero chunks, causing the AI chatbot to hallucinate or provide uncontextualized responses.
  * *Recommendation:* Expand keyword synonym maps, implement fuzzy matching (e.g., Levenshtein distance or embedding-based vector search if scaling up), and provide a robust fallback message when no knowledge chunks match.

---

### 3. Performance (Tree-Shaking, Bundle Size, Caching, Query Efficiency)

* **[Major] 3.1 Unoptimized Bundle Size From Giant Static Constants & Schemas**
  * **Affected Scope:** Client-side bundle (`constants.ts`, `seo.ts`, `translations.ts`)
  * **Finding & Recommendation:** Importing `constants.ts` (containing 70+ sub-services with images, descriptions, and 51 insurance partners with logos) or massive pre-computed SEO schema objects (`SKIN_CARE_FAQ_SCHEMA` with 20+ detailed QA pairs) directly into client components risks bloating the JavaScript bundle shipped to mobile users.
  * *Recommendation:* Ensure aggressive tree-shaking by splitting static data so that heavy sub-service arrays and schema definitions are only imported on their respective detail pages or server-side rendering (SSR) / static generation (SSG) boundaries rather than bundled into global client entry points.

---

### 4. Security (XSS, Injection, Data Exposure)

* **[Nit] 4.1 External Favicon/Logo URL Dependencies in Insurance Partners**
  * **Affected Scope:** `constants.ts` (Insurance Partners logos using external domains like `https://www.google.com/s2/favicons?domain=...`)
  * **Finding & Recommendation:** Relying on external third-party favicon fetchers (`google.com/s2/favicons`) and unverified external image URLs for insurance partner logos introduces availability risks (external network failures, tracking headers, layout shifts if domains block hotlinking).
  * *Recommendation:* Host all partner logos locally under `/images/partners/` to ensure offline reliability, content security policy (CSP) compliance, and consistent branding.

---

### 5. Testability (Mockability, Determinism, Test Coverage Strategy)

* **[Major] 5.1 Zero Automated Testing Strategy Documented for Data Layer**
  * **Affected Scope:** `design-docs/egm-24-constants-data-layer.md` & test suite
  * **Finding & Recommendation:** The design document details maintenance procedures and TypeScript type rules but lacks any specification for unit testing data integrity (e.g., verifying that all service IDs have corresponding translation keys in EN, HI, and GU, or ensuring JSON-LD schema validity).
  * *Recommendation:* Add automated test suites in CI that validate:
    1. Every service and sub-service has a non-zero integer price and mandatory description.
    2. Translation parity across English, Hindi, and Gujarati keys.
    3. JSON-LD schema correctness against Schema.org specifications.

---

### 6. Extensibility (CMS Migration Path, i18n Scaling, New Data Domains)

* **[Major] 6.1 Absence of a Headless CMS Migration Path for Non-Technical Updates**
  * **Affected Scope:** Maintenance & Governance (Section 9.1 / 9.3)
  * **Finding & Recommendation:** As noted in Section 9.3 ("No CMS — all code edits — non-technical updates impossible"), requiring a code commit and deployment for minor quarterly price updates or adding insurance partners is operationally unsustainable for hospital administrative staff.
  * *Recommendation:* Outline a concrete migration path from static TypeScript constants to a lightweight headless CMS (e.g., Strapi, Directus, or Supabase tables) or a decoupled JSON API while retaining type-safe code generation wrappers.