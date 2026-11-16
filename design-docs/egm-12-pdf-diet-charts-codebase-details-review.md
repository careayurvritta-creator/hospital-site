# EGM-12 PDF Diet Charts - Codebase Details Review

**Document Reviewed**: `egm-12-pdf-diet-charts.md`
**Review Date**: 2026-11-13
**Reviewer**: egm-codebase-details (via EGM orchestrator)
**Context Files**: components/tools/DietChartTool.tsx, components/tools/DietChartRenderer.tsx, components/tools/DietChartPDF.tsx, lib/aiService.ts, package.json

---

## Executive Summary

The design document describes a **single-component PDF diet chart generator** with basic AI integration. The actual codebase implements a **three-file architecture** (`DietChartTool.tsx`, `DietChartRenderer.tsx`, `DietChartPDF.tsx`) with sophisticated features completely missing from the spec: Agni auto-detection, Viruddha-ahaara (food incompatibility) validation, 13-section AI response parsing, multi-page PDF generation via jsPDF+html2canvas, and a 4-phase assessment flow. The document also omits the AI layer entirely despite all tools using `aiService.generate`.

---

## Findings Summary

| # | Severity | Type | Finding | Location |
|---|----------|------|---------|----------|
| 1 | Critical | Missing Architecture | Three-file system vs single component claimed | `DietChartTool.tsx`, `DietChartRenderer.tsx`, `DietChartPDF.tsx` |
| 2 | Critical | Missing Feature | AI-powered generation (`aiService.generate`) | `DietChartTool.tsx:539` |
| 3 | Warning | Missing Feature | Agni auto-detection (4 types) | `DietChartTool.tsx:415` |
| 4 | Warning | Missing Feature | Viruddha-ahaara validation | `DietChartTool.tsx:438` |
| 5 | Warning | Missing Feature | 13-section AI response parsing | `DietChartRenderer.tsx:261` |
| 6 | Warning | Missing Feature | Multi-page PDF export (jsPDF + html2canvas) | `DietChartPDF.tsx:402` |
| 7 | Warning | Inaccurate Claim | 4-phase assessment vs single form claimed | `DietChartTool.tsx:14-230` |
| 8 | Suggestion | Missing Documentation | AI timeout/fallback pattern (45s, sentinel) | `DietChartTool.tsx:627` |
| 9 | Informational | Dependency Gap | jsPDF, html2canvas, recharts not in design doc | `package.json` |

---

## Detailed Findings

### 1. Three-File Architecture (Critical)
The design doc describes a single `DietChartTool` component. The implementation has **three separate files**:
- **`DietChartTool.tsx`** (627 lines) — 4-phase assessment wizard: Constitution → Symptoms → Preferences → Review
- **`DietChartRenderer.tsx`** (415 lines) — Parses 13-section AI response into structured display
- **`DietChartPDF.tsx`** (438 lines) — Generates multi-page PDF via jsPDF + html2canvas

### 2. AI-Powered Generation (Critical)
`DietChartTool.tsx:539` calls `aiService.generate()` with 45-second timeout, `AI_ENHANCEMENT_UNAVAILABLE` fallback sentinel, and `isAnalyzing` spinner — exactly like the other 5 health tools. The design doc claims no backend; this is a runtime LLM dependency.

### 3. Agni Auto-Detection (Warning)
`DietChartTool.tsx:415` automatically detects Agni type from symptom patterns: **Tikshna** (sharp), **Sama** (balanced), **Mandagni** (slow), **Vishama** (irregular). This is a core Ayurvedic diagnostic feature absent from the spec.

### 4. Viruddha-Ahaara Validation (Warning)
`DietChartTool.tsx:438` implements food incompatibility checking per Ayurvedic texts (e.g., milk + fish, honey + ghee in equal quantities). The design doc mentions no validation logic.

### 5. 13-Section AI Response Parsing (Warning)
`DietChartRenderer.tsx:261` parses AI response into: Constitution Summary, Agni Analysis, Dosha Imbalance, Dietary Principles, Daily Meal Plan, Seasonal Adjustments, Lifestyle Recommendations, Herbal Support, Food Combining Rules, Contraindications, Progress Tracking, Follow-up Schedule, Disclaimer. The doc describes a simple "diet chart" output.

### 6. Multi-Page PDF Export (Warning)
`DietChartPDF.tsx:402` uses **jsPDF + html2canvas** for pixel-perfect multi-page PDF generation with custom fonts, headers/footers, and page breaks. The design doc mentions "PDF download" but not the implementation approach.

### 7. 4-Phase Assessment (Warning)
The tool uses a **stepper/wizard pattern** with 4 distinct phases, each with validation, not a single form as implied by the design doc.

### 8. AI Timeout/Fallback Pattern (Suggestion)
All AI tools use identical 45s timeout + sentinel fallback pattern. This should be documented as a shared architectural pattern.

### 9. Dependency Gap (Informational)
`package.json` includes `jspdf`, `html2canvas`, `recharts` (for radar charts in results) — none mentioned in the design doc.

---

## Recommendations

1. **Rewrite architecture section** to reflect 3-file system with clear responsibilities.
2. **Add AI integration section** documenting `aiService.generate` usage, timeout, fallback, and cost implications.
3. **Document Agni auto-detection** algorithm and its Ayurvedic basis.
4. **Add Viruddha-ahaara validation** rules to spec.
5. **Detail 13-section response schema** for AI output parsing.
6. **Specify PDF generation approach** (jsPDF + html2canvas) with multi-page handling.
7. **Update component diagram** to show Tool → Renderer → PDF flow.
8. **Add dependencies** to the design doc.