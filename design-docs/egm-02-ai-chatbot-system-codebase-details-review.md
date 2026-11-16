# EGM-02 AI Chatbot System — Codebase Details Review

**Review Date:** 2026-11-13  
**Reviewer:** egm-codebase-details  
**Source Document:** `design-docs/egm-02-ai-chatbot-system.md`  
**Codebase Root:** `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site\`

---

## 1. Summary of Alignment

| Category | Status | Notes |
|----------|--------|-------|
| Component Architecture | 🟡 **Yellow** | Structure matches but line counts off |
| AI Service Interface | 🔴 **Red** | Doc describes interface that doesn't exist |
| NVIDIA Client | 🔴 **Red** | Models, streaming, API completely different |
| Knowledge/RAG | 🔴 **Red** | No `knowledge/index.ts`; no TF-IDF |
| Streaming | 🔴 **Red** | Doc claims streaming; code explicitly says "Nvidia doesn't support streaming" |
| Clinical Guidelines | ✅ **Green** | System prompt matches doc well |
| A/B Testing | 🟡 **Yellow** | Exists but different test IDs |
| Analytics Events | 🟡 **Yellow** | Similar events but different naming |
| PDF Export | 🟡 **Yellow** | Conversation export exists; no JSON download UI |
| Error Handling | 🟡 **Yellow** | Matrix partially implemented |
| **Overall** | 🔴 **Red** | Major discrepancies in core AI integration |

---

## 2. Critical Discrepancies (P0)

### AI Service Interface Mismatch

| Design Doc (`egm-02`, lines 59-74) | Actual `lib/aiService.ts` |
|------------------------------------|---------------------------|
| `sendMessage(messages, options)` | `generate(prompt, systemInstruction, options)` |
| `analyzeAssessment(tool, answers)` | `analyzeDocument(extractedText, mimeType, prompt)` |
| `generateDietChart(params)` | **Missing** — handled inline in `DietChartTool` |
| `answerQuestion(question, context)` | **Missing** |
| `streamText` from `vercel/ai` | **Not installed** — custom implementation |
| Tool calling via Vercel AI SDK | **Not implemented** |

### NVIDIA Client & Models

| Design Doc Claim | Actual Implementation |
|------------------|----------------------|
| Models: `meta/llama-3.1-70b-instruct`, `meta/llama-3.1-8b-instruct` | **Actual:** `nvidia/nemotron-3.5-bolt-e4b`, `minimaxai/minimax-m3.1-flash`, fallback: `deepseek-ai/deepseek-r1` |
| `streamChat()` returns `AsyncIterable<string>` | **Does not exist** — `chat()` returns `Promise<string>` |
| `retryWithBackoff` private method | **Exists** but in `nvidiaClient.ts` with 2 retries, 1.5s base delay |
| Vercel Edge proxy at `/api/chat` | **Actual:** `/api/nvidia` (Edge runtime) |
| Single provider (NVIDIA) | **Dual provider:** DeepSeek if `DEEPSEEK_API_KEY` set, else NVIDIA with multi-model fallback |

### Streaming Implementation

| Design Doc (lines 126-145) | Reality |
|----------------------------|---------|
| Token-by-token streaming via `onToken` callback | **Explicitly not implemented** — `aiService.ts:102`: "Nvidia doesn't support streaming, using regular generate" |
| `for await (const token of aiService.sendMessage())` | **No such method** |
| Virtualization planned (50 messages) | **Not implemented** — full conversation in state |
| Backpressure handling via React 19 | **N/A — no streaming** |

### Knowledge Retrieval (RAG-lite)

| Design Doc (lines 99-125) | Reality |
|---------------------------|---------|
| `knowledge/index.ts` with `KnowledgeEntry[]` | **File does not exist** |
| TF-IDF scoring with pre-computed vectors | **Not implemented** — simple keyword matching in `api/nvidia.ts` |
| 90+ markdown/JSON files in `/knowledge` | **Directory not found** — diet charts loaded via `import.meta.glob` in tools |
| `searchKnowledge`, `getContext`, `getDietChart` APIs | **Not in aiService** — tools load knowledge directly |

---

## 3. Claims in Doc Not Reflected in Code

| Claim | Status |
|-------|--------|
| "980 lines" for ChatBot.tsx | **False** — 370 lines |
| "18 custom hooks" | **False** — 13 hooks total, `useABTest` exists but not used in ChatBot |
| "StreamingIndicator — token-by-token animation" | **False** — shows static "Thinking..." spinner |
| "QuickActions — preset prompts" | **False** — not implemented |
| "MessageList — virtualized, auto-scroll" | **False** — no virtualization, simple map |
| "Dual client confusion: imports both vercel/ai AND custom nvidiaClient" | **False** — `vercel/ai` not installed |
| "Zod validation missing" | **True** — confirmed missing |
| "Error boundaries missing" | **True** — confirmed missing |

---

## 4. Code Patterns Not Documented

### 1. Dual AI Provider Fallback (`api/nvidia.ts`)
- Auto-detects `DEEPSEEK_API_KEY` in Vercel env
- If set: uses DeepSeek (`deepseek-chat`) directly
- If not: NVIDIA with fallback chain (Nemotron → MiniMax)
- Handles CORS, origin validation, payload caps, retryable status codes

### 2. Chat Session Management (`ChatBot.tsx` + `aiService.ts`)
- `createChatSession(systemInstruction)` returns `{ systemInstruction, history: [] }`
- `chat(session, message)` maintains history internally (last 10 messages)
- Session re-initialized on language change

### 3. Multilingual System Prompt (ChatBot.tsx lines 112-159)
- Dynamic language instruction injected
- Full hospital details, pricing, clinical guidelines embedded
- 154 lines of system instruction

### 4. Markdown Stripping (`ChatBot.tsx` lines 14-25)
- `stripMarkdown()` removes `**`, `__`, `#`, `` ` ``, `*`, bullets
- Ensures plain text output as per system prompt requirement

### 5. Voice Input Integration (`ChatBot.tsx` line 349)
- `VoiceInput` component for speech-to-text
- Compact mode for chat input

### 6. AI Status Debug Panel (ChatBot.tsx lines 268-299)
- Shows NVIDIA connection status
- Toggleable debug panel with error details

### 7. ChatBot Analytics (`analytics/chatBotAnalytics.ts`)
- Conversation persistence in `sessionStorage`
- Intent classification (8 patterns: booking, pricing, services, info, support, greeting, dosha, location)
- Sentiment analysis (keyword-based)
- Aggregate analytics in `localStorage` (100 conversations)

---

## 5. Component/Analytics Counts

| Metric | Design Doc | Actual |
|--------|------------|--------|
| ChatBot.tsx lines | 980 | **370** |
| Custom hooks used | 18 | **1** (`useLanguage`) + `useABTest` (not in ChatBot) |
| Analytics events (table lines 177-187) | 7 events | **6 events** in `chatBotAnalytics.ts` (open, close, message_sent, message_received, error) |
| A/B test variant | `chatbot_model` (A/B) | **Not used in ChatBot** — default tests: `hero_headline`, `booking_cta`, `social_proof_style` |

---

## 6. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Doc describes non-existent API | High | High | Rewrite doc to match implementation |
| No streaming — poor perceived performance | High | Medium | Implement streaming or update expectations |
| Model drift (Nemotron vs Llama) | Medium | Medium | Document actual models; test quality |
| Knowledge retrieval not centralized | Medium | High | Create `knowledge/index.ts` with build-time index |
| No input validation on user messages | High | Critical | Add Zod schema for chat input |
| No error boundary on ChatBot | High | Critical | Wrap ChatBot in ErrorBoundary |

---

## 7. Files Examined

- `components/ChatBot.tsx` (370 lines)
- `lib/aiService.ts` (300 lines)
- `lib/nvidiaClient.ts` (181 lines)
- `api/nvidia.ts` (177 lines) — Vercel Edge Function
- `hooks/useABTest.ts` (60 lines)
- `analytics/abTestManager.ts` (238 lines)
- `analytics/chatBotAnalytics.ts` (331 lines)
- `analytics/types.ts` (for type definitions)

---

*Report generated by egm-codebase-details reviewer*