# EGM-08: Health Assessment Tools Architecture

## Overview
The application includes 5 interactive health assessment tools that collect patient data through structured questionnaires, provide personalized Ayurvedic insights, and generate shareable results. All tools run client-side with no backend dependency for the assessment logic.

## Tool Inventory

| Tool | Route | Purpose | Data Collected |
|------|-------|---------|---------------|
| Lifestyle Tool | `/tools#lifestyle` | Daily routine assessment | Sleep, diet, exercise, stress |
| Panchakarma Tool | `/tools#panchakarma` | Treatment suitability | Symptoms, goals, preferences |
| Meda Tool | `/tools#meda` | Weight management | BMI, waist, diet, activity |
| Saara Tool | `/tools#saara` | Hair health assessment | Hair type, scalp, concerns |
| Prakriti Tool | `/tools#prakriti` | Dosha constitution | 45-question questionnaire |

## Architecture Pattern

### Shared Component Structure
All 5 tools follow the same pattern:
```
ToolContainer
  ├─ ProgressIndicator (step X of Y)
  ├─ QuestionCard (current question)
  │   ├─ OptionGrid (selectable options)
  │   └─ NavigationButtons (back/next)
  ├─ ResultsView (final step)
  │   ├─ DoshaChart (radar visualization)
  │   ├─ RecommendationsList
  │   └─ ShareResults button
  └─ DisclaimerBanner (always visible)
```

### State Management
- `useState` for answers (object keyed by question ID)
- `useState` for current step index
- `useEffect` for progress persistence (localStorage)
- No Redux/Zustand — each tool manages its own state

### Data Flow
```
User selects option → updateAnswers() → render next question
                                                     │
                              On final step → calculateResults() → render ResultsView
                                                     │
                              ShareResults → generateShareCard() → copy link / social share
```

## Tool-Specific Implementations

### Prakriti Tool (Most Complex)
- **45 questions** across 15 categories
- **Scoring**: Each answer maps to Vata/Pitta/Kapha scores (0-3)
- **Result**: Radar chart showing dosha proportions
- **Recommendations**: Diet, lifestyle, herbs based on dominant dosha
- **Time to complete**: 5-7 minutes
- **Storage**: Results saved to localStorage for revisiting

### Lifestyle Tool
- **12 questions** covering: sleep, meals, exercise, stress, screen time
- **Scoring**: Lifestyle balance score (0-100)
- **Result**: Lifestyle type classification + improvement suggestions
- **Integration**: Links to service recommendations based on results

### Panchakarma Tool
- **10 questions** about: symptoms, duration, goals, preferences
- **Result**: Treatment program recommendation (5 programs)
- **Matching logic**: Rule-based matching against program profiles
- **Output**: "Based on your answers, we recommend [Program Name]"

### Meda Tool (Weight Management)
- **8 questions**: BMI, waist circumference, weight history, diet patterns
- **Result**: BMI category + personalized diet/lifestyle plan
- **Integration**: Links to DietChart tool for meal planning

### Saara Tool (Hair Health)
- **7 questions**: hair type, scalp condition, hair loss pattern, diet
- **Result**: Hair health score + Ayurvedic remedy recommendations
- **Output**: Specific herb/oil recommendations based on dosha analysis

## Results Sharing
- `ShareResults` component generates a shareable card
- Social sharing: WhatsApp, Facebook, Twitter (native share API)
- Copy link: Generates unique URL with results encoded in query params
- QR code: Optional (for clinic display)
- Analytics: Tracks share events per tool

## Privacy & Data
- All data stored client-side only (localStorage)
- No PHI sent to server during assessment
- Results are educational, not diagnostic
- Disclaimer banner: "These tools are for educational purposes only"
- GDPR: Users can clear assessment data anytime

## Accessibility
- Keyboard navigation: Tab through options, Enter to select
- Screen reader: Questions read as `aria-labelledby`
- High contrast: Option cards have clear visual states
- Reduced motion: Animation-free option for sensitive users