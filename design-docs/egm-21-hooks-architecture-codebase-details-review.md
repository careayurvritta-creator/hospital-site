# EGM-21 Hooks Architecture - Codebase Details Review

**Document Reviewed**: `egm-21-hooks-architecture.md`
**Review Date**: 2026-11-13
**Reviewer**: egm-codebase-details (via EGM orchestrator)
**Context Files**: hooks/ (14 files), hooks/index.ts, package.json

---

## Executive Summary

The design document describes a hooks barrel with **15+ named exports** and specific segment names/APIs for `usePersonalization` and `useExitIntent`. The actual codebase exports **14 named exports** from `hooks/index.ts`, and several API names, return values, and segment enumerations differ from the documented claims. Additionally, 12 useful APIs are completely undocumented.

---

## Findings Summary

| # | Severity | Type | Finding | Location |
|---|----------|------|---------|----------|
| 1 | Medium | Inaccurate Count | Export count: 14 actual vs 15+ claimed | `hooks/index.ts:6-16` |
| 2 | Medium | Inaccurate Enum | `usePersonalization` segments: 5 actual vs 4 documented, names differ | `usePersonalization.ts:35-71` |
| 3 | Medium | Inaccurate API | `useExitIntent` returns `close`/`reset`, not `show`/`hide` | `useExitIntent.ts:137-141` |
| 4 | Low | Inaccurate Return | `usePersonalization` returns `isPersonalized`, not `isLoading` | `usePersonalization.ts:98,183` |
| 5 | Medium | Undocumented APIs | 12 implemented features missing from doc | Multiple files |

---

## Detailed Findings

### 1. Export Count Mismatch (Medium)
**Design doc claims**: "15+ named exports" from barrel file  
**Actual**: `hooks/index.ts:6-16` exports **14** (13 named + 1 default):
- `useIntersectionObserver`
- `useMobileDevice`
- `useScrollProgress`
- `useLocalStorage`
- `useDebounce`
- `useMediaQuery`
- `useClickOutside`
- `usePersonalization`
- `useExitIntent`
- `useNetworkStatus`
- `useOrientation`
- `useReducedMotion`
- `useAnimatedCounter`
- `useStaggeredAnimation` (default export)

### 2. `usePersonalization` Segment Names Inaccurate (Medium)
**Design doc lists**: `new_visitor`, `engaged_user`, `high_intent`, `converted_user`  
**Actual `USER_SEGMENTS` enum** (`usePersonalization.ts:35-71`):
- `RETURNING_VISITOR`
- `SERVICE_EXPLORER`
- `TOOL_USER`
- `NEAR_CONVERTER`
- `HIGH_ENGAGEMENT`

Only `RETURNING_VISITOR` loosely maps to doc's `returning_visitor`. Four segment names are wrong.

### 3. `useExitIntent` Return Methods Wrong (Medium)
**Design doc claims**: Returns `show`/`hide` methods  
**Actual** (`useExitIntent.ts:137-141`): Returns `close`/`reset`. No `show`/`hide` methods exist.

### 4. `usePersonalization` Returns `isPersonalized` Not `isLoading` (Low)
**Design doc table shows**: `isLoading` in return object  
**Actual** (`usePersonalization.ts:98,183`): Returns `isPersonalized` boolean flag.

### 5. 12 Useful APIs Undocumented (Medium)

| Feature | Location |
|---------|----------|
| `getTimeBasedGreeting()` | `usePersonalization.ts` |
| `getRecommendedCTA()` | `usePersonalization.ts` |
| `getTopInterests()` | `usePersonalization.ts` |
| `useNetworkStatus()` hook | `useNetworkStatus.ts` |
| `useOrientation()` hook | `useOrientation.ts` |
| localStorage exit-intent cooldown | `useExitIntent.ts` |
| Mobile visibility detection | `useExitIntent.ts` |
| A/B test auto-init | `usePersonalization.ts` |
| `requestAnimationFrame` throttling | `useStaggeredAnimation.ts` |
| `freezeOnceVisible` option | `useIntersectionObserver.ts` |
| Staggered animations | `useStaggeredAnimation.ts` |
| `useReducedMotion` hook | `useReducedMotion.ts` |

---

## Recommendations

1. **Update export count** to "14 named exports" in design doc.
2. **Correct segment names** in `usePersonalization` table to match `USER_SEGMENTS` enum.
3. **Fix `useExitIntent` return API** to show `close`/`reset`.
4. **Fix `usePersonalization` return** to show `isPersonalized`.
5. **Add documentation** for all 12 undocumented APIs with usage examples.
6. **Add `useNetworkStatus`, `useOrientation`, `useReducedMotion`** to the hook inventory table.