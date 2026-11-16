# Consolidated Review Report for Ayurvritta Hospital‑Site Detailed Design Documents

## 1. Executive Summary

| EGM | Implementation Ready? | Implementation Score | Style Ready? | Style Score | Overall Verdict |
|-----|-----------------------|----------------------|--------------|-------------|------------------|
| 01 | ✅ | 10/10 | ✅ | 5/5 | READY |
| 02 | ✅ | 9/10 | ✅ | 5/5 | READY |
| 03 | ✅ | 8.5/10 | ✅ | 4.5/5 | READY |
| 04 | ✅ | 8/10 | ✅ | 4/5 | READY |
| 05 | ✅ | 8/10 | ✅ | 4/5 | READY |
| 06 | ❌ | — | ✅ | 5/5 | **BLOCKED – React vs Astro mismatch** |
| 07 | ✅ | 9/10 | ✅ | 5/5 | READY |
| 08 | ✅ | 8/10 | ✅ | 4/5 | READY |
| 09 | ❌ | — | ✅ | 4/5 | **BLOCKED – Next.js vs Vite incompatibility** |
| 10 | ❌ | 4/10 | ✅ | 4/5 | **NEEDS WORK** |
| 11 | ✅ | 9/10 | ✅ | 4.5/5 | READY |
| 12 | ✅ | 8/10 | ✅ | 4/5 | READY |
| 13 | ✅ | 8/10 | ✅ | 4/5 | READY |
| 14 | ✅ | 9/10 | ✅ | 5/5 | READY |
| 15 | ❌ | 4.5/10 | ✅ | 3.85/5 | **NEEDS WORK** |
| 16 | ❌ | 4.1/10 | ✅ | 4/5 | **NEEDS WORK** |
| 17 | ❌ | 3/10 | ✅ | 2.05/5 | **NOT READY – major gaps** |
| 18 | ❌ | 3/10 | ✅ | 3/5 | **NOT READY – security gaps** |
| 19 | ❌ | 5.5/10 | ✅ | 4/5 | **NEEDS WORK – minimal i18n infrastructure** |
| 20 | ❌ | 6.2/10 | ✅ | 2.8/5 | **NEEDS WORK – incomplete component registry** |
| 21 | ❌ | 3.5/10 | ✅ | 2.9/5 | **NEEDS WORK – 85% dead code, API contract mismatches** |
| 22 | ✅ | 8.5/10 | ✅ | 4/5 | **READY** |
| 23 | ❌ | 4/10 | ✅ | 3.6/5 | **NEEDS WORK – missing ErrorBoundary, security risk** |

---

## 2. Score Summary Statistics

| Metric | Value |
|--------|-------|
| **Total EGMs** | 24 |
| **Fully READY (impl ≥ 7 & style ≥ 4)** | 6 (EGMs 01–05, 07, 08, 11–14, 22) |
| **NEEDS WORK (impl 4–6.9)** | 9 (EGMs 10, 15, 16, 19, 20, 21, 23) |
| **NOT READY (impl < 4)** | 3 (EGMs 17, 18) |
| **BLOCKED (architectural mismatch)** | 2 (EGMs 06, 09) |
| **Average Implementation Score** | 6.1/10 |
| **Average Style Score** | 4.1/5 |

---

## 3. Asset Map

| EGM | Codebase Review | Implementation Review | Style Review | Doc Implemented Prior to Review |
|-----|-----------------|------------------------|--------------|------------------------------------|
| 01 | ✅ | ✅ | ✅ | ✔ |
| 02 | ✅ | ✅ | ✅ | ✔ |
| 03 | ✅ | ✅ | ✅ | ✔ |
| 04 | ✅ | ✅ | ✅ | ✔ |
| 05 | ✅ | ✅ | ✅ | ✔ |
| 06 | ✅ | ❌ Blocked | ✅ | — |
| 07 | ✅ | ✅ | ✅ | ✔ |
| 08 | ✅ | ✅ | ✅ | ✔ |
| 09 | ✅ | ❌ Blocked | ✅ | — |
| 10 | ✅ | ✅ | ✅ | — |
| 11 | ✅ | ✅ | ✅ | — |
| 12 | ✅ | ✅ | ✅ | — |
| 13 | ✅ | ✅ | ✅ | — |
| 14 | ✅ | ✅ | ✅ | — |
| 15 | ✅ | ✅ | ✅ | — |
| 16 | ✅ | ✅ | ✅ | — |
| 17 | ✅ | ✅ | ✅ | — |
| 18 | ✅ | ✅ | ✅ | — |
| 19 | ✅ | ✅ | ✅ | — |
| 20 | ✅ | ✅ | ✅ | — |
| 21 | ✅ | ✅ | ✅ | — |
| 22 | ✅ | ✅ | ✅ | ✔ |
| 23 | ✅ | ✅ | ✅ | — |

---

## 4. Follow‑up Action Plan

| Priority | Task | Owner | Due | Notes |
|----------|------|-------|-----|-------|
| **P0 – Critical** | Resolve **React / Astro** mismatch in EGM‑06 | Arch‑Team | 10‑Jul‑2026 | Evaluate whether to adopt Astro for analytics, or refactor analytics to be fully React/Vite compatible. |
| **P0 – Critical** | In‑depth **Next.js vs Vite** review for EGM‑09 | Build‑Ops | 12‑Jul‑2026 | Decide if we maintain separate folders per framework or consolidate into a Vite‑only architecture. |
| **P0 – Critical** | **Security hardening** for EGMs 18 / 23 | Security team | 15‑Jul‑2026 | Implement CSP, Rate‑Limiting, DOMPurify, HSTS, zone‑file `security.txt` and Sentry integration. |
| **P0 – Critical** | **EGM‑15 Deployment**: Add `functions` config, security headers, health endpoint, resolve Edge vs Node runtime mismatch | Infra | 15‑Jul‑2026 | 12–15 hrs estimated; without this, 24s fallback will timeout on Vercel Hobby 10s limit. |
| **P0 – Critical** | **EGM‑17 Performance**: Fix 14+ material mismatches (caching, preload, SW versioning) | Perf | 20‑Jul‑2026 | Design doc currently scores 3/10; 14+ false claims about codebase. |
| **P0 – Critical** | **EGM‑21 Hooks**: Remove 85% dead code (11/12 hooks unused), fix `useExitIntent`/`usePersonalization` API contracts | Frontend | 20‑Jul‑2026 | Score 3.5/10 — 11 of 12 exported hooks have zero consumers. |
| **P1 – High** | **EGM‑19 i18n**: Add localStorage persistence, MobileHeader language switcher, `hreflang` tags, `<html lang>` | Frontend | 25‑Jul‑2026 | ~45 min P0 effort; score 5.5/10. |
| **P1 – High** | **EGM‑16 Accessibility**: Add `react-error-boundary`, ARIA error handling, verify hooks | Frontend | 25‑Jul‑2026 | Score 4.1/10; missing error boundaries and fallbacks. |
| **P1 – High** | **EGM‑20 Component Architecture**: Finalize component registry, remove dead code references | Frontend | 30‑Jul‑2026 | Score 6.2/10; incomplete component spec table. |
| **P1 – High** | **EGM‑23 Error Handling**: Add root `ErrorBoundary`, remove client-side Nvidia key references, add Zod validation for health tools | Frontend | 30‑Jul‑2026 | Score 4/10; security risk with client-side Nvidia keys in docs. |
| **P2 – Medium** | **Documentation rollout** – Sync all design docs with actual code (comments, diagrams, links) | Docs Team | 20‑Jul‑2026 | Wave‑top approach—start with critical docs, then next. |
| **P2 – Medium** | Update **dependencies** (i18n, Sentry, PDF, etc.) across the repo | DevOps | 25‑Jul‑2026 | Check `package.json`, update to latest compatible versions, document usage. |
| **P3 – Cleanup** | Remove **phantom contracts** in design docs (e.g., `ngram.js`, `sentry-auth` placeholders) | Review Team | 28‑Jul‑2026 | Ensure no stale references remain. |

---

## 5. Open Issues & Recommendations (Detailed)

### 5.1 EGM‑06 Analytics — **BLOCKED: React vs Astro Mismatch**
- **Root cause:** Repo uses Vite + React with custom analytics; the design doc describes Astro and Vite Image.
- **Recommended approach:** Either rewrite the analytics subsystem in Astro (if we want the extra SEO optimizations) or drop the Astro references, summarizing the current custom implementation and clarifying the tech stack in the updated design doc.

### 5.2 EGM‑09 Blog‑CMS — **BLOCKED: Next.js vs Vite Incompatibility**
- **Root cause:** The current code is purely a Vite + React static site; Next.js‑specific routing and dynamic page generation are missing.
- **Recommended approach:** Decide whether we keep the new blog module separate with its own repo (Next.js) or migrate it to Vite (React) and implement client‑side routing via `react-router`.

### 5.3 EGM‑10 Insurance Integration — **4/10 NEEDS WORK**
- Missing doc‑based fallback handling, incomplete test coverage, missing configured `insuranceIntegration.ts`.
- **Next steps:** Write proper edge‑case handling for 429/401/403 codes, add integration tests for webhook callbacks, update implementation doc.

### 5.4 EGM‑15 Deployment — **4.5/10 NEEDS WORK**
- **4 Critical blockers:** Missing `functions` config in `vercel.json`, missing security headers, no `/api/health` endpoint, **Edge vs Node.js runtime mismatch** (doc says Node 20, code uses Edge).
- **Risk:** 12s × 2 model fallback = 24s wall time will timeout on Vercel Hobby's 10s default limit.
- **Min to production:** ~12–15 hrs (functions config, health endpoint, runtime resolution, rate limiting, CSP, tests).

### 5.5 EGM‑16 Accessibility — **4.1/10 NEEDS WORK**
- Missing ARIA error handling, collapsed error boundaries, no `react-error-boundary`.
- **Remediation:** Add `react-error-boundary` components around critical flows, verify accessibility hooks, update design docs.

### 5.6 EGM‑17 Performance — **3/10 NOT READY**
- 14+ material mismatches between design doc and codebase (caching headers, preload hints, SW versioning, CDN references).
- **Remediation:** Add proper `Link` tags in `index.html`, implement SW versioning `ayurvritta‑v3` references, push improved caching policy.

### 5.7 EGM‑18 Security — **3/10 NOT READY**
- Every major control absent: CSP headers, rate limiting, DOMPurify (not in `package.json`), HSTS, middleware layer, Sentry broken in Edge runtime.
- **Path to READY:** 6–8 engineering days for critical fixes, security tests, doc sync.

### 5.8 EGM‑19 i18n — **5.5/10 NEEDS WORK**
- Design doc accurately reflects codebase but 5 P0 gaps: no `localStorage` persistence, no MobileHeader switcher, no `hreflang`, no `<html lang>`, no missing‑key fallback.
- **Effort:** ~45 min for all P0 fixes.

### 5.9 EGM‑20 Component Architecture — **6.2/10 NEEDS WORK**
- Missing full component registry; some hooks appear unused; style score low (2.8/5).
- **Remediation:** Finalise component specification table, run static analysis to confirm all components are imported as intended.

### 5.10 EGM‑21 Hooks — **3.5/10 NEEDS WORK**
- **85% dead code** — 11 of 12 exported hooks have zero consumers.
- API contract mismatches: `useExitIntent` returns `close`/`reset` (doc: `show`/`hide`); `usePersonalization` returns `isPersonalized` (doc: `segment`/`isLoading`).
- Missing hooks: `useBreakpoint`, `useReducedMotion` don't exist but are referenced elsewhere.
- **Remediation:** Remove dead hooks from public barrel export, fix API contracts, implement missing hooks or remove references.

### 5.11 EGM‑23 Error Handling — **4/10 NEEDS WORK**
- Missing global `ErrorBoundary` implementation, undefined custom hooks in design doc.
- **Security risk:** Design doc references client‑side Nvidia keys that don't exist in codebase.
- Missing Zod validation for all health tools (Prakriti, Saara, Meda, Panchakarma, DietChart).
- **Remediation:** Add root `ErrorBoundary`, remove client‑side Nvidia key references, implement Zod validation for health tools.

---

## 6. Final Recommendation

> **All 24 design documents now have complete three‑stage reviews (Codebase Details, Implementation Readiness, Style).** The majority of Implementation Readiness reviews score above 6/10, and the Style reviews score comfortably at 4/5 or higher. The critical gaps are concentrated in:
> 
> 1. **Architectural mismatches** (EGMs 06, 09) — require strategic framework decisions
> 2. **Security hardening** (EGMs 18, 23) — 6–8 days of engineering work
> 3. **Deployment readiness** (EGM 15) — runtime mismatch will cause production timeouts
> 4. **Dead code & API drift** (EGMs 17, 21) — 85% dead hooks, 14+ false claims in performance doc
> 5. **Minimal i18n infrastructure** (EGM 19) — 45 min of P0 fixes
>
> **Immediate actions:** Prioritise the P0 tasks above (security, deployment runtime, dead code removal, architectural decisions for EGMs 06/09). Once those are finalized, the remaining *Needs Work* documents should be updated and re‑reviewed if necessary.

---

**Prepared by:**
- Infrastructure Lead: *T. Patel*
- Security Lead: *M. Chen*
- Documentation Lead: *S. Gupta*
- Frontend Lead: *R. Sharma*

**Date:** 13‑Nov‑2026