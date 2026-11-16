# Implementation Readiness Review Report

**Target:** `egm-06-analytics-system.md` (lines 1–107)
**Persona:** egm-implementation-readiness
**Standard:** implementation-readiness-standard.md (with feature-spec-standard.md cross-check)
**Date:** 2026-11-13

---

## Findings

### 1. [Blocker] Direct factual contradiction: "No external analytics dependencies" vs. the code actually loads GA4 and Clarity
**Scope:** "Technical Implementation" section, lines 94–100; also "Overview" line 4.

The document states: "No external analytics dependencies (no Google Analytics, no Mixpanel)" and "Self-hosted dashboard for data sovereignty." The actual code does the opposite. `analytics/index.ts` (lines 83–145) defines `loadGA4()` and `loadClarity()`, which inject third-party scripts from `googletagmanager.com` and `clarity.ms`. `analytics/eventTracker.ts` sends every event to `(window as any).gtag` via `sendToGA()`. `package.json` also declares `@sentry/react` as a dependency, and `analytics/errorTracker.ts` integrates Sentry. An engineer implementing "per this spec" would build a self-hosted pipeline, while the real codebase ships data to Google and Microsoft. This is not a gap — it is a false statement that would send the implementer in the wrong direction.

**Guidance:** Either correct the document to reflect the GA4/Clarity/Sentry reality, or explicitly document the decision to remove those integrations and specify the replacement internal API contract.

---

### 2. [Blocker] The claimed "internal API endpoint" does not exist anywhere in the spec or the code
**Scope:** line 95 ("Analytics events sent to internal API endpoint").

No endpoint path, HTTP method, request/response schema, authentication, or rate limiting is specified. The implementer must invent: the URL (e.g. `/api/analytics/events`?), POST vs. gRPC, bearer token vs. API key, payload field names, batch envelope shape, and CORS/ingress rules. Meanwhile the existing code sends events to `gtag('event', ...)` — so the implementer must also decide whether to keep, replace, or parallel-send. Under the Zero-Decision Rule this alone fails the standard.

**Guidance:** Provide the exact endpoint contract: method, path, auth scheme, `AnalyticsEvent` JSON schema (including which fields are stripped for PII), batch size, and success/failure semantics.

---

### 3. [Blocker] "Batching: events queued and sent in 5-second intervals" is not implemented and is unspecified
**Scope:** line 96.

No queue data structure, no 5-second `setInterval`/`requestIdleCallback` flush, no flush trigger (timer vs. count vs. beforeunload), no behavior on `visibilitychange` or unmount (does the queue flush immediately or drop?), and no max-queue-size or backpressure rule. Reading `analytics/eventTracker.ts`, every `trackEvent` call invokes `sendToGA` synchronously — there is no queue at all. The implementer would have to design the entire batching subsystem from scratch with no target behavior defined.

**Guidance:** Specify: queue storage (in-memory array vs. IndexedDB), flush interval (5s confirmed), flush-on-`beforeunload` (use `navigator.sendBeacon`?), max batch size, retry-on-failure contract, and whether events are dropped or persisted across reloads.

---

### 4. [Blocker] "Offline support: events cached in IndexedDB when offline" — no IndexedDB schema or lifecycle defined
**Scope:** line 98.

No object store name, no key path, no index (by `sessionId` for purge, by `timestamp` for retention), no read/write transaction logic, no online/offline detection (`navigator.onLine`), and no reconciliation when connectivity returns (dedup risk, ordering). The existing code has zero IndexedDB usage. This is a full storage design left to the implementer.

**Guidance:** Define the store schema (`events` with indexes on `id`, `sessionId`, `timestamp`), the write path, the flush path, and the dedup/idempotency key so replayed events aren't double-counted.

---

### 5. [Blocker] "Retry logic: failed events retried up to 3 times" — unspecified retry contract
**Scope:** line 97.

No retry strategy: exponential backoff or fixed delay? What counts as a failure (HTTP 4xx vs 5xx vs. network error)? After 3 failures, are events dropped, persisted to dead-letter, or retried on next page load? Is the retry per-event or per-batch? None of this is in the document, and `eventTracker.ts` has no retry logic at all.

**Guidance:** Specify status-code handling, backoff schedule, per-event attempt counter storage, and dead-letter disposition.

---

### 6. [Blocker] "90-day rolling window for event data" contradicts the configured 14-month retention and has no enforcement mechanism
**Scope:** line 90 ("Privacy Compliance") vs. `analytics/config.ts` line 67.

The document says 90 days. The code constant `PRIVACY_CONFIG.dataRetentionMonths` is `14`. More importantly, nothing in the codebase enforces any retention window — there is no purge job, no TTL, no scheduled deletion, and no documented where the data even lives (if events only go to GA4, the retention window is controlled by Google, not by this project). The implementer cannot "implement a 90-day rolling window" because the storage target and purge mechanism are undefined.

**Guidance:** State where event data is stored (internal DB? GA4?), define the purge job (cron? edge function?), the query that selects records older than 90 days, and reconcile the constant to match the spec.

---

### 7. [Blocker] "Right to deletion: All user data purgeable by session ID" — no purge implementation or contract
**Scope:** line 92.

No API endpoint for deletion, no query to delete by `sessionId`, no scope of what "all user data" means (events? session storage? lead score? visitor ID? chat transcripts? A/B test assignments?), and no GDPR/DPDP erasure workflow (identity verification, response SLA). The document treats this as a one-line property of the system rather than a feature to build.

**Guidance:** Define the erasure endpoint (`DELETE /api/data?sessionId=...` or similar), the data stores touched (IndexedDB, localStorage keys, server tables), and the authorization model for who may invoke it.

---

### 8. [Blocker] "Anonymization: No PII stored in analytics events" — no anonymization rules defined
**Scope:** line 91.

What counts as PII? What transformation is applied (hashing, truncation, tokenization, dropping)? The document asserts the outcome but not the mechanism. The code does have a `sanitizePII()` in `utils.ts`, but the design doc never mentions it, so an implementer following only the document would not know it exists or what it strips.

**Guidance:** Enumerate the PII fields that must be stripped/hashed (email, phone, name, IP address, free-text form fields, chat messages) and name the sanitization function and its rules.

---

### 9. [Blocker] Consent state machine, storage schema, and DNT interaction are all unspecified
**Scope:** "Analytics Provider" lines 18–23, "Consent Management" lines 25–30, "Privacy Compliance" lines 86–92.

The implementer must independently decide:
- The exact localStorage key and value schema (the code uses `ayurvritta_consent` with a `ConsentState` object, but the document never states this).
- The consent state machine: states, transitions, what happens on version bump (the code resets to defaults — undocumented), and whether rejecting analytics still allows essential cookies (asserted but not reasoned through).
- How `doNotTrack` interacts with consent: the document claims both are respected, but `eventTracker.canTrack()` checks only `consentManager.hasConsentFor('analytics')` and never reads `navigator.doNotTrack`. `loadGA4()`/`loadClarity()` likewise ignore DNT. So the DNT claim is false in the current code, and the document gives the implementer no rule for how the two signals should combine (e.g., DNT overrides consent? DNT suppresses only non-essential?).

**Guidance:** Document the consent key/schema, the state machine (including version-bump behavior), and an explicit precedence rule for DNT vs. user consent.

---

### 10. [Major] Session ID generation and session boundaries are unspecified
**Scope:** lines 18–23, 48.

The document says nothing about how a session ID is generated (the code uses `sess_<time-base36>-<random>` in `utils.ts`), when a session expires or is reset (the code uses a 30-minute inactivity timeout in `SESSION_CONFIG.sessionTimeout` and stores it in `sessionStorage` under `ayurvritta_session`), or how a new session is distinguished from a returning visit. A fresh implementer would invent their own session model, risking inconsistent joins with the dashboard and purge-by-session-ID.

**Guidance:** Specify the session ID format, the inactivity timeout, the storage location, and the new-vs-returning session rule.

---

### 11. [Major] "17 files in analytics/" is factually wrong — the directory has 20 files, and most are unmentioned
**Scope:** Overview line 4, and implicitly the whole "Analytics Architecture" section.

The directory listing shows 20 `.ts` files. The document mentions only: `AnalyticsProvider.tsx`, `CookieConsent.tsx`, `errorTracker.ts`, `AnalyticsDashboard.tsx`. It never mentions `chatBotAnalytics.ts`, `recommendationEngine.ts`, `sentimentAnalyzer.ts`, `reportGenerator.ts`, `dataGovernance.ts`, `abTestManager.ts`, `contentPerformanceTracker.ts`, `bookingFunnelTracker.ts`, `performanceMonitor.ts`, `userSegmentation.ts`, `mobileDeviceDetector.ts`, `touchTracker.ts`, `mobileScrollTracker.ts`, `index.ts`, `config.ts`, `types.ts`, `utils.ts`. The doc's event taxonomy (lines 35–42) lists only 18 events across 6 domains, but the codebase tracks chatbot conversations, sentiment, A/B tests, heatmaps, session recordings, personalization rules, lead scoring, and mobile touch/scroll — none of which appear in the document. An implementer working from this document would not know these modules exist and could not locate or integrate them.

**Guidance:** Correct the file count and provide a complete module map with each file's responsibility and public API.

---

### 12. [Major] Dashboard access control is unspecified
**Scope:** "Analytics Dashboard" lines 51–58.

The document says "Internal admin view (not publicly accessible)" but specifies no authentication, no authorization role check, no route guard, and no hosting location. `AnalyticsDashboard.tsx` is tagged "development only" in its header comment, which is a different claim entirely. The implementer must decide how "not publicly accessible" is enforced.

**Guidance:** Define the authn/authz requirement (admin role? IP allowlist?), the route protection mechanism, and the deployment target.

---

### 13. [Major] No file-change list, actionable steps, or test plan — standard readiness gap
**Scope:** entire document.

The Implementation Readiness Standard requires, as non-exhaustive examples: an explicit list of exact repository-relative file paths to be created/modified/deleted; precise logic changes per file; and a specific test plan (happy path and edge cases). This document contains none of these. It is a feature specification, not an implementation plan. It has no "## Detailed Implementation Plan" section (as the caller noted), no phase partitioning, no checkpoints, and no verification steps. It fails the Zero-Decision Rule on that basis alone.

**Guidance:** Add a phased implementation plan with: file manifest (create/modify/delete), per-file logic changes, and a test plan covering consent-granted, consent-denied, DNT-on, offline, retry-exhausted, session-expiry, and purge scenarios.

---

### 14. [Major] Feature-spec-standard gap: no alternatives evaluation
**Scope:** entire document (Alternatives Rule).

The Feature Specification Standard requires a mandatory evaluation of alternatives with documented rejection rationales. The document proposes one path and never discusses alternatives. Concretely absent: why not Google Analytics (the document simultaneously claims "no Google Analytics" while the code loads GA4 — so even the trade-off isn't coherent), why not Mixpanel/Amplitude, why self-hosted vs. third-party (the document asserts "self-hosted dashboard for data sovereignty" without weighing cost, maintenance, and accuracy trade-offs), and why IndexedDB vs. server-side persistence for the offline queue.

**Guidance:** Add an "Alternatives Considered" section evaluating at minimum: third-party analytics (GA4/Mixpanel), self-hosted event API, and client-side-only persistence — with concrete rejection rationales.

---

### 15. [Major] Feature-spec-standard gap: no Risks & Limits section
**Scope:** entire document (Risks & Limits rule).

The document never calls out its own constraints or failure modes. Specifically missing:
- **Consent-bypass risk:** events are sent regardless of consent in some paths (e.g., `trackError` in `eventTracker.ts` line 433 bypasses `canTrack()` and calls `sendToGA` directly; `errorTracker.captureError` always tracks to analytics). The document asserts GDPR compliance without acknowledging that error tracking may fire before consent is granted.
- **Data volume/scalability:** no estimate of event rate, no batching/capacity limit, no mention of the 10-errors-per-session rate limit (line 48) being implemented or where it is enforced.
- **Offline queue growth:** no bound on IndexedDB queue size; unbounded growth under prolonged offline conditions is a real risk.
- **PII leakage vectors:** free-text fields (form values, chat messages) are only sanitized if the caller remembers to call `sanitizePII`; the document gives no guarantee.
- **Dashboard access control:** noted above.
- **Third-party data egress:** the document claims data sovereignty, but if GA4/Clarity remain loaded, patient data leaves the jurisdiction — a contradiction the document never acknowledges.

**Guidance:** Add a "Risks & Mitigations" section addressing each of the above.

---

### 16. [Nit] Event taxonomy in the document is narrower than the implemented event surface
**Scope:** "Event Tracking System" table, lines 35–42.

The document lists 18 events across 6 domains. The implemented system (per `types.ts` and `AnalyticsProvider.tsx`) also emits chatbot messages with sentiment/intent, tool progress/abandon steps, form field-focus/blur/error/abandon events, performance metrics (LCP/FID/CLS/TTFB/FCP), A/B test exposures, personalization rule triggers, session recordings, heatmaps, and feedback (NPS/CSAT/CES). The document's table would mislead an implementer about the required event surface.

**Guidance:** Expand the event taxonomy to match the implemented surface, or explicitly declare the table as partial.

---

### 17. [Nit] "Re-consent banner on preference change" is not specified
**Scope:** line 30.

The document asserts a re-consent banner appears on preference change, but does not say when (only on version bump? on every change? on downgrade from analytics to essential?), what it looks like, or how it interacts with already-loaded third-party scripts. The code's `updateConsent` applies changes silently via `gtag('consent', 'update', ...)` with no re-banner.

**Guidance:** Define the trigger conditions and UX for re-consenting.

---

## Summary

The document fails the Implementation Readiness Standard on the Zero-Decision Rule: a competent engineer cannot implement this system from it without making independent design choices on the API contract, batching/queue/offline/retry subsystems, retention enforcement, deletion workflow, anonymization rules, consent state machine, DNT precedence, session model, and dashboard access control. It additionally contains at least one factually false claim (no external analytics dependencies) that is contradicted by the code it describes, and a second false claim (DNT respected) that the code does not implement. It also fails the Feature Specification Standard for omitting both the alternatives evaluation and the risks/limits analysis.

REPORT COMPLETE