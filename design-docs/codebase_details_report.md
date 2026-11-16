# Codebase Details Review Report

**Target:** `egm-06-analytics-system.md` (lines 1–107)
**Persona:** egm-codebase-details
**Standard:** feature-spec-standard.md
**Date:** 2026-11-13

---

## REVIEW FINDINGS

### Standard-compliance (feature-spec-standard.md)

**[Major]** `design-docs\egm-06-analytics-system.md` — The document contains no **Alternatives Considered** section and no **Risks & Mitigations** section. The standard makes both mandatory (alternatives with concrete rejection rationales; explicit failure modes, security implications, scalability limits). The doc is a one-path architecture description with zero trade-off analysis and zero stated risk. It also lacks a Problem Statement and Goals/Non-Goals.

---

### 1. Event taxonomy table vs. code

**[Blocker]** `design-docs\egm-06-analytics-system.md` lines 35–42 (table) vs `analytics\eventTracker.ts`, `analytics\config.ts`, `analytics\types.ts` — The taxonomy table is largely fictional. Verified against actual emitted events:

- **Navigation**: `page_view` is not emitted as an `AnalyticsEvent` anywhere — `trackPageView()` (eventTracker.ts:276) sends only to GA4 via `sendToGA`. `nav_click` and `menu_toggle` do not exist in any file.
- **Engagement**: `scroll_depth` exists (eventTracker.ts:207, category ENGAGEMENT). `time_on_page` is not an event — it is a GA4 param sent on `page_exit` (eventTracker.ts:557). `video_play` does not exist.
- **Conversion**: `booking_submit`, `contact_submit`, `call_click` do not exist as event names. The booking form emits a generic `trackFormEvent` with `action: 'submit'` (bookingFunnelTracker.ts:178) and a `funnel_step` event with label `submit` (bookingFunnelTracker.ts:84). The only click-conversion event that exists is `cta_click` (eventTracker.ts:263). `whatsapp_click` exists (eventTracker.ts:469) — there is no `call_click`.
- **Tools**: `tool_start`, `tool_complete`, `tool_share` do not exist as event names. `trackToolEvent` (eventTracker.ts:409) forwards `action` ('start'|'progress'|'complete'|'abandon'|'share') as a GA4 param, not as an event action.
- **Blog**: `post_view`, `post_share`, `post_comment` do not exist. There is no blog-post event tracking anywhere; blog pages are handled only by `contentPerformanceTracker` which aggregates page-level metrics, not per-post events.
- **Error**: `js_error`, `api_error`, `form_error` do not exist. The only error events are GA4 `error` (from `trackError`, eventTracker.ts:435) with `errorType` values 'JavaScript Error' / 'Unhandled Promise Rejection', and chatbot `error` action.

**[Major]** `analytics\config.ts` lines 30–43 — The doc's six domains omit seven categories that actually exist in `EVENT_CATEGORIES`: `INTERACTION`, `PERFORMANCE`, `CHATBOT`, `BOOKING`, `CONTENT`, `EXPERIMENT`, `FEEDBACK`. Real emitted events include `whatsapp_click` (INTERACTION), `performance` (PERFORMANCE), `chatbot` (CHATBOT), `funnel_step` (BOOKING), `variant_assigned`/`conversion` (EXPERIMENT), `scroll_milestone` (ENGAGEMENT). The doc never mentions any of these.

---

### 2. errorTracker.ts claims

**[Blocker]** `analytics\errorTracker.ts` lines 44–49 (doc) vs `analytics\errorTracker.ts` (whole file) — "Rate limiting: max 10 errors per session" — **no rate limiting exists**. There is no error counter, no session cap, no `MAX_ERRORS` constant anywhere in `errorTracker.ts` or `eventTracker.ts`.

**[Blocker]** `analytics\errorTracker.ts` lines 44–49 vs `analytics\errorTracker.ts` — "Offline queue: errors stored when network unavailable" — **no offline queue exists**. `captureError` (line 58) calls `eventTracker.trackError`, which calls `sendToGA` (eventTracker.ts:495) directly. There is no queue, no `navigator.onLine` check, no persistence.

**[Blocker]** `analytics\errorTracker.ts` lines 44–49 vs `analytics\errorTracker.ts` lines 116–132 — "Breadcrumbs: last 5 user actions before error" — `addBreadcrumb` exists but it only forwards to Sentry (`Sentry.addBreadcrumb`) when Sentry is initialized. There is no local breadcrumb store, no array, no "last 5" cap, and no enrichment into the error payload. In the fallback path breadcrumbs are silently dropped.

**[Major]** `analytics\errorTracker.ts` lines 44–49 vs `analytics\errorTracker.ts` lines 58–98 — "Enriches with: user agent, URL, timestamp, session ID" — only `path` (URL) and `timestamp` are set. `user agent` and `session ID` are never attached to the tracked error. `ErrorContext` (lines 13–20) has no `userAgent` or `sessionId` field.

**[Major]** `analytics\errorTracker.ts` lines 44–49 vs codebase-wide — "React component errors" — there is **no React error boundary anywhere in the codebase** (glob for `errorBoundary*` returned zero files). `ErrorContext` declares a `componentStack` field (line 16) that is never populated by any caller. `captureError` is a generic function; nothing captures `componentDidCatch`-style React errors.

**[Nit]** `analytics\errorTracker.ts` line 4 (comment) — The file header advertises "optional Sentry integration" and `@sentry/react` is a declared dependency in `package.json` line 15, but the document's "no external analytics dependencies" claim (line 99) never mentions Sentry at all.

---

### 3. AnalyticsProvider.tsx claims

**[Blocker]** `design-docs\egm-06-analytics-system.md` line 22 vs `analytics\utils.ts` lines 332–339 and codebase-wide usage — "Respects `doNotTrack` browser setting" — **false**. `isDoNotTrackEnabled()` exists in `utils.ts` and `PRIVACY_CONFIG.respectDoNotTrack` is set to `true` in `config.ts` line 69, but `isDoNotTrackEnabled()` is **never called from any file**. No consent gate, no early-return, no check anywhere in `eventTracker.ts`, `consentManager.ts`, `index.ts`, or `AnalyticsProvider.tsx`. The setting is dead code.

**[Nit]** `design-docs\egm-06-analytics-system.md` line 21 vs `components\AnalyticsProvider.tsx` lines 188–240 — "Provides `track()` function via context" — the context exposes `trackEvent`, `trackFormEvent`, `trackToolEvent`, `trackChatBotMessage`, `trackWhatsAppClick`, `trackShare`. There is no method named `track()`.

**[Major]** `design-docs\egm-06-analytics-system.md` line 87 vs `analytics\eventTracker.ts` lines 57–61 and `analytics\utils.ts` lines 33–43 — "GDPR: Consent required before analytics cookies set" — partially violated at module-load time. `eventTracker` is a singleton constructed at import (`export const eventTracker = new EventTracker()`, eventTracker.ts:603). Its constructor calls `getOrCreateVisitorId()`, which writes `ayurvritta_visitor_id` into **localStorage immediately on import**, before any consent decision. This is an essential cookie written pre-consent, contradicting the stated consent-first model.

---

### 4. CookieConsent.tsx claims

**[Blocker]** `design-docs\egm-06-analytics-system.md` line 27 vs `analytics\consentManager.ts` lines 13–20 and `components\CookieConsent.tsx` lines 18–22, 111–157 — "3 consent categories: Essential, Analytics, Marketing" — **false; there are 4**. `ConsentState` (`types.ts` lines 159–166) and `CONSENT_TYPES` (`config.ts` lines 74–79) both define `essential`, `analytics`, `marketing`, and **`personalization`**. `CookieConsent.tsx` renders four toggles (Essential always-on, Analytics, Personalization, Marketing — lines 111–157). The document omits `personalization` entirely, and the GA4 consent mapping in `index.ts` line 115 also references `personalization_storage`.

**[Blocker]** `design-docs\egm-06-analytics-system.md` line 30 vs `analytics\consentManager.ts` lines 37–56, 93–107 — "Re-consent banner on preference change" — **not implemented**. The banner (`CookieConsent.tsx` line 24) shows only when `!consentManager.hasConsented()`, i.e. `timestamp === 0`. `updateConsent` sets `timestamp` to `Date.now()` and bumps `version`, so the banner never reappears after a preference change. The only re-consent trigger is a `CONSENT_VERSION` mismatch (line 44–47), which is a hardcoded `'1.0'` that never changes.

---

### 5. MobileConsent.tsx — existence and omission

**[Major]** `components\MobileConsent.tsx` exists (226 lines, a mobile bottom-sheet consent UI with its own Accept All / Essential Only / Customize flow, granular toggles for all 4 categories, and `safe-area-bottom` mobile styling). The document **never mentions it** — not in the consent section, not in the file list, not in integration points. This is a complete omission of a shipped consent surface, which is material for a GDPR/DPDP compliance document.

**[Nit]** `design-docs\egm-06-analytics-system.md` line 52 vs `components\AnalyticsDashboard.tsx` line 4 (comment) and line 116 — "Internal admin view (not publicly accessible)" — the code comment says "development only", but the component **renders unconditionally** as a fixed bottom-left `z-50` widget in the DOM (line 116) with no role check, no auth gate, and no env guard around rendering. It is publicly accessible in production, not internal-only.

**[Blocker]** `design-docs\egm-06-analytics-system.md` lines 53–58 vs `components\AnalyticsDashboard.tsx` (whole file) — Several claimed dashboard views **do not exist**:
- "Top pages by traffic" — not rendered. The component imports `recharts` (`BarChart`, `Bar`, `XAxis`, `YAxis`, `PieChart`, `Pie`, `Cell`, lines 8–18) but **never renders any chart**. There is no top-pages list.
- "Tool usage statistics" — not rendered.
- "Blog performance (top posts by views)" — not rendered.
- "Error frequency and types" — not rendered.
- "Time-series charts (7-day, 30-day views)" — not rendered; no time-series data exists in the component.
- What it actually shows: Page Views, Engagement time, Lead Score, Events, User Segments, Lead Score progress bar, Core Web Vitals, ChatBot Insights, Session Info.

---

### 6. File count: "17 files" vs. actual 20

**[Blocker]** `design-docs\egm-06-analytics-system.md` line 4 — "spans 17 files in the `analytics/` directory". Glob of `analytics/` returns **20 files**. The document names only four by path (`errorTracker.ts`, `AnalyticsProvider.tsx`, `CookieConsent.tsx`, `AnalyticsDashboard.tsx`) plus a generic reference to "Event Tracking System". **Sixteen of the 20 files are never mentioned:**

`config.ts`, `types.ts`, `utils.ts`, `index.ts`, `performanceMonitor.ts`, `userSegmentation.ts`, `bookingFunnelTracker.ts`, `chatBotAnalytics.ts`, `abTestManager.ts`, `contentPerformanceTracker.ts`, `recommendationEngine.ts`, `sentimentAnalyzer.ts`, `reportGenerator.ts`, `dataGovernance.ts`, `mobileDeviceDetector.ts`, `mobileScrollTracker.ts`, `touchTracker.ts` — that is 17, of which `dataGovernance.ts` is only alluded to generically by the privacy section. Concretely never-named: `config.ts`, `types.ts`, `utils.ts`, `index.ts`, `performanceMonitor.ts`, `userSegmentation.ts`, `bookingFunnelTracker.ts`, `chatBotAnalytics.ts`, `abTestManager.ts`, `contentPerformanceTracker.ts`, `recommendationEngine.ts`, `sentimentAnalyzer.ts`, `reportGenerator.ts`, `mobileDeviceDetector.ts`, `mobileScrollTracker.ts`, `touchTracker.ts` (16 files).

---

### 7. "No external analytics dependencies" vs. package.json

**[Blocker]** `design-docs\egm-06-analytics-system.md` line 99 — "No external analytics dependencies (no Google Analytics, no Mixpanel)". **False.** `package.json` line 15 declares `@sentry/react: ^10.52.0`. `analytics\index.ts` lines 83–121 (`loadGA4`) injects `https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX` and lines 126–145 (`loadClarity`) injects `https://www.clarity.ms/tag/...`. Both are loaded at runtime from `AnalyticsProvider.tsx` lines 110–111. So Google Analytics 4 and Microsoft Clarity are live external analytics dependencies, directly contradicting the claim.

---

### 8. Privacy compliance claims vs. dataGovernance.ts / config.ts

**[Blocker]** `design-docs\egm-06-analytics-system.md` line 90 — "Data retention: 90-day rolling window for event data". **False.** `analytics\config.ts` line 67 sets `PRIVACY_CONFIG.dataRetentionMonths: 14` (14 months). `dataGovernance.ts` `registerStandardItems()` (lines 348–364) registers retention windows of 365, 90, 60, and 30 **days** for specific keys — none of which is a global "event data" 90-day window, and the default is 14 months. No 90-day rolling event purge exists.

**[Blocker]** `design-docs\egm-06-analytics-system.md` line 92 — "Right to deletion: All user data purgeable by session ID". **False.** `dataGovernance.deleteAllUserData()` (lines 284–312) purges by **inventory key** (`this.inventory.forEach((item, key) => localStorage.removeItem(key))`), not by session ID. There is no `purgeBySessionId()` method anywhere. The only session-scoped data is `sessionStorage` (`ayurvritta_session`, `ayurvritta_previous_page`, `ayurvritta_booking_funnel`, `ayurvritta_chat_conversation`, `ayurvritta_device_info`), which is browser-session-scoped by definition and has no explicit purge API.

**[Major]** `design-docs\egm-06-analytics-system.md` line 91 — "Anonymization: No PII stored in analytics events". **Partially false.** `sanitizePII` is applied to click text (eventTracker.ts:251), form field values (line 350), and chatbot messages (line 383). However: (a) `ErrorEvent.errorMessage` is truncated to 500 chars but **not sanitized** (eventTracker.ts:437) — error messages routinely contain PII; (b) `chatBotAnalytics` stores the last 50 raw messages in `sessionStorage` (chatBotAnalytics.ts:71–79) and the last 100 conversation summaries in `localStorage` (lines 243–263); (c) `bookingFunnelTracker` stores `formData` with `name`/`phone`/`email` keys present in the interface (types.ts:186–193) though `completeFunnel` only persists service/date/time (bookingFunnelTracker.ts:167–172); (d) `visitorId`, UTM parameters, referrer, screen resolution, browser/OS are all stored persistently. "Only event metadata stored" (line 88) is therefore inaccurate.

**[Major]** `design-docs\egm-06-analytics-system.md` line 89 — "CCPA: Do Not Track signal respected" — **false** (see Finding 3): `isDoNotTrackEnabled()` is dead code, never invoked.

---

### 9. Batching / retry / IndexedDB claims vs. eventTracker.ts / utils.ts

**[Blocker]** `design-docs\egm-06-analytics-system.md` lines 96–98 — "Batching: events queued and sent in 5-second intervals", "Retry logic: failed events retried up to 3 times", "Offline support: events cached in IndexedDB when offline". **All three are false.**
- `eventTracker.ts` declares `private eventQueue: AnalyticsEvent[] = []` (line 50) but **the queue is never written to and never drained** — no `push`, no `setInterval`, no flush. Every track method calls `sendToGA` immediately.
- There is **no retry logic** anywhere: no attempt/catch-with-retry, no retry counter, no `MAX_RETRIES` constant.
- There is **no IndexedDB** usage anywhere: `utils.ts` (422 lines) uses only `localStorage`/`sessionStorage`; `dataGovernance.ts` uses only `localStorage`. No `indexedDB` import, no `IDBKeyRange`, no `dexie`.

**[Blocker]** `design-docs\egm-06-analytics-system.md` line 95 — "Analytics events sent to internal API endpoint". **False.** Events are sent exclusively to third-party `window.gtag` (GA4) and to the browser console in debug mode. There is no `fetch`, no `/api/analytics` endpoint, no internal API in any analytics file.

---

### 10. Integration points (lines 102–107)

**[Blocker]** Line 106 — "`SEOHead` emits `page_view` on mount (via provider)". **False.** `components\SEOHead.tsx` (235 lines) imports only `react`, `react-router-dom`, `../seo`, and `../data/blog/loadPosts`. It has **no analytics import and emits no events**. `page_view` is emitted by `AnalyticsProvider`'s route-change `useEffect` (AnalyticsProvider.tsx:161–170) calling `trackPageView`, not by `SEOHead`.

**[Blocker]** Line 105 — "Booking form emits `booking_submit` on success". **False** — no event named `booking_submit` exists (see Finding 1). The booking form emits `trackFormEvent({action:'submit', formName:'booking'})` and a `funnel_step` event labeled `submit`.

**[Major]** Line 104 — "Tool components emit `tool_start`, `tool_complete` events". **False** as event names; the real mechanism is `trackToolEvent({action:'start'|'complete'})` (Finding 1).

**[Blocker]** Line 107 — "Error boundary components emit `js_error` on catch". **False** — no error boundary component exists in the codebase, and no event named `js_error` exists (Finding 1 and Finding 2).

**[Nit]** Line 103 — "All pages wrapped in `AnalyticsProvider`". Unverifiable from the supplied scope (no `main.tsx`/`App.tsx` provided). `components\Layout.tsx` imports and uses `AnalyticsProvider` (line 46), but full app wrapping is not confirmed.

---

## SUMMARY

The document contains **11 Blocker**, **5 Major**, and **3 Nit** findings. Core categories of failure:
1. The event taxonomy table is largely invented; most listed events do not exist in the code.
2. The error tracking claims (rate limiting, offline queue, breadcrumbs, enrichment, React boundaries) are almost entirely unimplemented.
3. The consent model omits the fourth category (`personalization`), omits `MobileConsent.tsx`, and falsely claims re-consent on preference change.
4. The Analytics Dashboard claims are contradicted by the actual rendered component (no charts, no claimed views).
5. The "17 files" count is wrong (20 files; 16 unmentioned).
6. The "no external analytics dependencies" claim is false (GA4, Clarity, Sentry are live).
7. Privacy compliance claims (90-day retention, purge by session ID, no PII, DNT respected) are contradicted by config values and code behavior.
8. Batching, retry, IndexedDB, and internal API claims are all unimplemented.
9. Integration point claims (SEOHead, booking_submit, tool_start/complete, error boundaries) are factually incorrect.

REPORT COMPLETE