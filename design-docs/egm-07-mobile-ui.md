# EGM-07: Mobile UI Architecture

## Overview
The mobile UI system consists of 5 dedicated components (`MobileHeader`, `MobileCTABar`, `MobileBottomNav`, `MobileConsent`, plus responsive layout patterns) designed for touch-first interaction on Ayurveda hospital's mobile users. The system uses a bottom navigation pattern common in Indian healthcare apps.

## Mobile Component Architecture

### MobileHeader
- **Position**: Sticky top bar (fixed position)
- **Elements**: Logo (left), hamburger menu (right), language switcher (right)
- **Behavior**: 
  - Collapses on scroll (transforms to compact state)
  - Hamburger expands into full-screen overlay menu
  - Language switcher persists across navigation
- **Z-index**: 100 (above all content)
- **Touch target**: 44x44px minimum for all interactive elements

### MobileCTABar (Floating Action Bar)
- **Position**: Fixed bottom-right, floats above content
- **Primary actions**: "Book Appointment" (green), "Call Hospital" (blue)
- **Visibility**: Appears on scroll down, hides on scroll up
- **Expanded state**: Shows 4 quick actions (call, book, directions, WhatsApp)
- **Animation**: Smooth slide-up with 200ms transition
- **Z-index**: 90 (above bottom nav, below header)

### MobileBottomNav
- **Position**: Fixed bottom bar
- **Icons**: 5 tabs — Home, Services, Tools, Blog, Contact
- **Active state**: Green accent bar + icon color change
- **Behavior**: 
  - Hides on scroll down (re-appears on scroll up)
  - Smooth slide animation
  - Touch ripple effect on tap
- **Z-index**: 80
- **Background**: Semi-transparent with backdrop-blur

### MobileConsent
- **Purpose**: GDPR/DPDP consent banner for mobile
- **Placement**: Bottom sheet (not modal — less intrusive on mobile)
- **Actions**: Accept All, Reject Non-Essential, Customize
- **Behavior**: 
  - Collapsible detail section
  - Persistent until user interacts
  - Reappears if consent is cleared
- **Touch**: Swipeable bottom sheet on iOS/Android

## Responsive Breakpoints
```
xs: 0-375px     (small phones)
sm: 376-640px   (standard phones)
md: 641-768px   (tablets portrait)
lg: 769-1024px  (tablets landscape)
xl: 1025px+     (desktop)
```

## Mobile-Specific Patterns

### Touch-First Design
- All buttons: minimum 48x48px touch target
- Swipeable components: 100px minimum swipe distance
- Pull-to-refresh: not implemented (content is static)
- Gesture support: only for menu toggle (hamburger)

### Scroll Behavior
- Header: collapses from 80px to 60px on scroll
- CTA bar: slides in/out based on scroll direction
- Bottom nav: hides on scroll down (save screen space)
- All transitions: 200ms ease-in-out

### Form Optimization
- All inputs: `inputmode` attribute set for correct keyboard
- Date inputs: native picker on mobile
- Select inputs: bottom sheet picker (not dropdown)
- Submit: sticky bottom button (always visible)
- Validation: inline (not on submit only)

### Image Handling
- Lazy loading: `loading="lazy"` on all images
- Responsive images: `srcset` with 3 breakpoints
- Aspect ratio: 16:9 for hero, 4:3 for service cards
- Fallback: Unsplash placeholder with service-specific query

## Performance Optimizations
- **Critical CSS**: Above-the-fold styles inlined
- **Font loading**: Preload key web fonts
- **Image CDN**: All images served via Unsplash with auto-format
- **Debounce**: Scroll handlers debounced at 16ms (60fps)
- **Passive listeners**: All scroll listeners use `{ passive: true }`

## Accessibility (Mobile)
- Screen reader: All interactive elements have `aria-label`
- VoiceOver: Navigation landmarks properly marked
- High contrast: WCAG AA compliant color ratios
- Focus management: Focus trap in mobile menu overlay
- Reduced motion: Respects `prefers-reduced-motion`