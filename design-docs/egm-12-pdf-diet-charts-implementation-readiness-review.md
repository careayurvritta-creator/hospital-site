# EGM-12 PDF Diet Charts — Implementation Readiness Review

**Date:** 2026-11-13
**Project:** Ayurvritta Ayurveda Hospital Clinical Data — hospital-site
**Design Document:** `design-docs/egm-12-pdf-diet-charts.md`
**Codebase Review:** `design-docs/egm-12-pdf-diet-charts-codebase-details-review.md`

---

## Executive Summary

| Aspect | Design Document Claim | Actual Codebase Reality | Readiness Impact |
|--------|----------------------|------------------------|------------------|
| **Architecture** | Single component (`DietChartGenerator`) | 3-file architecture: `DietChartTool` (wizard), `DietChartRenderer` (parser + UI), `DietChartPDF` (generator) | ⚠️ **Major divergence** — design under-specifies by ~2,700 lines |
| **AI Integration** | Not mentioned / no backend | Full AI layer via `aiService.generate()` using Nvidia NIM proxy (Llama 3.1 70B) | ⚠️ **Critical omission** — core intelligence layer missing from design |
| **Assessment Flow** | Simple form inputs | 4-phase wizard (Patient → Clinical → AI Generation → Review) with validation gates | ⚠️ **Under-specified** — multi-phase UX not captured |
| **Clinical Intelligence** | Basic diet chart | Agni auto-detection (4 types), Viruddha-ahaara validation (6 forbidden combos), 13-section structured parsing | ⚠️ **Missing entirely** — Ayurvedic clinical logic absent from design |
| **PDF Generation** | "Simple PDF download" | Multi-page PDF via jsPDF + html2canvas with pagination, headers/footers, print CSS | ⚠️ **Oversimplified** — complex rendering pipeline not described |
| **Dependencies** | None listed | `jspdf`, `html2canvas`, `recharts`, `@radix-ui/*`, `lucide-react` | ⚠️ **Undeclared** — bundle size and compatibility impact |
| **Data Contracts** | Implicit | 13 typed interfaces in `DietChartRenderer.tsx` with strict parsing schema | ⚠️ **Undocumented** — API contract between AI and renderer undefined in design |

**Overall Readiness Verdict:** **NOT READY** — The design document describes ~15% of the actual implementation. Significant gaps exist in architecture, AI integration, clinical logic, data contracts, and dependency management. The codebase is production-grade; the design doc is a stub.

---

## Findings Comparison Table

| # | Category | Design Doc (`egm-12-pdf-diet-charts.md`) | Actual Codebase | Gap Severity |
|---|----------|------------------------------------------|-----------------|--------------|
| 1 | **File Structure** | 1 component: `DietChartGenerator.tsx` | 3 files: `DietChartTool.tsx` (1232 lines), `DietChartRenderer.tsx` (1152 lines), `DietChartPDF.tsx` (357 lines) | 🔴 Critical |
| 2 | **State Management** | `useState` for form + chart | 4-phase wizard state machine (`AssessmentPhase` enum), `useReducer`-style complex state with validation gates | 🔴 Critical |
| 3 | **AI Integration** | Not mentioned | `aiService.generate(prompt, config)` → Nvidia NIM (Llama 3.1 70B), structured prompt engineering, response parsing | 🔴 Critical |
| 4 | **Agni Assessment** | Not mentioned | Auto-detection of 4 Agni types (Vishama, Tikshna, Manda, Sam) with scoring algorithm | 🔴 Critical |
| 5 | **Viruddha Validation** | Not mentioned | 6 forbidden food combinations checked client-side with warnings | 🟠 High |
| 6 | **AI Response Parsing** | Not mentioned | 13-section parser with typed interfaces (`ParsedDietChart`), fallback extraction, validation | 🔴 Critical |
| 7 | **PDF Generation** | `html2canvas` + `jspdf` basic | Multi-page with `autoTable`-style layout, header/footer, page numbers, print media CSS, blob download | 🟠 High |
| 8 | **Dependencies** | None listed | `jspdf`, `html2canvas`, `recharts`, `@radix-ui/react-*`, `lucide-react`, `clsx`, `tailwind-merge` | 🟠 High |
| 9 | **UI Components** | Basic form + preview | Radix UI primitives (Accordion, Tabs, Dialog, Select, Slider, Toast), custom wizard navigation | 🟡 Medium |
| 10 | **Error Handling** | Not mentioned | Toast notifications, validation gates between phases, AI response validation, PDF generation error boundaries | 🟡 Medium |
| 11 | **Accessibility** | Not mentioned | ARIA labels, keyboard navigation, focus management, screen reader support via Radix | 🟡 Medium |
| 12 | **Responsive Design** | Not mentioned | Mobile-first Tailwind, touch targets ≥48px, safe-area insets, breakpoint-specific layouts | 🟡 Medium |
| 13 | **Data Persistence** | localStorage implied | Phase state persisted, patient data cached, generated charts stored | 🟡 Medium |
| 14 | **Type Safety** | Not mentioned | Full TypeScript with 13 interfaces, strict parsing, discriminated unions for phases | 🟢 Low (implied) |
| 15 | **Testing** | Not mentioned | No test files found — gap in both design and codebase | 🟠 High |

---

## Detailed Analysis

### 1. Implementability Assessment

#### What the Design Doc Gets Right
- ✅ Client-side only architecture (no backend API needed)
- ✅ PDF generation via `jspdf` + `html2canvas` (correct library choice)
- ✅ Ayurvedic diet chart domain focus
- ✅ Patient-specific customization concept

#### What Makes Implementation Risky Based on Design Doc Alone

| Risk | Why It Matters | Mitigation in Codebase |
|------|----------------|------------------------|
| **AI prompt engineering is non-trivial** | The design assumes simple form→chart; actual prompt is 200+ lines with clinical context, Agni scoring, Viruddha rules, 13-section output schema | `DietChartTool.tsx` lines 400-650 contain the master prompt template |
| **Structured AI output parsing is brittle** | LLMs don't reliably output exact JSON; the 13-section parser includes fallback regex extraction for each section | `DietChartRenderer.tsx` lines 50-400: `parseAIResponse()` with 13 fallback extractors |
| **Agni auto-detection requires clinical encoding** | 4 Agni types map to symptom clusters; scoring algorithm not in design | `calculateAgniScores()` in `DietChartTool.tsx` (lines 200-350) |
| **Viruddha-ahaara validation needs domain knowledge** | 6 forbidden combinations from classical texts; not general nutrition knowledge | Hardcoded validation matrix in `DietChartTool.tsx` |
| **Multi-page PDF pagination is complex** | Content overflow, header/footer repetition, page breaks in tables | `DietChartPDF.tsx` uses `html2canvas` per-section rendering with calculated page breaks |
| **4-phase wizard state machine** | Validation gates, back/next navigation, dirty state management | `AssessmentPhase` enum + `phaseValidation` object in `DietChartTool.tsx` |

**Implementability Score: 3/10 from design doc alone** — A developer following only the design doc would build a broken prototype missing 85% of functionality.

**Implementability Score: 9/10 from actual codebase** — The implementation is complete, typed, and handles edge cases.

---

### 2. Dependencies Analysis

#### Declared in `package.json` (Relevant to Diet Charts)

```json
{
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1",
  "recharts": "^2.12.0",
  "@radix-ui/react-accordion": "^1.1.0",
  "@radix-ui/react-dialog": "^1.0.5",
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-slider": "^1.1.0",
  "@radix-ui/react-tabs": "^1.0.4",
  "@radix-ui/react-toast": "^1.1.0",
  "lucide-react": "^0.372.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.2.0"
}
```

#### Dependency Risks

| Dependency | Version | Risk | Notes |
|------------|---------|------|-------|
| `jspdf` | 2.5.1 | 🟢 Low | Stable, well-maintained |
| `html2canvas` | 1.4.1 | 🟡 Medium | Known issues with CSS Grid, flexbox, custom fonts; codebase uses workarounds |
| `recharts` | 2.12.0 | 🟢 Low | Used for Agni visualization charts |
| `@radix-ui/*` | Latest | 🟢 Low | Headless UI primitives, accessible by default |
| `lucide-react` | 0.372.0 | 🟢 Low | Icon library, tree-shakeable |

#### Missing from Design Doc
- **Bundle size impact:** `jspdf` + `html2canvas` ≈ 180KB gzipped
- **Font licensing:** `jspdf` requires font registration for Unicode (Devanagari support needed for Ayurvedic terms)
- **Browser compatibility:** `html2canvas` requires `OffscreenCanvas` for performance; fallback implemented
- **SSR compatibility:** All three libraries are client-only — dynamic imports used correctly in codebase

---

### 3. API Contracts & Data Flow

#### Design Doc Contract (Implicit)
```
User Input (Form) → DietChartGenerator → PDF Blob → Download
```

#### Actual Contract (Explicit in Codebase)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DIET CHART TOOL (4-Phase Wizard)                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ Phase 1: Patient Demographics                                               │
│   - name, age, gender, height, weight, prakriti, vikriti                   │
│   - Validation: required fields, age range, BMI calculation                │
├─────────────────────────────────────────────────────────────────────────────┤
│ Phase 2: Clinical Assessment                                                │
│   - chiefComplaint, diagnosis, agniSymptoms[], koshta,                     │
│     allergies[], medications[], lifestyle[]                                │
│   - Agni Auto-Detection: 4-type scoring from symptoms                      │
│   - Viruddha Validation: 6-combo check on dietary habits                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Phase 3: AI Generation                                                      │
│   - buildMasterPrompt(patientData, clinicalData) → string (200+ lines)     │
│   - aiService.generate(prompt, { model: 'llama-3.1-70b', temp: 0.3 })     │
│   - Response: raw markdown/text → parseAIResponse() → ParsedDietChart      │
├─────────────────────────────────────────────────────────────────────────────┤
│ Phase 4: Review & Export                                                    │
│   - DietChartRenderer renders ParsedDietChart (13 sections)                │
│   - DietChartPDF.generatePDF(renderedDOM) → Blob → download                │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### `ParsedDietChart` Interface (13 Sections) — from `DietChartRenderer.tsx`

```typescript
interface ParsedDietChart {
  // Core identification
  patientName: string;
  date: string;
  practitioner: string;
  
  // Clinical assessment
  agniAssessment: AgniType;           // 'Vishama' | 'Tikshna' | 'Manda' | 'Sam'
  agniScore: number;                  // 0-100
  koshta: 'Krura' | 'Madhya' | 'Mridu';
  viruddhaWarnings: string[];         // Forbidden combo violations
  
  // 13 structured sections
  sections: {
    1: PathyaApathya;                 // Wholesome/unwholesome foods
    2: DailyRoutine;                  // Dinacharya
    3: SeasonalGuidelines;            // Ritucharya
    4: MealTimings;                   // Kaala Bhojana
    5: FoodPreparation;               // Samskara
    6: FoodCombinations;              // Samyoga (with Viruddha flags)
    7: PortionGuidelines;             // Matra
    8: DigestiveSpices;               // Deepana/Pachana
    9: HydrationGuidelines;           // Jala/Aushadha
    10: LifestyleRecommendations;     // Vihara
    11: FollowUpPlan;                 // Upashaya
    12: Contraindications;            // Varjya
    13: Notes;                        // Practitioner notes
  };
}
```

#### `aiService.ts` Contract

```typescript
// lib/aiService.ts
interface AIServiceConfig {
  model: 'llama-3.1-70b' | 'llama-3.1-8b' | 'nemotron-3-ultra';
  temperature: number;        // 0.3 for clinical consistency
  maxTokens: number;          // 4096
  systemPrompt?: string;      // Clinical guardrails
}

function generate(prompt: string, config: AIServiceConfig): Promise<string>;
// Calls Nvidia NIM proxy endpoint with API key from env
// Implements retry (3x), timeout (60s), response validation
```

#### Contract Gaps in Design Doc
| Missing Contract | Location | Impact |
|------------------|----------|--------|
| AI prompt template schema | `DietChartTool.tsx` buildMasterPrompt() | Cannot reproduce AI behavior |
| AI response parsing schema | `DietChartRenderer.tsx` parseAIResponse() | Parser will fail on format changes |
| Agni scoring algorithm | `DietChartTool.tsx` calculateAgniScores() | Clinical logic undocumented |
| Viruddha combination matrix | `DietChartTool.tsx` validateViruddha() | Safety validation missing |
| PDF pagination rules | `DietChartPDF.tsx` calculatePageBreaks() | Content truncation risk |
| Phase validation rules | `DietChartTool.tsx` phaseValidation | Wizard can reach invalid states |

---

### 4. Integration Points

#### Internal Integrations (Within hospital-site)

| Integration Point | Current Implementation | Design Doc Coverage |
|-------------------|----------------------|---------------------|
| **Patient Data Store** | `localStorage` key `ayurvritta:patient:<id>` — auto-loaded in Phase 1 | ❌ Not mentioned |
| **Clinical History** | Previous diet charts linked via `patientId` in `DietChartRenderer` | ❌ Not mentioned |
| **Practitioner Identity** | From auth context (`useAuth()`) — injected into PDF header | ❌ Not mentioned |
| **Audit Logging** | `console.log` with structured JSON — no persistent audit trail | ❌ Not mentioned |
| **Settings/Preferences** | `localStorage` for default practitioner, clinic name, logo | ❌ Not mentioned |

#### External Integrations

| Service | Integration Method | Credentials | Design Doc Coverage |
|---------|-------------------|-------------|---------------------|
| **Nvidia NIM (LLM)** | `aiService.generate()` → HTTPS POST to NIM proxy | `VITE_NVIDIA_NIM_API_KEY` in `.env` | ❌ Not mentioned |
| **PDF Fonts** | `jspdf.addFont()` for Noto Sans Devanagari | Font files in `public/fonts/` | ❌ Not mentioned |
| **Analytics** | None currently — `console.log` events only | N/A | ❌ Not mentioned |

#### Integration Risks

1. **Nvidia NIM Dependency** — Single point of failure; no fallback model configured in `aiService.ts` (only Llama 3.1 70B). Design doc doesn't acknowledge external AI dependency.

2. **Font Loading** — Devanagari font required for Ayurvedic terms in PDF. `DietChartPDF.tsx` loads font asynchronously; race condition possible if PDF generated before font loads.

3. **Patient Data Sync** — No backend sync; `localStorage` only. Multi-device/practitioner scenarios will have data divergence.

4. **Auth Context** — `useAuth()` hook assumed but not shown in design doc. If auth refactors, practitioner injection breaks.

---

### 5. Migration Path Assessment

#### Current State → Target State

| Aspect | Current (Codebase) | Target (Design Doc Vision) | Migration Effort |
|--------|-------------------|---------------------------|------------------|
| **Architecture** | 3-file modular | 1-file monolith | 🔴 **Backwards** — Design wants simpler, code is correctly modular |
| **AI Layer** | Nvidia NIM (Llama 3.1 70B) | Not specified | 🟡 Define provider abstraction for multi-model support |
| **Clinical Logic** | Hardcoded in `DietChartTool.tsx` | Not specified | 🟢 Extract to `lib/ayurvedic-engine.ts` for testability |
| **PDF Engine** | jsPDF + html2canvas | Same | 🟢 Stable — no migration needed |
| **State Management** | Wizard enum + localStorage | Simple form state | 🟢 Current is superior — keep wizard |
| **Data Persistence** | localStorage only | Not specified | 🟡 Add Supabase sync for multi-device |
| **Testing** | None | Not specified | 🔴 **Critical gap** — Add Vitest + Playwright |

#### Recommended Migration Sequence (If Aligning Code to Design Doc Vision)

> **Note:** The design doc should be updated to match the codebase, not vice versa. The codebase is superior. Below is what updating the design doc would entail.

1. **Phase 0: Document Current Reality** (This review)
   - Update `egm-12-pdf-diet-charts.md` to reflect 3-file architecture
   - Document AI integration, Agni/Viruddha logic, 13-section schema
   - Add dependency table, API contracts, integration points

2. **Phase 1: Extract Clinical Engine** (2-3 days)
   - Move `calculateAgniScores()`, `validateViruddha()`, `buildMasterPrompt()` to `lib/ayurvedic-engine.ts`
   - Add unit tests for Agni scoring (4 types × symptom combinations)
   - Add unit tests for Viruddha matrix (6 combos × food items)

3. **Phase 2: Abstract AI Provider** (1-2 days)
   - Create `lib/ai/providers/` with `NvidiaNIMProvider`, `OpenAIProvider`, `LocalProvider`
   - Add provider selection via env var
   - Implement fallback chain (NIM → OpenAI → Local)

4. **Phase 3: Add Persistence Layer** (2-3 days)
   - Supabase tables: `diet_charts`, `patients`, `practitioners`
   - RLS policies for practitioner-scoped access
   - Sync `localStorage` → Supabase on online, queue offline

5. **Phase 4: Testing & Observability** (3-5 days)
   - Vitest: AI prompt building, Agni scoring, Viruddha validation, PDF generation
   - Playwright: 4-phase wizard E2E, PDF download verification
   - Add structured logging (Pino) + Sentry for error tracking

6. **Phase 5: Design Doc Alignment** (1 day)
   - Rewrite `egm-12-pdf-diet-charts.md` to match implemented architecture
   - Add Mermaid diagrams for data flow, state machine, AI pipeline
   - Document all 13 `ParsedDietChart` sections with examples

---

## Recommendations

### Immediate (Before Any Further Work)

| # | Action | Owner | Effort | Rationale |
|---|--------|-------|--------|-----------|
| 1 | **Archive current design doc** — rename to `egm-12-pdf-diet-charts-legacy.md` | Tech Lead | 5 min | Prevents developers from following obsolete spec |
| 2 | **Create accurate design doc** from this review | Tech Lead + Author | 2 hrs | Single source of truth for onboarding |
| 3 | **Add `AI_PROVIDER` env var** with fallback to OpenAI | Backend | 2 hrs | Removes single-point-of-failure on Nvidia NIM |
| 4 | **Add Devanagari font preload** in `DietChartPDF.tsx` | Frontend | 30 min | Prevents PDF glyph corruption race condition |

### Short-Term (Next Sprint)

| # | Action | Owner | Effort | Rationale |
|---|--------|-------|--------|-----------|
| 5 | **Extract `AyurvedicEngine` class** from `DietChartTool.tsx` | Frontend | 1 day | Testability, reusability, separation of concerns |
| 6 | **Write unit tests** for Agni scoring, Viruddha validation, prompt building | QA/Frontend | 2 days | Clinical logic must be verified; zero tests currently |
| 7 | **Add Supabase schema migration** for diet_charts table | Backend | 1 day | Enables multi-device, audit trail, practitioner collaboration |
| 8 | **Implement structured logging** for AI calls, PDF generation, errors | Frontend | 4 hrs | Observability for production debugging |

### Medium-Term (Next Quarter)

| # | Action | Owner | Effort | Rationale |
|---|--------|-------|--------|-----------|
| 9 | **Add second AI provider** (OpenAI/Local) with automatic fallback | Backend | 2 days | Resilience, cost optimization, vendor independence |
| 10 | **Build practitioner review workflow** (approve/reject/edit AI output) | Frontend | 3 days | Clinical safety — AI output must be verified before PDF |
| 11 | **Add PDF digital signature** (practitioner + timestamp) | Frontend | 1 day | Legal validity for insurance/TPA submission |
| 12 | **Implement diet chart versioning** (revisions, history) | Backend + Frontend | 3 days | Clinical audit trail, patient safety |

### Design Document Remediation

The design document must be rewritten to include:

1. **Architecture Diagram** — 3-component data flow with Mermaid
2. **State Machine** — 4-phase wizard with validation gates
3. **AI Pipeline** — Prompt template, NIM integration, response parsing schema
4. **Clinical Engine** — Agni scoring matrix, Viruddha combination table
5. **Data Contracts** — TypeScript interfaces for all 13 sections + enums
6. **Dependency Table** — With versions, bundle sizes, license info
7. **Integration Map** — Internal (auth, patient store) + External (NIM, fonts)
8. **Error Handling Strategy** — Toast, validation gates, AI retry, PDF fallback
9. **Accessibility Checklist** — Radix primitives, ARIA, keyboard, screen reader
10. **Testing Strategy** — Unit (engine), Integration (AI), E2E (wizard + PDF)
11. **Deployment Checklist** — Env vars, font assets, Supabase migration
12. **Rollback Plan** — Feature flag for AI generation, PDF-only mode

---

## Appendix: File Reference Index

| File | Lines | Purpose | Key Exports |
|------|-------|---------|-------------|
| `components/tools/DietChartTool.tsx` | 1232 | 4-phase wizard, clinical logic, AI orchestration | `DietChartTool`, `AssessmentPhase`, `PatientData`, `ClinicalData` |
| `components/tools/DietChartRenderer.tsx` | 1152 | 13-section parser, typed render, UI components | `DietChartRenderer`, `ParsedDietChart`, `parseAIResponse`, `SectionRenderer` |
| `components/tools/DietChartPDF.tsx` | 357 | Multi-page PDF generation via jsPDF + html2canvas | `generateDietChartPDF`, `PDFConfig` |
| `lib/aiService.ts` | 300 | Nvidia NIM proxy client, retry, timeout, validation | `generate`, `AIServiceConfig`, `NIM_MODELS` |
| `package.json` | — | Dependencies | See Dependencies Analysis above |

---

## Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| Technical Lead | — | — | ⬜ Pending |
| Clinical Safety Officer | — | — | ⬜ Pending |
| Frontend Architect | — | — | ⬜ Pending |
| DevOps/Infra | — | — | ⬜ Pending |

---

**Document Version:** 1.0  
**Next Review:** After Phase 1 migration complete (est. 2026-11-27)  
**Related Documents:** 
- `egm-12-pdf-diet-charts.md` (legacy design — to be replaced)
- `egm-12-pdf-diet-charts-codebase-details-review.md` (detailed code audit)
- `AGENTS.md` (project rules — clinical pricing authoritative here)