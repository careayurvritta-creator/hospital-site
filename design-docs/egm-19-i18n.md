# EGM-19: Internationalization (i18n) Architecture

## Overview
The application supports 3 languages: **English (en), Hindi (hi), Gujarati (gu)**. The system uses a **custom lightweight i18n solution built on React Context with no external i18n library**. The previous version of this doc described a phantom API with a `t(key, params)` interpolation function, `tRich` for HTML, localStorage persistence, URL-based language switching, and blog post localization — **none of which exist in the actual implementation**.

---

## Actual Architecture

### Language Context (`components/LanguageContext.tsx`)

```tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../translations';

type TranslationType = typeof TRANSLATIONS['en'];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationType;  // t is the FULL translation object for current language
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // t is strictly the object for the current language
  const t = TRANSLATIONS[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
```

### Key Implementation Details

| Aspect | Actual Implementation | Previous Doc Claim (PHANTOM) |
|--------|----------------------|------------------------------|
| **`t` API** | Full translation object: `t.nav.home` | Function: `t('nav.home')` |
| **`tRich`** | ❌ **Does not exist** | Claimed: `(key) => ReactNode` |
| **localStorage persistence** | ❌ **Not in Provider** | Claimed: `useEffect` syncs to `localStorage` |
| **URL language param** | ❌ **Not implemented** | Claimed: `?lang=hi` supported |
| **Interpolation** | ❌ **No interpolation function** | Claimed: `t(key, params)` |
| **`useLanguage` hook** | Exported from `LanguageContext.tsx` | Claimed: Separate `hooks/useLanguage.ts` |

### Usage Pattern (Actual)

```tsx
// Components consume translations like:
const { t, language, setLanguage } = useLanguage();

// Direct property access (no function call)
return <button>{t.common.book_consultation}</button>;
return <h1>{t.hero.title_prefix}</h1>;
return <nav><a href="/">{t.nav.home}</a></nav>;

// Language switcher
<select value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
  <option value="en">English</option>
  <option value="hi">हिन्दी</option>
  <option value="gu">ગુજરાતી</option>
</select>
```

---

## Translation Files (`translations.ts`)

### Structure
```typescript
export const TRANSLATIONS = {
  en: {
    common: { book_consultation: "Book Consultation", ... },
    nav: { home: "Home", services: "Services", ... },
    hero: { tagline: "Vadodara's Premier Center", ... },
    trust: { title: "Why Choose Us", ... },
    testimonials: { title: "Patient Experiences", ... },
    faq: { title: "Frequently Asked Questions", ... },
    footer: { explore: "Explore", ... },
    // ... more sections
  },
  hi: {
    common: { book_consultation: "परामर्श बुक करें", ... },
    nav: { home: "होम", services: "सेवाएं", ... },
    // ... Hindi translations
  },
  gu: {
    common: { book_consultation: "પરામર્શ બુ�ક કરો", ... },
    nav: { home: "હોમ", services: "સેવાઓ", ... },
    // ... Gujarati translations
  },
};
```

### Language Type (`types/index.ts`)
```typescript
export type Language = 'en' | 'hi' | 'gu';
```

### Translation Coverage
- **UI Strings**: Navigation, buttons, labels, headings, form placeholders, validation messages, error messages, disclaimers
- **Hero Section**: Rotating titles, subtitle, badges
- **Trust Indicators**: Stats, certifications, insurance partners
- **Testimonials, FAQ, Footer**: Fully translated
- **Tool Content**: **NOT in translations.ts** — tools use their own localized data structures
- **Blog Posts**: **NOT localized** — English only currently
- **AI Responses**: **NOT localized via context** — AI receives language instruction in system prompt

---

## Language Switcher Component

- **Location**: `components/MobileHeader.tsx` (mobile), `components/DesktopNav.tsx` (desktop)
- **UI**: `<select>` dropdown with language names in native script
- **Behavior**: Instant switch via `setLanguage()` (no page reload)
- **Persistence**: **NONE** — resets to 'en' on refresh (no localStorage sync)

---

## What Does NOT Exist (Phantom Features from Previous Doc)

| Phantom Feature | Status | Notes |
|-----------------|--------|-------|
| `t(key, params)` interpolation function | ❌ Not implemented | Direct object access only |
| `tRich(key)` for HTML content | ❌ Not implemented | No rich text translation |
| localStorage persistence | ❌ Not in Provider | Language resets on refresh |
| URL language parameter (`?lang=`) | ❌ Not implemented | No URL-based switching |
| Blog post localization (separate .md files) | ❌ Not implemented | Blog is English only |
| hreflang tags in SEOHead | ❌ Not implemented | No multilingual SEO |
| Date/number formatting utilities | ❌ Not implemented | No `formatDate`, `formatNumber` |
| Font strategy (Noto Sans Devanagari/Gujarati) | ❌ Not in this codebase | Uses system fonts / Inter |
| RTL support discussion | ❌ N/A | All 3 languages are LTR |
| Translation validation (build-time) | ❌ Not implemented | No missing-key detection |
| Translation workflow (Crowdin/Lokalise) | ❌ Manual only | Developer merges translations |

---

## Font Support (Actual)

**No custom font configuration for Indic scripts found in codebase.**
- `tailwind.config.js` uses default `fontFamily.sans` (likely Inter + system fallbacks)
- No `Noto Sans Devanagari` or `Noto Sans Gujarati` configured
- No font preloading in `index.html`
- Hindi/Gujarati rendering depends on system fonts

---

## AI Chat Localization

- **System prompt** includes language instruction (handled in `lib/aiService.ts` / `components/ChatToolCard.tsx`)
- **Knowledge base**: English only (RAG retrieves English chunks)
- **User language**: Available via `useLanguage()` → passed to AI service
- **Response language**: AI instructed to respond in user's language
- **No context-level translation** of AI responses

---

## Recommended Enhancements (Not Yet Implemented)

### P0 — Critical Gaps
1. **Add localStorage persistence** to `LanguageProvider` for language preference
2. **Add URL language parameter** (`?lang=hi`) for shareable links
3. **Implement missing translation detection** (build-time validation)

### P1 — Important
4. **Add interpolation support** for dynamic values (e.g., `{count} patients`)
5. **Configure Noto fonts** for reliable Hindi/Gujarati rendering
6. **Add hreflang tags** for multilingual SEO

### P2 — Nice to Have
7. **Code-split translations** by language (lazy load hi/gu)
8. **Blog post localization** strategy
9. **Translation management tool** integration (Crowdin, Lokalise, or Google Sheets)
10. **Date/number formatting utilities** using `Intl`

---

## Migration Plan

| Phase | Task | Priority | Dependencies |
|-------|------|----------|--------------|
| 1 | Add localStorage persistence to `LanguageProvider` | P0 | None |
| 2 | Add URL language parameter handling | P0 | Phase 1 |
| 3 | Implement build-time translation validation | P0 | None |
| 4 | Add interpolation helper (optional utility) | P1 | None |
| 5 | Configure Noto Sans Devanagari/Gujarati in Tailwind + preload | P1 | None |
| 6 | Add hreflang tags to SEOHead | P1 | Phase 2 |
| 7 | Code-split translations by language | P2 | None |
| 8 | Design blog post localization workflow | P2 | None |
| 9 | Add date/number formatting utilities | P2 | None |

---

## Traceability to Master Report

| Master Action | This Doc Sections |
|---------------|-------------------|
| A14: Fix `LanguageContext` API — `t` is object, not function | Actual Architecture, Key Implementation Details |
| A15: Remove phantom `tRich`, localStorage, URL param, interpolation | What Does NOT Exist |
| A16: Document actual `translations.ts` structure | Translation Files |
| A17: Remove phantom blog localization, hreflang, font strategy | What Does NOT Exist, Font Support |
| A18: Note `useLanguage` exported from LanguageContext.tsx (not separate hook file) | Actual Architecture |
| A19: Document AI language handling (system prompt, not context translation) | AI Chat Localization |

---

*Last updated: 2026-11-13 — Aligned with actual codebase verification*