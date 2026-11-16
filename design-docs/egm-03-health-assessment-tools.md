# Health Assessment Tools — Design Document

## Overview
Six structured Ayurvedic health assessment tools, each implementing classical examination methodologies with AI-powered analysis and personalized PDF report generation.

## Tool Inventory

| Tool | Classical Basis | Questions | Output | Lines |
|------|----------------|-----------|--------|-------|
| **PrakritiTool** | Tridosha theory (Charaka) | 18 (6 per dosha) | Vata/Pitta/Kapha % + lifestyle | 680 |
| **LifestyleTool** | Dinacharya + Ritucharya | 15 | AI Dinacharya schedule + PDF | 520 |
| **MedaTool** | Meda Dhatu (Charaka Ch. 28) | 8 signs + BMI/WHR | Meda status + interventions | 480 |
| **SaaraTool** | Ashta Sara Pariksha (Charaka) | 7 dhatus × 3-5 q | Sara grades (Pravara/Madhyama/Avara) | 770 |
| **PanchakarmaTool** | Shodhana eligibility (Charaka) | 14 categories | Bala/Agni/Kostha → therapy plan | 762 |
| **DietChartTool** | Ahara Vidhi (classical) | Condition + Prakriti | 85+ condition charts + PDF | 1080 |

## Common Architecture Pattern

```typescript
// Each tool follows this structure
interface ToolComponentProps {
  onComplete?: (result: ToolResult) => void
}

const ToolComponent: React.FC<ToolComponentProps> = ({ onComplete }) => {
  // 1. Local state for answers
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [step, setStep] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<ToolResult | null>(null)
  const [error, setError] = useState<Error | null>(null)
  
  // 2. Question definitions (static data)
  const questions = useMemo(() => [...], [])
  
  // 3. Navigation handlers
  const handleNext = () => { /* validation + step++ */ }
  const handlePrevious = () => { /* step-- */ }
  const handleAnswer = (key: string, value: any) => { /* setAnswers */ }
  
  // 4. AI Analysis
  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const analysis = await aiService.analyzeAssessment(toolType, answers)
      setResult(analysis)
      onComplete?.(analysis)
      analytics.track('tool_completed', { tool: toolType, answers })
    } catch (e) {
      setError(e)
      analytics.track('tool_error', { tool: toolType, error: e.message })
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  // 5. Render: Progress → Questions → Results → PDF Export
  return (
    <ToolLayout title={title} progress={step/questions.length}>
      {result ? <ResultView result={result} /> : <QuestionView />}
    </ToolLayout>
  )
}
```

## Tool-Specific Details

### 1. PrakritiTool (`components/tools/PrakritiTool.tsx`)

**Classical Basis**: Tridosha Prakriti assessment per Charaka Samhita Vimana Sthana Ch. 8

**Questions**: 18 questions, 6 per dosha
```typescript
const vataQuestions = [
  { key: 'v1', label: 'My natural body frame is thin and light', weight: 1 },
  { key: 'v2', label: 'I tend to have dry skin and hair', weight: 1 },
  // ... 6 total
]
```

**Scoring**: Simple sum per dosha → percentage
```typescript
const vataScore = vataAnswers.reduce((sum, a) => sum + a.value, 0)
const vataPct = Math.round((vataScore / 6) * 100)
```

**AI Enhancement**: Sends scores to `aiService.analyzeAssessment('prakriti', scores)` for:
- Detailed constitution description
- Seasonal regimen (Ritucharya)
- Dietary guidelines (Pathya/Apathya)
- Lifestyle recommendations
- Herb suggestions

**Output Sections**:
- Prakriti breakdown (V/P/K percentages)
- Dominant dosha characteristics
- Seasonal vulnerabilities
- Personalized Dinacharya
- Dietary do's/don'ts
- Recommended herbs/spices

---

### 2. LifestyleTool (`components/tools/LifestyleTool.tsx`)

**Classical Basis**: Dinacharya (daily routine) + Ritucharya (seasonal) per Ashtanga Hridaya

**Questions**: 15 covering:
- Wake/sleep times
- Meal timing/regularity
- Exercise type/frequency
- Stress levels
- Digestion quality
- Screen time
- Social connections

**AI Analysis**: Generates personalized Dinacharya schedule:
```typescript
interface DinacharyaSchedule {
  morning: TimeBlock[]      // 4:30-10:00
  midday: TimeBlock[]       // 10:00-14:00
  afternoon: TimeBlock[]    // 14:00-18:00
  evening: TimeBlock[]      // 18:00-22:00
  night: TimeBlock[]        // 22:00-4:30
}

interface TimeBlock {
  time: string
  activity: string
  duration: string
  benefit: string
  sanskrit?: string
}
```

**PDF Export**: Uses `@react-pdf/renderer` with Devanagari font support

---

### 3. MedaTool (`components/tools/MedaTool.tsx`)

**Classical Basis**: Meda Dhatu Sara/Asara assessment (Charaka Sutrasthana Ch. 28)

**Inputs**:
- Anthropometric: Height, Weight → BMI
- Waist/Hip → WHR
- 8 Classical Signs (Ashta Lakshana):
  1. Snigdha angata (unctuous body)
  2. Mridu twak (soft skin)
  3. Kshama (forbearance)
  4. Bala (strength)
  5. Varna (complexion)
  6. Swara (voice)
  7. Sukha (comfort)
  8. Ayu (longevity indicators)

**Scoring Matrix**:
| Parameter | Excellent (Pravara) | Moderate (Madhyama) | Poor (Avara) |
|-----------|---------------------|---------------------|--------------|
| BMI | 18.5-23 | 23-27.5 | >27.5 or <18.5 |
| WHR (M/F) | <0.9/0.8 | 0.9-1.0/0.8-0.85 | >1.0/>0.85 |
| Signs (8) | 7-8 | 4-6 | 0-3 |

**AI Output**: Meda status + targeted interventions (Ahara, Vihara, Aushadha)

---

### 4. SaaraTool (`components/tools/SaaraTool.tsx`)

**Classical Basis**: Ashta Sara Pariksha — 7 Dhatu + Ojas (Charaka Vimana 8)

**Dhatus Assessed**:
1. **Twak Sara** (Rasa) — Skin quality
2. **Rakta Sara** — Blood/Complexion
3. **Mamsa Sara** — Muscle/Firmness
4. **Meda Sara** — Fat/Unctuousness
5. **Asthi Sara** — Bone/Structure
6. **Majja Sara** — Marrow/Vitality
7. **Shukra Sara** — Reproductive/Essence

**Questions per Dhatu**: 3-5 each (total ~28 questions)

**Grading**:
- **Pravara** (Excellent): All signs present strongly
- **Madhyama** (Moderate): Some signs present
- **Avara** (Poor): Few/no signs

**Output**: Dhatu-wise grades + overall vitality index + rejuvenation (Rasayana) plan

---

### 5. PanchakarmaTool (`components/tools/PanchakarmaTool.tsx`)

**Classical Basis**: Shodhana eligibility per Charaka Siddhi Sthana

**Assessment Categories** (14):
1. **Bala Pariksha** — Physical strength (Pravara/Madhyama/Avara)
2. **Agni Pariksha** — Digestive fire (Tikshna/Manda/Vishama/Sama)
3. **Kostha Pariksha** — Bowel nature (Krura/Mridu/Madhya)
4. **Prakriti** — Constitution
5. **Vikriti** — Current imbalance
6. **Sara** — Tissue excellence
7. **Samhanana** — Body compactness
8. **Pramana** — Measurements
9. **Satmya** — Suitability
10. **Satva** — Mental strength
11. **Ahara Shakti** — Food capacity
12. **Vyayama Shakti** — Exercise capacity
13. **Vaya** — Age
14. **Desha** — Geography/Climate

**Decision Matrix**:
```
IF Bala=Pravara AND Agni=Sama AND Kostha=Mridu
  → Eligible for Vamana, Virechana, Basti, Nasya, Raktamokshana
ELSE IF Bala=Madhyama
  → Mild Shodhana + Shamana
ELSE
  → Shamana only (palliative)
```

**Output**: Therapy-specific protocols with pre/post procedures (Purva/Paschat Karma)

---

### 6. DietChartTool (`components/tools/DietChartTool.tsx`)

**Classical Basis**: Ahara Vidhi Visheshaayatana (Charaka Vimana 1)

**Inputs**:
- Condition selector (85+ options from `/knowledge/diet-charts/`)
- Prakriti (V/P/K percentages from PrakritiTool)
- Allergies/Intolerances (multi-select)
- Age, Gender, Activity Level

**Knowledge Loading**:
```typescript
const knowledgeModules = import.meta.glob('/knowledge/diet-charts/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>
```

**AI Generation**:
```typescript
const prompt = `
Generate Ayurvedic diet chart for ${condition}.
Patient: Prakriti ${prakriti}, Age ${age}, Gender ${gender}
Allergies: ${allergies.join(', ')}
Activity: ${activityLevel}

Follow classical structure:
1. Understanding condition in Ayurveda
2. Core dietary principles (Ahara Vidhi)
3. Meal-by-meal schedule (6 meals)
4. Pathya (recommended) by category
5. Apathya (avoid) by category with reasons
6. Dinacharya integration
7. Classical home remedies
8. Lifestyle guidelines
9. Viruddha ahara warnings
`
```

**Rendering**: `DietChartRenderer` (1152 lines) parses AI markdown → 14 section types → interactive UI

**PDF Export**: `DietChartPDF` component uses `@react-pdf/renderer` with:
- Devanagari font (Noto Sans Devanagari)
- Table layouts for meals
- Color-coded Pathya (green) / Apathya (red)
- Print-optimized A4 layout

---

## Shared Infrastructure

### AI Service Integration
```typescript
// All tools use this pattern
import { aiService } from '../../lib/aiService'

const analysis = await aiService.analyzeAssessment(toolType, answers)
// toolType: 'prakriti' | 'lifestyle' | 'meda' | 'saara' | 'panchakarma' | 'diet-chart'
```

### Analytics Tracking
```typescript
// Each tool tracks:
analytics.track('tool_started', { tool: toolType })
analytics.track('question_answered', { tool: toolType, questionId, value })
analytics.track('tool_completed', { tool: toolType, durationMs, resultSize })
analytics.track('tool_pdf_exported', { tool: toolType })
analytics.track('tool_error', { tool: toolType, error: error.message })
```

### PDF Generation Pattern
```typescript
// Shared PDF utilities
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { pdfStyles } from '../styles/pdfStyles'  // Shared styles

<Document>
  <Page size="A4" style={pdfStyles.page}>
    <View style={pdfStyles.header}>...</View>
    <View style={pdfStyles.content}>...</View>
    <View style={pdfStyles.footer}>...</View>
  </Page>
</Document>
```

### UI Components (ReactBits)
```typescript
import { Counter, AnimatedList } from '../ui/reactbits'
// Counter: Animated number counting
// AnimatedList: Staggered entrance animations
```

## Data Persistence

| Data | Storage | Retention |
|------|---------|-----------|
| In-progress answers | `sessionStorage` (key: `tool_{type}_draft`) | Session |
| Completed results | `localStorage` (key: `tool_{type}_result_{date}`) | 30 days |
| PDF exports | User downloads | User-controlled |
| Analytics events | Server (Vercel) | 90 days |

## Accessibility

- **WCAG 2.1 AA**: All tools target AA compliance
- **Keyboard**: Full navigation (Tab, Enter, Arrow keys)
- **Screen readers**: ARIA labels on all inputs, live regions for progress
- **Color**: Semantic colors with patterns/icons (not color-only)
- **Focus**: Visible focus rings, logical tab order
- **Language**: `lang` attribute per page, Sanskrit terms with `lang="sa"`

## Known Issues (P0/P1)

| ID | Tool | Severity | Issue |
|----|------|----------|-------|
| TOOL-01 | All | P0 | **No input validation** — raw user data to AI |
| TOOL-02 | All | P0 | **No error boundaries** — crash loses progress |
| TOOL-03 | Prakriti | P1 | Scoring ignores question weights |
| TOOL-04 | Lifestyle | P1 | No persistence across sessions |
| TOOL-05 | Meda | P1 | BMI/WHR validation missing (negative values possible) |
| TOOL-06 | Saara | P2 | 28 questions — high drop-off risk |
| TOOL-07 | Panchakarma | P1 | Complex logic not unit tested |
| TOOL-08 | DietChart | P1 | 85+ conditions — no search/filter UX |
| TOOL-09 | All | P1 | PDF fonts not bundled (CDN dependency) |
| TOOL-10 | All | P2 | No offline support (service worker missing) |

## Recommended Improvements

1. **Validation Layer**: Zod schemas for each tool's answer shape
2. **Error Boundaries**: Wrap each tool in `<ErrorBoundary fallback={ToolErrorFallback} />`
3. **Progress Persistence**: Auto-save to `localStorage` on each answer
4. **Question Weights**: Implement weighted scoring for Prakriti/Saara
5. **Conditional Questions**: Skip irrelevant questions based on previous answers
6. **Result Versioning**: Schema version in stored results for migration
7. **Offline-First**: Service worker + IndexedDB for draft persistence