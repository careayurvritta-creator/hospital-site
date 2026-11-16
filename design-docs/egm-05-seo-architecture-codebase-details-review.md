# EGM-05 SEO & Structured Data — Codebase Details Review

**Review Date:** 2026-11-13  
**Reviewer:** egm-codebase-details  
**Source Document:** `design-docs/egm-05-seo-architecture.md`  
**Codebase Root:** `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site\`

---

## 1. Summary of Alignment

| Category | Status | Notes |
|----------|--------|-------|
| Structured Data Blocks | ✅ **Green** | 10 schemas defined (doc says 8, code has 10) |
| Page-Specific SEO | ✅ **Green** | 11 PAGE_SEO entries (doc says 10 routes) |
| SEOHead Component | ✅ **Green** | Comprehensive implementation |
| Keyword Strategy | ✅ **Green** | Keywords in PAGE_SEO entries |
| Technical Implementation | ✅ **Green** | Centralized in seo.ts, JSON-LD injection |
| Integration Points | ✅ **Green** | SEOHead in root Layout, per-page props |
| BlogPosting Schema | ✅ **Extra** | Not in doc but implemented |
| Skin Care FAQ Schema | ✅ **Extra** | 24 FAQs (doc says 8) |

---

## 2. Critical Discrepancies (P0)

### Structured Data Count Mismatch

| Design Doc | Actual seo.ts |
|------------|---------------|
| "8 structured data blocks" (line 4) | **10 schemas exported** |
| MedicalBusiness (1) | ✅ HOSPITAL_SCHEMA |
| FAQPage (1) | ✅ FAQ_SCHEMA + SKIN_CARE_FAQ_SCHEMA (2) |
| Organization (1) | ✅ ORGANIZATION_SCHEMA |
| Physician (1) | ✅ PHYSICIAN_SCHEMA |
| BreadcrumbList (1) | ✅ BREADCRUMB_SCHEMA (function) |
| HowTo Blocks (3) | ✅ HOWTO_PANCHAKARMA, HOWTO_PRAKRITI, HOWTO_DIET (3) |
| MedicalWebPage (1) | ✅ MEDICAL_WEBPAGE_SCHEMA |
| **Total claimed: 8** | **Total actual: 10** |

### Page-Specific SEO Count Mismatch

| Design Doc (lines 54-66) | Actual PAGE_SEO |
|--------------------------|-----------------|
| 10 routes listed | **11 entries** |
| `/skin-care` route | **Key: `ayurveda-skin-care`** |
| `/contact` route | **Missing from PAGE_SEO** |
| `/tools` route | ✅ Present |
| `/privacy`, `/terms` | ✅ Present |

### BlogPosting Schema Not Documented

- **Implemented** in SEOHead lines 206-232
- Dynamically generated from blog post data
- Includes author, publisher, datePublished, mainEntityOfPage
- **Not mentioned** in design doc

### Skin Care FAQ Schema Scale

| Design Doc | Actual |
|------------|--------|
| "8 FAQ pairs" (line 27) | **24 FAQ pairs** (lines 84-248) |
| Generic FAQ | Skin-care specific, mirrors SkinCare.tsx content |

---

## 3. Claims in Doc Not Reflected in Code

| Claim | Status |
|-------|--------|
| "8 structured data blocks" | False — 10 schemas |
| "page-specific metadata for 10 routes" | False — 11 PAGE_SEO entries |
| "FAQPage: 8 FAQ pairs" | False — 24 FAQs in FAQ_SCHEMA + 24 in SKIN_CARE_FAQ_SCHEMA |
| "/contact" route in SEO table | False — no PAGE_SEO entry for contact |
| "/skin-care" route key | False — uses `ayurveda-skin-care` |

---

## 4. Code Patterns Not Documented

### 1. Dynamic BlogPosting Schema (SEOHead.tsx lines 206-232)
```typescript
if (activePost) {
  // Creates BlogPosting schema with:
  // - headline, description, image
  // - author (Person with name)
  // - publisher (Organization with logo)
  // - datePublished
  // - mainEntityOfPage
}
```

### 2. Unknown Blog Post Handling (SEOHead.tsx lines 57-61)
```typescript
if (isUnknownPost) {
  finalTitle = 'Article Not Found | Ayurvritta Ayurveda Hospital';
  finalDescription = 'The requested article could not be found...';
  // Sets robots: noindex,nofollow
}
```

### 3. Path-Based Schema Injection Logic (SEOHead.tsx lines 131-232)
- Hospital/MedicalBusiness + Organization + MedicalWebPage on **ALL pages**
- Physician on `/`, `/about`, `/booking`
- Breadcrumb on all except `/`
- HowTo Panchakarma on `/services/panchakarma`, `/services`
- HowTo Prakriti + Diet on `/tools`
- FAQ on `/`, `/booking`
- Skin Care FAQ on `/ayurveda-skin-care`
- BlogPosting on blog detail pages

### 4. SEOHead in Root Layout (App.tsx line 30)
```tsx
<BrowserRouter>
  <SEOHead />  {/* Single instance at root */}
  <Layout>...
```
- Manages all head tags via `useEffect` + DOM manipulation
- Returns `null` — no DOM output
- Reacts to `location.pathname` changes

### 5. Page Key Resolution (SEOHead.tsx lines 30-38)
```typescript
const getPageKey = () => {
  const path = location.pathname.replace('/', '') || 'home';
  if (path.startsWith('services/')) return 'services';
  if (path.startsWith('blog/')) return 'blog';
  return path;
};
```
- Handles dynamic routes: `/services/:id` → `services`, `/blog/:slug` → `blog`
- Falls back to `home`

### 6. 24-Question Skin Care FAQ (seo.ts lines 84-248)
- Mirrors visible FAQs in `pages/SkinCare.tsx`
- Covers: RSBK formulations, Raktamokshana, steroids, Panchakarma duration, fungal infections, Viruddha Ahara, cystic acne, pediatric, gut-skin axis, Vitiligo, herbo-mineral safety, blood tests, consultation cost, in-house oils, symptom timeline, appointment, stress, online consult, Vamana precautions, maintenance protocols

### 7. 35-Question General FAQ (seo.ts lines 332-568)
- Covers: Panchakarma, Diabetes, duration, insurance (4 Qs), conditions, Prakriti, Thyroid, Shirodhara vs Abhyanga, CKD, first consultation, side effects, weight loss, Basti, PCOD, cost (2 Qs), 24/7, booking, diet, longevity, differentiators, Thyroid (2), PCOD (2), CKD safety, weight loss effectiveness, online consult

### 8. AggregateRating in Hospital Schema (seo.ts lines 324-328)
```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.8",
  "ratingCount": "247",
  "bestRating": "5"
}
```
- Hardcoded values — should be dynamic from reviews

### 9. MedicalWebPage Schema with talkAbout (seo.ts lines 837-907)
- Comprehensive page-level schema
- `talkAbout` array with 12 medical topics
- `specialty` array with 3 MedicalSpecialty types
- `medicalAudience` + `physician` references

---

## 5. Component/Schema Counts

| Metric | Design Doc | Actual |
|--------|------------|--------|
| Structured Data Blocks | 8 | **10** |
| PAGE_SEO Entries | 10 routes | **11** |
| FAQ Questions (General) | 8 | **35** |
| FAQ Questions (Skin Care) | 8 | **24** |
| HowTo Schemas | 3 | **3** |
| Physician Profiles | 3 | **1** (Dr. Sharma only) |
| BlogPosting Schema | Not mentioned | **1** (dynamic) |
| seo.ts Lines | 909 | **909** ✅ |
| SEOHead.tsx Lines | Not specified | **235** |

---

## 6. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| AggregateRating hardcoded | High | Medium | Connect to real reviews |
| /contact missing PAGE_SEO | Medium | Low | Add entry |
| Doc/schema count mismatch | High | Low | Update documentation |
| Physician schema only 1 of 3 | Medium | Low | Add other physicians |
| SkinCare route key mismatch | Medium | Low | Align doc/code |

---

## 7. Files Examined

- `seo.ts` (909 lines) — All schemas, PAGE_SEO config
- `components/SEOHead.tsx` (235 lines) — Head management, schema injection
- `App.tsx` — SEOHead at root
- `constants.ts` — NAV_ITEMS for route reference

---

*Report generated by egm-codebase-details reviewer*