# EGM-08 Health Tools — Implementation Readiness Review

**Date:** 2026-11-13
**Project:** Ayurvritta Ayurveda Hospital — hospital-site
**Design Document:** `design-docs/egm-08-health-tools.md`
**Codebase Details Review:** `design-docs/egm-08-health-tools-codebase-details-review.md`
**Reviewer:** Implementation Readiness Framework (10-point)

---

## Executive Summary

The EGM-08 design document describes **~20% of the actual implementation**. The codebase has fully implemented **six** production-grade assessment tools (the design lists only **five**), including an undocumented three-file **Diet Chart system** with AI generation, 13-section parsing, and multi-page PDF export. Every tool calls an AI personalization layer (`aiService.generate`) that the design's "no backend dependency" claim does not account for. Question counts, the Saara tool's purpose, and the shared component architecture described in the design do not match the code.

| Criterion | Score (1-10) | One-line verdict |
|-----------|:---:|------------------|
| 1. Requirements Clarity | 3 | Tool inventory, question counts, and tool purposes are factually wrong |
| 2. Architecture Alignment | 3 | Claims a shared `ToolContainer` pattern that does not exist; omits AI layer |
| 3. Component Spec Completeness | 4 | Actual per-tool UI state machines and renderers undocumented |
| 4. Data Flow Definition | 4 | Simple select→score flow documented; AI generation + parse + fallback flow absent |
| 5. Integration Points | 3 | `aiService`, knowledge-file ingestion, PDF pipeline all missing |
| 6. Dependencies Identified | 2 | No dependency list at all despite heavy client libraries |
| 7. Edge Cases Covered | 3 | AI timeout/fallback, Viruddha-ahaara validation, parse failures undocumented |
| 8. Testing Strategy | 2 | Nothing in design; no tests exist in codebase either |
| 9. Performance Budget | 3 | No bundle/latency analysis for heavy deps + 45s AI window |
| 10. Migration / Compatibility | 4 | Client-side storage is simple, but result-sharing URL contract undefined |

### **Overall Readiness Score: 3 / 10 — NOT READY as a design specification**

**Readiness Verdict:** The **codebase is production-ready; the design document is not**. A developer following only this document would build a broken prototype missing ~80% of the real functionality (AI layer, Diet Chart system, correct question sets, per-tool state machines). This review must be read as: *the code is the spec today; the document is documentation debt, not an implementation plan.*

---

## Findings Comparison Table

| # | Category | Design Doc (`egm-08-health-tools.md`) | Actual Codebase | Gap Severity |
|---|----------|----------------------------------------|-----------------|--------------|
| 1 | **Tool Inventory** | 5 tools (Lifestyle, Panchakarma, Meda, Saara, Prakriti) | **6 tools** — `DietChartTool` added; routed in `pages/Tools.tsx:221` as `activeTool === 'diet'` | 🔴 Critical |
| 2 | **Backend Claim** | "All tools run client-side with **no backend dependency**" (Overview, line 4) | All 6 tools call `aiService.generate()` with a 45s timeout → Nvidia NIM proxy (Llama 3.1 70B) | 🔴 Critical |
| 3 | **Prakriti Question Count** | 45 questions, 15 categories, 5-7 minutes | **18 questions** (`PrakritiTool.tsx:14-230`) | 🟠 High |
| 4 | **Saara Tool Purpose** | 7-question hair-health quiz | **9-Dhatu, 45-question** constitutional assessment (adds Twak & Satva to Sapta Dhatu) (`SaaraTool.tsx:22-176`) | 🔴 Critical |
| 5 | **Lifestyle Question Count** | 12 questions, single 0-100 balance score | **15 questions**, dosha-specific weighted scoring (`LifestyleTool.tsx:14-210`) | 🟠 High |
| 6 | **Shared Component Architecture** | `ToolContainer → QuestionCard → OptionGrid` template shared by all 5 tools | **No shared tool components exist.** Each tool implements its own pattern (step counter, mode-based state machine, per-Dhatu cards) | 🟠 High |
| 7 | **Diet Chart System** | Not mentioned at all | 3-file system: `DietChartTool.tsx` (4-phase wizard, Agni auto-detection), `DietChartRenderer.tsx` (13-section parser), `DietChartPDF.tsx` (jsPDF + html2canvas export) | 🔴 Critical |
| 8 | **Knowledge Ingestion** | Not mentioned | `DietChartTool` loads reference diet charts from `/knowledge/diet-charts/*.md` via Vite `import.meta.glob` | 🟠 High |
| 9 | **State Management** | `useState` answers + step index + localStorage persistence | Per-tool local `useState` state machines confirmed, but **no localStorage persistence** verified as universal; AI analysis state (`isAnalyzing`) unaccounted | 🟡 Medium |
| 10 | **Results Sharing** | Share card, social APIs, copy link, QR, share analytics | Actual share implementation varies per tool; URL-encoded result contract, QR, and analytics events not verifiable as implemented | 🟡 Medium |
| 11 | **Privacy** | Client-side only, no PHI to server | Contradicted by AI layer: answers are serialized into prompts sent to LLM service | 🔴 Critical |
| 12 | **Accessibility** | aria-labelledby, keyboard nav, reduced motion | Partially present via UI components; not systematically verifiable against spec | 🟡 Medium |
| 13 | **Testing** | Not specified | No test files for any tool; nothing in design to close the gap | 🟠 High |
| 14 | **Dependencies** | None listed | `jspdf`, `html2canvas`, `recharts`, `@radix-ui/*`, `lucide-react`, plus `aiService` wrapper | 🟠 High |

---

## Detailed Analysis

### 1. Requirements Clarity — 3/10

A requirements section must be *true* before it can be clear. Three of five tool descriptions are wrong:

| Tool | Design says | Code says |
|------|-------------|-----------|
| Prakriti | 45 questions | 18 questions (`PrakritiTool.tsx`) |
| Saara | Hair-health quiz, 7 questions | 9-Dhatu constitutional assessment, 45 questions (`SaaraTool.tsx`) |
| Lifestyle | 12 questions, 0-100 score | 15 questions, dosha-weighted scoring (`LifestyleTool.tsx`) |

Additionally the inventory **omits the flagship Diet Chart tool** — the most complex surface in the entire module (4-phase wizard, Agni detection, Viruddha-ahaara validation, PDF export). Requirements that misstate *what exists* cannot serve as acceptance criteria.

### 2. Architecture Alignment — 3/10

- **Claim:** a shared `ToolContainer / QuestionCard / OptionGrid / ResultsView` component tree used by all 5 tools.
- **Reality:** `components/tools/` contains 8 files with **zero shared tool components**. Patterns diverge per tool: step-counter wizards (`MedaTool`), mode-based state machines, and per-Dhatu progressive reveal (`SaaraTool`).
- **Claim:** "no backend dependency."
- **Reality:** every tool calls `aiService.generate()` (lines referenced per tool in the details review: 539, 415, 261, 402, 438, 627) through a 45-second timeout with an `AI_ENHANCEMENT_UNAVAILABLE` sentinel fallback. The architecture is *client-first with an optional AI enhancement lane* — a materially different (and cost-relevant) design.

### 3. Component Spec Completeness — 4/10

The design's component template describes a shape the code deliberately does not follow. Missing specs:

- `DietChartRenderer.tsx` — 13-section structural parser and sub-section table layout builder (meal plans, dinacharya).
- `DietChartPDF.tsx` — jsPDF canvas-capture pipeline with pagination.
- Per-tool result views: dosha radar breakdown (Prakriti), per-Dhatu scoring cards (Saara), symptom-score classification (Meda).
- Shared UI primitives actually used (`components/ui/reactbits`: `Counter`, `AnimatedList`, `SpotlightCard`, `TiltedCard`, `SplitText`) — none of which appear in the design.

### 4. Data Flow Definition — 4/10

Documented flow (select → score → results) covers only the *degraded* path. The real flow is:

```
Questionnaire → client-side scoring → aiService.generate(prompt) (45s timeout)
    ├─ success → parse response → enhanced results view
    └─ timeout/error → AI_ENHANCEMENT_UNAVAILABLE fallback → base client-side results
```

For Diet Chart: questionnaire → Agni auto-detection → knowledge-file context (`/knowledge/diet-charts/*.md` via `import.meta.glob`) → prompt assembly → 13-section parse → render → PDF. None of this is in the design.

### 5. Integration Points — 3/10

| Integration | Documented? |
|-------------|:---:|
| `lib/aiService.ts` (Nvidia NIM proxy, prompt assembly, timeout, fallback) | ❌ |
| `/knowledge/diet-charts/*.md` content ingestion (Vite glob) | ❌ |
| jsPDF + html2canvas PDF generation | ❌ |
| `pages/Tools.tsx` hub routing (`/tools#<tool>` + `setActiveTool`) | ✅ (hash routes correct) |
| localStorage result persistence | ⚠️ claimed universally; not verified per-tool |
| Share/social APIs, share analytics events | ⚠️ unverifiable |

### 6. Dependencies Identified — 2/10

The design lists no dependencies. Actual ones relevant to this module:

- `jspdf` (^2.5.1) + `html2canvas` (^1.4.1) — ~180KB gzipped, SSR-incompatible (client-only, dynamic import required)
- `recharts` — dosha/Agni visualizations
- `@radix-ui/*` primitives, `lucide-react` icons
- **Runtime service dependency:** Nvidia NIM (Llama 3.1 70B) via proxy — per-request cost, rate limits, and the 45s timeout budget are unspecified anywhere

### 7. Edge Cases Covered — 3/10

Real edge handling exists in code but not in the design:

- AI timeout (45s) + sentinel fallback per tool
- 13-section parse with fallback regex extraction (`DietChartRenderer`)
- Viruddha-ahaara forbidden-combination validation (6 rules, `DietChartTool`)
- Invalid/zero BMI inputs, unanswered questions
- Prompt-injection-shaped input from free-text fields (unhandled — should be spec'd)

### 8. Testing Strategy — 2/10

Design specifies nothing. Codebase has **no tests** for any tool — the highest-risk logic (dosha scoring, Agni detection, 13-section parsing, Viruddha rules) is pure function territory that would be cheap to unit test and is completely untested. This is a gap in *both* document and code, and the design document was the chance to specify it.

### 9. Performance Budget — 3/10

Unaddressed items with real impact:

- **AI latency:** 45s ceiling per generation; UX must handle long waits (`isAnalyzing` spinner exists, cancellation does not)
- **Bundle:** jspdf + html2canvas + recharts all routed through `/tools` — lazy loading strategy not specified
- **Knowledge glob:** `import.meta.glob` bundles all diet chart markdown into the client build; size unmeasured

### 10. Migration / Compatibility — 4/10

Low-risk (client-side, no stored server data), but:

- Results-in-URL query-param encoding ("unique URL with results encoded") has no defined schema; changing question counts (as already happened: 45→18) silently invalidates shared links
- No versioning of localStorage result payloads
- localStorage of health answers intersects with the design's own GDPR "clear data anytime" commitment — no documented mechanism

---

## Gap Analysis

```
DESIGN DOC COVERAGE vs CODEBASE
─────────────────────────────────────────────────────────────
Tool inventory            ▓▓░░░░░░░░  5/6 tools (DietChart missing)
Question sets             ▓░░░░░░░░░  1/4 verifiable counts correct
AI layer                  ░░░░░░░░░░  0% — entirely absent
Diet Chart subsystem      ░░░░░░░░░░  0% — entirely absent
Shared components         ▓░░░░░░░░░  pattern described does not exist
Data flow                 ▓▓░░░░░░░░  degraded path only
Dependencies              ░░░░░░░░░░  none listed
Privacy model             ▓░░░░░░░░░  contradicted by AI layer
Accessibility/Privacy UX  ▓▓▓░░░░░░░  directionally right
─────────────────────────────────────────────────────────────
Overall document fidelity ≈ 20-25%
```

**Root cause:** the design document predates two generations of implementation (AI enhancement layer, then the Diet Chart system) and was never reconciled. The `egm-12-pdf-diet-charts.md` design covers part of the Diet Chart gap, but EGM-08's tool-level inventory still claims that subsystem doesn't exist.

---

## Recommendations (Priority Order)

### 🔴 P0 — Must fix before this document is used for any implementation decision
1. **Rewrite the Tool Inventory** to 6 tools; add the full Diet Chart subsystem (Tool/Renderer/PDF) or cross-reference `egm-12-pdf-diet-charts.md` explicitly.
2. **Replace the "no backend dependency" claim** with the true architecture: client-first scoring + optional AI enhancement via `aiService` (45s timeout, fallback sentinel), including cost/availability implications and the privacy note that questionnaire answers are sent to the LLM service.
3. **Correct the Privacy section**: answers are transmitted for AI personalization; the "no PHI sent to server" statement is false as written.

### 🟠 P1 — High priority
4. **Correct question counts and purposes**: Prakriti 18 (not 45), Saara 9-Dhatu/45-question constitutional tool (not hair quiz), Lifestyle 15 questions with dosha-weighted scoring.
5. **Replace the shared-component template** with either (a) documentation of each tool's actual pattern, or (b) an explicit refactor plan to introduce the real `ToolContainer` layer — pick one; the current text matches neither.
6. **Document the AI fallback pattern** (timeout → sentinel → base results) once in the architecture section, referenced by all tools.
7. **Add a dependency table** (jsPDF, html2canvas, recharts, Radix, lucide) with bundle-size notes and a lazy-loading requirement for the `/tools` route.

### 🟡 P2 — Should fix
8. **Specify the share-URL schema** and add payload versioning so future question-count changes don't silently break shared result links.
9. **Define a minimal testing strategy** at least for the pure scoring/parsing functions (dosha scores, Agni detection, 13-section parser, Viruddha rules).
10. **Document the 9-Dhatu extension** (Twak, Satva) and reconcile `knowledge/dhatu.json` (7 Dhatus) with `SaaraTool` — pick a single source of truth.
11. **Add localStorage data lifecycle**: what is stored per tool, retention, and the user-facing "clear my data" mechanism supporting the GDPR claim.

---

## Readiness Verdict

> **NOT READY (3/10) as a design specification — READY as a codebase.**
>
> The implementation is ahead of the document. EGM-08 should be treated as *stale documentation to be rewritten*, not as an implementable spec. If any future work (new tools, i18n, analytics instrumentation) is planned against this document, it will be built on false premises — most critically the missing Diet Chart subsystem, the absent AI layer, and the incorrect privacy model.

**Comparison with sibling reviews:** This is the same failure pattern as `egm-12-pdf-diet-charts-implementation-readiness-review.md` (also scored NOT READY for doc vs code divergence). EGM-08 and EGM-12 should be reconciled together in a single documentation pass, since EGM-12 already covers the Diet Chart detail that EGM-08 lacks.
