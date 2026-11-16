# EGM-19 i18n Design Document vs Codebase Review

**Date:** 2026-11-13  
**Design Doc:** `design-docs/egm-19-i18n.md`  
**Codebase:** `hospital-site/` (React + Vite + TypeScript)  
**Reviewer:** Code Review Session

---

## Executive Summary

The design document **accurately describes the current minimal i18n implementation** (React Context, 3 languages, object-based `t` API) and **correctly identifies phantom features** from a previous version that no longer exist. However, the design doc **implies broad i18n adoption** that does not exist in the codebase — 11 of 12 pages have zero i18n usage, 4 components use inline ternaries instead of the `t` object, and the knowledge base (RAG source) is English-only.

---

## Categorized Findings

### ✅ Accurate Claims (Design Doc Matches Codebase)

| Claim | Evidence |
|-------|----------|
| React Context-based i18n (`LanguageContext.tsx`) | Verified: `components/LanguageContext.tsx` exports `LanguageProvider`, `useLanguage` hook |
| 3 languages supported: en, hi, gu | Verified: `type Language = 'en' | 'hi' | 'gu'` in `types/index.ts`; `translations.ts` has all three |
| Object-based `t` API: `t.common.hero.title` | Verified: `useLanguage()` returns `t` object with nested structure matching `translations.ts` |
| No `localStorage` persistence | Verified: `LanguageContext` uses only React state (`useState`), no `localStorage` read/write |
| No URL language parameter | Verified: No `searchParams` handling for `lang` in `LanguageContext` or router |
| No string interpolation in `t` | Verified: `t` returns plain strings; no `t(key, { vars })` pattern |
| No `tRich` / rich text translation | Verified: No `tRich` export or usage anywhere in codebase |
| No blog localization | Verified: `pages/Blog.tsx` uses `t` for nav only; blog content from `data/blog/*.md` (English only) |
| No `hreflang` tags | Verified: `components/SEOHead.tsx` has no `hreflang` links; hardcoded `og:locale="en_US"` |
| No per-language font config | Verified: No font loading logic in `LanguageContext` or `index.css` |

### ❌ Inaccurate / Misleading Claims

| Design Doc Claim | Reality | Evidence |
|------------------|---------|----------|
| "DesktopNav.tsx has language switcher" | **File does not exist** | Only `MobileHeader.tsx` has language selector; desktop has none |
| "All pages use i18n" | **11 of 12 pages have ZERO `useLanguage` / `t` usage** | See "Missing i18n Adoption" section |
| "Components consistently use `t` object" | **4 components use inline ternaries** | See "Inline Ternary Anti-Pattern" section |
| "AI chat responses are localized" | **Knowledge base is English-only** | `knowledge/*.json` all English; NVDA NIM receives English |

### 🔴 Missing Features

| Feature | Status | Impact |
|---------|--------|--------|
| Page-level i18n adoption | **11 pages completely untranslated** | Users see English UI regardless of language selection |
| Desktop language switcher | **Missing entirely** | No way to change language on desktop viewport |
| Blog content localization | **English MD files only** | Blog posts unreadable for hi/gu users |
| Knowledge base (RAG) localization | **English JSON only** | AI chat cannot answer in native language |
| `hreflang` SEO tags | **Absent** | Search engines won't serve correct language version |
| Per-language font loading | **Absent** | Hindi/Gujarati may render with fallback fonts |
| URL-based language routing | **Absent** | No shareable language-specific URLs |
| `localStorage` persistence | **Absent** | Language preference lost on refresh |

### 🟢 Undocumented Features

| Feature | Location | Notes |
|---------|----------|-------|
| Mobile language selector (flag + label) | `components/MobileHeader.tsx` lines 45-62 | Well-implemented with `t.common.language.*` keys |
| `t` object includes `common.language.name.*` | `translations.ts` | Native language names for selector dropdown |
| `LanguageContext` memoizes `t` with `useMemo` | `components/LanguageContext.tsx` line 28 | Good performance practice |
| Type-safe `TranslationKey` type | `types/index.ts` line 15 | `type TranslationKey = keyof typeof translations.en` |

---

## Detailed Evidence: Missing i18n Adoption (11 Pages)

| Page | `useLanguage` Import | `t.` Usage | Notes |
|------|---------------------|------------|-------|
| `pages/Home.tsx` | ❌ | ❌ | Partial: hero section uses hardcoded strings |
| `pages/About.tsx` | ❌ | ❌ | **Zero i18n** |
| `pages/Booking.tsx` | ❌ | ❌ | **Zero i18n** |
| `pages/Tools.tsx` | ❌ | ❌ | **Zero i18n** |
| `pages/Services.tsx` | ❌ | ❌ | **Zero i18n** |
| `pages/ServiceDetail.tsx` | ❌ | ❌ | **Zero i18n** |
| `pages/Programs.tsx` | ❌ | ❌ | **Zero i18n** |
| `pages/Blog.tsx` | ✅ | Partial | Uses `t` for nav only; content English-only |
| `pages/PrivacyPolicy.tsx` | ❌ | ❌ | **Zero i18n** |
| `pages/Insurance.tsx` | ❌ | ❌ | **Zero i18n** |
| `pages/Terms.tsx` | ❌ | ❌ | **Zero i18n** |
| `pages/SkinCare.tsx` | ❌ | ❌ | **Zero i18n** |

**Only `MobileHeader.tsx` actively uses i18n. All other pages are English-only.**

---

## Detailed Evidence: Inline Ternary Anti-Pattern (4 Components)

| Component | Current Code | Should Use |
|-----------|--------------|------------|
| `components/MobileBottomNav.tsx` line 34 | `isOpen ? 'Close' : 'More'` | `t.common.nav.more` / `t.common.nav.close` |
| `components/ChatBot.tsx` line 88 | `isOpen ? 'Close Chat' : 'Open Chat'` | `t.common.chat.open` / `t.common.chat.close` |
| `components/VoiceInput.tsx` line 42 | `listening ? 'Listening...' : 'Tap to speak'` | `t.common.voice.listening` / `t.common.voice.tapToSpeak` |
| `components/ChatToolCard.tsx` line 27 | `loading ? 'Loading...' : 'Analyze'` | `t.common.tools.loading` / `t.common.tools.analyze` |

**Translation keys exist in `translations.ts` but are unused.**

---

## Knowledge Base Localization Gap

| File | Language | Status |
|------|----------|--------|
| `knowledge/ayurveda_treatments.json` | English only | 127 entries, no hi/gu |
| `knowledge/doctors.json` | English only | 8 doctors, no hi/gu |
| `knowledge/faqs.json` | English only | 24 FAQs, no hi/gu |
| `knowledge/herbs.json` | English only | 45 herbs, no hi/gu |
| `knowledge/panchakarma.json` | English only | 18 entries, no hi/gu |
| `knowledge/services.json` | English only | 22 services, no hi/gu |

---

## SEOHead.tsx Analysis

```tsx
// Current (lines 12-18)
<meta property="og:locale" content="en_US" />
// No hreflang links generated
// No dynamic locale based on language context
```

**Missing:** hreflang tags for en/hi/gu, dynamic og:locale based on language context

---

## Recommendations

### Priority 1: Critical
1. Add `useLanguage` + `t` to all 11 untranslated pages
2. Create `DesktopNav.tsx` with language selector for desktop users
3. Translate knowledge base JSON files (6 files × 3 languages)

### Priority 2: High
4. Add `hreflang` tags to `SEOHead.tsx`
5. Implement `localStorage` persistence in `LanguageContext`
6. Add URL language parameter (`?lang=hi`)

### Priority 3: Medium
7. Replace 4 inline ternaries with `t` object keys
8. Add per-language font loading for Devanagari/Gujarati
9. Create `BlogPost.tsx` with i18n support
10. Localize blog content

### Priority 4: Documentation
11. Update design doc to remove references to non-existent `DesktopNav.tsx`
12. Clarify actual vs. implied i18n adoption in design doc

---

## Conclusion

The design document is **honest about the minimal implementation** but **misleading about adoption breadth**. The codebase has a solid i18n foundation (Context, types, translations) that is **used on only 2 of 50+ component/page files**. Highest-impact work is applying the existing `t` object to untranslated pages.

**Estimated effort:** ~40-60 translation key additions across 15 files, plus knowledge base localization (6 JSON files × 3 languages).