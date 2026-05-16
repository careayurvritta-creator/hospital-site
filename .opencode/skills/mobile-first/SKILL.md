---
name: mobile-first
description: Mobile-first responsive design rules for Ayurvritta Ayurveda Hospital website. Enforces touch targets >= 48px, mobile-first Tailwind breakpoints (xs:375, sm:640, md:768, lg:1024), safe-area insets, mobile navigation, form optimization, and performance rules. PROACTIVELY activate when editing any page, component, or layout.
license: MIT
compatibility: opencode
metadata:
  audience: frontend-developers
  framework: react-tailwind
  project: ayurvritta-ayurveda-hospital
---

# Mobile-First Design Rules — Ayurvritta Website

## Project Context

- **Framework**: React 19 + Vite + TypeScript
- **Styling**: Tailwind CSS v3.4.1
- **Breakpoints**: `xs:375px`, `sm:640px`, `md:768px`, `lg:1024px`, `xl:1280px`, `2xl:1536px`
- **Fonts**: Montserrat (sans), Philosopher (serif)
- **PWA**: Service worker, manifest, apple-touch-icon configured

## Iron Laws

1. **ALWAYS write base styles for mobile first** — no prefix = mobile. Add `sm:`, `md:`, `lg:` to scale up.
2. **NEVER set touch targets below 48px** — use `min-h-[48px] min-w-[48px]` or `min-h-touch min-w-touch` for all interactive elements (buttons, links, inputs, cards).
3. **ALWAYS use relative units (rem)** for typography — never fixed `px` for font sizes. Use Tailwind `text-sm`, `text-base`, `text-lg`, etc.
4. **NEVER omit viewport meta** — already in `index.html`, verify it stays: `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />`
5. **ALWAYS test on 375px width** (iPhone SE) — this is the `xs` breakpoint and the smallest target.

## Mobile Navigation Rules

- Desktop nav (horizontal links) must collapse to hamburger/bottom nav on mobile
- Use `hidden md:flex` for desktop nav, `md:hidden` for mobile toggle
- Mobile nav overlay must have:
  - Full-screen or slide-down panel
  - Close button with 48px touch target
  - Backdrop blur or dark overlay
  - Smooth animation (use existing `animate-slideDown`, `animate-fadeIn`)

## Mobile Form Optimization

- All form inputs must have `min-h-[48px]` for touch targets
- Use `type="tel"` for phone, `type="email"` for email inputs
- Add `inputMode` attributes: `inputMode="numeric"` for numbers, `inputMode="decimal"` for decimals
- Labels must be visible (not placeholder-only) — use floating labels or top labels
- Error messages must be visible without scrolling
- Submit buttons must be full-width on mobile: `w-full md:w-auto`
- Avoid horizontal scrolling in forms

## Tool Assessment Mobile Rules

All assessment tools (`LifestyleTool`, `PanchakarmaTool`, `MedaTool`, `SaaraTool`, `PrakritiTool`, `DietChartTool`):

- Question cards must be single-column on mobile
- Option buttons must be full-width with 48px min height
- Progress bar must be visible and not overlap content
- Loading animation must not cause layout shift
- Results must stack vertically on mobile
- Back/Next buttons must be fixed at bottom or clearly visible
- No horizontal overflow — use `overflow-x-hidden` on container

## Safe-Area Inset Handling

For notched devices (iPhone X+):

```tsx
// Top padding for notch
className="pt-safe-top" // or pt-[env(safe-area-inset-top)]

// Bottom padding for home indicator
className="pb-safe-bottom" // or pb-[env(safe-area-inset-bottom)]

// Full height with safe area
className="min-h-screen-safe" // or min-h-screen-safe
```

Already configured in `tailwind.config.js`:
- `safe-top`, `safe-bottom`, `safe-left`, `safe-right` spacing
- `min-h-screen-safe`
- `min-h-touch` (48px), `min-h-touch-lg` (56px)

## Responsive Typography Rules

Scale text appropriately across devices:

```tsx
// Hero headings
className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold"

// Section headings
className="text-2xl sm:text-3xl md:text-4xl font-bold"

// Body text
className="text-sm sm:text-base md:text-lg"

// Small text / captions
className="text-xs sm:text-sm"
```

## Responsive Spacing Rules

```tsx
// Section padding
className="px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-24"

// Card padding
className="p-4 sm:p-6 md:p-8"

// Gap between items
className="gap-4 md:gap-6 lg:gap-8"
```

## Responsive Grid Rules

```tsx
// Tool cards
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// Stats/features
className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"

// Partner logos
className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
```

## Show/Hide Breakpoint Rules

```tsx
// Mobile only
className="block md:hidden"

// Desktop only
className="hidden md:block"

// Tablet and up
className="hidden sm:block"

// Large screens only
className="hidden lg:block"
```

## Image Optimization Rules

- All images must have `loading="lazy"` (except hero/above-fold)
- Use `object-cover` with explicit aspect ratios
- Max width: `max-w-full h-auto`
- Hero images: use `object-cover` with responsive heights

## Performance Rules

- Lazy load below-fold images and components
- Use `React.lazy()` for tool components (already done in Tools.tsx)
- Defer non-critical CSS
- Avoid inline styles that cause reflows
- Use CSS animations over JS animations where possible

## Anti-Patterns (NEVER DO)

| Anti-Pattern | Why It Fails | Correct Approach |
|---|---|---|
| Desktop-first CSS with mobile overrides | Mobile overrides fight specificity cascade | Write base for mobile, use `sm:` `md:` `lg:` to scale up |
| Touch targets < 48px | iOS/Android guidelines violated, users mis-tap | `min-h-[48px] min-w-[48px]` on all interactive elements |
| Fixed px font sizes | OS accessibility scaling ignored | Use Tailwind text utilities: `text-sm`, `text-base`, etc. |
| Horizontal overflow | Breaks mobile viewport, causes scroll | `overflow-x-hidden` on containers, `max-w-full` on content |
| Fixed heights on content | Content overflows on small screens | Use `min-h` instead of `h`, let content dictate height |
| Hover-only interactions | No hover on touch devices | Always provide tap/click alternative to hover states |
| Large padding on mobile | Wastes precious screen space | `p-4` mobile, `p-6 md:p-8` on larger screens |

## Mobile Testing Checklist

Before marking any page as mobile-ready:

- [ ] Test at 375px width (iPhone SE)
- [ ] Test at 414px width (iPhone 14 Pro Max)
- [ ] Test at 768px width (iPad)
- [ ] All touch targets >= 48px
- [ ] No horizontal scroll
- [ ] Text is readable without zooming
- [ ] Forms are usable with mobile keyboard
- [ ] Navigation works with thumb reach
- [ ] Images load and scale correctly
- [ ] Animations don't cause jank
- [ ] Safe-area insets respected on notched devices
