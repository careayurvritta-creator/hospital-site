# EGM-02 AI Chatbot System — Implementation Readiness Review

**Review Date:** 2026-11-13  
**Reviewer:** egm-implementation-readiness  
**Source Document:** `design-docs/egm-02-ai-chatbot-system.md`

---

## 1. Implementation Completeness Score: **52%**

| Subsystem | Score | Status |
|-----------|-------|--------|
| ChatBot UI/UX | 85% | ✅ Functional, polished |
| AI Service Layer | 40% | ⚠️ API mismatch, no streaming |
| NVIDIA Client | 60% | ⚠️ Works but wrong models, no streaming |
| Knowledge/RAG | 20% | 🔴 Not centralized |
| Streaming | 0% | 🔴 **Not implemented** |
| Clinical Guidelines | 90% | ✅ Excellent system prompt |
| A/B Testing | 30% | ⚠️ Framework exists, not used for chatbot |
| Analytics | 80% | ✅ Comprehensive tracking |
| PDF Export | 40% | ⚠️ JSON export logic exists, no UI |
| Error Handling | 45% | ⚠️ Basic retry, no boundaries |
| Security/Validation | 15% | 🔴 **No input validation** |

---

## 2. Missing Components / Incomplete Implementations

### P0 — Blockers for Production

| Component | Status | Gap Description |
|-----------|--------|-----------------|
| **Input Validation** | ❌ Missing | No Zod schema for user messages; raw input to LLM |
| **Error Boundaries** | ❌ Missing | ChatBot crash loses entire conversation |
| **Streaming Response** | ❌ Missing | Doc specifies streaming; implementation blocks 6-8s |
| **Centralized Knowledge Index** | ❌ Missing | Tools load knowledge independently; no RAG in chat |
| **Chatbot A/B Test** | ❌ Not used | `useABTest('chatbot_model')` not integrated |

### P1 — Significant Gaps

| Component | Status | Gap Description |
|-----------|--------|-----------------|
| **Conversation Persistence** | ⚠️ Partial | `sessionStorage` only; no server sync |
| **Streaming Cancellation** | ❌ Missing | Navigate away leaves request hanging |
| **Token Budget Enforcement** | ❌ Missing | No context window management |
| **Message Virtualization** | ❌ Missing | Full conversation in memory |
| **Quick Actions / Preset Prompts** | ❌ Missing | Documented but not built |

### P2 — Nice to Have

| Component | Status |
|-----------|--------|
| Message search/filter | Not implemented |
| Conversation export UI | Logic exists, no button |
| Offline support (SW + IndexedDB) | Not implemented |

---

## 3. Blockers for Production Deployment

### 🔴 CRITICAL — Must Fix Before Launch

1. **XSS via Markdown Injection** — User input rendered in chat bubbles
   - File: `ChatBot.tsx` line 318 renders `{msg.text}` directly
   - `stripMarkdown()` only runs on AI output, not user input
   - Fix: Sanitize user input with DOMPurify

2. **No Input Validation** — Health queries, PII sent raw to LLM
   - Fix: Add Zod schema for message input; validate length, content

3. **No Error Boundary** — React error crashes chat, loses history
   - Fix: Wrap ChatBot in `<ErrorBoundary fallback={ChatErrorFallback} />`

4. **PII in Analytics** — `chatBotAnalytics` stores message content (truncated but present)
   - Fix: Ensure consent gate before tracking; sanitize more aggressively

### 🟡 HIGH — Should Fix Before Launch

5. **Model Documentation Drift** — Doc says Llama 3.1; code uses Nemotron/MiniMax/DeepSeek
   - Fix: Update doc OR standardize models

6. **No Streaming UX** — 6-8s wait for diet charts; users think it's broken
   - Fix: Implement Vercel AI SDK streaming or show progressive "typing" indicator

7. **Knowledge Not Available to Chat** — ChatBot can't access diet charts, siddhanta
   - Fix: Build knowledge index; add `searchKnowledge` tool to AI service

---

## 4. Technical Debt Resolution Order

| Order | Debt Item | Effort | Dependency |
|-------|-----------|--------|------------|
| 1 | Add Zod validation for chat input | 0.5 days | None |
| 2 | Create ErrorBoundary for ChatBot | 0.5 days | None |
| 3 | Sanitize user input (DOMPurify) | 0.5 days | None |
| 4 | Add chatbot A/B test config | 0.5 days | abTestManager |
| 5 | Build knowledge index (Vite plugin) | 3 days | Vite config |
| 6 | Add searchKnowledge tool to AI service | 2 days | Knowledge index |
| 7 | Implement streaming (Vercel AI SDK) | 5 days | API changes |
| 8 | Add streaming cancellation | 1 day | Streaming impl |
| 9 | Token budget / context management | 2 days | Streaming impl |
| 10 | Message virtualization | 1 day | None |

**Total Critical Path: ~2-3 days** for P0 items

---

## 5. Effort Estimates for Gaps

| Gap Category | Estimated Effort | Risk if Deferred |
|--------------|------------------|------------------|
| Validation + Error Boundaries + XSS | 1.5 days | **Production blocker** |
| Streaming Implementation | 5 days | Poor UX, timeout perception |
| Knowledge Index + RAG | 5 days | Chat can't answer hospital-specific Qs |
| A/B Test Integration | 0.5 days | Can't optimize model selection |
| Conversation Persistence (server) | 3 days | No cross-device history |

---

## 6. Architecture Decision Alignment

| Decision (Doc) | Implementation Status | Notes |
|----------------|----------------------|-------|
| NVIDIA NIM via Vercel Proxy | ✅ Implemented | But dual-provider (DeepSeek) |
| Streaming via Vercel AI SDK | ❌ Not implemented | Custom blocking implementation |
| RAG-lite Knowledge Retrieval | ❌ Not centralized | Tools have knowledge, chat doesn't |
| Clinical Guidelines in System Prompt | ✅ Implemented | Excellent, comprehensive |
| A/B Testing for Model Selection | ❌ Not integrated | Framework exists, unused |
| Consent-First Analytics | ✅ Implemented | GDPR/DPDP compliant |

---

## 7. Go/No-Go Recommendation

**NO-GO for production** until P0 items resolved (est. 2-3 days).

**Conditional GO for staging** with:
- Error boundary wrapping ChatBot
- Input validation + XSS protection on user messages
- Consent-gated analytics
- Documentation updated to reflect actual models

---

*Report generated by egm-implementation-readiness reviewer*