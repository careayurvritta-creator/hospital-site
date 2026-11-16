# EGM-14 Testing Strategy — Implementation Readiness Review

**Reviewed:** `design-docs/egm-14-testing-strategy.md` (last updated 2026-11-13)
**Reviewer:** EGM Implementation Readiness Reviewer
**Date:** 2026-11-13
**Verification method:** Direct codebase inspection + live test run (`npm test` → 4 files, 30 tests, all passing, 51.7s)

---

## Executive Summary

EGM-14 is a self-correcting document: it was written specifically to fix phantom claims in a previous version (missing vitest, phantom textExtractor tests, etc.), and it succeeds for the **AI stack** (`lib/nvidiaClient.ts`, `lib/aiService.ts`, `api/nvidia.ts`, `knowledge/index.ts`) — every behavioral claim there was verified against source and is exact. However, the document carries **its own generation of phantom references**: it declares `lib/textExtractor.ts` and `/api/health` as non-existent when both exist, references a `hooks/useLanguage.ts` that does not exist, and prescribes component tests for "Button, Card, Modal" UI primitives that are not in the codebase (`components/ui/` contains only `reactbits/` components). It also omits ~5 exported hooks and the entire `analytics/` layer (20 files) from the recommended structure, and its own `test:coverage` script cannot run because `@vitest/coverage-v8` is not installed — which blocks the Phase 1 "80% coverage" goal on day one.

**Implementability score: 7 / 10**

- Phases 1 (AI-stack unit tests) and 5 (MSW + /api/nvidia integration) are implementable today with high confidence.
- Phase 2 (hooks) and Phase 3 (components) need doc corrections before execution to avoid implementers chasing phantom targets.
- Coverage targets are unachievable until the coverage provider is installed.

**Verdict: NEEDS WORK** — targeted corrections, not a rewrite. Fix the phantom references, the coverage tooling gap, and the hook/component inventory, then it is READY.

---

## Findings Summary

| # | Severity | Finding | Doc Location | Codebase Evidence |
|---|----------|---------|--------------|-------------------|
| F1 | **Critical** | Doc's Gap Analysis claims `textExtractor.ts` DOES NOT EXIST — it **does** (`lib/textExtractor.ts`, client-side PDF/image text extraction) | Gap Analysis table, row 6; Traceability A3 | `lib/textExtractor.ts` (verified, exports `extractTextFromFile`) |
| F2 | **Critical** | Doc's Gap Analysis claims "No /api/health route exists" — it **does** (`api/health.ts`, returns `{status:'ok'}`) | Gap Analysis table, row 7; Traceability A4 | `api/health.ts` (verified) |
| F3 | **Critical** | `npm run test:coverage` **cannot run** — `@vitest/coverage-v8` is not a devDependency; blocks the Phase 1 "80% lines / 70% branches" target | Current State (lists script as available), Coverage Targets | `package.json` devDependencies; `npm ls @vitest/coverage-v8` → empty |
| F4 | **Critical** | `hooks/useLanguage.ts` does not exist — language state lives in `components/LanguageContext.tsx`; doc prescribes `hooks/useLanguage.test.ts` | Recommended Test Organization; Critical Test Cases; Migration Plan Phase 2 | `hooks/index.ts` (no useLanguage export); `components/LanguageContext.tsx` exists |
| F5 | **Warning** | Phase 3 prescribes tests for "UI primitives (Button, Card, Modal)" — none exist; `components/ui/` contains only `reactbits/` (TiltedCard, Stepper, SpotlightCard, etc.) | Recommended Test Organization (`components/ui/`); Migration Plan Phase 3 | `components/` glob — 46 files, no Button/Card/Modal |
| F6 | **Warning** | Hooks test plan is incomplete: `useNetworkStatus`, `useOrientation`, `useIntersectionObserverMultiple`, `useScrollProgressElement`, `useParallax` are exported but never mentioned | Recommended Test Organization; Migration Plan Phase 2 | `hooks/index.ts` lines 12–16 |
| F7 | **Warning** | `analytics/` layer (20 files: consentManager, dataGovernance, eventTracker, bookingFunnelTracker, abTestManager, …) is absent from the recommended test structure; only `errorTracker` appears (via the existing test) | Recommended Test Organization; Migration Plan | `analytics/` glob — 20 .ts files |
| F8 | **Warning** | Tool inventory misses `LifestyleTool.tsx`; doc says "all 5 tools" (Prakriti, Saara, Meda, Panchakarma, DietChart) — there are 6 tool components (+ DietChartRenderer, DietChartPDF) | Migration Plan Phase 4; Visual Regression Phase 4 | `components/tools/` — 8 files |
| F9 | **Warning** | Doc counts "5 test files"; actually **4** test files + `setup.ts` (not a test). Minor but undermines the doc's own "corrected current state" credibility | Current State → Actual Test Files | Glob: translations, autopost, hooks/useIntersectionObserver, analytics/errorTracker = 4 |
| F10 | **Warning** | Integration test approach for `/api/nvidia` is unspecified: handler is a Vercel Web-API-style `export default async function handler(req: Request)`; doc proposes MSW (client-side mocking) but never says how the handler itself is invoked in tests (direct call with `Request` objects + env var stubbing for origin allowlist/API key) | Phase 2: Integration Tests; Migration Plan Phase 5 | `api/nvidia.ts` (Request/Response, `jsonResponse`, origin check, `RETRYABLE_STATUS`) |
| F11 | **Suggestion** | Doc is silent about the existing CI workflow `.github/workflows/blog-autopost.yml` — a new `test.yml` would be the *second* workflow; worth noting so stages can share setup | CI Integration | `.github/workflows/blog-autopost.yml` exists |
| F12 | **Suggestion** | E2E targets verified good: `/booking` and `/tools` routes exist in `App.tsx`; ChatBot is a real component — no issue, just confirmed | Phase 3: E2E | `App.tsx` lines 34–47 |
| F13 | **Suggestion** | Setup file mocks `console.warn`/`console.error` globally (`tests/setup.ts:102-105`) — will hide assertion-relevant logging (e.g., `[NvidiaClient]` errors) in new tests; doc's new AI tests may want to spy on these instead | — | `tests/setup.ts` |
| F14 | **Suggestion** | `tests/setup.ts` mocks `localStorage`/`sessionStorage` with plain `vi.fn()`s (no real storage behavior) — `useLanguage`-style "persists to localStorage" tests will need real storage or a smarter mock | — | `tests/setup.ts:60-76` |

---

## What the Document Gets Right (Verified)

These claims were checked against source and are **exact** — high confidence for implementers:

| Doc Claim | Verification |
|-----------|--------------|
| Vitest ^4.1.5 + RTL + jest-dom + jsdom installed | ✅ `package.json` devDependencies; live run used Vitest 4.1.7 |
| Playwright / MSW / axe-core NOT installed | ✅ `npm ls` → empty |
| Test scripts: `test`, `test:watch`, `test:coverage` | ✅ (but see F3 — coverage script is broken) |
| `nvidiaClient.chat()`: 3 attempts (2 retries), backoff 1.5s/3s, 30s AbortController timeout, no `chatWithRetry()` | ✅ `lib/nvidiaClient.ts:59-122` — matches to the letter |
| `/api/nvidia`: 405 non-POST, 403 origin, 400 missing messages, 413 too many, 500 no key, 502 all models failed | ✅ `api/nvidia.ts:77,81,102,105,158,175` |
| `aiService`: lazy init guard (`initializing` flag), `isAvailable()`, no fallback provider | ✅ `lib/aiService.ts:29-69,263` |
| `knowledge/index.ts` categories `siddhanta`/`chikitsa`/`hospital` | ✅ `knowledge/` directory structure matches |
| No CI test workflow (`test.yml` missing) | ✅ only `blog-autopost.yml` exists |
| `useIntersectionObserver` exists with a passing test | ✅ `tests/hooks/useIntersectionObserver.test.tsx`, passing |
| `useDebounce.ts` correctly flagged phantom | ✅ not present anywhere |
| Existing suite green | ✅ Live run: 4 files, 30 tests, 0 failures |

---

## Gap Analysis (Doc vs. Codebase)

| Area | Doc Says | Reality | Impact |
|------|----------|---------|--------|
| `lib/textExtractor.ts` | Does not exist (remove phantom tests) | **Exists** — PDF/image text extraction, loads pdf.js from CDN | Phase 1 scope decision needed: it is a *testable, untested* module |
| `/api/health` | Does not exist (remove phantom tests) | **Exists** — trivial health endpoint | Cheap win: 1 integration test |
| `hooks/useLanguage` | Unit test prescribed | Does not exist; logic in `components/LanguageContext.tsx` | Implementer would stall or invent a file |
| UI primitives Button/Card/Modal | Component tests prescribed | Do not exist; `components/ui/` = reactbits only | Phase 3 targets invalid as written |
| Hooks inventory | 4 existing + 7 to add | 8 files, 12 exported hooks; 5 exports unaccounted | Coverage target for `hooks/` unreachable as scoped |
| `analytics/` | Only errorTracker mentioned | 20 modules, incl. consent/GDPR-critical `consentManager`, `dataGovernance` | Largest untested surface absent from plan |
| Coverage provider | `test:coverage` listed as available | `@vitest/coverage-v8` missing → script fails | 80% target unmeasurable |
| Test file count | 5 | 4 test files + setup | Cosmetic |
| CI directory | "no `.github/workflows/test.yml`" | Correct; also existing `blog-autopost.yml` unacknowledged | Context |

---

## 10-Point Framework Assessment

| # | Criterion | Score | Notes |
|---|-----------|-------|-------|
| 1 | Requirements Clarity | 8/10 | Test cases are concrete and behavior-anchored (retry counts, status codes verified exact). Docks points for phantom targets (F1–F5). |
| 2 | Architecture Alignment | 7/10 | Vitest/RTL/jsdom target state matches existing config (`vite.config.ts:50-54`, `@` alias, jsdom env). Gaps: analytics/ and reactbits ignored; Vercel handler harness unspecified (F10). |
| 3 | Component Spec Completeness | 5/10 | No prop/state/event specs for any component test (Button/Card/Modal don't even exist). Tools tests have no isolation strategy (recharts, html2canvas/jspdf in DietChartPDF will need mocks). |
| 4 | Data Flow Definition | 7/10 | AI pipeline flow (question → knowledge → LLM) is clear and matches code. Fixtures/factories section is a stub ("CREATE"). |
| 5 | Integration Points | 6/10 | /api/nvidia status matrix is excellent and verified; but no harness definition for invoking a Vercel Web-API handler under Vitest (F10), and no note that origin-allowlist tests need env stubbing. |
| 6 | Dependencies Identified | 7/10 | New deps correctly listed with install commands (msw, @playwright/test, axe-core, jest-axe). Missed: `@vitest/coverage-v8` — required for an already-broken script (F3). |
| 7 | Edge Cases Covered | 7/10 | Error/timeout/retry/limit states well covered for AI stack. Nothing for analytics consent flows, DietChart PDF export, or ChatBot streaming. |
| 8 | Testing Strategy | 8/10 | Clear 5-phase unit→integration→e2e→visual→a11y ladder with realistic phasing and dependency ordering. Best section of the doc. |
| 9 | Performance Budget | 4/10 | No test-suite runtime budget. Current suite already takes ~52s wall (setup 18.7s, environment 113.6s cumulative) — adding component tests with this setup cost will balloon; no parallelization/sharding guidance. |
| 10 | Migration/Compatibility | 7/10 | Phased migration table with priorities and dependencies is sound; Traceability section maps to master-report actions. But traceability rows A3/A4 are themselves now wrong (F1/F2). |

**Weighted implementability: 7/10**

---

## Recommendations by Priority

### P0 — Fix before any implementation starts (doc edits, ~30 min)

1. **Correct the Gap Analysis table** (F1, F2): mark `lib/textExtractor.ts` and `api/health.ts` as *existing and untested*; add them as Phase 1 candidates (textExtractor PDF path needs a pdf.js CDN mock; health endpoint is a 5-line test).
2. **Remove `hooks/useLanguage.test.ts`** everywhere (F4); replace with a `LanguageContext`/`useLanguageContext` test pointing at `components/LanguageContext.tsx`.
3. **Replace "Button, Card, Modal"** in Phase 3 with real targets: `components/ui/reactbits/*` (Counter, Stepper, RotatingText, OptionWheel…) and prioritize by usage (e.g., OptionWheel and Counter appear in tools).
4. **Add `@vitest/coverage-v8` to the tooling table** (`npm i -D @vitest/coverage-v8`) and note `test:coverage` is currently broken (F3).
5. **Complete the hooks list** in Phase 2 (F6): add `useNetworkStatus`, `useOrientation`, `useIntersectionObserverMultiple`, `useScrollProgressElement`, `useParallax`.
6. **Fix the test-file count** from 5 → 4 (F9).

### P1 — Fix during Phase 1–5 execution

7. **Define the integration-test harness for `/api/nvidia`** (F10): direct invocation of the default export with `new Request(url, {method, body, headers: {origin}})`, `vi.stubEnv`/`process.env` stubs for API key and origin allowlist; MSW only for the *client-side* path (`lib/nvidiaClient.ts` fetch).
8. **Add an `analytics/` test lane** (F7): at minimum `consentManager`, `dataGovernance`, `abTestManager`, `bookingFunnelTracker` (privacy-relevant, pure-logic, cheap to test) as P1 in the migration table.
9. **Include `LifestyleTool`** in Phase 4 / visual-regression scope (F8).
10. **Note `blog-autopost.yml`** in the CI section (F11) so the new `test.yml` reuses its caching/Node-setup conventions.

### P2 — Improve while implementing

11. **Address suite runtime** (F9/point 9): current setup costs ~19s before any test runs; consider per-project vitest config or reducing global console spies (F13) and upgrading the storage mocks (F14) — both will bite the new hook/context tests.
12. **Add a tests isolation note for heavy components**: `DietChartPDF` (jspdf/html2canvas) and tool components using `recharts` need explicit mocks or they will be the slowest/flakiest tests in the suite.

---

## Verdict

### **NEEDS WORK** (7/10)

The document is directionally correct, its AI-stack test cases are verified-exact and immediately implementable, and the phased migration plan is sound. But it repeats the failure mode it was written to fix: **stale phantom references** (textExtractor, /api/health, useLanguage, Button/Card/Modal), a **broken coverage script** that undercuts its own 80% target, and **scope holes** (analytics layer, 5 hooks, LifestyleTool). All fixes are doc-level edits plus one npm install — roughly a day of correction work, after which the document should be re-reviewed and would plausibly score 9/10 and READY.

---

*Review artifacts: verified via direct file reads of `package.json`, `vite.config.ts`, `lib/nvidiaClient.ts`, `lib/aiService.ts`, `api/nvidia.ts`, `api/health.ts`, `lib/textExtractor.ts`, `hooks/index.ts`, `tests/setup.ts`, `tests/translations.test.ts`, `App.tsx`, directory globs of `hooks/`, `analytics/`, `components/`, `tests/`, `knowledge/`, `.github/`; plus a live `npm test` run (4 files / 30 tests passed).*
