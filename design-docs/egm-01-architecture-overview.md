# Architecture Overview — Ayurvritta Hospital Site

## System Purpose
A React 19 + Vite 6 single-page application serving as the digital front-door for Ayurvritta Ayurveda Hospital. Provides:
- AI-powered clinical consultation chatbot (NVIDIA NIM LLM via Vercel AI SDK)
- 6 structured health assessment tools (Prakriti, Lifestyle, Meda/Dhatu, Saara, Panchakarma, Diet Chart)
- 85+ condition-specific Ayurvedic diet charts with PDF export
- Full analytics suite (21 modules) with GDPR/DPDP consent management
- Multilingual support (English, Hindi, Marathi, Gujarati)

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                         │
├─────────────────────────────────────────────────────────────────┤
│  React 19 App (Vite 6, Tailwind v4, TypeScript)                │
│  ├── Pages: Home, ChatBot, Tools, DietCharts, Blog, About      │
│  ├── Components: 50+ (UI, Tools, Layout, Analytics)            │
│  ├── Hooks: 18 custom (analytics, AI, personalization, A/B)    │
│  ├── Lib: aiService, nvidiaClient, textExtractor, knowledge    │
│  └── Analytics: 21 modules (eventTracker → sentimentAnalyzer)  │
├─────────────────────────────────────────────────────────────────┤
│  External Services                                              │
│  ├── NVIDIA NIM API (LLM inference via Vercel proxy)           │
│  ├── Vercel Analytics / Speed Insights                          │
│  └── PDF Generation (client-side via @react-pdf/renderer)       │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | React | 19 | UI runtime with Server Components ready |
| Build | Vite | 6 | Dev server, bundling, HMR |
| Styling | Tailwind CSS | v4 | Utility-first, JIT compilation |
| Language | TypeScript | 5.8+ | Strict typing, path aliases |
| AI | NVIDIA NIM + Vercel AI SDK | 4.x | Streaming chat, tool calling |
| PDF | @react-pdf/renderer | 4.x | Client-side PDF generation |
| Routing | React Router | 7 | Client-side SPA routing |
| Testing | Vitest + RTL | 2.x | Unit/integration tests |
| Lint | ESLint + Prettier | 9.x | Code quality |

## Key Architectural Decisions

### 1. Client-Side Only (No SSR)
- **Rationale**: Static hosting on Vercel, SEO via pre-rendered meta tags, chatbot is inherently interactive
- **Trade-off**: No server-side rendering for initial HTML; relies on client hydration

### 2. NVIDIA NIM via Vercel Proxy
- **Flow**: Browser → `/api/chat` (Vercel Edge Function) → NVIDIA NIM API
- **Security**: API keys never touch client; proxy handles auth, rate limiting, retry logic
- **Models**: `meta/llama-3.1-70b-instruct`, `meta/llama-3.1-8b-instruct` (configurable)

### 3. Knowledge Retrieval (RAG-lite)
- **Source**: 90+ markdown/JSON files in `/knowledge` (siddhanta, hospital, diet-charts)
- **Index**: `knowledge/index.ts` builds in-memory search index at build time
- **Query**: Client-side semantic search via keyword matching + TF-IDF scoring

### 4. Analytics as First-Class Citizen
- **21 modules** loaded lazily via dynamic imports
- **Consent-first**: GDPR/DPDP compliant via `ConsentManager` (granular categories)
- **Event schema**: Standardized `AnalyticsEvent` type with session/user/context

### 5. Component Architecture
- **Atomic Design**: atoms (Button, Input) → molecules (ChatMessage) → organisms (ChatBot, ToolForms)
- **Tools Pattern**: Each assessment tool = standalone component with own state, AI integration, PDF export
- **UI Library**: Custom `components/ui/` + ReactBits animations (Counter, AnimatedList)

## Data Flow Patterns

### Chatbot Interaction
```
User Message → ChatBot.handleSend() 
  → aiService.sendMessage() 
    → nvidiaClient.streamChat() 
      → Vercel Edge Function 
        → NVIDIA NIM API 
          → Streaming response 
            → ChatBot.setMessages() 
              → UI renders tokens incrementally
```

### Health Assessment Tool
```
User Answers → ToolComponent (local state)
  → aiService.analyzeAssessment() 
    → Structured prompt + knowledge context 
      → NVIDIA NIM 
        → JSON response 
          → DietChartRenderer.parseAIResult() 
            → Structured sections → UI + PDF export
```

### Diet Chart Generation
```
Condition Selection → DietChartTool 
  → Loads matching .md from /knowledge/diet-charts/ 
    → aiService.generateDietChart(condition, prakriti, allergies) 
      → NVIDIA NIM with RAG context 
        → Markdown response 
          → DietChartRenderer (1152 lines parser) 
            → 14 section types → Interactive UI + @react-pdf export
```

## Module Boundaries

| Module | Responsibility | Public API | Dependencies |
|--------|---------------|------------|--------------|
| `aiService` | Unified AI interface | `sendMessage`, `analyzeAssessment`, `generateDietChart` | `nvidiaClient`, `knowledge` |
| `nvidiaClient` | Low-level NIM API | `streamChat`, `chat`, `retryWithBackoff` | `fetch`, `AbortController` |
| `knowledge/index` | RAG retrieval | `searchKnowledge`, `getContext`, `getDietChart` | File system (build-time) |
| `analytics/*` | Event tracking | `track`, `identify`, `segment`, `consent` | `localStorage`, `fetch` |
| `textExtractor` | OCR/PDF parsing | `extractFromFile`, `extractFromImage` | `pdfjs-dist`, `tesseract.js` |

## Performance Characteristics

| Metric | Target | Current |
|--------|--------|---------|
| Initial JS bundle | < 200 KB gzipped | ~180 KB (manual chunks) |
| First Contentful Paint | < 1.5s | ~1.2s |
| Time to Interactive | < 3s | ~2.8s |
| Chat first token latency | < 2s | ~1.5s (edge) |
| Diet chart generation | < 10s | ~6-8s |

## Security Model

- **CSP**: Strict policy via `vercel.json` headers
- **API Keys**: Server-side only (Vercel env vars)
- **PII**: No persistent storage; session-only in memory
- **Consent**: Granular opt-in per analytics category
- **Input Validation**: Zod schemas on all AI inputs (missing in current code — P0 finding)

## Scalability Considerations

- **Stateless**: No server-side session state
- **CDN**: All assets via Vercel Edge Network
- **Rate Limiting**: Vercel Edge Functions + NIM API quotas
- **Knowledge**: Static files — scale via CDN, not database

## Deployment Architecture

```
Git Push → Vercel Build 
  → npm ci → typecheck → lint → test → build 
    → Static assets → CDN 
    → Edge Functions (/api/*) → NIM Proxy
```

## Known Architectural Debt

1. **No Error Boundaries** on AI components (P0)
2. **Missing Input Validation** on health forms (P0)
3. **AI Service mixes** Vercel AI SDK + custom NIM client (confusion)
4. **Analytics modules** loaded eagerly in some paths
5. **Knowledge index** rebuilt on every dev server start (slow)
6. **No API versioning** strategy for `/api/chat`