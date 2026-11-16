# EGM-05: SEO & Structured Data Architecture

## Overview
The SEO system spans 909 lines in `seo.ts` with 8 structured data blocks, page-specific metadata for 10 routes, and a comprehensive keyword strategy. The system is designed for both search engine discovery and AI assistant citation (GEO).

## Structured Data Blocks

### 1. MedicalBusiness (LocalBusiness)
```json
{
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "name": "Ayurvritta Ayurveda Hospital",
  "telephone": "+91-XXXXXXXXXX",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "IN"
  },
  "openingHours": "Mo-Su 06:00-22:00",
  "priceRange": "$$",
  "medicalSpecialty": "Ayurveda"
}
```
Applied to: All pages (global schema via SEOHead)

### 2. FAQPage
- 8 FAQ pairs covering: What is Ayurveda, Panchakarma benefits, insurance acceptance, consultation process
- Uses `mainEntity` array with `Question`/`Answer` pairs
- Renders `faqPage` schema for rich snippet eligibility

### 3. Organization
- Organization-level metadata: logo, sameAs links, contact points
- Supports `founder` and `employee` extensions

### 4. Physician
- 3 physician profiles with credentials, specialties, and experience
- Each physician has `medicalSpecialty`, `affiliation`, `credential`

### 5. BreadcrumbList
- Auto-generated for nested routes: Home > Services > [Service Name]
- Each `item` contains `name` + `item` (URL path)

### 6-8. HowTo Blocks (3x)
- "How to Prepare for Panchakarma"
- "How to Book an Ayurvedic Consultation"
- "How to Choose the Right Ayurvedic Treatment"

### 9. MedicalWebPage
- Page-specific schema for `/skin-care` with `medicalCondition` properties
- Links to `condition` entities for skin disorders

## Page-Specific SEO

| Route | Title Template | Meta Description Focus |
|-------|---------------|----------------------|
| `/` | Brand + location | Hospital overview, Ayurveda services |
| `/services` | Services overview | 9 treatment categories |
| `/services/:id` | Service name | Specific treatment details |
| `/programs` | Specialized programs | 5 program types |
| `/blog` | Blog listing | Ayurveda knowledge base |
| `/blog/:slug` | Post title | Individual article |
| `/about` | About us | Hospital history + team |
| `/contact` | Contact | Location + phone |
| `/booking` | Book appointment | Appointment booking |
| `/insurance` | Insurance | Partner network |
| `/skin-care` | Skin care authority | Condition-specific content |
| `/tools` | Health tools | Interactive assessments |

## SEO Head Component
- Renders `<title>`, `<meta name="description">`, `<meta name="keywords">`
- Outputs JSON-LD `<script type="application/ld+json">` for all structured data
- Manages `og:title`, `og:description`, `og:image` for social sharing
- Supports `canonical` URL to prevent duplicate content
- Mobile-friendly meta tags (`viewport`, `theme-color`)

## Keyword Strategy
- **Primary**: "Ayurveda hospital", "Ayurvedic treatment", "Panchakarma"
- **Location**: "Ayurveda hospital in [city]", "Ayurvedic clinic near me"
- **Condition**: "Ayurveda for diabetes", "Ayurveda for skin care", "Ayurveda for arthritis"
- **Treatment**: "Panchakarma treatment", "Abhyanga", "Shirodhara"
- **AI Citation**: Content structured for AI assistant extraction (clear headings, factual statements, source citations)

## Technical Implementation
- All SEO data centralized in `seo.ts` (single source of truth)
- `SEOHead` component accepts `seoKey` prop to select pre-configured metadata
- Structured data injected as JSON-LD (preferred by Google)
- No-render fallback: meta tags present in initial HTML (SSR-compatible)
- Blog posts use frontmatter-based SEO overrides

## Integration Points
- `SEOHead` rendered in root `Layout` component (global schemas)
- Individual pages pass `seo` prop for page-specific metadata
- Blog posts dynamically generate metadata from frontmatter
- Service detail pages dynamically generate schema based on service data