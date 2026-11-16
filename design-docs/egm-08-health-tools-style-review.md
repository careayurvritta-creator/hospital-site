# EGM Style Review: `egm-08-health-tools.md` vs. Actual Codebase

**Document Under Review**: `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site\design-docs\egm-08-health-tools.md` (98 lines)  
**Codebase Root**: `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site` (Vite + React + TypeScript)  
**Review Date**: 2026-11-13  
**Reviewer**: EGM Style Framework (9-point rubric)

---

## Executive Summary

| Criterion | Score (1–5) | Rationale |
|-----------|-------------|-----------|
| 1. Clarity & Structure | **3** | Doc is well-organized with logical sections, but describes a fictional architecture that does not exist. |
| 2. Completeness | **2** | Missing 6th tool (DietChartTool), AI service layer, PDF export, 3 supporting components, and error handling. |
| 3. Accuracy of Diagrams/Tables | **1** | Tool Inventory table wrong on count (5 vs 6), routes, purposes, question counts; component tree is entirely fictional. |
| 4. Actionability | **2** | A developer following this doc would build wrong components, wrong state model, and miss critical integrations. |
| 5. Formatting | **4** | Clean Markdown, well-formed tables, consistent headings — the only strong dimension. |
| 6. Terminology Consistency | **2** | "Hair health" for Saara (actually Dhatu Sara), "no backend dependency" contradicted by aiService, "radar chart" absent. |
| 7. Evidence-Based Claims | **1** | Nearly every measurable claim (question counts, components, sharing, storage, accessibility) is false or unverifiable. |
| 8. Missing Critical Sections | **2** | No AI integration section, no PDF export, no error/timeout handling, no testing strategy, no dependency inventory. |
| 9. Overall Usability | **2** | Doc is actively misleading; cannot be used as implementation guide without major correction. |
| **Weighted Average** | **2.1** | **Below acceptable threshold (≥ 3.5)** — document requires substantial rewrite. |

---

## Findings Table

| Severity | Count | Key Issues |
|----------|-------|------------|
| **Critical** | 7 | Wrong tool count (5 vs 6); fictional shared component architecture; false "no backend" claim (aiService used everywhere); false localStorage persistence for Prakriti; missing AI integration entirely; missing PDF export pipeline; privacy claim violated by AI data transmission. |
| **Major** | 9 | Question counts wrong: Lifestyle 12→15, Prakriti 45→18, Saara 7→45, Meda "8 questions" mischaracterized; Saara purpose wrong (hair vs Dhatu Sara); routes `/tools#x` don't exist; ShareResults/QR/analytics absent; DisclaimerBanner component absent; radar chart absent. |
| **Minor** | 5 | Panchakarma "5 programs / rule-based" actually AI-driven; Meda "links to DietChart" unverified; "educational not diagnostic" disclaimer only inline in DietChart; GDPR "clear data anytime" no UI for it; Counter used for percentages, not radar. |
| **Nit** | 4 | "Time to complete: 5-7 min" unsourced; "high contrast / reduced motion" accessibility claims unsupported; OptionGrid/NavigationButtons naming mismatch; inconsistent icon usage in doc vs reactbits components. |

---

## Line-Specific Issues with Evidence

### 1. Tool Inventory Table (Doc L8–L15)

| Doc Line | Claim | Code Reality | Evidence |
|----------|-------|--------------|----------|
| L4 | "5 interactive health assessment tools" | **6 tools** | `Tools.tsx:2–7` imports 6: Lifestyle, Panchakarma, Meda, Saara, Prakriti, **DietChart** |
| L10 | Lifestyle route `/tools#lifestyle` | No hash routing; `activeTool` state | `Tools.tsx:116–159` `toolsData` array + `setActiveTool` |
| L13 | Saara: "Hair health assessment / Hair type, scalp, concerns" | **Dhatu Sara assessment** — 9 dhatus × 5 questions = 45 questions | `SaaraTool.tsx:22–39` `dhatuData` (Twak, Rakta, Mamsa, Meda, Asthi, Majja, Shukra, plus 2 more) |
| L14 | Prakriti: "45-question questionnaire" | **18 questions** | `PrakritiTool.tsx:16–220` — 18 `id: n` entries |
| L12 | Meda: "Weight management / BMI, waist, diet, activity" | BMI + waist/hip/gender inputs + **8 symptom checkboxes** + 4-mode state machine | `MedaTool.tsx:188` `mode: 'input'\|'symptoms'\|'analyzing'\|'result'`; L203–212 symptom list |

### 2. Shared Component Architecture (Doc L18–L31)

| Doc Line | Claim | Code Reality | Evidence |
|----------|-------|--------------|----------|
| L19–L31 | All 5 tools follow `ToolContainer → ProgressIndicator → QuestionCard → OptionGrid → NavigationButtons → ResultsView → DoshaChart/RecommendationsList/ShareResults → DisclaimerBanner` | **No shared components exist**. Each tool is a self-contained component with its own state machine. | `grep` for `ToolContainer`, `QuestionCard`, `OptionGrid`, `NavigationButtons`, `ResultsView`, `DoshaChart`, `RecommendationsList`, `ShareResults`, `DisclaimerBanner` → **0 matches** across `components/tools/*.tsx` |
| L27 | `DoshaChart (radar visualization)` | **No radar chart**; no `recharts` import; Prakriti uses `Counter` for percentages | `PrakritiTool.tsx:3` imports `Counter`; `grep recharts\|Radar` → no matches |
| L29 | `ShareResults button` | **No sharing implementation** | `grep generateShare\|navigator\.share\|QRCode` → no matches in tools |

### 3. State Management (Doc L33–L37)

| Doc Line | Claim | Code Reality | Evidence |
|----------|-------|--------------|----------|
| L36 | "`useEffect` for progress persistence (localStorage)" | **Only DietChartTool reads localStorage** (`ayurvritta_prakriti`); PrakritiTool does **not** write results | `DietChartTool.tsx:326` `localStorage.getItem('ayurvritta_prakriti')`; PrakritiTool has no `localStorage.setItem` |
| L37 | "No Redux/Zustand — each tool manages its own state" | **True** — but each tool's state shape differs wildly (Lifestyle: `Record<number,number>`; Saara: `Record<string,number>`; Meda: 4-mode enum; Prakriti: `Record<number,'V'|'P'|'K'>`; DietChart: multi-phase) | Verified per tool |

### 4. Data Flow (Doc L39–L46)

| Doc Line | Claim | Code Reality | Evidence |
|----------|-------|--------------|----------|
| L41–L46 | Linear flow: select → next → calculateResults → render ResultsView → ShareResults → generateShareCard | **No `calculateResults` shared fn**; each tool computes differently; **no sharing**; AI calls via `aiService.generate()` with 45s timeout (`Promise.race`) | All 6 tools import `aiService` from `../../lib/aiService` (e.g., `LifestyleTool.tsx:2`, `LifestyleTool.tsx:539`) |

### 5. Tool-Specific Implementations

#### Prakriti Tool (Doc L50–L57)

| Doc Line | Claim | Code Reality | Evidence |
|----------|-------|--------------|----------|
| L51 | "45 questions across 15 categories" | **18 questions**, no explicit 15-category grouping in code | `PrakritiTool.tsx:16–220` 18 entries; categories implicit in `sanskrit`/`text` |
| L52 | "Scoring: 0–3 per answer maps to V/P/K" | Answers are **direct V/P/K choice** (`Record<number,'V'|'P'|'K'>`), not 0–3 scores | `PrakritiTool.tsx:319` `answers: Record<number, 'V'|'P'|'K'>` |
| L53 | "Radar chart showing dosha proportions" | **No radar**; `Counter` animates percentages | `PrakritiTool.tsx:562` `<Counter count={vataPct} />` |
| L56 | "Results saved to localStorage for revisiting" | **False** — no `localStorage.setItem` in PrakritiTool | Full file scan: no `setItem` |

#### Lifestyle Tool (Doc L58–L63)

| Doc Line | Claim | Code Reality | Evidence |
|----------|-------|--------------|----------|
| L59 | "12 questions" | **15 questions** | `LifestyleTool.tsx:16–198` — 15 `id: n` entries |
| L60 | "Lifestyle balance score (0–100)" | AI-generated text + `Counter` for dosha percentages | `LifestyleTool.tsx:3` imports `Counter`; result includes `aiRecommendation` string |
| L62 | "Links to service recommendations" | **Unverified** — no cross-tool navigation found | `grep` for `navigate\|router\|DietChart` in LifestyleTool → none |

#### Panchakarma Tool (Doc L64–L68)

| Doc Line | Claim | Code Reality | Evidence |
|----------|-------|--------------|----------|
| L65 | "10 questions" | ✅ **10 questions** | `PanchakarmaTool.tsx:16–133` — 10 `id: n` |
| L66–L67 | "5 programs / Rule-based matching" | **AI-driven** via `aiService.generate()`; 3 therapy suggestions (Vamana/Virechana/Basti) by dosha dominance | `PanchakarmaTool.tsx:411` prompt asks for "day-by-day Snehana-Swedana schedule"; L535–537 conditional therapies |
| L68 | Output format | AI free-text, not structured "Based on your answers, we recommend [Program Name]" | Result is `aiRecommendation` string |

#### Meda Tool (Doc L70–L73)

| Doc Line | Claim | Code Reality | Evidence |
|----------|-------|--------------|----------|
| L71 | "8 questions: BMI, waist circumference, weight history, diet patterns" | **4 input fields** (height, weight, waist, hip, gender, age) + **8 symptom checkboxes** + **4-mode state machine** | `MedaTool.tsx:188` mode enum; L203–212 `medaVriddhiSymptoms` (8 items) |
| L73 | "Integration: Links to DietChart tool" | **No link found** | `grep DietChart` in MedaTool → no matches |

#### Saara Tool (Doc L75–L78)

| Doc Line | Claim | Code Reality | Evidence |
|----------|-------|--------------|----------|
| L75 | "Saara Tool (Hair Health)" | **Dhatu Sara Assessment** — 9 dhatus (tissues), not hair | `SaaraTool.tsx:22–168` `dhatuData` array: Twak, Rakta, Mamsa, Meda, Asthi, Majja, Shukra, plus Ojas/Sara |
| L76 | "7 questions: hair type, scalp condition, hair loss, diet" | **9 dhatus × 5 questions = 45 questions** | `SaaraTool.tsx:32–168` each dhatu has `questions: [q1..q5]` |
| L77 | "Hair health score + Ayurvedic remedy recommendations" | Weakest dhatu identified → herb recommendations per dhatu | `SaaraTool.tsx:240–280` `getRecommendations()` switches on `weakestDhatu` |

### 6. Results Sharing (Doc L80–L85)

| Doc Line | Claim | Code Reality | Evidence |
|----------|-------|--------------|----------|
| L81–L82 | `ShareResults` component; WhatsApp/Facebook/Twitter via native share API | **No sharing code** in any tool | `grep ShareResults\|navigator\.share\|clipboard\|social` → 0 matches |
| L83 | "Copy link: unique URL with results encoded in query params" | **Absent** | — |
| L84 | "QR code: Optional (for clinic display)" | **Absent** | — |
| L85 | "Analytics: Tracks share events per tool" | **Absent** | — |

### 7. Privacy & Data (Doc L87–L92)

| Doc Line | Claim | Code Reality | Evidence |
|----------|-------|--------------|----------|
| L88 | "All data stored client-side only (localStorage)" | **False** — all 6 tools call `aiService.generate()` which sends prompts to external AI backend | `LifestyleTool.tsx:539`, `MedaTool.tsx:261`, `PanchakarmaTool.tsx:415`, `PrakritiTool.tsx:562`, `SaaraTool.tsx:371`, `DietChartTool.tsx:627` |
| L89 | "No PHI sent to server during assessment" | **Contradicted** — user inputs (age, gender, symptoms, complaints) included in AI prompts | `DietChartTool.tsx:409–428` prompt includes `patient.name`, `age`, `gender`, `complaints` |
| L91 | "Disclaimer banner: 'These tools are for educational purposes only'" | **No DisclaimerBanner component**; inline disclaimers only in DietChartTool/DietChartPDF | `DietChartTool.tsx:1168–1194`, `DietChartPDF.tsx:299` |
| L92 | "GDPR: Users can clear assessment data anytime" | **No clear-data UI** in any tool | — |

### 8. Accessibility (Doc L94–L98)

| Doc Line | Claim | Code Reality | Evidence |
|----------|-------|--------------|----------|
| L95 | "Keyboard navigation: Tab through options, Enter to select" | **No `tabIndex`, `onKeyDown`, or keyboard handlers** in tool components | `grep tabIndex\|onKeyDown\|onKeyUp` in `components/tools` → 0 matches |
| L96 | "Screen reader: Questions read as `aria-labelledby`" | **No `aria-*` attributes** in any tool | `grep aria-` → 0 matches (false positives only) |
| L97 | "High contrast: Option cards have clear visual states" | Uses `reactbits` `TiltedCard`/`SpotlightCard` — no explicit contrast guarantees | `Tools.tsx:8` imports from `reactbits` |
| L98 | "Reduced motion: Animation-free option for sensitive users" | **No `prefers-reduced-motion` handling** | `grep prefers-reduced-motion` → 0 matches |

### 9. Missing Entire Subsystems (Not in Doc)

| Subsystem | Code Evidence | Impact |
|-----------|---------------|--------|
| **AI Service Integration** | `lib/aiService.ts` imported by all 6 tools; 45s timeout via `Promise.race`; `generateLocalAnalysis` fallback in Prakriti | Core architecture — doc says "no backend dependency" (L4) |
| **DietChartTool (6th tool)** | 1,232 lines; multi-phase wizard; reads Prakriti from localStorage; generates AI diet chart | Entire tool missing from doc |
| **DietChartRenderer** | 1,152 lines; parses AI markdown into typed sections (MealEntry, Dinacharya, Remedy, etc.) | Critical for PDF export |
| **DietChartPDF Export** | `jspdf` + `html2canvas` client-side PDF generation | Major deliverable absent from doc |
| **Error/Timeout Handling** | `Promise.race([generatePromise, timeout(45000)])` pattern in all tools | Production requirement |
| **Testing Strategy** | None documented; no test files found in `components/tools/` | Quality gap |

---

## Actionable Recommendations by Priority

### P0 — Critical (Must Fix Before Any Implementation Use)

1. **Correct tool count to 6** — Add DietChartTool section with its multi-phase wizard, localStorage dependency on Prakriti, AI generation, and PDF export pipeline.
2. **Remove fictional shared component architecture** (Doc L18–L31) — Document actual per-tool state machines; note common patterns (progress calc, AI call pattern) without inventing components.
3. **Retract "no backend dependency" claim** — Document `aiService` integration: timeout strategy, fallback analysis, data sent to AI, prompt structure.
4. **Fix localStorage persistence claim** — Only DietChartTool reads `ayurvritta_prakriti`; PrakritiTool does not write it. Either implement write or remove claim.
5. **Document privacy reality** — User data (name, age, gender, symptoms, complaints) goes to AI backend. Add data-handling section with retention, consent, and opt-out.

### P1 — Major (Blocks Accurate Implementation)

6. **Correct all question counts and tool purposes** — Update table: Lifestyle 15, Prakriti 18, Saara 45 (9×5), Meda 4-input + 8-symptom + 4-mode, Panchakarma 10 ✅.
7. **Rename Saara Tool** — "Dhatu Sara Assessment" not "Hair Health". Update purpose and data collected columns.
8. **Remove sharing/QR/analytics section** (L80–L85) or mark as "Future Work" — nothing implemented.
9. **Remove radar chart / DoshaChart reference** — Document actual `Counter` percentage display; if radar desired, spec as new work.
10. **Add DisclaimerBanner as real component** — Currently only inline in DietChart; extract to shared if consistency needed.

### P2 — Minor (Improves Quality)

11. **Document Panchakarma AI-driven recommendation** — Replace "5 programs / rule-based" with actual prompt + dosha-conditional therapy suggestions.
12. **Document Meda 4-mode state machine** — Replace "8 questions" with accurate flow: Input → Symptoms → Analyzing → Result.
13. **Add dependency inventory** — `aiService`, `jspdf`, `html2canvas`, `reactbits` (Counter, TiltedCard, SpotlightCard, AnimatedList, SplitText, Aurora).
14. **Add error handling / timeout section** — 45s `Promise.race` pattern, fallback local analysis (Prakriti only), loading states.
15. **Remove unsourced "5–7 min" completion time** or cite usability study.

### P3 — Nit (Polish)

16. **Fix route claims** — Tools use `activeTool` state, not `/tools#x` hash routes. Document actual navigation.
17. **Accessibility section** — Either implement `aria-*`, keyboard handlers, `prefers-reduced-motion` or rewrite section as "Accessibility Gaps".
18. **Standardize option terminology** — Doc uses "OptionGrid/NavigationButtons"; code uses `reactbits` cards + custom buttons.
19. **Add testing strategy placeholder** — Unit (scoring logic), Integration (AI prompt/response), E2E (tool flows).

---

## Suggested Revised Document Structure

```markdown
# EGM-08: Health Assessment Tools Architecture (Revised)

## Overview
- 6 client-side tools with AI-backed analysis via shared `aiService`
- No shared component library — each tool owns its state machine
- Data privacy: user inputs transmitted to AI provider (45s timeout, fallback)

## Tool Inventory (Corrected)

| Tool | Route (State) | Purpose | Questions / Inputs | Key Output |
|------|---------------|---------|---------------------|------------|
| Lifestyle | `activeTool: 'lifestyle'` | Daily routine → dosha balance | 15 questions (sleep, meals, exercise, stress, screen) | AI text + dosha % (Counter) |
| Panchakarma | `activeTool: 'panchakarma'` | Treatment suitability | 10 questions (symptoms, goals, preferences) | AI day-by-day Snehana/Swedana + Vamana/Virechana/Basti |
| Meda | `activeTool: 'meda'` | Weight / Meda Dhatu assessment | 4 biometric inputs + 8 symptom checkboxes; 4-mode wizard | BMI/WHR gauges + AI plan |
| Saara (Dhatu Sara) | `activeTool: 'saara'` | Tissue excellence assessment | 9 dhatus × 5 questions = 45 | Weakest dhatu + herb recs |
| Prakriti | `activeTool: 'prakriti'` | Dosha constitution | 18 questions (V/P/K choice each) | Dosha % (Counter) + AI description + local fallback |
| DietChart | `activeTool: 'diet'` | Personalized diet chart | Multi-phase: patient + complaints + 4 lifestyle Qs | AI markdown → typed sections → PDF export |

## Actual Architecture Patterns
### Per-Tool State Machine (no shared base)
- Lifestyle/Panchakarma/Saara/Prakriti: step-index + answers Record + AI result
- Meda: 4-mode enum (`input|symptoms|analyzing|result`)
- DietChart: 6-phase enum (`welcome|patient|complaints|lifestyle|generating|result`)

### Common AI Integration Pattern
```ts
const generatePromise = aiService.generate(prompt, systemInstruction, { temperature: 0.7 });
const result = await Promise.race([generatePromise, timeout(45000)]);
// Prakriti only: fallback to generateLocalAnalysis()
```

## Data Flow (Real)
1. User enters data → tool-local state
2. On submit → construct prompt → `aiService.generate()` with 45s timeout
3. On success → parse/render AI text (DietChart: `parseAIResult()` → typed sections)
4. DietChart only: `DietChartRenderer` + `DietChartPDF` (jsPDF + html2canvas)

## Privacy & Data Handling
- **Transmitted to AI**: All user inputs (name, age, gender, symptoms, complaints, answers)
- **Stored locally**: Only `ayurvritta_prakriti` (read by DietChart); no auto-clear UI
- **Disclaimers**: Inline in DietChartTool/PDF ("educational, not substitute for medical treatment")
- **Gaps**: No consent UI, no data deletion, no retention policy

## Accessibility Status
- **Not implemented**: No `aria-*`, no keyboard handlers, no `prefers-reduced-motion`
- **Uses**: `reactbits` animated cards (TiltedCard, SpotlightCard) — may violate reduced-motion
- **Recommendation**: Audit and remediate before production

## Dependencies
- `aiService` (internal) — all tools
- `jspdf` + `html2canvas` — DietChartPDF only
- `reactbits` (Counter, TiltedCard, SpotlightCard, AnimatedList, SplitText, Aurora) — UI chrome
- No `recharts`, no router, no Redux/Zustand

## Open Gaps / Future Work
- Sharing (QR, native share, analytics) — not started
- Radar chart (DoshaChart) — not started
- Shared DisclaimerBanner — not started
- GDPR clear-data UI — not started
- Test coverage — none
```

---

## Conclusion

**The reviewed document (`egm-08-health-tools.md`) is not a reliable reference for the current codebase.** It describes a 5-tool, shared-component, client-side-only architecture that does not exist. The actual codebase has 6 tools, zero shared components, mandatory AI backend integration, a sophisticated PDF export pipeline, and significant accessibility and privacy gaps.

**Recommendation**: Treat this review as the authoritative specification for the *current* state. Rewrite the design doc from scratch using the "Suggested Revised Structure" above, or mark the original as **OBSOLETE** and archive it. Any implementation work based on the original document will produce incorrect components and miss critical integrations.

---

**File Verification**: This review written to `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site\design-docs\egm-08-health-tools-style-review.md` on 2026-11-13.