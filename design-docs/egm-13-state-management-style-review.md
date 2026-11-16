# EGM-13 Style Review: State Management Architecture

> **Document reviewed**: `design-docs/egm-13-state-management.md` (135 lines)
> **Review date**: 2026-11-13
> **Reviewer**: EGM Style Reviewer (subagent)
> **Working directory**: `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site`

---

## Executive Summary

The design document articulates a clear philosophical stance — no external state library, lean on React hooks and Context — and the structure is readable. However, **a large portion of its claims are contradicted by the actual codebase**. Key interface signatures are wrong, optimization patterns described as in-use are absent, persistence mechanisms described don't exist in code, and the testing strategy described has zero coverage of the described patterns.

The document reads like a spec written *before* implementation rather than documentation reflecting *what was built*. This makes it unreliable as an implementation reference and misleading for new developers.

### Scores Table

| # | Criterion | Score (1–5) | Rationale |
|---|-----------|:-----------:|-----------|
| 1 | **Clarity & Structure** | 4 | Logical sectioning; headings are clear; terminology is mostly consistent |
| 2 | **Completeness** | 2 | Omits AnalyticsProvider scope, MobileConsent, 3rd context, and many actual state shapes |
| 3 | **Accuracy of Diagrams/Tables** | 1 | Interface signatures, tool counts, page counts, and component trees all mismatch code |
| 4 | **Actionability** | 2 | A developer following this doc would build interfaces that don't match reality |
| 5 | **Formatting** | 4 | Clean markdown, proper code blocks, reasonable table formatting |
| 6 | **Terminology Consistency** | 3 | "recoil" vs "Recoil", `session_id` vs `sessionId`, inconsistent naming between sections |
| 7 | **Evidence-Based Claims** | 1 | ~12 claims directly contradicted by codebase verification |
| 8 | **Missing Critical Sections** | 2 | No error handling for localStorage, no migration strategy, no consent context details |
| 9 | **Overall Usability** | 2 | Would mislead a new developer; needs substantial revision before use |

**Weighted average: 2.4 / 5.0**

---

## Findings

### Critical (5)

| # | Finding | Location | Evidence |
|---|---------|----------|----------|
| C1 | **Translation API signature is wrong** | Line 32 | Design: `t: (key: string) => string`. Code (`LanguageContext.tsx:11`): `t: TranslationType` — an **object** accessed via `t.key` dot notation, not a function call |
| C2 | **Language persistence via localStorage does not exist** | Line 41 | Design claims `localStorage` key `ayur-language`. Code (`LanguageContext.tsx:17`): `useState<Language>('en')` — no `localStorage` read/write anywhere in the file. No `ayur-language` key found in entire codebase |
| C3 | **AnalyticsContext interface is grossly underspecified** | Lines 46–51 | Design lists 3 members (`track`, `consent`, `session_id`). Actual `AnalyticsContextType` (`AnalyticsProvider.tsx:21–50`) has **18 members**: `hasConsented`, `consent`, `updateConsent`, `sessionId`, `visitorId`, `sessionData`, `segments`, `leadScore`, `leadStatus`, `trackEvent`, `trackFormEvent`, `trackToolEvent`, `trackChatBotMessage`, `trackWhatsAppClick`, `trackShare`, `setDoshaPreference`, `getDoshaPreference`, `getTopInterests`, `getRecommendedCTA` |
| C4 | **Context provider tree doesn't match** | Lines 124–129 | Design shows `LanguageProvider`, `AnalyticsProvider`, and `CookieConsentProvider` as three separate providers. Actual `index.tsx` only mounts `LanguageProvider`. `AnalyticsProvider` is **not** mounted at app root. No `CookieConsentProvider` exists — `CookieConsent` is a plain component with no Context API |
| C5 | **State persistence pattern for tools is not implemented** | Lines 73–82 | Design shows `tool-${toolId}-answers` localStorage pattern. Grep confirms **zero instances** of this key pattern anywhere in the codebase. Tool results are not persisted |

### Major (6)

| # | Finding | Location | Evidence |
|---|---------|----------|----------|
| M1 | **Tool count is wrong** | Line 10 | Design says "5 tools". `Tools.tsx:116-159` defines **6 tools**: Lifestyle, Panchakarma, Meda, Saara, Prakriti, Diet |
| M2 | **Page count is wrong** | Line 10 | Design says "14 pages". `pages/` directory contains **12 .tsx files** (About, Blog, Booking, Home, Insurance, PrivacyPolicy, Programs, ServiceDetail, Services, SkinCare, Terms, Tools) |
| M3 | **React.memo claims are false** | Line 117 | Design: "`React.memo` on: Tool components, Service cards, Blog post cards". Grep across entire codebase finds **zero** `React.memo` usage |
| M4 | **useMemo claims are exaggerated** | Line 119 | Design: "`useMemo` for: expensive calculations (tool scoring, recipe matching)". Actual `useMemo` only in `Blog.tsx` (filteredPosts, relatedPosts, authors), `DietChartTool.tsx` (filteredConditions), and `DietChartRenderer.tsx` (sections). No "tool scoring" or "recipe matching" exists |
| M5 | **useCallback claims are misleading** | Line 118 | Design: "`useCallback` for: event handlers passed to child components". `useCallback` exists only in hooks (`useABTest`, `useIntersectionObserver`, `usePersonalization`, etc.) and `reactbits` UI components — not in page-level child-component event handlers. `Booking.tsx` uses plain inline `handleChange` |
| M6 | **Testing strategy claims don't match reality** | Lines 131–134 | Design promises hook isolation tests, localStorage mocks, context provider tests, and component state transition tests. Actual test suite has **4 files**: `translations.test.ts`, `useIntersectionObserver.test.tsx`, `autopost.test.ts`, `errorTracker.test.ts`. **None** test LanguageContext, AnalyticsProvider, CookieConsent, consent persistence, form state transitions, or tool state |

### Minor (5)

| # | Finding | Location | Evidence |
|---|---------|----------|----------|
| Mi1 | **consentManager path is wrong** | Context file list | Review prompt references `components/consentManager.ts` but actual path is `analytics/consentManager.ts` |
| Mi2 | **`session_id` vs `sessionId` naming** | Line 50 vs code | Design uses snake_case `session_id`; code uses camelCase `sessionId` throughout |
| Mi3 | **`recoil` not capitalized** | Line 106 | "recoil" should be "Recoil" (proper library name) |
| Mi4 | **Controlled form pattern differs** | Lines 87–96 | Design shows `updateField(field, value)` pattern. Actual `Booking.tsx:36-38` uses `handleChange(e)` with `e.target.name` — more conventional but not what the doc describes |
| Mi5 | **No mention of `MobileConsent`** | Throughout | `MobileConsent.tsx` exists as a separate consent component but is never mentioned in the design document |

### Nits (3)

| # | Finding | Location | Evidence |
|---|---------|----------|----------|
| N1 | **Code block for `Lifting State Up` diagram** | Lines 61–69 | ASCII tree shows only 3 children but code has 6 tools; diagram is outdated |
| N2 | **State Classification table missing "Analytics Session"** | Lines 17–23 | Analytics session data (`SessionData`, visitor tracking) is a significant state type with its own persistence (localStorage keys in `analytics/`) but isn't classified |
| N3 | **No line numbers or anchors** | Throughout | Document lacks line references for easy navigation; would benefit from `#` anchors on sections |

---

## Detailed Issue Analysis

### C1: Translation API Signature Mismatch

**Design (line 32):**
```tsx
t: (key: string) => string; // translation lookup
```

**Code (`LanguageContext.tsx:8-11`):**
```tsx
type TranslationType = typeof TRANSLATIONS['en'];
// ...
t: TranslationType; // t is now the full object
```

The actual `t` is a **namespace object** (`t.nav.home`, `t.hero.title`, etc.), not a function. Every consumer uses dot notation. This is the single most impactful discrepancy because it affects **every component** that uses translations. A developer reading this doc would write `t('nav.home')` which would fail at runtime.

**Recommendation**: Replace the function signature with the object-based access pattern. Show a usage example: `const { t } = useLanguage(); <h1>{t.hero.title}</h1>`.

---

### C2: Language Persistence Missing

**Design (line 41):** "Persistence: localStorage key `ayur-language`"

**Code (`LanguageContext.tsx:17`):**
```tsx
const [language, setLanguage] = useState<Language>('en');
```

No `localStorage.getItem('ayur-language')` on mount, no `localStorage.setItem('ayur-language', ...)` on change. Language selection is **not persisted** — it resets to `'en'` on every page reload. This is a functional gap that the doc incorrectly claims is implemented.

**Recommendation**: Either implement the persistence or remove the claim. If implementing:
```tsx
const [language, setLanguage] = useState<Language>(() => {
  return (localStorage.getItem('ayur-language') as Language) || 'en';
});
useEffect(() => {
  localStorage.setItem('ayur-language', language);
}, [language]);
```

---

### C3: AnalyticsContext Oversimplification

**Design (lines 46–51):**
```tsx
interface AnalyticsContextValue {
  track: (event: AnalyticsEvent) => void;
  consent: ConsentState;
  session_id: string;
}
```

**Actual (`AnalyticsProvider.tsx:21-50`)** has 18 members covering consent management, session tracking, user segmentation, lead scoring, and 6 distinct tracking methods (`trackEvent`, `trackFormEvent`, `trackToolEvent`, `trackChatBotMessage`, `trackWhatsAppClick`, `trackShare`) plus personalization helpers (`setDoshaPreference`, `getTopInterests`, `getRecommendedCTA`).

The design document presents this as a simple "track + consent" context when it's actually the **largest and most complex state surface** in the application.

**Recommendation**: Document the full interface or at minimum categorize: "The AnalyticsContext exposes 4 categories of state: consent (3 fields), session (3 fields), segmentation (4 fields), and tracking (6 methods + 4 personalization helpers)."

---

### C4: Provider Tree Mismatch

**Design (lines 124–129):**
```
App.tsx
├─ LanguageProvider
├─ AnalyticsProvider
└─ CookieConsentProvider
```

**Actual (`index.tsx:14-19`):**
```tsx
<LanguageProvider>
  <App />
</LanguageProvider>
```

`AnalyticsProvider` is not mounted in `index.tsx`. It's available as an importable component (`AnalyticsProvider.tsx`) but the provider wrapping is not done at the app root. `CookieConsentProvider` doesn't exist — `CookieConsent` is a standalone component rendered via props/children composition, not a Context provider.

**Recommendation**: Document the actual provider tree. If `AnalyticsProvider` should wrap the app, this is a missing integration. If `CookieConsent` should be a context, document the intended upgrade path.

---

### C5: Tool State Persistence Not Implemented

**Design (lines 73–82):** Shows a localStorage pattern `tool-${toolId}-answers` for saving tool state.

**Evidence:** Grep for `tool-.*-answers` and `tool-.*answers` across the entire codebase returns zero matches. Tool components maintain local state via `useState` with no persistence. A user who navigates away from a tool loses all their answers.

**Recommendation**: Either implement the pattern or remove the section. This is a user-facing feature gap.

---

### M1 & M2: Incorrect Counts

The "14 pages, 5 tools" claim appears in the rationale for choosing no global state library. The actual counts (12 pages, 6 tools) don't change the architectural decision, but the inaccuracy undermines confidence in the rest of the document. If a new developer sees "5 tools" and finds 6, they'll question what else might be wrong.

---

### M3, M4, M5: Optimization Claims vs Reality

The "Performance Considerations" section (lines 114–129) describes React.memo, useCallback, and useMemo as patterns **in use** — but:

- `React.memo`: **0 instances** in codebase
- `useCallback`: only in hooks/reactbits, not in page components as described
- `useMemo`: only 4 instances, all in different contexts than described

This section reads as aspirational rather than descriptive. For a design document meant to document existing architecture, this is misleading.

**Recommendation**: Retitle this section "Performance Goals" or "Optimization Opportunities" and frame the patterns as targets, not current state. Or implement the patterns and update the doc.

---

### M6: Testing Strategy Gap

The document describes a comprehensive testing strategy:
- "Render hooks in isolation for custom hooks"
- "Mock localStorage for persistence tests"
- "Test context providers with `@testing-library/react`"
- "Component tests verify state transitions"

The 4 existing test files cover translations, intersection observer hooks, autopost, and error tracking. **None** of the described test categories exist for the state management surface (LanguageContext, AnalyticsProvider, CookieConsent, form state, tool state).

**Recommendation**: Either (a) remove the testing strategy section and add it to a TODO/future work document, or (b) implement the tests and then document them.

---

## Missing Critical Sections

1. **Error handling for localStorage failures** — `consentManager.ts` has try/catch around localStorage, but the design document doesn't describe what happens when localStorage is unavailable (private browsing, quota exceeded). No fallback strategy documented.

2. **AnalyticsProvider initialization lifecycle** — The provider has a complex initialization sequence (async init, consent subscription, custom event listeners, cleanup). The design doesn't document this lifecycle at all.

3. **Mobile consent surface** — `MobileConsent.tsx` provides a separate consent UI for mobile but is never mentioned. The document describes consent as a single surface.

4. **State migration strategy** — `consentManager.ts` has version checking (`consent.version !== CONSENT_VERSION` triggers re-consent). This migration pattern is not documented.

5. **Custom event system** — `AnalyticsProvider` uses `window.addEventListener('leadScoreUpdated', ...)` and `window.addEventListener('segmentAdded', ...)`. This cross-boundary communication pattern is undocumented.

6. **CookieConsent no-React.memo rationale** — The document claims React.memo is used on key components but CookieConsent (a heavy component with multiple state values) is not memoized. No explanation for this omission.

---

## Actionable Recommendations by Priority

### P0 — Fix Before Any Developer Uses This Doc

1. **Correct the `LanguageContextType` interface** — Change `t: (key: string) => string` to `t: TranslationType` with explanation of object-based access
2. **Remove or qualify localStorage claim** for language — Either implement `ayur-language` persistence or mark as "not implemented"
3. **Expand AnalyticsContext interface** — List all 18 members or provide a categorized summary
4. **Correct the provider tree diagram** — Show actual `index.tsx` structure; note missing `AnalyticsProvider` wrapping

### P1 — Important for Accuracy

5. **Update counts**: 12 pages, 6 tools (lines 10, 69)
6. **Rewrite Performance Considerations** as aspirational ("Planned" vs "In use") or implement the claimed patterns
7. **Remove or update Testing Strategy** — Current tests don't cover the described patterns
8. **Add MobileConsent section** — Document the mobile consent surface and its relationship to the desktop CookieConsent

### P2 — Quality Improvements

9. **Add error handling section** — Describe localStorage fallback, analytics failure modes
10. **Document custom event system** — `leadScoreUpdated` and `segmentAdded` cross-component communication
11. **Document consent version migration** — The version-checking pattern in `consentManager.ts`
12. **Fix naming**: `session_id` → `sessionId`, `recoil` → `Recoil`
13. **Update controlled form example** to match actual `handleChange` pattern used in Booking.tsx

---

## Suggested Revised Structure

```
# EGM-13: State Management Architecture

## Overview
- Brief description (keep current, good)
- Actual app scale: 12 pages, 6 tools, 13 routes

## Architectural Decision
- No global state library rationale (keep, with corrected counts)
- Bundle size impact (keep, verify numbers)

## State Classification (updated table)
- Transient, Session, Persistent, Global Context, Analytics Session (new row)

## Context API Usage

### LanguageContext
- Full interface: `{ language, setLanguage, t }` where `t` is object-based
- Note: No localStorage persistence (planned)
- Usage pattern: `t.nav.home` (not `t('nav.home')`)

### AnalyticsContext
- Categorized interface (consent, session, segmentation, tracking, personalization)
- Provider lifecycle (async init, consent subscription, custom events)
- Note: Not mounted at app root (integration pending)

## CookieConsent Component
- Desktop + Mobile surfaces
- Three consent categories (essential, analytics, personalization, marketing)
- Integration with consentManager singleton

## consentManager (analytics/consentManager.ts)
- Singleton pattern
- localStorage persistence (`ayurvritta_consent` key)
- Version-based migration strategy
- GA4 consent integration
- GDPR data export

## Component State Patterns
- Lifting State Up (corrected tree with 6 tools)
- Controlled Components (actual `handleChange` pattern)
- Tool State (not persisted — note as opportunity)

## Performance Optimization Opportunities
- React.memo candidates (Tool components, Service cards, Blog cards)
- useMemo candidates (tool scoring, filtered results)
- useCallback candidates (child event handlers)
- Context splitting (language vs analytics)

## Testing Strategy
- Current coverage: 4 test files (list them)
- Gaps: Context providers, consent persistence, form state transitions
- Recommended test targets

## Anti-Patterns Avoided
(Redux, Zustand, MobX, Apollo — keep current, capitalize "Recoil")
```

---

## Conclusion

**This document should not be used as an implementation reference in its current form.** The philosophical direction (no external state library, Context for global state, localStorage for persistence) is sound and well-argued. However, approximately 70% of the specific claims — interface signatures, provider hierarchy, optimization patterns, tool counts, and testing coverage — do not match the codebase.

The document reads like a **design intention** document rather than **as-built documentation**. To make it useful, it needs to be reconciled against the actual code: either update the code to match the design (implement missing persistence, mount AnalyticsProvider, add React.memo) or update the design to accurately describe what was built. The former approach is recommended since several "gaps" (language persistence, tool state persistence, AnalyticsProvider mounting) are legitimate oversights that should be fixed.

**Primary recommendation**: Treat this document as a partially-complete spec. Fix the 5 Critical findings first (they cause runtime errors if followed), then reconcile the 6 Major findings, then address the missing sections.
