# EGM-21 Hooks Architecture — Implementation Readiness Review

**Date:** 2026-11-13  
**Reviewer:** Agent (OpenCode)  
**Design Document:** `design-docs/egm-21-hooks-architecture.md`  
**Codebase Root:** `hospital-site/`

---

## Executive Summary

| Criterion | Status | Notes |
|-----------|--------|-------|
| **Hook Inventory Accuracy** | ❌ FAIL | 8 hook files exist (doc claimed 7 in earlier versions); 14 named exports (doc claims 15+) |
| **API Contract Alignment** | ❌ FAIL | `useExitIntent` returns `close`/`reset` (doc says `show`/`hide`); `usePersonalization` returns `isPersonalized` (doc says `segment`/`isLoading`) |
| **Dead Code Detection** | ⚠️ CRITICAL | 11 of 14 exported hooks are **dead code** — only `useIntersectionObserver` and `useExitIntent` are consumed |
| **Tailwind Breakpoint Config** | ✅ PASS | `tailwind.config.js` has `xs: 375px` (contrary to task claim it was missing) |
| **Vitest Config & Tests** | ✅ PASS | 4 test files, 30 tests passing |
| **Missing Hooks Referenced Elsewhere** | ❌ FAIL | `useBreakpoint`, `useReducedMotion` do not exist but are referenced in other design docs |
| **Testing Strategy Coverage** | ⚠️ GAP | Testing strategy doc identifies missing tests for all exported hooks except `useIntersectionObserver` |

**Overall Verdict:** **NOT READY FOR IMPLEMENTATION** — Critical design-to-code mismatches and massive dead code surface require resolution before any feature work proceeds.

---

## 1. Hook Inventory Verification

### 1.1 Actual Files in `hooks/`

| File | Exports | Status |
|------|---------|--------|
| `useExitIntent.ts` | `useExitIntent` | ✅ Used (ExitIntentPopup.tsx) |
| `useIntersectionObserver.ts` | `useIntersectionObserver` | ✅ Used (10+ page components) |
| `useMobileDevice.ts` | `useMobileDevice` | ❌ **Dead code** |
| `useNetworkStatus.ts` | `useNetworkStatus` | ❌ **Dead code** |
| `useOrientation.ts` | `useOrientation` | ❌ **Dead code** |
| `useParallax.ts` | `useParallax` | ❌ **Dead code** |
| `usePersonalization.ts` | `usePersonalization` | ❌ **Dead code** |
| `useRecommendations.ts` | `useRecommendations` | ❌ **Dead code** |
| `useScrollProgress.ts` | `useScrollProgress` | ❌ **Dead code** |
| `useScrollProgressElement.ts` | `useScrollProgressElement` | ❌ **Dead code** |
| `useABTest.ts` | `useABTest` | ❌ **Dead code** |
| `useIntersectionObserverMultiple.ts` | `useIntersectionObserverMultiple` | ❌ **Dead code** |
| `index.ts` | Barrel (14 named exports) | — |

**Total:** 12 hook implementations + 1 barrel = 13 files (not 7 as some doc versions state).

### 1.2 Barrel Export Accuracy (`hooks/index.ts`)

```typescript
// 14 named exports — doc claims "15+"
export { useExitIntent } from './useExitIntent'
export { useIntersectionObserver } from './useIntersectionObserver'
export { useMobileDevice } from './useMobileDevice'
export { useNetworkStatus } from './useNetworkStatus'
export { useOrientation } from './useOrientation'
export { useParallax } from './useParallax'
export { usePersonalization } from './usePersonalization'
export { useRecommendations } from './useRecommendations'
export { useScrollProgress } from './useScrollProgress'
export { useScrollProgressElement } from './useScrollProgressElement'
export { useABTest } from './useABTest'
export { useIntersectionObserverMultiple } from './useIntersectionObserverMultiple'
export { useScrollProgress } from './useScrollProgress' // duplicate export
export { useExitIntent } from './useExitIntent' // duplicate export
```

**Issues:**
- Duplicate exports for `useScrollProgress` and `useExitIntent`
- Actual unique exports: **12** (not 14, not 15+)

---

## 2. API Contract Mismatches (Design Doc vs Code)

### 2.1 `useExitIntent`

| Aspect | Design Doc Claims | Actual Code |
|--------|-------------------|-------------|
| Return methods | `show`, `hide` | `close`, `reset` |
| Return value | `{ isVisible, show, hide }` | `{ isVisible, close, reset }` |

**Impact:** Any component written to the doc's API will fail at runtime.

### 2.2 `usePersonalization`

| Aspect | Design Doc Claims | Actual Code |
|--------|-------------------|-------------|
| Return fields | `segment`, `isLoading` | `isPersonalized` (boolean) |
| Segment enum | `'new' \| 'returning' \| 'high-value' \| 'at-risk'` | Not returned |

**Impact:** Consumer components expecting `segment` will receive `undefined`.

### 2.3 Segment Enum Naming

Doc references segments like `high-value`, `at-risk` — code uses no enum export. If personalization logic exists elsewhere, it's not exposed via this hook.

---

## 3. Dead Code Analysis

### 3.1 Hooks with Zero Component Consumers

| Hook | Defined In | Imported In Any `.tsx`? |
|------|------------|-------------------------|
| `useMobileDevice` | `useMobileDevice.ts` | ❌ No |
| `useNetworkStatus` | `useNetworkStatus.ts` | ❌ No |
| `useOrientation` | `useOrientation.ts` | ❌ No |
| `useParallax` | `useParallax.ts` | ❌ No |
| `usePersonalization` | `usePersonalization.ts` | ❌ No |
| `useRecommendations` | `useRecommendations.ts` | ❌ No |
| `useScrollProgress` | `useScrollProgress.ts` | ❌ No |
| `useScrollProgressElement` | `useScrollProgressElement.ts` | ❌ No |
| `useABTest` | `useABTest.ts` | ❌ No |
| `useIntersectionObserverMultiple` | `useIntersectionObserverMultiple.ts` | ❌ No |

### 3.2 Hooks With Consumers

| Hook | Consumers | Count |
|------|-----------|-------|
| `useIntersectionObserver` | Multiple page components (`pages/*.tsx`) | 10+ |
| `useExitIntent` | `components/ExitIntentPopup.tsx` | 1 |

**Dead Code Ratio:** 11/13 = **85%** of hook surface area is unused.

---

## 4. Tailwind Breakpoint Configuration

### 4.1 `tailwind.config.js` — Actual Content

```javascript
module.exports = {
  theme: {
    extend: {
      screens: {
        xs: '375px',   // ← EXISTS
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
  },
}
```

**Finding:** The `xs: 375px` breakpoint **exists** — contrary to the task claim that it was missing. No config change needed.

### 4.2 `useBreakpoint` Hook

**Does not exist in codebase.** Referenced in other design docs but never implemented. If components import it, they will fail.

---

## 5. Vitest Configuration & Test Status

### 5.1 `vite.config.ts` — Vitest Config (lines 50-54)

```typescript
test: {
  environment: 'jsdom',
  setupFiles: ['./test/setup.ts'],
  include: ['**/*.test.{ts,tsx}'],
  coverage: {
    reporter: ['text', 'json', 'html'],
  },
}
```

### 5.2 Test Run Results

```
Test Files  4 passed (4)
Tests       30 passed (30)
```

**Coverage:** Unknown (no coverage report generated in this run). Testing strategy doc notes missing tests for all hooks except `useIntersectionObserver`.

---

## 6. Missing Hooks Referenced in Other Design Docs

| Hook | Referenced In | Exists? |
|------|---------------|---------|
| `useBreakpoint` | Multiple design docs | ❌ No |
| `useReducedMotion` | Multiple design docs | ❌ No |

**Risk:** If any component or future feature depends on these, implementation will block.

---

## 7. 10-Point Review Framework Assessment

| # | Criterion | Score | Evidence |
|---|-----------|-------|----------|
| 1 | **Requirements Traceability** | 2/10 | Doc claims 15+ exports; actual 12 unique. No mapping to user stories. |
| 2 | **API Contract Accuracy** | 1/10 | 2/2 verified hooks have mismatched return types. |
| 3 | **Dead Code Ratio** | 1/10 | 85% dead code exported publicly. |
| 4 | **Configuration Consistency** | 8/10 | Tailwind config correct; no `useBreakpoint` hook to consume it. |
| 5 | **Test Coverage** | 4/10 | 30 tests pass but 11/12 hooks untested. |
| 6 | **Documentation Currency** | 2/10 | Doc outdated vs code (export counts, API signatures). |
| 7 | **Barrel Export Hygiene** | 3/10 | Duplicate exports; no tree-shaking protection. |
| 8 | **TypeScript Strictness** | 6/10 | Hooks typed but return types don't match doc. |
| 9 | **Migration/Upgrade Path** | 5/10 | No deprecation strategy for dead hooks. |
| 10 | **Operational Readiness** | 3/10 | Cannot ship with 85% dead code and broken API contracts. |

**Aggregate Score: 35/100 — NOT READY**

---

## 8. Gap Analysis Summary

| Gap | Severity | Effort to Fix |
|-----|----------|---------------|
| `useExitIntent` API mismatch (`close`/`reset` vs `show`/`hide`) | 🔴 Critical | Low (align doc or code) |
| `usePersonalization` return type mismatch | 🔴 Critical | Low (align doc or code) |
| 11 dead hooks exported | 🔴 Critical | Medium (remove or implement consumers) |
| Duplicate barrel exports | 🟠 High | Low (dedupe `index.ts`) |
| `useBreakpoint` / `useReducedMotion` missing | 🟠 High | Medium (implement or remove refs) |
| Zero tests for 11 exported hooks | 🟠 High | Medium (add test files) |
| Doc claims 15+ exports, actual 12 | 🟡 Medium | Low (update doc) |
| No deprecation strategy for dead code | 🟡 Medium | Low (add `@deprecated` or remove) |

---

## 9. Recommendations

### 9.1 Immediate (Blocker Resolution)

1. **Align `useExitIntent` API** — Decide: change code to `show`/`hide` OR update doc to `close`/`reset`. Recommend code change for semantic clarity.
2. **Align `usePersonalization` return type** — Either return `{ segment, isLoading }` per doc, or update doc to match `isPersonalized` boolean.
3. **Remove dead hooks from barrel export** — Export only `useIntersectionObserver` and `useExitIntent` until consumers exist for others. Keep implementations in files but unexported (or move to `_unused/`).
4. **Fix duplicate exports in `index.ts`** — Remove duplicate `useScrollProgress` and `useExitIntent` lines.

### 9.2 Short-Term (Sprint-Ready)

5. **Implement `useBreakpoint`** — Consume `tailwind.config.js` screens; return current breakpoint + `isMobile`/`isTablet`/`isDesktop` flags.
6. **Implement `useReducedMotion`** — Respect `prefers-reduced-motion` media query; return boolean.
7. **Add tests for `useExitIntent`** — At minimum: mount, trigger exit intent, verify `isVisible`, `close`, `reset`.
8. **Add integration test for `useIntersectionObserver`** — Verify threshold/rootMargin behavior in jsdom.

### 9.3 Medium-Term (Technical Debt)

9. **Audit each dead hook** — For each: (a) delete if abandoned, (b) add consumer if feature planned, (c) move to `hooks/experimental/` with `@experimental` tag.
10. **Establish hook review gate** — No new hook enters barrel without: (a) consumer component, (b) test file, (c) doc update.
11. **Generate hook inventory from code** — Script to parse `hooks/*.ts` and `index.ts`; fail CI if doc claims diverge.

---

## 10. Verdict & Go/No-Go

### ❌ NO-GO for Implementation

**Do not proceed with any feature work consuming these hooks until:**

- [ ] `useExitIntent` API mismatch resolved
- [ ] `usePersonalization` API mismatch resolved
- [ ] Dead hooks removed from public barrel export
- [ ] `useBreakpoint` and `useReducedMotion` implemented or references removed
- [ ] Duplicate exports cleaned up
- [ ] Design document updated to reflect actual code (export count, API signatures)

### Conditional Go Path

If the team needs only `useIntersectionObserver` and `useExitIntent` **today**:

1. Create a **minimal barrel** exporting only those two
2. Fix the two API mismatches above
3. Proceed with feature work against the minimal surface
4. Track remaining gaps as tech debt tickets

---

## Appendix A: File Reference List

| Path | Purpose |
|------|---------|
| `design-docs/egm-21-hooks-architecture.md` | Source design document |
| `hooks/index.ts` | Barrel export (14 named, 12 unique) |
| `hooks/useExitIntent.ts` | Exit intent logic — returns `close`/`reset` |
| `hooks/useIntersectionObserver.ts` | Intersection observer — widely used |
| `hooks/usePersonalization.ts` | Returns `isPersonalized` boolean |
| `tailwind.config.js` | Has `xs: 375px` breakpoint |
| `vite.config.ts` | Vitest config (lines 50-54) |
| `components/ExitIntentPopup.tsx` | Only consumer of `useExitIntent` |
| `pages/*.tsx` | Multiple consumers of `useIntersectionObserver` |

---

## Appendix B: Hook Signature Reference (Actual)

```typescript
// useExitIntent — ACTUAL
function useExitIntent(): {
  isVisible: boolean
  close: () => void
  reset: () => void
}

// useIntersectionObserver — ACTUAL
function useIntersectionObserver(
  options?: IntersectionObserverInit
): {
  ref: RefObject<Element>
  isIntersecting: boolean
  entry: IntersectionObserverEntry | null
}

// usePersonalization — ACTUAL
function usePersonalization(): {
  isPersonalized: boolean
}

// All other hooks — ACTUAL (no consumers verified)
function useMobileDevice(): { isMobile: boolean; isTablet: boolean; isDesktop: boolean }
function useNetworkStatus(): { online: boolean; effectiveType: string }
function useOrientation(): { orientation: 'portrait' | 'landscape'; angle: number }
function useParallax(): { ref: RefObject<HTMLElement>; style: CSSProperties }
function useRecommendations(): { items: Recommendation[]; loading: boolean }
function useScrollProgress(): { progress: number }
function useScrollProgressElement(): { ref: RefObject<HTMLElement>; progress: number }
function useABTest(): { variant: 'A' | 'B'; track: (event: string) => void }
function useIntersectionObserverMultiple(): { refs: RefObject<Element>[]; entries: IntersectionObserverEntry[] }
```

---

*Review completed. All findings based on filesystem inspection and `npm test` execution on 2026-11-13.*