# EGM-10: Insurance Integration Architecture

## Overview
The Insurance page (`Insurance.tsx`, 816 lines) is the most feature-rich page in the application, combining a 50+ partner network display, AI-powered policy document analysis, cashless journey timeline, and reimbursement guidance. It integrates with Nvidia NIM for OCR and policy understanding.

## Architecture

### Component Structure
```
Insurance.tsx (816 lines)
├─ HeroSection — Hospital insurance overview
├─ AI Policy Analyzer
│   ├─ FileUploadZone (drag-drop)
│   │   └─ extractTextFromFile() → OCR pipeline
│   ├─ PolicySummary (AI-generated)
│   │   └─ sanitizeAndFormat() → safe HTML
│   └─ CoverageGaps (AI-identified)
├─ PartnerNetwork
│   ├─ Insurers (30+)
│   ├─ TPAs (15+)
│   └─ FilterChips (by type, network status)
├─ CashlessJourney
│   └─ TimelineStepper (5 steps)
├─ ReimbursementKit
│   ├─ DocumentChecklist
│   └─ ClaimSteps
└─ FAQSection (insurance-specific)
```

### AI Policy Analysis Pipeline
```
User uploads policy document (PDF/Image)
        │
        ▼
extractTextFromFile() — client-side OCR
  ├─ PDF: text extraction via pdf.js
  ├─ Image: Tesseract.js OCR
  └─ Text: direct use
        │
        ▼
aiService.analyzePolicy() — Nvidia NIM
  ├─ Extract: coverage limits, exclusions, waiting periods
  ├─ Identify: network hospitals, claim process
  └─ Flag: coverage gaps vs. Ayurvedic treatments
        │
        ▼
sanitizeAndFormat() — safe HTML rendering
  ├─ Strip: script tags, event handlers
  ├─ Allow: strong, h4, li (limited set)
  └─ Escape: all other HTML entities
        │
        ▼
PolicySummary + CoverageGaps display
```

## Partner Network

### Data Structure
- **30+ Insurance Companies**: Life, health, general, standalone health insurers
- **15+ TPAs**: Third-party administrators for claim processing
- **5+ Government Schemes**: Ayushman Bharat, CGHS, ESIC, state schemes
- Each partner: name, logo, network status, cashless acceptance, contact

### Filter System
- By type: Insurer, TPA, Government Scheme
- By network: In-network, Out-of-network, Pending verification
- By cashless: Cashless accepted, Reimbursement only
- Search: Name-based filtering

## Cashless Journey
5-step timeline:
1. **Pre-auth**: Submit policy + treatment plan → insurer approval
2. **Admission**: Hospital verifies pre-auth, admits patient
3. **Treatment**: Ayurvedic therapies delivered
4. **Discharge**: Hospital bills insurer directly (no patient payment)
5. **Follow-up**: Post-treatment claim closure

## Reimbursement Kit
For non-cashless cases:
- Document checklist (12 required documents)
- Step-by-step claim filing guide
- Typical processing time (7-15 working days)
- Common rejection reasons + how to avoid
- Contact information for each insurer

## AI Integration
- **OCR**: Client-side text extraction (no server upload needed)
- **Policy Understanding**: Nvidia NIM extracts structured data from unstructured policy text
- **Gap Analysis**: Compares policy coverage against Ayurvedic treatment requirements
- **Language**: All AI output rendered as sanitized HTML (XSS prevention)

## Compliance
- Insurance advice: Educational only, not financial advice
- Partner listings: Updated quarterly, removed if contract ends
- Disclaimers: "Coverage subject to policy terms and conditions"
- No guarantee: "We cannot guarantee insurance approval for any treatment"