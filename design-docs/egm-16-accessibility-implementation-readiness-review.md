# EGM-16 Accessibility Implementation Readiness Review

**Date:** 2026-11-13  
**Reviewer:** EGM Implementation Readiness Reviewer (subagent)  
**Design Document:** `design-docs/egm-16-accessibility.md` (204 lines)  
**Codebase Root:** `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site`  
**Prior Review (Reference):** `design-docs/egm-16-accessibility-codebase-details-review.md` (115 lines) — **contains false file claims** (see Critical Finding C1 below)

---

## Executive Summary & Implementability Score

| Metric | Score (1–10) | Notes |
|--------|-------------|-------|
| **Requirements Clarity** | 6 | Design doc covers WCAG 2.1 AA comprehensively but misrepresents current state as already implemented ("implements", "uses", "announces") — aspirational language conflates spec with reality |
| **Architecture Alignment** | 7 | Solid semantic HTML foundation exists (Layout, skip link, landmarks); mobile-first responsive patterns align well with design goals |
| **Component Spec Completeness** | 4 | Component-specific guidance is detailed but several specs reference non-existent hooks (`useFocusTrap`, `useAnnouncer`) and non-existent component files (`SkipLink.tsx`) |
| **Data Flow Definition** | 3 | No data flow for announcements, focus management, or live-region updates; `aria-live` usage is entirely absent in codebase |
| **Integration Points** | 5 | Integrations with routing (react-router), analytics, and AI chat identified but no accessibility-specific contracts defined |
| **Dependencies Identified** | 2 | Design doc lists axe-core, jest-axe, jsx-a11y as if present — **none are installed**; no migration path or version pins provided |
| **Edge Cases Covered** | 4 | Reduced-motion, touch targets, zoom, and orientation addressed in CSS but keyboard trap on mobile menu, Escape handling, and overlay focus management are missing |
| **Testing Strategy** | 2 | Protocol lists axe-core CI, jest-axe, jsx-a11y, NVDA/VoiceOver manual testing — **zero automation exists**, no CI runs any tests, no test files for accessibility |
| **Performance Budget** | 5 | No performance budgets mentioned; CSS animations respect reduced-motion but no budget for focus-trap overhead or live-region updates |
| **Migration/Compatibility** | 3 | No migration plan for adding missing hooks/components; no backwards-compatibility discussion for existing components lacking ARIA |

**Overall Implementability Score: 4.1 / 10** → **NEEDS WORK**

**Verdict:** The design document is a **thorough specification** but **not an accurate reflection of the codebase**. It describes hooks, components, and automation that do not exist, claims contrast ratios that are mathematically incorrect, and prescribes a testing pipeline that is absent. The codebase has a **strong accessibility foundation** (semantic structure, skip link, focus-visible, reduced-motion, 48px touch targets in CSS, `aria-expanded`/`aria-current` on bottom nav) but **critical interactive components** (mobile menu, language dropdown, ChatBot, CookieConsent, ExitIntentPopup, DateTimePicker) **lack focus traps, Escape handling, live regions, and proper ARIA roles**. The prior review's "7/10" score relied on **false file claims** that must be corrected.

---

## Findings Table

| ID | Severity | Area | Summary | Evidence |
|----|----------|------|---------|----------|
| **C1** | **Critical** | Documentation Integrity | Prior review & design doc reference **non-existent files**: `components/SkipLink.tsx`, `hooks/useFocusTrap.ts`, `hooks/useAnnouncer.ts`, `tailwind.config.ts`, MUI components. Glob confirms **NONE exist**. Skip link is inline in `Layout.tsx:181-186`; tailwind config is `.js`. | `glob` on `components/**/SkipLink.tsx` → no match; `hooks/` listing has no `useFocusTrap`/`useAnnouncer`; `tailwind.config.js` exists (not `.ts`) |
| **C2** | **Critical** | Keyboard Trap | Mobile menu overlay (`Layout.tsx:300-309`) **always rendered** with `opacity-0 pointer-events-none` when closed → keyboard users tab through hidden links. **No focus trap**, **no Escape key handler** to close menu. | `Layout.tsx` lines 300-309, 316-343; no `keydown` listener for Escape; no `inert` or focus-loop logic |
| **C3** | **Critical** | CookieConsent Keyboard Accessibility | Toggle switches are `<div onClick>` **without** `role="switch"`, `aria-checked`, `tabIndex`, or keyboard handlers → **completely inoperable by keyboard**. No Escape close, no focus trap, no `role="dialog"`. Imported `X` icon **unused** (no close button rendered). | `CookieConsent.tsx` lines 111-156 (div toggles), 58-59 (no dialog role), 7 (unused `X` import) |
| **C4** | **Critical** | Overlay ARIA Roles | **Zero** `role="dialog"` / `role="alertdialog"` / `aria-modal="true"` on **any** overlay: ChatBot, CookieConsent, ExitIntentPopup, DateTimePicker, mobile menu. Screen readers cannot identify modal contexts. | Grep `role="dialog"\|aria-modal` → **0 matches** across `components/`, `pages/`, `hooks/` |
| **C5** | **Critical** | Live Regions | **Zero** `aria-live` anywhere in codebase. Design doc claims live regions for tool progress, form errors, chat messages — **none implemented**. | Grep `aria-live` → **0 matches** |
| **C6** | **Critical** | Form Error Accessibility | Booking form (`Booking.tsx`) has **no `aria-invalid`**, **no `aria-describedby`** linking errors to inputs, **no `aria-live="assertive"`** error announcements. Most labels lack `htmlFor` (only "concern" and "date" have it). | `Booking.tsx` lines 211-218 (name label no `htmlFor`), 224-230 (phone label no `htmlFor`), 242-252 (email label no `htmlFor`); grep `aria-invalid\|aria-describedby` in pages → 0 |
| **C7** | **Critical** | Testing Automation Absent | Design doc mandates "axe-core in CI (zero violations)", "jest-axe in unit tests", "ESLint plugin jsx-a11y" — **none in `package.json`**; only CI workflow is blog autopost (no tests). Tests setup suppresses `console.warn/error` → hides React a11y warnings. | `package.json` devDependencies: no axe-core, jest-axe, eslint-plugin-jsx-a11y, playwright; `.github/workflows/` only `blog-autopost.yml`; `tests/setup.ts` lines 102-105 |
| **W1** | **Warning** | Contrast Ratio Claim Incorrect | Design doc claims "green on cream = 7:1" — computed contrast of `#0d8770` (ayur.green.DEFAULT) on `#fefefe` (ayur.cream) ≈ **4.5:1** (fails AA for normal text; passes AA large text only). Placeholder text `text-gray-400` on `bg-gray-50` ≈ 2.5:1 (fails AA). No automated contrast validation exists. | `tailwind.config.js` lines 21-22, 32; WCAG contrast math |
| **W2** | **Warning** | Touch Targets Below Spec | Design doc mandates 48×48px minimum. `DateTimePicker` uses `min-h-[44px] min-w-[44px]` (lines 114, 119, 143) — **44px < 48px**. ChatBot FAB 48px OK; MobileBottomNav 48px OK. | `DateTimePicker.tsx` lines 74-78, 106-123, 138-152 |
| **W3** | **Warning** | Language Dropdown Accessibility | Desktop language selector (`Layout.tsx:248-265`) lacks `aria-expanded`, `aria-haspopup="listbox"`, keyboard navigation (ArrowDown/Escape), and focus management. Mobile toggle (`Layout.tsx:278-284`) same issues. | `Layout.tsx` lines 248-284 |
| **W4** | **Warning** | Desktop Nav Missing `aria-current` | Desktop nav links (`Layout.tsx:223-245`) indicate active state via `className` only — **no `aria-current="page"`**. MobileBottomNav correctly uses `aria-current` (line 81). | `Layout.tsx` lines 223-245 vs `MobileBottomNav.tsx` line 81 |
| **W5** | **Warning** | ChatBot Missing ARIA & Escape | Chat window (`ChatBot.tsx:245-252`) has no `role="dialog"` / `aria-modal`, no `aria-live="polite"` on messages, no Escape to close, no focus trap when open. Debug button (line 269-279) lacks `aria-label`. Input Enter handling OK. | `ChatBot.tsx` lines 230-265, 287-300, 302-334 |
| **W6** | **Warning** | ExitIntentPopup Gaps | Email input (`ExitIntentPopup.tsx:118-124`) has **no label / `aria-label`**; no `role="dialog"`, no Escape, no focus trap, no `aria-modal`. Close button has `aria-label` (good). | `ExitIntentPopup.tsx` lines 58-67, 117-131 |
| **W7** | **Warning** | Reduced-Motion JS Only in reactbits | `prefers-reduced-motion` check exists **only** in `components/ui/reactbits/` (4 components). Global CSS media query in `index.css:312-322` handles CSS animations but JS-driven animations (e.g., `framer-motion` not used; custom `useIntersectionObserver` animations) lack guards. | Grep `prefers-reduced-motion` → 4 matches in `ui/reactbits/` only |
| **W8** | **Warning** | No ESLint Config Found | `eslint-plugin-jsx-a11y` cannot run without ESLint config. `glob eslint.config.*` → **no files**. (May use legacy `.eslintrc*` not checked; if so, plugin still not in devDeps.) | `glob` for `eslint.config.*` → 0; `package.json` no eslint devDeps |
| **S1** | **Suggestion** | Missing SkipLink Component | Inline skip link works but is not reusable. Extract to `components/SkipLink.tsx` per design doc pattern for consistency and testing. | `Layout.tsx:181-186` |
| **S2** | **Suggestion** | Add `useFocusTrap` & `useAnnouncer` Hooks | Design doc references these — implement as shared hooks (`hooks/useFocusTrap.ts`, `hooks/useAnnouncer.ts`) to enable focus management and live-region announcements across overlays. | Design doc §5, §7; hooks/ directory missing both |
| **S3** | **Suggestion** | Add `role="search"` to Blog/Insurance Search | Design doc claims `<form role="search">` on Blog/Insurance — Blog has article tags (line 325) but no search form found; Insurance not checked. Verify and add if missing. | Design doc §3 table; `Blog.tsx` grep `role="search"` → 0 |
| **S4** | **Suggestion** | Contrast Audit & Automation | Add `axe-core` + `jest-axe` + `eslint-plugin-jsx-a11y` to devDeps; add CI job running `npm test` (vitest) + axe; add `npm run lint:a11y` script. Document actual measured ratios. | `package.json` scripts: only `test: vitest run`; no lint script |
| **S5** | **Suggestion** | Document Manual Test Matrix | Create `docs/accessibility-test-matrix.md` with NVDA/VoiceOver test cases per component, zoom levels, color-blind sim, keyboard flows — per design doc §10 checklist. | Design doc lines 191-204 checklist unimplemented |

---

## Detailed Findings with Code References

### C1 — False File Claims in Prior Review & Design Doc
**Files claimed verified but DO NOT EXIST:**
- `components/SkipLink.tsx` → skip link is inline in `Layout.tsx:181-186` (Tailwind classes `skip-link sr-only focus:not-sr-only...`)
- `hooks/useFocusTrap.ts` → `hooks/` contains only: `index.ts`, `useABTest.ts`, `useExitIntent.ts`, `useIntersectionObserver.ts`, `useMobileDevice.ts`, `usePersonalization.ts`, `useRecommendations.ts`, `useScrollProgress.ts`
- `hooks/useAnnouncer.ts` → same
- `tailwind.config.ts` → actual file is `tailwind.config.js` (155 lines, read fully)
- MUI components → codebase uses Tailwind + custom components + `lucide-react`, **no MUI**

**Impact:** Prior review's "7/10" score and "verified ✅" claims are based on hallucinated files. Design doc §5 focus-management example uses `useFocusTrap` hook that doesn't exist.

### C2 — Mobile Menu Keyboard Trap
**File:** `components/Layout.tsx` lines 300-309, 316-343
```tsx
// Overlay ALWAYS rendered, just hidden via opacity/pointer-events
<div className={`lg:hidden fixed inset-0 z-40 bg-ayur-cream transition-all duration-300 ease-out flex flex-col ${isMenuOpen
  ? 'opacity-100 pointer-events-auto'
  : 'opacity-0 pointer-events-none'}`} ...>
```
- When `isMenuOpen=false`, links inside remain in DOM and **tabbable** (opacity/pointer-events don't remove from tab order).
- **No focus trap** (`useEffect` with keydown listener cycling focus) — design doc §5 example code is a template with `...` placeholder, not real implementation.
- **No Escape key handler** to close menu.

### C3 — CookieConsent Toggle Switches Not Keyboard Operable
**File:** `components/CookieConsent.tsx` lines 111-156
```tsx
<div className="flex items-center justify-between p-3 border ... cursor-pointer"
  onClick={() => handleToggle('analytics')}>
  ...
  <div className={`w-10 h-6 rounded-full flex items-center ... ${consent.analytics ? 'bg-[#0F3D3E] justify-end' : 'bg-gray-300 justify-start' }`}>
    <div className="w-4 h-4 bg-white rounded-full shadow" />
  </div>
</div>
```
- `<div>` with `onClick` — **no `role="switch"`**, **no `aria-checked`**, **no `tabIndex="0"`**, **no `onKeyDown`** for Space/Enter.
- Keyboard users **cannot toggle** any preference.
- No close button rendered (imported `X` unused), no Escape, no focus trap, no `role="dialog"`.

### C4 — Zero Overlay ARIA Roles
**Grep result:** `role="dialog"|aria-modal` → **0 matches** across all `.tsx` in `components/`, `pages/`, `hooks/`.
- ChatBot, CookieConsent, ExitIntentPopup, DateTimePicker, mobile menu — none declare modal role.
- Screen readers cannot distinguish overlay from page content.

### C5 — Zero Live Regions
**Grep result:** `aria-live` → **0 matches**.
- Design doc §7 claims: "Tool progress: `aria-live="polite"` announces step changes", "Form errors: `aria-live="assertive"` announces validation errors", "Chat messages: `aria-live="polite"` announces new AI responses".
- **None implemented** in any component.

### C6 — Booking Form Accessibility Gaps
**File:** `pages/Booking.tsx` lines 202-280
- Labels for `name`, `phone`, `email` **lack `htmlFor`** (only `concern` line 259 and `date` line 283 have it).
- Clicking label does **not focus** input; screen readers may not associate.
- No `aria-invalid`, no `aria-describedby`, no error message containers, no `aria-live="assertive"`.
- `inputMode`, `pattern`, `autoComplete` present (good HTML5 validation) but no accessible error reporting.

### C7 — Testing Automation Completely Absent
- `package.json` devDependencies: **no** `axe-core`, `jest-axe`, `@axe-core/react`, `eslint-plugin-jsx-a11y`, `playwright`, `@playwright/test`.
- `vitest` only; `tests/` has 5 test files — **none** test accessibility.
- `.github/workflows/` only `blog-autopost.yml` — runs `npm ci` + custom script, **no test step**.
- `tests/setup.ts:102-105` suppresses `console.warn/error` → React's development-mode a11y warnings (missing `htmlFor`, invalid ARIA) **silenced in tests**.

### W1 — Contrast Ratio Math Error
**Design doc line 96:** "Normal text: Minimum 4.5:1, Actual 7:1 (green on cream)"
- `ayur.green.DEFAULT = #0d8770`, `ayur.cream = #fefefe`
- Relative luminance: `#0d8770` ≈ 0.183, `#fefefe` ≈ 0.996
- Contrast = (0.996 + 0.05) / (0.183 + 0.05) ≈ **4.5:1** — **meets AA large text only, fails AA normal text**.
- `text-gray-400` (`#9ca3af`) on `bg-gray-50` (`#f9fafb`) ≈ **2.5:1** — **fails AA**.
- No automated contrast check in CI.

### W2 — DateTimePicker Touch Targets 44px < 48px Spec
**File:** `components/DateTimePicker.tsx`
- Day buttons: `min-h-[44px] min-w-[44px]` (line 114)
- Prev/Next month: `min-w-[44px] min-h-[44px]` (lines 74-78)
- Time slots: `min-h-[44px]` (line 143)
- Design doc §9 mandates 48×48px minimum.

### W3 — Language Dropdown Missing ARIA & Keyboard
**File:** `components/Layout.tsx` lines 248-265 (desktop), 278-284 (mobile)
- Button lacks `aria-expanded`, `aria-haspopup="listbox"`/`menu`
- Dropdown `<div>` lacks `role="listbox"`/`menu`, options lack `role="option"`
- No keyboard: ArrowDown to open, ArrowUp/Down to navigate, Enter/Space to select, Escape to close
- Mobile toggle (line 278-284) same issues.

### W4 — Desktop Nav Missing `aria-current`
**File:** `components/Layout.tsx` lines 223-245
- Active state: `className` with `border-b-2 border-ayur-gold` only
- `MobileBottomNav.tsx:81` correctly uses `aria-current={active ? 'page' : undefined}` — inconsistency.

### W5 — ChatBot Missing Dialog Role, Live Region, Escape
**File:** `components/ChatBot.tsx`
- Chat window (lines 245-252): no `role="dialog"`, `aria-modal`, `aria-labelledby`
- Messages container (lines 302-334): no `aria-live="polite"`, no `role="log"`
- No Escape key handler to close
- No focus trap when open
- Debug button (lines 269-279): no `aria-label`
- FAB (lines 233-242): has `aria-label="Toggle Chat"` ✅

### W6 — ExitIntentPopup Gaps
**File:** `components/ExitIntentPopup.tsx`
- Email input (lines 118-124): **no `<label>`, no `aria-label`, no `aria-describedby`**
- Overlay (line 58): no `role="dialog"`, `aria-modal`
- No Escape handler, no focus trap
- Close button (lines 61-67): has `aria-label="Close popup"` ✅

### W7 — Reduced-Motion Only in reactbits
- `components/ui/reactbits/` (4 files) check `matchMedia('(prefers-reduced-motion: reduce)')`
- Global CSS `index.css:312-322` has `@media (prefers-reduced-motion: reduce)` for CSS animations
- No JS guard on intersection-observer-driven animations (`useIntersectionObserver` in Booking, etc.)

### W8 — No ESLint Config for jsx-a11y
- `glob eslint.config.*` → no files
- `package.json` no eslint packages
- Even if legacy `.eslintrc.*` exists, `eslint-plugin-jsx-a11y` not in devDeps → cannot run.

---

## Gap Analysis Table

| Design Doc Requirement | Codebase Status | Gap Severity | Effort to Close |
|------------------------|-----------------|--------------|-----------------|
| SkipLink component | Inline in Layout only | Medium | Low (extract) |
| `useFocusTrap` hook | **Missing** | Critical | Medium |
| `useAnnouncer` hook | **Missing** | Critical | Medium |
| Mobile menu focus trap | **Missing** (overlay always in tab order) | Critical | Medium |
| Mobile menu Escape close | **Missing** | Critical | Low |
| Language dropdown ARIA/keyboard | **Missing** | High | Medium |
| Desktop nav `aria-current` | Missing (className only) | Low | Low |
| Overlay `role="dialog"`, `aria-modal` | **Zero instances** | Critical | Low (add attributes) |
| `aria-live` regions | **Zero instances** | Critical | Medium (hook + components) |
| Form `aria-invalid`, `aria-describedby` | Missing on Booking form | Critical | Medium |
| Form error `aria-live="assertive"` | Missing | Critical | Medium |
| ChatBot `aria-live`, dialog role, Escape | Missing | High | Medium |
| CookieConsent keyboard toggles | **Div onClick only** — inoperable | Critical | Medium (rebuild as switches) |
| CookieConsent dialog role, Escape | Missing | High | Low |
| ExitIntentPopup dialog role, label, Escape | Partial (close btn has aria-label) | High | Low |
| DateTimePicker 48px touch targets | 44px used | Medium | Low (change to 48) |
| Contrast ratios meet claimed values | **Claim false** (4.5:1 ≠ 7:1) | High | High (redesign palette or update claim) |
| axe-core CI | Not installed, no CI test job | Critical | High (add deps, CI, config) |
| jest-axe unit tests | Not installed, no a11y tests | Critical | High |
| jsx-a11y ESLint | Not installed, no ESLint config | Critical | High |
| Manual AT test matrix (NVDA/VoiceOver) | Not documented | Medium | Low (create doc) |
| Reduced-motion JS guards | Only in 4 reactbits components | Medium | Medium |
| `prefers-reduced-motion` CSS | Present in index.css ✅ | — | — |
| Touch target 48px CSS utility | `.touch-target` 48px in index.css ✅ | — | — |
| Focus-visible outline | `index.css:306-309`, `561-568` ✅ | — | — |
| Skip link CSS | `index.css:759-772` ✅ | — | — |
| `sr-only` utility | `index.css:787-797` ✅ | — | — |
| `aria-expanded` on mobile menu | `Layout.tsx:291` ✅ | — | — |
| `aria-expanded` on FAQ | `FAQ.tsx:135` ✅ | — | — |
| `aria-current` on bottom nav | `MobileBottomNav.tsx:81` ✅ | — | — |
| `aria-label` on icon buttons | ChatBot FAB, DateTimePicker, ExitIntentPopup close ✅ | — | — |
| Semantic HTML (article, nav, main) | Layout uses header/nav/main/footer; Blog has article ✅ | — | — |

---

## Prioritized Recommendations

### Phase 0 — Documentation Correction (Immediate)
1. **Retract false claims** in prior review (`design-docs/egm-16-accessibility-codebase-details-review.md`): remove "verified ✅" for `SkipLink.tsx`, `useFocusTrap.ts`, `useAnnouncer.ts`, `tailwind.config.ts`, MUI.
2. **Update design doc language**: change present-tense "implements", "uses", "announces" to future-tense "will implement", "must implement", "requires" — it is a **specification**, not a status report.
3. **Correct contrast table**: measured `#0d8770` on `#fefefe` = 4.5:1, not 7:1. Update or redesign palette.

### Phase 1 — Critical Accessibility Blockers (Week 1–2)
4. **Fix mobile menu keyboard trap** (`Layout.tsx`):
   - Option A: Conditionally render overlay (`{isMenuOpen && <div>...}`) instead of opacity toggle
   - Option B: Add `inert` attribute when closed + focus trap when open + Escape handler
   - Add `useFocusTrap` hook (new) and apply to mobile menu
5. **Rebuild CookieConsent toggles** as accessible switches:
   - `<button role="switch" aria-checked={...} tabIndex={0} onKeyDown={...}>`
   - Add `role="dialog" aria-modal="true" aria-labelledby="cookie-title"`
   - Add Escape close, focus trap, render close button (use imported `X`)
6. **Add dialog roles to all overlays**: ChatBot, ExitIntentPopup, DateTimePicker (if modal), CookieConsent
7. **Implement `useAnnouncer` hook** for `aria-live` regions:
   - `announce(message, 'polite'|'assertive')` → updates live region
   - Integrate into ChatBot (new messages), Booking form (errors), tools (progress)
8. **Fix Booking form labels & errors**: add `htmlFor` to all labels; add `aria-invalid` + `aria-describedby` + error container with `aria-live="assertive"`

### Phase 2 — Automation & Testing (Week 2–3)
9. **Install a11y tooling**:
   ```bash
   npm i -D axe-core @axe-core/react jest-axe eslint-plugin-jsx-a11y
   ```
10. **Add ESLint config** (`eslint.config.js` or `.eslintrc.cjs`) with `jsx-a11y` plugin
11. **Add CI workflow** (`.github/workflows/a11y.yml`):
    - `npm run lint` (includes jsx-a11y)
    - `npm test` (vitest + jest-axe)
    - Optional: Playwright + axe-core for E2E
12. **Remove console suppression** in `tests/setup.ts` or make it conditional so React a11y warnings surface in tests
13. **Write first jest-axe tests** for Layout, ChatBot, CookieConsent, Booking form

### Phase 3 — Remaining Gaps & Polish (Week 3–4)
14. **Language dropdown**: add `aria-expanded`, `aria-haspopup`, keyboard navigation, focus management
15. **Desktop nav**: add `aria-current="page"` to active link
16. **DateTimePicker**: change `44px` → `48px` touch targets (or use `min-h-touch min-w-touch` from Tailwind config)
17. **ChatBot**: add `role="dialog" aria-modal`, `aria-live="polite"` on messages, Escape close, focus trap
18. **ExitIntentPopup**: add `aria-label` to email input, `role="dialog" aria-modal`, Escape, focus trap
19. **Reduced-motion**: add `prefers-reduced-motion` guard to `useIntersectionObserver` animations
20. **Create manual test matrix** doc per design doc §10 checklist
21. **Extract SkipLink** to `components/SkipLink.tsx` for reusability/testing

---

## Verdict

**NEEDS WORK**

The design document is a **well-structured WCAG 2.1 AA specification** but **does not accurately describe the current codebase**. It claims implementation of hooks, components, live regions, testing automation, and contrast ratios that are **verifiably absent or incorrect**. The codebase has **excellent foundational CSS** (focus-visible, reduced-motion, skip link, touch targets, sr-only) and **partial ARIA** (`aria-expanded`, `aria-current` on bottom nav) but **critical interactive components are inaccessible by keyboard and screen reader** (CookieConsent toggles inoperable, mobile menu keyboard trap, zero dialog roles, zero live regions). 

**Do not begin implementation from this design doc as-is.** First: correct the document's false claims, add missing hook/component specs with real implementations, establish the testing pipeline, then execute Phase 1–3 above. With those corrections, the codebase's strong foundation makes WCAG 2.1 AA achievable in 3–4 weeks.

---

*Review completed 2026-11-13. All file paths and line numbers verified against `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site` at time of review.*