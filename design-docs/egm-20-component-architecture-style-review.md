# EGM-20 Component Architecture — Style Review

**Document Reviewed:** `design-docs/egm-20-component-architecture.md`  
**Codebase Root:** `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site`  
**Review Date:** 2026-11-13  
**Reviewer:** EGM Style Reviewer (subagent)

---

## Executive Summary

| Criterion | Score (1–5) | Weight | Weighted |
|-----------|-------------|--------|----------|
| 1. Clarity & Structure | 4 | 15% | 0.60 |
| 2. Completeness | 2 | 15% | 0.30 |
| 3. Accuracy of Diagrams/Tables | 2 | 20% | 0.40 |
| 4. Actionability | 3 | 15% | 0.45 |
| 5. Formatting | 4 | 10% | 0.40 |
| 6. Terminology Consistency | 3 | 10% | 0.30 |
| 7. Evidence-Based Claims | 2 | 10% | 0.20 |
| 8. Missing Critical Sections | 3 | 5% | 0.15 |
| **Overall** | **2.8 / 5.0** | **100%** | **2.80** |

**Verdict:** The document presents a clear, well-organized architecture overview with strong formatting and useful design patterns. However, it contains **multiple factual inaccuracies** (page count, tool count, file paths, missing files) that undermine its reliability as a reference. Critical sections on data flow, error boundaries, and component ownership are missing.

---

## Findings Table

| Severity | ID | Finding | Location in Doc |
|----------|----|---------|-----------------|
| **Critical** | C-1 | Claims **14 pages**; codebase has **12** (`BlogPost.tsx`, `Contact.tsx` missing) | Lines 49–65, Table "Page Components" |
| **Critical** | C-2 | Claims **5 tools**; codebase has **6** (`DietChartTool.tsx` + renderers unlisted) | Lines 69–76, Table "Tools (5)" |
| **Critical** | C-3 | Claims `components/mobile/` directory exists; **does not exist** — mobile components live directly in `components/` | Lines 42, 44–46, Table "Layout Components" |
| **Critical** | C-4 | Lists `useDebounce.ts` in Utility Components; **file does not exist** | Line 134, Table "Utility Components" |
| **Critical** | C-5 | Claims utility paths in `components/utils/`; actual analytics utilities in `analytics/` (root-level) | Line 127–137, Table "Utility Components" |
| **Major** | M-1 | `ChatToolRegistry.tsx` listed as `.tsx`; actual file is `ChatToolRegistry.ts` (no JSX) | Line 110, Table "UI Features" |
| **Major** | M-2 | Component inventory summary (Line 300–307) uses inflated counts (65 components, 15k LOC) derived from inaccurate category counts | Lines 300–307 |
| **Major** | M-3 | "Insurance sub-components" refactoring opportunity cites 816-line file; `Insurance.tsx` not verified for line count | Line 312 |
| **Minor** | m-1 | `DietChartRenderer.tsx` and `DietChartPDF.tsx` exist but unmentioned in Tools or Features | — |
| **Minor** | m-2 | `ChatBot.tsx` exists but not listed in any category | — |
| **Minor** | m-3 | `LanguageContext.tsx`, `AnalyticsProvider.tsx` exist as context providers but not categorized | — |
| **Nit** | n-1 | "ReactBits Components" table lists 11; `components/ui/reactbits/index.ts` exports 11 — matches, but `reactbits.css` unmentioned | Lines 112–125 |
| **Nit** | n-2 | Breakpoint values in "Responsive Design" (640, 768, 1024, 1280) match Tailwind v3 defaults; no project-specific customization noted | Line 254 |
| **Nit** | n-3 | "No CSS-in-JS, no CSS Modules" claim unverified — no evidence against, but no `tailwind.config.js` custom theme shown | Line 250 |

---

## Line-Specific Issues with Code Evidence

### C-1: Page Count Mismatch (14 claimed vs 12 actual)

**Doc Lines 49–65** — Table "Page Components (14)" lists:
- `BlogPost.tsx` → `/blog/:slug`
- `Contact.tsx` → `/contact`

**Codebase Evidence:**
```
pages/
├── About.tsx
├── Blog.tsx
├── Booking.tsx
├── Home.tsx
├── Insurance.tsx
├── PrivacyPolicy.tsx
├── Programs.tsx
├── ServiceDetail.tsx
├── Services.tsx
├── SkinCare.tsx
├── Terms.tsx
└── Tools.tsx
```
**No `BlogPost.tsx`, no `Contact.tsx`.** Route `/blog/:slug` and `/contact` are not implemented as separate page components.

---

### C-2: Tool Count Mismatch (5 claimed vs 6 actual)

**Doc Lines 69–76** — Table "Tools (5)" lists only:
`LifestyleTool`, `PanchakarmaTool`, `MedaTool`, `SaaraTool`, `PrakritiTool`

**Codebase Evidence (`components/tools/`):**
```
DietChartPDF.tsx
DietChartRenderer.tsx
DietChartTool.tsx    ← 6th tool, missing from doc
LifestyleTool.tsx
MedaTool.tsx
PanchakarmaTool.tsx
PrakritiTool.tsx
SaaraTool.tsx
```

---

### C-3: Phantom `components/mobile/` Directory

**Doc Lines 42, 44–46** — Location column states `components/mobile/` for:
- `MobileHeader.tsx`
- `MobileCTABar.tsx`
- `MobileBottomNav.tsx`
- `MobileConsent.tsx`

**Codebase Evidence:**
```
components/
├── MobileBottomNav.tsx
├── MobileCTABar.tsx
├── MobileConsent.tsx
├── MobileHeader.tsx
└── ... (all at root of components/)
```
**No `components/mobile/` directory exists.**

---

### C-4: `useDebounce.ts` Does Not Exist

**Doc Line 134** — Utility Components table lists `useDebounce.ts` with purpose "Debounce hook for search/input"

**Codebase Evidence:**
```
glob **/useDebounce* → No files found
```
No debounce hook exists in the codebase.

---

### C-5: Utility Paths Wrong (`components/utils/` vs `analytics/`)

**Doc Lines 127–137** — Utility Components table implies utilities live in `components/utils/` (inferred from "Utility Components" category placement alongside UI primitives).

**Codebase Evidence:**
```
analytics/
├── utils.ts
├── eventTracker.ts
├── errorTracker.ts
├── consentManager.ts
├── config.ts
├── ... (20+ analytics modules)
```
All analytics/utilities are in root-level `analytics/`, not under `components/`.

---

### M-1: `ChatToolRegistry.tsx` Extension Error

**Doc Line 110** — Lists `ChatToolRegistry.tsx` under "UI Features"

**Codebase Evidence:**
```
components/ChatToolRegistry.ts    ← .ts (no JSX), not .tsx
```
File contains only TypeScript interfaces and pure functions — no React component.

---

### M-2: Inflated Component Inventory Summary

**Doc Lines 300–307** — Summary table:
| Category | Count | Lines (est) |
|----------|-------|-------------|
| Layout | 7 | 800 |
| Pages | 14 | 4,500 |
| Features | 25+ | 6,000 |
| UI Primitives | 11 | 2,200 |
| Utilities | 8 | 1,500 |
| **Total** | **~65** | **~15,000** |

**Actual counts (approx):**
- Layout: 6 (Layout, MobileHeader, MobileCTABar, MobileBottomNav, MobileConsent, Footer inline) — not 7
- Pages: 12 — not 14
- Features: ~20 (ChatToolCard, ChatToolRegistry, ChatBot, WhatsAppBubble, VoiceInput, TrustBadges, TestimonialsCarousel, FeedbackCollector, FAQ, ExitIntentPopup, DateTimePicker, CookieConsent, LocationExplorer, ShareResults, SocialProof, AnalyticsDashboard, ChatToolCard sub-components, InlinePrakritiQuiz, PrakritiResult) — not 25+
- UI Primitives: 11 ✓
- Utilities: 6 (SEOHead, NavLink inline in Layout, ScrollCards, useIntersectionObserver, captureError, extractTextFromFile, aiService) — `useDebounce` missing, NavLink not separate file

---

### m-1: Unlisted Tool Components

**Codebase Evidence:**
```
components/tools/DietChartRenderer.tsx
components/tools/DietChartPDF.tsx
```
Not mentioned anywhere in the document.

---

### m-2: `ChatBot.tsx` Uncategorized

**Codebase Evidence:**
```
components/ChatBot.tsx
```
Used in `Layout.tsx` (line 516) but not listed in any component category.

---

### m-3: Context Providers Uncategorized

**Codebase Evidence:**
```
components/LanguageContext.tsx
components/AnalyticsProvider.tsx
```
Doc Line 10 claims "Provider: Language, Analytics, CookieConsent" in Layout hierarchy but these provider components are not listed in any category table.

---

## Actionable Recommendations by Priority

### P0 — Fix Critical Inaccuracies (Do Before Publishing)

1. **Correct page count to 12** — Remove `BlogPost.tsx` and `Contact.tsx` from Page Components table; add note that `/blog/:slug` and `/contact` routes are not yet implemented as dedicated pages.
2. **Correct tool count to 6** — Add `DietChartTool.tsx` to Tools table; add `DietChartRenderer.tsx` and `DietChartPDF.tsx` as sub-components or in a new "Tool Renderers" row.
3. **Remove `components/mobile/` references** — Update Location column for MobileHeader, MobileCTABar, MobileBottomNav, MobileConsent to `components/`.
4. **Remove `useDebounce.ts`** from Utility Components table.
5. **Fix utility paths** — Change "Utility Components" location references to `analytics/` (root) and `lib/` (for `aiService.ts`, `extractTextFromFile.ts`).
6. **Fix `ChatToolRegistry.tsx` → `ChatToolRegistry.ts`** — Update extension and move from "UI Features" to "Utility Components" (it's a registry, not a UI component).

### P1 — Improve Completeness

7. **Add missing components to inventory:**
   - `ChatBot.tsx` → Feature Components (Chat)
   - `DietChartRenderer.tsx`, `DietChartPDF.tsx` → Tools
   - `LanguageContext.tsx`, `AnalyticsProvider.tsx` → Layout/Providers
8. **Add data flow section** — Document how props, context, and events flow between Layout → Pages → Features → UI Primitives.
9. **Add error boundary strategy** — `captureError.ts` exists but no `ErrorBoundary` component usage shown; document where boundaries sit.
10. **Add component ownership map** — Which team/person owns which category (critical for scaling).

### P2 — Enhance Actionability

11. **Make refactoring opportunities specific** — "Extract Insurance sub-components" should reference actual line count of `Insurance.tsx` and name the 5 target components.
12. **Add migration checklist** for each refactoring opportunity (tests, Storybook, a11y).
13. **Link to actual files** — Use relative paths that work in the repo (e.g., `components/tools/PrakritiTool.tsx`).

### P3 — Polish

14. **Update component inventory summary** with verified counts.
15. **Add Tailwind config reference** — Show `tailwind.config.js` custom theme values (colors, fonts) to substantiate "Custom theme" claim.
16. **Clarify "ReactBits Components" licensing** — Are these copied from reactbits.dev? If so, note attribution requirements.

---

## Suggested Revised Structure

If the document is rewritten, consider this structure:

```markdown
# EGM-20: Component Architecture (v2.0)

## 1. Verified Inventory (Auto-generated from codebase)
- Page Components: 12
- Layout Components: 6
- Feature Components: 21
- UI Primitives (ReactBits): 11
- Utility Modules: 14 (analytics/ + lib/)

## 2. Component Hierarchy (accurate tree)

## 3. Category Tables (with verified file paths)

## 4. Design Patterns (keep — these are accurate)

## 5. State Management (keep — accurate)

## 6. Performance Patterns (keep — accurate)

## 7. Styling & Accessibility (keep — accurate)

## 8. Data Flow Diagram (NEW)

## 9. Error Boundary Strategy (NEW)

## 10. Component Ownership (NEW)

## 11. Refactoring Backlog (with file:line references)

## 11. Appendix: Generation Script (to keep doc in sync)
```

---

## Conclusion

The **EGM-20 Component Architecture** document is **well-structured and readable** but **factually unreliable** in its current state. Five critical inaccuracies (page count, tool count, directory structure, missing hook, wrong utility paths) mean a developer using this as a reference would waste time looking for files that don't exist or miss files that do.

**Recommendation:** Treat as a **draft requiring P0 corrections** before use as architecture reference. The design patterns section (Lines 139–274) is the strongest part and can be retained largely as-is. The inventory tables and summary must be regenerated from the actual codebase.

**Next Step:** Run a script to auto-generate the component inventory from `glob` results and update the document, or manually apply the P0 fixes above.

---

*Review completed. File written to `design-docs/egm-20-component-architecture-style-review.md`.*