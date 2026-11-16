# EGM-07 Mobile UI — Implementation Readiness Review

**Review Date:** 2026-11-13  
**Reviewer:** egm-implementation-readiness  
**Source Document:** `design-docs/egm-07-mobile-ui.md`

---

## 1. Implementation Completeness Score: **72%**

| Subsystem | Score | Status |
|-----------|-------|--------|
| MobileHeader | 90% | ✅ Functional, scroll-hide implemented |
| MobileCTABar | 60% | ⚠️ Missing scroll-hide behavior |
| MobileBottomNav | 65% | ⚠️ Missing scroll-hide; active logic differs from doc |
| MobileConsent | 55% | ⚠️ Missing focus trapping, reduced-motion support |
| Responsive Breakpoints | 70% | ⚠️ Config differs from doc (xl: 1280px vs 1025px) |
| Touch Targets | 85% | ✅ Exceeds WCAG AA (48px vs 44px) |
| Z-Index Hierarchy | 40% | 🔴 Undocumented, conflicts exist |
| Accessibility (Mobile) | 50% | 🔴 Missing focus trap, reduced-motion |
| Performance Optimizations | 75% | ✅ Passive listeners, debounce implemented |

---

## 2. Missing Components / Incomplete Implementations

### P0 — Blockers for Production

| Component | Status | Gap Description |
|-----------|--------|-----------------|
| **MobileConsent Focus Trap** | ❌ Missing | Modal allows tab navigation outside — violates WCAG 2.2 AA Focus Management (SC 2.4.3) |
| **`prefers-reduced-motion` Support** | ❌ Missing | No media queries in global CSS or component styles; animations run regardless of user preference — violates WCAG 2.2 AA (SC 2.3.3) |
| **Z-Index Conflict Resolution** | ❌ Missing | Header `z-50` and CTABar `z-50` conflict; MobileConsent `z-[9999]`/`z-[9998]` undocumented — stacking context unpredictable |

### P1 — Significant Gaps

| Component | Status | Gap Description |
|-----------|--------|-----------------|
| **Scroll-Hide Behavior (CTABar)** | ❌ Not Implemented | Design doc specifies slide in/out on scroll direction; component remains fixed |
| **Scroll-Hide Behavior (MobileBottomNav)** | ❌ Not Implemented | Design doc specifies hide on scroll down; component remains fixed |
| **Non-existent Hook Reference** | 📝 Doc Error | `hooks/useMobileBottomNav.ts` referenced in reading list but does not exist |
| **Touch Target Spec Drift** | 📝 Doc Error | Doc claims 44×44px; actual implementation uses 48px (exceeds WCAG but doc inaccurate) |
| **Breakpoint Spec Drift** | 📝 Doc Error | Doc: xl: 1025px+; Tailwind config: xl: 1280px |

### P2 — Nice to Have

| Component | Status |
|-----------|--------|
| Active route matching documentation (`startsWith` for nested routes) | Not documented |
| Swipeable bottom sheet for MobileConsent (doc claims support) | Not implemented |
| Language switcher persistence across navigation (doc claims) | Not verified |
| Pull-to-refresh (doc explicitly says not implemented) | N/A |

---

## 3. Blockers for Production Deployment

### 🔴 CRITICAL — Must Fix Before Launch

1. **MobileConsent Accessibility Violation — Missing Focus Trap**
   - File: `components/MobileConsent.tsx`
   - Modal overlay renders but focus escapes to background content on Tab
   - Violates WCAG 2.2 AA SC 2.4.3 (Focus Order) and SC 1.3.2 (Meaningful Sequence)
   - **Fix:** Add `react-focus-lock` or custom focus trap; restore focus to trigger on close

2. **`prefers-reduced-motion` Not Respected**
   - Files: Global CSS (`index.css` or equivalent), all component animation styles
   - Bottom nav slide (200ms), consent modal fade, CTA bar pulse/expand animations run regardless of OS setting
   - Violates WCAG 2.2 AA SC 2.3.3 (Animation from Interactions)
   - **Fix:** Add `@media (prefers-reduced-motion: reduce)` queries disabling/zeroing transitions

3. **Z-Index Stacking Context Conflicts**
   - Header: `z-50` (Tailwind `z-50`)
   - CTABar: `z-50` (Tailwind `z-50`) — **same level as header**
   - MobileConsent: `z-[9999]` (overlay) / `z-[9998]` (backdrop) — far above, undocumented
   - MobileBottomNav: `z-40` (correctly below)
   - **Fix:** Establish documented z-index scale; resolve Header/CTABar conflict; document consent elevation

### 🟡 HIGH — Should Fix Before Launch

4. **Scroll-Hide Behavior Missing from 2 of 3 Components**
   - Design doc specifies: Header collapses, CTA bar slides in/out, Bottom nav hides on scroll down
   - Only MobileHeader implements this (uses `requestAnimationFrame`, passive listeners)
   - MobileCTABar and MobileBottomNav have no scroll listeners
   - **Fix:** Extract `useScrollProgress`/`useScrollDirection` hook; apply to CTABar and BottomNav

5. **Documentation vs Implementation Drift**
   - Non-existent hook `useMobileBottomNav.ts` in reading list
   - Touch target spec (44px vs 48px)
   - Breakpoint spec (xl: 1025px vs 1280px)
   - Active state logic (`exact match` vs `startsWith`)
   - **Fix:** Update design doc to match implementation OR align implementation to doc

---

## 4. Technical Debt Resolution Order

| Order | Debt Item | Effort | Dependency |
|-------|-----------|--------|------------|
| 1 | Add focus trap to MobileConsent | 0.5 days | None |
| 2 | Add `prefers-reduced-motion` media queries to global CSS | 0.5 days | None |
| 3 | Document and resolve z-index hierarchy | 0.5 days | None |
| 4 | Implement `useScrollDirection` hook | 1 day | None |
| 5 | Apply scroll-hide to MobileCTABar | 1 day | useScrollDirection |
| 6 | Apply scroll-hide to MobileBottomNav | 1 day | useScrollDirection |
| 7 | Update design doc to match implementation (hooks, touch targets, breakpoints, active logic) | 0.5 days | None |
| 8 | Verify/implement language switcher persistence | 0.5 days | Context/Storage |
| 9 | Add swipeable bottom sheet for MobileConsent (if required) | 2 days | Touch handling |

**Total Critical Path: ~2-3 days** for P0 items (1-3)

---

## 5. Effort Estimates for Gaps

| Gap Category | Estimated Effort | Risk if Deferred |
|--------------|------------------|------------------|
| Focus Trap + Reduced Motion | 1 day | **Legal/Accessibility violation** |
| Z-Index Documentation + Conflict Resolution | 0.5 days | Unpredictable stacking in production |
| Scroll-Hide Behavior (CTABar + BottomNav) | 3 days | UX deviation from spec; screen space wasted |
| Documentation Alignment | 0.5 days | Developer confusion, onboarding friction |
| Swipeable Consent Sheet | 2 days | Missing claimed feature |

---

## 6. Architecture Decision Alignment

| Decision (Doc) | Implementation Status | Notes |
|----------------|----------------------|-------|
| Sticky Header with scroll collapse | ✅ Implemented | Full implementation with rAF, passive listeners |
| Floating CTA Bar with scroll show/hide | ❌ Not Implemented | Component exists but static |
| Bottom Nav with scroll hide | ❌ Not Implemented | Component exists but static |
| Bottom Sheet Consent (not modal) | ⚠️ Partial | Renders as modal overlay; no swipe dismissal |
| Touch Targets ≥44×44px | ✅ Exceeded | Actual: 48×48px (Tailwind `min-h-[48px]`) |
| Breakpoints: xs:375, sm:640, md:768, lg:1024, xl:1025+ | ⚠️ Mismatch | Config: xl:1280px |
| All Transitions: 200ms ease-in-out | ✅ Implemented | Consistent in components |
| Passive Scroll Listeners (60fps) | ✅ Implemented | Header uses `{ passive: true }` |
| Debounced Scroll Handlers (16ms) | ⚠️ Partial | Header implements; others N/A (no scroll handlers) |
| Focus Trap in Mobile Menu | ✅ Implemented | Header hamburger menu has focus management |
| Focus Trap in Consent Modal | ❌ Missing | Critical gap |
| `prefers-reduced-motion` Respect | ❌ Missing | Critical gap |
| WCAG AA Color Contrast | ✅ Assumed | Not verified in review |
| `aria-label` on Interactive Elements | ✅ Implemented | Verified in components |

---

## 7. Go/No-Go Recommendation

**NO-GO for production** until P0 items resolved (est. 2-3 days).

**Conditional GO for staging** with:
- Focus trap added to MobileConsent (`react-focus-lock` or custom)
- `prefers-reduced-motion` media queries in global CSS disabling all transitions
- Z-index hierarchy documented and Header/CTABar conflict resolved (e.g., Header `z-50`, CTABar `z-45`, Consent `z-60`)

**Stretch for staging:**
- Scroll-hide behavior on CTABar and MobileBottomNav
- Design doc updated to reflect actual implementation (touch targets, breakpoints, hooks, active route logic)

---

*Report generated by egm-implementation-readiness reviewer*