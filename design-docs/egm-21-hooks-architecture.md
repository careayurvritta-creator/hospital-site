# EGM-21: Custom Hooks Architecture

## Overview
The application uses **8 custom hooks** (not 7) to encapsulate reusable logic across components. All hooks are located in `hooks/` directory and exported via `hooks/index.ts` barrel file. The hooks follow React Hooks conventions with single responsibility and composability.

> **Correction from EGM Review**: Previous version claimed 7 hooks including `useDebounce`, `useLocalStorage`, `useMediaQuery`, `useScrollDirection`, `useLanguage`, `useAnalytics` — these do NOT exist as hook files. `useLanguage` and `useAnalytics` are context consumers from `contexts/`, not standalone hooks.

---

## Hook Inventory (Actual Codebase)

| Hook | File | Purpose | Key Dependencies |
|------|------|---------|------------------|
| `useScrollProgress` | `hooks/useScrollProgress.ts` | Tracks scroll position for progress bars, parallax effects, scroll direction detection | `useState`, `useEffect`, `useRef`, `useCallback` |
| `useRecommendations` | `hooks/useRecommendations.ts` | Personalized service recommendations via `recommendationEngine` | `useState`, `useEffect`, `useCallback`, `analytics/recommendationEngine` |
| `usePersonalization` | `hooks/usePersonalization.ts` | Personalized content based on user behavior segments | `useState`, `useEffect`, `useCallback`, `analytics/userSegmentation` |
| `useMobileDevice` | `hooks/useMobileDevice.ts` | Mobile device info, network status, orientation, content strategy, thumb zones | `useState`, `useEffect`, `analytics/mobileDeviceDetector` |
| `useIntersectionObserver` | `hooks/useIntersectionObserver.ts` | Scroll-triggered animations, viewport entry/exit detection | `useState`, `useEffect`, `useRef`, `useCallback`, `IntersectionObserver API` |
| `useExitIntent` | `hooks/useExitIntent.ts` | Detects user exit intent, triggers modal/offers | `useState`, `useEffect`, `useCallback`, `analytics/eventTracker` |
| `useABTest` | `hooks/useABTest.ts` | A/B testing variant assignment and conversion tracking | `useState`, `useEffect`, `useCallback`, `analytics/abTestManager` |
| **Barrel Export** | `hooks/index.ts` | Re-exports all hooks + additional utilities (`useIntersectionObserverMultiple`, `useScrollProgressElement`, `useParallax`, `useNetworkStatus`, `useOrientation`) | — |

---

## Hook Details

### 1. `useScrollProgress` (`hooks/useScrollProgress.ts`)
**Returns**: `{ progress: 0-1, scrollY: number, scrollDirection: 'up'|'down'|null, isScrolled: boolean }`
**Exports**: Also exports `useScrollProgressElement` (element-relative) and `useParallax` (parallax offset)

### 2. `useRecommendations` (`hooks/useRecommendations.ts`)
**Returns**: `{ recommendations, trending, isLoading, recordView, recordInteraction, getByDosha, getSimilar }`
**Integrates with**: `analytics/recommendationEngine.ts` — personalized ML-style recommendations

### 3. `usePersonalization` (`hooks/usePersonalization.ts`)
**Returns**: `{ content: PersonalizedContent, segment: UserSegment, isLoading }`
**Segments**: `new_visitor`, `returning_visitor`, `engaged_user`, `high_intent`, `converted_user`
**Content varies**: hero headline, CTA, featured services, welcome message, special offers

### 4. `useMobileDevice` (`hooks/useMobileDevice.ts`)
**Returns**: 
- `deviceInfo: MobileDeviceInfo` (type, brand, model, os, screen, pixelRatio, touchSupport)
- `isMobile`, `isTablet`, `isSlowNetwork` booleans
- `orientation: 'portrait'|'landscape'`
- `contentStrategy`: images (`high`|`medium`|`low`), video (`autoplay`|`poster`|`link`), animations, lazyLoadThreshold
- `thumbZone`: safe/natural/stretch zones for mobile UX
**Integrates with**: `analytics/mobileDeviceDetector.ts`

### 5. `useIntersectionObserver` (`hooks/useIntersectionObserver.ts`)
**Options**: `threshold`, `rootMargin`, `triggerOnce`, `freezeOnceVisible`
**Returns**: `{ ref, isVisible, hasBeenVisible }`
**Exports**: Also exports `useIntersectionObserverMultiple` for tracking multiple elements

### 6. `useExitIntent` (`hooks/useExitIntent.ts`)
**Options**: `threshold` (px from top), `timeout` (ms), `triggerOnMobile`, `onExitIntent` callback
**Returns**: `{ hasTriggered, isVisible, triggerCount, show, hide, reset }`
**Integrates with**: `analytics/eventTracker.ts` for exit intent event logging

### 7. `useABTest` (`hooks/useABTest.ts`)
**Parameter**: `testId: string`
**Returns**: `{ variant: ABTestVariant|null, isControl: boolean, variantId: string|null, trackConversion }`
**Integrates with**: `analytics/abTestManager.ts` + `DEFAULT_AB_TESTS`
**Default tests**: `hero_headline`, `cta_button`, `service_card_layout`, `pricing_display`

### 8. Barrel File (`hooks/index.ts`)
```typescript
export { usePersonalization } from './usePersonalization';
export { useExitIntent } from './useExitIntent';
export { useABTest, useABTestVariants } from './useABTest';
export { useRecommendations } from './useRecommendations';

// Mobile Hooks
export { useMobileDevice, useNetworkStatus, useOrientation } from './useMobileDevice';

// Animation Hooks (UI-UX Pro Max)
export { useIntersectionObserver, useIntersectionObserverMultiple } from './useIntersectionObserver';
export { useScrollProgress, useScrollProgressElement, useParallax } from './useScrollProgress';
```

---

## Analytics Integration
All hooks integrate with the `analytics/` module:
- `eventTracker.ts` — event logging
- `recommendationEngine.ts` — personalized recommendations
- `userSegmentation.ts` — behavioral segmentation
- `mobileDeviceDetector.ts` — device capability detection
- `abTestManager.ts` — A/B test variant management
- `performanceMonitor.ts` — Core Web Vitals tracking
- `mobileScrollTracker.ts` — scroll behavior analytics

---

## Usage Patterns

```tsx
// In components
import { useScrollProgress, useIntersectionObserver, useMobileDevice } from '@/hooks';

function HeroSection() {
  const { progress, scrollDirection } = useScrollProgress();
  const { isMobile, contentStrategy } = useMobileDevice();
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.3 });
  
  return (
    <section ref={ref} className={isVisible ? 'animate-fade-in' : ''}>
      {/* progress-based parallax, mobile-optimized images */}
    </section>
  );
}
```

---

## Corrected Claims (vs Previous Version)

| Previous Claim | Actual Codebase |
|----------------|-----------------|
| 7 hooks total | **8 hook files + barrel export** |
| `useDebounce` exists | ❌ Not in codebase |
| `useLocalStorage` exists | ❌ Not in codebase |
| `useMediaQuery` exists | ❌ Not in codebase (use `useMobileDevice` instead) |
| `useScrollDirection` exists | ❌ Part of `useScrollProgress` return value |
| `useLanguage` hook exists | ❌ It's `useTranslation` from `contexts/LanguageContext.tsx` |
| `useAnalytics` hook exists | ❌ It's `useAnalytics` from `contexts/AnalyticsContext.tsx` |
| Hooks in `hooks/` only | ✅ Correct |
| Barrel export exists | ✅ `hooks/index.ts` exports 15+ named exports |

---

## Architecture Notes
- **No redundant hooks**: Each hook serves distinct domain (scroll, mobile, personalization, analytics, animation, exit-intent, A/B testing)
- **Analytics-first design**: Most hooks integrate with `analytics/` module for behavioral tracking
- **Mobile-aware**: `useMobileDevice` provides comprehensive device strategy (images, video, animations, thumb zones)
- **Performance**: `useIntersectionObserver` and `useScrollProgress` use `useRef`/`useCallback` to minimize re-renders
- **TypeScript**: All hooks fully typed with explicit return interfaces