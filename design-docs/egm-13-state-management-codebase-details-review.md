# EGM-13: State Management - Codebase Details Review

## Executive Summary
The codebase implements a context-based state management system with `LanguageProvider` and `AnalyticsProvider`, using controlled components for forms. However, critical gaps exist in persistence (language preference not saved), performance (missing React.memo/useMemo), and testing (zero test coverage). The translation API differs from design (object access vs function call).

**Overall Score: 6/10** - Functional but incomplete persistence, no test coverage, performance gaps.

---

## Findings Table

| Severity | Finding ID | Issue | Code Reference | Design Doc Section |
|----------|------------|-------|----------------|-------------------|
| **Critical** | C1 | Language preference not persisted to localStorage - users lose selection on refresh | `LanguageContext.tsx` (no localStorage) | §2 |
| **Critical** | C2 | Zero test coverage for state management - no unit/integration tests | `tests/` (missing) | §9 |
| **Warning** | W1 | Translation API mismatch: design expects `t('key')` function, code uses `t.key` object | `LanguageContext.tsx:6`, `LanguageContextType` | §1, §8 |
| **Warning** | W2 | Analytics context has more methods than design specifies (trackPageView, trackEvent, trackError, identifyUser, resetUser) | `AnalyticsProvider.tsx:31-36` | §1 |
| **Warning** | W3 | No React.memo on CookieConsent - re-renders on every parent render | `CookieConsent.tsx` | §5 |
| **Warning** | W4 | No useMemo for expensive computations (translation lookup, analytics events) | `LanguageContext.tsx`, `AnalyticsProvider.tsx` | §5 |
| **Warning** | W5 | Inline object creation in AnalyticsProvider value causes unnecessary re-renders | `AnalyticsProvider.tsx:40` | §6 |
| **Suggestion** | S1 | Tool count discrepancy: design mentions 5 tools, codebase has 6 (Diet tool added) | `Tools.tsx` | §7 |
| **Suggestion** | S2 | Context splitting pattern mentioned in design but not implemented | Design doc §4 | §4 |

---

## Detailed Findings

### C1: Language Preference Not Persisted
**Design Claim**: "Language: `localStorage.setItem('ayur-language', language)` on change, `localStorage.getItem('ayur-language')` on mount"
**Code Reality**: `LanguageContext.tsx` has no localStorage read/write. Language resets to default on page refresh.
**Impact**: Poor UX for returning users; language preference not remembered.
**Fix**: Add `useEffect` for localStorage sync in `LanguageProvider`.

### C2: Zero Test Coverage
**Design Claim**: "Jest + React Testing Library, context mock factories, integration tests for forms"
**Code Reality**: No test files found in reviewed paths. No `__tests__` directories.
**Impact**: No regression protection for critical state logic (language switching, analytics consent, form handling).
**Fix**: Add Vitest tests for `LanguageProvider`, `AnalyticsProvider`, `useForm` hooks.

### W1: Translation API Mismatch
**Design Claim**: `t('common.welcome')` dot-notation function call
**Code Reality**: Uses object property access `t.common.welcome` (TranslationType is full object)
**Impact**: Breaking change if components written to design spec; inconsistent with i18n library patterns.
**Fix**: Either update design to match implementation, or refactor to function-based API.

### W2: Analytics Context Extended Beyond Design
**Design Claim**: Single `track(event: AnalyticsEvent) => void` method
**Code Reality**: Five methods: `trackPageView`, `trackEvent`, `trackError`, `identifyUser`, `resetUser`
**Impact**: Design under-specifies; components may use methods not documented.
**Fix**: Update design to reflect actual API or create adapter layer.

### W3: Missing React.memo on CookieConsent
**Design Claim**: "React.memo() on CookieConsent banner"
**Code Reality**: No React.memo wrapper found.
**Impact**: Consent banner re-renders on every parent state change.
**Fix**: Wrap `CookieConsent` in `React.memo()`.

### W4: Missing useMemo for Expensive Computations
**Design Claim**: "useMemo for expensive computations"
**Code Reality**: No useMemo usage found in reviewed files.
**Impact**: Translation object recreated on every render; analytics events not memoized.
**Fix**: Add useMemo for translation lookup, analytics event builders.

### W5: Inline Object in Provider Value
**Code Reality**: `AnalyticsProvider.tsx:40` creates new object in provider value on each render
```tsx
value={{
  trackPageView: useCallback(...),
  trackEvent: useCallback(...),
  // ... new object every render
}}
```
**Impact**: All consumers re-render on any provider state change.
**Fix**: Wrap value in useMemo or split contexts.

---

## Architecture Comparison

| Design Component | Intended Behavior | Codebase Reality | Gap |
|------------------|-------------------|------------------|-----|
| Language Context | `t(key)` function, localStorage persistence | Object access `t.key`, **no persistence** | **API mismatch + missing persistence** |
| Analytics Context | Single `track()` method | 5 methods + consent manager | **Underspecified** |
| Persistence | Language + Analytics both persist | Analytics ✅, Language ❌ | **Partial** |
| Controlled Components | All forms controlled | ✅ All forms controlled | None |
| Provider Nesting | LanguageProvider > AnalyticsProvider > App | Providers exist, nesting unverified | **Unverified** |
| Performance | React.memo, useCallback, useMemo | useCallback ✅, React.memo ❌, useMemo ❌ | **Partial** |
| Anti-Patterns | No localStorage in components, no prop drilling, no inline objects | localStorage abstracted ✅, context used ✅, **inline object ❌** | **One violation** |
| Page/Tool Count | 14 pages, 5 tools | Tools: 6 (Diet added), Pages: unverified | **Discrepancy** |
| Translation System | `t('key')` function | `t.key` object property | **API mismatch** |
| Testing | Jest + RTL, mock factories, integration | **No tests** | **Missing** |

---

## Recommendations

### Immediate (Critical)
1. **Add language persistence**: Implement localStorage sync in `LanguageProvider`
2. **Add test suite**: Create Vitest tests for providers, hooks, form state
3. **Resolve translation API**: Decide on function vs object pattern and align design/code

### Short-term
4. **Add React.memo to CookieConsent**
5. **Add useMemo for translation lookup and analytics value object**
6. **Split AnalyticsContext or memoize provider value** to prevent unnecessary re-renders
7. **Update design doc** to reflect actual 6 tools, 5 methods in AnalyticsContext

### Long-term
8. **Implement context splitting** if bundle size becomes concern
9. **Add integration tests** for full form flows (booking, health tools)
10. **Consider Zustand/Redux** if state complexity grows beyond context

---

## Code References

### Files Reviewed
- `components/LanguageContext.tsx` - Language provider, types
- `components/AnalyticsProvider.tsx` - Analytics provider, consent manager
- `components/CookieConsent.tsx` - Consent banner (no React.memo)
- `components/consentManager.ts` - Analytics persistence (localStorage + cookies)
- `pages/Booking.tsx` - Controlled form example (lines 49-119)
- `pages/Tools.tsx` - 6 tools (design says 5)

### Missing Files
- `tests/` - No test files for state management
- `App.tsx` - Provider nesting not verified