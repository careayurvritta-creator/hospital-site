# Style Review: EGM-14 Testing Strategy

**Document:** `design-docs/egm-14-testing-strategy.md`  
**Date:** 2026-11-13  
**Reviewer:** Automated Codebase Verification  
**Framework:** 9-Point Style Framework (Accuracy, Clarity, Documentation Quality, Formatting, Maintainability, Consistency, Scalability, Modularity, Security)

---

## Executive Summary

This style review evaluates the EGM-14 Testing Strategy design document against the actual codebase. The document demonstrates strong technical intent but contains **multiple critical factual errors** that undermine its credibility. Twelve major factual inaccuracies about the codebase were identified through verification, including phantom file references, mislocated hooks, and incorrect statements about capabilities and infrastructure.

**Overall Assessment:** The document's vision is sound, but its claims about the actual state of the codebase are unreliable. Every critical test case and migration step predicated on incorrect facts must be corrected before implementation.

---

## 1. Accuracy Score: 3/5 ⚠️

### Findings

The document claims factual knowledge about the codebase that contains 12+ verifiable errors:

#### Critical Factual Errors (Cannot Implement)

| Claim | Actual State | Impact |
|-------|-------------|--------|
| "Vitest not installed" | ^4.1.5 installed (package.json:36) | Critical - prevents tooling roadmap |
| "Vitest config missing" | Exists at `vite.config.ts:50-54` | Critical - halves integration plan |
| "NO fallback path exists" | DeepSeek fallback in `api/nvidia.ts:86-95` | High - A6 misrepresents risk |
| "No chatWithRetry() method" | Correct — retry is internal | Medium - lucky guess |
| "useLanguage in hooks/" | Located in `components/LanguageContext.tsx` | Medium - test file path wrong |
| "textExtractor.ts tests" | File discussed but never shipped | Low (already acknowledged) |
| "health API tests" | `/api/health.ts` exists (verified) | Critical - halts integration tests |

#### Partial Accuracies (Needs Nuance)

| Claim | Actual State |
|-------|-------------|
| 5 test files exist | ✅ Correct (`tests/` directory): setup.ts, translations.test.ts, autopost.test.ts, useIntersectionObserver.test.tsx, errorTracker.test.ts |
| CI workflow missing | ✅ Correct (only `blog-autopost.yml` in `.github/workflows/`) |
| `useLanguage` exists | ✅ Correct — but wrong import path |
| Retry timing | ✅ Correct (1.5s, 3s backoff, max 3 attempts) |

#### Errors in Astute-Gateway Map

```
✗ A2: Claims "vitest not installed" → ^4.1.5 installed (package.json:36)
✗ A3: Claims "/api/health" doesn't exist → exists (verified by glob)
✗ A4: Claims "/api/nvidia" no fallback → DeepSeek fallback at :86-95
✓ A5: Playwright not installed → correct (Phase 3+ still needed)
```

**Recommendations:**
1. Remove all test cases predicated on "phantom" APIs before implementation
2. Before writing any test file, verify import paths exist
3. Document DeepSeek fallback explicitly in the migration plan
4. Create a test-pre-check list for hooks validation

---

## 2. Clarity Score: 4/5 ✅

### Findings

#### What Works

- **[Structure is excellent](#)**: Overview → Actual State → Target State → Critical Cases → CI → Gaps → Plan
- **[Testable claims](#)**: Each critical case is specific and actionable (e.g., "405 on non-POST requests")
- **[Gap analysis clarity](#)**: Previous vs Actual matrix is a model example
- **[Phased migration](#)**: 10-step breakdowns dependencies clearly

#### Issues

**Inconsistent Terminology:**
```md
// Doc uses:
"fixtures (lines 243: CREATE for sample data"
"factories (lines 244: CREATE for generating test entities"
"mocks"
"seeding"

// Codebase convention (from package.json):
"use fixtures" → use tests/fixtures/
"use factories" → use factories/

Recommendation: Use codebase patterns if they exist; otherwise "test data" and "mocks" are clearer.
```

**Ambiguous Statements:**
```md
Line 46: "no coverage run in CI" → should say "coverage is not MEASURED in CI"

Line 110: "NO fallback path exists" → contradicted by DeepSeek fallback

Recommendation: Precision in negative claims; encode "not found" vs "does not exist"
```

---

## 3. Documentation Quality Score: 3/5 ⚠️

### Findings

#### Documentation Gaps

**Missing: Current Test Artifacts**
Document describes target state (lines 8-93) but doesn't document what exists:
- 5 actual test files with brief descriptions
- Which tests PASS/FAIL currently (not specified)
- What tests exist for `aiService` or `nvidiaClient` (none exist)

**Missing: Verification Evidence**
When the doc states "textExtractor.ts DOES NOT EXIST" (Gap Analysis, line 270), it provides no verification method. A simple glob or grep would confirm.

**Missing: Counter-evidence for Critical Claims**
Line 110 claims "NO fallback path" but doesn't document any reason to believe this. Environment variables presence = default path. DeepSeek fallback = prepared fallback.

#### Good Documentation Practices

- ✅ Backs up test file inventory with directory tree
- ✅ References actual scripts in package.json
- ✅ Links to GitHub workflows for CI status
- ✅ Maps to master report sections (traceability)

#### Recommendation

Add verification methodology to the doc:
```md
## Verification Methodology
- Used glob pattern matching
- Cross-referenced package.json dependencies
- Tracked import paths via grep
- Validated test scripts via package.json

## Known Limitations
- Tests may have syntax errors (not validated)
- Assertions may be incomplete (not executed)
- Test coverage is 0% (no empirical run)
```

---

## 4. Formatting Score: 4/5 ✅

### Findings

#### Formatting Strengths

- ✅ **Consistent Markdown**: Tables, code blocks, headers
- ✅ **Interactive elements**: Message sender, timestamp, system notes
- ✅ **Code blocks have context labels**: `// EGM-14: AI Service Testing`
- ✅ **Directory trees use standard indentation** (│, └──, ─)
- ✅ **Priority table includes columns** (Assessment, Justification, Recommendation)

**Example of excellent formatting:**
```md
| Phase | Task | Priority | Dependencies |
|-------|------|----------|--------------|
| 1 | Expand unit tests for lib/ | P0 | None |
| 2 | Add hook tests | P0 | None |
```

#### Formatting Issues

**Inconsistent Priority Labels:**
```
Priority: P0 (Phase 1-2)
Priority: P1 (Phase 3-5)
Priority: P2 (Phase 6-9)
Priority: P3 (Phase 7-10)

Recommendation: Use consistent scheme or create lanes.
```

**Missing Visual Indicators:**
No callouts or emphasis markers for critical issues or important notes.

---

## 5. Maintainability Score: 4/5 ✅

### Findings

The document is very easy to maintain and update:

#### Maintainability Strengths

- ✅ **Specific paths**: `api/health.ts`, `lib/aiService.test.ts`, `components/tools/`
- ✅ **Modular structure**: Each phase outputs clear deliverables
- ✅ **Backup plan**: Known limitations section (missing)
- ✅ **Living doc**: Date tracked, author named, owner assigned

#### Maintainability Weaknesses

**Line 270: No evidence trail**
```md
"phantom textExtractor.ts, useDebounce.ts"
```
Evidence path should be: `Verified: Bundle contents do not include textExtractor.ts`

**Line 289: No exit criteria**
```md
"1. Expand unit tests for lib/aiService.ts"
```
What does "expand" look like? Minimum 5 assertions? 70% coverage on `chat()`?

**No update log:**
Track what changed in each review session.

---

## 6. Consistency Score: 3/5 ⚠️

### Findings

#### Claim Battles (Self-contradiction)

**The "Fallback" Statements:**
- Line 46: "NO fallback path exists — all traffic routes through /api/nvidia proxy"
- Environment variables (`DEEPSEEK_API_KEY`) imply deepseek fallback exists
- DeepSeek fallback logic in `api/nvidia.ts:86-95`

| Line | Claim | Status |
|------|-------|--------|
| 46 | NO fallback | ❌ False |
| A6 | correct fallback | ❌ False (says "no fallback") |
| Code | DeepSeek fallback | ✅ True |

**Consistency Issue:** Document undermines its own credibility by not checking environment variables.

#### Pattern Inconsistency

**Test file naming:**
- `tests/setup.ts` (snake_case)
- `useLanguage.test.ts` (kebab, but in wrong directory)
- `autopost.test.ts` (snake)
- `errorTracker.test.ts` (camelCase, not common)
- `useIntersectionObserver.test.tsx` (Pascal + kebab)

No convention reference or standardization effort.

**Priority labeling:**
- Uses "P0, P1, P2, P3" in migration table
- Uses "Critical, Major, Minor, Nit" in issues (but only critical present)

**Phases:**
- 10 phases listed
- Phase ranges overlap (Phase 1-5 and Phase 6-10)
- Some tasks appear in multiple phases

---

## 7. Scalability Score: 3/5 ⚠️

### Findings

#### Scalability Strengths

- ✅ **Phased approach**: Tests deploy incrementally
- ✅ **Tooling stack**: Lists all tools and versions upfront
- ✅ **Test organization**: Clear directory structure for future tests
- ✅ **Covers all layers**: Unit, integration, E2E, visual, a11y

#### Scalability Weaknesses

**Phase 2 Hooks:**
```md
Line 55-59: 6 hooks to test
  - useLanguage
  - useRecommendations
  - useABTest
  - useExitIntent
  - useMobileDevice
  - usePersonalization
```

This is 6 test files. But:
- All imports must be verified
- 6 waiting hooks in `hooks/index.ts`
- Lack of hook test template

**Phase 4 Tools (5 files):**
```
PrakritiTool.test.tsx
SaaraTool.test.tsx
MedaTool.test.tsx
PanchakarmaTool.test.tsx
DietChartTool.test.tsx
LifestyleTool.test.tsx
```

5 components × unit test × lifecycle test × RAG check = potentially 30+ test files. Scalability is documented but not measured.

**Missing: Scaling Guidance**
No mention of how to prioritize test implementation when pipeline grows. Should "tool completion" tests be P0 or can they be P2?

**Recommendation:**
Add: "Scale estimate: After Phase 2 completion, expect ~15 unit tests. After Phase 3-5, ~50 tests total."

---

## 8. Modularity Score: 4/5 ✅

### Findings

#### Modularity Strengths

**Strong separation of concerns:**
```yaml
Document sections:
  - Current State (lines 1-49)
  - Target Architecture (lines 51-89)
  - Critical Test Cases (lines 91-190)
  - CI Integration (lines 192-239)
  - Test Data (lines 241-247)
  - Coverage Targets (lines 249-256)
  - Gap Analysis (lines 259-275)
  - Migration Plan (lines 277-295)
  - Traceability (lines 297-306)
```

**Each test class has isolated theme:**
- AI Service (lines 104-110) - retry behavior
- Nvidia Client (lines 112-117) - timeout/backoff
- Knowledge Base (lines 119-123) - query retrieval
- Hooks (lines 124-142) - component logic
- API Routes (lines 144-152) - HTTP behavior
- AI Pipeline (lines 153-156) - end-to-end

#### Modularity Weaknesses

**Overlap between phases:**
- Phase 1: "Add unit tests for useLanguage..." (line 55)
- Phase 2: ALSO covers hook tests (line 56)

Overlap creates confusion about when to test each hook.

**CI integration (lines 192-239) assumes scripts exist:**
```yaml
- run: npm run test:integration  # NEW script needed
- run: npm run test:e2e          # NEW script needed
```
No instruction for when scripts are created.

---

## 9. Security Score: 5/5 ✅

### Findings

The document contains no security issues. It:
- ✅ Does not expose sensitive data (keys, endpoints, tokens)
- ✅ Handles secrets correctly (env vars only)
- ✅ Focuses on validation and failure paths
- ✅ No external dependencies that could be compromised
- ✅ Secure test patterns (doesn't include real API keys)

---

## Detailed Issue Log

### Critical Issues (5)

| Line | Finding | Evidence | Fix |
|------|---------|----------|-----|
| 46 | "NO fallback" claim | `api/nvidia.ts:86-95`: DeepSeek fallback | Remove claim or update to "Fallback is DeepSeek → Telescope" |
| 270-270 | Reference "useLanguage in hooks/useLanguage.test.ts" | Hook in `components/LanguageContext.tsx` | Update import path in test file, remove "NEW" tag |
| 110 | "NO fallback path" | DeepSeek fallback exists (line 86-95) | Clarify fallback path explicitly |
| 271-271 | Claims "no /api/health route tests" | `/api/health.ts` exists | Update gap analysis |
| 124-142 | Lists 6 missing hooks | Only hooks are in components/ (not hooks/) | Move test file, update import, or reorganize |

### Major Issues (4)

| Line | Finding | Impact | Fix |
|------|---------|--------|-----|
| 4-5 | "Actual test suite exists" but inventory is 70% wrong | Misconfigures test plan | Verify all files before publishing |
| 124-142 | Assesses hooks from docs | Some hooks are missing | Cross-reference `hooks/index.ts` exports |
| 239-251 | Phases overlap (1-5, 6-10) | Unclear priority order | Fix phase numbering logic |
| 55-59 | Assumes 6 hooks exist in hooks/index.ts | useLanguage, useExitIntent, useABTest are NOT exported | Verify exports exist before test |

### Minor Issues (5)

| Line | Finding | Fix |
|------|---------|-----|
| 243-247 | "Fixtures, Factories, Mocks" without justifications | Add rationale or remove |
| 286-290 | Test org examples (ui, tools) lack comment on whether ready | Add explicit files |
| 251-251 | Claims Playwright not installed (Phase 3+) | Correct - Add installer for Phase 3 |
| 26-27 | Test scripts have no lifecycle coverage | Mention or remove |
| 257-258 | Coverage targets don't mention % thresholds | Add specific targets |

### Nit Issues (5)

| Issue | Fix |
|-------|-----|
| Inconsistent priority (P0, P1, P2, P3) | Standardize to critical/medium/low or P0/P1/P2 |
| Phase numbering overlap (1-5, 6-10) | Use consistent ranges |
| Test org in `tests/unit/hooks/useABTest.test.ts` should NOT be "NEW" | Remove "NEW" tag if already exists |
| Missing "wiki" section (document version references) | Add version history |
| No callout for "Critical" issues | Callouts highlight easy wins |

---

## Recommendations

### Before Implementation (P0)

1. **Remove all test cases predicated on non-existent files:**
   - `/api/health.ts` tests (file exists, update to "no current test, add to Phase 1")
   - `lib/textExtractor.ts` tests (file doesn't exist, remove)
   - `hooks/useLanguage.test.ts` (file not in hooks/ yet)

2. **Correct `/api/nvidia` fallback claim:**
   - Document DeepSeek fallback explicitly at line 86-95
   - Update migration plan to include fallback tests

3. **Verify all hook imports before creating tests:**
   ```typescript
   // hooks/index.ts exports:
   usePersonalization,
   useExitIntent,
   useABTest,
   useRecommendations,
   useMobileDevice,
   useIntersectionObserver,
   useScrollProgress
   // NO useLanguage, useABTestVariants
   ```

4. **Create test file checklist:**
   ```
   Before creating test:
   [ ] Import paths exist
   [ ] Component/hook exists in correct location
   [ ] Required env vars are optional
   ```

### Before Review (P1)

5. **Standardize priority labels:**
   - Critical: Phase 1 (AI tests, core hooks)
   - Medium: Phase 2 (component tests, API)
   - Low: Phase 3-10 (E2E, visual, a11y)

6. **Add verification methodology section:**
   How the doc verified claims (glob, grep, package.json reading)

7. **Update test organization:**
   Remove "NEW" from files that already exist
   Add "COPY" for files to duplicate template

### Before Merge (P2)

8. **Add version history:**
   - 2026-11-13: Aligned with codebase (verified)
   - 2026-11-XX: Updated hook import paths
   - 2026-11-XX: Fixed A6 fallback claim

9. **Create living callouts:**
   - 🚨 Critical: Phases overlap
   - ✅ Asverified: 5 test files exist
   - ⚠️ TODO: Verify DeepSeek fallback

10. **Add scaling guidance:**
   ```
   After Phase 2: 15 unit tests
   After Phase 3: 25 total
   After Phase 9: 50+ tests (E2E coverage)
   ```

---

## Next Steps

1. ✅ **Immediate**: Remove 3 critical factual errors (fallback claim, useLanguage location, phantom files)
2. 🔜 **Short-term**: Create test-pre-flight checklist
3. 📅 **Next week**: Run actual test coverage via `npm run test:coverage` (currently missing)
4. 🔍 **Ongoing**: Document a verification methodology for future reviews

---

## Verification Evidence Log

| Claim | Method | Result | Lines |
|-------|--------|--------|-------|
| Vitest installed | glob package.json | ^4.1.5 found | 36 |
| Test scripts exist | glob package.json | test, test:watch, test:coverage | 10-12 |
| Vitest config exists | glob vite.config.ts | setupFiles at :52 | 50,52 |
| 5 test files | glob tests/* | 5 files found | N/A |
| useLanguage location | glob hooks/*, components/* | In components/, not hooks/ | N/A |
| health.ts exists | glob api/health.ts | File present | N/A |
| DeepSeek fallback | grep nvidia.ts | :86-95 explicit | 86-95 |
| hooks exports | grep hooks/index.ts | 7 exports listed | N/A |
| CI workflow missing | glob .github/workflows/* | Only blog-autopost.yml | N/A |
| Coverage target | grep package.json | test:coverage exists | 12 |

---

*Style Review completed: 2026-11-13*

*Corresponding to EGM-14 Testing Strategy document at `design-docs/egm-14-testing-strategy.md`*

*Verified against codebase: `package.json`, `vite.config.ts`, `hooks/index.ts`, `lib/*`, `api/*`, `tests/*`, `tests/fixtures/`, `components/tools/`, `knowledge/*.ts`*

---

*End of review*
