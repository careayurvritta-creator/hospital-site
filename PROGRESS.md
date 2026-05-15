# Ayurvritta Ayurveda Hospital - Project Progress

## Goal
- Add comprehensive 6 Ayurvedic tools (Prakriti, Lifestyle Risk, Panchakarma, Meda/BMI, Saara, AI Diet Planner) with full functionality, then integrate Nvidia free API as alternative to Google Gemini for AI features (ChatBot, Insurance PDF analysis, Diet/Prakriti AI features)

## Constraints & Preferences
- Must work on Vercel deployment without lucide-react bundling issues
- AI features must work reliably (currently shows "Service Unavailable" error)
- Need zero-external-dependency approach for icons
- Want Nvidia free API key integration for AI features
- Site currently works at ayurvrittaayurveda.in with simplified Tools page

## Progress
### Done
- Fixed site loading: Removed lucide-react dependency from Tools page using inline SVGs
- Site now loads properly at ayurvrittaayurveda.in with 9.62KB vendor-misc bundle
- Created 6-tool structure with placeholders: Prakriti Assessment, Lifestyle Risk Audit, Panchakarma Check, BMI & Meda Dhatu, Saara Pariksha, AI Diet Planner
- Analyzed all 6 existing tool components with full Ayurveda questionnaire data in constants.ts

### In Progress
- Researching Nvidia free API integration options (NIM microservices, API Catalog)
- Planning comprehensive Tools implementation with full Ayurveda logic
- Analyzing current Google Gemini AI implementation (5 components: ChatBot, Insurance, DietGenerator, PrakritiTool, LocationExplorer)

### Blocked
- AI features currently broken: Insurance "Analysis Service Unavailable" error visible in user screenshot
- Need to determine if Nvidia free API can replace/backup Google Gemini
- Tool components still use Icons import which may not exist

## Key Decisions
- Used inline SVG icons to avoid lucide-react bundling failure on Vercel
- Keeping Tools page but with simplified placeholders until full rewrite
- Will need to create Icons.tsx component or use inline SVGs in each tool

## Next Steps
- Create detailed implementation plan for 6 tools with full Ayurveda logic
- Research Nvidia API key setup and compare capabilities to Google Gemini
- Update Insurance.tsx to fix "Analysis Service Unavailable" error
- Rebuild tools using inline SVGs to avoid lucide-react issues
- Test AI features with working API (Google or Nvidia)

## Critical Context
- Current AI uses @google/genai in: ChatBot, Insurance (policy analysis), DietGenerator, PrakritiTool, LocationExplorer
- User sees error: "Analysis Service Unavailable - Our AI analysis service is temporarily unavailable"
- Nvidia offers free API keys via NVIDIA API Catalog for NIM microservices
- Original tool components (PrakritiTool, LifestyleTool, etc.) still exist in components/tools/ with Icons import that may be broken

## Relevant Files
- E:\ayurvritta-ayurveda-hospital\pages\Tools.tsx: Current simplified version with 4 placeholders
- E:\ayurvritta-ayurveda-hospital\components\tools\: Original 6 tool components (PrakritiTool, LifestyleTool, DietGenerator, MedaTool, SaaraTool, PanchakarmaTool)
- E:\ayurvritta-ayurveda-hospital\constants.ts: Contains PRAKRITI_SECTIONS (10 questions), LIFESTYLE_RISK_QUESTIONS (8 questions), PK_ELIGIBILITY_SECTIONS (4 questions), MEDA_DHATU_QUESTIONS, SAARA_DOMAINS (8 domains)
- E:\ayurvritta-ayurveda-hospital\components\ChatBot.tsx: AI chatbot using GoogleGenAI
- E:\ayurvritta-ayurveda-hospital\pages\Insurance.tsx: Policy document AI analysis (broken)
- E:\ayurvritta-ayurveda-hospital\components\Icons.tsx: Created icon library (may not be imported in tool components)