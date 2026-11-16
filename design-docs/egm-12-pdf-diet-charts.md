# EGM-12: PDF Generation & Diet Chart System

## Overview
The Diet Chart PDF system generates personalized meal plans in PDF format based on patient assessment data (Prakriti, dosha imbalance, health goals). The system runs entirely client-side with no server dependency, using jsPDF and custom template rendering.

## Architecture

### Component Stack
```
DietChartTool.tsx (assessment UI)
        │
        ▼
DietChartRenderer.tsx (data processing + layout)
        │
        ▼
DietChartPDF.tsx (PDF generation)
        │
        ▼
Download/Share (client-side only)
```

### Data Flow
```
User Input (Prakriti, goals, restrictions)
        │
        ▼
DietChartRenderer
  ├─ validateInput(): check required fields
  ├─ matchRecipes(): find recipes by dosha compatibility
  ├─ generateWeeklyPlan(): 7-day meal schedule
  └─ calculateNutrition(): macro breakdown per meal
        │
        ▼
DietChartPDF
  ├─ createDocument(): jsPDF instance
  ├─ renderHeader(): hospital branding + patient info
  ├─ renderDailyPlan(): day-by-day meal layout
  ├─ renderNutritionSummary(): macro + micronutrient table
  └─ renderFooter(): disclaimer + hospital contact
        │
        ▼
Output: PDF blob → download or print
```

## Template Design

### Page Layout (A4)
```
┌─────────────────────────────────────────┐
│  HOSPITAL LOGO          PATIENT INFO     │
│  Ayurvritta Ayurveda Hospital  Name: ___ │
│  Date: ___________  Prakriti: ___       │
├─────────────────────────────────────────┤
│  WEEKLY MEAL PLAN                       │
│                                         │
│  MONDAY          TUESDAY          ...    │
│  ─────────────────────────────────────  │
│  Breakfast: ___  Breakfast: ___         │
│  Lunch: ___      Lunch: ___             │
│  Snack: ___      Snack: ___             │
│  Dinner: ___     Dinner: ___            │
├─────────────────────────────────────────┤
│  NUTRITION SUMMARY                      │
│  Cal: __  Protein: __  Carb: __  Fat: __│
├─────────────────────────────────────────┤
│  RECOMMENDATIONS                        │
│  Foods to include: ___                  │
│  Foods to avoid: ___                    │
├─────────────────────────────────────────┤
│  Disclaimer: Educational only. Not a    │
│  substitute for medical advice.         │
└─────────────────────────────────────────┘
```

## Recipe Database

### Recipe Matching Logic
- **Prakriti-based**: Vata → warm, cooked foods; Pitta → cooling foods; Kapha → light, spicy foods
- **Goal-based**: Weight loss → low-calorie; Muscle gain → high-protein; Maintenance → balanced
- **Restriction-based**: Vegetarian, vegan, gluten-free, dairy-free
- **Seasonal**: Summer → cooling; Winter → warming

### Meal Categories
1. **Breakfast**: Upma, Dosa, Idli, Paratha, Smoothie bowls
2. **Lunch**: Roti, Rice, Dal, Vegetables, Curd
3. **Snack**: Fruits, Nuts, Herbal tea, Buttermilk
4. **Dinner**: Light soup, Khichdi, Roti-sabzi, Fish (non-veg option)

### Ayurvedic Principles Applied
- **Viruddha Ahara**: Food combinations to avoid (milk + fish, honey + ghee)
- **Prakriti Anusar**: Diet tailored to constitution
- **Ritu Anusar**: Seasonal adjustments
- **Agni Consideration**: Digestive fire strength (lighter meals for low agni)
- **Six Tastes (Shad Rasa)**: All 6 tastes in each meal for balance

## PDF Generation

### Technical Implementation
- **Library**: jsPDF (client-side PDF generation)
- **Font**: Embedded TTF for Devanagari (Hindi) support
- **Layout**: Table-based for alignment consistency
- **Images**: Optional (recipe images via base64)
- **Size**: 2-4 pages depending on plan length

### Optimization
- **Compression**: PDF compressed to <500KB
- **Font subsetting**: Only required characters embedded
- **Caching**: Generated PDFs cached in IndexedDB
- **Streaming**: Not used (all in-memory generation)

## Output Options
- **Download**: PDF file saved to device
- **Print**: Direct print dialog (no intermediate save)
- **Share**: Convert to base64 for email/WhatsApp
- **Cloud**: Future — upload to patient portal

## Accessibility
- **Text layer**: All text selectable (not image-based)
- **Reading order**: Logical flow for screen readers
- **Contrast**: WCAG AA compliant (dark text on light background)
- **Language**: English + Hindi (bi-lingual PDF)