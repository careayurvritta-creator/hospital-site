# EGM-01 Architecture Overview — Codebase Details Review

**Review Date:** 2026-11-13  
**Reviewer:** egm-codebase-details  
**Source Document:** `design-docs/egm-01-architecture-overview.md`  
**Codebase Root:** `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site\`

---

## 1. Summary of Alignment

| Category | Status | Notes |
|----------|--------|-------|
| **Tech Stack Versions** | 🔴 **Red** | 3/4 core versions incorrect |
| **File Structure** | 🟡 **Yellow** | Close but counts off |
| **Module Boundaries** | 🟡 **Yellow** | API surface mismatch |
| **Data Flows** | 🟡 **Yellow** | Streaming described but not implemented |
| **Architectural Debt** | 🟢 **Green** | Accurately identified |
| **Overall** | 🟡 **Yellow** | Significant version/documentation drift |

---

## 2. Critical Discrepancies (P0)

### Tech Stack Versions

| Technology | Design Doc | Actual (package.json) | Impact |
|------------|------------|----------------------|--------|
| **React** | 19 | 18.3.1 | Minor — React 19 not released |
| **Vite** | 6 | 5.4.19 | Minor — Vite 6 in beta |
| **Tailwind CSS** | **v4 (JIT)** | **v3.4.1 (classic)** | **MAJOR** — Different architecture, config, migration path |
| **TypeScript** | 5.8+ | 5.5.3 | Minor |
| **Vercel AI SDK** | 4.x | **Not installed** | **MAJOR** — Custom non-streaming implementation |
| **@react-pdf/renderer** | 4.x | **Not installed** | **MAJOR** — Uses `jspdf` + `html2canvas` (rasterized) |
| **React Router** | 7 | 6.26.2 | Minor |
| **Zod** | — (mentioned as missing) | **Not installed** | **P0 Confirmed** |

### NVIDIA Model Configuration

| Aspect | Design Doc | Actual (`lib/nvidiaClient.ts`, `api/nvidia.ts`) |
|--------|------------|--------------------------------------------------|
| **Primary Models** | `meta/llama-3.1-70b-instruct`, `meta/llama-3.1-8b-instruct` | `nvidia/nemotron-3.5-bolt-e4b`, `minimaxai/minimax-m3.1-flash` |
| **Fallback** | Not mentioned | DeepSeek R1 (`deepseek-ai/deepseek-r1`) via separate env key |
| **Retry Logic** | Exponential backoff | Multi-model retry chain: Nemotron → MiniMax → DeepSeek |

### Streaming Implementation

| Design Doc Claim | Reality |
|------------------|---------|
| `nvidiaClient.streamChat()` returns `AsyncIterable<string>` | **Does not exist** — `nvidiaClient` has `chat()` returning `Promise<string>` |
| `aiService.sendMessage()` streams via `onToken` callback | **Does not exist** — `aiService` has `generate()`, `chat()`, `createChatSession()`, `generateStructured()`, `generateImage()`, `analyzeDocument()`, `locationSearch()` |
| ChatBot uses token-by-token streaming | **False** — `aiService.ts:102` explicitly states "Nvidia doesn't support streaming, using regular generate" |

### AI Service Interface Mismatch

| Design Doc (Table, line 109-115) | Actual `lib/aiService.ts` |
|----------------------------------|---------------------------|
| `sendMessage(messages, options)` | `generate(prompt, systemInstruction, options)` |
| `analyzeAssessment(tool, answers)` | `analyzeDocument(extractedText, mimeType, prompt)` |
| `generateDietChart(params)` | **Missing** — handled inline in `DietChartTool` |
| `answerQuestion(question, context)` | **Missing** |

### Confirmed Missing (P0)

1. **Zod Validation** — Not in `package.json`, no validation schemas anywhere
2. **Error Boundaries** — No `ErrorBoundary` component found; no usage in ChatBot or tools
3. **Input Sanitization** — Raw user input passed to LLM (XSS via markdown injection risk)

---

## 3. Claims in Doc Not Reflected in Code

| Claim (Doc Section) | Status |
|---------------------|--------|
| "Knowledge index built at build time" (`knowledge/index.ts`) | **False** — No `knowledge/index.ts` file exists; knowledge loaded via `import.meta.glob` at runtime |
| "21 analytics modules loaded lazily via dynamic imports" | **False** — 18 modules in `lib/analytics/`, eagerly imported in `analytics/index.ts` |
| "18 custom hooks" | **False** — 13 hooks in `hooks/` |
| "6 pages" | **False** — 14 pages in `pages/` |
| "RAG-lite with TF-IDF scoring" | **Partially** — Keyword matching only in `api/nvidia.ts` (simple keyword extraction), no TF-IDF |
| "Vercel Edge Function proxy" | **True** — `api/nvidia.ts` is a Vercel Edge Function |

---

## 4. Code Patterns Not Documented

### 1. Dual AI Provider Fallback (`api/nvidia.ts`)
- Auto-selects DeepSeek if `DEEPSEEK_API_KEY` set
- Falls back to NVIDIA with multi-model retry chain (Nemotron → MiniMax)
- Handles CORS, auth, rate limiting server-side

### 2. CDN-based Library Loading (`lib/textExtractor.ts`)
- `pdfjs-dist` (3.11.174) and `tesseract.js` (v5) loaded from CDN at runtime
- Not bundled — reduces initial bundle size

### 3. 1152-line DietChartRenderer (`components/tools/DietChartRenderer.tsx`)
- Custom markdown parser with 14 section types
- Handles: principles, meals, pathya, apathya, dinacharya, remedies, viruddha ahara, etc.
- Interactive UI with expandable sections, copy buttons, print optimization

### 4. PDF via html2canvas (`components/tools/DietChartPDF.tsx`)
- Rasterizes DOM to canvas → embeds in jsPDF
- Multi-page slicing with backdrop-filter handling
- Devanagari font support via Noto Sans Devanagari from CDN

### 5. Chat Tool Registry (`components/ChatBot/ChatTools.ts`)
- 6 tools with keyword triggers for inline suggestions
- Tools: Prakriti, Lifestyle, Meda, Saara, Panchakarma, DietChart

### 6. Analytics Consent-First (GDPR/DPDP) (`lib/analytics/consent.ts`)
- Granular consent categories
- Data export/deletion APIs
- Retention policies (90 days)

---

## 5. Component/Hook/Analytics Counts

| Metric | Design Doc | Actual | Delta |
|--------|------------|--------|-------|
| Components | "50+" | **~52** | ✅ Close |
| Custom Hooks | 18 | **13** | -5 |
| Pages | 6 | **14** | +8 |
| Analytics Modules | 21 | **18 + 3 config = 21 files** | ✅ Count matches, but not lazy-loaded |
| Service Categories | 9 | **11** (constants.ts) | +2 |
| Treatment Programs | 5 | **6** (constants.ts) | +1 |
| Insurance Partners | — | **66** (constants.ts) | — |

---

## 6. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Tailwind v3 vs v4 migration blockers | High | Medium | Plan migration; v3 EOL 2025 |
| No streaming — poor UX on slow connections | High | High | Implement Vercel AI SDK + SSE |
| Rasterized PDFs — poor quality, large files | Medium | Medium | Migrate to `@react-pdf/renderer` |
| No input validation — XSS/injection | High | Critical | Add Zod schemas immediately |
| No error boundaries — crash loses data | High | Critical | Add React Error Boundaries |
| Knowledge index at runtime — slow dev start | Medium | Low | Move to build-time Vite plugin |
| Model drift (Nemotron/MiniMax vs Llama) | Low | Medium | Document actual models; test quality |

---

## 7. Recommendations by Priority

### Immediate (P0 — This Sprint)
1. **Add Zod** — `npm i zod`; create schemas for all AI inputs, health forms, booking
2. **Add Error Boundaries** — Wrap ChatBot, all 6 tools, DietChartRenderer
3. **Update Architecture Doc** — Correct versions, API surface, data flows

### Short-term (Next 2 Sprints)
1. **Implement True Streaming** — Vercel AI SDK 4.x with NVIDIA provider or custom SSE
2. **Build-time Knowledge Index** — Vite plugin to pre-build search index
3. **API Versioning** — Add `/api/v1/nvidia` with version header

### Medium-term (Next Quarter)
1. **Tailwind v4 Migration** — Assess breaking changes; use `@tailwindcss/vite`
2. **Vector PDF Generation** — Evaluate `@react-pdf/renderer` for diet charts
3. **Lazy-load Analytics** — Dynamic imports for 18 modules

---

## 8. Files Examined

- `package.json` — versions, dependencies
- `vite.config.ts` — build config, plugins
- `tsconfig.json` — TypeScript config
- `components/Layout.tsx` — layout structure
- `components/SEOHead.tsx` — SEO implementation
- `pages/Home.tsx` — home page implementation
- `lib/aiService.ts` — AI service interface
- `lib/nvidiaClient.ts` — NVIDIA client
- `lib/textExtractor.ts` — OCR/PDF extraction
- `lib/analytics/` — 18 module files
- `hooks/` — 13 custom hooks
- `constants.ts` — data constants
- `types.ts` — TypeScript types
- `seo.ts` — SEO schemas
- `translations.ts` — i18n
- `api/nvidia.ts` — Vercel Edge Function proxy

---

*Report generated by egm-codebase-details reviewer*