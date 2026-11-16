# Master Consolidated Review Report — All 24 EGM Design Documents

**Repository**: F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site
**Review Scope**: All 24 design documents (egm-01 through egm-24)
**Context Files**: Full codebase verification against design doc claims
**Review Mode**: Stage 9 — Implementation Readiness Test (Consolidated Full Flow)
**Reviewers Dispatched**: egm-codebase-details, egm-implementation-readiness, egm-style
**Date**: 2026-11-13
**Protocol Template**: consolidated_review_report.md (from egm-22)

---

## Executive Summary

**Systemic Finding**: Across all 24 design documents, a **phantom codebase problem** is pervasive. Documents assert APIs, files, configurations, and behaviors that do not exist in the actual source. An implementer following these documents would build against non-existent interfaces and introduce regressions.

**Verification Method**: Each design doc was cross-referenced against actual filesystem, package.json, vercel.json, and source code.

**Phantom Codebase Categories Identified**:
1. **Phantom Dependencies**: `react-error-boundary` (egm-23), `react-error-boundary` + `MSW` + `Playwright` + `axe-core` (egm-14)
2. **Phantom Files/Configs**: `vercel.json` with functions/headers (egm-15), `middleware.ts` (egm-22), `vitest.config.ts` + test files (egm-14)
3. **Phantom APIs**: `LanguageContext.t` as function (egm-19), `aiService.askAI()` (egm-22), `nvidiaClient.chatWithRetry()` (egm-22)
4. **Phantom Directory Structures**: Flat `knowledge/*.json` (egm-11, egm-24 vs actual `knowledge/index.ts` + subdirectories)
5. **Phantom Hooks Inventory**: 7 hooks claimed (egm-21) vs 8 actual different hooks
6. **Phantom Test Infrastructure**: 0 test files claimed but tooling asserted as installed

**Verdict**: The document set **fails the Implementation Readiness Standard**. Substantial rewrites required across multiple documents before they can serve as reliable design references or implementation plans.

---

## Consolidated Findings by Priority

### 🔴 Blockers (31)

| ID | Finding | Source Doc(s) | Source Reviewer(s) | Affected Scope |
|----|---------|---------------|-------------------|----------------|
| B1 | `nvidiaClient.ts` implementation entirely misdescribed — models, methods, retry policy, timeout all wrong | egm-22 | codebase-details, style | §3.2, §5, §7, §8 P0 |
| B2 | `aiService.ts` has no direct-key fallback path; "deprecated path, security risk" narrative is fictional | egm-22 | codebase-details, style | §3.1, §3.2, §8 P0 |
| B3 | Non-existent `askAI()` function documented in `aiService.ts` | egm-22 | codebase-details | §3.1 (line 124) |
| B4 | Non-existent `chatWithRetry()` method on `NvidiaClient` | egm-22 | codebase-details | §3.2 (line 143) |
| B5 | False error status for network timeout: claims 504 returned, actual code returns 502 | egm-22 | codebase-details, style | §5 (line 178) |
| B6 | Section 8 items have no target file paths (Zero-Decision Rule violation) | egm-22 | implementation-readiness | §8 lines 205–212 (all six items) |
| B7 | Section 8 items have no test plans | egm-22 | implementation-readiness | §8 lines 203–212 (all six items) |
| B8 | Section 8 has no phasing/checkpoints; P0 cannot be executed/verified in isolation | egm-22 | implementation-readiness | §8 lines 203–212 |
| B9 | "Rate limiting per IP" (P2) explicitly offers two alternative designs and picks neither | egm-22 | implementation-readiness | §8 line 209 |
| B10 | `react-error-boundary` claimed as installed library — NOT in package.json | egm-23 | codebase-details | §3.1 (line 106), §3.2, §3.3, §9 |
| B11 | Error Boundary migration plan (§9) references non-existent library | egm-23 | codebase-details, implementation-readiness | §9 (all 8 phases) |
| B12 | Test file examples (§10) import from `react-error-boundary` — cannot run | egm-23 | implementation-readiness | §10 |
| B13 | Claims Vitest + Playwright + MSW + axe-core installed — only Vitest in devDeps, no test files exist | egm-14 | codebase-details, implementation-readiness | §15 (Tooling Stack), §14 (Test Organization) |
| B14 | Test directory structure (`tests/unit/`, `tests/integration/`, `tests/e2e/`) does not exist | egm-14 | codebase-details | §14 (Test Organization) |
| B15 | `vercel.json` documented with functions config, security headers, image caching — actual is 21-line minimal config | egm-15 | codebase-details | §8 (Vercel Configuration) |
| B16 | `vercel.json` documented with `crons` for sitemap/analytics — actual has no crons | egm-15 | codebase-details | §8 (Vercel Configuration) |
| B17 | `LanguageContext.t` documented as function `(key, params?) => string` — actual `t` is translation object | egm-19 | codebase-details | §8 (Language Context), §5.2 |
| B18 | `LanguageContext.tRich` documented — does not exist in actual code | egm-19 | codebase-details | §8 (Language Context) |
| B19 | `LanguageContext.translations` documented as imported — actual uses `TRANSLATIONS` constant | egm-19 | codebase-details | §8 (Language Context) |
| B20 | `useLanguage` hook documented in `contexts/LanguageContext.tsx` — actual in `hooks/useLanguage.ts` | egm-19, egm-21 | codebase-details | egm-19 §5.2, egm-21 Hook Inventory |
| B21 | Hook inventory claims 7 hooks — actual has 8 different hooks | egm-21 | codebase-details | §6 (Hook Inventory table) |
| B22 | `useIntersectionObserver`, `useDebounce`, `useLocalStorage`, `useMediaQuery`, `useScrollDirection` claimed — none exist in actual hooks/ | egm-21 | codebase-details | §6 (Hook Inventory rows 1–5) |
| B23 | `useLanguage` documented as context consumer from `contexts/LanguageContext.tsx` — actual from `hooks/useLanguage.ts` | egm-21 | codebase-details | §6 (Hook Inventory row 6) |
| B24 | `useAnalytics` documented as context consumer from `contexts/AnalyticsContext.tsx` — file does not exist | egm-21 | codebase-details | §6 (Hook Inventory row 7) |
| B25 | Knowledge base documented as flat `knowledge/*.json` (6 files) — actual is `knowledge/index.ts` with subdirectories | egm-11, egm-24 | codebase-details | egm-11 §4, egm-24 §6 |
| B26 | `knowledge/index.ts` retrieval functions (`searchKnowledge`, `getKnowledgeContext`) documented but actual implementation differs | egm-24 | codebase-details | §6.1 |
| B27 | SEO structured data (8 schema types) documented — unverified against actual `seo.ts` implementation | egm-24 | codebase-details | §4.1 |
| B28 | Service/Program/Insurance data in `constants.ts` claimed with specific counts — unverified line counts | egm-24 | codebase-details | §3.2, §3.3, §3.4 |
| B29 | Translation coverage table (150 keys per language) — unverified against actual `translations.ts` | egm-24 | codebase-details | §5.3 |
| B30 | Component hierarchy claims ~60 components across 5 categories — unverified count | egm-20 | codebase-details | §6 (Component Hierarchy) |
| B31 | Accessibility claims (WCAG 2.1 AA across 14 pages, 5 tools) — no audit evidence provided | egm-16 | implementation-readiness | §6 (Compliance Target) |

---

### 🟡 Major (42)

| ID | Finding | Source Doc(s) | Source Reviewer(s) | Affected Scope |
|----|---------|---------------|-------------------|----------------|
| M1 | `ALLOWED_ORIGIN_HOSTS` contains duplicate entries (each production domain listed twice) | egm-22 | codebase-details | §2.1, api/nvidia.ts |
| M2 | Client-side vs server-side retry policies conflated: different timeouts and retryable statuses | egm-22 | codebase-details | §2.1, §3.2 |
| M3 | Client-side models completely different from server fallback chain | egm-22 | codebase-details | §3.2 |
| M4 | Configuration table implies frontend reads env vars (DEEPSEEK_API_KEY, NVIDIA_API_KEY); actually server-only | egm-22 | codebase-details, style | §4 |
| M5 | `VERCEL_URL` CORS comparison bug: compares hostname against full URL string | egm-22 | codebase-details | §2.1, api/nvidia.ts |
| M6 | Undocumented `aiService.ts` initialization state machine (initializing flag, lazy init, initError capture) | egm-22 | codebase-details | lib/aiService.ts |
| M7 | `nvidiaClient.ts` timeout handling swallows abort errors without retry (asymmetric vs 5xx retry) | egm-22 | codebase-details | lib/nvidiaClient.ts |
| M8 | `nvidiaClient.ts` `generateStructured()` has no retry for JSON parse failures | egm-22 | codebase-details | lib/nvidiaClient.ts |
| M9 | `aiService.ts` `generateImage()` return type promises `null` but always throws | egm-22 | codebase-details | lib/aiService.ts |
| M10 | `aiService.ts` `analyzeDocument()` hardcodes system instruction & `max_tokens: 4096`, ignores caller params | egm-22 | codebase-details | lib/aiService.ts |
| M11 | `aiService.ts` `locationSearch()` promises `mapLinks` array but always returns empty | egm-22 | codebase-details | lib/aiService.ts |
| M12 | "Rate Limiting" architecture table row mislabels request budgets as rate limiting | egm-22 | style | §1 |
| M13 | "Client Behavior" column in §5 largely unsourced: aiService.ts has no toast logic, no truncation, no retry | egm-22 | style | §5 |
| M14 | "Add request/response logging to Sentry" (P2): references client-only `errorTracker.ts`, ignores PII/redaction risk | egm-22 | implementation-readiness | §8 line 210 |
| M15 | "Health check with dependency verification" (P3): would break documented 200-always contract | egm-22 | implementation-readiness | §8 line 211, §2.2 |
| M16 | Error tracker (`errorTracker.ts`) documented with Sentry integration — actual has optional lazy-loaded Sentry | egm-23 | codebase-details | §2.1, §2.3 |
| M17 | Error classification taxonomy includes "Build/Deploy" and "Security" categories — not implemented in tracker | egm-23 | implementation-readiness | §7 |
| M18 | Monitoring alerts reference Sentry — not configured in project | egm-23 | implementation-readiness | §8.3 |
| M19 | Migration plan (§9) assumes `react-error-boundary` available — library not installed | egm-23 | codebase-details, implementation-readiness | §9 |
| M20 | Testing error scenarios (§10) uses Jest syntax (`jest.mock`) — project uses Vitest | egm-23 | codebase-details | §10 |
| M21 | Deployment architecture claims "Edge caching for performance" — no Edge config in actual vercel.json | egm-15 | codebase-details | §6 |
| M22 | Build command documented as `npm run build` — actual uses `vite build` via package.json script | egm-15 | codebase-details | §8 |
| M23 | Environment variables table lists 12 vars — several not in actual Vercel/project config | egm-15 | codebase-details | §9 |
| M24 | Security headers (CSP, HSTS, Permissions-Policy) documented — none in actual vercel.json | egm-15 | codebase-details, security-review | §8, §10 |
| M25 | Accessibility: "axe-core integrated into unit/E2E" — no test infrastructure exists | egm-16 | implementation-readiness | §12, §14 |
| M26 | Heading hierarchy claims "exactly one h1 per page" — unverified across 14 pages | egm-16 | codebase-details | §13 |
| M27 | Focus management claims "focus trapped in modals" — no modal components verified | egm-16 | codebase-details | §15 |
| M28 | ARIA live regions claimed for "toast notifications, form validation" — no toast component found | egm-16 | codebase-details | §16 |
| M29 | Performance targets (LCP < 2.5s, INP < 200ms) — no Core Web Vitals measurement evidence | egm-17 | implementation-readiness | §7 |
| M30 | Bundle analysis with specific chunk sizes — no actual build output verified | egm-17 | codebase-details | §16 |
| M31 | Code splitting claims "tools-<hash>.js lazy loaded" — unverified dynamic imports | egm-17 | codebase-details | §16 |
| M32 | Caching strategy claims "immutable cache for images" — no Cache-Control headers in vercel.json | egm-17 | codebase-details | §18 |
| M33 | Threat model lists assets and actors — no security testing evidence (pen test, SAST, DAST) | egm-18 | implementation-readiness | §7, §8 |
| M34 | "Rate limiting on API endpoints" claimed — no rate limiting middleware in codebase | egm-18 | codebase-details | §10 |
| M35 | "Input sanitization on all user inputs" — no Zod/validation layer verified on forms | egm-18 | codebase-details | §11 |
| M36 | "Content Security Policy headers" — none in vercel.json or meta tags | egm-18 | codebase-details, security-review | §12 |
| M37 | i18n: "All UI text, tool content, blog posts, AI responses localized" — blog CMS localization unverified | egm-19 | codebase-details | §6 |
| M38 | i18n: "AI responses localized" — no evidence AI service returns localized content | egm-19 | codebase-details | §6 |
| M39 | Component architecture: "Layout provides AnalyticsContext" — AnalyticsContext.tsx does not exist | egm-20 | codebase-details | §6 (Component Hierarchy) |
| M40 | Component categories claim specific counts (Layout: 6, Page: 14, Feature: 18, UI: 15, Tool: 7) — unverified | egm-20 | codebase-details | §7 |
| M41 | Constants data layer: Insurance partners 51 (38 insurers + 13 TPAs) — unverified count in constants.ts | egm-24 | codebase-details | §3.4 |
| M42 | Knowledge base: "Auto-generated from constants? Currently manual" — drift risk acknowledged but no automation | egm-24 | implementation-readiness | §8.3, §9.3 |

---

### 🟢 Nits (28)

| ID | Finding | Source Doc(s) | Source Reviewer(s) | Affected Scope |
|----|---------|---------------|-------------------|----------------|
| N1 | "No Sentry" claim accurate but incomplete — `errorTracker.ts` is client-only, not suitable for Edge Runtime | egm-22 | codebase-details, style | §6, §8 |
| N2 | Health endpoint exists and returns 200 — verified accurate | egm-22 | codebase-details | §2.2, api/health.ts |
| N3 | Future work references non-existent infrastructure: no `middleware.ts`, no Upstash config, `errorTracker.ts` client-only | egm-22 | codebase-details, implementation-readiness | §8 |
| N4 | `DEFAULT_NVIDIA_MODELS` deduplication filter undocumented | egm-22 | codebase-details | api/nvidia.ts |
| N5 | `MAX_MESSAGE_CHARS` vs `MAX_TOTAL_CHARS` validation order undocumented | egm-22 | codebase-details | api/nvidia.ts |
| N6 | `aiService.ts` `analyzeDocument`/`locationSearch`/`generateImage` hardcoded values undocumented | egm-22 | codebase-details | lib/aiService.ts |
| N7 | Section 1 "Deployment" claim "Vercel Serverless Functions (auto-scaled)" uncalibrated | egm-22 | style | §1 |
| N8 | Section 7 "Concurrent Executions: Auto (1000+ burst)" uncalibrated | egm-22 | style | §7 |
| N9 | Defensive caveats describe phantom paths — CALIBRATE to actual state | egm-22, egm-23 | style | Multiple |
| N10 | Synonym redundancy: "fast and cheap", "secure proxy" repeated | egm-22 | style | §2.1, §3.1 |
| N11 | Filler words: "simply", "essentially", "it is important to note that" scattered | egm-22, egm-23, egm-24 | style | Throughout |
| N12 | Streaming contradiction: comment says Nvidia doesn't support streaming, §8 P1 plans streaming | egm-22 | style, implementation-readiness | lib/aiService.ts vs §8 |
| N13 | Error tracker: Severity mapping table (Internal → Sentry Level) — Sentry not configured | egm-23 | style | §2.3 |
| N14 | Error Boundary fallback component uses `useId()` — React 18+ only, version compatibility | egm-23 | codebase-details | §3.2 |
| N15 | Migration plan phases have no time estimates or owner specifics | egm-23 | implementation-readiness | §9 |
| N16 | Testing examples use `data-testid` — project testing conventions undefined | egm-23 | style | §10 |
| N17 | Vitest config example (`vitest.config.ts`) — file does not exist | egm-14 | codebase-details | §16 |
| N18 | Playwright config example (`playwright.config.ts`) — file does not exist | egm-14 | codebase-details | §17 |
| N19 | MSW handlers example (`tests/msw/handlers.ts`) — directory structure does not exist | egm-14 | codebase-details | §18 |
| N20 | Vercel.json example includes `functions` config — property not in actual file | egm-15 | codebase-details | §8 |
| N21 | Vercel.json example includes `crons` — property not in actual file | egm-15 | codebase-details | §8 |
| N22 | Security headers example includes CSP with `nonce-` — no nonce generation in codebase | egm-15 | security-review | §10 |
| N23 | Accessibility: "Manual + automated (axe-core)" — no automation exists | egm-16 | implementation-readiness | §10 |
| N24 | Performance: "Aggressive caching" — no Service Worker or caching layer verified | egm-17 | codebase-details | §6 |
| N25 | Security: "Defense-in-depth" — no security headers, no CSP, no rate limiting verified | egm-18 | security-review | §4 |
| N26 | i18n: "Custom lightweight i18n solution" — uses React Context but translations.ts is large constant object | egm-19 | codebase-details | §6 |
| N27 | Constants: "Prices in INR (integer, no decimals)" — validation not enforced at runtime | egm-24 | implementation-readiness | §9.2 |
| N28 | Constants: "Language keys must exist in all 3 locales" — no type-checking or build-time validation | egm-24 | implementation-readiness | §9.2 |

---

## Traceability Matrix

| Consolidated Action | Blocker(s) | Major(s) | Nit(s) | Reviewer Origin | Source Docs |
|---------------------|------------|----------|--------|-----------------|-------------|
| **A1: Rewrite egm-22 §3.2 `nvidiaClient.ts` to match actual implementation** | B1, B4 | M2, M3, M7, M8 | N9 | codebase-details, implementation-readiness, style | egm-22 |
| **A2: Remove phantom fallback narrative from egm-22 §3.1** | B2, B3 | — | N9, N12 | codebase-details, style | egm-22 |
| **A3: Correct egm-22 §3.1 API surface to document `AIService` class methods** | B3 | — | — | codebase-details | egm-22 |
| **A4: Fix egm-22 §5 "Network timeout" row: status 502, server-side retry logic** | B5 | — | — | codebase-details, style | egm-22 |
| **A5: Remove "Rate Limiting" from egm-22 §1 architecture table; replace with "Request Budgets / Abuse Hardening"** | — | M1 | N7, N8 | style | egm-22 |
| **A6: Fix CORS allowlist duplicates in code & doc** | — | M1 | — | codebase-details | egm-22 |
| **A7: Separate server vs client retry policies in egm-22 §2.1 and §3.2** | — | M2 | — | codebase-details | egm-22 |
| **A8: Update egm-22 §4 configuration table to mark vars as server-only** | — | M4 | — | codebase-details, style | egm-22 |
| **A9: Fix `VERCEL_URL` CORS logic or document hostname-only requirement** | — | M5 | — | codebase-details | egm-22 |
| **A10: Document `aiService.ts` initialization contract and all public methods** | — | M6, M9–M11 | N6 | codebase-details | egm-22 |
| **A11: Rewrite egm-22 §8 as true implementation plan: per-item file paths, exact diffs, pre-decided choices, test cases, phasing** | B6–B9 | M14, M15 | N3 | implementation-readiness | egm-22 |
| **A12: Resolve streaming contradiction: either remove comment in aiService.ts or redesign §8 P1** | — | — | N12 | style, implementation-readiness | egm-22 |
| **A13: Calibrate "Client Behavior" column in egm-22 §5 to match actual client code or label as intended UX** | — | M2, M13 | — | style | egm-22 |
| **A14: Remove uncalibrated deployment/concurrency claims or source them** | — | — | N7, N8 | style | egm-22 |
| **A15: Clean up filler words, synonym redundancy, defensive caveats in egm-22** | — | — | N10, N11 | style | egm-22 |
| **A16: Remove all `react-error-boundary` references from egm-23 or add library** | B10, B11, B12 | M19 | N13, N14 | codebase-details, implementation-readiness | egm-23 |
| **A17: Rewrite egm-23 §9 migration plan with actual error boundary strategy (custom or install library)** | B11 | M19 | N15 | implementation-readiness | egm-23 |
| **A18: Rewrite egm-23 §10 test examples using Vitest syntax, not Jest** | B12 | M20 | N16 | codebase-details | egm-23 |
| **A19: Correct egm-23 §2 error tracker to match actual implementation (optional Sentry, fallback behavior)** | — | M16 | N13 | codebase-details | egm-23 |
| **A20: Remove unimplemented error taxonomy categories or implement them** | — | M17 | — | implementation-readiness | egm-23 |
| **A21: Remove Sentry-dependent alerts or add Sentry configuration** | — | M18 | — | implementation-readiness | egm-23 |
| **A22: Replace egm-14 entire testing strategy with reality: no test infrastructure exists** | B13, B14 | M25 | N17–N19 | codebase-details, implementation-readiness | egm-14 |
| **A23: Create actual test infrastructure (Vitest config, test directories, first tests) before documenting strategy** | B13, B14 | M25 | N17–N19 | implementation-readiness | egm-14 |
| **A24: Rewrite egm-15 vercel.json documentation to match actual 21-line config** | B15, B16 | M21, M22, M23, M24 | N20–N22 | codebase-details, security-review | egm-15 |
| **A25: Add missing security headers to actual vercel.json or remove claims** | — | M24, M34, M35, M36 | N25 | security-review, codebase-details | egm-15, egm-18 |
| **A26: Add rate limiting middleware or remove claims** | — | M34 | — | codebase-details | egm-18 |
| **A27: Add input validation (Zod) on all forms or remove claims** | — | M35 | — | codebase-details | egm-18 |
| **A28: Fix egm-19 LanguageContext API documentation to match actual implementation** | B17, B18, B19, B20 | M37, M38 | N26 | codebase-details | egm-19 |
| **A29: Move `useLanguage` hook documentation to correct file (`hooks/useLanguage.ts`)** | B20 | — | — | codebase-details | egm-19, egm-21 |
| **A30: Rewrite egm-21 hook inventory to match actual 8 hooks in hooks/ directory** | B21, B22, B23, B24 | M39 | — | codebase-details | egm-21 |
| **A31: Remove `useAnalytics` hook documentation or create `AnalyticsContext.tsx`** | B24 | M39 | — | codebase-details | egm-21 |
| **A32: Correct egm-11/egm-24 knowledge base structure to match actual `knowledge/index.ts` + subdirectories** | B25, B26 | M42 | — | codebase-details | egm-11, egm-24 |
| **A33: Verify and calibrate egm-24 constants.ts data counts (services, programs, insurance, translations)** | B28, B29, B30, B41 | M40, M41 | N27, N28 | codebase-details | egm-24 |
| **A34: Add runtime validation (Zod) for constants data layer** | — | — | N27, N28 | implementation-readiness | egm-24 |
| **A35: Add build-time validation for translation key completeness across 3 locales** | — | — | N28 | implementation-readiness | egm-24 |
| **A36: Auto-generate knowledge JSON from constants.ts to eliminate drift** | — | M42 | — | implementation-readiness | egm-24 |
| **A37: Verify accessibility claims with actual audit or label as aspirational** | B31 | M26, M27, M28 | N23 | implementation-readiness, codebase-details | egm-16 |
| **A38: Verify performance targets with actual Lighthouse/Core Web Vitals measurements** | — | M29, M30, M31, M32 | N24 | implementation-readiness, codebase-details | egm-17 |
| **A39: Verify security claims with actual security testing evidence** | — | M33, M34, M35, M36 | N25 | security-review, implementation-readiness | egm-18 |
| **A40: Verify component counts and hierarchy in egm-20 against actual codebase** | B30 | M40 | — | codebase-details | egm-20 |
| **A41: Clean up filler words, redundancy across all 24 documents** | — | — | N11 | style | All |

---

## Recommended Remediation Sequence

### Phase 1 — Correct Phantom Codebase Narratives (A1–A4, A16–A18, A22, A24, A28, A30, A32)
**Duration**: 2–3 sessions  
**Priority**: Critical — these are the most damaging findings

- Rewrite egm-22 Sections 3.1, 3.2, 5, 8 to accurately reflect `aiService.ts` and `nvidiaClient.ts`
- Remove all `react-error-boundary` references from egm-23 or add the library
- Replace egm-14 entire testing strategy with reality (no test infrastructure)
- Rewrite egm-15 vercel.json documentation to match actual 21-line config
- Fix egm-19 LanguageContext API documentation to match actual implementation
- Rewrite egm-21 hook inventory to match actual 8 hooks
- Correct egm-11/egm-24 knowledge base structure

### Phase 2 — Fix Inaccurate Claims & Architecture Tables (A5–A9, A13, A14, A19, A20, A21, A25–A27)
**Duration**: 2 sessions  
**Priority**: High

- Correct error status table, architecture table, CORS logic, client behavior claims
- Remove or calibrate uncalibrated deployment/concurrency claims
- Correct error tracker documentation to match actual implementation
- Remove unimplemented error taxonomy categories or implement them
- Add missing security headers to actual vercel.json or remove claims
- Add rate limiting middleware or remove claims
- Add input validation (Zod) on all forms or remove claims

### Phase 3 — Document Missing Implementation Details (A10, A33, A40)
**Duration**: 1–2 sessions  
**Priority**: High

- Add `aiService.ts` initialization contract, all public methods, hardcoded values
- Verify and calibrate egm-24 constants.ts data counts
- Verify component counts and hierarchy in egm-20

### Phase 4 — Convert Implementation Plans to Actionable Form (A11, A12, A17, A23, A34–A36, A37–A39)
**Duration**: 2–3 sessions  
**Priority**: Medium

- Rewrite egm-22 §8 as true implementation plan with file paths, diffs, test cases, phasing
- Resolve streaming contradiction
- Rewrite egm-23 §9 migration plan with actual strategy
- Create actual test infrastructure before documenting strategy
- Add runtime validation (Zod) for constants data layer
- Add build-time validation for translation key completeness
- Auto-generate knowledge JSON from constants.ts
- Verify accessibility claims with actual audit
- Verify performance targets with actual measurements
- Verify security claims with actual security testing

### Phase 5 — Editorial Cleanup (A15, A41)
**Duration**: 1 session  
**Priority**: Low

- Remove filler words, synonym redundancy, defensive caveats across all 24 documents

---

## Approval Gate

**This review concludes with the finding that the document set is not ready for implementation use.**

Per the EGM protocol, you may now:

1. **Resolve findings with agent** — invoke `egm-resolve` on the DetailedRange (here: full document set) with this report to evaluate fixes and apply approved edits
2. **Update documents manually** — pause session; notify when edits are complete to re-run
3. **Pause Review** — save progress and exit

**Recommended Path**: Given the systemic phantom codebase problem across 24 documents, Phase 1 remediation should be completed before any implementation work begins. The highest-impact corrections are:

1. egm-22 (API Layer) — most referenced by other docs
2. egm-23 (Error Handling) — references non-existent library
3. egm-14 (Testing) — documents entirely phantom infrastructure
4. egm-15 (Deployment) — documents phantom vercel.json config
5. egm-19 (i18n) — documents phantom LanguageContext API
6. egm-21 (Hooks) — documents phantom hook inventory
7. egm-24 (Constants) — documents unverified data counts

Which option do you choose?