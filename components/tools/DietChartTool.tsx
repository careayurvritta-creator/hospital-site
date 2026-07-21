import React, { useState, useMemo, useRef, useEffect } from 'react';
import { aiService } from '../../lib/aiService';
import DietChartPDF from './DietChartPDF';
import DietChartRenderer from './DietChartRenderer';

const knowledgeModules = import.meta.glob('/knowledge/diet-charts/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

// ═══════════════════════════════════════════════════════════════
// AHARA VIDHI VISHESHAYATANA — Ayurvedic Dietary Rules
// ═══════════════════════════════════════════════════════════════

interface ValidationWarning {
  section: string;
  issue: string;
  severity: 'error' | 'warning';
}

const FORBIDDEN_COMBINATIONS = [
  { combo: 'milk and fish', reason: 'Most potent Viruddha - causes skin diseases, eczema, psoriasis' },
  { combo: 'milk and banana', reason: 'Creates Ama, mucous, congestion, cough' },
  { combo: 'curd at night', reason: 'Creates Kapha, Ama, respiratory issues' },
  { combo: 'ghee and honey equal parts', reason: 'Opposite potencies neutralize' },
  { combo: 'hot water after honey', reason: 'Honey is Sheeta - heating destroys properties' },
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
          issue: `FORBIDDEN: "${pair.combo}" — ${pair.reason}`,
          severity: 'error',
        });
      }
    }
  }
  return warnings;
}

function formatValidationWarnings(warnings: ValidationWarning[]): string {
  if (warnings.length === 0) return '';
  const errors = warnings.filter(w => w.severity === 'error');
  let text = '\n\n---\n\n## AI SELF-VALIDATION REPORT\n';
  if (errors.length > 0) {
    text += '### ⚠️ Viruddha Ahara Violations\n';
    errors.forEach(e => {
      text += `- **[BLOCKED]** ${e.section}: ${e.issue}\n`;
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
  'Digestive': ['acidity', 'gerd', 'constipation', 'diarrhoea', 'ibs', 'crohn', 'colitis', 'digestion', 'gall', 'celiac', 'fistula', 'piles'],
  'Metabolic': ['diabetes', 'diabetic', 'obesity', 'thyroid', 'hypothyroidism', 'hyperthyroidism', 'cholesterol', 'triglyceride'],
  'Liver & Kidney': ['liver', 'kidney', 'jaundice', 'hepatitis', 'nephrotic', 'ascites', 'cirrhosis'],
  'Respiratory': ['asthma', 'sinus', 'common-cold'],
  'Joint & Bone': ['arthritis', 'rheumatoid', 'gout', 'osteoporosis', 'back-pain', 'slipped-disc', 'fibromyalgia'],
  'Heart & Blood': ['hypertension', 'hypotension', 'heart', 'anemia', 'edema', 'itp'],
  'Neurological': ['migraine', 'headache', 'depression', 'bells-palsy'],
  'Skin': ['psoriasis', 'eczema', 'skin', 'scleroderma'],
  "Women's Health": ['menopause', 'ovarian', 'fibroid', 'premenstrual', 'amenorrhea', 'pregnant', 'endometriosis', 'adenomyosis'],
  'General': [],
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
    .replace(/-patients?$/, '').replace(/-patient$/, '')
    .replace(/-disease$/, '').replace(/-problems?$/, '').replace(/-problem$/, '')
    .replace(/-syndrome$/, '').replace(/-/g, ' ')
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

const POPULAR_COMPLAINTS = [
  { label: 'Diabetes', icon: '🩸', keywords: ['diabetes', 'diabetic'] },
  { label: 'Acidity & GERD', icon: '🔥', keywords: ['acidity', 'gerd', 'reflux'] },
  { label: 'Obesity', icon: '⚖️', keywords: ['obesity', 'overweight'] },
  { label: 'Hypertension', icon: '💓', keywords: ['hypertension', 'blood-pressure'] },
  { label: 'Thyroid', icon: '🦋', keywords: ['thyroid', 'hypothyroidism', 'hyperthyroidism'] },
  { label: 'Arthritis', icon: '🦴', keywords: ['arthritis', 'rheumatoid'] },
  { label: 'Constipation', icon: '🚽', keywords: ['constipation'] },
  { label: 'Migraine', icon: '🧠', keywords: ['migraine', 'headache'] },
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
  const complaintTerms = lower.split(/[\s,;]+/).filter(w => w.length > 2);

  for (const condition of ALL_CONDITIONS) {
    const conditionText = `${condition.label} ${condition.keywords.join(' ')}`.toLowerCase();
    const conditionWords = conditionText.split(/[\s,;-]+/).filter(w => w.length > 2);
    const hasMatch = complaintTerms.some(term =>
      conditionWords.some(word => word === term || word.startsWith(term) || term.startsWith(word))
    );
    if (hasMatch && !seen.has(condition.id)) {
      seen.add(condition.id);
      matched.push(condition);
    }
  }
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

// ─── Agni Assessment Logic ───
export type AgniType = 'vishama' | 'tikshna' | 'manda' | 'sam';

export const AGNI_INFO: Record<AgniType, { label: string; sanskrit: string; desc: string; meals: number; mealPlan: string }> = {
  vishama: {
    label: 'Vishama Agni',
    sanskrit: 'विषमाग्नि',
    desc: 'Irregular digestion — cold, dry, variable. Common in Vata types and those with gas/bloating.',
    meals: 4,
    mealPlan: '4 meals: Breakfast, Lunch, Evening Snack, Dinner. Warm foods only. No raw salads.',
  },
  tikshna: {
    label: 'Tikshna Agni',
    sanskrit: 'तीक्ष्णाग्नि',
    desc: 'Sharp, intense digestion — hot, acidic. Common in Pitta types with acid reflux, heartburn.',
    meals: 3,
    mealPlan: '3 meals: Breakfast, Lunch, Dinner. Cool,湿润 foods. No spicy/acidic foods.',
  },
  manda: {
    label: 'Manda Agni',
    sanskrit: 'मन्दाग्नि',
    desc: 'Slow digestion — heavy, sluggish. Common in Kapha types with lethargy, weight gain.',
    meals: 3,
    mealPlan: '3 light meals: Breakfast, Lunch, Dinner (early). Light, warm, dry foods. No dairy.',
  },
  sam: {
    label: 'Sam Agni',
    sanskrit: 'समाग्नि',
    desc: 'Balanced digestion — regular, complete. Ideal state for all doshas.',
    meals: 3,
    mealPlan: '3 regular meals at consistent times. All six tastes allowed in balance.',
  },
};

interface AgniAnswer { q1: string; q2: string; q3: string; q4: string; }

function determineAgni(ans: AgniAnswer): AgniType {
  const scores = { vishama: 0, tikshna: 0, manda: 0, sam: 0 };

  // Q1: Hunger pattern
  if (ans.q1.includes('Irregular') || ans.q1.includes('forget')) scores.vishama += 2;
  else if (ans.q1.includes('Strong') || ans.q1.includes('anger')) scores.tikshna += 2;
  else if (ans.q1.includes('skip') || ans.q1.includes('mild')) scores.manda += 2;
  else if (ans.q1.includes('predictable') || ans.q1.includes('Regular')) scores.sam += 2;

  // Q2: Post-meal sensation
  if (ans.q2.includes('Gas') || ans.q2.includes('bloat') || ans.q2.includes('variable')) scores.vishama += 2;
  else if (ans.q2.includes('burn') || ans.q2.includes('acid') || ans.q2.includes('sharp')) scores.tikshna += 2;
  else if (ans.q2.includes('heavy') || ans.q2.includes('sleepy') || ans.q2.includes('slow')) scores.manda += 2;
  else if (ans.q2.includes('comfortable') || ans.q2.includes('light')) scores.sam += 2;

  // Q3: Meal timing
  if (ans.q3.includes('Irregular') || ans.q3.includes('vary')) scores.vishama += 1;
  else if (ans.q3.includes('Consistent') || ans.q3.includes('same')) scores.sam += 1;

  // Q4: Meal frequency
  if (ans.q4.includes('2') || ans.q4.includes('3')) scores.sam += 1;
  else if (ans.q4.includes('4') || ans.q4.includes('5') || ans.q4.includes('frequent')) scores.vishama += 1;

  const max = Math.max(scores.vishama, scores.tikshna, scores.manda, scores.sam);
  if (scores.vishama === max) return 'vishama';
  if (scores.tikshna === max) return 'tikshna';
  if (scores.manda === max) return 'manda';
  return 'sam';
}

// ─── Interfaces ───
interface PatientInfo { name: string; age: string; gender: string; occupation: string; }
interface DietInputs {
  patient: PatientInfo;
  complaints: string[];
  customComplaint: string;
  prakriti: string;
  agni: AgniType | '';
  dietaryPref: string;
  allergies: string[];
}

type Phase = 'welcome' | 'patient' | 'complaints' | 'agni' | 'prakriti' | 'generating' | 'result';

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const DIET_OPTIONS = [
  { value: 'Vegetarian', icon: '🥬' },
  { value: 'Non-Vegetarian', icon: '🍗' },
  { value: 'Vegan', icon: '🌱' },
  { value: 'Eggetarian', icon: '🥚' },
];
const ALLERGY_OPTIONS = ['Dairy', 'Gluten', 'Nuts', 'Eggs', 'Soy', 'Seafood', 'Nightshades', 'None'];

const AGNI_QUESTIONS = [
  {
    id: 'q1',
    text: 'How would you describe your hunger?',
    icon: '🍽️',
    options: [
      { label: 'Irregular — I can forget to eat for hours', value: 'q1_irregular' },
      { label: 'Strong — I get angry if meals are delayed', value: 'q1_strong' },
      { label: 'Mild — I can easily skip meals without issue', value: 'q1_mild' },
      { label: 'Regular — I feel hungry at predictable times', value: 'q1_regular' },
    ]
  },
  {
    id: 'q2',
    text: 'After eating a full meal, how do you feel?',
    icon: '🔥',
    options: [
      { label: 'Gassy, bloated, or experience variable digestion', value: 'q2_gas' },
      { label: 'Acid reflux, burning, or sharp discomfort', value: 'q2_burn' },
      { label: 'Heavy, sleepy, or sluggish for 1-2 hours', value: 'q2_heavy' },
      { label: 'Comfortable, light, and energized after eating', value: 'q2_comfort' },
    ]
  },
  {
    id: 'q3',
    text: 'How consistent is your meal timing?',
    icon: '⏰',
    options: [
      { label: 'Very inconsistent — meals at totally different times', value: 'q3_inconsistent' },
      { label: 'Mostly consistent — within a 1-2 hour window', value: 'q3_consistent' },
    ]
  },
  {
    id: 'q4',
    text: 'How many meals do you typically eat in a day?',
    icon: '🍴',
    options: [
      { label: '1-2 meals (I often skip meals)', value: 'q4_2' },
      { label: '3 regular meals (breakfast, lunch, dinner)', value: 'q4_3' },
      { label: '4-5 meals (including snacking between meals)', value: 'q4_5' },
      { label: '6+ meals or constant snacking', value: 'q4_6' },
    ]
  },
];

// ─── Component ───
const DietChartTool: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [inputs, setInputs] = useState<DietInputs>({
    patient: { name: '', age: '', gender: '', occupation: '' },
    complaints: [],
    customComplaint: '',
    prakriti: '',
    agni: '',
    dietaryPref: '',
    allergies: [],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [isLocal, setIsLocal] = useState(false);
  const [matchedFiles, setMatchedFiles] = useState<ConditionEntry[]>([]);
  const [animatedPhase, setAnimatedPhase] = useState(true);
  const [agniAnswers, setAgniAnswers] = useState<AgniAnswer>({ q1: '', q2: '', q3: '', q4: '' });
  const [detectedAgni, setDetectedAgni] = useState<AgniType | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredConditions = useMemo(() => searchConditions(searchQuery), [searchQuery]);

  // Load saved Prakriti from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ayurvritta_prakriti');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.prakriti) {
          setInputs(prev => ({ ...prev, prakriti: parsed.prakriti }));
        }
      }
    } catch { /* ignore */ }
  }, []);

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

  const handleAgniAnswer = (qId: keyof AgniAnswer, value: string) => {
    setAgniAnswers(prev => ({ ...prev, [qId]: value }));
    // Auto-detect agni when enough answers are filled
    const newAns = { ...agniAnswers, [qId]: value };
    if (newAns.q1 && newAns.q2) {
      const detected = determineAgni(newAns);
      setDetectedAgni(detected);
    }
  };

  const generateDiet = async () => {
    goToPhase('generating');

    const complaintText = [...inputs.complaints, inputs.customComplaint].filter(Boolean).join(', ');
    const matched = matchComplaintsToFiles(complaintText);
    setMatchedFiles(matched);

    const knowledgeContent = matched
      .map(e => `=== ${e.label.toUpperCase()} ===\n${(knowledgeModules[e.rawPath] || '').substring(0, 2000)}`)
      .join('\n\n');

    const agniKey = detectedAgni || 'sam';
    const agniInf = AGNI_INFO[agniKey];
    const mealCount = agniInf.meals;

    // Dynamic meal schedule built from Agni type — not hardcoded
    const getMealSlots = () => {
      if (mealCount === 4) {
        return [
          { time: 'Breakfast 7:30-8:30 AM', note: 'Never skip — stabilises glucose' },
          { time: 'Lunch 12:30-1:30 PM', note: 'Main meal of the day' },
          { time: 'Evening 4:30-5:00 PM', note: 'Light snack only — no sweets' },
          { time: 'Dinner 7:00-7:30 PM', note: 'Keep very light — before 8 PM' },
        ];
      }
      // 3 meals (Tikshna, Manda, Sam)
      return [
        { time: 'Breakfast 8:00-9:00 AM', note: 'At consistent times daily' },
        { time: 'Lunch 12:30-1:30 PM', note: 'Main meal — eat slowly, chew 20x' },
        { time: 'Dinner 7:00-7:30 PM', note: 'Light meal, at least 3 hrs before sleep' },
      ];
    };

    const mealSlots = getMealSlots();

    // Build meal schedule based on Agni type
    const prompt = `Generate a detailed, condition-specific Ayurvedic diet chart. Follow the EXACT format below. Base recommendations on the provided knowledge content. This must look like a professional Dr. Jinendradutt Sharma consultation output.

PATIENT CONTEXT:
- Condition: ${complaintText || 'General wellness'}
- Prakriti: ${inputs.prakriti || 'Not assessed — assume general'}
- Digestive Fire (Agni): ${detectedAgni ? `${AGNI_INFO[detectedAgni].label} (${AGNI_INFO[detectedAgni].sanskrit})` : 'Sam Agni (balanced — assume if not assessed)'}
- Dietary Preference: ${inputs.dietaryPref || 'Not specified'}
- Allergies: ${inputs.allergies.filter(a => a !== 'None').join(', ') || 'None'}
- Patient: ${inputs.patient.name || 'Patient'}, ${inputs.patient.age || 'X'}/${inputs.patient.gender || 'X'}

KNOWLEDGE BASE:
${knowledgeContent}

OUTPUT FORMAT (MUST FOLLOW EXACTLY — matches Dr. Sharma's professional consultation format):

# [CONDITION NAME] — Ayurvedic Dietary Guidelines
## Understanding [Condition] in Ayurveda
(3 sentences explaining the Ayurvedic pathophysiology: which Doshas are involved, which Dhatu is affected, what Srotas are involved, Sanskrit terminology, and therapeutic goal. Reference Charaka Samhita or Ashtanga Hridayam if relevant.)

## Core Dietary Principles
1. **Lagu Ahara** (Light Diet): [one line — why light foods are essential for this condition]
2. **Rooksha Ahara** (Dry/Rough Diet): [one line — why dry textures help this condition]
3. **Low Glycaemic Foods**: [one line — importance of low-GI foods for this condition]
4. **Regulated Meal Timing**: [one line — fixed meal times and why skipping meals is harmful]
5. **No Snacking Between Meals**: [one line — resting Agni between meals is therapeutic]

## Ayurvedic Principles of a Balanced Meal
(These rules from Charaka Samhita Vimanasthana 1.24 and Ashtanga Hridayam MUST inform your food recommendations.)

**Quality of Food (Guna):**
- **Ushna** (Warm) — warm food kindles Agni, aids digestion
- **Snigdha** (Unctuous) —适度油性 keeps tissues supple, helps absorption
- **Matravat** (In proper quantity) — 2/3 stomach capacity, no overeating
- **Jeerna** (When previous meal is digested) — eat only when hungry
- **Anupahata** (Non-habit-forming) — vary diet, don't over-rely on one substance
- **Shuchi** (Clean and pure) — fresh, unadulterated food

**How to Eat:**
- Sit down to eat (not standing or walking)
- Chew each bite 32 times (food should become liquid)
- Eat in pleasant surroundings, without distraction
- Never drink water directly with meals — if needed, sip warm water in small amounts
- Take a short walk (50-100 steps) after each major meal
- Stop eating before feeling completely full — "Hrishva" (lightness) is the sign of correct quantity

**The Six Tastes (Shad Rasa) — each meal should include:**
- **Madhura (Sweet)** — grains, milk, rice, wheat, sweet fruits
- **Amla (Sour)** — lemon, yogurt, amla, fermented foods
- **Lavana (Salt)** — rock salt, sea salt, natural salts
- **Katu (Pungent)** — ginger, pepper, chili, cumin, mustard
- **Tikta (Bitter)** — bitter gourd, turmeric, fenugreek, leafy greens
- **Kashaya (Astringent)** — pomegranate, bananas, beans, broccoli

**Meal Structure:**
- Always eat at the same times daily (fixed Kala)
- Never skip meals — causes Vata disturbance
- If Agni is weak (Manda/Tikshna) — reduce quantity, increase warmth
- Heavy-to-light eating order: sweet → sour → salty → pungent → bitter → astringent
- Eat the largest meal at lunch when Pitta Agni is strongest (12-2 PM)
- Dinner should always be lighter and earlier (before 8 PM) than lunch

## Your Meal Plan (Based on ${agniInf.label} — ${mealCount} meals/day)
(Apply the Ayurvedic principles above. For EACH meal below, give specific recommended items and foods to avoid. Be condition-specific — e.g. for Prameha/Diabetes list LOW GI foods as recommended.)

${mealSlots.map((slot, i) => `### ${i + 1}. ${slot.time}
**Note:** ${slot.note}

**Recommended (Ushna + Snigdha + Pathya for this condition):**
- [2-3 specific foods with why]

**Avoid (Apathya — aggravating for this condition):**
- [2-3 specific foods with why]`).join('\n\n')}

## Pathya — What to Eat Freely
(Use EXACT category headers. For each food listed, include a brief therapeutic note. Match the format: "Food — therapeutic reason for THIS condition.")

**GRAINS**: [4-6 specific grains with notes]

**VEGETABLES**: [5-7 vegetables with notes — star foods for this condition first]

**PULSES**: [3-4 dals/legumes]

**FRUITS**: [4-5 specific fruits — LOW GI ones for metabolic conditions]

**DAIRY**: [2-4 dairy items]

**FATS & OILS**: [2-4 options with notes]

**SPICES**: [4-5 specific spices with their therapeutic action]

**BEVERAGES**: [3-4 specific drinks]

## Apathya — What to Strictly Avoid
(Use EXACT category headers. For each item, give the SPECIFIC reason it is harmful for THIS condition, e.g. "Potato — high glycemic index, aggravates Meda Dhatu and raises blood glucose".)

**GRAINS**: [4-6 harmful grains with specific reasons]

**VEGETABLES**: [4-6 harmful vegetables with reasons]

**FRUITS**: [4-5 harmful fruits with reasons]

**SWEETS**: [4-5 harmful sweets with reasons]

**DAIRY**: [3-4 harmful dairy items with reasons]

**PREPARED FOODS**: [4-5 items — maida, bakery, processed, fast food]

**BEVERAGES**: [3-4 harmful drinks with reasons]

**OTHERS**: [alcohol, cold drinks, tobacco if applicable]

## Dinacharya for [CONDITION] + ${agniInf.label} Management
(Create ${mealCount + 2} numbered entries with times, activities, and specific Ayurvedic benefits. Include morning routine, meal times, exercise, and bedtime.)

## Classical Home Remedies
(Numbered — 5-6 remedies with EXACT format: Name | Preparation | When | Benefit)

## Lifestyle Principles
(3 categories with specific, actionable recommendations — not generic advice.)

**Daily Exercise**: [specific to condition and prakriti]
**Mental Balance**: [specific to condition]
**Sleep & Routine**: [specific to condition]

## A Note on Healing Through Ayurveda
(1-2 sentences on the Ayurvedic name of the condition, root cause principle, and most critical lifestyle intervention.)

---
*Prepared by Dr. Jinendradutt Sharma (BAMS) | Ayurvritta Ayurveda Hospital & Panchakarma Center, Vadodara | Dietary guidance only — not a substitute for medical treatment. Contact: +91 94266 84047*`;

try {
      const systemInstruction = `You are Dr. Jinendradutt Sharma, BAMS, Chief Physician at Ayurvritta Ayurveda Hospital, Vadodara. Generate ONLY detailed diet charts in EXACT markdown format. The number of meals (${mealCount}) is determined by the patient's Agni type: ${agniInf.label}. NEVER skip any section in the output format. Use Sanskrit terms naturally. Adhere to Viruddha Ahara rules strictly. Format precisely as instructed.`;

      const generatePromise = aiService.generate(prompt, systemInstruction, {
        temperature: 0.5,
        max_tokens: 3500,
      });
      const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timed out - please try again')), 120000)
      );

      const content = await Promise.race([generatePromise, timeoutPromise]);

      if (content) {
        const validationWarnings = checkViruddha(content);
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

      if (errorMsg.includes('timed out') || errorMsg.includes('504') || errorMsg.includes('timeout')) {
        setAiResult(`### AI Service Taking Too Long\n\nOptions:\n1. Try again with fewer conditions\n2. Call for personalized plan: +91 94266 84047\n\n---\n\n${matched.length > 0 ? matched.map(e => knowledgeModules[e.rawPath] || '').join('\n\n---\n\n') : 'No matching knowledge base entry found.'}`);
        setIsLocal(true);
        goToPhase('result');
        return;
      }

      const fallback = matched.length > 0
        ? matched.map(e => knowledgeModules[e.rawPath] || '').join('\n\n---\n\n')
        : `No specific diet chart found for "${complaintText}".\n\nPlease consult Dr. Jinendradutt Sharma at Ayurvritta Ayurveda Hospital.\n\nContact: +91 94266 84047`;
      setAiResult(fallback);
      setIsLocal(true);
      goToPhase('result');
    }
  };

  const phaseOrder: Phase[] = ['welcome', 'patient', 'complaints', 'agni', 'prakriti', 'generating', 'result'];
  const currentIdx = phaseOrder.indexOf(phase);
  const progressPct = phase === 'generating' ? 85 : phase === 'result' ? 100 : (currentIdx / (phaseOrder.length - 2)) * 100;

  const mealCountDisplay = detectedAgni ? AGNI_INFO[detectedAgni].meals : '?';

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
        {phase !== 'welcome' && (
          <div className="h-1 bg-gray-100">
            <div className="h-full bg-gradient-to-r from-ayur-green to-ayur-accent transition-all duration-700 ease-out" style={{ width: `${progressPct}%` }} />
          </div>
        )}
      </div>

      <div className={`max-w-2xl mx-auto px-4 py-6 transition-all duration-300 ${animatedPhase ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* ═══ WELCOME ═══ */}
        {phase === 'welcome' && (
          <div className="animate-fadeIn">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ayur-green via-ayur-green-dark to-ayur-green p-8 text-white text-center mb-6 shadow-glow">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/20 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-ayur-accent/30 translate-y-1/2 -translate-x-1/2" />
              </div>
              <div className="relative">
                <div className="text-5xl mb-4">🌿</div>
                <h1 className="font-serif text-3xl font-bold mb-2">Personalized Diet Chart</h1>
                <p className="text-white/80 text-sm leading-relaxed max-w-sm mx-auto">
                  Ayurvedic diet based on your <strong>agni</strong> (digestion), <strong>prakriti</strong> (constitution), and health condition
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 mb-6 border border-ayur-green/20">
              <h3 className="font-serif font-bold text-ayur-green mb-3 text-center">How it works</h3>
              <div className="space-y-3">
                {[
                  { step: '1', icon: '👤', title: 'Your Info', sub: 'Basic health details' },
                  { step: '2', icon: '🩺', title: 'Health Concerns', sub: 'Up to 3 conditions' },
                  { step: '3', icon: '🔥', title: 'Agni Assessment', sub: 'Your digestive fire type' },
                  { step: '4', icon: '🧬', title: 'Prakriti', sub: 'Your constitution (if known)' },
                ].map(s => (
                  <div key={s.step} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-xl">{s.icon}</span>
                    <div>
                      <div className="text-sm font-bold text-gray-800">{s.title}</div>
                      <div className="text-xs text-gray-500">{s.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => goToPhase('patient')}
              className="w-full py-4 bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white font-bold rounded-2xl text-lg hover:shadow-glow transition-all active:scale-[0.98]"
            >
              Begin Assessment →
            </button>
          </div>
        )}

        {/* ═══ PATIENT INFO ═══ */}
        {phase === 'patient' && (
          <div className="animate-fadeInUp">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">👤</div>
              <h2 className="font-serif text-2xl font-bold text-ayur-green">Patient Information</h2>
              <p className="text-sm text-gray-500">Basic details for your personalized plan</p>
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
                    placeholder="Years" min="1" max="120"
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
                          inputs.patient.gender === g ? 'border-ayur-green bg-ayur-green/5 text-ayur-green' : 'border-gray-100 text-gray-600 hover:border-ayur-green/30'
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
                  placeholder="e.g., Software Engineer, Teacher..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-ayur-green focus:outline-none text-sm min-h-[48px]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => goToPhase('welcome')} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all">← Back</button>
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

        {/* ═══ COMPLAINTS ═══ */}
        {phase === 'complaints' && (
          <div className="animate-fadeInUp">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">🩺</div>
              <h2 className="font-serif text-2xl font-bold text-ayur-green">Health Concerns</h2>
              <p className="text-sm text-gray-500">Select up to 3 conditions you want diet advice for</p>
            </div>

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
                  <span className={`text-xs font-medium ${inputs.complaints.includes(c.label) ? 'text-ayur-green' : 'text-gray-700'}`}>{c.label}</span>
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-soft border border-gray-100 mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Search 106+ conditions</label>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Type to search..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-ayur-green focus:outline-none text-sm min-h-[48px] mb-3"
              />
              {searchQuery && (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {filteredConditions.slice(0, 10).map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setInputs(prev => ({ ...prev, customComplaint: c.label })); setSearchQuery(''); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-ayur-green/5 transition-colors flex items-center gap-2"
                    >
                      <span className="text-ayur-green">•</span>
                      <span className="text-gray-700">{c.label}</span>
                      <span className="text-gray-400 text-[10px] ml-auto">{c.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-soft border border-gray-100 mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Or describe in your words</label>
              <textarea
                value={inputs.customComplaint}
                onChange={e => setInputs(prev => ({ ...prev, customComplaint: e.target.value }))}
                placeholder="e.g., I have acidity and morning joint stiffness..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-ayur-green focus:outline-none text-sm resize-none min-h-[60px]"
                rows={2}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => goToPhase('patient')} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all">← Back</button>
              <button
                onClick={() => goToPhase('agni')}
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

        {/* ═══ AGNI ASSESSMENT ═══ */}
        {phase === 'agni' && (
          <div className="animate-fadeInUp">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">🔥</div>
              <h2 className="font-serif text-2xl font-bold text-ayur-green">Agni Assessment</h2>
              <p className="text-sm text-gray-500">"Agni is the basis of life" — Charaka Samhita</p>
            </div>

            {/* Agni type indicator */}
            {detectedAgni && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 mb-4 border border-amber-200 text-center">
                <div className="text-xs text-amber-600 font-bold uppercase tracking-wide mb-1">Detected Digestive Fire</div>
                <div className="font-serif text-2xl font-bold text-amber-800">{AGNI_INFO[detectedAgni].label}</div>
                <div className="text-2xl mt-1">{detectedAgni === 'vishama' ? '⚡' : detectedAgni === 'tikshna' ? '🔥' : detectedAgni === 'manda' ? '💧' : '⚖️'}</div>
                <div className="text-xs text-amber-700 mt-1">{AGNI_INFO[detectedAgni].desc}</div>
                <div className="text-xs text-amber-600 mt-1">Recommended: <strong>{AGNI_INFO[detectedAgni].meals} meals/day</strong> — {AGNI_INFO[detectedAgni].mealPlan}</div>
              </div>
            )}

            <div className="space-y-4">
              {AGNI_QUESTIONS.map((q, qi) => (
                <div key={q.id} className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{q.icon}</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Q{qi + 1}</span>
                    <span className="text-sm font-medium text-gray-800">{q.text}</span>
                  </div>
                  <div className="space-y-2">
                    {q.options.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleAgniAnswer(q.id as keyof AgniAnswer, opt.value)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all border-2 min-h-[44px] ${
                          agniAnswers[q.id as keyof AgniAnswer] === opt.value
                            ? 'border-amber-400 bg-amber-50 text-amber-900 font-medium'
                            : 'border-gray-100 hover:border-amber-200 text-gray-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => goToPhase('complaints')} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all">← Back</button>
              <button
                onClick={() => goToPhase('prakriti')}
                disabled={!detectedAgni}
                className={`flex-[2] py-3 font-bold rounded-xl transition-all ${
                  detectedAgni
                    ? 'bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white hover:shadow-glow'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ═══ PRAKRITI ═══ */}
        {phase === 'prakriti' && (
          <div className="animate-fadeInUp">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">🧬</div>
              <h2 className="font-serif text-2xl font-bold text-ayur-green">Your Prakriti</h2>
              <p className="text-sm text-gray-500">Constitution — helps customize diet to your type</p>
            </div>

            {/* Saved Prakriti display */}
            {inputs.prakriti && (
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-5 mb-4 border border-emerald-200 text-center">
                <div className="text-xs text-emerald-600 font-bold uppercase tracking-wide mb-1">Saved Assessment Found</div>
                <div className="font-serif text-2xl font-bold text-emerald-800">{inputs.prakriti}</div>
                <div className="text-xs text-emerald-600 mt-1">Linked from your previous Prakriti assessment</div>
              </div>
            )}

            {/* Quick Prakriti selector */}
            {!inputs.prakriti && (
              <div className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100 mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Do you know your Prakriti?</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Pitta-Kapha', 'Vata-Kapha', 'Not Sure'].map(p => (
                    <button
                      key={p}
                      onClick={() => setInputs(prev => ({ ...prev, prakriti: p }))}
                      className={`p-2.5 rounded-xl border-2 text-center text-xs font-medium transition-all min-h-[44px] ${
                        inputs.prakriti === p ? 'border-ayur-green bg-ayur-green/5 text-ayur-green shadow-md' : 'border-gray-100 text-gray-600 hover:border-ayur-green/30'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Link to full Prakriti assessment */}
            {!inputs.prakriti && (
              <div className="bg-blue-50 rounded-2xl p-5 mb-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🧬</span>
                  <div>
                    <div className="font-bold text-blue-900 text-sm mb-1">Take the Full Prakriti Assessment</div>
                    <div className="text-xs text-blue-700 mb-3">18 detailed questions for accurate constitution analysis by Dr. Sharma's AI</div>
                    <button
                      onClick={() => {
                        window.open('/tools/prakriti', '_blank');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all min-h-[40px]"
                    >
                      Open Prakriti Tool →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Dietary Preference */}
            <div className="bg-white rounded-2xl p-5 shadow-soft border border-gray-100 mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Dietary Preference</label>
              <div className="grid grid-cols-2 gap-2">
                {DIET_OPTIONS.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setInputs(prev => ({ ...prev, dietaryPref: d.value }))}
                    className={`p-3 rounded-xl border-2 text-center transition-all min-h-[44px] flex items-center justify-center gap-2 ${
                      inputs.dietaryPref === d.value ? 'border-ayur-green bg-ayur-green/5 shadow-md' : 'border-gray-100 hover:border-ayur-green/30'
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
              <button onClick={() => goToPhase('agni')} className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all">← Back</button>
              <button
                onClick={generateDiet}
                className="flex-[2] py-4 bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white font-bold rounded-xl text-lg hover:shadow-glow transition-all active:scale-[0.98]"
              >
                Generate Diet Chart ✨
              </button>
            </div>
          </div>
        )}

        {/* ═══ GENERATING ═══ */}
        {phase === 'generating' && (
          <div className="animate-fadeIn flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative w-40 h-40 mb-8">
              <div className="absolute inset-0 border-4 border-ayur-green/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-ayur-green rounded-full animate-spin" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-2 border-4 border-transparent border-b-ayur-accent rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
              <div className="absolute inset-4 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin" style={{ animationDuration: '4s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-5xl animate-pulse">🔥</span>
              </div>
            </div>

            <h3 className="font-serif text-xl font-bold text-ayur-green mb-2">Creating Your Personalized Diet...</h3>
            <p className="text-gray-500 text-sm text-center max-w-xs mb-6">
              Based on your <strong>{inputs.agni || detectedAgni ? AGNI_INFO[(detectedAgni || 'sam') as AgniType].label : 'digestive fire'}</strong> and <strong>{[...inputs.complaints, inputs.customComplaint].filter(Boolean).join(', ') || 'health concern'}</strong>
            </p>

            <div className="w-full max-w-xs space-y-3">
              {[
                { label: 'Assessing Agni type', icon: '🔥', done: true },
                { label: 'Loading knowledge base', icon: '📚', done: true },
                { label: 'Personalizing for your type', icon: '🧬', done: false },
                { label: 'Generating diet chart', icon: '✨', done: false },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/50 rounded-xl">
                  <span className="text-lg">{step.icon}</span>
                  <span className={`text-xs ${step.done ? 'text-gray-500' : 'text-ayur-green font-medium'}`}>{step.label}</span>
                  {step.done && <span className="ml-auto text-green-500 text-sm">✓</span>}
                  {!step.done && <div className="ml-auto w-4 h-4 border-2 border-ayur-green/30 border-t-ayur-green rounded-full animate-spin" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ RESULT ═══ */}
        {phase === 'result' && (
          <div className="animate-fadeInUp">
            {/* Summary card */}
            <div className="bg-gradient-to-r from-ayur-green to-ayur-green-dark rounded-3xl p-6 text-white mb-4 shadow-glow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-2xl font-serif font-bold">{inputs.patient.name}'s Diet Plan</div>
                  <div className="text-white/70 text-sm mt-1">{inputs.patient.age} yrs • {inputs.patient.gender}</div>
                </div>
                <div className="text-4xl">📋</div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {[...inputs.complaints, inputs.customComplaint].filter(Boolean).map((c, i) => (
                  <span key={i} className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">{c}</span>
                ))}
                {detectedAgni && (
                  <span className="px-3 py-1 bg-amber-400/30 rounded-full text-xs font-medium backdrop-blur-sm">
                    {AGNI_INFO[detectedAgni].label}
                  </span>
                )}
                {inputs.prakriti && (
                  <span className="px-3 py-1 bg-ayur-accent/30 rounded-full text-xs font-medium backdrop-blur-sm">{inputs.prakriti}</span>
                )}
              </div>
            </div>

            {/* Knowledge source */}
            {matchedFiles.length > 0 && (
              <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200 mb-4">
                <span className="text-xs text-emerald-700 font-medium">📚 Based on: {matchedFiles.map(f => f.label).join(', ')}</span>
              </div>
            )}

            {/* Fallback notice */}
            {isLocal && (
              <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-700">
                <strong>Note:</strong> Showing reference chart from knowledge base. For AI-generated personalized plan, ensure API access.
              </div>
            )}

            {/* Diet Chart */}
            <div className="space-y-4 mb-4">
              <DietChartRenderer aiResult={aiResult} />
            </div>

            {/* Summary pills */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { icon: '🍽️', label: 'Meals', value: `${mealCountDisplay}`, sub: 'per day' },
                { icon: '🔥', label: 'Agni', value: detectedAgni ? AGNI_INFO[detectedAgni].label.split(' ')[0] : '—', sub: detectedAgni ? AGNI_INFO[detectedAgni].sanskrit : '' },
                { icon: '🧬', label: 'Prakriti', value: inputs.prakriti || '—', sub: '' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 text-center shadow-soft border border-gray-100">
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-xs font-bold text-ayur-green">{stat.label}</div>
                  <div className="text-sm font-serif font-bold text-gray-800">{stat.value}</div>
                  {stat.sub && <div className="text-[10px] text-gray-400">{stat.sub}</div>}
                </div>
              ))}
            </div>

            {/* Attribution */}
            <div className="bg-gradient-to-r from-ayur-accent-light to-white rounded-2xl p-4 border border-ayur-accent/20 mb-4 text-center">
              <div className="text-xs text-gray-500">by Dr. Jinendradutt Sharma</div>
              <div className="text-xs text-ayur-accent font-medium">Ayurvritta Ayurveda Hospital, Vadodara • +91 94266 84047</div>
            </div>

            {/* PDF */}
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
                  setInputs({ patient: { name: '', age: '', gender: '', occupation: '' }, complaints: [], customComplaint: '', prakriti: inputs.prakriti, agni: '', dietaryPref: '', allergies: [] });
                  setAiResult('');
                  setAgniAnswers({ q1: '', q2: '', q3: '', q4: '' });
                  setDetectedAgni(null);
                }}
                className="flex-1 py-3 bg-ayur-cream text-ayur-green font-bold rounded-xl hover:bg-ayur-green/10 transition-all active:scale-[0.98]"
              >
                New Plan
              </button>
              <button onClick={onBack} className="flex-1 py-3 bg-gradient-to-r from-ayur-green to-ayur-green-dark text-white font-bold rounded-xl hover:shadow-lg transition-all active:scale-[0.98]">
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