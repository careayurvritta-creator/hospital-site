# EGM-13: State Management Architecture

## Overview
The application uses a lightweight React state management pattern with no external state library (no Redux, no Zustand, no MobX). All state is managed through React's built-in hooks (useState, useEffect, useContext) with localStorage persistence where needed.

## State Management Strategy

### Decision: No Global State Library
**Rationale:**
- Application is small enough (14 pages, 5 tools) that global state is not needed
- Most state is page-local and doesn't need to cross component boundaries
- Context API is sufficient for truly global state (language, consent, analytics)
- Reduces bundle size (~200KB saved by avoiding Redux toolkit)
- Simplifies testing — no mock stores needed

### State Classification

| State Type | Where Stored | Persistence | Examples |
|------------|-------------|-------------|----------|
| **Transient** | useState (component-local) | None | Form inputs, modal open/close, tab selection |
| **Session** | useState (lifted to common parent) | None | Tool answers, booking form data |
| **Persistent** | localStorage | Browser | Language preference, consent decisions |
| **Global Context** | React Context API | localStorage | Language, consent, analytics session |

## Context API Usage

### LanguageContext
```tsx
interface LanguageContextValue {
  language: 'en' | 'hi' | 'gu';
  setLanguage: (lang: 'en' | 'hi' | 'gu') => void;
  t: (key: string) => string; // translation lookup
}

// Provider wraps entire app
<LanguageProvider>
  <App />
</LanguageProvider>
```
- **Scope**: Application-wide
- **Persistence**: localStorage key `ayur-language`
- **Fallback**: 'en' if not set
- **Re-renders**: All consumers re-render on language change (acceptable — small app)

### AnalyticsContext
```tsx
interface AnalyticsContextValue {
  track: (event: AnalyticsEvent) => void;
  consent: ConsentState;
  session_id: string;
}
```
- **Scope**: Application-wide
- **Persistence**: Session ID regenerated per browser session
- **Consent gate**: Events blocked if analytics consent not granted

## Component State Patterns

### Lifting State Up
Used when multiple sibling components need shared state:
```
Tools.tsx (parent)
  ├─ useState: selectedTool
  ├─ useState: toolResults
  │
  ├─ LifestyleTool (props: onSelect, onComplete)
  ├─ PanchakarmaTool (props: onSelect, onComplete)
  └─ MedaTool (props: onSelect, onComplete)
```

### State Persistence Pattern
```tsx
// Tool state saved to localStorage for resume
const [answers, setAnswers] = useState(() => {
  const saved = localStorage.getItem(`tool-${toolId}-answers`);
  return saved ? JSON.parse(saved) : {};
});

useEffect(() => {
  localStorage.setItem(`tool-${toolId}-answers`, JSON.stringify(answers));
}, [answers, toolId]);
```

### Controlled Components
All form inputs use controlled components:
```tsx
const [formData, setFormData] = useState({
  name: '',
  email: '',
  phone: '',
  preferredDate: ''
});

const updateField = (field: string, value: string) => {
  setFormData(prev => ({ ...prev, [field]: value }));
};
```

## State Anti-Patterns (Avoided)

### Not Used
- **Redux**: Overkill for 14-page app; state doesn't need time-travel debugging
- **Zustand**: Good library but adds 15KB bundle for no real benefit
- **MobX**: Steep learning curve; React hooks are sufficient
- **Apollo Client**: No GraphQL backend to cache
- ** recoil**: Experimental; unnecessary complexity

### Why This Works
- Most state is truly local (form inputs, UI toggles)
- What needs sharing is small (language, consent) — Context is perfect
- Tool state is persisted to localStorage, not shared between tools
- No derived state complexity (no useMemo needed for simple calculations)

## Performance Considerations

### Re-render Optimization
- `React.memo` on: Tool components, Service cards, Blog post cards
- `useCallback` for: event handlers passed to child components
- `useMemo` for: expensive calculations (tool scoring, recipe matching)
- Context splitting: separate contexts for language vs. analytics (prevent unrelated re-renders)

### Context Splitting Pattern
```
App.tsx
├─ LanguageProvider (re-renders on language change)
├─ AnalyticsProvider (re-renders on consent change)
└─ CookieConsentProvider (re-renders on consent interaction)
```
Each provider only re-renders its own consumers, not the entire app.

## Testing Strategy
- Render hooks in isolation for custom hooks
- Mock localStorage for persistence tests
- Test context providers with `@testing-library/react`
- Component tests verify state transitions (form submission, tool completion)