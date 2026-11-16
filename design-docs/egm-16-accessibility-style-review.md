# EGM-16 Accessibility Architecture — Style Review

**Document**: `design-docs/egm-16-accessibility.md`  
**Review Date**: 2026-11-13  
**Reviewer**: EGM Style Reviewer (subagent)  
**Codebase Root**: `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site`  

---

## Executive Summary

The document presents an **aspirational accessibility target as if it were already implemented**. While the codebase has a decent semantic foundation (landmarks, skip link, `:focus-visible`, widespread `aria-label`/`aria-expanded`), the doc makes **multiple factually incorrect claims** about automation, focus management, live regions, contrast ratios, file existence, and page/tool counts. It lacks a current-state vs. target gap analysis, acceptance criteria, ownership, and verification methods.

| Criterion | Score (1–5) | Summary |
|-----------|:-----------:|---------|
| 1. Clarity & Structure | 2 | Good formatting but presents target as reality; no gap analysis |
| 2. Completeness | 2 | Missing reduced motion, i18n a11y, chart a11y, severity matrix, verification methods |
| 3. Accuracy of Diagrams/Tables | 1 | Contrast table wrong (7:1 vs ~4.45:1); landmark table claims missing elements; page/tool counts wrong |
| 4. Actionability | 1 | No tasks, owners, sequencing, acceptance criteria, or tooling mapping |
| 5. Formatting | 4 | Clean tables, code blocks, headings — but no traceability links |
| 6. Terminology Consistency | 2 | Mixed WCAG versions, "focus indicator/ring/outline", no SC references |
| 7. Evidence-Based Claims | 1 | Multiple false claims (automation, files, focus trap, aria-live, contrast, counts) |
| 8. Missing Critical Sections | 1 | No gap analysis, no i18n a11y, no chart a11y, no risk/severity, no AT matrix |
| 9. Overall Usability | 2 | Useful as a *target* spec; misleading as a *current-state* doc |

**Overall**: 1.7 / 5 — **Needs major revision before use as implementation reference**

---

## Findings Table

| ID | Severity | Category | Location | Evidence |
|----|:--------:|----------|----------|----------|
| F-01 | Critical | Evidence | §Testing: Automated | Claims "axe-core in CI (zero violations required)", "jest-axe in unit tests", "ESLint plugin: jsx-a11y". **None exist** in `package.json`; no a11y CI workflow (only `blog-autopost.yml`); no vitest a11y tests |
| F-02 | Critical | Evidence | §Focus Management (lines 57–71) | Presents a `useEffect` focus-trap snippet as current mobile menu implementation. **No focus trap exists** anywhere — zero `keydown` handlers for `Tab` or `Escape` across all `.tsx` files; Layout has body scroll lock only |
| F-03 | Critical | Evidence | §Screen Reader Support → Live Regions | Claims `aria-live="polite/assertive"` for tool progress, form errors, chat. **Zero `aria-live` occurrences** in codebase |
| F-04 | Critical | Evidence | §Color & Contrast table | Claims "Normal text | 4.5:1 | 7:1 (green on cream)". **Computed contrast of #0d8770 on #fefefe ≈ 4.45:1** — marginally **fails** AA 4.5:1. No measurement source cited |
| F-05 | Critical | Evidence | Context files list / §Implementation | References `SkipLink.tsx`, `useFocusTrap.ts`, `useAnnouncer.ts` as existing files. **None exist** |
| F-06 | Major | Accuracy | §Overview / §Compliance Target | "14 pages and 5 tools". **Actual**: 12 page components / 13 routes; 7 tools in `components/tools/` |
| F-07 | Major | Accuracy | §Component-Specific → Tool Components | Claims `<progress>`, `role="radiogroup"` used. **Not found** in any tool component |
| F-08 | Major | Accuracy | §Landmark Regions table | Claims `role="search"` on Blog/Insurance and `<aside>` for complementary. **Neither found** |
| F-09 | Major | Accuracy | §Mobile → Touch Targets | "Minimum: 48x48px (all interactive elements)". **Actual**: hamburger `min-h-[44px]` (Layout:289), lang toggle `min-h-[40px]` (Layout:280), DietChartTool buttons `min-h-[40px]` (lines 1016, 1052) |
| F-10 | Major | Structure | Entire doc | No current-state vs. target gap analysis. Presents aspirational items (automation, focus trap, live regions, heading enforcement) as implemented fact |
| F-11 | Minor | Accuracy | §Semantic HTML Foundation (lines 16–30) | Code sample uses explicit `role="banner/main/contentinfo"`; actual Layout uses implicit semantics (correct) but sample misrepresents codebase |
| F-12 | Minor | Completeness | §Screen Reader Support | `prefers-reduced-motion` implemented in `index.css:312–322` — **not documented** |
| F-13 | Minor | Completeness | §Screen Reader Support | Trilingual site (en/hi/gu) with dynamic language switching — **no mention** of `lang` attribute updates, localized `aria-label`s, or RTL considerations |
| F-14 | Minor | Accuracy | §Heading Hierarchy | "h1: exactly one per page" — **no automated enforcement** (no lint/test), unverified claim |
| F-15 | Minor | Formatting | Code samples | Not tied to real file paths/line numbers; no traceability |
| F-16 | Minor | Actionability | §Testing Protocol → Checklist | Checklist items lack owners, timelines, tooling mapping, acceptance criteria |
| F-17 | Minor | Terminology | Throughout | Mixed "WCAG 2.1 AA" / "WCAG AA"; "focus indicator" / "focus ring" / "focus outline"; "screen reader" / "AT"; no consistent WCAG SC references (e.g., 2.4.7, 1.4.3, 2.5.5) |
| F-18 | Minor | Evidence | §AI Chat | Claims `role="log"` with `aria-live="polite"`. **No `role="log"`** found; ChatBot has no live region |
| F-19 | Nit | Accuracy | §Implementation Strategy | References `tailwind.config.ts` — actual file is `tailwind.config.js`; no focus-ring config in it |
| F-20 | Nit | Accuracy | Context | Skip link is **inline in Layout.tsx:181–186**, not a separate `SkipLink.tsx` component |
| F-21 | Nit | Consistency | §Mobile | Design token `minHeight.touch: 48px` defined in Tailwind but not used on hamburger/lang toggle |
| F-22 | Nit | Evidence | §Color Independence | "Charts: patterns + colors (dosha radar chart)" — `AnalyticsDashboard.tsx` uses Recharts RadarChart; **no pattern fallback / table alternative implemented** |

---

## Line-Specific Issues with Evidence

| Doc Line | Issue | Codebase Evidence |
|----------|-------|-------------------|
| 9–10 | False automation claims | `package.json`: no `axe-core`, `jest-axe`, `jsx-a11y`, `eslint`; `.github/workflows/`: only `blog-autopost.yml` |
| 16–30 | Sample ≠ reality | Layout uses `<header>`, `<main id="main-content">`, `<footer>` without explicit roles — correct implicit semantics |
| 37 | "Never skip levels" rule | No `heading-hierarchy` lint rule; no test verifying this |
| 40–48 | Landmark table inaccuracies | No `<aside>`; no `role="search"`; desktop `<nav>` lacks `aria-label` (Layout:212) |
| 57–71 | Fictional focus trap code | Grep for `keydown.*Tab\|keydown.*Escape` → 0 matches; Layout has scroll lock only |
| 78–89 | Fictional live regions | Grep for `aria-live` → 0 matches |
| 94–99 | Contrast table wrong | `#0d8770` on `#fefefe` → L≈0.186 → contrast ≈ 4.45:1 (fails 4.5:1 AA); no tool output cited |
| 101–105 | Color independence claims | Radar chart in `AnalyticsDashboard.tsx` uses Recharts — no pattern fill / table alt visible |
| 174–178 | AI Chat claims | ChatBot: no `role="log"`, no `aria-live`, no streaming announcements |
| 187–189 | Automation checklist | No tooling exists to satisfy any checkbox |
| 191–195 | Manual test protocol | No AT version matrix, no browser/device matrix, no test scripts |

---

## Actionable Recommendations by Priority

### P0 — Must Fix Before Document Is Usable
1. **Add Current-State vs. Target Gap Analysis** — Create a two-column table per section: *Implemented* (with file:line refs) vs. *Planned* (with task ID, owner, acceptance criteria).
2. **Correct All False Claims** — Remove or mark aspirational: focus trap, live regions, axe-core CI, jest-axe, jsx-a11y, heading enforcement, progress/radiogroup usage, search/aside landmarks, 7:1 contrast.
3. **Measure & Cite Contrast** — Run `axe-core` or color-contrast tool; replace "7:1" with measured values + tool/date.
4. **Fix Page/Tool Counts** — 13 routes (12 unique page components), 7 tools (`DietChart`, `Lifestyle`, `Meda`, `Panchakarma`, `Prakriti`, `Saara`, plus one — verify).

### P1 — High Impact, Next Sprint
5. **Add WCAG SC References** — Every section must cite Success Criteria (e.g., 2.4.1 Bypass Blocks, 2.4.7 Focus Visible, 1.4.3 Contrast, 2.5.5 Target Size, 3.2.2 On Input, 3.3.2 Labels).
6. **Document Implemented Features** — `prefers-reduced-motion` (CSS), skip link (Layout:181), `:focus-visible` (CSS:306,562), `aria-label/expanded/current` (widespread), language switching (LanguageContext), safe-area insets (Tailwind).
7. **Add i18n Accessibility Section** — Dynamic `lang` attribute, localized `aria-label`s, RTL readiness, screen reader language detection.
8. **Add Chart Accessibility Section** — Recharts RadarChart: table alternative, pattern fills, text descriptions.

### P2 — Structural Improvements
9. **Convert Checklist to Trackable Tasks** — Each item: Task ID, Owner, Tool/Command, Acceptance Criteria, Status, Blocker.
10. **Add AT Test Matrix** — NVDA 2024.x / Chrome, VoiceOver macOS 15 / Safari, VoiceOver iOS 18 / Safari, TalkBack / Chrome — with test cases per page.
11. **Add Traceability** — Link every code sample to real file:line (e.g., `Layout.tsx:181-186`, `index.css:306-309`).
12. **Standardize Terminology** — Pick "focus indicator" (WCAG term), "WCAG 2.1 Level AA", "assistive technology (AT)". Add glossary.

### P3 — Polish
13. **Fix File References** — `tailwind.config.js` not `.ts`; no `SkipLink.tsx`, `useFocusTrap.ts`, `useAnnouncer.ts`.
14. **Align Touch Targets** — Either update claim to "44px minimum (WCAG 2.5.5 AAA / 2.5.8 AA 24px)" or refactor components to use `min-h-touch` (48px) token.
15. **Add "Verification Method" Column** to all tables — how is each claim validated (tool, manual step, test ID)?

---

## Suggested Revised Structure

```markdown
# EGM-16: Accessibility Architecture

## 1. Compliance Target & Scope
- Standard: WCAG 2.1 Level AA (cite SC per section)
- Scope: 13 routes (12 page components), 7 tools, 3 languages
- Current audit date / next audit due

## 2. Current-State Summary (Evidence-Backed)
| Area | Status | Evidence (file:line) | Gaps |
|------|--------|---------------------|------|
| Semantic landmarks | ✅ | Layout.tsx:189,412,423 | desktop nav needs aria-label |
| Skip link | ✅ | Layout.tsx:181-186 | — |
| Focus visible | ✅ | index.css:306,562-568 | ring color could use design token |
| ARIA labels/states | ✅ | Layout, ChatBot, tools... | not localized |
| Reduced motion | ✅ | index.css:312-322 | — |
| Touch targets | ⚠️ | min-h-[44px]/[40px] | 3 elements < 48px token |
| Contrast (text) | ❌ | #0d8770 on #fefefe ≈4.45:1 | fails 4.5:1 AA |
| Focus trap | ❌ | — | mobile menu, dialogs |
| Live regions | ❌ | — | tool progress, form errors, chat |
| Heading enforcement | ❌ | — | no lint/test |
| Automated testing | ❌ | package.json, CI | axe-core, jest-axe, jsx-a11y missing |
| Chart alternatives | ❌ | AnalyticsDashboard.tsx | no table/pattern fallback |
| i18n a11y | ❌ | LanguageContext.tsx | lang attr, localized labels |

## 3. Target Architecture (Aspirational)
... [current doc content, marked as target, with task IDs]

## 4. Implementation Roadmap
| Task ID | Area | Description | Owner | Tool/Command | Acceptance Criteria | Status |
|---------|------|-------------|-------|--------------|---------------------|--------|
| A11Y-01 | Automation | Add axe-core + jest-axe + jsx-a11y | | `npm i -D axe-core jest-axe eslint-plugin-jsx-a11y` | CI fails on violations | 📋 |
| A11Y-02 | Focus Trap | Implement useFocusTrap hook | | new hook + integrate in Layout/ChatBot | Tab cycles, Escape closes | 📋 |
| A11Y-03 | Live Regions | Add useAnnouncer hook | | new hook + integrate in tools/forms/chat | NVDA announces changes | 📋 |
| A11Y-04 | Contrast | Fix green-on-cream or adjust palette | | color audit + design review | All text ≥4.5:1 | 📋 |
| ... | ... | ... | ... | ... | ... | ... |

## 5. Verification Protocol
- Automated: `npm run test:a11y` (axe-core, jest-axe), `npm run lint:a11y` (jsx-a11y)
- Manual: AT matrix (table with versions, test cases per page)
- Contrast: tool + measurement log
- Release gate: all automated pass + manual spot-check

## 6. Appendix
- Glossary / Terminology
- WCAG SC cross-reference table
- AT test matrix template
- Color contrast measurement log
```

---

## Conclusion

The document is **well-formatted but factually unreliable as a current-state reference**. It reads as a **target specification** masquerading as an implementation document. The codebase has a **solid semantic foundation** (landmarks, skip link, focus styles, ARIA labels) but **lacks the automation, focus management, live regions, and contrast compliance** the doc asserts.

**Recommended path**: Restructure as a **gap-analysis-driven spec** with a two-column current/target table, traceable task list, and measurable verification. Keep the good sections (form patterns, component guidelines) but mark clearly as *target patterns* with implementation tasks. Remove all false claims. Add the missing critical sections (i18n a11y, chart a11y, reduced motion, AT matrix).

Once revised, this could serve as the accessibility source of truth for the project. In current form, it risks misleading implementers and auditors.

---

**Verification of Output Write**:  
```bash
Test-Path "F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site\design-docs\egm-16-accessibility-style-review.md"
```