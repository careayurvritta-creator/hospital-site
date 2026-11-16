# EGM-06 Analytics System - Codebase Details Review

**Document Reviewed**: `egm-06-analytics-system.md`
**Review Date**: 2026-11-13
**Reviewer**: egm-codebase-details (via EGM orchestrator)
**Context Files**: analytics/ (20 files), components/AnalyticsProvider.tsx, components/AnalyticsDashboard.tsx, components/CookieConsent.tsx, package.json

---

## Executive Summary

The design document describes an **aspirational, self-hosted, privacy-first analytics architecture** with batching, retry logic, offline queue, internal API endpoint, and comprehensive metrics dashboard. The **actual implementation** is a **client-side GA4/Clarity integration** with a rich event vocabulary and lead scoring, but the core infrastructure claims are inaccurate.

**Verdict**: **Major Drift** — Document misrepresents implemented system in fundamental ways.

---

## Critical Discrepancies (🔴)

### 1. AnalyticsProvider Not Integrated into App
- **Design Doc Claim**: "All pages wrapped in `AnalyticsProvider`" (line 103); "Wraps the entire application" (line 19)
- **Actual**: `AnalyticsProvider` is NOT used in `index.tsx`, `App.tsx`, or `Layout.tsx`. The provider exists but wraps nothing. Components using `useAnalytics` (MobileCTABar, FeedbackCollector, ExitIntentPopup, SocialProof) receive the default no-op context.

### 2. External Analytics Dependencies Exist (Contradicts "No External Dependencies")
- **Design Doc Claim**: "No external analytics dependencies (no Google Analytics, no Mixpanel)" (line 99); "Self-hosted dashboard for data sovereignty" (line 100)
- **Actual**: Code uses **Google Analytics 4** (`loadGA4` in `index.ts:83-121`) and **Microsoft Clarity** (`loadClarity` in `index.ts:126-145`). Events sent to GA4 via `gtag`. No self-hosted backend API exists—all data flows to Google/Microsoft.

### 3. No Internal API Endpoint / Event Batching / Retry / Offline Queue
- **Design Doc Claims**: 
  - "Analytics events sent to internal API endpoint" (line 95)
  - "Batching: events queued and sent in 5-second intervals" (line 96)
  - "Retry logic: failed events retried up to 3 times" (line 97)
  - "Offline support: events cached in IndexedDB when offline" (line 98)
- **Actual**: None implemented. Events sent immediately via `gtag` (no queue, no batching, no retry, no IndexedDB). `sendToGA` in `eventTracker.ts:495-504` is a direct `gtag` call.

---

## Major Discrepancies (🟠)

### 4. CookieConsent Has 4 Categories, Not 3
- **Design Doc Claim**: "3 consent categories: Essential, Analytics, Marketing" (line 27)
- **Actual**: `ConsentState` type (`types.ts:159-166`) and `CookieConsent.tsx` have **4 categories**: Essential, Analytics, **Personalization**, Marketing.

### 5. Do Not Track Signal Not Respected (CCPA Non-Compliance)
- **Design Doc Claim**: "CCPA: Do Not Track signal respected" (line 89)
- **Actual**: `PRIVACY_CONFIG.respectDoNotTrack: true` exists in `config.ts:69` but **never checked** in `canTrack()` (`eventTracker.ts:124-126`) or anywhere else.

### 6. Error Tracking Missing Key Features
- **Design Doc Claims**:
  - "Breadcrumbs: last 5 user actions before error" (line 47) — Not implemented in fallback (only in Sentry if installed)
  - "Rate limiting: max 10 errors per session" (line 48) — Not implemented
  - "Offline queue: errors stored when network unavailable" (line 49) — Not implemented
- **Actual**: Only basic JS error + unhandled rejection capture. React component errors not captured (no ErrorBoundary integration).

### 7. Analytics Dashboard Not Integrated / Lacks Claimed Features
- **Design Doc Claims**:
  - "Real-time metrics: visitors, page views, conversion rate" (line 53) — No "visitors" or "conversion rate" metrics
  - "Top pages by traffic" (line 54) — Not implemented
  - "Tool usage statistics" (line 55) — Not shown in dashboard
  - "Blog performance (top posts by views)" (line 56) — No blog tracking exists
  - "Error frequency and types" (line 57) — Not in dashboard
  - "Time-series charts (7-day, 30-day views)" (line 58) — Dashboard is session-only, no historical data
- **Actual**: Dashboard (`AnalyticsDashboard.tsx`) is a **fixed dev overlay** (`z-50`, bottom-left), not an internal admin view. Not rendered anywhere in the app.

### 8. Blog Event Tracking Not Implemented
- **Design Doc Claims**: Blog domain events: `post_view`, `post_share`, `post_comment` (line 41)
- **Actual**: No blog event tracking in `eventTracker`. Blog page exists (`/blog` route) but no analytics integration.

### 9. Key Business Metrics Not Tracked
- **Design Doc Claims**: Appointment booking rate, Contact form conversion, Phone call clicks, Insurance page engagement (lines 63-66)
- **Actual**: 
  - Booking: lead scoring exists but no "rate" calculation
  - Contact form: no `contact_submit` event
  - Phone clicks: `trackWhatsAppClick` exists but not phone call tracking
  - Insurance: only generic page view

### 10. Key Engagement Metrics Not Calculated
- **Design Doc Claims**: Bounce rate per page, Return visitor rate (lines 70-71)
- **Actual**: Not calculated. `returning_visitor` segment exists but no rate metric.

### 11. Tool Metrics Incomplete
- **Design Doc Claims**: Tool completion rate, Average time per tool, Share rate, Results distribution (Prakriti types, dosha imbalances) (lines 75-78)
- **Actual**: Only `toolComplete` lead scoring. No rate, avg time, share rate, or results distribution tracking.

### 12. Data Retention / Right to Deletion Not Implemented
- **Design Doc Claims**: "Data retention: 90-day rolling window" (line 90); "Right to deletion: All user data purgeable by session ID" (line 92)
- **Actual**: No TTL on localStorage/sessionStorage data. No purge function exposed.

---

## Minor Discrepancies / Omissions (🟡)

### 13. Consent Version Handling
- **Design Doc**: "Re-consent banner on preference change" (line 30)
- **Actual**: `consentManager.revokeConsent()` exists but no automatic banner re-show on version change.

### 14. Event Category Mismatches
- Design doc table (lines 35-42) lists event names that don't match implementation:
  - `nav_click`, `menu_toggle` — not explicitly tracked (generic clicks only)
  - `video_play` — not implemented
  - `contact_submit`, `call_click` — not implemented
  - `tool_share` — `trackShare` exists but not tool-specific
  - `api_error`, `form_error` — not categorized this way

### 15. Analytics Dashboard Rendered as Dev Overlay, Not Internal Admin View
- **Design Doc**: "Internal admin view (not publicly accessible)" (line 52)
- **Actual**: Fixed position `z-50` dev tool rendered in bottom-left corner. Would be visible to any user if rendered.

### 16. Sentry Optional but Not Configured
- **Design Doc**: "Error Tracker (sentry-like)" (line 15)
- **Actual**: `errorTracker.ts` has optional Sentry integration but requires `@sentry/react` (in `package.json:15`) and `VITE_SENTRY_DSN` env var. No DSN configured.

---

## Accurate Claims (✅)

- Consent management with localStorage persistence (`consentManager.ts`)
- Granular consent toggles per category (`CookieConsent.tsx`)
- Scroll depth tracking with thresholds (`eventTracker.ts:195-223`)
- Page view tracking on route change (`AnalyticsProvider.tsx:160-170`)
- Lead scoring system (`eventTracker.ts:509-518`, `config.ts:94-112`)
- User segmentation (`userSegmentation.ts` — exported)
- ChatBot event tracking (`eventTracker.ts:378-404`)
- Tool event tracking (`eventTracker.ts:409-428`)
- WhatsApp click tracking (`eventTracker.ts:469-477`)
- Social share tracking (`eventTracker.ts:482-490`)
- GDPR consent gate before GA4/Clarity load (`index.ts:55-64`, `consentManager.ts:86`)
- Data minimization via `sanitizePII` (`utils.ts` — used in form/chat events)
- PII anonymization attempt in events

---

## Summary

The design document describes an **aspirational architecture** with a self-hosted, privacy-first analytics system including batching, retry, offline queue, internal API, and comprehensive metrics. The **actual implementation** is a **client-side GA4/Clarity integration** with a rich event vocabulary and lead scoring, but:

1. **AnalyticsProvider is not connected to the app**
2. **No self-hosted backend** — all data goes to Google/Microsoft
3. **No batching, retry, offline support, or internal API**
4. **Dashboard is an unused dev overlay**
5. **Several claimed metrics/events are not implemented**
6. **CCPA Do Not Track is configured but not enforced**

The codebase has a **sophisticated event tracking vocabulary** that exceeds the design doc in some areas (lead scoring, segmentation, chatbot, A/B testing, personalization, mobile analytics), but the **core infrastructure claims are inaccurate**.