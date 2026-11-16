# EGM-18 Security - Codebase Details Review

**Document Reviewed**: `egm-18-security.md`
**Review Date**: 2026-11-13
**Reviewer**: egm-codebase-details (via EGM orchestrator)
**Context Files**: api/nvidia.ts, components/ChatBot.tsx, vercel.json, index.html, package.json, components/SEOHead.tsx

---

## Executive Summary

The design document for *egm‑18* describes a comprehensive security architecture with CSP, Zod validation, rate limiting, DOMPurify sanitization, and security headers. The actual codebase has **NONE of these protections implemented**. Three Critical (P0) findings block production deployment: CSP completely missing, input validation falsely claimed (Zod not installed), and rate limiting absent. Two High findings: XSS vulnerability (DOMPurify not installed) and security headers missing. This is a security architecture that exists only in documentation.

---

## Top 5 Security Findings Summary (150 words)

**1. CSP COMPLETELY MISSING (Critical)** — EGM-18 claims CSP via Vercel headers, but `vercel.json` contains only cache headers. No CSP meta tag in `index.html` either. High risk: no protection against inline script injection, especially concerning dynamic PDF.js/Tesseract.js loading from CDN.

**2. INPUT VALIDATION FALSE CLAIM (Critical)** — Design doc claims Zod schemas on all endpoints, but Zod is **not installed** (confirmed in `package.json`). `api/nvidia.ts` accepts arbitrary JSON payloads with no validation, enabling prompt injection attacks.

**3. RATE LIMITING ABSENT (Critical)** — Claims of Redis sliding window per IP are **factually incorrect**. The edge function has no rate limiting, exposing NVIDIA API to abuse with unlimited calls.

**4. XSS VULNERABILITY (High)** — DOMPurify cited in design but **not installed**. AI responses render unsanitized, risking script injection if NVIDIA API returns malicious content.

**5. SECURITY HEADERS MISSING (High)** — X-Content-Type-Options, X-Frame-Options, Referrer-Policy absent. Clickjacking, MIME sniffing, and referrer leakage vector remain unprotected.

**Immediate action required: These 3 P0 issues block production deployment.**

---

## Detailed Findings

### 1. CSP Completely Missing (Critical)
| Design Doc Claim | Reality |
|------------------|---------|
| CSP via Vercel headers | `vercel.json` has only `headers` for cache control (lines 1-15) |
| CSP meta tag fallback | `index.html` has no CSP meta tag |
| `script-src 'self' 'wasm-unsafe-eval'` | No CSP anywhere |
| Frame-ancestors 'none' | Not implemented |

**Risk**: Dynamic imports of `pdfjs-dist` and `tesseract.js` from CDN execute without CSP protection. Inline scripts in components have no nonce/hash allowlist.

### 2. Input Validation False Claim (Critical)
| Design Doc Claim | Reality |
|------------------|---------|
| Zod schemas on all endpoints | `zod` **not in `package.json`** |
| `chatRequestSchema` validates messages | `api/nvidia.ts:12-45` - no validation, direct `req.json()` |
| Prompt injection prevention | No sanitization of `messages` array content |
| Rate limit check before validation | No rate limiting at all |

**Evidence**: `package.json` dependencies: no `zod`, no `@hono/zod-validator`, no validation middleware. `api/nvidia.ts` accepts raw JSON and passes directly to NVIDIA NIM.

### 3. Rate Limiting Absent (Critical)
| Design Doc Claim | Reality |
|------------------|---------|
| Redis sliding window per IP | No Redis client in codebase |
| 30 req/min for chat endpoint | No rate limit middleware |
| 429 response with `Retry-After` | Not implemented |
| Distributed rate limiting | No `@upstash/ratelimit`, no `ioredis` |

**Evidence**: `package.json` has no rate limiting dependencies. `api/nvidia.ts` is a bare Hono handler with no middleware chain.

### 4. XSS Vulnerability - DOMPurify Not Installed (High)
| Design Doc Claim | Reality |
|------------------|---------|
| DOMPurify sanitizes AI responses | `dompurify` **not in `package.json`** |
| `sanitizeHtml()` utility used in ChatBot | `components/ChatBot.tsx` renders `message.content` directly (line 156) |
| XSS protection for markdown | No markdown sanitization |

**Evidence**: `ChatBot.tsx:156` renders `{message.content}` in `dangerouslySetInnerHTML` equivalent context. If NVIDIA NIM returns `<script>alert(1)</script>`, it executes.

### 5. Security Headers Missing (High)
| Header | Design Doc Claim | Actual (`vercel.json`/`index.html`) |
|--------|------------------|--------------------------------------|
| X-Content-Type-Options | `nosniff` | Missing |
| X-Frame-Options | `DENY` | Missing |
| Referrer-Policy | `strict-origin-when-cross-origin` | Missing |
| Permissions-Policy | `camera=(), microphone=()` | Missing |
| Cross-Origin-Opener-Policy | `same-origin` | Missing |
| Cross-Origin-Resource-Policy | `same-origin` | Missing |

**Risk**: Clickjacking (no X-Frame-Options), MIME sniffing (no X-Content-Type-Options), referrer leakage.

### 6. HTTPS Enforcement Missing (Medium)
| Design Doc Claim | Reality |
|------------------|---------|
| HSTS via Vercel | `vercel.json` has no `headers` for HSTS |
| `Strict-Transport-Security` | Not configured |

### 7. Secrets Management Gap (Medium)
| Design Doc Claim | Reality |
|------------------|---------|
| NVIDIA API key in Vercel env | Likely true (not verifiable) |
| No key rotation strategy | Not documented |
| No secret scanning in CI | Not configured |

### 8. Error Information Leakage (Low)
`api/nvidia.ts:52-58` returns raw NVIDIA error responses to client, potentially leaking internal API structure.

---

## Dependency Verification

| Dependency | Claimed Use | In `package.json`? |
|------------|-------------|-------------------|
| `zod` | Input validation | ❌ NO |
| `dompurify` | XSS sanitization | ❌ NO |
| `@upstash/ratelimit` | Rate limiting | ❌ NO |
| `ioredis` | Redis client | ❌ NO |
| `helmet` / equivalent | Security headers | ❌ NO |
| `hono/cors` | CORS | ✅ (but not configured securely) |

---

## Code Evidence

### `api/nvidia.ts` - No Validation, No Rate Limit
```typescript
// Lines 12-45: Direct JSON parsing, no validation
const body = await c.req.json()
// Passes directly to NVIDIA NIM
const response = await fetch(NVIDIA_ENDPOINT, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${NVIDIA_API_KEY}` },
  body: JSON.stringify(body)
})
```

### `vercel.json` - Only Cache Headers
```json
{
  "headers": [
    { "source": "/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
  ]
}
```

### `package.json` - Missing Security Deps
```json
"dependencies": {
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "hono": "^4.0.0",
  "framer-motion": "^10.0.0",
  "jspdf": "^2.5.0",
  "html2canvas": "^1.4.0",
  "recharts": "^2.10.0"
  // NO zod, dompurify, @upstash/ratelimit, ioredis
}
```

---

## Recommendations

### Priority 1: Critical (Block Production)
1. **Implement CSP**: Add to `vercel.json` headers and `index.html` meta tag with nonce-based script allowlist
2. **Add Zod validation**: Install `zod` and `@hono/zod-validator`, validate all `api/nvidia.ts` inputs
3. **Add rate limiting**: Install `@upstash/ratelimit` + `ioredis`, implement sliding window per IP on chat endpoint

### Priority 2: High
4. **Install DOMPurify**: Sanitize all AI-rendered content in `ChatBot.tsx`
5. **Add security headers**: Configure all 6 missing headers in `vercel.json`

### Priority 3: Medium
6. **Enable HSTS**: Add `Strict-Transport-Security` header
7. **Audit error responses**: Sanitize NVIDIA error details before returning to client

### Priority 4: Documentation
8. **Rewrite EGM-18** to accurately reflect current (minimal) security posture OR implement all claimed features
9. **Add security testing** to CI pipeline