# EGM-04 Routing & Navigation — Codebase Details Review

**Review Date:** 2026-11-13  
**Reviewer:** egm-codebase-details  
**Source Document:** `design-docs/egm-04-routing-navigation.md`  
**Codebase Root:** `F:\Ayurvritta Ayurveda Hospital Clinical Data\hospital-site\`

---

## 1. Summary of Alignment

| Category | Status | Notes |
|----------|--------|-------|
| Route Inventory | 🟡 **Yellow** | 14 routes in doc vs 13 in code (Contact missing) |
| Router Configuration | 🟡 **Yellow** | Doc shows eager imports; code uses lazy + Suspense |
| Hash Fallback | ❌ **Missing** | No HashRouter fallback in code |
| Layout Component | ✅ **Green** | Matches doc structure well |
| Navigation Patterns | ✅ **Green** | NavLink wrapper, breadcrumbs, deep linking |
| Language Persistence | ✅ **Green** | LanguageContext + localStorage |
| 404 Handling | 🟡 **Yellow** | Navigate to "/" not Home component |
| Scroll Behavior | ✅ **Green** | scrollIntoView for hash anchors (Programs) |
| Performance | 🟡 **Yellow** | Code-splitting implemented but not at page level per doc |

---

## 2. Critical Discrepancies (P0)

### Route Inventory Mismatch

| Design Doc (Table lines 8-24) | Actual `App.tsx` |
|-------------------------------|------------------|
| 14 routes listed | **13 routes defined** |
| `/contact` → Contact component | **Missing** — no Contact route |
| `/skin-care` → SkinCare | **Actual: `/ayurveda-skin-care`** |
| `/blog/:slug` → BlogPost | **Actual: `/blog/:slug` → Blog (same component)** |
| All routes eager import | **Lazy imports + Suspense** (lines 9-19) |
| 404 renders Home component | **Navigate to "/" with replace** (line 47) |

### HashRouter Fallback Not Implemented

| Design Doc (lines 81-84) | Reality |
|--------------------------|---------|
| "Hash fallback: HashRouter fallback strategy" | **Not implemented** — only `BrowserRouter` used |
| "Program pages use hash anchors" | ✅ True — `Programs.tsx` uses `scrollIntoView` |
| "Hash fallback strategy" | **No fallback router** — would break on static hosting |

### Blog Route Handling

| Design Doc | Actual |
|------------|--------|
| `/blog` → Blog (grid) | ✅ Correct |
| `/blog/:slug` → BlogPost (individual) | **Routes to Blog component** — likely handles both in one |

---

## 3. Claims in Doc Not Reflected in Code

| Claim | Status |
|-------|--------|
| "HashRouter fallback strategy" | **False** — only BrowserRouter |
| "All routes are eagerly imported" (line 85) | **False** — lazy + Suspense |
| "404 handling: unmatched routes render Home component" | **False** — redirects to "/" |
| "IntersectionObserver hooks used for lazy loading content sections" | **Not verified** — not seen in Layout/App |
| "Navigation transitions are CSS-based" | **Partially** — animations in Layout/MobileBottomNav |
| "14-route surface" | **False** — 13 routes defined |

---

## 4. Code Patterns Not Documented

### 1. Custom NavLink Wrapper (`Layout.tsx` lines 12-35)
- Wraps `react-router-dom` NavLink
- Adds scroll-to-top on click
- Supports className function with `isActive`
- Used throughout Layout for consistent behavior

### 2. Dynamic Header Styles (`Layout.tsx` lines 120-168)
- 4-state header: Menu Open → Scrolled → Booking Page → Transparent
- Uses `useLocation` for page-specific styling
- Glassmorphism with `backdrop-blur-md`

### 3. Mobile Menu with Safe Area Insets (`Layout.tsx` lines 300-308)
```css
paddingTop: 'calc(96px + env(safe-area-inset-top))'
paddingBottom: 'calc(80px + env(safe-area-inset-bottom))'
```
- Proper iOS/Android safe area handling
- Swipe indicator animation

### 4. Scroll Progress Bar (`Layout.tsx` lines 176-179)
- Fixed top progress bar showing scroll percentage
- Gradient: green → gold → accent

### 5. Language Context Integration (`Layout.tsx` lines 248-264, 278-284)
- Desktop dropdown + mobile button
- 3 languages: English, Hindi, Gujarati
- Translated nav labels via `t.nav` object

### 6. Mobile Bottom Nav (`MobileBottomNav.tsx`)
- 4 main items: Home, Services, Booking, Tools
- 5th "More" button toggles full-screen menu
- Active indicator bar with animation
- Safe area inset bottom padding

### 7. Skip Link for Accessibility (`Layout.tsx` lines 181-186)
```tsx
<a href="#main-content" className="skip-link sr-only focus:not-sr-only...">
  Skip to main content
</a>
```

### 8. Footer Navigation (`Layout.tsx` lines 447-463)
- Grid layout with NavLink items
- Links to: Services, Skin Care, Programs, Tools, About
- Legal links: Privacy, Terms

### 9. Floating Action Bubbles Hidden on Menu Open (`Layout.tsx` line 514)
```tsx
className={`${isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
```

---

## 5. Component/Route Counts

| Metric | Design Doc | Actual |
|--------|------------|--------|
| Total Routes | 14 | **13** |
| Nav Items (Desktop) | 9 | **8** (constants.ts) |
| Nav Items (Mobile Bottom) | 5 | **4** + More button |
| Languages | 3 | **3** (en, hi, gu) |
| Layout.tsx Lines | Not specified | **536** |
| MobileBottomNav.tsx Lines | Not specified | **146** |

---

## 6. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing `/contact` route | High | High | Add Contact page + route |
| SkinCare route path mismatch | Medium | Medium | Update doc or code to match |
| No HashRouter fallback | Medium | High | Add HashRouter for static hosting |
| BlogPost not separate component | Medium | Low | Verify Blog handles slug correctly |
| 404 redirect loses URL | Low | Low | Acceptable for SPA |

---

## 7. Files Examined

- `App.tsx` (55 lines) — Router configuration with lazy loading
- `components/Layout.tsx` (536 lines) — Main layout with header, menu, footer
- `components/MobileBottomNav.tsx` (146 lines) — Mobile tab navigation
- `components/NavLink` (wrapper in Layout.tsx)
- `constants.ts` — NAV_ITEMS, FOOTER_LINKS
- `hooks/useLanguage.ts` / `components/LanguageContext` — Language persistence

---

*Report generated by egm-codebase-details reviewer*