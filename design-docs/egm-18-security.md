# EGM-18: Security Architecture

## Overview
The application follows a defense-in-depth security approach with client-side protections, serverless API safeguards, and privacy-by-design principles. No sensitive data is stored client-side; all PII/PHI handling is minimized.

## Threat Model

### Assets to Protect
| Asset | Classification | Risk |
|-------|----------------|------|
| Patient health data (tools) | PHI-equivalent | High |
| Insurance policy documents | PII + PHI | High |
| Contact/booking form data | PII | Medium |
| Analytics events | Behavioral | Low |
| AI chat conversations | Health-related | Medium |

### Threat Actors
1. **External attacker**: XSS, injection, API abuse
2. **Malicious user**: Rate limiting bypass, data exfiltration
3. **Third-party**: Nvidia API compromise, CDN compromise
4. **Insider**: Vercel dashboard access, GitHub secrets

### Attack Surface
- **Client**: XSS via user input, malicious file upload (Insurance)
- **API**: Nvidia proxy abuse, rate limiting bypass
- **Supply chain**: Compromised npm package
- **Infrastructure**: Vercel misconfiguration, DNS hijacking

## Security Controls

### Client-Side Protections

#### Content Security Policy (Recommended — Not Yet Implemented)
```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https://images.unsplash.com;
  connect-src 'self' https://api.nvidia.com https://ayurvritta.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

#### XSS Prevention
- **React**: Automatic escaping (JSX prevents injection)
- **Sanitization**: `sanitizeAndFormat()` in Insurance.tsx for AI output
- **No dangerouslySetInnerHTML**: Except sanitized AI content (controlled)
- **User input**: Never rendered as HTML (all form inputs)

#### File Upload Security (Insurance Page)
- **Client-side validation**: File type (PDF, JPG, PNG), size (<10MB)
- **No server upload**: Files processed client-side via pdf.js + Tesseract.js
- **Memory cleanup**: Object URLs revoked after processing
- **No persistence**: Files never leave browser

#### Input Validation
```tsx
// All form inputs validated
const validateEmail = (email: string) => 
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePhone = (phone: string) =>
  /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phone);

// Sanitization before any processing
const sanitizeInput = (input: string) =>
  input.trim().slice(0, 1000); // Length limit
```

### API Security (Serverless Functions)

#### Nvidia NIM Proxy (`/api/nvidia`)
```typescript
// Rate limiting (Vercel Edge Middleware)
export const config = {
  matcher: '/api/nvidia/:path*'
};

export default async function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const key = `ratelimit:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60); // 1 minute window
  if (count > 60) return new Response('Rate limited', { status: 429 });
  return NextResponse.next();
}
```

#### Request Validation
- Body size limit: 1MB (Vercel default)
- JSON parsing with try/catch
- Schema validation: Zod schemas for all endpoints
- Sanitization: Strip HTML/script tags from prompts

#### API Key Protection
- **Nvidia API key**: Stored in Vercel environment variables (encrypted)
- **Never in client bundle**: Verified via `grep -r "NVIDIA_API_KEY" dist/`
- **Rotation**: Manual process (quarterly recommended)
- **Scope**: Read-only API key if Nvidia supports

#### CORS & Headers
```typescript
// All API responses
return new Response(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Access-Control-Allow-Origin': 'https://ayurvritta.com', // Not *
  }
});
```

### Data Privacy

#### GDPR / DPDP Act 2023 Compliance
- **Consent**: CookieConsent component (granular: essential/analytics/marketing)
- **Data minimization**: Analytics collects only event metadata (no PII)
- **Right to deletion**: Clear localStorage via "Clear Data" in settings
- **Data portability**: Export tool results as JSON/PDF
- **DPO contact**: Listed in PrivacyPolicy.tsx

#### Data Handling
| Data Type | Storage | Retention | Encryption |
|-----------|---------|-----------|------------|
| Tool answers | localStorage | User-controlled | No (client) |
| Language pref | localStorage | Indefinite | No |
| Consent | localStorage | Indefinite | No |
| Analytics events | Server (if consented) | 90 days | TLS in transit |
| Chat history | Memory only | Session | No |
| Uploaded files | Memory only | Processing only | No |

#### No Server-Side PII Storage
- No database (static site + serverless)
- No user accounts / authentication
- No session storage on server
- All "state" is client-side or ephemeral

### Dependency Security

#### Supply Chain
- **npm audit**: Run in CI (`npm audit --audit-level=high`)
- **Dependencies**: 47 production, 32 dev (moderate count)
- **Lockfile**: `package-lock.json` committed
- **Updates**: Dependabot PRs (weekly)

#### Known Vulnerabilities (Current)
- **tesseract.js**: Large WASM binary, potential memory issues
- **pdf.js**: Regular security updates needed
- **jsPDF**: Client-side PDF generation (no known vulns)

### Infrastructure Security

#### Vercel Configuration
- **HTTPS**: Enforced (HSTS via Vercel)
- **Domain**: Custom domain with DNSSEC
- **Access**: Team members only (2FA required)
- **Logs**: No sensitive data in build/function logs

#### Secrets Management
| Secret | Location | Rotation |
|--------|----------|----------|
| Nvidia API Key | Vercel Env Vars | Quarterly |
| Analytics endpoint | Vercel Env Vars | N/A |
| Sentry DSN (if used) | Vercel Env Vars | On compromise |

### Security Headers (Implemented via vercel.json)
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

### Missing / Recommended

#### High Priority
- [ ] Implement CSP header (blocks inline scripts — needs nonce/hash)
- [ ] Add rate limiting to `/api/health` (prevent enumeration)
- [ ] Implement request signing for Nvidia proxy (prevent replay)

#### Medium Priority
- [ ] Add security.txt (/.well-known/security.txt)
- [ ] Implement Subresource Integrity (SRI) for external scripts
- [ ] Add Permissions-Policy header (restrict features)

#### Low Priority
- [ ] Bug bounty program (responsible disclosure)
- [ ] Security audit by third party
- [ ] Penetration testing (annual)

### Incident Response
1. **Detection**: Vercel alerts + analytics anomaly
2. **Containment**: Revoke API keys, disable affected functions
3. **Investigation**: Vercel logs + client error reports
4. **Recovery**: Deploy fixed version (instant rollback)
5. **Notification**: Users if PII exposed (DPDP requirement)