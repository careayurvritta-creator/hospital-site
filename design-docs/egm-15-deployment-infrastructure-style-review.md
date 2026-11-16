# EGM-15 Deployment Infrastructure — Style Review

**Document under review:** `egm-15-deployment-infrastructure.md` (275 lines)  
**Review date:** 2026-11-13  
**Reviewer:** AI Assistant (OpenCode)  
**Codebase verified against:** `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site\`

---

## Executive Summary

| Criterion | Score (1–5) | Weight | Weighted |
|-----------|-------------|--------|----------|
| **Accuracy vs Codebase** | 5 | 0.20 | 1.00 |
| **Clarity & Readability** | 4 | 0.15 | 0.60 |
| **Completeness** | 4 | 0.15 | 0.60 |
| **Actionability** | 3 | 0.15 | 0.45 |
| **Formatting & Structure** | 4 | 0.10 | 0.40 |
| **Tone & Voice** | 4 | 0.10 | 0.40 |
| **Cross-References** | 3 | 0.05 | 0.15 |
| **Maintenance Awareness** | 3 | 0.05 | 0.15 |
| **Decision Traceability** | 2 | 0.05 | 0.10 |
| **TOTAL** | — | 1.00 | **3.85 / 5.00** |

**Overall assessment:** The document is **exceptionally accurate** against the actual codebase (a rare and valuable trait), but it reads more like a "correction note" than a standalone design document. It lacks forward-looking decision records, clear action items, and maintenance guidance. With targeted restructuring, it could serve as both a reliable reference and a living deployment guide.

---

## Findings Table

| # | Category | Finding | Severity | Location |
|---|----------|---------|----------|----------|
| 1 | Accuracy | Document matches codebase 1:1 on all verified files (vercel.json, api/nvidia.ts, index.html, sw.js, manifest.json, analytics/*, package.json, vite.config.ts, CI workflow) | ✅ Strength | Throughout |
| 2 | Framing | Opens with "corrects a phantom design document" — frames itself as a correction, not a design | ⚠️ Medium | Lines 1–12 |
| 3 | Structure | No table of contents; sections jump between infra, code, and ops without clear hierarchy | ⚠️ Medium | Lines 13–275 |
| 4 | Actionability | Lists "what's missing" (health endpoint, rate limiting, caching) but no priorities, owners, or timelines | 🔴 High | Lines 145–165 |
| 5 | Decision Traceability | No ADR-style records for key choices (Edge runtime, dual provider, no health endpoint) | 🔴 High | Lines 75–110 |
| 6 | Maintenance | No versioning strategy, no rollback procedure, no monitoring runbook | 🔴 High | Not present |
| 7 | Cross-References | Links to files but not to related design docs (e.g., no link to analytics design, PWA design) | ⚠️ Medium | Lines 170–210 |
| 8 | Tone | Mixes past-tense correction ("did not have"), present-tense description, and future-tense gaps inconsistently | ⚠️ Medium | Throughout |
| 9 | Formatting | Good use of code blocks and tables; some sections over-verbose (e.g., full vercel.json printed twice) | ⚠️ Low | Lines 45–65 |
| 10 | Completeness | Covers all deployed artifacts; omits local dev experience, preview deployments, and secret management details | ⚠️ Medium | Lines 170–275 |

---

## Line-Specific Issues

| Line(s) | Issue | Recommendation |
|---------|-------|----------------|
| 1–12 | "Phantom document" framing confuses readers who didn't see the prior version | Move correction context to a "Document History" appendix; lead with purpose |
| 13–15 | Title doesn't indicate this is a *deployment infrastructure* spec (could be mistaken for app architecture) | Add subtitle: "Vercel + Edge Functions + PWA + Analytics Deployment Specification" |
| 17–20 | No TOC for 275-line document | Add auto-generated TOC after title |
| 22–30 | "Overview" section mixes status, stack, and philosophy without clear separation | Split into: **Status**, **Stack Summary**, **Design Principles** |
| 32–42 | Vercel config printed in full *and* explained line-by-line — redundancy | Keep either the annotated config OR the full print, not both |
| 44–65 | Duplicate vercel.json content (lines 45–55 and 57–65) | Remove one instance; reference the canonical file path |
| 67–110 | `api/nvidia.ts` analysis is thorough but reads as code review, not design | Convert to: **Design Decisions** (why Edge, why dual provider) + **Interface Contract** (request/response shapes) |
| 112–130 | PWA section lists files but not *why* choices were made (SW v3, background sync, manifest shortcuts) | Add rationale per artifact; link to PWA design doc if exists |
| 132–142 | Analytics section describes implementation, not deployment concerns (sampling, PII, consent flow) | Reframe: what the deployment *must guarantee* for analytics to work |
| 145–165 | "Gaps & Missing Pieces" — valuable but unstructured; no priority, effort, or owner | Convert to a **Backlog Table** with: Item, Priority (P0–P3), Effort, Owner, Dependencies |
| 167–185 | CI/CD section only covers blog-autopost.yml; omits preview deployments, lint gates, typecheck | Document the *full* pipeline: PR → preview → typecheck/lint/test → production |
| 187–210 | Security headers table says "missing" but doesn't state *required* headers or CSP strategy | Add: **Required Headers**, **CSP Policy**, **Implementation Plan** |
| 212–230 | Environment variables listed but no secret rotation, preview vs prod separation, or validation | Add: **Secret Management** subsection with rotation schedule and validation script |
| 232–250 | Monitoring section mentions Sentry unconfigured but no alerting, SLI/SLO, or on-call | Define: **SLIs**, **Alert Rules**, **Runbook Links** |
| 252–275 | "Future Considerations" reads as a wishlist; no evaluation criteria or decision gates | Convert to **RFC Candidates** with: Problem, Proposal, Evaluation Criteria, Target Date |

---

## Actionable Recommendations

### Immediate (This Week)

1. **Restructure as a living design doc** — Add TOC, split into clear sections: *Status → Architecture Decisions → Deployed Artifacts → Operations → Gaps (Backlog) → RFC Candidates*
2. **Convert "Gaps" to a prioritized backlog table** — Each row: Item, Priority, Effort, Owner, Dependencies, Target Date
3. **Extract ADRs for three key decisions** — Edge runtime, dual-provider fallback, no health endpoint (use `architecture-decision-records` skill)
4. **Remove duplicate vercel.json** — Keep annotated version only; link to source file

### Short-Term (This Sprint)

5. **Document the full CI/CD pipeline** — Include preview deployments, typecheck, lint, test gates, and promotion rules
6. **Define security header requirements** — CSP, HSTS, Referrer-Policy, Permissions-Policy with implementation checklist
7. **Add secret management section** — Vercel project settings, preview vs prod separation, rotation schedule, validation script
8. **Create monitoring runbook** — SLIs (latency, error rate, availability), alert thresholds, on-call escalation, Sentry configuration steps

### Medium-Term (Next Quarter)

9. **Link to related design docs** — Analytics architecture, PWA strategy, API contract, data privacy
10. **Add versioning & rollback procedure** — Vercel deployment aliases, instant rollback CLI, smoke test checklist
11. **Establish review cadence** — Quarterly design doc review linked to infrastructure sprint planning
12. **Create deployment checklist** — Pre-deploy, deploy, post-deploy verification steps (use `deployment-patterns` skill)

---

## Suggested Revised Structure

```markdown
# EGM-15 Deployment Infrastructure Specification
**Subtitle:** Vercel + Edge Functions + PWA + Analytics Deployment Specification  
**Status:** Active | **Version:** 2.0 | **Last Reviewed:** 2026-11-13 | **Next Review:** 2027-02-13

## Table of Contents
1. [Status & Scope](#1-status--scope)
2. [Architecture Decisions (ADRs)](#2-architecture-decisions-adrs)
3. [Deployed Artifacts](#3-deployed-artifacts)
4. [Operations & Runbooks](#4-operations--runbooks)
5. [Gap Backlog (Prioritized)](#5-gap-backlog-prioritized)
6. [RFC Candidates](#6-rfc-candidates)
7. [Appendices](#7-appendices)

---

### 1. Status & Scope
- Current deployment state (production URL, last deploy, version)
- Scope boundaries (what this doc covers / excludes)
- Related documents (links to analytics, PWA, API contract, data privacy)

### 2. Architecture Decisions (ADRs)
| ADR | Decision | Rationale | Alternatives Considered | Status |
|-----|----------|-----------|------------------------|--------|
| ADR-001 | Edge runtime for `api/nvidia.ts` | Cold-start < 50ms; no Node APIs needed | Node runtime, Cloudflare Workers | Accepted |
| ADR-002 | Dual provider: DeepSeek → NVIDIA NIM | Cost optimization; NIM as quality fallback | Single provider, round-robin | Accepted |
| ADR-003 | No health endpoint | Vercel provides platform health; function is stateless | `/health` endpoint, synthetic monitoring | Deferred |

### 3. Deployed Artifacts
#### 3.1 Vercel Configuration
- Annotated `vercel.json` (source: `vercel.json`)
- Build output, routes, headers, rewrites, cache rules

#### 3.2 Edge Function: `api/nvidia.ts`
- Interface contract (request/response types)
- Provider selection logic
- Validation & error mapping
- Limits (30s Edge, 1MB payload)

#### 3.3 PWA Layer
- Service Worker v3 (`public/sw.js`) — caching strategy, background sync, push
- Manifest (`public/manifest.json`) — icons, shortcuts, display mode
- SW registration (`index.html` lines 225–235)

#### 3.4 Analytics Stack
- `analytics/config.ts` — GA4/Clarity placeholders, lead scoring config
- `analytics/eventTracker.ts` — consent-gated events, batching, offline queue
- `analytics/errorTracker.ts` — Sentry optional, fallback to local tracker

#### 3.5 CI/CD Pipeline
- `.github/workflows/blog-autopost.yml` — current
- **Gap:** Preview deployments, typecheck, lint, test gates (see Gap Backlog)

### 4. Operations & Runbooks
#### 4.1 Secret Management
- Vercel project settings (prod vs preview)
- Required secrets: `VITE_DEEPSEEK_API_KEY`, `VITE_NVIDIA_API_KEY`, `VITE_GA_MEASUREMENT_ID`, `VITE_CLARITY_PROJECT_ID`, `VITE_SENTRY_DSN`
- Rotation schedule: quarterly
- Validation script: `scripts/validate-secrets.ts`

#### 4.2 Security Headers (Target State)
| Header | Value | Implementation |
|--------|-------|----------------|
| Content-Security-Policy | `default-src 'self'; script-src 'self' 'unsafe-inline' ...` | `vercel.json` headers + meta tag fallback |
| Strict-Transport-Security | `max-age=31536000; includeSubDomains; preload` | Vercel platform default |
| Referrer-Policy | `strict-origin-when-cross-origin` | `vercel.json` headers |
| Permissions-Policy | `camera=(), microphone=(), geolocation=()` | `vercel.json` headers |

#### 4.3 Monitoring & Alerting
- **SLIs:** p95 latency < 500ms, error rate < 0.5%, availability > 99.9%
- **Alerts:** Sentry (errors), Vercel (function duration, invocations), GA4 (traffic drops)
- **Runbooks:** `runbooks/edge-function-errors.md`, `runbooks/pwa-offline-failures.md`

#### 4.4 Rollback Procedure
1. `vercel rollback <deployment-url>` (instant)
2. Smoke test: `/`, `/api/nvidia` (POST), SW registration, analytics events
3. Post-rollback verification checklist

### 5. Gap Backlog (Prioritized)
| ID | Item | Priority | Effort | Owner | Dependencies | Target |
|----|------|----------|--------|-------|--------------|--------|
| GAP-001 | Health endpoint (`/api/health`) | P1 | S | Backend | ADR-003 review | 2026-12-01 |
| GAP-002 | Rate limiting (per-IP, per-key) | P1 | M | Backend | Vercel Edge Config | 2026-12-15 |
| GAP-003 | Response caching (stale-while-revalidate) | P2 | S | Backend | Cache-Control headers | 2027-01-15 |
| GAP-004 | CSP implementation | P1 | M | Frontend | Nonce generation | 2026-12-15 |
| GAP-005 | Sentry DSN configuration | P1 | XS | DevOps | Sentry project setup | 2026-11-20 |
| GAP-006 | Preview deployment pipeline | P2 | M | DevOps | GitHub Actions | 2027-01-31 |
| GAP-007 | Secret validation script | P2 | S | DevOps | — | 2026-12-01 |

### 6. RFC Candidates
| RFC | Problem | Proposal | Evaluation Criteria | Target Decision |
|-----|---------|----------|---------------------|-----------------|
| RFC-001 | No request deduplication | Idempotency keys + Redis | Latency impact, cost, complexity | 2027-03-01 |
| RFC-002 | Single-region Edge | Multi-region failover | Latency, cost, consistency | 2027-06-01 |
| RFC-003 | Analytics sampling at scale | Probabilistic + priority queue | Data fidelity, cost, privacy | 2027-04-01 |

### 7. Appendices
- A. Document History (phantom v1 correction context)
- B. Full `vercel.json` (canonical reference)
- C. `api/nvidia.ts` interface types (TypeScript)
- D. Environment variable reference table
- E. Verification checklist (pre-deploy / post-deploy)
```

---

## Conclusion

The `egm-15-deployment-infrastructure.md` document achieves **rare accuracy** — every claim verified against the codebase holds true. This is its greatest strength and the foundation for trust.

However, accuracy alone doesn't make a design document *useful*. The current form:

- **Buried decisions** — Key architectural choices (Edge runtime, dual provider, no health endpoint) are embedded in code analysis rather than surfaced as explicit, reviewable decisions
- **No actionable backlog** — "Gaps" are listed but not prioritized, owned, or scheduled
- **Missing operations view** — No runbooks, rollback procedure, secret management, or monitoring SLIs
- **Correction framing** — The "phantom document" narrative adds cognitive load for new readers

**Recommended path:** Restructure using the suggested outline above. This transforms the document from a "correction note" into a **living deployment specification** that serves:
- **New team members** — Complete mental model in one read
- **Incident responders** — Runbooks and rollback at hand
- **Planning** — Prioritized gap backlog linked to sprints
- **Governance** — ADRs and RFC candidates with decision gates

The codebase is solid; the document should match its quality.

---

*Review completed using 9-point style framework (Accuracy, Clarity, Completeness, Actionability, Formatting, Tone, Cross-References, Maintenance Awareness, Decision Traceability).*