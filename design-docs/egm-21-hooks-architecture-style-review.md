# EGM-21: Custom Hooks Architecture — Style Review

**Reviewed file**: `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site\design-docs\egm-21-hooks-architecture.md`
**Codebase reference**: `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site\hooks\*.ts`, `hooks/index.ts`, `tailwind.config.js`
**Review date**: 2026-11-13
**Reviewer**: EGM Style Reviewer

---

## Executive Summary

| Criterion | Score (1-5) | Notes |
|-----------|-------------|-------|
| 1. Clarity & Structure | **4** | Well-organized with clear sections, tables, code blocks; minor inconsistency in hook count |
| 2. Completeness | **3** | Covers all 7 hook files + barrel, but omits return-value details for 2 hooks; missing cross-references |
| 3. Accuracy of Diagrams/Tables | **2** | **Multiple factual errors** in return types, barrel export count, hook count, and claims about non-existent hooks |
| 4. Actionability | **3** | Usage example is correct; no migration guidance, no versioning, no testing hints |
| 5. Formatting | **4** | Clean Markdown, consistent table syntax, good code fences; minor alignment drift in tables |
| 6. Terminology Consistency | **3** | "8 hooks" vs "7 hooks" vs "15+ exports" vs actual 13; "segment" vs "isPersonalized"; "show/hide" vs "close" |
| 7. Evidence-Based Claims | **2** | Several claims contradicted by source code (see Findings); "Corrected Claims" table itself contains errors |
| 8. Missing Critical Sections | **3** | No TypeScript interface definitions, no error boundaries, no SSR considerations, no performance caveats |
| 9. Overall Usability | **3** | Useful as a reference but risky if trusted blindly due to factual inaccuracies |

**Overall Score: 2.9 / 5.0** — *Referenceable with caution; requires corrections before relying on for implementation*

---

## Findings Table

| Severity | ID | Location | Issue | Evidence |
|----------|----|----------|-------|----------|
| **Critical** | C-01 | Line 4 | Claims "8 custom hooks" | Codebase has **7 hook source files** + 1 barrel = 8 items, but only 7 actual hooks |
| **Critical** | C-02 | Line 21 (Table) | Barrel "exports 15+ named exports" | `hooks/index.ts` exports **13** named exports (counted) |
| **Critical** | C-03 | Lines 35-38 | `usePersonalization` return type wrong | Doc: `{ content, segment, isLoading }` → Actual: `{ content, isPersonalized, getTimeBasedGreeting, getRecommendedCTA, getTopInterests }` — no `segment`, no `isLoading` |
| **Critical** | C-04 | Lines 54-57 | `useExitIntent` return type wrong | Doc: `{ hasTriggered, isVisible, triggerCount, show, hide, reset }` → Actual: `{ hasTriggered, isVisible, triggerCount, close, reset }` — **`show/hide` do not exist** |
| **Critical** | C-05 | Line 125 ("Corrected Claims" table) | Claims `useReducedMotion` and `useBreakpoint` don't exist — but the table itself implies they were claimed; neither exists in codebase, so this is confusing | No `useReducedMotion.ts` or `useBreakpoint.ts` files; not in barrel |
| **Major** | M-01 | Line 6 | Claims `useLanguage` and `useAnalytics` are "context consumers from `contexts/`" | Not verified in this review; plausible but undocumented here |
| **Major** | M-02 | Line 21 (Table) | Barrel exports listed as `useIntersectionObserverMultiple`, `useScrollProgressElement`, `useParallax`, `useNetworkStatus`, `useOrientation` | These **are** exported (from respective source files) — correct, but count is 13 not 15+ |
| **Major** | M-03 | Lines 83-90 | Analytics integration list | Correct module names, but no import paths shown (e.g., `../analytics/eventTracker` vs `@/analytics/eventTracker`) |
| **Major** | M-04 | Lines 115-127 | "Corrected Claims" table lists previous claims that don't match current doc | The table says previous claimed `useDebounce`, `useLocalStorage`, etc. — but those never appeared in *this* version; appears to be meta-commentary on a prior draft |
| **Minor** | m-01 | Line 4 | "All hooks are located in `hooks/` directory and exported via `hooks/index.ts` barrel file" | True, but `useLanguage`/`useAnalytics` (if they exist) are in `contexts/` — doc acknowledges this |
| **Minor** | m-02 | Line 27-29 | `useScrollProgress` return type correct but `scrollDirection` type is `'up'\|'down'\|null` — actual code matches | ✓ Verified |
| **Minor** | m-03 | Lines 31-33 | `useRecommendations` return type | ✓ Verified correct |
| **Minor** | m-04 | Lines 41-47 | `useMobileDevice` return type | ✓ Mostly correct; `contentStrategy` and `thumbZone` shapes match |
| **Minor** | m-05 | Lines 49-52 | `useIntersectionObserver` options/return | ✓ Verified correct |
| **Minor** | m-06 | Lines 59-63 | `useABTest` return type | ✓ Verified correct |
| **Minor** | m-07 | Lines 66-78 | Barrel file code block | ✓ **Matches actual `hooks/index.ts` exactly** (lines 6-16) |
| **Minor** | m-08 | Line 127 | "Barrel export exists — exports 15+ named exports" | Repeats M-02 error |
| **Minor** | m-09 | Line 134 | "useIntersectionObserver and useScrollProgress use useRef/useCallback to minimize re-renders" | ✓ Verified in source |
| **Minor** | m-10 | Line 135 | "TypeScript: All hooks fully typed with explicit return interfaces" | ✓ Verified; all hooks have explicit return interfaces |
| **Nit** | n-01 | Line 21 | Table column "Key Dependencies" lists React hooks as dependencies | Unusual framing — React built-ins aren't external dependencies |
| **Nit** | n-02 | Line 67 | Barrel code block comment `// Animation Hooks (UI-UX Pro Max)` | Internal branding leak; not useful for external reader |
| **Nit** | n-03 | Line 117-127 | "Corrected Claims" table formatting | Column alignment drifts; some rows wrap awkwardly |
| **Nit** | n-04 | Line 132 | "No redundant hooks: Each hook serves distinct domain" | Subjective claim; not a factual finding |

---

## Line-Specific Issues with Code Evidence

### C-01 / Line 4: Hook Count Discrepancy
**Doc**: "The application uses **8 custom hooks** (not 7)... All hooks are located in `hooks/` directory"
**Code**: `hooks/` contains **7** `.ts` hook files:
```
useABTest.ts
useExitIntent.ts
useIntersectionObserver.ts
useMobileDevice.ts
usePersonalization.ts
useRecommendations.ts
useScrollProgress.ts
```
**Fix**: Change "8 custom hooks" → "7 custom hooks in 7 source files, plus a barrel export file"

---

### C-02 / Line 21: Barrel Export Count
**Doc**: "Re-exports all hooks + additional utilities... **exports 15+ named exports**"
**Code** (`hooks/index.ts` lines 6-16):
```typescript
export { usePersonalization } from './usePersonalization';                    // 1
export { useExitIntent } from './useExitIntent';                              // 2
export { useABTest, useABTestVariants } from './useABTest';                   // 3, 4
export { useRecommendations } from './useRecommendations';                    // 5
export { useMobileDevice, useNetworkStatus, useOrientation } from './useMobileDevice'; // 6, 7, 8
export { useIntersectionObserver, useIntersectionObserverMultiple } from './useIntersectionObserver'; // 9, 10
export { useScrollProgress, useScrollProgressElement, useParallax } from './useScrollProgress'; // 11, 12, 13
```
**Total: 13 named exports**. Not 15+.
**Fix**: "exports **13 named exports** from 7 source files"

---

### C-03 / Lines 35-38: `usePersonalization` Return Type
**Doc**:
```
Returns: { content: PersonalizedContent, segment: UserSegment, isLoading }
Segments: new_visitor, returning_visitor, engaged_user, high_intent, converted_user
```
**Actual** (`hooks/usePersonalization.ts` lines 181-188):
```typescript
return {
    content,
    isPersonalized,
    getTimeBasedGreeting,
    getRecommendedCTA,
    getTopInterests,
};
```
**Actual segments** (`analytics/userSegmentation.ts` via import): `USER_SEGMENTS` = `RETURNING_VISITOR`, `SERVICE_EXPLORER`, `TOOL_USER`, `NEAR_CONVERTER`, `HIGH_ENGAGEMENT` — **NOT** `new_visitor`, `engaged_user`, `converted_user`.
**Fix**: Replace entire return-type block with actual return shape; correct segment names.

---

### C-04 / Lines 54-57: `useExitIntent` Return Type
**Doc**:
```
Returns: { hasTriggered, isVisible, triggerCount, show, hide, reset }
```
**Actual** (`hooks/useExitIntent.ts` lines 137-141):
```typescript
return {
    ...state,  // { hasTriggered, isVisible, triggerCount }
    close,     // not 'hide'
    reset,
};
```
**No `show` or `hide` methods exist**. `close` sets `isVisible: false`.
**Fix**: Change `show, hide` → `close`; remove `show`.

---

### C-05 / Lines 117-127: "Corrected Claims" Table Internal Inconsistency
**Doc Table Row**: "`useReducedMotion` hook exists → ❌ Not in codebase"
**Doc Table Row**: "`useBreakpoint` hook exists → ❌ Not in codebase"
**Reality**: Neither hook file exists, neither is in barrel. The table correctly says they don't exist — but this table is framed as "Previous Claim vs Actual", implying a *prior version of this doc* claimed they existed. Since this is the *current* doc, the table is confusing meta-commentary.
**Fix**: Move this table to a "Changelog / Revision History" section or remove; it clutters the reference doc.

---

### M-03 / Lines 83-90: Analytics Integration — Missing Import Paths
**Doc** lists module names without import aliases:
```
- eventTracker.ts — event logging
- recommendationEngine.ts — personalized recommendations
...
```
**Actual imports** in hooks:
```typescript
// useExitIntent.ts line 7
import { eventTracker } from '../analytics';

// useRecommendations.ts line 7
import { recommendationEngine, ServiceInfo } from '../analytics/recommendationEngine';

// usePersonalization.ts line 7
import { userSegmentation, USER_SEGMENTS } from '../analytics';
```
**Fix**: Add import path column or note: "All analytics imports use relative `../analytics/` or `../analytics/<module>`"

---

### m-01 / Line 6: Context Consumers Unverified
**Doc**: "`useLanguage` and `useAnalytics` are context consumers from `contexts/`, not standalone hooks"
**Status**: Not verified in this review (outside scope). If true, fine; if false, another inaccuracy.
**Recommendation**: Either verify and cite the context files, or remove the claim.

---

## Actionable Recommendations by Priority

### P0 — Fix Before Any Consumer Relies On This Doc
1. **Correct `usePersonalization` return type** (C-03) — developers will get `undefined` for `segment` and `isLoading`
2. **Correct `useExitIntent` return methods** (C-04) — calling `.show()` or `.hide()` will throw
3. **Fix hook count** (C-01) and **barrel export count** (C-02) — credibility baseline

### P1 — Improve Reference Quality
4. **Add TypeScript interface definitions** for each hook's return type (currently only in source, not in doc)
5. **Document `usePersonalization` segment constants** (`USER_SEGMENTS` enum values) — currently mismatched
6. **Add SSR/compatibility notes**: All hooks use `window`/`document`/`navigator` — will error in SSR without guards
7. **Add testing hints**: e.g., `useExitIntent` uses `localStorage` — needs mock in tests
8. **Add version/last-updated badge** — doc has no date or version

### P2 — Polish
9. **Remove or relocate "Corrected Claims" table** (C-05) — it's meta-commentary, not reference material
10. **Add import path examples** for analytics modules (M-03)
11. **Fix table alignment** in "Corrected Claims" (n-03)
12. **Remove internal branding** from barrel code comment (n-02)

---

## Suggested Revised Structure

```markdown
# EGM-21: Custom Hooks Architecture

## Overview
- 7 custom hooks in `hooks/` + 1 barrel export (`hooks/index.ts`)
- 13 named exports total
- All hooks TypeScript-typed with explicit return interfaces
- Analytics-first design: most integrate with `../analytics/` modules

## Hook Inventory (Source Files)

| Hook | File | Purpose | Key Analytics Dependency |
|------|------|---------|--------------------------|
| `useScrollProgress` | `useScrollProgress.ts` | Page scroll progress, direction, parallax | — |
| `useRecommendations` | `useRecommendations.ts` | Personalized service recs | `recommendationEngine` |
| `usePersonalization` | `usePersonalization.ts` | Content personalization by segment | `userSegmentation` |
| `useMobileDevice` | `useMobileDevice.ts` | Device info, network, orientation, UX strategy | `mobileDeviceDetector` |
| `useIntersectionObserver` | `useIntersectionObserver.ts` | Viewport entry/exit for animations | — |
| `useExitIntent` | `useExitIntent.ts` | Exit-intent detection, modal trigger | `eventTracker` |
| `useABTest` | `useABTest.ts` | A/B test variant assignment | `abTestManager` |

## Barrel Export (`hooks/index.ts`)
```typescript
// 13 named exports from 7 source files
export { usePersonalization } from './usePersonalization';
export { useExitIntent } from './useExitIntent';
export { useABTest, useABTestVariants } from './useABTest';
export { useRecommendations } from './useRecommendations';
export { useMobileDevice, useNetworkStatus, useOrientation } from './useMobileDevice';
export { useIntersectionObserver, useIntersectionObserverMultiple } from './useIntersectionObserver';
export { useScrollProgress, useScrollProgressElement, useParallax } from './useScrollProgress';
```

## Hook Return Types (TypeScript)

### `useScrollProgress()`
```ts
{ progress: number; scrollY: number; scrollDirection: 'up'|'down'|null; isScrolled: boolean }
```
+ `useScrollProgressElement(ref, options?)`
+ `useParallax(speed?)`

### `useRecommendations(limit?)`
```ts
{ recommendations: ServiceInfo[]; trending: ServiceInfo[]; isLoading: boolean;
  recordView(id): void; recordInteraction(id): void;
  getByDosha(dosha): ServiceInfo[]; getSimilar(id): ServiceInfo[] }
```

### `usePersonalization()`
```ts
{ content: PersonalizedContent; isPersonalized: boolean;
  getTimeBasedGreeting(): string; getRecommendedCTA(): string; getTopInterests(): string[] }
```
**Segments** (from `USER_SEGMENTS`): `RETURNING_VISITOR`, `SERVICE_EXPLORER`, `TOOL_USER`, `NEAR_CONVERTER`, `HIGH_ENGAGEMENT`

### `useMobileDevice()`
```ts
{ deviceInfo: MobileDeviceInfo|null; isMobile: boolean; isTablet: boolean; isSlowNetwork: boolean;
  orientation: 'portrait'|'landscape'; contentStrategy: ContentStrategy; thumbZone: ThumbZones }
```
+ `useNetworkStatus()` → `{ isOnline, connectionType, isSlowNetwork, dataSaverEnabled }`
+ `useOrientation()` → `'portrait'|'landscape'`

### `useIntersectionObserver(options?)`
```ts
{ ref: RefObject<HTMLElement>; isVisible: boolean; hasBeenVisible: boolean }
```
+ `useIntersectionObserverMultiple(count, options?)`

### `useExitIntent(options?)`
```ts
{ hasTriggered: boolean; isVisible: boolean; triggerCount: number; close(): void; reset(): void }
```
**Options**: `threshold`, `timeout`, `triggerOnMobile`, `onExitIntent`

### `useABTest(testId)`
```ts
{ variant: ABTestVariant|null; isControl: boolean; variantId: string|null; trackConversion(value?): void }
```
+ `useABTestVariants()` → `Record<string, string>`

## Analytics Integration
| Module | Import Path | Purpose |
|--------|-------------|---------|
| `eventTracker` | `../analytics` | Event logging |
| `recommendationEngine` | `../analytics/recommendationEngine` | Personalized recs |
| `userSegmentation` | `../analytics` | Behavioral segments |
| `mobileDeviceDetector` | `../analytics/mobileDeviceDetector` | Device capabilities |
| `abTestManager` | `../analytics/abTestManager` | A/B test management |

## Usage Example
```tsx
import { useScrollProgress, useIntersectionObserver, useMobileDevice } from '@/hooks';

function HeroSection() {
  const { progress, scrollDirection } = useScrollProgress();
  const { isMobile, contentStrategy } = useMobileDevice();
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.3 });
  // ...
}
```

## SSR / Next.js Compatibility
⚠️ All hooks access `window`, `document`, or `navigator` directly. Wrap usage in `useEffect` or check `typeof window !== 'undefined'` for SSR safety.

## Testing Notes
- `useExitIntent` reads/writes `localStorage` → mock in tests
- `useMobileDevice` subscribes to `mobileDeviceDetector` → provide test double
- `useABTest` initializes `abTestManager` with `DEFAULT_AB_TESTS` → reset between tests

## Revision History
| Date | Change |
|------|--------|
| 2026-11-13 | Corrected return types for usePersonalization, useExitIntent; fixed hook/export counts; added SSR/testing notes |
```

---

## Conclusion

The document `egm-21-hooks-architecture.md` is **structurally sound but factually unreliable in key areas**. A developer using this as a reference would encounter **runtime errors** on `usePersonalization` (missing `segment`, `isLoading`) and `useExitIntent` (missing `show`, `hide`). The "Corrected Claims" table adds confusion rather than clarity. The barrel export code block is the only fully accurate section.

**Recommendation**: Apply P0 fixes immediately; restructure per the suggested template above before treating this as a canonical reference. The hooks themselves are well-implemented — the documentation just needs to catch up.

---

**Verification**: This review file written to `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site\design-docs\egm-21-hooks-architecture-style-review.md`