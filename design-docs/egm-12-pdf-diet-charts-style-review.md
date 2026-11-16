# EGM-12: PDF Diet Charts — Style & Documentation Quality Review

**Reviewed document:** `design-docs/egm-12-pdf-diet-charts.md` (121 lines)
**Review type:** Style, clarity, documentation quality, formatting, actionability
**Evidence basis:** Direct read of `components/tools/DietChartTool.tsx` (1,102 lines), `components/tools/DietChartPDF.tsx` (314 lines), `components/tools/DietChartRenderer.tsx` (section parser), `knowledge/diet-charts/` (136 files), `pages/Tools.tsx`, and `package.json`
**Date:** 13-Nov-2026

> Note: Sibling reviews (`-codebase-details-review.md`, `-implementation-readiness-review.md`) focus on code-accuracy and readiness. This review is distinct: it judges the document *as a document* — but since a design doc's primary job is to describe reality accurately, fabricated content is scored here as a style/credibility failure, not a code defect.

---

## 1. Executive Summary

This document reads well but describes a system that does not exist. It is a plausible, well-formatted design sketch for a **server-side, recipe-driven, weekly nutrition generator** — while the actual implementation is a **client-side, AI-generated, condition-specific single-day Ayurvedic diet chart** built around a 7-phase wizard, Agni assessment, Viruddha validation, and an image-rasterized PDF pipeline.

Nearly every function name, the data template, the PDF capabilities, and the stated architecture fail verification against the codebase. The formatting is clean Markdown; the content is largely fiction.

### Scores

| # | Criterion | Score (1–5) | One-line justification |
|---|-----------|:-----------:|------------------------|
| 1 | Clarity & Structure | 2 | Well-organized headings, but the narrative describes a fictional system, so "clear" writing about the wrong thing is worse than useful. |
| 2 | Completeness | 1 | Omits the AI layer, Agni/Viruddha logic, wizard flow, knowledge-base location, dependencies, error handling, and testing entirely. |
| 3 | Accuracy of Diagrams/Tables | 1 | Architecture diagram, data template, and capability tables all contradict the code. |
| 4 | Actionability | 1 | A developer following this document would build (or search for) a system that does not exist. |
| 5 | Formatting | 4 | Clean Markdown, consistent heading hierarchy, readable tables — the one genuine strength. |
| 6 | Terminology Consistency | 2 | Internally consistent, but uses a vocabulary (recipes, NUTRITION SUMMARY, weekly plan) foreign to the actual domain (Agni, Prakriti, Pathya/Apathya, Viruddha). |
| 7 | Evidence-Based Claims | 1 | Dozens of checkable claims; nearly all fail (function names, features, paths, fonts, caching, share mechanisms). |
| 8 | Missing Critical Sections | 1 | No AI integration, error handling, data location, dependencies, or testing sections. |
| 9 | Overall Usability | 1 | Actively harmful as an onboarding/reference artifact — it would misdirect more than guide. |

**Overall: 1.4 / 5 — Rewrite required.** Do not patch this document line-by-line; the factual core is wrong. Recommend a full rewrite against the real system (proposed structure in §5).

---

## 2. Findings Summary

| Severity | Count | Description |
|----------|:-----:|-------------|
| Critical | 5 | Fabricated function inventory; false "entirely client-side / no server dependency" claim; PDF capabilities contradict the actual pipeline; fabricated data template; fictional architecture diagram. |
| Major | 6 | Fabricated feature list (IndexedDB, compression, subsetting, print, share); fabricated font strategy; missing data location; missing AI integration section; missing dependency list; missing error/testing sections. |
| Minor | 4 | Incorrect file-size claims; unverified page-count claim; stale UI count ("106+ conditions" vs 136 files); header/logo mismatch. |
| Nit | 3 | Heading depth inconsistency; trailing meta-commentary; missing versioning/author block. |

---

## 3. Detailed Findings

### 3.1 Critical

#### C1 — Fabricated function inventory (doc lines 22–43)

The document lists eight functions with described responsibilities. **None of them exist in the codebase:**

| Doc claims (lines 22–43) | Reality (verified) |
|---|---|
| `validateInput()` | Does not exist. Validation happens inline in phase handlers. |
| `matchRecipes()` | Does not exist. The real matcher is `matchComplaintsToFiles()` (DietChartTool.tsx), which maps complaints to knowledge files (max 3). |
| `generateWeeklyPlan()` | Does not exist. There is no weekly plan; the real generator is `generateDiet()`. |
| `calculateNutrition()` | Does not exist. No calorie/macro math anywhere in the component. |
| `createDocument()` | Does not exist. |
| `renderDailyPlan()` | Does not exist. Rendering uses `parseAIResult()` + `SectionType` classification (~14 section types) in DietChartRenderer.tsx. |
| `renderNutritionSummary()` | Does not exist. No nutrition summary exists at all. |
| `formatNutritionTable()` | Does not exist. |

Functions that **do** exist and should be documented instead: `generateDiet`, `determineAgni` (4 Agni types from 4 questions), `checkViruddha` (6 forbidden combinations), `matchComplaintsToFiles`, `parseAIResult`, `stripMarkdown`, `captureChart`, `buildPdf`, `drawHeader`, `drawFooter`.

**Impact:** Any reviewer or new developer using this doc as an index into the code will conclude the codebase is broken, or worse, that a different (unshipped) implementation exists.

#### C2 — "Entirely client-side, no server dependency" (line 4) is false

The actual flow calls `aiService.generate(prompt, systemInstruction, { temperature: 0.5, max_tokens: 3500 })` (DietChartTool.tsx, ~line 627) wrapped in a `Promise.race` with a **120,000 ms (120 s) timeout**, with a fallback to pre-authored knowledge-base content on failure. This is a hard runtime dependency on an external LLM service. A design doc whose opening thesis is contradicted by line 627 of the component it documents has failed its most basic obligation.

*(Side note: the sibling codebase-details review states the timeout is 45 s — it is 120 s. Cross-review inconsistency worth fixing in both.)*

#### C3 — PDF capability table contradicts the actual pipeline (lines 98–121)

Every load-bearing claim in the PDF section fails verification:

| Doc claims | Reality (DietChartPDF.tsx, 314 lines) |
|---|---|
| "All text selectable (not image-based)" (line 118) | Chart content is rasterized to PNG via `html2canvas` and placed as image slices (`captureChart` → `buildPdf`). Only header/footer text is native jsPDF text. **The doc contradicts itself within the same section.** |
| "Font: Embedded TTF for Devanagari" (line 100) | Helvetica only; no `addFont`, no TTF loading anywhere. Devanagari cannot render in the PDF text layer. |
| "Print dialog" (line 113) | No `window.print` — downloads only (`pdf.save`). |
| "Shareable via base64/WhatsApp/email" (line 114) | No share code of any kind. |
| Recipe images via base64 (line 102) | No images in the pipeline at all. |
| Hospital logo in header sketch (line ~99) | Header is text-only ("Ayurvritta Ayurveda Hospital" green band; footer disclaimer "For educational purposes. Consult your physician before dietary changes."). No logo asset exists in the code. |
| Filename pattern | Actual: `${patientName with underscores}_Diet_Chart_${ISO date}.pdf` — not documented. |

#### C4 — Fabricated data template (lines 45–73)

The document specifies a "7-day weekly grid" plus a "NUTRITION SUMMARY (Cal / Protein / Carb / Fat)" section. This structure exists nowhere. The actual AI output — parsed into ~14 `SectionType`s — is a **condition-specific single-day plan** organized around: meals (3–4, scaled by Agni type), Pathya (do-eat), Apathya (avoid), Dinacharya, Remedies, and Lifestyle guidance. A reviewer comparing doc to rendered output would see two different products.

#### C5 — Architecture diagram is wrong (lines ~14–20)

The doc shows a linear pipeline: Tool → Renderer → PDF. The actual dependency graph is:

- `DietChartTool` imports **both** `DietChartRenderer` and `DietChartPDF`.
- `DietChartPDF` **imports `parseAIResult` from `DietChartRenderer`** (DietChartPDF.tsx, line 4) — the PDF is not downstream of a rendered artifact passed to it; it re-parses the AI result and reads the live DOM element `#diet-chart-renderer` for rasterization.
- The PDF button renders **outside** the captured `#diet-chart-content` div — a deliberate (and undocumented) design decision that matters for anyone touching capture logic.

This is the one diagram in the doc, and it is wrong.

### 3.2 Major

#### M1 — Fabricated feature list (lines 104–114)

IndexedDB caching, <500 KB compression, font subsetting, print dialog, WhatsApp/email share, base64 recipe images — grep confirms **none** of these exist anywhere in `components/tools/`. Six consecutive lines of unverifiable claims in a "Technical Considerations" section destroy the section's credibility. Real considerations that belong there and are absent: the html2canvas `backdrop-filter` rendering workaround, the COLOR_MAP fallback pattern, DOM-element capture coupling, and the 120 s AI timeout UX.

#### M2 — Data location omitted entirely

The knowledge base lives at **`knowledge/diet-charts/` — 136 `.md` files**, loaded via `import.meta.glob`. The doc never states where the condition data lives (the task brief's own "data/diet-charts/, ~150+ files" is also wrong — worth flagging: even the reviewer's inputs carry the same drift). A design doc for a data-driven feature with no data location is incomplete by definition.

#### M3 — No AI integration section

The system's most complex machinery — prompt construction, system instruction, doctor attribution ("Dr. Jinendradutt Sharma (BAMS)"), temperature/token limits, the 120 s race, and the **graceful fallback to static knowledge-base content** — is entirely undocumented. The fallback path is arguably the most important resilience decision in the product.

#### M4 — No Agni / Viruddha / wizard documentation

The domain logic that makes this tool Ayurvedic rather than generic — `determineAgni` (4-question auto-detection, 4 Agni types), `checkViruddha` (6 forbidden food combinations), Prakriti linkage via `localStorage` key `ayurvritta_prakriti`, and the 7-phase wizard (welcome → patient → complaints → agni → prakriti → generating → result) — is absent. This is the product's actual design.

#### M5 — No dependency list

`jspdf ^4.2.1` and `html2canvas ^1.4.1` (confirmed in `package.json`) are load-bearing, version-sensitive choices (jsPDF 4.x API differs from the widely-documented 2.x). Undocumented.

#### M6 — No error handling or testing sections

No mention of the AI-failure fallback, timeout UX, malformed-AI-output parsing tolerance (`parseAIResult` must survive arbitrary LLM text), or any test strategy.

### 3.3 Minor

| ID | Issue | Evidence |
|----|-------|----------|
| m1 | File-size/LOC claims absent or wrong | Actual: DietChartTool 1,102 lines; DietChartRenderer 1,064; DietChartPDF 314. Doc gives no sizes; sibling reviews cite drifted line numbers (539/415/438/402/627). |
| m2 | "2–4 pages" PDF length claim unverified | Plausible but never validated against a real generated chart; should be marked as an estimate or verified. |
| m3 | Stale condition count | UI copy says "Search 106+ conditions"; the knowledge base holds 136 files. The doc repeats no number — but any rewrite must reconcile UI copy with reality. |
| m4 | "Bi-lingual PDF" (line 121) impossible as described | With Helvetica-only and image-based content, Devanagari selection/search is impossible; claim overpromises. |

### 3.4 Nits

- **n1** — Heading depth jumps (H2 → H3 → content without H3 in places); pick one hierarchy.
- **n2** — No document header block: no author, date, status (Draft/Approved), or version — inconsistent with a doc intended for multi-reviewer sign-off.
- **n3** — A couple of aspirational sentences ("This will serve as…") mixed into spec sections; move intent statements to a Purpose section.

---

## 4. Line-Specific Evidence Index

| Doc line(s) | Claim | Verdict | Code evidence |
|---|---|---|---|
| 4 | "entirely client-side, no server dependency" | ❌ False | `aiService.generate(...)` + 120s `Promise.race`, DietChartTool.tsx |
| 14–20 | Linear architecture diagram | ❌ Wrong | PDF.tsx line 4 imports `parseAIResult` from Renderer; Tool imports both |
| 22–43 | 8 named functions | ❌ All fabricated | None exist; real: `generateDiet`, `determineAgni`, `checkViruddha`, `matchComplaintsToFiles`, `parseAIResult`, `captureChart`, `buildPdf`, `drawHeader`, `drawFooter` |
| 45–73 | 7-day weekly grid + NUTRITION SUMMARY | ❌ Fabricated | Single-day plan; ~14 `SectionType`s; no macro math |
| 98–102 | TTF/Devanagari, logo, recipe images | ❌ False | Helvetica only; text-only header; no images |
| 104–108 | IndexedDB, compression, subsetting | ❌ False | No such code in `components/tools/` |
| 113–114 | Print dialog, WhatsApp/email share | ❌ False | `pdf.save` only; no share code |
| 118 vs 100 | Selectable text vs image-based | ❌ Self-contradictory | html2canvas rasterization is the actual mechanism |
| 121 | Bi-lingual PDF | ❌ Overpromise | Devanagari cannot render/extract in current pipeline |
| — | Data location | ⚠ Omitted | `knowledge/diet-charts/` — 136 `.md` files, `import.meta.glob` |

---

## 5. Recommended Revised Structure

Rewrite the document against the real system. Suggested outline:

```
1.  Header block (author, date, status, related EGMs)
2.  Purpose & Scope
3.  System Overview — three-file architecture diagram (Tool ⇄ Renderer, Tool → PDF, PDF → Renderer's parseAIResult), 
    tool registration in pages/Tools.tsx (id 'diet', line 153)
4.  Data Layer — knowledge/diet-charts/ (136 .md files), import.meta.glob loading, matchComplaintsToFiles (max 3)
5.  Wizard Flow — 7 phases (welcome → patient → complaints → agni → prakriti → generating → result)
6.  Domain Logic — determineAgni (4 questions, 4 types); checkViruddha (6 combos); 
    Prakriti via localStorage 'ayurvritta_prakriti'
7.  AI Integration — prompt structure, doctor attribution, temperature 0.5 / max_tokens 3500, 
    120s timeout, fallback to static knowledge-base content
8.  Output Format — actual single-day template: meals-by-Agni, Pathya, Apathya, Dinacharya, Remedies, Lifestyle; 
    SectionType taxonomy (~14 types), parseAIResult, stripMarkdown
9.  PDF Pipeline — jsPDF 4.x + html2canvas 1.4.1; captureChart/buildPdf; DOM capture of #diet-chart-renderer; 
    button placement outside capture div; filename convention; header/footer drawing; 
    backdrop-filter workaround + COLOR_MAP; helvetica limitation (no Devanagari text layer) — 
    state this as a KNOWN LIMITATION, not a solved problem
10. Error Handling & UX — timeout UX, fallback content, malformed-output tolerance
11. Testing & Verification strategy
12. Known Limitations & Future Work — real candidates: native-text PDF, Devanagari embedding, share/print, caching
13. Change Log
```

Rule for the rewrite: **every named function, path, dependency, and claim must carry a file/line reference**, and any unimplemented item must move to §12 labeled "future," never stated in present tense.

---

## 6. Conclusion

This is a **beautifully formatted document about a different product**. Its Markdown hygiene (score 4) cannot offset the fact that its function inventory is 100% fabricated, its architecture diagram is wrong, its PDF capability section self-contradicts, and its opening thesis ("no server dependency") is false at line 627 of the component it documents.

**Recommendation: Reject as-is; rewrite in full** using the structure in §5, grounded in file/line references. Before the rewrite, reconcile the "106+ conditions" UI copy with the 136-file knowledge base, and correct the 45 s→120 s timeout error in the sibling codebase-details review so the three review documents agree with each other and with the code.
