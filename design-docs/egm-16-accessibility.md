# EGM-16: Accessibility Architecture

## Overview
The application implements WCAG 2.1 AA compliance across all 14 pages and 5 tools. Accessibility is built into the component library and design system, not bolted on as an afterthought.

## Compliance Target
- **Standard**: WCAG 2.1 Level AA
- **Scope**: All pages, tools, and components
- **Testing**: Manual + automated (axe-core)
- **Audit**: Required before each release

## Implementation Strategy

### Semantic HTML Foundation
All pages use proper semantic structure:
```tsx
// Page template
<Layout>
  <header role="banner">
    <nav aria-label="Main navigation">...</nav>
  </header>
  <main role="main">
    <section aria-labelledby="page-title">
      <h1 id="page-title">Page Title</h1>
      ...
    </section>
  </main>
  <footer role="contentinfo">...</footer>
</Layout>
```

### Heading Hierarchy
- **h1**: Page title (exactly one per page)
- **h2**: Major sections
- **h3**: Subsections
- **h4**: Minor sections (used in FAQ, tool steps)
- Never skip levels (h1 → h3 is violation)

### Landmark Regions
| Landmark | Element | Pages |
|----------|---------|-------|
| banner | `<header>` | All |
| navigation | `<nav aria-label="...">` | All |
| main | `<main>` | All |
| complementary | `<aside>` | Blog (sidebar), Tools (results) |
| contentinfo | `<footer>` | All |
| search | `<form role="search">` | Blog, Insurance |

### Keyboard Navigation
- **Tab order**: Logical, matches visual order
- **Focus indicators**: Visible outline on all interactive elements
- **Skip links**: "Skip to main content" at top of page
- **Focus trap**: Mobile menu, modal dialogs
- **Escape key**: Closes modals, menus, overlays

### Focus Management
```tsx
// Mobile menu example
useEffect(() => {
  if (isOpen) {
    const focusable = menuRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();
    // Trap focus
    const handleTab = (e) => { ... };
    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }
}, [isOpen]);
```

### Screen Reader Support

#### ARIA Labels
- All icon-only buttons: `aria-label="Action description"`
- Form inputs: Associated `<label>` or `aria-label`
- Dynamic content: `aria-live="polite"` for announcements

#### ARIA States
- `aria-expanded`: Dropdowns, accordions, mobile menu
- `aria-selected`: Tabs, bottom nav
- `aria-current`: Active nav link, current step in tools
- `aria-disabled`: Disabled buttons (not just `disabled`)

#### Live Regions
- Tool progress: `aria-live="polite"` announces step changes
- Form errors: `aria-live="assertive"` announces validation errors
- Chat messages: `aria-live="polite"` announces new AI responses

### Color & Contrast

#### Contrast Ratios (WCAG AA)
| Element | Minimum Ratio | Actual |
|---------|--------------|--------|
| Normal text | 4.5:1 | 7:1 (green on cream) |
| Large text (18px+) | 3:1 | 4.5:1 |
| UI components | 3:1 | 4.5:1 |
| Focus indicators | 3:1 | 7:1 |

#### Color Independence
- No information conveyed by color alone
- Error states: color + icon + text
- Active states: color + underline + aria-current
- Charts: patterns + colors (dosha radar chart)

### Form Accessibility

#### Labeling
```tsx
// Explicit label
<label htmlFor="name">Full Name</label>
<input id="name" type="text" />

// Or aria-label
<input type="text" aria-label="Full Name" />

// Required indication
<label htmlFor="email">
  Email <span aria-hidden="true">*</span>
  <span className="sr-only">(required)</span>
</label>
```

#### Error Handling
- Errors announced via `aria-live="assertive"`
- Error linked to input: `aria-describedby="email-error"`
- Error message explains fix, not just "invalid"

#### Validation
- Native HTML5 validation: `required`, `type="email"`, `pattern`
- Custom validation: `aria-invalid="true"` on error
- Submit button: disabled until valid (or validate on submit)

### Mobile Accessibility

#### Touch Targets
- Minimum: 48x48px (all interactive elements)
- Spacing: 8px between adjacent targets
- No hover-only interactions

#### Orientation
- Content works in both portrait and landscape
- No content locked to specific orientation

#### Gestures
- Swipe gestures have button alternatives
- Pull-to-refresh not implemented (no need)

### Responsive Accessibility

#### Text Scaling
- Relative units (rem) for all text
- Supports 200% browser zoom without horizontal scroll
- No fixed pixel font sizes

#### Reflow
- Content reflows at 320px width (mobile)
- No loss of functionality at any breakpoint
- Horizontal scroll only for data tables (with alternative view)

### Component-Specific Accessibility

#### Service Cards
- Heading: h2 for service name
- Link: wraps entire card, `aria-label` describes destination
- Image: `alt=""` (decorative) or descriptive alt

#### Tool Components
- Progress: `<progress value={current} max={total}>` + aria-label
- Options: Radio group with `role="radiogroup"`, `aria-label="Question"`
- Results: Charts have text alternative (table view)

#### AI Chat
- Messages: `role="log"` with `aria-live="polite"`
- Input: `aria-label="Chat message"`
- Streaming: Announces "AI is typing" then full response

#### Blog Posts
- Article: `<article>` with proper heading structure
- Author: `<address>` element
- Tags: `<nav aria-label="Tags">` with links

### Testing Protocol

#### Automated
- axe-core in CI (zero violations required)
- jest-axe in unit tests
- ESLint plugin: jsx-a11y

#### Manual
- Keyboard-only navigation (Tab, Shift+Tab, Enter, Space, Escape)
- Screen reader: NVDA (Windows), VoiceOver (macOS/iOS)
- Zoom: 200%, 400% browser zoom
- Color blindness: Simulate via dev tools

#### Checklist per Release
- [ ] All pages: axe-core zero violations
- [ ] Keyboard navigation: full coverage
- [ ] Screen reader: all content announced correctly
- [ ] Focus management: no traps, logical order
- [ ] Color contrast: all text meets AA
- [ ] Forms: labels, errors, validation accessible
- [ ] Mobile: touch targets, gestures, orientation