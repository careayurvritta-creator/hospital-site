# EGM-07 Mobile UI - Codebase Details Review

**Document Reviewed**: `egm-07-mobile-ui.md`
**Review Date**: 2026-11-13
**Reviewer**: egm-codebase-details (via EGM orchestrator)
**Context Files**: components/MobileBottomNav.tsx, components/MobileConsent.tsx, components/Header.tsx, components/CTABar.tsx, hooks/useMobileDevice.ts, tailwind.config.js

---

## Executive Summary

The design document for *egm‑07* documents a mobile UI architecture that partially matches the codebase but contains several inaccurate references, missing implementations, and accessibility gaps. Most critically, it references a non-existent hook file, documents touch targets that don't match actual implementation, and omits z-index conflicts and missing accessibility features.

---

## Findings Summary

| # | Severity | Type | Finding | Location |
|---|----------|------|---------|----------|
| 1 | Critical | Missing File | Non-existent hook reference: `hooks/useMobileBottomNav.ts` | Design doc reading list |
| 2 | Warning | Spec Mismatch | Touch target spec: 44×44px documented vs 48px actual | Tailwind `min-h-[48px]` |
| 3 | Warning | Architecture Gap | Z-index hierarchy undocumented & conflicting | Header `z-50`, CTABar `z-50`, MobileConsent `z-[60]` |
| 4 | Warning | Missing Implementation | Scroll-hide behavior described but not implemented | Header, MobileBottomNav, CTABar |
| 5 | Warning | Accessibility Gap | MobileConsent lacks focus trapping | `MobileConsent.tsx` |
| 6 | Warning | Accessibility Gap | No `prefers-reduced-motion` support | Global CSS |
| 7 | Informational | Spec Drift | MobileBottomNav active state logic differs from doc | `MobileBottomNav.tsx` |

---

## Detailed Findings

### 1. Non-existent Hook Reference (Critical)
The design doc's reading list includes `hooks/useMobileBottomNav.ts` — **this file does not exist** in the codebase. Developers following the doc will search for missing code.  
**Fix:** Remove reference or create the hook if bottom nav state logic needs extraction.

### 2. Touch Target Spec Mismatch (Warning)
**Design doc claims**: "≥44×44px" (WCAG 2.2 AA minimum)  
**Actual implementation**: `min-h-[48px]` / `min-w-[48px]` (Tailwind arbitrary values) used throughout `MobileBottomNav.tsx`, `MobileConsent.tsx`, `CTABar.tsx`.  
Implementation exceeds WCAG 2.2 AA but doc should reflect actual 48px for consistency.

### 3. Z-Index Hierarchy Undocumented & Conflicting (Warning)
| Component | Z-Index | Issue |
|-----------|---------|-------|
| Header | `z-50` | |
| CTABar | `z-50` | **Conflict**: Same level as Header |
| MobileConsent | `z-[60]` | Undocumented, above both |
| MobileBottomNav | `z-40` | Correctly below |

No z-index table exists in the design doc. `z-[60]` arbitrary value should be documented.

### 4. Scroll-Hide Behavior Unimplemented (Warning)
**Design doc describes**: Header and bottom nav should hide on scroll down, show on scroll up.  
**Actual**: All fixed components remain visible during scroll. No scroll listeners exist in `Header.tsx`, `MobileBottomNav.tsx`, or `CTABar.tsx`.  
**Fix:** Update doc to match reality or implement hide-on-scroll with `useScrollProgress` hook.

### 5. MobileConsent Lacks Focus Trapping (Warning)
`MobileConsent.tsx` renders a modal overlay but **does not trap focus**. Users can tab outside the modal into background content — violates WCAG 2.2 AA (Focus Management).  
**Fix:** Add `react-focus-lock` or custom focus trap implementation.

### 6. No `prefers-reduced-motion` Support (Warning)
No `@media (prefers-reduced-motion: reduce)` queries exist in global CSS or component styles. Animations (bottom nav slide, consent modal fade, CTA bar pulse) run regardless of user preference — violates WCAG 2.2 AA.  
**Fix:** Add reduced-motion media queries to disable/respect user preference.

### 7. MobileBottomNav Active State Logic Drift (Informational)
Design doc describes active state based on `pathname` exact match. Actual implementation (`MobileBottomNav.tsx:45-52`) uses `startsWith` for nested routes (e.g., `/services/panchakarma` matches `/services`). This is better UX but should be documented.

---

## Recommendations

1. **Remove non-existent hook reference** from reading list or create `useMobileBottomNav.ts` if needed.
2. **Update touch target spec** to "48×48px minimum (exceeds WCAG 2.2 AA)" throughout doc.
3. **Add z-index hierarchy table** documenting actual values and resolve Header/CTABar conflict.
4. **Either implement scroll-hide behavior** using `useScrollProgress` or update doc to reflect static positioning.
5. **Add focus trapping** to `MobileConsent` modal (recommend `react-focus-lock`).
6. **Add `prefers-reduced-motion` support** in global CSS for all animations.
7. **Document active route matching** logic (`startsWith` for nested routes).