# Ayurvritta Website Optimization Plan

## Overview
- Apply comprehensive code cleanup, SEO optimization, and visibility practices (Google + AI) across the entire Ayurvritta Ayurveda Hospital website while maintaining all existing functionality

## Constraints & Preferences
- No changes to current website functionality or visual design
- Must pass build without errors after each change
- Use TypeScript best practices to replace `any` types
- Implement comprehensive SEO, Google Search, and AI visibility (ChatGPT, Perplexity, etc.)
- Keep all current UI/UX enhancements intact

---

## Phase 1: Code Cleanup & Best Practices

### 1.1 Create Centralized Types
Create `types/index.ts` with the following interfaces:
- `MedaResult` - for Meda assessment tool results
- `PrakritiResult` - for Prakriti analysis results
- `ChartData` - for data visualization charts
- `DietPlan` - for diet generator outputs
- Extend existing types from `types.ts`

### 1.2 Replace All `any` Type Usages
- 31 `any` type usages found across 13 files
- Files with `any` types (identified previously):
  - Tool components (MedaTool, PrakritiTool, LifestyleTool, etc.)
  - Other components with implicit any

### 1.3 Remove Console Statements
- Remove `console.log` from `ExitIntentPopup.tsx`
- Remove `console.log` from `ShareResults.tsx`

### 1.4 Fix TypeScript Ignores
- Fix `@ts-ignore` in `Layout.tsx` line 327

---

## Phase 2: SEO Enhancement

### 2.1 Add Missing Meta Tags
Add to `index.html`:
- `<meta name="author" content="Ayurvritta Ayurveda Hospital">`
- `<meta name="keywords" content="Ayurveda, Ayurvedic treatment, Panchakarma, Kerala Ayurveda, traditional medicine, wellness">`
- `<meta name="geo.position" content="...">` (coordinates of hospital)

### 2.2 Create OG Images
- Create OG image at 1200x630px for social sharing
- Include in all major pages

### 2.3 Enhance Schema Markup
Add new schemas:
- `BreadcrumbList` - for all pages
- `Organization` - for hospital entity
- `Physician` - for Ayurvedic doctors
- Enhanced `FAQPage` schema with more Q&As

---

## Phase 3: Google Visibility

### 3.1 Google Search Console
- Add GSC verification meta tag
- Submit sitemap

### 3.2 Analytics Enhancement
- Replace GA4 placeholder `G-XXXXXXXXXX` with real ID
- Replace Microsoft Clarity placeholder `XXXXXXXXXX` with real ID

### 3.3 LocalBusiness Schema Enhancement
- Add `openingHours` specification
- Add `review` aggregation
- Add `priceRange` specification

### 3.4 Sitemap Updates
- Update `public/sitemap.xml` with accurate lastmod dates
- Ensure all 15+ URLs are current

---

## Phase 4: AI Visibility (ChatGPT, Perplexity, etc.)

### 4.1 FAQ Schema Expansion
- Expand FAQ schema to 20+ Q&As
- Cover common questions about:
  - Ayurveda treatments
  - Panchakarma procedures
  - Prakriti analysis
  - Diet and lifestyle
  - Booking and consultation

### 4.2 HowTo Schema
- Add HowTo schemas for major treatments:
  - How to prepare for Panchakarma
  - How to maintain Prakriti balance
  - How to follow Ayurvedic diet

### 4.3 MedicalWebPage Schema
- Add comprehensive MedicalWebPage schema
- Include medical audience and purpose specifications

### 4.4 Content Optimization for AI
- Use clear Q&A format
- Add entity-based content (medical terms, treatment names)
- Ensure structured data is complete and accurate

---

## Phase 5: Routing Migration (Critical SEO Fix)

### 5.1 Hash to History Routing
- Migrate from HashRouter (`#/` URLs) to BrowserRouter (`/`)
- Update `App.tsx`
- Ensure all internal links work correctly
- Update server configuration for SPA fallback

---

## Current Status

### Completed
- Enhanced Tools page with 6 tools
- Enhanced Programs page
- Fixed build errors
- Comprehensive plan created

### In Progress
- Phase 1: Code Cleanup (started)

### Blocked
- None

---

## Files Requiring Changes

### Types
- `types.ts` - existing types
- `types/index.ts` - new centralized types (CREATE)

### Tool Components (any types)
- `components/tools/MedaTool.tsx`
- `components/tools/PrakritiTool.tsx`
- `components/tools/LifestyleTool.tsx`
- `components/tools/SaaraTool.tsx`
- `components/tools/PanchakarmaTool.tsx`
- `components/tools/DietGenerator.tsx`

### Other Components (any types + console.log)
- `components/ExitIntentPopup.tsx` - console.log
- `components/ShareResults.tsx` - console.log
- `components/Layout.tsx` - @ts-ignore

### SEO Files
- `index.html` - meta tags, verification
- `components/SEOHead.tsx` - enhanced schemas
- `seo.ts` - page configurations

### Routing
- `App.tsx` - HashRouter → BrowserRouter

---

## Build Command
```bash
cd "E:\ayurvritta-ayurveda-hospital"
& "F:\nodejs\node.exe" "./node_modules/vite/bin/vite.js" build
```

---

## Verification Checklist
- [ ] Build passes without errors
- [ ] No `any` types remaining (except truly necessary)
- [ ] No console.log statements in production code
- [ ] No @ts-ignore directives
- [ ] All type definitions properly exported
- [ ] All components still function correctly