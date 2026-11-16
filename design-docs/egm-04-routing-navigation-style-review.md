# EGM-04 Routing & Navigation — Style Review

**Review Date:** 2026-11-13  
**Reviewer:** egm-style  
**Source Document:** `design-docs/egm-04-routing-navigation.md`

---

## 1. Structure Compliance

| Required Section | Present? | Quality |
|------------------|----------|---------|
| Overview | ✅ | Concise, mentions React Router v6, HashRouter fallback |
| Route Inventory | ✅ | Table with 14 routes, component, purpose |
| Routing Architecture | ✅ | Router config, Layout, Navigation Patterns |
| Navigation Flow | ✅ | ASCII diagram |
| Key Design Decisions | ✅ | 6 decisions numbered |
| Performance Considerations | ✅ | 3 bullets |

**Verdict:** ✅ **All required sections present** — follows EGM routing template.

---

## 2. Formatting Consistency

### Tables
- ✅ Consistent pipe-aligned markdown
- ✅ Clear headers: Route, Component, Purpose
- ✅ All 14 routes listed

### Code Blocks
- ✅ Language tag: `tsx`
- ✅ Router configuration readable
- ⚠️ Only one code block (router config)

### Diagrams
- ✅ ASCII navigation flow (lines 69-79)
- ❌ No diagram for Layout component structure
- ❌ No diagram for mobile vs desktop nav

### Headings
- ✅ Consistent hierarchy (##, ###)
- ✅ Numbered design decisions

---

## 3. Clarity and Readability

### Strengths
- Clear route inventory table
- Navigation flow ASCII diagram shows user journeys
- Design decisions are specific and actionable
- Performance considerations address real concerns

### Issues
| Location | Issue | Severity |
|----------|-------|----------|
| Line 4 | "HashRouter fallback strategy" | 🔴 **False** — not in code |
| Line 83 | "Client-side routing: No server-side rendering" | ✅ Accurate |
| Line 84 | "Hash fallback: Program pages use hash anchors" | 🟡 Misleading — only Programs uses hash |
| Line 85 | "Lazy loading: All pages eagerly imported" | 🔴 **False** — code uses lazy + Suspense |
| Line 86 | "404 handling: unmatched routes render Home component" | 🔴 **False** — redirects to "/" |
| Line 87 | "Scroll behavior: Program pages use scrollIntoView" | ✅ Verified in Programs.tsx |
| Line 91 | "All routes are code-split at page level" | 🟡 Partially — lazy but not measured |
| Line 92 | "IntersectionObserver hooks for lazy loading" | ❓ **Not verified** — not found in code |
| Line 93 | "Navigation transitions are CSS-based" | 🟡 Partial — Layout animations only |

---

## 4. Completeness

### TODOs / TBDs / Placeholders
- None explicitly marked — document reads as complete spec

### Missing Information
- No **MobileBottomNav** documentation (5th nav item, More button)
- No **NavLink wrapper** documentation (custom component in Layout)
- No **LanguageContext** integration details in nav
- No **Footer navigation** structure
- No **Scroll progress bar** feature
- No **Skip link** accessibility feature
- No **Safe area inset** handling for mobile
- No **HashRouter fallback** implementation details (since it doesn't exist)
- No **Route guards / auth** discussion
- No **Analytics integration** for navigation
- No **Prefetching strategy**
- No **Sitemap generation**

---

## 5. Tone and Professionalism

| Aspect | Assessment |
|--------|------------|
| Technical precision | Medium — several claims don't match code |
| Honesty about gaps | Low — presents aspirational as implemented |
| Actionability | Medium — design decisions are good |
| Spec vs. reality | 🔴 **Problem** — document describes target, not current |

### Tone Issues
- Reads as **target architecture** not **current implementation**
- Multiple false claims about current state
- No "Current Implementation" vs "Target Architecture" separation

---

## 6. Specific Style Violations

| # | Violation | Location | Fix |
|---|-----------|----------|-----|
| 1 | False claim: HashRouter fallback exists | Line 4, 84 | Remove or mark "Planned" |
| 2 | False claim: All pages eager import | Line 85 | Update to "Lazy loading with Suspense" |
| 3 | False claim: 404 renders Home | Line 86 | Update to "Redirects to /" |
| 4 | False claim: 14 routes | Line 4, Table | Update to 13 or add Contact |
| 5 | False claim: IntersectionObserver hooks | Line 92 | Remove or verify |
| 6 | SkinCare route path mismatch | Line 21 | Update to `/ayurveda-skin-care` |
| 7 | BlogPost component doesn't exist | Line 16 | Update to Blog handles slug |
| 8 | No frontmatter metadata | Top of file | Add version, date, author, status |
| 9 | Missing MobileBottomNav docs | Entire doc | Add section |
| 10 | Missing NavLink wrapper docs | Entire doc | Add section |

---

## 7. Comparison to EGM Conventions

| Convention | Compliance |
|------------|------------|
| Route inventory table | ✅ Good |
| Router config code block | ✅ Good |
| ASCII navigation flow | ✅ Good |
| Numbered design decisions | ✅ Good |
| Performance considerations | ✅ Good |
| Frontmatter metadata | ❌ Missing |
| Spec vs. implementation separation | ❌ Mixed |
| Mobile navigation documentation | ❌ Missing |
| Accessibility features documented | ❌ Missing |

---

## 8. Recommendations

### Quick Wins (Do Now)
1. Add frontmatter with version, date, author, status
2. Correct all false claims to match actual code:
   - Line 4: "BrowserRouter with lazy loading; HashRouter planned for static hosting"
   - Line 84: "Hash anchors used for Program deep linking only"
   - Line 85: "Lazy loading with React.lazy + Suspense for all non-Home pages"
   - Line 86: "404 redirects to / with replace"
   - Line 21: Route path `/ayurveda-skin-care`
   - Line 16: Blog handles both grid and post via slug
3. Update route count to 13 (or add Contact route)

### Structural Improvements
1. Split into **Current Implementation** and **Target Architecture** sections
2. Add **Mobile Navigation** section documenting:
   - MobileBottomNav (4 items + More button)
   - Full-screen mobile menu with animations
   - Safe area inset handling
3. Add **Custom Components** section:
   - NavLink wrapper (scroll-to-top, active styling)
   - Language selector (desktop dropdown + mobile button)
   - Scroll progress bar
   - Skip link
4. Add **Accessibility** section:
   - Skip to main content
   - ARIA labels on nav
   - Focus management on route change
   - Touch targets ≥ 48px
5. Add **SEO Integration** section:
   - SEOHead at root
   - Per-route meta needed (gap)
6. Add **Analytics** section (currently missing)

### Polish
1. Verify all route paths against `App.tsx`
2. Document Layout.tsx dynamic header states (4 states)
3. Document footer navigation structure
4. Add mermaid diagram for Layout component hierarchy

---

## 9. Overall Style Score: **55/100**

| Dimension | Score |
|-----------|-------|
| Structure | 85 |
| Formatting | 80 |
| Clarity | 40 |
| Completeness | 45 |
| Tone | 50 |
| Convention Adherence | 50 |

**Primary issue:** Document describes aspirational architecture, not current implementation. Multiple factual inaccuracies vs. codebase.

---

*Report generated by egm-style reviewer*