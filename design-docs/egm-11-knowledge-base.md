# EGM-11: Knowledge Base & RAG System

## Overview
The knowledge base (`knowledge/` directory) is a **structured, multi-directory collection** of Ayurvedic reference data used by the AI chatbot for retrieval-augmented generation (RAG). It covers classical Ayurvedic theory (Siddhanta), clinical treatments (Chikitsa), hospital-specific services, and 85+ condition-specific diet charts.

> **Correction from EGM Review**: Previous version claimed a flat `knowledge/` directory with 6 JSON files. Actual structure has **4 subdirectories** (`siddhanta/`, `chikitsa/`, `hospital/`, `diet-charts/`) plus `index.ts` RAG engine and `top-60-ayurveda-topics.md`.

---

## Actual Knowledge Base Structure

```
knowledge/
├── index.ts                                    # RAG retrieval engine (semantic search + context assembly)
├── top-60-ayurveda-topics.md                   # Reference topic list
├── siddhanta/                                  # Classical Ayurvedic theory (fundamental principles)
│   ├── tridosha.json                          # Vata, Pitta, Kapha — 3 doshas × 10 properties each
│   ├── prakriti.json                          # 7 constitution types × 20 traits each
│   └── dhatu.json                             # 7 dhatus (tissues) × 8 properties each
├── chikitsa/                                   # Clinical treatments & therapeutics
│   ├── pathya.json                            # Diet/lifestyle by condition (50+ conditions)
│   └── panchakarma.json                       # 5 Panchakarma therapies × full protocols
├── hospital/                                   # Hospital-specific services & programs
│   └── services.json                          # 9 service categories + 5 wellness programs
└── diet-charts/                                # 85+ condition-specific diet charts (Markdown)
    ├── README.md
    ├── diet-chart-for-acidity.md
    ├── diet-chart-for-diabetes.md
    ├── diet-chart-for-hypertension.md
    └── ... (80+ more condition-specific charts)
```

---

## Data Schema by Directory

### 1. `siddhanta/` — Classical Theory (JSON)

#### `tridosha.json`
```json
{
  "topic": "Tridosha",
  "sanskrit": "त्रिदोष",
  "description": "The three fundamental bio-energies...",
  "doshas": [
    {
      "name": "Vata",
      "sanskrit": "वात",
      "elements": ["Vayu (Air)", "Akasha (Space)"],
      "qualities": ["Ruksha (Dry)", "Laghu (Light)", "Sheeta (Cold)", "Khara (Rough)", "Sukshma (Subtle)", "Chala (Mobile)"],
      "seat": "Pakwashaya (Colon)",
      "functions": ["Controls all movements...", "Governs nervous system...", ...],
      "imbalance_signs": ["Anxiety...", "Dry skin...", ...],
      "balancing": ["Warm, moist, oily foods...", "Regular routine...", ...]
    },
    // Pitta, Kapha — same structure
  ],
  "clinical_application": {
    "diagnosis": "Prakriti and Vikriti assessment",
    "treatment_principle": "Balance aggravated dosha through opposite qualities",
    "panchakarma_correlation": { "Vata": "Basti", "Pitta": "Virechana", "Kapha": "Vamana" }
  }
}
```

#### `prakriti.json`
```json
{
  "topic": "Prakriti",
  "types": [
    { "type": "Vata Dominant", "physical_traits": [...], "mental_traits": [...], "dietary_recommendations": [...], "lifestyle_recommendations": [...] },
    // 6 more: Pitta Dominant, Kapha Dominant, Vata-Pitta, Pitta-Kapha, Vata-Kapha, Tridoshic
  ]
}
```

#### `dhatu.json`
```json
{
  "topic": "Dhatu",
  "dhatus": [
    { "name": "Rasa", "sanskrit": "रस", "english": "Plasma", "function": "...", "upadhatu": "...", "mala": "...", "sara_signs": [...] },
    // 6 more: Rakta, Mamsa, Meda, Asthi, Majja, Shukra
  ]
}
```

### 2. `chikitsa/` — Clinical Therapeutics (JSON)

#### `pathya.json`
```json
{
  "topic": "Pathya-Apathya (Diet & Lifestyle by Condition)",
  "by_condition": {
    "acidity_gerd": { "pathya": ["Cold milk", "Coconut water", ...], "apathya": ["Spicy food", "Fried food", ...] },
    "diabetes": { "pathya": ["Bitter gourd", "Fenugreek", ...], "apathya": ["Sugar", "Refined carbs", ...] },
    // 50+ conditions with pathya (beneficial) / apathya (avoid) arrays
  }
}
```

#### `panchakarma.json`
```json
{
  "topic": "Panchakarma",
  "therapies": [
    {
      "name": "Vamana",
      "sanskrit": "वमन",
      "english": "Therapeutic Emesis",
      "indication": "Kapha disorders",
      "conditions": ["Asthma", "Obesity", "Skin disorders"],
      "procedure": "Pre-op snehana/swedana → emesis induction → post-op samsarjana karma",
      "duration": "7-14 days",
      "benefits": ["Clears Kapha", "Improves digestion", ...],
      "contraindications": ["Pregnancy", "Elderly", "Cardiac patients", ...]
    },
    // 4 more: Virechana, Basti, Nasya, Raktamokshana
  ]
}
```

### 3. `hospital/` — Hospital Services (JSON)

#### `services.json`
```json
{
  "service_categories": [
    {
      "category": "Abhyanga & Massage",
      "description": "Therapeutic oil massage...",
      "price_range": "₹400–1600",
      "popular": ["Abhyanga (Full body)", "Sthanik Abhyanga", ...]
    },
    // 8 more: Swedana, Dhara, Vasti, Nasya, Raktamokshana, Lepa, Agnikarma, Panchakarma
  ],
  "programs": [
    { "name": "Panchakarma Detox", "duration": "14-21 days", "focus": "Complete detoxification", "includes": ["Vamana", "Virechana", "Basti", "Nasya", "Raktamokshana", "Diet", "Yoga"] },
    // 4 more: Post-COVID Recovery, Stress Management, Weight Management, Geriatric Care
  ]
}
```

### 4. `diet-charts/` — Condition-Specific Charts (Markdown)
- **85+ files** covering specific diseases/conditions
- Each file: condition name, dietary principles, meal plans, recipes, lifestyle advice
- Languages: English, some Marathi (e.g., `ulcerative-colitis-diet-chart-in-marathi-language.md`)
- Examples: `diet-chart-for-diabetes.md`, `diet-chart-for-hypertension.md`, `diet-plan-for-pregnant-women.md`, `9-days-navratri-fast-special-diet-chart-and-recipes.md`

---

## RAG Retrieval Engine (`knowledge/index.ts`)

### Architecture
```
User Query → index.ts
              ├─ buildKnowledgeChunks(): Loads all JSON, transforms to KnowledgeChunk[]
              ├─ retrieveKnowledge(query, maxChunks=3):
              │    ├─ Preprocess: lowercase, tokenize, split words
              │    ├─ Score: topic match (+10), keyword match (+3), content match (+1)
              │    ├─ Filter: score > 0
              │    ├─ Rank: sort by score desc
              │    └─ Top-K: slice(0, maxChunks)
              └─ getKnowledgeContext(query): Formats chunks as markdown for AI prompt
```

### KnowledgeChunk Interface
```typescript
interface KnowledgeChunk {
    id: string;                    // e.g., "dosha-vata", "panchakarma-vamana"
    topic: string;                 // e.g., "Vata Dosha", "Vamana (Therapeutic Emesis)"
    content: string;               // Formatted natural language description
    category: 'siddhanta' | 'chikitsa' | 'hospital';
    keywords: string[];            // Searchable terms from entity data
}
```

### Chunk Building (from `buildKnowledgeChunks()`)
| Source | Chunks Created | Category |
|--------|----------------|----------|
| `tridosha.doshas` (3) | 3 dosha chunks | `siddhanta` |
| `dhatu.dhatus` (7) | 7 dhatu chunks | `siddhanta` |
| `prakriti.types` (7) | 7 prakriti chunks | `siddhanta` |
| `panchakarma.therapies` (5) | 5 therapy chunks | `chikitsa` |
| `pathya.by_condition` (50+) | 50+ condition chunks | `chikitsa` |
| `hospitalServices.service_categories` (9) | 9 service chunks | `hospital` |
| `hospitalServices.programs` (5) | 5 program chunks | `hospital` |
| **Total** | **~86 chunks** | — |

### Search Algorithm
1. **Preprocessing**: Lowercase query, split on whitespace
2. **Direct Topic Match**: `chunk.topic.toLowerCase().includes(query)` → +10 points
3. **Keyword Match**: Query words >2 chars matching `chunk.keywords` → +3 each
4. **Content Match**: Query words in `chunk.content` → +1 each
5. **Rank & Return**: Sort by score, filter >0, return top-K (default 3)

### Context Assembly for AI
```typescript
// Output format from getKnowledgeContext():
`
--- AYURVEDA KNOWLEDGE ---
**Vata Dosha**:
Vata (Vayu) is composed of Vayu (Air) and Akasha (Space). 
Qualities: Ruksha (Dry), Laghu (Light), Sheeta (Cold)...
...

**Panchakarma Detox at Ayurvritta**:
Panchakarma Detox: Complete detoxification program...
Price range: ₹15000–25000.
...

--- END KNOWLEDGE ---
`
```

### Exported API
```typescript
export function retrieveKnowledge(query: string, maxChunks: number = 3): KnowledgeChunk[]
export function getKnowledgeContext(query: string): string
export const HOSPITAL_INFO = { name, doctor, phone, address, hours, specialty }
```

---

## Integration with AI Chatbot

### In `lib/aiService.ts`
```typescript
import { getKnowledgeContext, HOSPITAL_INFO } from '@/knowledge';

const knowledgeContext = getKnowledgeContext(userMessage);
const systemPrompt = `You are an Ayurveda expert at ${HOSPITAL_INFO.name}.
Use this knowledge:\n${knowledgeContext}`;
```

### Token Budget
- **Max 3 chunks** per query (~2000 tokens with context)
- Chunks formatted as markdown for readability
- Fallback: empty string → generic Ayurvedic guidance

---

## Domain Coverage Summary

| Domain | Source Files | Entities | Chunks |
|--------|--------------|----------|--------|
| **Tridosha** | `siddhanta/tridosha.json` | 3 doshas | 3 |
| **Prakriti** | `siddhanta/prakriti.json` | 7 constitutions | 7 |
| **Dhatu** | `siddhanta/dhatu.json` | 7 tissues | 7 |
| **Panchakarma** | `chikitsa/panchakarma.json` | 5 therapies | 5 |
| **Pathya (Diet by Condition)** | `chikitsa/pathya.json` | 50+ conditions | 50+ |
| **Hospital Services** | `hospital/services.json` | 9 categories | 9 |
| **Hospital Programs** | `hospital/services.json` | 5 programs | 5 |
| **Diet Charts** | `diet-charts/*.md` (85+) | 85+ conditions | **Not in RAG** (Markdown, not indexed) |
| **Total Indexed** | — | — | **~86 chunks** |

---

## Quality Assurance

- **Classical references**: All Siddhanta/Chikitsa data cross-referenced with Charaka Samhita, Sushruta Samhita, Ashtanga Hridaya
- **Medical review**: Hospital services & diet charts reviewed by Dr. Jinendradutt Sharma
- **Version control**: JSON files are source-controlled; diet charts in Markdown
- **No hallucination**: AI only uses retrieved context via `getKnowledgeContext()`
- **Structured keywords**: Each chunk has explicit `keywords` array for search optimization

---

## Known Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| Diet charts (85+ Markdown) not indexed in RAG | AI cannot retrieve condition-specific meal plans | Consider adding to RAG or linking via hospital services |
| No semantic embeddings — keyword-only search | Misses synonyms, related concepts | Future: add vector embeddings (e.g., Vercel AI SDK) |
| Single `index.ts` rebuilds chunks on every import | Minor build-time cost | Acceptable for ~86 chunks; memoize if needed |
| No multi-hop reasoning | Cannot chain related entities (e.g., dosha → therapy) | Future: graph-based retrieval |

---

## Corrected Claims (vs Previous Version)

| Previous Claim | Actual Codebase |
|----------------|-----------------|
| Flat `knowledge/` with 6 JSON files | **4 subdirectories + index.ts + 85+ Markdown files** |
| `tridosha.json`, `prakriti.json`, `dhatu.json` in root | In `siddhanta/` subdirectory |
| `services.json`, `pathya.json`, `panchakarma.json` in root | `services.json` in `hospital/`, `pathya.json` + `panchakarma.json` in `chikitsa/` |
| 6 JSON files total | **6 JSON files + 85+ Markdown diet charts + index.ts + top-60-topics.md** |
| Schema: `metadata` + `entities[]` with `id`, `name`, `category`, `attributes`, `relatedTo`, `keywords` | **Different per file** — no uniform schema; `index.ts` builds unified `KnowledgeChunk[]` |
| `semanticSearch()` with exact/partial/keyword scoring | **Simple keyword scoring** in `retrieveKnowledge()` — no separate `semanticSearch()` function |
| `preprocess()`, `filter()`, `rank()`, `topK()` as separate functions | **All inline** in `retrieveKnowledge()` |
| Context Builder with Tridosha/Prakriti/Service contexts | **Single `getKnowledgeContext()`** returns combined markdown |
| Token budget ~2000 tokens, up to 5 entities | **3 chunks max** (default), ~2000 tokens |
| Fallback: generic guidance / consult practitioner / redirect | **Empty string** → AI uses base system prompt only |

---

## Maintenance Notes

- **Add new classical knowledge**: Add to appropriate `siddhanta/` or `chikitsa/` JSON
- **Add hospital service**: Update `hospital/services.json` → auto-indexed via `index.ts`
- **Add diet chart**: Add Markdown to `diet-charts/` → NOT auto-indexed (manual RAG integration needed)
- **Update RAG logic**: Modify `knowledge/index.ts` (`buildKnowledgeChunks`, `retrieveKnowledge`, `getKnowledgeContext`)