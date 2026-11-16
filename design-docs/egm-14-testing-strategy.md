# EGM-14: Testing Strategy

## Overview
This document describes the **actual** test infrastructure in the codebase and a recommended testing strategy. The previous version claimed "no automated test suite" — **that was incorrect**. A minimal test suite exists.

---

## Current State (Actual)

### Installed Tooling (from `package.json`)
| Tool | Status | Version |
|------|--------|---------|
| **Vitest** | ✅ Installed (devDependency) | ^4.1.5 |
| **@testing-library/react** | ✅ Installed (devDependency) | ^16.3.2 |
| **@testing-library/jest-dom** | ✅ Installed (devDependency) | ^6.9.1 |
| **jsdom** | ✅ Installed (devDependency) | ^29.1.1 |
| **Playwright** | ❌ NOT installed | — |
| **MSW (Mock Service Worker)** | ❌ NOT installed | — |
| **axe-core** | ❌ NOT installed | — |

### Test Scripts (from `package.json`)
```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

### Actual Test Files (5 files)
```
tests/
├── setup.ts                          # Vitest global setup (matchMedia, IntersectionObserver, ResizeObserver mocks)
├── translations.test.ts              # i18n translation key verification (3 languages × nav/hero/footer sections)
├── autopost.test.ts                  # Blog auto-poster CLI integration test (offline deterministic path)
├── hooks/
│   └── useIntersectionObserver.test.tsx  # Custom hook test with fake timers
└── analytics/
    └── errorTracker.test.ts          # errorTracker.ts exports + basic captureError behavior
```

### Test Coverage
- **Unit tests**: 5 files (very limited scope)
- **Integration tests**: 0 files
- **E2E tests**: 0 files
- **Test coverage**: Not measured (no `npm run test:coverage` run in CI)
- **CI pipeline**: No test execution step (no `.github/workflows/test.yml`)

---

## Recommended Test Architecture (Target State)

### Tooling Stack Additions Needed
| Layer | Tool | Install Command | Rationale |
|-------|------|-----------------|-----------|
| Unit | **Already have**: Vitest + RTL + jsdom | — | Fast, Vite-native, modern API |
| Integration | **Add**: MSW | `npm i -D msw` | API mocking for integration tests |
| E2E | **Add**: Playwright | `npm i -D @playwright/test && npx playwright install` | Cross-browser, reliable, good CI support |
| Visual | **Add**: Playwright (built-in) | — | No extra deps, snapshot testing |
| A11y | **Add**: axe-core + jest-axe | `npm i -D axe-core jest-axe` | Integrated into unit/E2E |

### Recommended Test Organization
```
tests/
├── setup.ts                          # KEEP - existing global setup
├── unit/
│   ├── lib/
│   │   ├── aiService.test.ts         # NEW - core AI service behavior
│   │   ├── nvidiaClient.test.ts      # NEW - Nvidia client retry/error mapping
│   │   └── knowledge/index.test.ts   # NEW - RAG retrieval logic
│   ├── hooks/
│   │   ├── useIntersectionObserver.test.tsx  # KEEP - existing
│   │   ├── useLanguage.test.ts       # NEW - i18n hook
│   │   ├── useRecommendations.test.ts # NEW - personalization hook
│   │   └── useABTest.test.ts         # NEW - A/B test hook
│   ├── components/
│   │   ├── ui/                       # NEW - Button, Card, Modal, etc.
│   │   └── tools/                    # NEW - Prakriti, Saara, Meda, Panchakarma, DietChart
│   └── utils/
│       └── validation.test.ts        # NEW - Zod schemas (when added)
├── integration/
│   ├── api/
│   │   └── nvidia.test.ts            # NEW - /api/nvidia proxy behavior
│   └── ai/
│       └── aiService.integration.test.ts  # NEW - full pipeline
├── e2e/                              # NEW - requires Playwright
│   ├── critical-paths/
│   │   ├── booking.spec.ts
│   │   ├── tool-completion.spec.ts
│   │   └── ai-chat.spec.ts
│   └── regression/
├── visual/                           # NEW - requires Playwright
│   └── snapshots/
└── accessibility/                    # NEW - requires axe-core
    └── a11y.test.ts
```

---

## Critical Test Cases (Prioritized)

### Phase 1: Unit Tests (Target: 80%+ coverage on lib/ + hooks/)

**lib/aiService.ts**
- `generate()` returns string on success
- `chat()` maintains session context
- `generateStructured()` validates schema compliance
- `init()` lazy-initializes correctly (prevents double-init)
- `isAvailable()` reflects Nvidia proxy status
- **NO fallback path exists** — all traffic routes through `/api/nvidia` proxy

**lib/nvidiaClient.ts**
- `chat()` formats request payload correctly
- Error mapping: HTTP status → custom error types
- Retry logic: 3 attempts (2 retries) with exponential backoff (1.5s, 3s)
- 30s fetch timeout via AbortController
- **No `chatWithRetry()` method exists** — retry is internal to `chat()`

**knowledge/index.ts**
- `queryKnowledge()` returns relevant chunks (keyword matching)
- Category filter: `siddhanta` | `chikitsa` | `hospital`
- Score ranking: exact match > partial > keyword

**hooks/useLanguage.ts**
- Returns current language from context
- `setLanguage()` updates context and localStorage
- Defaults to `en` when no stored preference

**hooks/useRecommendations.ts**
- Returns recommendations based on user profile
- Handles missing profile gracefully

**hooks/useIntersectionObserver.ts** ✅ **EXISTS**
- Triggers callback on intersection
- Respects threshold and rootMargin
- Cleanup: observer disconnected on unmount

**hooks/useABTest.ts**
- Assigns variant consistently per session
- Respects traffic allocation

### Phase 2: Integration Tests

**API Routes (/api/nvidia)**
- POST /api/nvidia returns 200 with valid response
- Method not POST → 405
- Origin not allowed → 403
- Missing messages → 400
- Too many messages (>40) → 413
- No API key configured → 500
- All models failed → 502

**AI Pipeline**
- User question → knowledge retrieval → LLM response
- Error at any stage → structured error response (no crash)

### Phase 3: E2E Tests (Requires Playwright)

**Booking Flow**
1. Navigate to /booking
2. Fill all required fields (name, email, phone, date)
3. Submit form
4. Verify success message

**Tool Completion (Prakriti)**
1. Navigate to /tools
2. Select Prakriti tool
3. Answer all questions
4. View results (dosha chart, recommendations)

**AI Chat**
1. Open chat widget
2. Send question about Ayurveda
3. Receive streaming response
4. Verify knowledge base citations in response

### Phase 4: Visual Regression (Requires Playwright)
- Homepage hero (desktop, tablet, mobile)
- Service detail page (all breakpoints)
- Tool results views (all 5 tools)
- Blog post page
- Mobile navigation states (menu open/closed)

### Phase 5: Accessibility (Requires axe-core)
- All pages: axe-core zero violations (WCAG 2.1 AA)
- Keyboard navigation: all interactive elements reachable
- Screen reader: landmark roles, heading hierarchy
- Color contrast: all text meets 4.5:1 ratio

---

## CI Integration (Target)

### Pipeline Stages (`.github/workflows/test.yml` — DOES NOT EXIST)
```yaml
jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test -- --coverage
      - uses: codecov/codecov-action@v3

  integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:integration  # NEW script needed

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run preview & sleep 5
      - run: npm run test:e2e  # NEW script needed
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: test-results/

  visual:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run preview & sleep 5
      - run: npm run test:visual  # NEW script needed
```

---

## Test Data Management
- **Fixtures**: `tests/fixtures/` — CREATE for sample data
- **Factories**: `tests/factories/` — CREATE for generating test entities
- **Mocks**: MSW handlers for API mocking — ADD when MSW installed
- **Seeding**: No database — all test data in memory

---

## Coverage Targets (Aspirational)

| Layer | Target | Current |
|-------|--------|---------|
| Unit | 80% lines, 70% branches | ~5% (5 files, limited scope) |
| Integration | 60% lines | 0% |
| E2E | 5 critical paths covered | 0% |
| Visual | 10 key views | 0% |
| A11y | 0 violations on all pages | Not measured |

---

## Gap Analysis (Actual vs Previous Doc Claims)

| Previous Doc Claim | Reality | Action |
|--------------------|---------|--------|
| "0 unit test files" | 5 test files exist | ✅ Update current state |
| "vitest not installed" | vitest ^4.1.5 in devDependencies | ✅ Correct |
| "Playwright recommended" | Playwright NOT installed | Document as Phase 2+ addition |
| "MSW recommended" | MSW NOT installed | Document as Phase 2+ addition |
| "axe-core recommended" | axe-core NOT installed | Document as Phase 3+ addition |
| "textExtractor.ts tests" | textExtractor.ts DOES NOT EXIST | Remove phantom references |
| "useDebounce.ts tests" | useDebounce.ts DOES NOT EXIST | Remove phantom references |
| "health API tests" | No /api/health route exists | Remove phantom references |
| "CI pipeline exists" | No `.github/workflows/test.yml` | Document as missing |

---

## Migration Plan (Phased)

| Phase | Task | Priority | Dependencies |
|-------|------|----------|--------------|
| 1 | Expand unit tests for `lib/aiService.ts`, `lib/nvidiaClient.ts`, `knowledge/index.ts` | P0 | None |
| 2 | Add unit tests for remaining hooks (`useLanguage`, `useRecommendations`, `useABTest`, `useExitIntent`, `useMobileDevice`, `usePersonalization`, `useScrollProgress`) | P0 | None |
| 3 | Add component unit tests for UI primitives (Button, Card, Modal) | P1 | Phase 1 |
| 4 | Add component unit tests for health tools (Prakriti, Saara, Meda, Panchakarma, DietChart) | P1 | Phase 1 |
| 5 | Install MSW (`npm i -D msw`) + add integration tests for `/api/nvidia` | P1 | None |
| 6 | Install Playwright (`npm i -D @playwright/test`) + add E2E critical paths | P2 | Phase 5 |
| 7 | Add visual regression tests with Playwright | P3 | Phase 6 |
| 8 | Install axe-core (`npm i -D axe-core jest-axe`) + add accessibility tests | P2 | Phase 1 |
| 9 | Create `.github/workflows/test.yml` with all stages | P2 | Phase 5 |
| 10 | Add coverage reporting + codecov integration | P3 | Phase 9 |

---

## Traceability to Master Report

| Master Action | This Doc Sections |
|---------------|-------------------|
| A1: Fix "0 test files" claim — document 5 actual files | Current State, Gap Analysis |
| A2: Correct "vitest not installed" — it IS installed | Current State, Gap Analysis |
| A3: Remove phantom `textExtractor.ts`, `useDebounce.ts` test cases | Critical Test Cases, Gap Analysis |
| A4: Remove phantom `/api/health` integration tests | Critical Test Cases, Gap Analysis |
| A5: Document Playwright/MSW/axe-core as NOT installed (future phases) | Tooling Stack, Migration Plan |
| A6: Update CI pipeline section — no workflow file exists | CI Integration |
| A7: Calibrate coverage targets to reflect reality | Coverage Targets |

---

*Last updated: 2026-11-13 — Aligned with actual codebase verification*