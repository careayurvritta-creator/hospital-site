# EGM-16: Accessibility Architecture - Codebase Details Review

## Executive Summary
The codebase demonstrates a solid foundation for accessibility with semantic HTML, proper skip links, consistent focus styles through both global CSS and Material Design components, and correct form label associations. However, critical gaps exist in automated enforcement and assistive technology testing that prevent claiming WCAG 2.1 AA compliance.

**Overall Score: 7/10** - Good foundation, needs automation and testing rigor.

---

## Findings Table

| Severity | Finding ID | Issue | Code Reference | Design Doc Section |
|----------|------------|-------|----------------|-------------------|
| **Critical** | C1 | No automated heading hierarchy enforcement - no CI check for exactly one h1 per page | N/A (missing) | §3.1 |
| **Critical** | C2 | No axe-core integration in CI pipeline - accessibility regressions undetected | `package.json` (missing) | §10 |
| **Critical** | C3 | No comprehensive assistive technology test matrix established | N/A (missing) | §11 |
| **Warning** | W1 | Manual contrast verification only - custom color overrides not tested against AA | `tailwind.config.ts` custom colors | §9 |
| **Warning** | W2 | Focus trap implementation exists but not verified on all modals/drawers | `hooks/useFocusTrap.ts` | §5 |
| **Warning** | W3 | aria-live regions used but not audited for all dynamic content | `hooks/useAnnouncer.ts` | §7 |
| **Suggestion** | S1 | Skip link exists but could be enhanced with visible focus indicator on activation | `components/SkipLink.tsx` | §4 |
| **Suggestion** | S2 | Consider adding landmark role="region" for major sections beyond standard landmarks | Various page components | §3 |

---

## Detailed Findings

### C1: No Automated Heading Hierarchy Enforcement
**Design Claim**: "Heading hierarchy enforced (exactly one h1 per page)"
**Code Reality**: No automated checks exist. Heading structure relies on developer discipline.
**Impact**: Risk of multiple h1s or skipped heading levels going undetected.
**Recommendation**: Add `eslint-plugin-jsx-a11y` rules or custom Vitest check.

### C2: No axe-core Integration in CI
**Design Claim**: "WCAG 2.1 AA audit actually performed before releases"
**Code Reality**: `axe-core` not in `package.json` devDependencies. No CI step runs accessibility tests.
**Impact**: Accessibility regressions ship to production undetected.
**Recommendation**: Add `@axe-core/playwright` to Playwright tests or run `axe-cli` in CI.

### C3: No Assistive Technology Test Matrix
**Design Claim**: Implied by "WCAG 2.1 AA audit performed"
**Code Reality**: No documented test matrix for NVDA, JAWS, VoiceOver, TalkBack.
**Impact**: No verification that screen readers actually navigate correctly.
**Recommendation**: Create test matrix document with specific user flows per AT.

### W1: Manual Contrast Verification Only
**Design Claim**: "Color contrast tested/meets AA"
**Code Reality**: Custom colors in `tailwind.config.ts` not programmatically tested against WCAG AA.
**Impact**: Brand color overrides may fail contrast in some contexts.
**Recommendation**: Add `color-contrast-checker` to design token validation.

### W2: Focus Trap Not Verified on All Modals
**Code Reality**: `useFocusTrap.ts` exists but usage not audited across all modal/drawer components.
**Impact**: Focus may escape on some dialogs.
**Recommendation**: Audit all `Modal`, `Drawer`, `BottomSheet` components for focus trap.

### W3: aria-live Regions Not Audited
**Code Reality**: `useAnnouncer.ts` exists but dynamic content announcements not systematically reviewed.
**Impact**: Some async updates may not be announced to screen readers.
**Recommendation**: Audit all data-fetching and form submission flows for announcements.

---

## Architecture Comparison

| Design Component | Intended Behavior | Codebase Reality | Gap |
|------------------|-------------------|------------------|-----|
| Semantic HTML | Landmarks (banner, main, contentinfo, navigation) | ✅ Implemented correctly | None |
| Heading Hierarchy | Enforced 1 h1/page, proper nesting | ⚠️ Manual only, no automation | **No CI enforcement** |
| ARIA Landmarks | Present on all pages | ✅ Verified in Layout.tsx | None |
| Skip Links | Present and functional | ✅ Implemented in SkipLink.tsx | None |
| Focus Styles | `focus-visible:ring-2` consistent | ✅ Global CSS + MUI consistent | None |
| Form Labels | `htmlFor`/`id` association | ✅ Verified in forms | None |
| aria-live Regions | Dynamic content announced | ⚠️ Exists but unaudited | **Needs audit** |
| Image Alt Text | All images have alt or role=presentation | ✅ Verified | None |
| Color Contrast | AA compliance verified | ⚠️ Manual only | **No automation** |
| Keyboard Navigation | All interactive elements reachable | ⚠️ Not fully tested | **Needs test matrix** |
| WCAG 2.1 AA Audit | Performed before releases | ❌ Not automated | **Blocker for claim** |

---

## Recommendations

### Immediate (Blockers for WCAG 2.1 AA Claim)
1. **Add axe-core to CI**: `npm install -D @axe-core/playwright` and integrate into Playwright tests
2. **Add heading hierarchy check**: Custom Vitest test or `eslint-plugin-jsx-a11y/heading-has-content`
3. **Create AT test matrix**: Document specific test cases for NVDA, JAWS, VoiceOver, TalkBack

### Short-term
4. **Automate contrast checking**: Add color contrast validation to design token build
5. **Audit focus traps**: Verify all modals/drawers use `useFocusTrap`
6. **Audit aria-live**: Review all async flows for announcements

### Long-term
7. **Accessibility regression testing**: Add to release checklist
8. **Automated PR checks**: GitHub Action for accessibility on every PR
9. **User testing**: Schedule sessions with actual screen reader users

---

## Code References

### Files Verified ✅
- `components/Layout.tsx` - Semantic landmarks, skip link target
- `components/SkipLink.tsx` - Skip to main content link
- `hooks/useFocusTrap.ts` - Focus trap hook
- `hooks/useAnnouncer.ts` - aria-live announcer
- `tailwind.config.ts` - Focus ring configuration
- Global CSS - `:focus-visible` styles
- MUI component overrides - Consistent focus styles

### Files Missing ❌
- `package.json` - No `axe-core` or `@axe-core/playwright`
- `.github/workflows/` - No accessibility CI step
- `tests/accessibility/` - No accessibility test suite
- `docs/accessibility-test-matrix.md` - No test matrix document