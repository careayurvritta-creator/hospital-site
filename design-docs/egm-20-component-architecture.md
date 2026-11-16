# EGM-20: Component Architecture

## Overview
The application follows a component-based architecture with clear separation between page components, feature components, UI primitives, and layout components. Total: ~60 components across 5 categories.

## Component Hierarchy

```
App
└── Layout (Provider: Language, Analytics, CookieConsent)
    ├── MobileHeader
    ├── DesktopNav
    ├── MobileCTABar
    ├── MobileBottomNav
    ├── MobileConsent
    │
    ├── Routes (React Router)
    │   ├── Home
    │   ├── Services
    │   ├── ServiceDetail
    │   ├── Programs
    │   ├── Blog
    │   ├── BlogPost
    │   ├── About
    │   ├── Contact
    │   ├── Booking
    │   ├── Insurance
    │   ├── SkinCare
    │   ├── Tools
    │   ├── Terms
    │   └── PrivacyPolicy
    │
    └── Footer
```

## Component Categories

### 1. Layout Components (6)
| Component | Purpose | Location |
|-----------|---------|----------|
| `Layout.tsx` | Root wrapper, providers, header/footer | `components/Layout.tsx` |
| `MobileHeader.tsx` | Sticky top bar, logo, menu, lang switcher | `components/mobile/` |
| `DesktopNav.tsx` | Horizontal nav with dropdowns | `components/Layout.tsx` (inline) |
| `MobileCTABar.tsx` | Floating call/book buttons | `components/mobile/` |
| `MobileBottomNav.tsx` | 5-tab bottom navigation | `components/mobile/` |
| `MobileConsent.tsx` | Bottom sheet cookie consent | `components/mobile/` |
| `Footer.tsx` | Site footer with links | `components/Layout.tsx` (inline) |

### 2. Page Components (14)
| Component | Route | Key Sub-components |
|-----------|-------|-------------------|
| `Home.tsx` | `/` | Hero, ServiceCards, TestimonialsCarousel, TrustBadges |
| `Services.tsx` | `/services` | ServiceGrid, CategoryFilter |
| `ServiceDetail.tsx` | `/services/:id` | Hero, DetailsTabs, BookingCTA, RelatedServices |
| `Programs.tsx` | `/programs` | ProgramCard, DeepLinkScroll |
| `Blog.tsx` | `/blog` | PostGrid, CategoryFilter, SearchBar |
| `BlogPost.tsx` | `/blog/:slug` | Article, RelatedPosts, ShareButtons |
| `About.tsx` | `/about` | TeamGrid, Values, History |
| `Contact.tsx` | `/contact` | ContactForm, Map, InfoCards |
| `Booking.tsx` | `/booking` | BookingForm, DateTimePicker, Confirmation |
| `Insurance.tsx` | `/insurance` | AIAnalyzer, PartnerGrid, CashlessTimeline |
| `SkinCare.tsx` | `/skin-care` | ConditionGrid, TreatmentCards |
| `Tools.tsx` | `/tools` | ToolTabs, ToolRenderer (5 tools) |
| `Terms.tsx` | `/terms` | Static content |
| `PrivacyPolicy.tsx` | `/privacy` | Static content |

### 3. Feature Components (25+)

#### Tools (5)
| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `LifestyleTool.tsx` | Daily routine assessment | 12 questions, lifestyle score |
| `PanchakarmaTool.tsx` | Treatment matching | 10 questions, program recommendation |
| `MedaTool.tsx` | Weight management | BMI, waist, diet analysis |
| `SaaraTool.tsx` | Hair health | Scalp/hair analysis, remedies |
| `PrakritiTool.tsx` | Dosha constitution | 45 questions, radar chart |

#### Insurance Features
| Component | Purpose |
|-----------|---------|
| `AIAnalyzer` (inline) | Policy upload → OCR → AI analysis |
| `PartnerGrid` (inline) | Filterable partner display |
| `CashlessTimeline` (inline) | 5-step journey visualization |

#### Blog Features
| Component | Purpose |
|-----------|---------|
| `PostCard.tsx` | Blog post preview card |
| `CategoryFilter.tsx` | Category pill filter |
| `SearchBar.tsx` | Client-side search |
| `RelatedPosts.tsx` | 3-4 related articles |

#### UI Features
| Component | Purpose |
|-----------|---------|
| `TestimonialsCarousel.tsx` | Auto-playing testimonial slider |
| `TrustBadges.tsx` | Certifications, awards, stats |
| `WhatsAppBubble.tsx` | Floating WhatsApp chat button |
| `VoiceInput.tsx` | Speech-to-text for chat |
| `LocationExplorer.tsx` | Interactive map for hospital location |
| `ExitIntentPopup.tsx` | Newsletter capture on exit |
| `FeedbackCollector.tsx` | Post-interaction feedback |
| `FAQ.tsx` | Accordion FAQ component |
| `CookieConsent.tsx` | Desktop consent banner |
| `DateTimePicker.tsx` | Custom date/time picker for booking |
| `ShareResults.tsx` | Social share + copy link for tools |
| `SocialProof.tsx` | Dynamic social proof notifications |
| `AnalyticsDashboard.tsx` | Internal metrics dashboard |
| `ChatToolCard.tsx` | AI chat tool recommendation card |
| `ChatToolRegistry.tsx` | Registry for chat-integrated tools |

### 4. UI Primitives (11 ReactBits Components)
| Component | Purpose | Source |
|-----------|---------|--------|
| `Aurora.tsx` | Animated gradient background | reactbits.dev |
| `RotatingText.tsx` | Text rotation animation | reactbits.dev |
| `SplitText.tsx` | Character/word split animation | reactbits.dev |
| `SpotlightCard.tsx` | Hover spotlight effect card | reactbits.dev |
| `TiltedCard.tsx` | 3D tilt on hover | reactbits.dev |
| `AnimatedList.tsx` | Staggered list animation | reactbits.dev |
| `BorderGlow.tsx` | Animated border glow | reactbits.dev |
| `Counter.tsx` | Animated number counter | reactbits.dev |
| `ElasticSlider.tsx` | Elastic drag slider | reactbits.dev |
| `OptionWheel.tsx` | Spinning option selector | reactbits.dev |
| `Stepper.tsx` | Animated step indicator | reactbits.dev |

### 5. Utility Components (8)
| Component | Purpose |
|-----------|---------|
| `SEOHead.tsx` | Meta tags + JSON-LD injection |
| `NavLink.tsx` | Styled router link with active state |
| `ScrollCards.tsx` | Horizontal scrolling card container |
| `useIntersectionObserver.ts` | Hook for scroll-triggered animations |
| `useDebounce.ts` | Debounce hook for search/input |
| `captureError.ts` | Error boundary + analytics capture |
| `extractTextFromFile.ts` | Client-side PDF/image text extraction |
| `aiService.ts` | Unified AI service (Nvidia NIM) |

## Component Design Patterns

### Composition over Inheritance
```tsx
// Good: Composable
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer><Button>Action</Button></Card.Footer>
</Card>

// Avoided: Prop drilling variants
<Card variant="elevated" hasHeader hasFooter onAction={...} />
```

### Props Interface Pattern
```typescript
// Consistent prop naming
interface ComponentProps {
  // Required
  title: string;
  // Optional with defaults
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  // Callbacks
  onAction?: (data: ActionData) => void;
  // Render props / slots
  children?: React.ReactNode;
  // HTML attributes
  className?: string;
  'data-testid'?: string;
}
```

### Forward Ref for DOM Access
```tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => (
    <button ref={ref} {...props}>{children}</button>
  )
);
Button.displayName = 'Button';
```

### Compound Components (ReactBits Pattern)
```tsx
// Stepper compound component
<Stepper>
  <Stepper.Step completed>Step 1</Stepper.Step>
  <Stepper.Step current>Step 2</Stepper.Step>
  <Stepper.Step>Step 3</Stepper.Step>
</Stepper>
```

## State Management in Components

### Local State (useState)
- Form inputs, UI toggles, modal visibility
- Tool answers (persisted to localStorage)

### Context Consumers
```tsx
// Language
const { t, language } = useLanguage();

// Analytics
const { track } = useAnalytics();

// Consent
const { consent } = useConsent();
```

### No External State Library
- No Redux, Zustand, MobX
- Lifting state up for sibling communication
- Props for parent-child communication

## Performance Patterns

### React.memo for Pure Components
```tsx
const ServiceCard = React.memo(({ service, onClick }) => (
  <article className="..." onClick={onClick}>...</article>
));
ServiceCard.displayName = 'ServiceCard';
```

### Lazy Loading
```tsx
// Page-level (automatic via React Router)
// Component-level for heavy features
const InsuranceAIAnalyzer = React.lazy(() => import('./InsuranceAIAnalyzer'));

// In render
<Suspense fallback={<Skeleton />}>
  <InsuranceAIAnalyzer />
</Suspense>
```

### Callback Stabilization
```tsx
const handleSelect = useCallback((option: Option) => {
  setAnswers(prev => ({ ...prev, [questionId]: option }));
}, [questionId]);
```

## Styling Approach

### Tailwind CSS (Utility-First)
- All styling via Tailwind classes
- Custom theme in `tailwind.config.js` (colors, fonts, spacing)
- No CSS-in-JS, no CSS Modules, no styled-components

### Responsive Design
- Mobile-first: base classes + `sm:`, `md:`, `lg:`, `xl:`
- Breakpoints: 640, 768, 1024, 1280
- Container queries: Not used (Tailwind v3)

### Dark Mode
- Not implemented (light theme only)
- CSS variables for colors (easy to add dark mode)

## Accessibility Patterns

### Semantic HTML First
- `<button>` not `<div onClick>`
- `<nav>` for navigation
- `<main>` for content
- `<section aria-labelledby>` for regions

### ARIA When Needed
- `aria-label` for icon buttons
- `aria-expanded` for dropdowns
- `aria-live` for dynamic content
- `role="dialog"` for modals

## Testing Patterns

### Component Test Structure
```tsx
// ComponentName.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles interaction', () => {
    const handleClick = vi.fn();
    render(<ComponentName onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

## Component Inventory Summary

| Category | Count | Lines (est) |
|----------|-------|-------------|
| Layout | 7 | 800 |
| Pages | 14 | 4,500 |
| Features | 25+ | 6,000 |
| UI Primitives | 11 | 2,200 |
| Utilities | 8 | 1,500 |
| **Total** | **~65** | **~15,000** |

## Refactoring Opportunities

### High Impact
1. **Extract Insurance sub-components** (816-line file → 5 components)
2. **Code-split ReactBits** (only load used animations)
3. **Create shared Form components** (Booking, Contact, Tools share patterns)
4. **Extract Tool base component** (5 tools share 80% logic)

### Medium Impact
5. **TypeScript strict mode** (enable in tsconfig)
6. **Component prop documentation** (Storybook or TSDoc)
7. **Visual regression baselines** (Chromatic or Playwright)