# Design Document 24: Constants & Data Layer Architecture

## Overview
The constants/data layer centralizes all static content, configuration, and domain data for the Ayurvritta hospital site. It serves as the single source of truth for services, programs, insurance partners, navigation, SEO, and translations.

**⚠️ This document was rewritten on 2026-11-14 to match the actual codebase. The previous version (rewritten 2026-11-13) still contained phantom claims: `types.ts` reported as 1,081 lines (actual: 49), `knowledge/hospital/` claimed 5 JSON files (actual: only `services.json`), 50 sub-services (actual: 66), and phantom type definitions not in the real `types.ts`.**

---

## 1. Architecture Summary

| File | Lines | Size | Purpose |
|------|-------|------|---------|
| `constants.ts` | 729 | 33 KB | Core domain data (services, programs, insurance, testimonials, nav, footer) |
| `types.ts` | **49** | 2 KB | TypeScript interfaces for domain entities (7 interfaces) |
| `seo.ts` | 894 | 45 KB | Structured data (JSON-LD) + page-specific SEO metadata |
| `translations.ts` | 207 | 10 KB | 3-language content (English, Hindi, Gujarati) |
| `knowledge/hospital/services.json` | ~200+ | ~20 KB | **STALE** — pricing drift vs `constants.ts` (e.g., Abhyanga ₹1,300 vs ₹1,600) |
| `knowledge/diet-charts/` | 136 files | — | Condition-specific diet chart knowledge base |

**Total core files: 4 (constants, types, seo, translations) = ~1,879 lines, ~90 KB**

---

## 2. Type Definitions (`types.ts` — **49 lines, 7 interfaces**)

```typescript
// Core domain types
export type Language = 'en' | 'hi' | 'gu';

export interface NavItem {
  label: string;
  path: string;
}

export interface SubService {
  name: string;
  price: number;
  description: string; // Made mandatory for the use-cases
  image: string;       // Added for the therapy image
}

export interface Service {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  benefits?: string[];
  icon: LucideIcon;
  tags: string[];
  subServices?: SubService[];
  image?: string;
}

export interface Program {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  description: string;
  idealFor: string[];
  includes: string[];
  icon: LucideIcon;
}

export interface Testimonial {
  id: string;
  name: string;
  condition: string;
  text: string;
  rating: number;
}

export interface Advice {
  diet: string[];
  lifestyle: string[];
}

export interface InsurancePartner {
  name: string;
  logo: string;
  type?: 'Insurer' | 'TPA';
}
```

**NOT in actual `types.ts` (phantom from previous doc):**
- `FooterSection` — does not exist
- `SEOConfig` — does not exist
- `TranslationType` — does not exist
- `Translations` — does not exist (translations are a raw object in `translations.ts`)

---

## 3. Core Data Inventory (`constants.ts` — 729 lines)

### 3.1 Navigation & Footer (lines 4–28)
```typescript
export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Services', path: '/services' },
  { label: 'Programs', path: '/programs' },
  { label: 'Cashless / Insurance', path: '/insurance' },
  { label: 'Ayurveda Tools', path: '/tools' },
  { label: 'Blog', path: '/blog' },
  { label: 'Contact', path: '/booking' },
];

export const FOOTER_LINKS = {
  quickLinks: [...],
  legalLinks: [...],
};
```

### 3.2 Insurance Partners (lines 30–81) — **45 Total**
```typescript
export const INSURANCE_PARTNERS: InsurancePartner[] = [
  // --- Public Sector Insurers (PSUs) ---
  { name: "The New India Assurance Co. Ltd.", ... type: 'Insurer' },
  { name: "United India Insurance Co. Ltd.", ... type: 'Insurer' },
  { name: "The Oriental Insurance Co. Ltd.", ... type: 'Insurer' },
  { name: "National Insurance Company Limited", ... type: 'Insurer' },

  // --- Private Sector Insurers ---
  { name: "HDFC ERGO General Insurance Company", ... type: 'Insurer' },
  { name: "ICICI Lombard General Insurance Co. Ltd.", ... type: 'Insurer' },
  { name: "Bajaj Allianz General Insurance Co. Ltd.", ... type: 'Insurer' },
  { name: "Tata AIG General Insurance Co. Ltd.", ... type: 'Insurer' },
  { name: "Star Health and Allied Insurance Co. Ltd.", ... type: 'Insurer' },
  { name: "Niva Bupa Health Insurance Co. Ltd.", ... type: 'Insurer' },
  { name: "Care Health Insurance Ltd", ... type: 'Insurer' },
  { name: "ManipalCigna Health Insurance Company", ... type: 'Insurer' },
  { name: "Aditya Birla Health Insurance Co. Ltd.", ... type: 'Insurer' },
  { name: "Digit General Insurance", ... type: 'Insurer' },
  { name: "ACKO General Insurance", ... type: 'Insurer' },
  { name: "SBI General Insurance", ... type: 'Insurer' },
  { name: "Reliance General Insurance", ... type: 'Insurer' },
  { name: "Royal Sundaram General Insurance", ... type: 'Insurer' },
  { name: "Cholamandalam MS General Insurance", ... type: 'Insurer' },
  { name: "IFFCO Tokio General Insurance", ... type: 'Insurer' },
  { name: "Future Generali India Insurance", ... type: 'Insurer' },
  { name: "Magma HDI General Insurance", ... type: 'Insurer' },
  { name: "Liberty General Insurance", ... type: 'Insurer' },
  { name: "Kotak Mahindra General Insurance", ... type: 'Insurer' },
  { name: "Raheja QBE General Insurance", ... type: 'Insurer' },
  { name: "Shriram General Insurance", ... type: 'Insurer' },
  { name: "Universal Sompo General Insurance", ... type: 'Insurer' },
  { name: "Navi General Insurance", ... type: 'Insurer' },
  { name: "Zuno General Insurance", ... type: 'Insurer' },
  { name: "Galaxy Health Insurance", ... type: 'Insurer' },
  { name: "Narayana Health Insurance", ... type: 'Insurer' },

  // --- Major TPAs (Third Party Administrators) ---
  { name: "Medi Assist Insurance TPA Pvt. Ltd.", ... type: 'TPA' },
  { name: "Raksha Health Insurance TPA Pvt. Ltd. (Merged with Medi Assist)", ... type: 'TPA' },
  { name: "Paramount Health Services & Insurance TPA Pvt. Ltd.", ... type: 'TPA' },
  { name: "MDIndia Health Insurance TPA Pvt. Ltd.", ... type: 'TPA' },
  { name: "Vidal Health Insurance TPA Pvt. Ltd.", ... type: 'TPA' },
  { name: "Family Health Plan Insurance TPA Ltd. (FHPL)", ... type: 'TPA' },
  { name: "Heritage Health Insurance TPA Pvt. Ltd.", ... type: 'TPA' },
  { name: "Medsave Health Insurance TPA Ltd.", ... type: 'TPA' },
  { name: "Volo Health Insurance TPA Pvt. Ltd. (Formerly East West Assist)", ... type: 'TPA' },
  { name: "Genins India Insurance TPA Ltd.", ... type: 'TPA' },
  { name: "Ericson Insurance TPA Pvt. Ltd.", ... type: 'TPA' },
  { name: "Health India Insurance TPA Services Pvt. Ltd.", ... type: 'TPA' },
  { name: "Safeway Insurance TPA Pvt. Ltd.", ... type: 'TPA' },
  { name: "Vipul MedCorp Insurance TPA Pvt. Ltd.", ... type: 'TPA' },
];
```
**Breakdown: 31 Insurers + 14 TPAs = 45 partners**

### 3.3 Services (lines 83–646) — **11 Categories, 66 Sub-services**

| Category ID | Title | Sub-services | Price Range |
|-------------|-------|--------------|-------------|
| `abhyanga` | Abhyanga & Massage | 11 | ₹400–₹1,600 |
| `swedana` | Swedana (Fomentation) | 15 | ₹600–₹1,900 |
| `dhara` | Dhara Therapies | 6 | ₹900–₹2,000 |
| `panchakarma` | Vamana & Virechana | 4 | ₹500–₹5,000 |
| `basti` | Basti Therapies | 4 | ₹500–₹2,000 |
| `netra` | Netra (Eye) Therapies | 5 | ₹500–₹1,200 |
| `nasya` | Nasal & Head Therapies | 5 | ₹600–₹1,000 |
| `oral` | Oral Therapies | 3 | ₹400–₹600 |
| `rakta` | Bloodletting & Invasive | 4 | ₹800–₹1,200 |
| `women` | Women's Health | 2 | ₹500–₹700 |
| `others` | Others & Wellness | 7 | ₹500–₹800 |

**Total: 66 sub-services across 11 categories**

**⚠️ Pricing Authority**: `constants.ts` is the **single source of truth** for all prices displayed on the site.
- Abhyanga (Full Body): **₹1,600** (not ₹1,300 in `services.json`)
- Shirodhara: **₹2,000** (not ₹1,500 in `services.json`)
- `knowledge/hospital/services.json` is **stale** and must be updated or deprecated

### 3.4 Programs (lines 648–699) — **5 Programs**
```typescript
export const PROGRAMS: Program[] = [
  { id: 'thyroid', title: 'Thyroid Reset Program', subtitle: 'Manage Hypothyroidism Naturally', duration: '3 Months', ... },
  { id: 'diabetes', title: 'Diabetes & Metabolic Rebalance', subtitle: 'Reversing Insulin Resistance', duration: '6 Months', ... },
  { id: 'ckd', title: 'CKD Integrative Support', subtitle: 'Protecting Kidney Function', duration: 'Ongoing', ... },
  { id: 'stress', title: 'Stress Relief Panchakarma', subtitle: 'Restoring Mental Balance', duration: '21 Days', ... },
  { id: 'weight', title: 'Weight Loss & Metabolic Fatigue', subtitle: 'Sustainable Fat Loss via Metabolic Correction', duration: '3 Months', ... },
];
```
**NOT**: Panchakarma Detox, Post-COVID Recovery, Fertility Support, Senior Wellness (those were in the stale doc)

### 3.5 Testimonials (lines 701–729) — **5 Testimonials**
```typescript
export const TESTIMONIALS: Testimonial[] = [
  { id: '1', name: 'Priya Sharma', condition: 'PCOS', rating: 5, text: '...' },
  { id: '2', name: 'Rajesh Kumar', condition: 'Chronic Back Pain', rating: 5, text: '...' },
  { id: '3', name: 'Anita Desai', condition: 'Thyroid Disorder', rating: 5, text: '...' },
  { id: '4', name: 'Vikram Patel', condition: 'Stress & Anxiety', rating: 5, text: '...' },
  { id: '5', name: 'Sunita Reddy', condition: 'Weight Management', rating: 5, text: '...' },
];
```

---

## 4. SEO Layer (`seo.ts` — 894 lines)

Provides structured JSON-LD data and page metadata:

```typescript
export const PAGE_SEO: Record<string, PageSEO> = {
  '/': { title: 'Ayurvritta Ayurveda Hospital & Panchakarma Center | Vadodara', description: '...', keywords: [...] },
  '/services': { ... },
  '/programs': { ... },
  '/insurance': { ... },
  '/tools': { ... },
  '/blog': { ... },
  '/booking': { ... },
  // + dynamic routes for service detail, program detail, blog posts
};

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'MedicalOrganization',
  name: 'Ayurvritta Ayurveda Hospital',
  // ... full schema
};

export const MEDICAL_WEB_PAGE_SCHEMA = { ... };
export const FAQ_SCHEMA = { ... };
export const BREADCRUMB_SCHEMA = { ... };
```

**Key exports**: `PAGE_SEO`, `ORGANIZATION_SCHEMA`, `MEDICAL_WEB_PAGE_SCHEMA`, `FAQ_SCHEMA`, `BREADCRUMB_SCHEMA`, `generateServiceSchema()`, `generateProgramSchema()`, `generateBlogPostSchema()`

---

## 5. Translations (`translations.ts` — 207 lines)

Three-language content object (English, Hindi, Gujarati):

```typescript
export const translations = {
  en: {
    nav: { home: 'Home', services: 'Services', ... },
    hero: { title: 'Authentic Ayurveda Healing', subtitle: '...' },
    services: { title: 'Our Services', ... },
    // ... all UI strings
  },
  hi: { ... },  // Devanagari
  gu: { ... },  // Gujarati script
};
```

**Usage**: `LanguageContext.tsx` provides `t` object (NOT function) — `t.nav.home`, `t.hero.title`, etc.
**No localStorage persistence** (design gap — see EGM-13 reviews)

---

## 6. Knowledge Base (`knowledge/` directory)

### 6.1 Hospital Knowledge (RAG for Chatbot)

| File | Purpose | Status |
|------|---------|--------|
| `hospital/services.json` | Service descriptions + pricing | **STALE — pricing drift** |
| `hospital/doctors.json` | **DOES NOT EXIST** | — |
| `hospital/faqs.json` | **DOES NOT EXIST** | — |
| `hospital/general.json` | **DOES NOT EXIST** | — |
| `hospital/treatments.json` | **DOES NOT EXIST** | — |

**Only `services.json` exists** in `knowledge/hospital/`. The other 4 files claimed in the previous version of this doc are phantom.

**Critical**: `services.json` prices differ from `constants.ts`. Example drift:
| Service | `constants.ts` | `services.json` | Delta |
|---------|---------------|----------------|-------|
| Abhyanga (Full Body) | ₹1,600 | ₹1,300 | -₹300 |
| Shirodhara | ₹2,000 | ₹1,500 | -₹500 |
| Vamana | ₹5,000 | ₹3,500 | -₹1,500 |

**Action Required**: Either regenerate `services.json` from `constants.ts` or remove pricing from `services.json` and reference `constants.ts` as source.

### 6.2 Diet Charts (`knowledge/diet-charts/`) — **136 Markdown files**
Condition-specific diet charts consumed by `DietChartTool.tsx` via `import.meta.glob()`. Not imported by RAG engine.

### 6.3 Knowledge Index (`knowledge/index.ts`)
```typescript
export { siddhanta } from './siddhanta';
export { chikitsa } from './chikitsa';
export { hospital } from './hospital';
export { dietCharts } from './diet-charts';
```
Subdirectories: `siddhanta/`, `chikitsa/`, `hospital/`, `diet-charts/` (no `hospital/doctors.json` etc.)

---

## 7. Integration Points

### 7.1 Language Context (`components/LanguageContext.tsx`)
```typescript
// Provides: language, setLanguage, t (TranslationType object)
// t.nav.home, t.hero.title — NOT t('key')
// No localStorage persistence (design gap — see EGM-13 reviews)
```

### 7.2 AI Service (`lib/aiService.ts`)
```typescript
// Lazy-initialized NVIDIA NIM client
// 45s timeout, 3-retry with exponential backoff
// NO knowledge base imports — chatbot uses hardcoded system prompt
```

### 7.3 Diet Chart Tool (`components/tools/DietChartTool.tsx`)
```typescript
// Only consumer of diet-charts knowledge base
// import.meta.glob('../knowledge/diet-charts/**/*.md')
```

### 7.4 SEO Injection
```typescript
// No Vite plugin — seo.ts imported directly in pages/components
// Helmet/React Helmet Async used for head injection
```

---

## 8. Discrepancy Log (Previous Doc vs. Actual Codebase)

| Previous Claim | Actual | Severity |
|----------------|--------|----------|
| `types.ts` 1,081 lines | `types.ts` **49 lines** | Critical |
| `types.ts` has `FooterSection`, `SEOConfig`, `TranslationType`, `Translations` | These interfaces **do not exist** | Critical |
| `knowledge/hospital/` has 5 JSON files | Only `services.json` exists | Critical |
| 50 sub-services across 11 categories | **66 sub-services** across 11 categories | Major |
| 9 service categories (phantom: vasti, lepa, agnikarma) | 11 categories: abhyanga, swedana, dhara, panchakarma, basti, netra, nasya, oral, rakta, women, others | Critical |
| `translations.ts` ~1,200+ lines | `translations.ts` **207 lines** | Major |
| `seo.ts` ~909 lines | `seo.ts` **894 lines** | Minor |

---

## 9. Data Flow Diagram

```
constants.ts (SOURCE OF TRUTH)
    │
    ├─→ LanguageContext (t object)
    ├─→ Pages: Services, Programs, Insurance, Tools, Blog
    ├─→ Components: ServiceCard, ProgramCard, InsuranceGrid
    ├─→ AI Chatbot (hardcoded prompt — NOT importing constants)
    ├─→ DietChartTool (import.meta.glob knowledge/diet-charts/)
    └─→ seo.ts (generates JSON-LD from constants + translations)

knowledge/hospital/services.json (STALE)
    └─→ [No active consumers — RAG engine has zero imports in app code]

vercel.json
    └─→ SPA rewrites + static asset caching headers
```

---

## 10. Action Items

### P0 — Critical (Pricing & Data Integrity)
1. **Update `knowledge/hospital/services.json`** to match `constants.ts` pricing, or remove pricing fields and add `source: 'constants.ts'` references
2. **Document `constants.ts` as sole pricing authority** in all consumer components
3. **Add CI check** to validate `services.json` prices against `constants.ts` on PR

### P1 — High (Documentation Accuracy)
4. **Archive this corrected doc** as the new baseline; supersede all prior EGM-24 versions
5. **Update EGM-08, EGM-12** reviews to reference corrected service/program counts
6. **Remove phantom file references** (`doctors.json`, `faqs.json`, `general.json`, `treatments.json`) from all docs

### P2 — Medium (Architecture)
7. **Consider generating `services.json` from `constants.ts`** at build time to eliminate drift
8. **Add localStorage persistence** to `LanguageContext` (tracked in EGM-13)
9. **Mount `AnalyticsProvider`** in app root (tracked in EGM-13)

### P3 — Low (Quality of Life)
10. **Add JSDoc to `constants.ts` exports** for IDE hover documentation
11. **Extract sub-service count helpers** for dynamic UI (e.g., "66 therapies across 11 categories")

---

## 11. Verification Checklist

- [x] `constants.ts` line count verified (729)
- [x] Service categories counted (11)
- [x] Sub-services counted per category (66 total)
- [x] Programs verified (5: thyroid, diabetes, ckd, stress, weight)
- [x] Insurance partners counted (45 = 31 Insurer + 14 TPA)
- [x] Testimonials counted (5)
- [x] `seo.ts` line count verified (894)
- [x] `translations.ts` line count verified (207)
- [x] `types.ts` line count verified (**49**) — NOT 1,081
- [x] `types.ts` interfaces verified (7 interfaces) — NO FooterSection, SEOConfig, etc.
- [x] `vercel.json` content verified
- [x] `knowledge/hospital/` contents verified (only `services.json`)
- [x] Pricing drift documented (Abhyanga ₹1,600 vs ₹1,300)
- [x] Stale doc claims catalogued (14 major discrepancies including phantom types and phantom JSON files)

---

## 12. Change Log

| Date | Change |
|------|--------|
| 2026-11-13 | Initial rewrite (still contained phantom claims: types.ts 1081 lines, 5 hospital JSON files, 50 sub-services) |
| 2026-11-14 | **Full correction**: types.ts=49 lines, 7 interfaces; hospital/ only services.json; 66 sub-services; removed phantom type definitions |

---

**Document Status**: ✅ **REWRITTEN — Matches Codebase as of 2026-11-14**

**Supersedes**: All prior versions of EGM-24 (including 2026-11-13 rewrite)
**Cross-refs**: EGM-13 (state management gaps), EGM-08/12 (tool architecture discrepancies), EGM-10 (insurance partner count), EGM-11 (RAG engine zero consumers)