# EGM-04: Routing & Navigation Architecture

## Overview
The application uses React Router v6 with a HashRouter fallback strategy. All routing is client-side with a 14-route surface spanning marketing pages, tools, legal pages, and blog infrastructure.

## Route Inventory

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Home | Landing page with hero, services overview, testimonials |
| `/services` | Services | 9 service categories grid |
| `/services/:id` | ServiceDetail | Individual service detail with booking CTA |
| `/programs` | Programs | 5 specialized treatment programs |
| `/programs#anchor` | Programs | Deep-link anchors for program cards |
| `/blog` | Blog | Published post grid with category filtering |
| `/blog/:slug` | BlogPost | Individual post with full content + related posts |
| `/about` | About | Hospital overview, team, values |
| `/contact` | Contact | Contact form + location + phone |
| `/booking` | Booking | Appointment booking form |
| `/insurance` | Insurance | Insurance partners + AI policy analysis |
| `/skin-care` | SkinCare | Skin condition authority page |
| `/tools` | Tools | 5 interactive health assessment tools |
| `/terms` | Terms | Terms of service |
| `/privacy` | PrivacyPolicy | GDPR/DPDP-compliant privacy policy |

## Routing Architecture

### Router Configuration
```tsx
// App.tsx
<BrowserRouter>
  <Layout>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route path="/services/:id" element={<ServiceDetail />} />
      <Route path="/programs" element={<Programs />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/insurance" element={<Insurance />} />
      <Route path="/skin-care" element={<SkinCare />} />
      <Route path="/tools" element={<Tools />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
    </Routes>
  </Layout>
</BrowserRouter>
```

### Layout Component
- **MobileHeader**: Sticky top bar with logo, hamburger menu, language switcher
- **MobileCTABar**: Floating bottom bar with booking + call buttons (visible on scroll)
- **MobileBottomNav**: 5-icon tab bar for mobile navigation
- **DesktopNav**: Full horizontal navigation with dropdowns
- **LanguageContext**: React Context providing current language (en/hi/gu) with persistence

### Navigation Patterns
- All internal links use `NavLink` component with active state styling
- Service detail pages have breadcrumb navigation
- Blog pages have "back to blog" + related post navigation
- Program pages support hash-based deep linking (`/programs#thyroid`)
- All pages have fallback image constants for graceful degradation

## Navigation Flow

```
Home ──> Services ──> ServiceDetail ──> Booking
  │          │
  ├─> Programs (hash anchors)
  ├─> Blog ──> BlogPost (related posts)
  ├─> Tools ──> Individual tool components
  ├─> Insurance (AI policy analysis)
  ├─> SkinCare (condition authority page)
  ├─> About / Contact
  └─> Terms / Privacy (legal)
```

## Key Design Decisions

1. **Client-side routing**: No server-side rendering; all routes handled by React Router
2. **Hash fallback**: Program pages use hash anchors for deep linking within the same route
3. **Lazy loading**: All pages are eagerly imported (no React.lazy — bundle is small enough)
4. **404 handling**: Implicit — unmatched routes render the Home component (SPA fallback)
5. **Scroll behavior**: Program pages use `scrollIntoView` for hash anchor navigation
6. **Language persistence**: Language preference stored in localStorage via LanguageContext

## Performance Considerations
- All routes are code-split at the page level (implicit via React Router)
- IntersectionObserver hooks used for lazy loading content sections
- Navigation transitions are CSS-based (no JS animation libraries on route changes)