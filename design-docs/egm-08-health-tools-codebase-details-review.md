# EGM-08 Health Tools - Codebase Details Review

**Document Reviewed**: `egm-08-health-tools.md`
**Review Date**: 2026-11-13
**Reviewer**: egm-codebase-details (via EGM orchestrator)
**Context Files**: components/tools/ (6 files), lib/aiService.ts, package.json

---

## Executive Summary

The design document for *egm‑08* is out of date and omits major architectural decisions that are now present in the codebase.  
All **six** tools—including the previously undocumented *DietChartTool*—use an AI‑powered personalization layer (`aiService.generate`). This introduces a runtime dependency that is not reflected in the "no‑backend" claim.  
Question counts for the Lifestyle, Prakriti, and Saara tools differ significantly from the design (15 vs 12, 18 vs 45, 45 vs 7).  
The SaaraTool implements a **9‑Dhatu** assessment (Twak & Satva added) rather than a simple hair‑health quiz, and the DietChart system (three‑file architecture, Agni auto‑detection, PDF export via jsPDF+html2canvas) is completely missing from the spec.  
Finally, the shared component diagram in the design does not match the actual UI patterns (step counters, `AnimatedList`, mode‑based state machines). These gaps create serious documentation debt affecting onboarding, maintenance, and future feature planning.

---

## Findings Summary

| # | Severity | Type | Finding | Location |
|---|----------|------|---------|----------|
| 1 | Critical | Missing Feature | AI‑powered generation layer in all 6 tools | Multiple files |
| 2 | Warning | Missing Feature | DietChartTool (3‑file architecture) undocumented | Design doc §Tool Inventory |
| 3 | Warning | Inaccurate Claim | LifestyleTool: 15 questions vs 12 documented | `LifestyleTool.tsx:14‑210` |
| 4 | Warning | Inaccurate Claim | PrakritiTool: 18 questions vs 45 documented | `PrakritiTool.tsx:14‑230` |
| 5 | Warning | Inaccurate Claim | SaaraTool: 9‑Dhatu 45‑question assessment vs hair quiz | `SaaraTool.tsx:22‑176` |
| 6 | Warning | Inaccurate Claim | Shared component structure ≠ actual implementation | Design doc §Shared Component Structure |
| 7 | Suggestion | Missing Documentation | Graceful AI fallback & timeout pattern | All AI‑enabled tools |
| 8 | Suggestion | Missing Documentation | PDF export (jsPDF + html2canvas) in DietChart | `DietChartPDF.tsx` |
| 9 | Suggestion | Missing Documentation | Agni auto‑detection in DietChart | `DietChartTool.tsx` |
|10 | Informational | Knowledge mismatch | Dhatu JSON lists 7, SaaraTool uses 9 | `dhatu.json` vs `SaaraTool.tsx` |

---

## Detailed Findings

### 1. AI‑Powered Generation Layer (Critical)
*All six tools call `aiService.generate`* (see lines 539, 415, 261, 402, 438, 627).  
All use a 45‑second timeout, a `AI_ENHANCEMENT_UNAVAILABLE` fallback, and an `isAnalyzing` UI spinner.  
This introduces a backend dependency on LLM services, contrary to the "no backend" claim in the spec. It must be included in the architecture diagram and cost estimation.

### 2. DietChartSystem Undocumented (Warning)
*DietChartTool* is missing from the doc.  
It is a **three‑file** system:  
- **`DietChartTool.tsx`** – 4‑phase assessment, Agni auto‑detection, Viruddha‑ahaara validation.  
- **`DietChartRenderer.tsx`** – Parses AI response (13 sections) and displays results.  
- **`DietChartPDF.tsx`** – Generates a multi‑page PDF via jsPDF+html2canvas.  
These capabilities must be documented and reflected in the overall architectural diagram.

### 3. LifestyleTool Question Count (Warning)
The design lists 12 questions; the file actually contains *15* (lines 14‑210).  
Categories include Vaya, Meda‑Dhatu, Agni, Kostha, Ojas, Nidra, Sattva, Manas, Vyayama, Draivi, Ahara, Udaka, Rajasa, Srotas, and Dinacharya.  
The scoring weights are dosha‑specific, not a single 0‑100 lifestyle balance score as the spec implies.

### 4. PrakritiTool Question Count (Warning)
Design claims 45 questions; the component has *18* (lines 14‑230).  
It includes Agni auto‑detection and AI analysis, returning a detailed dosha breakdown.

### 5. SaaraTool Purpose Mismatch (Warning)
The doc describes a 7‑question hair‑health quiz, yet the implementation contains a **9‑Dhatu** assessment (45 questions, lines 22‑176).  
It adds *Twak* (skin) and *Satva* (mental excellence) to the classical Sapta Dhatus, which is a deliberate extension but not reflected in the spec.

### 6. Shared Component Structure Mismatch (Warning)
Design lists a `ToolContainer/QuestionCard/OptionGrid` architecture, but the code uses varying patterns across tools (step counter, mode‑based state machine, per‑dhatu radar). No shared components exist, leading to confusion for developers.

### 7. AI Fallback Pattern (Suggestion)
All AI‑enabled tools employ a graceful degradation pattern (timeout, sentinel, base results). This should be documented for consistency.

### 8. PDF Generation (Suggestion)
`DietChartPDF.tsx` provides PDF export (jsPDF + html2canvas). The feature is not captured in the Results Sharing section.

### 9. Agni Auto‑Detection (Suggestion)
`DietChartTool.tsx` automatically detects Agni type from symptoms—Tikshna, Sama, Mandagni, Vishama. The feature is missing from the spec.

### 10. Knowledge File Discrepancy (Informational)
`dhatu.json` lists 7 Sapta Dhatus, whereas SaaraTool uses 9 Dhatus (adds Twak & Satva). The extension should be explained in the documentation.

---

## Recommendations

1. **Revise `egm-08-health-tools.md`** to list 6 tools, include DietChartTool, and state AI integration.  
2. **Update the shared component diagram** to reflect the realities of each tool or create a reusable component layer that matches the doc.  
3. **Correct question counts** for Lifestyle (15), Prakriti (18), and Saara (45).  
4. **Document the AI layer**: timeout handling, fallback state, dependency on LLM services, impact on cost.  
5. **Add a section on the DietChart system**: 3‑file split, Agni auto‑detection, PDF export.  
6. **Explain the 9‑Dhatu extension** in SaaraTool and describe the deviation from the Sapta Dhatu model.  
7. **Include a note on aiService usage** and repository endpoints needed for the AI layer.  
8. **Review and align all UI patterns** with the documented architecture or adjust the spec accordingly.