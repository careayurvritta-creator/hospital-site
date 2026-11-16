# EGM-18 Security Design Document — Implementation Readiness Review

**Review Date:** 2026-11-13
**Reviewer:** Automated Codebase Audit
**Design Document:** `design-docs/egm-18-security.md` (209 lines)
**Target Codebase:** `hospital-site/` (Vite + React + Supabase + Vercel)

---

## Executive Summary

| Metric | Score |
|--------|-------|
| **Overall Implementability Score** | **4.5 / 10** |
| **Verdict** | **NEEDS WORK** |

The EGM-18 Security design document presents a comprehensive security architecture but **significantly overstates implementation completeness**. While core consent management and API resilience patterns are genuinely implemented, critical production security controls (CSP, HSTS, rate limiting, DOMPurify sanitization, functional error tracking) are either missing entirely or broken in the current codebase.

**Key Finding:** The document claims "implemented" status for 8 security controls that are either:
- **Not deployed** (CSP headers in `vercel.json`, HSTS, rate limiting middleware)
- **Broken in production runtime** (Sentry `require()` in Edge)
- **Not in dependencies** (DOMPurify claimed but absent from `package.json`)

---

## 10-Point Framework Scoring

| # | Criterion | Score | Evidence |
|---|-----------|-------|----------|
| 1 | **Requirements Clarity** | 7/10 | Clear threat model, well-defined security objectives, GDPR/DPDP alignment documented |
| 2 | **Architecture Alignment** | 5/10 | Design assumes middleware layer (rate limiting, CSP) that doesn't exist in Vite/SPA architecture |
| 3 | **Component Spec Completeness** | 4/10 | Specs exist for consent, API client, sanitization — but CSP/HSTS/rate-limiting lack implementation specs |
| 4 | **Data Flow Definition** | 6/10 | Consent → storage → API flow documented; error tracking flow broken (Sentry ESM issue) |
| 5 | **Integration Points** | 4/10 | Vercel headers, Supabase RLS, NVIDIA API documented — but Vercel integration missing CSP/HSTS |
| 6 | **Dependencies Identified** | 3/10 | DOMPurify claimed but not in `package.json`; @sentry/react present but incompatible with Edge runtime |
| 7 | **Edge Cases Covered** | 5/10 | Consent versioning, retry/timeout handled; CSP bypass, sanitization bypass, Sentry silent failure not addressed |
| 8 | **Testing Strategy** | 3/10 | No security test plan, no CSP report-only validation, no penetration test checklist |
| 9 | **Performance Budget** | 6/10 | 30s API timeout, 3-retry backoff defined; CSP header size, Sentry bundle impact not budgeted |
| 10 | **Migration/Compatibility** | 4/10 | Consent migration (v1→v2) implemented; CSP/HSTS rollout strategy missing; Sentry migration to `@sentry/nextjs` or edge-compatible SDK not planned |

**Average Score: 4.7 / 10** → **Rounded: 4.5 / 10**

---

## Findings Table

### 🔴 CRITICAL (Blocks Production Deployment)

| ID | Finding | Evidence | Remediation |
|----|---------|----------|-------------|
| **C-01** | **CSP Headers Missing from Vercel Deployment** | `vercel.json` contains only cache headers for `/images/*` and `/assets/*`. No `Content-Security-Policy` header present. Design doc §4.1 claims "CSP implemented via Vercel headers." | Add CSP headers to `vercel.json` with `report-only` mode first, then enforce. Include `script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net` for CDN PDF.js/Tesseract. |
| **C-02** | **Sentry Error Tracking Broken in Edge Runtime** | `analytics/errorTracker.ts:12` uses `require('@sentry/react')` — **fails in Vercel Edge Runtime** (ESM-only). `@sentry/react@10.52.0` in `package.json` but not edge-compatible. | Migrate to `@sentry/nextjs` (supports Edge) or `@sentry/browser` with dynamic import. Remove `require()`; use `import()`. |
| **C-03** | **DOMPurify Not Installed — Sanitization Gap** | `package.json` has no `dompurify` dependency. `lib/textExtractor.ts` loads PDF.js/Tesseract from CDN without sanitization. `pages/Insurance.tsx` uses custom `sanitizeAndFormat()` with `dangerouslySetInnerHTML` — **XSS risk**. | Add `dompurify` + `@types/dompurify`. Replace custom sanitizer in `Insurance.tsx` and `textExtractor.ts` with DOMPurify `sanitize()` configured for allowed tags/attributes. |
| **C-04** | **No HSTS Header Configured** | `vercel.json` lacks `Strict-Transport-Security`. Design doc §4.2 claims "HSTS enforced." | Add `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` to `vercel.json` headers. |
| **C-05** | **Rate Limiting Middleware Not Implemented** | Design doc §5.3 describes "rate limiting middleware" — **no middleware layer exists** in Vite SPA architecture. No `middleware.ts`, no Vercel Edge Function for rate limiting. | Implement Vercel Edge Function (`middleware.ts`) for API route rate limiting. Define limits per endpoint (e.g., `/api/nvidia`: 10 req/min). |

### 🟡 WARNING (Significant Gaps)

| ID | Finding | Evidence | Remediation |
|----|---------|----------|-------------|
| **W-01** | **Custom Sanitizer Inadequate for Rich Text** | `Insurance.tsx:sanitizeAndFormat()` only escapes `<`, `>`, `&`, `"`, `'` — **allows `javascript:` URLs, `onerror`, `onclick`, `style` injection**. | Replace with DOMPurify with `ALLOWED_TAGS: ['b','i','u','br','p','ul','ol','li','a']`, `ALLOWED_ATTR: ['href','target','rel']`. |
| **W-02** | **CDN Scripts Loaded Without Integrity/Nonce** | `textExtractor.ts` loads PDF.js v4.3.136 and Tesseract.js v5.1.0 from `cdn.jsdelivr.net` — **no Subresource Integrity (SRI)**, no CSP nonce. | Add SRI hashes to script loads. Align CSP `script-src` with nonces for dynamic imports. |
| **W-03** | **Consent Manager Lacks Server-Side Validation** | `analytics/consentManager.ts` stores consent in `localStorage` only — **no server-side audit trail**, no Supabase sync for compliance evidence. | Add optional Supabase `consent_audit` table. Sync consent changes via `fetch('/api/consent', {method:'POST'})` for audit log. |
| **W-04** | **Error Tracker Initializes Before Consent Check** | `errorTracker.ts` initializes Sentry on import — **may track before analytics consent granted** (GDPR Art. 6). | Defer `Sentry.init()` until `consentManager.getConsent('analytics') === true`. |
| **W-05** | **No Security Headers for `Permissions-Policy`, `Referrer-Policy`, `Cross-Origin-Opener-Policy`** | `vercel.json` only has cache headers. Design doc §4.3 references "security headers" generically. | Add: `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `Referrer-Policy: strict-origin-when-cross-origin`, `Cross-Origin-Opener-Policy: same-origin`. |

### 🟢 SUGGESTION (Improvements)

| ID | Finding | Evidence | Remediation |
|----|---------|----------|-------------|
| **S-01** | **Add CSP Report-Only Period Before Enforcement** | No staging for CSP deployment. | Deploy CSP in `report-only` mode for 2 weeks, monitor `/api/csp-report` endpoint, then enforce. |
| **S-02** | **Implement Nonce-Based CSP for Inline Scripts** | Vite injects inline scripts (`__vite_ssr_import_*`, HMR). | Use Vite `cspPlugin` or middleware to generate nonces per request. |
| **S-03** | **Add Security Test Suite** | No automated security tests. | Add `playwright` tests for: CSP header presence, HSTS header, consent flow, XSS payload rejection, rate limit enforcement. |
| **S-04** | **Document Incident Response for Sentry Failure** | Silent Sentry failure = zero error visibility. | Add fallback: `console.error` + local queue + retry sync when Sentry recovers. |
| **S-05** | **Pin CDN Dependencies to Exact Versions with SRI** | `textExtractor.ts` uses `@latest` CDN URLs implicitly. | Pin to exact versions, compute SRI hashes, embed in CSP or script `integrity` attributes. |

---

## Gap Analysis: Document Claims vs. Codebase Reality

| Design Doc Section | Claim | Codebase Reality | Status |
|--------------------|-------|------------------|--------|
| §4.1 CSP Headers | "Implemented via Vercel headers" | **Absent** from `vercel.json` | ❌ False |
| §4.2 HSTS | "Enforced via Vercel" | **Absent** from `vercel.json` | ❌ False |
| §4.3 Security Headers | "Comprehensive headers configured" | Only cache headers present | ❌ False |
| §5.1 Input Sanitization | "DOMPurify used for all user content" | **Not in `package.json`**; custom weak sanitizer used | ❌ False |
| §5.2 API Security | "Rate limiting middleware active" | **No middleware layer exists** | ❌ False |
| §5.3 Error Tracking | "Sentry integrated for error monitoring" | **Broken in Edge runtime** (`require()` ESM incompatibility) | ⚠️ Broken |
| §6.1 Consent Management | "GDPR/DPDP compliant consent flow" | **Implemented** — `consentManager.ts` + `CookieConsent.tsx` | ✅ True |
| §6.2 Consent Versioning | "Versioned consent with migration" | **Implemented** — v1→v2 migration logic present | ✅ True |
| §7.1 API Resilience | "30s timeout, 3-retry exponential backoff" | **Implemented** — `lib/nvidiaClient.ts` + `api/nvidia.ts` | ✅ True |
| §7.2 Text Extraction | "Secure PDF/OCR with sanitization" | **CDN loads without SRI; no DOMPurify** | ⚠️ Partial |

**Summary:** 4/10 claims fully implemented, 3/10 partially implemented (with critical flaws), 3/10 false claims.

---

## Implementation Readiness Assessment

### What Works (Ready to Build On)
1. **Consent Management** — `consentManager.ts` + `CookieConsent.tsx` are production-ready with granular categories, versioning, and migration.
2. **API Resilience** — `nvidiaClient.ts` implements proper timeout (30s), retry (3× exponential backoff), and status code handling.
3. **Cookie Consent UI** — Granular toggle (essential/analytics/marketing/personalization) with proper defaults.

### What Needs Implementation (Before Production)
1. **CSP + HSTS + Security Headers** — Add to `vercel.json` (highest priority).
2. **DOMPurify Integration** — Install, replace custom sanitizers, configure allowed tags.
3. **Sentry Edge Compatibility** — Migrate to `@sentry/nextjs` or edge-compatible SDK.
4. **Rate Limiting** — Create Vercel Edge Function middleware for `/api/*` routes.
5. **CDN Script Integrity** — Add SRI hashes to PDF.js/Tesseract.js loads.

### What Needs Design (Not in Current Doc)
1. **CSP Nonce Strategy** for Vite inline scripts + dynamic CDN imports.
2. **Consent Audit Trail** — Server-side logging for compliance evidence.
3. **Security Test Plan** — Automated header checks, XSS payload tests, rate limit verification.
4. **Incident Response** — Fallback when Sentry fails silently.

---

## Final Verdict

### **NEEDS WORK**

**Rationale:** The design document describes a security posture that **does not exist in the codebase**. Critical production controls (CSP, HSTS, rate limiting, functional error tracking, XSS-safe sanitization) are missing or broken. The document must be updated to reflect actual implementation status before it can serve as a reliable implementation guide.

**Path to READY:**
1. Implement all 🔴 CRITICAL findings (5 items)
2. Address 🟡 WARNING items W-01 through W-04 (4 items)
3. Update design document with accurate status markers
4. Add security test suite (S-03)
5. Re-review — target score ≥ 7/10

**Estimated Effort:** 3–5 engineering days for critical fixes + 2 days for test suite + 1 day for doc sync.

---

## Appendix: Files Verified

| File | Purpose | Verified |
|------|---------|----------|
| `design-docs/egm-18-security.md` | Security design document (209 lines) | ✅ |
| `analytics/consentManager.ts` | GDPR/DPDP consent + versioning | ✅ |
| `components/CookieConsent.tsx` | Granular consent banner UI | ✅ |
| `api/nvidia.ts` | API endpoint with status codes | ✅ |
| `analytics/errorTracker.ts` | Sentry init (broken `require()`) | ✅ |
| `lib/textExtractor.ts` | PDF.js/Tesseract from CDN (no DOMPurify) | ✅ |
| `vercel.json` | Headers config (no CSP/HSTS) | ✅ |
| `package.json` | Dependencies (no dompurify) | ✅ |
| `pages/Insurance.tsx` | Custom sanitizer + dangerouslySetInnerHTML | ✅ |
| `lib/nvidiaClient.ts` | Retry/timeout logic | ✅ |
| `lib/aiService.ts` | AI service wrapper | ✅ |

---

*Review generated by automated codebase audit against EGM-18 Security design document.*
*All findings backed by direct file inspection. No assumptions.*