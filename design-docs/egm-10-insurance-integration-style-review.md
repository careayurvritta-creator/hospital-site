# EGM-10 Insurance Integration — Style Review

**Document Reviewed**: `egm-10-insurance-integration.md`  
**Review Date**: 2026-11-13  
**Reviewer**: EGM Style Reviewer  
**Review Scope**: Style, clarity, documentation quality, formatting, and actionability

---

## Executive Summary

| Criterion | Score (1–5) | Assessment |
|-----------|-------------|------------|
| **Clarity & Structure** | 3/5 | Sections are logically ordered but the overview blurs client-side OCR and server-side AI analysis; no ToC for a 96-line doc |
| **Completeness** | 2/5 | Omits the doc's best content: the entire error-handling system (45s timeout, 6 branches, TPA fallback, debug panel) is undocumented |
| **Accuracy of Diagrams/Tables** | 1/5 | **Critical mismatch** — component tree invents 7 non-existent components; timeline shows 5 steps, code has 4; partner counts inflated |
| **Actionability** | 1/5 | References a non-existent `analyzePolicy()` API; developers would build FileUploadZone/ClaimSteps/etc. that don't exist |
| **Formatting** | 3/5 | Clean Markdown structure; but code blocks lack language tags and no file:line references appear anywhere |
| **Terminology Consistency** | 3/5 | "CoverageGaps" vs "Gap Analysis" drift; "partner" vs "insurer" used interchangeably |
| **Evidence-Based Claims** | 1/5 | Counts, timelines, document lists, and API names are fabricated — grep confirms several exist only in the doc |
| **Missing Critical Sections** | 2/5 | No error handling, no testing, no security/sanitization accuracy, no performance limits (10MB, 5-page PDF cap) |
| **Overall Usability** | 2/5 | Following this doc produces a different app than the one shipped |

**Overall Style Score: 2.0 / 5** — *Needs rewrite-to-match-codebase before use as implementation reference*

---

## Findings Table

| Severity | Count | Description |
|----------|-------|-------------|
| **Critical** | 4 | Component tree invents 7 non-existent components (FileUploadZone, PolicySummary, CoverageGaps, FilterChips, TimelineStepper, DocumentChecklist, ClaimSteps). Cashless timeline shows 5 steps; code has 4. Partner counts inflated (15+ TPAs vs actual 14; 5+ Gov schemes vs actual 0; 50+ partners vs actual 45). `analyzePolicy()` API doesn't exist — actual method is `analyzeDocument(extractedText, mimeType, prompt)`. |
| **Major** | 6 | Error-handling system entirely omitted (45s timeout, 6 error branches, TPA desk fallback, analytics, debug panel). Reimbursement kit fabricates "12 required documents" and "7–15 working days" (actual: 4 items, "Ready within 24hrs"). Sanitization mechanism described wrong. Drag-drop claimed but not implemented. "Updated quarterly" contradicts dynamic month/year display. No file:line references in entire doc. |
| **Minor** | 6 | Terminology drift ("CoverageGaps" vs "Gap Analysis"). OCR vs AI-analysis conflation in overview. Code blocks lack language tags. No ToC. "Max 10MB" UI text has no size validation and the 5-page PDF extraction cap is undocumented. `URL.createObjectURL` never revoked — cleanup not discussed. |
| **Nit** | 4 | "50+ partners" likely copied from the code's own hardcoded error message (a bad evidence chain). `InsurancePartner` interface fields not documented. FAQ items not enumerated. Companion codebase-details review not linked. |

---

## Specific Style Issues with Line References

### Critical Issues

| Line | Issue | Evidence |
|------|-------|----------|
| 9–31 (component tree) | **Component diagram invents 7 non-existent components** | Tree lists `FileUploadZone`, `PolicySummary`, `CoverageGaps`, `FilterChips`, `TimelineStepper`, `DocumentChecklist`, `ClaimSteps`. Grep across the codebase finds none of these. `Insurance.tsx` is a single 859-line component handling upload (lines 421–430), analysis, timeline (lines 548–553), gap analysis, and reimbursement kit (lines 769–774) inline. |
| ~40–50 (cashless timeline) | **Timeline shows 5 steps; code implements 4** | Doc: Pre-auth, Admission, Treatment, Discharge, Follow-up. Code (`Insurance.tsx` lines 548–553): Admission, Pre-Auth, Approval, Discharge. "Treatment" and "Follow-up" do not exist; "Approval" is missing from the doc. A developer following the doc builds the wrong stepper. |
| ~12 (partner counts) | **Partner counts inflated 2–5×** | Doc claims "15+ TPAs" (actual: 14), "5+ government schemes" (actual: 0 — grep confirms no Ayushman/CGHS/ESIC anywhere in code), "50+ partners" (actual: 45 total = 31 insurers + 14 TPAs in `constants.ts` lines 30–81). "50+" appears only inside the component's own hardcoded error-message strings (lines 209, 240) — the doc copied marketing copy, not data. |
| ~20 (AI integration) | **References `analyzePolicy()` — function does not exist** | Actual API in `lib/aiService.ts` is `analyzeDocument(extractedText, mimeType, prompt)`, called through the Vercel proxy `/api/nvidia` (Nvidia NIM). Grep confirms `analyzePolicy` appears only in the design doc. Any developer wiring the AI layer from this doc hits a compile error on day one. |

### Major Issues

| Line | Issue | Detail |
|------|-------|--------|
| — | **Entire error-handling system omitted** | `Insurance.tsx` lines 128–266 implement: 45-second timeout via `Promise.race`, 6 distinct error branches (timeout, quota/429, extraction failure, service not configured, 504, generic), TPA desk fallback (+91 94266 84047), `captureError` analytics (line 197), and a debug panel (lines 397–411). This is the most robust part of the feature and the doc says nothing about any of it. |
| ~60–70 (reimbursement) | **Reimbursement kit contents fabricated** | Doc claims "12 required documents", "7–15 working days" turnaround, rejection reasons, and per-insurer contacts. Code has 4 checklist items (lines 769–774) and states "Ready within 24hrs" (line 792). No per-insurer contacts exist — `InsurancePartner` (`types.ts` line 53) has only `name`, `logo`, `type`. |
| ~33 (sanitization) | **Sanitization mechanism described incorrectly** | Doc: "strip script tags / HTML allowlist". Actual `sanitizeAndFormat` (lines 15–24): escapes `& < >` to entities, then converts markdown (`**` → `<strong>`, `###` → `<h4>`, `*` → `<li>`). Different threat model, different behavior — the described approach would strip the markdown formatting the feature intentionally renders. |
| ~15 (upload UX) | **Drag-and-drop claimed; not implemented** | Doc's flow assumes drop-zone interaction (`onDrop`). Code has click-to-upload only via a `<label>` (lines 421–430); no drag handlers exist. |
| ~13 (freshness) | **"Updated quarterly" contradicts code** | Code displays the current month/year dynamically (line 748). The doc's claim describes a maintenance cadence that doesn't exist and misleads future maintainers about data staleness. |
| — | **No file:line references anywhere** | Unlike the EGM-09 house standard (which anchors claims to `file:line`), this doc contains zero code references, making every claim unverifiable without re-doing the investigation. |

### Minor Issues

| Line | Issue | Detail |
|------|-------|--------|
| ~45, ~65 | **Terminology drift** | "CoverageGaps" (component name in invented tree) vs "Gap Analysis" (section title) for the same concept; "partner" and "insurer" used interchangeably although `type` distinguishes `'Insurer' | 'TPA'`. Pick one term per concept. |
| 1–8 | **Overview conflates OCR and AI analysis** | Text extraction (client-side pdf.js CDN 3.11.174 / Tesseract.js v5, in `textExtractor.ts`) and analysis (Nvidia NIM via `/api/nvidia` proxy) are two distinct stages with different failure modes; the overview merges them into one "AI reads your policy" step. |
| 9, 31 | **Code blocks lack language tags** | Fenced blocks open with plain ``` instead of `text`/`tsx`. Inconsistent with the rest of the design-doc set. |
| — | **No table of contents** | 96 lines across 8+ sections; a ToC would aid navigation (EGM-09 recommendation applied to its own doc; this one predates it). |
| ~15 | **Upload limits documented only as UI copy** | "Max 10MB" (line 429 of `Insurance.tsx`) is display text with no size validation enforced; PDF extraction silently caps at 5 pages (`textExtractor.ts` line 44). Neither limit is documented — a user uploading an 11MB or 6-page+ PDF gets the generic error branch with no explanation. |
| ~55 | **No cleanup/resource discussion** | `URL.createObjectURL` (line 114) is never revoked — a blob-leak issue worth flagging in the doc's known-limitations; the doc has no such section. |

### Nit Issues

| Line | Issue | Detail |
|------|-------|--------|
| ~12 | **"50+ partners" evidence chain is circular** | The figure traces to the component's own hardcoded error strings (lines 209, 240), not to `constants.ts`. Documenting counts from UI copy instead of data guarantees drift. |
| ~10 | **`InsurancePartner` interface not documented** | Only `name`, `logo`, `type?: 'Insurer' | 'TPA'` exists (`types.ts` line 53) — no network status, cashless acceptance, or contact fields. The doc's claims imply richer data than the schema supports. |
| ~70 | **FAQ not enumerated** | Code has 4 FAQ items (lines 26–43); the doc references "FAQ section" without listing them. |
| — | **Companion review not linked** | The codebase-details review (`egm-10-insurance-integration-codebase-details-review.md`) independently confirms the missing government schemes (its lines 89, 105, 322) and should be cross-referenced, per EGM-09 practice. |

---

## Recommendations for Improving Documentation Quality

### 1. Align Document to Codebase (Critical)
- **Replace the component tree** with an accurate map of the single 859-line `Insurance.tsx`: upload zone (421–430), analysis call + error handling (128–266), debug panel (397–411), timeline (548–553), gap analysis, reimbursement kit (769–774)
- **Fix the timeline** to the actual 4 steps: Admission → Pre-Auth → Approval → Discharge
- **Correct the API surface**: `analyzeDocument(extractedText, mimeType, prompt)` via `/api/nvidia`; delete all `analyzePolicy` references
- **Correct all counts**: 31 insurers, 14 TPAs, 0 government schemes, 45 total — sourced from `constants.ts`, not UI copy

### 2. Add Missing Critical Sections (Major)
| Section | Required Content |
|---------|------------------|
| **Error Handling** | 45s timeout (`Promise.race`), 6 error branches, TPA desk fallback +91 94266 84047, `captureError` analytics, debug panel (397–411) |
| **Upload & Extraction Limits** | 10MB (currently display-only — flag that validation is unenforced), 5-page PDF cap (`textExtractor.ts` line 44), file-type behavior (text files throw "Unsupported file type") |
| **Output Sanitization** | Actual `sanitizeAndFormat` mechanism (entity escaping + markdown conversion, lines 15–24) |
| **Known Limitations** | Blob URL never revoked (line 114), no size validation, fabricated claims to deprecate (per-insurer contacts, 12 documents, quarterly updates) |

### 3. Fix Data Discrepancies (Major)
- **Reimbursement kit**: 4 items, "Ready within 24hrs" — remove the invented 12-document list and 7–15 day window
- **Sanitization**: replace the "strip script tags" description with the real mechanism
- **Upload UX**: remove drag-and-drop or file it under "Future State"
- **Freshness**: replace "Updated quarterly" with "dynamic current-month display" or file the quarterly review as a process commitment, clearly labeled

### 4. Make Document Actionable (Major)
- **Add file:line references** for every behavioral claim (house standard since EGM-09)
- **Document the `InsurancePartner` type** and explicitly state what the schema does *not* support (no cashless/network/contact fields) so future feature requests start from reality
- **Add a ToC** and language-tag the code blocks

### 5. Terminology (Minor)
- **Glossary or single-term policy**: "Gap Analysis" (drop "CoverageGaps"), "Insurer" and "TPA" as distinct terms (never collapse to "partner" in counts)
- **Separate "text extraction" from "AI analysis"** in the overview and all flow descriptions

---

## Suggested Revised Structure

```markdown
# EGM-10: Insurance Integration

## Overview (2–3 paragraphs: what exists today — upload → extract → analyze → display)

## Architecture
### File Structure (Insurance.tsx single-component reality + lib/textExtractor.ts + lib/aiService.ts)
### Data Flow (client OCR → extractedText → analyzeDocument() → /api/nvidia proxy → sanitized render)
### Component Map (Insurance.tsx sections with line references)

## Data Model
### InsurancePartner interface (name, logo, type — and what it doesn't have)
### Partner Counts (31 insurers, 14 TPAs, 45 total; source: constants.ts)
### Government Schemes (none — explicitly noted)

## User Flows (as implemented)
### Upload (click-to-upload; limits: 10MB display-only, 5-page PDF cap)
### Cashless Timeline (4 steps: Admission → Pre-Auth → Approval → Discharge)
### Gap Analysis
### Reimbursement Kit (4 items, "Ready within 24hrs")

## Error Handling
### Timeout, Error Branches, TPA Fallback, Analytics, Debug Panel

## Output Sanitization (sanitizeAndFormat: entity escaping + markdown conversion)

## Known Limitations & Future State
### Blob leak, unenforced size validation, no drag-drop, no per-insurer contacts
### Government scheme integration (RFC if planned)

## Appendix: File Reference Map
```

---

## Conclusion

This document currently **describes an aspirational system that does not exist in the codebase**. A developer following it would:

1. Create 7 components that don't exist and aren't needed (monolithic `Insurance.tsx` already covers all flows)
2. Call `analyzePolicy()` (compile error; real method is `analyzeDocument`)
3. Build a 5-step timeline (code ships 4 steps)
4. Enrich partner data with fields the `InsurancePartner` schema doesn't support
5. Write "12 required documents" and "7–15 working days" into the reimbursement kit (code says 4 items, 24hrs)
6. Miss the error-handling, timeout, fallback, and debug infrastructure entirely — the feature's actual engineering substance

The most damning evidence is the grep result: `analyzePolicy`, Ayushman/CGHS/ESIC, and every invented component name exist **only in this document**, not in the codebase. The "50+ partners" figure was evidently transcribed from the app's own marketing error copy rather than from `constants.ts` — a cautionary example of evidence-by-copy-paste.

**Recommendation**: Treat this as a **design proposal / RFC**, not an implementation reference. Either:
- **Option A**: Rewrite to match current codebase (recommended — the implemented feature is substantial and its real behavior, especially error handling, is worth documenting accurately)
- **Option B**: Keep as RFC with clear "Future State" labeling and create migration tickets for the 7 invented components, `analyzePolicy` API, and government-scheme integration

The codebase details review (`egm-10-insurance-integration-codebase-details-review.md`) should be linked as a companion document for any developer working on this system.
