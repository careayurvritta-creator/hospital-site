# EGM-06: Analytics & Measurement System

## Overview
The analytics system spans 17 files in the `analytics/` directory with error tracking, event measurement, consent management, and a full analytics dashboard. The system is designed for privacy compliance (GDPR/DPDP) while providing actionable insights.

## Analytics Architecture

### Data Flow
```
User Interaction → AnalyticsProvider → Consent Gate → Event Dispatcher → Backend API
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
              Analytics Dashboard            Error Tracker
              (internal view)               (sentry-like)
```

### Analytics Provider (`AnalyticsProvider.tsx`)
- Wraps the entire application
- Manages consent state (analytics cookies)
- Provides `track()` function via context
- Respects `doNotTrack` browser setting
- Stores consent decision in localStorage

### Consent Management (`CookieConsent.tsx`)
- GDPR/DPDP-compliant cookie consent banner
- 3 consent categories: Essential, Analytics, Marketing
- Granular toggle per category
- Consent persistence in localStorage
- Re-consent banner on preference change

### Event Tracking System
Events categorized by domain:

| Domain | Events |
|--------|--------|
| Navigation | page_view, nav_click, menu_toggle |
| Engagement | scroll_depth, time_on_page, video_play |
| Conversion | booking_submit, contact_submit, call_click |
| Tools | tool_start, tool_complete, tool_share |
| Blog | post_view, post_share, post_comment |
| Error | js_error, api_error, form_error |

### Error Tracking (`errorTracker.ts`)
- Captures: JS errors, unhandled promise rejections, React component errors
- Enriches with: user agent, URL, timestamp, session ID
- Breadcrumbs: last 5 user actions before error
- Rate limiting: max 10 errors per session
- Offline queue: errors stored when network unavailable

### Analytics Dashboard (`AnalyticsDashboard.tsx`)
- Internal admin view (not publicly accessible)
- Real-time metrics: visitors, page views, conversion rate
- Top pages by traffic
- Tool usage statistics
- Blog performance (top posts by views)
- Error frequency and types
- Time-series charts (7-day, 30-day views)

## Key Metrics Tracked

### Business Metrics
- Appointment booking rate
- Contact form conversion
- Phone call clicks
- Insurance page engagement

### Engagement Metrics
- Scroll depth distribution
- Time on page (avg, median)
- Bounce rate per page
- Return visitor rate

### Tool Metrics
- Tool completion rate per tool
- Average time per tool
- Share rate (social proof generation)
- Results distribution (Prakriti types, dosha imbalances)

### Blog Metrics
- Post views per article
- Category performance
- Read time distribution
- Sharing frequency

## Privacy Compliance
- **GDPR**: Consent required before analytics cookies set
- **DPDP Act 2023**: Data minimization — only event metadata stored
- **CCPA**: Do Not Track signal respected
- **Data retention**: 90-day rolling window for event data
- **Anonymization**: No PII stored in analytics events
- **Right to deletion**: All user data purgeable by session ID

## Technical Implementation
- Analytics events sent to internal API endpoint
- Batching: events queued and sent in 5-second intervals
- Retry logic: failed events retried up to 3 times
- Offline support: events cached in IndexedDB when offline
- No external analytics dependencies (no Google Analytics, no Mixpanel)
- Self-hosted dashboard for data sovereignty

## Integration Points
- All pages wrapped in `AnalyticsProvider`
- Tool components emit `tool_start`, `tool_complete` events
- Booking form emits `booking_submit` on success
- Error boundary components emit `js_error` on catch
- `SEOHead` emits `page_view` on mount (via provider)