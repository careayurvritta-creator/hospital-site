# EGM-23 Error Handling Style Review

## Executive Summary

**Overall Score**: 2.8/5 (Moderate)

**Criteria Scores (1-5)**:
1. **Clarity & Structure**: 2
2. **Completeness**: 3
3. **Accuracy**: 3
4. **Actionability**: 2
5. **Formatting**: 3
6. **Terminology Consistency**: 3
7. **Evidence-Based Claims**: 2
8. **Missing Critical Sections**: 3
9. **Overall Usability**: 2

**Key Findings**:
- **Critical**: No React Error Boundaries (P0), incorrect claims about client-side Nvidia API keys (security risk), missing validation in health tools (P0).
- **Major**: Inconsistent terminology ("fallback" vs. "proxy"), unverified Sentry config (sample rate 1.0), missing error taxonomy for client validation.
- **Minor**: Outdated method claims (`chatWithRetry`), broken traceability table, unused sections (e.g., "Migration Plan" without implementation).

---

## Detailed Findings

| Severity | Location       | Issue                                                                 | Code Evidence                                                                 |
|----------|----------------|-----------------------------------------------------------------------|-------------------------------------------------------------------------------|
| Critical | §3 React Error Boundaries | **NO ERROR BOUNDARIES EXIST** (claims "none installed" but shows no implementation). | Codebase has NO `react-error-boundary` import/usage. |
| Critical | §5.2 `aiService.ts` | **FICTITIOUS CLIENT-SIDE FALLBACK** (claims local Nvidia key usage, which is a security vulnerability). | `aiService.ts` uses ONLY Vercel proxy (`'proxy'` apiKey), no client-side key logic. |
| Critical | §6.1 Health Tool Validation | **MISSING VALIDATION** in Prakriti/Saara/Meda/Panchakarma/DietChart tools. | No Zod schemas or input validation implemented in these components. |
| Major    | §2.3 Sentry Config       | **UNVERIFIED SAMPLE RATES** (100% error sample rate risks cost overruns). | `tracesSampleRate: 1.0` in doc vs. recommended 0.1-0.2. |
| Major    | §5.1 `nvidiaClient.ts`  | **NON-EXISTENT METHOD** `chatWithRetry()` documented but not implemented. | `nvidiaClient.ts` has ONLY internal retry in `chat()`, no separate method. |
| Major    | §7 Error Taxonomy        | **MISSING CLIENT VALIDATION CATEGORY** (e.g., form errors). | Taxonomy table lacks "Client Validation" row (present in master report). |
| Minor    | §10 Testing             | **NO TEST FILES EXIST** despite claiming "tests/errorBoundary.test.tsx". | No test files in `/tests` directory. |
| Minor    | §9 Migration Plan       | **UNACTIONABLE PHASES** (e.g., Phase 6 "Remove fictional fallback" already done in EGM-22). | Migration Plan includes completed tasks from prior reports. |
| Nit      | §2.5 Method Details      | **INCONSISTENT TERMINOLOGY** ("fallback" vs. "proxy" for Vercel API route). | Doc uses "fallback" 12x, but code uses "proxy" exclusively. |
| Nit      | §3.1 Component Table     | **BROKEN TRACEABILITY** (master report action A17 not fully applied). | Table still lists "❌ None" for Error Boundaries but lacks remediation steps. |

---

## Line-Specific Issues

1. **§3 React Error Boundaries** (Lines 108-122):
   - **Claim**: "NONE EXIST" but fails to specify that `react-error-boundary` is **NOT INSTALLED**.
   - **Code Evidence**: No `react-error-boundary` in `package.json` or imports.
   - **Impact**: Critical gap—users see full app crashes.

2. **§5.2 `aiService.ts`** (Lines 196-197):
   - **Claim**: "Local fallback to `nvidiaClient.ts` (direct Nvidia call)".
   - **Code Evidence**: `aiService.ts` uses ONLY Vercel proxy (`'proxy'` apiKey), no client-side key path.
   - **Impact**: Security risk if implemented as documented.

3. **§5.1 `nvidiaClient.ts`** (Lines 196-197):
   - **Claim**: `chatWithRetry()` method exists.
   - **Code Evidence**: Only internal retry in `chat()`, no separate method.
   - **Impact**: Misleads developers into calling non-existent method.

4. **§6.1 Health Tool Validation** (Lines 240-249):
   - **Claim**: "No Zod schema for 20-question payload" in PrakritiTool.
   - **Code Evidence**: No Zod schemas in tool components or validation layer.
   - **Impact**: P0 risk of invalid user input.

5. **§2.3 Sentry Config** (Lines 65-74):
   - **Claim**: `tracesSampleRate: 1.0` (100% sampling).
   - **Code Evidence**: No Sentry init in codebase (Sentry is optional, lazy-loaded).
   - **Impact**: Potential cost overruns if enabled.

---

## Actionable Recommendations

**Priority: P0 (Critical)**
1. **Install `react-error-boundary`** and add root/component boundaries (per §9 Phase 1-4).
2. **Remove ALL references to client-side Nvidia keys** in docs and code comments (security risk).
3. **Implement Zod validation** for ALL health tools (import Zod, create schemas in `lib/validation`).

**Priority: P1 (Major)**
4. **Standardize terminology**: Replace "fallback" with "proxy" for Vercel API route.
5. **Correct Sentry sample rates** to 0.1-0.2 in docs (align with recommended config).
6. **Add "Client Validation" category** to error taxonomy table.

**Priority: P2 (Minor/Nit)**
7. **Remove non-existent methods** (`chatWithRetry`) from docs.
8. **Delete stale migration tasks** (e.g., Phase 6 already completed).
9. **Update component table** to show Error Boundary remediation steps.
10. **Add test files** for Error Boundaries (use Vitest + React Testing Library).

---

## Suggested Revised Structure

1. **Architecture Overview** (keep)
2. **Error Tracking** (combine §2 and Sentry details)
3. **Error Boundaries** (expand §3 with implementation steps)
4. **API Error Handling** (merge §4 and client-side retry)
5. **Input Validation** (new section for health tools)
6. **Error Taxonomy** (keep, add missing categories)
7. **Monitoring** (keep, add alerting thresholds)
8. **Remediation Guide** (replace Migration Plan with actionable fixes)
9. **Testing** (add real test examples)

---

## Conclusion

The document contains **critical inaccuracies** (e.g., client-side API keys, missing Error Boundaries) and **major omissions** (e.g., client validation errors) that undermine its reliability. While it provides a reasonable architecture overview, **actionable implementation details are lacking**, especially for P0 issues like Error Boundaries and input validation. **Recommend addressing P0 items immediately** and restructuring the document to focus on verifiable, code-aligned guidance.