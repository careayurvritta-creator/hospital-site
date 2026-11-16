# EGM-19 I18N Style Review

## Executive Summary

| Criterion | Score /5 |
|-----------|----------|
| Clarity & Structure | **4** |
| Completeness | **3** |
| Accuracy of Diagrams / Tables | **5** |
| Actionability | **4** |
| Formatting | **4** |
| Terminology Consistency | **3** |
| Evidence‑Based Claims | **4** |
| Missing Critical Sections | **3** |
| Overall Usability | **4** |
| **Overall Score** | **3.78** |

The design doc largely reflects the existing implementation but falls short in completeness and terminology consistency. A more granular migration plan and a clearer structure would improve maintainability.

## Findings

| Severity | Observation |
|---|---|
| **Critical** | The spec references a `t(key, params)` interpolation API that does not exist in the codebase. Some components still assume this API. |
| | The docs claim a `tRich` function for rendering HTML, but the implementation only provides a full translation object. |
| | LocalStorage persistence and URL‑based language switching are described, yet the `LanguageProvider` in `LanguageContext.tsx` has no persistence layer. |
| | Blog post localization is listed as a phantom feature; the `blog` package contains only English files. |
| **Major** | The doc refers to `hooks/useLanguage.ts` as a separate hook file, whereas the actual export originates from `components/LanguageContext.tsx`. |
| | The mapping between the `Language` type in `types.ts` and the translation keys in `translations.ts` is correct, but the doc rarely references actual TypeScript interfaces used in the code, making it hard to verify completeness. |
| | The font strategy section incorrectly lists custom fonts; the project relies solely on system defaults and the `Inter` font from Tailwind. |
| **Minor** | The migration plan table references a `useABTestVariants` utility that does not exist in the `hooks` export list. |
| | The `LanguageContext` component is defined inside `components/LanguageContext.tsx`, but the doc only shows the interface implementation, not the rendering of `ReactNode` children in the provider. |
| **Nit** | Minor heading inconsistencies: e.g., `## Language Switcher Component` and then a sub‑heading with no numbering. |
| | The table in the Key Implementation Details section mixes “Previous Doc Claim” and “Actual Implementation” designations, but the formatting could be tightened. |

## Line‑Specific Issues (with Code Evidence)
| Line in Doc | Issue | Code Evidence |
|---|---|---|
| 4 | Claims API functions `t(key, params)` and `tRich`. | In `LanguageContext.tsx`, line 19–23 shows `t` is the full translation object, no function call. |
| 52 | Mentions that `translations.ts` has 207 lines; the actual file has 202 lines. | `translations.ts` content shown lines 1–202. |
| 78 | Mention of direct property access `t.common.book_consultation`. | Code snippet in `LanguageContext` usage at line 66–70. |
| 124 | Mentions `tRich` not existing, but no trace shown of search for it. | The doc correctly states not implemented, but the search missing test or linter feedback not included. |
| 136 | Table shows phantom features; but the `useABTestVariants` function is missing in `hooks/index.ts`. The actual exports at line 7–16 do not include it. |
| 147 | Font strategy claims custom fonts; searching `tailwind.config.js` reveals only default fonts. |

## Prioritized Recommendations
| Priority | Recommendation | Rationale |
| -------- | -------------- | --------- |
| **P0 – Critical** | Add **localStorage** persistence to `LanguageProvider` to remember user preference across sessions. | Immediate usability improvement and aligns with user expectations. |
|  | Implement **URL language parameter** handling (`?lang=`) in the router. | Simplifies shareability and SEO. |
|  | Introduce a **build‑time translation validation** tool to detect missing keys across language files. | Prevents run‑time errors and reduces maintenance burden. |
| **P1 – Important** | Refactor the `t` API to a **function** `t(key: string, params?: Record<string,string>)` for more natural usage and interpolation. | Aligns with common i18n patterns used by translators and designers. |
|  | Create **`tRich`** or an equivalent rich‑text rendering helper if the application needs raw HTML. | Supports dynamic content such as trust badges or hero sections. |
|  | Configure **Noto Sans Devanagari / Gujarati** in `tailwind.config.js` and preload via `index.html` or `_app.tsx`. | Guarantees consistent rendering across devices. |
|  | Add **hreflang tags** in the SEO manifest or hook for multilingual SEO. | Needed for search engine discovery and international users. |
|  | Draft a **blog localisation strategy** and integrate with CMS (e.g., Contentful, MD files per language) or private SSG. | Makes content globally accessible. |
| **P2 – Nice to Have** | Build a **lazy load** mechanism for translations to reduce bundle size on first load. | Improves performance on mobile networks. |
|  | Integrate a **translation management platform** (Crowdin, Lokalise) and automate sync with `translations.ts`. | Enables non‑technical translators to contribute. |
|  | Add **Intl‑based date/number formatting** utilities for localised numeric and date strings. | Enhances user experience for non‑English locales. |

## Suggested Revised Structure
1. **Introduction** – Brief purpose and scope.
2. **Current Implementation** – Outline the actual architecture, files, and APIs (include screenshots or code snippets for clarity).
3. **Key Gaps & Phantom Features** – Separate table listing features that were proposed but not implemented.
4. **Migration Roadmap** – P0, P1, P2 phases with actionable tasks, owners, and estimated effort.
5. **Appendices** – Code samples, test scripts, and example translations.
6. **Change Log & Versioning** – Track updates to this document.

This structure follows a conventional design‑review template, making it easier for maintainers to quickly locate the next actionable item.

## Conclusion
The design document provides a solid foundation, especially in terms of documenting the actual architecture. However, it lacks precision in several areas: the absence of a function‑based interpolation API, no persistence, and missing SEO/font support. Addressing the critical recommendations will bring the system into alignment with best‑practice i18n patterns and significantly improve user experience across Indian markets.

---
*Prepared by the EGM Style Reviewer on 2026‑11‑13*