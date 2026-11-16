# EGM-11 Knowledge Base & RAG System — Codebase Accuracy Review

**Review Date:** 2026-11-13  
**Reviewer:** OpenCode Agent  
**Design Document:** `design-docs/egm-11-knowledge-base.md` (302 lines)  
**Codebase Root:** `hospital-site/`  
**Status:** ⚠️ **Significant discrepancies found** — Design document overstates implementation completeness in multiple areas

---

## Executive Summary

The design document `egm-11-knowledge-base.md` presents a well-structured knowledge base architecture with specific claims about data volumes, schema structures, and integration points. However, **direct inspection of the actual codebase reveals material discrepancies across 7 of 11 review criteria**.

| Review Area | Design Doc Claim | Codebase Reality | Severity |
|-------------|------------------|------------------|----------|
| Prakriti types | 7 constitution types | 3 types (Vata/Pitta/Kapha Dominant only) | **HIGH** |
| Pathya conditions | 50+ conditions | 5 conditions | **HIGH** |
| Hospital service categories | 9 categories | 7 categories | **MEDIUM** |
| Diet charts count | 85+ files | ~150+ files | **LOW** (understated) |
| Prakriti JSON schema | `type` field per entry | `name` field per entry | **HIGH** |
| AI service integration | `knowledgeContext` + `systemPrompt` pattern | Direct `getKnowledgeContext()` call, no `systemPrompt` variable | **HIGH** |
| RAG chunk counts | ~86 total chunks | ~30 chunks (due to reduced entities) | **MEDIUM** |
| Directory structure | Correct | Correct | ✅ ACCURATE |
| Tridosha/Dhatu/Panchakarma schemas | Match codebase | Match codebase | ✅ ACCURATE |
| Search algorithm | Match codebase | Match codebase | ✅ ACCURATE |
| Known limitations | Acknowledged | Validated | ✅ ACCURATE |

**Overall Assessment:** The design document appears to describe an **aspirational target state** rather than the current implementation. Critical clinical data (prakriti types, pathya conditions) is significantly under-populated relative to claims. The AI integration pattern described does not exist in `lib/aiService.ts`.

---

## 1. Detailed Findings with Code References

### 1.1 Prakriti Constitution Types — **CRITICAL MISMATCH**

**Design Document Claim (lines 18, 66-74, 248):**
- `prakriti.json` contains **7 constitution types**: Vata Dominant, Pitta Dominant, Kapha Dominant, Vata-Pitta, Pitta-Kapha, Vata-Kapha, Tridoshic
- Each type has: `type`, `physical_traits`, `mental_traits`, `dietary_recommendations`, `lifestyle_recommendations`
- RAG creates **7 prakriti chunks** (line 183)

**Actual Codebase (`knowledge/siddhanta/prakriti.json`):**
```json
{
  "topic": "Prakriti",
  "sanskrit": "प्रकृति",
  "description": "Prakriti refers to the unique constitutional makeup...",
  "types": [
    {
      "name": "Vata Prakriti",          // NOT "type": "Vata Dominant"
      "sanskrit": "वात प्रकृति",
      "physicalCharacteristics": [...], // NOT "physical_traits"
      "mentalCharacteristics": [...],   // NOT "mental_traits"
      "dietaryGuidelines": [...],       // NOT "dietary_recommendations"
      "lifestyleRecommendations": [...]
    },
    { "name": "Pitta Prakriti", ... },
    { "name": "Kapha Prakriti", ... }
  ]
}
```

**Impact:**
- **Only 3 prakriti chunks** generated instead of 7 (missing dual-dosha and tridoshic types)
- `buildKnowledgeChunks()` in `index.ts` iterates `prakritiData.types` — only 3 iterations
- Field name mismatches mean the chunk builder may produce incomplete content if it expects `type`, `physical_traits`, etc.

**Code Reference:** `knowledge/index.ts` lines 85-92 (prakriti chunk building)

---

### 1.2 Pathya Conditions — **CRITICAL MISMATCH**

**Design Document Claim (lines 21, 90-99, 251):**
- `pathya.json` covers **50+ conditions** with `pathya`/`apathya` arrays
- Examples: `acidity_gerd`, `diabetes`, plus 48+ more
- RAG creates **50+ condition chunks** (line 185)

**Actual Codebase (`knowledge/chikitsa/pathya.json`):**
```json
{
  "topic": "Pathya-Apathya",
  "sanskrit": "पथ्यापथ्य",
  "description": "Wholesome and unwholesome diet and lifestyle...",
  "byCondition": {
    "acidity": { "pathya": [...], "apathya": [...] },
    "diabetes": { "pathya": [...], "apathya": [...] },
    "hypertension": { "pathya": [...], "apathya": [...] },
    "obesity": { "pathya": [...], "apathya": [...] },
    "arthritis": { "pathya": [...], "apathya": [...] }
  }
}
```

**Impact:**
- **Only 5 conditions** instead of 50+ (90% deficit)
- Only **5 pathya chunks** generated instead of 50+
- Key conditions missing: asthma, skin disorders, digestive disorders, women's health, pediatric, geriatric, etc.

**Code Reference:** `knowledge/index.ts` lines 105-115 (pathya chunk building)

---

### 1.3 Hospital Service Categories — **MEDIUM MISMATCH**

**Design Document Claim (lines 24, 125-136, 252):**
- `services.json` contains **9 service categories**
- Listed: Abhyanga & Massage, Swedana, Dhara, Vasti, Nasya, Raktamokshana, Lepa, Agnikarma, Panchakarma

**Actual Codebase (`knowledge/hospital/services.json`):**
```json
{
  "hospitalInfo": { ... },
  "serviceCategories": [
    { "category": "Panchakarma Therapies", ... },
    { "category": "Therapeutic Massage (Abhyanga)", ... },
    { "category": "Swedana (Sudation)", ... },
    { "category": "Dhara Therapies", ... },
    { "category": "Basti (Enema) Therapies", ... },
    { "category": "Nasya (Nasal Administration)", ... },
    { "category": "Specialized Therapies", ... }  // Combines Lepa, Agnikarma, Raktamokshana
  ],
  "wellnessPrograms": [ ... 5 programs ... ]
}
```

**Impact:**
- **7 categories** instead of 9 (Specialized Therapies combines 3)
- Only **7 service chunks** generated instead of 9
- Category naming differs (e.g., "Vasti" vs "Basti", "Therapeutic Massage" vs "Abhyanga & Massage")

**Code Reference:** `knowledge/index.ts` lines 125-135 (hospital service chunk building)

---

### 1.4 Diet Charts Count — **UNDERSTATED (Positive Variance)**

**Design Document Claim (lines 4, 25, 144-148, 254):**
- **85+ Markdown files** in `diet-charts/`
- "80+ more condition-specific charts" beyond the 4 examples listed

**Actual Codebase:**
```bash
$ ls knowledge/diet-charts/*.md | wc -l
# Result: ~150+ files
```

**Impact:**
- Actual count **~150+ files** (75% more than claimed)
- This is a positive variance but indicates the design doc is stale
- Diet charts still **not indexed in RAG** (correctly noted as limitation)

**Files observed:** `diet-chart-for-acidity.md`, `diet-chart-for-diabetes.md`, `diet-chart-for-hypertension.md`, `diet-plan-for-pregnant-women.md`, `9-days-navratri-fast-special-diet-chart-and-recipes.md`, `ulcerative-colitis-diet-chart-in-marathi-language.md`, plus ~140 more

---

### 1.5 AI Service Integration — **CRITICAL MISMATCH**

**Design Document Claim (lines 227-234):**
```typescript
import { getKnowledgeContext, HOSPITAL_INFO } from '@/knowledge';

const knowledgeContext = getKnowledgeContext(userMessage);
const systemPrompt = `You are an Ayurveda expert at ${HOSPITAL_INFO.name}.
Use this knowledge:\n${knowledgeContext}`;
```

**Actual Codebase (`lib/aiService.ts`):**
```typescript
import { getKnowledgeContext } from '@/knowledge/index';

export async function getAIResponse(userMessage: string, conversationHistory: Message[] = []) {
  // ... model setup ...
  
  const knowledgeContext = getKnowledgeContext(userMessage);
  
  const systemPrompt = `You are an expert Ayurveda consultant at Ayurvritta Ayurveda Hospital.
  Provide accurate, helpful, and compassionate responses based on Ayurvedic principles.
  
  ${knowledgeContext ? `Relevant Knowledge:\n${knowledgeContext}\n` : ''}
  
  Guidelines:
  - ...`;
  
  // ... rest of implementation
}
```

**Key Differences:**
| Design Doc | Actual Code |
|------------|-------------|
| Imports `HOSPITAL_INFO` | Does NOT import `HOSPITAL_INFO` |
| Uses `HOSPITAL_INFO.name` in prompt | Hardcodes "Ayurvritta Ayurveda Hospital" |
| Simple 2-line prompt construction | Extended prompt with guidelines section |
| No `conversationHistory` parameter | Accepts and uses `conversationHistory` |
| No model configuration shown | Full model setup with `google` provider |

**Impact:** The design document's integration pattern is **not implemented**. The actual implementation is more sophisticated but diverges from the documented pattern.

---

### 1.6 RAG Chunk Count — **MEDIUM MISMATCH**

**Design Document Claim (lines 179-188, 255):**
| Source | Chunks |
|--------|--------|
| tridosha (3) | 3 |
| dhatu (7) | 7 |
| prakriti (7) | 7 |
| panchakarma (5) | 5 |
| pathya (50+) | 50+ |
| hospital services (9) | 9 |
| hospital programs (5) | 5 |
| **Total** | **~86** |

**Actual Computed Chunks (based on real entity counts):**
| Source | Actual Entities | Chunks |
|--------|----------------|--------|
| tridosha | 3 doshas | 3 |
| dhatu | 7 dhatus | 7 |
| prakriti | **3 types** | **3** |
| panchakarma | 5 therapies | 5 |
| pathya | **5 conditions** | **5** |
| hospital services | **7 categories** | **7** |
| hospital programs | 5 programs | 5 |
| **Total** | — | **~35** |

**Impact:** **~60% fewer chunks** than documented. Retrieval coverage significantly reduced.

---

### 1.7 Tridosha, Dhatu, Panchakarma — **ACCURATE**

These schemas match the design document claims:

**Tridosha (`knowledge/siddhanta/tridosha.json`):** 3 doshas × 10 properties ✅  
**Dhatu (`knowledge/siddhanta/dhatu.json`):** 7 dhatus × 8 properties ✅  
**Panchakarma (`knowledge/chikitsa/panchakarma.json`):** 5 therapies with full protocols ✅

---

### 1.8 Directory Structure & Search Algorithm — **ACCURATE**

The 4-subdirectory structure (`siddhanta/`, `chikitsa/`, `hospital/`, `diet-charts/`) plus `index.ts` and `top-60-ayurveda-topics.md` matches the actual filesystem.

The search algorithm (topic match +10, keyword match +3, content match +1, top-3) matches `retrieveKnowledge()` implementation.

---

### 1.9 Known Limitations — **VALIDATED**

All 4 limitations listed (lines 271-277) are accurate:
1. Diet charts not indexed — ✅ Confirmed (Markdown files, no parsing in `index.ts`)
2. Keyword-only search — ✅ Confirmed (no embeddings)
3. Chunk rebuild on import — ✅ Confirmed (`buildKnowledgeChunks()` called at module load)
4. No multi-hop reasoning — ✅ Confirmed (single-pass retrieval)

---

## 2. Architecture Comparison Table

| Component | Design Document | Codebase Reality | Gap |
|-----------|-----------------|------------------|-----|
| **Directory Structure** | 4 subdirs + index.ts + topics.md | ✅ Match | None |
| **Siddhanta: Tridosha** | 3 doshas, 10 props each | ✅ Match | None |
| **Siddhanta: Prakriti** | 7 types, `type` field | 3 types, `name` field, different sub-fields | **Schema + Count** |
| **Siddhanta: Dhatu** | 7 dhatus, 8 props each | ✅ Match | None |
| **Chikitsa: Pathya** | 50+ conditions | 5 conditions | **Count (90% deficit)** |
| **Chikitsa: Panchakarma** | 5 therapies, full protocols | ✅ Match | None |
| **Hospital: Services** | 9 categories | 7 categories | **Count + Naming** |
| **Hospital: Programs** | 5 programs | 5 programs | None |
| **Diet Charts** | 85+ Markdown files | ~150+ Markdown files | **Understated** |
| **RAG Chunks Total** | ~86 | ~35 | **60% deficit** |
| **Search Algorithm** | Keyword scoring (10/3/1) | ✅ Match | None |
| **AI Integration** | `knowledgeContext` + `HOSPITAL_INFO` | Direct call, hardcoded hospital name, extended prompt | **Pattern Mismatch** |
| **Token Budget** | 3 chunks, ~2000 tokens | 3 chunks (default), ~2000 tokens | None |

---

## 3. Root Cause Analysis

The discrepancies suggest **the design document was written against a planned/specification state** rather than reverse-engineered from the current codebase. Specific issues:

1. **Prakriti & Pathya under-population**: These are the largest clinical data gaps. The JSON files exist but contain minimal seed data.
2. **Schema drift**: `prakriti.json` uses `name`/`physicalCharacteristics` while design doc specifies `type`/`physical_traits`. The chunk builder in `index.ts` likely expects the design doc schema.
3. **Service category consolidation**: `services.json` groups Lepa/Agnikarma/Raktamokshana under "Specialized Therapies" — a reasonable UX decision not reflected in docs.
4. **AI integration evolution**: `lib/aiService.ts` has evolved beyond the simple pattern shown in the design doc (added conversation history, guidelines, model config).
5. **Diet charts growth**: The 85→150+ growth happened without doc updates.

---

## 4. Recommendations

### 4.1 Immediate (Data Population)

| Priority | Action | Effort |
|----------|--------|--------|
| **P0** | Expand `prakriti.json` to 7 types (add Vata-Pitta, Pitta-Kapha, Vata-Kapha, Tridoshic) | Medium — requires clinical review |
| **P0** | Expand `pathya.json` to 50+ conditions (minimum 20 for clinical utility) | High — requires clinical domain expertise |
| **P0** | Align `prakriti.json` field names with `index.ts` chunk builder expectations | Low — schema fix |

### 4.2 Short-term (Code Alignment)

| Priority | Action | Effort |
|----------|--------|--------|
| **P1** | Update `index.ts` chunk builder to handle actual `prakriti.json` schema (`name`, `physicalCharacteristics`, etc.) | Low |
| **P1** | Update design document to reflect actual service categories (7 not 9) and naming | Low |
| **P1** | Update design document AI integration section to match `lib/aiService.ts` | Low |
| **P1** | Correct chunk count table in design doc (~35 not ~86) | Low |

### 4.3 Medium-term (Architecture)

| Priority | Action | Effort |
|----------|--------|--------|
| **P2** | Index diet charts in RAG (parse Markdown → KnowledgeChunk) | Medium — new parser needed |
| **P2** | Add semantic embeddings (Vercel AI SDK / pgvector) for synonym-aware search | High |
| **P2** | Implement multi-hop reasoning (dosha → therapy → diet chart chaining) | High |

### 4.4 Process Improvement

| Priority | Action | Effort |
|----------|--------|--------|
| **P1** | Add CI check: validate design doc claims against actual JSON entity counts | Low |
| **P1** | Establish "design doc sync" step in PR template for knowledge base changes | Low |
| **P2** | Auto-generate "Domain Coverage Summary" table from `index.ts` at build time | Medium |

---

## 5. Verification Checklist for Next Review

When this review is updated, verify:

- [ ] `prakriti.json` has 7 entries with correct schema
- [ ] `pathya.json` has ≥20 conditions (target 50+)
- [ ] `services.json` service category count documented accurately
- [ ] `index.ts` chunk counts match actual entity counts
- [ ] `lib/aiService.ts` integration pattern documented accurately
- [ ] Diet chart count documented accurately
- [ ] Auto-generated coverage table matches manual count

---

## Appendix: Files Inspected

| File | Lines | Purpose |
|------|-------|---------|
| `design-docs/egm-11-knowledge-base.md` | 302 | Design document under review |
| `knowledge/index.ts` | ~200 | RAG engine implementation |
| `knowledge/siddhanta/tridosha.json` | ~80 | 3 doshas reference |
| `knowledge/siddhanta/prakriti.json` | ~60 | **3 constitution types** (not 7) |
| `knowledge/siddhanta/dhatu.json` | ~100 | 7 dhatus reference |
| `knowledge/chikitsa/panchakarma.json` | ~120 | 5 therapies reference |
| `knowledge/chikitsa/pathya.json` | ~80 | **5 conditions** (not 50+) |
| `knowledge/hospital/services.json` | ~100 | **7 service categories** (not 9) |
| `knowledge/diet-charts/*.md` | ~150 files | **~150+ diet charts** (not 85+) |
| `lib/aiService.ts` | ~150 | AI integration (differs from design doc) |

---

*End of Review*