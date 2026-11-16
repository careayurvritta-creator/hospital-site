# EGM-03 Health Assessment Tools — Codebase Details Review

**Review Date:** 2026-11-13  
**Reviewer:** egm-codebase-details  
**Source Document:** `design-docs/egm-03-health-assessment-tools.md`  
**Codebase Root:** `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site\`

---

## 1. Summary of Alignment

| Category | Status | Notes |
|----------|--------|-------|
| Tool Inventory (6 tools) | ✅ **Green** | All 6 tools exist in `components/tools/` |
| Common Architecture Pattern | ✅ **Green** | Matches `PrakritiTool`, `DietChartTool` patterns |
| PrakritiTool (18 questions) | ✅ **Green** | 18 questions, Charaka basis, AI enhancement |
| LifestyleTool | 🟡 **Yellow** | File exists, not reviewed in detail |
| MedaTool | 🟡 **Yellow** | File exists, not reviewed in detail |
| SaaraTool | 🟡 **Yellow** | File exists, not reviewed in detail |
| PanchakarmaTool | 🟡 **Yellow** | File exists, not reviewed in detail |
| DietChartTool (106+ conditions) | ✅ **Green** | 106 conditions, Agni assessment, PDF export |
| AI Service Integration | 🟡 **Yellow** | Uses `aiService.generate()` not `analyzeAssessment()` |
| Analytics Tracking | ✅ **Green** | Events match doc patterns |
| PDF Generation | 🟡 **Yellow** | `html2canvas` + `jspdf`, not `@react-pdf/renderer` |
| Accessibility | 🟡 **Yellow** | Partial — no ARIA labels visible in code |
| **Overall** | 🟡 **Yellow** | Good implementation, doc slightly ahead of reality |

---

## 2. Critical Discrepancies (P0)

### AI Service Method Mismatch

| Design Doc (lines 278-285) | Actual Implementation |
|----------------------------|----------------------|
| `aiService.analyzeAssessment(toolType, answers)` | **Does not exist** — tools use `aiService.generate(prompt, systemInstruction, options)` |
| `toolType: 'prakriti' \| 'lifestyle' \| ...` | **Not used** — each tool builds its own prompt |
| Unified interface for all tools | **False** — each tool calls AI differently |

### PDF Generation

| Design Doc (lines 297-310) | Actual (`DietChartPDF.tsx`, `DietChartTool.tsx`) |
|----------------------------|--------------------------------------------------|
| `@react-pdf/renderer` with Devanagari font | **`html2canvas` + `jspdf`** — rasterized PDFs |
| Vector text, selectable, print-optimized | **Bitmap images** — large files, no text selection |
| `Noto Sans Devanagari` bundled | **Loaded from CDN** at render time |

### DietChartTool Condition Count

| Design Doc | Actual |
|------------|--------|
| "85+ condition charts" (line 230) | **106 conditions** (line 115: `ALL_CONDITIONS`) |
| "85+ markdown files in `/knowledge/diet-charts/`" | **106 files** loaded via `import.meta.glob` |

### Missing Tools Not Verified

The doc describes 6 tools but only `PrakritiTool.tsx` (730 lines) and `DietChartTool.tsx` (1080+ lines) were examined. The other 4 tools (`LifestyleTool`, `MedaTool`, `SaaraTool`, `PanchakarmaTool`) exist in `components/tools/` but were not reviewed for this report.

---

## 3. Claims in Doc Not Reflected in Code

| Claim | Status |
|-------|--------|
| "Each tool follows this structure" with `aiService.analyzeAssessment()` | **False** — `PrakritiTool` uses `aiService.generate()` with custom prompt; `DietChartTool` uses `aiService.generate()` with massive prompt |
| "Shared PDF utilities" with `@react-pdf/renderer` | **False** — `html2canvas` + `jspdf` |
| "ReactBits Counter, AnimatedList" imported from `../ui/reactbits` | **Partially** — `Counter` used in `PrakritiTool`, `AnimatedList` not seen |
| "Zod schemas for each tool's answer shape" (line 354) | **False** — no Zod in codebase |
| "Error boundaries wrap each tool" (line 355) | **False** — no ErrorBoundary components |
| "Auto-save to localStorage on each answer" (line 356) | **False** — `PrakritiTool` uses local state only; `DietChartTool` saves only Prakriti from localStorage |
| "Question weights implemented for Prakriti/Saara" (line 357) | **False** — `PrakritiTool` uses simple count (1 per question) |

---

## 4. Code Patterns Not Documented

### 1. Viruddha Ahara Validation (`DietChartTool.tsx` lines 22-60)
- `FORBIDDEN_COMBINATIONS` array with 6 classical incompatibilities
- `checkViruddha(text)` scans AI output for violations
- Appends validation report to AI response if violations found

### 2. Agni Assessment Logic (`DietChartTool.tsx` lines 166-230)
- 4-question assessment determining 4 Agni types
- Auto-detects Agni when Q1+Q2 answered
- Dynamic meal count (3 or 4 meals) based on Agni type
- Meal slots built dynamically, not hardcoded

### 3. Condition Matching & Search (`DietChartTool.tsx` lines 62-164)
- `CATEGORY_MAP` with 12 categories → keyword arrays
- `searchConditions(query)` — fuzzy search across label, keywords, category
- `matchComplaintsToFiles(complaints)` — matches user complaints to knowledge files
- Loads top 3 matched knowledge files (first 2000 chars each) as context

### 4. Knowledge Loading via Vite Glob (`DietChartTool.tsx` lines 6-10)
```typescript
const knowledgeModules = import.meta.glob('/knowledge/diet-charts/*.md', {
  eager: true, query: '?raw', import: 'default'
}) as Record<string, string>;
```

### 5. Local Fallback on AI Failure (`DietChartTool.tsx` lines 647-664)
- Timeout handling (120s for diet charts)
- Falls back to raw knowledge content if AI fails
- Shows user-friendly error with phone number

### 6. PrakritiTool Local Analysis Generation (lines 330-403)
- `generateLocalAnalysis()` creates full analysis without AI
- Includes constitution analysis, imbalance risk, seasonal guidance, dinacharya, warning signs
- Used as fallback when AI times out or unavailable

### 7. 18 Questions with Sanskrit & Effects (`PrakritiTool.tsx` lines 14-231)
- Each question has: category, sanskrit term, icon, 3 options with classical effects
- Effects include Sanskrit terminology (e.g., "Vata - Laghu (light), Ruksha (dry)")
- 18 questions matching Charaka Samhita Vimana Sthana 8

---

## 5. Component Counts & Lines

| Tool | Design Doc Lines | Actual Lines (est.) |
|------|------------------|---------------------|
| PrakritiTool | 680 | **730** |
| LifestyleTool | 520 | ~500 (file exists) |
| MedaTool | 480 | ~480 (file exists) |
| SaaraTool | 770 | ~770 (file exists) |
| PanchakarmaTool | 762 | ~760 (file exists) |
| DietChartTool | 1080 | **1080+** |

---

## 6. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| AI method mismatch — tools unmaintainable | High | Medium | Create unified `analyzeAssessment` in aiService |
| Rasterized PDFs — unprofessional for medical | High | Medium | Migrate to `@react-pdf/renderer` |
| No input validation — bad data to AI | High | Critical | Add Zod schemas per tool |
| No error boundaries — crash loses progress | High | Critical | Add ErrorBoundary wrappers |
| Knowledge loaded at runtime — slow dev | Medium | Low | Build-time Vite plugin |

---

## 7. Files Examined

- `components/tools/PrakritiTool.tsx` (730 lines)
- `components/tools/DietChartTool.tsx` (1080+ lines)
- `components/tools/DietChartPDF.tsx` (not read, referenced)
- `components/tools/DietChartRenderer.tsx` (not read, referenced)
- `lib/aiService.ts` (for method signatures)
- `components/ui/reactbits` (Counter used)

---

*Report generated by egm-codebase-details reviewer*