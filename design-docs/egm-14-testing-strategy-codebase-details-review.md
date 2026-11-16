# EGM-14 Testing Strategy — Codebase Details Review

**Review Date:** 2026-11-13  
**Reviewed Document:** `design-docs/egm-14-testing-strategy.md`  
**Codebase Root:** `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site`

---

## Executive Summary

The design document `egm-14-testing-strategy.md` is **largely accurate** but contains **several material discrepancies** that need correction. The document correctly identifies the 5 existing test files and the installed Vitest + RTL tooling, but misses that Vitest configuration exists inside `vite.config.ts`, incorrectly states the `/api/health` endpoint doesn't exist, and lists phantom test references that don't align with actual source files. The recommended strategy is well-aligned with the Vite + React Router architecture but needs updates to reflect actual codebase structure.

**Overall Rating:** ⚠️ **Warning** — Document is directionally correct but has factual errors that could mislead implementation.

---

## Findings Table

| Severity | ID | Finding | Location in Doc | Codebase Evidence |
|----------|----|---------|-----------------|-------------------|
| **Critical** | C-01 | Vitest config exists in `vite.config.ts` (not missing) | Line 10-17 "Installed Tooling" table | `vite.config.ts` lines 50-54 |
| **Critical** | C-02 | `/api/health` endpoint EXISTS (claimed phantom) | Line 272 Gap Analysis | `api/health.ts` exists |
| **Critical** | C-03 | `textExtractor.ts` EXISTS (claimed phantom) | Line 270 Gap Analysis | `lib/textExtractor.ts` exists |
| **Critical** | C-04 | `useDebounce.ts` does NOT exist (correctly phantom) | Line 271 Gap Analysis | Not found in codebase |
| **Warning** | W-01 | Missing `useLanguage` hook reference (doesn't exist) | Line 124-127 Phase 1 | `hooks/index.ts` doesn't export it |
| **Warning** | W-02 | Missing hooks not documented: `useExitIntent`, `useMobileDevice`, `usePersonalization`, `useScrollProgress` | Line 282 Migration Plan | Exist in `hooks/index.ts` |
| **Warning** | W-03 | Test scripts table incomplete — missing `test:ui` | Line 21-28 | `package.json` only has 3 test scripts |
| **Warning** | W-04 | Coverage config not detailed (uses Vitest native, not Istanbul) | Line 42-46 | `vite.config.ts` has no coverage config |
| **Suggestion** | S-01 | Recommended test org structure doesn't match actual source layout | Lines 62-96 | Source files in root + `lib/`, `hooks/`, `api/`, `analytics/`, `knowledge/`, `components/` |
| **Suggestion** | S-02 | Missing test file for `lib/textExtractor.ts` in recommended structure | Lines 66-70 | File exists but not in recommended list |
| **Suggestion** | S-03 | `tools/autopost.mjs` tested but not in recommended unit structure | Lines 30-40 | Exists as integration test but CLI tool |
| **Suggestion** | S-04 | No `.github` directory exists — CI steps need full setup | Line 194 | Confirmed missing |

---

## Detailed Findings with Code References

### C-01: Vitest Configuration Exists (Embedded in vite.config.ts)

**Document Claim:** "Vitest" row shows version but implies no config file exists  
**Reality:** Vitest is configured inline in `vite.config.ts` lines 50-54:

```typescript
test: {
  environment: 'jsdom',
  setupFiles: ['./tests/setup.ts'],
  globals: true,
}
```

**Impact:** The document should reflect that Vitest config exists and is co-located with Vite config (standard Vite practice). The "Missing Critical Tooling" table (line 54-60) should note config exists.

---

### C-02: `/api/health` Endpoint Exists

**Document Claim (Line 272):** "No /api/health route exists — Remove phantom references"  
**Reality:** File exists at `api/health.ts`:

```typescript
export default async function handler(req: Request) {
  return new Response(JSON.stringify({ 
    status: 'ok',
    message: 'API is working',
    timestamp: new Date().toISOString()
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
```

**Impact:** The Gap Analysis table is wrong. The health endpoint exists and should be tested. The Phase 2 integration tests should include it.

---

### C-03: `lib/textExtractor.ts` Exists

**Document Claim (Line 270):** "textExtractor.ts DOES NOT EXIST — Remove phantom references"  
**Reality:** File exists at `lib/textExtractor.ts` (confirmed via glob search). It's a legitimate source file that should have unit tests.

**Impact:** The Gap Analysis is incorrect. The Phase 1 unit tests should include `lib/textExtractor.test.ts`.

---

### C-04: `useDebounce.ts` Correctly Identified as Phantom

**Document Claim (Line 271):** "useDebounce.ts DOES NOT EXIST — Remove phantom references"  
**Reality:** Confirmed — no such file exists in codebase. This finding is **accurate**.

---

### W-01: `useLanguage` Hook Doesn't Exist

**Document Claim (Lines 124-127):** Lists `useLanguage` as a hook to test  
**Reality:** `hooks/index.ts` exports: `usePersonalization`, `useExitIntent`, `useABTest`, `useABTestVariants`, `useRecommendations`, `useMobileDevice`, `useNetworkStatus`, `useOrientation`, `useIntersectionObserver`, `useIntersectionObserverMultiple`, `useScrollProgress`, `useScrollProgressElement`, `useParallax`. **No `useLanguage` hook exists.**

Language handling appears to be via `LanguageContext.tsx` (context-based, not hook-based).

**Impact:** Phase 1 test plan includes a non-existent hook. Should test `LanguageContext` instead.

---

### W-02: Additional Hooks Missing from Migration Plan

**Document Claim (Line 282):** Lists `useExitIntent`, `useMobileDevice`, `usePersonalization`, `useScrollProgress` as Phase 2  
**Reality:** These **do exist** and are exported from `hooks/index.ts`. They should be **Phase 1** (unit tests for all hooks), not Phase 2.

Missing from doc entirely: `useNetworkStatus`, `useOrientation`, `useIntersectionObserverMultiple`, `useScrollProgressElement`, `useParallax`.

**Impact:** Migration plan underestimates hook test coverage needed.

---

### W-03: Test Scripts Incomplete

**Document Claim (Lines 21-28):** Lists 3 test scripts  
**Reality:** `package.json` confirms only 3 scripts:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

**Missing (common in Vitest projects):** `test:ui` for Vitest UI, `test:integration` (referenced in CI but doesn't exist).

**Impact:** CI integration references `npm run test:integration` (line 211) which doesn't exist.

---

### W-04: Coverage Configuration Absent

**Document Claim (Line 46):** "Test coverage: Not measured (no `npm run test:coverage` run in CI)"  
**Reality:** The `test:coverage` script exists but `vite.config.ts` has **no coverage configuration** (no `coverage` block in test config). Vitest uses `@vitest/coverage-v8` by default but needs explicit config for thresholds, reporters, excludes.

**Impact:** Running `npm run test:coverage` will work but with defaults only. Coverage thresholds (line 249-257) cannot be enforced without config.

---

### S-01: Recommended Test Organization vs Actual Source Layout

| Doc Recommended Path | Actual Source Location | Match? |
|---------------------|------------------------|--------|
| `tests/unit/lib/aiService.test.ts` | `lib/aiService.ts` | ✅ |
| `tests/unit/lib/nvidiaClient.test.ts` | `lib/nvidiaClient.ts` | ✅ |
| `tests/unit/lib/knowledge/index.test.ts` | `knowledge/index.ts` | ✅ |
| `tests/unit/hooks/` | `hooks/*.ts` | ✅ |
| `tests/unit/components/ui/` | `components/ui/reactbits/*.tsx` | ⚠️ Partial |
| `tests/unit/components/tools/` | `components/tools/*.tsx` | ✅ |
| `tests/unit/utils/validation.test.ts` | No validation lib yet | ❌ |
| `tests/integration/api/nvidia.test.ts` | `api/nvidia.ts` | ✅ |
| `tests/integration/ai/aiService.integration.test.ts` | `lib/aiService.ts` | ✅ |
| **Missing from doc:** `tests/unit/lib/textExtractor.test.ts` | `lib/textExtractor.ts` | ❌ |
| **Missing from doc:** `tests/unit/analytics/` | `analytics/*.ts` (15 files) | ❌ |
| **Missing from doc:** `tests/unit/components/ChatBot.test.tsx` | `components/ChatBot.tsx` | ❌ |
| **Missing from doc:** `tests/unit/components/Layout.test.tsx` | `components/Layout.tsx` | ❌ |

**Impact:** The recommended structure misses entire directories (`analytics/`, `components/` root, `data/`, `constants.ts`, `seo.ts`, `translations.ts`).

---

### S-02: Missing `textExtractor.test.ts` in Recommended Structure

The `lib/textExtractor.ts` file exists but is absent from the recommended test organization (lines 66-70). It should be added to `tests/unit/lib/`.

---

### S-03: `autopost.test.ts` is a CLI Integration Test

The existing `tests/autopost.test.ts` tests `tools/autopost.mjs` (a Node CLI script), not a React component or lib function. It uses `execFileSync` to run the actual binary. This is correctly categorized but the recommended structure doesn't account for CLI tool testing.

---

### S-04: No GitHub Actions Workflow Directory

Confirmed: `.github/workflows/` does not exist. The CI integration section (lines 192-237) is entirely aspirational. Creating the workflow file will require creating the directory structure.

---

## Architecture Comparison Table

| Aspect | Design Doc | Actual Codebase | Alignment |
|--------|------------|-----------------|-----------|
| **Framework** | Vite + React Router | Vite 6.2 + React 19 + React Router 6.22 | ✅ Accurate |
| **Test Runner** | Vitest 4.1.5 | Vitest 4.1.5 (in vite.config.ts) | ✅ Accurate |
| **React Testing** | RTL 16.3.2 | RTL 16.3.2 | ✅ Accurate |
| **DOM Environment** | jsdom 29.1.1 | jsdom 29.1.1 (configured in vite.config.ts) | ✅ Accurate |
| **E2E Tool** | Playwright (not installed) | Not installed | ✅ Accurate |
| **API Mocking** | MSW (not installed) | Not installed | ✅ Accurate |
| **A11y Testing** | axe-core (not installed) | Not installed | ✅ Accurate |
| **Source Structure** | Implied standard | Flat root + `lib/`, `hooks/`, `api/`, `analytics/`, `knowledge/`, `components/`, `pages/`, `data/` | ⚠️ Doc oversimplified |
| **API Routes** | `/api/nvidia` only | `/api/nvidia.ts` + `/api/health.ts` | ⚠️ Missing health |
| **AI Architecture** | Nvidia NIM via proxy | Nvidia NIM + DeepSeek fallback via Vercel Edge Function | ✅ Accurate |
| **State Management** | Not specified | React Context (LanguageContext, AnalyticsProvider) + hooks | ⚠️ Undocumented |
| **Styling** | Not specified | Tailwind CSS 3.4 + ReactBits UI components | ⚠️ Undocumented |

---

## Recommendations

### Immediate Corrections (Critical)

1. **Fix Gap Analysis Table (Lines 263-274):**
   - Remove row claiming `/api/health` doesn't exist — it does
   - Remove row claiming `textExtractor.ts` doesn't exist — it does
   - Keep row for `useDebounce.ts` — correctly identified as phantom

2. **Update Current State Tooling Table (Lines 10-19):**
   - Add note: "Vitest configured inline in `vite.config.ts` (lines 50-54)"
   - Add row: "Vitest Config: ✅ Exists (embedded)"

3. **Add Missing Source Files to Phase 1 Unit Tests:**
   - `lib/textExtractor.test.ts`
   - `analytics/` directory (15 files — prioritize `errorTracker`, `eventTracker`, `recommendationEngine`, `abTestManager`, `bookingFunnelTracker`)
   - `components/ChatBot.tsx`, `components/Layout.tsx`, `components/LanguageContext.tsx`
   - `translations.ts` (already tested via `translations.test.ts` ✅)
   - `constants.ts`, `seo.ts`, `types.ts`

4. **Correct Hook Inventory:**
   - Remove `useLanguage` from Phase 1 (doesn't exist)
   - Add all existing hooks to Phase 1: `useExitIntent`, `useMobileDevice`, `useNetworkStatus`, `useOrientation`, `usePersonalization`, `useRecommendations`, `useABTest`, `useABTestVariants`, `useScrollProgress`, `useScrollProgressElement`, `useParallax`, `useIntersectionObserver`, `useIntersectionObserverMultiple`

### Short-term Fixes (Warning)

5. **Add Missing Test Scripts to package.json:**
   ```json
   "test:ui": "vitest --ui",
   "test:integration": "vitest run --config vitest.integration.config.ts"
   ```

6. **Add Coverage Configuration to vite.config.ts:**
   ```typescript
   test: {
     // ...existing
     coverage: {
       provider: 'v8',
       reporter: ['text', 'json', 'html', 'lcov'],
       thresholds: {
         lines: 80,
         functions: 80,
         branches: 70,
         statements: 80,
       },
       exclude: ['tests/**', 'tools/**', '**/*.d.ts', 'vite.config.ts'],
     },
   }
   ```

7. **Create Separate Integration Test Config:**
   Create `vitest.integration.config.ts` for API route testing with MSW.

8. **Update Migration Plan Priorities:**
   - Move all hook tests to Phase 1 (P0)
   - Add `analytics/` unit tests to Phase 1 (P1)
   - Add `components/` unit tests to Phase 1 (P1)
   - Move MSW installation to P0 (enables integration tests)

### Structural Improvements (Suggestion)

9. **Align Recommended Test Structure with Actual Source:**
   ```
   tests/
   ├── setup.ts
   ├── unit/
   │   ├── lib/
   │   │   ├── aiService.test.ts
   │   │   ├── nvidiaClient.test.ts
   │   │   ├── textExtractor.test.ts        # ADD
   │   │   └── knowledge/index.test.ts
   │   ├── hooks/                           # ALL hooks here
   │   ├── components/
   │   │   ├── ui/                          # ReactBits components
   │   │   ├── tools/                       # Prakriti, Saara, etc.
   │   │   ├── ChatBot.test.tsx             # ADD
   │   │   ├── Layout.test.tsx              # ADD
   │   │   └── LanguageContext.test.tsx     # ADD
   │   ├── analytics/                       # ADD entire directory
   │   │   ├── errorTracker.test.ts         # EXISTING - move here
   │   │   ├── eventTracker.test.ts
   │   │   ├── recommendationEngine.test.ts
   │   │   ├── abTestManager.test.ts
   │   │   └── bookingFunnelTracker.test.ts
   │   ├── utils/
   │   │   ├── validation.test.ts           # When Zod added
   │   │   └── seo.test.ts                  # ADD
   │   └── data/
   │       └── blog/loadPosts.test.ts       # ADD
   ├── integration/
   │   ├── api/
   │   │   ├── nvidia.test.ts
   │   │   └── health.test.ts               # ADD
   │   └── ai/
   │       └── aiService.integration.test.ts
   ├── e2e/                                 # Requires Playwright
   ├── visual/                              # Requires Playwright
   └── accessibility/                       # Requires axe-core
   ```

10. **Document State Management Approach:**
    The codebase uses React Context (`LanguageContext`, `AnalyticsProvider`) + custom hooks. Tests should verify context providers wrap components correctly.

11. **Add TypeScript Test Configuration:**
    Ensure `tsconfig.json` includes test files and `vitest/globals` types.

12. **Create `.github/workflows/test.yml` Directory Structure:**
    The workflow file cannot be created until `.github/workflows/` directory exists.

---

## Verification Checklist for Document Update

- [ ] Correct Gap Analysis table (3 rows fixed)
- [ ] Update Tooling table with Vitest config location
- [ ] Add `textExtractor.ts` to Phase 1 unit tests
- [ ] Add `/api/health` to Phase 2 integration tests
- [ ] Remove `useLanguage` from Phase 1; add all actual hooks
- [ ] Add `analytics/` unit test recommendations
- [ ] Add `components/` unit test recommendations
- [ ] Add coverage config to vite.config.ts example
- [ ] Add missing test scripts to package.json example
- [ ] Update recommended test organization to match actual source layout
- [ ] Note that `.github/workflows/` directory must be created
- [ ] Update "Last updated" date

---

*Review completed by EGM Codebase Details Reviewer on 2026-11-13*