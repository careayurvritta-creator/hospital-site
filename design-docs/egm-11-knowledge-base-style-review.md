# EGM-11 Knowledge Base & RAG System — Style Review

**Review Date:** 2026-11-13  
**Reviewer:** egm-style (subagent)  
**Source Document:** `design-docs/egm-11-knowledge-base.md` (302 lines)  
**Codebase Root:** `hospital-site/`

---

## 1. Executive Summary with Scores

The design document presents a polished knowledge base architecture with detailed schemas, algorithms, and integration patterns. However, **significant style and accuracy issues undermine its reliability as an implementation reference**. The document describes an **aspirational target state** rather than the current implementation, with material discrepancies in data volumes, schemas, and integration patterns.

| Criterion | Score (1–5) | Rationale |
|-----------|-------------|-----------|
| **1. Clarity & Structure** | 4 | Logical flow, clear headings, consistent terminology. Well-organized sections. |
| **2. Completeness** | 2 | Covers claimed components but omits critical gaps (seasonal_regimen, purvakarma, insurance, booking, dual_constitutions). AI integration section is fabricated. |
| **3. Accuracy of Diagrams/Tables** | 2 | Tables overstate chunk counts (~86 vs 35 actual), entity counts (7 prakriti vs 3, 50+ pathya vs 5), service categories (9 vs 7). Architecture diagrams match structure but not volumes. |
| **4. Actionability** | 2 | Developer would implement against wrong schemas, wrong chunk counts, and a non-existent integration pattern. Cannot trust the doc for actual implementation. |
| **5. Formatting** | 4 | Excellent Markdown quality: consistent tables, code blocks with language tags, mermaid-like ASCII diagrams, proper heading hierarchy. |
| **6. Terminology Consistency** | 3 | Mostly consistent, but "Prakriti types" vs "constitutions" mixed; "knowledgeContext" vs "getKnowledgeContext" in integration section. |
| **7. Evidence-Based Claims** | 1 | Critical claims (7 prakriti, 50+ pathya, 9 services, ~86 chunks, AI integration pattern) are **verifiably false** in the codebase. |
| **8. Missing Critical Sections** | 2 | No error handling (Raktamokshana missing `duration` → `undefined`), no testing strategy, no edge cases for empty queries, no memoization discussion for `buildKnowledgeChunks()` called per-request. |
| **9. Overall Usability** | 2 | Document is well-written but **misleading**. Cannot serve as implementation reference without major corrections. |

**Composite Score: 2.1 / 5** — **Not recommended as-is** for implementation reference.

---

## 2. Findings Table (Severity Classified)

| ID | Location | Finding | Severity | Evidence |
|----|----------|---------|----------|----------|
| **STY-01** | Line 18 (tree), Line 66–74 (schema), Line 183 (table), Line 248 (summary) | **Prakriti count mismatch**: Design claims 7 types × 20 traits; codebase has 3 types (Vata/Pitta/Kapha Prakriti) with 6 physical + 5 mental + 4 dietary + 4 lifestyle traits each. `dual_constitutions` is string array (3 entries), `sama_prakriti`/`vikriti` are strings — **not indexed**. | **Critical** | `knowledge/siddhanta/prakriti.json` lines 5–103; `index.ts` lines 58–70 |
| **STY-02** | Line 21 (tree), Line 90–99 (schema), Line 185 (table), Line 251 (summary) | **Pathya conditions mismatch**: Design claims 50+ conditions; codebase has 5 (`prameha_diabetes`, `thyroid_hypothyroid`, `kidney_ckd`, `obesity_sthaulya`, `pcod`). `seasonal_regimen` (5 seasons), `general_principles` not indexed. | **Critical** | `knowledge/chikitsa/pathya.json` lines 17–133; `index.ts` lines 90–99 |
| **STY-03** | Line 24 (tree), Line 125–141 (schema), Line 186–187 (table), Line 252–253 (summary) | **Hospital services mismatch**: Design claims 9 categories + 5 programs with specific names ("Panchakarma Detox", "Post-COVID Recovery", "Geriatric Care"); codebase has 7 categories + 5 programs with **different names** ("Thyroid Reset Program", "Diabetes & Metabolic Rebalance", "CKD Integrative Support", "Stress Relief Panchakarma", "Weight Loss & Metabolic Fatigue"). Price range example "₹400–1600" vs actual "₹500-₹1500". `insurance` and `booking` fields not indexed. | **Critical** | `knowledge/hospital/services.json` lines 9–146; `index.ts` lines 102–125 |
| **STY-04** | Line 179–188 (table), Line 255 (summary) | **RAG chunk count inflation**: Design claims ~86 chunks (3+7+7+5+50+9+5); actual = 3 doshas + 7 dhatus + 3 prakriti + 5 panchakarma + 5 pathya + 7 services + 5 programs = **35 chunks**. | **Major** | `index.ts` lines 23–128; computed from actual array lengths |
| **STY-05** | Line 225–234 (Integration section) | **Fabricated AI integration pattern**: Design shows `lib/aiService.ts` importing `getKnowledgeContext`/`HOSPITAL_INFO` and building `systemPrompt` with knowledge context. **Actual `aiService.ts` has zero knowledge imports**. ChatBot uses hardcoded system prompt (lines 112–159) with identity, pricing, tools, guidelines — no RAG. | **Critical** | `lib/aiService.ts` full file; `components/ChatBot.tsx` lines 112–159 |
| **STY-06** | Line 154–165 (Architecture diagram) | **Missing `seasonal_regimen` flow**: Architecture diagram shows `pathya.by_condition` → chunks but omits `pathya.seasonal_regimen` (5 seasons) which exists in JSON but is not indexed. | **Major** | `knowledge/chikitsa/pathya.json` lines 107–133; `index.ts` lines 90–99 |
| **STY-07** | Line 178–180 (Panchakarma chunk example) | **Raktamokshana missing `duration`**: Design's chunk example shows "Duration: 7-14 days" for Vamana; actual Vamana duration = "Single sitting after 3-7 days preparation". **Raktamokshana has no `duration` field** — `index.ts` line 81 renders `Duration: undefined`. | **Major** | `knowledge/chikitsa/panchakarma.json` lines 118–143; `index.ts` line 81 |
| **STY-08** | Line 18–25 (Directory tree) | **`diet-charts/README.md` listed but no root `README.md`**: Tree shows `diet-charts/README.md` (exists) but implies a root knowledge README — none exists. Minor formatting inconsistency. | **Minor** | File listing confirms only `diet-charts/README.md` |
| **STY-09** | Line 50–62 (Tridosha schema) | **Vague "10 properties" claim**: Design says "3 doshas × 10 properties each". Each dosha has 6 qualities, 5 functions, 5 imbalance signs, 5 balancing — no single "10 properties" grouping. | **Minor** | `knowledge/siddhanta/tridosha.json` lines 6–119 |
| **STY-10** | Line 78–85 (Dhatu schema) | **Omits `formation_time` field**: Design's dhatu schema example lacks `formation_time` which exists on all 7 dhatus and is part of the clinical model. | **Minor** | `knowledge/siddhanta/dhatu.json` lines 10–110 |
| **STY-11** | Line 102–119 (Panchakarma schema) | **Omits Basti `types` and Raktamokshana `methods`**: Design's therapy schema example doesn't include these fields which are in the JSON and affect clinical accuracy. | **Minor** | `knowledge/chikitsa/panchakarma.json` lines 62–143 |
| **STY-12** | Line 269–277 (Limitations) | **Omits actual implementation bugs**: Raktamokshana `undefined` duration, `buildKnowledgeChunks()` rebuilds on every call (no memoization), no multi-hop reasoning, no embedding support — **but misses the Raktamokshana bug and per-request rebuild cost**. | **Major** | `index.ts` lines 23, 81, 131–132 |
| **STY-13** | Line 280–294 (Corrected Claims table) | **Inaccurate correction for schema uniformity**: Table claims "no uniform schema — index.ts builds unified KnowledgeChunk[]". True, but the design doc's own schema examples (lines 40–62, 66–74, etc.) are **inconsistent with each other** — e.g., prakriti uses `type` field, dhatu uses `name`, tridosha uses `name` in `doshas`. | **Minor** | Cross-reference all schema examples in design doc |
| **STY-14** | Line 225–234 (Integration) | **Omits `/api/nvidia.ts` proxy entirely**: Design references this file in context but describes zero of its behavior (DeepSeek/NVIDIA fallback, model rotation, origin allowlist, payload caps, edge runtime). | **Major** | `api/nvidia.ts` lines 1–177 |
| **STY-15** | Line 197–213 (Context Assembly) | **Context format example uses fictitious price**: Example shows "Price range: ₹15000–25000" for Panchakarma Detox; actual services range ₹500–5000; programs have no price field. | **Minor** | `knowledge/hospital/services.json` lines 13–71, 73–124 |

---

## 3. Line-Specific Issues with Evidence

### 3.1 Prakriti Schema & Count (Lines 18, 66–74, 183, 248)

**Design Doc:**
```markdown
# Line 18 (tree):
prakriti.json                          # 7 constitution types × 20 traits each

# Lines 66–74 (schema):
"types": [
    { "type": "Vata Dominant", "physical_traits": [...], "mental_traits": [...], ... },
    // 6 more: Pitta Dominant, Kapha Dominant, Vata-Pitta, Pitta-Kapha, Vata-Kapha, Tridoshic
]

# Line 183 (table):
prakriti.types (7) | 7 prakriti chunks | siddhanta

# Line 248 (summary):
Prakriti | siddhanta/prakriti.json | 7 constitutions | 7
```

**Codebase (`knowledge/siddhanta/prakriti.json`):**
```json
{
  "types": [
    { "type": "Vata Prakriti", "physical_traits": [6 items], "mental_traits": [5 items], "dietary_recommendations": [4 items], "lifestyle_recommendations": [4 items] },
    { "type": "Pitta Prakriti", ... },
    { "type": "Kapha Prakriti", ... }
  ],
  "dual_constitutions": ["Vata-Pitta: ...", "Pitta-Kapha: ...", "Vata-Kapha: ..."],
  "sama_prakriti": "Balanced constitution...",
  "vikriti": "Current state of imbalance..."
}
```
- **Only 3 objects** in `types` array (not 7)
- `dual_constitutions` is `string[]` not objects — no traits
- `sama_prakriti` and `vikriti` are strings — not indexed
- `index.ts` lines 58–70 iterates `prakriti.types` → **3 chunks created**

### 3.2 Pathya Conditions (Lines 21, 90–99, 185, 251)

**Design Doc:**
```markdown
# Line 21 (tree):
pathya.json                            # Diet/lifestyle by condition (50+ conditions)

# Lines 90–99 (schema):
"by_condition": {
    "acidity_gerd": { "pathya": [...], "apathya": [...] },
    "diabetes": { "pathya": [...], "apathya": [...] },
    // 50+ conditions with pathya / apathya arrays
}

# Line 185 (table):
pathya.by_condition (50+) | 50+ condition chunks | chikitsa
```

**Codebase (`knowledge/chikitsa/pathya.json`):**
```json
{
  "by_condition": {
    "prameha_diabetes": { "pathya": [...], "apathya": [...] },
    "thyroid_hypothyroid": { "pathya": [...], "apathya": [...] },
    "kidney_ckd": { "pathya": [...], "apathya": [...] },
    "obesity_sthaulya": { "pathya": [...], "apathya": [...] },
    "pcod": { "pathya": [...], "apathya": [...] }
  },
  "seasonal_regimen": { ... 5 seasons ... },
  "general_principles": { ... }
}
```
- **5 conditions** (not 50+)
- `seasonal_regimen` (5 seasons) and `general_principles` exist but **not indexed**

### 3.3 Hospital Services (Lines 24, 125–141, 186–187, 252–253)

**Design Doc (lines 125–141):**
```json
"service_categories": [
  { "category": "Abhyanga & Massage", "description": "...", "price_range": "₹400–1600", ... },
  // 8 more: Swedana, Dhara, Vasti, Nasya, Raktamokshana, Lepa, Agnikarma, Panchakarma
],
"programs": [
  { "name": "Panchakarma Detox", "duration": "14-21 days", ... },
  // 4 more: Post-COVID Recovery, Stress Management, Weight Management, Geriatric Care
]
```

**Codebase (`knowledge/hospital/services.json`):**
```json
{
  "service_categories": [
    { "category": "Abhyanga & Massage", "price_range": "₹500-₹1500", ... },
    { "category": "Swedana (Fomentation)", "price_range": "₹600-₹2000", ... },
    { "category": "Dhara Therapies", "price_range": "₹1000-₹1800", ... },
    { "category": "Panchakarma (Shodhan)", "price_range": "₹700-₹5000", ... },
    { "category": "Basti Therapies", "price_range": "₹500-₹2000", ... },
    { "category": "Netra (Eye) Therapies", "price_range": "₹500-₹1000", ... },
    { "category": "Nasya & Head Therapies", "price_range": "₹600-₹1000", ... }
  ],
  "programs": [
    { "name": "Thyroid Reset Program", "duration": "3 Months", ... },
    { "name": "Diabetes & Metabolic Rebalance", "duration": "6 Months", ... },
    { "name": "CKD Integrative Support", "duration": "Ongoing", ... },
    { "name": "Stress Relief Panchakarma", "duration": "7 or 14 Days", ... },
    { "name": "Weight Loss & Metabolic Fatigue", "duration": "3 Months", ... }
  ],
  "insurance": { ... },  // not indexed
  "booking": { ... }      // not indexed
}
```
- **7 categories** (not 9) — design lists non-existent "Vasti" (merged into Basti), "Raktamokshana", "Lepa", "Agnikarma" as separate categories
- **Program names completely different** — design's names don't exist in codebase
- `insurance` and `booking` fields present but **not indexed**

### 3.4 AI Integration Pattern — Fabricated (Lines 225–234)

**Design Doc:**
```typescript
import { getKnowledgeContext, HOSPITAL_INFO } from '@/knowledge';

const knowledgeContext = getKnowledgeContext(userMessage);
const systemPrompt = `You are an Ayurveda expert at ${HOSPITAL_INFO.name}.
Use this knowledge:\n${knowledgeContext}`;
```

**Actual `lib/aiService.ts`:** **No imports from `knowledge/`** — zero references to `getKnowledgeContext`, `retrieveKnowledge`, or `HOSPITAL_INFO`.

**Actual ChatBot (`components/ChatBot.tsx` lines 112–159):**
```typescript
const systemInstruction = `You are "Vaidya AI", an expert Ayurveda physician assistant for Ayurvritta Ayurveda Hospital & Panchakarma Center in Vadodara, Gujarat, India.

LANGUAGE: ${langInstruction}

## YOUR IDENTITY & EXPERTISE
You are trained in classical Ayurveda texts...
## AYURVRITTA HOSPITAL DETAILS
- Chief Physician: Dr. Jinendradutt Sharma
- Specialty: Lifestyle disorders - Thyroid, Diabetes...
## CLINICAL GUIDELINES
1. DO NOT DIAGNOSE...
## AVAILABLE WEBSITE TOOLS...
## TREATMENT PRICING (Key therapies, per session)
- Abhyanga Sarvanga (Full Body): ₹1,600
...
## RESPONSE STYLE (CRITICAL)
1. First understand the query AND its sentiment...
2. Keep answers SHORT: 2-4 short sentences...
3. Reply in PLAIN TEXT ONLY — never use Markdown...
`;
const newChat = await aiService.createChatSession(systemInstruction);
```
- **Hardcoded hospital name, pricing, identity** — not from `HOSPITAL_INFO`
- **Conversation history maintained** via `session.history.slice(-10)` (line 127 in aiService.ts)
- **No RAG retrieval** — knowledge base entirely unused by chatbot

### 3.5 Raktamokshana Duration Bug (Line 81 in index.ts, Line 178–180 design)

**Design Doc (line 178–180 example):**
```
**Vamana (Therapeutic Emesis)**:
Vamana (Vamana) = Therapeutic Emesis.
Indication: Kapha disorders.
Conditions: Asthma, Obesity, Skin disorders.
Procedure: Pre-op snehana/swedana → emesis induction → post-op samsarjana karma.
Duration: 7-14 days.
```

**Actual Panchakarma JSON:**
```json
{
  "name": "Vamana",
  "duration": "Single sitting after 3-7 days preparation"  // NOT "7-14 days"
}
{
  "name": "Raktamokshana",
  // NO duration field at all!
}
```

**index.ts line 81:**
```typescript
Duration: ${t.duration}.   // For Raktamokshana → "Duration: undefined."
```

### 3.6 buildKnowledgeChunks() Called Per-Request (Line 132)

```typescript
export function retrieveKnowledge(query: string, maxChunks: number = 3): KnowledgeChunk[] {
    const chunks = buildKnowledgeChunks();  // Rebuilds ALL chunks every call
    // ...
}
```
- **No memoization** — imports are static but function rebuilds array on every query
- For 35 chunks this is minor, but design doc (line 275) says "Single index.ts rebuilds chunks on every import" — actually **every function call**, not import

---

## 4. Actionable Recommendations by Priority

### P0 — Critical (Fix Before Using as Reference)

1. **Correct all entity counts** in directory tree, schema examples, chunk table, and domain coverage summary:
   - Prakriti: 3 types (not 7), update schema example to show actual 3 objects + note dual_constitutions/sama_prakriti/vikriti as unindexed
   - Pathya: 5 conditions (not 50+), add note about seasonal_regimen (5 seasons) and general_principles unindexed
   - Hospital services: 7 categories (not 9), replace program names with actual 5, add insurance/booking as unindexed
   - Total chunks: 35 (not ~86)

2. **Remove fabricated AI integration section** (lines 225–234) or rewrite to reflect reality:
   - ChatBot uses hardcoded system prompt (ChatBot.tsx lines 112–159)
   - `aiService.ts` has no knowledge imports
   - RAG is currently **dead code** — not wired to chatbot
   - Document the actual flow: `ChatBot.tsx` → `aiService.createChatSession(hardcodedPrompt)` → `aiService.chat()` → `/api/nvidia` proxy

3. **Fix Raktamokshana duration bug** in design doc example AND flag in codebase:
   - Add `duration` field to Raktamokshana in panchakarma.json
   - Update design doc's Vamana duration to actual value

### P1 — Major (Should Fix)

4. **Add missing indexed fields to design doc schemas**:
   - Dhatu: add `formation_time`
   - Panchakarma: add Basti `types`, Raktamokshana `methods`, purvakarma, paschatkarma, at_ayurvritta (note unindexed)
   - Pathya: add `seasonal_regimen`, `general_principles` (note unindexed)
   - Hospital: add `insurance`, `booking` (note unindexed)

5. **Document `/api/nvidia.ts` proxy behavior** in integration section:
   - DeepSeek/NVIDIA selection via env
   - Model fallback rotation (nemotron-3.5-bolt-e4b → minimax-m3.1-flash)
   - Origin allowlist, payload caps, edge runtime
   - This is the actual AI endpoint — not optional context

6. **Add memoization note** for `buildKnowledgeChunks()`:
   - Currently called per `retrieveKnowledge()` invocation
   - Recommend module-level cached variable or `once` pattern

7. **Expand "Known Limitations" with actual bugs**:
   - Raktamokshana `Duration: undefined`
   - Per-request chunk rebuild
   - No embedding/semantic search
   - No multi-hop reasoning
   - ChatBot doesn't use RAG at all (architectural gap)

### P2 — Minor (Polish)

8. **Clarify "10 properties" for Tridosha** — replace with actual field counts or remove the vague metric
9. **Fix context assembly example price** (₹15000–25000 → use real range or mark as illustrative)
10. **Standardize schema example field names** — design doc uses `type` for prakriti, `name` for tridosha/dhatu/panchakarma/service — document this inconsistency or normalize examples
11. **Remove non-existent root README.md** from directory tree or add one

---

## 5. Suggested Revised Structure

If the document is to serve as an accurate implementation reference, restructure as follows:

```markdown
# EGM-11: Knowledge Base & RAG System (Current State)

## Overview
- Actual structure: 4 subdirs + index.ts + top-60-topics.md + 135 diet charts
- **Status**: RAG engine implemented but **not integrated** with chatbot (see Integration Gap)

## Actual Knowledge Base Structure (verified)
[tree with accurate counts: 3 prakriti, 5 pathya, 7 services, 5 programs, 135 diet charts]

## Data Schema by Directory (with indexed vs unindexed annotations)
### siddhanta/
- tridosha.json — 3 doshas ✓ indexed
- prakriti.json — 3 types ✓ indexed; dual_constitutions/sama_prakriti/vikriti ✗ unindexed
- dhatu.json — 7 dhatus ✓ indexed; formation_time included

### chikitsa/
- pathya.json — 5 conditions ✓ indexed; seasonal_regimen (5) + general_principles ✗ unindexed
- panchakarma.json — 5 therapies ✓ indexed; purvakarma/paschatkarma/at_ayurvritta ✗ unindexed

### hospital/
- services.json — 7 categories + 5 programs ✓ indexed; insurance + booking ✗ unindexed

### diet-charts/ — 135 Markdown files ✗ NOT in RAG (used only by DietChartTool via import.meta.glob)

## RAG Retrieval Engine (knowledge/index.ts)
[architecture, interface, chunk building — accurate as-is with corrected counts: 35 chunks]

## Search Algorithm
[accurate as-is]

## Context Assembly
[accurate format; fix example price]

## Integration Gap (NEW SECTION - Critical)
### Current ChatBot Implementation
- Hardcoded system prompt in ChatBot.tsx (lines 112–159)
- No knowledge imports in aiService.ts
- Conversation history: last 10 messages via session.history
- Proxy: /api/nvidia.ts (DeepSeek/NVIDIA fallback, model rotation, edge runtime)

### RAG Integration Needed
- Import getKnowledgeContext in ChatBot or aiService
- Inject knowledgeContext into systemPrompt or as user message
- Decide token budget vs hardcoded prompt tradeoff

## Known Limitations & Bugs
- Raktamokshana missing duration → "Duration: undefined"
- buildKnowledgeChunks() rebuilds per request (no memoization)
- 35 chunks vs aspirational 86 — clinical coverage gaps
- No semantic embeddings, no multi-hop
- **ChatBot does not use RAG at all** (architectural gap)

## Maintenance Notes
[accurate as-is with corrected paths]
```

---

## 6. Conclusion

The design document `egm-11-knowledge-base.md` is **well-formatted and structurally sound** but **factually unreliable** for implementation. It presents an aspirational knowledge base (7 prakriti types, 50+ pathya conditions, 9 service categories, ~86 RAG chunks, working RAG-AI integration) that **does not exist** in the codebase.

**Critical gaps:**
1. Clinical data volumes overstated by **2–10×** (prakriti 3 vs 7, pathya 5 vs 50+, chunks 35 vs 86)
2. Hospital services and programs **misidentified** (names, counts, prices wrong)
3. **AI integration pattern is fabricated** — RAG is dead code; chatbot uses hardcoded prompt with conversation history via `/api/nvidia.ts` proxy
4. **Actual bug documented nowhere**: Raktamokshana renders `Duration: undefined`

**Recommendation:** Do not use this document as an implementation reference without applying P0/P1 corrections above. The companion `egm-11-knowledge-base-codebase-details-review.md` correctly identifies most discrepancies but itself contains a schema-field error (claims prakriti uses `name`/`physicalCharacteristics` — it uses `type`/`physical_traits`).

**Next step:** Apply corrections to produce a "Current State" version, then separately create an "Aspirational Target" document if the team intends to expand clinical data and wire RAG to the chatbot.

---
*Review completed per 9-point Style Framework. All findings traceable to source files in `hospital-site/knowledge/`, `hospital-site/lib/`, `hospital-site/components/`, `hospital-site/api/`.*