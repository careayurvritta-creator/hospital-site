# EGM-19 i18n Implementation Readiness Review

**Document:** `design-docs/egm-19-i18n.md`  
**Review Date:** 2026-11-13  
**Reviewer:** AI Agent (OpenCode)  
**Status:** ✅ Ready for Implementation (with documented gaps)

---

## Executive Summary

The EGM-19 i18n design document (`egm-19-i18n.md`) has been reviewed against the actual codebase in `hospital-site/`. **The design document accurately reflects the current implementation** — it was previously updated to match reality after an earlier version described phantom features (localStorage persistence, URL language params, `tRich` function, interpolation support, hreflang tags) that do not exist.

The codebase uses a **custom lightweight i18n solution** built on React Context (`LanguageContext.tsx`) with a static translation object (`translations.ts`). No external i18n library (react-i18next, i18next, etc.) is installed. The implementation is functional for the current three languages (English, Hindi, Marathi) but has **documented gaps** in persistence, SEO, font strategy, testing completeness, and mobile UX that should be addressed before or during production rollout.

**Overall Verdict:** **CONDITIONAL GO** — Implementation can proceed, but the gaps identified below should be tracked as follow-up work items (P1/P2 priority).

---

## 10-Point Review Framework Assessment

| # | Criterion | Score | Status | Notes |
|---|-----------|-------|--------|-------|
| 1 | Requirements Clarity | 8/10 | ✅ Pass | Clear scope: 3 languages, context-based switching, desktop + mobile UI. Missing: persistence requirement, SEO requirements, interpolation needs. |
| 2 | Architecture Alignment | 9/10 | ✅ Pass | React Context + custom hook pattern aligns with codebase conventions. No external deps needed. |
| 3 | Component Spec Completeness | 7/10 | ⚠️ Partial | LanguageContext, Layout switcher documented. MobileHeader switcher missing (not implemented). SEOHead integration absent. |
| 4 | Data Flow Definition | 8/10 | ✅ Pass | `translations.ts` → `LanguageContext` → `useLanguage` hook → components. Unidirectional, clear. |
| 5 | Integration Points | 6/10 | ⚠️ Partial | Layout.tsx integrated. MobileHeader.tsx NOT integrated. SEOHead.tsx NOT integrated. AI chat uses system prompt (documented). Blog/tooling content strategy documented but separate. |
| 6 | Dependencies Identified | 9/10 | ✅ Pass | Zero external deps. Only React Context. `package.json` verified clean. |
| 7 | Edge Cases Covered | 5/10 | ❌ Fail | No localStorage persistence (language resets on refresh). No URL params (no shareable links). No interpolation. No RTL support. No fallback for missing keys. Font strategy for Indic scripts undefined. |
| 8 | Testing Strategy | 5/10 | ❌ Fail | Only basic key-presence tests (`tests/translations.test.ts`). No completeness validation, no integration tests, no visual regression, no RTL tests. |
| 9 | Performance Budget | 8/10 | ✅ Pass | Tiny bundle impact (~2KB gzipped). All translations loaded upfront (acceptable for 3 langs × ~200 keys). No code-splitting needed yet. |
| 10 | Migration/Compatibility | 7/10 | ⚠️ Partial | 9-phase migration plan exists (P0/P1/P2). No breaking changes from current state. Backward compatible. |

**Average Score: 7.2/10** — **Conditional Pass**

---

## Detailed Findings

### ✅ Strengths (What Works)

| Area | Evidence |
|------|----------|
| **Minimal, dependency-free architecture** | `package.json` shows no i18n library. `LanguageContext.tsx` is ~60 lines. |
| **Accurate design doc** | Doc was corrected to match reality — no phantom features. |
| **Three languages supported** | `translations.ts`: 207 lines, `en`/`hi`/`mr` with ~68 keys each. |
| **Desktop language switcher implemented** | `Layout.tsx` has dropdown (desktop) + button (mobile view). |
| **Type-safe language type** | `types.ts` exports `type Language = 'en' | 'hi' | 'mr'` |
| **AI chat localization strategy documented** | System prompt approach (not context translation) — correct for LLM. |
| **Performance acceptable** | All translations ~15KB raw, ~2KB gzipped. No lazy loading needed yet. |

### ⚠️ Gaps Requiring Attention (P1 — Before/During Rollout)

| Gap | Location | Impact | Recommended Fix |
|-----|----------|--------|-----------------|
| **No language persistence** | `LanguageContext.tsx` | User loses language choice on refresh/navigation | Add `localStorage` sync in `LanguageProvider` (5-10 lines) |
| **No URL language parameter** | Routing / `LanguageContext` | Cannot share language-specific links; SEO hurt | Add `?lang=` param support + `hreflang` in `SEOHead.tsx` |
| **MobileHeader lacks language switcher** | `MobileHeader.tsx` | Mobile users (majority) cannot switch language | Add switcher button to `MobileHeader` (mirror Layout mobile button) |
| **No `hreflang` tags** | `SEOHead.tsx` | Search engines won't index multilingual variants | Add `<link rel="alternate" hreflang="x" href="..." />` for each language |
| **No interpolation support** | `translations.ts` / `useLanguage` | Cannot inject dynamic values (dates, names, counts) | Add simple `t(key, params)` function with `{{placeholder}}` replacement |
| **Missing fallback for missing keys** | `useLanguage` hook | Missing key → `undefined` rendered in UI | Return key itself or English fallback: `translations[key] ?? translations.en[key] ?? key` |
| **Font strategy for Indic scripts undefined** | `globals.css` / `tailwind.config` | Hindi/Marathi may render with poor fallback fonts | Define `font-family` stack with Noto Sans Devanagari / Noto Sans Marathi |

### 📋 Gaps for Future Iteration (P2 — Post-Launch)

| Gap | Location | Impact | Recommended Fix |
|-----|----------|--------|-----------------|
| **No RTL support** | N/A | Not needed for current languages (all LTR) | Document as N/A; revisit if adding Arabic/Urdu |
| **Translation completeness validation** | `tests/translations.test.ts` | Keys may drift out of sync across languages | Add test: every `en` key exists in `hi` and `mr` |
| **Visual regression tests for language switching** | N/A | Layout breaks with longer Devanagari text | Add Playwright tests for each language |
| **Blog/posts multilingual strategy** | `content/` (if exists) | Blog currently English-only | Define content model: separate files per language or frontmatter `lang` |
| **Tool content localization** | Tool components | Tools use separate localized data structures | Consolidate into `translations.ts` or document separate strategy |
| **Accessibility: `lang` attribute on `<html>`** | `Layout.tsx` / root layout | Screen readers need correct language | Set `<html lang={language}>` dynamically |

---

## Gap Analysis by Category

### Persistence & Shareability (Critical for UX)
- **Current:** Language resets to `en` on every page load
- **Required:** `localStorage` + URL param (`?lang=hi`)
- **Effort:** ~30 min (Context + router integration)

### SEO & Discoverability (Critical for Hospital Site)
- **Current:** No `hreflang`, no `lang` attribute, no URL language signals
- **Required:** `hreflang` tags, `<html lang>`, canonical URLs per language
- **Effort:** ~45 min (`SEOHead.tsx` + Layout)

### Mobile Experience (High Impact)
- **Current:** Language switcher only in `Layout.tsx` (desktop dropdown + mobile hamburger menu button)
- **Issue:** `MobileHeader.tsx` (used on mobile) has NO switcher
- **Required:** Add switcher to `MobileHeader` component
- **Effort:** ~15 min

### Developer Experience & Safety
- **Current:** No fallback for missing keys, no interpolation, basic tests only
- **Required:** Key fallback, `t(key, params)` helper, completeness tests
- **Effort:** ~60 min

### Font Rendering (Quality)
- **Current:** System fonts only — Devanagari may render poorly on Windows/Android
- **Required:** `@font-face` for Noto Sans Devanagari + Marathi, or CDN link
- **Effort:** ~20 min

---

## Test Coverage Assessment

**Current Test File:** `tests/translations.test.ts`

| Test Type | Status | Notes |
|-----------|--------|-------|
| Key presence (all languages have same keys) | ⚠️ Partial | Only checks `en` keys exist; doesn't verify `hi`/`mr` completeness |
| Translation completeness (no empty strings) | ❌ Missing | |
| Interpolation function tests | ❌ Missing | Function doesn't exist yet |
| Fallback behavior tests | ❌ Missing | |
| Integration: LanguageContext provider | ❌ Missing | |
| Visual: Layout switcher renders | ❌ Missing | |
| Visual: MobileHeader switcher | ❌ Missing | Component doesn't have switcher |
| SEO: hreflang tags present | ❌ Missing | |
| Accessibility: `lang` attribute | ❌ Missing | |

**Recommendation:** Expand test suite before P0 merge. Minimum: completeness + fallback + Context integration tests.

---

## Migration Plan Review (from Design Doc)

The design doc proposes a 9-phase migration across P0/P1/P2:

| Phase | Priority | Description | Readiness |
|-------|----------|-------------|-----------|
| 1 | P0 | Add `localStorage` persistence | ✅ Ready — trivial change |
| 2 | P0 | Add URL `?lang=` param + sync with Context | ⚠️ Needs router access in Context |
| 3 | P0 | Add `hreflang` tags in `SEOHead` | ✅ Ready — `SEOHead` exists |
| 4 | P0 | Add `<html lang>` attribute | ✅ Ready — Layout.tsx controls root |
| 5 | P1 | Add interpolation helper `t(key, params)` | ✅ Ready — pure function |
| 6 | P1 | Add missing-key fallback | ✅ Ready — one-line change |
| 7 | P1 | Add MobileHeader language switcher | ✅ Ready — component exists |
| 8 | P2 | Font stack for Indic scripts | ✅ Ready — CSS change |
| 9 | P2 | Translation completeness test suite | ⚠️ Needs test infrastructure |

**Assessment:** All phases are technically feasible. Phases 1-4, 6-7 are low-effort high-impact. Phase 2 requires router integration (check if `useSearchParams` available). Phase 9 depends on test framework maturity.

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Language resets on refresh frustrates users | High | High | Implement Phase 1 (localStorage) immediately |
| Mobile users cannot switch language | High | High | Implement Phase 7 (MobileHeader switcher) before launch |
| Search engines index only English | Medium | High | Implement Phase 3 (hreflang) before launch |
| Devanagari text overflows/breaks layout | Medium | Medium | Test with real Hindi/Marathi content; add `word-break: keep-all` |
| Translation keys drift out of sync | Medium | Medium | Add completeness test (Phase 9) in CI |
| AI chat responses not localized | Low | Medium | Documented: uses system prompt — verify prompt includes language instruction |

---

## Recommendations

### Immediate (Do Before Merge / Launch)
1. **Add `localStorage` persistence** to `LanguageContext.tsx` — 10 lines, 5 min
2. **Add language switcher to `MobileHeader.tsx`** — copy pattern from `Layout.tsx` mobile button
3. **Add `hreflang` tags** to `SEOHead.tsx` — iterate over supported languages
4. **Add `<html lang={language}>`** in `Layout.tsx` root element
5. **Add missing-key fallback** in `useLanguage` hook — return key or English fallback

### Short-Term (Within 1 Sprint)
6. **Add URL `?lang=` parameter support** — sync with router, update Context on mount
7. **Add interpolation helper** `t(key, params)` with `{{var}}` replacement
8. **Define font stack** for Devanagari/Marathi in `globals.css` / Tailwind config
9. **Expand translation tests** — completeness validation + fallback behavior

### Medium-Term (Post-Launch)
10. **Visual regression tests** for each language (Playwright)
11. **Blog/content multilingual strategy** — decide on file structure
12. **Consolidate tool localization** into main translation system or document separate approach
13. **Accessibility audit** — screen reader testing with Hindi/Marathi

---

## File-Level Verification Checklist

| File | Exists | Matches Design Doc | Issues |
|------|--------|-------------------|--------|
| `components/LanguageContext.tsx` | ✅ | ✅ | No persistence, no URL sync, no fallback |
| `translations.ts` | ✅ | ✅ | 3 languages, ~68 keys each, no interpolation syntax |
| `hooks/index.ts` | ✅ | ✅ | Exports `useLanguage` from LanguageContext (not separate file) |
| `package.json` | ✅ | ✅ | No i18n deps — correct |
| `components/Layout.tsx` | ✅ | ✅ | Desktop dropdown + mobile button; missing `<html lang>` |
| `components/MobileHeader.tsx` | ✅ | ❌ | **No language switcher** — gap |
| `components/SEOHead.tsx` | ✅ | ❌ | **No hreflang tags** — gap |
| `types.ts` | ✅ | ✅ | `type Language = 'en' \| 'hi' \| 'mr'` |
| `tests/translations.test.ts` | ✅ | ⚠️ | Basic presence only — incomplete |
| `design-docs/egm-19-i18n.md` | ✅ | ✅ | Accurately describes current state (corrected) |

---

## Verdict

### 🟢 CONDITIONAL GO — Implementation Ready with Tracked Follow-ups

**The design document is accurate and the implementation foundation is solid.** The custom Context-based approach is appropriate for the current scope (3 languages, ~200 keys, no complex formatting needs).

**Blockers for Production Launch:** None — the current implementation works for desktop users who don't refresh.

**Required Before Launch (P0):**
- [ ] Language persistence (`localStorage`)
- [ ] MobileHeader language switcher
- [ ] `hreflang` SEO tags
- [ ] `<html lang>` attribute
- [ ] Missing-key fallback

**Recommended Before Launch (P1):**
- [ ] URL `?lang=` parameter
- [ ] Interpolation helper
- [ ] Indic font stack
- [ ] Expanded test coverage

**Total estimated effort for P0+P1: ~3-4 hours**

---

## Sign-Off

| Role | Name | Status | Date |
|------|------|--------|------|
| Reviewer | AI Agent (OpenCode) | ✅ Complete | 2026-11-13 |
| Tech Lead | — | ⏳ Pending | — |
| Product Owner | — | ⏳ Pending | — |

---

*This review was generated by automated codebase analysis against the EGM-19 i18n design document. All file references are relative to `hospital-site/`.*