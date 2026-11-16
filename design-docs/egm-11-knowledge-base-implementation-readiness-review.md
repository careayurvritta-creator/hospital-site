# EGM-11 Knowledge Base — Implementation Readiness Review

**Date:** 2026-11-13
**Project:** Ayurvritta Ayurveda Hospital Clinical Data — hospital-site
**Design Document:** `design-docs/egm-11-knowledge-base.md`
**Codebase Review:** `design-docs/egm-11-knowledge-base-codebase-details-review.md`

---

## Executive Summary

| Aspect | Design Document Claim | Actual Codebase Reality | Readiness Impact |
|--------|----------------------|------------------------|------------------|
| **RAG Engine** | `retrieveKnowledge(query, maxChunks=3)` exports from `knowledge/index.ts` | ✅ **Verified** — function exists, 197 lines, exports match spec | ✅ Accurate |
| **AI Integration** | §"Integration with AI Chatbot" — RAG feeds chatbot system prompt | ❌ **Fabricated** — `lib/aiService.ts` has ZERO knowledge imports; `ChatBot.tsx` builds hardcoded system prompt (lines 112-159) with inline hospital details/pricing | 🔴 Critical |
| **Knowledge Consumers** | Implicit: chatbot uses RAG | ❌ **Zero consumers** — no file imports `@/knowledge`; only real usage is `DietChartTool.tsx` via `import.meta.glob('/knowledge/diet-charts/*.md')` | 🔴 Critical |
| **Prakriti Schema** | `type`, `physical_traits`, `mental_traits`, `dietary_recommendations`, `lifestyle_recommendations` | ✅ **Matches exactly** — but only 3 types (Vata/Pitta/Kapha), not 7 (design lists 7 Sanskrit names) | 🟠 Count mismatch |
| **Pathya Count** | "~86 chunks" implies comprehensive coverage | ⚠️ **5 specialty conditions** (`prameha_diabetes`, `thyroid_hypothyroid`, `kidney_ckd`, `obesity_sthaulya`, `pcod`) — deliberate curation, not error | 🟠 Misleading |
| **Services Count** | 9 service categories implied | ⚠️ **7 categories + 5 programs** — program names FABRICATED in design (claims "Panchakarma Detox", "Post-COVID Recovery", "Geriatric Care"; actual: "Thyroid Reset Program", "Diabetes & Metabolic Rebalance", "CKD Integrative Support", "Stress Relief Panchakarma", "Weight Loss & Metabolic Fatigue") | 🟠 Fabricated names |
| **Chunk Total** | ~86 chunks | **35 chunks** (3+7+3+5+5+7+5) — math verified | 🟠 Overstated |
| **Diet Charts** | "85+ diet charts" | **136 files** (135 charts + README.md), 677 KB, 3 Marathi files | 🟡 Understated |
| **Chunk Building** | "Per import" (Limitations table) | ⚠️ **Per query** — `buildKnowledgeChunks()` called inside `retrieveKnowledge()` at runtime | 🟡 Mischaracterized |
| **HOSPITAL_INFO** | Shape: `name`, `doctor`, `phone`, `address`, `hours`, `specialty` | ✅ **Matches exactly** | ✅ Accurate |
| **Prior Review** | `egm-11-knowledge-base-codebase-details-review.md` | ❌ Contains **fabricated code quotes** — claims `name`/`physicalCharacteristics` fields, `byCondition` key, `hospitalInfo`/`serviceCategories`/`wellnessPrograms`, `getAIResponse()` in aiService.ts — none exist | 🔴 Must supersede |

**Overall Readiness Verdict:** **NEEDS WORK** — The RAG engine itself is correctly implemented and matches the design spec. However, the documentation describes an **aspirational integration state** that does not exist: the AI chatbot integration section fabricates a RAG→chatbot connection that is absent from the codebase. The design doc also contains material factual errors (fabricated program names, overstated entity counts) and the prior codebase-details-review contains hallucinated code quotes. The implementation is sound; the documentation is misleading.

---

## Findings Comparison Table

| # | Category | Design Doc (`egm-11-knowledge-base.md`) | Actual Codebase | Gap Severity |
|---|----------|------------------------------------------|-----------------|--------------|
| 1 | **RAG Engine API** | `retrieveKnowledge(query, maxChunks=3)`, `getKnowledgeContext()`, `HOSPITAL_INFO{}` | ✅ **Exact match** — `knowledge/index.ts` lines 1-197 | 🟢 Accurate |
| 2 | **AI Integration** | §"Integration with AI Chatbot" — RAG provides context to chatbot | ❌ **Does not exist** — `lib/aiService.ts` (300 lines) has no knowledge import; `ChatBot.tsx` (lines 112-159) builds hardcoded system prompt | 🔴 Critical |
| 3 | **Knowledge Consumers** | Implicit: chatbot uses RAG | ❌ **Zero imports** — no file imports `@/knowledge`; only consumer is `DietChartTool.tsx` via `import.meta.glob` | 🔴 Critical |
| 4 | **Prakriti Schema** | `type`, `physical_traits`, `mental_traits`, `dietary_recommendations`, `lifestyle_recommendations` | ✅ **Schema matches** — but 3 types (Vata/Pitta/Kapha Prakriti), not 7 (design lists Vataja, Pittaja, etc.) | 🟠 Schema ✅, Count ❌ |
| 5 | **Pathya Schema** | `by_condition` with `pathya`/`apathya` arrays | ✅ **Exact match** — 5 conditions: `prameha_diabetes`, `thyroid_hypothyroid`, `kidney_ckd`, `obesity_sthaulya`, `pcod` | 🟢 Accurate |
| 6 | **Services Schema** | 9 categories implied | ⚠️ **7 categories + 5 programs** — program names FABRICATED (design: "Panchakarma Detox"; actual: "Thyroid Reset Program", etc.) | 🟠 Fabricated names |
| 7 | **Chunk Total** | ~86 chunks | **35 chunks** (verified: 3+7+3+5+5+7+5) | 🟠 Overstated 2.5x |
| 8 | **Diet Charts** | "85+ diet charts" | **136 files** (135 charts + README), 677 KB, 3 Marathi | 🟡 Understated |
| 9 | **Chunk Build Timing** | "Per import" (Limitations table) | ⚠️ **Per query** — `buildKnowledgeChunks()` called inside `retrieveKnowledge()` at runtime | 🟡 Mischaracterized |
| 10 | **Search Scoring** | +10 topic, +3 keyword, +1 content, top-3, >0 filter | ✅ **Exact match** — `knowledge/index.ts` lines 85-110 | 🟢 Accurate |
| 11 | **HOSPITAL_INFO Shape** | `name`, `doctor`, `phone`, `address`, `hours`, `specialty` | ✅ **Exact match** — `knowledge/index.ts` lines 15-25 | 🟢 Accurate |
| 12 | **Address Consistency** | HOSPITAL_INFO: "Gotri, Vadodara" | ⚠️ **Drift** — `ChatBot.tsx` line 129 omits "Gotri" (says "Vadodara, Gujarat") | 🟡 Minor inconsistency |
| 13 | **Type Safety** | Implicit | ⚠️ **`any` types** in `buildKnowledgeChunks()` — no TypeScript interfaces | 🟡 Technical debt |
| 14 | **Extra Properties** | Not mentioned | ⚠️ **`formation_time`** in dhatu.json (8 items, not 7); `services.json` has `topic`, `location`, `phone`, `hours`, `chief_physician`, `specialty`, `approach`, `insurance`, `booking` — not in design | 🟡 Undocumented |
| 15 | **Testing** | Not mentioned | ❌ **No tests** — no `*.test.ts` files in `knowledge/` | 🟠 Missing |
| 16 | **Prior Review Accuracy** | `egm-11-knowledge-base-codebase-details-review.md` | ❌ **Fabricated quotes** — claims `name`/`physicalCharacteristics` fields, `byCondition` key, `hospitalInfo`/`serviceCategories`/`wellnessPrograms`, `getAIResponse()` in aiService.ts — none exist | 🔴 Must supersede |

---

## Detailed Analysis

### 1. Implementability Assessment

#### What the Design Doc Gets Right
- ✅ **RAG engine API** — `retrieveKnowledge(query, maxChunks=3)` and `getKnowledgeContext()` are correctly implemented and exported
- ✅ **Search scoring algorithm** — +10 topic, +3 keyword, +1 content, top-3 selection, >0 threshold (verified lines 85-110)
- ✅ **HOSPITAL_INFO shape** — all 6 fields present and correctly typed
- ✅ **JSON schemas** — prakriti, pathya, tridosha, dhatu, panchakarma, chikitsa schemas match spec (field names, not counts)
- ✅ **Chunk ID format** — "dosha-vata", "panchakarma-vamana", etc. match implementation
- ✅ **Corrected Claims table** — good practice of documenting what changed (but counts still wrong)

#### What Makes Implementation Risky Based on Design Doc Alone

| Risk | Why It Matters | Reality Check |
|------|----------------|---------------|
| **AI integration is fabricated** | §"Integration with AI Chatbot" describes RAG→chatbot context injection | ❌ `lib/aiService.ts` (300 lines) has ZERO knowledge imports; `ChatBot.tsx` (lines 112-159) builds a fully hardcoded system prompt with inline hospital details and pricing table |
| **RAG engine is dead code** | Design assumes chatbot uses RAG | ❌ No file imports `@/knowledge`; the only consumer is `DietChartTool.tsx` via `import.meta.glob('/knowledge/diet-charts/*.md')` for diet chart file lookup |
| **Entity counts are aspirational** | Design presents 7 prakriti types, 50+ pathya conditions, 9 services as current state | ⚠️ Actual: 3 prakriti (Vata/Pitta/Kapha), 5 pathya (specialty conditions), 7 services + 5 programs — deliberate curation to hospital specialty, not comprehensive |
| **Program names are fabricated** | Design lists "Panchakarma Detox", "Post-COVID Recovery", "Geriatric Care" | ❌ Actual programs: "Thyroid Reset Program", "Diabetes & Metabolic Rebalance", "CKD Integrative Support", "Stress Relief Panchakarma", "Weight Loss & Metabolic Fatigue" |
| **Chunk rebuild timing** | Limitations table says "per import" | ⚠️ `buildKnowledgeChunks()` is called inside `retrieveKnowledge()` at **per-query runtime** — not cached per import |
| **Prior review contains hallucinations** | `egm-11-knowledge-base-codebase-details-review.md` quotes non-existent code | ❌ Claims `name`/`physicalCharacteristics` fields (actual: `type`/`physical_traits`), `byCondition` key (actual: `by_condition`), `hospitalInfo`/`serviceCategories`/`wellnessPrograms` (actual: flat structure), `getAIResponse()` in aiService.ts (does not exist) |

**Implementability Score: 5/10 from design doc alone** — A developer could implement the RAG engine correctly (it's already done), but the AI integration section describes a non-existent connection, and the entity counts/program names are materially wrong.

**Implementability Score: 8/10 from actual codebase** — The RAG engine is complete and matches the spec; the missing piece is wiring it into the chatbot (which requires updating `ChatBot.tsx`, not `knowledge/index.ts`).

---

### 2. Dependencies Analysis

#### Declared in `knowledge/index.ts`
```typescript
import type {
  Prakriti,
  Tridosha,
  Dhatu,
  Panchakarma,
  Pathya,
  Service,
  Chikitsa
} from '@/types/knowledge';
```

#### Dependency Risks

| Dependency | Risk | Notes |
|------------|------|-------|
| **Type imports** | 🟢 Low | All types defined in `@/types/knowledge` — verified imports |
| **JSON imports** | 🟢 Low | TypeScript resolves `.json` imports via `tsconfig.json` |
| **No external libs** | 🟢 Low | Pure TypeScript — no npm dependencies for RAG engine |
| **`any` types** | 🟡 Medium | `buildKnowledgeChunks()` uses `any` throughout — should be typed |

#### Missing from Design Doc
- **Type definitions** — `@/types/knowledge` not mentioned (but exists and is correct)
- **No caching** — chunks rebuilt per query; no memoization strategy documented
- **No test strategy** — no test plan for RAG engine

---

### 3. API Contracts & Data Flow

#### Design Doc Contract (Verified)
```
User Query → retrieveKnowledge(query, maxChunks=3) → Scored chunks → Top-3 results
```

#### Actual Data Flow (Verified)
```
User Query → ChatBot.tsx (hardcoded system prompt) → Nvidia NIM API → Response
                         ↓
            (NO RAG INTEGRATION)
```

#### Expected Data Flow (Per Design Doc)
```
User Query → ChatBot.tsx → retrieveKnowledge(query) → System prompt context → Nvidia NIM API → Response
```

#### Gap Analysis
- ❌ **Missing link** — `ChatBot.tsx` does not import or call `retrieveKnowledge()`
- ❌ **System prompt duplication** — `ChatBot.tsx` line 129 has hardcoded hospital details (with address drift: omits "Gotri")
- ❌ **Pricing table duplication** — `ChatBot.tsx` lines 145-155 have inline pricing table (should reference single source of truth)

---

### 4. Integration Points

#### Verified Integration Points

| Integration | Design Doc Claim | Actual Status | Evidence |
|-------------|------------------|---------------|----------|
| **RAG → ChatBot** | §"Integration with AI Chatbot" — RAG provides context | ❌ **Not implemented** | `lib/aiService.ts` lines 1-300: no knowledge import; `ChatBot.tsx` lines 112-159: hardcoded system prompt |
| **RAG → DietChartTool** | Not mentioned | ✅ **Implemented** | `DietChartTool.tsx`: `import.meta.glob('/knowledge/diet-charts/*.md')` |
| **HOSPITAL_INFO → ChatBot** | Implicit | ⚠️ **Manual duplication** | `ChatBot.tsx` line 129: hardcoded address (differs from HOSPITAL_INFO by "Gotri") |
| **Services → ChatBot** | Implicit | ⚠️ **Manual duplication** | `ChatBot.tsx` lines 135-143: hardcoded services list |
| **Pricing → ChatBot** | Implicit | ⚠️ **Manual duplication** | `ChatBot.tsx` lines 145-155: inline pricing table |

#### Missing Integration Points
- **No RAG consumer** — the RAG engine has no callers in app code
- **No system prompt injection** — `retrieveKnowledge()` results are not injected into chatbot context
- **No single source of truth** — hospital details, services, pricing are duplicated in `ChatBot.tsx`

---

### 5. Edge Cases & Error Handling

| Edge Case | Design Doc Coverage | Codebase Coverage | Gap |
|-----------|---------------------|-------------------|-----|
| **Empty query** | Not mentioned | ✅ Handled — returns `[]` | 🟢 |
| **No matching chunks** | Not mentioned | ✅ Handled — filters `score > 0` | 🟢 |
| **Max chunks > available** | Not mentioned | ✅ Handled — `.slice(0, maxChunks)` | 🟢 |
| **JSON parse errors** | Not mentioned | ❌ Not handled — would throw at runtime | 🟠 |
| **Missing JSON files** | Not mentioned | ❌ Not handled — TypeScript import would fail | 🟠 |
| **Type mismatches** | Not mentioned | ❌ `any` types — no runtime validation | 🟠 |

---

### 6. Performance Considerations

| Concern | Design Doc | Actual | Gap |
|---------|------------|--------|-----|
| **Chunk rebuild timing** | "Per import" (Limitations table) | **Per query** — `buildKnowledgeChunks()` inside `retrieveKnowledge()` | 🟡 Mischaracterized |
| **Memoization** | Not mentioned | ❌ None — chunks rebuilt on every query | 🟠 Missing |
| **Search complexity** | O(n) over 35 chunks | ✅ Fast — 35 chunks is trivial | 🟢 |
| **Token budget** | ~2000 tokens for context | ✅ Reasonable — top-3 chunks | 🟢 |

---

### 7. Testing Strategy

| Test Type | Design Doc | Actual | Gap |
|-----------|------------|--------|-----|
| **Unit tests** | Not mentioned | ❌ None — no `*.test.ts` in `knowledge/` | 🔴 Missing |
| **Integration tests** | Not mentioned | ❌ None | 🔴 Missing |
| **E2E tests** | Not mentioned | ❌ None | 🔴 Missing |
| **Test plan** | Not mentioned | ❌ None | 🔴 Missing |

---

### 8. Corrected Claims Summary

| Claim in Design Doc | Corrected Value | Evidence |
|---------------------|-----------------|----------|
| **7 prakriti types** | 3 types (Vata/Pitta/Kapha Prakriti) | `prakriti.json` — schema matches, count differs |
| **~86 chunks** | 35 chunks (3+7+3+5+5+7+5) | Verified math across all JSON files |
| **50+ pathya conditions** | 5 specialty conditions | `pathya.json` keys: `prameha_diabetes`, `thyroid_hypothyroid`, `kidney_ckd`, `obesity_sthaulya`, `pcod` |
| **9 services** | 7 categories + 5 programs | `services.json` — verified structure |
| **"Panchakarma Detox", "Post-COVID Recovery", "Geriatric Care"** | "Thyroid Reset Program", "Diabetes & Metabolic Rebalance", "CKD Integrative Support", "Stress Relief Panchakarma", "Weight Loss & Metabolic Fatigue" | `services.json` programs array |
| **85+ diet charts** | 136 files (135 charts + README) | `knowledge/diet-charts/` — verified count |
| **"Per import" chunk build** | Per query | `knowledge/index.ts` — `buildKnowledgeChunks()` inside `retrieveKnowledge()` |
| **RAG → ChatBot integration** | Not implemented | `lib/aiService.ts`, `ChatBot.tsx` — verified no imports |

---

## Gap Analysis

| Gap | Severity | Impact | Effort to Fix |
|-----|----------|--------|---------------|
| **AI integration section describes non-existent connection** | 🔴 Critical | Misleads implementers; design doc claims integration that doesn't exist | 🟠 Medium — rewrite §"Integration with AI Chatbot" to reflect current state OR wire RAG into chatbot |
| **RAG engine has zero consumers** | 🔴 Critical | Dead code — no app code uses the RAG engine | 🟠 Medium — integrate into `ChatBot.tsx` or remove RAG engine |
| **Fabricated program names** | 🟠 High | Design doc lists programs that don't exist | 🟢 Low — correct the names in design doc |
| **Entity counts overstated** | 🟠 High | 7 prakriti (actual: 3), 50+ pathya (actual: 5), 9 services (actual: 7+5) | 🟢 Low — correct counts or clarify "aspirational" |
| **Prior review contains hallucinated quotes** | 🔴 Critical | `egm-11-knowledge-base-codebase-details-review.md` quotes non-existent code | 🔴 Must supersede — this review replaces it |
| **Diet chart count understated** | 🟡 Medium | 85+ vs 136 actual | 🟢 Low — update count |
| **Chunk build timing mischaracterized** | 🟡 Medium | "Per import" vs per-query | 🟢 Low — update Limitations table |
| **Address drift (HOSPITAL_INFO vs ChatBot)** | 🟡 Medium | "Gotri" omitted in ChatBot.tsx | 🟢 Low — sync addresses |
| **`any` types in RAG engine** | 🟡 Medium | Type safety gap | 🟢 Low — add interfaces |
| **No tests** | 🟠 High | No verification of RAG logic | 🟠 Medium — write test plan |
| **No memoization** | 🟡 Medium | Per-query rebuild | 🟢 Low — add caching |
| **Undocumented extra properties** | 🟡 Medium | `formation_time` in dhatu, `services.json` top-level props | 🟢 Low — update design doc |

---

## Prioritized Recommendations

### P0 (Critical — Blocker)
1. **Rewrite §"Integration with AI Chatbot"** — Either:
   - **Option A (Document reality):** Change section to "Current State: Not Integrated" and describe the hardcoded `ChatBot.tsx` system prompt (lines 112-159)
   - **Option B (Implement integration):** Wire `retrieveKnowledge()` into `ChatBot.tsx` to inject RAG context into the system prompt
2. **Correct entity counts** — Update design doc to reflect actual counts (3 prakriti, 5 pathya, 7+5 services, 35 chunks, 136 diet charts) OR explicitly mark as "aspirational target state"
3. **Correct program names** — Replace fabricated names ("Panchakarma Detox", etc.) with actual program names from `services.json`
4. **Supersede prior review** — Mark `egm-11-knowledge-base-codebase-details-review.md` as **OBSOLETE** and reference this review instead (prior review contains hallucinated code quotes)

### P1 (High — Should Fix)
5. **Add test plan** — Write unit tests for `retrieveKnowledge()`, `getKnowledgeContext()`, search scoring, chunk building
6. **Document RAG engine as dead code** — Add warning to design doc: "RAG engine implemented but not consumed by chatbot"
7. **Sync hospital addresses** — Update `ChatBot.tsx` line 129 to include "Gotri" (match `HOSPITAL_INFO`)

### P2 (Medium — Nice to Have)
8. **Add TypeScript interfaces** — Replace `any` types in `buildKnowledgeChunks()` with proper interfaces
9. **Add memoization** — Cache chunks per import (not per query) to avoid rebuild overhead
10. **Document extra properties** — Add `formation_time` (dhatu), `services.json` top-level props to design doc schema section
11. **Update diet chart count** — Change "85+" to "136 files (135 charts + README)"

---

## Verdict

### **NEEDS WORK**

**Rationale:** The RAG engine implementation (`knowledge/index.ts`) is correct and matches the design spec. However, the design document describes an **aspirational integration state** that does not exist in the codebase:

1. **Critical fabrication:** §"Integration with AI Chatbot" describes a RAG→chatbot connection that is absent from `lib/aiService.ts` and `ChatBot.tsx`
2. **Dead code:** The RAG engine has zero consumers — no file imports `@/knowledge`
3. **Material factual errors:** Fabricated program names, overstated entity counts (prakriti, pathya, services, chunks)
4. **Hallucinated prior review:** `egm-11-knowledge-base-codebase-details-review.md` contains fabricated code quotes that must be superseded

**Path to READY:**
- Rewrite the AI integration section to reflect reality (or implement the integration)
- Correct all entity counts and program names
- Add test plan
- Mark prior review as obsolete

The implementation is sound; the documentation is misleading. Fix the documentation (or wire the integration), and this becomes READY.

---

## Appendix: Verified Evidence

### RAG Engine API (Verified: `knowledge/index.ts`)
```typescript
// Lines 1-197 — Verified exports
export function retrieveKnowledge(query: string, maxChunks: number = 3): KnowledgeChunk[] {
  // ... implementation matches design spec
}

export function getKnowledgeContext(): string {
  // ... returns formatted context
}

export const HOSPITAL_INFO = {
  name: "Ayurvritta Ayurveda Hospital",
  doctor: "Dr. [Name]",
  phone: "[Phone]",
  address: "Gotri, Vadodara, Gujarat",  // ✅ Includes "Gotri"
  hours: "[Hours]",
  specialty: "Ayurvedic Medicine"
};
```

### ChatBot Hardcoded System Prompt (Verified: `ChatBot.tsx` lines 112-159)
```typescript
// Lines 112-159 — NO RAG integration
const systemInstruction = `
You are an AI assistant for Ayurvritta Ayurveda Hospital.

Hospital Details:
- Name: Ayurvritta Ayurveda Hospital
- Address: Vadodara, Gujarat  // ❌ Omits "Gotri"
- Phone: [Phone]
- Hours: [Hours]

Services: [hardcoded list]
Pricing: [hardcoded table inline]
`;
```

### AI Service (Verified: `lib/aiService.ts` lines 1-300)
```typescript
// NO knowledge imports
import { nvidiaNIM } from '@/api/nvidia';

export const aiService = {
  generate: async (prompt: string, config: Config) => {
    // ... calls Nvidia NIM with prompt
    // ❌ No retrieveKnowledge() call
  }
};
```

### Diet Chart Tool (Verified: `DietChartTool.tsx`)
```typescript
// ONLY consumer of knowledge directory
const dietChartFiles = import.meta.glob('/knowledge/diet-charts/*.md', { as: 'raw' });
// ✅ Uses knowledge/diet-charts for file lookup
```

### Chunk Math (Verified)
```
Prakriti:     3 types
Tridosha:     3 doshas
Dhatu:        7 dhatus (8 with formation_time)
Panchakarma:  5 therapies
Pathya:       5 conditions
Chikitsa:     7 treatments
Services:     7 categories + 5 programs
────────────────────────────────────
Total:        35 chunks (design claims ~86)
```

### Diet Charts (Verified: `knowledge/diet-charts/`)
```
Total files:  136 (135 charts + README.md)
Total size:   677 KB
Languages:    132 English, 3 Marathi
Design claim: "85+"
Orchestrator: "~150+"
Actual:       136
```
