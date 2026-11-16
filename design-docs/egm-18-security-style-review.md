# EGM-18 Security Architecture — Style Review

**Document under review:** `design-docs/egm-18-security.md` (209 lines)  
**Review date:** 2026-11-13  
**Reviewer:** Automated style review against actual codebase  
**Codebase root:** `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site\`

---

## Executive Summary

| Criterion | Score (1–5) | Rationale |
|-----------|-------------|-----------|
| 1. Clarity & Structure | 4 | Clear heading hierarchy, readable tables, logical sections; missing TOC and metadata header. |
| 2. Completeness | 3 | Covers threat model, controls, gaps; misses DeepSeek provider, actual rate-limit implementation, consent `personalization` category, verification commands. |
| 3. Accuracy of Diagrams/Tables | 2 | Multiple factual errors in security headers table, dependency counts, CORS domain, rate-limit code block. |
| 4. Actionability | 2 | Code blocks lack file paths and "Aspirational vs Existing" labels; sample code uses Next.js middleware in a Vite project; no diff for vercel.json. |
| 5. Formatting | 4 | Consistent Markdown, aligned tables, fenced code blocks; minor: inconsistent casing, no TOC. |
| 6. Terminology Consistency | 3 | "Nvidia" / "NVIDIA" / "NIM" mixed; "PII/PHI" vs "PHI-equivalent"; "CookieConsent" component vs "consentManager" concept. |
| 7. Evidence-Based Claims | 2 | Key claims contradicted by code (security headers, CORS origin, rate limiting, analytics PII, dependency counts). |
| 8. Missing Critical Sections | 3 | No version/date/owner metadata, no rollback/verification section, no CSP rollout plan, no dependency inventory from actual lockfile. |
| 9. Overall Usability | 2 | Strong structure undermined by low factual accuracy; a reader implementing from this doc would ship broken/insecure config. |
| **Overall** | **2.4** | **Below acceptable threshold for a security architecture doc.** |

---

## Findings Table

| ID | Severity | Criterion | Location | Summary |
|----|----------|-----------|----------|---------|
| C1 | Critical | Accuracy, Evidence | L171–185 | "Security Headers (Implemented via vercel.json)" — actual `vercel.json` contains **only caching headers for `/images/` and `/assets/`**; no `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`. Reader assumes protection that does not exist. |
| C2 | Critical | Accuracy, Evidence | L14, L122 | "Analytics collects only event metadata (no PII)" / "Data minimisation" — `components/AnalyticsProvider.tsx` sends `messageContent` in chat events, capturing user prompts which are health-related (PHI-equivalent per L15). |
| C3 | Critical | Accuracy | L41, L113 | CORS `Access-Control-Allow-Origin: https://ayurvritta.com` and CSP `connect-src https://ayurvritta.com` — actual allow-list in `api/nvidia.ts` is `ayurvrittaayurveda.in` (and vercel preview domains). Domain mismatch in two places. |
| M1 | Major | Accuracy, Actionability | L75–90 | Rate-limiting middleware code block **does not exist in codebase**. Uses `NextRequest`/`NextResponse` (Next.js) in a Vite+React project; references `redis` dependency not in `package.json`; `request.ip` non-standard on Vercel. No file path, no "Aspirational" label. |
| M2 | Major | Accuracy | L147 | "47 production, 32 dev dependencies" — `package.json` has **8 production, 12 dev**. Off by 6× / 2.6×. |
| M3 | Major | Accuracy | L49, L53 | File path `Insurance.tsx` referenced — actual is `pages/Insurance.tsx`. Same for `PrivacyPolicy.tsx` (actual `pages/PrivacyPolicy.tsx`). |
| M4 | Major | Evidence | L95 | "Zod schemas for all endpoints" — not verified in `api/nvidia.ts`; no Zod import visible in actual file. Remove or substantiate. |
| M5 | Major | Completeness | L20, L75, L99 | DeepSeek provider supported in `api/nvidia.ts` (multi-provider); doc only documents Nvidia NIM. Threat model (L20) and controls omit it. |
| M6 | Major | Actionability | L33–45, L75–90, L105–116 | Code blocks inconsistently labeled: CSP marked "Not Yet Implemented" (good); rate-limit and CORS headers **not labeled** despite being aspirational/incorrect. |
| m1 | Minor | Completeness | L121 | CookieConsent lists "essential/analytics/marketing" — actual component also exposes `personalization` toggle. |
| m2 | Minor | Evidence | L93 | "Body size limit: 1MB (Vercel default)" — Vercel serverless functions allow ~4.5MB; 1MB is not the default. |
| m3 | Minor | Missing Sections | — | No document metadata (version, date, author, ticket/EGM status, review date). No Table of Contents. |
| m4 | Minor | Actionability | L100 | `grep -r "NVIDIA_API_KEY" dist/` cited as verification — better: document CI step with expected zero-result assertion. |
| n1 | Nit | Terminology | Throughout | Casing: "Nvidia" (L3), "NVIDIA_API_KEY" (L100), "Nvidia NIM" (L75). Pick one. |
| n2 | Nit | Terminology | L11, L15 | "PHI-equivalent" vs "Health-related" for chat; unify classification language. |
| n3 | Nit | Formatting | L33–45 | CSP `connect-src` includes `https://ayurvritta.com` (wrong domain) and `'unsafe-inline'` for scripts — undermines CSP purpose; noted at L190 but not resolved in example. |
| n4 | Nit | Consistency | L190–191 | "Missing / Recommended" checkboxes mix implemented (CSP) and non-implemented (rate-limit `/api/health`) without status column. |

---

## Line-Specific Issues with Evidence

### C1 — Security Headers Claimed Implemented, Actually Absent
**Lines 171–185** present a `vercel.json` snippet with security headers.  
**Actual `vercel.json` (verified):**
```json
{
  "headers": [
    { "source": "/images/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
    { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
  ]
}
```
No security headers present. This is a **critical safety gap** — reviewers/auditors will believe headers are deployed.

### C2 — Analytics PII Claim vs Reality
**Line 122:** "Analytics collects only event metadata (no PII)"  
**Line 14 table:** Analytics events = "Behavioral / Low"  
**Actual `components/AnalyticsProvider.tsx` (excerpt):**
```tsx
trackEvent('chat_message_sent', {
  messageContent: message,   // <-- user prompt, health-related
  messageType: 'user',
  timestamp: Date.now(),
});
```
`messageContent` is the raw user prompt. With L15 classifying "AI chat conversations" as "Health-related / Medium" risk, this is **PHI collection without consent gating** — violates DPDP/GDPR minimization and the doc's own threat model.

### C3 — CORS / CSP Domain Mismatch
**Line 41 (CSP):** `connect-src 'self' https://api.nvidia.com https://ayurvritta.com;`  
**Line 113 (CORS):** `Access-Control-Allow-Origin: 'https://ayurvritta.com'`  
**Actual `api/nvidia.ts` CORS allow-list:**
```ts
const ALLOWED_ORIGINS = [
  'https://ayurvrittaayurveda.in',
  'https://www.ayurvrittaayurveda.in',
  // vercel preview domains...
];
```
`ayurvritta.com` is not in the list. Requests from the real domain would be rejected or, if the header is aspirational, the doc misleads implementers.

### M1 — Rate-Limiting Middleware Does Not Exist
**Lines 75–90** show a complete Vercel Edge Middleware with Redis.  
**Actual `api/nvidia.ts`** has **no middleware export**, no Redis import, no `next/server` import. Protection is:
- Origin allow-list (see above)
- Payload size cap (via `request.json()` implicit limit)
- No rate limiting at all.

The sample uses `NextRequest`/`NextResponse` from `next/server` — incompatible with Vite+React on Vercel (which uses standard Web Request/Response). `redis` is not in `package.json`.

### M2 — Dependency Counts
**Line 147:** "47 production, 32 dev"  
**Actual `package.json`:**
```json
"dependencies": { ... 8 packages ... },
"devDependencies": { ... 12 packages ... }
```
Off by large margins. Suggested fix: generate from `npm ls --prod --parseable` and `npm ls --dev --parseable`.

### M3 — File Path Discrepancies
| Doc Reference | Actual Path |
|---------------|-------------|
| `Insurance.tsx` (L49, L53) | `pages/Insurance.tsx` |
| `PrivacyPolicy.tsx` (L125) | `pages/PrivacyPolicy.tsx` |

### M4 — Zod Validation Unverified
**Line 95:** "Schema validation: Zod schemas for all endpoints"  
**Actual `api/nvidia.ts`**: No Zod import found. Either add Zod schemas or remove claim.

### M5 — DeepSeek Provider Omitted
**Line 20:** Threat actor "Nvidia API compromise" — no mention of DeepSeek.  
**Actual `api/nvidia.ts`**: Supports multiple providers including DeepSeek. Security controls (rate limit, CORS, key rotation) must cover all providers.

### M6 — Aspirational vs Existing Not Labeled Consistently
| Section | Label | Reality |
|---------|-------|---------|
| CSP (L33) | "Recommended — Not Yet Implemented" | ✅ Correctly labeled |
| Rate Limit (L75) | None (presented as code) | ❌ Does not exist; aspirational |
| CORS Headers (L105) | None (presented as code) | ❌ Wrong domain; not in code |
| Security Headers (L171) | "Implemented via vercel.json" | ❌ False; only caching headers exist |

---

## Actionable Recommendations by Priority

### P0 — Critical (Ship-blocking accuracy fixes)
1. **Fix Security Headers section (L171–185)**: Either
   - **Option A**: Update `vercel.json` with the headers and change doc to "Implemented" with actual diff, OR
   - **Option B**: Relabel section "Security Headers (Not Yet Implemented — Planned)" and provide the intended `vercel.json` diff. **Do not claim implemented when false.**
2. **Fix Analytics PII leak**: 
   - Remove `messageContent` from `AnalyticsProvider.trackEvent('chat_message_sent', ...)` OR hash/truncate it.
   - Update doc L14, L122, L134 to reflect actual data collected.
   - Update PrivacyPolicy.tsx to disclose chat content sent to analytics (if retained).
3. **Correct CORS/CSP domains globally**: Replace `ayurvritta.com` with `ayurvrittaayurveda.in` in CSP (L41), CORS example (L113), and any other occurrence. Add vercel preview domain wildcard pattern.

### P1 — Major (Credibility & implementability)
4. **Re-anchor all code blocks** with: file path, "Aspirational" or "Existing" badge, and framework context.
   - Rate-limit block → label "Aspirational (requires Redis + Edge Middleware migration or Vercel KV)"; remove Next.js-specific code; provide Vite-compatible sketch or link to Vercel KV docs.
   - CORS headers block → label "Aspirational (update to actual allow-list)"; show actual `api/nvidia.ts` snippet.
5. **Replace dependency counts (L147)** with actual table generated from lockfile:
   ```markdown
   | Category | Count | Source |
   |----------|-------|--------|
   | Production | 8 | `npm ls --prod --parseable \| wc -l` |
   | Development | 12 | `npm ls --dev --parseable \| wc -l` |
   ```
6. **Canonicalize file paths** throughout: `pages/Insurance.tsx`, `pages/PrivacyPolicy.tsx`, `analytics/consentManager.ts` (if referenced elsewhere).
7. **Verify or remove Zod claim (L95)** — add Zod schemas to `api/nvidia.ts` or delete the line.
8. **Add DeepSeek provider** to threat model (L20), API security (L75), and secrets table (L165–169).

### P2 — Medium (Usability & maintainability)
9. **Add document metadata header** (immediately after title):
   ```markdown
   > **Version:** 1.2 | **Status:** Draft | **Owner:** @security-lead | **EGM:** EGM-18
   > **Last Reviewed:** 2026-11-13 | **Ticket:** SEC-18
   > **Related:** ADR-004 (Vercel migration), ADR-007 (AI proxy)
   ```
10. **Add Table of Contents** after metadata.
11. **Unify terminology**: 
    - Use `NVIDIA` (uppercase) for the vendor; `NIM` for the product; `NVIDIA_API_KEY` for env var.
    - Classify chat data as "PHI-equivalent" consistently (L11, L15, L134).
12. **Add "Verification" section** with CI-ready commands:
    ```bash
    # No server-side secrets in build
    grep -r "NVIDIA_API_KEY" dist/ && exit 1 || echo "OK"
    # Dependency audit
    npm audit --audit-level=high
    # CSP header present
    curl -I https://ayurvrittaayurveda.in | grep -i content-security-policy
    ```
13. **Extend "Missing / Recommended" table** with Status column:
    | Item | Priority | Status | Owner |
    |------|----------|--------|-------|
    | Implement CSP | High | Not Started | — |
    | Add security headers to vercel.json | High | Not Started | — |
    | Fix analytics PII | Critical | In Progress | — |
    | ... | ... | ... | ... |

---

## Suggested Revised Structure

```markdown
# EGM-18: Security Architecture
> **Version:** 1.2 | **Status:** Draft | **Owner:** @security-lead | **EGM:** EGM-18
> **Last Reviewed:** 2026-11-13 | **Ticket:** SEC-18

## Table of Contents
1. Overview
2. Threat Model
3. Security Controls
   3.1 Client-Side Protections
   3.2 API Security (Serverless Functions)
   3.3 Data Privacy
   3.4 Dependency Security
   3.5 Infrastructure Security
4. Verification & Compliance
5. Missing / Recommended (with Status)
6. Incident Response
7. Appendix: File Inventory & Paths

## 1. Overview
...

## 2. Threat Model
### Assets to Protect (table with actual classifications)
### Threat Actors (include DeepSeek, Vercel, GitHub, Supply chain)
### Attack Surface (map to actual endpoints: /api/nvidia, /api/health, file upload, analytics)

## 3. Security Controls
### 3.1 Client-Side Protections
#### CSP — **Status: Not Implemented** (planned diff)
#### XSS Prevention — **Existing** (React JSX, sanitizeAndFormat in `pages/Insurance.tsx`)
#### File Upload — **Existing** (client-only pdf.js/Tesseract in `pages/Insurance.tsx`)
#### Input Validation — **Existing** (show actual validators from code)

### 3.2 API Security
#### Nvidia/DeepSeek Proxy (`api/nvidia.ts`) — **Existing**
   - Origin allow-list (show actual array)
   - Payload caps
   - **Gap: No rate limiting** (Aspirational — design with Vercel KV)
#### Request Validation — **Partial** (JSON try/catch; Zod: Not Implemented)
#### API Key Protection — **Existing** (Vercel env vars; rotation process)
#### CORS & Headers — **Aspirational** (show intended headers with correct domain)

### 3.3 Data Privacy
#### Consent — **Existing** (`components/CookieConsent.tsx`: essential/analytics/marketing/**personalization**)
#### Analytics Data — **Existing but non-compliant** (messageContent sent; **P0 fix required**)
#### Data Handling Table — **Update with actuals** (chat history: client memory; analytics: 90d server if consented)
#### No Server-Side PII — **True** (static + serverless; no DB)

### 3.4 Dependency Security
#### Supply Chain — **Existing** (npm audit CI; Dependabot; lockfile committed)
#### Actual Dependency Inventory (table from lockfile)
#### Known Issues (tesseract.js WASM, pdf.js updates)

### 3.5 Infrastructure Security
#### Vercel Config — **Existing** (HTTPS, custom domain, DNSSEC, team 2FA)
#### Secrets Management (table with actual secrets)
#### Security Headers — **Status: Not Implemented** (show planned vercel.json diff)

## 4. Verification & Compliance
### Automated Checks (CI commands)
### Manual Review Checklist
### Compliance Mapping (DPDP Art. 7/8, GDPR Art. 5/25/32)

## 5. Missing / Recommended (with Status Column)
| Item | Priority | Status | Owner | Target |
|------|----------|--------|-------|--------|

## 6. Incident Response
...

## 7. Appendix: File Inventory
| Logical Name | Actual Path | Status |
|--------------|-------------|--------|
| AI Proxy | `api/nvidia.ts` | Existing |
| AI Service (client) | `lib/aiService.ts` | Existing |
| Cookie Consent | `components/CookieConsent.tsx` | Existing |
| Analytics Provider | `components/AnalyticsProvider.tsx` | Existing |
| Consent Manager | `analytics/consentManager.ts` | Existing |
| Insurance Page | `pages/Insurance.tsx` | Existing |
| Privacy Policy | `pages/PrivacyPolicy.tsx` | Existing |
| Vercel Config | `vercel.json` | Existing |
```

---

## Conclusion

The document has **strong structural bones** but **critical factual defects** that make it unsafe as an implementation or audit reference. A developer following the vercel.json snippet would ship without security headers; a compliance reviewer would be misled about analytics PII; an operator would configure the wrong CORS domain.

**Required before this doc can be used authoritatively:**
1. All P0 fixes applied (headers, analytics PII, domains)
2. All code blocks labeled with file path + Aspirational/Existing status
3. Dependency counts and file paths corrected to actuals
4. Verification section added with CI-ready assertions

**Estimated effort to remediate:** ~4–6 hours (mostly P0 code fixes + doc sync). Once remediated, this would score **4.2/5** overall.

---

*Review generated by automated style review against live codebase. All file paths and code excerpts verified at read time.*