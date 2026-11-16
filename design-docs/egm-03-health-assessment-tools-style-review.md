# EGM-03 Health Assessment Tools — Style Review

**Review Date:** 2026-11-13  
**Reviewer:** egm-style  
**Source Document:** `design-docs/egm-03-health-assessment-tools.md`

---

## 1. Structure Compliance

| Required Section | Present? | Quality |
|------------------|----------|---------|
| Overview | ✅ | Clear purpose, 6 tools listed |
| Tool Architecture | ✅ | ASCII tree + common pattern |
| PrakritiTool Detail | ✅ | 18 questions, Sanskrit, effects |
| LifestyleTool Detail | ✅ | 12 questions, 4 pillars |
| MedaTool Detail | ✅ | Measurements + calculations |
| SaaraTool Detail | ✅ | 8 dhatus, scoring |
| PanchakarmaTool Detail | ✅ | 5 therapies, eligibility |
| DietChartTool Detail | ✅ | Comprehensive with Agni |
| AI Integration | ✅ | Interface + implementation issues |
| PDF Generation | ✅ | Code snippet + font notes |
| Analytics Events | ✅ | Event table |
| Accessibility | ✅ | ARIA, keyboard, screen reader |
| Performance | ✅ | Metrics table |
| Known Issues | ✅ | 6 issues prioritized |
| Migration Path | ✅ | Target architecture |

**Verdict:** ✅ **All required sections present** — follows EGM health tools template comprehensively.

---

## 2. Formatting Consistency

### Tables
- ✅ Consistent pipe-aligned markdown
- ✅ Clear headers with units (lines, ms, KB)
- ✅ Known Issues table with IDs, severity, status

### Code Blocks
- ✅ Language tags: `typescript`, `mermaid`
- ✅ Interface definitions properly formatted
- ⚠️ **Inconsistent**: Some blocks use `ts`, others `typescript`

### Diagrams
- ✅ Component architecture ASCII tree (lines 8-25)
- ✅ Mermaid flowchart for DietChartTool flow (lines 1530-1570)
- ⚠️ No diagrams for other 5 tools' flows

### Headings
- ✅ Consistent hierarchy
- ✅ Numbered subsections for tool details

---

## 3. Clarity and Readability

### Strengths
- Excellent detail on each tool's questions/measurements
- Clear AI integration section showing current vs. target
- Viruddha Ahara validation well-described (lines 297-310)
- Migration path shows concrete `@react-pdf/renderer` architecture

### Issues
| Location | Issue | Severity |
|----------|-------|----------|
| Line 11 | "6 assessment tools" | ✅ Accurate |
| Line 278 | `aiService.analyzeAssessment()` interface | 🔴 **Does not exist** in code |
| Line 297 | "@react-pdf/renderer" for PDF | 🔴 **Not implemented** — uses html2canvas |
| Line 354 | "Zod schemas for each tool" | 🔴 **Not implemented** |
| Line 355 | "Error boundaries wrap each tool" | 🔴 **Not implemented** |
| Line 356 | "Auto-save to localStorage on each answer" | 🔴 **Not implemented** |
| Line 357 | "Question weights implemented" | 🔴 **Not implemented** |
| Lines 1530-1570 | Mermaid diagram only for DietChartTool | 🟡 Other 5 tools lack diagrams |

---

## 4. Completeness

### TODOs / TBDs / Placeholders
| Item | Location | Status |
|------|----------|--------|
| "Currently missing — see Known Issues" inline notes | Lines 278, 297, 354-357 | 🟡 Mixes spec + audit |
| Migration path code (lines 1600-1640) | End of doc | ✅ Good forward-looking |

### Missing Information
- No **question weight rationale** (why equal weights?)
- No **accessibility test results** (axe-core, screen reader testing)
- No **PDF file size comparison** (rasterized vs vector)
- No **AI prompt versioning strategy**
- No **offline-first architecture** details
- No **multi-language AI prompt** strategy (Hindi/Gujarati)

---

## 5. Tone and Professionalism

| Aspect | Assessment |
|--------|------------|
| Technical precision | High — specific questions, Sanskrit terms, measurements |
| Honesty about gaps | Good — "Currently missing", "Not implemented" |
| Actionability | High — migration path is concrete |
| Audit vs. Spec mixing | 🟡 **Problem** — inline audit comments in design doc |

### Tone Issues
- Lines 278, 297, 354-357: "Currently missing — see Known Issues" reads like code review in spec
- Should separate "Target Architecture" from "Current Implementation Gaps"

---

## 6. Specific Style Violations

| # | Violation | Location | Fix |
|---|-----------|----------|-----|
| 1 | False claim: `analyzeAssessment` exists | Line 278 | Move to "Planned API" section |
| 2 | False claim: @react-pdf/renderer used | Line 297 | Clarify: "Target: @react-pdf/renderer; Current: html2canvas" |
| 3 | False claims: Zod, ErrorBoundary, Auto-save, Weights | Lines 354-357 | Move to "Current Gaps" section |
| 4 | Inline audit comments in spec | Lines 278, 297, 354-357 | Separate spec from audit |
| 5 | Mermaid only for DietChartTool | Line 1530 | Add for other 5 tools or remove |
| 6 | No document frontmatter | Top of file | Add version, date, author, status |
| 7 | "85+ conditions" vs actual 106 | Line 230 | Update to 106+ |

---

## 7. Comparison to EGM Conventions

| Convention | Compliance |
|------------|------------|
| Tool architecture ASCII tree | ✅ Good |
| Interface definitions in TypeScript | ✅ Excellent |
| Flow diagram for main tool | ✅ Valid mermaid |
| Known Issues table with IDs | ✅ Clear traceability |
| Migration path with target code | ✅ Best practice |
| Frontmatter metadata | ❌ Missing |
| Separation of spec vs. current state | ⚠️ Mixed |
| Consistent code block languages | 🟡 Partial |

---

## 8. Recommendations

### Quick Wins (Do Now)
1. Add frontmatter with version, date, author, status
2. Update condition count to "106+"
3. Move all "Currently missing" notes to "Current Implementation Gaps" section
4. Clarify PDF: "Current: html2canvas+jspdf (rasterized); Target: @react-pdf/renderer"
5. Mark `analyzeAssessment` as "Planned — not yet implemented"

### Structural Improvements
1. Split document into:
   - **Target Architecture** (6 tools, unified AI, vector PDF, Zod, ErrorBoundary)
   - **Current Implementation** (what exists today per tool)
   - **Gap Analysis** (prioritized delta)
2. Add flow diagrams for PrakritiTool, LifestyleTool, MedaTool, SaaraTool, PanchakarmaTool
3. Add "Accessibility Testing" section with axe-core results
4. Add "Multi-language AI Prompts" section

### Polish
1. Make code block languages consistent (`typescript` throughout)
2. Verify all question counts against actual code
3. Add measurement validation ranges for MedaTool (e.g., waist 60-150cm)
4. Document Agni assessment algorithm source (classical text reference)

---

## 9. Overall Style Score: **70/100**

| Dimension | Score |
|-----------|-------|
| Structure | 95 |
| Formatting | 80 |
| Clarity | 65 |
| Completeness | 60 |
| Tone | 70 |
| Convention Adherence | 60 |

---

*Report generated by egm-style reviewer*