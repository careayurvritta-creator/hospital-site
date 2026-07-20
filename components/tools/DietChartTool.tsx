import React, { useState, useMemo, useRef, useEffect } from 'react';
import { aiService } from '../../lib/aiService';
import DietChartPDF from './DietChartPDF';
import DietChartRenderer from './DietChartRenderer';

// ─── Knowledge file import via Vite ───
const knowledgeModules = import.meta.glob('/knowledge/diet-charts/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

// ═══════════════════════════════════════════════════════════════
// AYURVEDIC DIETETIC PRINCIPLES (Ahara Vidhi Visheshayatana)
// From Charaka Samhita Vimanasthana 1.24 and Ashtanga Hridayam
// ═══════════════════════════════════════════════════════════════

interface ValidationWarning {
  section: string;
  issue: string;
  severity: 'error' | 'warning';
}

const VIRUDDHA_PAIRS: { foods: string[]; reason: string }[] = [
  { foods: ['milk', 'fish', 'matsya'], reason: 'Milk + fish (Matsya-Mahisha) produces skin diseases and toxin accumulation' },
  { foods: ['milk', 'fruits', 'banana'], reason: 'Milk + banana or sour fruits creates Ama and digestive disturbance' },
  { foods: ['milk', 'meat', 'chicken'], reason: 'Milk + meat dishes cause Viruddha - blocked channels' },
  { foods: ['eggs', 'milk', 'dairy'], reason: 'Eggs + milk combination is heavy and incompatible' },
  { foods: ['curd', 'hot water', 'heat'], reason: 'Curd (Dadhi) should never be heated - causes toxic accumulation' },
  { foods: ['curd', 'night', 'evening'], reason: 'Curd at night produces Kapha and Ama - must be avoided after sunset' },
  { foods: ['ghee', 'honey', 'equal'], reason: 'Equal quantities of ghee + honey is Viruddha (opposite viryas cancel each other)' },
  { foods: ['horsegram', 'black gram', 'kulatha'], reason: 'Horsegram (Kulatha) + black gram (Masha) is heavy and toxic' },
  { foods: ['sesame oil', 'tamarind', 'fish'], reason: 'Tila Taila + fish + tamarind together causes skin disorders' },
  { foods: ['radish', 'jaggery', 'pittha'], reason: 'Radish (Moolaka) + jaggery increases Pitta and causes hemorrhage' },
  { foods: ['lemon', 'cucumber', 'tomato'], reason: 'Citrus fruits with cucumber/tomato creates conflicting digestive signals' },
  { foods: ['sprouts', 'milk'], reason: 'Sprouts (Nishota) + milk creates Ama and toxic accumulation' },
  { foods: ['karalla', 'buttermilk', 'butter'], reason: 'Bitter gourd (Karalla) + buttermilk is Viruddha' },
  { foods: ['pomegranate', 'antelope meat'], reason: 'Pomegranate + antelope meat causes digestive impairment' },
  { foods: ['garlic', 'ash gourd', 'pumpkin'], reason: 'Lashuna (garlic) + Kushmanda (ash gourd) conflicting properties' },
];

const NIGHT_SHADOW_FOODS = [
  'curd', 'buttermilk', 'lassi', 'yogurt', 'dahi',
  'butter', 'paneer', 'cottage cheese', 'cold drinks',
  'ice cream', 'frozen', 'refrigerated'
];

const MILK_INCOMPATIBLE = [
  'fish', 'matsya', 'egg', 'meat', 'chicken', 'banana',
  'sour', 'citrus', 'tamarind', 'mango', 'pineapple',
  'jackfruit', 'sprouts', 'kitchree', 'khichdi with curd'
];

const FORBIDDEN_COMBINATIONS = [
  { combo: 'milk and fish', reason: 'Most potent Viruddha - causes skin diseases, eczema, psoriasis' },
  { combo: 'milk and banana', reason: 'Creates Ama, mucous, congestion, cough' },
  { combo: 'curd at night', reason: 'Creates Kapha, Ama, respiratory issues - violates Ajirna rules' },
  { combo: 'ghee and honey equal parts', reason: 'Opposite potencies neutralize - neither nourishes nor cleanses' },
  { combo: 'hot water after honey', reason: 'Honey is Sheeta (cold) - heating destroys its properties' },
  { combo: 'egg and milk together', reason: 'Heavy, incompatible, clogs Srotas' },
];

function checkViruddha(text: string): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const lower = text.toLowerCase();

  for (const pair of FORBIDDEN_COMBINATIONS) {
    if (pair.combo.includes(' and ')) {
      const [a, b] = pair.combo.split(' and ');
      if (lower.includes(a) && lower.includes(b)) {
        warnings.push({
          section: 'VIRUDDHA CHECK',
          issue: `FORBIDDEN COMBINATION: "${pair.combo}" - ${pair.reason}`,
          severity: 'error',
        });
      }
    }
  }

  for (const food of MILK_INCOMPATIBLE) {
    if (lower.includes('milk') && lower.includes(food)) {
      if (!(food === 'fish' && lower.includes('milkfish'))) {
        warnings.push({
          section: 'VIRUDDHA CHECK',
          issue: `Milk + ${food} is Viruddha Ahara - causes Ama and Srotorodha (channel blockage)`,
          severity: 'error',
        });
      }
    }
  }

  for (const dairy of NIGHT_SHADOW_FOODS) {
    if (lower.includes(dairy) && (lower.includes('night') || lower.includes('dinner') || lower.includes('bedtime') || lower.includes('8 pm') || lower.includes('after 7'))) {
      warnings.push({
        section: 'NIGHT DIET RULE',
        issue: `${dairy} at night violates Ahara Vidhi - Dadhi at Ratrikaal causes Kapha and Ama`,
        severity: 'error',
      });
    }
  }

  return warnings;
}

function checkAharaVidhi(text: string, prakriti: string): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const lower = text.toLowerCase();

  if (prakriti.toLowerCase().includes('pitta')) {
    if (lower.includes('chilli') || lower.includes('chili') || lower.includes('red pepper') || lower.includes('hot spices')) {
      warnings.push({
        section: 'DOSHA VIOLATION',
        issue: 'Pitta prakriti should avoid Ushna (hot) spices - will aggravate Pitta',
        severity: 'warning',
      });
    }
  }

  if (prakriti.toLowerCase().includes('vata')) {
    if (lower.includes('salad') && !lower.includes('warm')) {
      warnings.push({
        section: 'DOSHA VIOLATION',
        issue: 'Vata prakriti should prefer warm, unctuous foods - raw salads aggravate Vata',
        severity: 'warning',
      });
    }
  }

  if (prakriti.toLowerCase().includes('kapha')) {
    if (lower.includes('fried') || lower.includes('oily') || lower.includes('ghee') && lower.includes('excess')) {
      warnings.push({
        section: 'DOSHA VIOLATION',
        issue: 'Kapha prakriti should avoid Guru (heavy), Snigdha (oily) foods - will increase Kapha',
        severity: 'warning',
      });
    }
  }

  if (!lower.includes('water') && !lower.includes('drink') && !lower.includes('liquid')) {
    warnings.push({
      section: 'HYDRATION',
      issue: 'Diet plan does not specify water intake - proper hydration is essential per Ahara Vidhi (Usna usnodakam)',
      severity: 'warning',
    });
  }

  return warnings;
}

function validateDietChart(aiResult: string, prakriti: string, condition: string): ValidationWarning[] {
  const all: ValidationWarning[] = [];
  all.push(...checkViruddha(aiResult));
  all.push(...checkAharaVidhi(aiResult, prakriti));
  return all;
}

function formatValidationWarnings(warnings: ValidationWarning[]): string {
  if (warnings.length === 0) return '';
  const errors = warnings.filter(w => w.severity === 'error');
  const warns = warnings.filter(w => w.severity === 'warning');

  let text = '\n\n---\n\n## AI SELF-VALIDATION REPORT\n\n';

  if (errors.length > 0) {
    text += '### Critical Viruddha Ahara Violations (Must Fix Before Use)\n';
    errors.forEach(e => {
      text += `- **[BLOCKED]** ${e.section}: ${e.issue}\n`;
    });
    text += '\n*These recommendations violate classical Ayurvedic dietary rules. Please regenerate or consult Dr. Sharma.*\n';
  }

  if (warns.length > 0) {
    text += '### Dosha-Specific Warnings\n';
    warns.forEach(w => {
      text += `- [Note] ${w.section}: ${w.issue}\n`;
    });
  }

  return text;
}

// ─── Build searchable index ───
interface ConditionEntry {
  id: string;
  label: string;
  category: string;
  keywords: string[];
  rawPath: string;
}

const CATEGORY_MAP: Record<string, string[]> = {
  'Digestive': ['acidity', 'gerd', 'constipation', 'diarrhoea', 'ibs', 'crohn', 'colitis', 'digestion', 'gall', 'celiac', 'fistula', 'piles', 'hemorrhoids'],
  'Metabolic': ['diabetes', 'diabetic', 'obesity', 'thyroid', 'hypothyroidism', 'hyperthyroidism', 'cholesterol', 'triglyceride'],
  'Liver & Kidney': ['liver', 'kidney', 'jaundice', 'hepatitis', 'nephrotic', 'ascites', 'cirrhosis'],
  'Respiratory': ['asthma', 'sinus', 'common-cold', 'breathing'],
  'Joint & Bone': ['arthritis', 'rheumatoid', 'gout', 'osteoporosis', 'back-pain', 'slipped-disc', 'fibromyalgia'],
  'Heart & Blood': ['hypertension', 'hypotension', 'heart', 'anemia', 'edema', 'itp'],
  'Neurological': ['migraine', 'headache', 'depression', 'bells-palsy'],
  'Skin': ['psoriasis', 'eczema', 'skin-problems', 'scleroderma'],
  "Women's Health": ['menopause', 'ovarian', 'fibroid', 'premenstrual', 'amenorrhea', 'pregnant', 'endometriosis', 'adenomyosis'],
  "Men's Health": ['prostate', 'oligospermia'],
  'Cancer & Immunity': ['cancer', 'allergy', 'dengue', 'herpes', 'lymph'],
  'Children': ['toddlers', 'school-going', 'childhood'],
  'Prakriti': ['vata-prakriti', 'pitta-prakriti', 'kapha-prakriti'],
};

function getConditionCategory(slug: string): string {
  const lower = slug.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(k => lower.includes(k))) return cat;
  }
  return 'General';
}

function getConditionLabel(slug: string): string {
  return slug
    .replace(/^diet-(chart|plan)-for-/, '')
    .replace(/^diet-to-/, '')
    .replace(/-patients?$/, '')
    .replace(/-patient$/, '')
    .replace(/-disease$/, '')
    .replace(/-problems?$/, '')
    .replace(/-problem$/, '')
    .replace(/-syndrome$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

const ALL_CONDITIONS: ConditionEntry[] = Object.keys(knowledgeModules)
  .filter(p => !p.endsWith('README.md'))
  .map(path => {
    const slug = path.split('/').pop()!.replace('.md', '');
    const words = slug.replace(/^diet-(chart|plan)-for-?/, '').split('-').filter(w => w.length > 2);
    return {
      id: slug,
      label: getConditionLabel(slug),
      category: getConditionCategory(slug),
      keywords: [...words, slug],
      rawPath: path,
    };
  })
  .sort((a, b) => a.label.localeCompare(b.label));

// ─── Popular complaints with clean names ───
const POPULAR_COMPLAINTS = [
  { label: 'Diabetes', icon: '🩸', keywords: ['diabetes', 'diabetic'] },
  { label: 'Acidity & GERD', icon: '🔥', keywords: ['acidity', 'gerd', 'reflux'] },
  { label: 'Obesity', icon: '⚖️', keywords: ['obesity', 'overweight'] },
  { label: 'Hypertension', icon: '💓', keywords: ['hypertension', 'blood-pressure'] },
  { label: 'Thyroid Disorders', icon: '🦋', keywords: ['thyroid', 'hypothyroidism', 'hyperthyroidism'] },
  { label: 'Arthritis', icon: '🦴', keywords: ['arthritis', 'rheumatoid'] },
  { label: 'Kidney Disease', icon: '🫘', keywords: ['kidney', 'nephrotic'] },
  { label: 'Liver Disease', icon: '🫀', keywords: ['liver', 'fatty-liver', 'jaundice', 'hepatitis'] },
  { label: 'Constipation', icon: '🚽', keywords: ['constipation'] },
  { label: 'Migraine', icon: '🧠', keywords: ['migraine', 'headache'] },
  { label: 'Skin Problems', icon: '🧴', keywords: ['skin', 'psoriasis', 'eczema'] },
  { label: 'High Cholesterol', icon: '🩺', keywords: ['cholesterol', 'triglyceride'] },
  { label: 'PCOS & Ovarian Cysts', icon: '🌸', keywords: ['ovarian', 'cyst', 'fibroid'] },
  { label: 'Depression', icon: '🧘', keywords: ['depression'] },
  { label: 'Anemia', icon: '💉', keywords: ['anemia'] },
  { label: 'Infertility', icon: '👶', keywords: ['infertility', 'oligospermia'] },
  { label: 'Asthma', icon: '🫁', keywords: ['asthma'] },
  { label: 'Heart Disease', icon: '❤️', keywords: ['heart', 'cardiac'] },
  { label: 'Menopause', icon: '🌡️', keywords: ['menopause'] },
  { label: 'Gout', icon: '🦶', keywords: ['gout'] },
];

function searchConditions(query: string): ConditionEntry[] {
  if (!query.trim()) return ALL_CONDITIONS;
  const q = query.toLowerCase().trim();
  return ALL_CONDITIONS.filter(c => {
    const text = `${c.label} ${c.keywords.join(' ')} ${c.category}`.toLowerCase();
    return text.includes(q) || q.split(/\s+/).some(w => w.length > 2 && text.includes(w));
  });
}

function matchComplaintsToFiles(complaints: string): ConditionEntry[] {
  const lower = complaints.toLowerCase().trim();
  const matched: ConditionEntry[] = [];
  const seen = new Set<string>();

  // Split complaints into individual terms
  const complaintTerms = lower.split(/[\s,;]+/).filter(w => w.length > 2);

  for (const condition of ALL_CONDITIONS) {
    const conditionText = `${condition.label} ${condition.keywords.join(' ')}`.toLowerCase();
    const conditionWords = conditionText.split(/[\s,;-]+/).filter(w => w.length > 2);

    // Check for exact word match (not substring)
    const hasMatch = complaintTerms.some(term =>
      conditionWords.some(word => word === term || word.startsWith(term) || term.startsWith(word))
    );

    if (hasMatch && !seen.has(condition.id)) {
      seen.add(condition.id);
      matched.push(condition);
    }
  }

  // If no exact match found, try substring match as fallback
  if (matched.length === 0) {
    for (const condition of ALL_CONDITIONS) {
      const conditionText = `${condition.label} ${condition.keywords.join(' ')}`.toLowerCase();
      if (complaintTerms.some(w => w.length > 3 && conditionText.includes(w)) && !seen.has(condition.id)) {
        seen.add(condition.id);
        matched.push(condition);
      }
    }
  }

  return matched.slice(0, 3);
}

// ─── Interfaces ───
interface PatientInfo {
  name: string;
  age: string;
  gender: string;
  occupation: string;
}

interface DietInputs {
  patient: PatientInfo;
  complaints: string[];
  customComplaint: string;
  prakriti: string;
  dietaryPref: string;
  allergies: string[];
}

type Phase = 'welcome' | 'patient' | 'complaints' | 'profile' | 'generating' | 'result';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const PRAKRITI_OPTIONS = ['Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Pitta-Kapha', 'Vata-Kapha', 'Tridoshic', 'Not Sure'];
const DIET_OPTIONS = [
  { value: 'Vegetarian', icon: '🥬' },
  { value: 'Non-Vegetarian', icon: '🍗' },
  { value: 'Vegan', icon: '🌱' },
  { value: 'Eggetarian', icon: '🥚' },
];
const ALLERGY_OPTIONS = ['Dairy', 'Gluten', 'Nuts', 'Eggs', 'Soy', 'Seafood', 'Nightshades', 'None'];

// ─── Component ───
const DietChartTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [inputs, setInputs] = useState<DietInputs>({
    patient: { name: '', age: '', gender: '', occupation: '' },
    complaints: [],
    customComplaint: '',
    prakriti: '',
    dietaryPref: '',
    allergies: [],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [isLocal, setIsLocal] = useState(false);
  const [matchedFiles, setMatchedFiles] = useState<ConditionEntry[]>([]);
  const [animatedPhase, setAnimatedPhase] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredConditions = useMemo(() => searchConditions(searchQuery), [searchQuery]);

  // Phase transition with animation trigger
  const goToPhase = (p: Phase) => {
    setAnimatedPhase(false);
    setTimeout(() => {
      setPhase(p);
      setAnimatedPhase(true);
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);
  };

  const toggleComplaint = (label: string) => {
    setInputs(prev => ({
      ...prev,
      complaints: prev.complaints.includes(label)
        ? prev.complaints.filter(c => c !== label)
        : prev.complaints.length < 3 ? [...prev.complaints, label] : prev.complaints,
    }));
  };

  const toggleAllergy = (a: string) => {
    setInputs(prev => ({
      ...prev,
      allergies: a === 'None' ? ['None'] : prev.allergies.includes(a)
        ? prev.allergies.filter(x => x !== a)
        : [...prev.allergies.filter(x => x !== 'None'), a],
    }));
  };

  const generateDiet = async () => {
    goToPhase('generating');

    // Build complaint text
    const complaintText = [...inputs.complaints, inputs.customComplaint].filter(Boolean).join(', ');

    // Match knowledge files
    const matched = matchComplaintsToFiles(complaintText);
    setMatchedFiles(matched);

    // Inject more knowledge content (up to 2000 chars per matched file)
    const knowledgeContent = matched
      .map(e => `=== ${e.label.toUpperCase()} ===\n${(knowledgeModules[e.rawPath] || '').substring(0, 2000)}`)
      .join('\n\n');

    const prompt = `Generate a comprehensive, professionally structured Ayurvedic diet chart for the patient's condition. Follow the EXACT output format specified below. Base your recommendations on the provided knowledge content from Planet Ayurveda.

PATIENT CONTEXT:
- Name: ${inputs.patient.name || 'Patient'}
- Age/Gender: ${inputs.patient.age || 'X'}/${inputs.patient.gender || 'X'}
- Condition(s): ${complaintText}
- Prakriti: ${inputs.prakriti || 'Not specified'}
- Diet: ${inputs.dietaryPref || 'Not specified'}
- Allergies: ${inputs.allergies.join(', ') || 'None'}

KNOWLEDGE BASE CONTENT:
${knowledgeContent}

OUTPUT FORMAT (MUST FOLLOW EXACTLY - this matches the Prameha PDF reference format):

# [CONDITION NAME] — Ayurvedic Diet Chart

## Understanding [Condition] in Ayurveda
(2-3 sentences explaining the condition in Ayurvedic terms: dosha involvement, dhatu affected, Sanskrit terminology, srotas involved, and the therapeutic goal. Include a relevant Sanskrit verse or principle.)

## Core Dietary Principles
(Numbered list of 5 principles specific to this condition. Each principle has a bold Sanskrit/English term and 1-line explanation.)
1. **Lagu Ahara** (Light Diet): [explanation specific to this condition]
2. **Rooksha Ahara** (Dry Diet): [explanation]
3. **Pathya Anna** (Correct Food): [explanation]
4. **Kala NIyam** (Time Regulation): [explanation]
5. **Mitahara** (Measured Eating): [explanation]

## Daily Diet Schedule
(Use this EXACT table format - 3 columns: TIME | RECOMMENDED | TO AVOID)
| TIME | RECOMMENDED FOODS | FOODS TO AVOID |
|------|-------------------|----------------|
| Early Morning 5:30-6:00 AM | [specific items with details] | [specific items] |
| Breakfast 7:30-8:30 AM | [specific items] | [specific items] |
| Mid-Morning 10:30-11:00 AM | [specific items] | [specific items] |
| Lunch 12:30-1:30 PM | [specific items] | [specific items] |
| Evening 4:00-4:30 PM | [specific items] | [specific items] |
| Dinner 7:00-7:30 PM | [specific items] | [specific items] |
| Bedtime 9:30-10:00 PM | [specific items] | [specific items] |

## Pathya — Eat Freely (Categorized Lists)
(Use EXACT category headers below - do not invent categories)
**CEREALS**: [list of specific grains]
**PULSES**: [list of dals and legumes]
**VEGETABLES**: [list of specific vegetables]
**FRUITS**: [list of specific fruits]
**DAIRY**: [list of dairy products]
**FATS & OILS**: [list]
**SPICES**: [list]
**BEVERAGES**: [list]

## Apathya — Strictly Avoid (Categorized Lists)
**CEREALS**: [list]
**VEGETABLES**: [list]
**FRUITS**: [list]
**DAIRY**: [list]
**SWEETS & SUGARS**: [list]
**PREPARED FOODS**: [list]
**BEVERAGES**: [list]

## Dinacharya (Daily Routine) for [Condition]
(Numbered timeline with times, activities, and one-line benefits)
1. 5:30 AM - [Activity] — [one line benefit]
2. 6:00 AM - [Activity] — [one line benefit]
3. 6:30 AM - [Activity] — [one line benefit]
4. 7:00 AM - [Activity] — [one line benefit]
5. 10:00 AM - [Activity] — [one line benefit]
6. 12:00 PM - [Activity] — [one line benefit]
7. 5:00 PM - [Activity] — [one line benefit]
8. 9:00 PM - [Activity] — [one line benefit]

## Home Remedies (Classical Ayurvedic)
(Numbered remedies with name, preparation method, timing, and benefit)
1. **[Remedy Name]**: Take [specific amounts] of [ingredients]. [How to prepare]. Take [when]. Benefit: [one line]

## Lifestyle Guidelines
**Exercise**: [2-3 specific recommendations]
**Mental Health**: [2-3 specific recommendations]
**Sleep**: [2-3 specific recommendations]

---
*Prepared by Dr. Jinendradutt Sharma (BAMS) | Ayurvritta Ayurveda Hospital & Panchakarma Center, Vadodara | Dietary guidance only — not a substitute for medical treatment. Contact: +91 94266 84047*`;

    try {
      const systemInstruction = 'You are Dr. Jinendradutt Sharma, BAMS, Chief Physician at Ayurvritta Ayurveda Hospital, Vadodara. Generate ONLY structured diet charts in the EXACT markdown format specified. Use information from the provided knowledge files (Planet Ayurveda diet charts) for condition-specific recommendations. NEVER hallucinate foods or dosages. Adhere to Charaka Samhita and Ashtanga Hridayam dietary principles. STRICTLY avoid ALL Viruddha Ahara (incompatible food combinations). Inject Sanskrit terms naturally. Format output precisely as instructed.';

      // Add timeout wrapper (matching Insurance page pattern)
      const generatePromise = aiService.generate(prompt, systemInstruction, {
        temperature: 0.6,
        max_tokens: 4000,
      });
      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timed out - please try again')), 120000)
      );

      const content = await Promise.race([generatePromise, timeoutPromise]);

      if (content) {
        // Run Ayurvedic validation on generated diet chart
        const validationWarnings = validateDietChart(content, inputs.prakriti, complaintText);
        const validationNote = formatValidationWarnings(validationWarnings);
        const validatedContent = validationNote ? content + validationNote : content;
        setAiResult(validatedContent);
        setIsLocal(false);
        goToPhase('result');
      } else {
        throw new Error('Empty response');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '';
      console.error('[DietChart] AI Error:', errorMsg);

      // Show user-friendly error for timeout scenarios
      if (errorMsg.includes('timed out') || errorMsg.includes('504') || errorMsg.includes('timeout')) {
        setAiResult(`### AI Service Taking Too Long

The AI is taking longer than expected to generate your diet plan.

**Options:**
1. Try selecting fewer conditions (1-2 max)
2. Try again in a few moments
3. Call us for a personalized plan: +91 94266 84047

**Reference diet chart from our knowledge base:**

${matched.length > 0
  ? matched.map(e => knowledgeModules[e.rawPath] || '').join('\n\n---\n\n')
  : 'No specific diet chart found for your condition.'}`);
        setIsLocal(true);
        goToPhase('result');
        return;
      }

      // Fallback: use raw knowledge
      const fallback = matched.length > 0
        ? matched.map(e => knowledgeModules[e.rawPath] || '').join('\n\n---\n\n')
        : `No specific diet chart found for "${complaintText}" in our knowledge base.\n\nPlease consult Dr. Jinendradutt Sharma at Ayurvritta Ayurveda Hospital for a personalized diet plan.\n\nContact: +91 94266 84047`;
      setAiResult(fallback);
      setIsLocal(true);
      goToPhase('result');
    }
  };

  // ─── Progress bar ───
  const phaseOrder: Phase[] = ['welcome', 'patient', 'complaints', 'profile', 'generating', 'result'];
  const currentIdx = phaseOrder.indexOf(phase);
  const progressPct = phase === 'generating' ? 90 : phase === 'result' ? 100 : (currentIdx / (phaseOrder.length - 2)) * 100;

  // ─── Render ───
  return (
    <div ref={scrollRef} className="min-h-screen bg-gradient-to-br from-ayur-green-light via-white to-ayur-accent-light">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-ayur-green/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-ayur-green font-semibold hover:gap-3 transition-all min-h-[44px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🍽️</span>
            <span className="font-serif font-bold text-ayur-green text-sm">AI Diet Chart</span>
          </div>
          <div className="w-16" />
        </div>
        {/* Progress bar */}
        {phase !== 'welcome' && (
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-gradient-to-r from-ayur-green to-ayur-accent transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`max-w-2xl mx-auto px-4 py-6 transition-all duration-300 ${animatedPhase ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* ═══ WELCOME PHASE ═══ */}
        {phase === 'welcome' && (
          <div className="animate-fadeIn">
            {/* Hero */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ayur-green via-ayur-green-dark to-ayur-green p-8 text-white text-center mb-6 shadow-glow">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-ayur-accent/30 translate-y-1/2 -translate-x-1/2" />
              </div>
              <div className="relative">
                <div className="text-5xl mb-4">🌿</div>
                <h1 className="font-serif text-3xl font-bold mb-2">AI Diet Chart Generator</h1>
                <p className="text-white/80 text-sm leading-relaxed max-w-sm mx-auto">
                  Get a personalized Ayurvedic diet plan powered by AI, trained on authentic Ayurvedic knowledge from 106+ condition-specific diet charts
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: '🧠', label: 'AI-Powered', sub: 'Nvidia NIM' },
                { icon: '📚', label: '85+ Charts', sub: 'Knowledge Base' },
                { icon: '⚕️', label: 'Authentic', sub: 'Ayurvedic Texts' },
              ].map(f => (
                <div key={f.label} className="bg-white rounded-2xl p-4 text-center shadow-soft border border-gray-100">
                  <div className="text-2xl mb-1">{f.icon}</div>
                  <div className="text-xs font-bold text-ayur-green">{f.label}</div>
                  <div className="text-[10px] text-gray-400">{f.sub}</div>
                </div>
              ))}
            </div>

            {/* Attribution */}
            <div className="bg-white rounded-2xl p-4 border border-ayur-accent/20 mb-6 text-center">
              <div className="text-xs text-gray-500 mb-1">Created by AI trained on</div>
              <div className="font-serif font-bold text-ayur-green text-sm">Authentic Ayurveda Sources</div>
              <div className="text-xs text-ayur-accent font-medium mt-1">by Dr. Jinendradutt Sharma</div>
              <div className="text-[10px] text-gray-400 mt-1">Ayurvritta Ayurveda Hospital, Vadodara</div>
            </div>

            <button
              onClick={() => goToPhase('patient')}
              className="w-full py-4 bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white font-bold rounded-2xl text-lg hover:shadow-glow transition-all active:scale-[0.98]"
            >
              Start Your Diet Plan →
            </button>
          </div>
        )}

        {/* ═══ PATIENT INFO PHASE ═══ */}
        {phase === 'patient' && (
          <div className="animate-fadeInUp">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">👤</div>
              <h2 className="font-serif text-2xl font-bold text-ayur-green">Patient Information</h2>
              <p className="text-sm text-gray-500">Tell us about yourself for a personalized plan</p>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Full Name *</label>
                <input
                  type="text"
                  value={inputs.patient.name}
                  onChange={e => setInputs(prev => ({ ...prev, patient: { ...prev.patient, name: e.target.value } }))}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-ayur-green focus:outline-none text-sm min-h-[48px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Age *</label>
                  <input
                    type="number"
                    value={inputs.patient.age}
                    onChange={e => setInputs(prev => ({ ...prev, patient: { ...prev.patient, age: e.target.value } }))}
                    placeholder="Years"
                    min="1"
                    max="120"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-ayur-green focus:outline-none text-sm min-h-[48px]"
                  />
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Gender *</label>
                  <div className="flex gap-2">
                    {GENDER_OPTIONS.map(g => (
                      <button
                        key={g}
                        onClick={() => setInputs(prev => ({ ...prev, patient: { ...prev.patient, gender: g } }))}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all border-2 min-h-[44px] ${
                          inputs.patient.gender === g
                            ? 'border-ayur-green bg-ayur-green/5 text-ayur-green'
                            : 'border-gray-100 text-gray-600 hover:border-ayur-green/30'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Occupation</label>
                <input
                  type="text"
                  value={inputs.patient.occupation}
                  onChange={e => setInputs(prev => ({ ...prev, patient: { ...prev.patient, occupation: e.target.value } }))}
                  placeholder="e.g., Software Engineer, Teacher, Homemaker..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-ayur-green focus:outline-none text-sm min-h-[48px]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => goToPhase('welcome')} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all">
                ← Back
              </button>
              <button
                onClick={() => goToPhase('complaints')}
                disabled={!inputs.patient.name || !inputs.patient.age || !inputs.patient.gender}
                className={`flex-[2] py-3 font-bold rounded-xl transition-all ${
                  inputs.patient.name && inputs.patient.age && inputs.patient.gender
                    ? 'bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white hover:shadow-glow'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ═══ COMPLAINTS PHASE ═══ */}
        {phase === 'complaints' && (
          <div className="animate-fadeInUp">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">🩺</div>
              <h2 className="font-serif text-2xl font-bold text-ayur-green">Health Concerns</h2>
              <p className="text-sm text-gray-500">Select up to 3 conditions or describe your concern</p>
            </div>

            {/* Quick select */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {POPULAR_COMPLAINTS.map(c => (
                <button
                  key={c.label}
                  onClick={() => toggleComplaint(c.label)}
                  className={`p-3 rounded-xl border-2 text-left transition-all min-h-[48px] flex items-center gap-2 ${
                    inputs.complaints.includes(c.label)
                      ? 'border-ayur-green bg-ayur-green/5 shadow-md ring-2 ring-ayur-green/20'
                      : 'border-gray-100 hover:border-ayur-green/30 bg-white'
                  }`}
                >
                  <span className="text-lg">{c.icon}</span>
                  <span className={`text-xs font-medium ${inputs.complaints.includes(c.label) ? 'text-ayur-green' : 'text-gray-700'}`}>
                    {c.label}
                  </span>
                </button>
              ))}
            </div>

            {inputs.complaints.length >= 3 && (
              <div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl mb-3">
                Maximum 3 conditions selected. Remove one to add another.
              </div>
            )}

            {/* Custom search */}
            <div className="bg-white rounded-2xl p-4 shadow-soft border border-gray-100 mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Or search from 106+ conditions</label>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Type to search (e.g., sinus, hernia, eczema...)"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-ayur-green focus:outline-none text-sm min-h-[48px] mb-3"
              />
              {searchQuery && (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {filteredConditions.slice(0, 10).map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setInputs(prev => ({ ...prev, customComplaint: c.label }));
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-ayur-green/5 transition-colors flex items-center gap-2"
                    >
                      <span className="text-ayur-green">•</span>
                      <span className="text-gray-700">{c.label}</span>
                      <span className="text-gray-400 text-[10px] ml-auto">{c.category}</span>
                    </button>
                  ))}
                  {filteredConditions.length === 0 && <p className="text-xs text-gray-400 py-2">No matching conditions found</p>}
                </div>
              )}
            </div>

            {/* Custom text */}
            <div className="bg-white rounded-2xl p-4 shadow-soft border border-gray-100 mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Describe in your own words</label>
              <textarea
                value={inputs.customComplaint}
                onChange={e => setInputs(prev => ({ ...prev, customComplaint: e.target.value }))}
                placeholder="e.g., I have frequent acidity and joint stiffness in the morning..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-ayur-green focus:outline-none text-sm resize-none min-h-[72px]"
                rows={2}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => goToPhase('patient')} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all">
                ← Back
              </button>
              <button
                onClick={() => goToPhase('profile')}
                disabled={inputs.complaints.length === 0 && !inputs.customComplaint.trim()}
                className={`flex-[2] py-3 font-bold rounded-xl transition-all ${
                  inputs.complaints.length > 0 || inputs.customComplaint.trim()
                    ? 'bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white hover:shadow-glow'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ═══ PROFILE PHASE ═══ */}
        {phase === 'profile' && (
          <div className="animate-fadeInUp">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">🧬</div>
              <h2 className="font-serif text-2xl font-bold text-ayur-green">Ayurvedic Profile</h2>
              <p className="text-sm text-gray-500">Help us personalize your diet plan</p>
            </div>

            {/* Prakriti */}
            <div className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100 mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Constitution (Prakriti)</label>
              <div className="grid grid-cols-2 gap-2">
                {PRAKRITI_OPTIONS.map(p => (
                  <button
                    key={p}
                    onClick={() => setInputs(prev => ({ ...prev, prakriti: p }))}
                    className={`p-2.5 rounded-xl border-2 text-center text-xs font-medium transition-all min-h-[44px] ${
                      inputs.prakriti === p
                        ? 'border-ayur-green bg-ayur-green/5 text-ayur-green shadow-md'
                        : 'border-gray-100 text-gray-600 hover:border-ayur-green/30'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Diet pref */}
            <div className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100 mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Dietary Preference</label>
              <div className="grid grid-cols-2 gap-2">
                {DIET_OPTIONS.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setInputs(prev => ({ ...prev, dietaryPref: d.value }))}
                    className={`p-3 rounded-xl border-2 text-center transition-all min-h-[44px] flex items-center justify-center gap-2 ${
                      inputs.dietaryPref === d.value
                        ? 'border-ayur-green bg-ayur-green/5 shadow-md'
                        : 'border-gray-100 hover:border-ayur-green/30'
                    }`}
                  >
                    <span>{d.icon}</span>
                    <span className={`text-xs font-medium ${inputs.dietaryPref === d.value ? 'text-ayur-green' : 'text-gray-600'}`}>{d.value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100 mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Allergies / Restrictions</label>
              <div className="flex flex-wrap gap-2">
                {ALLERGY_OPTIONS.map(a => (
                  <button
                    key={a}
                    onClick={() => toggleAllergy(a)}
                    className={`px-3 py-2 rounded-full text-xs font-medium transition-all border-2 min-h-[40px] ${
                      inputs.allergies.includes(a)
                        ? a === 'None' ? 'bg-gray-100 border-gray-300 text-gray-600' : 'bg-red-50 border-red-300 text-red-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-red-300'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => goToPhase('complaints')} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all">
                ← Back
              </button>
              <button
                onClick={generateDiet}
                className="flex-[2] py-4 bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white font-bold rounded-xl text-lg hover:shadow-glow transition-all active:scale-[0.98]"
              >
                Generate Diet Chart ✨
              </button>
            </div>
          </div>
        )}

        {/* ═══ GENERATING PHASE ═══ */}
        {phase === 'generating' && (
          <div className="animate-fadeIn flex flex-col items-center justify-center min-h-[60vh]">
            {/* Animated spinner with multiple rings */}
            <div className="relative w-40 h-40 mb-8">
              <div className="absolute inset-0 border-4 border-ayur-green/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-ayur-green rounded-full animate-spin" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-2 border-4 border-transparent border-b-ayur-accent rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
              <div className="absolute inset-4 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin" style={{ animationDuration: '4s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl animate-pulse">🌿</span>
              </div>
            </div>

            <h3 className="font-serif text-xl font-bold text-ayur-green mb-2">Creating Your Diet Plan...</h3>

            {/* Animated status messages */}
            <div className="text-center space-y-2 mb-6">
              <p className="text-gray-500 text-sm">
                Analyzing <span className="font-medium text-ayur-green">{inputs.complaints.join(', ') || inputs.customComplaint}</span>
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-ayur-green rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
                <span>Matching with 106+ Ayurvedic diet charts</span>
              </div>
            </div>

            {/* Progress steps */}
            <div className="w-full max-w-xs space-y-3">
              {[
                { label: 'Matching conditions', icon: '🔍', delay: 0 },
                { label: 'Loading knowledge base', icon: '📚', delay: 1000 },
                { label: 'Generating with AI', icon: '✨', delay: 2000 },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-gray-100 animate-pulse" style={{ animationDelay: `${step.delay}ms` }}>
                  <span className="text-lg">{step.icon}</span>
                  <span className="text-xs text-gray-500">{step.label}</span>
                  <div className="ml-auto">
                    <div className="w-4 h-4 border-2 border-ayur-green/30 border-t-ayur-green rounded-full animate-spin" />
                  </div>
                </div>
              ))}
            </div>

            {/* Pulsing dots */}
            <div className="mt-8 flex gap-2">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="w-3 h-3 bg-gradient-to-r from-ayur-green to-ayur-accent rounded-full animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* ═══ RESULT PHASE ═══ */}
        {phase === 'result' && (
          <div className="animate-fadeInUp">
            {/* Patient info card */}
            <div className="bg-gradient-to-r from-ayur-green to-ayur-green-dark rounded-3xl p-6 text-white mb-4 shadow-glow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-2xl font-serif font-bold">{inputs.patient.name}'s Diet Plan</div>
                  <div className="text-white/70 text-sm mt-1">
                    {inputs.patient.age} yrs • {inputs.patient.gender}
                    {inputs.patient.occupation && ` • ${inputs.patient.occupation}`}
                  </div>
                </div>
                <div className="text-4xl animate-bounce">📋</div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {[...inputs.complaints, inputs.customComplaint].filter(Boolean).map((c, i) => (
                  <span key={i} className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">{c}</span>
                ))}
                {inputs.prakriti && <span className="px-3 py-1 bg-ayur-accent/30 rounded-full text-xs font-medium backdrop-blur-sm">{inputs.prakriti}</span>}
              </div>
            </div>

            {/* Matched knowledge files */}
            {matchedFiles.length > 0 && (
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 mb-4">
                <h4 className="font-bold text-emerald-800 mb-2 text-xs uppercase tracking-wide">📚 Based on Knowledge Charts</h4>
                <div className="flex flex-wrap gap-2">
                  {matchedFiles.map((f, i) => (
                    <span key={i} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">{f.label}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Local fallback notice */}
            {isLocal && (
              <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-700 flex items-start gap-2">
                <span className="text-lg mt-0.5">⚠️</span>
                <div>
                  <div className="font-bold mb-1">Showing reference diet chart from knowledge base</div>
                  <div>AI enhancement requires NVIDIA API access. Configure NVIDIA_API_KEY in Vercel for personalized AI-generated plans.</div>
                </div>
              </div>
            )}

            {/* Diet plan content with rich visuals - NEW STRUCTURED FORMAT */}
            <div className="space-y-4 mb-4">
              {/* Parse and render structured diet chart */}
              <DietChartRenderer aiResult={aiResult} />
            </div>

            {/* Quick summary cards */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { icon: '🕐', label: 'Meals', value: '7-8', sub: 'per day' },
                { icon: '🌿', label: 'Herbs', value: '5+', sub: 'recommended' },
                { icon: '🥗', label: 'Balance', value: inputs.prakriti || 'Tridoshic', sub: 'constitution' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 text-center shadow-soft border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-xs font-bold text-ayur-green">{stat.label}</div>
                  <div className="text-lg font-serif font-bold text-gray-800">{stat.value}</div>
                  <div className="text-[10px] text-gray-400">{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Attribution footer */}
            <div className="bg-gradient-to-r from-ayur-accent-light to-white rounded-2xl p-4 border border-ayur-accent/20 mb-4 text-center">
              <div className="text-xs text-gray-500 mb-1">Created by AI trained on</div>
              <div className="font-serif font-bold text-ayur-green text-sm">Authentic Ayurveda Sources</div>
              <div className="text-xs text-ayur-accent font-medium mt-1">by Dr. Jinendradutt Sharma</div>
              <div className="text-[10px] text-gray-400 mt-1">Ayurvritta Ayurveda Hospital, Vadodara, Gujarat • +91 94266 84047</div>
            </div>

            {/* PDF Download + Actions */}
            <div className="flex gap-3 mb-3">
              <DietChartPDF
                patientName={inputs.patient.name}
                patientAge={inputs.patient.age}
                patientGender={inputs.patient.gender}
                patientOccupation={inputs.patient.occupation}
                prakriti={inputs.prakriti}
                dietaryPref={inputs.dietaryPref}
                allergies={inputs.allergies}
                condition={[...inputs.complaints, inputs.customComplaint].filter(Boolean).join(', ')}
                aiResult={aiResult}
                matchedFiles={matchedFiles}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPhase('welcome');
                  setInputs({ patient: { name: '', age: '', gender: '', occupation: '' }, complaints: [], customComplaint: '', prakriti: '', dietaryPref: '', allergies: [] });
                  setAiResult('');
                  setSearchQuery('');
                }}
                className="flex-1 py-3 bg-ayur-cream text-ayur-green font-bold rounded-xl hover:bg-ayur-green/10 transition-all active:scale-[0.98]"
              >
                New Diet Plan
              </button>
              <button
                onClick={onBack}
                className="flex-1 py-3 bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white font-bold rounded-xl hover:shadow-lg transition-all active:scale-[0.98]"
              >
                More Tools
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DietChartTool;
